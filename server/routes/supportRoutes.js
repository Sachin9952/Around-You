const express = require('express');
const {
  createSupportRequest,
  getSupportRequests,
  resolveSupportRequest,
} = require('../controllers/supportController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// User creates a complaint
router.post('/', protect, createSupportRequest);

// Admin views all complaints
router.get('/', protect, authorize('admin'), getSupportRequests);

// Admin resolves a complaint
router.put('/:id/resolve', protect, authorize('admin'), resolveSupportRequest);

module.exports = router;
