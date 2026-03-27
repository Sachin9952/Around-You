const express = require('express');
const router = express.Router();
const {
  getProviders,
  approveProvider,
  getUsers,
  deleteUser,
  getStats,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes are protected + admin-only
router.use(protect, authorize('admin'));

router.get('/providers', getProviders);
router.put('/providers/:id/approve', approveProvider);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.get('/stats', getStats);

module.exports = router;
