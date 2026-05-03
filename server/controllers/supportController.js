const SupportRequest = require('../models/SupportRequest');
const Notification = require('../models/Notification');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create a support request (complaint/suggestion)
// @route   POST /api/support
// @access  Private (Customer/Provider)
exports.createSupportRequest = async (req, res, next) => {
  try {
    req.body.user = req.user.id;

    const request = await SupportRequest.create(req.body);
    console.log(`[Support] Request created: ${request._id} by user: ${req.user.id} (${req.user.name})`);

    // Notify all admin users about the new complaint
    // Wrapped in its own try-catch so notification failures don't break the main request
    try {
      const admins = await User.find({ role: 'admin' }).select('_id');
      console.log(`[Support] Found ${admins.length} admin(s) for notification`);

      if (admins.length > 0) {
        const adminNotifications = admins.map((admin) => ({
          recipient: admin._id,
          title: 'New Support Request',
          message: `${req.user.name} submitted a complaint: "${request.subject}"`,
        }));

        const result = await Notification.insertMany(adminNotifications);
        console.log(`[Support] ${result.length} notification(s) created successfully`);
      } else {
        console.warn('[Support] No admin users found in the database — skipping notification.');
      }
    } catch (notifErr) {
      // Log but don't fail the main request — notification is a side-effect
      console.error('[Support] Failed to create admin notifications:', notifErr.message);
    }

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

    const { adminReply } = req.body;

    request.status = 'resolved';
    if (adminReply) {
      request.adminReply = adminReply;
    }
    await request.save();

    // Notify the user that their support request was resolved by the admin
    try {
      const replyText = adminReply
        ? `\n\nAdmin Response: "${adminReply}"`
        : '';

      await Notification.create({
        recipient: request.user,
        title: 'Support Request Resolved ✅',
        message: `Your complaint/request regarding "${request.subject}" has been successfully resolved by the administration team.${replyText}`,
      });
      console.log(`[Support] Resolve notification sent to user: ${request.user}`);
    } catch (notifErr) {
      console.error('[Support] Failed to create resolve notification:', notifErr.message);
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (err) {
    next(err);
  }
};
