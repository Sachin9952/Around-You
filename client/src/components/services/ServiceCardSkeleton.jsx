const ServiceCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse">
      {/* Top Row */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-100"></div>
          <div className="h-4 w-16 bg-slate-100 rounded-full"></div>
        </div>
        <div className="w-5 h-5 bg-slate-100 rounded-full"></div>
      </div>

      {/* Title & Desc */}
      <div className="mb-4">
        <div className="h-5 w-3/4 bg-slate-100 rounded mb-2"></div>
        <div className="h-4 w-1/2 bg-slate-100 rounded mb-3"></div>
        <div className="h-4 w-full bg-slate-100 rounded"></div>
      </div>

      {/* Metadata */}
      <div className="flex gap-2 mb-6">
        <div className="h-5 w-12 bg-slate-100 rounded"></div>
        <div className="h-5 w-20 bg-slate-100 rounded"></div>
      </div>

      {/* Bottom Row */}
      <div className="flex justify-between items-center pt-3 border-t border-slate-100">
        <div className="h-6 w-16 bg-slate-100 rounded"></div>
        <div className="h-9 w-24 bg-slate-100 rounded-xl"></div>
      </div>
    </div>
  );
};

export default ServiceCardSkeleton;
