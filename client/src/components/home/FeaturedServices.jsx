import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { HiStar, HiArrowRight } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const categoryImages = {
  plumber: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80',
  electrician: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80',
  cleaner: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
  painter: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
  carpenter: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=600&q=80',
  mechanic: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
  tutor: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80',
};

const itemVars = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const FeaturedServices = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // Fetch top-rated, over-fetch to account for filtering out unavailable ones
        const { data } = await API.get('/services', {
          params: { sort: 'rating', limit: 10, page: 1 }
        });
        // Only show bookable services with an active provider
        const bookable = (data.data || []).filter(
          s => s.isBookable !== false && s.provider?.name
        );
        setServices(bookable.slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch featured services', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleCardClick = (id) => {
    navigate(`/services/${id}`);
  };

  const getLocationText = (location) => {
    if (!location) return null;
    if (typeof location === 'string') return location;
    return location.city || location.address || null;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="py-24 bg-[#F5FDFD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-10 w-64 bg-gray-200 rounded-2xl mb-4 animate-pulse"></div>
          <div className="h-5 w-96 bg-gray-100 rounded-xl mb-12 animate-pulse"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm animate-pulse">
                <div className="h-48 w-full bg-gray-200"></div>
                <div className="p-5">
                  <div className="h-5 w-3/4 bg-gray-200 rounded-lg mb-3"></div>
                  <div className="h-4 w-1/2 bg-gray-100 rounded-lg mb-4"></div>
                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="h-6 w-16 bg-gray-200 rounded-lg"></div>
                    <div className="w-10 h-10 rounded-full bg-gray-100"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (services.length === 0) {
    return (
      <div className="py-24 bg-[#F5FDFD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A2B2A] mb-4">Featured Services</h2>
          <p className="text-[#4A5568] text-lg mb-8">
            No services available yet. Be the first to explore when they go live!
          </p>
          <Link
            to="/services"
            className="inline-flex items-center text-[#45B1A8] font-bold hover:text-[#3a9990] transition-colors"
          >
            Browse All Services <HiArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-24 bg-[#F5FDFD] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              className="text-3xl md:text-4xl font-extrabold text-[#1A2B2A] mb-4"
            >
              Featured Services
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: 0.1 }}
              className="text-[#4A5568] text-lg"
            >
              Highly-rated professionals ready to help you with your daily tasks.
            </motion.p>
          </div>
          <Link to="/services" className="inline-flex items-center text-[#45B1A8] font-bold hover:text-[#3a9990] transition-colors whitespace-nowrap">
            View All Services <HiArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {services.map((service) => {
            const locationText = getLocationText(service.location);
            const imageUrl = service.image || categoryImages[service.category] || 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80';

            return (
              <motion.div 
                variants={itemVars}
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                key={service._id} 
                className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-shadow cursor-pointer flex flex-col"
                onClick={() => handleCardClick(service._id)}
              >
                {/* Image Cover */}
                <div className="h-48 w-full overflow-hidden relative">
                  <img 
                    src={imageUrl} 
                    alt={service.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#1A2B2A] uppercase tracking-wider">
                    {service.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-[#1A2B2A] leading-tight line-clamp-2 group-hover:text-[#45B1A8] transition-colors">
                      {service.title}
                    </h3>
                  </div>

                  <div className="flex items-center flex-wrap text-sm text-[#4A5568] mb-4 gap-x-1">
                    <span className="font-semibold text-gray-900">{service.provider?.name || 'Local Expert'}</span>
                    {service.averageRating > 0 && (
                      <>
                        <span className="mx-1">•</span>
                        <div className="flex items-center">
                          <HiStar className="w-4 h-4 text-[#F2994A] mr-0.5" />
                          <span className="font-bold text-[#1A2B2A]">{service.averageRating.toFixed(1)}</span>
                          {service.totalReviews > 0 && (
                            <span className="text-gray-400 ml-1">({service.totalReviews})</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Footer Section inside card */}
                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-0.5">
                        {locationText || 'Starts from'}
                      </span>
                      <span className="text-lg font-black text-[#1A2B2A]">₹{service.price}</span>
                      {service.priceType === 'hourly' && <span className="text-xs text-gray-400 ml-1">/hr</span>}
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 rounded-full bg-[#E0F5F3] text-[#45B1A8] flex items-center justify-center group-hover:bg-[#45B1A8] group-hover:text-white transition-colors"
                    >
                      <HiArrowRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
        
      </div>
    </div>
  );
};

export default FeaturedServices;
