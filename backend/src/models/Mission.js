const mongoose = require('mongoose');

const MissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a mission name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  drone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drone',
    required: [true, 'Please assign a drone to this mission']
  },
  survey: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey'
  },
  status: {
    type: String,
    enum: ['planned', 'in-progress', 'completed', 'paused', 'aborted', 'failed'],
    default: 'planned'
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  estimatedDuration: {
    type: Number // in minutes
  },
  pattern: {
    type: String,
    enum: ['grid', 'crosshatch', 'perimeter', 'spiral', 'custom'],
    default: 'grid'
  },
  waypoints: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Waypoint'
  }],
  altitude: {
    type: Number, // in meters
    required: [true, 'Please specify flight altitude']
  },
  speed: {
    type: Number, // in m/s
    required: [true, 'Please specify flight speed']
  },
  overlap: {
    type: Number, // percentage
    default: 75
  },
  gsd: {
    type: Number, // Ground sampling distance in cm/pixel
    default: 2.5
  },
  boundingBox: {
    type: {
      type: String,
      enum: ['Polygon'],
      default: 'Polygon'
    },
    coordinates: {
      type: [[[Number]]] // Array of arrays of [longitude, latitude] pairs
    }
  },
  progress: {
    type: Number, // percentage
    default: 0
  },
  currentWaypointIndex: {
    type: Number,
    default: 0
  },
  telemetry: {
    altitude: Number, // in meters
    speed: Number, // in m/s
    signalStrength: Number, // in percentage
    batteryLevel: Number // in percentage
  },
  statistics: {
    distance: Number, // in km
    images: Number, // count
    areaCovered: Number, // in sq. km
    batteryUsed: Number // in percentage
  },
  environmentalConditions: {
    temperature: Number, // in Celsius
    humidity: Number, // in percentage
    wind: Number, // in km/h
    visibility: Number // in km
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: String,
    required: [true, 'Please provide an organization']
  }
});

// Update the updatedAt field before saving
MissionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index bounding box for geospatial queries
MissionSchema.index({ boundingBox: '2dsphere' });

module.exports = mongoose.model('Mission', MissionSchema);