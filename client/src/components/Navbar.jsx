import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  HiMenu, HiX, HiUser, HiLogout, HiViewGrid,
  HiBell, HiCog, HiChatAlt2, HiOutlineShoppingCart, HiSupport,
  HiSparkles, HiBriefcase, HiCalendar, HiHome,
  HiCollection, HiInformationCircle, HiOutlineArrowRight
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
    { name: 'About', path: '/about' }
  ];

  // Role-based CTA config
  const getProviderCTA = () => {
    if (user?.role === 'admin') return null;
    if (user?.role === 'provider') {
      return { label: 'My Services', path: '/provider/dashboard', icon: HiBriefcase, style: 'outline' };
    }
    return { label: 'List Your Service', path: '/become-provider', icon: HiSparkles, style: 'filled' };
  };
  const providerCTA = getProviderCTA();

  return (
    <>
      <nav className="bg-[#F5FDFD]/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100/50">
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="flex items-center justify-between h-16">
            
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
            <div className="hidden md:flex flex-1 items-center justify-center gap-7">
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
              {/* Provider CTA Button */}
              {providerCTA && (
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to={providerCTA.path}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                      providerCTA.style === 'filled'
                        ? 'bg-[#45B1A8] text-white shadow-md shadow-[#45B1A8]/20 hover:bg-[#3a9990] hover:shadow-lg hover:shadow-[#45B1A8]/30'
                        : 'bg-white text-[#45B1A8] border border-[#45B1A8]/30 hover:bg-[#F5FDFD] hover:border-[#45B1A8]/50 shadow-sm'
                    }`}
                  >
                    <providerCTA.icon className="w-4 h-4" />
                    {providerCTA.label}
                  </Link>
                </motion.div>
              )}
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
                          <Link to={getDashboardPath()} onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-[#1A2B2A] hover:bg-gray-50 rounded-xl transition-colors font-bold">
                            <HiViewGrid className="w-4 h-4 text-[#45B1A8]" /> {user?.role?.toLowerCase() === 'provider' ? 'Provider Dashboard' : 'Dashboard'}
                          </Link>
                          {user?.role?.toLowerCase() === 'provider' && (
                            <Link to="/dashboard" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-[#4A5568] hover:text-[#1A2B2A] hover:bg-gray-50 rounded-xl transition-colors font-medium">
                              <HiCalendar className="w-4 h-4 text-gray-400" /> My Bookings
                            </Link>
                          )}
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

            {/* Mobile Action Buttons */}
            <div className="md:hidden flex items-center gap-2">
              {isAuthenticated ? (
                <button
                  onClick={() => setIsOpen(true)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isOpen ? 'bg-[#1A2B2A] text-white' : 'bg-white text-[#45B1A8] border border-gray-100 shadow-sm'
                  }`}
                >
                  <HiUser className="w-6 h-6" />
                </button>
              ) : (
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isOpen ? 'bg-[#1A2B2A] text-white shadow-lg' : 'bg-white text-[#1A2B2A] border border-gray-100 shadow-sm'
                  }`}
                >
                  {isOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

    {/* Global Mobile Menu Overlay */}
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] md:hidden overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-[10px]"
          />
          
          {/* Menu Content */}
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className="absolute top-0 right-0 h-full w-[86vw] max-w-[360px] bg-white flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="px-6 py-5 flex items-center justify-between bg-white border-b border-gray-50">
              <div className="flex items-center gap-2.5">
                <div className="bg-[#45B1A8] text-white px-2 py-1 rounded-lg text-sm font-black tracking-tighter leading-none">
                  AY
                </div>
                <span className="font-bold text-[#1A2B2A] text-base tracking-tight">Around-You</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:text-[#45B1A8] active:scale-90 transition-all border border-gray-100"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 custom-scrollbar">
              
              {/* User Profile */}
              {isAuthenticated && (
                <section>
                  <div className="bg-[#F5FDFD] p-5 rounded-2xl border border-[#45B1A8]/10 shadow-sm shadow-[#45B1A8]/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#45B1A8] rounded-full flex items-center justify-center text-white text-lg font-bold shadow-sm border-2 border-white">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-[#1A2B2A] truncate leading-tight">{user?.name}</h4>
                        <p className="text-[11px] font-medium text-gray-400 truncate mt-0.5">{user?.email}</p>
                        <span className="inline-block mt-2 bg-white text-[#45B1A8] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-[#45B1A8]/5">
                          {user?.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Main Navigation */}
              <section className="space-y-3">
                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Navigation</h5>
                <div className="space-y-2">
                  {navLinks.map((link) => {
                    const isActive = location.pathname === link.path;
                    const Icon = link.name === 'Home' ? HiHome : link.name === 'Services' ? HiCollection : HiInformationCircle;
                    return (
                      <Link
                        key={link.name}
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all border-l-4 active:scale-[0.97] ${
                          isActive 
                            ? 'bg-[#45B1A8]/20 text-[#45B1A8] border-[#45B1A8] font-bold shadow-sm shadow-[#45B1A8]/10' 
                            : 'bg-white text-[#4A5568] border-transparent hover:bg-gray-50 font-semibold'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-[#45B1A8]' : 'text-gray-400'}`} />
                        <span className="text-sm">{link.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </section>

              {/* Provider Hub */}
              {isAuthenticated && user?.role?.toLowerCase() === 'provider' && (
                <section className="space-y-3">
                  <h5 className="text-[10px] font-black text-[#45B1A8] uppercase tracking-widest pl-1">Provider Hub</h5>
                  <div className="space-y-2">
                    <Link
                      to="/provider/dashboard"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all active:scale-[0.97] ${
                        location.pathname === '/provider/dashboard'
                          ? 'bg-[#1A2B2A] text-white border-[#1A2B2A] shadow-md'
                          : 'bg-white text-[#4A5568] border-gray-100 hover:border-gray-200 font-semibold'
                      }`}
                    >
                      <HiViewGrid className={`w-5 h-5 ${location.pathname === '/provider/dashboard' ? 'text-white' : 'text-[#45B1A8]'}`} />
                      <span className="text-sm">Provider Dashboard</span>
                    </Link>
                  </div>
                </section>
              )}

              {/* Activity Section */}
              {isAuthenticated && (
                <section className="space-y-3">
                  <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Activity</h5>
                  <div className="space-y-2">
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all border-l-4 active:scale-[0.97] ${
                        location.pathname === '/dashboard' 
                          ? 'bg-[#45B1A8]/20 text-[#45B1A8] border-[#45B1A8] shadow-sm shadow-[#45B1A8]/10' 
                          : 'bg-white border-transparent border-l-transparent text-[#4A5568] hover:bg-gray-50'
                      }`}
                    >
                      <HiCalendar className="w-5 h-5" />
                      <span className="text-sm font-semibold">My Bookings</span>
                    </Link>
                    
                    <Link
                      to="/inbox"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all border-l-4 active:scale-[0.97] ${
                        location.pathname === '/inbox' 
                          ? 'bg-[#45B1A8]/20 text-[#45B1A8] border-[#45B1A8] shadow-sm shadow-[#45B1A8]/10' 
                          : 'bg-white border-transparent border-l-transparent text-[#4A5568] hover:bg-gray-50'
                      }`}
                    >
                      <HiChatAlt2 className="w-5 h-5" />
                      <span className="text-sm font-semibold">Chats</span>
                    </Link>

                    {user?.role !== 'admin' && (
                      <Link
                        to="/post-request"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all border-l-4 active:scale-[0.97] ${
                          location.pathname === '/post-request' 
                            ? 'bg-[#45B1A8]/20 text-[#45B1A8] border-[#45B1A8] shadow-sm shadow-[#45B1A8]/10' 
                            : 'bg-white border-transparent border-l-transparent text-[#4A5568] hover:bg-gray-50'
                        }`}
                      >
                        <HiSupport className="w-5 h-5" />
                        <span className="text-sm font-semibold">Support & Complaints</span>
                      </Link>
                    )}
                  </div>
                </section>
              )}

              {/* Guest Access */}
              {!isAuthenticated && (
                <section className="pt-4 space-y-3">
                  <Link to="/register" onClick={() => setIsOpen(false)} className="flex items-center justify-center w-full py-3.5 rounded-xl bg-[#45B1A8] text-white text-sm font-bold shadow-md active:scale-[0.98] transition-all">Get Started</Link>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center w-full py-3.5 rounded-xl bg-white text-[#1A2B2A] text-sm font-bold border border-gray-100 active:scale-[0.98] transition-all shadow-sm">Sign In</Link>
                </section>
              )}
            </div>

            {/* Bottom Actions */}
            {isAuthenticated && (
              <div className="px-5 py-6 bg-gray-50/50 border-t border-gray-100 space-y-3 pb-12">
                <Link
                  to="/settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white text-[#4A5568] border border-gray-200 text-xs font-semibold shadow-sm active:scale-95 transition-all"
                >
                  <HiCog className="w-4 h-4 text-gray-400" /> Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 w-full rounded-xl bg-red-50 text-red-500 border border-red-100 text-xs font-bold active:bg-red-500 active:text-white active:scale-95 transition-all"
                >
                  <HiLogout className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
};

export default Navbar;
