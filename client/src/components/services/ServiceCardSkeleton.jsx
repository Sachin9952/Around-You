const ServiceCardSkeleton = ({ variant = 'compact' }) => {
  const isFeatured = variant === 'featured';

  return (
    <div className="bg-white rounded-2xl border border-slate-50 shadow-sm overflow-hidden animate-pulse flex flex-col h-full">
      {/* 1. Image Placeholder */}
      <div className={`relative ${isFeatured ? 'h-48 sm:h-52' : 'h-40 sm:h-44'} w-full bg-slate-100 shrink-0`}>
        <div className="absolute top-3 left-3 h-5 w-16 bg-slate-200/50 rounded-md"></div>
        <div className="absolute top-3 right-3 h-8 w-8 bg-slate-200/50 rounded-full"></div>
      </div>

      {/* 2. Content Placeholder */}
      <div className="p-5 flex flex-col flex-1 space-y-3.5">
        {/* Title & Provider */}
        <div className="space-y-2">
          <div className="h-5 w-3/4 bg-slate-100 rounded"></div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-slate-100"></div>
            <div className="h-3 w-24 bg-slate-50 rounded"></div>
          </div>
        </div>

        {/* Stats Placeholder */}
        <div className="h-10 w-full bg-slate-50/50 rounded-xl border border-slate-100/30"></div>

        {/* 3. Footer Placeholder */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="h-7 w-16 bg-slate-100 rounded"></div>
          <div className="h-10 w-28 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCardSkeleton;
