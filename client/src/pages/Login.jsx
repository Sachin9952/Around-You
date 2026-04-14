import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiMail, HiLockClosed } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Login = () => {
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
      toast.success('Welcome back!');
      
      // Navigate based on actual role
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'provider') navigate('/provider/dashboard');
      else navigate('/dashboard');
      
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F5FDFD] min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration — soft light blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#45B1A8]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#6D5AE6]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full bg-white p-8 rounded-[2rem] border border-[#E0F5F3] shadow-sm animate-fade-in relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-[#45B1A8] to-[#6D5AE6] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#45B1A8]/20">
            <HiMail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-[#1A2B2A] mb-2">Customer Login</h2>
          <p className="text-[#4A5568] font-medium">Welcome back! Please enter your details.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-[#1A2B2A] mb-2 pl-1">Email Address</label>
            <div className="relative">
              <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                className="w-full bg-[#F5FDFD] text-[#1A2B2A] font-medium border border-[#E0F5F3] rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-[#45B1A8]/50 focus:border-[#45B1A8] transition-all outline-none placeholder-gray-400"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1A2B2A] mb-2 pl-1">Password</label>
            <div className="relative">
              <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                required
                className="w-full bg-[#F5FDFD] text-[#1A2B2A] font-medium border border-[#E0F5F3] rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-[#45B1A8]/50 focus:border-[#45B1A8] transition-all outline-none placeholder-gray-400"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-[#1A2B2A] text-white px-8 py-3.5 rounded-full font-bold hover:bg-black transition-colors shadow-md hover:shadow-lg mt-6" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#4A5568] font-medium">
          <p className="mb-2">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#6D5AE6] hover:text-[#5a48d1] font-bold">Sign up</Link>
          </p>
          <p className="border-t border-[#E0F5F3] pt-4 mt-4">
            Are you a service provider?{' '}
            <Link to="/provider/login" className="text-[#45B1A8] hover:text-[#3a9990] font-bold">Log in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
