const express = require('express');
const router = express.Router();
const {
  createService,
  getServices,
  getService,
  updateService,
  deleteService,
  getMyServices,
  getNearbyServices,
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getServices);
router.get('/nearby', getNearbyServices);

// Protected routes (provider only) — must come before /:id
router.post('/', protect, authorize('provider'), createService);
router.get('/provider/my', protect, authorize('provider'), getMyServices);

// Parameterized routes (must be AFTER /provider/my)
router.get('/:id', getService);
router.put('/:id', protect, authorize('provider', 'admin'), updateService);
router.delete('/:id', protect, authorize('provider', 'admin'), deleteService);

module.exports = router;
