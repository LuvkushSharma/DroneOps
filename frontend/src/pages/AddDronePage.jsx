import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiSave, 
  FiInfo, 
  FiCheckCircle,
  FiAlertTriangle,
  FiSettings,
  FiMapPin,
  FiCamera,
  FiTool,
  FiCpu,
  FiUsers
} from 'react-icons/fi';
import { useDrones } from '../context/DronesContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import FormInput from '../components/FormInput';
import FormTextArea from '../components/FormTextArea';
import FormSelect from '../components/FormSelect';
import AlertMessage from '../components/AlertMessage';
import TagInput from '../components/TagInput';
import MapLocationPicker from '../components/MapLocationPicker';

const AddDronePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { addDrone, updateDrone, getDroneDetails, loading: droneLoading } = useDrones();
  
  // Determine if we are in edit mode
  const isEditMode = Boolean(id);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    serial: '',
    manufacturer: '',
    organization: 'FlytBase', // Default organization - ADDED THIS FIELD
    description: '',
    type: 'quadcopter',
    status: 'idle', // Changed default to 'idle' to match backend enum
    batteryLevel: 100,
    maxFlightTime: 30,
    maxSpeed: 15,
    maxAltitude: 120,
    maxRange: 5000,
    weight: 1.5,
    dimensions: {
      length: 30,
      width: 30,
      height: 15
    },
    sensorTypes: ['rgb'],
    location: {
      type: 'Point',
      coordinates: [77.216721, 28.644800] // Default to New Delhi
    },
    notes: ''
  });
  
  // UI state
  const [loading, setLoading] = useState(isEditMode);
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Drone types and status options
  const droneTypes = [
    { value: 'quadcopter', label: 'Quadcopter' },
    { value: 'hexacopter', label: 'Hexacopter' },
    { value: 'octocopter', label: 'Octocopter' },
    { value: 'fixed-wing', label: 'Fixed Wing' },
    { value: 'hybrid-vtol', label: 'Hybrid VTOL' }
  ];
  
  // UPDATED: Match status options with the backend enum values in Drone.js
  const statusOptions = [
    { value: 'idle', label: 'Available' },
    { value: 'flying', label: 'In Mission' },
    { value: 'maintenance', label: 'Under Maintenance' },
    { value: 'offline', label: 'Offline' },
    { value: 'error', label: 'Error' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'charging', label: 'Charging' }
  ];
  
  const sensorOptions = [
    { value: 'rgb', label: 'RGB Camera' },
    { value: 'thermal', label: 'Thermal Camera' },
    { value: 'multispectral', label: 'Multispectral Camera' },
    { value: 'lidar', label: 'LiDAR' },
    { value: 'gas', label: 'Gas Sensors' },
    { value: 'hyperspectral', label: 'Hyperspectral Camera' }
  ];
  
  // Load drone data if in edit mode
  useEffect(() => {
    const fetchDroneData = async () => {
      if (isEditMode) {
        try {
          setLoading(true);
          const { success, drone: droneData }  = await getDroneDetails(id);
          
          if (success && droneData) {
            // Format the data for form fields
            setFormData({
              name: droneData.name || '',
              model: droneData.model || '',
              serial: droneData.serialNumber || '', // Map to match backend field
              manufacturer: droneData.manufacturer || '',
              organization: droneData.organization || 'FlytBase', // ADDED THIS FIELD
              description: droneData.description || '',
              type: droneData.type || 'quadcopter',
              status: droneData.status || 'idle', // Changed default to 'idle'
              batteryLevel: droneData.batteryLevel || 100,
              maxFlightTime: droneData.specifications?.maxFlightTime || 30,
              maxSpeed: droneData.specifications?.maxSpeed || 15,
              maxAltitude: droneData.specifications?.maxAltitude || 120,
              maxRange: droneData.specifications?.maxRange || 5000,
              weight: droneData.specifications?.weight || 1.5,
              dimensions: droneData.specifications?.dimensions || {
                length: 30,
                width: 30,
                height: 15
              },
              sensorTypes: droneData.sensorTypes || ['rgb'],
              location: droneData.lastLocation || {
                type: 'Point',
                coordinates: [77.216721, 28.644800]
              },
              notes: droneData.notes || ''
            });
          } else {
            setSubmitError('Drone not found');
            navigate('/drones');
          }
        } catch (error) {
          console.error('Error fetching drone:', error);
          setSubmitError(error.message || 'Failed to load drone data');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchDroneData();
  }, [isEditMode, id, getDroneDetails, navigate]);
  
  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Drone name is required';
    }
    
    if (!formData.model.trim()) {
      errors.model = 'Model is required';
    }
    
    if (!formData.serial.trim()) {
      errors.serial = 'Serial number is required';
    }
    
    if (!formData.organization.trim()) {
      errors.organization = 'Organization is required';
    }
    
    if (formData.batteryLevel < 0 || formData.batteryLevel > 100) {
      errors.batteryLevel = 'Battery level must be between 0 and 100';
    }
    
    if (formData.maxFlightTime <= 0) {
      errors.maxFlightTime = 'Max flight time must be greater than 0';
    }
    
    if (formData.weight <= 0) {
      errors.weight = 'Weight must be greater than 0';
    }
    
    if (formData.sensorTypes.length === 0) {
      errors.sensorTypes = 'At least one sensor type is required';
    }
    
    return errors;
  };
  
  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // Reset error state
    setSubmitError('');
    setIsSubmitting(true);
    
    try {
      let result;
      
      if (isEditMode) {
        result = await updateDrone(id, formData);
      } else {
        result = await addDrone(formData);
      }
      
      if (result && result.success) {
        setShowSuccessMessage(true);
        
        // Redirect after a brief delay
        setTimeout(() => {
          navigate(`/drones/${result.drone._id}`);
        }, 1500);
      } else {
        setSubmitError(result?.error || 'An error occurred while saving the drone');
      }
    } catch (error) {
      console.error('Error saving drone:', error);
      setSubmitError(error.message || 'Failed to save drone');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
const handleInputChange = (e) => {
  const { name, value } = e.target;
  
  // Handle nested properties like dimensions.length
  if (name.includes('.')) {
    const [parent, child] = name.split('.');
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: value
      }
    }));
  } else {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }
};

