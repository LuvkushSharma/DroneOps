import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiMapPin, FiClock, FiCalendar, FiAirplay, FiFlag, FiCheckCircle,
  FiXCircle, FiAlertTriangle, FiPause, FiPlay, FiArrowLeft,
  FiEdit2, FiTrash2, FiMap, FiActivity, FiDroplet, FiWind,
  FiThermometer, FiSun, FiGrid, FiCircle
} from 'react-icons/fi';
import { useMissions } from '../context/MissionsContext';
import { useDrones } from '../context/DronesContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import MapContainer from '../components/MapContainer';
import WaypointsList from '../components/WaypointsList';

const MissionDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getMission, deleteMission, updateMissionStatus, loading } = useMissions();
  const { drones } = useDrones();
  
  const [mission, setMission] = useState(null);
  const [drone, setDrone] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [showControlModal, setShowControlModal] = useState(false);
  const [missionActionLoading, setMissionActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  
  // Fetch mission details
  useEffect(() => {
    const fetchMission = async () => {
      try {
        // Changed from getMissionById to getMission to match the context function name
        const missionData = await getMission(id);
        setMission(missionData);
      } catch (error) {
        console.error('Error fetching mission:', error);
      }
    };
    
    fetchMission();
  }, [id, getMission]);
  
  // Find associated drone
  useEffect(() => {
    if (mission && drones.length > 0) {
      const associatedDrone = drones.find(d => d._id === mission.drone);
      setDrone(associatedDrone || null);
    }
  }, [mission, drones]);
  
  // Handle mission deletion
  const handleDelete = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    
    try {
      await deleteMission(id);
      setShowDeleteModal(false);
      navigate('/missions');
    } catch (error) {
      setDeleteError(error.message || 'An error occurred while deleting the mission');
      setDeleteLoading(false);
    }
  };
  
  // Handle mission control actions
  const handleMissionControl = async (action) => {
    setMissionActionLoading(true);
    setActionError('');
    
    try {
      let newStatus;
      
      switch(action) {
        case 'start':
          newStatus = 'in-progress';
          break;
        case 'pause':
          newStatus = 'paused';
          break;
        case 'resume':
          newStatus = 'in-progress';
          break;
        case 'abort':
          newStatus = 'aborted';
          break;
        case 'complete':
          newStatus = 'completed';
          break;
        default:
          throw new Error('Invalid action');
      }
      
      const updatedMission = await updateMissionStatus(id, newStatus);
      setMission(updatedMission);
      setShowControlModal(false);
    } catch (error) {
      setActionError(error.message || 'Failed to update mission status');
    } finally {
      setMissionActionLoading(false);
    }
  };
  
  // Format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format duration
  const formatDuration = (start, end) => {
    if (!start || !end) return 'N/A';
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    const durationMs = endDate - startDate;
    
    // Convert to minutes
    const minutes = Math.floor(durationMs / (1000 * 60));
    
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800';
      case 'paused':
        return 'bg-purple-100 text-purple-800';
      case 'aborted':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return <FiCheckCircle className="text-green-500" />;
      case 'in-progress':
        return <FiActivity className="text-blue-500" />;
      case 'planned':
        return <FiFlag className="text-yellow-500" />;
      case 'paused':
        return <FiPause className="text-purple-500" />;
      case 'aborted':
        return <FiXCircle className="text-red-500" />;
      case 'failed':
        return <FiAlertTriangle className="text-red-500" />;
      default:
        return <FiAlertTriangle className="text-gray-500" />;
    }
  };

  if (loading || !mission) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" text="Loading mission details..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Back button */}
      <div className="mb-6">
        <button 
          onClick={() => navigate('/missions')}
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <FiArrowLeft className="mr-1" /> Back to Missions
        </button>
      </div>
      
      {/* Mission header */}
      <div className="flex flex-col lg:flex-row justify-between mb-6">
        <div>
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-800 mr-3">{mission.name}</h1>
            <span className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(mission.status)}`}>
              {getStatusIcon(mission.status)}
              <span className="ml-1 capitalize">{mission.status}</span>
            </span>
          </div>
          <p className="text-gray-600 mt-2">{mission.description || 'No description provided'}</p>
        </div>
        
        <div className="mt-4 lg:mt-0 flex flex-wrap items-center gap-2">
          {mission.status === 'planned' && (
            <button 
              onClick={() => {
                setActionError('');
                setShowControlModal(true);
              }}
              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
            >
              <FiPlay className="mr-1" /> Start Mission
            </button>
          )}
          
          {mission.status === 'in-progress' && (
            <button 
              onClick={() => {
                setActionError('');
                setShowControlModal(true);
              }}
              className="inline-flex items-center justify-center bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-md"
            >
              <FiPause className="mr-1" /> Pause Mission
            </button>
          )}
          
          {mission.status === 'paused' && (
            <button 
              onClick={() => {
                setActionError('');
                setShowControlModal(true);
              }}
              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
            >
              <FiPlay className="mr-1" /> Resume Mission
            </button>
          )}
          
          {(mission.status === 'in-progress' || mission.status === 'paused') && (
            <>
              <button 
                onClick={() => {
                  setActionError('');
                  setShowControlModal(true);
                }}
                className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md"
              >
                <FiXCircle className="mr-1" /> Abort
              </button>
              
              <button 
                onClick={() => {
                  setActionError('');
                  setShowControlModal(true);
                }}
                className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
              >
                <FiCheckCircle className="mr-1" /> Complete
              </button>
            </>
          )}
          
          {mission.status === 'planned' && (
            <Link 
              to={`/missions/edit/${id}`}
              className="inline-flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md"
            >
              <FiEdit2 className="mr-1" /> Edit
            </Link>
          )}
          
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center justify-center bg-white hover:bg-red-50 text-red-600 border border-red-300 py-2 px-4 rounded-md"
          >
            <FiTrash2 className="mr-1" /> Delete
          </button>
        </div>
      </div>
      
      {/* Mission info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded">
              <FiAirplay className="text-blue-700 w-5 h-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Drone</p>
              <p className="text-lg font-semibold">
                {drone ? (
                  <Link to={`/drones/${drone._id}`} className="hover:text-blue-600">
                    {drone.name}
                  </Link>
                ) : (
                  'Not assigned'
                )}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded">
              <FiCalendar className="text-green-700 w-5 h-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Start Time</p>
              <p className="text-lg font-semibold">{formatDateTime(mission.startTime)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded">
              <FiCalendar className="text-yellow-700 w-5 h-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">End Time</p>
              <p className="text-lg font-semibold">{formatDateTime(mission.endTime)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded">
              <FiClock className="text-blue-700 w-5 h-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Duration</p>
              <p className="text-lg font-semibold">{formatDuration(mission.startTime, mission.endTime)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mission pattern and environmental conditions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Flight pattern */}
        <div className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FiMap className="mr-2 text-blue-600" /> Flight Pattern
          </h2>
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              {mission.pattern === 'grid' && <FiGrid className="w-8 h-8 text-blue-600" />}
              {mission.pattern === 'crosshatch' && <FiGrid className="w-8 h-8 text-blue-600" />}
              {mission.pattern === 'perimeter' && <FiMapPin className="w-8 h-8 text-blue-600" />}
              {mission.pattern === 'spiral' && <FiCircle className="w-8 h-8 text-blue-600" />}
              {mission.pattern === 'custom' && (
                <div className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white font-bold rounded-full">
                  C
                </div>
              )}
            </div>
            <div className="ml-4">
              <h3 className="font-medium capitalize">{mission.pattern || 'Custom'} Pattern</h3>
              <p className="text-sm text-gray-600 mt-1">
                {mission.pattern === 'grid' && 'Systematic back-and-forth pattern for complete coverage'}
                {mission.pattern === 'crosshatch' && 'Double grid pattern for enhanced detail and accuracy'}
                {mission.pattern === 'perimeter' && 'Follows the boundary of an area'}
                {mission.pattern === 'spiral' && 'Inward or outward spiral pattern'}
                {mission.pattern === 'custom' && 'Custom waypoint path for specialized needs'}
                {!mission.pattern && 'Custom waypoint configuration'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Mission parameters */}
        <div className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FiActivity className="mr-2 text-blue-600" /> Mission Parameters
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-sm font-medium text-gray-600">Altitude</p>
              <p className="text-lg font-semibold">{mission.altitude || 'N/A'} m</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Speed</p>
              <p className="text-lg font-semibold">{mission.speed || 'N/A'} m/s</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Overlap</p>
              <p className="text-lg font-semibold">{mission.overlap || 'N/A'}%</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">GSD</p>
              <p className="text-lg font-semibold">{mission.gsd || 'N/A'} cm/px</p>
            </div>
          </div>
        </div>
        
        {/* Environmental conditions */}
        <div className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FiWind className="mr-2 text-blue-600" /> Environmental Conditions
          </h2>
          {mission.environmentalConditions ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <FiWind className="text-blue-500 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Wind</p>
                  <p className="font-semibold">{mission.environmentalConditions.wind || 'N/A'} km/h</p>
                </div>
              </div>
              <div className="flex items-center">
                <FiDroplet className="text-blue-500 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Humidity</p>
                  <p className="font-semibold">{mission.environmentalConditions.humidity || 'N/A'}%</p>
                </div>
              </div>
              <div className="flex items-center">
                <FiThermometer className="text-blue-500 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Temperature</p>
                  <p className="font-semibold">{mission.environmentalConditions.temperature || 'N/A'}°C</p>
                </div>
              </div>
              <div className="flex items-center">
                <FiSun className="text-blue-500 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Visibility</p>
                  <p className="font-semibold">{mission.environmentalConditions.visibility || 'N/A'} km</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No environmental data available</p>
          )}
        </div>
      </div>
      
      {/* Mission map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Map view */}
        <div className="lg:col-span-2 bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <FiMap className="mr-2 text-blue-600" /> Mission Map
            </h2>
          </div>
          <div className="h-96">
            <MapContainer
              waypoints={mission.waypoints}
              pattern={mission.pattern}
              readonly={true}
              zoom={14}
            />
          </div>
        </div>
        
        {/* Waypoints list */}
        <div className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <FiFlag className="mr-2 text-blue-600" /> Waypoints
            </h2>
          </div>
          <div className="p-2">
            <WaypointsList 
              waypoints={mission.waypoints || []} 
              readonly={true}
            />
          </div>
        </div>
      </div>
      
      {/* Mission progress and telemetry */}
      {(mission.status === 'in-progress' || mission.status === 'paused') && (
        <div className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FiActivity className="mr-2 text-blue-600" /> Mission Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-1 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm text-gray-600">{mission.progress || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${mission.progress || 0}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <p className="text-sm text-gray-500">Waypoints Visited</p>
                  <p className="text-lg font-semibold">
                    {mission.currentWaypointIndex || 0} / {mission.waypoints?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estimated Time Left</p>
                  <p className="text-lg font-semibold">{mission.estimatedTimeRemaining || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            {drone && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Altitude</p>
                  <p className="text-lg font-semibold">{mission.telemetry?.altitude || 'N/A'} m</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Speed</p>
                  <p className="text-lg font-semibold">{mission.telemetry?.speed || 'N/A'} m/s</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Battery Level</p>
                  <p className="text-lg font-semibold">{drone.batteryLevel || 'N/A'}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Signal Strength</p>
                  <p className="text-lg font-semibold">{mission.telemetry?.signalStrength || 'N/A'}%</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Mission Control Modal */}
      <Modal
        isOpen={showControlModal}
        onClose={() => setShowControlModal(false)}
        title="Mission Control"
        size="md"
      >
        <div className="p-4">
          {mission.status === 'planned' && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Start Mission</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to start this mission? The drone will immediately begin executing the flight plan.
              </p>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setShowControlModal(false)}
                  className="bg-white mr-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleMissionControl('start')}
                  disabled={missionActionLoading}
                  className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {missionActionLoading ? <LoadingSpinner size="sm" color="white" /> : 'Start Mission'}
                </button>
              </div>
            </div>
          )}
          
          {/* Other mission status actions */}
          {/* ... keep the rest of the modal content unchanged ... */}
        </div>
      </Modal>
      
      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Mission"
        size="sm"
      >
        <div className="p-4">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete this mission? This action cannot be undone.
          </p>
          
          {deleteError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {deleteError}
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="bg-white mr-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={deleteLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              disabled={deleteLoading}
            >
              {deleteLoading ? <LoadingSpinner size="sm" color="white" /> : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MissionDetailsPage;