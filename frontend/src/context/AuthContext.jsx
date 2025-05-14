import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  // Simplified authentication check
  const isAuthenticated = useCallback(() => {
    return !!token;
  }, [token]);
  
  const getToken = useCallback(() => {
    return token;
  }, [token]);

  // Configure API with token when it changes
  useEffect(() => {
    if (token) {
      // Set token in localStorage and configure API headers
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('API token set in headers:', `Bearer ${token.substring(0, 5)}...`);
    } else {
      // Clear token from localStorage and remove API headers
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      console.log('API token removed from headers');
    }
  }, [token]);

  const logout = useCallback(() => {
    // Clear token and user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Remove Authorization header from API
    delete api.defaults.headers.common['Authorization'];
    
    setToken(null);
    setUser(null);
    return { success: true };
  }, []);

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (!storedToken) {
          setLoading(false);
          return;
        }

        // Set token from localStorage
        setToken(storedToken);
        
        // Set Authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

        // Set user from localStorage first to avoid UI flicker
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (e) {
            console.error('Error parsing saved user');
          }
        }
        
        try {
          // Validate token by fetching user profile
          const response = await api.get('/users/profile');
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (err) {
          console.error('Token validation failed', err);
          // Only logout on 401/403 errors
          if (err.response?.status === 401 || err.response?.status === 403) {
            logout();
          }
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [logout]);

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      // Don't use the intercepted API for login to avoid circular dependencies
      const response = await api.post('/users/login', { email, password });
      
      const { token: newToken, user: userData } = response.data;

      // Explicitly set the Authorization header FIRST for immediate use
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      // Then set token in localStorage
      localStorage.setItem('token', newToken);
      
      // Then update state
      setToken(newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true, user: userData };
      
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return { success: false, error: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await api.post('/users/register', {
        name, email, password
      });
      
      const { token: newToken, user: userData } = response.data;
      
      // Set token in state first (this will update localStorage and API headers via useEffect)
      setToken(newToken);
      
      // Then set user data
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      // Explicitly set the Authorization header for immediate use
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { success: true, user: userData };
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return { success: false, error: err.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading,
        error,
        login, 
        register, 
        logout,
        isAuthenticated,
        getToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};