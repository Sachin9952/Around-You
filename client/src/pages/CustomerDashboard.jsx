import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { HiCalendar, HiClock, HiLocationMarker, HiX, HiCheckCircle, HiChatAlt2 } from 'react-icons/hi';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-amber-50 text-amber-600 border-amber-200',
  accepted: 'bg-blue-50 text-blue-600 border-blue-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
  completed: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
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
    <div className="bg-[#F5FDFD] min-h-screen pt-6 sm:pt-8 pb-24 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dashboard Header */}
        <div className="bg-white p-5 sm:p-8 md:p-10 mb-6 sm:mb-8 rounded-2xl sm:rounded-[2rem] shadow-sm border border-[#E0F5F3] flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1A2B2A]">My Dashboard</h1>
            <p className="text-[#4A5568] mt-1 sm:mt-2 font-medium text-sm sm:text-base">Welcome back, <span className="text-[#45B1A8] font-bold">{user?.name}</span>!</p>
          </div>
          <Link to="/services" className="bg-[#45B1A8] text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-bold text-sm sm:text-base hover:bg-[#3a9990] hover:shadow-lg transition-all duration-300 text-center">
            Browse Services
          </Link>
        </div>

        <div className="flex items-center justify-between mb-4 sm:mb-6 px-1 sm:px-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#1A2B2A]">My Bookings</h2>
          <span className="bg-[#E0F5F3] text-[#45B1A8] px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold">
            {bookings.length} {bookings.length === 1 ? 'Booking' : 'Bookings'}
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center bg-white rounded-[2rem] border border-[#E0F5F3] shadow-sm">
            <LoadingSpinner text="Loading your bookings..." />
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white text-center py-20 px-4 rounded-[2.5rem] border border-[#E0F5F3] border-dashed shadow-sm">
            <div className="w-20 h-20 bg-[#F5FDFD] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#E0F5F3]">
              <HiCalendar className="w-10 h-10 text-[#45B1A8]" />
            </div>
            <h3 className="text-2xl font-extrabold text-[#1A2B2A] mb-3">No bookings yet!</h3>
            <p className="text-[#4A5568] mb-8 font-medium max-w-sm mx-auto">You haven't scheduled any services. Find a trusted professional and book your first service today!</p>
            <Link to="/services" className="bg-[#1A2B2A] text-white px-10 py-4 rounded-full font-bold hover:bg-black transition-colors shadow-md">
              Explore Services
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-[#E0F5F3] shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-4 sm:gap-6">
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <Link
                        to={booking.service?._id ? `/services/${booking.service._id}` : '#'}
                        className="text-lg sm:text-xl md:text-2xl font-black text-[#1A2B2A] hover:text-[#45B1A8] transition-colors break-words"
                      >
                        {booking.service?.title || booking.serviceTitle || 'Service unavailable'}
                      </Link>
                      {(booking.service?.isArchived || booking.service?.providerDeleted) && (
                        <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-gray-500 border border-gray-200">
                          No longer available
                        </span>
                      )}
                      <span className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wide border ${statusColors[booking.status]}`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-y-3 sm:gap-x-6 text-xs sm:text-sm font-medium text-[#4A5568] mb-4 sm:mb-6 bg-[#F5FDFD] p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-[#E0F5F3]">
                      <span className="flex items-center gap-2">
                        <HiCalendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#45B1A8] shrink-0" />
                        {new Date(booking.date).toLocaleDateString(undefined, {weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'})}
                      </span>
                      <span className="flex items-center gap-2">
                        <HiClock className="w-4 h-4 sm:w-5 sm:h-5 text-[#45B1A8] shrink-0" />
                        {booking.time}
                      </span>
                      <span className="flex items-start gap-2 col-span-1 sm:col-span-2">
                        <HiLocationMarker className="w-4 h-4 sm:w-5 sm:h-5 text-[#45B1A8] shrink-0 mt-0.5" />
                        <span className="line-clamp-2 break-words">
                          {typeof booking.address === 'object' ? booking.address?.address : booking.address}
                        </span>
                      </span>
                    </div>

                    {booking.provider ? (
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#E0F5F3] rounded-full flex items-center justify-center text-[#45B1A8] font-bold text-sm sm:text-base border border-[#45B1A8]/20 shrink-0">
                          {(booking.provider.name || booking.providerName || 'P').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-gray-400 mb-0.5">Assigned Professional</p>
                          <p className="text-xs sm:text-sm font-bold text-[#1A2B2A] truncate">{booking.provider.name || booking.providerName || 'Provider unavailable'}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-bold text-sm sm:text-base border border-gray-200 shrink-0">
                          P
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-gray-400 mb-0.5">Assigned Professional</p>
                          <p className="text-xs sm:text-sm font-medium text-gray-400 italic truncate">{booking.providerName || 'Provider unavailable'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-100">
                    
                    {booking.provider?._id && (
                      <Link
                        to={`/chat/${booking.provider._id}`}
                        className="w-full flex items-center justify-center gap-2 bg-white text-[#1A2B2A] border border-gray-200 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        <HiChatAlt2 className="w-4 h-4 text-[#45B1A8]" /> Message Pro
                      </Link>
                    )}

                    {(booking.status === 'pending' || booking.status === 'accepted') ? (
                      <button
                        onClick={() => cancelBooking(booking._id)}
                        className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-500 border border-red-100 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <HiX className="w-4 h-4" /> Cancel Booking
                      </button>
                    ) : booking.status === 'completed' && booking.service?._id && !booking.service?.isArchived ? (
                      <Link to={`/services/${booking.service._id}`} className="w-full flex items-center justify-center gap-2 bg-[#E0F5F3] text-[#45B1A8] px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm hover:bg-[#45B1A8] hover:text-white transition-colors">
                        <HiCheckCircle className="w-4 h-4" /> Leave Review
                      </Link>
                    ) : null}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
