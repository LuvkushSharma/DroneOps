const mongoose = require('mongoose');

const FlightLogSchema = new mongoose.Schema({
  drone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drone',
    required: true
  },
  mission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission'
  },
  survey: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey'
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
  },
  duration: {
    type: Number, // in minutes
  },
  status: {
    type: String,
    enum: ['completed', 'aborted', 'failed', 'in-progress'],
    default: 'in-progress'
  },
  startBatteryLevel: {
    type: Number, // percentage
    required: true
  },
  endBatteryLevel: {
    type: Number // percentage
  },
  batteryUsed: {
    type: Number // percentage
  },
  distanceTraveled: {
    type: Number, // in meters
  },
  maxAltitude: {
    type: Number, // in meters
  },
  maxSpeed: {
    type: Number, // in m/s
  },
  environmentalConditions: {
    temperature: Number, // in Celsius
    humidity: Number, // in percentage
    wind: Number, // in km/h
    visibility: Number // in km
  },
  waypoints: {
    planned: Number,
    reached: Number
  },
  errors: [{
    time: Date,
    code: String,
    message: String,
    severity: {
      type: String,
      enum: ['info', 'warning', 'error', 'critical']
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  organization: {
    type: String,
    required: [true, 'Please provide an organization']
  }
});

module.exports = mongoose.model('FlightLog', FlightLogSchema);