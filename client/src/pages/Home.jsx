import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRef, useState } from 'react';
import { HiArrowRight, HiArrowLeft } from 'react-icons/hi';

import { 
  HiWrenchScrewdriver, HiBolt, HiSparkles, HiPaintBrush, 
  HiUser, HiOutlineSparkles, HiScissors, HiOutlineUser, HiHeart 
} from 'react-icons/hi2';

import LocationSearchBar from '../components/home/LocationSearchBar';
import PromoBanner from '../components/home/PromoBanner';
import CategoryGrid from '../components/home/CategoryGrid';
import ServiceCardDetailed from '../components/home/ServiceCardDetailed';
import SectionHeader from '../components/home/SectionHeader';

// --- (Note: Keep the other imports and code outside the chunk as they were. This chunk handles the Carousel Component and fixes data array URLs)

const personalServices = [
  { name: 'Salon for Women', slug: 'salon', icon: HiUser, iconColor: 'text-purple-600' },
  { name: 'Spa for Women', slug: 'spa', icon: HiOutlineSparkles, iconColor: 'text-pink-500' },
  { name: 'Hair & Skin', slug: 'beauty', icon: HiScissors, iconColor: 'text-orange-500', isNew: true },
  { name: 'Salon for Men', slug: 'mens-salon', icon: HiOutlineUser, iconColor: 'text-blue-600' },
  { name: 'Massage for Men', slug: 'massage', icon: HiHeart, iconColor: 'text-rose-500' },
];

const homeServices = [
  { name: 'Electrical & Plumbing', slug: 'electrician', icon: HiBolt, iconColor: 'text-yellow-600' },
  { name: 'Cleaning & Pest', slug: 'cleaner', icon: HiSparkles, iconColor: 'text-emerald-500' },
  { name: 'Home Repairs', slug: 'carpenter', icon: HiWrenchScrewdriver, iconColor: 'text-gray-700' },
  { name: 'Home Painting', slug: 'painter', icon: HiPaintBrush, iconColor: 'text-blue-500', isNew: true },
  { name: 'Appliance Repair', slug: 'mechanic', icon: HiWrenchScrewdriver, iconColor: 'text-indigo-500' },
];

const applianceOriginalData = [
  {
    name: 'Foam-jet service (2 ACs)',
    slug: 'mechanic',
    tag: '2 ACs',
    isSafe: true,
    rating: '4.76',
    isInstant: true,
    price: '1,248',
    originalPrice: '1,298',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'AC repair',
    slug: 'mechanic',
    isSafe: false,
    rating: '4.74',
    isInstant: true,
    price: '299',
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Automatic top load machine check-up',
    slug: 'mechanic',
    isSafe: false,
    rating: '4.77',
    isInstant: false,
    price: '199',
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Semi-automatic machine check-up',
    slug: 'mechanic',
    isSafe: false,
    rating: '4.75',
    isInstant: false,
    price: '199',
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Water purifier check-up',
    slug: 'plumber',
    isSafe: false,
    rating: '4.78',
    isInstant: false,
    price: '299',
    originalPrice: null,
    image: '/water-purifier.jpg'
  }
];

const homeRepairData = [
  {
    name: 'Washbasin pipe repair',
    slug: 'plumber',
    isSafe: true,
    rating: '4.82',
    isInstant: true,
    price: '149',
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Wall art frame hanging',
    slug: 'carpenter',
    isSafe: false,
    rating: '4.70',
    isInstant: false,
    price: '249',
    originalPrice: '299',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Socket replacement',
    slug: 'electrician',
    isSafe: false,
    rating: '4.85',
    isInstant: true,
    price: '99',
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1517420879524-86d64ac2f339?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Ceiling fan repair',
    slug: 'electrician',
    isSafe: false,
    rating: '4.75',
    isInstant: false,
    price: '349',
    originalPrice: null,
    image: '/ceiling-fan-repair.jpg'
  }
];

