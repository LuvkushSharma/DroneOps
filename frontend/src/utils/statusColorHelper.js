/**
 * Gets the appropriate Tailwind CSS color classes based on mission status
 * 
 * @param {string} status - The mission status
 * @returns {Object} Object containing color classes
 */
export const getMissionStatusColors = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-200',
          icon: 'text-green-500',
          light: 'bg-green-50',
          dark: 'bg-green-600',
          gradient: 'from-green-500 to-green-600'
        };
      case 'in_progress':
      case 'in progress':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          border: 'border-blue-200',
          icon: 'text-blue-500',
          light: 'bg-blue-50',
          dark: 'bg-blue-600',
          gradient: 'from-blue-500 to-blue-600'
        };
      case 'paused':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-200',
          icon: 'text-yellow-500',
          light: 'bg-yellow-50',
          dark: 'bg-yellow-600',
          gradient: 'from-yellow-500 to-yellow-600'
        };
      case 'scheduled':
        return {
          bg: 'bg-indigo-100',
          text: 'text-indigo-800',
          border: 'border-indigo-200',
          icon: 'text-indigo-500',
          light: 'bg-indigo-50',
          dark: 'bg-indigo-600',
          gradient: 'from-indigo-500 to-indigo-600'
        };
      case 'failed':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-200',
          icon: 'text-red-500',
          light: 'bg-red-50',
          dark: 'bg-red-600',
          gradient: 'from-red-500 to-red-600'
        };
      case 'cancelled':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200',
          icon: 'text-gray-500',
          light: 'bg-gray-50',
          dark: 'bg-gray-600',
          gradient: 'from-gray-500 to-gray-600'
        };
      case 'draft':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200',
          icon: 'text-gray-500',
          light: 'bg-gray-50',
          dark: 'bg-gray-600',
          gradient: 'from-gray-500 to-gray-600'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200',
          icon: 'text-gray-500',
          light: 'bg-gray-50',
          dark: 'bg-gray-600',
          gradient: 'from-gray-500 to-gray-600'
        };
    }
  };
  
  /**
   * Gets the appropriate Tailwind CSS color classes based on survey status
   * 
   * @param {string} status - The survey status
   * @returns {Object} Object containing color classes
   */
  export const getSurveyStatusColors = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-200',
          icon: 'text-green-500',
          light: 'bg-green-50',
          dark: 'bg-green-600'
        };
      case 'in_progress':
      case 'in progress':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          border: 'border-blue-200',
          icon: 'text-blue-500',
          light: 'bg-blue-50',
          dark: 'bg-blue-600'
        };
      case 'scheduled':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-200',
          icon: 'text-yellow-500',
          light: 'bg-yellow-50',
          dark: 'bg-yellow-600'
        };
      case 'draft':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200',
          icon: 'text-gray-500',
          light: 'bg-gray-50',
          dark: 'bg-gray-600'
        };
      case 'cancelled':
      case 'canceled':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200',
          icon: 'text-gray-500',
          light: 'bg-gray-50',
          dark: 'bg-gray-600'
        };
      case 'failed':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-200',
          icon: 'text-red-500',
          light: 'bg-red-50',
          dark: 'bg-red-600'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200',
          icon: 'text-gray-500',
          light: 'bg-gray-50',
          dark: 'bg-gray-600'
        };
    }
  };
  
  /**
   * Gets the appropriate Tailwind CSS color classes based on drone status
   * 
   * @param {string} status - The drone status
   * @returns {Object} Object containing color classes
   */
  export const getDroneStatusColors = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-200',
          icon: 'text-green-500',
          light: 'bg-green-50',
          dark: 'bg-green-600'
        };
      case 'idle':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          border: 'border-blue-200',
          icon: 'text-blue-500',
          light: 'bg-blue-50',
          dark: 'bg-blue-600'
        };
      case 'charging':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-200',
          icon: 'text-yellow-500',
          light: 'bg-yellow-50',
          dark: 'bg-yellow-600'
        };
      case 'maintenance':
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-800',
          border: 'border-orange-200',
          icon: 'text-orange-500',
          light: 'bg-orange-50',
          dark: 'bg-orange-600'
        };
      case 'offline':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200',
          icon: 'text-gray-500',
          light: 'bg-gray-50',
          dark: 'bg-gray-600'
        };
      case 'error':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-200',
          icon: 'text-red-500',
          light: 'bg-red-50',
          dark: 'bg-red-600'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200',
          icon: 'text-gray-500',
          light: 'bg-gray-50',
          dark: 'bg-gray-600'
        };
    }
  };
  
  /**
   * Gets the appropriate color classes for battery level
   * 
   * @param {number} batteryLevel - The battery level percentage (0-100)
   * @returns {Object} Object containing color classes
   */
  export const getBatteryLevelColors = (batteryLevel) => {
    if (batteryLevel >= 70) {
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
        icon: 'text-green-500',
        light: 'bg-green-50',
        dark: 'bg-green-600'
      };
    } else if (batteryLevel >= 30) {
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        icon: 'text-yellow-500',
        light: 'bg-yellow-50',
        dark: 'bg-yellow-600'
      };
    } else {
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200',
        icon: 'text-red-500',
        light: 'bg-red-50',
        dark: 'bg-red-600'
      };
    }
  };
  
  /**
   * Gets the appropriate color classes for alert severity
   * 
   * @param {string} severity - The alert severity level (info, warning, error, critical)
   * @returns {Object} Object containing color classes
   */
  export const getAlertSeverityColors = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'info':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          border: 'border-blue-200',
          icon: 'text-blue-500',
          light: 'bg-blue-50',
          dark: 'bg-blue-600'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-200',
          icon: 'text-yellow-500',
          light: 'bg-yellow-50',
          dark: 'bg-yellow-600'
        };
      case 'error':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-200',
          icon: 'text-red-500',
          light: 'bg-red-50',
          dark: 'bg-red-600'
        };
      case 'critical':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-800',
          border: 'border-purple-200',
          icon: 'text-purple-500',
          light: 'bg-purple-50',
          dark: 'bg-purple-600'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200',
          icon: 'text-gray-500',
          light: 'bg-gray-50',
          dark: 'bg-gray-600'
        };
    }
  };
  
  export default {
    getMissionStatusColors,
    getSurveyStatusColors,
    getDroneStatusColors,
    getBatteryLevelColors,
    getAlertSeverityColors
  };