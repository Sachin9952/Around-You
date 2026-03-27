const SupportRequest = require('../models/SupportRequest');
const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create a support request (complaint/suggestion)
// @route   POST /api/support
// @access  Private (Customer/Provider)
exports.createSupportRequest = async (req, res, next) => {
  try {
    req.body.user = req.user.id;

    const request = await SupportRequest.create(req.body);

    res.status(201).json({
      success: true,
      data: request,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all support requests
// @route   GET /api/support
// @access  Private/Admin
exports.getSupportRequests = async (req, res, next) => {
  try {
    const requests = await SupportRequest.find()
      .populate('user', 'name email role')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark a support request as resolved
// @route   PUT /api/support/:id/resolve
// @access  Private/Admin
exports.resolveSupportRequest = async (req, res, next) => {
  try {
    let request = await SupportRequest.findById(req.params.id);

    if (!request) {
      return next(new ErrorResponse(`Support request not found with id of ${req.params.id}`, 404));
    }

    request.status = 'resolved';
    await request.save();

    // Notify the user that their support request was resolved by the admin
    await Notification.create({
      recipient: request.user,
      title: 'Support Request Resolved',
      message: `Your complaint/request regarding "${request.subject}" has been successfully resolved by the administration team.`,
    });

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (err) {
    next(err);
  }
};
