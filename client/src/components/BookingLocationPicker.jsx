import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HiLocationMarker, HiSearch, HiX, HiCursorClick, HiGlobeAlt } from 'react-icons/hi';
import toast from 'react-hot-toast';

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

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;
const NEARBY_RADIUS = 20000;  // 20km in meters
const WIDER_RADIUS = 50000;   // 50km in meters
const NEARBY_KM = 20;
const WIDER_KM = 50;

// ─── Map sub-components ─────────────────────────────────────────────────────

const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 16, { animate: true });
  }, [center, map]);
  return null;
};

const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({ click: (e) => onLocationSelect(e.latlng.lat, e.latlng.lng) });
  return null;
};

// ─── Utilities ──────────────────────────────────────────────────────────────

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDist(km) {
  if (km < 0.5) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

// ─── Geoapify API Helpers ───────────────────────────────────────────────────

async function geoapifyAutocomplete(query, userLoc, radiusMeters) {
  if (!GEOAPIFY_KEY) {
    console.warn('VITE_GEOAPIFY_API_KEY is not set. Location autocomplete will not work.');
    return [];
  }

  let url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&format=json&limit=8&apiKey=${GEOAPIFY_KEY}`;

  // Add country filter for India
  url += '&filter=countrycode:in';

  // If we have user location, add proximity bias and circle filter
  if (userLoc) {
    url += `&bias=proximity:${userLoc.lng},${userLoc.lat}`;
    // Replace country filter with circle filter to restrict radius
    url = url.replace('&filter=countrycode:in', `&filter=circle:${userLoc.lng},${userLoc.lat},${radiusMeters}`);
  }

  const res = await fetch(url);
  const data = await res.json();
  return (data.results || []).map((r) => ({
    lat: r.lat,
    lon: r.lon,
    name: r.name || r.address_line1 || '',
    display_name: r.formatted || '',
    address_line1: r.address_line1 || '',
    address_line2: r.address_line2 || '',
    place_id: r.place_id || `geo_${r.lat}_${r.lon}`,
    type: r.result_type || '',
    category: r.category || '',
    city: r.city || r.town || r.village || '',
    postcode: r.postcode || '',
    state_district: r.county || r.district || '',
    distKm: userLoc ? haversineKm(userLoc.lat, userLoc.lng, r.lat, r.lon) : null,
  }));
}

async function geoapifyReverse(lat, lng) {
  if (!GEOAPIFY_KEY) return null;
  const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${GEOAPIFY_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const feature = data.features?.[0]?.properties;
  if (!feature) return null;
  return {
    address: feature.formatted || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    city: feature.city || feature.town || feature.village || '',
    pincode: feature.postcode || '',
    state_district: feature.county || feature.district || '',
  };
}

// Nominatim reverse as fallback if Geoapify key is missing
async function nominatimReverse(lat, lng) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
  );
  const data = await res.json();
  const addr = data.address || {};
  return {
    address: data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    city: addr.city || addr.town || addr.village || addr.state_district || '',
    pincode: addr.postcode || '',
  };
}

// ─── Component ──────────────────────────────────────────────────────────────

const BookingLocationPicker = ({ selectedLocation, onLocationChange }) => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [searchRadius, setSearchRadius] = useState(NEARBY_RADIUS);
  const [noNearbyButHasWider, setNoNearbyButHasWider] = useState(false);

  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState('prompt');

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);
  const lastQueryRef = useRef('');

  const defaultCenter = [20.5937, 78.9629];
  const mapCenter = selectedLocation.lat && selectedLocation.lng
    ? [selectedLocation.lat, selectedLocation.lng]
    : userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter;

  // ── Geolocation on mount ──────────────────────────────────────────────────

  useEffect(() => {
    if (!navigator.geolocation) { setLocationPermission('denied'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationPermission('granted');
      },
      () => setLocationPermission('denied'),
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

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  // ── Search with debounce ──────────────────────────────────────────────────

  const runSearch = useCallback((query, radius = NEARBY_RADIUS) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.trim().length < 3) {
      setSuggestions([]); setShowDropdown(false); setNoNearbyButHasWider(false); return;
    }

    lastQueryRef.current = query.trim();

    debounceRef.current = setTimeout(async () => {
      setSuggestionsLoading(true);
      setShowDropdown(true);
      setNoNearbyButHasWider(false);
      try {
        let results = await geoapifyAutocomplete(query.trim(), userLocation, radius);

        // Sort by distance (nearest first)
        if (userLocation) {
          results.sort((a, b) => (a.distKm ?? 9999) - (b.distKm ?? 9999));
        }

        setSuggestions(results);

        // If no results with nearby radius, check if wider would help
        if (results.length === 0 && radius === NEARBY_RADIUS && userLocation) {
          const widerResults = await geoapifyAutocomplete(query.trim(), userLocation, WIDER_RADIUS);
          if (widerResults.length > 0) {
            setNoNearbyButHasWider(true);
          }
        }
      } catch (err) {
        console.error('Geoapify search failed:', err);
        setSuggestions([]);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 400);
  }, [userLocation]);

  // ── Widen search ──────────────────────────────────────────────────────────

  const handleWidenSearch = () => {
    setSearchRadius(WIDER_RADIUS);
    setNoNearbyButHasWider(false);
    runSearch(lastQueryRef.current, WIDER_RADIUS);
  };

  // ── Input change ──────────────────────────────────────────────────────────

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setActiveIdx(-1);
    setSearchRadius(NEARBY_RADIUS);
    runSearch(value, NEARBY_RADIUS);
  };

  // ── Select a suggestion ───────────────────────────────────────────────────

  const selectPlace = (place) => {
    setSearchQuery(place.display_name);
    setSuggestions([]);
    setShowDropdown(false);
    onLocationChange({
      address: place.display_name,
      lat: place.lat,
      lng: place.lon,
      city: place.city,
      pincode: place.postcode,
    });
  };

  // ── Manual location ───────────────────────────────────────────────────────

  const useManualLocation = () => {
    const text = searchQuery.trim();
    if (!text) return;
    const lat = selectedLocation.lat || userLocation?.lat || null;
    const lng = selectedLocation.lng || userLocation?.lng || null;
    setShowDropdown(false);
    setSuggestions([]);
    if (lat && lng) {
      onLocationChange({ address: text, lat, lng });
      toast.success('Saved! Drag the pin to set the exact spot.');
    } else {
      onLocationChange({ address: text, lat: null, lng: null });
      toast('Pin your exact location on the map below.', { icon: '📍' });
    }
  };

  // ── Keyboard nav ──────────────────────────────────────────────────────────

  const handleKeyDown = (e) => {
    if (!showDropdown) return;
    const total = suggestions.length;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((p) => (p < total - 1 ? p + 1 : 0)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((p) => (p > 0 ? p - 1 : total - 1)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && activeIdx < total) selectPlace(suggestions[activeIdx]);
      else if (total === 0 && searchQuery.trim().length >= 3) useManualLocation();
    }
    else if (e.key === 'Escape') setShowDropdown(false);
  };

  // ── Clear ─────────────────────────────────────────────────────────────────

  const clearSearch = () => {
    setSearchQuery(''); setSuggestions([]); setShowDropdown(false);
    setSearchRadius(NEARBY_RADIUS); setNoNearbyButHasWider(false);
    inputRef.current?.focus();
  };

  // ── Reverse geocode (map click / marker drag / detect location) ───────────

  const reverseGeocode = async (lat, lng) => {
    setLoading(true);
    try {
      // Try Geoapify first, fall back to Nominatim
      let result = await geoapifyReverse(lat, lng);
      if (!result) result = await nominatimReverse(lat, lng);

      const address = result?.address || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      setSearchQuery(address);
      onLocationChange({
        address,
        lat, lng,
        city: result?.city || '',
        pincode: result?.pincode || '',
      });
    } catch {
      const fallback = `Selected Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      setSearchQuery(fallback);
      onLocationChange({ address: fallback, lat, lng });
    } finally {
      setLoading(false);
    }
  };

  // ── Detect current location ───────────────────────────────────────────────

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    setLoading(true);
    const tid = toast.loading('Detecting your location...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationPermission('granted');
        reverseGeocode(latitude, longitude);
        toast.success('Location detected!', { id: tid });
      },
      () => { toast.error('Could not detect location.', { id: tid }); setLoading(false); },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // ── Format helpers ────────────────────────────────────────────────────────

  const formatType = (type) => {
    const skip = ['unknown', 'building', 'amenity', 'street', 'suburb', 'city', 'county', 'state', 'country', 'postcode'];
    if (!type || skip.includes(type)) return null;
    return type.replace(/_/g, ' ');
  };

  const radiusLabel = searchRadius === WIDER_RADIUS ? `Within ${WIDER_KM} km` : `Nearby · within ${NEARBY_KM} km`;

  // ── API key warning ───────────────────────────────────────────────────────

  const missingKey = !GEOAPIFY_KEY;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <label className="block text-sm font-bold text-[#1A2B2A] pl-1">
            Service Location <span className="text-red-500">*</span>
          </label>
          {locationPermission === 'granted' && (
            <p className="text-[10px] text-[#45B1A8] font-semibold pl-1 mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#45B1A8] rounded-full inline-block animate-pulse" />
              Showing nearby places first
            </p>
          )}
          {missingKey && (
            <p className="text-[10px] text-amber-500 font-semibold pl-1 mt-0.5">
              ⚠ Autocomplete unavailable — set VITE_GEOAPIFY_API_KEY
            </p>
          )}
        </div>
        <button
          type="button" onClick={handleDetectLocation} disabled={loading}
          className="flex items-center gap-2 bg-[#45B1A8]/10 text-[#45B1A8] hover:bg-[#45B1A8]/20 px-4 py-2 rounded-full text-xs font-bold transition-all disabled:opacity-50 shrink-0"
        >
          <HiLocationMarker className="w-4 h-4" />
          {loading ? 'Detecting...' : 'Use My Current Location'}
        </button>
      </div>

      {/* Search Input */}
      <div className="relative z-[1100]">
        <div className="relative">
          <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#45B1A8] pointer-events-none" />
          <input
            ref={inputRef} type="text" value={searchQuery}
            onChange={handleInputChange} onKeyDown={handleKeyDown}
            onFocus={() => { if (suggestions.length > 0 || searchQuery.trim().length >= 3) setShowDropdown(true); }}
            placeholder="Search area, street, building, shop..."
            className="w-full bg-white text-[#1A2B2A] font-medium border-2 border-[#E0F5F3] rounded-2xl py-3.5 pl-12 pr-12 focus:ring-2 focus:ring-[#45B1A8]/30 focus:border-[#45B1A8] transition-all outline-none text-sm placeholder:text-gray-400"
            disabled={missingKey}
          />
          {searchQuery && (
            <button type="button" onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <HiX className="w-3.5 h-3.5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showDropdown && !missingKey && (
          <div ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-[#E0F5F3] rounded-2xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto">

            {suggestionsLoading ? (
              <div className="flex items-center gap-3 px-5 py-4">
                <div className="w-5 h-5 border-2 border-[#45B1A8] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium text-gray-400">
                  {userLocation ? 'Searching nearby places...' : 'Searching...'}
                </span>
              </div>
            ) : (
              <>
                {/* Radius label */}
                {suggestions.length > 0 && userLocation && (
                  <div className="px-5 py-2 bg-[#F5FDFD] border-b border-[#E0F5F3]">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {radiusLabel} · {suggestions.length} result{suggestions.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                {/* Results */}
                {suggestions.map((place, i) => {
                  const tl = formatType(place.type);
                  return (
                    <button
                      type="button" key={place.place_id || i}
                      onClick={() => selectPlace(place)}
                      className={`w-full text-left px-5 py-3 flex items-start gap-3 transition-colors border-b border-gray-50/80 last:border-b-0 ${
                        i === activeIdx ? 'bg-[#E0F5F3]' : 'hover:bg-[#F5FDFD]'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#E0F5F3] flex items-center justify-center shrink-0 mt-0.5">
                        <HiLocationMarker className="w-4 h-4 text-[#45B1A8]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#1A2B2A] truncate leading-tight">
                          {place.name || place.address_line1 || place.display_name.split(',')[0]}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          {tl && (
                            <span className="text-[9px] font-bold uppercase tracking-wide text-white bg-[#45B1A8]/70 px-1.5 py-0.5 rounded">{tl}</span>
                          )}
                          <span className="text-[11px] text-gray-400 font-medium truncate">
                            {place.address_line2 || place.display_name.split(', ').slice(1, 3).join(', ')}
                          </span>
                        </div>
                      </div>
                      {place.distKm !== null && place.distKm !== undefined && (
                        <span className="shrink-0 text-[10px] font-bold text-[#45B1A8] bg-[#E0F5F3] px-2.5 py-1 rounded-lg mt-0.5 whitespace-nowrap">
                          {formatDist(place.distKm)}
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* "Search wider area" when nearby returned nothing but wider would */}
                {noNearbyButHasWider && suggestions.length === 0 && (
                  <div className="px-5 py-5">
                    <p className="text-sm font-semibold text-gray-500 mb-1">
                      No places found within {NEARBY_KM} km
                    </p>
                    <button type="button" onClick={handleWidenSearch}
                      className="w-full flex items-center justify-center gap-2 bg-white hover:bg-[#F5FDFD] border-2 border-[#E0F5F3] text-[#45B1A8] px-4 py-2.5 rounded-xl text-sm font-bold transition-colors mb-3">
                      <HiGlobeAlt className="w-4 h-4" />
                      Search wider area (up to {WIDER_KM} km)
                    </button>
                    <button type="button" onClick={useManualLocation}
                      className="w-full flex items-center justify-center gap-2 bg-[#F5FDFD] hover:bg-[#E0F5F3] border-2 border-dashed border-[#45B1A8]/30 text-[#45B1A8] px-4 py-3 rounded-xl text-sm font-bold transition-colors">
                      <HiCursorClick className="w-4 h-4" />
                      Use "{searchQuery.trim()}" & pin on map
                    </button>
                  </div>
                )}

                {/* No results at all */}
                {suggestions.length === 0 && !noNearbyButHasWider && !suggestionsLoading && searchQuery.trim().length >= 3 && (
                  <div className="px-5 py-5">
                    <p className="text-sm font-semibold text-gray-500 mb-1">
                      No nearby places found for "{searchQuery.trim()}"
                    </p>
                    <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                      Try a nearby landmark or street name, or type the exact name and pin it on the map.
                    </p>
                    <button type="button" onClick={useManualLocation}
                      className="w-full flex items-center justify-center gap-2 bg-[#F5FDFD] hover:bg-[#E0F5F3] border-2 border-dashed border-[#45B1A8]/30 text-[#45B1A8] px-4 py-3 rounded-xl text-sm font-bold transition-colors">
                      <HiCursorClick className="w-4 h-4" />
                      Use "{searchQuery.trim()}" & pin on map
                    </button>
                  </div>
                )}

                {/* Footer: manual option when results exist */}
                {suggestions.length > 0 && searchQuery.trim().length >= 3 && (
                  <button type="button" onClick={useManualLocation}
                    className="w-full text-left px-5 py-2.5 flex items-center gap-2 bg-gray-50/60 hover:bg-[#F5FDFD] transition-colors text-[11px] text-gray-400 font-semibold border-t border-gray-100">
                    <HiCursorClick className="w-3.5 h-3.5" />
                    Not listed? Use "{searchQuery.trim()}" and pin on map
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="relative h-64 w-full rounded-2xl overflow-hidden border border-[#E0F5F3] shadow-inner bg-gray-50">
        <MapContainer center={mapCenter} zoom={selectedLocation.lat ? 16 : userLocation ? 14 : 5}
          className="h-full w-full outline-none" scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            subdomains="abcd" maxZoom={20}
          />
          <MapClickHandler onLocationSelect={reverseGeocode} />
          <RecenterMap center={selectedLocation.lat ? [selectedLocation.lat, selectedLocation.lng] : null} />
          {selectedLocation.lat && selectedLocation.lng && (
            <Marker position={[selectedLocation.lat, selectedLocation.lng]} draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const pos = e.target.getLatLng();
                  reverseGeocode(pos.lat, pos.lng);
                },
              }}
            />
          )}
        </MapContainer>
        {!selectedLocation.lat && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center pointer-events-none">
            <div className="bg-white/95 px-5 py-2.5 rounded-full shadow-lg border border-[#E0F5F3] animate-bounce">
              <span className="text-xs font-extrabold text-[#45B1A8] uppercase tracking-wider">Click map or search above</span>
            </div>
          </div>
        )}
      </div>

      {/* Selected Address Display */}
      <div className="bg-[#F5FDFD] border border-[#E0F5F3] rounded-2xl p-4 transition-all">
        <label className="block text-[10px] uppercase tracking-wider font-extrabold text-gray-400 mb-1">
          Selected Service Destination
        </label>
        <p className="text-sm font-semibold text-[#1A2B2A] leading-relaxed">
          {selectedLocation.address || 'No location selected yet. Search or pick a spot on the map.'}
        </p>
        {selectedLocation.lat && (
          <p className="text-[10px] text-[#45B1A8] mt-1 font-bold">
            Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          </p>
        )}
      </div>
    </div>
  );
};

export default BookingLocationPicker;
