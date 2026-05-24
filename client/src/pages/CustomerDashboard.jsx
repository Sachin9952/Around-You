import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { HiCalendar, HiClock, HiLocationMarker, HiX, HiCheckCircle, HiChatAlt2 } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getSocket } from '../utils/socket';

const statusColors = {
  pending: 'bg-amber-50 text-amber-600 border-amber-200',
  accepted: 'bg-[#E0F5F3] text-[#45B1A8] border-[#45B1A8]/20',
  on_the_way: 'bg-purple-50 text-purple-600 border-purple-200',
  completed: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
};

const BookingTimeline = ({ status }) => {
  if (status === 'rejected') {
    return (
      <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs font-bold flex items-center gap-2">
        <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
        Booking was rejected by the provider.
      </div>
    );
  }
  if (status === 'cancelled') {
    return (
      <div className="mt-4 p-3 bg-gray-50 text-gray-700 border border-gray-200 rounded-2xl text-xs font-bold flex items-center gap-2">
        <span className="w-2 h-2 bg-gray-500 rounded-full" />
        You cancelled this booking.
      </div>
    );
  }

  const steps = [
    { label: 'Requested', key: 'pending' },
    { label: 'Accepted', key: 'accepted' },
    { label: 'On the way', key: 'on_the_way' },
    { label: 'Completed', key: 'completed' }
  ];

  const getStepIndex = (s) => {
    if (s === 'pending') return 0;
    if (s === 'accepted') return 1;
    if (s === 'on_the_way') return 2;
    if (s === 'completed') return 3;
    return -1;
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="mt-5 mb-3 px-2">
      <div className="relative flex justify-between items-center w-full">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
        {/* Active Progress Line */}
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-[#45B1A8] -translate-y-1/2 z-0 transition-all duration-500" 
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />
        
        {steps.map((step, idx) => {
          const isActive = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                isCurrent 
                  ? 'bg-white border-[#45B1A8] ring-4 ring-[#45B1A8]/20 text-[#45B1A8]'
                  : isActive 
                    ? 'bg-[#45B1A8] border-[#45B1A8] text-white' 
                    : 'bg-white border-gray-200 text-gray-400'
              }`}>
                {isActive ? (
                  <span className="text-[10px] font-black">✓</span>
                ) : (
                  <span className="text-[10px] font-black">{idx + 1}</span>
                )}
              </div>
              <span className={`text-[9px] sm:text-[10px] font-bold mt-1.5 ${
                isCurrent ? 'text-[#45B1A8] scale-105' : isActive ? 'text-[#1A2B2A]' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();

    const socket = getSocket();
    if (socket) {
      socket.connect();

      const handleStatusUpdate = (payload) => {
        const { bookingId, status } = payload;
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status } : b))
        );
        toast.success(`Booking status updated to ${status.replace(/_/g, ' ')}!`, {
          icon: '🔔',
          duration: 4000
        });
      };

      socket.on('booking_status_updated', handleStatusUpdate);

      return () => {
        socket.off('booking_status_updated', handleStatusUpdate);
      };
    }
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
                        <div className="flex flex-col">
                          <span className="line-clamp-2 break-words">
                            {booking.location?.address || (typeof booking.address === 'object' ? booking.address?.address : booking.address)}
                          </span>
                          {(booking.location?.placeName || booking.address?.placeName) && (
                            <span className="text-[10px] text-[#45B1A8] font-bold mt-0.5">
                              {booking.location?.placeName || booking.address?.placeName}
                            </span>
                          )}
                          {(booking.location?.manualAddress || booking.address?.manualAddress) && (
                            <span className="text-[11px] text-gray-500 italic mt-0.5">
                              Note: {booking.location?.manualAddress || booking.address?.manualAddress}
                            </span>
                          )}
                        </div>
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
                  
                  {/* Timeline */}
                  <BookingTimeline status={booking.status} />
                  
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
