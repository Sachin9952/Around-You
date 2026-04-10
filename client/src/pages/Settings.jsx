import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { HiUser, HiMail, HiLockClosed, HiExclamation } from 'react-icons/hi';

const Settings = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const [detailsData, setDetailsData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    setLoadingDetails(true);
    try {
      const res = await API.put('/auth/updatedetails', detailsData);
      toast.success('Profile details updated successfully!');
      // Update local storage and reload to reflect new name
      localStorage.setItem('user', JSON.stringify(res.data.data));
      window.location.reload(); 
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('New passwords do not match!');
    }
    
    setLoadingPassword(true);
    try {
      await API.put('/auth/updatepassword', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      return toast.error('Please enter your password to confirm');
    }

    setLoadingDelete(true);
    try {
      await API.delete('/auth/deleteaccount', { data: { password: deletePassword } });
      toast.success('Account deleted successfully');
      logout();
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete account');
    } finally {
      setLoadingDelete(false);
      setShowDeleteModal(false);
      setDeletePassword('');
    }
  };

  return (
    <div className="bg-[#F5FDFD] min-h-screen py-10 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1A2B2A] mb-2">Account Settings</h1>
          <p className="text-[#4A5568] font-medium">Manage your profile details and security preferences.</p>
        </div>

        <div className="space-y-8">
          {/* Update Details Form */}
          <div className="bg-white p-8 rounded-[2rem] border border-[#E0F5F3] shadow-sm">
            <h2 className="text-xl font-bold text-[#1A2B2A] mb-6 flex items-center gap-2">
              <HiUser className="text-[#45B1A8]" /> Profile Information
            </h2>
            <form onSubmit={handleUpdateDetails} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-[#1A2B2A] mb-2 pl-1">Full Name</label>
                <div className="relative">
                  <HiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    className="w-full bg-[#F5FDFD] text-[#1A2B2A] font-medium border border-[#E0F5F3] rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-[#45B1A8]/50 focus:border-[#45B1A8] transition-all outline-none"
                    value={detailsData.name}
                    onChange={(e) => setDetailsData({ ...detailsData, name: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#1A2B2A] mb-2 pl-1">Email Address</label>
                <div className="relative">
                  <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    className="w-full bg-[#F5FDFD] text-[#1A2B2A] font-medium border border-[#E0F5F3] rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-[#45B1A8]/50 focus:border-[#45B1A8] transition-all outline-none"
                    value={detailsData.email}
                    onChange={(e) => setDetailsData({ ...detailsData, email: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="bg-[#1A2B2A] text-white px-8 py-3.5 rounded-full font-bold hover:bg-black transition-colors w-full sm:w-auto mt-4" disabled={loadingDetails}>
                {loadingDetails ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white p-8 rounded-[2rem] border border-[#E0F5F3] shadow-sm">
            <h2 className="text-xl font-bold text-[#1A2B2A] mb-6 flex items-center gap-2">
              <HiLockClosed className="text-[#45B1A8]" /> Security & Password
            </h2>
            <form onSubmit={handleUpdatePassword} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-[#1A2B2A] mb-2 pl-1">Current Password</label>
                <input
                  type="password"
                  required
                  className="w-full bg-[#F5FDFD] text-[#1A2B2A] font-medium border border-[#E0F5F3] rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-[#45B1A8]/50 focus:border-[#45B1A8] transition-all outline-none"
                  placeholder="••••••••"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-[#1A2B2A] mb-2 pl-1">New Password</label>
                  <input
                    type="password"
                    required
                    minLength="6"
                    className="w-full bg-[#F5FDFD] text-[#1A2B2A] font-medium border border-[#E0F5F3] rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-[#45B1A8]/50 focus:border-[#45B1A8] transition-all outline-none"
                    placeholder="••••••••"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1A2B2A] mb-2 pl-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    minLength="6"
                    className="w-full bg-[#F5FDFD] text-[#1A2B2A] font-medium border border-[#E0F5F3] rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-[#45B1A8]/50 focus:border-[#45B1A8] transition-all outline-none"
                    placeholder="••••••••"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="bg-[#45B1A8] text-white px-8 py-3.5 rounded-full font-bold hover:bg-[#3a9990] shadow-md hover:shadow-lg transition-all w-full sm:w-auto mt-4" disabled={loadingPassword}>
                {loadingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Danger Zone – Delete Account */}
          <div className="bg-red-50/50 p-8 rounded-[2rem] border border-red-100 shadow-sm">
            <h2 className="text-xl font-bold text-red-600 mb-3 flex items-center gap-2">
              <HiExclamation className="w-6 h-6" /> Danger Zone
            </h2>
            <p className="text-[#4A5568] text-sm mb-6 font-medium">
              Permanently delete your account and all associated data.
              {user?.role === 'provider' && (
                <span className="text-red-500 font-bold ml-1">This will also delete your services, bookings, and reviews.</span>
              )}
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-6 py-3 bg-white border-2 border-red-200 hover:border-red-500 text-red-600 hover:bg-red-600 hover:text-white rounded-full font-bold text-sm transition-all shadow-sm"
            >
              Delete My Account
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-[#1A2B2A]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white p-8 max-w-md w-full border border-[#E0F5F3] rounded-[2.5rem] shadow-2xl">
              <h3 className="text-2xl font-bold text-[#1A2B2A] mb-3 flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                  <HiExclamation className="w-6 h-6" />
                </div>
                Verify Deletion
              </h3>
              <p className="text-[#4A5568] text-sm mb-6 font-medium leading-relaxed">
                This action is <strong className="text-red-500 font-bold">permanent and irreversible</strong>. Enter your password to finally delete your account.
              </p>
              <input
                type="password"
                className="w-full bg-[#F5FDFD] text-[#1A2B2A] font-medium border border-[#E0F5F3] rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all outline-none mb-6"
                placeholder="Enter your password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                autoFocus
              />
              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end mt-2">
                <button
                  onClick={() => { setShowDeleteModal(false); setDeletePassword(''); }}
                  className="w-full sm:w-auto px-6 py-3 rounded-full text-[#4A5568] font-bold hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loadingDelete}
                  className="w-full sm:w-auto px-8 py-3 bg-red-500 hover:bg-red-600 shadow-md hover:shadow-lg text-white rounded-full font-bold transition-all disabled:opacity-50"
                >
                  {loadingDelete ? 'Deleting...' : 'Delete Forever'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;

