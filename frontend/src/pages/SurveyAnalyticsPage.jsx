import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft,
  FiDownload,
  FiCalendar,
  FiMap,
  FiCpu,
  FiClock,
  FiTrendingUp,
  FiGrid,
  FiCamera,
  FiChevronDown,
  FiChevronUp,
  FiUsers,
  FiFileText,
  FiBatteryCharging,
  FiBarChart2
} from 'react-icons/fi';
import { useSurveys } from '../context/SurveysContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
// Replace the missing AreaCoverageMap with MapContainer
import MapContainer from '../components/MapContainer';
import LineChart from '../components/LineChart';
import BarChart from '../components/BarChart';
import PieChart from '../components/PieChart';
import StatCard from '../components/StatCard';
import ImageGrid from '../components/ImageGrid';
import PageHeader from '../components/PageHeader';
import { formatDate, formatDateTime, formatDuration } from '../utils/dateFormatter';
import surveyService from '../services/surveyService';

const SurveyAnalyticsPage = () => {
  const { id } = useParams();
  const { getSurveyById, activeSurvey, loading: surveyLoading } = useSurveys();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Analytics state
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('all');
  const [expandedSection, setExpandedSection] = useState('coverage');
  const [downloadFormat, setDownloadFormat] = useState('csv');
  const [isDownloading, setIsDownloading] = useState(false);
  const [reportType, setReportType] = useState('summary');
  const [showFormatSelector, setShowFormatSelector] = useState(false);
  
  // Fetch survey details and analytics data
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated()) {
        navigate('/login', { replace: true });
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Get basic survey info
        await getSurveyById(id);
        
        // Get survey analytics
        const analytics = await surveyService.getSurveyAnalytics(id);
        setAnalyticsData(analytics);
      } catch (err) {
        console.error('Error fetching survey analytics:', err);
        setError(err.message || 'Failed to load survey analytics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, getSurveyById, isAuthenticated, navigate]);
  
  // Filter analytics data by time range
  const getFilteredData = () => {
    if (!analyticsData) return null;
    
    if (timeRange === 'all') {
      return analyticsData;
    }
    
    // Clone the data
    const filtered = { ...analyticsData };
    
    // Filter time series data
    if (filtered.timeSeries) {
      const cutoffDate = new Date();
      switch (timeRange) {
        case 'day':
          cutoffDate.setDate(cutoffDate.getDate() - 1);
          break;
        case 'week':
          cutoffDate.setDate(cutoffDate.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(cutoffDate.getMonth() - 1);
          break;
        case 'year':
          cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
          break;
        default:
          break;
      }
      
      // Filter each time series by date
      Object.keys(filtered.timeSeries).forEach(key => {
        filtered.timeSeries[key] = filtered.timeSeries[key].filter(
          item => new Date(item.date) >= cutoffDate
        );
      });
    }
    
    return filtered;
  };
  
  const filteredData = getFilteredData();
  
  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  
  // Handle report download
  const handleDownload = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    try {
      const blob = await surveyService.downloadSurveyData(id, downloadFormat);
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `survey_${id}_data.${downloadFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      setShowFormatSelector(false);
    } catch (err) {
      console.error('Error downloading report:', err);
    } finally {
      setIsDownloading(false);
    }
  };
  
  // Generate PDF report
  const handleGenerateReport = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    try {
      const blob = await surveyService.generateSurveyReport(id);
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `survey_${id}_report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Show loading spinner while data is being fetched
  if (loading || surveyLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" text="Loading survey analytics..." />
      </div>
    );
  }
  
  // Show error if there's an issue
  if (error || !activeSurvey) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <h2 className="text-xl font-bold text-red-700 mb-2">Error loading survey analytics</h2>
          <p className="text-red-600 mb-4">{error || 'Survey not found'}</p>
          <Link to="/surveys" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <FiArrowLeft className="mr-2" /> Go back to surveys
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page Header */}
      <PageHeader
        title={`Analytics: ${activeSurvey.name}`}
        description={`Detailed insights and metrics for this survey project`}
        backLink={`/surveys/${id}`}
        backText="Back to Survey Details"
      />
      
      {/* Main content */}
      <div className="mb-8">
        {/* Time range and download controls */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          {/* Time Range Selector */}
          <div className="flex items-center">
            <span className="text-gray-600 mr-2">Time Range:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Time</option>
              <option value="day">Last 24 Hours</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
            </select>
          </div>
          
          {/* Download and Report Options */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <button
                onClick={() => setShowFormatSelector(!showFormatSelector)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-sm font-medium"
              >
                <FiDownload className="mr-2" />
                Download Data
                <FiChevronDown className="ml-2" />
              </button>
              
              {showFormatSelector && (
                <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1" role="menu">
                    {['csv', 'json', 'kml', 'geojson'].map((format) => (
                      <button
                        key={format}
                        className={`block w-full text-left px-4 py-2 text-sm ${downloadFormat === format ? 'bg-gray-100 text-primary-600' : 'text-gray-700'} hover:bg-gray-100`}
                        onClick={() => {
                          setDownloadFormat(format);
                          setShowFormatSelector(false);
                          handleDownload();
                        }}
                      >
                        .{format.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={handleGenerateReport}
              disabled={isDownloading}
              className="flex items-center px-4 py-2 border border-primary-600 text-primary-600 rounded-md bg-white hover:bg-primary-50 text-sm font-medium"
            >
              <FiFileText className="mr-2" />
              Generate PDF Report
              {isDownloading && <LoadingSpinner size="xs" color="primary" className="ml-2" />}
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Area Covered"
            value={filteredData?.summary?.areaCovered || 0}
            unit="sq km"
            icon={<FiMap className="h-5 w-5" />}
            color="primary"
          />
          
          <StatCard
            title="Total Flight Time"
            value={formatDuration(filteredData?.summary?.totalFlightTime || 0, true)}
            icon={<FiClock className="h-5 w-5" />}
            color="info"
          />
          
          <StatCard
            title="Images Captured"
            value={filteredData?.summary?.totalImages || 0}
            icon={<FiCamera className="h-5 w-5" />}
            color="success"
          />
          
          <StatCard
            title="Missions Completed"
            value={filteredData?.summary?.missionsCompleted || 0}
            unit={`of ${filteredData?.summary?.totalMissions || 0}`}
            icon={<FiTrendingUp className="h-5 w-5" />}
            color="warning"
          />
        </div>
        
        {/* Coverage Map Section */}
        <section className="bg-white rounded-lg shadow-sm mb-8 overflow-hidden">
          <div 
            className="flex justify-between items-center p-4 cursor-pointer"
            onClick={() => toggleSection('coverage')}
          >
            <h2 className="text-lg font-medium text-gray-800 flex items-center">
              <FiMap className="mr-2 text-primary-600" />
              Area Coverage Analysis
            </h2>
            {expandedSection === 'coverage' ? <FiChevronUp /> : <FiChevronDown />}
          </div>
          
          {expandedSection === 'coverage' && (
            <div className="p-4 border-t border-gray-100">
              <div className="h-96">
                {filteredData?.coverage ? (
                  <MapContainer
                    center={activeSurvey.site?.location?.coordinates ? 
                      {
                        lat: activeSurvey.site.location.coordinates[1],
                        lng: activeSurvey.site.location.coordinates[0]
                      } : 
                      undefined
                    }
                    zoom={13}
                    boundary={activeSurvey.boundary?.coordinates?.[0] || []}
                    coverage={filteredData.coverage.heatmap || []}
                    showHeatmap={true}
                    editable={false}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-50 text-gray-500">
                    No coverage data available
                  </div>
                )}
              </div>
              
              {filteredData?.coverage && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-xs text-gray-500">Coverage Percentage</p>
                    <p className="text-lg font-medium">{filteredData.coverage.percentage || 0}%</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-xs text-gray-500">Overlap</p>
                    <p className="text-lg font-medium">{filteredData.coverage.overlap || 0}%</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-xs text-gray-500">Resolution</p>
                    <p className="text-lg font-medium">{filteredData.coverage.resolution || 'N/A'} cm/px</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-xs text-gray-500">Data Quality</p>
                    <p className="text-lg font-medium">{filteredData.coverage.quality || 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
        
        {/* Flight Performance Section */}
        <section className="bg-white rounded-lg shadow-sm mb-8 overflow-hidden">
          <div 
            className="flex justify-between items-center p-4 cursor-pointer"
            onClick={() => toggleSection('performance')}
          >
            <h2 className="text-lg font-medium text-gray-800 flex items-center">
              <FiTrendingUp className="mr-2 text-blue-600" />
              Flight Performance
            </h2>
            {expandedSection === 'performance' ? <FiChevronUp /> : <FiChevronDown />}
          </div>
          
          {expandedSection === 'performance' && (
            <div className="p-4 border-t border-gray-100">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Altitude Chart */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-600 mb-4">Flight Altitude Over Time</h3>
                  <div className="h-64">
                    {filteredData?.timeSeries?.altitude ? (
                      <LineChart
                        data={filteredData.timeSeries.altitude}
                        xKey="date"
                        yKey="value"
                        xLabel="Time"
                        yLabel="Altitude (meters)"
                        color="#3b82f6"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No altitude data available
                      </div>
                    )}
                  </div>
                </div>

                {/* Speed Chart */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-600 mb-4">Flight Speed Over Time</h3>
                  <div className="h-64">
                    {filteredData?.timeSeries?.speed ? (
                      <LineChart
                        data={filteredData.timeSeries.speed}
                        xKey="date"
                        yKey="value"
                        xLabel="Time"
                        yLabel="Speed (m/s)"
                        color="#10b981"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No speed data available
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Battery Usage */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-600 mb-4">Battery Consumption</h3>
                  <div className="h-64">
                    {filteredData?.timeSeries?.battery ? (
                      <LineChart
                        data={filteredData.timeSeries.battery}
                        xKey="date"
                        yKey="value"
                        xLabel="Time"
                        yLabel="Battery (%)"
                        color="#f59e0b"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No battery data available
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Distance Traveled */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-600 mb-4">Distance Traveled</h3>
                  <div className="h-64">
                    {filteredData?.timeSeries?.distance ? (
                      <LineChart
                        data={filteredData.timeSeries.distance}
                        xKey="date"
                        yKey="value"
                        xLabel="Time"
                        yLabel="Distance (km)"
                        color="#6366f1"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No distance data available
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Performance metrics summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="bg-white border border-gray-200 p-3 rounded-md">
                  <p className="text-xs text-gray-500">Average Altitude</p>
                  <p className="text-lg font-medium">
                    {filteredData?.performance?.avgAltitude?.toFixed(1) || 'N/A'} m
                  </p>
                </div>
                <div className="bg-white border border-gray-200 p-3 rounded-md">
                  <p className="text-xs text-gray-500">Average Speed</p>
                  <p className="text-lg font-medium">
                    {filteredData?.performance?.avgSpeed?.toFixed(1) || 'N/A'} m/s
                  </p>
                </div>
                <div className="bg-white border border-gray-200 p-3 rounded-md">
                  <p className="text-xs text-gray-500">Battery Usage</p>
                  <p className="text-lg font-medium">
                    {filteredData?.performance?.batteryUsage || 'N/A'} %
                  </p>
                </div>
                <div className="bg-white border border-gray-200 p-3 rounded-md">
                  <p className="text-xs text-gray-500">Total Distance</p>
                  <p className="text-lg font-medium">
                    {filteredData?.performance?.totalDistance?.toFixed(2) || 'N/A'} km
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
        
        {/* Drone Usage Section */}
        <section className="bg-white rounded-lg shadow-sm mb-8 overflow-hidden">
          <div 
            className="flex justify-between items-center p-4 cursor-pointer"
            onClick={() => toggleSection('drones')}
          >
            <h2 className="text-lg font-medium text-gray-800 flex items-center">
              <FiCpu className="mr-2 text-green-600" />
              Drone Usage Analysis
            </h2>
            {expandedSection === 'drones' ? <FiChevronUp /> : <FiChevronDown />}
          </div>
          
          {expandedSection === 'drones' && (
            <div className="p-4 border-t border-gray-100">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Drone Usage Chart */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-600 mb-4">Flight Time by Drone</h3>
                  <div className="h-64">
                    {filteredData?.droneAnalytics?.usage && filteredData.droneAnalytics.usage.length > 0 ? (
                      <BarChart
                        data={filteredData.droneAnalytics.usage}
                        xKey="droneName"
                        yKey="flightTime"
                        xLabel="Drone"
                        yLabel="Flight Time (mins)"
                        color="#10b981"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No drone usage data available
                      </div>
                    )}
                  </div>
                </div>

                {/* Battery Efficiency Chart */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-600 mb-4">Battery Efficiency by Drone</h3>
                  <div className="h-64">
                    {filteredData?.droneAnalytics?.batteryEfficiency && filteredData.droneAnalytics.batteryEfficiency.length > 0 ? (
                      <BarChart
                        data={filteredData.droneAnalytics.batteryEfficiency}
                        xKey="droneName"
                        yKey="efficiencyScore"
                        xLabel="Drone"
                        yLabel="Battery Efficiency Score"
                        color="#6366f1"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No battery efficiency data available
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Drone usage table */}
              {filteredData?.droneAnalytics?.details && filteredData.droneAnalytics.details.length > 0 ? (
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Drone
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Missions
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Flight Time
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Distance
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Battery Usage
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Images
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredData.droneAnalytics.details.map((drone) => (
                        <tr key={drone.droneId}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center">
                                <FiCpu className="text-gray-500" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{drone.droneName}</div>
                                <div className="text-xs text-gray-500">{drone.model}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {drone.missionCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDuration(drone.flightTime, true)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {drone.distance?.toFixed(2)} km
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {drone.batteryConsumption}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {drone.imagesCaptured}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No detailed drone data available
                </div>
              )}
            </div>
          )}
        </section>
        
        {/* Image Analysis Section */}
        <section className="bg-white rounded-lg shadow-sm mb-8 overflow-hidden">
          <div 
            className="flex justify-between items-center p-4 cursor-pointer"
            onClick={() => toggleSection('imagery')}
          >
            <h2 className="text-lg font-medium text-gray-800 flex items-center">
              <FiCamera className="mr-2 text-purple-600" />
              Image Analysis
            </h2>
            {expandedSection === 'imagery' ? <FiChevronUp /> : <FiChevronDown />}
          </div>
          
          {expandedSection === 'imagery' && (
            <div className="p-4 border-t border-gray-100">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Image Distribution Chart */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-600 mb-4">Image Distribution by Mission</h3>
                  <div className="h-64">
                    {filteredData?.imageAnalytics?.distribution ? (
                      <PieChart
                        data={filteredData.imageAnalytics.distribution}
                        nameKey="name"
                        valueKey="count"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No image distribution data available
                      </div>
                    )}
                  </div>
                </div>

                {/* Image Quality Chart */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-600 mb-4">Image Quality Assessment</h3>
                  <div className="h-64">
                    {filteredData?.imageAnalytics?.qualityScores ? (
                      <BarChart
                        data={filteredData.imageAnalytics.qualityScores}
                        xKey="category"
                        yKey="score"
                        xLabel="Quality Metric"
                        yLabel="Score"
                        color="#8b5cf6"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No image quality data available
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Image gallery preview */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-600 mb-4">Sample Images</h3>
                {filteredData?.imageAnalytics?.sampleImages && filteredData.imageAnalytics.sampleImages.length > 0 ? (
                  <div>
                    <ImageGrid images={filteredData.imageAnalytics.sampleImages} maxDisplay={8} />
                    <div className="mt-4 text-right">
                      <Link 
                        to={`/surveys/${id}/imagery`} 
                        className="text-primary-600 hover:text-primary-800 text-sm font-medium inline-flex items-center"
                      >
                        View all images
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    No sample images available
                  </div>
                )}
              </div>
              
              {/* Image metrics summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="bg-white border border-gray-200 p-3 rounded-md">
                  <p className="text-xs text-gray-500">Total Images</p>
                  <p className="text-lg font-medium">
                    {filteredData?.imageAnalytics?.totalCount || 0}
                  </p>
                </div>
                <div className="bg-white border border-gray-200 p-3 rounded-md">
                  <p className="text-xs text-gray-500">Average Resolution</p>
                  <p className="text-lg font-medium">
                    {filteredData?.imageAnalytics?.avgResolution || 'N/A'}
                  </p>
                </div>
                <div className="bg-white border border-gray-200 p-3 rounded-md">
                  <p className="text-xs text-gray-500">File Size</p>
                  <p className="text-lg font-medium">
                    {filteredData?.imageAnalytics?.totalSize ? 
                      (filteredData.imageAnalytics.totalSize / 1024).toFixed(2) + ' GB' : 
                      'N/A'}
                  </p>
                </div>
                <div className="bg-white border border-gray-200 p-3 rounded-md">
                  <p className="text-xs text-gray-500">Average Quality Score</p>
                  <p className="text-lg font-medium">
                    {filteredData?.imageAnalytics?.avgQualityScore ?
                      filteredData.imageAnalytics.avgQualityScore.toFixed(1) + '/10' :
                      'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SurveyAnalyticsPage;