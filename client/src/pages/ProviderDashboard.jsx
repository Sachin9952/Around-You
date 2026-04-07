import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { HiPlus, HiPencil, HiTrash, HiCheck, HiX, HiClock, HiExclamation } from 'react-icons/hi';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'badge-pending',
  accepted: 'badge-accepted',
  rejected: 'badge-rejected',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
};

const categories = ['plumber', 'electrician', 'cleaner', 'painter', 'carpenter', 'mechanic', 'tutor', 'other'];

import { useNavigate } from 'react-router-dom';
import { HiChatAlt2 } from 'react-icons/hi';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Service form
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    title: '', description: '', category: 'plumber', price: '', priceType: 'fixed', location: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'bookings') fetchBookings();
    else fetchServices();
  }, [activeTab]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/bookings/provider');
      setBookings(data.data);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/services/provider/my');
      setServices(data.data);
    } catch (err) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      await API.put(`/bookings/${id}/status`, { status });
      toast.success(`Booking ${status}`);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingService) {
        await API.put(`/services/${editingService._id}`, serviceForm);
        toast.success('Service updated!');
      } else {
        await API.post('/services', serviceForm);
        toast.success('Service created!');
      }
      setShowServiceForm(false);
      setEditingService(null);
      setServiceForm({ title: '', description: '', category: 'plumber', price: '', priceType: 'fixed', location: '' });
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save service');
    } finally {
      setFormLoading(false);
    }
  };

  const editService = (service) => {
    setEditingService(service);
    setServiceForm({
      title: service.title,
      description: service.description,
      category: service.category,
      price: service.price,
      priceType: service.priceType,
      location: service.location,
    });
    setShowServiceForm(true);
  };

  const deleteService = async (id) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await API.delete(`/services/${id}`);
      toast.success('Service deleted');
      fetchServices();
    } catch (err) {
      toast.error('Failed to delete service');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Provider Dashboard</h1>
          <p className="text-dark-200 mt-1">Welcome, {user?.name}</p>
        </div>
        {!user?.isApproved && (
          <div className="badge-pending flex items-center gap-1.5 text-sm !px-3 !py-1.5">
            <HiExclamation className="w-4 h-4" />
            Pending Approval
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['bookings', 'services', 'messages'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === tab
                ? 'bg-primary-600 text-white'
                : 'bg-dark-600 text-dark-100 hover:bg-dark-500'
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      {/* MESSAGES TAB */}
      {activeTab === 'messages' && (
        <div className="card p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><HiChatAlt2 className="w-6 h-6" />Messages</h2>
          {bookings.length === 0 ? (
            <div className="text-dark-200">No customers to chat with yet.</div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                booking.customer && (
                  <div key={booking._id} className="flex items-center justify-between bg-dark-700 rounded-lg p-4">
                    <div>
                      <div className="font-semibold text-white">{booking.customer.name}</div>
                      <div className="text-dark-200 text-sm">{booking.customer.email}</div>
                    </div>
                    <button
                      className="btn-secondary flex items-center gap-2"
                      onClick={() => navigate(`/chat/${booking.customer._id}`)}
                    >
                      <HiChatAlt2 className="w-5 h-5" /> Chat
                    </button>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      )}

      {/* BOOKINGS TAB */}
      {activeTab === 'bookings' && (
        loading ? <LoadingSpinner text="Loading bookings..." /> : (
          bookings.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-5xl mb-3">📬</div>
              <h3 className="text-lg font-semibold text-white">No booking requests yet</h3>
              <p className="text-dark-200">Booking requests from customers will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking._id} className="card-glow">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-white">
                          {booking.service?.title || 'Service'}
                        </span>
                        <span className={statusColors[booking.status]}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-dark-200 mb-1">
                        <span className="flex items-center gap-1">
                          <HiClock className="w-4 h-4" />
                          {new Date(booking.date).toLocaleDateString()} at {booking.time}
                        </span>
                      </div>
                      <p className="text-sm text-dark-100">
                        Customer: <span className="text-white">{booking.customer?.name}</span>
                        {booking.customer?.phone && ` — ${booking.customer.phone}`}
                      </p>
                      {booking.address && (
                        <p className="text-sm text-dark-200">📍 {booking.address}</p>
                      )}
                      {booking.notes && (
                        <p className="text-sm text-dark-200 mt-1">💬 {booking.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateBookingStatus(booking._id, 'accepted')}
                            className="btn-success text-sm !py-2 !px-3 flex items-center gap-1"
                          >
                            <HiCheck className="w-4 h-4" /> Accept
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking._id, 'rejected')}
                            className="btn-danger text-sm !py-2 !px-3 flex items-center gap-1"
                          >
                            <HiX className="w-4 h-4" /> Reject
                          </button>
                        </>
                      )}
                      {booking.status === 'accepted' && (
                        <button
                          onClick={() => updateBookingStatus(booking._id, 'completed')}
                          className="btn-primary text-sm !py-2 !px-3 flex items-center gap-1"
                        >
                          <HiCheck className="w-4 h-4" /> Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )
      )}

      {/* SERVICES TAB */}
      {activeTab === 'services' && (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                setEditingService(null);
                setServiceForm({ title: '', description: '', category: 'plumber', price: '', priceType: 'fixed', location: '' });
                setShowServiceForm(!showServiceForm);
              }}
              className="btn-primary text-sm flex items-center gap-1"
            >
              <HiPlus className="w-4 h-4" /> Add Service
            </button>
          </div>

          {/* Service Form */}
          {showServiceForm && (
            <div className="glass p-6 mb-6 animate-slide-up">
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingService ? 'Edit Service' : 'New Service'}
              </h3>
              <form onSubmit={handleServiceSubmit} className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-dark-100 mb-1.5">Title</label>
                  <input
                    type="text"
                    value={serviceForm.title}
                    onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-dark-100 mb-1.5">Description</label>
                  <textarea
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    className="input-field resize-none"
                    rows="3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-100 mb-1.5">Category</label>
                  <select
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                    className="input-field"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-100 mb-1.5">Location</label>
                  <input
                    type="text"
                    value={serviceForm.location}
                    onChange={(e) => setServiceForm({ ...serviceForm, location: e.target.value })}
                    className="input-field"
                    placeholder="City / Area"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-100 mb-1.5">Price (₹)</label>
                  <input
                    type="number"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                    className="input-field"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-100 mb-1.5">Price Type</label>
                  <select
                    value={serviceForm.priceType}
                    onChange={(e) => setServiceForm({ ...serviceForm, priceType: e.target.value })}
                    className="input-field"
                  >
                    <option value="fixed">Fixed (per job)</option>
                    <option value="hourly">Hourly</option>
                  </select>
                </div>
                <div className="sm:col-span-2 flex gap-3">
                  <button type="submit" className="btn-primary" disabled={formLoading}>
                    {formLoading ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowServiceForm(false); setEditingService(null); }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? <LoadingSpinner text="Loading services..." /> : (
            services.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-5xl mb-3">🛠️</div>
                <h3 className="text-lg font-semibold text-white">No services yet</h3>
                <p className="text-dark-200">Create your first service listing!</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div key={service._id} className="card-glow">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white">{service.title}</h3>
                      <div className="flex gap-1">
                        <button
                          onClick={() => editService(service)}
                          className="p-1.5 rounded-lg bg-dark-500 hover:bg-dark-400 text-dark-100 hover:text-white transition-colors"
                        >
                          <HiPencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteService(service._id)}
                          className="p-1.5 rounded-lg bg-dark-500 hover:bg-red-600 text-dark-100 hover:text-white transition-colors"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-dark-200 mb-3 line-clamp-2">{service.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-primary-400 font-semibold">
                        ₹{service.price}/{service.priceType === 'hourly' ? 'hr' : 'job'}
                      </span>
                      <span className="text-dark-200">{service.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

export default ProviderDashboard;
