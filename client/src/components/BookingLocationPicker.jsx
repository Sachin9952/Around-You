import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HiLocationMarker, HiSearch } from 'react-icons/hi';
import toast from 'react-hot-toast';

// Import local assets to bypass CDN tracking prevention
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Helper component to recenter map
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 15, { animate: true });
    }
  }, [center, map]);
  return null;
};

// Map click handler component
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const BookingLocationPicker = ({ selectedLocation, onLocationChange }) => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Default center if no location selected (India)
  const defaultCenter = [20.5937, 78.9629];
  const center = selectedLocation.lat && selectedLocation.lng 
    ? [selectedLocation.lat, selectedLocation.lng] 
    : defaultCenter;

  const reverseGeocode = async (lat, lng) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      const address = data.display_name || `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      const addressObj = data.address || {};
      const city = addressObj.city || addressObj.town || addressObj.village || addressObj.state_district || '';
      const pincode = addressObj.postcode || '';
      onLocationChange({ address, lat, lng, city, pincode });
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
      onLocationChange({ 
        address: `Selected Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`, 
        lat, 
        lng 
      });
      toast.error('Could not resolve address, but coordinates are saved.');
    } finally {
      setLoading(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      return toast.error('Geolocation is not supported by your browser');
    }

    setLoading(true);
    const toastId = toast.loading('Detecting your location...');
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        reverseGeocode(latitude, longitude);
        toast.success('Location detected!', { id: toastId });
      },
      (err) => {
        toast.error('Could not get your location. Please select it on the map.', { id: toastId });
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <label className="block text-sm font-bold text-[#1A2B2A] pl-1">
          Service Location <span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={loading}
          className="flex items-center gap-2 bg-[#45B1A8]/10 text-[#45B1A8] hover:bg-[#45B1A8]/20 px-4 py-2 rounded-full text-xs font-bold transition-all disabled:opacity-50"
        >
          <HiLocationMarker className="w-4 h-4" />
          {loading ? 'Detecting...' : 'Use Current Location'}
        </button>
      </div>

      <div className="relative h-64 w-full rounded-2xl overflow-hidden border border-[#E0F5F3] shadow-inner bg-gray-50">
        <MapContainer
          center={center}
          zoom={selectedLocation.lat ? 15 : 5}
          className="h-full w-full outline-none"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={20}
          />
          <MapClickHandler onLocationSelect={reverseGeocode} />
          <RecenterMap center={selectedLocation.lat ? [selectedLocation.lat, selectedLocation.lng] : null} />
          
          {selectedLocation.lat && selectedLocation.lng && (
            <Marker 
              position={[selectedLocation.lat, selectedLocation.lng]} 
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  reverseGeocode(position.lat, position.lng);
                },
              }}
            />
          )}
        </MapContainer>
        
        {!selectedLocation.lat && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center pointer-events-none">
            <div className="bg-white/95 px-5 py-2.5 rounded-full shadow-lg border border-[#E0F5F3] animate-bounce">
              <span className="text-xs font-extrabold text-[#45B1A8] uppercase tracking-wider">Click map to select location</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#F5FDFD] border border-[#E0F5F3] rounded-2xl p-4 transition-all">
        <label className="block text-[10px] uppercase tracking-wider font-extrabold text-gray-400 mb-1">
          Selected Service Destination
        </label>
        <p className="text-sm font-semibold text-[#1A2B2A] leading-relaxed">
          {selectedLocation.address || 'No location selected yet. Please pick a spot on the map.'}
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
