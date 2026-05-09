import { motion } from 'framer-motion';
import { HiStar, HiLocationMarker, HiOutlineHeart, HiShieldCheck, HiArrowRight } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getServiceImage } from '../../utils/serviceImage';

const ServiceCard = ({ service, isHighlighted, onHover, variant = 'compact' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/services/${service._id}`);
  };

  const handleBookClick = (e) => {
    e.stopPropagation();
    navigate(`/services/${service._id}`);
  };

  const isFeatured = variant === 'featured';
  const distanceText = service.distanceKm ? ` • ${service.distanceKm} km` : '';
  const locationText = typeof service.location === 'object' 
    ? (service.location.city || service.location.address || 'Local')
    : (service.location || 'Local');

  return (
    <motion.div
      layout
      onMouseEnter={() => onHover && onHover(service._id)}
      onMouseLeave={() => onHover && onHover(null)}
      onClick={handleCardClick}
      whileHover={{ y: -6 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        boxShadow: isHighlighted 
          ? '0 20px 25px -5px rgba(69, 177, 168, 0.2)' 
          : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        borderColor: isHighlighted ? '#45B1A8' : '#F1F5F9'
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`group relative bg-white rounded-2xl border-2 cursor-pointer overflow-hidden flex flex-col h-full hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 ${
        isHighlighted ? 'border-[#45B1A8] ring-4 ring-[#45B1A8]/5' : 'border-slate-50'
      }`}
    >
      {/* 1. Optimized Image Section */}
      <div className={`relative ${isFeatured ? 'h-48 sm:h-52' : 'h-40 sm:h-44'} w-full overflow-hidden shrink-0`}>
        <img 
          src={getServiceImage(service)} 
          alt={service.title} 
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Subtle Category Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-white/90 backdrop-blur-md text-[#45B1A8] text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm border border-white/20 opacity-90">
            {typeof service.category === 'string' ? service.category : service.category?.name || 'Service'}
          </span>
        </div>

        {/* Favorite Icon Overlay */}
        <div className="absolute top-3 right-3 z-10">
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="w-8 h-8 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-white transition-all shadow-sm"
          >
            <HiOutlineHeart className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Verified Badge Overlay */}
        {service.isBookable && (
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 bg-[#1A2B2A]/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wide border border-white/5">
            <HiShieldCheck className="w-3 h-3 text-[#45B1A8]" />
            Verified
          </div>
        )}
      </div>

      {/* 2. Content Section with consistent Rhythm */}
      <div className="px-5 py-3.5 flex flex-col flex-1 space-y-2.5">
        {/* Title & Provider */}
        <div className="space-y-1">
          <h3 className="text-[#1A2B2A] font-extrabold text-base line-clamp-1 group-hover:text-[#45B1A8] transition-colors leading-tight">
            {service.title}
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-teal-50 flex items-center justify-center text-[8px] font-bold text-[#45B1A8] border border-teal-100">
              {service.provider?.name?.charAt(0) || 'P'}
            </div>
            <p className="text-slate-600 text-sm font-medium tracking-tight">
              {service.provider?.name || 'Local Expert'}
            </p>
          </div>
        </div>

        {/* Stats Row: Rating & Location */}
        <div className="flex items-center justify-between bg-slate-50/50 px-3 py-1.5 rounded-xl border border-slate-100/50">
          <div className="flex items-center gap-1.5">
            <HiStar className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[#1A2B2A] text-xs font-black">
              {service.averageRating ? service.averageRating.toFixed(1) : '4.5'}
            </span>
            <span className="text-slate-400 text-[10px] font-bold">({service.totalReviews || 'New'})</span>
          </div>
          <div className="flex items-center text-slate-500 text-[10px] font-bold max-w-[60%]">
            <HiLocationMarker className="w-3 h-3 mr-1 text-[#45B1A8]/80 shrink-0" />
            <span className="truncate">{locationText}{distanceText}</span>
          </div>
        </div>

        {/* 3. Footer: Price & Action */}
        <div className="mt-auto pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[#1A2B2A] font-black text-xl">₹{service.price}</span>
            {service.priceType === 'hourly' && <span className="text-slate-400 text-[10px] font-bold ml-1 uppercase">/hr</span>}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBookClick}
            disabled={!service.isBookable}
            className={`h-10 px-5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              service.isBookable 
                ? 'bg-[#45B1A8] text-white hover:bg-[#3a9990] shadow-md shadow-[#45B1A8]/10' 
                : 'bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-100'
            }`}
          >
            {!service.isBookable ? 'N/A' : (
              <>
                Book Now <HiArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
