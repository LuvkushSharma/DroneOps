const express = require('express');
const { register, login, getMe, forgotPassword, resetPassword, updatePassword, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// Protected routes
router.use(protect); // All routes below this line will use the protect middleware
router.get('/me', getMe);
router.put('/updatepassword', updatePassword);
router.get('/logout', logout);

module.exports = router;