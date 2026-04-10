import { Link } from 'react-router-dom';
import { HiOutlineChevronRight, HiArrowRight } from 'react-icons/hi';

const PromoBanner = ({ type = 'plus', userName = 'User' }) => {
  if (type === 'plus') {
    return (
      <Link to="/services" className="block px-4 py-3 mx-4 my-2 mt-4 bg-[#F3F1FF] rounded-xl hover:opacity-90 transition-opacity">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Mocking the 'plus' logo */}
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#6D5AE6] text-white font-bold text-xs">
              +
            </div>
            <span className="font-bold text-[#6D5AE6] text-sm">plus</span>
            <span className="text-gray-800 text-sm font-medium ml-1">Save 15% on every service</span>
          </div>
          <HiOutlineChevronRight className="w-5 h-5 text-gray-500" />
        </div>
      </Link>
    );
  }

  if (type === 'hero') {
    return (
      <div className="px-4 py-2 h-full">
        <div className="relative overflow-hidden bg-[#6D5AE6] rounded-2xl flex items-center justify-between h-full min-h-[128px] md:min-h-[160px] group cursor-pointer shadow-md">
          {/* Text Content */}
          <div className="p-5 z-10 w-2/3">
            <h2 className="text-white font-bold text-lg leading-tight mb-2">
              Let's make a package just for you, {userName}!
            </h2>
            <Link to="/services?category=salon" className="inline-flex items-center gap-1 text-white text-sm opacity-90 hover:opacity-100 transition-opacity font-medium">
              Salon for women <HiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {/* Image/Illustration */}
          {/* Using a placeholder Unsplash image that matches a salon/beauty vibe */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 md:w-1/2 h-full z-0">
             <div className="absolute inset-0 bg-gradient-to-r from-[#6D5AE6] to-transparent z-10 md:w-1/3"></div>
             <img 
               src="https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
               alt="Salon service" 
               className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
             />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'placeholder') {
    return (
      <div className="px-4 py-2 pb-0">
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl flex items-center justify-between h-[160px] border border-indigo-100 shadow-sm transition-all duration-300">
          <div className="p-5 w-3/4">
            <h2 className="text-gray-900 font-bold text-lg mb-1">
              Need Help with Appliances?
            </h2>
            <p className="text-sm text-gray-600 mb-2">Book expert mechanics under 60 mins.</p>
            <Link to="/services" className="inline-flex items-center text-indigo-600 text-sm font-semibold hover:text-indigo-700">
              Explore Services <HiArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PromoBanner;
