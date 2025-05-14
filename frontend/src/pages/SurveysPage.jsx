import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiFilter, FiDownload, FiSearch, FiCalendar, FiMapPin, FiGrid, FiList } from 'react-icons/fi';
import { useSurveys } from '../context/SurveysContext';
import { useAuth } from '../context/AuthContext';
import SurveyCard from '../components/SurveyCard';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import { getSurveyStatusColors } from '../utils/statusColorHelper';
import { formatDate } from '../utils/dateFormatter';

const SurveysPage = () => {
  const { fetchSurveys, surveys, loading, error } = useSurveys();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // State
  const [filteredSurveys, setFilteredSurveys] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: '/surveys' } });
    }
  }, [isAuthenticated, navigate]);

  // Fetch surveys on component mount
  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  // Filter and sort surveys when dependencies change
  useEffect(() => {

    if (!surveys || !Array.isArray(surveys)) {
        setFilteredSurveys([]);
        return;
      }
    
    let result = [...surveys];
    
    // Apply search filter
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      result = result.filter(survey => 
        survey.name.toLowerCase().includes(searchTermLower) ||
        survey.description?.toLowerCase().includes(searchTermLower) ||
        survey.location?.toLowerCase().includes(searchTermLower)
      );
    }
    
    // Apply status filter
    if (selectedStatus) {
      result = result.filter(survey => survey.status === selectedStatus);
    }
    
    // Apply date range filter
    if (dateRange.startDate) {
      const startDate = new Date(dateRange.startDate);
      result = result.filter(survey => new Date(survey.createdAt) >= startDate);
    }
    
    if (dateRange.endDate) {
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999); // End of day
      result = result.filter(survey => new Date(survey.createdAt) <= endDate);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'name':
          valueA = a.name || '';
          valueB = b.name || '';
          break;
        case 'status':
          valueA = a.status || '';
          valueB = b.status || '';
          break;
        case 'missions':
          valueA = a.missionCount || 0;
          valueB = b.missionCount || 0;
          break;
        case 'createdAt':
        default:
          valueA = new Date(a.createdAt || 0);
          valueB = new Date(b.createdAt || 0);
          break;
      }
      
      if (typeof valueA === 'string') {
        return sortOrder === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else {
        return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
      }
    });
    
    setFilteredSurveys(result);
  }, [surveys, searchTerm, selectedStatus, dateRange, sortBy, sortOrder]);

  // Get paginated surveys
  const paginatedSurveys = filteredSurveys.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Event handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatusFilterChange = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setDateRange({ startDate: '', endDate: '' });
    setCurrentPage(1);
    setIsFilterModalOpen(false);
  };

  // Status options for filter
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'failed', label: 'Failed' }
  ];

  // Export surveys to CSV
  const exportSurveys = () => {
    const headers = ['Name', 'Status', 'Location', 'Missions', 'Created Date', 'Description'];
    
    const csvData = filteredSurveys.map(survey => [
      survey.name,
      survey.status,
      survey.location || 'N/A',
      survey.missionCount || 0,
      formatDate(survey.createdAt),
      survey.description || 'N/A'
    ]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `surveys-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render loading state
  if (loading && (!surveys || !surveys.length)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Surveys</h1>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading surveys..." />
        </div>
      </div>
    );
  }

  // Render error state
  if (error && (!surveys || !surveys.length)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Surveys</h1>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading surveys</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => fetchSurveys()}
                  className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-100"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Surveys</h1>
        
        <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <FiFilter className="mr-2 h-4 w-4" />
            Filters
          </button>
          
          <button
            onClick={exportSurveys}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <FiDownload className="mr-2 h-4 w-4" />
            Export
          </button>
          
          <Link
            to="/surveys/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            New Survey
          </Link>
        </div>
      </div>

      {/* Search and view options */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative rounded-md shadow-sm w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search surveys..."
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">View:</span>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
              aria-label="Grid view"
            >
              <FiGrid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
              aria-label="List view"
            >
              <FiList className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Status pills for quick filtering */}
        <div className="mt-4 flex flex-wrap gap-2">
          {statusOptions.map(option => (
            <button
              key={option.value}
              onClick={() => handleStatusFilterChange(option.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium 
                ${selectedStatus === option.value
                  ? 'bg-primary-100 text-primary-800 border border-primary-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Results summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-gray-500 mb-4">
        <p>
          Showing <span className="font-medium">{filteredSurveys.length}</span> surveys
          {selectedStatus && <span> with status <span className="font-medium capitalize">{selectedStatus.replace('_', ' ')}</span></span>}
        </p>
        
        {loading && <span className="mt-2 sm:mt-0">Refreshing data...</span>}
      </div>

      {/* Surveys grid/list */}
      {filteredSurveys.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <FiMapPin className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No surveys found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || selectedStatus || dateRange.startDate ? 
              'Try adjusting your search or filters to find what you\'re looking for.' : 
              'Start by creating your first survey.'}
          </p>
          <div className="mt-6">
            <Link
              to="/surveys/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              <FiPlus className="mr-2 h-4 w-4" />
              New Survey
            </Link>
          </div>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedSurveys.map(survey => (
                <SurveyCard 
                  key={survey._id} 
                  survey={survey} 
                  onDelete={() => {/* Handle delete */}}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <button
                        className="group inline-flex items-center"
                        onClick={() => handleSortChange('name')}
                      >
                        Name
                        <span className={`ml-2 ${sortBy === 'name' ? 'text-gray-900' : 'text-gray-400 invisible group-hover:visible'}`}>
                          {sortBy === 'name' && sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <button
                        className="group inline-flex items-center"
                        onClick={() => handleSortChange('status')}
                      >
                        Status
                        <span className={`ml-2 ${sortBy === 'status' ? 'text-gray-900' : 'text-gray-400 invisible group-hover:visible'}`}>
                          {sortBy === 'status' && sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Location
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <button
                        className="group inline-flex items-center"
                        onClick={() => handleSortChange('missions')}
                      >
                        Missions
                        <span className={`ml-2 ${sortBy === 'missions' ? 'text-gray-900' : 'text-gray-400 invisible group-hover:visible'}`}>
                          {sortBy === 'missions' && sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <button
                        className="group inline-flex items-center"
                        onClick={() => handleSortChange('createdAt')}
                      >
                        Created
                        <span className={`ml-2 ${sortBy === 'createdAt' ? 'text-gray-900' : 'text-gray-400 invisible group-hover:visible'}`}>
                          {sortBy === 'createdAt' && sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      </button>
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedSurveys.map((survey) => {
                    const statusColors = getSurveyStatusColors(survey.status);
                    return (
                      <tr key={survey._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <Link to={`/surveys/${survey._id}`} className="text-sm font-medium text-gray-900 hover:text-primary-600">
                                {survey.name}
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                            {survey.status?.replace('_', ' ') || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {survey.location || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {survey.missionCount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(survey.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to={`/surveys/${survey._id}`}
                            className="text-primary-600 hover:text-primary-900 mr-4"
                          >
                            View
                          </Link>
                          <Link
                            to={`/surveys/edit/${survey._id}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {filteredSurveys.length > itemsPerPage && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredSurveys.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      {/* Filter Modal */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filter Surveys"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Created Date Range</label>
            <div className="mt-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="startDate" className="text-xs text-gray-500">From:</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiCalendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="startDate"
                    id="startDate"
                    value={dateRange.startDate}
                    onChange={handleDateRangeChange}
                    className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="endDate" className="text-xs text-gray-500">To:</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiCalendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="endDate"
                    id="endDate"
                    value={dateRange.endDate}
                    onChange={handleDateRangeChange}
                    min={dateRange.startDate}
                    className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={() => setIsFilterModalOpen(false)}
          >
            Apply Filters
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default SurveysPage;