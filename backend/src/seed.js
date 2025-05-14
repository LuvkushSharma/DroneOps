const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Drone = require('./models/Drone');
const Mission = require('./models/Mission');
const Survey = require('./models/Survey');
const Waypoint = require('./models/Waypoint');
const FlightLog = require('./models/FlightLog');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/drone-survey')
  .then(async () => {
    console.log('MongoDB connected for seeding');
    
    // Check for existing indexes that might cause issues
    try {
      // Check if the 'serial' index exists and drop it if needed
      const collections = await mongoose.connection.db.listCollections().toArray();
      if (collections.some(col => col.name === 'drones')) {
        const indexes = await mongoose.connection.db.collection('drones').indexes();
        if (indexes.some(index => index.name === 'serial_1')) {
          console.log('Dropping problematic index on drones collection...');
          await mongoose.connection.db.collection('drones').dropIndex('serial_1');
        }
      }
    } catch (err) {
      console.warn('Could not check/drop indexes:', err.message);
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Helper functions
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const getRandomCoordinates = (centerLon, centerLat, radiusDeg) => {
  const lon = centerLon + (Math.random() * 2 - 1) * radiusDeg;
  const lat = centerLat + (Math.random() * 2 - 1) * radiusDeg;
  return [lon, lat];
};
const generateUniqueId = () => Math.random().toString(36).substring(2, 15);

// Seed data
const seedData = async () => {
  try {
    // Clean existing data
    await User.deleteMany({});
    await Drone.deleteMany({});
    await Mission.deleteMany({});
    await Survey.deleteMany({});
    await Waypoint.deleteMany({});
    await FlightLog.deleteMany({});

    console.log('Previous data cleared');

    // Organization name to use throughout
    const organizationName = 'FlytBase';

    // Create users with unique emails
    const adminUser = await User.create({
      name: 'Admin User',
      email: `admin_${generateUniqueId()}@example.com`,
      password: bcrypt.hashSync('admin1234', 10),
      role: 'admin',
      organization: organizationName
    });

    const operatorUser = await User.create({
      name: 'Operator User',
      email: `operator_${generateUniqueId()}@example.com`,
      password: bcrypt.hashSync('operator1234', 10),
      role: 'user',
      organization: organizationName
    });

    const viewerUser = await User.create({
      name: 'Viewer User',
      email: `viewer_${generateUniqueId()}@example.com`,
      password: bcrypt.hashSync('viewer1234', 10),
      role: 'manager',
      organization: organizationName
    });

    // Additional users with unique emails
    const additionalUsers = await User.create([
      {
        name: 'Jane Smith',
        email: `jane_${generateUniqueId()}@example.com`,
        password: bcrypt.hashSync('password123', 10),
        role: 'user',
        organization: organizationName
      },
      {
        name: 'John Doe',
        email: `john_${generateUniqueId()}@example.com`,
        password: bcrypt.hashSync('password123', 10),
        role: 'user',
        organization: organizationName
      }
    ]);

    const users = [adminUser, operatorUser, viewerUser, ...additionalUsers];
    console.log(`${users.length} users created`);

    // Create drones with unique serial numbers
    const droneModels = [
      { name: 'DJI Mavic 3', maxFlightTime: 46, maxSpeed: 19, maxAltitude: 6000, sensors: ['rgb', 'thermal'] },
      { name: 'DJI Matrice 300 RTK', maxFlightTime: 55, maxSpeed: 23, maxAltitude: 5000, sensors: ['lidar', 'rgb', 'multispectral'] },
      { name: 'DJI Phantom 4 RTK', maxFlightTime: 30, maxSpeed: 20, maxAltitude: 6000, sensors: ['rgb'] },
      { name: 'Autel EVO II', maxFlightTime: 40, maxSpeed: 15, maxAltitude: 7000, sensors: ['rgb', 'thermal'] }
    ];

    const droneStatuses = ['active', 'inactive', 'maintenance', 'flying', 'idle', 'charging', 'error', 'offline'];
    
    const locations = [
      { name: 'HQ', coords: [-118.4695, 34.0522] }, // Los Angeles
      { name: 'SF Office', coords: [-122.4194, 37.7749] }, // San Francisco
      { name: 'NYC Office', coords: [-74.0060, 40.7128] } // New York
    ];
    
    const drones = [];
    
    // Create drones with unique names and serial numbers
    for (let i = 1; i <= 10; i++) {
      const modelObj = getRandomItem(droneModels);
      const location = getRandomItem(locations);
      const status = getRandomItem(droneStatuses);
      const uniqueId = `${Date.now()}-${i}-${Math.random().toString(36).substring(2, 8)}`;
      const batteryLevel = status === 'maintenance' ? 
                    getRandomInt(1, 30) : 
                    status === 'active' || status === 'flying' ? 
                    getRandomInt(30, 80) : 
                    getRandomInt(50, 100);
                          
      const drone = await Drone.create({
        name: `Drone ${i}-${uniqueId.substring(0, 5)}`,
        model: modelObj.name,
        serialNumber: `DJI-${uniqueId}`,
        status: status,
        batteryLevel: batteryLevel,
        lastLocation: {
          type: 'Point',
          coordinates: getRandomCoordinates(location.coords[0], location.coords[1], 0.01)
        },
        homeLocation: {
          type: 'Point',
          coordinates: location.coords
        },
        specifications: {
          maxFlightTime: modelObj.maxFlightTime,
          maxSpeed: modelObj.maxSpeed,
          maxAltitude: modelObj.maxAltitude,
          maxRange: 5000,
          maxWindResistance: 10.5,
          weight: getRandomInt(8, 25) / 10,
          dimensions: {
            length: getRandomInt(30, 40),
            width: getRandomInt(30, 40),
            height: getRandomInt(10, 15)
          },
          batteryCapacity: getRandomInt(3500, 5000),
          camera: {
            model: `DJI Camera ${getRandomInt(1, 3)}`,
            resolution: "4K",
            fov: 85
          }
        },
        telemetry: {
          signalStrength: getRandomInt(75, 100),
          temperature: getRandomInt(20, 35),
          humidity: getRandomInt(40, 90),
          pressure: getRandomInt(980, 1020)
        },
        totalFlightTime: getRandomInt(10, 500),
        totalFlights: getRandomInt(5, 50),
        lastMaintenanceDate: getRandomDate(new Date('2025-03-01'), new Date('2025-05-01')),
        nextMaintenanceDate: getRandomDate(new Date('2025-06-01'), new Date('2025-08-01')),
        organization: organizationName,
        createdBy: getRandomItem(users)._id
      });
      
      drones.push(drone);
    }

    console.log(`${drones.length} drones created`);
    
    // Sites for missions and surveys - each with unique coordinates
    const siteBases = [
      {
        name: 'Headquarters',
        baseCoords: [-118.4695, 34.0522], // Los Angeles
        address: '123 Corporate Blvd, Los Angeles, CA'
      },
      {
        name: 'SF Office',
        baseCoords: [-122.4194, 37.7749], // San Francisco
        address: '456 Tech Street, San Francisco, CA'
      },
      {
        name: 'NYC Office',
        baseCoords: [-74.0060, 40.7128], // New York
        address: '789 Broadway, New York, NY'
      },
      {
        name: 'Distribution Center',
        baseCoords: [-96.7970, 32.7767], // Dallas
        address: '101 Logistics Way, Dallas, TX'
      }
    ];
    
    // Create sites with slightly different coordinates
    const sites = siteBases.map(base => {
      const uniqueOffset = (Math.random() - 0.5) * 0.001; // Small random offset
      return {
        name: base.name,
        location: {
          type: 'Point',
          coordinates: [base.baseCoords[0] + uniqueOffset, base.baseCoords[1] + uniqueOffset]
        },
        address: base.address
      };
    });

    // Mission types and statuses
    const missionTypes = ['inspection', 'surveillance', 'mapping'];
    const missionStatuses = ['planned', 'in-progress', 'completed', 'paused', 'aborted', 'failed'];
    const patternTypes = ['grid', 'crosshatch', 'perimeter', 'spiral', 'custom'];
    
    const missions = [];
    
    // Create 20 missions with unique names
    for (let i = 1; i <= 20; i++) {
      const site = getRandomItem(sites);
      const drone = getRandomItem(drones);
      const status = getRandomItem(missionStatuses);
      const pattern = getRandomItem(patternTypes);
      const creator = getRandomItem(users);
      const uniqueId = generateUniqueId().substring(0, 6);

      // Generate bounding box with unique coordinates
      const uniqueOffset = (Math.random() - 0.5) * 0.002;
      const boundingBox = {
        type: 'Polygon',
        coordinates: [[
          [site.location.coordinates[0] - 0.01 + uniqueOffset, site.location.coordinates[1] - 0.01 + uniqueOffset],
          [site.location.coordinates[0] - 0.01 + uniqueOffset, site.location.coordinates[1] + 0.01 + uniqueOffset],
          [site.location.coordinates[0] + 0.01 + uniqueOffset, site.location.coordinates[1] + 0.01 + uniqueOffset],
          [site.location.coordinates[0] + 0.01 + uniqueOffset, site.location.coordinates[1] - 0.01 + uniqueOffset],
          [site.location.coordinates[0] - 0.01 + uniqueOffset, site.location.coordinates[1] - 0.01 + uniqueOffset]
        ]]
      };

      const altitude = getRandomInt(30, 120);
      const speed = getRandomInt(3, 12);
      const startTime = status === 'planned' ? null : getRandomDate(new Date('2025-04-01'), new Date('2025-05-15'));
      
      let endTime = null;
      if (['completed', 'aborted', 'failed'].includes(status) && startTime) {
        endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + getRandomInt(20, 120));
      }
      
      const estimatedDuration = getRandomInt(15, 120);
      const progress = status === 'completed' ? 100 :
                     status === 'in-progress' ? getRandomInt(10, 90) :
                     status === 'aborted' || status === 'failed' ? getRandomInt(10, 90) : 0;
      
      // Create mission with unique name
      const mission = await Mission.create({
        name: `Mission ${i}-${uniqueId}: ${site.name} ${pattern.charAt(0).toUpperCase() + pattern.slice(1)}`,
        description: `${getRandomItem(missionTypes).charAt(0).toUpperCase() + getRandomItem(missionTypes).slice(1)} mission at ${site.name} using ${pattern} pattern`,
        drone: drone._id,
        status: status,
        pattern: pattern,
        startTime: startTime,
        endTime: endTime,
        estimatedDuration: estimatedDuration,
        altitude: altitude,
        speed: speed,
        overlap: getRandomInt(60, 80),
        gsd: getRandomInt(20, 35) / 10,
        boundingBox: boundingBox,
        progress: progress,
        currentWaypointIndex: status === 'in-progress' ? getRandomInt(1, 5) : 0,
        telemetry: status === 'in-progress' ? {
          altitude: altitude - getRandomInt(-5, 5),
          speed: speed - getRandomInt(-2, 2),
          signalStrength: getRandomInt(80, 100),
          batteryLevel: getRandomInt(40, 90)
        } : null,
        statistics: ['completed', 'aborted', 'failed'].includes(status) ? {
          distance: getRandomInt(5, 20) / 10,
          images: getRandomInt(10, 100),
          areaCovered: getRandomInt(1, 10) / 10,
          batteryUsed: getRandomInt(10, 40)
        } : null,
        environmentalConditions: {
          temperature: getRandomInt(15, 35),
          humidity: getRandomInt(40, 80),
          wind: getRandomInt(0, 25),
          visibility: getRandomInt(5, 20)
        },
        createdBy: creator._id,
        organization: organizationName
      });
      
      missions.push(mission);
      
      // Create waypoints for the mission - each with unique coordinates
      const numWaypoints = getRandomInt(4, 10);
      const waypoints = [];
      const waypointCoords = new Set(); // Track used coordinates
      
      for (let j = 0; j < numWaypoints; j++) {
        // Ensure unique coordinates for each waypoint
        let coords;
        do {
          coords = getRandomCoordinates(site.location.coordinates[0], site.location.coordinates[1], 0.01);
          // Convert to string for Set comparison
          const coordStr = `${coords[0].toFixed(6)},${coords[1].toFixed(6)}`;
          if (!waypointCoords.has(coordStr)) {
            waypointCoords.add(coordStr);
            break;
          }
        } while (true);
        
        const waypoint = await Waypoint.create({
          mission: mission._id,
          order: j + 1,
          location: {
            type: 'Point',
            coordinates: coords
          },
          altitude: altitude + getRandomInt(-10, 10),
          speed: speed + getRandomInt(-2, 2),
          action: j % 3 === 0 ? 'takePhoto' : j % 3 === 1 ? 'recordVideo' : 'flyTo',
          actionParams: j % 3 === 0 ? {
            photoMode: 'standard'
          } : j % 3 === 1 ? {
            videoLength: getRandomInt(5, 15)
          } : null,
          reached: status === 'completed' || (status === 'in-progress' && j < mission.currentWaypointIndex),
          timeReached: (status === 'completed' || (status === 'in-progress' && j < mission.currentWaypointIndex)) && startTime ? 
                      getRandomDate(startTime, endTime || new Date()) : null
        });
        
        waypoints.push(waypoint._id);
      }
      
      // Update mission with waypoints
      await Mission.findByIdAndUpdate(mission._id, {
        waypoints: waypoints
      });
      
      // Create flight logs for completed, aborted, or failed missions - each with unique times
      if (['completed', 'aborted', 'failed'].includes(status) && startTime && endTime) {
        await FlightLog.create({
          drone: drone._id,
          mission: mission._id,
          startTime: new Date(startTime.getTime() + getRandomInt(-600000, 600000)), // Add/subtract up to 10 minutes
          endTime: new Date(endTime.getTime() + getRandomInt(-600000, 600000)),
          duration: Math.round((endTime - startTime) / 60000), // duration in minutes
          status: status,
          startBatteryLevel: getRandomInt(80, 100),
          endBatteryLevel: getRandomInt(20, 60),
          batteryUsed: getRandomInt(20, 40),
          distanceTraveled: getRandomInt(500, 5000),
          maxAltitude: altitude + getRandomInt(0, 20),
          maxSpeed: speed + getRandomInt(0, 5),
          environmentalConditions: {
            temperature: getRandomInt(15, 35),
            humidity: getRandomInt(40, 80),
            wind: getRandomInt(0, 25),
            visibility: getRandomInt(5, 20)
          },
          waypoints: {
            planned: numWaypoints,
            reached: ['completed'].includes(status) ? numWaypoints : getRandomInt(1, numWaypoints - 1)
          },
          organization: organizationName
        });
      }
    }

    console.log(`${missions.length} missions created with waypoints`);

    // Create surveys with unique names and parameters
    const surveyTypes = ['inspection', 'mapping', 'security', 'monitoring', 'custom'];
    const surveyStatuses = ['planned', 'in-progress', 'completed', 'archived'];
    const frequencies = ['once', 'daily', 'weekly', 'monthly', 'quarterly', 'custom'];
    
    const surveys = [];
    
    // Create 10 unique surveys
    for (let i = 1; i <= 10; i++) {
      const site = getRandomItem(sites);
      const status = getRandomItem(surveyStatuses);
      const type = getRandomItem(surveyTypes);
      const frequency = getRandomItem(frequencies);
      const creator = getRandomItem(users);
      const uniqueId = generateUniqueId().substring(0, 5);
      
      const startDate = getRandomDate(new Date('2025-04-01'), new Date('2025-06-30'));
      let endDate = null;
      
      if (status === 'completed' || status === 'archived') {
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + getRandomInt(1, 30));
      } else if (status === 'planned' || status === 'in-progress') {
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + getRandomInt(1, 60));
      }
      
      // Select unique random missions for this survey
      const surveyMissions = [];
      const missionIndexes = new Set();
      const numMissions = getRandomInt(1, 3);
      
      while (surveyMissions.length < numMissions && missionIndexes.size < Math.min(numMissions, missions.length)) {
        const randomIndex = getRandomInt(0, missions.length - 1);
        if (!missionIndexes.has(randomIndex)) {
          missionIndexes.add(randomIndex);
          surveyMissions.push(missions[randomIndex]._id);
        }
      }
      
      // Generate unique tags
      const tags = [];
      if (i % 3 === 0) tags.push(`high-priority-${uniqueId}`);
      if (i % 4 === 0) tags.push(`routine-${uniqueId}`);
      tags.push(`${type}-${uniqueId}`);
      tags.push(`${site.name.toLowerCase().replace(' ', '-')}-${uniqueId}`);
      
      // Create survey with unique values
      const survey = await Survey.create({
        name: `${site.name} ${type.charAt(0).toUpperCase() + type.slice(1)} Survey ${i}-${uniqueId}`,
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} survey of ${site.name} ${frequency !== 'once' ? `(${frequency})` : ''} - ID: ${uniqueId}`,
        site: {
          name: site.name,
          location: {
            type: 'Point',
            coordinates: [
              site.location.coordinates[0] + (Math.random() - 0.5) * 0.0001, 
              site.location.coordinates[1] + (Math.random() - 0.5) * 0.0001
            ]
          },
          area: getRandomInt(5000, 50000),
          address: {
            street: site.address.split(',')[0],
            city: site.address.split(',')[1].trim(),
            state: site.address.split(',')[2].trim().split(' ')[0],
            country: 'USA',
            zipCode: `${getRandomInt(10000, 99999)}`
          }
        },
        type: type,
        status: status,
        missions: surveyMissions,
        frequency: frequency,
        customFrequency: frequency === 'custom' ? {
          days: [1, 3, 5], // Monday, Wednesday, Friday
          hours: [9, 15] // 9 AM, 3 PM
        } : null,
        startDate: startDate,
        endDate: endDate,
        lastRun: status === 'completed' || status === 'in-progress' ? {
          date: getRandomDate(startDate, new Date()),
          missionId: surveyMissions.length > 0 ? surveyMissions[0] : null,
          status: getRandomItem(['successful', 'partial', 'failed'])
        } : null,
        nextRun: status === 'planned' || status === 'in-progress' ? {
          date: getRandomDate(new Date(), new Date(new Date().setDate(new Date().getDate() + 30))),
          scheduled: true
        } : null,
        parameters: {
          altitude: getRandomInt(30, 120),
          speed: getRandomInt(3, 12),
          overlap: getRandomInt(60, 80),
          gsd: getRandomInt(20, 35) / 10
        },
        statistics: {
          totalMissions: surveyMissions.length,
          successfulMissions: status === 'completed' ? surveyMissions.length : 
                             status === 'in-progress' ? getRandomInt(0, surveyMissions.length) : 0,
          totalFlightTime: getRandomInt(30, 300),
          totalDistance: getRandomInt(1, 50),
          totalAreaCovered: getRandomInt(1, 20) / 10
        },
        tags: tags,
        organization: organizationName,
        createdBy: creator._id
      });
      
      surveys.push(survey);
    }

    console.log(`${surveys.length} surveys created`);
    console.log('Database seeded successfully');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    console.error(error.stack);
  } finally {
    mongoose.disconnect();
    console.log('MongoDB disconnected after seeding');
  }
};

// Run seeding
seedData();