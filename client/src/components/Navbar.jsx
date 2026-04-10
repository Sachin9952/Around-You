import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  HiMenu, HiX, HiUser, HiLogout, HiViewGrid,
  HiClipboardList, HiBell, HiCog, HiChevronDown, 
  HiChatAlt2, HiOutlineLocationMarker, HiOutlineSearch, HiOutlineShoppingCart, HiPlusCircle
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

  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
            {/* Real UC style logo has dark text */}
            <div className="flex items-center gap-2">
              <div className="bg-black text-white px-2 py-1 rounded text-lg font-bold leading-none tracking-tighter">
                AY
              </div>
              <span className="font-bold text-gray-900 text-xl tracking-tight hidden sm:block">Around-You</span>
            </div>
            <span className="text-gray-400 text-sm ml-4 hidden lg:block font-medium">Native</span>
          </Link>

          {/* Desktop Center: Location & Search (Hidden on Mobile) */}
          <div className="hidden md:flex flex-1 items-center justify-center max-w-3xl px-8 gap-4">
            <div className="flex items-center bg-white border border-gray-200 rounded-lg px-4 py-2.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer min-w-[240px]">
              <HiOutlineLocationMarker className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0" />
              <span className="text-gray-700 text-sm font-medium truncate flex-1">63, Maharani Rd- Siyaga...</span>
              <HiChevronDown className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0" />
            </div>

            <div className="flex flex-1 items-center bg-white border border-gray-200 rounded-lg px-4 py-2.5 shadow-sm hover:shadow-md transition-shadow">
              <HiOutlineSearch className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0" />
              <input 
                type="text" 
                placeholder="Search for 'AC service'" 
                className="w-full text-sm outline-none bg-transparent placeholder-gray-400 text-gray-900" 
              />
            </div>
          </div>

          {/* Desktop Right Nav */}
          <div className="hidden md:flex items-center gap-4">
             {/* Cart Icon */}
            <Link to="/cart" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors">
              <HiOutlineShoppingCart className="w-5 h-5" />
            </Link>

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <HiUser className="w-5 h-5" />
                </button>

                {/* Desktop Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-gray-100 shadow-xl bg-white shadow-black/10 overflow-hidden animate-fade-in origin-top-right z-50">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>

                    <div className="p-2 space-y-1">
                      <Link to={getDashboardPath()} onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:text-black hover:bg-gray-100 rounded-xl transition-colors">
                        <HiViewGrid className="w-4 h-4 text-gray-400" /> Dashboard
                      </Link>
                      <Link to="/inbox" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:text-black hover:bg-gray-100 rounded-xl transition-colors">
                        <HiChatAlt2 className="w-4 h-4 text-gray-400" /> Chats
                      </Link>
                      <Link to="/notifications" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:text-black hover:bg-gray-100 rounded-xl transition-colors">
                        <HiBell className="w-4 h-4 text-gray-400" /> Notifications
                      </Link>
                      <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:text-black hover:bg-gray-100 rounded-xl transition-colors">
                        <HiCog className="w-4 h-4 text-gray-400" /> Settings
                      </Link>
                    </div>

                    <div className="p-2 border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <HiLogout className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors">
                <HiUser className="w-5 h-5" />
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-3">
            <Link to="/cart" className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-700">
              <HiOutlineShoppingCart className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 p-1"
            >
              {isOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu (Light Theme) */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-fade-in absolute w-full left-0 shadow-lg">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/services"
              className="block text-gray-700 hover:text-black py-2 text-sm font-medium"
              onClick={() => setIsOpen(false)}
            >
              Browse Services
            </Link>

            {isAuthenticated ? (
              <div className="pt-2 border-t border-gray-100 mt-2">
                <div className="flex items-center gap-3 mb-4 px-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                    <span className="text-sm font-bold text-gray-700">{user?.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 leading-tight">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Link to={getDashboardPath()} onClick={() => setIsOpen(false)} className="flex items-center gap-2 p-2 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <HiUser className="w-4 h-4 text-gray-500" /> <span className="text-sm text-gray-700">Profile</span>
                  </Link>
                  <Link to="/inbox" onClick={() => setIsOpen(false)} className="flex items-center gap-2 p-2 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <HiChatAlt2 className="w-4 h-4 text-gray-500" /> <span className="text-sm text-gray-700">Chats</span>
                  </Link>
                </div>

                <div className="flex items-center justify-between px-2 pt-2 border-t border-gray-100">
                  <Link to="/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors">
                    <HiCog className="w-5 h-5" /> Settings
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-500 font-medium hover:text-red-600 transition-colors">
                    <HiLogout className="w-5 h-5" /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pt-3 border-t border-gray-100">
                <Link
                  to="/login"
                  className="bg-gray-100 text-gray-900 px-4 py-2 rounded-xl text-center text-sm font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Login / Sign up
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
