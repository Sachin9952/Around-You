import StickyTopBar from './StickyTopBar';
import SecondaryFilters from './SecondaryFilters';

const FiltersToolbar = ({
  filters,
  updateFilter,
  onDetectLocation,
  viewMode,
  onViewChange,
  resultCount,
  loading
}) => {
  return (
    <>
      {/* Desktop (md and above): Full toolbar is sticky */}
      <div className="hidden md:block sticky top-[81px] z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-2.5 flex flex-col gap-2.5">
          <StickyTopBar
            filters={filters}
            updateFilter={updateFilter}
            onDetectLocation={onDetectLocation}
          />
          <SecondaryFilters
            filters={filters}
            updateFilter={updateFilter}
            viewMode={viewMode}
            onViewChange={onViewChange}
            resultCount={resultCount}
            loading={loading}
            id="desktop"
          />
        </div>
      </div>

      {/* Mobile (below md): Split behavior */}
      <div className="md:hidden">
        {/* Sticky Section */}
        <div className="md:hidden sticky top-[81px] z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
          <div className="px-4 py-2.5">
            <StickyTopBar
              filters={filters}
              updateFilter={updateFilter}
              onDetectLocation={onDetectLocation}
            />
          </div>
        </div>

        {/* Scrollable Section */}
        <div className="md:hidden px-4 py-2">
          <SecondaryFilters
            filters={filters}
            updateFilter={updateFilter}
            viewMode={viewMode}
            onViewChange={onViewChange}
            resultCount={resultCount}
            loading={loading}
            id="mobile"
          />
        </div>
      </div>
    </>
  );
};

export default FiltersToolbar;
