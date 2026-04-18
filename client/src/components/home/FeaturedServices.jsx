import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { HiStar, HiOutlineLocationMarker, HiArrowRight } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const MOCK_SERVICES = [
  {
    _id: 's1',
    title: 'Expert Home Deep Cleaning',
    providerName: 'SparkleClean Pro',
    category: 'cleaning',
    rating: 4.9,
    reviews: 128,
    location: 'Downtown Area',
    price: 1499,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80'
  },
  {
    _id: 's2',
    title: 'Complete AC Service & Gas Top-up',
    providerName: 'CoolBreeze Technicians',
    category: 'repair',
    rating: 4.8,
    reviews: 84,
    location: 'Westside Sector',
    price: 599,
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80'
  },
  {
    _id: 's3',
    title: 'Premium Beauty & Spa Package',
    providerName: 'Glow Up Salon',
    category: 'beauty',
    rating: 4.95,
    reviews: 215,
    location: 'North Hills',
    price: 2499,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80'
  },
  {
    _id: 's4',
    title: 'Professional Plumbing Repairs',
    providerName: 'QuickFix Plumbers',
    category: 'plumbing',
    rating: 4.7,
    reviews: 312,
    location: 'Central Metro',
    price: 299,
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80'
  }
];

const itemVars = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const FeaturedServices = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleBook = (id) => {
    if (!isAuthenticated) {
      toast('Please login to view details and book', { icon: '🔒' });
      return navigate('/login');
    }
    navigate(`/services/${id}`);
  };

  return (
    <div className="py-24 bg-[#F5FDFD] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              className="text-3xl md:text-4xl font-extrabold text-[#1A2B2A] mb-4"
            >
              Featured Services
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: 0.1 }}
              className="text-[#4A5568] text-lg"
            >
              Highly-rated professionals ready to help you with your daily tasks.
            </motion.p>
          </div>
          <Link to="/services" className="inline-flex items-center text-[#45B1A8] font-bold hover:text-[#3a9990] transition-colors whitespace-nowrap">
            View All Services <HiArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {MOCK_SERVICES.map((service) => (
            <motion.div 
              variants={itemVars}
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              key={service._id} 
              className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-shadow cursor-pointer flex flex-col"
              onClick={() => handleBook(service._id)}
            >
              {/* Image Cover */}
              <div className="h-48 w-full overflow-hidden relative">
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#1A2B2A] uppercase tracking-wider">
                  {service.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-[#1A2B2A] leading-tight line-clamp-2 group-hover:text-[#45B1A8] transition-colors">
                    {service.title}
                  </h3>
                </div>

                <div className="flex items-center text-sm text-[#4A5568] mb-4">
                  <span className="font-semibold text-gray-900">{service.providerName}</span>
                  <span className="mx-2">•</span>
                  <div className="flex items-center">
                    <HiStar className="w-4 h-4 text-[#F2994A] mr-1" />
                    <span className="font-bold text-[#1A2B2A]">{service.rating}</span>
                    <span className="text-gray-400 ml-1">({service.reviews})</span>
                  </div>
                </div>

                {/* Footer Section inside card */}
                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Starts from</span>
                    <span className="text-lg font-black text-[#1A2B2A]">₹{service.price}</span>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-full bg-[#E0F5F3] text-[#45B1A8] flex items-center justify-center group-hover:bg-[#45B1A8] group-hover:text-white transition-colors"
                  >
                    <HiArrowRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
      </div>
    </div>
  );
};

export default FeaturedServices;
