import api from '../utils/api';

/**
 * Service for managing drone missions including CRUD operations and flight control
 */
const missionService = {
  /**
   * Get all missions with optional filters
   *
   * @param {Object} filters - Optional filter parameters
   * @param {string} filters.status - Filter by mission status
   * @param {string} filters.droneId - Filter by drone ID
   * @param {string} filters.surveyId - Filter by survey ID
   * @returns {Promise<Array>} Array of mission objects
   */
  getMissions: async (filters = {}) => {
    try {
      // Build query string for filters
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const queryString = queryParams.toString();
      
      const response = await api.get(`/missions${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch missions' };
    }
  },

  /**
   * Get a mission by ID
   *
   * @param {string} id - Mission ID
   * @returns {Promise<Object>} Mission object
   */
  getMissionById: async (id) => {
    try {
      const response = await api.get(`/missions/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch mission' };
    }
  },

  /**
   * Create a new mission
   *
   * @param {Object} missionData - Mission data
   * @returns {Promise<Object>} Created mission object
   */
  createMission: async (missionData) => {
    try {
      const response = await api.post('/missions', missionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create mission' };
    }
  },

  /**
   * Update an existing mission
   *
   * @param {string} id - Mission ID
   * @param {Object} missionData - Mission data to update
   * @returns {Promise<Object>} Updated mission object
   */
  updateMission: async (id, missionData) => {
    try {
      const response = await api.put(`/missions/${id}`, missionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update mission' };
    }
  },

  /**
   * Delete a mission
   *
   * @param {string} id - Mission ID
   * @returns {Promise<Object>} Response object
   */
  deleteMission: async (id) => {
    try {
      const response = await api.delete(`/missions/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete mission' };
    }
  },

  /**
   * Start a mission
   *
   * @param {string} id - Mission ID
   * @returns {Promise<Object>} Mission object with updated status
   */
  startMission: async (id) => {
    try {
      const response = await api.put(`/missions/${id}/start`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to start mission' };
    }
  },

  /**
   * Pause a mission
   *
   * @param {string} id - Mission ID
   * @returns {Promise<Object>} Mission object with updated status
   */
  pauseMission: async (id) => {
    try {
      const response = await api.put(`/missions/${id}/pause`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to pause mission' };
    }
  },

  /**
   * Resume a paused mission
   *
   * @param {string} id - Mission ID
   * @returns {Promise<Object>} Mission object with updated status
   */
  resumeMission: async (id) => {
    try {
      const response = await api.put(`/missions/${id}/resume`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to resume mission' };
    }
  },

  /**
   * Abort a mission
   *
   * @param {string} id - Mission ID
   * @returns {Promise<Object>} Mission object with updated status
   */
  abortMission: async (id) => {
    try {
      const response = await api.put(`/missions/${id}/abort`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to abort mission' };
    }
  },

  /**
   * Get real-time telemetry for a mission
   *
   * @param {string} id - Mission ID
   * @returns {Promise<Object>} Telemetry data
   */
  getMissionTelemetry: async (id) => {
    try {
      const response = await api.get(`/missions/${id}/telemetry`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch mission telemetry' };
    }
  },

  /**
   * Get waypoints for a mission
   *
   * @param {string} id - Mission ID
   * @returns {Promise<Array>} Array of waypoint objects
   */
  getMissionWaypoints: async (id) => {
    try {
      const response = await api.get(`/missions/${id}/waypoints`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch mission waypoints' };
    }
  },

  /**
   * Update waypoints for a mission
   *
   * @param {string} id - Mission ID
   * @param {Array} waypoints - Array of waypoint objects
   * @returns {Promise<Array>} Updated array of waypoint objects
   */
  updateMissionWaypoints: async (id, waypoints) => {
    try {
      const response = await api.put(`/missions/${id}/waypoints`, { waypoints });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update mission waypoints' };
    }
  },

  /**
   * Get mission statistics
   *
   * @param {string} id - Mission ID
   * @returns {Promise<Object>} Mission statistics data
   */
  getMissionStatistics: async (id) => {
    try {
      const response = await api.get(`/missions/${id}/statistics`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch mission statistics' };
    }
  },

  /**
   * Generate mission waypoints from a flight pattern
   *
   * @param {Object} patternData - Flight pattern data
   * @param {string} patternData.type - Pattern type (grid, perimeter, etc.)
   * @param {Array} patternData.area - Array of coordinate points defining the area
   * @param {Object} patternData.options - Pattern-specific options
   * @returns {Promise<Array>} Generated waypoints
   */
  generateMissionFromPattern: async (patternData) => {
    try {
      const response = await api.post('/missions/generate-pattern', patternData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to generate mission pattern' };
    }
  },

  /**
   * Get mission logs
   *
   * @param {string} id - Mission ID
   * @returns {Promise<Array>} Array of log entries
   */
  getMissionLogs: async (id) => {
    try {
      const response = await api.get(`/missions/${id}/logs`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch mission logs' };
    }
  },

  /**
   * Download mission data in the specified format
   *
   * @param {string} id - Mission ID
   * @param {string} format - Data format (e.g., 'csv', 'json', 'kml')
   * @returns {Promise<Blob>} Data blob for download
   */
  downloadMissionData: async (id, format = 'csv') => {
    try {
      const response = await api.get(`/missions/${id}/download?format=${format}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to download mission data' };
    }
  },

  /**
   * Schedule a mission for future execution
   * 
   * @param {string} id - Mission ID
   * @param {Object} scheduleData - Schedule data
   * @param {string} scheduleData.scheduledDate - ISO date string for scheduled execution
   * @returns {Promise<Object>} Updated mission object
   */
  scheduleMission: async (id, scheduleData) => {
    try {
      const response = await api.put(`/missions/${id}/schedule`, scheduleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to schedule mission' };
    }
  },

  /**
   * Generate a PDF report for the mission
   *
   * @param {string} id - Mission ID
   * @returns {Promise<Blob>} PDF blob for download
   */
  generateMissionReport: async (id) => {
    try {
      const response = await api.get(`/missions/${id}/report`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to generate mission report' };
    }
  },
  
  /**
   * Duplicate an existing mission
   *
   * @param {string} id - Mission ID to duplicate
   * @param {Object} options - Duplication options
   * @returns {Promise<Object>} Duplicated mission
   */
  duplicateMission: async (id, options = {}) => {
    try {
      const response = await api.post(`/missions/${id}/duplicate`, options);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to duplicate mission' };
    }
  }
};

export default missionService;