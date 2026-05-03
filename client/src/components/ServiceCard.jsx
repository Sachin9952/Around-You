import { motion } from 'framer-motion';
import { HiOutlineBookmark } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ServiceCard = ({ service }) => {
  const { user } = useAuth();
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col h-full w-full"
    >
      {/* 1. Top Row */}
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
          {service.avatar ? (
            <img src={service.avatar} alt={service.providerName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-lg bg-emerald-50">
              {service.providerName?.charAt(0) || 'P'}
            </div>
          )}
        </div>
        <button 
          className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors border border-gray-100"
          title="Save Service"
        >
          <span className="text-xs font-semibold">Save</span>
          <HiOutlineBookmark className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Provider Info */}
      <div className="mb-2 flex items-center text-sm">
        <span className="font-semibold text-gray-900">{service.providerName}</span>
        <span className="mx-2 text-gray-300">•</span>
        <span className="text-gray-500">{service.status || 'Available today'}</span>
      </div>

      {/* 3. Main Title */}
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 line-clamp-2">
        {service.title}
      </h3>

      {/* 4. Tags / Badges Row */}
      <div className="flex flex-wrap gap-2 mb-5">
        {service.tags && service.tags.map((tag, idx) => (
          <span 
            key={idx} 
            className="px-3 py-1 rounded-full bg-gray-50 text-gray-600 text-[11px] font-semibold border border-gray-100"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto">
        {/* 5. Divider */}
        <hr className="border-gray-100 mb-5" />

        {/* 6. Bottom Row */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">
              {service.price}
            </span>
            <span className="text-xs text-gray-500 mt-0.5">
              {service.location}
            </span>
          </div>
          
          {service.isBookable === false ? (
            <button 
              disabled
              className="bg-gray-200 text-gray-500 cursor-not-allowed px-5 py-2.5 rounded-xl text-sm font-bold"
            >
              Unavailable
            </button>
          ) : (
            <Link 
              to={`/services/${service._id || '#'}`}
              className="bg-gray-900 text-white hover:bg-gray-800 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
            >
              {user?.role === 'provider' && user?._id === service.provider?._id ? 'View Service' : 'Book Now'}
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
