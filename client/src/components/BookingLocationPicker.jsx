import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  HiLocationMarker, 
  HiSearch, 
  HiX, 
  HiOfficeBuilding, 
  HiHome, 
  HiShoppingBag, 
  HiArrowRight 
} from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  getGeoapifySuggestions, 
  reverseGeocodeGeoapify 
} from '../api/locationService';

// Fix for default Leaflet icon
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// ─── Config ─────────────────────────────────────────────────────────────────

const DEFAULT_CENTER = [20.5937, 78.9629];
const TILE_LAYER_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION = '&copy; <a href="https://carto.com/attributions">CARTO</a>';

// ─── Helper Components ─────────────────────────────────────────────────────

const HighlightMatch = ({ text, query }) => {
  if (!query || !text) return <span>{text}</span>;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="text-[#45B1A8] font-extrabold">{part}</span>
        ) : (
          part
        )
      )}
    </span>
  );
};

const LocationIcon = ({ type }) => {
  const t = type?.toLowerCase() || '';
  if (t.includes('shop') || t.includes('commercial') || t.includes('mall')) return <HiShoppingBag className="w-4 h-4" />;
  if (t.includes('office') || t.includes('building') || t.includes('industrial')) return <HiOfficeBuilding className="w-4 h-4" />;
  if (t.includes('residential') || t.includes('house') || t.includes('apartment')) return <HiHome className="w-4 h-4" />;
  return <HiLocationMarker className="w-4 h-4" />;
};

// Component to handle map clicks
const MapEvents = ({ onClick }) => {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Component to recenter map
const RecenterMap = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || map.getZoom(), { animate: true });
    }
  }, [center, zoom, map]);
  return null;
};

// ─── Component ──────────────────────────────────────────────────────────────