// Handle sensor checkbox changes
const handleSensorChange = (e) => {
  const { value, checked } = e.target;
  
  setFormData(prev => {
    if (checked) {
      // Add sensor to the list if checked
      return {
        ...prev,
        sensorTypes: [...prev.sensorTypes, value]
      };
    } else {
      // Remove sensor from the list if unchecked
      return {
        ...prev,
        sensorTypes: prev.sensorTypes.filter(sensor => sensor !== value)
      };
    }
  });
};

// Handle location changes from the map component
const handleLocationChange = (location) => {
  setFormData(prev => ({
    ...prev,
    location: {
      type: 'Point',
      coordinates: [location.lng, location.lat]
    }
  }));
};
  
  // Show loading spinner while fetching drone data
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center">
        <Link 
          to="/drones" 
          className="mr-4 text-gray-600 hover:text-gray-800"
        >
          <FiArrowLeft className="text-xl" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Drone' : 'Add New Drone'}
        </h1>
      </div>
      
      {/* Success message */}
      {showSuccessMessage && (
        <AlertMessage 
          type="success"
          message={`Drone ${isEditMode ? 'updated' : 'added'} successfully!`}
          className="mb-6"
        />
      )}
      
      {/* Error message */}
      {submitError && (
        <AlertMessage 
          type="error"
          message={submitError}
          onClose={() => setSubmitError('')}
          className="mb-6"
        />
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FiInfo className="mr-2 text-blue-600" /> Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput 
              label="Drone Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              error={formErrors.name}
              placeholder="Enter a name for this drone"
            />
            
            <FormInput 
              label="Model"
              name="model"
              value={formData.model}
              onChange={handleInputChange}
              required
              error={formErrors.model}
              placeholder="e.g., DJI Phantom 4 Pro"
            />
            
            <FormInput 
              label="Serial Number"
              name="serial"
              value={formData.serial}
              onChange={handleInputChange}
              required
              error={formErrors.serial}
              placeholder="Enter serial number"
            />
            
            {/* ADDED: Organization field */}
            <FormInput 
              label="Organization"
              name="organization"
              value={formData.organization}
              onChange={handleInputChange}
              required
              error={formErrors.organization}
              placeholder="Enter organization name"
            />
            
            <FormInput 
              label="Manufacturer"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleInputChange}
              placeholder="e.g., DJI, Parrot, Skydio"
            />
            
            <FormSelect
              label="Drone Type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              options={droneTypes}
            />
            
            <FormSelect
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              options={statusOptions}
              required
              error={formErrors.status}
            />
            
            <FormTextArea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter a brief description of this drone"
              className="md:col-span-2"
              rows={3}
            />
          </div>
        </div>
        
        {/* Technical Specifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FiSettings className="mr-2 text-blue-600" /> Technical Specifications
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormInput 
              label="Battery Level (%)"
              type="number"
              name="batteryLevel"
              value={formData.batteryLevel}
              onChange={handleInputChange}
              min="0"
              max="100"
              error={formErrors.batteryLevel}
            />
            
            <FormInput 
              label="Max Flight Time (minutes)"
              type="number"
              name="maxFlightTime"
              value={formData.maxFlightTime}
              onChange={handleInputChange}
              min="1"
              step="0.1"
              error={formErrors.maxFlightTime}
            />
            
            <FormInput 
              label="Max Speed (m/s)"
              type="number"
              name="maxSpeed"
              value={formData.maxSpeed}
              onChange={handleInputChange}
              min="0"
              step="0.1"
            />
            
            <FormInput 
              label="Max Altitude (meters)"
              type="number"
              name="maxAltitude"
              value={formData.maxAltitude}
              onChange={handleInputChange}
              min="0"
              step="1"
            />
            
            <FormInput 
              label="Max Range (meters)"
              type="number"
              name="maxRange"
              value={formData.maxRange}
              onChange={handleInputChange}
              min="0"
              step="10"
            />
            
            <FormInput 
              label="Weight (kg)"
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              min="0.1"
              step="0.1"
              error={formErrors.weight}
            />
          </div>
          
          <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">Dimensions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormInput 
              label="Length (cm)"
              type="number"
              name="dimensions.length"
              value={formData.dimensions.length}
              onChange={handleInputChange}
              min="0"
              step="0.1"
            />
            
            <FormInput 
              label="Width (cm)"
              type="number"
              name="dimensions.width"
              value={formData.dimensions.width}
              onChange={handleInputChange}
              min="0"
              step="0.1"
            />
            
            <FormInput 
              label="Height (cm)"
              type="number"
              name="dimensions.height"
              value={formData.dimensions.height}
              onChange={handleInputChange}
              min="0"
              step="0.1"
            />
          </div>
        </div>
        
        {/* Sensors and Equipment */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FiCamera className="mr-2 text-blue-600" /> Sensors & Equipment
          </h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sensor Types
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2">
              {sensorOptions.map(option => (
                <div key={option.value} className="flex items-center">
                  <input 
                    type="checkbox"
                    id={`sensor-${option.value}`}
                    name="sensorTypes"
                    value={option.value}
                    checked={formData.sensorTypes.includes(option.value)}
                    onChange={handleSensorChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`sensor-${option.value}`} className="ml-2 text-sm text-gray-700">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
            {formErrors.sensorTypes && (
              <p className="mt-1 text-sm text-red-600">{formErrors.sensorTypes}</p>
            )}
          </div>
          
          <FormTextArea
            label="Additional Notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Enter any additional information about this drone's equipment"
            rows={3}
          />
        </div>
        
        {/* Current Location */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FiMapPin className="mr-2 text-blue-600" /> Current Location
          </h2>
          
          <p className="text-sm text-gray-500 mb-4">
            Set the current location of the drone by clicking on the map or searching for a location.
          </p>
          
          <div className="h-96 border border-gray-300 rounded-lg overflow-hidden">
            <MapLocationPicker
              initialLocation={{
                lat: formData.location.coordinates[1], 
                lng: formData.location.coordinates[0]
              }}
              onChange={handleLocationChange}
            />
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Link
            to="/drones"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </Link>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" color="white" className="mr-2" />
                Saving...
              </>
            ) : (
              <>
                <FiSave className="mr-2" />
                {isEditMode ? 'Update Drone' : 'Save Drone'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDronePage;