import React from 'react';
import { 
  FiMapPin, 
  FiPieChart, 
  FiCheckCircle, 
  FiCpu, 
  FiCalendar,
  FiAlertTriangle,
  FiBarChart2
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import StatCard from './StatCard';

/**
 * DashboardStats component for displaying system-wide statistics
 * 
 * @param {Object} props
 * @param {Object} props.stats - Statistics data object
 * @param {boolean} props.loading - Whether the stats are still loading
 * @param {boolean} props.error - Whether there was an error loading stats
 * @param {string} props.timeRange - The time range for the statistics (day, week, month)
 * @param {Function} props.onTimeRangeChange - Function to call when time range changes
 */
const DashboardStats = ({ 
  stats = {}, 
  loading = false, 
  error = null,
  timeRange = 'week',
  onTimeRangeChange 
}) => {
  // Set default values for stats if they're not provided
  const {
    totalDrones = 0,
    activeDrones = 0,
    dronesChange = 0,
    totalSurveys = 0,
    completedSurveys = 0,
    surveysChange = 0,
    totalMissions = 0,
    completedMissions = 0,
    missionsChange = 0,
    avgFlightTime = 0,
    totalFlightTime = 0,
    flightTimeChange = 0,
    totalDistance = 0,
    batteryUsage = 0,
    areasCovered = 0,
    areasChange = 0,
    alerts = 0
  } = stats;

  // Timeframe options for filtering stats
  const timeRangeOptions = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 rounded-md w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="text-center text-red-500 py-4">
          <FiAlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p>Failed to load statistics. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      {/* Header with time range selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-2 border-b border-gray-100">
        <h2 className="text-lg font-medium text-gray-800 mb-2 sm:mb-0">System Overview</h2>
        
        {onTimeRangeChange && (
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2 whitespace-nowrap">
              <FiCalendar className="inline mr-1 h-4 w-4" />
              Time Range:
            </span>
            <select
              value={timeRange}
              onChange={(e) => onTimeRangeChange(e.target.value)}
              className="text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Drones stats */}
        <StatCard
          title="Total Drones"
          value={totalDrones}
          change={dronesChange}
          icon={<FiCpu className="h-5 w-5" />}
          color="primary"
          period={`vs prev ${timeRange}`}
        />
        
        {/* Active Drones stats */}
        <StatCard
          title="Active Drones"
          value={activeDrones}
          unit={`of ${totalDrones}`}
          color="success"
          icon={<FiBarChart2 className="h-5 w-5" />}
        />
        
        {/* Surveys stats */}
        <StatCard
          title="Total Surveys"
          value={totalSurveys}
          change={surveysChange}
          icon={<FiMapPin className="h-5 w-5" />}
          color="info"
          period={`vs prev ${timeRange}`}
        />
        
        {/* Completed Surveys stats */}
        <StatCard
          title="Completed Surveys"
          value={completedSurveys}
          unit={totalSurveys > 0 ? `(${Math.round((completedSurveys / totalSurveys) * 100)}%)` : ''}
          icon={<FiCheckCircle className="h-5 w-5" />}
          color="success"
        />
        
        {/* Missions stats */}
        <StatCard
          title="Total Missions"
          value={totalMissions}
          change={missionsChange}
          color="warning"
          icon={<FiPieChart className="h-5 w-5" />}
          period={`vs prev ${timeRange}`}
        />
        
        {/* Completed Missions stats */}
        <StatCard
          title="Completed Missions"
          value={completedMissions}
          unit={totalMissions > 0 ? `(${Math.round((completedMissions / totalMissions) * 100)}%)` : ''}
          color="success"
        />
        
        {/* Flight Time stats */}
        <StatCard
          title="Total Flight Time"
          value={totalFlightTime}
          unit="hrs"
          change={flightTimeChange}
          color="primary"
          period={`vs prev ${timeRange}`}
        />
        
        {/* Average Flight Time */}
        <StatCard
          title="Avg Flight Time"
          value={avgFlightTime}
          unit="min/mission"
        />
        
        {/* Area Coverage */}
        <StatCard
          title="Area Covered"
          value={areasCovered}
          unit="sq.km"
          change={areasChange}
          period={`vs prev ${timeRange}`}
        />
        
        {/* Total distance flown */}
        <StatCard
          title="Distance Flown"
          value={totalDistance}
          unit="km"
        />
        
        {/* Battery Usage */}
        <StatCard
          title="Avg Battery Usage"
          value={batteryUsage}
          unit="%/mission"
        />
        
        {/* Alerts */}
        <StatCard
          title="Active Alerts"
          value={alerts}
          color="danger"
          icon={<FiAlertTriangle className="h-5 w-5" />}
        />
      </div>
      
      {/* Links to more detailed views */}
      <div className="mt-4 flex justify-end">
        <Link 
          to="/analytics" 
          className="text-primary-600 hover:text-primary-800 text-sm font-medium inline-flex items-center"
        >
          View detailed analytics
          <svg className="ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default DashboardStats;