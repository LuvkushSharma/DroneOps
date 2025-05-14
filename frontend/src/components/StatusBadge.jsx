import React from 'react';

/**
 * StatusBadge component for displaying status indicators
 * 
 * @param {Object} props
 * @param {string} props.status - Status value
 * @param {Object} props.statusConfig - Custom status configuration
 * @param {string} props.size - Badge size (sm, md, lg)
 * @param {boolean} props.pulse - Whether to show pulse animation
 * @param {string} props.className - Additional CSS classes
 */
const StatusBadge = ({
  status,
  statusConfig = {},
  size = 'md',
  pulse = false,
  className = ''
}) => {
  // Default status configurations
  const defaultStatusConfig = {
    active: { color: 'green', label: 'Active' },
    completed: { color: 'green', label: 'Completed' },
    success: { color: 'green', label: 'Success' },
    online: { color: 'green', label: 'Online' },
    
    pending: { color: 'yellow', label: 'Pending' },
    warning: { color: 'yellow', label: 'Warning' },
    scheduled: { color: 'yellow', label: 'Scheduled' },
    
    error: { color: 'red', label: 'Error' },
    failed: { color: 'red', label: 'Failed' },
    critical: { color: 'red', label: 'Critical' },
    
    inactive: { color: 'gray', label: 'Inactive' },
    offline: { color: 'gray', label: 'Offline' },
    cancelled: { color: 'gray', label: 'Cancelled' },
    unknown: { color: 'gray', label: 'Unknown' },
    
    'in-progress': { color: 'blue', label: 'In Progress' },
    processing: { color: 'blue', label: 'Processing' },
    connecting: { color: 'blue', label: 'Connecting' },
    paused: { color: 'blue', label: 'Paused' },
  };
  
  // Merge default with custom status configs
  const mergedStatusConfig = { ...defaultStatusConfig, ...statusConfig };
  
  // Get the configuration for the current status
  const currentStatus = status?.toLowerCase() || 'unknown';
  const config = mergedStatusConfig[currentStatus] || mergedStatusConfig.unknown;
  
  // Determine color classes based on the status color
  const getColorClasses = (color) => {
    switch (color) {
      case 'green':
        return 'bg-green-100 text-green-800';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800';
      case 'red':
        return 'bg-red-100 text-red-800';
      case 'blue':
        return 'bg-blue-100 text-blue-800';
      case 'purple':
        return 'bg-purple-100 text-purple-800';
      case 'indigo':
        return 'bg-indigo-100 text-indigo-800';
      case 'pink':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Determine size classes
  const getSizeClasses = (size) => {
    switch (size) {
      case 'sm':
        return 'text-xs px-1.5 py-0.5';
      case 'lg':
        return 'text-sm px-3 py-1';
      case 'md':
      default:
        return 'text-xs px-2.5 py-0.5';
    }
  };

  return (
    <span className={`
      inline-flex items-center rounded-full font-medium 
      ${getColorClasses(config.color)}
      ${getSizeClasses(size)}
      ${className}
    `}>
      {/* Status indicator dot with optional pulse */}
      <span className={`
        h-1.5 w-1.5 rounded-full mr-1.5
        ${config.color === 'gray' ? 'bg-gray-500' : `bg-${config.color}-500`}
        ${pulse ? 'animate-pulse' : ''}
      `}></span>
      {config.label || status}
    </span>
  );
};

export default StatusBadge;