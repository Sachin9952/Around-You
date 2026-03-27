const express = require('express');
const router = express.Router();
const { createReview, getServiceReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

// Public
router.get('/service/:serviceId', getServiceReviews);

// Customer only
router.post('/', protect, authorize('customer'), createReview);

module.exports = router;
