import { Link } from 'react-router-dom';

const SectionHeader = ({ title, linkTo, linkText = 'See all' }) => {
  return (
    <div className="flex items-end justify-between mb-4 md:mb-8 mt-6 md:mt-12 px-4 shadow-none">
      <h2 className="text-gray-900 font-bold text-xl md:text-[32px] tracking-tight hover:text-black transition-colors">
        {title}
      </h2>
      
      {linkTo && (
        <Link 
          to={linkTo} 
          className="hidden sm:inline-flex items-center text-sm font-medium text-[#6D5AE6] border border-[#6D5AE6]/30 bg-white hover:bg-slate-50 px-4 py-1.5 rounded-lg transition-colors shadow-sm"
        >
          {linkText}
        </Link>
      )}
    </div>
  );
};

export default SectionHeader;
