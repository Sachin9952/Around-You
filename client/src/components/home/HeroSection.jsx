import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { HiArrowRight } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

const HeroSection = () => {
  const { user } = useAuth();

  // Role-based secondary CTA config
  const getSecondaryCTA = () => {
    if (user?.role === 'provider') {
      return { label: 'Add New Service', path: '/provider/dashboard?tab=services&action=add' };
    }
    // Guests & customers
    return { label: 'List Your Service', path: '/become-provider' };
  };
  const secondaryCTA = getSecondaryCTA();

  return (
    <div className="relative overflow-hidden bg-[#F5FDFD] pt-8 lg:pt-24 pb-16 lg:pb-48">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-[#E0F5F3] rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
      <div className="absolute bottom-0 left-0 -ml-20 mb-20 w-[400px] h-[400px] bg-[#FEF0E6] rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-8 items-center">
          
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center lg:text-left max-w-2xl mx-auto lg:mx-0"
          >
            <h1 className="text-3xl md:text-5xl lg:text-[64px] leading-[1.1] lg:leading-tight font-extrabold text-[#1A2B2A] mb-4 tracking-tight">
              Book Trusted Local <span className="text-[#45B1A8] relative inline-block">
                Services
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#E0F5F3] -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span> Near You
            </h1>
            <p className="text-base lg:text-lg text-[#4A5568] mb-6 max-w-xl mx-auto lg:mx-0 font-medium">
              Find trusted nearby professionals for repair, cleaning, appliance services, and more.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link to="/services" className="flex items-center justify-center gap-2 bg-[#45B1A8] text-white px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-lg hover:bg-[#3a9990] shadow-lg shadow-[#45B1A8]/25 transition-all w-full">
                  Book a Service <HiArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link to={secondaryCTA.path} className="flex items-center justify-center gap-2 bg-white text-[#1A2B2A] border border-gray-200 px-6 py-2.5 sm:px-8 sm:py-4 rounded-2xl font-bold text-sm sm:text-lg hover:bg-gray-50 hover:shadow-md transition-all w-full">
                  {secondaryCTA.label}
                </Link>
              </motion.div>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-6 flex items-center justify-center lg:justify-start gap-4 text-[11px] sm:text-sm font-bold text-[#4A5568]">
               <div className="flex items-center gap-1.5">
                 <div className="w-4 h-4 rounded-full bg-[#E0F5F3] flex items-center justify-center text-[#45B1A8] text-[8px]">✓</div>
                 Verified Experts
               </div>
               <div className="flex items-center gap-1.5">
                 <div className="w-4 h-4 rounded-full bg-[#E0F5F3] flex items-center justify-center text-[#45B1A8] text-[8px]">✓</div>
                 Secure Payments
               </div>
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="relative lg:h-[600px] flex items-center justify-center mt-8 lg:mt-0"
          >
            <motion.div 
              animate={{ y: [0, -8, 0] }} 
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="relative z-10 w-full max-w-[420px] lg:max-w-[500px]"
            >
              {/* Premium abstract shape background container */}
              <div className="absolute inset-0 bg-[#45B1A8] rounded-[2rem] transform rotate-3 scale-105 opacity-10"></div>
              <div className="rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden shadow-2xl bg-white border-[4px] lg:border-[8px] border-white relative z-10 aspect-square lg:aspect-[4/5] max-h-[280px] lg:max-h-none">
                <img 
                  src="/hero-image.png" 
                  alt="Professional Service Provider" 
                  className="w-full h-full object-cover object-top"
                />
              </div>
              
              {/* Floating Badge */}
              <motion.div 
                animate={{ y: [0, 4, 0] }} 
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-4 -left-4 lg:-bottom-6 lg:-left-6 bg-white p-3 lg:p-4 rounded-2xl shadow-xl flex items-center gap-3 lg:gap-4 z-20 border border-gray-50"
              >
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#FEF0E6] rounded-full flex items-center justify-center text-xl lg:text-2xl">⭐</div>
                <div>
                  <p className="text-[10px] lg:text-sm text-gray-500 font-medium leading-tight">Rating</p>
                  <p className="text-base lg:text-lg font-black text-[#1A2B2A] leading-tight mt-0.5">4.9 / 5.0</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default HeroSection;
