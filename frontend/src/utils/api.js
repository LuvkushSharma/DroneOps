import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Simple API wrapper with interceptors for authentication
 */
class ApiManager {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log(`Adding auth token to ${config.url}`);
        } else {
          console.log(`No token for request to ${config.url}`);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Log all errors but don't auto-clear token
        console.error(`API Error: ${error.response?.status} on ${error.config?.url}`);
        return Promise.reject(error);
      }
    );
  }
  
  getApi() {
    return this.api;
  }
}

const apiManager = new ApiManager();
export default apiManager.getApi();