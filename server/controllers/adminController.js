const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all providers (pending + approved)
// @route   GET /api/admin/providers
// @access  Private (Admin)
exports.getProviders = async (req, res, next) => {
  try {
    const { status } = req.query; // 'pending' or 'approved'
    const query = { role: 'provider' };

    if (status === 'pending') query.isApproved = false;
    else if (status === 'approved') query.isApproved = true;

    const providers = await User.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: providers.length,
      data: providers,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve or reject a provider
// @route   PUT /api/admin/providers/:id/approve
// @access  Private (Admin)
exports.approveProvider = async (req, res, next) => {
  try {
    const { approved } = req.body; // true or false

    const provider = await User.findById(req.params.id);

    if (!provider) {
      return next(new ErrorResponse('User not found', 404));
    }

    if (provider.role !== 'provider') {
      return next(new ErrorResponse('User is not a provider', 400));
    }

    provider.isApproved = approved;
    await provider.save();

    res.status(200).json({
      success: true,
      data: provider,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;

    const skip = (Number(page) - 1) * Number(limit);

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Prevent deleting yourself
    if (user.id === req.user.id) {
      return next(new ErrorResponse('You cannot delete your own account', 400));
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalProviders, pendingProviders, totalServices, totalBookings] =
      await Promise.all([
        User.countDocuments({ role: 'customer' }),
        User.countDocuments({ role: 'provider' }),
        User.countDocuments({ role: 'provider', isApproved: false }),
        Service.countDocuments(),
        Booking.countDocuments(),
      ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProviders,
        pendingProviders,
        totalServices,
        totalBookings,
      },
    });
  } catch (err) {
    next(err);
  }
};
