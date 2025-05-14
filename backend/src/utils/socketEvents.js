const socketManager = require('../socket/socketManager');
const socketConfig = require('../config/socketConfig');

/**
 * Emit a drone update event to all connected clients subscribed to that drone
 * @param {string} droneId - ID of the drone that was updated
 * @param {Object} data - Data to be sent with the event
 */
exports.emitDroneUpdate = (droneId, data) => {
  const io = socketManager.getIO();
  if (io) {
    io.to(socketConfig.rooms.droneRoom(droneId)).emit(
      socketConfig.events.DRONE_UPDATE, 
      { droneId, ...data }
    );
  }
};

/**
 * Emit a mission update event to all connected clients subscribed to that mission
 * @param {string} missionId - ID of the mission that was updated
 * @param {Object} data - Data to be sent with the event
 */
exports.emitMissionUpdate = (missionId, data) => {
  const io = socketManager.getIO();
  if (io) {
    io.to(socketConfig.rooms.missionRoom(missionId)).emit(
      socketConfig.events.MISSION_UPDATE, 
      { missionId, ...data }
    );
  }
};

/**
 * Emit mission progress update event
 * @param {string} missionId - ID of the mission
 * @param {number} progress - Progress percentage (0-100)
 * @param {Object} additionalData - Any additional data to include
 */
exports.emitMissionProgress = (missionId, progress, additionalData = {}) => {
  const io = socketManager.getIO();
  if (io) {
    io.to(socketConfig.rooms.missionRoom(missionId)).emit(
      socketConfig.events.MISSION_PROGRESS, 
      { missionId, progress, ...additionalData }
    );
  }
};

/**
 * Emit a survey update event to all connected clients subscribed to that survey
 * @param {string} surveyId - ID of the survey that was updated
 * @param {Object} data - Data to be sent with the event
 */
exports.emitSurveyUpdate = (surveyId, data) => {
  const io = socketManager.getIO();
  if (io) {
    io.to(socketConfig.rooms.surveyRoom(surveyId)).emit(
      socketConfig.events.SURVEY_UPDATE, 
      { surveyId, ...data }
    );
  }
};

/**
 * Emit a global update to all connected clients
 * @param {string} eventName - Name of the event
 * @param {Object} data - Data to be sent with the event
 */
exports.emitGlobalUpdate = (eventName, data) => {
  const io = socketManager.getIO();
  if (io) {
    io.to(socketConfig.rooms.GLOBAL_ROOM).emit(eventName, data);
  }
};