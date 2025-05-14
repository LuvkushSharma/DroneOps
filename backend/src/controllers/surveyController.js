const Survey = require('../models/Survey');
const Mission = require('../models/Mission');
const { emitSurveyUpdate } = require('../utils/socketEvents');

/**
 * Get all surveys
 * @route GET /api/surveys
 */
exports.getSurveys = async (req, res) => {
  try {
    // Filter by optional query parameters
    const filter = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.createdBy) {
      filter.createdBy = req.query.createdBy;
    }

    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      filter.startDate = { $gte: new Date(req.query.startDate) };
      filter.endDate = { $lte: new Date(req.query.endDate) };
    }

    // Tags filter (array of strings)
    if (req.query.tag) {
      filter.tags = { $in: [req.query.tag] };
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const surveys = await Survey.find(filter)
      .populate('createdBy', 'name email')
      .populate('site', 'name location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Survey.countDocuments(filter);

    res.json({
      surveys,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching surveys:', error);
    res.status(500).json({ message: 'Failed to fetch surveys' });
  }
};

/**
 * Get survey by ID
 * @route GET /api/surveys/:id
 */
exports.getSurveyById = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('site', 'name location')
      .populate({
        path: 'missions',
        select: 'name status progress startTime endTime drone pattern',
        populate: {
          path: 'drone',
          select: 'name model'
        }
      });

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    res.json(survey);
  } catch (error) {
    console.error('Error fetching survey:', error);
    res.status(500).json({ message: 'Failed to fetch survey details' });
  }
};

/**
 * Create a new survey
 * @route POST /api/surveys
 */
exports.createSurvey = async (req, res) => {
  try {
    const {
      name,
      description,
      startDate,
      endDate,
      frequency,
      site,
      objectives,
      tags
    } = req.body;

    // Validate dates
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: 'Start date cannot be after end date' });
    }

    const newSurvey = new Survey({
      name,
      description,
      startDate,
      endDate,
      frequency: frequency || 'one-time',
      site,
      objectives,
      tags,
      status: 'planned',
      createdBy: req.user.id,
      missions: []
    });

    const survey = await newSurvey.save();
    res.status(201).json(survey);
  } catch (error) {
    console.error('Error creating survey:', error);
    res.status(500).json({ message: 'Failed to create survey' });
  }
};

/**
 * Update survey details
 * @route PUT /api/surveys/:id
 */
exports.updateSurvey = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    // Check if dates are valid if provided
    if (req.body.startDate && req.body.endDate) {
      if (new Date(req.body.startDate) > new Date(req.body.endDate)) {
        return res.status(400).json({ message: 'Start date cannot be after end date' });
      }
    } else if (req.body.startDate && !req.body.endDate) {
      if (new Date(req.body.startDate) > new Date(survey.endDate)) {
        return res.status(400).json({ message: 'Start date cannot be after end date' });
      }
    } else if (!req.body.startDate && req.body.endDate) {
      if (new Date(survey.startDate) > new Date(req.body.endDate)) {
        return res.status(400).json({ message: 'Start date cannot be after end date' });
      }
    }

    const updatedSurvey = await Survey.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body,
        updatedBy: req.user.id,
        updatedAt: Date.now()
      },
      { new: true }
    );

    // Emit socket event
    emitSurveyUpdate(updatedSurvey._id.toString(), {
      name: updatedSurvey.name,
      status: updatedSurvey.status,
      updatedAt: updatedSurvey.updatedAt
    });

    res.json(updatedSurvey);
  } catch (error) {
    console.error('Error updating survey:', error);
    res.status(500).json({ message: 'Failed to update survey' });
  }
};

/**
 * Delete a survey
 * @route DELETE /api/surveys/:id
 */
exports.deleteSurvey = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    // Check if there are active missions
    const activeMissions = await Mission.find({
      survey: survey._id,
      status: { $in: ['in-progress', 'paused'] }
    });

    if (activeMissions.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete survey with active missions. Abort or complete all missions first.' 
      });
    }

    // Remove all missions associated with this survey
    await Mission.deleteMany({ survey: survey._id });

    // Delete the survey
    await survey.deleteOne();
    res.json({ message: 'Survey deleted successfully' });
  } catch (error) {
    console.error('Error deleting survey:', error);
    res.status(500).json({ message: 'Failed to delete survey' });
  }
};

