import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { HiCalendar, HiClock, HiLocationMarker, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'badge-pending',
  accepted: 'badge-accepted',
  rejected: 'badge-rejected',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
};

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await API.get('/bookings/my');
      setBookings(data.data);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await API.put(`/bookings/${id}/cancel`);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
          <p className="text-dark-200 mt-1">Welcome back, {user?.name}</p>
        </div>
        <Link to="/services" className="btn-primary text-sm">
          Browse Services
        </Link>
      </div>

      <h2 className="text-xl font-semibold text-white mb-4">My Bookings</h2>

      {loading ? (
        <div className="py-12"><LoadingSpinner text="Loading bookings..." /></div>
      ) : bookings.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-3">📋</div>
          <h3 className="text-lg font-semibold text-white mb-2">No bookings yet</h3>
          <p className="text-dark-200 mb-4">Find and book your first service!</p>
          <Link to="/services" className="btn-primary text-sm inline-block">
            Browse Services
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="card-glow">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link
                      to={`/services/${booking.service?._id}`}
                      className="text-lg font-semibold text-white hover:text-primary-400 transition-colors"
                    >
                      {booking.service?.title || 'Service'}
                    </Link>
                    <span className={statusColors[booking.status]}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-dark-200">
                    <span className="flex items-center gap-1">
                      <HiCalendar className="w-4 h-4" />
                      {new Date(booking.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <HiClock className="w-4 h-4" />
                      {booking.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <HiLocationMarker className="w-4 h-4" />
                      {booking.address}
                    </span>
                  </div>
                  {booking.provider && (
                    <p className="text-sm text-dark-100 mt-2">
                      Provider: <span className="text-white">{booking.provider.name}</span>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {(booking.status === 'pending' || booking.status === 'accepted') && (
                    <button
                      onClick={() => cancelBooking(booking._id)}
                      className="btn-danger text-sm !py-2 !px-3 flex items-center gap-1"
                    >
                      <HiX className="w-4 h-4" /> Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
