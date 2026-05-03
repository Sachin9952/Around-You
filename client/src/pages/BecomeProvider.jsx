import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import {
  HiBriefcase, HiPhone, HiCurrencyRupee,
  HiUserGroup, HiChartBar, HiArrowRight, HiShieldCheck
} from 'react-icons/hi';

const benefits = [
  {
    icon: HiCurrencyRupee,
    title: 'Set Your Own Prices',
    desc: 'Full control over your rates. Set fixed or hourly pricing that matches your expertise.',
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
  },
  {
    icon: HiUserGroup,
    title: 'Reach Nearby Customers',
    desc: 'Get discovered by customers in your area who need your services right now.',
    gradient: 'from-[#45B1A8] to-cyan-500',
    bg: 'bg-cyan-50',
  },
  {
    icon: HiChartBar,
    title: 'Easy Dashboard',
    desc: 'Manage bookings, track earnings, and chat with customers — all in one place.',
    gradient: 'from-violet-500 to-indigo-500',
    bg: 'bg-violet-50',
  },
];

const BecomeProvider = () => {
  const { user, isAuthenticated, loading, updateUser } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect guards
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
    if (!loading && user?.role === 'provider') {
      navigate('/provider/dashboard', { replace: true });
    }
    if (!loading && user?.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [loading, isAuthenticated, user, navigate]);

  // Pre-fill phone if user already has one
  useEffect(() => {
    if (user?.phone) {
      setPhone(user.phone);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phone.trim()) {
      return toast.error('Please provide a phone number');
    }

    setSubmitting(true);
    try {
      const { data } = await API.patch('/auth/become-provider', { phone: phone.trim() });
      updateUser(data.user, data.token);
      toast.success('Welcome aboard! You are now a provider 🎉');
      navigate('/provider/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#45B1A8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#F5FDFD] min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-[#45B1A8]/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-emerald-500/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white border border-[#E0F5F3] rounded-full px-4 py-2 mb-6 shadow-sm">
              <HiShieldCheck className="w-4 h-4 text-[#45B1A8]" />
              <span className="text-xs font-bold text-[#4A5568] uppercase tracking-wider">Trusted by 500+ providers</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1A2B2A] leading-tight mb-4">
              Start Earning with{' '}
              <span className="bg-gradient-to-r from-[#45B1A8] to-emerald-500 bg-clip-text text-transparent">
                Around-You
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-[#4A5568] font-medium max-w-2xl mx-auto leading-relaxed">
              List your service, connect with nearby customers, and grow your business — all from one powerful platform.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Benefits Cards */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="grid sm:grid-cols-3 gap-5 mb-14"
        >
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
              className="bg-white rounded-2xl p-6 border border-[#E0F5F3] shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${b.gradient} flex items-center justify-center mb-4 shadow-lg shadow-${b.gradient.split('-')[1]}-500/20 group-hover:scale-105 transition-transform`}>
                <b.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-bold text-[#1A2B2A] mb-2">{b.title}</h3>
              <p className="text-sm text-[#4A5568] font-medium leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Conversion Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="max-w-lg mx-auto"
        >
          <div className="bg-white rounded-[2rem] border border-[#E0F5F3] shadow-sm overflow-hidden">
            {/* Form Header */}
            <div className="px-8 py-6 bg-gradient-to-r from-[#45B1A8] to-emerald-500 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <HiBriefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Become a Provider</h2>
                  <p className="text-white/80 text-sm font-medium">Just one step to get started</p>
                </div>
              </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-8">
              {/* User Info Preview */}
              <div className="flex items-center gap-3 mb-6 bg-[#F5FDFD] p-4 rounded-2xl border border-[#E0F5F3]">
                <div className="w-11 h-11 bg-[#45B1A8]/10 rounded-full flex items-center justify-center border border-[#45B1A8]/20">
                  <span className="text-sm font-bold text-[#45B1A8]">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#1A2B2A] truncate">{user?.name}</p>
                  <p className="text-xs font-medium text-gray-500 truncate">{user?.email}</p>
                </div>
                <span className="ml-auto bg-[#E0F5F3] text-[#45B1A8] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shrink-0">
                  Customer
                </span>
              </div>

              {/* Phone Field */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-[#1A2B2A] mb-2 pl-1">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <HiPhone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#F5FDFD] text-[#1A2B2A] font-medium border border-[#E0F5F3] rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-[#45B1A8]/50 focus:border-[#45B1A8] transition-all outline-none placeholder-gray-400"
                    placeholder="+91 9876543210"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2 pl-1">
                  Customers will use this to reach you for bookings.
                </p>
              </div>

              {/* Agreement */}
              <div className="bg-[#F5FDFD] border border-[#E0F5F3] rounded-xl p-4 mb-6">
                <p className="text-xs text-[#4A5568] font-medium leading-relaxed">
                  By becoming a provider, you agree to list genuine services and maintain professional communication with customers. Your existing account data will be preserved.
                </p>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={{ scale: submitting ? 1 : 1.01 }}
                whileTap={{ scale: submitting ? 1 : 0.98 }}
                className="w-full bg-gradient-to-r from-[#45B1A8] to-emerald-500 text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-[#45B1A8]/25 hover:shadow-xl hover:shadow-[#45B1A8]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    Become a Provider
                    <HiArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>
          </div>

          {/* Already a provider hint */}
          <p className="text-center text-sm text-gray-400 font-medium mt-6">
            Already have a provider account?{' '}
            <button
              onClick={() => navigate('/provider/login')}
              className="text-[#45B1A8] hover:text-[#3a9990] font-bold transition-colors"
            >
              Log in here
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default BecomeProvider;
