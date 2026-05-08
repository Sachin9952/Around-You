import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  HiSearch, HiUserCircle, HiChatAlt2, HiCheck, 
  HiShieldCheck, HiLightningBolt, HiDeviceMobile, HiGlobe, HiStar, 
  HiArrowRight, HiSparkles, HiHeart, HiPlus, HiMinus, HiChartBar, HiClock
} from 'react-icons/hi';
import { 
  SiReact, SiTailwindcss, SiNodedotjs, SiExpress, 
  SiMongodb, SiSocketdotio, SiCloudinary 
} from 'react-icons/si';

import heroImg from '../assets/images/about-hero.png';
import providerImg from '../assets/images/provider-illustration.png';

const About = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const steps = [
    { icon: HiSearch, title: 'Search Service', desc: 'Browse through a wide range of local services tailored to your needs.' },
    { icon: HiUserCircle, title: 'Choose Provider', desc: 'Compare profiles, reviews, and pricing to find the perfect expert.' },
    { icon: HiChatAlt2, title: 'Chat & Book', desc: 'Communicate directly with providers and schedule your booking.' },
    { icon: HiCheck, title: 'Get Work Done', desc: 'Relax while our trusted professionals take care of your task.' }
  ];

  const stats = [
    { label: 'Services Available', value: '500+' },
    { label: 'Active Providers', value: '1,200+' },
    { label: 'Real-Time Chats', value: '10k+' },
    { label: 'Happy Users', value: '5k+' }
  ];

  const faqs = [
    { q: 'How do I book a service?', a: 'Simply search for the service you need, choose a provider based on their profile and reviews, and click on the "Book Now" button to schedule your service.' },
    { q: 'Are the providers verified?', a: 'Yes, all providers on Around-You undergo a thorough verification process to ensure they are trusted and expert in their fields.' },
    { q: 'Can I chat with the provider before booking?', a: 'Absolutely! Our real-time chat feature allows you to communicate with providers to discuss details before making a commitment.' },
    { q: 'What if I need to cancel my booking?', a: 'You can easily manage and cancel your bookings through your dashboard. Please refer to our cancellation policy for more details.' }
  ];

  const techStack = [
    { icon: SiReact, name: 'React', color: 'text-[#61DAFB]' },
    { icon: SiTailwindcss, name: 'Tailwind CSS', color: 'text-[#06B6D4]' },
    { icon: SiNodedotjs, name: 'Node.js', color: 'text-[#339933]' },
    { icon: SiExpress, name: 'Express.js', color: 'text-[#000000]' },
    { icon: SiMongodb, name: 'MongoDB', color: 'text-[#47A248]' },
    { icon: SiSocketdotio, name: 'Socket.IO', color: 'text-[#010101]' },
    { icon: SiCloudinary, name: 'Cloudinary', color: 'text-[#3448C5]' }
  ];

  return (
    <div className="bg-[#F5FDFD] min-h-screen overflow-x-hidden font-sans">
      
      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#45B1A8]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#45B1A8]/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
              className="flex-1 text-center lg:text-left"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.span 
                className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-[#45B1A8] uppercase bg-[#45B1A8]/10 rounded-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Welcome to the Future of Local Services
              </motion.span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-[#1A2B2A] leading-[1.1] mb-8">
                Connecting Users with <span className="text-[#45B1A8]">Trusted</span> Local Service Providers
              </h1>
              <p className="text-lg md:text-xl text-[#4A5568] font-medium leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0">
                Around-You is your all-in-one marketplace for discovering, chatting, and booking expert local professionals right in your neighborhood.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link 
                  to="/services" 
                  className="w-full sm:w-auto px-8 py-4 bg-[#45B1A8] text-white font-bold rounded-2xl shadow-xl shadow-[#45B1A8]/20 hover:bg-[#3a9990] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  Browse Services
                </Link>
                <Link 
                  to="/become-provider" 
                  className="w-full sm:w-auto px-8 py-4 bg-white text-[#1A2B2A] font-bold rounded-2xl border border-[#E0F5F3] hover:bg-[#F5FDFD] transition-all duration-300"
                >
                  Become a Provider
                </Link>
              </div>
            </motion.div>

            <motion.div 
              className="flex-1 relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <motion.div 
                className="relative z-10"
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <img 
                  src={heroImg} 
                  alt="Around-You Hero" 
                  className="w-full h-auto drop-shadow-[0_35px_35px_rgba(69,177,168,0.2)]"
                />
              </motion.div>
              {/* Decorative circles */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-[#45B1A8]/10 rounded-full -z-10" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border border-[#45B1A8]/5 rounded-full -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── WHAT IS AROUND-YOU ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeInUp}>
              <h2 className="text-4xl font-black text-[#1A2B2A] mb-6">What is Around-You?</h2>
              <p className="text-[#4A5568] text-lg leading-relaxed mb-8">
                Around-You is a revolutionary platform designed to bridge the gap between skilled local professionals and people who need their services. We believe in empowering communities by making expert help accessible with just a few clicks.
              </p>
              <p className="text-[#4A5568] text-lg leading-relaxed">
                Whether you're looking for a plumber, an electrician, or a personal tutor, Around-You provides a secure and intuitive interface to find the best talent nearby, complete with real-time communication and transparent booking.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { icon: HiGlobe, title: 'Nearby Services', desc: 'Find experts in your immediate area.' },
                { icon: HiChatAlt2, title: 'Real-Time Chat', desc: 'Talk directly with providers.' },
                { icon: HiShieldCheck, title: 'Trusted Providers', desc: 'Verified and rated professionals.' },
                { icon: HiLightningBolt, title: 'Fast Booking', desc: 'Schedule services in seconds.' }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  className="p-6 bg-[#F5FDFD] rounded-[2rem] border border-[#E0F5F3] hover:shadow-xl hover:shadow-[#45B1A8]/5 transition-all duration-300 group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#45B1A8] mb-4 shadow-sm group-hover:bg-[#45B1A8] group-hover:text-white transition-colors duration-300">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1A2B2A] mb-2">{feature.title}</h3>
                  <p className="text-sm text-[#4A5568] font-medium leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-24 bg-[#F5FDFD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeInUp} className="mb-16">
            <h2 className="text-4xl font-black text-[#1A2B2A] mb-4">How It Works</h2>
            <p className="text-[#4A5568] font-medium">Getting the expert help you need is as easy as 1-2-3-4</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 border-t-2 border-dashed border-[#45B1A8]/20 -translate-y-1/2 z-0" />
            
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                className="relative z-10 bg-white p-8 rounded-[2.5rem] border border-[#E0F5F3] shadow-sm hover:shadow-md transition-shadow group"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="w-16 h-16 bg-[#45B1A8] text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#45B1A8]/20 group-hover:scale-110 transition-transform">
                  <step.icon className="w-8 h-8" />
                </div>
                <div className="absolute top-6 right-6 w-8 h-8 bg-[#F5FDFD] border border-[#E0F5F3] rounded-full flex items-center justify-center text-xs font-black text-[#45B1A8]">
                  0{i + 1}
                </div>
                <h3 className="text-xl font-bold text-[#1A2B2A] mb-3">{step.title}</h3>
                <p className="text-sm text-[#4A5568] font-medium leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY CHOOSE US ─── */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-[#1A2B2A] mb-4">Why Choose Us?</h2>
            <p className="text-[#4A5568] font-medium">The most trusted local service marketplace</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: HiGlobe, title: 'Location-based discovery', desc: 'Intelligent search that prioritizes experts closest to your location for faster arrivals.' },
              { icon: HiChatAlt2, title: 'Instant communication', desc: 'Secure real-time chat with file sharing to discuss your needs clearly before booking.' },
              { icon: HiClock, title: 'Smooth booking experience', desc: 'Schedule services at your convenience with a streamlined and intuitive interface.' },
              { icon: HiDeviceMobile, title: 'Responsive modern UI', desc: 'A clean, fast, and accessible design that works perfectly on any device you use.' },
              { icon: HiShieldCheck, title: 'Secure experience', desc: 'Verified professionals and secure transactions for total peace of mind every time.' },
              { icon: HiStar, title: 'Quality Guaranteed', desc: 'High standards and real user reviews to ensure you always get the best service.' }
            ].map((item, i) => (
              <motion.div 
                key={i}
                className="relative overflow-hidden p-8 bg-white rounded-[2rem] border border-[#E0F5F3] hover:border-[#45B1A8]/30 transition-all duration-500 group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                {/* Glassmorphism effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#45B1A8]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-[#F5FDFD] rounded-2xl flex items-center justify-center text-[#45B1A8] mb-6 group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1A2B2A] mb-3">{item.title}</h3>
                  <p className="text-[#4A5568] text-sm font-medium leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BECOME A PROVIDER ─── */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="bg-gradient-to-r from-[#1A2B2A] to-[#2D4543] rounded-[3rem] overflow-hidden relative"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #45B1A8 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            
            <div className="px-8 py-16 md:p-16 lg:p-20 relative z-10 flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                  Turn Your Skills Into <span className="text-[#45B1A8]">Opportunities</span>
                </h2>
                <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto lg:mx-0">
                  Join hundreds of expert providers growing their business on Around-You. Reach more customers, manage bookings easily, and get paid securely.
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-white/80 font-bold text-sm uppercase tracking-widest">
                  <div className="flex items-center gap-2"><HiCheck className="text-[#45B1A8]" /> Flexible Hours</div>
                  <div className="flex items-center gap-2"><HiCheck className="text-[#45B1A8]" /> Secure Payments</div>
                  <div className="flex items-center gap-2"><HiCheck className="text-[#45B1A8]" /> Growing Audience</div>
                </div>
              </div>
              <div className="flex-1">
                <img 
                  src={providerImg} 
                  alt="Service Provider" 
                  className="w-full max-w-md mx-auto drop-shadow-2xl"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── TECH STACK SHOWCASE ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeInUp} className="mb-16">
            <h2 className="text-4xl font-black text-[#1A2B2A] mb-4">Tech Stack</h2>
            <p className="text-[#4A5568] font-medium">Built with the most modern and scalable technologies</p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-6">
            {techStack.map((tech, i) => (
              <motion.div 
                key={i}
                className="flex flex-col items-center gap-3 px-8 py-6 bg-white border border-[#E0F5F3] rounded-3xl hover:border-[#45B1A8]/40 hover:shadow-lg transition-all duration-300 group"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <tech.icon className={`w-12 h-12 ${tech.color} transition-transform duration-300 group-hover:scale-110`} />
                <span className="text-sm font-bold text-[#1A2B2A]">{tech.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MISSION / VISION ─── */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#45B1A8]/5 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div {...fadeInUp}>
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl border border-[#E0F5F3]">
              <HiSparkles className="w-10 h-10 text-[#45B1A8]" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-[#1A2B2A] mb-8 leading-tight">
              Our Mission is to <span className="text-[#45B1A8]">Empower</span> Local Communities
            </h2>
            <p className="text-xl text-[#4A5568] font-medium leading-relaxed">
              "We believe that everyone should have access to reliable local help, and every skilled professional should have the opportunity to thrive. Our vision is to become the most trusted platform for local services globally, starting right here with you."
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── STATS SECTION ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                className="text-center p-8 bg-[#F5FDFD] rounded-[2.5rem] border border-[#E0F5F3]"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <h4 className="text-4xl md:text-5xl font-black text-[#45B1A8] mb-2">{stat.value}</h4>
                <p className="text-sm font-bold text-[#4A5568] uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ SECTION ─── */}
      <section className="py-24 bg-[#F5FDFD]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-[#1A2B2A] mb-4">Common Questions</h2>
            <p className="text-[#4A5568] font-medium">Everything you need to know about Around-You</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div 
                key={i}
                className="bg-white rounded-3xl border border-[#E0F5F3] overflow-hidden transition-all duration-300"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <button 
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-bold text-[#1A2B2A] pr-4">{faq.q}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${openFaq === i ? 'bg-[#45B1A8] text-white rotate-180' : 'bg-[#F5FDFD] text-[#45B1A8]'}`}>
                    {openFaq === i ? <HiMinus className="w-4 h-4" /> : <HiPlus className="w-4 h-4" />}
                  </div>
                </button>
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 pt-0 text-sm font-medium text-[#4A5568] leading-relaxed border-t border-[#F5FDFD]">
                    {faq.a}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA SECTION ─── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            className="relative p-12 md:p-20 rounded-[3.5rem] bg-gradient-to-br from-[#45B1A8] to-[#2D4543] overflow-hidden text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            {/* Blur glow effects */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#45B1A8]/30 rounded-full blur-[80px] translate-x-1/2 translate-y-1/2" />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-8">
                Ready to Experience Better <span className="text-[#45B1A8]">Local</span> Services?
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  to="/services" 
                  className="w-full sm:w-auto px-10 py-5 bg-[#45B1A8] text-white font-black rounded-2xl shadow-xl hover:bg-[#3a9990] transition-all duration-300 transform hover:-translate-y-1"
                >
                  Start Browsing
                </Link>
                <Link 
                  to="/become-provider" 
                  className="w-full sm:w-auto px-10 py-5 bg-white text-[#1A2B2A] font-black rounded-2xl hover:bg-[#F5FDFD] transition-all duration-300"
                >
                  Join as a Provider
                </Link>
              </div>
              <div className="mt-12 flex items-center justify-center gap-2 text-white/60 font-medium text-sm">
                <HiHeart className="w-4 h-4 text-red-400" /> Proudly made for the community
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default About;
