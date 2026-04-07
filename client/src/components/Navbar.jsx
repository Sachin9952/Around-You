import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  HiMenu, HiX, HiUser, HiLogout, HiViewGrid,
  HiBookmark, HiPlusCircle, HiClipboardList,
  HiBell, HiCog, HiChevronDown, HiChatAlt2
} from 'react-icons/hi';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setIsOpen(false)}>
            <img src="/logo.png" alt="Around-You Logo" className="h-[60px] w-auto object-contain drop-shadow-lg group-hover:drop-shadow-primary-500/25 transition-all duration-300" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/services" className="text-dark-100 hover:text-white transition-colors duration-200 text-sm font-medium">
              Browse Services
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/inbox"
                  className="flex items-center gap-1.5 text-dark-100 hover:text-white transition-colors text-sm font-medium"
                >
                  <HiChatAlt2 className="w-4 h-4" />
                  Chats
                </Link>
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-1.5 text-dark-100 hover:text-white transition-colors text-sm font-medium"
                >
                  <HiViewGrid className="w-4 h-4" />
                  Dashboard
                </Link>
                <div className="relative pl-4 border-l border-dark-400" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 hover:bg-dark-600/50 p-1.5 rounded-xl transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center border border-primary-500/30">
                      <span className="text-xs font-semibold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-sm font-medium text-dark-100">{user?.name}</span>
                    <HiChevronDown className={`w-4 h-4 text-dark-200 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Desktop Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/10 shadow-xl bg-dark-700 shadow-black/50 overflow-hidden animate-fade-in origin-top-right z-50">
                      <div className="p-4 border-b border-white/5 bg-dark-600/30">
                        <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                        <p className="text-xs text-dark-200 truncate">{user?.email}</p>
                      </div>

                      <div className="p-2 space-y-1">
                        <Link to={getDashboardPath()} onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-dark-100 hover:text-white hover:bg-dark-500/50 rounded-xl transition-colors">
                          <HiUser className="w-4 h-4 text-dark-200" /> My Profile
                        </Link>
                        <Link to={getDashboardPath()} onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-dark-100 hover:text-white hover:bg-dark-500/50 rounded-xl transition-colors">
                          <HiClipboardList className="w-4 h-4 text-dark-200" /> My Bookings
                        </Link>
                        {user.role !== 'admin' && (
                          <Link to="/post-request" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-dark-100 hover:text-white hover:bg-dark-500/50 rounded-xl transition-colors">
                            <HiPlusCircle className="w-4 h-4 text-dark-200" /> Post a Request
                          </Link>
                        )}
                        {user.role === 'admin' ? (
                          <Link to="/admin/support" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-dark-100 hover:text-white hover:bg-dark-500/50 rounded-xl transition-colors">
                            <HiChatAlt2 className="w-4 h-4 text-emerald-400" /> Support Requests
                          </Link>
                        ) : (
                          <Link to="/notifications" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-dark-100 hover:text-white hover:bg-dark-500/50 rounded-xl transition-colors">
                            <HiBell className="w-4 h-4 text-purple-400" /> Notifications
                          </Link>
                        )}
                        <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-dark-100 hover:text-white hover:bg-dark-500/50 rounded-xl transition-colors">
                          <HiCog className="w-4 h-4 text-dark-200" /> Settings
                        </Link>
                      </div>

                      <div className="p-2 border-t border-white/5">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                        >
                          <HiLogout className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/provider/register" className="text-emerald-400 hover:text-emerald-300 font-medium text-sm transition-colors">
                  Become a Provider
                </Link>
                <div className="w-px h-4 bg-dark-600"></div>
                <Link to="/login" className="text-dark-100 hover:text-white transition-colors text-sm font-medium">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm !py-2 !px-4">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-dark-100 hover:text-white"
          >
            {isOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-dark-500 animate-fade-in">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/services"
              className="block text-dark-100 hover:text-white py-2 text-sm"
              onClick={() => setIsOpen(false)}
            >
              Browse Services
            </Link>

            {isAuthenticated ? (
              <div className="pt-2 border-t border-dark-500 mt-2">
                <div className="flex items-center gap-3 mb-4 px-2">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center border border-primary-500/30">
                    <span className="text-sm font-semibold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-tight">{user?.name}</p>
                    <p className="text-xs text-dark-200">{user?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Link to={getDashboardPath()} onClick={() => setIsOpen(false)} className="flex items-center gap-2 p-2 rounded-xl border border-white/5 bg-dark-600/30 hover:bg-dark-500/50 transition-colors">
                    <HiUser className="w-4 h-4 text-primary-400" /> <span className="text-sm text-dark-100">Profile</span>
                  </Link>
                  <Link to={getDashboardPath()} onClick={() => setIsOpen(false)} className="flex items-center gap-2 p-2 rounded-xl border border-white/5 bg-dark-600/30 hover:bg-dark-500/50 transition-colors">
                    <HiClipboardList className="w-4 h-4 text-primary-400" /> <span className="text-sm text-dark-100">Bookings</span>
                  </Link>
                  <Link to="/inbox" onClick={() => setIsOpen(false)} className="flex items-center gap-2 p-2 rounded-xl border border-white/5 bg-dark-600/30 hover:bg-dark-500/50 transition-colors col-span-2 justify-center">
                    <HiChatAlt2 className="w-4 h-4 text-primary-400" /> <span className="text-sm text-dark-100 font-medium">Chats</span>
                  </Link>

                  {user?.role === 'admin' ? (
                    <Link to="/admin/support" onClick={() => setIsOpen(false)} className="flex items-center gap-2 p-2 rounded-xl border border-emerald-500/10 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors col-span-2 justify-center">
                      <HiChatAlt2 className="w-4 h-4 text-emerald-400" /> <span className="text-sm text-emerald-400 font-medium">Support Requests</span>
                    </Link>
                  ) : (
                    <Link to="/notifications" onClick={() => setIsOpen(false)} className="flex items-center gap-2 p-2 rounded-xl border border-purple-500/10 bg-purple-500/5 hover:bg-purple-500/10 transition-colors col-span-2 justify-center">
                      <HiBell className="w-4 h-4 text-purple-400" /> <span className="text-sm text-purple-400 font-medium">Notifications</span>
                    </Link>
                  )}

                  {user?.role !== 'admin' && (
                    <Link to="/post-request" onClick={() => setIsOpen(false)} className="flex items-center gap-2 p-2 rounded-xl border border-emerald-500/10 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors col-span-2 justify-center">
                      <HiPlusCircle className="w-4 h-4 text-emerald-400" /> <span className="text-sm text-emerald-400 font-medium">Post Request</span>
                    </Link>
                  )}
                </div>

                <div className="flex items-center justify-between px-2 pt-2 border-t border-dark-500">
                  <Link to="/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-sm text-dark-200 hover:text-white transition-colors">
                    <HiCog className="w-5 h-5" /> Settings
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-400 font-medium hover:text-red-300 transition-colors">
                    <HiLogout className="w-5 h-5" /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-3 border-t border-dark-500">
                <Link
                  to="/provider/register"
                  className="text-center text-sm font-medium text-emerald-400 hover:text-emerald-300 py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Become a Provider
                </Link>
                <Link
                  to="/login"
                  className="btn-secondary text-center text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-center text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