/**
 * Update survey status
 * @route PATCH /api/surveys/:id/status
 */
exports.updateSurveyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['planned', 'in-progress', 'completed', 'archived'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const survey = await Survey.findById(req.params.id);
    
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    // Update survey status
    survey.status = status;
    survey.updatedAt = Date.now();
    survey.updatedBy = req.user.id;

    if (status === 'completed') {
      survey.completedAt = Date.now();
    }

    await survey.save();

    // Emit socket event
    emitSurveyUpdate(survey._id.toString(), {
      status: survey.status,
      completedAt: survey.completedAt
    });

    res.json({ 
      message: 'Survey status updated successfully',
      survey: {
        _id: survey._id,
        status: survey.status,
        completedAt: survey.completedAt
      }
    });
  } catch (error) {
    console.error('Error updating survey status:', error);
    res.status(500).json({ message: 'Failed to update survey status' });
  }
};

/**
 * Add mission to survey
 * @route POST /api/surveys/:id/missions
 */
exports.addMissionToSurvey = async (req, res) => {
  try {
    const { missionId } = req.body;
    
    if (!missionId) {
      return res.status(400).json({ message: 'Mission ID is required' });
    }

    const survey = await Survey.findById(req.params.id);
    
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    const mission = await Mission.findById(missionId);
    
    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }

    // Check if mission is already in the survey
    if (survey.missions.includes(missionId)) {
      return res.status(400).json({ message: 'Mission is already part of this survey' });
    }

    // Add mission to survey
    survey.missions.push(missionId);
    await survey.save();

    // Update mission with survey reference
    mission.survey = survey._id;
    await mission.save();

    res.json({ 
      message: 'Mission added to survey successfully',
      missionId: mission._id,
      surveyId: survey._id
    });
  } catch (error) {
    console.error('Error adding mission to survey:', error);
    res.status(500).json({ message: 'Failed to add mission to survey' });
  }
};

/**
 * Remove mission from survey
 * @route DELETE /api/surveys/:id/missions/:missionId
 */
exports.removeMissionFromSurvey = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    const mission = await Mission.findById(req.params.missionId);
    
    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }

    // Check if mission is part of the survey
    if (!survey.missions.includes(req.params.missionId)) {
      return res.status(400).json({ message: 'Mission is not part of this survey' });
    }

    // Remove mission from survey
    survey.missions = survey.missions.filter(
      mission => mission.toString() !== req.params.missionId
    );
    await survey.save();

    // Remove survey reference from mission
    mission.survey = null;
    await mission.save();

    res.json({ 
      message: 'Mission removed from survey successfully',
      missionId: mission._id,
      surveyId: survey._id
    });
  } catch (error) {
    console.error('Error removing mission from survey:', error);
    res.status(500).json({ message: 'Failed to remove mission from survey' });
  }
};

/**
 * Get survey analytics
 * @route GET /api/surveys/:id/analytics
 */
