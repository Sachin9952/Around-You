import { Link } from 'react-router-dom';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-[#E0F5F3] pt-20 pb-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6 inline-block">
              <div className="flex items-center gap-2">
                <div className="bg-[#45B1A8] text-white px-2 py-1 flex items-center justify-center rounded-lg text-lg font-black leading-none tracking-tighter">
                  AY
                </div>
                <span className="font-bold text-[#1A2B2A] text-2xl tracking-tight">Around-You</span>
              </div>
            </Link>
            <p className="text-[#4A5568] text-sm leading-relaxed mb-8 pr-4">
              Your all-in-one platform for booking expert local services. From home repairs to personal care, we connect you with verified professionals instantly.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-[#4A5568] hover:text-white hover:bg-[#45B1A8] transition-all hover:border-[#45B1A8]">
                <FaFacebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-[#4A5568] hover:text-white hover:bg-[#45B1A8] transition-all hover:border-[#45B1A8]">
                <FaTwitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-[#4A5568] hover:text-white hover:bg-[#45B1A8] transition-all hover:border-[#45B1A8]">
                <FaInstagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-[#4A5568] hover:text-white hover:bg-[#45B1A8] transition-all hover:border-[#45B1A8]">
                <FaLinkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[#1A2B2A] font-extrabold text-lg mb-6">Explore</h3>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-[#4A5568] hover:text-[#45B1A8] text-sm font-medium transition-colors">About Us</Link></li>
              <li><Link to="/services" className="text-[#4A5568] hover:text-[#45B1A8] text-sm font-medium transition-colors">All Services</Link></li>
              <li><Link to="/provider/register" className="text-[#4A5568] hover:text-[#45B1A8] text-sm font-medium transition-colors">Become a Provider</Link></li>
              <li><Link to="/faq" className="text-[#4A5568] hover:text-[#45B1A8] text-sm font-medium transition-colors">FAQ & Support</Link></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-[#1A2B2A] font-extrabold text-lg mb-6">Legal</h3>
            <ul className="space-y-4">
              <li><Link to="/terms" className="text-[#4A5568] hover:text-[#45B1A8] text-sm font-medium transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-[#4A5568] hover:text-[#45B1A8] text-sm font-medium transition-colors">Privacy Policy</Link></li>
              <li><Link to="/cancellation" className="text-[#4A5568] hover:text-[#45B1A8] text-sm font-medium transition-colors">Cancellation Policy</Link></li>
              <li><Link to="/trust" className="text-[#4A5568] hover:text-[#45B1A8] text-sm font-medium transition-colors">Trust & Safety</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-[#1A2B2A] font-extrabold text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <HiOutlineLocationMarker className="w-5 h-5 text-[#45B1A8] mt-0.5 flex-shrink-0" />
                <span className="text-[#4A5568] text-sm leading-relaxed font-medium">
                  123 Business Avenue, Tech Sector,<br />
                  Pune, Maharashtra 411001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <HiOutlinePhone className="w-5 h-5 text-[#45B1A8] flex-shrink-0" />
                <a href="tel:+9118001234567" className="text-[#4A5568] hover:text-[#45B1A8] text-sm font-medium transition-colors">
                  1800-123-4567 (Toll Free)
                </a>
              </li>
              <li className="flex items-center gap-3">
                <HiOutlineMail className="w-5 h-5 text-[#45B1A8] flex-shrink-0" />
                <a href="mailto:support@around-you.com" className="text-[#4A5568] hover:text-[#45B1A8] text-sm font-medium transition-colors">
                  support@around-you.com
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#E0F5F3] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm font-medium">
            &copy; {new Date().getFullYear()} Around-You Technologies. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm font-medium">Made with <span className="text-[#EB5757]">♥</span> in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
