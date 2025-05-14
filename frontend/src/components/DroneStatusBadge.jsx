import React from 'react';
import StatusBadge from './StatusBadge';

/**
 * DroneStatusBadge component for displaying drone-specific status indicators
 * 
 * @param {Object} props
 * @param {string} props.status - Drone status
 * @param {string} props.size - Badge size (sm, md, lg)
 * @param {boolean} props.pulse - Whether to show pulse animation
 * @param {string} props.className - Additional CSS classes
 */
const DroneStatusBadge = ({
  status,
  size = 'md',
  pulse,
  className = ''
}) => {
  // Drone-specific status configurations
  const droneStatusConfig = {
    'active': { color: 'green', label: 'Active' },
    'idle': { color: 'gray', label: 'Idle' },
    'flying': { color: 'blue', label: 'Flying', pulse: true },
    'hovering': { color: 'blue', label: 'Hovering' },
    'landing': { color: 'yellow', label: 'Landing', pulse: true },
    'taking-off': { color: 'yellow', label: 'Taking Off', pulse: true },
    'returning': { color: 'yellow', label: 'Returning Home', pulse: true },
    'mission': { color: 'blue', label: 'On Mission', pulse: true },
    'armed': { color: 'yellow', label: 'Armed' },
    'disarmed': { color: 'gray', label: 'Disarmed' },
    'offline': { color: 'gray', label: 'Offline' },
    'error': { color: 'red', label: 'Error' },
    'maintenance': { color: 'yellow', label: 'Maintenance' },
    'charging': { color: 'green', label: 'Charging', pulse: true },
    'low-battery': { color: 'red', label: 'Low Battery', pulse: true },
    'warning': { color: 'yellow', label: 'Warning' },
    'calibrating': { color: 'blue', label: 'Calibrating', pulse: true },
    'standby': { color: 'gray', label: 'Standby' },
    'connecting': { color: 'blue', label: 'Connecting', pulse: true },
    'disconnected': { color: 'gray', label: 'Disconnected' },
    'paused': { color: 'yellow', label: 'Paused' },
  };

  // Use the pulse setting from the drone status if not explicitly specified
  const shouldPulse = pulse !== undefined ? pulse : droneStatusConfig[status?.toLowerCase()]?.pulse;

  return (
    <StatusBadge
      status={status}
      statusConfig={droneStatusConfig}
      size={size}
      pulse={shouldPulse}
      className={className}
    />
  );
};

export default DroneStatusBadge;