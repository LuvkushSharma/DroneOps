import moment from 'moment';

/**
 * Formats a date string into a readable format
 * 
 * @param {string|Date} dateString - The date to format
 * @param {string} format - The format to use (default: 'MMM D, YYYY')
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, format = 'MMM D, YYYY') => {
  if (!dateString) return 'N/A';
  return moment(dateString).format(format);
};

/**
 * Formats a date string into a time format
 * 
 * @param {string|Date} dateString - The date to format
 * @param {string} format - The format to use (default: 'h:mm A')
 * @returns {string} Formatted time string
 */
export const formatTime = (dateString, format = 'h:mm A') => {
  if (!dateString) return 'N/A';
  return moment(dateString).format(format);
};

/**
 * Formats a date string into a date and time format
 * 
 * @param {string|Date} dateString - The date to format
 * @param {string} format - The format to use (default: 'MMM D, YYYY h:mm A')
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (dateString, format = 'MMM D, YYYY h:mm A') => {
  if (!dateString) return 'N/A';
  return moment(dateString).format(format);
};

/**
 * Returns a relative time string (e.g. "5 minutes ago")
 * 
 * @param {string|Date} dateString - The date to format
 * @returns {string} Relative time string
 */
export const getRelativeTime = (dateString) => {
  if (!dateString) return 'N/A';
  return moment(dateString).fromNow();
};

/**
 * Calculates the difference between two dates in minutes
 * 
 * @param {string|Date} startDate - The start date
 * @param {string|Date} endDate - The end date (default: now)
 * @returns {number} Difference in minutes
 */
export const getMinutesDifference = (startDate, endDate = new Date()) => {
  if (!startDate) return 0;
  return moment(endDate).diff(moment(startDate), 'minutes');
};

/**
 * Formats a duration in seconds to a human-readable format
 * 
 * @param {number} seconds - Duration in seconds
 * @param {boolean} short - Whether to use short format (default: false)
 * @returns {string} Formatted duration string
 */
export const formatDuration = (seconds, short = false) => {
  if (seconds === undefined || seconds === null) return 'N/A';
  
  const duration = moment.duration(seconds, 'seconds');
  const hours = Math.floor(duration.asHours());
  const minutes = duration.minutes();
  const secs = duration.seconds();
  
  if (short) {
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  }
  
  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ${secs} second${secs !== 1 ? 's' : ''}`;
  }
  return `${secs} second${secs !== 1 ? 's' : ''}`;
};

/**
 * Returns the start and end of a time period relative to now
 * 
 * @param {string} period - The period ('day', 'week', 'month', 'year')
 * @returns {Object} Object containing start and end dates
 */
export const getTimePeriod = (period) => {
  let start, end;
  
  switch (period) {
    case 'day':
      start = moment().startOf('day');
      end = moment().endOf('day');
      break;
    case 'week':
      start = moment().startOf('week');
      end = moment().endOf('week');
      break;
    case 'month':
      start = moment().startOf('month');
      end = moment().endOf('month');
      break;
    case 'year':
      start = moment().startOf('year');
      end = moment().endOf('year');
      break;
    default:
      start = moment().subtract(7, 'days');
      end = moment();
      break;
  }
  
  return {
    start: start.toDate(),
    end: end.toDate(),
    startISO: start.toISOString(),
    endISO: end.toISOString()
  };
};

/**
 * Checks if a date is in the past
 * 
 * @param {string|Date} date - The date to check
 * @returns {boolean} True if the date is in the past
 */
export const isDatePast = (date) => {
  if (!date) return false;
  return moment(date).isBefore(moment());
};

/**
 * Checks if a date is in the future
 * 
 * @param {string|Date} date - The date to check
 * @returns {boolean} True if the date is in the future
 */
export const isDateFuture = (date) => {
  if (!date) return false;
  return moment(date).isAfter(moment());
};

/**
 * Returns a date formatted for API requests
 * 
 * @param {string|Date} date - The date to format
 * @returns {string} ISO formatted date string
 */
export const formatDateForApi = (date) => {
  if (!date) return null;
  return moment(date).toISOString();
};

export default {
  formatDate,
  formatTime,
  formatDateTime,
  getRelativeTime,
  getMinutesDifference,
  formatDuration,
  getTimePeriod,
  isDatePast,
  isDateFuture,
  formatDateForApi
};