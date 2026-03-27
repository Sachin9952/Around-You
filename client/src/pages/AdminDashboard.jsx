import { useState, useEffect } from 'react';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { HiUsers, HiUser, HiBriefcase, HiClipboardList, HiCheck, HiX, HiTrash, HiShieldCheck, HiChatAlt2 } from 'react-icons/hi';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'badge-pending',
  accepted: 'badge-accepted',
  rejected: 'badge-rejected',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [providers, setProviders] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'stats') fetchStats();
    else if (activeTab === 'providers') fetchProviders();
    else if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'bookings') fetchBookings();
  }, [activeTab]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/stats');
      setStats(data.data);
    } catch (err) {
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/providers');
      setProviders(data.data);
    } catch (err) {
      toast.error('Failed to load providers');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/users');
      setUsers(data.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/bookings');
      setBookings(data.data);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const approveProvider = async (id, approved) => {
    try {
      await API.put(`/admin/providers/${id}/approve`, { approved });
      toast.success(approved ? 'Provider approved!' : 'Provider rejected');
      fetchProviders();
      fetchStats();
    } catch (err) {
      toast.error('Failed to update provider');
    }
  };

  const deleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    }
  };

  const tabs = ['stats', 'providers', 'users', 'bookings'];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-dark-200 mt-1">System overview and management</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
              ${activeTab === tab
                ? 'bg-primary-600 text-white'
                : 'bg-dark-600 text-dark-100 hover:bg-dark-500'
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* STATS TAB */}
      {activeTab === 'stats' && (
        loading ? <LoadingSpinner text="Loading stats..." /> : stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
            {[
              { label: 'Total Customers', value: stats.totalUsers, icon: HiUsers, color: 'from-blue-500 to-cyan-500' },
              { label: 'Total Providers', value: stats.totalProviders, icon: HiBriefcase, color: 'from-emerald-500 to-teal-500' },
              { label: 'Pending Approvals', value: stats.pendingProviders, icon: HiShieldCheck, color: 'from-yellow-500 to-orange-500' },
              { label: 'Total Bookings', value: stats.totalBookings, icon: HiClipboardList, color: 'from-purple-500 to-pink-500' },
            ].map((stat) => (
              <div key={stat.label} className="card-glow">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-dark-200">{stat.label}</p>
              </div>
            ))}
          </div>
        )
      )}

      {/* PROVIDERS TAB */}
      {activeTab === 'providers' && (
        loading ? <LoadingSpinner text="Loading providers..." /> : (
          providers.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-dark-200">No providers found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {providers.map((provider) => (
                <div key={provider._id} className="card-glow flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center font-bold text-sm">
                      {provider.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{provider.name}</p>
                      <p className="text-sm text-dark-200">{provider.email}</p>
                    </div>
                    <span className={provider.isApproved ? 'badge-accepted' : 'badge-pending'}>
                      {provider.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {!provider.isApproved && (
                      <button
                        onClick={() => approveProvider(provider._id, true)}
                        className="btn-success text-sm !py-2 !px-3 flex items-center gap-1"
                      >
                        <HiCheck className="w-4 h-4" /> Approve
                      </button>
                    )}
                    {provider.isApproved && (
                      <button
                        onClick={() => approveProvider(provider._id, false)}
                        className="btn-danger text-sm !py-2 !px-3 flex items-center gap-1"
                      >
                        <HiX className="w-4 h-4" /> Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        loading ? <LoadingSpinner text="Loading users..." /> : (
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u._id} className="card flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-dark-500 rounded-full flex items-center justify-center font-bold text-sm">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{u.name}</p>
                    <p className="text-sm text-dark-200">{u.email}</p>
                  </div>
                  <span className="badge bg-dark-500 text-dark-100">
                    {u.role}
                  </span>
                </div>
                <button
                  onClick={() => deleteUser(u._id)}
                  className="p-2 rounded-lg bg-dark-500 hover:bg-red-600 text-dark-200 hover:text-white transition-colors"
                >
                  <HiTrash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {/* BOOKINGS TAB */}
      {activeTab === 'bookings' && (
        loading ? <LoadingSpinner text="Loading bookings..." /> : (
          bookings.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-dark-200">No bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-500">
                    <th className="text-left py-3 px-4 text-dark-200 font-medium">Service</th>
                    <th className="text-left py-3 px-4 text-dark-200 font-medium">Customer</th>
                    <th className="text-left py-3 px-4 text-dark-200 font-medium">Provider</th>
                    <th className="text-left py-3 px-4 text-dark-200 font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-dark-200 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="border-b border-dark-600 hover:bg-dark-700/50">
                      <td className="py-3 px-4 text-white">{booking.service?.title || '-'}</td>
                      <td className="py-3 px-4 text-dark-100">{booking.customer?.name || '-'}</td>
                      <td className="py-3 px-4 text-dark-100">{booking.provider?.name || '-'}</td>
                      <td className="py-3 px-4 text-dark-200">{new Date(booking.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className={statusColors[booking.status]}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )
      )}
    </div>
  );
};

export default AdminDashboard;
