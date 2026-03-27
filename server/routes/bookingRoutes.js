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

// Customer routes
router.post('/', protect, authorize('customer'), createBooking);
router.get('/my', protect, authorize('customer'), getMyBookings);
router.put('/:id/cancel', protect, authorize('customer'), cancelBooking);

// Provider routes
router.get('/provider', protect, authorize('provider'), getProviderBookings);
router.put('/:id/status', protect, authorize('provider'), updateBookingStatus);

// Admin routes
router.get('/', protect, authorize('admin'), getAllBookings);

module.exports = router;
