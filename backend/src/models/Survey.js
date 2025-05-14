const mongoose = require('mongoose');

const SurveySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a survey name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  site: {
    name: {
      type: String,
      required: [true, 'Please provide a site name']
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
    area: {
      type: Number, // in square meters
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },
  type: {
    type: String,
    enum: ['inspection', 'mapping', 'security', 'monitoring', 'custom'],
    required: [true, 'Please specify the survey type']
  },
  status: {
    type: String,
    enum: ['planned', 'in-progress', 'completed', 'archived'],
    default: 'planned'
  },
  missions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission'
  }],
  frequency: {
    type: String,
    enum: ['once', 'daily', 'weekly', 'monthly', 'quarterly', 'custom'],
    default: 'once'
  },
  customFrequency: {
    days: [Number], // days of week (0-6, where 0 is Sunday)
    hours: [Number], // hours of day (0-23)
  },
  startDate: {
    type: Date,
    required: [true, 'Please specify a start date']
  },
  endDate: {
    type: Date
  },
  lastRun: {
    date: Date,
    missionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mission'
    },
    status: {
      type: String,
      enum: ['successful', 'partial', 'failed']
    }
  },
  nextRun: {
    date: Date,
    scheduled: Boolean
  },
  parameters: {
    altitude: Number, // in meters
    speed: Number, // in m/s
    overlap: Number, // percentage
    gsd: Number // Ground sampling distance in cm/pixel
  },
  statistics: {
    totalMissions: {
      type: Number,
      default: 0
    },
    successfulMissions: {
      type: Number,
      default: 0
    },
    totalFlightTime: {
      type: Number, // in minutes
      default: 0
    },
    totalDistance: {
      type: Number, // in km
      default: 0
    },
    totalAreaCovered: {
      type: Number, // in sq. km
      default: 0
    }
  },
  tags: [String],
  organization: {
    type: String,
    required: [true, 'Please provide an organization']
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
  }
});

// Update the updatedAt field before saving
SurveySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index site location for geospatial queries
SurveySchema.index({ 'site.location': '2dsphere' });

module.exports = mongoose.model('Survey', SurveySchema);