const BookingLocationPicker = ({ selectedLocation, onLocationChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [geoLoading, setGeoLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [manualAddress, setManualAddress] = useState({
    houseNo: '',
    floor: '',
    landmark: '',
    instructions: ''
  });
  const [searchCache, setSearchCache] = useState({});

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  const mapCenter = useMemo(() => {
    if (selectedLocation?.lat && selectedLocation?.lng)
      return [selectedLocation.lat, selectedLocation.lng];
    if (userLocation) return [userLocation.lat, userLocation.lng];
    return DEFAULT_CENTER;
  }, [selectedLocation?.lat, selectedLocation?.lng, userLocation]);

  const mapZoom = useMemo(() => {
    if (selectedLocation?.lat) return 16;
    if (userLocation) return 14;
    return 5;
  }, [selectedLocation?.lat, userLocation]);

  // ── Geolocation on mount ──────────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => console.warn('Location permission denied'),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  // ── Click outside ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        inputRef.current && !inputRef.current.contains(e.target)
      ) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Autocomplete search ─────────────────────────────────────────
  const runSearch = useCallback((query) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.trim().length < 2) {
      setSuggestions([]); setShowDropdown(false); return;
    }

    if (searchCache[query.trim().toLowerCase()]) {
      setSuggestions(searchCache[query.trim().toLowerCase()]);
      setShowDropdown(true);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSuggestionsLoading(true);
      setShowDropdown(true);
      try {
        const results = await getGeoapifySuggestions(query.trim(), userLocation);
        const sortedResults = results.sort((a, b) => (a.distance || 999999) - (b.distance || 999999));
        setSuggestions(sortedResults);
        setSearchCache(prev => ({ ...prev, [query.trim().toLowerCase()]: sortedResults }));
      } catch (err) {
        console.error('Search error:', err);
        setSuggestions([]);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 400);
  }, [userLocation, searchCache]);

  const combineManualFields = (fields) => {
    const parts = [];
    if (fields.houseNo) parts.push(fields.houseNo);
    if (fields.floor) parts.push(`${fields.floor} Floor`);
    if (fields.landmark) parts.push(`near ${fields.landmark}`);
    if (fields.instructions) parts.push(`Note: ${fields.instructions}`);
    return parts.join(', ');
  };

  // ── Select place ────────────────────────────────
  const selectPlace = useCallback(async (place) => {
    setSearchQuery(place.fullAddress);
    setSuggestions([]);
    setShowDropdown(false);
    
    const combinedManual = combineManualFields(manualAddress);

    onLocationChange({
      placeName: place.mainText,
      address: place.fullAddress,
      manualAddress: combinedManual,
      placeId: place.id,
      lat: place.lat,
      lng: place.lng,
      raw: place.raw,
    });
  }, [onLocationChange, manualAddress]);

  // ── Reverse geocode ───────────────────────────────────────────────────────
  const handleReverseGeocode = useCallback(async (lat, lng) => {
    setGeoLoading(true);
    try {
      const result = await reverseGeocodeGeoapify(lat, lng);
      setGeoLoading(false);
      
      if (result) {
        setSearchQuery(result.address);
        const combinedManual = combineManualFields(manualAddress);
        
        onLocationChange({
          placeName: result.placeName,
          address: result.address,
          manualAddress: combinedManual,
          placeId: result.placeId,
          lat, lng,
        });
      }
    } catch (error) {
      setGeoLoading(false);
      toast.error('Failed to get address for this location');
    }
  }, [onLocationChange, manualAddress]);

  // ── Detect current location ───────────────────────────────────────────────
  const handleDetectLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    setGeoLoading(true);
    const tid = toast.loading('Locating you…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        handleReverseGeocode(latitude, longitude);
        toast.success('Found you!', { id: tid });
      },
      () => { 
        toast.error('Location access denied. Please enable it in browser settings.', { id: tid }); 
        setGeoLoading(false); 
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const updateManualAddress = (field, value) => {
    const newManual = { ...manualAddress, [field]: value };
    setManualAddress(newManual);
    
    if (selectedLocation?.lat) {
      const combinedManual = combineManualFields(newManual);
      onLocationChange({ ...selectedLocation, manualAddress: combinedManual });
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setActiveIdx(-1);
    runSearch(val);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown) return;
    const total = suggestions.length;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((p) => (p < total - 1 ? p + 1 : 0)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((p) => (p > 0 ? p - 1 : total - 1)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && activeIdx < total) selectPlace(suggestions[activeIdx]);
    }
    else if (e.key === 'Escape') setShowDropdown(false);
  };

  const clearSearch = () => {
    setSearchQuery(''); setSuggestions([]); setShowDropdown(false);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-[#1A2B2A] tracking-tight">
            SERVICE LOCATION <span className="text-red-500">*</span>
          </label>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button" onClick={handleDetectLocation} disabled={geoLoading}
            className="flex items-center gap-2 text-[#45B1A8] hover:text-[#388E87] text-xs font-bold transition-colors disabled:opacity-50"
          >
            <div className="w-7 h-7 rounded-full bg-[#45B1A8]/10 flex items-center justify-center">
              <HiLocationMarker className={`w-3.5 h-3.5 ${geoLoading ? 'animate-pulse' : ''}`} />
            </div>
            Use Current Location
          </motion.button>
        </div>

        <div className="relative z-[1100]">
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center">
              {suggestionsLoading ? (
                <div className="w-5 h-5 border-2 border-[#45B1A8] border-t-transparent rounded-full animate-spin" />
              ) : (
                <HiSearch className="w-5 h-5 text-[#45B1A8] group-focus-within:scale-110 transition-transform" />
              )}
            </div>
            <input
              ref={inputRef} type="text" value={searchQuery}
              onChange={handleInputChange} onKeyDown={handleKeyDown}
              onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
              placeholder="Search for shop, landmark or area..."
              className="w-full bg-white text-[#1A2B2A] font-medium border-2 border-[#E0F5F3] rounded-2xl py-4 pl-14 pr-12 focus:ring-4 focus:ring-[#45B1A8]/10 focus:border-[#45B1A8] transition-all outline-none text-base placeholder:text-gray-400 shadow-sm"
              autoComplete="off"
            />
            {searchQuery && (
              <button type="button" onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                <HiX className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                ref={dropdownRef}
                className="absolute top-full left-0 right-0 mt-3 bg-white border-2 border-[#E0F5F3] rounded-2xl shadow-2xl overflow-hidden z-[1200] max-h-[400px] flex flex-col"
              >
                {suggestionsLoading ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <div className="w-8 h-8 border-3 border-[#45B1A8] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-bold text-[#45B1A8] animate-pulse">Searching nearby...</span>
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="overflow-y-auto custom-scrollbar">
                    {suggestions.map((place, i) => (
                      <motion.button
                        key={place.id || i}
                        type="button"
                        onClick={() => selectPlace(place)}
                        onMouseEnter={() => setActiveIdx(i)}
                        className={`w-full text-left px-5 py-4 flex items-start gap-4 transition-all border-b border-gray-50 last:border-b-0 ${
                          i === activeIdx ? 'bg-[#F0FDFB]' : 'hover:bg-[#F9FFFF]'
                        }`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          i === activeIdx ? 'bg-[#45B1A8] text-white' : 'bg-[#E0F5F3] text-[#45B1A8]'
                        }`}>
                          <LocationIcon type={place.type} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[15px] font-bold text-[#1A2B2A] truncate leading-tight">
                              <HighlightMatch text={place.mainText} query={searchQuery} />
                            </p>
                            {place.distance && (
                              <span className="text-[10px] font-black text-[#45B1A8] bg-[#45B1A8]/10 px-1.5 py-0.5 rounded-full shrink-0">
                                {place.distance < 1000 ? `${Math.round(place.distance)}m` : `${(place.distance/1000).toFixed(1)}km`}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1 font-medium truncate leading-normal">
                            {place.secondaryText || place.fullAddress}
                          </p>
                        </div>
                        <HiArrowRight className={`w-4 h-4 mt-3 transition-all ${i === activeIdx ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'}`} />
                      </motion.button>
                    ))}
                  </div>
                ) : searchQuery.trim().length >= 2 && (
                  <div className="px-6 py-8 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <HiSearch className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-sm font-bold text-gray-600">No results found for "{searchQuery}"</p>
                    <p className="text-xs text-gray-400 mt-2 max-w-[200px] mx-auto leading-relaxed">
                      Try searching with a landmark or street name instead.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Map Display (Leaflet Implementation) */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#45B1A8] to-[#6EE7B7] rounded-[24px] opacity-20 blur-sm group-hover:opacity-30 transition-opacity" />
        <div className="relative h-72 w-full rounded-[22px] overflow-hidden border-2 border-[#E0F5F3] shadow-lg bg-gray-50 z-0">
          <MapContainer 
            center={mapCenter} 
            zoom={mapZoom} 
            className="w-full h-full"
            zoomControl={true}
          >
            <TileLayer
              attribution={TILE_ATTRIBUTION}
              url={TILE_LAYER_URL}
            />
            <RecenterMap center={mapCenter} zoom={mapZoom} />
            <MapEvents onClick={handleReverseGeocode} />
            
            {selectedLocation?.lat && selectedLocation?.lng && (
              <Marker 
                position={[selectedLocation.lat, selectedLocation.lng]}
                draggable={true}
                eventHandlers={{
                  dragend: (e) => {
                    const marker = e.target;
                    const position = marker.getLatLng();
                    handleReverseGeocode(position.lat, position.lng);
                  },
                }}
              />
            )}
          </MapContainer>

          <AnimatePresence>
            {!selectedLocation?.lat && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[400] flex items-center justify-center pointer-events-none bg-black/5"
              >
                <div className="bg-white px-6 py-3 rounded-2xl shadow-xl border border-[#E0F5F3] flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#45B1A8] rounded-full animate-ping" />
                  <span className="text-[11px] font-black text-[#1A2B2A] uppercase tracking-wider">Search or Tap on map</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {geoLoading && (
            <div className="absolute inset-0 z-[500] flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
              <div className="w-10 h-10 border-4 border-[#45B1A8] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Additional Details */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Flat / House No</label>
            <input
              type="text"
              value={manualAddress.houseNo}
              onChange={(e) => updateManualAddress('houseNo', e.target.value)}
              placeholder="e.g. Flat 402, Royal Apt"
              className="w-full bg-[#F9FFFF] text-[#1A2B2A] font-bold border-2 border-[#E0F5F3] rounded-xl py-3 px-4 focus:border-[#45B1A8] transition-all outline-none text-sm placeholder:text-gray-300"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Floor / Landmark</label>
            <input
              type="text"
              value={manualAddress.landmark}
              onChange={(e) => updateManualAddress('landmark', e.target.value)}
              placeholder="e.g. 4th Floor, near Park"
              className="w-full bg-[#F9FFFF] text-[#1A2B2A] font-bold border-2 border-[#E0F5F3] rounded-xl py-3 px-4 focus:border-[#45B1A8] transition-all outline-none text-sm placeholder:text-gray-300"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Delivery Instructions</label>
          <input
            type="text"
            value={manualAddress.instructions}
            onChange={(e) => updateManualAddress('instructions', e.target.value)}
            placeholder="e.g. Call before arrival, leave at gate"
            className="w-full bg-[#F9FFFF] text-[#1A2B2A] font-bold border-2 border-[#E0F5F3] rounded-xl py-3 px-4 focus:border-[#45B1A8] transition-all outline-none text-sm placeholder:text-gray-300"
          />
        </div>
      </div>

      {/* Selection Feedback */}
      <AnimatePresence>
        {selectedLocation?.address && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#F0FDFB] to-white border-2 border-[#E0F5F3] rounded-3xl p-5 shadow-sm overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#45B1A8]/5 rounded-full -mr-16 -mt-16" />
            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-[#E0F5F3] flex items-center justify-center shrink-0">
                  <HiLocationMarker className="w-6 h-6 text-[#45B1A8]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-[#45B1A8] uppercase tracking-[0.2em] mb-1">SELECTED DESTINATION</p>
                  <p className="text-base font-bold text-[#1A2B2A] leading-snug">
                    {selectedLocation.placeName || 'Selected Location'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">
                    {selectedLocation.address}
                  </p>
                  {selectedLocation.manualAddress && (
                    <div className="mt-3 pt-3 border-t border-[#E0F5F3] flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-[#E0F5F3] text-[#45B1A8] px-2 py-0.5 rounded">DETAILS</span>
                      <p className="text-xs font-bold text-[#45B1A8] truncate">{selectedLocation.manualAddress}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingLocationPicker;
