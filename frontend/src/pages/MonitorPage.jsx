import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft,
  FiPlay,
  FiPause,
  FiSquare,
  FiHome,
  FiCpu,
  FiCamera,
  FiMap,
  FiEdit2,
  FiClock,
  FiDownload,
  FiMaximize,
  FiMinimize,
  FiSettings,
  FiBatteryCharging,
  FiWifi,
  FiBarChart2,
  FiAlertTriangle,
  FiInfo,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';
import { useMissions } from '../context/MissionsContext';
import { useDrones } from '../context/DronesContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import MapView from '../components/MapView';
import DroneControls from '../components/DroneControls';
import TelemetryPanel from '../components/TelemetryPanel';
import StatusBadge from '../components/StatusBadge';
import VideoFeed from '../components/VideoFeed';
import ConfirmDialog from '../components/ConfirmDialog';
import WaypointsList from '../components/WaypointsList';
import MissionProgress from '../components/MissionProgress';
import LogPanel from '../components/LogPanel';
import { formatDateTime, formatDuration } from '../utils/dateFormatter';
import socketManager from '../utils/socketManager';

const MonitorPage = () => {
    const { id } = useParams();
    const { 
      getMissionDetails, 
      activeMission, 
      loading, 
      error, 
      startMission, 
      pauseMission, 
      resumeMission, 
      abortMission, 
      getMissionTelemetry 
    } = useMissions();
  
    const { getDroneDetails, activeDrone } = useDrones();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
  
  // State
  const [telemetry, setTelemetry] = useState(null);
  const [logs, setLogs] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);
  const [currentLayout, setCurrentLayout] = useState('default'); // 'default', 'map', 'video', 'split'
  const [fullscreenElement, setFullscreenElement] = useState(null); // 'map', 'video', null
  const [notifications, setNotifications] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [controlMode, setControlMode] = useState('auto'); // 'auto' or 'manual'
  const [streamQuality, setStreamQuality] = useState('medium'); // 'low', 'medium', 'high'
  
  // Socket and interval references
  const missionSocketRef = useRef(null);
  const telemetryIntervalRef = useRef(null);
  
  // Component mount - fetch mission data and set up streams
  useEffect(() => {
    const initializePage = async () => {
      if (!isAuthenticated()) {
        navigate('/login');
        return;
      }

      // Add check for missing ID
    if (!id) {
        console.error('Missing mission ID');
        addNotification({
          type: 'error',
          title: 'Missing Mission ID',
          message: 'No mission ID provided. Please select a valid mission.'
        });
        navigate('/missions');
        return;
      }
      
      try {
        // Get mission details
        const missionResult = await getMissionDetails(id);
        
        if (missionResult?.success && missionResult.mission) {
          const mission = missionResult.mission;
          
          // Check if mission has a droneId before trying to fetch drone details
          if (mission.drone) {
            await getDroneDetails(mission.drone._id || mission.drone);
          } else {
            console.warn('Mission has no associated drone');
            addNotification({
              type: 'warning',
              title: 'No Drone Associated',
              message: 'This mission does not have an associated drone'
            });
          }
          
          // Get initial telemetry
          const telemetryData = await getMissionTelemetry(id);
          setTelemetry(telemetryData);
          
          // Connect to mission socket
          connectToMissionSocket(id);
          
          // Start telemetry polling
          startTelemetryPolling(id);
        } else {
          addNotification({
            type: 'error',
            title: 'Mission Not Found',
            message: 'The requested mission could not be found or accessed'
          });
        }
      } catch (err) {
        console.error('Error initializing monitor page:', err);
        
        // Add error notification
        addNotification({
          type: 'error',
          title: 'Connection Error',
          message: 'Failed to connect to mission monitoring. Please try again.',
        });
      }
    };
    
    initializePage();
    
    // Clean up on unmount
    return () => {
      cleanupConnections();
    };
  }, [id, isAuthenticated, getMissionDetails, getDroneDetails, getMissionTelemetry, navigate]);
  
  // Connect to mission socket
  const connectToMissionSocket = (missionId) => {
    try {
      // Disconnect any existing socket
      if (missionSocketRef.current) {
        socketManager.disconnect(`missions/${missionId}`);
      }
      
      // Connect to mission namespace
      const missionSocket = socketManager.connectToMissionMonitor(missionId, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });
      
      missionSocketRef.current = missionSocket;
      
      // Set up socket event listeners
      missionSocket.on('telemetry_update', (data) => {
        setTelemetry(data);
      });
      
      missionSocket.on('mission_update', (data) => {
        // Update mission status in context
      });
      
      missionSocket.on('mission_progress', (data) => {
        // Update mission progress
      });
      
      missionSocket.on('mission_log', (logEntry) => {
        setLogs(prev => [logEntry, ...prev].slice(0, 100)); // Keep last 100 logs
      });
      
      missionSocket.on('mission_alert', (alert) => {
        addNotification({
          type: alert.severity,
          title: alert.title,
          message: alert.message
        });
      });
      
      missionSocket.on('connect', () => {
        addNotification({
          type: 'success',
          title: 'Connection Established',
          message: 'Live mission monitoring activated'
        });
      });
      
      missionSocket.on('disconnect', (reason) => {
        addNotification({
          type: 'warning',
          title: 'Connection Lost',
          message: `Disconnected from mission monitoring: ${reason}`
        });
      });
      
      missionSocket.on('reconnect', (attemptNumber) => {
        addNotification({
          type: 'info',
          title: 'Reconnected',
          message: `Reconnected to mission monitoring (attempt ${attemptNumber})`
        });
      });
    } catch (err) {
      console.error('Error connecting to mission socket:', err);
    }
  };
  
  // Poll telemetry data every few seconds as backup for socket
  const startTelemetryPolling = (missionId) => {
    // Clear any existing interval
    if (telemetryIntervalRef.current) {
      clearInterval(telemetryIntervalRef.current);
    }
    
    // Set up polling (every 3 seconds)
    telemetryIntervalRef.current = setInterval(async () => {
      try {
        if (!socketManager.isConnected(`missions/${missionId}`)) {
          const telemetryResult = await getMissionTelemetry(missionId);
          if (telemetryResult?.success) {
            setTelemetry(telemetryResult.telemetry);
          }
        }
      } catch (err) {
        console.error('Error polling telemetry:', err);
      }
    }, 3000);
  };
  
  // Clean up connections on unmount
  const cleanupConnections = () => {
    // Clear telemetry polling interval
    if (telemetryIntervalRef.current) {
      clearInterval(telemetryIntervalRef.current);
      telemetryIntervalRef.current = null;
    }
    
    // Disconnect from socket
    if (missionSocketRef.current) {
      const missionId = id;
      socketManager.disconnect(`missions/${missionId}`);
      missionSocketRef.current = null;
    }
  };
  
  // Add notification
  const addNotification = (notification) => {
    const id = Math.random().toString(36).substring(2, 11);
    const newNotification = { 
      id, 
      timestamp: new Date(),
      ...notification 
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Auto remove after 5 seconds unless it's an error
    if (notification.type !== 'error') {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 5000);
    }
  };
  
  // Remove notification
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  // Handle mission controls
  const handleStartMission = () => {
    setConfirmAction('start');
  };
  
  const handlePauseMission = () => {
    setConfirmAction('pause');
  };
  
  const handleResumeMission = () => {
    setConfirmAction('resume');
  };
  
  const handleAbortMission = () => {
    setConfirmAction('abort');
  };
  
  const handleReturnToHome = () => {
    setConfirmAction('returnToHome');
  };
  
  // Confirm action handlers
  const handleConfirmAction = async () => {
    try {
      switch (confirmAction) {
        case 'start':
          await startMission(id);
          addNotification({
            type: 'success',
            title: 'Mission Started',
            message: 'Mission has been started successfully'
          });
          break;
          
        case 'pause':
          await pauseMission(id);
          addNotification({
            type: 'info',
            title: 'Mission Paused',
            message: 'Mission has been paused successfully'
          });
          break;
          
        case 'resume':
          await resumeMission(id);
          addNotification({
            type: 'success',
            title: 'Mission Resumed',
            message: 'Mission has been resumed successfully'
          });
          break;
          
        case 'abort':
          await abortMission(id);
          addNotification({
            type: 'warning',
            title: 'Mission Aborted',
            message: 'Mission has been aborted'
          });
          break;
          
        case 'returnToHome':
          // Call return to home API
          addNotification({
            type: 'info',
            title: 'Returning Home',
            message: 'Drone is returning to home position'
          });
          break;
          
        default:
          break;
      }
    } catch (err) {
      console.error(`Error executing ${confirmAction} action:`, err);
      addNotification({
        type: 'error',
        title: 'Action Failed',
        message: `Failed to ${confirmAction} mission: ${err.message || 'Unknown error'}`
      });
    } finally {
      setConfirmAction(null);
    }
  };
  
  const handleCancelAction = () => {
    setConfirmAction(null);
  };
  
  // Handle layout changes
  const toggleFullscreen = (element) => {
    if (fullscreenElement === element) {
      setFullscreenElement(null);
    } else {
      setFullscreenElement(element);
    }
  };
  
  const changeLayout = (layout) => {
    setCurrentLayout(layout);
    setFullscreenElement(null);
  };
  
  // Toggles for panels and settings
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };
  
  const toggleControlMode = () => {
    setControlMode(prevMode => prevMode === 'auto' ? 'manual' : 'auto');
  };

  // If loading, show spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" text="Loading mission data..." />
      </div>
    );
  }
  
  // If error or no mission found
  if (error || !activeMission) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <h2 className="text-xl font-bold text-red-700 mb-2">Error loading mission</h2>
          <p className="text-red-600 mb-4">{error || 'Mission not found'}</p>
          <Link to="/missions" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <FiArrowLeft className="mr-2" /> Go back to missions
          </Link>
        </div>
      </div>
    );
  }

  // UI for the monitor page
  return (
    <div className="h-screen flex flex-col">
      {/* Header Bar */}
      <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/missions" className="p-2 rounded-full hover:bg-gray-700">
            <FiArrowLeft className="h-5 w-5" />
          </Link>
          
          <div className="ml-3">
            <h1 className="text-lg font-medium">{activeMission.name}</h1>
            <div className="flex items-center text-xs text-gray-300">
              <span className="flex items-center">
                <FiMap className="mr-1" size={12} />
                {activeMission.waypoints?.length || 0} waypoints
              </span>
              <span className="mx-2">•</span>
              <span className="flex items-center">
                <FiCpu className="mr-1" size={12} />
                {activeDrone?.name || 'Unknown Drone'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <StatusBadge status={activeMission.status} />
          
          <div className="hidden md:flex items-center ml-4 space-x-1">
            {telemetry?.batteryLevel !== undefined && (
              <div className={`flex items-center px-2 py-1 rounded ${
                telemetry.batteryLevel > 50 ? 'bg-green-800' :
                telemetry.batteryLevel > 20 ? 'bg-yellow-800' : 'bg-red-800'
              }`}>
                <FiBatteryCharging className="mr-1" size={14} />
                <span className="text-xs">{telemetry.batteryLevel}%</span>
              </div>
            )}
            
            {telemetry?.signalStrength !== undefined && (
              <div className={`flex items-center px-2 py-1 rounded ${
                telemetry.signalStrength > 80 ? 'bg-green-800' :
                telemetry.signalStrength > 50 ? 'bg-yellow-800' : 'bg-red-800'
              }`}>
                <FiWifi className="mr-1" size={14} />
                <span className="text-xs">{telemetry.signalStrength}%</span>
              </div>
            )}
          </div>
          
          <div className="ml-4 flex">
            <button
              onClick={toggleSettings}
              className="p-2 rounded-full hover:bg-gray-700"
              title="Settings"
            >
              <FiSettings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main monitoring area */}
        <div className="flex-1 flex flex-col">
          {/* Layout controls */}
          <div className="bg-gray-100 border-b border-gray-300 p-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => changeLayout('default')}
                className={`px-2 py-1 text-xs rounded ${
                  currentLayout === 'default' ? 'bg-blue-100 text-blue-800' : 'bg-white text-gray-800 border border-gray-300'
                }`}
              >
                Default View
              </button>
              <button
                onClick={() => changeLayout('map')}
                className={`px-2 py-1 text-xs rounded ${
                  currentLayout === 'map' ? 'bg-blue-100 text-blue-800' : 'bg-white text-gray-800 border border-gray-300'
                }`}
              >
                Map Focus
              </button>
              <button
                onClick={() => changeLayout('video')}
                className={`px-2 py-1 text-xs rounded ${
                  currentLayout === 'video' ? 'bg-blue-100 text-blue-800' : 'bg-white text-gray-800 border border-gray-300'
                }`}
              >
                Video Focus
              </button>
              <button
                onClick={() => changeLayout('split')}
                className={`px-2 py-1 text-xs rounded ${
                  currentLayout === 'split' ? 'bg-blue-100 text-blue-800' : 'bg-white text-gray-800 border border-gray-300'
                }`}
              >
                Split View
              </button>
            </div>
            
            <MissionProgress 
              progress={activeMission.progress || 0}
              status={activeMission.status}
              startTime={activeMission.startTime}
              endTime={activeMission.endTime}
              estimatedDuration={activeMission.estimatedDuration}
            />
          </div>
          
          {/* Dynamic content area based on layout */}
          <div className="flex-1 overflow-hidden">
            {fullscreenElement === 'map' ? (
              <div className="h-full relative">
                <MapView 
                  waypoints={activeMission.waypoints}
                  currentPosition={telemetry?.position}
                  height="100%"
                  showPath={true}
                  showMarkers={true}
                />
                <button
                  onClick={() => toggleFullscreen('map')}
                  className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md"
                  title="Exit Fullscreen"
                >
                  <FiMinimize size={18} />
                </button>
              </div>
            ) : fullscreenElement === 'video' ? (
              <div className="h-full relative">
                <VideoFeed 
                  streamUrl={activeMission.streamUrl || activeDrone?.streamUrl}
                  status={activeMission.status}
                  quality={streamQuality}
                />
                <button
                  onClick={() => toggleFullscreen('video')}
                  className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md"
                  title="Exit Fullscreen"
                >
                  <FiMinimize size={18} />
                </button>
              </div>
            ) : (
              <div className={`h-full grid ${
                currentLayout === 'default' ? 'grid-cols-3 grid-rows-2' :
                currentLayout === 'map' ? 'grid-cols-1 grid-rows-1' :
                currentLayout === 'video' ? 'grid-cols-1 grid-rows-1' :
                currentLayout === 'split' ? 'grid-cols-2 grid-rows-1' : ''
              } gap-2 p-2`}>
                {/* Map container */}
                {(currentLayout === 'default' || currentLayout === 'map' || currentLayout === 'split') && (
                  <div className={`bg-white rounded shadow-sm overflow-hidden relative ${
                    currentLayout === 'default' ? 'col-span-2 row-span-2' :
                    currentLayout === 'map' ? 'col-span-1 row-span-1' : 
                    currentLayout === 'split' ? 'col-span-1 row-span-1' : ''
                  }`}>
                    <MapView 
                      waypoints={activeMission.waypoints}
                      currentPosition={telemetry?.position}
                      height="100%"
                      showPath={true}
                      showMarkers={true}
                    />
                    <button
                      onClick={() => toggleFullscreen('map')}
                      className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-sm"
                      title="Fullscreen Map"
                    >
                      <FiMaximize size={16} />
                    </button>
                  </div>
                )}
                
                {/* Video feed container */}
                {(currentLayout === 'default' || currentLayout === 'video' || currentLayout === 'split') && (
                  <div className={`bg-gray-900 rounded shadow-sm overflow-hidden relative ${
                    currentLayout === 'default' ? 'col-span-1 row-span-1' :
                    currentLayout === 'video' ? 'col-span-1 row-span-1' : 
                    currentLayout === 'split' ? 'col-span-1 row-span-1' : ''
                  }`}>
                    <VideoFeed 
                      streamUrl={activeMission.streamUrl || activeDrone?.streamUrl}
                      status={activeMission.status}
                      quality={streamQuality}
                    />
                    <button
                      onClick={() => toggleFullscreen('video')}
                      className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-sm"
                      title="Fullscreen Video"
                    >
                      <FiMaximize size={16} />
                    </button>
                  </div>
                )}
                
                {/* Telemetry container */}
                {currentLayout === 'default' && (
                  <div className="bg-white rounded shadow-sm overflow-hidden col-span-1 row-span-1">
                    <TelemetryPanel telemetry={telemetry} status={activeMission.status} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar - control panels */}
        <div className="w-64 bg-gray-100 border-l border-gray-300 flex flex-col">
          {/* Control panels */}
          <div className="flex-1 overflow-auto">
            {/* Mission Controls Section */}
            <div className="p-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Mission Controls</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {activeMission.status === 'draft' || activeMission.status === 'scheduled' ? (
                  <button
                    onClick={handleStartMission}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <FiPlay className="mr-1" />
                    Start
                  </button>
                ) : activeMission.status === 'in_progress' ? (
                  <button
                    onClick={handlePauseMission}
                    className="flex items-center px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                  >
                    <FiPause className="mr-1" />
                    Pause
                  </button>
                ) : activeMission.status === 'paused' ? (
                  <button
                    onClick={handleResumeMission}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <FiPlay className="mr-1" />
                    Resume
                  </button>
                ) : null}
                
                {(['in_progress', 'paused'].includes(activeMission.status)) && (
                  <>
                    <button
                      onClick={handleAbortMission}
                      className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      <FiSquare className="mr-1" />
                      Abort
                    </button>
                    
                    <button
                      onClick={handleReturnToHome}
                      className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <FiHome className="mr-1" />
                      RTH
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Manual Controls Section */}
            {(['in_progress', 'paused'].includes(activeMission.status)) && (
              <div className="p-3 border-b border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-gray-700">Drone Controls</h3>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-2">
                      {controlMode === 'auto' ? 'Auto' : 'Manual'}
                    </span>
                    <button
                      onClick={toggleControlMode}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full ${
                        controlMode === 'manual' ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          controlMode === 'manual' ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                
                {controlMode === 'manual' && (
                  <DroneControls 
                    droneId={activeMission.droneId} 
                    disabled={!['in_progress', 'paused'].includes(activeMission.status)}
                  />
                )}
              </div>
            )}
            
            {/* Waypoints */}
            <div className="p-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Waypoints</h3>
              <WaypointsList 
                waypoints={activeMission.waypoints || []}
                currentPosition={telemetry?.position}
                currentWaypointIndex={telemetry?.currentWaypointIndex}
              />
            </div>
            
            {/* Log messages */}
            <div className="p-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Activity Log</h3>
              <LogPanel logs={logs} maxHeight="200px" />
            </div>
          </div>
          
          {/* Mission info footer */}
          <div className="p-3 bg-gray-200 border-t border-gray-300">
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Mission ID:</span>
                <span className="font-mono">{activeMission._id?.substring(0, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span>Start:</span>
                <span>{activeMission.startTime ? formatDateTime(activeMission.startTime, 'HH:mm:ss') : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span>{formatDuration(telemetry?.duration || 0, true)}</span>
              </div>
              <div className="flex justify-between">
                <span>Distance:</span>
                <span>{telemetry?.totalDistance ? `${telemetry.totalDistance.toFixed(2)} km` : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Notification area */}
      <div className="fixed top-4 right-4 space-y-2 max-w-xs z-50">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`px-4 py-3 rounded-lg shadow-lg flex items-start ${
              notification.type === 'success' ? 'bg-green-100 border-l-4 border-green-500' :
              notification.type === 'error' ? 'bg-red-100 border-l-4 border-red-500' :
              notification.type === 'warning' ? 'bg-yellow-100 border-l-4 border-yellow-500' :
              'bg-blue-100 border-l-4 border-blue-500'
            }`}
          >
            <div className="flex-shrink-0 mr-3">
              {notification.type === 'success' && <FiCheckCircle className="h-5 w-5 text-green-500" />}
              {notification.type === 'error' && <FiXCircle className="h-5 w-5 text-red-500" />}
              {notification.type === 'warning' && <FiAlertTriangle className="h-5 w-5 text-yellow-500" />}
              {notification.type === 'info' && <FiInfo className="h-5 w-5 text-blue-500" />}
            </div>
            <div className="flex-1">
              <h4 className={`text-sm font-medium ${
                notification.type === 'success' ? 'text-green-800' :
                notification.type === 'error' ? 'text-red-800' :
                notification.type === 'warning' ? 'text-yellow-800' :
                'text-blue-800'
              }`}>
                {notification.title}
              </h4>
              <p className="text-xs mt-1 text-gray-600">{notification.message}</p>
            </div>
            <button
              className="ml-2 text-gray-400 hover:text-gray-600"
              onClick={() => removeNotification(notification.id)}
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      
      {/* Settings panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Monitor Settings</h2>
              <button onClick={toggleSettings}>
                <FiX className="h-5 w-5 text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Stream quality settings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video Stream Quality</label>
                <div className="flex space-x-4">
                  {['low', 'medium', 'high'].map((quality) => (
                    <label key={quality} className="flex items-center">
                      <input
                        type="radio"
                        className="mr-2"
                        checked={streamQuality === quality}
                        onChange={() => setStreamQuality(quality)}
                      />
                      <span className="capitalize">{quality}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Other settings can be added here */}
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={toggleSettings}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Confirmation dialog */}
      <ConfirmDialog
        isOpen={confirmAction !== null}
        title={`${confirmAction?.charAt(0).toUpperCase()}${confirmAction?.slice(1) || ''} Mission`}
        message={
          confirmAction === 'start' ? 'Are you sure you want to start this mission? The drone will take off and begin following the programmed waypoints.' :
          confirmAction === 'pause' ? 'Are you sure you want to pause this mission? The drone will hover in place until resumed.' :
          confirmAction === 'resume' ? 'Are you sure you want to resume this mission? The drone will continue from its current position.' :
          confirmAction === 'abort' ? 'Are you sure you want to abort this mission? The drone will stop and hover in place.' :
          confirmAction === 'returnToHome' ? 'Are you sure you want the drone to return to home? It will abort the current mission and fly back to its launch point.' :
          'Are you sure you want to perform this action?'
        }
        confirmText={
          confirmAction === 'start' ? 'Start Mission' :
          confirmAction === 'pause' ? 'Pause Mission' :
          confirmAction === 'resume' ? 'Resume Mission' :
          confirmAction === 'abort' ? 'Abort Mission' :
          confirmAction === 'returnToHome' ? 'Return To Home' :
          'Confirm'
        }
        confirmButtonClass={
          confirmAction === 'start' || confirmAction === 'resume' ? 'bg-green-600 hover:bg-green-700' :
          confirmAction === 'pause' ? 'bg-yellow-600 hover:bg-yellow-700' :
          confirmAction === 'abort' ? 'bg-red-600 hover:bg-red-700' :
          'bg-blue-600 hover:bg-blue-700'
        }
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
      />
    </div>
  );
};

export default MonitorPage;