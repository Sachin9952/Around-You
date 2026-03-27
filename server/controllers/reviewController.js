const Review = require('../models/Review');
const Booking = require('../models/Booking');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private (Customer)
exports.createReview = async (req, res, next) => {
  try {
    const { service, rating, comment } = req.body;

    // Check if the customer has a completed booking for this service
    const completedBooking = await Booking.findOne({
      customer: req.user.id,
      service,
      status: 'completed',
    });

    if (!completedBooking) {
      return next(
        new ErrorResponse(
          'You can only review a service after a completed booking',
          400
        )
      );
    }

    // Check if already reviewed (the unique index will also catch this)
    const existingReview = await Review.findOne({
      customer: req.user.id,
      service,
    });

    if (existingReview) {
      return next(
        new ErrorResponse('You have already reviewed this service', 400)
      );
    }

    const review = await Review.create({
      customer: req.user.id,
      service,
      rating,
      comment,
    });

    // Populate customer info for the response
    await review.populate('customer', 'name avatar');

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get reviews for a service
// @route   GET /api/reviews/service/:serviceId
// @access  Public
exports.getServiceReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ service: req.params.serviceId })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (err) {
    next(err);
  }
};
