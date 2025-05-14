const { body, validationResult } = require('express-validator');

/**
 * Validation middleware for user registration
 */
exports.validateUserRegistration = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please include a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('organization').trim().notEmpty().withMessage('Organization is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];

/**
 * Validation middleware for user login
 */
exports.validateUserLogin = [
  body('email').isEmail().withMessage('Please include a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];

/**
 * Validation middleware for drone creation
 */
exports.validateDrone = [
  body('name').trim().notEmpty().withMessage('Drone name is required'),
  body('model').trim().notEmpty().withMessage('Drone model is required'),
  body('serialNumber').trim().notEmpty().withMessage('Serial number is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];

/**
 * Validation middleware for mission creation
 */
exports.validateMission = [
  body('name').trim().notEmpty().withMessage('Mission name is required'),
  body('drone').isMongoId().withMessage('Valid drone ID is required'),
  body('altitude').isNumeric().withMessage('Altitude must be a number'),
  body('speed').isNumeric().withMessage('Speed must be a number'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];

/**
 * Validation middleware for survey creation
 */
exports.validateSurvey = [
  body('name').trim().notEmpty().withMessage('Survey name is required'),
  body('site.name').trim().notEmpty().withMessage('Site name is required'),
  body('site.location.coordinates').isArray().withMessage('Valid coordinates are required'),
  body('type').isIn(['inspection', 'mapping', 'security', 'monitoring', 'custom']).withMessage('Valid survey type is required'),
  body('startDate').isISO8601().toDate().withMessage('Valid start date is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];

/**
 * Validation middleware for waypoint creation
 */
exports.validateWaypoint = [
  body('mission').isMongoId().withMessage('Valid mission ID is required'),
  body('order').isNumeric().withMessage('Order must be a number'),
  body('location.coordinates').isArray().withMessage('Valid coordinates are required'),
  body('altitude').isNumeric().withMessage('Altitude must be a number'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];