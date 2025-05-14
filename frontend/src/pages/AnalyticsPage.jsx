import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiTrendingUp, 
  FiCalendar, 
  FiFilter, 
  FiDownload, 
  FiCpu,
  FiMapPin,
  FiClock,
  FiAirplay,
  FiBatteryCharging,
  FiAlertTriangle,
  FiCheckCircle,
  FiGrid,
  FiMap,
  FiPieChart,
  FiBarChart2,
  FiActivity,
  FiUsers,
  FiSettings
} from 'react-icons/fi';
import { useDrones } from '../context/DronesContext';
import { useMissions } from '../context/MissionsContext';
import { useSurveys } from '../context/SurveysContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api'; 
import LoadingSpinner from '../components/LoadingSpinner';
import LineChart from '../components/LineChart';
import BarChart from '../components/BarChart';
import PieChart from '../components/PieChart';
import StatCard from '../components/StatCard';
import AlertMessage from '../components/AlertMessage';
import MapOverview from '../components/MapOverview';
import DateRangePicker from '../components/DateRangePicker';
import MiniTable from '../components/MiniTable';
import analyticsService from '../services/analyticsService';

const AnalyticsPage = () => {
  const { user } = useAuth();
  const { drones, loading: dronesLoading, error: dronesError , fetchDrones} = useDrones();
  const { missions, loading: missionsLoading, error: missionsError, fetchMissions } = useMissions();
  const { surveys, loading: surveysLoading, error: surveysError, fetchSurveys } = useSurveys();

  // State
  const [timeRange, setTimeRange] = useState('1m'); // 1w, 1m, 3m, 6m, 1y, all
  const [customDateRange, setCustomDateRange] = useState(null);
  const [filter, setFilter] = useState('all'); // all, missions, surveys, drone_health, etc.
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState('csv');
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  
  // Calculate date range based on selection
  const getDateRange = useCallback(() => {
    const endDate = new Date();
    let startDate = new Date();
    
    if (customDateRange) {
      return customDateRange;
    }
    
    switch(timeRange) {
      case '1w':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '1m':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case '3m':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case 'all':
        startDate = null; // No start date constraint
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 1); // Default to 1 month
    }
    
    return { startDate, endDate };
  }, [timeRange, customDateRange]);

  // Fetch missions and surveys data with the correct date range
  useEffect(() => {
    const fetchData = async () => {
      setError(null);
      
      try {
        const dateRange = getDateRange();
        
        // Use the fetchMissions function with proper parameters
        const missionsResult = await fetchMissions({
            status: 'all',
            startDate: dateRange.startDate ? dateRange.startDate.toISOString() : undefined,
            endDate: dateRange.endDate ? dateRange.endDate.toISOString() : undefined
        });
        console.log("Missions data fetched:", missionsResult.success ? "Success" : "Failed");


        // Fetch drones with status filter
        const dronesResult = await fetchDrones({
            status: 'all'
          });
        console.log("Drones data fetched:", dronesResult.success ? "Success" : "Failed");
          
        
        // Store the result of fetchSurveys
        const surveysResult = await fetchSurveys();
        console.log("Surveys data fetched:", surveysResult?.success ? "Success" : "Failed");
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'An error occurred while fetching data');
      }
    };
    
    fetchData();
  }, [timeRange, filter, customDateRange, fetchMissions, fetchSurveys, getDateRange]);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      
      try {
        const dateRange = getDateRange();
        let timeRangeParam = null;
        
        if (dateRange?.startDate) {
          timeRangeParam = {
            start: dateRange.startDate.toISOString(),
            end: dateRange.endDate.toISOString()
          };
        }
        
        // Use the analytics service instead of direct API call
        let analyticsResult;
        
        switch (filter) {
          case 'missions':
            analyticsResult = await analyticsService.getMissionAnalytics({}, timeRangeParam);
            break;
          case 'drones':
            analyticsResult = await analyticsService.getDroneAnalytics({});
            break;
          case 'surveys':
            analyticsResult = await analyticsService.getSurveyAnalytics({}, timeRangeParam);
            break;
          default:
            analyticsResult = await analyticsService.getDashboardAnalytics(timeRangeParam);
        }
        
        console.log("Analytics data fetched successfully:", analyticsResult);
        
        // Transform the API response into the expected format
        const transformedData = {
          // Summary stats
          totalDrones: analyticsResult?.counts?.drones || 0,
          activeDrones: analyticsResult?.counts?.activeDrones || 0,
          completedMissions: analyticsResult?.missionStats?.totalCompleted || 0,
          totalFlightHours: analyticsResult?.flightStats?.totalFlightTime || 0,
          
          // Convert daily missions data to chart-compatible format
          missionActivity: Object.entries(analyticsResult?.dailyMissions || {}).map(([date, count]) => ({
            date,
            count
          })),
          
          // Mission status distribution
          missionStatusDistribution: Object.entries(analyticsResult?.missionStats?.byStatus || {})
            .filter(([_, value]) => value > 0) // Filter out zero values for better visualization
            .map(([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' '), // Capitalize first letter and format hyphens
                value
            })),
          
          // Mock data for charts that don't have corresponding API data yet
          droneUtilizationByModel: [
            { name: "DJI Phantom", hours: analyticsResult?.flightStats?.totalFlightTime / 2 || 5 },
            { name: "Mavic Pro", hours: analyticsResult?.flightStats?.totalFlightTime / 3 || 3 },
            { name: "Autel EVO", hours: analyticsResult?.flightStats?.totalFlightTime / 4 || 2 }
          ],
          
          batteryConsumption: Array(7).fill(0).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return {
              date: date.toISOString().split('T')[0],
              averageConsumption: 10 + Math.random() * 5
            };
          }),
          
          surveyCoverage: Array(7).fill(0).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return {
              date: date.toISOString().split('T')[0],
              coverage: analyticsResult?.flightStats?.totalArea * (i+1) || (i+1) * 0.5
            };
          }),
          
          // Top operators (mock data if not provided)
          topOperators: analyticsResult?.topOperators || [
            { name: "John Doe", missionsCompleted: 8 },
            { name: "Jane Smith", missionsCompleted: 5 },
            { name: "Alex Johnson", missionsCompleted: 4 }
          ],
          
          // Drone health status
          droneHealth: {
            healthy: Math.floor(analyticsResult?.counts?.drones * 0.6) || 6,
            needsAttention: Math.floor(analyticsResult?.counts?.drones * 0.3) || 3,
            critical: Math.floor(analyticsResult?.counts?.drones * 0.1) || 1,
            offline: analyticsResult?.counts?.drones - analyticsResult?.counts?.activeDrones || 0
          },
          
          // Recent alerts (mock data)
          recentAlerts: analyticsResult?.recentAlerts || [
            {
              severity: "yellow",
              message: "Battery Low on DJI Phantom #103",
              time: "Today, 2:45 PM"
            },
            {
              severity: "red",
              message: "Signal Lost on Mavic Air #208",
              time: "Yesterday, 9:12 AM"
            }
          ]
        };
        
        setAnalyticsData(transformedData);
  
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        // More detailed error message
        const errorMessage = err.response ? 
          `Error ${err.response.status}: ${err.response.data?.message || 'Server error'}` : 
          'Failed to connect to analytics service';
        setError(prev => prev || errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [timeRange, filter, customDateRange, getDateRange]);
  
  // Handle time range change
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    setCustomDateRange(null); // Clear custom range when using presets
  };

  // Handle custom date range change
  const handleCustomDateRange = (range) => {
    setCustomDateRange(range);
    setTimeRange('custom');
  };

  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  // Handle data download
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const dateRange = getDateRange();
      let timeRangeParam = null;
      
      if (dateRange?.startDate) {
        timeRangeParam = {
          start: dateRange.startDate.toISOString(),
          end: dateRange.endDate.toISOString()
        };
      }
      
      // Use the analytics service for export
      const blobData = await analyticsService.exportAnalytics(
        downloadFormat, 
        timeRangeParam, 
        filter
      );
      
      // Create a filename
      const filename = `analytics_export_${new Date().toISOString().split('T')[0]}.${downloadFormat}`;
      
      // Handle file download
      const url = window.URL.createObjectURL(blobData);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      setShowDownloadOptions(false);
    } catch (err) {
      console.error('Error downloading data:', err);
      setError(err.message || 'Failed to download data');
    } finally {
      setIsDownloading(false);
    }
  };

  // Determine if we should show the main loading spinner
  const isFullyLoading = loading && dronesLoading && missionsLoading && surveysLoading;

  // Combine all context errors
  const allErrors = [
    error,
    dronesError,
    missionsError,
    surveysError
  ].filter(Boolean);

  // Show full-screen loading spinner only when all data is loading
  if (isFullyLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" text="Loading analytics data..." />
        </div>
      </div>
    );
  }

  // Calculate metrics from actual context data
  const activeDrones = Array.isArray(drones) ? drones.filter(drone => drone.status === 'active').length : 0;
  const completedMissions = Array.isArray(missions) ? missions.filter(mission => mission.status === 'completed').length : 0;
  const totalFlightHours = Array.isArray(missions) 
    ? missions.reduce((total, mission) => {
        const flightTime = mission.flightTime || 0;
        return total + flightTime;
      }, 0)
    : 0;

  // Process for mission status distribution chart
  const missionStatusData = Array.isArray(missions) ? [
    { name: 'Completed', value: missions.filter(m => m.status === 'completed').length },
    { name: 'In Progress', value: missions.filter(m => m.status === 'in-progress').length },
    { name: 'Planned', value: missions.filter(m => m.status === 'planned').length },
    { name: 'Failed', value: missions.filter(m => m.status === 'failed').length },
    { name: 'Aborted', value: missions.filter(m => m.status === 'aborted').length }
  ] : [];

  console.log("Mission Status Data:", analyticsData?.missionStatusDistribution);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">
          Performance metrics and operational insights for your drone fleet and missions
        </p>
      </div>
      
      {/* Error messages - show all errors from contexts */}
      {allErrors.length > 0 && (
        <AlertMessage 
          type="error"
          message={allErrors.join('. ')}
          onClose={() => setError(null)}
          className="mb-6"
        />
      )}
      
      {/* Loading indicators for different sections */}
      {loading && !isFullyLoading && (
        <div className="mb-4 p-2 bg-blue-50 text-blue-700 rounded-md text-sm">
          Refreshing analytics data...
        </div>
      )}
      
      {/* Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
        {/* Date range controls */}
        <div className="flex flex-wrap items-center space-x-2">
          <span className="text-sm font-medium text-gray-700 mr-2 flex items-center">
            <FiCalendar className="mr-1" /> Time Range:
          </span>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleTimeRangeChange('1w')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                timeRange === '1w' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              1 Week
            </button>
            
            <button
              onClick={() => handleTimeRangeChange('1m')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                timeRange === '1m' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              1 Month
            </button>
            
            <button
              onClick={() => handleTimeRangeChange('3m')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                timeRange === '3m' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              3 Months
            </button>
            
            <button
              onClick={() => handleTimeRangeChange('6m')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                timeRange === '6m' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              6 Months
            </button>
            
            <button
              onClick={() => handleTimeRangeChange('1y')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                timeRange === '1y' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              1 Year
            </button>
            
            <button
              onClick={() => handleTimeRangeChange('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                timeRange === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Time
            </button>
            
            {timeRange === 'custom' && customDateRange && (
              <div className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm font-medium">
                Custom Range
              </div>
            )}
          </div>
          
          <div className="mt-2 lg:mt-0">
            <DateRangePicker 
              onChange={handleCustomDateRange}
              className="ml-2"
            />
          </div>
        </div>
        
        {/* Export button */}
        <div className="relative">
          <button
            onClick={() => setShowDownloadOptions(!showDownloadOptions)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
            disabled={loading}
          >
            <FiDownload className="mr-2" /> Export Data
          </button>
          
          {showDownloadOptions && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Select Format</h3>
              
              <div className="mb-4 space-y-2">
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    value="csv" 
                    checked={downloadFormat === 'csv'} 
                    onChange={() => setDownloadFormat('csv')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">CSV</span>
                </label>
                
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    value="excel" 
                    checked={downloadFormat === 'excel'} 
                    onChange={() => setDownloadFormat('excel')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Excel</span>
                </label>
                
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    value="pdf" 
                    checked={downloadFormat === 'pdf'} 
                    onChange={() => setDownloadFormat('pdf')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">PDF</span>
                </label>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setShowDownloadOptions(false)}
                  className="mr-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {isDownloading ? 'Downloading...' : 'Download'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          icon={<FiAirplay className="h-6 w-6 text-blue-500" />}
          title="Total Drones"
          value={analyticsData?.totalDrones || drones.length || 0}
          trend={{
            value: analyticsData?.droneIncrease || 0,
            label: 'vs previous period',
            direction: 'up'
          }}
          color="blue"
          loading={dronesLoading}
        />
        
        <StatCard 
          icon={<FiMapPin className="h-6 w-6 text-green-500" />}
          title="Completed Missions"
          value={analyticsData?.completedMissions || completedMissions || 0}
          trend={{
            value: analyticsData?.missionIncrease || 0,
            label: 'vs previous period',
            direction: 'up'
          }}
          color="green"
          loading={missionsLoading}
        />
        
        <StatCard 
          icon={<FiClock className="h-6 w-6 text-purple-500" />}
          title="Flight Hours"
          value={(analyticsData?.totalFlightHours || (totalFlightHours / 60)).toFixed(1)}
          trend={{
            value: analyticsData?.flightHoursIncrease || 0,
            label: 'vs previous period',
            direction: 'up'
          }}
          unit="hrs"
          color="purple"
          loading={missionsLoading}
        />
        
        <StatCard 
          icon={<FiBatteryCharging className="h-6 w-6 text-yellow-500" />}
          title="Avg. Battery Use"
          value={analyticsData?.avgBatteryConsumption || 14}
          trend={{
            value: analyticsData?.batteryEfficiencyChange || 0,
            label: 'vs previous period',
            direction: 'down'
          }}
          unit="%/hr"
          color="yellow"
          loading={dronesLoading}
        />
      </div>
      
      {/* Mission Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Mission Activity</h2>
          {missionsLoading ? (
            <div className="h-80 flex items-center justify-center">
              <LoadingSpinner size="md" text="Loading mission data..." />
            </div>
          ) : (
            <div className="h-80">
              <LineChart 
                data={analyticsData?.missionActivity || []} 
                xKey="date" 
                yKey="count"
                xLabel="Date"
                yLabel="Missions"
                color="#3B82F6"
              />
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Mission Status Distribution</h2>
            {missionsLoading ? (
                <div className="h-80 flex items-center justify-center">
                <LoadingSpinner size="md" text="Loading status data..." />
                </div>
            ) : (
                <div className="h-80">
                {/* Debug info - remove after debugging */}
                {analyticsData?.missionStatusDistribution?.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No mission status data available</p>
                    </div>
                )}
                {/* Use local data as fallback if analytics API data isn't available */}
                <PieChart 
                    data={analyticsData?.missionStatusDistribution && analyticsData?.missionStatusDistribution.length > 0 
                    ? analyticsData.missionStatusDistribution 
                    : missionStatusData}
                    nameKey="name"
                    dataKey="value"
                    colors={['#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B', '#6EE7B7']}
                    showLegend={true}
                />
                </div>
            )}
            </div>
      </div>
      
      {/* Drone Utilization and Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Drone Utilization by Model</h2>
          {dronesLoading ? (
            <div className="h-80 flex items-center justify-center">
              <LoadingSpinner size="md" text="Loading drone data..." />
            </div>
          ) : (
            <div className="h-80">
              <BarChart 
                data={analyticsData?.droneUtilizationByModel} 
                xKey="name"
                yKey="hours"
                xLabel="Drone Model"
                yLabel="Flight Hours"
                color="#8B5CF6"
              />
            </div>
          )}
        </div>
        
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Drone Fleet Map</h2>
          {dronesLoading ? (
            <div className="h-80 flex items-center justify-center">
              <LoadingSpinner size="md" text="Loading map data..." />
            </div>
          ) : (
            // Modify the MapOverview component call in AnalyticsPage.jsx
            <div className="h-80 border rounded-lg overflow-hidden">
            <MapOverview 
                drones={Array.isArray(drones) ? drones.filter(drone => 
                drone && drone.location && drone.location.coordinates && 
                Array.isArray(drone.location.coordinates) && 
                drone.location.coordinates.length === 2
                ) : []}
                missions={Array.isArray(missions) ? missions.filter(mission => 
                mission && (mission.waypoints || mission.boundingBox)
                ) : []}
                activeMissions={Array.isArray(missions) ? missions.filter(m => 
                m && m.status === 'in-progress' && (m.waypoints || m.boundingBox)
                ) : []}
                showMissions={true}
            />
            </div>
          )}
        </div>
      </div>
      
      {/* Battery Stats and Survey Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Battery Consumption Trends</h2>
          <div className="h-80">
            <LineChart 
              data={analyticsData?.batteryConsumption || []} 
              xKey="date" 
              yKey="averageConsumption"
              xLabel="Date"
              yLabel="Avg. Consumption (%/hr)"
              color="#F59E0B"
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Survey Area Coverage</h2>
          {surveysLoading ? (
            <div className="h-80 flex items-center justify-center">
              <LoadingSpinner size="md" text="Loading survey data..." />
            </div>
          ) : (
            <div className="h-80">
              <LineChart 
                data={analyticsData?.surveyCoverage || []} 
                xKey="date" 
                yKey="coverage"
                xLabel="Date"
                yLabel="Area Covered (hectares)"
                color="#10B981"
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Operator Performance and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FiUsers className="mr-2 text-blue-600" /> Top Operators
          </h2>
          <MiniTable 
            headers={['Operator', 'Completed Missions']}
            data={(analyticsData?.topOperators || []).map(op => [
              op.name,
              op.missionsCompleted.toString()
            ])}
            loading={loading}
          />
          <div className="mt-4 text-center">
            <Link
              to="/users"
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              View All Operators
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FiCpu className="mr-2 text-blue-600" /> Drone Health Status
          </h2>
          {dronesLoading ? (
            <div className="flex items-center justify-center h-40">
              <LoadingSpinner size="sm" text="Loading drone health..." />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-700 flex-1">Healthy</span>
                <span className="font-medium">
                    {analyticsData?.droneHealth?.healthy || 
                        (Array.isArray(drones) ? drones.filter(d => d.healthStatus === 'healthy').length : 0)}
                </span>
              </div>
              
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-700 flex-1">Needs Attention</span>
                <span className="font-medium">
                {analyticsData?.droneHealth?.needsAttention || 
                    (Array.isArray(drones) ? drones.filter(d => d.healthStatus === 'warning').length : 0)}
                </span>
              </div>
              
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-700 flex-1">Critical</span>
                <span className="font-medium">
                {analyticsData?.droneHealth?.critical || 
                    (Array.isArray(drones) ? drones.filter(d => d.healthStatus === 'critical').length : 0)}
                </span>
              </div>
              
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                <span className="text-sm text-gray-700 flex-1">Offline</span>
                <span className="font-medium">
                {analyticsData?.droneHealth?.offline || 
                    (Array.isArray(drones) ? drones.filter(d => d.status === 'offline').length : 0)}
                </span>
              </div>
            </div>
          )}
          <div className="mt-4">
            <Link
              to="/maintenance"
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              View Maintenance Schedule
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FiAlertTriangle className="mr-2 text-blue-600" /> Recent Alerts
          </h2>
          <div className="space-y-3">
            {(analyticsData?.recentAlerts || []).map((alert, index) => (
              <div 
                key={index}
                className={`p-3 bg-${alert.severity}-50 border-l-4 border-${alert.severity}-500 rounded-r-md`}
              >
                <p className={`text-sm font-medium text-${alert.severity}-800`}>{alert.message}</p>
                <p className="text-xs text-gray-500">{alert.time}</p>
              </div>
            ))}

            {/* Fallback alerts if none from the API */}
            {!analyticsData?.recentAlerts && (
              <>
                <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-md">
                  <p className="text-sm font-medium text-yellow-800">Battery Low on DJI Phantom #103</p>
                  <p className="text-xs text-gray-500">Today, 2:45 PM</p>
                </div>
                
                <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-md">
                  <p className="text-sm font-medium text-red-800">Signal Lost on Mavic Air #208</p>
                  <p className="text-xs text-gray-500">Yesterday, 9:12 AM</p>
                </div>
              </>
            )}
          </div>
          <div className="mt-4">
            <Link
              to="/alerts"
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              View All Alerts
            </Link>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          to="/reports/generate"
          className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 flex items-center"
        >
          <FiBarChart2 className="mr-2" /> Generate Detailed Report
        </Link>
        
        <Link
          to="/analytics/settings"
          className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md shadow hover:bg-gray-200 flex items-center"
        >
          <FiSettings className="mr-2" /> Analytics Settings
        </Link>
        
        {user && user.role === 'admin' && (
          <Link
            to="/analytics/admin"
            className="px-4 py-2 bg-gray-800 text-white rounded-md shadow hover:bg-gray-900 flex items-center"
          >
            <FiActivity className="mr-2" /> Advanced Analytics
          </Link>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;