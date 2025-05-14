const mongoose = require('mongoose');

const WaypointSchema = new mongoose.Schema({
  mission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission',
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  altitude: {
    type: Number, // in meters
    required: true
  },
  speed: {
    type: Number, // in m/s
  },
  action: {
    type: String,
    enum: ['flyTo', 'hover', 'takePhoto', 'recordVideo', 'landNow'],
    default: 'flyTo'
  },
  actionParams: {
    duration: Number, // in seconds, for hover
    photoMode: String, // for takePhoto
    videoLength: Number, // in seconds, for recordVideo
  },
  reached: {
    type: Boolean,
    default: false
  },
  timeReached: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index location for geospatial queries
WaypointSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Waypoint', WaypointSchema);