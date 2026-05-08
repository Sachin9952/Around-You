import { Link } from 'react-router-dom';
import { HiMail, HiPhone, HiLocationMarker, HiHeart } from 'react-icons/hi';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { motion } from 'motion/react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    explore: [
      { name: 'About Us', path: '/about' },
      { name: 'All Services', path: '/services' },
      { name: 'Nearby Services', path: '/services?v=map' },
      { name: 'List Your Service', path: '/become-provider' },
    ],
    legal: [
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Cancellation Policy', path: '/cancellation' },
      { name: 'Trust & Safety', path: '/trust' },
    ],
    support: [
      { name: 'Help Center', path: '/faq' },
      { name: 'Safety Tips', path: '/safety' },
      { name: 'Contact Us', path: '/contact' },
      { name: 'Report an Issue', path: '/report' },
    ]
  };

  const socialLinks = [
    { icon: FaFacebook, href: '#', label: 'Facebook' },
    { icon: FaTwitter, href: '#', label: 'Twitter' },
    { icon: FaInstagram, href: '#', label: 'Instagram' },
    { icon: FaLinkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-white border-t border-[#E0F5F3] pt-24 pb-12 font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-20">
          
          {/* Brand & Mission */}
          <div className="lg:col-span-4">
            <Link to="/" className="flex items-center gap-2 mb-8 group inline-block">
              <div className="flex items-center gap-2">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="bg-[#45B1A8] text-white px-2 py-1 flex items-center justify-center rounded-lg text-lg font-black leading-none tracking-tighter shadow-lg shadow-[#45B1A8]/20"
                >
                  AY
                </motion.div>
                <span className="font-black text-[#1A2B2A] text-2xl tracking-tight">Around-You</span>
              </div>
            </Link>
            <p className="text-[#4A5568] text-base leading-relaxed mb-10 max-w-sm font-medium">
              Your trusted marketplace for local services. We connect skilled professionals with people who need work done, making life easier for everyone.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social, i) => (
                <motion.a 
                  key={i}
                  href={social.href}
                  whileHover={{ y: -5, backgroundColor: '#45B1A8', color: '#fff', borderColor: '#45B1A8' }}
                  className="w-11 h-11 rounded-2xl border border-gray-100 flex items-center justify-center text-[#4A5568] bg-[#F5FDFD] transition-all duration-300 shadow-sm"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          <div className="lg:col-span-2">
            <h3 className="text-[#1A2B2A] font-black text-sm uppercase tracking-widest mb-8">Explore</h3>
            <ul className="space-y-4">
              {footerLinks.explore.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-[#4A5568] hover:text-[#45B1A8] text-sm font-bold transition-all duration-200 flex items-center gap-2 group">
                    <span className="w-0 h-0.5 bg-[#45B1A8] group-hover:w-3 transition-all duration-300" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-[#1A2B2A] font-black text-sm uppercase tracking-widest mb-8">Support</h3>
            <ul className="space-y-4">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-[#4A5568] hover:text-[#45B1A8] text-sm font-bold transition-all duration-200 flex items-center gap-2 group">
                    <span className="w-0 h-0.5 bg-[#45B1A8] group-hover:w-3 transition-all duration-300" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-4">
            <h3 className="text-[#1A2B2A] font-black text-sm uppercase tracking-widest mb-8">Contact Us</h3>
            <div className="bg-[#F5FDFD] p-6 rounded-[2rem] border border-[#E0F5F3] space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#45B1A8] shadow-sm shrink-0">
                  <HiLocationMarker className="w-5 h-5" />
                </div>
                <span className="text-[#4A5568] text-sm leading-relaxed font-bold">
                  123 Business Avenue, Tech Sector,<br />
                  Pune, Maharashtra 411001
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#45B1A8] shadow-sm shrink-0">
                  <HiPhone className="w-5 h-5" />
                </div>
                <a href="tel:+9118001234567" className="text-[#4A5568] hover:text-[#45B1A8] text-sm font-bold transition-colors">
                  1800-123-4567 (Toll Free)
                </a>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#45B1A8] shadow-sm shrink-0">
                  <HiMail className="w-5 h-5" />
                </div>
                <a href="mailto:support@around-you.com" className="text-[#4A5568] hover:text-[#45B1A8] text-sm font-bold transition-colors">
                  support@around-you.com
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#E0F5F3] pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-400 text-sm font-bold">
            &copy; {currentYear} Around-You Technologies. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-[#45B1A8] transition-colors">Privacy</Link>
            <Link to="/terms" className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-[#45B1A8] transition-colors">Terms</Link>
            <div className="flex items-center gap-2 ml-4">
              <span className="text-gray-300 text-xs font-bold uppercase tracking-widest">Made with</span>
              <HiHeart className="w-4 h-4 text-red-400 fill-red-400" />
              <span className="text-gray-300 text-xs font-bold uppercase tracking-widest">in India</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
