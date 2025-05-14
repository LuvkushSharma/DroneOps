import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiEdit, 
  FiTrash2, 
  FiPower,
  FiCheckCircle,
  FiAlertTriangle,
  FiMap,
  FiList,
  FiCpu,
  FiBattery,
  FiWifi,
  FiGrid,
  FiClock,
  FiCalendar
} from 'react-icons/fi';
import { useDrones } from '../context/DronesContext';
import { useMissions } from '../context/MissionsContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import MapContainer from '../components/MapContainer';
import MissionCard from '../components/MissionCard';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatDateTime, getRelativeTime } from '../utils/dateFormatter';

const DroneDetailsPage = () => {
  const { id } = useParams();
  const { getDroneDetails, deleteDrone, updateDroneStatus } = useDrones();
  const { fetchMissions } = useMissions();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [drone, setDrone] = useState(null);
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [controlModalOpen, setControlModalOpen] = useState(false);
  const [tab, setTab] = useState('overview'); // 'overview', 'missions', 'telemetry', 'maintenance'
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    const loadDroneData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch drone details
        const droneData = await getDroneDetails(id);
        if (!droneData) {
          throw new Error('Drone not found');
        }
        
        setDrone(droneData);
        
        // Fetch missions associated with this drone
        const { success, missions: missionsData } = await fetchMissions({ droneId: id });
        
        if (success) {
          setMissions(missionsData);
        }
        
      } catch (err) {
        console.error('Error loading drone data:', err);
        setError(err.message || 'Failed to load drone details');
      } finally {
        setLoading(false);
      }
    };
    
    loadDroneData();
  }, [id, getDroneDetails, fetchMissions]);
  
  // Handle drone deletion
  const handleDelete = async () => {
    try {
      await deleteDrone(id);
      setDeleteModalOpen(false);
      navigate('/drones');
    } catch (err) {
      console.error('Error deleting drone:', err);
      setError(err.message || 'Failed to delete drone');
    }
  };

  // Handle drone status update
  const handleStatusUpdate = async (newStatus) => {
    try {
      setIsUpdatingStatus(true);
      await updateDroneStatus(id, newStatus);
      setDrone(prev => ({ ...prev, status: newStatus }));
      setControlModalOpen(false);
    } catch (err) {
      console.error('Error updating drone status:', err);
      setError(err.message || 'Failed to update drone status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !drone) {
    return (
      <div className="bg-white shadow rounded-lg p-8 max-w-2xl mx-auto mt-8">
        <div className="flex flex-col items-center text-center">
          <FiAlertTriangle className="text-5xl text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Drone</h2>
          <p className="text-gray-600 mb-6">{error || 'Drone not found'}</p>
          <Link 
            to="/drones"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Drones
          </Link>
        </div>
      </div>
    );
  }

  const DroneStatusColors = {
    'available': 'bg-green-100 text-green-800',
    'in-mission': 'bg-blue-100 text-blue-800',
    'maintenance': 'bg-yellow-100 text-yellow-800',
    'offline': 'bg-gray-100 text-gray-800',
    'error': 'bg-red-100 text-red-800'
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Link to="/drones" className="mr-4 text-gray-500 hover:text-gray-700">
            <FiArrowLeft className="text-xl" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">{drone.name}</h1>
          <span className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${DroneStatusColors[drone.status] || 'bg-gray-100 text-gray-800'}`}>
            {drone.status}
          </span>
        </div>
        
        <div className="flex space-x-2">
          {user?.role === 'admin' && (
            <>
              <button
                className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                onClick={() => setControlModalOpen(true)}
              >
                <FiPower className="mr-2" />
                Control
              </button>
              
              <Link
                to={`/drones/edit/${drone._id}`}
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
              >
                <FiEdit className="mr-2" />
                Edit
              </Link>
              
              <button
                className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                onClick={() => setDeleteModalOpen(true)}
              >
                <FiTrash2 className="mr-2" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setTab('overview')}
            className={`py-4 px-1 ${tab === 'overview' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setTab('missions')}
            className={`py-4 px-1 ${tab === 'missions' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Missions
          </button>
          <button
            onClick={() => setTab('telemetry')}
            className={`py-4 px-1 ${tab === 'telemetry' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Telemetry
          </button>
          <button
            onClick={() => setTab('maintenance')}
            className={`py-4 px-1 ${tab === 'maintenance' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Maintenance
          </button>
        </nav>
      </div>

      {/* Content based on selected tab */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="bg-white rounded-lg shadow overflow-hidden col-span-2">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Drone Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-500 text-sm">Serial Number</p>
                  <p className="font-medium">{drone.serial}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Model</p>
                  <p className="font-medium">{drone.model}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Battery Level</p>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-4">
                      <div 
                        className={`h-4 rounded-full ${
                          drone.batteryLevel > 70 ? 'bg-green-500' : 
                          drone.batteryLevel > 30 ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }`}
                        style={{ width: `${drone.batteryLevel}%` }}
                      ></div>
                    </div>
                    <span className="ml-2">{drone.batteryLevel}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Max Flight Time</p>
                  <p className="font-medium">{drone.maxFlightTime} minutes</p>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mb-3">Sensor Equipment</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {drone.sensorTypes ? (
                  drone.sensorTypes.map((sensor, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {sensor}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">No sensors listed</span>
                )}
              </div>
              
              <h3 className="text-lg font-medium mb-3">Current Location</h3>
                <div className="h-64 border rounded-lg overflow-hidden mb-4">
                  <MapContainer 
                    center={drone.location?.coordinates?.length >= 2 ? 
                      { lat: Number(drone.location.coordinates[1]), lng: Number(drone.location.coordinates[0]) } : 
                      { lat: 21.7679, lng: 78.8718 } // Default to center of India if no coordinates
                    }
                    zoom={drone.location?.coordinates?.length >= 2 ? 14 : 5}
                    markers={drone.location?.coordinates?.length >= 2 ? [
                      {
                        position: { 
                          lat: Number(drone.location.coordinates[1]), 
                          lng: Number(drone.location.coordinates[0])  
                        },
                        title: drone.name || 'Drone'
                      }
                    ] : []}
                  />
                </div>
              <p className="text-gray-500 text-sm">
                Altitude: {drone.altitude} meters | Speed: {drone.speed} m/s
              </p>
            </div>
          </div>

          {/* Status Card */}
          <div>
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Status</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <FiBattery className="mr-3 text-gray-500" />
                    <div>
                      <p className="font-medium">Battery Status</p>
                      <p className={`text-sm ${
                        drone.batteryLevel > 70 ? 'text-green-600' : 
                        drone.batteryLevel > 30 ? 'text-yellow-600' : 
                        'text-red-600'
                      }`}>
                        {drone.batteryLevel > 70 ? 'Good' : 
                         drone.batteryLevel > 30 ? 'Average' : 
                         'Low'} ({drone.batteryLevel}%)
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <FiWifi className="mr-3 text-gray-500" />
                    <div>
                      <p className="font-medium">Connection</p>
                      <p className={`text-sm ${drone.status === 'offline' ? 'text-red-600' : 'text-green-600'}`}>
                        {drone.status === 'offline' ? 'Offline' : 'Connected'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <FiCpu className="mr-3 text-gray-500" />
                    <div>
                      <p className="font-medium">System Health</p>
                      <p className={`text-sm ${drone.status === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                        {drone.status === 'error' ? 'System Error' : 'All Systems Normal'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                {missions.length > 0 ? (
                  <div className="space-y-4">
                    {missions.slice(0, 3).map(mission => (
                      <div key={mission._id} className="border-l-4 border-blue-500 pl-4">
                        <p className="font-medium">{mission.name}</p>
                        <p className="text-gray-500 text-sm">{getRelativeTime(mission.createdAt)}</p>
                      </div>
                    ))}
                    <Link 
                      to={`/missions?drone=${drone._id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium block mt-2"
                    >
                      View all missions
                    </Link>
                  </div>
                ) : (
                  <p className="text-gray-500">No recent missions</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'missions' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Missions</h2>
              <Link
                to={`/missions/create?drone=${drone._id}`}
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
              >
                <FiPlusCircle className="mr-2" />
                New Mission
              </Link>
            </div>
            
            {missions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {missions.map(mission => (
                  <MissionCard key={mission._id} mission={mission} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">No missions found for this drone</p>
                <Link
                  to={`/missions/create?drone=${drone._id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create First Mission
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'telemetry' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Live Telemetry</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="border rounded-lg p-4">
                <h3 className="text-gray-500 text-sm mb-1">Battery</h3>
                <p className="text-2xl font-bold">{drone.batteryLevel}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div 
                    className={`h-2.5 rounded-full ${
                      drone.batteryLevel > 70 ? 'bg-green-500' : 
                      drone.batteryLevel > 30 ? 'bg-yellow-500' : 
                      'bg-red-500'
                    }`}
                    style={{ width: `${drone.batteryLevel}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="text-gray-500 text-sm mb-1">Altitude</h3>
                <p className="text-2xl font-bold">{drone.altitude} m</p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="text-gray-500 text-sm mb-1">Speed</h3>
                <p className="text-2xl font-bold">{drone.speed} m/s</p>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mb-4">Location History</h3>
            <div className="h-96 border rounded-lg overflow-hidden">
              <MapContainer 
                center={drone.location?.coordinates ? 
                  { lat: drone.location.coordinates[1], lng: drone.location.coordinates[0] } : 
                  { lat: 0, lng: 0 }
                }
                zoom={14}
                markers={[
                  {
                    position: { 
                      lat: drone.location?.coordinates[1] || 0, 
                      lng: drone.location?.coordinates[0] || 0 
                    },
                    title: drone.name
                  }
                ]}
                // Add path visualization here if you have location history data
              />
            </div>
          </div>
        </div>
      )}

      {tab === 'maintenance' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Maintenance History</h2>
            
            {/* Sample maintenance history - replace with actual data */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technician</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2023-04-15</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Routine
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Battery replacement</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">John Smith</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2023-02-10</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Repair
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Propeller replacement</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Jane Doe</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2023-01-05</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Inspection
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Annual inspection</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Mike Johnson</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Schedule Maintenance</h3>
              {user?.role === 'admin' || user?.role === 'operator' ? (
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => {/* Implement maintenance scheduling */}}
                >
                  Schedule Maintenance
                </button>
              ) : (
                <p className="text-gray-500">You don't have permission to schedule maintenance</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Drone"
      >
        <div className="p-6">
          <p className="mb-6 text-gray-700">
            Are you sure you want to delete {drone.name}? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Drone Control Modal */}
      <Modal
        isOpen={controlModalOpen}
        onClose={() => setControlModalOpen(false)}
        title="Drone Control"
      >
        <div className="p-6">
          <p className="mb-6 text-gray-700">
            Change status for {drone.name}:
          </p>
          <div className="space-y-3 mb-6">
            {['available', 'maintenance', 'offline'].map(status => (
              <button
                key={status}
                className={`w-full py-2 px-4 text-left rounded ${
                  drone.status === status ? 
                  'bg-blue-100 border border-blue-500' : 
                  'border hover:bg-gray-50'
                }`}
                onClick={() => handleStatusUpdate(status)}
                disabled={isUpdatingStatus}
              >
                <div className="flex items-center">
                  {status === 'available' && <FiCheckCircle className="mr-2 text-green-500" />}
                  {status === 'maintenance' && <FiAlertTriangle className="mr-2 text-yellow-500" />}
                  {status === 'offline' && <FiPower className="mr-2 text-red-500" />}
                  <span className="capitalize">{status}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              onClick={() => setControlModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DroneDetailsPage;