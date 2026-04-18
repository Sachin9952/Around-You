import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiStar } from 'react-icons/hi';
import { HiBolt } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';

const ServiceCardDetailed = ({ service }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleClick = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast('Please login to view service details', { icon: '🔒' });
      return navigate('/login');
    }
    navigate(`/services/${service.id || ''}?category=${service.slug || ''}`);
  };

  return (
    <motion.div 
      layout
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      onClick={handleClick}
      className="flex flex-col group/card cursor-pointer w-full sm:w-[320px] sm:shrink-0 outline-none"
    >
      {/* Image Container */}
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-3 sm:mb-4 shadow-sm">
        {service.tag && (
          <div className="absolute top-0 left-0 bg-[#6D5AE6] text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-br-xl font-medium text-xs sm:text-sm z-10 shadow-sm">
            {service.tag}
          </div>
        )}
        
        {/* UC Safe badge */}
        {service.isSafe && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded border border-gray-200 z-10 flex items-center shadow-sm">
            <span className="font-bold text-gray-900 text-[10px] tracking-tighter">UC</span>
            <span className="text-gray-900 text-[10px] ml-1 uppercase">Safe</span>
          </div>
        )}

        <img 
          src={service.image} 
          alt={service.name} 
          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Details Area */}
      <div className="px-0.5">
        <h3 className="text-gray-900 font-bold text-sm sm:text-base mb-1 group-hover/card:text-black leading-tight line-clamp-2">
          {service.name}
        </h3>
        
        <div className="flex items-center text-[11px] sm:text-xs text-gray-500 mb-1 font-medium">
          <HiStar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-800 mr-0.5 sm:mr-1" />
          <span className="text-gray-800">{service.rating}</span>
          
          {service.isInstant && (
            <>
              <span className="mx-1">•</span>
              <HiBolt className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500 mr-0.5" />
              <span>Instant</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-gray-900 font-bold text-sm">₹{service.price}</span>
          {service.originalPrice && (
            <span className="text-gray-400 font-medium text-xs sm:text-sm line-through">₹{service.originalPrice}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceCardDetailed;
