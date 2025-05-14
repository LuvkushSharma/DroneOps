import { createContext, useState, useContext, useEffect , useCallback} from 'react';
import api from '../utils/api'; // Use the configured API with interceptors
import { useAuth } from './AuthContext';

const SurveysContext = createContext();

export const useSurveys = () => useContext(SurveysContext);

export const SurveysProvider = ({ children }) => {
  const [surveys, setSurveys] = useState([]);
  const [activeSurvey, setActiveSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth(); // We don't need getToken anymore

  const fetchSurveys = useCallback(async () => {
    if (!isAuthenticated()) {
      console.log('Not authenticated, skipping surveys fetch');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Starting surveys fetch...');
      setLoading(true);
      setError(null);
      
      // Use the api instance which already has the token in its interceptors
      const response = await api.get('/surveys');

      console.log('Surveys fetch successful', response.data?.length || 0);
      
      setSurveys(response.data || []);
    } catch (err) {
      console.error('Error fetching surveys:', err);
      setError(err.response?.data?.message || 'Failed to load surveys');
      setSurveys([]);
    } finally {
      setLoading(false);  // Make sure loading is set to false in all cases
    }
  }, [isAuthenticated]);

  // Initial fetch when the component mounts
  useEffect(() => {
    console.log("SurveysContext initialized, fetching data...");
    fetchSurveys();
  }, [fetchSurveys]);

  const createSurvey = async (surveyData) => {
    if (!isAuthenticated()) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      // Use the api instance which already has the token in its interceptors
      const response = await api.post('/surveys', surveyData);
      
      setSurveys(prevSurveys => [...prevSurveys, response.data]);
      return { success: true, survey: response.data };
    } catch (err) {
      console.error('Error creating survey:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to create survey' };
    }
  };

  const getSurveyDetails = async (id) => {
    if (!isAuthenticated()) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      // Use the api instance which already has the token in its interceptors
      const response = await api.get(`/surveys/${id}`);
      
      setActiveSurvey(response.data);
      return { success: true, survey: response.data };
    } catch (err) {
      console.error('Error fetching survey details:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to fetch survey details' };
    }
  };

  const updateSurvey = async (id, surveyData) => {
    if (!isAuthenticated()) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      // Use the api instance which already has the token in its interceptors
      const response = await api.put(`/surveys/${id}`, surveyData);
      
      setSurveys(prevSurveys => prevSurveys.map(survey => 
        survey._id === id ? response.data : survey
      ));
      
      if (activeSurvey && activeSurvey._id === id) {
        setActiveSurvey(response.data);
      }
      
      return { success: true, survey: response.data };
    } catch (err) {
      console.error('Error updating survey:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to update survey' };
    }
  };

  const deleteSurvey = async (id) => {
    if (!isAuthenticated()) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      // Use the api instance which already has the token in its interceptors
      await api.delete(`/surveys/${id}`);
      
      setSurveys(prevSurveys => prevSurveys.filter(survey => survey._id !== id));
      
      if (activeSurvey && activeSurvey._id === id) {
        setActiveSurvey(null);
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting survey:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to delete survey' };
    }
  };

  const addMissionToSurvey = async (surveyId, missionId) => {
    if (!isAuthenticated()) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      // Use the api instance which already has the token in its interceptors
      await api.post(`/surveys/${surveyId}/missions`, { missionId });
      
      // Refresh survey data after adding mission
      const response = await api.get(`/surveys/${surveyId}`);
      
      setSurveys(prevSurveys => prevSurveys.map(survey => 
        survey._id === surveyId ? response.data : survey
      ));
      
      if (activeSurvey && activeSurvey._id === surveyId) {
        setActiveSurvey(response.data);
      }
      
      return { success: true, survey: response.data };
    } catch (err) {
      console.error('Error adding mission to survey:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to add mission to survey' };
    }
  };

  const getSurveyStatistics = async (id) => {
    if (!isAuthenticated()) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      // Use the api instance which already has the token in its interceptors
      const response = await api.get(`/surveys/${id}/statistics`);
      
      return { success: true, statistics: response.data };
    } catch (err) {
      console.error('Error fetching survey statistics:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to fetch survey statistics' };
    }
  };

  return (
    <SurveysContext.Provider 
      value={{ 
        surveys,
        activeSurvey,
        loading,
        error,
        fetchSurveys,
        createSurvey,
        getSurveyDetails,
        updateSurvey,
        deleteSurvey,
        addMissionToSurvey,
        getSurveyStatistics
      }}
    >
      {children}
    </SurveysContext.Provider>
  );
};