import { Link } from 'react-router-dom';
import { HiOutlineLocationMarker, HiChevronDown, HiOutlineSearch } from 'react-icons/hi';

const LocationSearchBar = () => {
  return (
    <div className="bg-white px-4 pt-4 pb-2 border-b border-gray-100">
      <div className="max-w-7xl mx-auto xl:px-4">
      {/* Location Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 max-w-[85%] cursor-pointer hover:opacity-80 transition-opacity">
          <HiOutlineLocationMarker className="w-5 h-5 text-gray-700 flex-shrink-0" />
          <h2 className="text-gray-900 font-semibold text-base truncate">Kesnand Rd, opp. to Ayurvedic colla...</h2>
          <HiChevronDown className="w-5 h-5 text-gray-700 flex-shrink-0" />
        </div>
        {/* Placeholder for notification or profile icon on mobile if needed, but not strictly in this frame except for standard OS icons */}
      </div>

      {/* Search Bar */}
      <Link 
        to="/services" 
        className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm shadow-gray-100 hover:shadow-md transition-shadow"
      >
        <HiOutlineSearch className="w-5 h-5 text-gray-400" />
        <span className="text-gray-400 text-sm font-medium">Search for services and packages</span>
      </Link>
      </div>
    </div>
  );
};

export default LocationSearchBar;
