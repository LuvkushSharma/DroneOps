import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiBattery, 
  FiWifi, 
  FiMapPin, 
  FiAlertTriangle, 
  FiCheckCircle,
  FiCalendar,
  FiClock,
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
  FiPower,
  FiNavigation2,
  FiZoomIn,
  FiActivity
} from 'react-icons/fi';
import moment from 'moment';

/**
 * Component for displaying drone information in a card format
 * 
 * @param {Object} props
 * @param {Object} props.drone - The drone object with all properties
 * @param {Function} props.onDelete - Function to call when delete button is clicked
 * @param {Function} props.onStatusToggle - Function to call when status is toggled
 * @param {boolean} props.minimal - Whether to show a minimal version of the card
 */
const DroneCard = ({ 
  drone, 
  onDelete, 
  onStatusToggle,
  minimal = false
}) => {
  const [showActions, setShowActions] = useState(false);
  
  if (!drone) return null;

  // Get status color based on status value
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'idle':
        return 'bg-blue-100 text-blue-800';
      case 'charging':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      case 'offline':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get connection status indicator
  const getConnectionStatus = () => {
    if (drone.connectionStatus === 'connected') {
      return {
        icon: <FiWifi className="h-4 w-4 text-green-500" />,
        text: 'Connected'
      };
    } else if (drone.connectionStatus === 'connecting') {
      return {
        icon: <FiWifi className="h-4 w-4 text-yellow-500" />,
        text: 'Connecting...'
      };
    } else {
      return {
        icon: <FiWifi className="h-4 w-4 text-gray-400" />,
        text: 'Disconnected'
      };
    }
  };

  // Get battery status indicator with color
  const getBatteryStatus = () => {
    const batteryLevel = drone.batteryLevel || 0;
    
    if (batteryLevel > 80) {
      return { color: 'text-green-500', class: 'bg-green-100' };
    } else if (batteryLevel > 20) {
      return { color: 'text-yellow-500', class: 'bg-yellow-100' };
    } else {
      return { color: 'text-red-500', class: 'bg-red-100' };
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return moment(dateString).format('MMM D, YYYY');
  };

  // Add this helper function at the top of your component
const formatLocation = (location) => {
  if (!location) return 'Unknown location';
  
  if (location.name) return location.name;
  
  // Handle GeoJSON format from database
  if (location.coordinates && Array.isArray(location.coordinates) && location.coordinates.length >= 2) {
    // Safely convert coordinates to fixed decimal places
    const lat = typeof location.coordinates[1] === 'number' ? location.coordinates[1].toFixed(4) : '0.0000';
    const lng = typeof location.coordinates[0] === 'number' ? location.coordinates[0].toFixed(4) : '0.0000';
    return `${lat}, ${lng}`;
  }
  
  // Handle frontend-friendly format
  if (typeof location.lat === 'number' && typeof location.lng === 'number') {
    return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
  }
  
  return 'Unknown location';
};

  // Toggle action menu
  const toggleActions = () => {
    setShowActions(!showActions);
  };

  // For minimal view (compact card)
  if (minimal) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-gray-900">{drone.name}</h3>
            <div className="mt-1 flex items-center text-sm text-gray-500">
              <FiNavigation2 className="mr-1 text-gray-400" />
              <span>{drone.model || 'Unknown model'}</span>
            </div>
          </div>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(drone.status)}`}>
            {drone.status}
          </span>
        </div>
        
        <div className="mt-3 flex justify-between items-center">
          <div className="flex items-center">
            {getConnectionStatus().icon}
            <span className="ml-1 text-xs text-gray-500">{getConnectionStatus().text}</span>
          </div>
          
          <div className={`px-2 py-1 rounded-md text-xs ${getBatteryStatus().class}`}>
            <FiBattery className={`inline-block mr-1 ${getBatteryStatus().color}`} />
            <span>{drone.batteryLevel || 0}%</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Drone header */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              <Link to={`/drones/${drone._id}`} className="hover:text-primary-600">
                {drone.name}
              </Link>
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {drone.model} • {drone.serialNumber}
            </p>
          </div>
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(drone.status)}`}>
              {drone.status}
            </span>
            
            <div className="relative ml-2">
              <button
                onClick={toggleActions}
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <FiMoreVertical className="h-5 w-5" />
              </button>
              
              {/* Action dropdown menu */}
              {showActions && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <Link
                      to={`/drones/${drone._id}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      <FiZoomIn className="inline-block mr-2" />
                      View Details
                    </Link>
                    <Link
                      to={`/drones/edit/${drone._id}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      <FiEdit2 className="inline-block mr-2" />
                      Edit Drone
                    </Link>
                    <button
                      onClick={() => onStatusToggle && onStatusToggle(drone._id, drone.status === 'active' ? 'idle' : 'active')}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      <FiPower className="inline-block mr-2" />
                      {drone.status === 'active' ? 'Set to Idle' : 'Set to Active'}
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(drone._id)}
                      className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      role="menuitem"
                    >
                      <FiTrash2 className="inline-block mr-2" />
                      Delete Drone
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Drone details */}
        <div className="mt-4 grid grid-cols-2 gap-y-2">
          {/* Connection status */}
          <div className="flex items-center">
            {getConnectionStatus().icon}
            <span className="ml-2 text-sm text-gray-500">{getConnectionStatus().text}</span>
          </div>
          
          {/* Battery status */}
          <div className="flex items-center">
            <FiBattery className={`h-4 w-4 ${getBatteryStatus().color}`} />
            <span className="ml-2 text-sm text-gray-500">
              {drone.batteryLevel || 0}% {drone.charging && '(Charging)'}
            </span>
          </div>
          
          {/* Last location */}
          {drone.lastLocation && (
            <div className="flex items-center">
              <FiMapPin className="h-4 w-4 text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">
              {drone.lastLocation && (
              <div className="flex items-center">
                <FiMapPin className="h-4 w-4 text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">
                  {formatLocation(drone.lastLocation)}
                </span>
              </div>
            )}
              </span>
            </div>
          )}
          
          {/* Last flight */}
          {drone.lastFlight && (
            <div className="flex items-center">
              <FiCalendar className="h-4 w-4 text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">
                Last flight: {moment(drone.lastFlight).fromNow()}
              </span>
            </div>
          )}
        </div>
        
        {/* Alert indicators */}
        {drone.alerts && drone.alerts.length > 0 && (
          <div className="mt-3 p-2 bg-red-50 rounded-md border border-red-100">
            <div className="flex items-start">
              <FiAlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="ml-2">
                <p className="text-sm text-red-600 font-medium">Alerts</p>
                <ul className="mt-1 list-disc list-inside text-xs text-red-500">
                  {drone.alerts.slice(0, 2).map((alert, index) => (
                    <li key={index}>{alert}</li>
                  ))}
                  {drone.alerts.length > 2 && (
                    <li>{drone.alerts.length - 2} more alerts</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* Flight statistics */}
        {drone.flightStats && (
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-gray-100 pt-4">
            <div className="text-center">
              <div className="text-xs text-gray-500">Total Flights</div>
              <div className="font-medium text-gray-900">{drone.flightStats.totalFlights || 0}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">Flight Hours</div>
              <div className="font-medium text-gray-900">{drone.flightStats.flightHours || 0}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">Distance</div>
              <div className="font-medium text-gray-900">{drone.flightStats.totalDistance || 0} km</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Drone actions */}
      {drone.status !== 'offline' && (
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex flex-wrap gap-2 justify-between">
          <Link
            to={`/drones/${drone._id}`}
            className="flex-1 inline-flex justify-center items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FiZoomIn className="mr-1" />
            Details
          </Link>
          
          <Link
            to={`/missions/create?droneId=${drone._id}`}
            className="flex-1 inline-flex justify-center items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FiActivity className="mr-1" />
            New Mission
          </Link>
        </div>
      )}
      
      {/* Offline indicator */}
      {drone.status === 'offline' && (
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-center">
          <span className="text-sm text-gray-500">
            <FiClock className="inline-block mr-1" />
            Last seen {moment(drone.lastSeen).fromNow()}
          </span>
        </div>
      )}

      {/* Maintenance indicator */}
      {drone.status === 'maintenance' && drone.maintenanceDetails && (
        <div className="bg-orange-50 px-4 py-3 border-t border-orange-100 text-center">
          <span className="text-sm text-orange-700">
            <FiAlertTriangle className="inline-block mr-1" />
            {drone.maintenanceDetails}
          </span>
        </div>
      )}
    </div>
  );
};

export default DroneCard;