import { Link } from 'react-router-dom';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-dark-900 border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* About Section */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-primary-500 text-white px-2 py-1 rounded text-xl font-bold leading-none tracking-tighter">
                AY
              </div>
              <span className="font-bold text-white text-2xl tracking-tight">Around-You</span>
            </div>
            <p className="text-dark-200 text-sm leading-relaxed mb-6">
              Around-You is your all-in-one platform for booking expert local services. From home repairs to personal care, we connect you with verified professionals instantly.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center text-dark-200 hover:text-white hover:bg-primary-600 transition-colors">
                <FaFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center text-dark-200 hover:text-white hover:bg-primary-600 transition-colors">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center text-dark-200 hover:text-white hover:bg-primary-600 transition-colors">
                <FaInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center text-dark-200 hover:text-white hover:bg-primary-600 transition-colors">
                <FaLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/about" className="text-dark-200 hover:text-primary-400 text-sm transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/services" className="text-dark-200 hover:text-primary-400 text-sm transition-colors">All Services</Link>
              </li>
              <li>
                <Link to="/provider/register" className="text-dark-200 hover:text-primary-400 text-sm transition-colors">Become a Provider</Link>
              </li>
              <li>
                <Link to="/faq" className="text-dark-200 hover:text-primary-400 text-sm transition-colors">FAQ & Support</Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Legal</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/terms" className="text-dark-200 hover:text-primary-400 text-sm transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link to="/privacy" className="text-dark-200 hover:text-primary-400 text-sm transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/cancellation" className="text-dark-200 hover:text-primary-400 text-sm transition-colors">Cancellation Policy</Link>
              </li>
              <li>
                <Link to="/trust" className="text-dark-200 hover:text-primary-400 text-sm transition-colors">Trust & Safety</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <HiOutlineLocationMarker className="w-5 h-5 text-primary-500 mt-0.5" />
                <span className="text-dark-200 text-sm leading-relaxed">
                  123 Business Avenue, Tech Sector,<br />
                  Pune, Maharashtra 411001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <HiOutlinePhone className="w-5 h-5 text-primary-500" />
                <a href="tel:+9118001234567" className="text-dark-200 hover:text-white text-sm transition-colors">
                  1800-123-4567 (Toll Free)
                </a>
              </li>
              <li className="flex items-center gap-3">
                <HiOutlineMail className="w-5 h-5 text-primary-500" />
                <a href="mailto:support@around-you.com" className="text-dark-200 hover:text-white text-sm transition-colors">
                  support@around-you.com
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-dark-300 text-sm">
            &copy; {new Date().getFullYear()} Around-You Technologies. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-dark-300 text-sm">Made with <span className="text-red-500">♥</span> in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
