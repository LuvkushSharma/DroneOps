const express = require('express');
const {
  getDashboardAnalytics,
  getMissionAnalytics,
  getDroneAnalytics,
  getSurveyAnalytics,
  getUserAnalytics
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All analytics routes are protected
// router.use(protect);

// General analytics for dashboard
router.get('/dashboard', getDashboardAnalytics);

// Specific analytics
router.get('/missions', getMissionAnalytics);
router.get('/drones', getDroneAnalytics);
router.get('/surveys', getSurveyAnalytics);

// Admin only analytics
router.get('/users', authorize('admin'), getUserAnalytics);

module.exports = router;