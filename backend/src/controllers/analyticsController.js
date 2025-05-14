const Mission = require('../models/Mission');
const Survey = require('../models/Survey');
const Drone = require('../models/Drone');
const User = require('../models/User');

/**
 * Get dashboard analytics summary
 * @route GET /api/analytics/dashboard
 */
exports.getDashboardAnalytics = async (req, res) => {
  try {
    // Get counts
    const dronesCount = await Drone.countDocuments();
    const surveysCount = await Survey.countDocuments();
    const missionsCount = await Mission.countDocuments();
    const usersCount = await User.countDocuments();
    
    // Get active drones (status is 'active' or 'flying')
    const activeDronesCount = await Drone.countDocuments({
      status: { $in: ['active', 'flying'] }
    });
    
    // Get missions by status
    const missionStatusCounts = await Mission.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    // Format mission status counts
    const missionsByStatus = missionStatusCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});
    
    // Get missions created in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentMissionsCount = await Mission.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Get mission success rate
    const completedMissionsCount = await Mission.countDocuments({ status: 'completed' });
    const failedMissionsCount = await Mission.countDocuments({ status: 'failed' });
    const abortedMissionsCount = await Mission.countDocuments({ status: 'aborted' });
    
    const totalFinishedMissions = completedMissionsCount + failedMissionsCount + abortedMissionsCount;
    const successRate = totalFinishedMissions > 0
      ? Math.round((completedMissionsCount / totalFinishedMissions) * 100)
      : 0;
    
    // Get surveys by status
    const surveyStatusCounts = await Survey.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    // Format survey status counts
    const surveysByStatus = surveyStatusCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});
    
    // Get recently completed missions
    const recentCompletedMissions = await Mission.find({ status: 'completed' })
      .sort({ completedAt: -1 })
      .limit(5)
      .populate('drone', 'name model')
      .select('name drone completedAt statistics');
    
    // Get missions per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    
    const missionsPerDay = await Mission.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    
    // Format daily mission data for the last 7 days
    const dailyMissionData = {};
    
    // Initialize all days with zero
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(sevenDaysAgo.getDate() + i);
      const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
      dailyMissionData[formattedDate] = 0;
    }
    
    // Fill in actual data
    missionsPerDay.forEach(item => {
      dailyMissionData[item._id] = item.count;
    });
    
    // Get total flight time (in minutes)
    const flightTimeResult = await Mission.aggregate([
      {
        $match: {
          status: 'completed',
          actualStartTime: { $exists: true },
          completedAt: { $exists: true }
        }
      },
      {
        $project: {
          flightTimeMinutes: {
            $divide: [
              { $subtract: ["$completedAt", "$actualStartTime"] },
              60000 // Convert ms to minutes
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          totalFlightTime: { $sum: "$flightTimeMinutes" }
        }
      }
    ]);
    
    const totalFlightTimeMinutes = flightTimeResult.length > 0
      ? Math.round(flightTimeResult[0].totalFlightTime)
      : 0;
    
    // Get total distance covered (in km)
    const distanceResult = await Mission.aggregate([
      {
        $match: {
          status: 'completed',
          'statistics.distance': { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          totalDistance: { $sum: "$statistics.distance" }
        }
      }
    ]);
    
    const totalDistanceKm = distanceResult.length > 0
      ? Math.round(distanceResult[0].totalDistance * 10) / 10 // Round to 1 decimal place
      : 0;
    
    // Get total area covered (in sq km)
    const areaResult = await Mission.aggregate([
      {
        $match: {
          status: 'completed',
          'statistics.areaCovered': { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          totalArea: { $sum: "$statistics.areaCovered" }
        }
      }
    ]);
    
    const totalAreaSqKm = areaResult.length > 0
      ? Math.round(areaResult[0].totalArea * 100) / 100 // Round to 2 decimal places
      : 0;
    
    res.json({
      counts: {
        drones: dronesCount,
        activeDrones: activeDronesCount,
        missions: missionsCount,
        surveys: surveysCount,
        users: usersCount,
        recentMissions: recentMissionsCount
      },
      missionStats: {
        byStatus: missionsByStatus,
        successRate: successRate,
        totalCompleted: completedMissionsCount,
        totalFailed: failedMissionsCount,
        totalAborted: abortedMissionsCount
      },
      surveyStats: {
        byStatus: surveysByStatus
      },
      flightStats: {
        totalFlightTime: totalFlightTimeMinutes,
        totalDistance: totalDistanceKm,
        totalArea: totalAreaSqKm
      },
      dailyMissions: dailyMissionData,
      recentCompletedMissions: recentCompletedMissions
    });
  } catch (error) {
    console.error('Error getting dashboard analytics:', error);
    res.status(500).json({ message: 'Failed to retrieve dashboard analytics' });
  }
};

/**
 * Get mission analytics 
 * @route GET /api/analytics/missions
 */
exports.getMissionAnalytics = async (req, res) => {
  try {
    // Get missions by pattern type
    const patternData = await Mission.aggregate([
      { $group: { _id: "$pattern", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get average mission duration by drone model
    const durationByDroneModel = await Mission.aggregate([
      {
        $match: {
          status: 'completed',
          actualStartTime: { $exists: true },
          completedAt: { $exists: true }
        }
      },
      {
        $lookup: {
          from: 'drones',
          localField: 'drone',
          foreignField: '_id',
          as: 'droneInfo'
        }
      },
      {
        $unwind: '$droneInfo'
      },
      {
        $group: {
          _id: '$droneInfo.model',
          avgDurationMinutes: {
            $avg: {
              $divide: [
                { $subtract: ["$completedAt", "$actualStartTime"] },
                60000 // Convert ms to minutes
              ]
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get missions by month
    const monthlyMissions = await Mission.aggregate([
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

    // Format monthly data
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const formattedMonthlyData = monthlyMissions.map(item => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      count: item.count
    }));

    // Get average altitude and speed
    const avgStats = await Mission.aggregate([
      {
        $match: {
          altitude: { $exists: true, $ne: null },
          speed: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          avgAltitude: { $avg: "$altitude" },
          avgSpeed: { $avg: "$speed" }
        }
      }
    ]);

    const averages = avgStats.length > 0 ? {
      altitude: Math.round(avgStats[0].avgAltitude * 10) / 10,
      speed: Math.round(avgStats[0].avgSpeed * 10) / 10
    } : { altitude: 0, speed: 0 };

    // Get successful vs failed missions over time (by month)
    const missionStatusByMonth = await Mission.aggregate([
      {
        $match: {
          status: { $in: ['completed', 'failed', 'aborted'] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            status: "$status"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.status": 1 } }
    ]);

    // Format status by month data
    const statusByMonth = {};
    
    missionStatusByMonth.forEach(item => {
      const monthKey = `${monthNames[item._id.month - 1]} ${item._id.year}`;
      
      if (!statusByMonth[monthKey]) {
        statusByMonth[monthKey] = {
          completed: 0,
          failed: 0,
          aborted: 0
        };
      }
      
      statusByMonth[monthKey][item._id.status] = item.count;
    });

    // Get flight time distribution (bucketed)
    const flightTimeDistribution = await Mission.aggregate([
      {
        $match: {
          status: 'completed',
          actualStartTime: { $exists: true },
          completedAt: { $exists: true }
        }
      },
      {
        $project: {
          durationMinutes: {
            $divide: [
              { $subtract: ["$completedAt", "$actualStartTime"] },
              60000 // Convert ms to minutes
            ]
          }
        }
      },
      {
        $bucket: {
          groupBy: "$durationMinutes",
          boundaries: [0, 5, 10, 15, 20, 30, 45, 60, 90, 120, Infinity],
          default: "Other",
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    // Format flight time distribution
    const formattedFlightTimeDistribution = flightTimeDistribution.map(bucket => {
      let label;
      
      if (bucket._id === "Other") {
        label = "Other";
      } else if (bucket._id === 120) {
        label = "2h+";
      } else if (flightTimeDistribution[flightTimeDistribution.length - 1]._id === bucket._id) {
        label = `${bucket._id}m+`;
      } else {
        const nextBucket = flightTimeDistribution.find(b => b._id > bucket._id);
        if (nextBucket) {
          label = `${bucket._id}-${nextBucket._id}m`;
        } else {
          label = `${bucket._id}m+`;
        }
      }
      
      return {
        range: label,
        count: bucket.count
      };
    });

    res.json({
      patternUsage: patternData,
      durationByDroneModel: durationByDroneModel.map(item => ({
        model: item._id,
        avgDuration: Math.round(item.avgDurationMinutes * 10) / 10,
        count: item.count
      })),
      monthlyMissions: formattedMonthlyData,
      averages,
      statusByMonth,
      flightTimeDistribution: formattedFlightTimeDistribution
    });
  } catch (error) {
    console.error('Error getting mission analytics:', error);
    res.status(500).json({ message: 'Failed to retrieve mission analytics' });
  }
};

/**
 * Get drone analytics
 * @route GET /api/analytics/drones
 */
exports.getDroneAnalytics = async (req, res) => {
  try {
    // Get drones by status
    const statusData = await Drone.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Format status data
    const dronesByStatus = statusData.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // Get drones by model
    const modelData = await Drone.aggregate([
      { $group: { _id: "$model", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get most active drones (by number of missions)
    const activeDrones = await Mission.aggregate([
      {
        $match: {
          drone: { $exists: true },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: "$drone",
          missionCount: { $sum: 1 },
          totalFlightTime: {
            $sum: {
              $cond: [
                { $and: [
                  { $ifNull: ["$actualStartTime", false] },
                  { $ifNull: ["$completedAt", false] }
                ]},
                {
                  $divide: [
                    { $subtract: ["$completedAt", "$actualStartTime"] },
                    60000 // Convert ms to minutes
                  ]
                },
                0
              ]
            }
          }
        }
      },
      {
        $sort: { missionCount: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'drones',
          localField: '_id',
          foreignField: '_id',
          as: 'droneInfo'
        }
      },
      {
        $unwind: '$droneInfo'
      },
      {
        $project: {
          _id: 1,
          droneName: "$droneInfo.name",
          droneModel: "$droneInfo.model",
          missionCount: 1,
          totalFlightTime: 1
        }
      }
    ]);

    // Get battery health statistics
    const batteryStats = await Drone.aggregate([
      {
        $match: {
          batteryHealth: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          avgBatteryHealth: { $avg: "$batteryHealth" },
          minBatteryHealth: { $min: "$batteryHealth" },
          maxBatteryHealth: { $max: "$batteryHealth" }
        }
      }
    ]);

    // Group drones by battery health ranges
    const batteryHealthRanges = await Drone.aggregate([
      {
        $match: {
          batteryHealth: { $exists: true, $ne: null }
        }
      },
      {
        $bucket: {
          groupBy: "$batteryHealth",
          boundaries: [0, 50, 70, 80, 90, 101],
          default: "Unknown",
          output: {
            count: { $sum: 1 },
            drones: { $push: { id: "$_id", name: "$name", health: "$batteryHealth" } }
          }
        }
      }
    ]);

    // Format battery health ranges
    const formattedBatteryRanges = batteryHealthRanges.map(range => {
      let label;
      
      if (range._id === "Unknown") {
        label = "Unknown";
      } else if (range._id === 0) {
        label = "0-49%";
      } else if (range._id === 50) {
        label = "50-69%";
      } else if (range._id === 70) {
        label = "70-79%";
      } else if (range._id === 80) {
        label = "80-89%";
      } else if (range._id === 90) {
        label = "90-100%";
      }
      
      return {
        range: label,
        count: range.count
      };
    });

    // Get maintenance statistics
    const maintenanceStats = await Drone.aggregate([
      {
        $match: {
          lastMaintenanceDate: { $exists: true }
        }
      },
      {
        $project: {
          daysSinceLastMaintenance: {
            $divide: [
              { $subtract: [new Date(), "$lastMaintenanceDate"] },
              86400000 // Convert ms to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDaysSinceMaintenance: { $avg: "$daysSinceLastMaintenance" },
          maxDaysSinceMaintenance: { $max: "$daysSinceLastMaintenance" }
        }
      }
    ]);

    // Get drones needing maintenance (>90 days since last maintenance)
    const dronesNeedingMaintenance = await Drone.find({
      lastMaintenanceDate: {
        $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days ago
      }
    }).select('name model lastMaintenanceDate');

    res.json({
      dronesByStatus,
      dronesByModel: modelData,
      mostActiveDrones: activeDrones,
      batteryStatistics: batteryStats.length > 0 ? {
        average: Math.round(batteryStats[0].avgBatteryHealth * 10) / 10,
        minimum: batteryStats[0].minBatteryHealth,
        maximum: batteryStats[0].maxBatteryHealth
      } : null,
      batteryHealthDistribution: formattedBatteryRanges,
      maintenanceStatistics: maintenanceStats.length > 0 ? {
        averageDaysSinceMaintenance: Math.round(maintenanceStats[0].avgDaysSinceMaintenance),
        maxDaysSinceMaintenance: Math.round(maintenanceStats[0].maxDaysSinceMaintenance)
      } : null,
      dronesNeedingMaintenance
    });
  } catch (error) {
    console.error('Error getting drone analytics:', error);
    res.status(500).json({ message: 'Failed to retrieve drone analytics' });
  }
};

/**
 * Get survey analytics
 * @route GET /api/analytics/surveys
 */
exports.getSurveyAnalytics = async (req, res) => {
  try {
    // Get surveys by status
    const statusData = await Survey.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Format status data
    const surveysByStatus = statusData.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // Get surveys by month
    const monthlySurveys = await Survey.aggregate([
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

    // Format monthly data
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const formattedMonthlyData = monthlySurveys.map(item => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      count: item.count
    }));

    // Get top tags used in surveys
    const tagData = await Survey.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get mission completion rate by survey
    const missionCompletionBySurvey = await Survey.aggregate([
      {
        $match: {
          missions: { $exists: true, $ne: [] }
        }
      },
      {
        $lookup: {
          from: 'missions',
          localField: 'missions',
          foreignField: '_id',
          as: 'missionDetails'
        }
      },
      {
        $project: {
          name: 1,
          totalMissions: { $size: "$missions" },
          completedMissions: {
            $size: {
              $filter: {
                input: "$missionDetails",
                as: "mission",
                cond: { $eq: ["$$mission.status", "completed"] }
              }
            }
          }
        }
      },
      {
        $project: {
          name: 1,
          totalMissions: 1,
          completedMissions: 1,
          completionRate: {
            $cond: [
              { $eq: ["$totalMissions", 0] },
              0,
              { $multiply: [{ $divide: ["$completedMissions", "$totalMissions"] }, 100] }
            ]
          }
        }
      },
      {
        $sort: { completionRate: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get average survey duration (days between start and completion)
    const durationStats = await Survey.aggregate([
      {
        $match: {
          status: 'completed',
          startDate: { $exists: true },
          completedAt: { $exists: true }
        }
      },
      {
        $project: {
          durationDays: {
            $divide: [
              { $subtract: ["$completedAt", "$startDate"] },
              86400000 // Convert ms to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: "$durationDays" },
          minDuration: { $min: "$durationDays" },
          maxDuration: { $max: "$durationDays" }
        }
      }
    ]);

    // Get surveys by objectives (types of surveys)
    const objectiveData = await Survey.aggregate([
      { $unwind: "$objectives" },
      { $group: { _id: "$objectives", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      surveysByStatus,
      monthlySurveys: formattedMonthlyData,
      topTags: tagData.map(item => ({
        tag: item._id,
        count: item.count
      })),
      missionCompletionBySurvey: missionCompletionBySurvey.map(survey => ({
        name: survey.name,
        totalMissions: survey.totalMissions,
        completedMissions: survey.completedMissions,
        completionRate: Math.round(survey.completionRate)
      })),
      durationStatistics: durationStats.length > 0 ? {
        averageDays: Math.round(durationStats[0].avgDuration * 10) / 10,
        minDays: Math.round(durationStats[0].minDuration * 10) / 10,
        maxDays: Math.round(durationStats[0].maxDuration * 10) / 10
      } : null,
      surveysByObjective: objectiveData.map(item => ({
        objective: item._id,
        count: item.count
      }))
    });
  } catch (error) {
    console.error('Error getting survey analytics:', error);
    res.status(500).json({ message: 'Failed to retrieve survey analytics' });
  }
};

/**
 * Get user analytics (admin only)
 * @route GET /api/analytics/users
 */
exports.getUserAnalytics = async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized. Admin access required.' });
  }

  try {
    // Get users by role
    const roleData = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    // Format role data
    const usersByRole = roleData.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // Get users by activity status
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    // Get users by creation date (by month)
    const monthlyUsers = await User.aggregate([
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

    // Format monthly data
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const formattedMonthlyData = monthlyUsers.map(item => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      count: item.count
    }));

    // Get top users by missions created
    const topMissionCreators = await Mission.aggregate([
      {
        $match: {
          createdBy: { $exists: true }
        }
      },
      {
        $group: {
          _id: "$createdBy",
          missionCount: { $sum: 1 }
        }
      },
      {
        $sort: { missionCount: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $project: {
          _id: 1,
          name: "$userInfo.name",
          email: "$userInfo.email",
          missionCount: 1
        }
      }
    ]);

    // Get top users by surveys created
    const topSurveyCreators = await Survey.aggregate([
      {
        $match: {
          createdBy: { $exists: true }
        }
      },
      {
        $group: {
          _id: "$createdBy",
          surveyCount: { $sum: 1 }
        }
      },
      {
        $sort: { surveyCount: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $project: {
          _id: 1,
          name: "$userInfo.name",
          email: "$userInfo.email",
          surveyCount: 1
        }
      }
    ]);

    // Get users by department (if applicable)
    const departmentData = await User.aggregate([
      {
        $match: {
          department: { $exists: true, $ne: null }
        }
      },
      {
        $group: { 
          _id: "$department", 
          count: { $sum: 1 } 
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      usersByRole,
      activityStatus: {
        active: activeUsers,
        inactive: inactiveUsers
      },
      monthlyUsers: formattedMonthlyData,
      topMissionCreators,
      topSurveyCreators,
      usersByDepartment: departmentData.map(item => ({
        department: item._id,
        count: item.count
      }))
    });
  } catch (error) {
    console.error('Error getting user analytics:', error);
    res.status(500).json({ message: 'Failed to retrieve user analytics' });
  }
};