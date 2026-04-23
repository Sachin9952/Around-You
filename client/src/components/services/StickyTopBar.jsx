import { useState } from 'react';
import { HiSearch, HiLocationMarker, HiX } from 'react-icons/hi';

const StickyTopBar = ({ filters, updateFilter, onDetectLocation }) => {
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilter('search', localSearch);
  };

  const clearSearch = () => {
    setLocalSearch('');
    updateFilter('search', '');
  };

  return (
    <div className="flex items-center gap-2 w-full">
      {/* Location Input */}
      <div className="flex-1 flex items-center bg-slate-100 rounded-xl px-2 md:px-3 border border-transparent focus-within:border-[#45B1A8] focus-within:bg-white transition-all h-11">
        <HiLocationMarker className="w-4 h-4 md:w-5 md:h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="City..."
          value={filters.city || ''}
          onChange={(e) => updateFilter('city', e.target.value)}
          className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-xs md:text-sm font-medium w-full py-2 px-1 md:px-2 text-slate-900 placeholder-slate-400 h-full"
        />
        <button
          onClick={onDetectLocation}
          className="p-1 hover:text-[#45B1A8] text-slate-400 transition-colors"
          title="Use current location"
        >
          <HiLocationMarker className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="flex-[2] flex items-center bg-slate-100 rounded-xl px-2 md:px-3 border border-transparent focus-within:border-[#45B1A8] focus-within:bg-white transition-all h-11">
        <HiSearch className="w-4 h-4 md:w-5 md:h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-xs md:text-sm font-medium w-full py-2 px-1 md:px-2 text-slate-900 placeholder-slate-400 h-full"
        />
        {localSearch && (
          <button type="button" onClick={clearSearch} className="p-0.5 hover:text-[#45B1A8] text-slate-400">
            <HiX className="w-3.5 h-3.5" />
          </button>
        )}
      </form>
    </div>
  );
};

export default StickyTopBar;
