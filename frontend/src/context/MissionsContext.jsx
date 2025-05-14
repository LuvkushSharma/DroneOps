import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../utils/api'; // Use the configured API with interceptors
import { useAuth } from './AuthContext';

const MissionsContext = createContext();

export const useMissions = () => useContext(MissionsContext);

export const MissionsProvider = ({ children }) => {
  const [missions, setMissions] = useState([]);
  const [activeMission, setActiveMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const { isAuthenticated } = useAuth();

  // Fetch all missions
  const fetchMissions = useCallback(async (filter = {}) => {
    if (!isAuthenticated()) {
      console.log('Not authenticated, skipping missions fetch');
      setLoading(false);
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      console.log('Starting missions fetch...');
      setLoading(true);
      setError(null);
      
      // Build query string for filters
      const queryParams = new URLSearchParams();
      if (filter.status) queryParams.append('status', filter.status);
      if (filter.droneId) queryParams.append('droneId', filter.droneId);
      if (filter.surveyId) queryParams.append('surveyId', filter.surveyId);
      
      const queryString = queryParams.toString();
      
      // Use the api instance which already has the token in its interceptors
      const response = await api.get(`/missions${queryString ? `?${queryString}` : ''}`);

      console.log('Missions fetch successful', response.data?.length || 0);
      
      setMissions(response.data || []);
      return { success: true, missions: response.data || [] };
    } catch (err) {
      console.error('Error fetching missions:', err);
      setError(err.response?.data?.message || 'Failed to load missions');
      return { success: false, error: err.response?.data?.message || 'Failed to load missions' };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Initial fetch when the component mounts
  useEffect(() => {
    console.log("MissionsContext initialized, fetching data...");
    fetchMissions();
    
    // Setup real-time mission updates
    const setupMissionSocket = async () => {
      try {
        if (!isAuthenticated()) return;
        
        // Import socket.io client dynamically to avoid SSR issues
        const io = (await import('socket.io-client')).default;
        
        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
        
        newSocket.on('connect', () => {
          console.log('Connected to mission updates socket');
        });
        
        newSocket.on('missionUpdate', (updatedMission) => {
          console.log('Received mission update:', updatedMission._id);
          
          setMissions(prevMissions => 
            prevMissions.map(mission => 
              mission._id === updatedMission._id ? updatedMission : mission
            )
          );
          
          if (activeMission && activeMission._id === updatedMission._id) {
            setActiveMission(updatedMission);
          }
        });
        
        newSocket.on('missionProgress', (missionId, progress) => {
          console.log(`Mission ${missionId} progress: ${progress}%`);
          
          setMissions(prevMissions => 
            prevMissions.map(mission => 
              mission._id === missionId 
                ? { ...mission, progress } 
                : mission
            )
          );
          
          if (activeMission && activeMission._id === missionId) {
            setActiveMission(prev => prev ? { ...prev, progress } : prev);
          }
        });
        
        newSocket.on('disconnect', () => {
          console.log('Disconnected from mission updates socket');
        });
        
        setSocket(newSocket);
        
        return () => {
          if (newSocket) {
            newSocket.disconnect();
          }
        };
      } catch (err) {
        console.error('Error setting up mission socket:', err);
      }
    };
    
    setupMissionSocket();
  }, [fetchMissions, isAuthenticated]);

  // Clean up socket on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        console.log('Disconnecting mission socket on unmount');
        socket.disconnect();
      }
    };
  }, [socket]);

  const getMissionDetails = async (id) => {
    if (!isAuthenticated()) {
      return { success: false, error: 'User not authenticated' };
    }
    
    if (!id) {
      return { success: false, error: 'Missing mission ID' };
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/missions/${id}`);
      
      setActiveMission(response.data);
      return { success: true, mission: response.data };
    } catch (err) {
      console.error('Error fetching mission details:', err);
      setError(err.response?.data?.message || 'Failed to fetch mission details');
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to fetch mission details' 
      };
    } finally {
      setLoading(false);
    }
  };

  const createMission = async (missionData) => {
    if (!isAuthenticated()) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/missions', missionData);
      
      setMissions(prevMissions => [...prevMissions, response.data]);
      return { success: true, mission: response.data };
    } catch (err) {
      console.error('Error creating mission:', err);
      setError(err.response?.data?.message || 'Failed to create mission');
      return { success: false, error: err.response?.data?.message || 'Failed to create mission' };
    } finally {
      setLoading(false);
    }
  };

  const updateMission = async (id, missionData) => {
    if (!isAuthenticated()) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(`/missions/${id}`, missionData);
      
      setMissions(prevMissions => 
        prevMissions.map(mission => mission._id === id ? response.data : mission)
      );
      
      if (activeMission && activeMission._id === id) {
        setActiveMission(response.data);
      }
      
      return { success: true, mission: response.data };
    } catch (err) {
      console.error('Error updating mission:', err);
      setError(err.response?.data?.message || 'Failed to update mission');
      return { success: false, error: err.response?.data?.message || 'Failed to update mission' };
    } finally {
      setLoading(false);
    }
  };

  const deleteMission = async (id) => {
    if (!isAuthenticated()) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await api.delete(`/missions/${id}`);
      
      setMissions(prevMissions => prevMissions.filter(mission => mission._id !== id));
      
      if (activeMission && activeMission._id === id) {
        setActiveMission(null);
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting mission:', err);
      setError(err.response?.data?.message || 'Failed to delete mission');
      return { success: false, error: err.response?.data?.message || 'Failed to delete mission' };
    } finally {
      setLoading(false);
    }
  };

  const startMission = async (id) => {
    if (!isAuthenticated()) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(`/missions/${id}/start`);
      
      setMissions(prevMissions => 
        prevMissions.map(mission => mission._id === id ? response.data : mission)
      );
      
      if (activeMission && activeMission._id === id) {
        setActiveMission(response.data);
      }
      
      return { success: true, mission: response.data };
    } catch (err) {
      console.error('Error starting mission:', err);
      setError(err.response?.data?.message || 'Failed to start mission');
      return { success: false, error: err.response?.data?.message || 'Failed to start mission' };
    } finally {
      setLoading(false);
    }
  };

  const pauseMission = async (id) => {
    if (!isAuthenticated()) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(`/missions/${id}/pause`);
      
      setMissions(prevMissions => 
        prevMissions.map(mission => mission._id === id ? response.data : mission)
      );
      
      if (activeMission && activeMission._id === id) {
        setActiveMission(response.data);
      }
      
      return { success: true, mission: response.data };
    } catch (err) {
      console.error('Error pausing mission:', err);
      setError(err.response?.data?.message || 'Failed to pause mission');
      return { success: false, error: err.response?.data?.message || 'Failed to pause mission' };
    } finally {
      setLoading(false);
    }
  };

  const resumeMission = async (id) => {
    if (!isAuthenticated()) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(`/missions/${id}/resume`);
      
      setMissions(prevMissions => 
        prevMissions.map(mission => mission._id === id ? response.data : mission)
      );
      
      if (activeMission && activeMission._id === id) {
        setActiveMission(response.data);
      }
      
      return { success: true, mission: response.data };
    } catch (err) {
      console.error('Error resuming mission:', err);
      setError(err.response?.data?.message || 'Failed to resume mission');
      return { success: false, error: err.response?.data?.message || 'Failed to resume mission' };
    } finally {
      setLoading(false);
    }
  };

  const abortMission = async (id) => {
    if (!isAuthenticated()) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(`/missions/${id}/abort`);
      
      setMissions(prevMissions => 
        prevMissions.map(mission => mission._id === id ? response.data : mission)
      );
      
      if (activeMission && activeMission._id === id) {
        setActiveMission(response.data);
      }
      
      return { success: true, mission: response.data };
    } catch (err) {
      console.error('Error aborting mission:', err);
      setError(err.response?.data?.message || 'Failed to abort mission');
      return { success: false, error: err.response?.data?.message || 'Failed to abort mission' };
    } finally {
      setLoading(false);
    }
  };

  const getMissionTelemetry = async (id) => {
    if (!isAuthenticated()) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      const response = await api.get(`/missions/${id}/telemetry`);
      return { success: true, telemetry: response.data };
    } catch (err) {
      console.error('Error fetching mission telemetry:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to fetch mission telemetry' };
    }
  };

  const getMissionWaypoints = async (id) => {
    if (!isAuthenticated()) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      const response = await api.get(`/missions/${id}/waypoints`);
      return { success: true, waypoints: response.data };
    } catch (err) {
      console.error('Error fetching mission waypoints:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to fetch mission waypoints' };
    }
  };

  const updateMissionWaypoints = async (id, waypoints) => {
    if (!isAuthenticated()) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      const response = await api.put(`/missions/${id}/waypoints`, { waypoints });
      
      if (activeMission && activeMission._id === id) {
        setActiveMission(prev => ({ ...prev, waypoints: response.data }));
      }
      
      return { success: true, waypoints: response.data };
    } catch (err) {
      console.error('Error updating mission waypoints:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to update mission waypoints' };
    }
  };

  const getMissionStatistics = async (id) => {
    if (!isAuthenticated()) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      const response = await api.get(`/missions/${id}/statistics`);
      return { success: true, statistics: response.data };
    } catch (err) {
      console.error('Error fetching mission statistics:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to fetch mission statistics' };
    }
  };

  const generateMissionFromPattern = async (patternData) => {
    if (!isAuthenticated()) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      const response = await api.post('/missions/generate-pattern', patternData);
      return { success: true, waypoints: response.data.waypoints };
    } catch (err) {
      console.error('Error generating mission from pattern:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to generate mission pattern' };
    }
  };

  return (
    <MissionsContext.Provider 
      value={{ 
        missions,
        activeMission,
        loading,
        error,
        fetchMissions,
        getMissionDetails,
        createMission,
        updateMission,
        deleteMission,
        startMission,
        pauseMission,
        resumeMission,
        abortMission,
        getMissionTelemetry,
        getMissionWaypoints,
        updateMissionWaypoints,
        getMissionStatistics,
        generateMissionFromPattern
      }}
    >
      {children}
    </MissionsContext.Provider>
  );
};