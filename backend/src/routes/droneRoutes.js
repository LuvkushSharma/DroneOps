const express = require('express');
const {
  getDrones,
  getDroneById,
  createDrone,
  updateDrone,
  deleteDrone,
  updateDroneStatus,
  updateDroneBattery,
  getDroneTelemetry,
  addMaintenanceRecord,
  getDroneStatistics
} = require('../controllers/droneController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All drone routes are protected
router.use(protect);

// Basic CRUD routes
router.route('/')
  .get(getDrones)
  .post(authorize('admin', 'manager'), createDrone);

router.route('/:id')
  .get(getDroneById)
  .put(authorize('admin', 'manager'), updateDrone)
  .delete(authorize('admin', 'manager'), deleteDrone);

// Specialized routes
router.patch('/:id/status', authorize('admin', 'manager', 'operator'), updateDroneStatus);
router.patch('/:id/battery', updateDroneBattery);
router.get('/:id/telemetry', getDroneTelemetry);
router.post('/:id/maintenance', authorize('admin', 'manager', 'technician'), addMaintenanceRecord);
router.get('/:id/statistics', getDroneStatistics);

module.exports = router;