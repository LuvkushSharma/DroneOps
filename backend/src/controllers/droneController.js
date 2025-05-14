const Drone = require('../models/Drone');
const asyncHandler = require('../utils/asyncHandler');
const { emitDroneUpdate } = require('../utils/socketEvents');

/**
 * Get all drones
 * @route GET /api/drones
 */
exports.getDrones = asyncHandler(async (req, res) => {
  // Filter by optional query parameters
  const filter = {};
  
  if (req.query.status) {
    filter.status = req.query.status;
  }
  
  if (req.query.model) {
    filter.model = req.query.model;
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const drones = await Drone.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Drone.countDocuments(filter);

  res.json({
    drones,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    }
  });
});

/**
 * Get drone by ID
 * @route GET /api/drones/:id
 */
exports.getDroneById = asyncHandler(async (req, res) => {
  const drone = await Drone.findById(req.params.id);
  
  if (!drone) {
    return res.status(404).json({ message: 'Drone not found' });
  }

  res.json(drone);
});

/**
 * Create a new drone
 * @route POST /api/drones
 */
exports.createDrone = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      model,
      serialNumber,
      status,
      batteryLevel,
      organization,
      specifications,
      lastLocation,
      createdBy
    } = req.body;

    // Basic validation
    if (!name || !model || !serialNumber) {
      return res.status(400).json({ message: 'Name, model, and serial number are required' });
    }

    if (!organization) {
      return res.status(400).json({ message: 'Organization is required' });
    }

    // Check if serial number is unique
    const existingDrone = await Drone.findOne({ serialNumber });
    if (existingDrone) {
      return res.status(400).json({ message: 'A drone with this serial number already exists' });
    }


    // Create drone with properly structured data
    const drone = new Drone({
      name,
      model,
      serialNumber,
      // Make sure status is a valid enum value
      status: status || 'idle', // Default to 'idle' if not provided
      batteryLevel: batteryLevel || 100,
      organization, // Using the organization provided by the client
      specifications,
      lastLocation,
      // Use req.user.id instead of the client-provided createdBy
      createdBy: req.user.id,
      // Set default values for required fields
      homeLocation: lastLocation || {
        type: 'Point',
        coordinates: [0, 0]
      }
    });

    const savedDrone = await drone.save();
    res.status(201).json(savedDrone);
  } catch (error) {
    // Enhanced error handling
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      
      // Extract all validation errors
      for (let field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // For other errors, let the global error handler take over
    throw error;
  }
});


/**
 * Update drone details
 * @route PUT /api/drones/:id
 */
exports.updateDrone = asyncHandler(async (req, res) => {
  const drone = await Drone.findById(req.params.id);
  
  if (!drone) {
    return res.status(404).json({ message: 'Drone not found' });
  }

  // If serial number is being updated, check if it's unique
  if (req.body.serialNumber && req.body.serialNumber !== drone.serialNumber) {
    const existingDrone = await Drone.findOne({ serialNumber: req.body.serialNumber });
    if (existingDrone) {
      return res.status(400).json({ message: 'A drone with this serial number already exists' });
    }
  }

  // Update fields
  const updatedDrone = await Drone.findByIdAndUpdate(
    req.params.id,
    { 
      ...req.body,
      updatedBy: req.user.id,
      updatedAt: Date.now()
    },
    { new: true }
  );

  // Emit socket event for real-time updates
  emitDroneUpdate(updatedDrone._id.toString(), {
    name: updatedDrone.name,
    status: updatedDrone.status,
    batteryLevel: updatedDrone.batteryLevel
  });

  res.json(updatedDrone);
});

/**
 * Delete a drone
 * @route DELETE /api/drones/:id
 */
exports.deleteDrone = asyncHandler(async (req, res) => {
  const drone = await Drone.findById(req.params.id);
  
  if (!drone) {
    return res.status(404).json({ message: 'Drone not found' });
  }

  // Check if drone is currently in use or flying
  if (drone.status === 'flying' || drone.status === 'in-mission') {
    return res.status(400).json({ 
      message: 'Cannot delete a drone that is currently flying or in a mission' 
    });
  }

  await drone.remove();
  res.json({ message: 'Drone deleted successfully' });
});

/**
 * Update drone status
 * @route PATCH /api/drones/:id/status
 */
exports.updateDroneStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  if (!status || !['available', 'maintenance', 'flying', 'in-mission', 'offline'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const drone = await Drone.findById(req.params.id);
  
  if (!drone) {
    return res.status(404).json({ message: 'Drone not found' });
  }

  // Update drone status
  drone.status = status;
  drone.updatedAt = Date.now();
  drone.updatedBy = req.user.id;
  
  // If drone is going to maintenance, update lastMaintenanceDate
  if (status === 'maintenance') {
    drone.lastMaintenanceDate = Date.now();
  }

  await drone.save();

  // Emit socket event
  emitDroneUpdate(drone._id.toString(), {
    status: drone.status
  });

  res.json({ 
    message: 'Drone status updated successfully',
    drone: {
      _id: drone._id,
      name: drone.name,
      status: drone.status
    }
  });
});

