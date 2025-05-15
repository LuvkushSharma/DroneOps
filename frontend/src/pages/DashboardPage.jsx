import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiMap, FiClock, FiAlertCircle, FiTarget, FiGrid, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';
import { useDrones } from '../context/DronesContext';
import { useMissions } from '../context/MissionsContext';
import { useSurveys } from '../context/SurveysContext';
import ProgressBar from '../components/ProgressBar';
import { motion } from 'framer-motion';

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

  // Show a more informative loading state
  if (dronesLoading || missionsLoading || surveysLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-block p-4 mb-4 rounded-full bg-blue-50 text-blue-600">
            <svg className="animate-spin h-12 w-12" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Dashboard</h2>
          <div className="text-sm text-gray-500 space-y-1">
            {dronesLoading && <p>Fetching drone fleet data...</p>}
            {missionsLoading && <p>Loading mission information...</p>}
            {surveysLoading && <p>Retrieving survey results...</p>}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="px-4 py-6 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header with welcome message and actions */}
        <div className="mb-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Fleet Dashboard</h1>
              <p className="text-gray-600 mt-1">Monitor your drones, missions, and surveys</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to="/missions/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center shadow-md">
                  <FiPlus className="mr-2" /> New Mission
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to="/surveys/create" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center shadow-md">
                  <FiPlus className="mr-2" /> New Survey
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Stats overview cards */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div 
            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 flex justify-between items-center">
              <h3 className="text-white font-medium">Drone Fleet</h3>
              <div className="bg-white/20 rounded-full p-2">
                <FiTarget className="text-white text-lg" />
              </div>
            </div>
            <div className="p-5">
              <p className="text-3xl font-bold text-gray-800">{stats.totalDrones}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-emerald-600 text-sm bg-emerald-50 px-2 py-1 rounded-full font-medium">{stats.availableDrones} Available</span>
                <span className="text-blue-600 text-sm bg-blue-50 px-2 py-1 rounded-full font-medium">{stats.inMissionDrones} In Mission</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-4 flex justify-between items-center">
              <h3 className="text-white font-medium">Active Missions</h3>
              <div className="bg-white/20 rounded-full p-2">
                <FiGrid className="text-white text-lg" />
              </div>
            </div>
            <div className="p-5">
              <p className="text-3xl font-bold text-gray-800">{stats.activeMissions}</p>
              <div className="mt-3">
                <Link to="/missions" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center">
                  View all missions <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 flex justify-between items-center">
              <h3 className="text-white font-medium">Completed Surveys</h3>
              <div className="bg-white/20 rounded-full p-2">
                <FiCheckCircle className="text-white text-lg" />
              </div>
            </div>
            <div className="p-5">
              <p className="text-3xl font-bold text-gray-800">{stats.completedSurveys}</p>
              <div className="mt-3">
                <Link to="/surveys" className="text-emerald-600 hover:text-emerald-800 text-sm font-medium flex items-center">
                  View all surveys <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 flex justify-between items-center">
              <h3 className="text-white font-medium">Fleet Status</h3>
              <div className="bg-white/20 rounded-full p-2">
                <FiTrendingUp className="text-white text-lg" />
              </div>
            </div>
            <div className="p-5">
              {stats.totalDrones > 0 ? (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1 text-sm">
                      <span className="font-medium">Available</span>
                      <span className="text-emerald-600 font-medium">{stats.availableDrones}</span>
                    </div>
                    <ProgressBar 
                      progress={stats.totalDrones ? (stats.availableDrones / stats.totalDrones) * 100 : 0} 
                      color="success"
                      size="md"
                      showLabel={false}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1 text-sm">
                      <span className="font-medium">In Mission</span>
                      <span className="text-blue-600 font-medium">{stats.inMissionDrones}</span>
                    </div>
                    <ProgressBar 
                      progress={stats.totalDrones ? (stats.inMissionDrones / stats.totalDrones) * 100 : 0} 
                      color="info"
                      size="md"
                      showLabel={false}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1 text-sm">
                      <span className="font-medium">Maintenance</span>
                      <span className="text-amber-600 font-medium">{stats.maintenanceDrones}</span>
                    </div>
                    <ProgressBar 
                      progress={stats.totalDrones ? (stats.maintenanceDrones / stats.totalDrones) * 100 : 0} 
                      color="warning"
                      size="md"
                      showLabel={false}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1 text-sm">
                      <span className="font-medium">Offline</span>
                      <span className="text-rose-600 font-medium">{stats.offlineDrones}</span>
                    </div>
                    <ProgressBar 
                      progress={stats.totalDrones ? (stats.offlineDrones / stats.totalDrones) * 100 : 0} 
                      color="danger"
                      size="md"
                      showLabel={false}
                    />
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-gray-500 flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>No drones available</span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Content sections */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Active missions */}
          <motion.div 
            whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            transition={{ duration: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <div className="bg-blue-100 rounded-full p-1.5 mr-2">
                  <FiGrid className="text-blue-600" />
                </div>
                Active Missions
              </h2>
              <Link to="/missions" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                View all
              </Link>
            </div>
            
            {activeMissions.length > 0 ? (
              <div className="space-y-4">
                {activeMissions.map(mission => (
                  <motion.div 
                    key={mission._id} 
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="border border-gray-100 rounded-lg p-3 hover:border-blue-200 hover:bg-blue-50/30"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <Link to={`/monitor/${mission._id}`} className="font-medium text-gray-800 hover:text-blue-600">
                        {mission.name}
                      </Link>
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                        {mission.progress}% complete
                      </span>
                    </div>
                    <ProgressBar progress={mission.progress} color="info" size="sm" />
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <FiClock className="mr-1" />
                      <span>Est. time: {Math.round((100 - mission.progress) * mission.estimatedDuration / 100)} min</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg py-8 px-4 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-600">No active missions at the moment.</p>
              </div>
            )}
          </motion.div>
          
          {/* Recent surveys */}
          <motion.div 
            whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            transition={{ duration: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <div className="bg-emerald-100 rounded-full p-1.5 mr-2">
                  <FiMap className="text-emerald-600" />
                </div>
                Recent Surveys
              </h2>
              <Link to="/surveys" className="text-sm text-emerald-600 hover:text-emerald-800 font-medium">
                View all
              </Link>
            </div>
            
            {recentSurveys.length > 0 ? (
              <div className="space-y-4">
                {recentSurveys.map(survey => (
                  <motion.div 
                    key={survey._id} 
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="border border-gray-100 rounded-lg p-3 hover:border-emerald-200 hover:bg-emerald-50/30"
                  >
                    <Link to={`/surveys/${survey._id}`} className="font-medium text-gray-800 hover:text-emerald-600">
                      {survey.name}
                    </Link>
                    <div className="flex items-center mt-1 text-sm">
                      <FiMap className="mr-1 text-gray-500" />
                      <span className="text-gray-500">{survey.site?.name || 'No site'}</span>
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium
                        ${survey.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 
                          survey.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'}`}
                      >
                        {survey.status}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {survey.missions?.length || 0} missions
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg py-8 px-4 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p className="text-gray-600">No surveys created yet.</p>
              </div>
            )}
          </motion.div>
          
          {/* Low battery drones */}
          <motion.div 
            whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            transition={{ duration: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <div className="bg-amber-100 rounded-full p-1.5 mr-2">
                  <FiAlertCircle className="text-amber-600" />
                </div>
                Low Battery Drones
              </h2>
              <Link to="/drones" className="text-sm text-amber-600 hover:text-amber-800 font-medium">
                View all drones
              </Link>
            </div>
            
            {lowBatteryDrones.length > 0 ? (
              <div className="space-y-4">
                {lowBatteryDrones.map(drone => (
                  <motion.div 
                    key={drone._id}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="border border-gray-100 rounded-lg p-3 hover:border-amber-200 hover:bg-amber-50/30"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-800">{drone.name}</div>
                      <div className="flex items-center">
                        <FiAlertCircle className={`mr-1 ${drone.batteryLevel < 15 ? 'text-rose-500' : 'text-amber-500'}`} />
                        <span className={`${drone.batteryLevel < 15 ? 'text-rose-600 bg-rose-100' : 'text-amber-600 bg-amber-100'} font-medium px-2 py-0.5 rounded-full text-xs`}>
                          {drone.batteryLevel}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                      {drone.serial}
                      <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-800">
                        {drone.status}
                      </span>
                    </p>
                    <div className="mt-2">
                      <ProgressBar 
                        progress={drone.batteryLevel} 
                        color={drone.batteryLevel < 15 ? 'danger' : 'warning'}
                        size="sm"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg py-8 px-4 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-gray-600">No drones with low battery.</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
