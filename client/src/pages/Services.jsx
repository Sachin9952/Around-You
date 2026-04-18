import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { HiSearch, HiStar, HiLocationMarker, HiArrowRight } from 'react-icons/hi';
import toast from 'react-hot-toast';

const categoryImages = {
  plumber: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
  electrician: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
  cleaner: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
  painter: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
  carpenter: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=800&q=80',
  mechanic: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
  tutor: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
  default: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80'
};

const categories = ['plumber', 'electrician', 'cleaner', 'painter', 'carpenter', 'mechanic', 'tutor', 'other'];

const Services = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    sort: searchParams.get('sort') || '',
    page: Number(searchParams.get('page')) || 1,
  });

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, filters.sort, filters.page, filters.location]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.location) params.location = filters.location;
      if (filters.sort) params.sort = filters.sort;
      params.page = filters.page;
      params.limit = 12;

      const { data } = await API.get('/services', { params });
      setServices(data.data);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault?.();
    setFilters({ ...filters, page: 1 });
    fetchServices();
  };

  const clearFilters = () => {
    const newFilters = { search: '', category: '', location: '', sort: '', page: 1 };
    setFilters(newFilters);
    setSearchParams({});
    setTimeout(fetchServices, 0);
  };

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);

    const params = {};
    Object.entries(newFilters).forEach(([k, v]) => { if (v) params[k] = v; });
    setSearchParams(params);
  };

  return (
    <div className="bg-[#F5FDFD] min-h-screen pt-12 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero & Search Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1A2B2A] mb-6 tracking-tight">
            Professional <span className="text-[#45B1A8]">Services</span> at Your Doorstep
          </h1>
          <p className="text-lg text-[#4A5568] mb-10 max-w-2xl mx-auto">
            Experience top-tier quality and convenience. Search our variety of trusted experts to help with your everyday tasks.
          </p>

          <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto">
            <div className="flex items-center bg-white rounded-full shadow-[0_8px_30px_rgb(69,177,168,0.12)] p-2 pl-6 pr-2 border-2 border-transparent focus-within:border-[#E0F5F3] transition-all duration-300">
              <HiSearch className="w-6 h-6 text-[#45B1A8]" />
              <input
                type="text"
                placeholder="What service do you need today?"
                className="flex-1 bg-transparent border-none outline-none focus:ring-0 px-4 text-base md:text-lg text-[#1A2B2A] placeholder-gray-400 w-full"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
              <button
                type="submit"
                className="bg-[#45B1A8] text-white px-6 py-3 md:px-8 md:py-3.5 rounded-full font-bold text-sm md:text-base hover:bg-[#3a9990] hover:shadow-lg transition-all duration-300"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => updateFilter('category', '')}
            className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${!filters.category ? 'bg-[#45B1A8] text-white shadow-md' : 'bg-white text-[#4A5568] hover:bg-[#E0F5F3] hover:text-[#45B1A8]'
              }`}
          >
            All Services
          </motion.button>
          {categories.map((cat) => (
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              key={cat}
              onClick={() => updateFilter('category', filters.category === cat ? '' : cat)}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${filters.category === cat
                  ? 'bg-[#45B1A8] text-white shadow-md'
                  : 'bg-white text-[#4A5568] hover:bg-[#E0F5F3] hover:text-[#45B1A8]'
                }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </motion.button>
          ))}
        </div>

        {/* Services / Results Section */}
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <LoadingSpinner size="lg" text="Finding best options..." />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-24 px-4 bg-white rounded-3xl shadow-sm border border-[#E0F5F3] max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-[#E0F5F3] rounded-full flex items-center justify-center mx-auto mb-6">
              <HiSearch className="w-10 h-10 text-[#45B1A8]" />
            </div>
            <h3 className="text-2xl font-bold text-[#1A2B2A] mb-3">No services found</h3>
            <p className="text-[#4A5568] mb-8 text-lg">We couldn't find any services matching your current criteria.</p>
            <button onClick={clearFilters} className="bg-white border-2 border-[#45B1A8] text-[#45B1A8] hover:bg-[#45B1A8] hover:text-white px-8 py-3 rounded-full font-bold transition-colors">
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              <AnimatePresence>
                {services.map(service => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    onClick={() => { if (!isAuthenticated) { toast('Please login to view service details', { icon: '🔒' }); navigate('/login'); return; } navigate(`/services/${service._id}`); }} key={service._id} className="group flex flex-col bg-white border border-[#E0F5F3] rounded-[2rem] shadow-sm overflow-hidden cursor-pointer w-full"
                  >
                  {/* Service Image Cover */}
                  <div className="h-48 w-full overflow-hidden relative">
                    <img 
                      src={service.image || categoryImages[service.category] || categoryImages.default} 
                      alt={service.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Dark gradient overlay for modern look */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  <div className="p-6 sm:p-8 flex flex-col flex-1 relative z-10 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-[#E0F5F3] text-[#45B1A8] text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
                        {service.category}
                      </span>
                      {service.location && (
                        <div className="flex items-center text-xs font-semibold text-[#4A5568] bg-[#F5FDFD] px-2 py-1 rounded-md border border-[#E0F5F3]">
                          <HiLocationMarker className="w-3.5 h-3.5 mr-1 text-[#45B1A8]" />
                          <span className="truncate max-w-[100px]">{service.location}</span>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-xl sm:text-2xl font-black text-[#1A2B2A] mb-3 line-clamp-2 leading-tight group-hover:text-[#45B1A8] transition-colors">{service.title}</h3>
                    <p className="text-[#4A5568] text-sm mb-6 line-clamp-2 font-medium">{service.description || 'Professional and reliable service tailored just for you. Book now for great results.'}</p>

                    <div className="mt-auto flex items-end justify-between w-full pt-5 border-t border-[#E0F5F3]/60">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Pricing</span>
                        <div className="flex flex-row items-baseline gap-1">
                          <span className="text-2xl font-black text-[#1A2B2A]">₹{service.price}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-[#45B1A8]/10 px-3 py-1.5 rounded-xl border border-[#45B1A8]/20">
                        <HiStar className="w-4 h-4 text-[#45B1A8]" />
                        <span className="text-sm font-bold text-[#1A2B2A]">{service.averageRating ? service.averageRating.toFixed(1) : '4.5'}</span>
                      </div>
                    </div>
                  </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-16">
                <button
                  onClick={() => updateFilter('page', filters.page - 1)}
                  disabled={filters.page <= 1}
                  className="px-6 py-3 bg-white shadow-sm border border-[#E0F5F3] rounded-full text-sm font-bold text-[#1A2B2A] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5FDFD] transition-colors"
                >
                  Previous
                </button>
                <div className="bg-white shadow-sm border border-[#E0F5F3] px-6 py-3 rounded-full">
                  <span className="text-sm font-bold text-[#1A2B2A]">
                    {filters.page} <span className="text-[#4A5568] font-medium mx-1">of</span> {totalPages}
                  </span>
                </div>
                <button
                  onClick={() => updateFilter('page', filters.page + 1)}
                  disabled={filters.page >= totalPages}
                  className="px-6 py-3 bg-[#45B1A8] shadow-md rounded-full text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3a9990] transition-colors flex items-center gap-2"
                >
                  Next <HiArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Services;
