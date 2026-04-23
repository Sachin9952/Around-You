import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import local assets to bypass CDN tracking prevention
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import NearbyServiceCard from '../components/NearbyServiceCard';
import MapMarker from '../components/MapMarker';
import { HiLocationMarker, HiSearch, HiRefresh } from 'react-icons/hi';
import toast from 'react-hot-toast';

// Fix for default Leaflet icon not showing in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Helper component to recenter map when location changes
const RecenterMap = ({ lat, lng, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], zoom || 13, {
        animate: true,
        duration: 1
      });
    }
  }, [lat, lng, zoom, map]);
  return null;
};

const categories = ['plumber', 'electrician', 'cleaner', 'painter', 'carpenter', 'mechanic', 'tutor', 'other'];
const sorts = [
  { value: 'nearest', label: 'Nearest' },
  { value: 'cheapest', label: 'Lowest Price' },
  { value: 'top-rated', label: 'Top Rated' }
];

const NearbyServices = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null); // { lat, lng }
  const [hoveredServiceId, setHoveredServiceId] = useState(null);
  
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || 'nearest',
  });
  
  const [manualCityInput, setManualCityInput] = useState(filters.city);

  // Ask for location on initial mount if not provided manually
  useEffect(() => {
    if (!filters.city) {
      detectLocation();
    } else {
      fetchNearbyServices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchNearbyServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, filters.sort, userLocation]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      fetchNearbyServices(); // Fetch everything without coords
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setManualCityInput(''); // Clear manual search if GPS works
        setFilters(prev => ({ ...prev, city: '' }));
      },
      (err) => {
        toast('Location access denied. Please enter city manually.', { icon: '📍' });
        fetchNearbyServices(); // Fetch globally or by existing filters
      },
      { timeout: 10000 }
    );
  };

  const fetchNearbyServices = async () => {
    setLoading(true);
    try {
      const params = {};
      if (userLocation?.lat && userLocation?.lng) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
      }
      if (filters.city) params.city = filters.city;
      if (filters.category) params.category = filters.category;
      params.sort = filters.sort;

      const { data } = await API.get('/services/nearby', { params });
      setServices(data.data);
    } catch (err) {
      console.error('Failed to fetch nearby services:', err);
      toast.error('Failed to load nearby services');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    setUserLocation(null); // Clear GPS coords if manually searching by city
    setFilters(prev => ({ ...prev, city: manualCityInput, sort: 'nearest' }));
    
    const params = {};
    if (manualCityInput) params.city = manualCityInput;
    if (filters.category) params.category = filters.category;
    params.sort = 'nearest';
    setSearchParams(params);
  };

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const params = {};
    if (userLocation) {
        // preserve coords in memory but don't strictly put them in URL to keep it clean, 
        // URL just tracks category/sort/city
    }
    if (newFilters.city) params.city = newFilters.city;
    if (newFilters.category) params.category = newFilters.category;
    if (newFilters.sort) params.sort = newFilters.sort;
    setSearchParams(params);
  };

  // Default map center (India coords)
  const mapCenter = userLocation ? [userLocation.lat, userLocation.lng] : [20.5937, 78.9629];
  const mapZoom = userLocation ? 13 : 5;

  return (
    <div className="bg-[#F5FDFD] min-h-[calc(100vh-64px)] flex flex-col font-sans">
      
      {/* Top Filter Bar */}
      <div className="bg-white border-b border-[#E0F5F3] sticky top-0 z-20 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => updateFilter('category', filters.category === cat ? '' : cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  filters.category === cat ? 'bg-[#45B1A8] text-white' : 'bg-[#E0F5F3] text-[#45B1A8] hover:bg-[#c9efec]'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <select
              value={filters.sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="bg-[#F5FDFD] text-[#1A2B2A] text-xs font-bold border border-[#E0F5F3] rounded-lg px-3 py-2 outline-none focus:border-[#45B1A8]"
            >
              {sorts.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>

            <form onSubmit={handleManualSearch} className="flex flex-1 sm:flex-none relative">
              <input 
                type="text" 
                placeholder="City/Area..." 
                value={manualCityInput}
                onChange={(e) => setManualCityInput(e.target.value)}
                className="w-full sm:w-48 bg-[#F5FDFD] text-[#1A2B2A] text-xs font-medium border border-[#E0F5F3] rounded-l-lg px-3 py-2 outline-none focus:border-[#45B1A8]"
              />
              <button type="submit" className="bg-[#45B1A8] text-white px-3 py-2 rounded-r-lg hover:bg-[#3a9990] transition-colors">
                <HiSearch className="w-4 h-4" />
              </button>
            </form>

            <button 
              onClick={detectLocation}
              title="Use Current Location"
              className={`p-2 rounded-lg border transition-colors ${userLocation ? 'bg-[#E0F5F3] border-[#45B1A8] text-[#45B1A8]' : 'bg-white border-[#E0F5F3] text-[#4A5568] hover:bg-gray-50'}`}
            >
              <HiLocationMarker className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Main Content Split */}
      <div className="flex flex-1 flex-col lg:flex-row h-full overflow-hidden">
        
        {/* Left List */}
        <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col bg-white border-r border-[#E0F5F3] z-10 shadow-xl overflow-y-auto h-[40vh] lg:h-[calc(100vh-130px)] custom-scrollbar">
          <div className="p-4 sm:p-6 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-black text-[#1A2B2A]">
                {loading ? 'Finding Services...' : (
                  <>
                    {services.length} {services.length === 1 ? 'Service' : 'Services'} 
                    {userLocation ? ' Nearby' : filters.city ? ` in ${filters.city}` : ' Available'}
                  </>
                )}
              </h1>
              {loading && <LoadingSpinner size="sm" />}
            </div>

            <div className="flex flex-col gap-4 pb-8">
               <AnimatePresence>
                {!loading && services.length === 0 && (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
                     <div className="w-16 h-16 bg-[#F5FDFD] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#E0F5F3]">
                       <HiSearch className="w-8 h-8 text-[#45B1A8]" />
                     </div>
                     <p className="text-[#4A5568] font-medium">No active services match your criteria.</p>
                     <button onClick={() => { setFilters(prev => ({...prev, category: '', city: ''})); setManualCityInput(''); setUserLocation(null); fetchNearbyServices(); }} className="text-[#45B1A8] font-bold text-sm mt-2 hover:underline">Clear Filters</button>
                   </motion.div>
                )}
                {!loading && services.map((service) => (
                  <NearbyServiceCard 
                    key={service._id} 
                    service={service} 
                    onHover={setHoveredServiceId}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Map */}
        <div className="w-full lg:w-[55%] xl:w-[60%] h-[60vh] lg:h-[calc(100vh-130px)] bg-gray-100 relative z-0">
          <MapContainer 
            center={mapCenter} 
            zoom={mapZoom} 
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
              maxZoom={20}
            />
            
            {(userLocation || filters.city) && <RecenterMap lat={mapCenter[0]} lng={mapCenter[1]} zoom={userLocation ? 13 : 11} />}
            
            {userLocation && (
               <Marker position={[userLocation.lat, userLocation.lng]} zIndexOffset={500}>
                 <Popup>Your Location</Popup>
               </Marker>
            )}

            {services.map((service) => (
              <MapMarker 
                key={service._id} 
                service={service} 
                isHighlighted={hoveredServiceId === service._id}
              />
            ))}
          </MapContainer>
        </div>

      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E0F5F3; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #45B1A8; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default NearbyServices;