exports.getSurveyAnalytics = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    // Get all missions for this survey
    const missions = await Mission.find({ survey: survey._id });
    
    // Calculate analytics
    const missionStatusCount = {
      completed: 0,
      'in-progress': 0,
      planned: 0,
      paused: 0,
      aborted: 0,
      failed: 0
    };

    let totalFlightTime = 0;
    let totalDistance = 0;
    let totalArea = 0;
    let completedMissions = 0;
    let flightTimeByDay = {};
    let batteryUsage = {};

    missions.forEach(mission => {
      // Count by status
      if (missionStatusCount.hasOwnProperty(mission.status)) {
        missionStatusCount[mission.status]++;
      }

      // Calculate flight times and other metrics for completed missions
      if (mission.status === 'completed' && mission.actualStartTime && mission.completedAt) {
        completedMissions++;
        
        // Calculate flight time
        const flightTime = (new Date(mission.completedAt) - new Date(mission.actualStartTime)) / (1000 * 60); // in minutes
        totalFlightTime += flightTime;

        // Group by day for flight time chart
        const flightDay = new Date(mission.actualStartTime).toLocaleDateString();
        flightTimeByDay[flightDay] = (flightTimeByDay[flightDay] || 0) + flightTime;
        
        // Calculate area and distance if available
        if (mission.statistics) {
          if (mission.statistics.distance) {
            totalDistance += mission.statistics.distance;
          }
          if (mission.statistics.areaCovered) {
            totalArea += mission.statistics.areaCovered;
          }
        }

        // Battery usage tracking
        if (mission.batteryUsage) {
          const missionDay = new Date(mission.actualStartTime).toLocaleDateString();
          batteryUsage[missionDay] = (batteryUsage[missionDay] || 0) + mission.batteryUsage;
        }
      }
    });

    // Calculate overall completion percentage
    const totalMissions = missions.length;
    const completionPercentage = totalMissions > 0 
      ? Math.round((completedMissions / totalMissions) * 100) 
      : 0;

    res.json({
      survey: {
        _id: survey._id,
        name: survey.name,
        status: survey.status,
        startDate: survey.startDate,
        endDate: survey.endDate
      },
      analytics: {
        missionStatusCount,
        totalMissions,
        completedMissions,
        completionPercentage,
        totalFlightTime: parseFloat(totalFlightTime.toFixed(2)),
        totalDistance: parseFloat(totalDistance.toFixed(2)),
        totalArea: parseFloat(totalArea.toFixed(2)),
        flightTimeByDay,
        batteryUsage
      }
    });
  } catch (error) {
    console.error('Error getting survey analytics:', error);
    res.status(500).json({ message: 'Failed to retrieve survey analytics' });
  }
};

/**
 * Generate survey report
 * @route GET /api/surveys/:id/report
 */
exports.generateSurveyReport = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('site', 'name location')
      .populate({
        path: 'missions',
        populate: {
          path: 'drone',
          select: 'name model'
        }
      });
    
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    // Calculate statistics
    let totalFlightTime = 0;
    let totalDistance = 0;
    let totalArea = 0;
    let completedMissions = 0;

    survey.missions.forEach(mission => {
      if (mission.status === 'completed') {
        completedMissions++;
        
        if (mission.actualStartTime && mission.completedAt) {
          totalFlightTime += 
            (new Date(mission.completedAt) - new Date(mission.actualStartTime)) / (1000 * 60);
        }
        
        if (mission.statistics) {
          if (mission.statistics.distance) {
            totalDistance += mission.statistics.distance;
          }
          if (mission.statistics.areaCovered) {
            totalArea += mission.statistics.areaCovered;
          }
        }
      }
    });

    // Format dates
    const formattedStartDate = new Date(survey.startDate).toLocaleDateString();
    const formattedEndDate = new Date(survey.endDate).toLocaleDateString();
    const formattedCreatedAt = new Date(survey.createdAt).toLocaleDateString();

    // Generate report data
    const reportData = {
      survey: {
        name: survey.name,
        description: survey.description,
        status: survey.status,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        createdAt: formattedCreatedAt,
        frequency: survey.frequency,
        objectives: survey.objectives,
        tags: survey.tags
      },
      site: survey.site ? {
        name: survey.site.name,
        location: survey.site.location
      } : null,
      creator: survey.createdBy ? {
        name: survey.createdBy.name,
        email: survey.createdBy.email
      } : null,
      statistics: {
        totalMissions: survey.missions.length,
        completedMissions,
        progressPercentage: survey.missions.length > 0 
          ? Math.round((completedMissions / survey.missions.length) * 100) 
          : 0,
        totalFlightTime: parseFloat(totalFlightTime.toFixed(2)),
        totalDistance: parseFloat(totalDistance.toFixed(2)),
        totalArea: parseFloat(totalArea.toFixed(2))
      },
      missions: survey.missions.map(mission => ({
        name: mission.name,
        status: mission.status,
        drone: mission.drone ? mission.drone.name : 'N/A',
        startTime: mission.actualStartTime ? new Date(mission.actualStartTime).toLocaleString() : 'N/A',
        endTime: mission.completedAt ? new Date(mission.completedAt).toLocaleString() : 'N/A',
        pattern: mission.pattern || 'N/A',
        flightTime: mission.actualStartTime && mission.completedAt 
          ? ((new Date(mission.completedAt) - new Date(mission.actualStartTime)) / (1000 * 60)).toFixed(1) 
          : 'N/A',
        statistics: mission.statistics || {}
      }))
    };

    // Return report data
    res.json(reportData);
  } catch (error) {
    console.error('Error generating survey report:', error);
    res.status(500).json({ message: 'Failed to generate survey report' });
  }
};

