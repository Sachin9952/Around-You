import { Link } from 'react-router-dom';

const TrendingServices = ({ items }) => {
  return (
    <div className="px-4 py-4 mb-4">
      <h3 className="text-gray-900 font-bold text-lg mb-4">Trending Services</h3>
      
      {/* Horizontal Scroll on Mobile, Grid on Desktop */}
      <div className="flex overflow-x-auto sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 pb-4 hide-scrollbar">
        {items.map((item, index) => (
          <Link 
            key={index} 
            to={`/services/${item.id || ''}?category=${item.slug || ''}`}
            className="flex flex-col items-center flex-shrink-0 w-[112px] sm:w-auto group cursor-pointer"
          >
            <div className="w-28 h-28 sm:w-full sm:aspect-square mb-3 rounded-2xl overflow-hidden bg-gray-100 shadow-md">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <span className="text-xs md:text-base font-semibold text-gray-900 text-center leading-tight">
              {item.name}
            </span>
          </Link>
        ))}
      </div>

      <div className="flex justify-end mt-1">
        <Link 
          to="/services" 
          className="text-xs font-semibold text-[#6D5AE6] hover:text-[#5244ad] transition-colors"
        >
          Explore All Trending Services &gt;
        </Link>
      </div>
    </div>
  );
};

export default TrendingServices;
