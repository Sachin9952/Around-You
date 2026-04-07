const User = require('../models/User');
const Service = require('../models/Service');

const Review = require('../models/Review');
const ErrorResponse = require('../utils/errorResponse');

// Helper: send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  // Remove password from output
  const userData = user.toObject();
  delete userData.password;

  return res.status(statusCode).json({
    success: true,
    token,
    user,
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorResponse('Email already registered', 400));
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'customer',
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate
    if (!email || !password) {
      return next(new ErrorResponse('Please provide email and password', 400));
    }

    // Find user and include password (select: false by default)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user by ID (for chat/public profiles)
// @route   GET /api/auth/users/:id
// @access  Private
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('name avatar role');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      avatar: req.body.avatar,
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(
      (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user details (name, email)
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.comparePassword(req.body.currentPassword))) {
      return next(new ErrorResponse('Password is incorrect', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user account (and cascade-delete provider's services, bookings & reviews)
// @route   DELETE /api/auth/deleteaccount
// @access  Private
exports.deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Verify password before deletion
    const { password } = req.body;
    if (!password) {
      return next(new ErrorResponse('Please provide your password to confirm deletion', 400));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ErrorResponse('Incorrect password', 401));
    }

    // If user is a provider, cascade-delete their services and related data
    if (user.role === 'provider') {
      // Find all service IDs owned by this provider
      const services = await Service.find({ provider: user._id }).select('_id');
      const serviceIds = services.map((s) => s._id);

      if (serviceIds.length > 0) {
        // Delete all reviews linked to those services
        await Review.deleteMany({ service: { $in: serviceIds } });

        // Delete the services themselves
        await Service.deleteMany({ provider: user._id });
      }
    }

    // Bookings are preserved for history — not deleted

    // Delete the user
    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Account and all associated data deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};
