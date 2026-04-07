import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import LoadingSpinner from '../components/LoadingSpinner';
import { HiStar, HiLocationMarker, HiCurrencyRupee, HiPhone, HiMail, HiCalendar, HiChatAlt2 } from 'react-icons/hi';
import toast from 'react-hot-toast';

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
    address: '',
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
      setBookingData({ date: '', time: '', address: '', notes: '' });
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
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading service..." />
      </div>
    );
  }

  if (!service) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Service Header */}
      <div className="glass p-8 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="badge bg-primary-500/20 text-primary-400 text-sm">
                {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
              </span>
              {service.averageRating > 0 && (
                <div className="flex items-center gap-1">
                  <HiStar className="w-5 h-5 text-yellow-400" />
                  <span className="font-semibold">{service.averageRating.toFixed(1)}</span>
                  <span className="text-dark-200 text-sm">({service.totalReviews} reviews)</span>
                </div>
              )}
            </div>

            <h1 className="text-3xl font-bold text-white mb-3">{service.title}</h1>
            <p className="text-dark-100 leading-relaxed mb-4">{service.description}</p>

            <div className="flex flex-wrap gap-4 text-sm text-dark-200">
              <div className="flex items-center gap-1.5">
                <HiLocationMarker className="w-4 h-4 text-primary-400" />
                {service.location}
              </div>
              <div className="flex items-center gap-1.5">
                <HiCurrencyRupee className="w-4 h-4 text-emerald-400" />
                <span className="text-white font-semibold">₹{service.price}</span>
                <span>/ {service.priceType === 'hourly' ? 'hour' : 'job'}</span>
              </div>
            </div>
          </div>

          {/* Provider Info */}
          {service.provider && (
            <div className="card lg:w-72 flex-shrink-0">
              <h3 className="text-sm font-semibold text-dark-200 mb-3">SERVICE PROVIDER</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-lg font-bold">
                  {service.provider.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-white">{service.provider.name}</p>
                </div>
              </div>
              {service.provider.phone && (
                <div className="flex items-center gap-2 text-sm text-dark-100 mb-1">
                  <HiPhone className="w-4 h-4" />
                  {service.provider.phone}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-dark-100">
                <HiMail className="w-4 h-4" />
                {service.provider.email}
              </div>
              {/* Chat with Provider Button */}
              {user && user._id !== service.provider._id && (
                <button
                  className="btn-secondary inline-flex items-center gap-2 mt-4"
                  onClick={() => navigate(`/chat/${service.provider._id}`)}
                >
                  <HiChatAlt2 className="w-5 h-5" />
                  Chat with Provider
                </button>
              )}
            </div>
          )}
        </div>

        {/* Book Button */}
        {user?.role === 'customer' && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <button
              onClick={() => setShowBookingForm(!showBookingForm)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <HiCalendar className="w-5 h-5" />
              {showBookingForm ? 'Cancel' : 'Book This Service'}
            </button>
          </div>
        )}
      </div>

      {/* Booking Form */}
      {showBookingForm && (
        <div className="glass p-8 mb-6 animate-slide-up">
          <h2 className="text-xl font-bold text-white mb-4">Book Service</h2>
          <form onSubmit={handleBooking} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-100 mb-1.5">Date</label>
              <input
                type="date"
                value={bookingData.date}
                onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                className="input-field"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-100 mb-1.5">Time</label>
              <select
                value={bookingData.time}
                onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Select time slot</option>
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
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-dark-100 mb-1.5">Address</label>
              <input
                type="text"
                value={bookingData.address}
                onChange={(e) => setBookingData({ ...bookingData, address: e.target.value })}
                className="input-field"
                placeholder="Your service address"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-dark-100 mb-1.5">Notes (optional)</label>
              <textarea
                value={bookingData.notes}
                onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                className="input-field resize-none"
                rows="3"
                placeholder="Any specific requirements..."
              />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="btn-primary" disabled={bookingLoading}>
                {bookingLoading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews Section */}
      <div className="glass p-8">
        <h2 className="text-xl font-bold text-white mb-6">
          Reviews {reviews.length > 0 && `(${reviews.length})`}
        </h2>

        {/* Review Form */}
        {user?.role === 'customer' && (
          <form onSubmit={handleReview} className="card mb-6">
            <h3 className="text-sm font-semibold text-dark-100 mb-3">Write a Review</h3>
            <div className="mb-3">
              <StarRating
                rating={reviewData.rating}
                onRate={(r) => setReviewData({ ...reviewData, rating: r })}
              />
            </div>
            <textarea
              value={reviewData.comment}
              onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
              className="input-field resize-none mb-3"
              rows="3"
              placeholder="Share your experience..."
            />
            <button type="submit" className="btn-primary text-sm" disabled={reviewLoading}>
              {reviewLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <p className="text-dark-200 text-center py-6">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="card">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 bg-dark-500 rounded-full flex items-center justify-center text-sm font-semibold">
                    {review.customer?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{review.customer?.name}</p>
                    <p className="text-xs text-dark-200">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <StarRating rating={review.rating} readonly size="sm" />
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-dark-100 leading-relaxed">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceDetail;
