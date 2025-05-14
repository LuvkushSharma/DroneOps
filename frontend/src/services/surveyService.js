import api from '../utils/api';

/**
 * Service for managing drone surveys including CRUD operations and analytics
 */
const surveyService = {
  /**
   * Get all surveys with optional filters
   *
   * @param {Object} filters - Optional filter parameters
   * @param {string} filters.status - Filter by survey status
   * @param {string} filters.startDate - Filter by start date
   * @param {string} filters.endDate - Filter by end date
   * @returns {Promise<Array>} Array of survey objects
   */
  getSurveys: async (filters = {}) => {
    try {
      // Build query string for filters
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const queryString = queryParams.toString();
      
      const response = await api.get(`/surveys${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch surveys' };
    }
  },

  /**
   * Get a survey by ID
   *
   * @param {string} id - Survey ID
   * @returns {Promise<Object>} Survey object
   */
  getSurveyById: async (id) => {
    try {
      const response = await api.get(`/surveys/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch survey' };
    }
  },

  /**
   * Create a new survey
   *
   * @param {Object} surveyData - Survey data
   * @returns {Promise<Object>} Created survey object
   */
  createSurvey: async (surveyData) => {
    try {
      const response = await api.post('/surveys', surveyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create survey' };
    }
  },

  /**
   * Update an existing survey
   *
   * @param {string} id - Survey ID
   * @param {Object} surveyData - Survey data to update
   * @returns {Promise<Object>} Updated survey object
   */
  updateSurvey: async (id, surveyData) => {
    try {
      const response = await api.put(`/surveys/${id}`, surveyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update survey' };
    }
  },

  /**
   * Delete a survey
   *
   * @param {string} id - Survey ID
   * @returns {Promise<Object>} Response object
   */
  deleteSurvey: async (id) => {
    try {
      const response = await api.delete(`/surveys/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete survey' };
    }
  },

  /**
   * Get missions associated with a survey
   *
   * @param {string} id - Survey ID
   * @returns {Promise<Array>} Array of mission objects
   */
  getSurveyMissions: async (id) => {
    try {
      const response = await api.get(`/surveys/${id}/missions`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch survey missions' };
    }
  },

  /**
   * Add a mission to a survey
   *
   * @param {string} surveyId - Survey ID
   * @param {string} missionId - Mission ID
   * @returns {Promise<Object>} Response object
   */
  addMissionToSurvey: async (surveyId, missionId) => {
    try {
      const response = await api.post(`/surveys/${surveyId}/missions`, { missionId });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add mission to survey' };
    }
  },

  /**
   * Remove a mission from a survey
   *
   * @param {string} surveyId - Survey ID
   * @param {string} missionId - Mission ID
   * @returns {Promise<Object>} Response object
   */
  removeMissionFromSurvey: async (surveyId, missionId) => {
    try {
      const response = await api.delete(`/surveys/${surveyId}/missions/${missionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to remove mission from survey' };
    }
  },

  /**
   * Get survey analytics
   *
   * @param {string} id - Survey ID
   * @returns {Promise<Object>} Survey analytics data
   */
  getSurveyAnalytics: async (id) => {
    try {
      const response = await api.get(`/surveys/${id}/analytics`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch survey analytics' };
    }
  },

  /**
   * Get survey area coverage data
   *
   * @param {string} id - Survey ID
   * @returns {Promise<Object>} Area coverage data
   */
  getSurveyAreaCoverage: async (id) => {
    try {
      const response = await api.get(`/surveys/${id}/area-coverage`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch area coverage' };
    }
  },

  /**
   * Download survey data in the specified format
   *
   * @param {string} id - Survey ID
   * @param {string} format - Data format (e.g., 'csv', 'json', 'kml')
   * @returns {Promise<Blob>} Data blob for download
   */
  downloadSurveyData: async (id, format = 'csv') => {
    try {
      const response = await api.get(`/surveys/${id}/download?format=${format}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to download survey data' };
    }
  },

  /**
   * Generate a PDF report for the survey
   *
   * @param {string} id - Survey ID
   * @returns {Promise<Blob>} PDF blob for download
   */
  generateSurveyReport: async (id) => {
    try {
      const response = await api.get(`/surveys/${id}/report`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to generate survey report' };
    }
  },

  /**
   * Upload survey imagery
   *
   * @param {string} surveyId - Survey ID
   * @param {FormData} formData - Form data with image files
   * @param {Function} onProgress - Progress callback function
   * @returns {Promise<Object>} Upload result
   */
  uploadSurveyImagery: async (surveyId, formData, onProgress) => {
    try {
      const response = await api.post(`/surveys/${surveyId}/imagery`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: progressEvent => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to upload imagery' };
    }
  },

  /**
   * Get the survey status summary across all surveys
   *
   * @returns {Promise<Object>} Status summary object
   */
  getSurveyStatusSummary: async () => {
    try {
      const response = await api.get('/surveys/status-summary');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch status summary' };
    }
  },

  /**
   * Duplicate an existing survey
   *
   * @param {string} id - Survey ID to duplicate
   * @param {Object} options - Duplication options
   * @returns {Promise<Object>} Duplicated survey
   */
  duplicateSurvey: async (id, options = {}) => {
    try {
      const response = await api.post(`/surveys/${id}/duplicate`, options);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to duplicate survey' };
    }
  }
};

export default surveyService;