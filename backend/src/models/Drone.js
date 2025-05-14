const mongoose = require('mongoose');

const DroneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a drone name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  model: {
    type: String,
    required: [true, 'Please provide a drone model'],
    trim: true
  },
  serialNumber: {
    type: String,
    required: [true, 'Please provide a serial number'],
    unique: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'flying', 'idle', 'charging', 'error', 'offline'],
    default: 'idle'
  },
  batteryLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  lastMission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission'
  },
  lastLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0] // [longitude, latitude]
    }
  },
  homeLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0] // [longitude, latitude]
    }
  },
  specifications: {
    maxFlightTime: Number, // in minutes
    maxSpeed: Number, // in m/s
    maxAltitude: Number, // in meters
    maxRange: Number, // in meters
    maxWindResistance: Number, // in m/s
    weight: Number, // in kg
    dimensions: {
      length: Number, // in cm
      width: Number,  // in cm
      height: Number  // in cm
    },
    batteryCapacity: Number, // in mAh
    camera: {
      model: String,
      resolution: String,
      fov: Number // Field of view in degrees
    }
  },
  telemetry: {
    signalStrength: Number, // in percentage
    temperature: Number, // in Celsius
    humidity: Number, // in percentage
    pressure: Number // in hPa
  },
  totalFlightTime: {
    type: Number,
    default: 0 // in minutes
  },
  totalFlights: {
    type: Number,
    default: 0
  },
  lastMaintenanceDate: {
    type: Date,
    default: Date.now
  },
  nextMaintenanceDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  organization: {
    type: String,
    required: [true, 'Please provide an organization']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

// Index location fields for geospatial queries
DroneSchema.index({ lastLocation: '2dsphere' });
DroneSchema.index({ homeLocation: '2dsphere' });

// Update the updatedAt field before saving
DroneSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Drone', DroneSchema);