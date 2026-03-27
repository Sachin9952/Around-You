import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiMail, HiLockClosed, HiUser, HiPhone, HiBriefcase } from 'react-icons/hi';
import toast from 'react-hot-toast';

const ProviderRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Force role to provider for this dedicated page
      await register({ ...formData, role: 'provider' });
      toast.success('Provider account created successfully! You are ready to list services.');
      navigate('/provider/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration - Emerald instead of blue to distinguish providers */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full glass border-emerald-500/10 p-8 animate-fade-in relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <HiBriefcase className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Become a Provider</h2>
          <p className="text-dark-200">List your services and grow your business today.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-dark-100 mb-1.5">Full Name / Business Name</label>
            <div className="relative">
              <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-200" />
              <input
                type="text"
                required
                className="input-field pl-10 focus:border-emerald-500 focus:ring-emerald-500/20"
                placeholder="Rahul Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-100 mb-1.5">Email Address</label>
            <div className="relative">
              <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-200" />
              <input
                type="email"
                required
                className="input-field pl-10 focus:border-emerald-500 focus:ring-emerald-500/20"
                placeholder="rahul@business.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-100 mb-1.5">Phone Number (Required)</label>
            <div className="relative">
              <HiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-200" />
              <input
                type="tel"
                required
                className="input-field pl-10 focus:border-emerald-500 focus:ring-emerald-500/20"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-100 mb-1.5">Password</label>
            <div className="relative">
              <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-200" />
              <input
                type="password"
                required
                minLength={6}
                className="input-field pl-10 focus:border-emerald-500 focus:ring-emerald-500/20"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 mt-6" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register as Provider'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-dark-200">
          <p className="mb-2">
            Already a provider?{' '}
            <Link to="/provider/login" className="text-emerald-400 hover:text-emerald-300 font-medium">Log in</Link>
          </p>
          <p className="border-t border-dark-600 pt-4 mt-4">
            Looking to hire someone?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">Sign up as customer</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProviderRegister;
