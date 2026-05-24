const express = require('express');
const router = express.Router();
const {
  createAddress,
  getMyAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require('../controllers/addressController');
const { protect } = require('../middleware/auth');

// All routes are protected by auth middleware
router.use(protect);

router.route('/')
  .post(createAddress);

router.route('/my')
  .get(getMyAddresses);

router.route('/:id')
  .put(updateAddress)
  .delete(deleteAddress);

router.route('/:id/default')
  .patch(setDefaultAddress);

module.exports = router;
