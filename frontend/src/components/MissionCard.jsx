import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiCrosshair, 
  FiCalendar, 
  FiClock, 
  FiBarChart2, 
  FiPlay, 
  FiPause,
  FiRotateCw,
  FiStopCircle,
  FiEye,
  FiEdit,
  FiTrash2,
  FiMoreVertical,
  FiCheckCircle,
  FiAlertTriangle,
  FiAlertCircle,
  FiCpu
} from 'react-icons/fi';
import moment from 'moment';

/**
 * MissionCard component for displaying drone mission information
 * 
 * @param {Object} props
 * @param {Object} props.mission - Mission data object
 * @param {Function} props.onStartMission - Function to start the mission
 * @param {Function} props.onPauseMission - Function to pause the mission
 * @param {Function} props.onResumeMission - Function to resume the mission
 * @param {Function} props.onAbortMission - Function to abort the mission
 * @param {Function} props.onDelete - Function to delete the mission
 * @param {boolean} props.showActions - Whether to show action buttons
 * @param {boolean} props.minimal - Whether to show a minimal version of the card
 */
const MissionCard = ({ 
  mission,
  onStartMission,
  onPauseMission,
  onResumeMission,
  onAbortMission,
  onDelete,
  showActions = true,
  minimal = false
}) => {
  if (!mission) return null;

  // Get status color based on status value
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'scheduled':
        return 'bg-indigo-100 text-indigo-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon based on status value
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <FiCheckCircle className="h-4 w-4" />;
      case 'in_progress':
        return <FiPlay className="h-4 w-4" />;
      case 'paused':
        return <FiPause className="h-4 w-4" />;
      case 'scheduled':
        return <FiCalendar className="h-4 w-4" />;
      case 'cancelled':
        return <FiStopCircle className="h-4 w-4" />;
      case 'failed':
        return <FiAlertTriangle className="h-4 w-4" />;
      default:
        return <FiCrosshair className="h-4 w-4" />;
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    return moment(dateString).format('MMM D, YYYY');
  };

  // Format time helper
  const formatTime = (dateString) => {
    return moment(dateString).format('h:mm A');
  };

  // Get progress percentage
  const getProgressPercentage = () => {
    if (!mission.progress && mission.progress !== 0) {
      return mission.status === 'completed' ? 100 : 0;
    }
    return Math.round(mission.progress);
  };

  // For minimal view (compact card)
  if (minimal) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-gray-900">{mission.name}</h3>
            <div className="mt-1 flex items-center text-sm text-gray-500">
              <FiCpu className="mr-1 text-gray-400" />
              <span>{mission.drone?.name || 'No drone assigned'}</span>
            </div>
          </div>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(mission.status)}`}>
            {getStatusIcon(mission.status)}
            <span className="ml-1">{mission.status?.replace('_', ' ')}</span>
          </span>
        </div>

        {/* Show progress bar for in-progress missions */}
        {mission.status === 'in_progress' && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{getProgressPercentage()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Mission header */}
      <div className="p-4 sm:px-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              <Link to={`/missions/${mission._id}`} className="hover:text-primary-600">
                {mission.name}
              </Link>
            </h3>
            <div className="mt-1 flex flex-wrap gap-y-1">
              {mission.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="mr-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(mission.status)}`}>
              {getStatusIcon(mission.status)}
              <span className="ml-1 capitalize">{mission.status?.replace('_', ' ')}</span>
            </span>
            
            <div className="relative ml-2">
              <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <FiMoreVertical className="h-5 w-5" />
              </button>
              {/* Dropdown menu would go here */}
            </div>
          </div>
        </div>
        
        {/* Mission details */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
          <div className="flex items-center">
            <FiCrosshair className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              {mission.waypoints?.length || 0} waypoints
            </span>
          </div>
          
          <div className="flex items-center">
            <FiCpu className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              {mission.drone?.name || 'No drone assigned'}
            </span>
          </div>
          
          <div className="flex items-center">
            <FiCalendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              {mission.scheduledDate ? formatDate(mission.scheduledDate) : 'Not scheduled'}
            </span>
          </div>
          
          <div className="flex items-center">
            <FiClock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              {mission.estimatedDuration ? `${mission.estimatedDuration} min` : 'Duration N/A'}
            </span>
          </div>
        </div>

        {/* Survey association */}
        {mission.survey && (
          <div className="mt-4 flex items-center">
            <div className="text-xs text-gray-500">Part of survey:</div>
            <Link
              to={`/surveys/${mission.survey._id}`}
              className="ml-2 text-xs font-medium text-primary-600 hover:text-primary-800"
            >
              {mission.survey.name}
            </Link>
          </div>
        )}
      </div>
      
      {/* Progress section for in-progress missions */}
      {mission.status === 'in_progress' && (
        <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <FiBarChart2 className="mr-1 text-gray-400" />
              <span className="text-gray-700">Mission Progress</span>
            </div>
            <span className="font-medium">{getProgressPercentage()}%</span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          
          {mission.estimatedTimeRemaining && (
            <div className="mt-1 text-xs text-right text-gray-500">
              Estimated time remaining: {mission.estimatedTimeRemaining} min
            </div>
          )}
        </div>
      )}
      
      {/* Mission stats for completed missions */}
      {mission.status === 'completed' && mission.statistics && (
        <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-100 grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-xs text-gray-500">Distance</div>
            <div className="font-medium text-gray-900">{mission.statistics.distance || 0} m</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Flight Time</div>
            <div className="font-medium text-gray-900">{mission.statistics.flightTime || 0} min</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Battery Used</div>
            <div className="font-medium text-gray-900">{mission.statistics.batteryUsed || 0}%</div>
          </div>
        </div>
      )}
      
      {/* Mission actions */}
      {showActions && (
        <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-2">
          {/* View button (always visible) */}
          <Link
            to={`/missions/${mission._id}`}
            className="flex-1 inline-flex justify-center items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FiEye className="mr-1" />
            Details
          </Link>
          
          {/* Start button (for scheduled missions) */}
          {mission.status === 'scheduled' && (
            <button
              onClick={() => onStartMission && onStartMission(mission._id)}
              className="flex-1 inline-flex justify-center items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <FiPlay className="mr-1" />
              Start
            </button>
          )}
          
          {/* Pause button (for in-progress missions) */}
          {mission.status === 'in_progress' && (
            <button
              onClick={() => onPauseMission && onPauseMission(mission._id)}
              className="flex-1 inline-flex justify-center items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              <FiPause className="mr-1" />
              Pause
            </button>
          )}
          
          {/* Resume button (for paused missions) */}
          {mission.status === 'paused' && (
            <button
              onClick={() => onResumeMission && onResumeMission(mission._id)}
              className="flex-1 inline-flex justify-center items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiRotateCw className="mr-1" />
              Resume
            </button>
          )}
          
          {/* Abort button (for in-progress or paused missions) */}
          {(mission.status === 'in_progress' || mission.status === 'paused') && (
            <button
              onClick={() => onAbortMission && onAbortMission(mission._id)}
              className="flex-1 inline-flex justify-center items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FiAlertCircle className="mr-1" />
              Abort
            </button>
          )}
          
          {/* Edit button (for scheduled or completed missions) */}
          {(mission.status === 'scheduled' || mission.status === 'completed') && (
            <Link
              to={`/missions/edit/${mission._id}`}
              className="flex-1 inline-flex justify-center items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <FiEdit className="mr-1" />
              Edit
            </Link>
          )}
          
          {/* Delete button (for all except in-progress) */}
          {mission.status !== 'in_progress' && (
            <button
              onClick={() => onDelete && onDelete(mission._id)}
              className="inline-flex justify-center items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50 hover:border-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FiTrash2 className="mr-1" />
              Delete
            </button>
          )}
          
          {/* Monitor button (for in-progress missions) */}
          {mission.status === 'in_progress' && (
            <Link
              to={`/monitor?missionId=${mission._id}`}
              className="flex-1 inline-flex justify-center items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <FiEye className="mr-1" />
              Monitor
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default MissionCard;