const mongoose = require('mongoose');

const MaintenanceRecordSchema = new mongoose.Schema({
  drone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drone',
    required: true
  },
  type: {
    type: String,
    enum: ['routine', 'repair', 'upgrade', 'inspection', 'calibration'],
    required: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  parts: [{
    name: String,
    serialNumber: String,
    replaced: Boolean
  }],
  notes: String,
  flightTimeAtMaintenance: Number, // in minutes
  batteryHealth: {
    capacityPercentage: Number, // percentage of original capacity
    cycleCount: Number
  },
  photos: [String], // URLs to photos
  nextMaintenanceDue: {
    date: Date,
    flightHours: Number // hours until next maintenance
  },
  cost: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
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

// Update the updatedAt field before saving
MaintenanceRecordSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('MaintenanceRecord', MaintenanceRecordSchema);