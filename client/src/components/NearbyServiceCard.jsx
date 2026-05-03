import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiStar, HiLocationMarker } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const categoryImages = {
  plumber: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=400&q=80',
  electrician: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=400&q=80',
  cleaner: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
  painter: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80',
  carpenter: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=400&q=80',
  mechanic: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80',
  tutor: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=80',
  default: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=400&q=80'
};

const NearbyServiceCard = ({ service, onHover }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const handleBook = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast('Please login to book a service', { icon: '🔒' });
      navigate('/login');
      return;
    }
    navigate(`/services/${service._id}`);
  };

  const locName = typeof service.location === 'object' 
    ? (service.location.city || service.location.pincode || 'Local')
    : service.location;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      onMouseEnter={() => onHover && onHover(service._id)}
      onMouseLeave={() => onHover && onHover(null)}
      className="group flex flex-col sm:flex-row bg-white border border-[#E0F5F3] rounded-[2rem] shadow-sm overflow-hidden cursor-pointer w-full hover:shadow-lg transition-all"
    >
      <div className="h-32 sm:h-full sm:w-40 overflow-hidden relative shrink-0">
        {!service.isBookable && (
          <div className="absolute top-2 left-2 z-20 bg-gray-900/80 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/20">
            Unavailable
          </div>
        )}
        <img 
          src={service.image || categoryImages[service.category] || categoryImages.default} 
          alt={service.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#1A2B2A]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      <div className="p-4 flex flex-col flex-1 relative bg-white">
        <div className="flex items-start justify-between mb-2">
          <div className="min-w-0 pr-2">
             <span className="bg-[#E0F5F3] text-[#45B1A8] text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full inline-block mb-1.5">
              {service.category}
            </span>
            <h3 className="text-lg font-black text-[#1A2B2A] line-clamp-1 leading-tight group-hover:text-[#45B1A8] transition-colors">
              {service.title}
            </h3>
          </div>
          {service.distanceKm !== undefined && (
            <div className="shrink-0 flex items-center gap-1 bg-[#F5FDFD] border border-[#E0F5F3] px-2 py-1 rounded-lg">
              <HiLocationMarker className="w-3.5 h-3.5 text-[#45B1A8]" />
              <span className="text-xs font-bold text-[#1A2B2A]">{service.distanceKm} km</span>
            </div>
          )}
        </div>
        
        <p className="text-[#4A5568] text-[13px] mb-3 line-clamp-1 flex-1">
          {service.provider?.name || 'Local Expert'} • {locName}
        </p>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-[#E0F5F3]/60">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-[#1A2B2A]">₹{service.price}</span>
            <div className="flex items-center gap-1">
              <HiStar className="w-3.5 h-3.5 text-[#45B1A8]" />
              <span className="text-xs font-bold text-[#4A5568]">{service.averageRating ? service.averageRating.toFixed(1) : 'New'}</span>
            </div>
          </div>
          <button 
            onClick={handleBook}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              service.isBookable 
                ? 'bg-[#45B1A8] text-white hover:bg-[#3a9990]' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
            }`}
          >
            {!service.isBookable ? 'N/A' : 'Book'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default NearbyServiceCard;
