import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiChevronDown, 
  FiRefreshCw,
  FiCheck,
  FiX,
  FiAlertTriangle, 
  FiMapPin,
  FiInfo,
  FiDownload,
  FiBatteryCharging,
  FiWifi,
  FiCpu
} from 'react-icons/fi';
import { useDrones } from '../context/DronesContext';
import { useAuth } from '../context/AuthContext';
import DroneCard from '../components/DroneCard';
import DroneListItem from '../components/DroneListItem';
import DroneStatusBadge from '../components/DroneStatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import PageHeader from '../components/PageHeader';
import SearchInput from '../components/SearchInput';
import MapOverview from '../components/MapOverview';
import EmptyState from '../components/EmptyState';
import FilterDropdown from '../components/FilterDropdown';
import DroneDetailsModal from '../components/DroneDetailsModal';

const DronesPage = () => {
  const { user } = useAuth();
  const { drones, fetchDrones, deleteDrone, loading, error } = useDrones();
  
  // State
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all'
  });
  const [sortBy, setSortBy] = useState('name'); // 'name', 'status', 'battery', 'lastActive'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [showMapView, setShowMapView] = useState(false);
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters and sorting options
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'available', label: 'Available' },
    { value: 'in-mission', label: 'In Mission' },
    { value: 'maintenance', label: 'Under Maintenance' },
    { value: 'offline', label: 'Offline' },
    { value: 'error', label: 'Error' }
  ];
  
  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'quadcopter', label: 'Quadcopter' },
    { value: 'hexacopter', label: 'Hexacopter' },
    { value: 'octocopter', label: 'Octocopter' },
    { value: 'fixed-wing', label: 'Fixed Wing' },
    { value: 'hybrid-vtol', label: 'Hybrid VTOL' }
  ];
  
  const sortOptions = [
    { value: 'name', label: 'Drone Name' },
    { value: 'status', label: 'Status' },
    { value: 'battery', label: 'Battery Level' },
    { value: 'lastActive', label: 'Last Active' }
  ];

  // Load drones data on mount
  useEffect(() => {
    fetchDrones();
  }, [fetchDrones]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDrones();
    setIsRefreshing(false);
  };

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Handle filters
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Handle sort
  const handleSortChange = (value) => {
    if (sortBy === value) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(value);
      setSortOrder('asc');
    }
  };

  // Handle drone selection for modal
  const handleDroneSelect = (drone) => {
    setSelectedDrone(drone);
    setShowModal(true);
  };

  // Handle drone deletion
  const handleDeleteDrone = async (droneId) => {
    if (window.confirm('Are you sure you want to delete this drone?')) {
      try {
        await deleteDrone(droneId);
        // Close modal if deleted drone is the selected one
        if (selectedDrone && selectedDrone._id === droneId) {
          setShowModal(false);
          setSelectedDrone(null);
        }
      } catch (err) {
        console.error('Error deleting drone:', err);
      }
    }
  };

  // Ensure drones is an array before using array methods
  const dronesArray = Array.isArray(drones) ? drones : [];

  // Stats for summary section
  const droneStats = {
    total: dronesArray.length,
    available: dronesArray.filter(drone => drone.status === 'available').length,
    inMission: dronesArray.filter(drone => drone.status === 'in-mission').length,
    maintenance: dronesArray.filter(drone => drone.status === 'maintenance').length,
    offline: dronesArray.filter(drone => drone.status === 'offline').length,
    error: dronesArray.filter(drone => drone.status === 'error').length,
  };

  // Filter and sort drones
  const filteredDrones = dronesArray.filter(drone => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      drone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drone.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drone.serial.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = filters.status === 'all' || drone.status === filters.status;
    
    // Type filter
    const matchesType = filters.type === 'all' || drone.type === filters.type;
    
    return matchesSearch && matchesStatus && matchesType;
  }).sort((a, b) => {
    // Sort logic
    if (sortBy === 'name') {
      return sortOrder === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortBy === 'status') {
      return sortOrder === 'asc'
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    } else if (sortBy === 'battery') {
      return sortOrder === 'asc'
        ? a.batteryLevel - b.batteryLevel
        : b.batteryLevel - a.batteryLevel;
    } else if (sortBy === 'lastActive') {
      const dateA = a.lastActive ? new Date(a.lastActive) : new Date(0);
      const dateB = b.lastActive ? new Date(b.lastActive) : new Date(0);
      return sortOrder === 'asc'
        ? dateA - dateB
        : dateB - dateA;
    }
    return 0;
  });

  // Render loading state
  if (loading && !isRefreshing && drones.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader 
          title="Drone Fleet" 
          description="Manage and monitor your drone fleet"
        />
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Drone Fleet" 
        description="Manage and monitor your drone fleet"
        actions={
          <Link 
            to="/drones/add" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiPlus className="mr-2" /> Add Drone
          </Link>
        }
      />
      
      {/* Error message */}
      {error && (
        <AlertMessage
          type="error"
          message={error}
          className="mb-6"
          onClose={() => { /* Implement error clearing if needed */ }}
        />
      )}
      
      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white shadow-sm rounded-lg p-4">
          <div className="text-sm text-gray-500">Total Drones</div>
          <div className="text-2xl font-bold">{droneStats.total}</div>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-4">
          <div className="text-sm text-gray-500">Available</div>
          <div className="text-2xl font-bold text-green-600">{droneStats.available}</div>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-4">
          <div className="text-sm text-gray-500">In Mission</div>
          <div className="text-2xl font-bold text-blue-600">{droneStats.inMission}</div>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-4">
          <div className="text-sm text-gray-500">Maintenance</div>
          <div className="text-2xl font-bold text-amber-500">{droneStats.maintenance}</div>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-4">
          <div className="text-sm text-gray-500">Offline</div>
          <div className="text-2xl font-bold text-gray-500">{droneStats.offline}</div>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-4">
          <div className="text-sm text-gray-500">Error</div>
          <div className="text-2xl font-bold text-red-600">{droneStats.error}</div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <SearchInput
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search drones..."
              className="w-full sm:w-64"
            />
            
            {/* Filters */}
            <div className="flex items-center gap-2">
              <FilterDropdown
                label="Status"
                value={filters.status}
                options={statusOptions}
                onChange={(value) => handleFilterChange('status', value)}
              />
              
              <FilterDropdown
                label="Type"
                value={filters.type}
                options={typeOptions}
                onChange={(value) => handleFilterChange('type', value)}
              />
              
              <FilterDropdown
                label={`Sort by: ${sortOptions.find(opt => opt.value === sortBy)?.label}`}
                value={sortBy}
                options={sortOptions}
                onChange={handleSortChange}
                afterIcon={
                  <span className="ml-1">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                }
              />
            </div>
          </div>
          
          {/* View controls */}
          <div className="flex items-center">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              title="Refresh"
            >
              <FiRefreshCw className={`${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            
            <div className="flex border rounded-md overflow-hidden ml-4">
              <button
                onClick={() => setShowMapView(false)}
                className={`px-3 py-1 flex items-center ${!showMapView ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700'}`}
              >
                <FiCpu className="mr-1" /> Fleet
              </button>
              <button
                onClick={() => setShowMapView(true)}
                className={`px-3 py-1 flex items-center ${showMapView ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700'}`}
              >
                <FiMapPin className="mr-1" /> Map
              </button>
            </div>
            
            {!showMapView && (
              <div className="flex border rounded-md overflow-hidden ml-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700'}`}
                >
                  List
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Map View */}
      {showMapView && (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="h-[600px]">
            <MapOverview 
              drones={filteredDrones} 
              onDroneSelect={handleDroneSelect}
              showMissions={false}
            />
          </div>
        </div>
      )}
      
      {/* Grid/List View */}
      {!showMapView && (
        <>
          {filteredDrones.length === 0 ? (
            <EmptyState
              title="No drones found"
              description={searchQuery || filters.status !== 'all' || filters.type !== 'all' 
                ? "Try adjusting your search or filters"
                : "Add your first drone to get started"}
              icon={<FiCpu className="w-12 h-12 text-gray-400" />}
              actionText={dronesArray.length === 0 ? "Add Drone" : null}
              actionLink={dronesArray.length === 0 ? "/drones/add" : null}
            />
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDrones.map(drone => (
                <DroneCard
                  key={drone._id}
                  drone={drone}
                  onSelect={() => handleDroneSelect(drone)}
                  onDelete={() => handleDeleteDrone(drone._id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Drone
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Battery
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Model
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDrones.map(drone => (
                    <DroneListItem
                      key={drone._id}
                      drone={drone}
                      onSelect={() => handleDroneSelect(drone)}
                      onDelete={() => handleDeleteDrone(drone._id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      
      {/* Drone Details Modal */}
      {selectedDrone && (
        <DroneDetailsModal
          drone={selectedDrone}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onEdit={() => navigate(`/drones/edit/${selectedDrone._id}`)}
          onDelete={() => handleDeleteDrone(selectedDrone._id)}
        />
      )}
    </div>
  );
};

export default DronesPage;