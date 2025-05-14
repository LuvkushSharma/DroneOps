/**
 * Socket.io configuration settings
 */
const socketConfig = {
    // Connection options
    connectionOptions: {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
      },
      
      // Ping timeout settings
      pingTimeout: 60000,
      
      // Transport options
      transports: ['websocket', 'polling']
    },
    
    // Event names for standardization across the application
    events: {
      // Connection events
      CONNECTION: 'connection',
      DISCONNECT: 'disconnect',
      
      // Drone events
      DRONE_UPDATE: 'drone:update',
      DRONE_STATUS_CHANGE: 'drone:status_change',
      DRONE_TELEMETRY: 'drone:telemetry',
      
      // Mission events
      MISSION_CREATE: 'mission:create',
      MISSION_UPDATE: 'mission:update',
      MISSION_STATUS_CHANGE: 'mission:status_change',
      MISSION_PROGRESS: 'mission:progress',
      MISSION_COMPLETE: 'mission:complete',
      MISSION_ABORT: 'mission:abort',
      
      // Survey events
      SURVEY_UPDATE: 'survey:update',
      SURVEY_STATUS_CHANGE: 'survey:status_change',
      
      // Error events
      ERROR: 'error',
      
      // Subscription events
      SUBSCRIBE_DRONE: 'subscribe:drone',
      SUBSCRIBE_MISSION: 'subscribe:mission',
      SUBSCRIBE_SURVEY: 'subscribe:survey',
      UNSUBSCRIBE_DRONE: 'unsubscribe:drone',
      UNSUBSCRIBE_MISSION: 'unsubscribe:mission',
      UNSUBSCRIBE_SURVEY: 'unsubscribe:survey',
    },
    
    // Rooms/channels naming convention
    rooms: {
      // Function to get room name for a specific drone
      droneRoom: (droneId) => `drone:${droneId}`,
      
      // Function to get room name for a specific mission
      missionRoom: (missionId) => `mission:${missionId}`,
      
      // Function to get room name for a specific survey
      surveyRoom: (surveyId) => `survey:${surveyId}`,
      
      // Admin room for system-wide events
      ADMIN_ROOM: 'admin',
      
      // Global room for broadcasts
      GLOBAL_ROOM: 'global'
    }
  };
  
  module.exports = socketConfig;