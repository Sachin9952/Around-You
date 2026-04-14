import { Link } from 'react-router-dom';

const CategoryGrid = ({ title, items }) => {
  return (
    <div className="px-4 py-4">
      <h3 className="text-gray-900 font-bold text-lg mb-4">{title}</h3>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-y-6 gap-x-2">
        {items.map((item, index) => (
          <Link 
            key={index} 
            to={item.link || `/services?category=${item.slug}`}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="relative w-14 h-14 md:w-24 md:h-24 mb-3 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:bg-[#F3F1FF] group-hover:border-[#6D5AE6]/30 transition-colors shadow-sm">
              {item.isNew && (
                <div className="absolute -top-1 -right-1 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-100 z-10">
                  <span className="text-[10px] md:text-xs font-bold text-orange-500 uppercase">New</span>
                </div>
              )}
              {/* Replace with actual image/icon if using icons. For fidelity, we use the provided icon. */}
              {item.icon ? (
                 <item.icon className={`w-7 h-7 md:w-12 md:h-12 ${item.iconColor || 'text-gray-700'} group-hover:scale-110 transition-transform`} />
              ) : item.img ? (
                 <img src={item.img} alt={item.name} className="w-8 h-8 md:w-14 md:h-14 object-contain group-hover:scale-110 transition-transform" />
              ) : null}
            </div>
            <span className="text-xs md:text-sm font-semibold text-gray-800 text-center leading-tight max-w-[80px]">
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;
