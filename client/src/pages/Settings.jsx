import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { 
  HiUser, 
  HiMail, 
  HiLockClosed, 
  HiExclamation,
  HiHome,
  HiOfficeBuilding,
  HiLocationMarker,
  HiTrash,
  HiPencil,
  HiCheckCircle,
  HiPlus,
  HiX
} from 'react-icons/hi';
import { getGeoapifySuggestions } from '../api/locationService';

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

  // Saved Addresses State
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Address Search State
  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [addressSuggestionsLoading, setAddressSuggestionsLoading] = useState(false);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);

  // Address Form State
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    customLabel: '',
    fullAddress: '',
    area: '',
    houseFlatBuilding: '',
    floorLandmark: '',
    instructions: '',
    latitude: '',
    longitude: '',
    isDefault: false,
  });

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await API.get('/addresses/my');
      if (res.data && res.data.success) {
        setAddresses(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'customer') {
      fetchAddresses();
    }
  }, [user]);

  const handleEditAddressClick = (addr) => {
    setEditingAddress(addr);
    setAddressForm({
      label: ['Home', 'Work', 'Other'].includes(addr.label) ? addr.label : 'Custom',
      customLabel: ['Home', 'Work', 'Other'].includes(addr.label) ? '' : addr.label,
      fullAddress: addr.fullAddress,
      area: addr.area,
      houseFlatBuilding: addr.houseFlatBuilding,
      floorLandmark: addr.floorLandmark || '',
      instructions: addr.instructions || '',
      latitude: addr.latitude,
      longitude: addr.longitude,
      isDefault: addr.isDefault,
    });
    setAddressSearchQuery(addr.fullAddress);
    setShowAddressForm(true);
  };

  const handleAddAddressClick = () => {
    setEditingAddress(null);
    setAddressForm({
      label: 'Home',
      customLabel: '',
      fullAddress: '',
      area: '',
      houseFlatBuilding: '',
      floorLandmark: '',
      instructions: '',
      latitude: '',
      longitude: '',
      isDefault: false,
    });
    setAddressSearchQuery('');
    setAddressSuggestions([]);
    setShowAddressDropdown(false);
    setShowAddressForm(true);
  };

  const handleAddressFormSubmit = async (e) => {
    e.preventDefault();

    if (!addressForm.fullAddress || !addressForm.latitude || !addressForm.longitude) {
      return toast.error('Please search and select a valid location from the search bar');
    }
    if (!addressForm.houseFlatBuilding.trim()) {
      return toast.error('Please enter House / Flat / Building No.');
    }

    const finalLabel = addressForm.label === 'Custom' ? addressForm.customLabel.trim() : addressForm.label;
    if (!finalLabel) {
      return toast.error('Please provide a name for the custom label');
    }

    const payload = {
      label: finalLabel,
      fullAddress: addressForm.fullAddress,
      area: addressForm.area || 'Unknown Locality',
      houseFlatBuilding: addressForm.houseFlatBuilding,
      floorLandmark: addressForm.floorLandmark,
      instructions: addressForm.instructions,
      latitude: Number(addressForm.latitude),
      longitude: Number(addressForm.longitude),
      isDefault: addressForm.isDefault,
    };

    setLoadingAddresses(true);
    const toastId = toast.loading(editingAddress ? 'Updating address...' : 'Creating address...');
    try {
      if (editingAddress) {
        await API.put(`/addresses/${editingAddress._id}`, payload);
        toast.success('Address updated successfully!', { id: toastId });
      } else {
        await API.post('/addresses', payload);
        toast.success('Address added successfully!', { id: toastId });
      }
      setShowAddressForm(false);
      setEditingAddress(null);
      await fetchAddresses();
    } catch (err) {
      console.error('Error saving address:', err);
      toast.error(err.response?.data?.error || 'Failed to save address', { id: toastId });
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this saved address?')) return;
    
    setLoadingAddresses(true);
    const toastId = toast.loading('Deleting address...');
    try {
      await API.delete(`/addresses/${id}`);
      toast.success('Address deleted successfully!', { id: toastId });
      await fetchAddresses();
    } catch (err) {
      console.error('Error deleting address:', err);
      toast.error('Failed to delete address', { id: toastId });
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleSetDefaultAddress = async (id) => {
    setLoadingAddresses(true);
    const toastId = toast.loading('Setting default address...');
    try {
      await API.patch(`/addresses/${id}/default`);
      toast.success('Default address updated!', { id: toastId });
      await fetchAddresses();
    } catch (err) {
      console.error('Error setting default address:', err);
      toast.error('Failed to set default address', { id: toastId });
    } finally {
      setLoadingAddresses(false);
    }
  };

  const debounceRef = useRef(null);
  const runAddressSearch = (query) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.trim().length < 2) {
      setAddressSuggestions([]);
      setShowAddressDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setAddressSuggestionsLoading(true);
      setShowAddressDropdown(true);
      try {
        const results = await getGeoapifySuggestions(query.trim());
        setAddressSuggestions(results);
      } catch (err) {
        console.error('Search error:', err);
        setAddressSuggestions([]);
      } finally {
        setAddressSuggestionsLoading(false);
      }
    }, 400);
  };

  const handleAddressInputChange = (e) => {
    const val = e.target.value;
    setAddressSearchQuery(val);
    runAddressSearch(val);
  };

  const handleSelectAddressSuggestion = (place) => {
    setAddressSearchQuery(place.fullAddress);
    setAddressForm(prev => ({
      ...prev,
      fullAddress: place.fullAddress,
      area: place.mainText || 'Unknown Locality',
      latitude: place.lat,
      longitude: place.lng,
    }));
    setAddressSuggestions([]);
    setShowAddressDropdown(false);
  };

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

          {/* Saved Addresses Section */}
          {user?.role !== 'provider' && (
            <div className="bg-white p-8 rounded-[2rem] border border-[#E0F5F3] shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#1A2B2A] flex items-center gap-2">
                    <HiLocationMarker className="text-[#45B1A8]" /> Saved Addresses
                  </h2>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    Manage your saved locations for quick booking checkout.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddAddressClick}
                  className="bg-[#45B1A8] hover:bg-[#388E87] text-white px-5 py-2.5 rounded-full font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto"
                >
                  <HiPlus className="w-4 h-4" /> Add New Address
                </button>
              </div>

              {loadingAddresses && addresses.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-3 border-[#45B1A8] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : addresses.length === 0 ? (
                <div className="border-2 border-dashed border-[#E0F5F3] rounded-[2rem] p-8 text-center bg-[#F9FFFF]">
                  <div className="w-12 h-12 rounded-2xl bg-[#E0F5F3]/50 flex items-center justify-center mx-auto mb-3 text-[#45B1A8]">
                    <HiLocationMarker className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1A2B2A]">No saved addresses yet</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
                    Save your home, office or frequent work addresses to auto-fill them when scheduling services.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className={`relative border-2 rounded-[1.5rem] p-5 flex flex-col justify-between transition-all ${
                        addr.isDefault
                          ? 'border-[#45B1A8] bg-[#F5FDFD]'
                          : 'border-[#E0F5F3] hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                              addr.isDefault ? 'bg-[#45B1A8] text-white' : 'bg-[#E0F5F3] text-[#45B1A8]'
                            }`}>
                              {addr.label.toLowerCase() === 'home' ? (
                                <HiHome className="w-4.5 h-4.5" />
                              ) : addr.label.toLowerCase() === 'work' ? (
                                <HiOfficeBuilding className="w-4.5 h-4.5" />
                              ) : (
                                <HiLocationMarker className="w-4.5 h-4.5" />
                              )}
                            </div>
                            <span className="text-sm font-extrabold text-[#1A2B2A]">{addr.label}</span>
                          </div>

                          {addr.isDefault && (
                            <span className="bg-[#45B1A8]/10 text-[#45B1A8] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 text-xs text-[#4A5568] font-medium leading-relaxed">
                          <p className="font-bold text-[#1A2B2A]">{addr.houseFlatBuilding}</p>
                          {addr.floorLandmark && <p>Landmark: {addr.floorLandmark}</p>}
                          <p className="text-gray-400">{addr.fullAddress}</p>
                          {addr.instructions && (
                            <p className="text-[10px] text-[#45B1A8] font-bold bg-[#45B1A8]/5 px-2 py-1 rounded-lg mt-2 inline-block">
                              Instructions: {addr.instructions}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-5 pt-3 border-t border-gray-100 text-xs">
                        {!addr.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultAddress(addr._id)}
                            className="text-gray-500 hover:text-[#45B1A8] font-bold py-1.5 px-2.5 rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
                          >
                            <HiCheckCircle className="w-4 h-4 text-emerald-500" /> Set Default
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleEditAddressClick(addr)}
                          className="text-gray-500 hover:text-gray-800 font-bold py-1.5 px-2.5 rounded hover:bg-gray-50 transition-colors ml-auto flex items-center gap-1"
                        >
                          <HiPencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr._id)}
                          className="text-red-500 hover:text-red-700 font-bold py-1.5 px-2.5 rounded hover:bg-red-50 transition-colors flex items-center gap-1"
                        >
                          <HiTrash className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
        {/* Add/Edit Address Modal */}
        {showAddressForm && (
          <div className="fixed inset-0 bg-[#1A2B2A]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white p-8 max-w-lg w-full border border-[#E0F5F3] rounded-[2.5rem] shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <h3 className="text-xl font-extrabold text-[#1A2B2A]">
                  {editingAddress ? 'Edit Saved Address' : 'Add New Address'}
                </h3>
                <button
                  type="button"
                  onClick={() => { setShowAddressForm(false); setEditingAddress(null); }}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddressFormSubmit} className="space-y-4">
                {/* Geolocation Search Bar */}
                <div className="space-y-1.5 relative">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                    Search Locality / Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <HiLocationMarker className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#45B1A8]" />
                    <input
                      type="text"
                      required
                      value={addressSearchQuery}
                      onChange={handleAddressInputChange}
                      onFocus={() => { if (addressSuggestions.length > 0) setShowAddressDropdown(true); }}
                      placeholder="Type city, street, or landmark..."
                      className="w-full bg-[#F5FDFD] text-[#1A2B2A] font-medium border border-[#E0F5F3] rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-[#45B1A8]/50 focus:border-[#45B1A8] transition-all outline-none text-sm placeholder:text-gray-400"
                      autoComplete="off"
                    />
                  </div>

                  {/* Autocomplete Dropdown */}
                  {showAddressDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E0F5F3] rounded-2xl shadow-xl z-50 max-h-[220px] overflow-y-auto">
                      {addressSuggestionsLoading ? (
                        <div className="p-4 text-center text-xs font-bold text-[#45B1A8] animate-pulse">
                          Searching...
                        </div>
                      ) : addressSuggestions.length > 0 ? (
                        addressSuggestions.map((place, idx) => (
                          <button
                            key={place.id || idx}
                            type="button"
                            onClick={() => handleSelectAddressSuggestion(place)}
                            className="w-full text-left px-4 py-3 text-xs border-b border-gray-50 hover:bg-[#F9FFFF] transition-colors truncate"
                          >
                            <span className="font-bold text-[#1A2B2A] block">{place.mainText}</span>
                            <span className="text-gray-400 block text-[10px] mt-0.5">{place.secondaryText}</span>
                          </button>
                        ))
                      ) : addressSearchQuery.length >= 2 && (
                        <div className="p-4 text-center text-xs text-gray-400">
                          No locations found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                      House / Flat / Building No. <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.houseFlatBuilding}
                      onChange={(e) => setAddressForm({ ...addressForm, houseFlatBuilding: e.target.value })}
                      placeholder="e.g. Flat 402, Royal Apt"
                      className="w-full bg-[#F5FDFD] text-[#1A2B2A] font-medium border border-[#E0F5F3] rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-[#45B1A8]/50 focus:border-[#45B1A8] transition-all outline-none text-sm placeholder:text-gray-300"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                      Floor / Landmark
                    </label>
                    <input
                      type="text"
                      value={addressForm.floorLandmark}
                      onChange={(e) => setAddressForm({ ...addressForm, floorLandmark: e.target.value })}
                      placeholder="e.g. 4th Floor, near Park"
                      className="w-full bg-[#F5FDFD] text-[#1A2B2A] font-medium border border-[#E0F5F3] rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-[#45B1A8]/50 focus:border-[#45B1A8] transition-all outline-none text-sm placeholder:text-gray-300"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                    Delivery instructions
                  </label>
                  <input
                    type="text"
                    value={addressForm.instructions}
                    onChange={(e) => setAddressForm({ ...addressForm, instructions: e.target.value })}
                    placeholder="e.g. Call before arrival, leave at gate"
                    className="w-full bg-[#F5FDFD] text-[#1A2B2A] font-medium border border-[#E0F5F3] rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-[#45B1A8]/50 focus:border-[#45B1A8] transition-all outline-none text-sm placeholder:text-gray-300"
                  />
                </div>

                {/* Label selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                    Address Label
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Home', 'Work', 'Other', 'Custom'].map((labelOpt) => (
                      <button
                        key={labelOpt}
                        type="button"
                        onClick={() => setAddressForm(prev => ({ ...prev, label: labelOpt }))}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                          addressForm.label === labelOpt
                            ? 'bg-[#45B1A8] border-[#45B1A8] text-white shadow-sm'
                            : 'bg-[#F5FDFD] border-[#E0F5F3] text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {labelOpt}
                      </button>
                    ))}
                  </div>
                </div>

                {addressForm.label === 'Custom' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                      Custom Label Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.customLabel}
                      onChange={(e) => setAddressForm({ ...addressForm, customLabel: e.target.value })}
                      placeholder="e.g. Gym, School"
                      className="w-full bg-[#F5FDFD] text-[#1A2B2A] font-bold border border-[#E0F5F3] rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-[#45B1A8]/50 focus:border-[#45B1A8] transition-all outline-none text-sm placeholder:text-gray-300"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                      className="w-4 h-4 rounded border-2 border-[#E0F5F3] text-[#45B1A8] accent-[#45B1A8] cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-gray-500">
                      Set as default address
                    </span>
                  </label>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowAddressForm(false); setEditingAddress(null); }}
                      className="px-4 py-2 rounded-full text-xs font-bold hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loadingAddresses}
                      className="bg-[#45B1A8] hover:bg-[#388E87] text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                    >
                      {loadingAddresses ? 'Saving...' : 'Save Address'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;