/**
 * Get survey statistics
 * @route GET /api/surveys/statistics
 */
exports.getSurveyStatistics = async (req, res) => {
  try {
    // Count surveys by status
    const statusCounts = await Survey.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Format status counts into an object
    const surveysByStatus = statusCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // Get total survey count
    const totalSurveys = await Survey.countDocuments();

    // Get recent surveys (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSurveys = await Survey.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get surveys by month (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1); // First day of month
    
    const surveysByMonth = await Survey.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Format month data for chart
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const formattedMonthlyData = {};
    
    // Initialize all months with zero
    for (let i = 0; i < 12; i++) {
      const date = new Date(twelveMonthsAgo);
      date.setMonth(twelveMonthsAgo.getMonth() + i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // JavaScript months are 0-indexed
      const key = `${year}-${month}`;
      const label = `${monthNames[month-1]} ${year}`;
      formattedMonthlyData[label] = 0;
    }
    
    // Fill in actual data
    surveysByMonth.forEach(item => {
      const year = item._id.year;
      const month = item._id.month;
      const label = `${monthNames[month-1]} ${year}`;
      formattedMonthlyData[label] = item.count;
    });

    res.json({
      total: totalSurveys,
      recent: recentSurveys,
      byStatus: surveysByStatus,
      byMonth: formattedMonthlyData
    });
  } catch (error) {
    console.error('Error getting survey statistics:', error);
    res.status(500).json({ message: 'Failed to retrieve survey statistics' });
  }
};

/**
 * Clone a survey
 * @route POST /api/surveys/:id/clone
 */
exports.cloneSurvey = async (req, res) => {
  try {
    const sourceSurvey = await Survey.findById(req.params.id);
    
    if (!sourceSurvey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    // Create new survey object with data from the original
    const newSurvey = new Survey({
      name: `${sourceSurvey.name} (Copy)`,
      description: sourceSurvey.description,
      startDate: req.body.startDate || sourceSurvey.startDate,
      endDate: req.body.endDate || sourceSurvey.endDate,
      frequency: sourceSurvey.frequency,
      site: sourceSurvey.site,
      objectives: sourceSurvey.objectives,
      tags: sourceSurvey.tags,
      status: 'planned',
      createdBy: req.user.id,
      missions: [] // Start with empty missions array
    });

    const savedSurvey = await newSurvey.save();

    // Clone missions if requested
    if (req.body.cloneMissions === true) {
      const sourceMissions = await Mission.find({ survey: sourceSurvey._id });
      
      const clonedMissionPromises = sourceMissions.map(async (mission) => {
        const newMission = new Mission({
          name: `${mission.name} (Copy)`,
          description: mission.description,
          pattern: mission.pattern,
          waypoints: mission.waypoints,
          altitude: mission.altitude,
          speed: mission.speed,
          overlap: mission.overlap,
          gsd: mission.gsd,
          survey: savedSurvey._id,
          status: 'planned',
          createdBy: req.user.id
        });
        
        const savedMission = await newMission.save();
        return savedMission._id;
      });
      
      const missionIds = await Promise.all(clonedMissionPromises);
      
      // Update survey with cloned mission IDs
      savedSurvey.missions = missionIds;
      await savedSurvey.save();
    }

    res.status(201).json({
      message: 'Survey cloned successfully',
      survey: savedSurvey
    });
  } catch (error) {
    console.error('Error cloning survey:', error);
    res.status(500).json({ message: 'Failed to clone survey' });
  }
};