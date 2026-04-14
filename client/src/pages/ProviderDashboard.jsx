import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { HiPlus, HiPencil, HiTrash, HiCheck, HiX, HiClock, HiExclamation, HiChatAlt2, HiCalendar, HiLocationMarker, HiCurrencyRupee, HiBriefcase } from 'react-icons/hi';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-amber-50 text-amber-600 border-amber-200',
  accepted: 'bg-blue-50 text-blue-600 border-blue-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
  completed: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
};

const categories = ['plumber', 'electrician', 'cleaner', 'painter', 'carpenter', 'mechanic', 'tutor', 'other'];

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
    else if (activeTab === 'services') fetchServices();
    else fetchBookings(); // messages tab also needs bookings for customer list
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

  const tabConfig = [
    { key: 'bookings', label: 'Bookings', icon: HiCalendar },
    { key: 'services', label: 'Services', icon: HiBriefcase },
    { key: 'messages', label: 'Messages', icon: HiChatAlt2 },
  ];

  return (
    <div className="bg-[#F5FDFD] min-h-screen pt-8 pb-24 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Dashboard Header */}
        <div className="bg-white p-8 md:p-10 mb-8 rounded-[2rem] shadow-sm border border-[#E0F5F3] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1A2B2A]">Provider Dashboard</h1>
            <p className="text-[#4A5568] mt-2 font-medium">Welcome back, <span className="text-[#45B1A8] font-bold">{user?.name}</span>!</p>
          </div>
          <div className="flex items-center gap-3">
            {!user?.isApproved && (
              <div className="flex items-center gap-2 bg-amber-50 text-amber-600 border border-amber-200 px-4 py-2.5 rounded-full text-sm font-bold">
                <HiExclamation className="w-4 h-4" />
                Pending Approval
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-8 px-2">
          {tabConfig.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                activeTab === key
                  ? 'bg-[#45B1A8] text-white shadow-md'
                  : 'bg-white text-[#4A5568] hover:bg-[#E0F5F3] hover:text-[#45B1A8] border border-[#E0F5F3]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div>
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-2xl font-bold text-[#1A2B2A]">Customer Messages</h2>
            </div>
            {bookings.length === 0 ? (
              <div className="bg-white text-center py-20 px-4 rounded-[2.5rem] border border-[#E0F5F3] border-dashed shadow-sm">
                <div className="w-20 h-20 bg-[#F5FDFD] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#E0F5F3]">
                  <HiChatAlt2 className="w-10 h-10 text-[#45B1A8]" />
                </div>
                <h3 className="text-2xl font-extrabold text-[#1A2B2A] mb-3">No messages yet</h3>
                <p className="text-[#4A5568] mb-4 font-medium max-w-sm mx-auto">Once customers book your services, you'll be able to chat with them here.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {bookings.map((booking) => (
                  booking.customer && (
                    <div key={booking._id} className="bg-white p-6 rounded-3xl border border-[#E0F5F3] shadow-sm hover:shadow-md transition-shadow flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#E0F5F3] rounded-full flex items-center justify-center text-[#45B1A8] font-bold text-lg border border-[#45B1A8]/20">
                          {(booking.customer.name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[#1A2B2A]">{booking.customer.name}</p>
                          <p className="text-sm text-[#4A5568] font-medium">{booking.customer.email}</p>
                        </div>
                      </div>
                      <button
                        className="flex items-center gap-2 bg-white text-[#1A2B2A] border border-gray-200 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm"
                        onClick={() => navigate(`/chat/${booking.customer._id}`)}
                      >
                        <HiChatAlt2 className="w-4 h-4 text-[#45B1A8]" /> Chat
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
          <div>
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-2xl font-bold text-[#1A2B2A]">Booking Requests</h2>
              <span className="bg-[#E0F5F3] text-[#45B1A8] px-3 py-1 rounded-full text-sm font-bold">
                {bookings.length} {bookings.length === 1 ? 'Request' : 'Requests'}
              </span>
            </div>

            {loading ? (
              <div className="py-20 flex justify-center bg-white rounded-[2rem] border border-[#E0F5F3] shadow-sm">
                <LoadingSpinner text="Loading bookings..." />
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-white text-center py-20 px-4 rounded-[2.5rem] border border-[#E0F5F3] border-dashed shadow-sm">
                <div className="w-20 h-20 bg-[#F5FDFD] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#E0F5F3]">
                  <HiCalendar className="w-10 h-10 text-[#45B1A8]" />
                </div>
                <h3 className="text-2xl font-extrabold text-[#1A2B2A] mb-3">No booking requests yet</h3>
                <p className="text-[#4A5568] mb-4 font-medium max-w-sm mx-auto">Booking requests from customers will appear here once they find your services.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {bookings.map((booking) => (
                  <div key={booking._id} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E0F5F3] shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <span className="text-xl sm:text-2xl font-black text-[#1A2B2A]">
                            {booking.service?.title || booking.serviceTitle || 'Service'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide border ${statusColors[booking.status]}`}>
                            {booking.status}
                          </span>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-y-3 gap-x-6 text-sm font-medium text-[#4A5568] mb-6 bg-[#F5FDFD] p-5 rounded-2xl border border-[#E0F5F3]">
                          <span className="flex items-center gap-2">
                            <HiCalendar className="w-5 h-5 text-[#45B1A8]" />
                            {new Date(booking.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-2">
                            <HiClock className="w-5 h-5 text-[#45B1A8]" />
                            {booking.time}
                          </span>
                          {booking.address && (
                            <span className="flex items-start gap-2 sm:col-span-2">
                              <HiLocationMarker className="w-5 h-5 text-[#45B1A8] shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{booking.address}</span>
                            </span>
                          )}
                        </div>

                        {booking.notes && (
                          <div className="bg-[#F5FDFD] p-4 rounded-2xl border border-[#E0F5F3] mb-5">
                            <p className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-1">Customer Notes</p>
                            <p className="text-sm font-medium text-[#4A5568]">{booking.notes}</p>
                          </div>
                        )}

                        {/* Customer Info */}
                        {booking.customer ? (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#E0F5F3] rounded-full flex items-center justify-center text-[#45B1A8] font-bold border border-[#45B1A8]/20">
                              {(booking.customer.name || booking.customerName || 'C').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-0.5">Customer</p>
                              <p className="text-sm font-bold text-[#1A2B2A]">
                                {booking.customer.name || booking.customerName || 'Customer unavailable'}
                                {booking.customer.phone && <span className="text-[#4A5568] font-medium"> — {booking.customer.phone}</span>}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-bold border border-gray-200">
                              C
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-0.5">Customer</p>
                              <p className="text-sm font-medium text-gray-400 italic">{booking.customerName || 'Customer unavailable'}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex sm:flex-col items-center justify-end gap-3 shrink-0 pt-4 sm:pt-0 border-t border-gray-100 sm:border-0 w-full sm:w-auto mt-4 sm:mt-0">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateBookingStatus(booking._id, 'accepted')}
                              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-200 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-emerald-500 hover:text-white transition-colors"
                            >
                              <HiCheck className="w-4 h-4" /> Accept
                            </button>
                            <button
                              onClick={() => updateBookingStatus(booking._id, 'rejected')}
                              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-50 text-red-500 border border-red-100 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-red-500 hover:text-white transition-colors"
                            >
                              <HiX className="w-4 h-4" /> Reject
                            </button>
                          </>
                        )}
                        {booking.status === 'accepted' && (
                          <button
                            onClick={() => updateBookingStatus(booking._id, 'completed')}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#E0F5F3] text-[#45B1A8] px-6 py-2.5 rounded-full font-bold text-sm hover:bg-[#45B1A8] hover:text-white transition-colors"
                          >
                            <HiCheck className="w-4 h-4" /> Mark Complete
                          </button>
                        )}
                        {booking.customer?._id && (
                          <button
                            onClick={() => navigate(`/chat/${booking.customer._id}`)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-[#1A2B2A] border border-gray-200 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm"
                          >
                            <HiChatAlt2 className="w-4 h-4 text-[#45B1A8]" /> Message
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SERVICES TAB */}
        {activeTab === 'services' && (
          <div>
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-2xl font-bold text-[#1A2B2A]">My Services</h2>
              <button
                onClick={() => {
                  setEditingService(null);
                  setServiceForm({ title: '', description: '', category: 'plumber', price: '', priceType: 'fixed', location: '' });
                  setShowServiceForm(!showServiceForm);
                }}
                className="bg-[#45B1A8] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-[#3a9990] hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <HiPlus className="w-4 h-4" /> Add Service
              </button>
            </div>

            {/* Service Form */}
            {showServiceForm && (
              <div className="bg-white p-8 md:p-10 mb-8 rounded-[2rem] shadow-sm border border-[#E0F5F3]">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-[#E0F5F3] rounded-full flex items-center justify-center">
                    <HiBriefcase className="w-5 h-5 text-[#45B1A8]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1A2B2A]">
                    {editingService ? 'Edit Service' : 'Create New Service'}
                  </h3>
                </div>
                <form onSubmit={handleServiceSubmit} className="grid sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-[#1A2B2A] mb-2 pl-1">Service Title</label>
                    <input
                      type="text"
                      value={serviceForm.title}
                      onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                      className="w-full bg-[#F5FDFD] text-[#1A2B2A] font-medium border border-[#E0F5F3] rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-[#45B1A8]/50 focus:border-[#45B1A8] transition-all outline-none"
                      placeholder="e.g. Full House Deep Cleaning"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-[#1A2B2A] mb-2 pl-1">Description</label>
                    <textarea
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                      className="w-full bg-[#F5FDFD] text-[#1A2B2A] font-medium border border-[#E0F5F3] rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-[#45B1A8]/50 focus:border-[#45B1A8] transition-all outline-none resize-none"
                      rows="3"
                      placeholder="Describe your service in detail..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#1A2B2A] mb-2 pl-1">Category</label>
                    <select
                      value={serviceForm.category}
                      onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                      className="w-full bg-[#F5FDFD] text-[#1A2B2A] font-medium border border-[#E0F5F3] rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-[#45B1A8]/50 focus:border-[#45B1A8] transition-all outline-none"
                    >
                      {categories.map(c => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#1A2B2A] mb-2 pl-1">Location</label>
                    <input
                      type="text"
                      value={serviceForm.location}
                      onChange={(e) => setServiceForm({ ...serviceForm, location: e.target.value })}
                      className="w-full bg-[#F5FDFD] text-[#1A2B2A] font-medium border border-[#E0F5F3] rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-[#45B1A8]/50 focus:border-[#45B1A8] transition-all outline-none"
                      placeholder="City / Area"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#1A2B2A] mb-2 pl-1">Price (₹)</label>
                    <input
                      type="number"
                      value={serviceForm.price}
                      onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                      className="w-full bg-[#F5FDFD] text-[#1A2B2A] font-medium border border-[#E0F5F3] rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-[#45B1A8]/50 focus:border-[#45B1A8] transition-all outline-none"
                      min="0"
                      placeholder="500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#1A2B2A] mb-2 pl-1">Price Type</label>
                    <select
                      value={serviceForm.priceType}
                      onChange={(e) => setServiceForm({ ...serviceForm, priceType: e.target.value })}
                      className="w-full bg-[#F5FDFD] text-[#1A2B2A] font-medium border border-[#E0F5F3] rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-[#45B1A8]/50 focus:border-[#45B1A8] transition-all outline-none"
                    >
                      <option value="fixed">Fixed (per job)</option>
                      <option value="hourly">Hourly</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2 flex gap-3 pt-2">
                    <button type="submit" className="bg-[#45B1A8] text-white px-10 py-3.5 rounded-full font-bold hover:bg-[#3a9990] hover:shadow-lg transition-all duration-300" disabled={formLoading}>
                      {formLoading ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowServiceForm(false); setEditingService(null); }}
                      className="bg-white text-[#4A5568] border border-gray-200 px-8 py-3.5 rounded-full font-bold hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <div className="py-20 flex justify-center bg-white rounded-[2rem] border border-[#E0F5F3] shadow-sm">
                <LoadingSpinner text="Loading services..." />
              </div>
            ) : services.length === 0 ? (
              <div className="bg-white text-center py-20 px-4 rounded-[2.5rem] border border-[#E0F5F3] border-dashed shadow-sm">
                <div className="w-20 h-20 bg-[#F5FDFD] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#E0F5F3]">
                  <HiBriefcase className="w-10 h-10 text-[#45B1A8]" />
                </div>
                <h3 className="text-2xl font-extrabold text-[#1A2B2A] mb-3">No services yet</h3>
                <p className="text-[#4A5568] mb-8 font-medium max-w-sm mx-auto">Create your first service listing and start receiving bookings from customers!</p>
                <button
                  onClick={() => {
                    setEditingService(null);
                    setServiceForm({ title: '', description: '', category: 'plumber', price: '', priceType: 'fixed', location: '' });
                    setShowServiceForm(true);
                  }}
                  className="bg-[#1A2B2A] text-white px-10 py-4 rounded-full font-bold hover:bg-black transition-colors shadow-md inline-flex items-center gap-2"
                >
                  <HiPlus className="w-5 h-5" /> Create First Service
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {services.map((service) => (
                  <div key={service._id} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E0F5F3] shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0 mr-3">
                        <h3 className="text-lg font-black text-[#1A2B2A] mb-1 line-clamp-1">{service.title}</h3>
                        <span className="inline-block bg-[#E0F5F3] text-[#45B1A8] text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
                          {service.category}
                        </span>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => editService(service)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#F5FDFD] hover:bg-[#E0F5F3] text-[#4A5568] hover:text-[#45B1A8] transition-colors border border-[#E0F5F3]"
                        >
                          <HiPencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteService(service._id)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#F5FDFD] hover:bg-red-50 text-[#4A5568] hover:text-red-500 transition-colors border border-[#E0F5F3]"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-[#4A5568] font-medium mb-5 line-clamp-2">{service.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-[#E0F5F3]/60">
                      <div className="flex items-center gap-1.5">
                        <HiCurrencyRupee className="w-5 h-5 text-[#45B1A8]" />
                        <span className="text-xl font-black text-[#1A2B2A]">₹{service.price}</span>
                        <span className="text-sm text-[#4A5568] font-medium">/ {service.priceType === 'hourly' ? 'hr' : 'job'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-[#4A5568] bg-[#F5FDFD] px-3 py-1.5 rounded-xl border border-[#E0F5F3]">
                        <HiLocationMarker className="w-4 h-4 text-[#45B1A8]" />
                        <span className="truncate max-w-[100px]">{service.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ProviderDashboard;
