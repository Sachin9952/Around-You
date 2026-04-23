import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { HiX, HiMap } from 'react-icons/hi';
import toast from 'react-hot-toast';

import FiltersToolbar from '../components/services/FiltersToolbar';
import ServiceListPanel from '../components/services/ServiceListPanel';
import MapPanel from '../components/services/MapPanel';

const Services = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Mode & Layout State
  const [viewMode, setViewMode] = useState(searchParams.get('v') || 'list'); // 'list' | 'map'

  // Data State
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [isLocating, setIsLocating] = useState(!searchParams.get('l'));

  // Selection/Hover State
  const [hoveredServiceId, setHoveredServiceId] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState(null);

  // Filters State
  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    category: searchParams.get('c') || '',
    city: searchParams.get('l') || '',
    sort: searchParams.get('s') || 'nearest',
  });

  // Sync state with URL
  useEffect(() => {
    const params = {};
    if (filters.search) params.q = filters.search;
    if (filters.category) params.c = filters.category;
    if (filters.city) params.l = filters.city;
    if (filters.sort) params.s = filters.sort;
    if (viewMode !== 'list') params.v = viewMode;
    setSearchParams(params, { replace: true });
  }, [filters, viewMode, setSearchParams]);

  // Detect Location on Mount
  useEffect(() => {
    if (!filters.city && !userLocation) {
      detectLocation();
    }
  }, []);

  const detectLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationDenied(false);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation denied', err);
        setLocationDenied(true);
        setIsLocating(false);
      }
    );
  };

  // Fetch Services
  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        category: filters.category,
        search: filters.search,
        city: filters.city,
        sort: filters.sort
      };

      if (userLocation) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
      }

      const { data } = await API.get('/services/nearby', { params });
      setServices(data.data || []);
    } catch (err) {
      console.error('Failed to fetch services', err);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  }, [filters, userLocation]);

  useEffect(() => {
    if (!isLocating) {
      fetchServices();
    }
  }, [fetchServices, isLocating]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      city: '',
      sort: 'nearest'
    });
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans flex flex-col">

      {/* 1. Header & Toolbar */}
      <FiltersToolbar
        filters={filters}
        updateFilter={updateFilter}
        onDetectLocation={detectLocation}
        viewMode={viewMode}
        onViewChange={setViewMode}
        resultCount={services.length}
        loading={loading}
      />

      {/* 2. Main Discovery Area */}
      <main className="flex-1 relative overflow-hidden">

        {/* Desktop Split Layout */}
        <div className="h-full flex flex-col lg:flex-row">

          {/* Left Panel: List */}
          <div
            className={`transition-all duration-500 ease-in-out px-4 py-2 md:px-8 overflow-y-auto custom-scrollbar ${viewMode === 'map'
                ? 'w-full lg:w-[460px] xl:w-[500px]'
                : 'w-full'
              }`}
          >
            <ServiceListPanel
              services={services}
              loading={loading}
              viewMode={viewMode}
              hoveredServiceId={hoveredServiceId}
              onHover={setHoveredServiceId}
              onClearFilters={clearFilters}
              locationDenied={locationDenied}
            />
          </div>

          {/* Right Panel: Map (Visible in map mode on desktop) */}
          <AnimatePresence>
            {viewMode === 'map' && (
              <motion.div
                initial={{ x: 1000, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 1000, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                className="hidden lg:block flex-1 h-[calc(100vh-160px)] py-4 pr-4"
              >
                <MapPanel
                  services={services}
                  userLocation={userLocation}
                  hoveredServiceId={hoveredServiceId}
                  selectedServiceId={selectedServiceId}
                  onMarkerClick={setSelectedServiceId}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Map Button Overlay */}
      {viewMode === 'list' && (
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <button
            onClick={() => setViewMode('map')}
            className="flex items-center gap-2 bg-[#1A2B2A] text-white px-8 py-4 rounded-full font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all border border-white/10"
          >
            <HiMap className="w-5 h-5" />
            <span>View Map</span>
          </button>
        </div>
      )}

      {/* Mobile Fullscreen Map Overlay */}
      <AnimatePresence>
        {viewMode === 'map' && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="lg:hidden fixed inset-0 z-[60] bg-white flex flex-col"
          >
            {/* Header with Exit Button */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white shadow-sm">
              <div className="flex flex-col">
                <h3 className="font-extrabold text-slate-900 text-lg">Discovery Map</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{services.length} services nearby</p>
              </div>
              <button
                onClick={() => setViewMode('list')}
                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg active:scale-95 transition-all"
              >
                <HiX className="w-4 h-4" />
                <span>Exit Map</span>
              </button>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative">
              <MapPanel
                services={services}
                userLocation={userLocation}
                hoveredServiceId={hoveredServiceId}
                selectedServiceId={selectedServiceId}
                onMarkerClick={setSelectedServiceId}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Services;
