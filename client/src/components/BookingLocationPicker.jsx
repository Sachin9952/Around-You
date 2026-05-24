import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  HiArrowRight,
  HiDotsVertical,
  HiTrash,
  HiPencil,
  HiCheckCircle,
  HiPlus
} from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  getGeoapifySuggestions,
  reverseGeocodeGeoapify
} from '../api/locationService';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

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

// Component to recenter and invalidate size of map
const RecenterMap = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || map.getZoom(), { animate: true });
    }
  }, [center, zoom, map]);

  useEffect(() => {
    // Trigger invalidateSize after a brief delay to ensure container dimensions are settled
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [map, center]);

  return null;
};

// ─── Component ──────────────────────────────────────────────────────────────

const BookingLocationPicker = ({ selectedLocation, onLocationChange }) => {
  const { user, isAuthenticated } = useAuth();

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

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [savedAddressesLoading, setSavedAddressesLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isCurrentLocationDetected, setIsCurrentLocationDetected] = useState(false);

  // Save Address Flow State
  const [saveThisAddress, setSaveThisAddress] = useState(false);
  const [addressLabel, setAddressLabel] = useState('Home');
  const [customLabelText, setCustomLabelText] = useState('');
  const [isDefaultAddress, setIsDefaultAddress] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Address Menu state
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Edit Saved Address State
  const [isEditingSavedAddress, setIsEditingSavedAddress] = useState(false);
  const [editingSavedAddress, setEditingSavedAddress] = useState(null);
  const [editAddressSearchQuery, setEditAddressSearchQuery] = useState('');
  const [editAddressSuggestions, setEditAddressSuggestions] = useState([]);
  const [editAddressSuggestionsLoading, setEditAddressSuggestionsLoading] = useState(false);
  const [showEditAddressDropdown, setShowEditAddressDropdown] = useState(false);

  const [editAddressForm, setEditAddressForm] = useState({
    label: 'Home',
    customLabel: '',
    fullAddress: '',
    area: '',
    houseFlatBuilding: '',
    floorLandmark: '',
    instructions: '',
    latitude: '',
    longitude: '',
  });

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

  // ── Fetch Saved Addresses ─────────────────────────────────────────────────
  const fetchSavedAddresses = useCallback(async () => {
    if (!isAuthenticated) return;
    setSavedAddressesLoading(true);
    try {
      const res = await API.get('/addresses/my');
      if (res.data && res.data.success) {
        setSavedAddresses(res.data.data);
        
        // Auto-select default address if selectedLocation is not set
        const defaultAddr = res.data.data.find(addr => addr.isDefault);
        if (defaultAddr && !selectedLocation?.lat) {
          handleSelectSavedAddress(defaultAddr);
        }
      }
    } catch (err) {
      console.error('Error fetching saved addresses:', err);
    } finally {
      setSavedAddressesLoading(false);
    }
  }, [isAuthenticated, selectedLocation?.lat]);

  useEffect(() => {
    fetchSavedAddresses();
  }, [fetchSavedAddresses]);

  const handleSelectSavedAddress = (address) => {
    setSelectedAddressId(address._id);
    setIsCurrentLocationDetected(false);
    setSearchQuery(address.fullAddress);
    
    const newManual = {
      houseNo: address.houseFlatBuilding || '',
      floor: '',
      landmark: address.floorLandmark || '',
      instructions: address.instructions || ''
    };
    setManualAddress(newManual);

    onLocationChange({
      placeName: address.area,
      address: address.fullAddress,
      manualAddress: combineManualFields(newManual),
      houseNo: address.houseFlatBuilding,
      lat: address.latitude,
      lng: address.longitude,
      savedAddressId: address._id
    });
  };

  // ── Edit/Delete/Default Actions ──────────────────────────────────────────
  const handleSetDefaultAddress = async (id) => {
    const toastId = toast.loading('Setting default address...');
    try {
      const res = await API.patch(`/addresses/${id}/default`);
      if (res.data && res.data.success) {
        toast.success('Default address updated!', { id: toastId });
        await fetchSavedAddresses();
      } else {
        toast.error('Failed to set default address', { id: toastId });
      }
    } catch (err) {
      console.error('Error setting default address:', err);
      toast.error('Failed to set default address', { id: toastId });
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this saved address?')) return;

    const toastId = toast.loading('Deleting address...');
    try {
      const res = await API.delete(`/addresses/${id}`);
      if (res.data && res.data.success) {
        toast.success('Address deleted successfully!', { id: toastId });
        await fetchSavedAddresses();

        // If currently selected, clear
        if (selectedAddressId === id) {
          setSelectedAddressId(null);
          setSearchQuery('');
          setManualAddress({
            houseNo: '',
            floor: '',
            landmark: '',
            instructions: ''
          });
          onLocationChange({
            placeName: '',
            address: '',
            manualAddress: '',
            houseNo: '',
            lat: null,
            lng: null
          });
        }
      } else {
        toast.error('Failed to delete address', { id: toastId });
      }
    } catch (err) {
      console.error('Error deleting address:', err);
      toast.error('Failed to delete address', { id: toastId });
    }
  };

  const handleEditAddressClick = (addr) => {
    setEditingSavedAddress(addr);
    setEditAddressForm({
      label: ['Home', 'Work', 'Other'].includes(addr.label) ? addr.label : 'Custom',
      customLabel: ['Home', 'Work', 'Other'].includes(addr.label) ? '' : addr.label,
      fullAddress: addr.fullAddress,
      area: addr.area,
      houseFlatBuilding: addr.houseFlatBuilding,
      floorLandmark: addr.floorLandmark || '',
      instructions: addr.instructions || '',
      latitude: addr.latitude,
      longitude: addr.longitude,
    });
    setEditAddressSearchQuery(addr.fullAddress);
    setIsEditingSavedAddress(true);
  };

  const editDebounceRef = useRef(null);
  const runEditAddressSearch = (query) => {
    if (editDebounceRef.current) clearTimeout(editDebounceRef.current);
    if (!query || query.trim().length < 2) {
      setEditAddressSuggestions([]);
      setShowEditAddressDropdown(false);
      return;
    }

    editDebounceRef.current = setTimeout(async () => {
      setEditAddressSuggestionsLoading(true);
      setShowEditAddressDropdown(true);
      try {
        const results = await getGeoapifySuggestions(query.trim());
        setEditAddressSuggestions(results);
      } catch (err) {
        console.error('Search error:', err);
        setEditAddressSuggestions([]);
      } finally {
        setEditAddressSuggestionsLoading(false);
      }
    }, 400);
  };

  const handleEditAddressInputChange = (e) => {
    const val = e.target.value;
    setEditAddressSearchQuery(val);
    runEditAddressSearch(val);
  };

  const handleSelectEditAddressSuggestion = (place) => {
    setEditAddressSearchQuery(place.fullAddress);
    setEditAddressForm(prev => ({
      ...prev,
      fullAddress: place.fullAddress,
      area: place.mainText || 'Unknown Locality',
      latitude: place.lat,
      longitude: place.lng,
    }));
    setEditAddressSuggestions([]);
    setShowEditAddressDropdown(false);
  };

  const handleEditAddressFormSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!editAddressForm.fullAddress || !editAddressForm.latitude || !editAddressForm.longitude) {
      return toast.error('Please search and select a valid location from the search bar');
    }
    if (!editAddressForm.houseFlatBuilding.trim()) {
      return toast.error('Please enter House / Flat / Building No.');
    }

    const finalLabel = editAddressForm.label === 'Custom' ? editAddressForm.customLabel.trim() : editAddressForm.label;
    if (!finalLabel) {
      return toast.error('Please provide a name for the custom label');
    }

    const payload = {
      label: finalLabel,
      fullAddress: editAddressForm.fullAddress,
      area: editAddressForm.area || 'Unknown Locality',
      houseFlatBuilding: editAddressForm.houseFlatBuilding,
      floorLandmark: editAddressForm.floorLandmark,
      instructions: editAddressForm.instructions,
      latitude: Number(editAddressForm.latitude),
      longitude: Number(editAddressForm.longitude),
    };

    const toastId = toast.loading('Updating address...');
    try {
      const res = await API.put(`/addresses/${editingSavedAddress._id}`, payload);
      if (res.data && res.data.success) {
        toast.success('Address updated successfully!', { id: toastId });
        setIsEditingSavedAddress(false);
        setEditingSavedAddress(null);
        await fetchSavedAddresses();

        if (selectedAddressId === res.data.data._id) {
          handleSelectSavedAddress(res.data.data);
        }
      } else {
        toast.error('Failed to update address', { id: toastId });
      }
    } catch (err) {
      console.error('Error updating address:', err);
      toast.error(err.response?.data?.message || 'Error occurred while updating address', { id: toastId });
    }
  };

  // ── Save Address Action ───────────────────────────────────────────────────
  const handleSaveAddress = async () => {
    if (!selectedLocation?.address) {
      return toast.error('Please select a location first');
    }
    if (!manualAddress.houseNo?.trim()) {
      return toast.error('Please enter House / Flat / Building No.');
    }

    const finalLabel = addressLabel === 'Custom' ? customLabelText.trim() : addressLabel;
    if (!finalLabel) {
      return toast.error('Please provide a name for the custom label');
    }

    setIsSavingAddress(true);
    const toastId = toast.loading('Saving address...');
    try {
      const payload = {
        label: finalLabel,
        fullAddress: selectedLocation.address,
        area: selectedLocation.placeName || 'Unknown Locality',
        houseFlatBuilding: manualAddress.houseNo,
        floorLandmark: manualAddress.landmark,
        instructions: manualAddress.instructions,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        isDefault: isDefaultAddress,
      };

      const res = await API.post('/addresses', payload);
      if (res.data && res.data.success) {
        toast.success('Address saved successfully!', { id: toastId });
        
        setSaveThisAddress(false);
        setAddressLabel('Home');
        setCustomLabelText('');
        setIsDefaultAddress(false);
        
        await fetchSavedAddresses();
        
        if (res.data.data) {
          setSelectedAddressId(res.data.data._id);
        }
      } else {
        toast.error('Failed to save address', { id: toastId });
      }
    } catch (err) {
      console.error('Error saving address:', err);
      toast.error(err.response?.data?.message || 'Error occurred while saving address', { id: toastId });
    } finally {
      setIsSavingAddress(false);
    }
  };

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
    setIsCurrentLocationDetected(false);
    setSelectedAddressId(null);

    const combinedManual = combineManualFields(manualAddress);

    onLocationChange({
      placeName: place.mainText,
      address: place.fullAddress,
      manualAddress: combinedManual,
      houseNo: manualAddress.houseNo,
      placeId: place.id,
      lat: place.lat,
      lng: place.lng,
      raw: place.raw,
    });
  }, [onLocationChange, manualAddress]);

  // ── Reverse geocode ───────────────────────────────────────────────────────
  const handleReverseGeocode = useCallback(async (lat, lng, isFromDetection = false) => {
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
          houseNo: manualAddress.houseNo,
          placeId: result.placeId,
          lat, lng,
        });

        setIsCurrentLocationDetected(isFromDetection);
        setSelectedAddressId(null);
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
        handleReverseGeocode(latitude, longitude, true);
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
    setSelectedAddressId(null);

    if (selectedLocation?.lat) {
      const combinedManual = combineManualFields(newManual);
      onLocationChange({ ...selectedLocation, manualAddress: combinedManual, houseNo: newManual.houseNo });
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setActiveIdx(-1);
    setIsCurrentLocationDetected(false);
    setSelectedAddressId(null);
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
    setIsCurrentLocationDetected(false);
    setSelectedAddressId(null);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-6 w-full max-w-full min-w-0 overflow-hidden">
      {/* Search Section */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center justify-between sm:flex-nowrap">
          <label className="text-sm font-bold text-[#1A2B2A] tracking-tight">
            AREA / LOCALITY <span className="text-red-500">*</span>
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

        {/* Saved Addresses List */}
        {isAuthenticated && savedAddresses.length > 0 && (
          <div className="space-y-2 pt-1 w-full max-w-full min-w-0 overflow-hidden">
            <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-none w-full max-w-full flex-nowrap">
              {savedAddresses.map((addr) => {
                const isSelected = selectedAddressId === addr._id;
                return (
                  <motion.div
                    key={addr._id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSelectSavedAddress(addr)}
                    className={`relative overflow-hidden flex items-start gap-2.5 p-3 rounded-2xl border-2 cursor-pointer transition-all shrink-0 w-[230px] max-w-[80vw] ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#45B1A8] to-[#388E87] border-[#45B1A8] text-white shadow-md shadow-[#45B1A8]/20'
                        : 'bg-white border-[#E0F5F3] text-[#1A2B2A] hover:border-[#45B1A8] hover:bg-[#F9FFFF]'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#E0F5F3] text-[#45B1A8]'
                    }`}>
                      {addr.label.toLowerCase() === 'home' ? (
                        <HiHome className="w-4 h-4" />
                      ) : addr.label.toLowerCase() === 'work' ? (
                        <HiOfficeBuilding className="w-4 h-4" />
                      ) : (
                        <HiLocationMarker className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 w-full">
                        <span className="text-xs font-extrabold truncate">
                          {addr.label}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {addr.isDefault && (
                            <span className={`text-[8px] font-black uppercase tracking-wider px-1 py-0.5 rounded shrink-0 ${
                              isSelected ? 'bg-white/25 text-white' : 'bg-[#45B1A8]/10 text-[#45B1A8]'
                            }`}>
                              Default
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === addr._id ? null : addr._id);
                            }}
                            className={`p-1 rounded-full transition-colors shrink-0 ${
                              isSelected ? 'text-white hover:bg-white/20' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <HiDotsVertical className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                        {addr.houseFlatBuilding}, {addr.fullAddress}
                      </p>
                    </div>

                    {/* Quick Management Overlay */}
                    <AnimatePresence>
                      {activeMenuId === addr._id && (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 15 }}
                          className="absolute inset-0 bg-[#1A2B2A]/90 backdrop-blur-[1px] rounded-2xl flex flex-col justify-center items-center gap-1.5 p-2 z-10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Close overlay */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                            }}
                            className="absolute top-1 right-1 p-0.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <HiX className="w-3 h-3" />
                          </button>
                          
                          <div className="flex flex-col w-full gap-1 pt-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(null);
                                handleEditAddressClick(addr);
                              }}
                              className="w-full text-center py-1 text-[9px] font-bold text-[#45B1A8] hover:text-white bg-white/5 hover:bg-[#45B1A8] rounded-lg transition-all flex items-center justify-center gap-1"
                            >
                              <HiPencil className="w-2.5 h-2.5" /> Edit
                            </button>
                            {!addr.isDefault && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(null);
                                  handleSetDefaultAddress(addr._id);
                                }}
                                className="w-full text-center py-1 text-[9px] font-bold text-white hover:text-white bg-white/5 hover:bg-emerald-600 rounded-lg transition-all flex items-center justify-center gap-1"
                              >
                                <HiCheckCircle className="w-2.5 h-2.5 text-emerald-400" /> Default
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(null);
                                handleDeleteAddress(addr._id);
                              }}
                              className="w-full text-center py-1 text-[9px] font-bold text-red-400 hover:text-white bg-white/5 hover:bg-red-600 rounded-lg transition-all flex items-center justify-center gap-1"
                            >
                              <HiTrash className="w-2.5 h-2.5" /> Delete
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        <div className="relative z-[1100] w-full max-w-full">
          <div className="relative group w-full max-w-full">
            <div className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center pointer-events-none">
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
              className="w-full max-w-full min-w-0 bg-white text-[#1A2B2A] font-medium border-2 border-[#E0F5F3] rounded-2xl py-4 pl-11 pr-10 sm:pl-14 sm:pr-12 focus:ring-4 focus:ring-[#45B1A8]/10 focus:border-[#45B1A8] transition-all outline-none text-sm sm:text-base placeholder:text-gray-400 shadow-sm truncate"
              autoComplete="off"
            />
            {searchQuery && (
              <button type="button" onClick={clearSearch}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
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
                        className={`w-full text-left px-5 py-4 flex items-start gap-4 transition-all border-b border-gray-50 last:border-b-0 ${i === activeIdx ? 'bg-[#F0FDFB]' : 'hover:bg-[#F9FFFF]'
                          }`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${i === activeIdx ? 'bg-[#45B1A8] text-white' : 'bg-[#E0F5F3] text-[#45B1A8]'
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
                                {place.distance < 1000 ? `${Math.round(place.distance)}m` : `${(place.distance / 1000).toFixed(1)}km`}
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
      <div className="relative group w-full overflow-hidden rounded-[24px]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#45B1A8] to-[#6EE7B7] rounded-[24px] opacity-20 blur-sm group-hover:opacity-30 transition-opacity" />
        <div className="relative h-[240px] md:h-[340px] w-full max-w-full rounded-xl overflow-hidden border-2 border-[#E0F5F3] shadow-lg bg-gray-50 z-0">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            className="w-full h-full rounded-xl overflow-hidden"
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
      <div className="space-y-4 w-full max-w-full min-w-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-full min-w-0">
          <div className="space-y-1.5 w-full max-w-full min-w-0">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">House / Flat / Building No. <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={manualAddress.houseNo}
              onChange={(e) => updateManualAddress('houseNo', e.target.value)}
              placeholder="e.g. Flat 402, Royal Apt"
              className="w-full max-w-full min-w-0 bg-[#F9FFFF] text-[#1A2B2A] font-bold border-2 border-[#E0F5F3] rounded-xl py-3 px-4 focus:border-[#45B1A8] transition-all outline-none text-sm placeholder:text-gray-300"
            />
          </div>
          <div className="space-y-1.5 w-full max-w-full min-w-0">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Floor / Landmark</label>
            <input
              type="text"
              value={manualAddress.landmark}
              onChange={(e) => updateManualAddress('landmark', e.target.value)}
              placeholder="e.g. 4th Floor, near Park"
              className="w-full max-w-full min-w-0 bg-[#F9FFFF] text-[#1A2B2A] font-bold border-2 border-[#E0F5F3] rounded-xl py-3 px-4 focus:border-[#45B1A8] transition-all outline-none text-sm placeholder:text-gray-300"
            />
          </div>
        </div>
        <div className="space-y-1.5 w-full max-w-full min-w-0">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Delivery instructions</label>
          <input
            type="text"
            value={manualAddress.instructions}
            onChange={(e) => updateManualAddress('instructions', e.target.value)}
            placeholder="e.g. Call before arrival, leave at gate"
            className="w-full max-w-full min-w-0 bg-[#F9FFFF] text-[#1A2B2A] font-bold border-2 border-[#E0F5F3] rounded-xl py-3 px-4 focus:border-[#45B1A8] transition-all outline-none text-sm placeholder:text-gray-300"
          />
        </div>
      </div>

      {/* Save Address Option */}
      {isAuthenticated && selectedLocation?.lat && (
        <div className="bg-white border-2 border-[#E0F5F3] rounded-3xl p-4 sm:p-5 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={saveThisAddress}
              onChange={(e) => setSaveThisAddress(e.target.checked)}
              className="w-5 h-5 rounded-lg border-2 border-[#E0F5F3] text-[#45B1A8] focus:ring-[#45B1A8] focus:ring-offset-0 focus:ring-2 accent-[#45B1A8] cursor-pointer"
            />
            <span className="text-sm font-bold text-[#1A2B2A]">
              Save this address for future bookings
            </span>
          </label>

          <AnimatePresence>
            {saveThisAddress && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden pt-2 space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                    Address Label
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Home', 'Work', 'Other', 'Custom'].map((labelOpt) => (
                      <button
                        key={labelOpt}
                        type="button"
                        onClick={() => setAddressLabel(labelOpt)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                          addressLabel === labelOpt
                            ? 'bg-[#45B1A8] border-[#45B1A8] text-white shadow-sm'
                            : 'bg-white border-[#E0F5F3] text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {labelOpt}
                      </button>
                    ))}
                  </div>
                </div>

                {addressLabel === 'Custom' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                      Custom Label Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customLabelText}
                      onChange={(e) => setCustomLabelText(e.target.value)}
                      placeholder="e.g. Mom's House, Gym"
                      className="w-full max-w-full min-w-0 bg-[#F9FFFF] text-[#1A2B2A] font-bold border-2 border-[#E0F5F3] rounded-xl py-3 px-4 focus:border-[#45B1A8] transition-all outline-none text-sm placeholder:text-gray-300"
                    />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isDefaultAddress}
                      onChange={(e) => setIsDefaultAddress(e.target.checked)}
                      className="w-4 h-4 rounded border-2 border-[#E0F5F3] text-[#45B1A8] accent-[#45B1A8] cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-gray-500">
                      Set as default address
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={handleSaveAddress}
                    disabled={isSavingAddress}
                    className="w-full sm:w-auto bg-[#45B1A8] hover:bg-[#388E87] text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isSavingAddress ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : null}
                    Save Address
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Selection Feedback */}
      <AnimatePresence>
        {selectedLocation?.address && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#F0FDFB] to-white border-2 border-[#E0F5F3] rounded-3xl p-5 shadow-sm overflow-hidden relative w-full max-w-full min-w-0"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#45B1A8]/5 rounded-full -mr-16 -mt-16" />
            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-[#E0F5F3] flex items-center justify-center shrink-0">
                  <HiLocationMarker className="w-6 h-6 text-[#45B1A8]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <p className="text-[10px] font-black text-[#45B1A8] uppercase tracking-[0.2em]">SELECTED DESTINATION</p>
                    {isCurrentLocationDetected && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Current location detected
                      </span>
                    )}
                  </div>
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

      {/* Edit Address Modal */}
      {isEditingSavedAddress && createPortal(
        <div className="fixed inset-0 bg-[#1A2B2A]/40 backdrop-blur-sm flex items-center justify-center z-[2000] p-4 animate-fade-in">
          <div className="bg-white p-5 sm:p-8 max-w-lg w-full border border-[#E0F5F3] rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <h3 className="text-xl font-extrabold text-[#1A2B2A]">
                Edit Saved Address
              </h3>
              <button
                type="button"
                onClick={() => { setIsEditingSavedAddress(false); setEditingSavedAddress(null); }}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditAddressFormSubmit} className="space-y-4">
              {/* Geolocation Search Bar */}
              <div className="space-y-1.5 relative z-[2100]">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                  Search Locality / Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <HiLocationMarker className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#45B1A8]" />
                  <input
                    type="text"
                    required
                    value={editAddressSearchQuery}
                    onChange={handleEditAddressInputChange}
                    onFocus={() => { if (editAddressSuggestions.length > 0) setShowEditAddressDropdown(true); }}
                    placeholder="Type city, street, or landmark..."
                    className="w-full max-w-full min-w-0 bg-[#F5FDFD] text-[#1A2B2A] font-medium border border-[#E0F5F3] rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-[#45B1A8]/50 focus:border-[#45B1A8] transition-all outline-none text-sm placeholder:text-gray-400 truncate"
                    autoComplete="off"
                  />
                </div>

                {/* Autocomplete Dropdown */}
                {showEditAddressDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E0F5F3] rounded-2xl shadow-xl z-[2200] max-h-[220px] overflow-y-auto">
                    {editAddressSuggestionsLoading ? (
                      <div className="p-4 text-center text-xs font-bold text-[#45B1A8] animate-pulse">
                        Searching...
                      </div>
                    ) : editAddressSuggestions.length > 0 ? (
                      editAddressSuggestions.map((place, idx) => (
                        <button
                          key={place.id || idx}
                          type="button"
                          onClick={() => handleSelectEditAddressSuggestion(place)}
                          className="w-full text-left px-4 py-3 text-xs border-b border-gray-50 hover:bg-[#F9FFFF] transition-colors truncate"
                        >
                          <span className="font-bold text-[#1A2B2A] block">{place.mainText}</span>
                          <span className="text-gray-400 block text-[10px] mt-0.5">{place.secondaryText}</span>
                        </button>
                      ))
                    ) : editAddressSearchQuery.length >= 2 && (
                      <div className="p-4 text-center text-xs text-gray-400">
                        No locations found
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                    House / Flat / Building No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editAddressForm.houseFlatBuilding}
                    onChange={(e) => setEditAddressForm({ ...editAddressForm, houseFlatBuilding: e.target.value })}
                    placeholder="e.g. Flat 402, Royal Apt"
                    className="w-full max-w-full min-w-0 bg-[#F5FDFD] text-[#1A2B2A] font-medium border border-[#E0F5F3] rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-[#45B1A8]/50 focus:border-[#45B1A8] transition-all outline-none text-sm placeholder:text-gray-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                    Floor / Landmark
                  </label>
                  <input
                    type="text"
                    value={editAddressForm.floorLandmark}
                    onChange={(e) => setEditAddressForm({ ...editAddressForm, floorLandmark: e.target.value })}
                    placeholder="e.g. 4th Floor, near Park"
                    className="w-full max-w-full min-w-0 bg-[#F5FDFD] text-[#1A2B2A] font-bold border border-[#E0F5F3] rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-[#45B1A8]/50 focus:border-[#45B1A8] transition-all outline-none text-sm placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                  Delivery instructions
                </label>
                <input
                  type="text"
                  value={editAddressForm.instructions}
                  onChange={(e) => setEditAddressForm({ ...editAddressForm, instructions: e.target.value })}
                  placeholder="e.g. Call before arrival, leave at gate"
                  className="w-full max-w-full min-w-0 bg-[#F5FDFD] text-[#1A2B2A] font-medium border border-[#E0F5F3] rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-[#45B1A8]/50 focus:border-[#45B1A8] transition-all outline-none text-sm placeholder:text-gray-300"
                />
              </div>

              {/* Label selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                  Address Label
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Home', 'Work', 'Other', 'Custom'].map((labelOpt) => (
                    <button
                      key={labelOpt}
                      type="button"
                      onClick={() => setEditAddressForm(prev => ({ ...prev, label: labelOpt }))}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                        editAddressForm.label === labelOpt
                          ? 'bg-[#45B1A8] border-[#45B1A8] text-white shadow-sm'
                          : 'bg-[#F5FDFD] border-[#E0F5F3] text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {labelOpt}
                    </button>
                  ))}
                </div>
              </div>

              {editAddressForm.label === 'Custom' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                    Custom Label Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editAddressForm.customLabel}
                    onChange={(e) => setEditAddressForm({ ...editAddressForm, customLabel: e.target.value })}
                    placeholder="e.g. Gym, School"
                    className="w-full max-w-full min-w-0 bg-[#F5FDFD] text-[#1A2B2A] font-bold border border-[#E0F5F3] rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-[#45B1A8]/50 focus:border-[#45B1A8] transition-all outline-none text-sm placeholder:text-gray-300"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setIsEditingSavedAddress(false); setEditingSavedAddress(null); }}
                  className="px-4 py-2 rounded-full text-xs font-bold hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#45B1A8] hover:bg-[#388E87] text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default BookingLocationPicker;
