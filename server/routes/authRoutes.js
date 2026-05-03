const express = require('express');
const router = express.Router();
const { register, login, getMe, getUserById, updateDetails, updatePassword, becomeProvider, deleteAccount } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/users/:id', protect, getUserById);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.patch('/become-provider', protect, becomeProvider);
router.delete('/deleteaccount', protect, deleteAccount);

module.exports = router;
