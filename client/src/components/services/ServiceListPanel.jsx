import { motion, AnimatePresence } from 'framer-motion';
import ServiceCard from './ServiceCard';
import ServiceCardSkeleton from './ServiceCardSkeleton';
import { HiOutlineSearch, HiOutlineLocationMarker } from 'react-icons/hi';

const ServiceListPanel = ({
  services,
  loading,
  viewMode,
  hoveredServiceId,
  onHover,
  onClearFilters,
  locationDenied
}) => {
  if (loading) {
    return (
      <div className={`grid gap-4 ${viewMode === 'map' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <ServiceCardSkeleton key={i} />)}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <HiOutlineSearch className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No services found</h3>
        <p className="text-slate-500 text-sm max-w-xs mx-auto mb-8">
          We couldn't find any services matching your current filters. Try adjusting your search or location.
        </p>
        <button
          onClick={onClearFilters}
          className="px-6 py-2.5 bg-[#45B1A8] text-white font-bold rounded-xl hover:bg-[#3a9990] transition-all shadow-md hover:shadow-lg"
        >
          Clear All Filters
        </button>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${viewMode === 'map' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
      <AnimatePresence mode="popLayout">
        {services.map((service) => (
          <ServiceCard
            key={service._id}
            service={service}
            isHighlighted={hoveredServiceId === service._id}
            onHover={onHover}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ServiceListPanel;
