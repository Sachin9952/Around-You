import { motion } from 'motion/react';
import HeroSection from '../components/home/HeroSection';
import CategoriesOverlap from '../components/home/CategoriesOverlap';
import WhyChooseUs from '../components/home/WhyChooseUs';
import FeaturedServices from '../components/home/FeaturedServices';
import HowItWorks from '../components/home/HowItWorks';
import Testimonials from '../components/home/Testimonials';
import CTABanner from '../components/home/CTABanner';

const Home = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="bg-[#F5FDFD] min-h-screen font-sans"
    >
      <HeroSection />
      <CategoriesOverlap />
      <WhyChooseUs />
      <FeaturedServices />
      <HowItWorks />
      <Testimonials />
      <CTABanner />
    </motion.div>
  );
};

export default Home;
