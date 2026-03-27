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
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
        <p className="text-dark-200">Manage your profile details and security preferences here.</p>
      </div>

      <div className="space-y-8">
        {/* Update Details Form */}
        <div className="glass p-6 md:p-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <HiUser className="text-primary-400" /> Profile Information
          </h2>
          <form onSubmit={handleUpdateDetails} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark-100 mb-1.5">Full Name</label>
              <div className="relative">
                <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-300" />
                <input
                  type="text"
                  required
                  className="input-field pl-10"
                  value={detailsData.name}
                  onChange={(e) => setDetailsData({ ...detailsData, name: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-100 mb-1.5">Email Address</label>
              <div className="relative">
                <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-300" />
                <input
                  type="email"
                  required
                  className="input-field pl-10"
                  value={detailsData.email}
                  onChange={(e) => setDetailsData({ ...detailsData, email: e.target.value })}
                />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full sm:w-auto mt-4" disabled={loadingDetails}>
              {loadingDetails ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="glass p-6 md:p-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <HiLockClosed className="text-emerald-400" /> Security & Password
          </h2>
          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark-100 mb-1.5">Current Password</label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="••••••••"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-dark-100 mb-1.5">New Password</label>
                <input
                  type="password"
                  required
                  minLength="6"
                  className="input-field"
                  placeholder="••••••••"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-100 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  required
                  minLength="6"
                  className="input-field"
                  placeholder="••••••••"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full sm:w-auto mt-4" disabled={loadingPassword}>
              {loadingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Danger Zone – Delete Account */}
        <div className="glass p-6 md:p-8 border border-red-500/30">
          <h2 className="text-xl font-bold text-red-400 mb-3 flex items-center gap-2">
            <HiExclamation className="w-6 h-6" /> Danger Zone
          </h2>
          <p className="text-dark-200 text-sm mb-4">
            Permanently delete your account and all associated data.
            {user?.role === 'provider' && (
              <span className="text-red-400 font-medium"> This will also delete all your services, bookings, and reviews.</span>
            )}
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Delete My Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass p-6 md:p-8 max-w-md w-full border border-red-500/30 rounded-2xl">
            <h3 className="text-xl font-bold text-red-400 mb-2 flex items-center gap-2">
              <HiExclamation className="w-6 h-6" /> Confirm Deletion
            </h3>
            <p className="text-dark-200 text-sm mb-5">
              This action is <strong className="text-white">permanent and irreversible</strong>. Enter your password to confirm.
            </p>
            <input
              type="password"
              className="input-field mb-5"
              placeholder="Enter your password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowDeleteModal(false); setDeletePassword(''); }}
                className="px-4 py-2 rounded-lg text-dark-100 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loadingDelete}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loadingDelete ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;

