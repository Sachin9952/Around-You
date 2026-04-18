import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { HiArrowRight } from 'react-icons/hi';

const HeroSection = () => {
  return (
    <div className="relative overflow-hidden bg-[#F5FDFD] pt-12 lg:pt-24 pb-32 lg:pb-48">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-[#E0F5F3] rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
      <div className="absolute bottom-0 left-0 -ml-20 mb-20 w-[400px] h-[400px] bg-[#FEF0E6] rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center lg:text-left max-w-2xl mx-auto lg:mx-0"
          >
            <h1 className="text-4xl md:text-5xl lg:text-[64px] leading-tight font-extrabold text-[#1A2B2A] mb-6 tracking-tight">
              Book Trusted Local <span className="text-[#45B1A8] relative inline-block">
                Services
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#E0F5F3] -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span> Near You
            </h1>
            <p className="text-lg text-[#4A5568] mb-10 max-w-xl mx-auto lg:mx-0">
              Find verified professionals for home repair, cleaning, appliance service, and more — all around you. Fast, reliable, and secure.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link to="/services" className="flex items-center justify-center gap-2 bg-[#45B1A8] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#3a9990] shadow-lg shadow-[#45B1A8]/25 transition-all w-full">
                  Book a Service <HiArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link to="/provider/register" className="flex items-center justify-center gap-2 bg-white text-[#1A2B2A] border border-gray-200 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 hover:shadow-md transition-all w-full">
                  Become a Provider
                </Link>
              </motion.div>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm font-semibold text-[#4A5568]">
               <div className="flex items-center gap-2">
                 <div className="w-5 h-5 rounded-full bg-[#E0F5F3] flex items-center justify-center text-[#45B1A8] text-xs">✓</div>
                 Verified Experts
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-5 h-5 rounded-full bg-[#E0F5F3] flex items-center justify-center text-[#45B1A8] text-xs">✓</div>
                 Secure Payments
               </div>
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="relative lg:h-[600px] flex items-center justify-center sm:flex"
          >
            <motion.div 
              animate={{ y: [0, -8, 0] }} 
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="relative z-10 w-full max-w-[500px]"
            >
              {/* Premium abstract shape background container */}
              <div className="absolute inset-0 bg-[#45B1A8] rounded-[2rem] transform rotate-3 scale-105 opacity-10"></div>
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl bg-white border-[8px] border-white relative z-10 aspect-[4/5] sm:aspect-square lg:aspect-[4/5]">
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
                className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 z-20 border border-gray-50"
              >
                <div className="w-12 h-12 bg-[#FEF0E6] rounded-full flex items-center justify-center text-2xl">⭐</div>
                <div>
                  <p className="text-sm text-gray-500 font-medium leading-tight">Average Rating</p>
                  <p className="text-lg font-black text-[#1A2B2A] leading-tight mt-0.5">4.9 / 5.0</p>
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
