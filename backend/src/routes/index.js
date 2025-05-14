const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const droneRoutes = require('./droneRoutes');
const missionRoutes = require('./missionRoutes');
const surveyRoutes = require('./surveyRoutes');
const analyticsRoutes = require('./analyticsRoutes');

const router = express.Router();

// API routes
router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api/drones', droneRoutes);
router.use('/api/missions', missionRoutes);
router.use('/api/surveys', surveyRoutes);
router.use('/api/analytics', analyticsRoutes);

// Health check route
router.get('/api/health', (req, res) => {
    
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date()
  });
});

module.exports = router;