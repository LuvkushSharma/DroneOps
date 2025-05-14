/**
 * Async handler to wrap async route handlers and avoid try-catch blocks
 * @param {Function} fn - Async function to be wrapped
 * @returns {Function} Express middleware function that handles async errors
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };
  
  module.exports = asyncHandler;