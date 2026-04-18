import { motion } from 'motion/react';
import { HiOutlineSearch, HiOutlineCursorClick, HiOutlineCalendar, HiOutlineBadgeCheck } from 'react-icons/hi';

const steps = [
  { id: 1, title: 'Search Service', desc: 'Find the service you need from our extensive catalog.', icon: HiOutlineSearch },
  { id: 2, title: 'Choose Provider', desc: 'Compare profiles, reviews, and prices to pick the best.', icon: HiOutlineCursorClick },
  { id: 3, title: 'Book Instantly', desc: 'Secure your slot instantly through our platform.', icon: HiOutlineCalendar },
  { id: 4, title: 'Get it Done', desc: 'Relax while the expert handles your requested service.', icon: HiOutlineBadgeCheck },
];

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVars = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const HowItWorks = () => {
  return (
    <div className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            className="text-3xl md:text-4xl font-extrabold text-[#1A2B2A] mb-4"
          >
            How It Works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: 0.1 }}
            className="text-[#4A5568] text-lg"
          >
            Your seamless experience from booking to completion in four simple steps.
          </motion.p>
        </div>

        <motion.div 
          variants={containerVars}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="grid sm:grid-cols-2 justify-between lg:grid-cols-4 gap-12 lg:gap-8 relative"
        >
          {/* Connector Line (Desktop Only) */}
          <div className="hidden lg:block absolute top-[18%] left-[10%] right-[10%] h-[2px] bg-gray-100 -z-10"></div>

          {steps.map((step, idx) => (
            <motion.div variants={itemVars} key={step.id} className="relative flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-white border-4 border-[#F5FDFD] shadow-lg rounded-full flex items-center justify-center text-[#45B1A8] text-2xl font-bold mb-6 group-hover:-translate-y-2 group-hover:shadow-xl transition-all duration-300">
                <step.icon className="w-8 h-8" />
              </div>
              <div className="absolute top-0 right-1/2 -mr-8 w-6 h-6 bg-[#E0F5F3] text-[#45B1A8] text-xs font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {step.id}
              </div>
              <h3 className="text-xl font-bold text-[#1A2B2A] mb-2">{step.title}</h3>
              <p className="text-[#4A5568] px-4">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
        
      </div>
    </div>
  );
};

export default HowItWorks;
