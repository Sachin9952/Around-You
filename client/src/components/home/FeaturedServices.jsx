import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowRight } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

import ServiceCard from '../services/ServiceCard';
import ServiceCardSkeleton from '../services/ServiceCardSkeleton';

const itemVars = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const FeaturedServices = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await API.get('/services', {
          params: { sort: 'rating', limit: 10, page: 1 }
        });
        const bookable = (data.data || []).filter(
          s => s.isBookable !== false && s.provider?.name
        );
        setServices(bookable.slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch featured services', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  if (loading) {
    return (
      <div className="py-24 bg-[#F5FDFD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-10 w-64 bg-gray-200 rounded-2xl mb-4 animate-pulse"></div>
          <div className="h-5 w-96 bg-gray-100 rounded-xl mb-12 animate-pulse"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <ServiceCardSkeleton key={i} variant="featured" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="py-24 bg-[#F5FDFD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A2B2A] mb-4">Featured Services</h2>
          <p className="text-[#4A5568] text-lg mb-8">
            No services available yet. Be the first to explore when they go live!
          </p>
          <Link
            to="/services"
            className="inline-flex items-center text-[#45B1A8] font-bold hover:text-[#3a9990] transition-colors"
          >
            Browse All Services <HiArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

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
          {services.map((service) => (
            <motion.div variants={itemVars} key={service._id} className="h-full">
              <ServiceCard service={service} variant="featured" />
            </motion.div>
          ))}
        </motion.div>
        
      </div>
    </div>
  );
};

export default FeaturedServices;
