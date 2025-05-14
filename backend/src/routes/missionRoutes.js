const express = require('express');
const {
  getMissions,
  getMissionById,
  createMission,
  updateMission,
  deleteMission,
  startMission,
  pauseMission,
  resumeMission,
  abortMission,
  completeMission,
  updateMissionProgress,
  getMissionTelemetry,
  generateFlightPlan,
  getMissionAnalytics
} = require('../controllers/missionController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All mission routes are protected
router.use(protect);

// Basic CRUD routes
router.route('/')
  .get(getMissions)
  .post(createMission);

router.route('/:id')
  .get(getMissionById)
  .put(updateMission)
  .delete(deleteMission);

// Mission control routes
router.post('/:id/start', authorize('operator', 'manager', 'admin'), startMission);
router.post('/:id/pause', authorize('operator', 'manager', 'admin'), pauseMission);
router.post('/:id/resume', authorize('operator', 'manager', 'admin'), resumeMission);
router.post('/:id/abort', authorize('operator', 'manager', 'admin'), abortMission);
router.post('/:id/complete', authorize('operator', 'manager', 'admin'), completeMission);

// Mission monitoring and data routes
router.patch('/:id/progress', updateMissionProgress);
router.get('/:id/telemetry', getMissionTelemetry);

// Flight planning
router.post('/flight-plan', generateFlightPlan);

// Analytics
router.get('/analytics', getMissionAnalytics);

module.exports = router;