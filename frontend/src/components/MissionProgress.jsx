import React from 'react';
import { FiClock, FiMapPin, FiFlag, FiActivity, FiPlayCircle, FiPauseCircle } from 'react-icons/fi';
import { formatDuration } from '../utils/dateFormatter';

/**
 * MissionProgress component for displaying mission progress
 * 
 * @param {Object} props
 * @param {Object} props.mission - Current mission data
 * @param {boolean} props.isActive - Whether mission is currently active
 * @param {boolean} props.isPaused - Whether mission is paused
 * @param {number} props.progress - Progress percentage (0-100)
 * @param {number} props.elapsedTime - Elapsed time in seconds
 * @param {number} props.estimatedTime - Estimated total time in seconds
 * @param {number} props.waypointsCompleted - Number of completed waypoints
 * @param {number} props.totalWaypoints - Total number of waypoints
 * @param {string} props.className - Additional CSS classes
 */
const MissionProgress = ({
  mission = {},
  isActive = false,
  isPaused = false,
  progress = 0,
  elapsedTime = 0,
  estimatedTime = 0,
  waypointsCompleted = 0,
  totalWaypoints = 0,
  className = ''
}) => {
  // Calculate remaining time
  const remainingTime = Math.max(0, estimatedTime - elapsedTime);
  
  // Format the remaining time as mm:ss or hh:mm:ss
  const formatTime = (seconds) => {
    if (seconds === 0 || isNaN(seconds)) return '--:--';
    return formatDuration(seconds);
  };
  
  // Handle edge cases
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  
  // Define status based on mission state
  const getStatus = () => {
    if (!isActive) return 'Inactive';
    if (isPaused) return 'Paused';
    return 'In Progress';
  };

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-gray-900">Mission Progress</h3>
        <div className="flex items-center">
          {isActive && (
            <span className="flex items-center text-sm font-medium">
              {isPaused ? (
                <>
                  <FiPauseCircle className="mr-1.5 h-4 w-4 text-yellow-500" />
                  <span className="text-yellow-700">Paused</span>
                </>
              ) : (
                <>
                  <FiPlayCircle className="mr-1.5 h-4 w-4 text-green-500 animate-pulse" />
                  <span className="text-green-700">Active</span>
                </>
              )}
            </span>
          )}
        </div>
      </div>
      
      {mission.name && (
        <div className="mb-4">
          <p className="text-sm text-gray-500">Current Mission</p>
          <p className="font-medium text-gray-800">{mission.name}</p>
        </div>
      )}
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
          style={{ width: `${clampedProgress}%` }}
        ></div>
      </div>
      
      {/* Progress percentage and status */}
      <div className="flex justify-between items-center mb-4 text-sm">
        <div className="font-medium">{Math.round(clampedProgress)}% Complete</div>
        <div className="text-gray-500">{getStatus()}</div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded">
          <div className="flex items-center text-gray-500 text-xs mb-1">
            <FiClock className="mr-1" />
            TIME
          </div>
          <div className="flex justify-between">
            <div>
              <div className="text-xs text-gray-500">Elapsed</div>
              <div className="font-medium">{formatTime(elapsedTime)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Remaining</div>
              <div className="font-medium">{formatTime(remainingTime)}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded">
          <div className="flex items-center text-gray-500 text-xs mb-1">
            <FiMapPin className="mr-1" />
            WAYPOINTS
          </div>
          <div className="flex justify-between items-end">
            <div className="font-medium">
              {waypointsCompleted} of {totalWaypoints}
            </div>
            <div className="text-xs text-gray-500">
              {totalWaypoints > 0 
                ? `${Math.round((waypointsCompleted / totalWaypoints) * 100)}%` 
                : '0%'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional mission details */}
      {mission.description && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-1">DESCRIPTION</div>
          <p className="text-sm text-gray-700">{mission.description}</p>
        </div>
      )}
      
      {/* Actions for in-progress missions */}
      {isActive && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
          <button
            className="text-sm text-blue-600 hover:text-blue-800"
            onClick={() => window.location.href = `/missions/${mission.id || mission._id}`}
          >
            View Details
          </button>
          <div className="flex space-x-2">
            {isPaused ? (
              <button className="text-sm text-green-600 hover:text-green-800">
                Resume Mission
              </button>
            ) : (
              <button className="text-sm text-yellow-600 hover:text-yellow-800">
                Pause Mission
              </button>
            )}
            <button className="text-sm text-red-600 hover:text-red-800">
              Abort Mission
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionProgress;