/**
 * Global error handler middleware
 * @param {Object} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
    // Log error for our debugging
    console.error(`ERROR: ${err.name}: ${err.message}`.red);
    console.error(err.stack);
  
    // Default error response
    let error = { ...err };
    error.message = err.message;
    let statusCode = error.statusCode || 500;
  
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
      const message = `Resource not found with id of ${err.value}`;
      error = { message };
      statusCode = 404;
    }
  
    // Mongoose duplicate key
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
      error = { message };
      statusCode = 400;
    }
  
    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(val => val.message).join(', ');
      error = { message };
      statusCode = 400;
    }
  
    // JWT token errors
    if (err.name === 'JsonWebTokenError') {
      error = { message: 'Not authorized, invalid token' };
      statusCode = 401;
    }
  
    if (err.name === 'TokenExpiredError') {
      error = { message: 'Not authorized, token expired' };
      statusCode = 401;
    }
  
    // Return standardized response
    res.status(statusCode).json({
      success: false,
      error: error.message || 'Server Error'
    });
  };
  
  module.exports = errorHandler;