import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiMap, FiClock, FiAlertCircle } from 'react-icons/fi';
import { useDrones } from '../context/DronesContext';
import { useMissions } from '../context/MissionsContext';
import { useSurveys } from '../context/SurveysContext';
import ProgressBar from '../components/ProgressBar';

const DashboardPage = () => {
  const { drones: dronesData, loading: dronesLoading, fetchDrones } = useDrones();
  const { missions: missionsData, loading: missionsLoading, fetchMissions } = useMissions();
  const { surveys: surveysData, loading: surveysLoading, fetchSurveys } = useSurveys();
  
  const [stats, setStats] = useState({
    totalDrones: 0,
    activeMissions: 0,
    completedSurveys: 0,
    availableDrones: 0,
    inMissionDrones: 0,
    maintenanceDrones: 0,
    offlineDrones: 0
  });

  // Explicitly fetch the data when component mounts
// Update the useEffect for fetching data
useEffect(() => {
  const loadData = async () => {
    console.log("Fetching initial data...");
    try {
      // Explicitly call fetchDrones and check the response
      const dronesResponse = await fetchDrones();
      if (!dronesResponse.success) {
        console.error("Failed to fetch drones:", dronesResponse.error);
      }
      
      // Do the same for missions and surveys
      if (typeof fetchMissions === 'function') {
        const missionsResponse = await fetchMissions();
        if (!missionsResponse.success) {
          console.error("Failed to fetch missions:", missionsResponse.error);
        }
      }
      
      if (typeof fetchSurveys === 'function') {
        const surveysResponse = await fetchSurveys();
        if (!surveysResponse.success) {
          console.error("Failed to fetch surveys:", surveysResponse.error);
        }
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };
  
  loadData();
}, [fetchDrones, fetchMissions, fetchSurveys]);

  // Process data after fetching
  useEffect(() => {
    // Only process data when loading is complete
    if (!dronesLoading && !missionsLoading && !surveysLoading) {
      // Parse data safely inside the effect
      const drones = Array.isArray(dronesData) ? dronesData : [];
      const missions = Array.isArray(missionsData) ? missionsData : [];
      const surveysArray = !surveysData ? [] : 
        Array.isArray(surveysData) ? surveysData : (surveysData.surveys || []);
      
      console.log("DashboardPage - Drone Data Debug:", {
        rawDrones: dronesData,
        parsedDrones: drones,
        length: drones.length,
        statuses: drones.map(d => d.status),
        availableDrones: drones.filter(d => d.status === 'available' || d.status === 'ready' || d.status === 'idle').length,
        inMissionDrones: drones.filter(d => d.status === 'in-mission' || d.status === 'active' || d.status === 'flying').length,
        maintenanceDrones: drones.filter(d => d.status === 'maintenance' || d.status === 'repair').length,
        offlineDrones: drones.filter(d => d.status === 'offline' || d.status === 'inactive').length
      });
      
      // Now calculate stats with more flexible status matching
      setStats({
        totalDrones: drones.length,
        activeMissions: missions.filter(m => m.status === 'in-progress').length,
        completedSurveys: surveysArray.filter(s => s.status === 'completed').length,
        availableDrones: drones.filter(d => d.status === 'available' || d.status === 'ready' || d.status === 'idle').length,
        inMissionDrones: drones.filter(d => d.status === 'in-mission' || d.status === 'active' || d.status === 'flying').length,
        maintenanceDrones: drones.filter(d => d.status === 'maintenance' || d.status === 'repair').length,
        offlineDrones: drones.filter(d => d.status === 'offline' || d.status === 'inactive').length
      });
    }
  }, [dronesData, missionsData, surveysData, dronesLoading, missionsLoading, surveysLoading]);

  // For rendering, safely prepare arrays here
  const drones = Array.isArray(dronesData) ? dronesData : [];
  const missions = Array.isArray(missionsData) ? missionsData : [];
  const surveysArray = !surveysData ? [] : 
    Array.isArray(surveysData) ? surveysData : (surveysData.surveys || []);
  
  // Derived data for display
  const activeMissions = missions.filter(m => m.status === 'in-progress').slice(0, 3);
  
  const recentSurveys = [...surveysArray]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);
    
  const lowBatteryDrones = drones.filter(d => d.batteryLevel < 30).slice(0, 3);

  // Show a more informative loading message
  if (dronesLoading || missionsLoading || surveysLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">
          Loading dashboard data...
          <div className="text-sm text-gray-500 mt-2">
            {dronesLoading ? "Fetching drone data..." : ""}
            {missionsLoading ? "Fetching mission data..." : ""}
            {surveysLoading ? "Fetching survey data..." : ""}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex space-x-2">
          <Link to="/missions/create" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center">
            <FiPlus className="mr-2" /> New Mission
          </Link>
          <Link to="/surveys/create" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center">
            <FiPlus className="mr-2" /> New Survey
          </Link>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Total Drones</h3>
          <p className="text-2xl font-bold mt-1">{stats.totalDrones}</p>
          <div className="mt-2 flex text-sm">
            <span className="text-green-500 mr-2">{stats.availableDrones} Available</span>
            <span className="text-blue-500">{stats.inMissionDrones} In Mission</span>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Active Missions</h3>
          <p className="text-2xl font-bold mt-1">{stats.activeMissions}</p>
          <div className="mt-2 flex text-sm">
            <Link to="/missions" className="text-primary-600 hover:text-primary-800">View all missions</Link>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Completed Surveys</h3>
          <p className="text-2xl font-bold mt-1">{stats.completedSurveys}</p>
          <div className="mt-2 flex text-sm">
            <Link to="/surveys" className="text-primary-600 hover:text-primary-800">View all surveys</Link>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Drone Status</h3>
          {stats.totalDrones > 0 ? (
            <div className="mt-2">
              <div className="flex justify-between items-center mb-1 text-sm">
                <span>Available</span>
                <span>{stats.availableDrones}</span>
              </div>
              <ProgressBar 
                progress={stats.totalDrones ? (stats.availableDrones / stats.totalDrones) * 100 : 0} 
                color="success"
                size="md"
                showLabel={true}
              />
              
              {/* Other progress bars remain the same but with increased size and labels */}
              <div className="flex justify-between items-center mb-1 mt-2 text-sm">
                <span>In Mission</span>
                <span>{stats.inMissionDrones}</span>
              </div>
              <ProgressBar 
                progress={stats.totalDrones ? (stats.inMissionDrones / stats.totalDrones) * 100 : 0} 
                color="info"
                size="md"
                showLabel={true}
              />
              
              <div className="flex justify-between items-center mb-1 mt-2 text-sm">
                <span>Maintenance</span>
                <span>{stats.maintenanceDrones}</span>
              </div>
              <ProgressBar 
                progress={stats.totalDrones ? (stats.maintenanceDrones / stats.totalDrones) * 100 : 0} 
                color="warning"
                size="md"
                showLabel={true}
              />
              
              <div className="flex justify-between items-center mb-1 mt-2 text-sm">
                <span>Offline</span>
                <span>{stats.offlineDrones}</span>
              </div>
              <ProgressBar 
                progress={stats.totalDrones ? (stats.offlineDrones / stats.totalDrones) * 100 : 0} 
                color="danger"
                size="md"
                showLabel={true}
              />
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500">
              No drones available yet
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active missions */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Active Missions</h2>
            <Link to="/missions" className="text-sm text-primary-600 hover:text-primary-800">View all</Link>
          </div>
          
          {activeMissions.length > 0 ? (
            <div className="space-y-4">
              {activeMissions.map(mission => (
                <div key={mission._id} className="border-b pb-3 last:border-0">
                  <div className="flex justify-between items-center mb-2">
                    <Link to={`/monitor/${mission._id}`} className="font-medium text-gray-800 hover:text-primary-600">
                      {mission.name}
                    </Link>
                    <span className="text-blue-600 text-xs font-medium">{mission.progress}% complete</span>
                  </div>
                  <ProgressBar progress={mission.progress} size="sm" />
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <FiClock className="mr-1" />
                    <span>Est. time remaining: {Math.round((100 - mission.progress) * mission.estimatedDuration / 100)} min</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No active missions at the moment.</p>
          )}
        </div>
        
        {/* Recent surveys */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Surveys</h2>
            <Link to="/surveys" className="text-sm text-primary-600 hover:text-primary-800">View all</Link>
          </div>
          
          {recentSurveys.length > 0 ? (
            <div className="space-y-4">
              {recentSurveys.map(survey => (
                <div key={survey._id} className="border-b pb-3 last:border-0">
                  <Link to={`/surveys/${survey._id}`} className="font-medium text-gray-800 hover:text-primary-600">
                    {survey.name}
                  </Link>
                  <div className="flex items-center mt-1 text-sm">
                    <FiMap className="mr-1 text-gray-500" />
                    <span className="text-gray-500">{survey.site?.name || 'No site'}</span>
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {survey.status}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    {survey.missions?.length || 0} missions
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No surveys created yet.</p>
          )}
        </div>
        
        {/* Low battery drones */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Low Battery Drones</h2>
            <Link to="/drones" className="text-sm text-primary-600 hover:text-primary-800">View all drones</Link>
          </div>
          
          {lowBatteryDrones.length > 0 ? (
            <div className="space-y-4">
              {lowBatteryDrones.map(drone => (
                <div key={drone._id} className="border-b pb-3 last:border-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-800">{drone.name}</div>
                    <div className="flex items-center">
                      <FiAlertCircle className={`mr-1 ${drone.batteryLevel < 15 ? 'text-red-500' : 'text-yellow-500'}`} />
                      <span className={`${drone.batteryLevel < 15 ? 'text-red-500' : 'text-yellow-500'} font-medium`}>
                        {drone.batteryLevel}%
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{drone.serial} - {drone.status}</p>
                  <div className="mt-1">
                    <ProgressBar 
                      progress={drone.batteryLevel} 
                      color={drone.batteryLevel < 15 ? 'danger' : 'warning'}
                      size="sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No drones with low battery.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;