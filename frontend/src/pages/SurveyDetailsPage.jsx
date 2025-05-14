// filepath: /Users/luv.sharma/Desktop/Flytbase/frontend/src/pages/SurveyDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiEdit, 
  FiTrash2, 
  FiDownload, 
  FiPrinter,
  FiBarChart2,
  FiMapPin,
  FiPlusCircle,
  FiCopy,
  FiCalendar,
  FiClock,
  FiUser,
  FiPackage,
  FiAlertTriangle,
  FiMap
} from 'react-icons/fi';
import { useSurveys } from '../context/SurveysContext';
import { useMissions } from '../context/MissionsContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import MapContainer from '../components/MapContainer';
import MissionCard from '../components/MissionCard';
import Modal from '../components/Modal';
import { formatDate, formatDateTime, getRelativeTime } from '../utils/dateFormatter';
import { getSurveyStatusColors } from '../utils/statusColorHelper';

const SurveyDetailsPage = () => {
  const { id } = useParams();
  const { getSurveyById, deleteSurvey } = useSurveys();
  const { fetchMissions } = useMissions();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [survey, setSurvey] = useState(null);
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [mapData, setMapData] = useState({
    markers: [],
    polygons: [],
    paths: [],
    center: { lat: 21.7679, lng: 78.8718 },
    zoom: 5
  });

  // Load survey data
  useEffect(() => {
    const loadSurveyData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch survey details
        const { success, survey: surveyData, error: surveyError } = await getSurveyById(id);
        
        if (!success) {
          throw new Error(surveyError || 'Failed to load survey details');
        }
        
        setSurvey(surveyData);
        
        // Prepare map data
        if (surveyData.area) {
          const mapCenter = calculateCenterPoint(surveyData.area);
          
          setMapData({
            markers: [],
            polygons: [
              {
                coordinates: surveyData.area,
                color: '#3388ff',
                fillColor: '#3388ff',
                fillOpacity: 0.2
              }
            ],
            paths: [],
            center: mapCenter,
            zoom: 12
          });
        }
        
        // Fetch missions associated with this survey
        const { success: missionsSuccess, missions: missionsData } = await fetchMissions({ surveyId: id });
        
        if (missionsSuccess) {
          setMissions(missionsData);
          
          // Add mission paths to the map
          if (missionsData.length > 0) {
            const updatedMapData = { ...mapData };
            
            missionsData.forEach(mission => {
              if (mission.waypoints && mission.waypoints.length > 0) {
                // Add path for each mission
                updatedMapData.paths.push({
                  coordinates: mission.waypoints.map(wp => [wp.lat, wp.lng]),
                  color: getColorForStatus(mission.status),
                  weight: 2,
                  popup: `Mission: ${mission.name} (${mission.status})`
                });
              }
            });
            
            setMapData(updatedMapData);
          }
        }
      } catch (err) {
        console.error('Error loading survey details:', err);
        setError(err.message || 'An error occurred while loading the survey details');
      } finally {
        setLoading(false);
      }
    };
    
    loadSurveyData();
  }, [id, getSurveyById, fetchMissions]);

  // Helper function to calculate center point of polygon
  const calculateCenterPoint = (coordinates) => {
    if (!coordinates || coordinates.length === 0) {
      return { lat: 21.7679, lng: 78.8718 }; // Default to center of India
    }
    
    const total = coordinates.reduce((acc, coord) => {
      return {
        lat: acc.lat + coord[0],
        lng: acc.lng + coord[1]
      };
    }, { lat: 0, lng: 0 });
    
    return {
      lat: total.lat / coordinates.length,
      lng: total.lng / coordinates.length
    };
  };

  // Get color based on mission status
  const getColorForStatus = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in_progress': return '#3b82f6';
      case 'paused': return '#f59e0b';
      case 'scheduled': return '#6366f1';
      case 'failed': return '#ef4444';
      case 'cancelled': return '#9ca3af';
      default: return '#6b7280';
    }
  };

  // Handler for deleting survey
  const handleDeleteSurvey = async () => {
    try {
      setLoading(true);
      const { success } = await deleteSurvey(id);
      
      if (success) {
        navigate('/surveys', { state: { message: 'Survey deleted successfully' } });
      } else {
        throw new Error('Failed to delete survey');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while deleting the survey');
      setLoading(false);
    }
  };

  // Handler for downloading survey data
  const handleDownloadData = async (format = 'csv') => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/surveys/${id}/download?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to download survey data');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `survey-${id}-data.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading survey data:', err);
      setError('Failed to download survey data. Please try again.');
    }
  };

  // Generate PDF report
  const handleGenerateReport = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/surveys/${id}/report`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to generate report');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `survey-${id}-report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report. Please try again.');
    }
  };

  // Duplicate survey handler
  const handleDuplicateSurvey = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/surveys/${id}/duplicate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to duplicate survey');
      
      const data = await response.json();
      navigate(`/surveys/${data._id}`, { state: { message: 'Survey duplicated successfully' } });
    } catch (err) {
      console.error('Error duplicating survey:', err);
      setError('Failed to duplicate survey. Please try again.');
    }
  };

  // Page loading state
  if (loading && !survey) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading survey details..." />
        </div>
      </div>
    );
  }

  // Error state
  if (error && !survey) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading survey</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-100"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!survey) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Survey not found</h3>
              <div className="mt-2 text-sm text-yellow-700">
                The survey you are looking for does not exist or you don't have permission to view it.
              </div>
              <div className="mt-4">
                <Link
                  to="/surveys"
                  className="rounded-md bg-yellow-50 px-3 py-2 text-sm font-medium text-yellow-800 hover:bg-yellow-100"
                >
                  Back to Surveys
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get status colors
  const statusColors = getSurveyStatusColors(survey.status);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li>
              <Link to="/surveys" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                <FiArrowLeft className="inline mr-2" />
                Back to Surveys
              </Link>
            </li>
          </ol>
        </nav>
      </div>
      
      {/* Survey Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">{survey.name}</h1>
              <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                {survey.status?.replace('_', ' ')}
              </span>
            </div>
            
            <p className="mt-1 text-sm text-gray-500">
              <span className="inline-flex items-center">
                <FiMapPin className="mr-1" />
                Location: {survey.location || 'Not specified'}
              </span>
              <span className="ml-4 inline-flex items-center">
                <FiCalendar className="mr-1" />
                Created: {formatDate(survey.createdAt)}
              </span>
              {survey.updatedAt && (
                <span className="ml-4 inline-flex items-center">
                  <FiClock className="mr-1" />
                  Last updated: {getRelativeTime(survey.updatedAt)}
                </span>
              )}
              {survey.createdBy && (
                <span className="ml-4 inline-flex items-center">
                  <FiUser className="mr-1" />
                  Created by: {survey.createdBy.name || 'Unknown user'}
                </span>
              )}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            <Link
              to={`/surveys/analytics/${id}`}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <FiBarChart2 className="mr-2 h-4 w-4" />
              Analytics
            </Link>
            
            <button
              onClick={() => handleDownloadData('csv')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <FiDownload className="mr-2 h-4 w-4" />
              Export
            </button>
            
            <button
              onClick={handleGenerateReport}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <FiPrinter className="mr-2 h-4 w-4" />
              Report
            </button>
            
            <div className="relative inline-block text-left">
              <div>
                <button
                  onClick={() => navigate(`/surveys/edit/${id}`)}
                  className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <FiEdit className="mr-2 h-4 w-4" />
                  Edit
                </button>
              </div>
            </div>
            
            <div className="relative inline-block text-left">
              <div>
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  <FiTrash2 className="mr-2 h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Survey details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Survey Info */}
        <div className="col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 h-full">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Survey Details</h2>
            
            {survey.description && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1 text-sm text-gray-900">{survey.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="mt-1 text-sm text-gray-900 capitalize">{survey.status?.replace('_', ' ') || 'N/A'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Type</h3>
                <p className="mt-1 text-sm text-gray-900">{survey.type || 'N/A'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Area Size</h3>
                <p className="mt-1 text-sm text-gray-900">{survey.areaSize ? `${survey.areaSize} km²` : 'N/A'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Missions</h3>
                <p className="mt-1 text-sm text-gray-900">{missions.length}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                <p className="mt-1 text-sm text-gray-900">{survey.startDate ? formatDate(survey.startDate) : 'Not started'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">End Date</h3>
                <p className="mt-1 text-sm text-gray-900">{survey.endDate ? formatDate(survey.endDate) : 'Not completed'}</p>
              </div>
            </div>
            
            {/* Additional actions */}
            <div className="mt-6 space-y-4 border-t border-gray-200 pt-4">
              <button
                onClick={handleDuplicateSurvey}
                className="w-full inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <FiCopy className="mr-2 h-4 w-4" />
                Duplicate Survey
              </button>
              
              <Link
                to={`/missions/create?surveyId=${id}`}
                className="w-full inline-flex justify-center items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <FiPlusCircle className="mr-2 h-4 w-4" />
                Create New Mission
              </Link>
            </div>
          </div>
        </div>
        
        {/* Survey Map */}
        <div className="col-span-1 md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6 h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Survey Area</h2>
              <Link to={`/surveys/${id}/map`} className="text-sm text-primary-600 hover:text-primary-700">
                <FiMap className="inline mr-1" />
                Full Map View
              </Link>
            </div>
            
            <div className="h-80 md:h-96 rounded-lg overflow-hidden border border-gray-200">
              <MapContainer
                markers={mapData.markers}
                polygons={mapData.polygons}
                paths={mapData.paths}
                center={mapData.center}
                zoom={mapData.zoom}
                showControls={true}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Survey Missions */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Survey Missions</h2>
          
          <Link
            to={`/missions/create?surveyId=${id}`}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            <FiPlusCircle className="mr-2 h-4 w-4" />
            Add Mission
          </Link>
        </div>
        
        {loading && missions.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner size="md" text="Loading missions..." />
          </div>
        ) : missions.length === 0 ? (
          <div className="text-center py-8">
            <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No missions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              This survey doesn't have any missions yet.
            </p>
            <div className="mt-6">
              <Link
                to={`/missions/create?surveyId=${id}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                <FiPlusCircle className="mr-2 h-4 w-4" />
                Create Mission
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {missions.map(mission => (
                <MissionCard
                  key={mission._id}
                  mission={mission}
                  showActions={true}
                  onStartMission={() => {/* Handle start mission */}}
                  onPauseMission={() => {/* Handle pause mission */}}
                  onResumeMission={() => {/* Handle resume mission */}}
                  onAbortMission={() => {/* Handle abort mission */}}
                  onDelete={() => {/* Handle delete mission */}}
                />
              ))}
            </div>
            
            {missions.length > 3 && (
              <div className="mt-4 text-center">
                <Link
                  to={`/missions?surveyId=${id}`}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View All Missions
                </Link>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Show errors if any */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <FiAlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Survey"
        size="sm"
      >
        <div className="p-2">
          <p className="text-gray-700">
            Are you sure you want to delete this survey? This will also delete all associated missions and data.
            This action cannot be undone.
          </p>
          
          <div className="mt-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleDeleteSurvey}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
              onClick={() => setDeleteModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SurveyDetailsPage;