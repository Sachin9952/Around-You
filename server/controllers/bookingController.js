const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// Helper: when populated refs are null (deleted), fall back to snapshot fields
const withFallbacks = (bookings) =>
  bookings.map((b) => {
    const obj = b.toObject();
    if (!obj.service) {
      obj.service = { title: obj.serviceTitle, category: obj.serviceCategory, price: obj.servicePrice };
    }
    if (!obj.provider) {
      obj.provider = { name: obj.providerName };
    }
    if (!obj.customer) {
      obj.customer = { name: obj.customerName };
    }
    return obj;
  });

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Private (Customer)
exports.createBooking = async (req, res, next) => {
  try {
    const { service: serviceId, date, time, notes, address } = req.body;

    // Validate structured address
    if (
      !address ||
      typeof address !== 'object' ||
      !address.address ||
      !address.lat ||
      !address.lng
    ) {
      return next(new ErrorResponse('Please select a valid service location from the map.', 400));
    }

    // Fetch the service to get the provider
    const service = await Service.findById(serviceId).populate('provider');
    if (!service) {
      return next(new ErrorResponse('Service not found', 404));
    }

    if (!service.isActive) {
      return next(new ErrorResponse('This service is currently unavailable', 400));
    }

    if (service.providerDeleted) {
      return next(new ErrorResponse('This service is no longer available — the provider has removed their account', 400));
    }

    // STRICT BOOKING SAFETY RULE: Ensure provider exists and is active.
    if (!service.provider || service.provider.isActive === false) {
      return next(new ErrorResponse('This service is no longer available because the provider account is unavailable.', 400));
    }

    // Prevent providers from booking their own services
    if (service.provider._id.toString() === req.user.id) {
      return next(new ErrorResponse('You cannot book your own service', 400));
    }

    // Fetch customer & provider names for snapshot
    const customer = await User.findById(req.user.id).select('name');
    const provider = service.provider; // We already populated it

    const booking = await Booking.create({
      customer: req.user.id,
      service: serviceId,
      provider: service.provider._id,
      date,
      time,
      notes,
      address,
      customerName: customer?.name || '',
      providerName: provider?.name || '',
      serviceTitle: service.title,
      serviceCategory: service.category,
      servicePrice: service.price,
    });

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get bookings for the logged-in customer
// @route   GET /api/bookings/my
// @access  Private (Customer)
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id })
      .populate('service', 'title category price priceType image isArchived providerDeleted')
      .populate('provider', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: withFallbacks(bookings),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get bookings for the logged-in provider
// @route   GET /api/bookings/provider
// @access  Private (Provider)
exports.getProviderBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { provider: req.user.id };

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('service', 'title category price priceType')
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: withFallbacks(bookings),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Provider)
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const validStatuses = ['accepted', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
      return next(
        new ErrorResponse(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400)
      );
    }

    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(new ErrorResponse('Booking not found', 404));
    }

    // Only the provider of this booking can update status
    if (booking.provider.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this booking', 403));
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel a booking (customer)
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Customer)
exports.cancelBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(new ErrorResponse('Booking not found', 404));
    }

    if (booking.customer.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to cancel this booking', 403));
    }

    if (booking.status === 'completed') {
      return next(new ErrorResponse('Cannot cancel a completed booking', 400));
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private (Admin)
exports.getAllBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const bookings = await Booking.find()
      .populate('service', 'title category price')
      .populate('customer', 'name email')
      .populate('provider', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments();

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: withFallbacks(bookings),
    });
  } catch (err) {
    next(err);
  }
};
