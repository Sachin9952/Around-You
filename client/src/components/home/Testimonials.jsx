import { motion } from 'motion/react';
import { HiStar } from 'react-icons/hi';

const MOCK_REVIEWS = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    role: 'Homeowner',
    rating: 5,
    text: 'Absolutely incredible service. The plumber arrived on time, was extremely polite, and fixed the leak in under an hour. I felt completely safe and secure.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 2,
    name: 'Raj Patel',
    role: 'Restaurant Manager',
    rating: 5,
    text: 'Used Around-You for deep cleaning our commercial space. The thoroughness and professionalism was top-tier. Highly recommended for businesses!',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 3,
    name: 'Emily Davis',
    role: 'Local Resident',
    rating: 4.8,
    text: 'Great experience booking a salon service at home. Everything was hygienic and the UI makes it so easy to compare prices before booking.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80'
  }
];

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVars = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const Testimonials = () => {
  return (
    <div className="py-24 bg-[#F5FDFD] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            className="text-3xl md:text-4xl font-extrabold text-[#1A2B2A] mb-4"
          >
            What Our Customers Say
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: 0.1 }}
            className="text-[#4A5568] text-lg"
          >
            Don't just take our word for it — read reviews from people who use Around-You every day.
          </motion.p>
        </div>

        <motion.div 
          variants={containerVars}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="grid md:grid-cols-3 gap-6 lg:gap-8"
        >
          {MOCK_REVIEWS.map((review) => (
            <motion.div 
              variants={itemVars} 
              key={review.id}
              className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col"
            >
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <HiStar 
                    key={i} 
                    className={`w-5 h-5 flex-shrink-0 ${i < Math.floor(review.rating) ? 'text-[#F2994A]' : 'text-gray-200'}`} 
                  />
                ))}
              </div>
              <p className="text-[#4A5568] text-lg leading-relaxed flex-1 italic mb-8">
                "{review.text}"
              </p>
              <div className="flex items-center gap-4 mt-auto">
                <img src={review.image} alt={review.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#E0F5F3]" />
                <div>
                  <h4 className="font-bold text-[#1A2B2A]">{review.name}</h4>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{review.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
      </div>
    </div>
  );
};

export default Testimonials;
