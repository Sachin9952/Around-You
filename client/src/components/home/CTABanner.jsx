import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { HiArrowRight } from 'react-icons/hi';

const CTABanner = () => {
  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto rounded-[2.5rem] bg-[#45B1A8] relative overflow-hidden shadow-2xl shadow-[#45B1A8]/20"
      >
        {/* Background shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E0F5F3] opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#1A2B2A] opacity-10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>

        <div className="relative z-10 px-6 py-16 sm:px-12 sm:py-20 text-center flex flex-col items-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-6 max-w-2xl">
            Ready to experience seamless local services?
          </h2>
          <p className="text-[#E0F5F3] text-lg mb-10 max-w-xl">
            Join thousands of happy customers who trust Around-You for their everyday needs. Get started in minutes.
          </p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link 
              to="/services" 
              className="inline-flex items-center gap-2 bg-white text-[#1A2B2A] px-10 py-5 rounded-full font-black text-lg hover:shadow-lg hover:bg-gray-50 transition-all"
            >
              Get Started Now <HiArrowRight className="w-5 h-5 text-[#45B1A8]" />
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default CTABanner;
