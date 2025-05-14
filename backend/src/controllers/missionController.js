const Mission = require('../models/Mission');
const Drone = require('../models/Drone');
const Survey = require('../models/Survey');

/**
 * Get all missions with optional filtering
 * @route GET /api/missions
 */
exports.getMissions = async (req, res) => {
  try {
    const { status, drone, survey, startDate, endDate } = req.query;
    
    // Build filter object based on query parameters
    const filter = {};
    
    if (status) filter.status = status;
    if (drone) filter.drone = drone;
    if (survey) filter.survey = survey;
    
    // Date range filtering
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    const missions = await Mission.find(filter)
      .populate('drone', 'name serial model status batteryLevel')
      .populate('survey', 'name status')
      .sort({ createdAt: -1 });
      
    res.status(200).json(missions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get single mission by ID
 * @route GET /api/missions/:id
 */
exports.getMissionById = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id)
      .populate('drone')
      .populate({
        path: 'survey',
        select: 'name description status'
      });
      
    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }
    
    res.status(200).json(mission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Create a new mission
 * @route POST /api/missions
 */
exports.createMission = async (req, res) => {
  try {
    const {
      name,
      description,
      drone,
      waypoints,
      altitude,
      speed,
      pattern,
      startTime,
      endTime,
      environmentalConditions,
      survey
    } = req.body;
    
    // Check if drone exists and is available
    const droneObj = await Drone.findById(drone);
    if (!droneObj) {
      return res.status(404).json({ message: 'Drone not found' });
    }
    
    if (droneObj.status !== 'available' && droneObj.status !== 'idle') {
      return res.status(400).json({ message: 'Drone is not available for mission' });
    }
    
    // Create the new mission
    const mission = new Mission({
      name,
      description,
      drone,
      waypoints,
      altitude,
      speed,
      pattern,
      status: 'planned',
      startTime,
      endTime,
      environmentalConditions,
      createdBy: req.user.id,
      survey
    });
    
    const savedMission = await mission.save();
    
    // If this mission is part of a survey, update the survey
    if (survey) {
      await Survey.findByIdAndUpdate(
        survey,
        { $addToSet: { missions: savedMission._id } }
      );
    }
    
    // Update drone status to assigned
    droneObj.status = 'assigned';
    await droneObj.save();
    
    // Emit mission creation event
    const io = req.app.get('io');
    if (io) {
      io.emit('missionCreated', savedMission);
    }
    
    res.status(201).json(savedMission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Update mission details
 * @route PUT /api/missions/:id
 */
exports.updateMission = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      drone, 
      waypoints, 
      altitude, 
      speed,
      pattern,
      startTime, 
      endTime, 
      environmentalConditions
    } = req.body;
    
    // Find current mission
    const currentMission = await Mission.findById(req.params.id);
    if (!currentMission) {
      return res.status(404).json({ message: 'Mission not found' });
    }
    
    // Check if mission status allows updates
    if (currentMission.status !== 'planned') {
      return res.status(400).json({ 
        message: 'Only planned missions can be updated. Cancel the mission first.' 
      });
    }
    
    // If drone is being changed, handle drone assignment
    if (drone && drone !== currentMission.drone.toString()) {
      // Check if new drone exists and is available
      const newDrone = await Drone.findById(drone);
      if (!newDrone) {
        return res.status(404).json({ message: 'Drone not found' });
      }
      
      if (newDrone.status !== 'available' && newDrone.status !== 'idle') {
        return res.status(400).json({ message: 'Drone is not available for mission' });
      }
      
      // Free up the old drone
      const oldDrone = await Drone.findById(currentMission.drone);
      if (oldDrone) {
        oldDrone.status = 'available';
        await oldDrone.save();
      }
      
      // Assign the new drone
      newDrone.status = 'assigned';
      await newDrone.save();
    }
    
    // Update the mission
    const updatedMission = await Mission.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        drone,
        waypoints,
        altitude,
        speed,
        pattern,
        startTime,
        endTime,
        environmentalConditions,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).populate('drone');
    
    // Emit mission update event
    const io = req.app.get('io');
    if (io) {
      io.emit('missionUpdated', updatedMission);
    }
    
    res.status(200).json(updatedMission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Delete a mission
 * @route DELETE /api/missions/:id
 */
exports.deleteMission = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }
    
    // Check if mission can be deleted
    if (mission.status === 'in-progress' || mission.status === 'paused') {
      return res.status(400).json({ 
        message: 'Active missions cannot be deleted. Abort the mission first.' 
      });
    }
    
    // Update drone status if mission is assigned or planned
    if (mission.status === 'planned' || mission.status === 'assigned') {
      const drone = await Drone.findById(mission.drone);
      if (drone) {
        drone.status = 'available';
        await drone.save();
      }
    }
    
    // Remove mission from any survey it belongs to
    if (mission.survey) {
      await Survey.findByIdAndUpdate(
        mission.survey,
        { $pull: { missions: mission._id } }
      );
    }
    
    await Mission.findByIdAndDelete(req.params.id);
    
    // Emit mission deletion event
    const io = req.app.get('io');
    if (io) {
      io.emit('missionDeleted', { missionId: req.params.id });
    }
    
    res.status(200).json({ message: 'Mission deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Start a mission
 * @route POST /api/missions/:id/start
 */
exports.startMission = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }
    
    if (mission.status !== 'planned') {
      return res.status(400).json({ message: 'Mission cannot be started' });
    }
    
    // Update mission status
    mission.status = 'in-progress';
    mission.startTime = Date.now();
    mission.progress = 0;
    mission.currentWaypointIndex = 0;
    
    // Calculate estimated duration based on waypoints, speed and distance
    if (mission.waypoints && mission.waypoints.length > 1 && mission.speed) {
      let totalDistance = 0;
      for (let i = 0; i < mission.waypoints.length - 1; i++) {
        const p1 = mission.waypoints[i];
        const p2 = mission.waypoints[i + 1];
        
        // Calculate distance between waypoints using the Haversine formula
        const R = 6371e3; // Earth radius in meters
        const φ1 = p1.latitude * Math.PI/180;
        const φ2 = p2.latitude * Math.PI/180;
        const Δφ = (p2.latitude - p1.latitude) * Math.PI/180;
        const Δλ = (p2.longitude - p1.longitude) * Math.PI/180;
        
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        
        totalDistance += R * c;
      }
      
      // Calculate estimated duration in minutes
      mission.estimatedDuration = totalDistance / (mission.speed * 60);
      mission.estimatedTimeRemaining = mission.estimatedDuration;
    }
    
    await mission.save();
    
    // Update drone status
    const drone = await Drone.findById(mission.drone);
    if (drone) {
      drone.status = 'flying';
      drone.currentMission = mission._id;
      await drone.save();
      
      // Emit drone status update
      const io = req.app.get('io');
      if (io) {
        io.emit('droneStatusUpdate', { droneId: drone._id, status: drone.status });
      }
    }
    
    // Emit mission start event
    const io = req.app.get('io');
    if (io) {
      io.emit('missionStart', mission);
    }
    
    res.status(200).json(mission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Pause a mission
 * @route POST /api/missions/:id/pause
 */
exports.pauseMission = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }
    
    if (mission.status !== 'in-progress') {
      return res.status(400).json({ message: 'Mission is not in progress' });
    }
    
    // Update mission status
    mission.status = 'paused';
    mission.pauseTime = Date.now();
    await mission.save();
    
    // Update drone status
    const drone = await Drone.findById(mission.drone);
    if (drone) {
      drone.status = 'hovering';
      await drone.save();
      
      // Emit drone status update
      const io = req.app.get('io');
      if (io) {
        io.emit('droneStatusUpdate', { droneId: drone._id, status: drone.status });
      }
    }
    
    // Emit mission pause event
    const io = req.app.get('io');
    if (io) {
      io.emit('missionPause', { missionId: mission._id });
    }
    
    res.status(200).json({ message: 'Mission paused successfully', mission });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Resume a paused mission
 * @route POST /api/missions/:id/resume
 */
exports.resumeMission = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }
    
    if (mission.status !== 'paused') {
      return res.status(400).json({ message: 'Only paused missions can be resumed' });
    }
    
    // Update mission status
    mission.status = 'in-progress';
    mission.pauseTime = null;
    await mission.save();
    
    // Update drone status
    const drone = await Drone.findById(mission.drone);
    if (drone) {
      drone.status = 'flying';
      await drone.save();
      
      // Emit drone status update
      const io = req.app.get('io');
      if (io) {
        io.emit('droneStatusUpdate', { droneId: drone._id, status: drone.status });
      }
    }
    
    // Emit mission resume event
    const io = req.app.get('io');
    if (io) {
      io.emit('missionResume', { missionId: mission._id });
    }
    
    res.status(200).json({ message: 'Mission resumed successfully', mission });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Abort a mission
 * @route POST /api/missions/:id/abort
 */
exports.abortMission = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }
    
    if (mission.status !== 'in-progress' && mission.status !== 'paused') {
      return res.status(400).json({ message: 'Only active missions can be aborted' });
    }
    
    // Update mission status
    mission.status = 'aborted';
    mission.endTime = Date.now();
    mission.abortReason = req.body.reason || 'Manually aborted';
    await mission.save();
    
    // Update drone status - initiate return to home procedure
    const drone = await Drone.findById(mission.drone);
    if (drone) {
      drone.status = 'returning';
      await drone.save();
      
      // Emit drone status update
      const io = req.app.get('io');
      if (io) {
        io.emit('droneStatusUpdate', { droneId: drone._id, status: drone.status });
      }
      
      // In a real system, you would send RTH (Return To Home) command to the drone
      // For simulation, we'll update the drone status to available after a delay
      setTimeout(async () => {
        drone.status = 'available';
        drone.currentMission = null;
        await drone.save();
        
        // Emit drone status update
        if (io) {
          io.emit('droneStatusUpdate', { droneId: drone._id, status: drone.status });
        }
      }, 10000); // 10 seconds to simulate return to home
    }
    
    // Emit mission abort event
    const io = req.app.get('io');
    if (io) {
      io.emit('missionAbort', { 
        missionId: mission._id,
        reason: mission.abortReason 
      });
    }
    
    res.status(200).json({ message: 'Mission aborted successfully', mission });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Complete a mission
 * @route POST /api/missions/:id/complete
 */
exports.completeMission = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }
    
    if (mission.status !== 'in-progress' && mission.status !== 'paused') {
      return res.status(400).json({ message: 'Only active missions can be completed' });
    }
    
    // Update mission status and data
    mission.status = 'completed';
    mission.progress = 100;
    mission.endTime = Date.now();
    mission.currentWaypointIndex = mission.waypoints.length - 1;
    
    // Calculate mission statistics
    let totalDistance = 0;
    if (mission.waypoints && mission.waypoints.length > 1) {
      for (let i = 0; i < mission.waypoints.length - 1; i++) {
        const p1 = mission.waypoints[i];
        const p2 = mission.waypoints[i + 1];
        
        // Calculate distance between waypoints using the Haversine formula
        const R = 6371e3; // Earth radius in meters
        const φ1 = p1.latitude * Math.PI/180;
        const φ2 = p2.latitude * Math.PI/180;
        const Δφ = (p2.latitude - p1.latitude) * Math.PI/180;
        const Δλ = (p2.longitude - p1.longitude) * Math.PI/180;
        
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        
        totalDistance += R * c;
      }
      
      // Convert to kilometers
      totalDistance = totalDistance / 1000;
    }
    
    // Estimate area covered based on pattern
    let areaCovered = 0;
    if (mission.pattern === 'grid' || mission.pattern === 'crosshatch') {
      // For grid patterns, estimate area as rectangular coverage
      if (mission.waypoints && mission.waypoints.length >= 4) {
        // Find min and max lat/long to calculate covered area
        const lats = mission.waypoints.map(wp => wp.latitude);
        const longs = mission.waypoints.map(wp => wp.longitude);
        
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLong = Math.min(...longs);
        const maxLong = Math.max(...longs);
        
        // Calculate area using the Haversine formula
        const R = 6371; // Earth radius in km
        const φ1 = minLat * Math.PI/180;
        const φ2 = maxLat * Math.PI/180;
        const λ1 = minLong * Math.PI/180;
        const λ2 = maxLong * Math.PI/180;
        
        // Width is distance between min/max longitude at the mean latitude
        const meanLat = (minLat + maxLat) / 2;
        const width = R * Math.cos(meanLat * Math.PI/180) * Math.abs(λ2 - λ1);
        
        // Height is distance between min/max latitude
        const height = R * Math.abs(φ2 - φ1);
        
        areaCovered = width * height;
      }
    } else if (mission.pattern === 'perimeter') {
      // For perimeter, calculate approximate area of polygon
      // This is a simplified approximation
      if (mission.waypoints && mission.waypoints.length >= 3) {
        let area = 0;
        for (let i = 0; i < mission.waypoints.length; i++) {
          const j = (i + 1) % mission.waypoints.length;
          area += mission.waypoints[i].longitude * mission.waypoints[j].latitude;
          area -= mission.waypoints[j].longitude * mission.waypoints[i].latitude;
        }
        areaCovered = Math.abs(area / 2) * 111 * 111; // rough conversion to km²
      }
    }
    
    // Save mission statistics
    mission.statistics = {
      distance: parseFloat(totalDistance.toFixed(2)),
      areaCovered: parseFloat(areaCovered.toFixed(2)),
      duration: Math.round((new Date(mission.endTime) - new Date(mission.startTime)) / (1000 * 60)), // minutes
      batteryUsed: req.body.batteryUsed || 0,
      images: req.body.images || 0,
      videos: req.body.videos || 0
    };
    
    await mission.save();
    
    // Update drone status - initiate return to home procedure
    const drone = await Drone.findById(mission.drone);
    if (drone) {
      drone.status = 'returning';
      drone.flightHours = (drone.flightHours || 0) + (mission.statistics.duration / 60);
      await drone.save();
      
      // In a real system, you would send RTH command to the drone
      // For simulation, we'll update the drone status to available after a delay
      setTimeout(async () => {
        drone.status = 'available';
        drone.currentMission = null;
        await drone.save();
        
        // Emit drone status update
        const io = req.app.get('io');
        if (io) {
          io.emit('droneStatusUpdate', { droneId: drone._id, status: drone.status });
        }
      }, 10000); // 10 seconds to simulate return to home
    }
    
    // Update survey completion status if this is the last mission
    if (mission.survey) {
      const survey = await Survey.findById(mission.survey);
      if (survey) {
        const allMissions = await Mission.find({ survey: survey._id });
        const allCompleted = allMissions.every(m => 
          m.status === 'completed' || m.status === 'aborted');
          
        if (allCompleted) {
          survey.status = 'completed';
          survey.completedAt = Date.now();
          await survey.save();
          
          // Emit survey completion event
          const io = req.app.get('io');
          if (io) {
            io.emit('surveyCompleted', { surveyId: survey._id });
          }
        }
      }
    }
    
    // Emit mission completion event
    const io = req.app.get('io');
    if (io) {
      io.emit('missionComplete', mission);
    }
    
    res.status(200).json(mission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Update mission progress
 * @route PATCH /api/missions/:id/progress
 */
exports.updateMissionProgress = async (req, res) => {
  try {
    const { progress, currentWaypointIndex, telemetry } = req.body;
    
    if (progress === undefined || progress < 0 || progress > 100) {
      return res.status(400).json({ message: 'Invalid progress value' });
    }
    
    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }
    
    // Only update if mission is in progress
    if (mission.status !== 'in-progress') {
      return res.status(400).json({ message: 'Mission is not in progress' });
    }
    
    // Update progress and related data
    mission.progress = progress;
    
    if (currentWaypointIndex !== undefined) {
      mission.currentWaypointIndex = currentWaypointIndex;
    }
    
    if (telemetry) {
      mission.telemetry = {
        ...mission.telemetry,
        ...telemetry,
        timestamp: Date.now()
      };
      
      // If telemetry includes battery level, update drone battery level
      if (telemetry.batteryLevel && mission.drone) {
        await Drone.findByIdAndUpdate(mission.drone, { 
          batteryLevel: telemetry.batteryLevel 
        });
      }
    }
    
    // Calculate estimated time remaining
    if (mission.estimatedDuration) {
      mission.estimatedTimeRemaining = 
        ((100 - progress) / 100) * mission.estimatedDuration;
    }
    
    await mission.save();
    
    // Emit mission progress update
    const io = req.app.get('io');
    if (io) {
      io.emit('missionProgressUpdate', { 
        missionId: mission._id, 
        progress,
        currentWaypointIndex: mission.currentWaypointIndex,
        estimatedTimeRemaining: mission.estimatedTimeRemaining,
        telemetry: mission.telemetry
      });
    }
    
    res.status(200).json({ message: 'Mission progress updated' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Get mission telemetry
 * @route GET /api/missions/:id/telemetry
 */
exports.getMissionTelemetry = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }
    
    // Return mission telemetry data
    res.status(200).json({
      telemetry: mission.telemetry || {},
      progress: mission.progress,
      currentWaypointIndex: mission.currentWaypointIndex,
      estimatedTimeRemaining: mission.estimatedTimeRemaining
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Generate a flight plan based on parameters
 * @route POST /api/missions/flight-plan
 */
exports.generateFlightPlan = async (req, res) => {
  try {
    const {
      pattern,
      boundary,
      altitude,
      speed,
      overlap,
      startPoint,
      endPoint
    } = req.body;
    
    // Validate required parameters
    if (!pattern || !boundary || !altitude || !speed) {
      return res.status(400).json({ 
        message: 'Missing required parameters: pattern, boundary, altitude, speed' 
      });
    }
    
    // Verify boundary has at least 3 points for a valid polygon
    if (!Array.isArray(boundary) || boundary.length < 3) {
      return res.status(400).json({ 
        message: 'Boundary must contain at least 3 points' 
      });
    }
    
    // Generate waypoints based on pattern
    let waypoints = [];
    
    switch (pattern) {
      case 'grid':
        waypoints = generateGridPattern(boundary, altitude, overlap || 70);
        break;
        
      case 'crosshatch':
        const horizontalGrid = generateGridPattern(boundary, altitude, overlap || 70);
        const verticalGrid = generateGridPattern(boundary, altitude, overlap || 70, 90); // 90 degrees rotated
        waypoints = [...horizontalGrid, ...verticalGrid];
        break;
        
      case 'perimeter':
        waypoints = generatePerimeterPattern(boundary, altitude);
        break;
        
      case 'spiral':
        waypoints = generateSpiralPattern(boundary, altitude, overlap || 70);
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid pattern type' });
    }
    
    // If start and end points are provided, optimize the path
    if (startPoint && endPoint) {
      waypoints = optimizeWaypoints(waypoints, startPoint, endPoint);
    }
    
    // Calculate estimated duration based on waypoints and speed
    let totalDistance = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];
      
      // Calculate distance between waypoints
      const R = 6371e3; // Earth radius in meters
      const φ1 = p1.latitude * Math.PI/180;
      const φ2 = p2.latitude * Math.PI/180;
      const Δφ = (p2.latitude - p1.latitude) * Math.PI/180;
      const Δλ = (p2.longitude - p1.longitude) * Math.PI/180;
      
      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      
      totalDistance += R * c;
    }
    
    const estimatedDuration = totalDistance / (speed * 60); // minutes
    
    // Return the flight plan
    res.status(200).json({
      waypoints,
      pattern,
      altitude,
      speed,
      overlap: overlap || 70,
      estimatedDuration: Math.round(estimatedDuration),
      totalDistance: Math.round(totalDistance)
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Get missions analytics
 * @route GET /api/missions/analytics
 */
exports.getMissionAnalytics = async (req, res) => {
  try {
    // Get total mission counts by status
    const statusCounts = await Mission.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Format results for frontend
    const missionsByStatus = statusCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});
    
    // Get average mission duration
    const completedMissions = await Mission.find({ 
      status: 'completed',
      startTime: { $exists: true },
      endTime: { $exists: true }
    });
    
    let totalDuration = 0;
    completedMissions.forEach(mission => {
      const duration = new Date(mission.endTime) - new Date(mission.startTime);
      totalDuration += duration;
    });
    
    const averageDurationMs = completedMissions.length > 0 
      ? totalDuration / completedMissions.length 
      : 0;
    
    // Get missions by day (for the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const missionsByDay = await Mission.aggregate([
      { 
        $match: { 
          createdAt: { $gte: thirtyDaysAgo } 
        } 
      },
      {
        $group: {
          _id: { 
            $dateToString: { 
              format: '%Y-%m-%d', date: '$createdAt' 
            } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get top drones by mission count
    const droneUsage = await Mission.aggregate([
      { $group: { _id: '$drone', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { 
        $lookup: {
          from: 'drones',
          localField: '_id',
          foreignField: '_id',
          as: 'droneInfo'
        }
      },
      { 
        $project: {
          _id: 1,
          count: 1,
          droneName: { $arrayElemAt: ['$droneInfo.name', 0] }
        }
      }
    ]);
    
    res.status(200).json({
      totalMissions: await Mission.countDocuments(),
      missionsByStatus,
      averageDuration: Math.round(averageDurationMs / (1000 * 60)), // in minutes
      missionsByDay,
      droneUsage,
      completedMissionsCount: completedMissions.length,
      abortedMissionsCount: await Mission.countDocuments({ status: 'aborted' }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to generate grid pattern waypoints
// Note: In a real application, these pattern generators would be more sophisticated
const generateGridPattern = (boundary, altitude, overlap, rotation = 0) => {
  // This is a simplified implementation
  // In a real app, you would use more complex algorithms
  
  // For now, we'll create a simple grid within the boundary
  const waypoints = [];
  
  // Find the bounding box of the boundary
  const lats = boundary.map(p => p.latitude);
  const lngs = boundary.map(p => p.longitude);
  
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  
  // Calculate grid spacing based on overlap
  // Higher overlap means closer lines
  const overlapFactor = (100 - overlap) / 100;
  const latSpacing = (maxLat - minLat) * overlapFactor / 10;
  const lngSpacing = (maxLng - minLng) * overlapFactor / 10;
  
  // Generate grid lines
  let rowIndex = 0;
  for (let lat = minLat; lat <= maxLat; lat += latSpacing) {
    const rowWaypoints = [];
    
    // Alternate direction for efficiency (lawnmower pattern)
    const isReverse = rowIndex % 2 === 1;
    
    for (let lng = isReverse ? maxLng : minLng; 
         isReverse ? lng >= minLng : lng <= maxLng; 
         lng += isReverse ? -lngSpacing : lngSpacing) {
      
      rowWaypoints.push({
        latitude: lat,
        longitude: lng,
        altitude: altitude,
        action: 'waypoint',
        order: waypoints.length + rowWaypoints.length + 1
      });
    }
    
    waypoints.push(...rowWaypoints);
    rowIndex++;
  }
  
  return waypoints;
};

// Helper function to generate perimeter pattern waypoints
const generatePerimeterPattern = (boundary, altitude) => {
  // For perimeter, we simply follow the boundary points
  return boundary.map((point, index) => ({
    latitude: point.latitude,
    longitude: point.longitude,
    altitude: altitude,
    action: 'waypoint',
    order: index + 1
  }));
};

// Helper function to generate spiral pattern waypoints
const generateSpiralPattern = (boundary, altitude, overlap) => {
  // Find center of boundary
  const lats = boundary.map(p => p.latitude);
  const lngs = boundary.map(p => p.longitude);
  
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  
  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;
  
  // Calculate the maximum radius
  let maxRadius = 0;
  boundary.forEach(point => {
    const distance = Math.sqrt(
      Math.pow(point.latitude - centerLat, 2) + 
      Math.pow(point.longitude - centerLng, 2)
    );
    maxRadius = Math.max(maxRadius, distance);
  });
  
  // Calculate spacing based on overlap
  const overlapFactor = (100 - overlap) / 100;
  const spacing = maxRadius * overlapFactor / 10;
  
  const waypoints = [];
  let radius = spacing;
  let angle = 0;
  
  while (radius <= maxRadius) {
    const lat = centerLat + radius * Math.cos(angle);
    const lng = centerLng + radius * Math.sin(angle);
    
    waypoints.push({
      latitude: lat,
      longitude: lng,
      altitude: altitude,
      action: 'waypoint',
      order: waypoints.length + 1
    });
    
    angle += spacing / radius;
    radius += spacing / (2 * Math.PI);
  }
  
  return waypoints;
};

// Helper function to optimize waypoint path
const optimizeWaypoints = (waypoints, startPoint, endPoint) => {
  // In a real application, you would use a more sophisticated algorithm
  // like nearest neighbor or a genetic algorithm to optimize the path
  
  // For now, we'll ensure we start and end at the given points
  const optimized = [...waypoints];
  
  // Find the waypoint closest to the start point
  let startIndex = 0;
  let minStartDistance = Number.MAX_VALUE;
  
  waypoints.forEach((waypoint, index) => {
    const distance = Math.sqrt(
      Math.pow(waypoint.latitude - startPoint.latitude, 2) + 
      Math.pow(waypoint.longitude - startPoint.longitude, 2)
    );
    
    if (distance < minStartDistance) {
      minStartDistance = distance;
      startIndex = index;
    }
  });
  
  // Find the waypoint closest to the end point
  let endIndex = 0;
  let minEndDistance = Number.MAX_VALUE;
  
  waypoints.forEach((waypoint, index) => {
    const distance = Math.sqrt(
      Math.pow(waypoint.latitude - endPoint.latitude, 2) + 
      Math.pow(waypoint.longitude - endPoint.longitude, 2)
    );
    
    if (distance < minEndDistance) {
      minEndDistance = distance;
      endIndex = index;
    }
  });
  
  // Reorder waypoints to start at startIndex and end at endIndex
  const result = [];
  
  // Add the actual start point
  result.push({
    latitude: startPoint.latitude,
    longitude: startPoint.longitude,
    altitude: waypoints[0].altitude,
    action: 'takeoff',
    order: 1
  });
  
  // Add waypoints from startIndex to endIndex
  if (startIndex <= endIndex) {
    for (let i = startIndex; i <= endIndex; i++) {
      result.push({
        ...waypoints[i],
        order: result.length + 1
      });
    }
  } else {
    // Handle case where we need to wrap around
    for (let i = startIndex; i < waypoints.length; i++) {
      result.push({
        ...waypoints[i],
        order: result.length + 1
      });
    }
    
    for (let i = 0; i <= endIndex; i++) {
      result.push({
        ...waypoints[i],
        order: result.length + 1
      });
    }
  }
  
  // Add the actual end point
  result.push({
    latitude: endPoint.latitude,
    longitude: endPoint.longitude,
    altitude: waypoints[0].altitude,
    action: 'land',
    order: result.length + 1
  });
  
  return result;
};