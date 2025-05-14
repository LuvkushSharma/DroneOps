import React from 'react';
import { 
  FiWifi, FiBattery, FiNavigation, FiClock, 
  FiAirplay, FiThermometer, FiFlag, FiCompass 
} from 'react-icons/fi';

/**
 * TelemetryPanel component for displaying drone telemetry data
 * 
 * @param {Object} props
 * @param {Object} props.telemetry - Telemetry data object
 * @param {boolean} props.isConnected - Whether drone is connected
 * @param {string} props.className - Additional CSS classes
 */
const TelemetryPanel = ({
  telemetry = {},
  isConnected = false,
  className = ''
}) => {
  // Default values for telemetry data
  const {
    altitude = 0,
    speed = 0,
    batteryLevel = 0,
    signalStrength = 0,
    heading = 0,
    latitude = 0,
    longitude = 0,
    flightTime = 0,
    temperature = 0,
    distanceFromHome = 0,
    horizontalSpeed = 0,
    verticalSpeed = 0,
    mode = 'UNKNOWN',
    timestamp = Date.now(),
  } = telemetry;

  // Format flight time (seconds) to mm:ss
  const formatFlightTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Battery level color based on percentage
  const getBatteryColor = (level) => {
    if (level > 50) return 'text-green-500';
    if (level > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Signal strength color based on percentage
  const getSignalColor = (strength) => {
    if (strength > 70) return 'text-green-500';
    if (strength > 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Telemetry Data</h3>
        <div className="flex items-center">
          <div className={`h-2 w-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-500">{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      {/* Main telemetry grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {/* Altitude */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center text-gray-500 mb-1">
            <FiNavigation className="mr-1" />
            <span className="text-xs">ALTITUDE</span>
          </div>
          <div className="text-lg font-medium">
            {altitude.toFixed(1)} m
          </div>
        </div>

        {/* Battery */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center text-gray-500 mb-1">
            <FiBattery className="mr-1" />
            <span className="text-xs">BATTERY</span>
          </div>
          <div className="text-lg font-medium flex items-center">
            <span className={getBatteryColor(batteryLevel)}>{batteryLevel}%</span>
          </div>
        </div>

        {/* Speed */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center text-gray-500 mb-1">
            <FiAirplay className="mr-1" />
            <span className="text-xs">SPEED</span>
          </div>
          <div className="text-lg font-medium">
            {speed.toFixed(1)} m/s
          </div>
        </div>

        {/* Signal */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center text-gray-500 mb-1">
            <FiWifi className="mr-1" />
            <span className="text-xs">SIGNAL</span>
          </div>
          <div className="text-lg font-medium flex items-center">
            <span className={getSignalColor(signalStrength)}>{signalStrength}%</span>
          </div>
        </div>

        {/* Heading */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center text-gray-500 mb-1">
            <FiCompass className="mr-1" />
            <span className="text-xs">HEADING</span>
          </div>
          <div className="text-lg font-medium">
            {heading.toFixed(0)}°
          </div>
        </div>

        {/* Flight Time */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center text-gray-500 mb-1">
            <FiClock className="mr-1" />
            <span className="text-xs">FLIGHT TIME</span>
          </div>
          <div className="text-lg font-medium">
            {formatFlightTime(flightTime)}
          </div>
        </div>

        {/* Temperature */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center text-gray-500 mb-1">
            <FiThermometer className="mr-1" />
            <span className="text-xs">TEMPERATURE</span>
          </div>
          <div className="text-lg font-medium">
            {temperature.toFixed(1)}°C
          </div>
        </div>

        {/* Distance from Home */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center text-gray-500 mb-1">
            <FiFlag className="mr-1" />
            <span className="text-xs">DISTANCE</span>
          </div>
          <div className="text-lg font-medium">
            {distanceFromHome.toFixed(1)} m
          </div>
        </div>

        {/* Flight Mode */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center text-gray-500 mb-1">
            <FiNavigation className="mr-1" />
            <span className="text-xs">MODE</span>
          </div>
          <div className="text-lg font-medium">
            {mode}
          </div>
        </div>
      </div>

      {/* Coordinates */}
      <div className="mt-4 bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center text-gray-500 mb-1">
          <FiNavigation className="mr-1" />
          <span className="text-xs">COORDINATES</span>
        </div>
        <div className="text-sm grid grid-cols-2 gap-2">
          <div>
            <span className="text-gray-500">Lat: </span>
            <span className="font-medium">{latitude.toFixed(6)}</span>
          </div>
          <div>
            <span className="text-gray-500">Lng: </span>
            <span className="font-medium">{longitude.toFixed(6)}</span>
          </div>
        </div>
      </div>

      {/* Last updated */}
      <div className="mt-4 text-xs text-gray-500 text-right">
        Last updated: {new Date(timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default TelemetryPanel;