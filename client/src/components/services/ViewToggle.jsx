import { motion } from 'framer-motion';
import { HiViewList, HiMap } from 'react-icons/hi';

const ViewToggle = ({ viewMode, onViewChange }) => {
  return (
    <div className="flex bg-slate-100 p-1 rounded-xl">
      <button
        onClick={() => onViewChange('list')}
        className={`relative flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-colors z-10 ${
          viewMode === 'list' ? 'text-white' : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        {viewMode === 'list' && (
          <motion.div
            layoutId="active-toggle"
            className="absolute inset-0 bg-[#45B1A8] rounded-lg -z-10"
            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
          />
        )}
        <HiViewList className="w-4 h-4" />
        <span>List</span>
      </button>

      <button
        onClick={() => onViewChange('map')}
        className={`relative flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-colors z-10 ${
          viewMode === 'map' ? 'text-white' : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        {viewMode === 'map' && (
          <motion.div
            layoutId="active-toggle"
            className="absolute inset-0 bg-[#45B1A8] rounded-lg -z-10"
            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
          />
        )}
        <HiMap className="w-4 h-4" />
        <span>Map</span>
      </button>
    </div>
  );
};

export default ViewToggle;
