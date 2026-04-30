import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  HiMenu, HiX, HiUser, HiLogout, HiViewGrid,
  HiBell, HiCog, HiChatAlt2, HiOutlineShoppingCart, HiSupport
} from 'react-icons/hi';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
      navigate('/');
      setIsOpen(false);
      setIsProfileOpen(false);
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin': return '/admin/dashboard';
      case 'provider': return '/provider/dashboard';
      default: return '/dashboard';
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Categories', path: '/services?category=all' },
    { name: 'Providers', path: '/provider/register' },
    { name: 'About', path: '/about' }
  ];

  return (
    <nav className="bg-[#F5FDFD]/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo (Left) */}
          <Link to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <div className="flex items-center gap-2">
              <div className="bg-[#45B1A8] text-white px-2 py-1 rounded-lg text-lg font-black leading-none tracking-tighter">
                AY
              </div>
              <span className="font-bold text-[#1A2B2A] text-xl tracking-tight hidden sm:block">Around-You</span>
            </div>
          </Link>

          {/* Desktop Center Links */}
          <div className="hidden md:flex flex-1 items-center justify-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path || (link.path.includes('?') && location.search.includes('category=all'));
              return (
                <Link 
                  key={link.name} 
                  to={link.path}
                  className={`text-sm font-semibold transition-colors ${isActive ? 'text-[#45B1A8]' : 'text-[#4A5568] hover:text-[#45B1A8]'}`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Desktop Right Nav */}
          <div className="hidden md:flex items-center gap-4">
             {/* Cart Icon */}
            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
              <Link to="/cart" className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-[#4A5568] hover:bg-white hover:shadow-sm transition-all">
                <HiOutlineShoppingCart className="w-5 h-5" />
              </Link>
            </motion.div>

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-[38px] h-[38px] rounded-full flex items-center justify-center bg-white shadow-sm border border-gray-100 text-[#45B1A8] hover:shadow-md transition-all"
                >
                  <HiUser className="w-5 h-5" />
                </motion.button>

                {/* Desktop Dropdown Menu */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-56 rounded-2xl border border-gray-100 shadow-xl bg-white shadow-black/5 overflow-hidden origin-top-right z-50"
                    >
                      <div className="p-4 border-b border-gray-50 bg-[#F5FDFD]">
                        <p className="text-sm font-bold text-[#1A2B2A] truncate">{user?.name}</p>
                        <p className="text-xs font-medium text-gray-500 truncate">{user?.email}</p>
                      </div>

                      <div className="p-2 space-y-1">
                        <Link to={getDashboardPath()} onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-[#4A5568] hover:text-[#1A2B2A] hover:bg-gray-50 rounded-xl transition-colors font-medium">
                          <HiViewGrid className="w-4 h-4 text-gray-400" /> Dashboard
                        </Link>
                        <Link to="/inbox" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-[#4A5568] hover:text-[#1A2B2A] hover:bg-gray-50 rounded-xl transition-colors font-medium">
                          <HiChatAlt2 className="w-4 h-4 text-gray-400" /> Chats
                        </Link>
                        <Link to="/notifications" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-[#4A5568] hover:text-[#1A2B2A] hover:bg-gray-50 rounded-xl transition-colors font-medium">
                          <HiBell className="w-4 h-4 text-gray-400" /> Notifications
                        </Link>
                        {user?.role !== 'admin' && (
                          <Link to="/post-request" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-[#4A5568] hover:text-[#1A2B2A] hover:bg-gray-50 rounded-xl transition-colors font-medium">
                            <HiSupport className="w-4 h-4 text-gray-400" /> Support
                          </Link>
                        )}
                        <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-[#4A5568] hover:text-[#1A2B2A] hover:bg-gray-50 rounded-xl transition-colors font-medium">
                          <HiCog className="w-4 h-4 text-gray-400" /> Settings
                        </Link>
                      </div>

                      <div className="p-2 border-t border-gray-50">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full gap-3 px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <HiLogout className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/login" className="px-5 py-2.5 rounded-full text-sm font-bold text-[#1A2B2A] hover:bg-white hover:shadow-sm transition-all">
                    Sign In
                  </Link>
                </motion.div>
                <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/register" className="px-6 py-2.5 rounded-full bg-[#45B1A8] text-white text-sm font-bold hover:bg-[#3a9990] shadow border border-transparent transition-all">
                    Get Started
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-3">
            <Link to="/cart" className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-[#4A5568]">
              <HiOutlineShoppingCart className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#1A2B2A] w-[36px] h-[36px] rounded-full flex items-center justify-center hover:bg-white transition-colors"
            >
              {isOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-gray-100 bg-white overflow-hidden shadow-xl absolute w-full left-0 z-40"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                 <Link
                   key={link.name}
                   to={link.path}
                   className="block text-[#4A5568] hover:text-[#45B1A8] hover:bg-[#F5FDFD] px-3 py-3 rounded-xl text-base font-bold transition-colors"
                   onClick={() => setIsOpen(false)}
                 >
                   {link.name}
                 </Link>
              ))}

              {isAuthenticated ? (
                <div className="pt-4 border-t border-gray-100 mt-2">
                  <div className="flex items-center gap-3 mb-4 px-3">
                    <div className="w-10 h-10 bg-[#45B1A8]/10 rounded-full flex items-center justify-center border border-[#45B1A8]/20">
                      <span className="text-sm font-bold text-[#45B1A8]">{user?.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1A2B2A] leading-tight">{user?.name}</p>
                      <p className="text-xs font-medium text-gray-500">{user?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4 px-2">
                    <Link to={getDashboardPath()} onClick={() => setIsOpen(false)} className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors">
                      <HiViewGrid className="w-4 h-4 text-gray-500" /> <span className="text-sm font-bold text-[#4A5568]">Dashboard</span>
                    </Link>
                    <Link to="/inbox" onClick={() => setIsOpen(false)} className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors">
                      <HiChatAlt2 className="w-4 h-4 text-gray-500" /> <span className="text-sm font-bold text-[#4A5568]">Chats</span>
                    </Link>
                    {user?.role !== 'admin' && (
                      <Link to="/post-request" onClick={() => setIsOpen(false)} className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors col-span-2">
                        <HiSupport className="w-4 h-4 text-gray-500" /> <span className="text-sm font-bold text-[#4A5568]">Support / Complaints</span>
                      </Link>
                    )}
                  </div>

                  <div className="flex items-center justify-between px-3 pt-3 border-t border-gray-100">
                    <Link to="/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors">
                      <HiCog className="w-5 h-5" /> Settings
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-600 transition-colors">
                      <HiLogout className="w-5 h-5" /> Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 px-2 pb-2">
                  <Link
                    to="/login"
                    className="bg-gray-50 text-[#1A2B2A] px-4 py-3 rounded-xl text-center text-base font-bold"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-[#45B1A8] text-white px-4 py-3 rounded-xl text-center text-base font-bold shadow-md"
                    onClick={() => setIsOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
