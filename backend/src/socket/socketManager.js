const socketConfig = require('../config/socketConfig');

/**
 * Socket.io manager module
 * Handles socket.io instance and connection management
 */
let io;

/**
 * Initialize socket.io with the HTTP server
 * @param {Object} httpServer - HTTP server instance
 */
exports.init = (httpServer) => {
  io = require('socket.io')(httpServer, socketConfig.connectionOptions);

  io.on(socketConfig.events.CONNECTION, (socket) => {
    console.log(`Client connected: ${socket.id}`);
    
    // Join global room by default
    socket.join(socketConfig.rooms.GLOBAL_ROOM);

    // Subscribe to drone updates
    socket.on(socketConfig.events.SUBSCRIBE_DRONE, (droneId) => {
      if (droneId) {
        socket.join(socketConfig.rooms.droneRoom(droneId));
        console.log(`Client ${socket.id} subscribed to drone ${droneId}`);
      }
    });

    // Unsubscribe from drone updates
    socket.on(socketConfig.events.UNSUBSCRIBE_DRONE, (droneId) => {
      if (droneId) {
        socket.leave(socketConfig.rooms.droneRoom(droneId));
        console.log(`Client ${socket.id} unsubscribed from drone ${droneId}`);
      }
    });

    // Subscribe to mission updates
    socket.on(socketConfig.events.SUBSCRIBE_MISSION, (missionId) => {
      if (missionId) {
        socket.join(socketConfig.rooms.missionRoom(missionId));
        console.log(`Client ${socket.id} subscribed to mission ${missionId}`);
      }
    });

    // Unsubscribe from mission updates
    socket.on(socketConfig.events.UNSUBSCRIBE_MISSION, (missionId) => {
      if (missionId) {
        socket.leave(socketConfig.rooms.missionRoom(missionId));
        console.log(`Client ${socket.id} unsubscribed from mission ${missionId}`);
      }
    });

    // Subscribe to survey updates
    socket.on(socketConfig.events.SUBSCRIBE_SURVEY, (surveyId) => {
      if (surveyId) {
        socket.join(socketConfig.rooms.surveyRoom(surveyId));
        console.log(`Client ${socket.id} subscribed to survey ${surveyId}`);
      }
    });

    // Unsubscribe from survey updates
    socket.on(socketConfig.events.UNSUBSCRIBE_SURVEY, (surveyId) => {
      if (surveyId) {
        socket.leave(socketConfig.rooms.surveyRoom(surveyId));
        console.log(`Client ${socket.id} unsubscribed from survey ${surveyId}`);
      }
    });

    // Handle disconnection
    socket.on(socketConfig.events.DISCONNECT, () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
  
  return io;
};

/**
 * Get the socket.io instance
 * @returns {Object} Socket.io instance
 */
exports.getIO = () => {
  if (!io) {
    console.warn('Socket.io not initialized! Call init() first');
    return null;
  }
  return io;
};

/**
 * Close all socket connections
 */
exports.close = () => {
  if (io) {
    io.close();
    io = null;
    console.log('Socket.io connections closed');
  }
};