import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const DronesContext = createContext();

export const useDrones = () => useContext(DronesContext);

export const DronesProvider = ({ children }) => {
  const [drones, setDrones] = useState([]);
  const [activeDrone, setActiveDrone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Fetch all drones - converted to useCallback for consistency with other contexts
  const fetchDrones = useCallback(async (filter = {}) => {
    // Only fetch if authenticated
    if (!isAuthenticated()) {
      console.log('Not authenticated, skipping drones fetch');
      setLoading(false);
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      console.log('Starting drones fetch...');
      setLoading(true);
      setError(null);
      
      // Build query string for filters
      const queryParams = new URLSearchParams();
      if (filter.status) queryParams.append('status', filter.status);
      if (filter.model) queryParams.append('model', filter.model);
      
      const queryString = queryParams.toString();
      
      const response = await api.get(`/drones${queryString ? `?${queryString}` : ''}`);
      
      // Handle response structure correctly 
      const dronesArray = Array.isArray(response.data) ? response.data : 
                        (response.data?.drones || []);
      
      console.log('Drones fetch successful, count:', dronesArray.length);
      setDrones(dronesArray);
      return { success: true, drones: dronesArray, pagination: response.data?.pagination };
    } catch (err) {
      console.error('Error fetching drones:', err);
      setError(err.response?.data?.message || 'Failed to load drones');
      return { success: false, error: err.response?.data?.message || 'Failed to load drones' };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Get a specific drone by ID
  const getDroneDetails = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      // Make API call to get drone details
      const response = await api.get(`/drones/${id}`);
      
      return response.data;
    } catch (err) {
      console.error('Error fetching drone details:', err);
      setError(err.response?.data?.message || 'Failed to load drone details');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let socket = null;

    const initializeSocket = async () => {
      if (!isAuthenticated()) {
        return;
      }
      
      try {
        // Import socket.io client dynamically to avoid SSR issues
        const socketIO = (await import('socket.io-client')).default;
        
        socket = socketIO(import.meta.env.VITE_API_URL || 'http://localhost:5000');
        
        socket.on('connect', () => {
          console.log('Connected to drone updates socket');
        });
        
        socket.on('droneUpdate', (updatedDrone) => {
          console.log('Received drone update:', updatedDrone._id);
          
          setDrones(prevDrones => 
            prevDrones.map(drone => 
              drone._id === updatedDrone._id ? updatedDrone : drone
            )
          );
          
          if (activeDrone && activeDrone._id === updatedDrone._id) {
            setActiveDrone(updatedDrone);
          }
        });
        
        socket.on('droneStatusUpdate', (updatedDrone) => {
          setDrones(prevDrones => 
            prevDrones.map(drone => 
              drone._id === updatedDrone._id ? updatedDrone : drone
            )
          );
          
          if (activeDrone && activeDrone._id === updatedDrone._id) {
            setActiveDrone(updatedDrone);
          }
        });
        
        socket.on('disconnect', () => {
          console.log('Disconnected from drone updates socket');
        });
      } catch (err) {
        console.error('Error setting up drone socket:', err);
      }
    };

    // Initial fetch and socket setup
    fetchDrones();
    initializeSocket();
    
    // Clean up socket connection when component unmounts
    return () => {
      if (socket) {
        console.log('Disconnecting drone socket on unmount');
        socket.disconnect();
        socket = null;
      }
    };
  }, [isAuthenticated, fetchDrones]);

  const addDrone = async (droneData) => {
    if (!isAuthenticated()) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Map frontend status values to backend-compatible enum values
      let backendStatus = 'idle'; // Default status
      
      // Status mapping from frontend to backend
      switch (droneData.status) {
        case 'available':
          backendStatus = 'idle';
          break;
        case 'in-mission':
          backendStatus = 'flying';
          break;
        case 'maintenance':
          backendStatus = 'maintenance';
          break;
        case 'offline':
          backendStatus = 'offline';
          break;
        case 'error':
          backendStatus = 'error';
          break;
        default:
          backendStatus = 'idle';
      }
      
      // Transform frontend data structure to match backend expectations
      const transformedData = {
        name: droneData.name,
        model: droneData.model,
        serialNumber: droneData.serial, // Map 'serial' to 'serialNumber'
        status: backendStatus, // Use the mapped status
        batteryLevel: droneData.batteryLevel || 100,
        // Add required organization field with a default value
        organization: droneData.organization || 'FlytBase', // Use a better default organization name
        
        // Handle nested specifications
        specifications: {
          maxFlightTime: droneData.maxFlightTime,
          maxSpeed: droneData.maxSpeed,
          maxAltitude: droneData.maxAltitude,
          maxRange: droneData.maxRange,
          weight: droneData.weight,
          dimensions: droneData.dimensions || {
            length: 30,
            width: 30,
            height: 15
          }
        },
        
        // Make sure coordinates are valid numbers or use defaults
        lastLocation: {
          type: 'Point',
          coordinates: [
            typeof droneData.location?.coordinates[0] === 'number' ? droneData.location.coordinates[0] : 0,
            typeof droneData.location?.coordinates[1] === 'number' ? droneData.location.coordinates[1] : 0
          ]
        },
        
        // Add required user ID if available
        createdBy: droneData.userId || "000000000000000000000000" // Default placeholder
      };
      
      console.log('Sending transformed drone data:', transformedData);
      
      // Make the API request with transformed data
        const response = await api.post('/drones', transformedData);
        setDrones(prev => {
            if (!Array.isArray(prev)) {
              console.warn('Expected drones state to be an array but got:', typeof prev);
              return [response.data]; // Start a new array if prev isn't iterable
            }
            return [...prev, response.data];
          });

      return { success: true, drone: response.data };
    } catch (err) {
      console.error('Error adding drone:', err);
      
      let errorMsg = 'Failed to add drone';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
};

  const updateDrone = async (id, droneData) => {
    if (!isAuthenticated()) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(`/drones/${id}`, droneData);
      
      setDrones(prevDrones => 
        prevDrones.map(drone => drone._id === id ? response.data : drone)
      );
      
      if (activeDrone && activeDrone._id === id) {
        setActiveDrone(response.data);
      }
      
      return { success: true, drone: response.data };
    } catch (err) {
      console.error('Error updating drone:', err);
      setError(err.response?.data?.message || 'Failed to update drone');
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to update drone' 
      };
    } finally {
      setLoading(false);
    }
  };

  const updateDroneStatus = async (id, status) => {
    if (!isAuthenticated()) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(`/drones/${id}/status`, { status });
      
      setDrones(prevDrones => 
        prevDrones.map(drone => drone._id === id ? response.data : drone)
      );
      
      if (activeDrone && activeDrone._id === id) {
        setActiveDrone(response.data);
      }
      
      return { success: true, drone: response.data };
    } catch (err) {
      console.error('Error updating drone status:', err);
      setError(err.response?.data?.message || 'Failed to update drone status');
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to update drone status' 
      };
    } finally {
      setLoading(false);
    }
  };

  const deleteDrone = async (id) => {
    if (!isAuthenticated()) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await api.delete(`/drones/${id}`);
      
      setDrones(prevDrones => prevDrones.filter(drone => drone._id !== id));
      
      if (activeDrone && activeDrone._id === id) {
        setActiveDrone(null);
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting drone:', err);
      setError(err.response?.data?.message || 'Failed to delete drone');
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to delete drone' 
      };
    } finally {
      setLoading(false);
    }
  };

  const getDroneHealth = async (id) => {
    if (!isAuthenticated()) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      const response = await api.get(`/drones/${id}/health`);
      return { success: true, health: response.data };
    } catch (err) {
      console.error('Error fetching drone health:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to fetch drone health' };
    }
  };

  return (
    <DronesContext.Provider 
      value={{ 
        drones, 
        activeDrone,
        loading, 
        error,
        fetchDrones,
        getDroneDetails,
        addDrone, 
        updateDrone,
        updateDroneStatus, 
        deleteDrone,
        getDroneHealth
      }}
    >
      {children}
    </DronesContext.Provider>
  );
};