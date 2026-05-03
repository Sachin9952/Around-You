const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getProviderBookings,
  updateBookingStatus,
  cancelBooking,
  getAllBookings,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

// Customer & Provider routes (providers can also book other providers' services)
router.post('/', protect, authorize('customer', 'provider'), createBooking);
router.get('/my', protect, authorize('customer', 'provider'), getMyBookings);
router.put('/:id/cancel', protect, authorize('customer', 'provider'), cancelBooking);

// Provider routes
router.get('/provider', protect, authorize('provider'), getProviderBookings);
router.put('/:id/status', protect, authorize('provider'), updateBookingStatus);

// Admin routes
router.get('/', protect, authorize('admin'), getAllBookings);

module.exports = router;
