import { motion, AnimatePresence } from 'framer-motion';
import ServiceCard from './ServiceCard';
import ServiceCardSkeleton from './ServiceCardSkeleton';
import { HiOutlineSearch, HiOutlineLocationMarker } from 'react-icons/hi';

const ServiceListPanel = ({
  services,
  loading,
  viewMode,
  filters,
  hoveredServiceId,
  onHover,
  onClearFilters,
  locationDenied
}) => {
  const categoryName = filters?.category;
  
  if (loading) {
    return (
      <div className="flex flex-col">
        <div className="h-8 w-48 bg-slate-200 rounded-md animate-pulse mb-6" />
        <div className={`grid gap-6 ${viewMode === 'map' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <ServiceCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const renderHeading = () => {
    if (categoryName) {
      return (
        <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-6 capitalize">
          {categoryName} Services Near You
        </h2>
      );
    }
    return (
      <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-6">
        All Services Near You
      </h2>
    );
  };

  if (services.length === 0) {
    return (
      <div className="flex flex-col">
        {renderHeading()}
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <HiOutlineSearch className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {categoryName ? `No ${categoryName} services found` : 'No services found'}
          </h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto mb-8">
            {categoryName 
              ? `We couldn't find any services in the "${categoryName}" category nearby. Try clearing filters or searching for something else.`
              : "We couldn't find any services matching your current filters. Try adjusting your search or location."}
          </p>
          <button
            onClick={onClearFilters}
            className="px-6 py-2.5 bg-[#45B1A8] text-white font-bold rounded-xl hover:bg-[#3a9990] transition-all shadow-md hover:shadow-lg"
          >
            Clear All Filters
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col pt-6">
      {renderHeading()}
      <div className={`grid gap-6 ${viewMode === 'map' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
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
    </div>
  );
};

export default ServiceListPanel;
