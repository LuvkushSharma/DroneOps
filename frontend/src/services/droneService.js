import api from '../utils/api';

/**
 * Service for managing drones including CRUD operations and live drone controls
 */
const droneService = {
  /**
   * Get all drones with optional filters
   *
   * @param {Object} filters - Optional filter parameters
   * @param {string} filters.status - Filter by drone status
   * @param {string} filters.model - Filter by drone model
   * @returns {Promise<Array>} Array of drone objects
   */
  getDrones: async (filters = {}) => {
    try {
      // Build query string for filters
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const queryString = queryParams.toString();
      
      const response = await api.get(`/drones${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch drones' };
    }
  },

  /**
   * Get a drone by ID
   *
   * @param {string} id - Drone ID
   * @returns {Promise<Object>} Drone object
   */
  getDroneById: async (id) => {
    try {
      const response = await api.get(`/drones/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch drone' };
    }
  },

  /**
   * Add a new drone
   *
   * @param {Object} droneData - Drone data
   * @returns {Promise<Object>} Created drone object
   */
  createDrone: async (droneData) => {
    try {
      const response = await api.post('/drones', droneData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create drone' };
    }
  },

  /**
   * Update an existing drone
   *
   * @param {string} id - Drone ID
   * @param {Object} droneData - Drone data to update
   * @returns {Promise<Object>} Updated drone object
   */
  updateDrone: async (id, droneData) => {
    try {
      const response = await api.put(`/drones/${id}`, droneData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update drone' };
    }
  },

  /**
   * Delete a drone
   *
   * @param {string} id - Drone ID
   * @returns {Promise<Object>} Response object
   */
  deleteDrone: async (id) => {
    try {
      const response = await api.delete(`/drones/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete drone' };
    }
  },

  /**
   * Get real-time telemetry for a drone
   *
   * @param {string} id - Drone ID
   * @returns {Promise<Object>} Telemetry data
   */
  getDroneTelemetry: async (id) => {
    try {
      const response = await api.get(`/drones/${id}/telemetry`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch drone telemetry' };
    }
  },

  /**
   * Connect to a drone
   *
   * @param {string} id - Drone ID
   * @returns {Promise<Object>} Connection response
   */
  connectDrone: async (id) => {
    try {
      const response = await api.put(`/drones/${id}/connect`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to connect to drone' };
    }
  },

  /**
   * Disconnect from a drone
   *
   * @param {string} id - Drone ID
   * @returns {Promise<Object>} Disconnect response
   */
  disconnectDrone: async (id) => {
    try {
      const response = await api.put(`/drones/${id}/disconnect`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to disconnect from drone' };
    }
  },

  /**
   * Calibrate drone sensors
   *
   * @param {string} id - Drone ID
   * @param {string} sensorType - Type of sensor to calibrate (e.g., 'compass', 'accelerometer')
   * @returns {Promise<Object>} Calibration response
   */
  calibrateDrone: async (id, sensorType) => {
    try {
      const response = await api.put(`/drones/${id}/calibrate`, { sensorType });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to calibrate drone' };
    }
  },

  /**
   * Arm the drone
   *
   * @param {string} id - Drone ID
   * @returns {Promise<Object>} Response object
   */
  armDrone: async (id) => {
    try {
      const response = await api.put(`/drones/${id}/arm`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to arm drone' };
    }
  },

  /**
   * Disarm the drone
   *
   * @param {string} id - Drone ID
   * @returns {Promise<Object>} Response object
   */
  disarmDrone: async (id) => {
    try {
      const response = await api.put(`/drones/${id}/disarm`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to disarm drone' };
    }
  },

  /**
   * Take off the drone
   *
   * @param {string} id - Drone ID
   * @param {number} altitude - Target altitude in meters
   * @returns {Promise<Object>} Response object
   */
  takeoff: async (id, altitude) => {
    try {
      const response = await api.put(`/drones/${id}/takeoff`, { altitude });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to take off' };
    }
  },

  /**
   * Land the drone
   *
   * @param {string} id - Drone ID
   * @returns {Promise<Object>} Response object
   */
  land: async (id) => {
    try {
      const response = await api.put(`/drones/${id}/land`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to land drone' };
    }
  },

  /**
   * Command drone to return to home/launch position
   *
   * @param {string} id - Drone ID
   * @returns {Promise<Object>} Response object
   */
  returnToHome: async (id) => {
    try {
      const response = await api.put(`/drones/${id}/return-home`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to return to home' };
    }
  },

  /**
   * Get drone flight logs
   *
   * @param {string} id - Drone ID
   * @param {Object} filters - Optional filter parameters
   * @returns {Promise<Array>} Array of flight log objects
   */
  getDroneFlightLogs: async (id, filters = {}) => {
    try {
      // Build query string for filters
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const queryString = queryParams.toString();
      
      const response = await api.get(`/drones/${id}/flight-logs${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch flight logs' };
    }
  },

  /**
   * Update drone firmware
   *
   * @param {string} id - Drone ID
   * @param {Object} firmwareData - Firmware update data
   * @returns {Promise<Object>} Update response
   */
  updateFirmware: async (id, firmwareData) => {
    try {
      const response = await api.put(`/drones/${id}/firmware-update`, firmwareData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update firmware' };
    }
  },

  /**
   * Get available drone models
   *
   * @returns {Promise<Array>} Array of drone model objects
   */
  getDroneModels: async () => {
    try {
      const response = await api.get('/drones/models');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch drone models' };
    }
  },

  /**
   * Get drone health status
   *
   * @param {string} id - Drone ID
   * @returns {Promise<Object>} Health status data
   */
  getDroneHealth: async (id) => {
    try {
      const response = await api.get(`/drones/${id}/health`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch drone health' };
    }
  },

  /**
   * Schedule maintenance for a drone
   *
   * @param {string} id - Drone ID
   * @param {Object} maintenanceData - Maintenance details
   * @returns {Promise<Object>} Updated drone object
   */
  scheduleMaintenance: async (id, maintenanceData) => {
    try {
      const response = await api.put(`/drones/${id}/maintenance`, maintenanceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to schedule maintenance' };
    }
  },

  /**
   * Get flight statistics for a drone
   *
   * @param {string} id - Drone ID
   * @returns {Promise<Object>} Flight statistics
   */
  getDroneStatistics: async (id) => {
    try {
      const response = await api.get(`/drones/${id}/statistics`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch drone statistics' };
    }
  },

  /**
   * Send emergency command to a drone (e.g., emergency stop)
   *
   * @param {string} id - Drone ID
   * @param {string} command - Emergency command
   * @returns {Promise<Object>} Command response
   */
  sendEmergencyCommand: async (id, command) => {
    try {
      const response = await api.put(`/drones/${id}/emergency`, { command });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send emergency command' };
    }
  }
};

export default droneService;