import { useState, useRef, useEffect } from 'react';
import { HiChevronDown } from 'react-icons/hi';
import ViewToggle from './ViewToggle';

const categories = ['plumber', 'electrician', 'cleaner', 'painter', 'carpenter', 'mechanic', 'tutor', 'other'];

const SecondaryFilters = ({ filters, updateFilter, viewMode, onViewChange, resultCount, loading, id = 'default' }) => {
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 w-full">
      {/* Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-1 mask-fade-right">
        <button
          onClick={() => updateFilter('category', '')}
          className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border ${
            !filters.category
              ? 'bg-[#45B1A8] text-white border-[#45B1A8] shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          All
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => updateFilter('category', filters.category === cat ? '' : cat)}
            className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border ${
              filters.category === cat
                ? 'bg-[#45B1A8] text-white border-[#45B1A8] shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Sort, View Toggle, Result Count */}
      <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
        
        {/* Sort Dropdown */}
        <div className="relative w-36 shrink-0" ref={sortRef}>
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] md:text-xs font-bold text-slate-700 hover:border-[#45B1A8] transition-colors h-8"
          >
            <span className="capitalize truncate">{filters.sort || 'Sort'}</span>
            <HiChevronDown className={`w-3.5 h-3.5 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showSortDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
              {['nearest', 'cheapest', 'top-rated'].map((option) => (
                <button
                  key={option}
                  onClick={() => { updateFilter('sort', option); setShowSortDropdown(false); }}
                  className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors capitalize ${
                    filters.sort === option ? 'text-[#45B1A8] bg-teal-50' : 'text-slate-600'
                  }`}
                >
                  {option.replace('-', ' ')}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Toggle */}
        <div className="shrink-0">
          <ViewToggle viewMode={viewMode} onViewChange={onViewChange} id={id} />
        </div>

        {/* Results Info */}
        <span className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden sm:inline-block">
          {loading ? 'Loading...' : `${resultCount} results`}
        </span>
      </div>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .mask-fade-right {
          mask-image: linear-gradient(to right, black 90%, transparent 100%);
        }
      `}</style>
    </div>
  );
};

export default SecondaryFilters;