// Carousel Row Component for rendering detailed card rows
const DetailedServiceCarousel = ({ title, data, linkTo }) => {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollLeftClick = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -600, behavior: 'smooth' });
    }
  };

  const scrollRightClick = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 600, behavior: 'smooth' });
    }
  };

  return (
    <div className="mb-20">
      <SectionHeader title={title} linkTo={linkTo} />
      <div className="relative group">
        
        {/* Left Arrow */}
        {showLeftArrow && (
          <div 
            onClick={scrollLeftClick}
            className="hidden sm:flex absolute left-0 top-[40%] -translate-y-1/2 ml-2 w-12 h-12 items-center justify-center bg-white shadow-lg shadow-black/10 rounded-full cursor-pointer hover:bg-gray-50 border border-gray-100 z-20 transition-all opacity-0 group-hover:opacity-100"
          >
            <HiArrowLeft className="w-5 h-5 text-gray-800" />
          </div>
        )}

        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto gap-4 px-4 pb-8 hide-scrollbar snap-x snap-mandatory scroll-smooth"
        >
          {data.map((item, idx) => (
            <div className="snap-start" key={idx}>
              <ServiceCardDetailed service={item} />
            </div>
          ))}
          {/* Faux trailing space to ensure last item can scroll fully into view */}
          <div className="w-8 shrink-0 sm:w-16"></div>
        </div>
        
        {/* Right Arrow */}
        {showRightArrow && (
          <div 
            onClick={scrollRightClick}
            className="hidden sm:flex absolute right-0 top-[40%] -translate-y-1/2 mr-2 w-12 h-12 items-center justify-center bg-white shadow-lg shadow-black/10 rounded-full cursor-pointer hover:bg-gray-50 border border-gray-100 z-20 transition-all opacity-0 group-hover:opacity-100"
          >
            <HiArrowRight className="w-5 h-5 text-gray-800" />
          </div>
        )}
      </div>
    </div>
  );
};


const Home = () => {
  const { user } = useAuth();

  return (
    <div className="bg-white min-h-screen">
      {/* 
        1. Location and Search Header 
        - Hide on desktop (md:) because Navbar now handles it on desktop.
      */}
      <div className="md:hidden">
        <LocationSearchBar />
      </div>

      <div className="max-w-[1240px] mx-auto pb-24 xl:px-8 pt-2">
        <div className="md:grid md:grid-cols-2 md:gap-6 md:mt-8 mb-6">
          <PromoBanner type="hero" userName={user ? user.name.split(' ')[0] : 'Guest'} />
          <div className="hidden md:flex flex-col gap-4">
            {/* Additional desktop banner to balance layout */}
            <PromoBanner type="placeholder" userName="Offers" />
            
            {/* New Minimal Offer Card added below the placeholder */}
            <div className="mx-4 md:mx-0 bg-gradient-to-r from-[#F3F1FF] to-[#FDFBFF] rounded-2xl p-5 shadow-sm border border-[#6D5AE6]/10 flex items-center justify-between transition-all hover:shadow-md">
              <div>
                <h3 className="text-gray-900 font-bold text-[15px] mb-0.5">Get 20% OFF</h3>
                <p className="text-gray-500 text-[13px] font-medium">On your first service booking</p>
              </div>
              <Link to="/services" className="text-[#6D5AE6] text-sm font-semibold hover:text-[#5a48d1] flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-[#6D5AE6]/10 shadow-sm transition-colors">
                Claim Offer <HiArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="md:hidden">
            <PromoBanner type="plus" />
        </div>

        <div className="h-px bg-gray-100 mx-4 my-6 block md:hidden" />

        {/* 2. Category Grids */}
        <div className="mb-8">
          <CategoryGrid title="Personal Services" items={personalServices} />
          <div className="h-4 bg-gray-50 my-2 md:hidden" />
          <CategoryGrid title="Home Services" items={homeServices} />
        </div>

        {/* 3. Original Provider CTA mapped to Top/Mid content for providers */}
        {!user || user.role !== 'provider' ? (
          <section className="px-4 py-8 mb-4">
            <div className="bg-gradient-to-r from-[#F3F1FF] to-white rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between border border-[#6D5AE6]/10 shadow-sm">
              <div className="text-center md:text-left mb-6 md:mb-0">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Are You a Service Provider?
                </h2>
                <p className="text-gray-600 text-sm md:text-base max-w-md">
                  Join thousands of professionals. Grow your business, manage bookings, and connect with customers.
                </p>
              </div>
              <Link
                to="/provider/register"
                className="inline-flex items-center justify-center gap-2 bg-[#6D5AE6] hover:bg-[#5a48d1] text-white px-8 py-4 rounded-xl font-bold transition-colors w-full md:w-auto shadow-md"
              >
                Register as Provider <HiArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </section>
        ) : null}

        {/* 4. Desktop Specific UI Layouts (Detailed Rows) */}
        <DetailedServiceCarousel 
          title="Appliance repair & check-ups" 
          data={applianceOriginalData} 
          linkTo="/services?category=mechanic" 
        />

        <DetailedServiceCarousel 
          title="Home repair & installation" 
          data={homeRepairData} 
          linkTo="/services?category=electrician" 
        />


        {/* Add custom style block to hide scrollbar for the horizontal scrolling areas */}
        <style dangerouslySetInnerHTML={{__html: `
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}} />
      </div>
    </div>
  );
};

export default Home;
