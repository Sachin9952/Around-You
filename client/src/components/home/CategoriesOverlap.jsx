import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  HiBolt, HiWrenchScrewdriver, HiSparkles,
  HiPaintBrush, HiUser, HiOutlineBeaker
} from 'react-icons/hi2';

const categories = [
  { name: 'Electrician', slug: 'electrician', icon: HiBolt, bg: 'bg-[#FEF0E6]', text: 'text-[#F2994A]' },
  { name: 'Plumbing', slug: 'plumber', icon: HiWrenchScrewdriver, bg: 'bg-[#E0F5F3]', text: 'text-[#45B1A8]' },
  { name: 'Cleaning', slug: 'cleaner', icon: HiSparkles, bg: 'bg-[#F3F1FF]', text: 'text-[#6D5AE6]' },
  { name: 'AC Repair', slug: 'mechanic', icon: HiWrenchScrewdriver, bg: 'bg-[#E6F3FF]', text: 'text-[#2D9CDB]' },
  { name: 'Carpenter', slug: 'carpenter', icon: HiWrenchScrewdriver, bg: 'bg-[#F5FDFD]', text: 'text-[#4A5568]' },
  { name: 'Appliance Repair', slug: 'mechanic', icon: HiOutlineBeaker, bg: 'bg-[#FEECEB]', text: 'text-[#EB5757]' },
  { name: 'Salon at Home', slug: 'salon', icon: HiUser, bg: 'bg-[#FDF2F8]', text: 'text-[#EC4899]' },
  { name: 'Painting', slug: 'painter', icon: HiPaintBrush, bg: 'bg-[#ECFDF5]', text: 'text-[#10B981]' },
];

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.3 } }
};

const itemVars = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const CategoriesOverlap = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
      <div className="-mt-16 lg:-mt-24 bg-white rounded-[2rem] shadow-xl shadow-black/5 p-6 md:p-10 border border-gray-100">
        <div className="flex justify-between items-end mb-8 pl-2">
          <div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#1A2B2A]">Explore Categories</h2>
            <p className="text-[#4A5568] text-sm mt-1">Select a category to find the best local professionals.</p>
          </div>
          <Link to="/services" className="hidden sm:block text-[#45B1A8] font-bold text-sm hover:text-[#3a9990] transition-colors">
            See all →
          </Link>
        </div>

        <motion.div 
          variants={containerVars}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-20px" }}
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-6"
        >
          {categories.map((cat) => (
            <motion.div variants={itemVars} key={cat.slug + cat.name}>
              <Link 
                to={`/services?category=${cat.slug}`}
                className="flex flex-col items-center group cursor-pointer"
              >
                <motion.div 
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-16 h-16 md:w-20 md:h-20 mb-4 rounded-full ${cat.bg} flex items-center justify-center transition-all duration-300 shadow-sm border border-white group-hover:shadow-md`}
                >
                  <cat.icon className={`w-7 h-7 md:w-9 md:h-9 ${cat.text}`} />
                </motion.div>
                <span className="text-sm font-bold text-[#1A2B2A] text-center leading-tight group-hover:text-[#45B1A8] transition-colors">
                  {cat.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default CategoriesOverlap;
