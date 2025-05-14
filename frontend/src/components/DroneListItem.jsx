import React from 'react';
import { Link } from 'react-router-dom';
import { FiMoreVertical, FiBattery, FiWifi, FiMapPin } from 'react-icons/fi';
import DroneStatusBadge from './DroneStatusBadge';

/**
 * DroneListItem component for displaying a drone in a list view
 * 
 * @param {Object} props
 * @param {Object} props.drone - Drone data object
 * @param {Function} props.onSelect - Handler when drone is selected
 * @param {boolean} props.isSelected - Whether drone is currently selected
 * @param {Function} props.onMenuOpen - Handler when menu is opened
 * @param {string} props.className - Additional CSS classes
 */
const DroneListItem = ({
  drone = {},
  onSelect,
  isSelected = false,
  onMenuOpen,
  className = ''
}) => {
  // Default values
  const {
    id,
    _id,
    name = 'Unknown Drone',
    model = 'Unknown Model',
    status = 'offline',
    batteryLevel = 0,
    signalStrength = 0,
    lastLocation,
    lastActive,
    image,
  } = drone;

  const droneId = id || _id;
  
  // Format the last active time
  const formatLastActive = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const now = new Date();
    const lastActiveDate = new Date(timestamp);
    const diffMs = now - lastActiveDate;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Handle click event
  const handleClick = (e) => {
    if (onSelect) {
      onSelect(drone);
    }
  };

  // Prevent propagation for menu button
  const handleMenuClick = (e) => {
    e.stopPropagation();
    if (onMenuOpen) {
      onMenuOpen(drone);
    }
  };

  return (
    <div 
      className={`
        border rounded-md p-3 mb-2 cursor-pointer transition-colors
        ${isSelected ? 'border-primary-300 bg-primary-50' : 'border-gray-200 bg-white hover:bg-gray-50'}
        ${className}
      `}
      onClick={handleClick}
    >
      <div className="flex items-center">
        {/* Image or placeholder */}
        <div className="mr-3 h-12 w-12 flex-shrink-0">
          {image ? (
            <img 
              src={image} 
              alt={name}
              className="h-full w-full rounded-md object-cover"
            />
          ) : (
            <div className="h-full w-full rounded-md bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-xs">{name.substring(0, 2).toUpperCase()}</span>
            </div>
          )}
        </div>
        
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 truncate">{name}</h3>
            <DroneStatusBadge status={status} />
          </div>
          <div className="text-xs text-gray-500 mt-1">{model}</div>
          
          {/* Stats */}
          <div className="flex items-center mt-2 space-x-3 text-xs text-gray-500">
            <div className="flex items-center">
              <FiBattery className={`mr-1 ${batteryLevel < 20 ? 'text-red-500' : ''}`} />
              <span>{batteryLevel}%</span>
            </div>
            <div className="flex items-center">
              <FiWifi className="mr-1" />
              <span>{signalStrength}%</span>
            </div>
            {lastActive && (
              <div className="flex items-center">
                <span>{formatLastActive(lastActive)}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Action button */}
        <button 
          className="ml-2 p-1 rounded-full hover:bg-gray-100 focus:outline-none"
          onClick={handleMenuClick}
          aria-label="Options"
        >
          <FiMoreVertical className="h-5 w-5 text-gray-400" />
        </button>
      </div>
      
      {/* Location if available */}
      {lastLocation && (
        <div className="mt-2 text-xs flex items-center text-gray-500">
          <FiMapPin className="mr-1" />
          <span>
            {lastLocation.name || `${lastLocation.lat.toFixed(4)}, ${lastLocation.lng.toFixed(4)}`}
          </span>
        </div>
      )}
    </div>
  );
};

export default DroneListItem;