import React from 'react';
import { FiClock, FiCheck, FiX, FiAlertTriangle, FiMap, FiMoreVertical } from 'react-icons/fi';
import { formatDate, formatDuration } from '../utils/dateFormatter';
import { Link } from 'react-router-dom';

/**
 * MissionTable component for displaying mission data in a tabular format
 * 
 * @param {Object} props
 * @param {Array} props.missions - Array of mission objects
 * @param {Function} props.onMissionSelect - Callback when a mission is selected
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.isLoading - Whether data is loading
 */
const MissionTable = ({ 
  missions = [], 
  onMissionSelect, 
  className = '',
  isLoading = false 
}) => {
  // Function to get status icon based on mission status
  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return <FiCheck className="text-green-500" />;
      case 'failed':
        return <FiX className="text-red-500" />;
      case 'in-progress':
      case 'in progress':
        return <FiClock className="text-blue-500 animate-pulse" />;
      case 'scheduled':
        return <FiClock className="text-yellow-500" />;
      case 'cancelled':
        return <FiX className="text-gray-500" />;
      default:
        return <FiAlertTriangle className="text-gray-400" />;
    }
  };

  // Function to get status color class based on mission status
  const getStatusColorClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className={`bg-white shadow overflow-hidden sm:rounded-lg ${className}`}>
        <div className="animate-pulse">
          <div className="border-b border-gray-200">
            <div className="bg-gray-50 px-4 py-3"></div>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mission
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Drone
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 bg-gray-50"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(5)].map((_, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="h-4 bg-gray-200 rounded w-8 ml-auto"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // No missions state
  if (missions.length === 0) {
    return (
      <div className={`bg-white shadow overflow-hidden sm:rounded-lg ${className}`}>
        <div className="text-center py-12">
          <FiMap className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No missions found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new mission.</p>
          <div className="mt-6">
            <Link
              to="/missions/create"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Create Mission
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white shadow overflow-hidden sm:rounded-lg ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th scope="col" className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mission
              </th>
              <th scope="col" className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Drone
              </th>
              <th scope="col" className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th scope="col" className="px-6 py-3 bg-gray-50"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {missions.map((mission) => (
              <tr 
                key={mission._id || mission.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onMissionSelect && onMissionSelect(mission)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {mission.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {mission.description?.substring(0, 50)}
                        {mission.description?.length > 50 ? '...' : ''}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{mission.drone?.name || 'N/A'}</div>
                  <div className="text-xs text-gray-500">{mission.drone?.model || ''}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {mission.scheduledAt ? formatDate(mission.scheduledAt) : 'Not scheduled'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColorClass(mission.status)}`}>
                    {getStatusIcon(mission.status)}
                    <span className="ml-1">{mission.status || 'Unknown'}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {mission.startedAt && mission.completedAt 
                    ? formatDuration(new Date(mission.startedAt), new Date(mission.completedAt))
                    : mission.estimatedDuration 
                      ? `Est. ${formatDuration(0, mission.estimatedDuration * 60000)}` 
                      : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    className="text-primary-600 hover:text-primary-900"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/missions/${mission._id || mission.id}`;
                    }}
                  >
                    <FiMoreVertical className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MissionTable;