/**
 * Update drone battery level
 * @route PATCH /api/drones/:id/battery
 */
exports.updateDroneBattery = asyncHandler(async (req, res) => {
  const { batteryLevel } = req.body;
  
  if (batteryLevel === undefined || batteryLevel < 0 || batteryLevel > 100) {
    return res.status(400).json({ message: 'Invalid battery level (0-100)' });
  }

  const drone = await Drone.findById(req.params.id);
  
  if (!drone) {
    return res.status(404).json({ message: 'Drone not found' });
  }

  // Update battery level
  drone.batteryLevel = batteryLevel;
  drone.updatedAt = Date.now();
  
  await drone.save();

  // Emit socket event
  emitDroneUpdate(drone._id.toString(), {
    batteryLevel: drone.batteryLevel
  });

  res.json({ 
    message: 'Drone battery level updated successfully',
    drone: {
      _id: drone._id,
      name: drone.name,
      batteryLevel: drone.batteryLevel
    }
  });
});

/**
 * Get drone telemetry
 * @route GET /api/drones/:id/telemetry
 */
exports.getDroneTelemetry = asyncHandler(async (req, res) => {
  const drone = await Drone.findById(req.params.id);
  
  if (!drone) {
    return res.status(404).json({ message: 'Drone not found' });
  }

  // In a real application, this would fetch real-time telemetry data
  // For this mock, we'll just return some static/random data
  const telemetry = {
    altitude: Math.floor(Math.random() * 100) + 50, // 50-150m
    speed: Math.floor(Math.random() * 15) + 5, // 5-20m/s
    heading: Math.floor(Math.random() * 360), // 0-359 degrees
    latitude: drone.lastKnownLocation?.latitude || 0,
    longitude: drone.lastKnownLocation?.longitude || 0,
    batteryLevel: drone.batteryLevel,
    signalStrength: Math.floor(Math.random() * 40) + 60, // 60-100%
    timestamp: new Date()
  };

  res.json(telemetry);
});

/**
 * Update drone maintenance record
 * @route POST /api/drones/:id/maintenance
 */
exports.addMaintenanceRecord = asyncHandler(async (req, res) => {
  const { type, description, parts, technician } = req.body;
  
  if (!type || !description) {
    return res.status(400).json({ message: 'Maintenance type and description are required' });
  }

  const drone = await Drone.findById(req.params.id);
  
  if (!drone) {
    return res.status(404).json({ message: 'Drone not found' });
  }

  // Create maintenance record
  const maintenanceRecord = {
    type,
    description,
    parts: parts || [],
    technician: technician || req.user.name,
    date: Date.now(),
    performedBy: req.user.id
  };

  // Add to maintenance history
  drone.maintenanceHistory = drone.maintenanceHistory || [];
  drone.maintenanceHistory.push(maintenanceRecord);
  
  // Update last maintenance date
  drone.lastMaintenanceDate = Date.now();
  
  // If drone was in maintenance, set status to available
  if (drone.status === 'maintenance') {
    drone.status = 'available';
  }

  await drone.save();

  res.status(201).json({
    message: 'Maintenance record added successfully',
    maintenanceRecord,
    lastMaintenanceDate: drone.lastMaintenanceDate,
    status: drone.status
  });
});

/**
 * Get drone statistics
 * @route GET /api/drones/:id/statistics
 */
exports.getDroneStatistics = asyncHandler(async (req, res) => {
  const drone = await Drone.findById(req.params.id);
  
  if (!drone) {
    return res.status(404).json({ message: 'Drone not found' });
  }

  // Calculate statistics based on drone history
  // In a real app, this would be a more comprehensive calculation
  const totalFlights = drone.flightHistory?.length || 0;
  const totalFlightTime = drone.flightHistory?.reduce((sum, flight) => {
    return sum + ((flight.endTime - flight.startTime) / (1000 * 60)) || 0;
  }, 0) || 0;
  
  const avgFlightTime = totalFlights > 0 ? totalFlightTime / totalFlights : 0;
  
  // Last 5 flights
  const recentFlights = drone.flightHistory?.slice(-5) || [];

  const statistics = {
    totalFlights,
    totalFlightTime: Math.round(totalFlightTime * 10) / 10, // Round to 1 decimal
    avgFlightTime: Math.round(avgFlightTime * 10) / 10,
    batteryHealth: drone.batteryHealth || 100,
    lastMaintenanceDate: drone.lastMaintenanceDate,
    recentFlights
  };

  res.json(statistics);
});