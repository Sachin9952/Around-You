import { Link } from 'react-router-dom';
import { HiStar } from 'react-icons/hi';
import { HiBolt } from 'react-icons/hi2';

const ServiceCardDetailed = ({ service }) => {
  return (
    <Link 
      to={`/services/${service.id || ''}?category=${service.slug || ''}`}
      className="flex flex-col group/card cursor-pointer w-[280px] sm:w-[320px] shrink-0 outline-none"
    >
      {/* Image Container */}
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-4">
        {service.tag && (
          <div className="absolute top-0 left-0 bg-[#6D5AE6] text-white px-3 py-1.5 rounded-br-xl font-medium text-sm z-10 shadow-sm">
            {service.tag}
          </div>
        )}
        
        {/* Mocking the 'UC Safe' badge on the top right */}
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
      <div className="px-1">
        <h3 className="text-gray-900 font-bold text-base mb-1 group-hover/card:text-black leading-tight">
          {service.name}
        </h3>
        
        <div className="flex items-center text-xs text-gray-500 mb-1.5 font-medium">
          <HiStar className="w-4 h-4 text-gray-800 mr-1" />
          <span className="text-gray-800">{service.rating}</span>
          
          {service.isInstant && (
            <>
              <span className="mx-1.5">•</span>
              <HiBolt className="w-3.5 h-3.5 text-emerald-500 mr-0.5" />
              <span>Instant</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-900 font-bold text-sm">₹{service.price}</span>
          {service.originalPrice && (
            <span className="text-gray-400 font-medium text-sm line-through">₹{service.originalPrice}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ServiceCardDetailed;
