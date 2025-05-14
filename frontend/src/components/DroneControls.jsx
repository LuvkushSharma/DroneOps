import React, { useState } from 'react';
import { 
  FiPower, FiPlay, FiSquare, FiHome, FiPause, FiArrowUp, 
  FiArrowDown, FiArrowLeft, FiArrowRight, FiRotateCw, FiRotateCcw 
} from 'react-icons/fi';

/**
 * DroneControls component for controlling drone operations
 * 
 * @param {Object} props
 * @param {string} props.status - Current drone status
 * @param {boolean} props.isConnected - Whether the drone is connected
 * @param {Function} props.onArm - Handler for arming/disarming drone
 * @param {Function} props.onTakeoff - Handler for takeoff command
 * @param {Function} props.onLand - Handler for landing command
 * @param {Function} props.onReturnHome - Handler for return-to-home command
 * @param {Function} props.onStartMission - Handler for starting mission
 * @param {Function} props.onPauseMission - Handler for pausing mission
 * @param {Function} props.onStopMission - Handler for stopping mission
 * @param {Function} props.onMove - Handler for manual movement commands
 * @param {string} props.className - Additional classes
 */
const DroneControls = ({
  status = 'idle',
  isConnected = false,
  onArm,
  onTakeoff,
  onLand,
  onReturnHome,
  onStartMission,
  onPauseMission,
  onStopMission,
  onMove,
  className = '',
}) => {
  const [isArmed, setIsArmed] = useState(status === 'armed' || status === 'flying');
  const [isFlying, setIsFlying] = useState(status === 'flying');
  const [isMissionActive, setIsMissionActive] = useState(status === 'mission');
  const [isMissionPaused, setIsMissionPaused] = useState(status === 'paused');
  
  // Status-dependent styles and permissions
  const isDisabled = !isConnected;
  const canFly = isConnected && isArmed && !isFlying;
  const canLand = isConnected && isArmed && isFlying;
  const canStartMission = isConnected && isArmed && !isMissionActive;
  const canPauseMission = isConnected && isMissionActive && !isMissionPaused;
  const canResumeMission = isConnected && isMissionActive && isMissionPaused;
  const canStopMission = isConnected && isMissionActive;
  const canControlManually = isConnected && isArmed && isFlying && !isMissionActive;
  
  // Handle arming/disarming
  const handleArm = () => {
    if (isDisabled) return;
    const newArmedState = !isArmed;
    setIsArmed(newArmedState);
    if (onArm) onArm(newArmedState);
  };
  
  // Handle takeoff
  const handleTakeoff = () => {
    if (!canFly) return;
    setIsFlying(true);
    if (onTakeoff) onTakeoff();
  };
  
  // Handle landing
  const handleLand = () => {
    if (!canLand) return;
    setIsFlying(false);
    if (onLand) onLand();
  };
  
  // Handle return to home
  const handleReturnHome = () => {
    if (!canLand) return;
    if (onReturnHome) onReturnHome();
  };
  
  // Handle mission start
  const handleStartMission = () => {
    if (!canStartMission) return;
    setIsMissionActive(true);
    setIsMissionPaused(false);
    if (onStartMission) onStartMission();
  };
  
  // Handle mission pause/resume
  const handlePauseMission = () => {
    if (!canPauseMission && !canResumeMission) return;
    
    setIsMissionPaused(!isMissionPaused);
    if (onPauseMission) onPauseMission(!isMissionPaused);
  };
  
  // Handle mission stop
  const handleStopMission = () => {
    if (!canStopMission) return;
    setIsMissionActive(false);
    setIsMissionPaused(false);
    if (onStopMission) onStopMission();
  };
  
  // Handle manual movement
  const handleMove = (direction, value = 1) => {
    if (!canControlManually) return;
    if (onMove) onMove(direction, value);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <div className="mb-4 border-b pb-2">
        <h3 className="text-lg font-medium text-gray-900">Drone Controls</h3>
        <p className="text-sm text-gray-500">
          {isConnected ? 
            `Status: ${status.charAt(0).toUpperCase() + status.slice(1)}` : 
            'Status: Disconnected'}
        </p>
      </div>
      
      {/* Primary controls */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={handleArm}
          disabled={isDisabled}
          className={`
            flex items-center justify-center px-4 py-2 rounded-md
            ${isArmed 
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
            }
            ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <FiPower className="mr-2" />
          {isArmed ? 'Disarm' : 'Arm'}
        </button>
        
        {isFlying ? (
          <button
            onClick={handleLand}
            disabled={!canLand}
            className={`
              flex items-center justify-center px-4 py-2 rounded-md
              bg-orange-100 text-orange-700 hover:bg-orange-200
              ${!canLand ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <FiArrowDown className="mr-2" />
            Land
          </button>
        ) : (
          <button
            onClick={handleTakeoff}
            disabled={!canFly}
            className={`
              flex items-center justify-center px-4 py-2 rounded-md
              bg-blue-100 text-blue-700 hover:bg-blue-200
              ${!canFly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <FiArrowUp className="mr-2" />
            Takeoff
          </button>
        )}
      </div>
      
      {/* Mission controls */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button
          onClick={handleStartMission}
          disabled={!canStartMission}
          className={`
            flex items-center justify-center px-2 py-2 rounded-md
            bg-indigo-100 text-indigo-700 hover:bg-indigo-200
            ${!canStartMission ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <FiPlay className="mr-1" />
          Start
        </button>
        
        <button
          onClick={handlePauseMission}
          disabled={!canPauseMission && !canResumeMission}
          className={`
            flex items-center justify-center px-2 py-2 rounded-md
            bg-yellow-100 text-yellow-700 hover:bg-yellow-200
            ${!canPauseMission && !canResumeMission ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <FiPause className="mr-1" />
          {isMissionPaused ? 'Resume' : 'Pause'}
        </button>
        
        <button
          onClick={handleStopMission}
          disabled={!canStopMission}
          className={`
            flex items-center justify-center px-2 py-2 rounded-md
            bg-red-100 text-red-700 hover:bg-red-200
            ${!canStopMission ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <FiSquare className="mr-1" />
          Stop
        </button>
      </div>
      
      {/* Return to home */}
      <button
        onClick={handleReturnHome}
        disabled={!canLand}
        className={`
          flex items-center justify-center px-4 py-2 rounded-md w-full mb-4
          bg-gray-100 text-gray-700 hover:bg-gray-200
          ${!canLand ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <FiHome className="mr-2" />
        Return Home
      </button>
      
      {/* Manual controls */}
      {canControlManually && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Manual Control</h4>
          
          <div className="flex justify-center mb-2">
            <button
              onClick={() => handleMove('forward')}
              className="p-2 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <FiArrowUp className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={() => handleMove('left')}
              className="p-2 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleMove('yawLeft')}
                className="p-2 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                <FiRotateCcw className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => handleMove('yawRight')}
                className="p-2 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                <FiRotateCw className="h-5 w-5" />
              </button>
            </div>
            
            <button
              onClick={() => handleMove('right')}
              className="p-2 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <FiArrowRight className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex justify-center mt-2">
            <button
              onClick={() => handleMove('backward')}
              className="p-2 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <FiArrowDown className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex justify-center space-x-4 mt-4">
            <button
              onClick={() => handleMove('up')}
              className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center"
            >
              <span className="mr-1">↑</span> Up
            </button>
            
            <button
              onClick={() => handleMove('down')}
              className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center"
            >
              <span className="mr-1">↓</span> Down
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DroneControls;