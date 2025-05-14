import api from '../utils/api';

/**
 * Authentication service for user login, registration, and token management
 */
const authService = {
  /**
   * Login a user with email and password
   *
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} Response object with user data and token
   */
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  /**
   * Register a new user
   *
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User's name
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password
   * @returns {Promise<Object>} Response object with user data and token
   */
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  /**
   * Log out the current user
   *
   * @returns {void}
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Check if the current user is authenticated (has a stored token)
   *
   * @returns {boolean} True if authenticated, false otherwise
   */
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  /**
   * Get the current user from localStorage
   *
   * @returns {Object|null} User object or null if not logged in
   */
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  },

  /**
   * Get the current JWT token
   *
   * @returns {string|null} JWT token or null if not logged in
   */
  getToken: () => {
    return localStorage.getItem('token');
  },

  /**
   * Validate current token with the server
   *
   * @returns {Promise<Object>} Response with validation result and user data
   */
  validateToken: async () => {
    try {
      const response = await api.get('/auth/validate');
      return response.data;
    } catch (error) {
      // If token validation fails, remove invalid token
      if (error.response?.status === 401) {
        authService.logout();
      }
      throw error.response?.data || { message: 'Token validation failed' };
    }
  },

  /**
   * Send password reset request
   *
   * @param {string} email - User's email
   * @returns {Promise<Object>} Response with reset instructions
   */
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Password reset request failed' };
    }
  },

  /**
   * Reset password with token
   *
   * @param {string} token - Reset token from email
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Response with reset result
   */
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Password reset failed' };
    }
  },

  /**
   * Change password for authenticated user
   *
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Response with change result
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Password change failed' };
    }
  },

  /**
   * Update user profile
   *
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Response with updated user data
   */
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      
      // Update stored user data
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Profile update failed' };
    }
  }
};

export default authService;