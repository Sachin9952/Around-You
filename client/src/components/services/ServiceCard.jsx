import { motion } from 'framer-motion';
import { HiStar, HiLocationMarker, HiOutlineHeart, HiShieldCheck } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ServiceCard = ({ service, isHighlighted, onHover }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/services/${service._id}`);
  };

  const handleBookClick = (e) => {
    e.stopPropagation();
    navigate(`/services/${service._id}`);
  };

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
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        boxShadow: isHighlighted ? '0 10px 25px -5px rgba(69, 177, 168, 0.2)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        borderColor: isHighlighted ? '#45B1A8' : '#e2e8f0'
      }}
      className={`group relative bg-white rounded-2xl p-4 border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
        isHighlighted ? 'border-[#45B1A8] ring-1 ring-[#45B1A8]/20' : 'border-slate-100'
      }`}
    >
      {/* Top Row: Provider & Category */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-100">
            {service.provider?.avatar ? (
              <img src={service.provider.avatar} alt={service.provider.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-teal-50 text-teal-600 font-bold text-xs">
                {service.provider?.name?.charAt(0) || 'P'}
              </div>
            )}
          </div>
          <span className="bg-teal-50 text-[#45B1A8] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
            {service.category}
          </span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); }}
          className="text-slate-300 hover:text-rose-500 transition-colors p-1"
        >
          <HiOutlineHeart className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="mb-3">
        <h3 className="text-slate-900 font-bold text-base mb-1 line-clamp-1 group-hover:text-[#45B1A8] transition-colors">
          {service.title}
        </h3>
        <p className="text-slate-500 text-xs font-medium mb-2">
          {service.provider?.name || 'Local Expert'}
        </p>
        <div className="flex items-center text-slate-500 text-[11px] font-medium">
          <HiLocationMarker className="w-3.5 h-3.5 mr-1 text-[#45B1A8]" />
          <span>{locationText}{distanceText}</span>
        </div>
      </div>

      {/* Metadata Row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded-md">
          <HiStar className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-amber-700 text-[11px] font-bold">
            {service.averageRating ? service.averageRating.toFixed(1) : '4.5'}
          </span>
        </div>
        {service.isBookable && (
          <div className="flex items-center gap-1 bg-blue-50 px-1.5 py-0.5 rounded-md">
            <HiShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-blue-700 text-[11px] font-bold">Verified</span>
          </div>
        )}
        <div className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded-md text-[10px] font-bold text-slate-500 uppercase">
          Nearby
        </div>
      </div>

      {/* Bottom Row */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
        <div>
          <span className="text-slate-900 font-black text-lg">₹{service.price}</span>
          {service.priceType === 'hourly' && <span className="text-slate-400 text-[10px] ml-1">/hr</span>}
        </div>
        <button
          onClick={handleBookClick}
          disabled={!service.isBookable}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            service.isBookable 
              ? 'bg-[#45B1A8] text-white hover:bg-[#3a9990] shadow-sm hover:shadow-md' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {!service.isBookable ? 'Unavailable' : user?.role === 'provider' ? 'View Service' : 'Book Now'}
        </button>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
