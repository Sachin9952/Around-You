import { motion } from 'motion/react';
import { HiShieldCheck, HiOutlineClock, HiOutlineStar, HiOutlineLocationMarker, HiOutlineCreditCard, HiChatAlt2 } from 'react-icons/hi';

const benefits = [
  { icon: HiShieldCheck, title: 'Verified Providers', desc: 'Every professional is background checked and skill verified for your safety.', color: 'text-[#45B1A8]', bg: 'bg-[#E0F5F3]' },
  { icon: HiOutlineClock, title: 'Quick Booking', desc: 'Book a service in under 60 seconds with our streamlined app.', color: 'text-[#F2994A]', bg: 'bg-[#FEF0E6]' },
  { icon: HiOutlineStar, title: 'Real Reviews', desc: 'Read genuine reviews from real customers before making your choice.', color: 'text-[#6D5AE6]', bg: 'bg-[#F3F1FF]' },
  { icon: HiOutlineLocationMarker, title: 'Nearby Services', desc: 'Find experts available right in your neighborhood.', color: 'text-[#EB5757]', bg: 'bg-[#FEECEB]' },
  { icon: HiOutlineCreditCard, title: 'Secure Payments', desc: 'Pay securely using credit cards, UPI, or cash after service.', color: 'text-[#2D9CDB]', bg: 'bg-[#E6F3FF]' },
  { icon: HiChatAlt2, title: 'Live Chat Support', desc: 'Talk to your provider instantly or reach out to our support team.', color: 'text-[#10B981]', bg: 'bg-[#ECFDF5]' },
];

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVars = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const WhyChooseUs = () => {
  return (
    <div className="py-24 bg-white relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -ml-40 w-96 h-96 bg-[#F5FDFD] rounded-full blur-3xl opacity-60"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            className="text-3xl md:text-4xl font-extrabold text-[#1A2B2A] mb-4"
          >
            Why Choose Around-You?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: 0.1 }}
            className="text-[#4A5568] text-lg"
          >
            We take the hassle out of finding reliable local professionals, ensuring a seamless and secure experience every time.
          </motion.p>
        </div>

        <motion.div 
          variants={containerVars}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {benefits.map((item, index) => (
            <motion.div 
              variants={itemVars} 
              key={index}
              className="bg-white rounded-[1.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center mb-6`}>
                <item.icon className={`w-7 h-7 ${item.color}`} />
              </div>
              <h3 className="text-xl font-bold text-[#1A2B2A] mb-3">{item.title}</h3>
              <p className="text-[#4A5568] leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default WhyChooseUs;
