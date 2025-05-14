import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus,
  FiFilter,
  FiSearch,
  FiCalendar,
  FiRss,
  FiRefreshCw,
  FiGrid,
  FiList,
  FiMap,
  FiCpu,
  FiClock,
  FiCheck,
  FiX,
  FiActivity
} from 'react-icons/fi';
import { useMissions } from '../context/MissionsContext';
import { useAuth } from '../context/AuthContext';
import { useDrones } from '../context/DronesContext';
import { useSurveys } from '../context/SurveysContext';
import LoadingSpinner from '../components/LoadingSpinner';
import MissionCard from '../components/MissionCard';
import MissionTable from '../components/MissionTable';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import FilterDropdown from '../components/FilterDropdown';
import { formatDate } from '../utils/dateFormatter';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';

const MissionsPage = () => {
  const { fetchMissions, missions, loading, error } = useMissions();
  const { fetchDrones, drones } = useDrones();
  const { fetchSurveys, surveys } = useSurveys();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [displayMode, setDisplayMode] = useState('grid'); // 'grid' or 'list'
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDrone, setFilterDrone] = useState('all');
  const [filterSurvey, setFilterSurvey] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [filteredMissions, setFilteredMissions] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedMissions, setSelectedMissions] = useState([]);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [bulkAction, setBulkAction] = useState('');

  // Status options for filter
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'paused', label: 'Paused' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'date', label: 'Date (Newest First)' },
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'status', label: 'Status' },
    { value: 'drone', label: 'Drone' },
    { value: 'duration', label: 'Duration' }
  ];

  // Load missions and related data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated()) {
        await fetchMissions();
        await fetchDrones();
        await fetchSurveys();
      } else {
        navigate('/login', { replace: true });
      }
    };
    
    loadData();
  }, [fetchMissions, fetchDrones, fetchSurveys, isAuthenticated, navigate]);

  // Generate drone filter options
  const droneOptions = React.useMemo(() => {
    const options = [{ value: 'all', label: 'All Drones' }];
    
    if (drones && drones.length > 0) {
      drones.forEach(drone => {
        options.push({ value: drone._id, label: drone.name });
      });
    }
    
    return options;
  }, [drones]);
  
  // Generate survey filter options
  const surveyOptions = React.useMemo(() => {
    const options = [{ value: 'all', label: 'All Surveys' }];
    
    if (surveys && surveys.length > 0) {
      surveys.forEach(survey => {
        options.push({ value: survey._id, label: survey.name });
      });
    }
    
    return options;
  }, [surveys]);

  // Apply filters and search to missions
  useEffect(() => {
    if (!missions) return;

    let results = [...missions];

    // Filter by status
    if (filterStatus !== 'all') {
      results = results.filter(mission => mission.status === filterStatus);
    }

    // Filter by drone
    if (filterDrone !== 'all') {
      results = results.filter(mission => mission.droneId === filterDrone);
    }
    
    // Filter by survey
    if (filterSurvey !== 'all') {
      results = results.filter(mission => mission.surveyId === filterSurvey);
    }

    // Filter by date range
    if (dateRange.start && dateRange.end) {
      results = results.filter(mission => {
        const missionDate = new Date(mission.scheduledAt || mission.createdAt);
        return missionDate >= dateRange.start && missionDate <= dateRange.end;
      });
    }

    // Search by name, description, or mission ID
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        mission =>
          mission.name.toLowerCase().includes(query) ||
          (mission.description && mission.description.toLowerCase().includes(query)) ||
          mission._id.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    results.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'drone':
          const droneA = drones?.find(d => d._id === a.droneId)?.name || '';
          const droneB = drones?.find(d => d._id === b.droneId)?.name || '';
          return droneA.localeCompare(droneB);
        case 'duration':
          const durationA = a.duration || 0;
          const durationB = b.duration || 0;
          return durationB - durationA;
        case 'date':
        default:
          const dateA = new Date(a.scheduledAt || a.createdAt);
          const dateB = new Date(b.scheduledAt || b.createdAt);
          return dateB - dateA;
      }
    });

    setFilteredMissions(results);
    
    // Clear any selected missions that are no longer in the filtered list
    setSelectedMissions(prev => 
      prev.filter(id => results.some(mission => mission._id === id))
    );
  }, [missions, searchQuery, filterStatus, filterDrone, filterSurvey, sortBy, dateRange, drones]);

  // Handle creating a new mission
  const handleCreateMission = () => {
    navigate('/missions/new');
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchMissions();
  };

  // Handle filter toggle
  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // Handle filter reset
  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setFilterDrone('all');
    setFilterSurvey('all');
    setSortBy('date');
    setDateRange({ start: null, end: null });
  };
  
  // Handle mission selection (for bulk actions)
  const handleSelectMission = (missionId, isSelected) => {
    if (isSelected) {
      setSelectedMissions(prev => [...prev, missionId]);
    } else {
      setSelectedMissions(prev => prev.filter(id => id !== missionId));
    }
  };
  
  // Handle select all missions
  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedMissions(filteredMissions.map(mission => mission._id));
    } else {
      setSelectedMissions([]);
    }
  };
  
  // Show bulk action confirmation dialog
  const handleBulkAction = (action) => {
    setBulkAction(action);
    setShowBulkActionModal(true);
  };
  
  // Execute bulk action after confirmation
  const executeBulkAction = async () => {
    // Implementation depends on your mission context functions
    switch (bulkAction) {
      case 'start':
        // Start all selected missions
        // Example: await Promise.all(selectedMissions.map(id => startMission(id)));
        break;
      case 'pause':
        // Pause all selected missions
        // Example: await Promise.all(selectedMissions.map(id => pauseMission(id)));
        break;
      case 'abort':
        // Abort all selected missions
        // Example: await Promise.all(selectedMissions.map(id => abortMission(id)));
        break;
      case 'delete':
        // Delete all selected missions
        // Example: await Promise.all(selectedMissions.map(id => deleteMission(id)));
        break;
      default:
        break;
    }
    
    setShowBulkActionModal(false);
    setSelectedMissions([]);
    await fetchMissions();
  };
  
  // Navigate to monitor page for a specific mission
  const handleMonitorMission = (missionId) => {
    navigate(`/monitor/${missionId}`);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Drone Missions"
        description="Manage and monitor all your drone flight missions"
        actions={
          <button
            onClick={handleCreateMission}
            className="bg-primary-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-primary-700 transition-colors"
          >
            <FiPlus className="mr-2" />
            New Mission
          </button>
        }
      />

      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Search missions..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter button */}
            <button
              onClick={toggleFilter}
              className={`flex items-center px-3 py-2 border ${
                isFilterOpen ? 'border-primary-500 text-primary-600' : 'border-gray-300 text-gray-700'
              } rounded-md hover:bg-gray-50`}
            >
              <FiFilter className="mr-2" />
              Filter
            </button>

            {/* View toggle */}
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => setDisplayMode('grid')}
                className={`px-3 py-2 flex items-center ${
                  displayMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'bg-white text-gray-600'
                }`}
              >
                <FiGrid className="mr-1" />
                Grid
              </button>
              <button
                onClick={() => setDisplayMode('list')}
                className={`px-3 py-2 flex items-center ${
                  displayMode === 'list' ? 'bg-primary-50 text-primary-600' : 'bg-white text-gray-600'
                }`}
              >
                <FiList className="mr-1" />
                List
              </button>
            </div>

            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600"
              disabled={loading}
            >
              <FiRefreshCw className={`${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Expanded filters */}
        {isFilterOpen && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            {/* Status filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <FilterDropdown
                options={statusOptions}
                value={filterStatus}
                onChange={(value) => setFilterStatus(value)}
              />
            </div>

            {/* Drone filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Drone</label>
              <FilterDropdown
                options={droneOptions}
                value={filterDrone}
                onChange={(value) => setFilterDrone(value)}
              />
            </div>
            
            {/* Survey filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Survey</label>
              <FilterDropdown
                options={surveyOptions}
                value={filterSurvey}
                onChange={(value) => setFilterSurvey(value)}
              />
            </div>
            
            {/* Sort by */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <FilterDropdown
                options={sortOptions}
                value={sortBy}
                onChange={(value) => setSortBy(value)}
              />
            </div>

            {/* Date filter */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <div className="flex items-center">
                <FiCalendar className="mr-2 text-gray-400" />
                <input
                  type="date"
                  className="border border-gray-300 rounded-md p-2 text-sm w-full"
                  value={dateRange.start ? formatDate(dateRange.start, 'YYYY-MM-DD') : ''}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value ? new Date(e.target.value) : null })}
                />
                <span className="mx-2">to</span>
                <input
                  type="date"
                  className="border border-gray-300 rounded-md p-2 text-sm w-full"
                  value={dateRange.end ? formatDate(dateRange.end, 'YYYY-MM-DD') : ''}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value ? new Date(e.target.value) : null })}
                />
              </div>
            </div>

            {/* Reset button */}
            <div className="md:col-span-3 flex justify-end">
              <button
                onClick={handleResetFilters}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Bulk actions (if missions are selected) */}
      {selectedMissions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-blue-700 font-medium">{selectedMissions.length} mission{selectedMissions.length !== 1 ? 's' : ''} selected</span>
            <button 
              onClick={() => setSelectedMissions([])}
              className="ml-4 text-blue-600 text-sm hover:underline"
            >
              Clear selection
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleBulkAction('start')}
              className="px-3 py-1.5 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200 flex items-center"
            >
              <FiPlay className="mr-2" size={14} />
              Start
            </button>
            <button
              onClick={() => handleBulkAction('pause')}
              className="px-3 py-1.5 text-sm bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 flex items-center"
            >
              <FiPause className="mr-2" size={14} />
              Pause
            </button>
            <button
              onClick={() => handleBulkAction('abort')}
              className="px-3 py-1.5 text-sm bg-orange-100 text-orange-800 rounded-md hover:bg-orange-200 flex items-center"
            >
              <FiX className="mr-2" size={14} />
              Abort
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-3 py-1.5 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 flex items-center"
            >
              <FiTrash2 className="mr-2" size={14} />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" text="Loading missions..." />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center text-red-700">
          Error loading missions: {error}
        </div>
      ) : filteredMissions.length === 0 ? (
        <EmptyState
          title="No missions found"
          description={
            searchQuery || filterStatus !== 'all' || filterDrone !== 'all' || filterSurvey !== 'all' || dateRange.start || dateRange.end
              ? "No missions match your filters. Try adjusting your search or filters."
              : "You haven't created any missions yet."
          }
          icon={<FiMap className="h-12 w-12" />}
          actionText="Create your first mission"
          onAction={handleCreateMission}
        />
      ) : (
        <>
          {/* Results count */}
          <div className="text-sm text-gray-500 mb-4">
            Showing {filteredMissions.length} of {missions.length} missions
          </div>

          {/* Mission list */}
          {displayMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMissions.map((mission) => (
                <MissionCard 
                  key={mission._id} 
                  mission={mission}
                  drones={drones}
                  surveys={surveys}
                  isSelected={selectedMissions.includes(mission._id)}
                  onSelect={(isSelected) => handleSelectMission(mission._id, isSelected)}
                  onMonitor={() => handleMonitorMission(mission._id)}
                />
              ))}
            </div>
          ) : (
            <MissionTable 
              missions={filteredMissions}
              drones={drones}
              surveys={surveys}
              selectedMissions={selectedMissions}
              onSelectMission={handleSelectMission}
              onSelectAll={handleSelectAll}
              onMonitor={handleMonitorMission}
            />
          )}
        </>
      )}
      
      {/* Bulk action confirmation modal */}
      <ConfirmDialog
        isOpen={showBulkActionModal}
        title={`${bulkAction.charAt(0).toUpperCase() + bulkAction.slice(1)} Selected Missions`}
        message={`Are you sure you want to ${bulkAction} ${selectedMissions.length} mission${selectedMissions.length !== 1 ? 's' : ''}? This action ${bulkAction === 'delete' ? 'cannot' : 'may not'} be undone.`}
        confirmText={bulkAction.charAt(0).toUpperCase() + bulkAction.slice(1)}
        confirmButtonClass={
          bulkAction === 'delete' ? 'bg-red-600 hover:bg-red-700' : 
          bulkAction === 'abort' ? 'bg-orange-600 hover:bg-orange-700' : 
          'bg-blue-600 hover:bg-blue-700'
        }
        onConfirm={executeBulkAction}
        onCancel={() => setShowBulkActionModal(false)}
      />
    </div>
  );
};

export default MissionsPage;