const express = require('express');
const {
  getSurveys,
  getSurveyById,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  updateSurveyStatus,
  addMissionToSurvey,
  removeMissionFromSurvey,
  getSurveyAnalytics,
  generateSurveyReport,
  getSurveyStatistics,
  cloneSurvey
} = require('../controllers/surveyController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All survey routes are protected
router.use(protect);

// Statistics endpoint for all surveys
router.get('/statistics', getSurveyStatistics);

// Basic CRUD routes
router.route('/')
  .get(getSurveys)
  .post(createSurvey);

router.route('/:id')
  .get(getSurveyById)
  .put(updateSurvey)
  .delete(deleteSurvey);

// Survey status management
router.patch('/:id/status', updateSurveyStatus);

// Mission management within surveys
router.post('/:id/missions', addMissionToSurvey);
router.delete('/:id/missions/:missionId', removeMissionFromSurvey);

// Analytics and reports
router.get('/:id/analytics', getSurveyAnalytics);
router.get('/:id/report', generateSurveyReport);

// Clone survey
router.post('/:id/clone', cloneSurvey);

module.exports = router;