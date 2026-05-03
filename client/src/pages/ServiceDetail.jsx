import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import LoadingSpinner from '../components/LoadingSpinner';
import BookingLocationPicker from '../components/BookingLocationPicker';
import { HiStar, HiLocationMarker, HiCurrencyRupee, HiPhone, HiMail, HiCalendar, HiChatAlt2, HiCheckCircle, HiExclamation } from 'react-icons/hi';
import toast from 'react-hot-toast';

const categoryImages = {
  plumber: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=80',
  electrician: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80',
  cleaner: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
  painter: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80',
  carpenter: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=1200&q=80',
  mechanic: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80',
  tutor: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
  default: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=1200&q=80'
};

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    address: { address: '', lat: null, lng: null },
    notes: '',
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    fetchService();
    fetchReviews();
  }, [id]);

  const fetchService = async () => {
    try {
      const { data } = await API.get(`/services/${id}`);
      setService(data.data);
    } catch (err) {
      toast.error('Service not found');
      navigate('/services');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await API.get(`/reviews/service/${id}`);
      setReviews(data.data);
    } catch (err) {
      console.error('Failed to fetch reviews');
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to book a service');
      return navigate('/login');
    }

    setBookingLoading(true);
    try {
      await API.post('/bookings', {
        service: id,
        ...bookingData,
      });
      toast.success('Booking created successfully!');
      setShowBookingForm(false);
      setBookingData({ date: '', time: '', address: { address: '', lat: null, lng: null }, notes: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error('Please login to review');

    setReviewLoading(true);
    try {
      await API.post('/reviews', {
        service: id,
        ...reviewData,
      });
      toast.success('Review submitted!');
      setReviewData({ rating: 5, comment: '' });
      fetchReviews();
      fetchService(); // refresh rating
    } catch (err) {
      toast.error(err.response?.data?.error || 'Review failed');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5FDFD] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading service details..." />
      </div>
    );
  }

  if (!service) return null;

  return (
    <div className="bg-[#F5FDFD] min-h-screen pt-12 pb-24 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
        
        {/* Service Header Card */}
        <div className="bg-white mb-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(69,177,168,0.06)] border border-[#E0F5F3] overflow-hidden">
          {/* Hero Banner Image */}
          <div className="w-full h-56 sm:h-72 md:h-96 relative overflow-hidden bg-[#1A2B2A] flex justify-center items-center">
            {/* Blurred background layout for professional uncropped look */}
            <div 
              className="absolute inset-0 bg-cover bg-center blur-2xl opacity-50 scale-125"
              style={{ backgroundImage: `url(${service.image || categoryImages[service.category] || categoryImages.default})` }}
            ></div>
            
            {/* The actual uncropped responsive image */}
            <img 
              src={service.image || categoryImages[service.category] || categoryImages.default} 
              alt={service.title} 
              className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
            />
            
            {/* Gradient Overlay for blending */}
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#1A2B2A]/40 via-transparent to-transparent pointer-events-none"></div>
          </div>
          
          <div className="p-8 md:p-12">
            {/* Archived Service Banner */}
            {service.isBookable === false && (
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 mb-8">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                  <HiExclamation className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-amber-800 font-bold text-sm">This service is currently unavailable</p>
                  <p className="text-amber-600 text-xs font-medium">The service provider is unavailable or their account has been removed. This page is kept for your booking history.</p>
                </div>
              </div>
            )}
            <div className="flex flex-col lg:flex-row lg:items-start gap-10">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-[#E0F5F3] text-[#45B1A8] px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide">
                  {service.category}
                </span>
                {service.averageRating > 0 && (
                  <div className="flex items-center gap-1.5 bg-[#F5FDFD] px-3 py-1.5 border border-[#E0F5F3] rounded-full">
                    <HiStar className="w-5 h-5 text-[#45B1A8]" />
                    <span className="font-extrabold text-[#1A2B2A]">{service.averageRating.toFixed(1)}</span>
                    <span className="text-[#4A5568] text-sm font-medium">({service.totalReviews} reviews)</span>
                  </div>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold text-[#1A2B2A] mb-6 leading-tight tracking-tight">
                {service.title}
              </h1>
              <p className="text-lg text-[#4A5568] leading-relaxed mb-8">
                {service.description || 'Experience top-tier quality and convenience with our professional service designed to meet your specific needs perfectly.'}
              </p>

              <div className="flex flex-col sm:flex-row gap-6 mb-8 bg-[#F5FDFD] p-6 rounded-3xl border border-[#E0F5F3]">
                <div className="flex-1">
                  <span className="text-sm uppercase tracking-wider font-bold text-gray-400 block mb-1">Pricing</span>
                  <div className="flex items-center gap-1.5">
                    <HiCurrencyRupee className="w-6 h-6 text-[#45B1A8]" />
                    <span className="text-3xl font-black text-[#1A2B2A]">₹{service.price}</span>
                    <span className="text-[#4A5568] font-medium ml-1">/ {service.priceType === 'hourly' ? 'hour' : 'job'}</span>
                  </div>
                </div>
                {service.location && (
                  <div className="w-px bg-[#E0F5F3] hidden sm:block"></div>
                )}
                {service.location && (
                  <div className="flex-1">
                    <span className="text-sm uppercase tracking-wider font-bold text-gray-400 block mb-2">Location</span>
                    <div className="flex items-center gap-2 text-[#1A2B2A] font-semibold">
                      <HiLocationMarker className="w-5 h-5 text-[#45B1A8]" />
                      {typeof service.location === 'object' ? service.location?.address : service.location}
                    </div>
                  </div>
                )}
              </div>

              {/* Book Button (Desktop Placement) */}
              {user && user._id !== service.provider?._id && service.isBookable !== false && (
                <div className="hidden lg:block mt-8">
                  <button
                    onClick={() => setShowBookingForm(!showBookingForm)}
                    className="bg-[#45B1A8] text-white px-8 py-4 rounded-full font-bold hover:bg-[#3a9990] hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2 text-lg"
                  >
                    <HiCalendar className="w-6 h-6" />
                    {showBookingForm ? 'Cancel Booking' : 'Book This Service'}
                  </button>
                </div>
              )}
            </div>

            {/* Provider Info Card */}
            {service.provider ? (
              <div className="lg:w-80 flex-shrink-0 bg-white border-2 border-[#E0F5F3] rounded-[2rem] p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <HiCheckCircle className="w-5 h-5 text-[#45B1A8]" />
                  <h3 className="text-sm font-bold text-[#1A2B2A] uppercase tracking-wider">Service Provider</h3>
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-[#F5FDFD] rounded-full flex items-center justify-center text-2xl font-black text-[#45B1A8] border border-[#E0F5F3]">
                    {service.provider.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-extrabold text-xl text-[#1A2B2A]">{service.provider.name}</p>
                    <span className="text-sm font-medium text-[#4A5568]">Verified Professional</span>
                  </div>
                </div>
                
                <div className="space-y-4 mb-8">
                  {service.provider.phone && (
                    <div className="flex items-center gap-3 text-[#4A5568] font-medium bg-[#F5FDFD] p-3 rounded-2xl">
                      <HiPhone className="w-5 h-5 text-[#45B1A8]" />
                      {service.provider.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-[#4A5568] font-medium bg-[#F5FDFD] p-3 rounded-2xl overflow-hidden text-ellipsis">
                    <HiMail className="w-5 h-5 text-[#45B1A8]" />
                    <span className="truncate">{service.provider.email}</span>
                  </div>
                </div>

                {/* Chat with Provider Button — hidden for own service */}
                {user && user._id !== service.provider._id && service.isBookable !== false && (
                  <button
                    className="w-full bg-white border-2 border-[#45B1A8] text-[#45B1A8] hover:bg-[#45B1A8] hover:text-white px-6 py-3 rounded-full font-bold transition-colors inline-flex items-center justify-center gap-2"
                    onClick={() => navigate(`/chat/${service.provider._id}`)}
                  >
                    <HiChatAlt2 className="w-5 h-5" />
                    Chat Now
                  </button>
                )}
              </div>
            ) : (
              <div className="lg:w-80 flex-shrink-0 bg-gray-50 border-2 border-gray-200 rounded-[2rem] p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <HiExclamation className="w-5 h-5 text-gray-400" />
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Service Provider</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl font-black text-gray-300 border border-gray-200">
                    P
                  </div>
                  <div>
                    <p className="font-extrabold text-xl text-gray-400">Provider unavailable</p>
                    <span className="text-sm font-medium text-gray-400">Account has been removed</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Book Button (Mobile Placement) */}
            {user && user._id !== service.provider?._id && service.isBookable !== false && (
              <div className="block lg:hidden w-full mt-4">
                <button
                  onClick={() => setShowBookingForm(!showBookingForm)}
                  className="w-full justify-center bg-[#45B1A8] text-white px-8 py-4 rounded-full font-bold hover:bg-[#3a9990] hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2 text-lg"
                >
                  <HiCalendar className="w-6 h-6" />
                  {showBookingForm ? 'Cancel Booking' : 'Book This Service'}
                </button>
              </div>
            )}

            </div>
          </div>
        </div>

        {/* Booking Form */}
        {showBookingForm && (
          <div className="bg-white p-8 md:p-12 mb-8 rounded-[2.5rem] shadow-sm border border-[#E0F5F3] animate-fade-in origin-top">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-[#E0F5F3] rounded-full flex items-center justify-center">
                <HiCalendar className="w-5 h-5 text-[#45B1A8]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1A2B2A]">Schedule Your Appointment</h2>
            </div>
            
            <form onSubmit={handleBooking} className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#1A2B2A] mb-2 pl-1">Preferred Date</label>
                <input
                  type="date"
                  value={bookingData.date}
                  onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  className="w-full bg-[#F5FDFD] text-[#1A2B2A] font-medium border border-[#E0F5F3] rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-[#45B1A8]/50 focus:border-[#45B1A8] transition-all outline-none"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#1A2B2A] mb-2 pl-1">Preferred Time</label>
                <select
                  value={bookingData.time}
                  onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                  className="w-full bg-[#F5FDFD] text-[#1A2B2A] font-medium border border-[#E0F5F3] rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-[#45B1A8]/50 focus:border-[#45B1A8] transition-all outline-none"
                  required
                >
                  <option value="">Select a time slot...</option>
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="05:00 PM">05:00 PM</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <BookingLocationPicker 
                  selectedLocation={bookingData.address}
                  onLocationChange={(loc) => setBookingData({ ...bookingData, address: loc })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-[#1A2B2A] mb-2 pl-1">Additional Notes (Optional)</label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                  className="w-full bg-[#F5FDFD] text-[#1A2B2A] font-medium border border-[#E0F5F3] rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-[#45B1A8]/50 focus:border-[#45B1A8] transition-all outline-none resize-none"
                  rows="3"
                  placeholder="Any specific instructions or requirements..."
                />
              </div>
              <div className="md:col-span-2 pt-2">
                <button type="submit" className="w-full md:w-auto bg-[#45B1A8] text-white px-10 py-4 rounded-full font-bold hover:bg-[#3a9990] hover:shadow-lg transition-all duration-300" disabled={bookingLoading}>
                  {bookingLoading ? 'Processing Booking...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reviews Section */}
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-[#E0F5F3]">
          <h2 className="text-2xl font-bold text-[#1A2B2A] mb-8">
            Customer Reviews {reviews.length > 0 && <span className="text-[#45B1A8]">({reviews.length})</span>}
          </h2>

          {/* Review Form */}
          {user && user.role !== 'admin' && (
            <form onSubmit={handleReview} className="bg-[#F5FDFD] p-6 sm:p-8 rounded-[2rem] border border-[#E0F5F3] mb-10">
              <h3 className="text-lg font-bold text-[#1A2B2A] mb-4">Share Your Experience</h3>
              <div className="mb-4 bg-white inline-flex px-4 py-2 rounded-full border border-[#E0F5F3]">
                <StarRating
                  rating={reviewData.rating}
                  onRate={(r) => setReviewData({ ...reviewData, rating: r })}
                />
              </div>
              <textarea
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                className="w-full bg-white text-[#1A2B2A] font-medium border border-[#E0F5F3] rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-[#45B1A8]/50 focus:border-[#45B1A8] transition-all outline-none resize-none mb-4"
                rows="3"
                placeholder="How was the service?"
              />
              <button type="submit" className="bg-[#1A2B2A] text-white px-8 py-3 rounded-full font-bold hover:bg-black transition-colors" disabled={reviewLoading}>
                {reviewLoading ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          )}

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div className="text-center py-12 px-4 bg-[#F5FDFD] rounded-[2rem] border border-[#E0F5F3] border-dashed">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-[#E0F5F3]">
                <HiStar className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-[#4A5568] font-medium text-lg">No reviews yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {reviews.map((review) => (
                <div key={review._id} className="bg-white p-6 rounded-3xl border border-[#E0F5F3] shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-[#F5FDFD] text-[#45B1A8] rounded-full flex items-center justify-center text-lg font-bold border border-[#E0F5F3]">
                      {review.customer?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-base font-bold text-[#1A2B2A] leading-tight mb-1">{review.customer?.name}</p>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        {new Date(review.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                      </p>
                    </div>
                    <div className="ml-auto bg-[#F5FDFD] px-2 py-1 rounded-lg">
                      <StarRating rating={review.rating} readonly size="sm" />
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm font-medium text-[#4A5568] leading-relaxed">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ServiceDetail;
