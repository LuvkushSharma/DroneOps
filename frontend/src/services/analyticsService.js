import api from '../utils/api';

/**
 * Service for fetching analytics data from the platform
 */
const analyticsService = {
  /**
   * Get dashboard analytics with optional time range filter
   * 
   * @param {Object} timeRange - Optional time range filter (start and end dates)
   * @returns {Promise<Object>} Dashboard analytics data
   */
  getDashboardAnalytics: async (timeRange = null) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (timeRange?.start) {
        queryParams.append('startDate', timeRange.start);
        queryParams.append('endDate', timeRange.end);
      }
      
      const queryString = queryParams.toString();
      const response = await api.get(`/analytics/dashboard${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch dashboard analytics' };
    }
  },
  
  /**
   * Get mission analytics with optional filters
   * 
   * @param {Object} filters - Optional filters
   * @param {Object} timeRange - Optional time range filter (start and end dates)
   * @returns {Promise<Object>} Mission analytics data
   */
  getMissionAnalytics: async (filters = {}, timeRange = null) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.pattern) queryParams.append('pattern', filters.pattern);
      if (filters.droneModel) queryParams.append('droneModel', filters.droneModel);
      
      if (timeRange?.start) {
        queryParams.append('startDate', timeRange.start);
        queryParams.append('endDate', timeRange.end);
      }
      
      const queryString = queryParams.toString();
      const response = await api.get(`/analytics/missions${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch mission analytics' };
    }
  },
  
  /**
   * Get drone analytics with optional filters
   * 
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} Drone analytics data
   */
  getDroneAnalytics: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.model) queryParams.append('model', filters.model);
      if (filters.status) queryParams.append('status', filters.status);
      
      const queryString = queryParams.toString();
      const response = await api.get(`/analytics/drones${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch drone analytics' };
    }
  },
  
  /**
   * Get survey analytics with optional filters
   * 
   * @param {Object} filters - Optional filters 
   * @param {Object} timeRange - Optional time range filter (start and end dates)
   * @returns {Promise<Object>} Survey analytics data
   */
  getSurveyAnalytics: async (filters = {}, timeRange = null) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.status) queryParams.append('status', filters.status);
      
      if (timeRange?.start) {
        queryParams.append('startDate', timeRange.start);
        queryParams.append('endDate', timeRange.end);
      }
      
      const queryString = queryParams.toString();
      const response = await api.get(`/analytics/surveys${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch survey analytics' };
    }
  },
  
  /**
   * Export analytics data in specified format
   * 
   * @param {string} format - Export format ('csv', 'excel', or 'pdf')
   * @param {Object} timeRange - Optional time range filter (start and end dates)
   * @param {string} filter - Data filter type
   * @returns {Promise<Blob>} Exported data as blob
   */
  exportAnalytics: async (format, timeRange = null, filter = 'all') => {
    try {
      const response = await api.get('/analytics/export', {
        params: {
          format,
          startDate: timeRange?.start,
          endDate: timeRange?.end,
          filter
        },
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default analyticsService;