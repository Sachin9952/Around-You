import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiMail, HiLockClosed, HiBriefcase } from 'react-icons/hi';
import toast from 'react-hot-toast';

const ProviderLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(formData);
      
      if (user.role !== 'provider' && user.role !== 'admin') {
        toast.error('This login is for providers. Redirecting to customer dashboard...');
        return navigate('/dashboard');
      }

      toast.success('Welcome back to your workspace!');
      navigate('/provider/dashboard');
      
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration - Emerald */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full glass border-emerald-500/10 p-8 animate-fade-in relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <HiBriefcase className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Provider Portal</h2>
          <p className="text-dark-200">Manage your services and bookings.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-dark-100 mb-1.5">Email Address</label>
            <div className="relative">
              <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-200" />
              <input
                type="email"
                required
                className="input-field pl-10 focus:border-emerald-500 focus:ring-emerald-500/20"
                placeholder="provider@business.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                className="input-field pl-10 focus:border-emerald-500 focus:ring-emerald-500/20"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 mt-6" disabled={loading}>
            {loading ? 'Authenticating...' : 'View Dashboard'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-dark-200">
          <p className="mb-2">
            New service provider?{' '}
            <Link to="/provider/register" className="text-emerald-400 hover:text-emerald-300 font-medium">Join Here</Link>
          </p>
          <p className="border-t border-dark-600 pt-4 mt-4">
            Customer looking to book?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Customer Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProviderLogin;
