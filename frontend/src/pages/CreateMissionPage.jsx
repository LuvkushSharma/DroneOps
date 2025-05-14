import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiSave, 
  FiMap, 
  FiAirplay, 
  FiSettings,
  FiCpu,
  FiTarget,
  FiInfo,
  FiGrid,
  FiCircle,
  FiEdit
} from 'react-icons/fi';
import { useMissions } from '../context/MissionsContext';
import { useDrones } from '../context/DronesContext';
import { useSurveys } from '../context/SurveysContext';
import { useAuth } from '../context/AuthContext';
import MapContainer from '../components/MapContainer';
import WaypointsList from '../components/WaypointsList';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import FormInput from '../components/FormInput';
import FormTextArea from '../components/FormTextArea';
import FormSelect from '../components/FormSelect';
import TagInput from '../components/TagInput';
import AlertMessage from '../components/AlertMessage';

const CreateMissionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const queryParams = new URLSearchParams(location.search);
  const surveyIdParam = queryParams.get('surveyId');
  
  const { isAuthenticated } = useAuth();
  const { createMission, getMissionDetails, updateMission, generateMissionFromPattern } = useMissions();
  const { fetchDrones, drones: dronesData, loading: dronesLoading } = useDrones();
  const { getSurveyDetails, activeSurvey } = useSurveys();

  const drones = Array.isArray(dronesData) ? dronesData : [];

  // Check if this is an edit mode
  const isEditMode = Boolean(id);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    missionType: 'survey',
    surveyPattern: 'grid',
    altitude: 50,
    speed: 5,
    overlapPercentage: 60,
    activeSensors: ['rgb'],
    drone: '',
    surveyId: surveyIdParam || '',
    estimatedDuration: 15,
    waypoints: []
  });
  
  // Map state
  const [mapCenter, setMapCenter] = useState({ lat: 21.7679, lng: 78.8718 });
  const [mapZoom, setMapZoom] = useState(5);
  const [surveyBoundary, setSurveyBoundary] = useState([]);

  // Sensor options
  const sensorOptions = [
    { value: 'rgb', label: 'RGB Camera' },
    { value: 'thermal', label: 'Thermal Camera' },
    { value: 'multispectral', label: 'Multispectral Camera' },
    { value: 'lidar', label: 'LiDAR' }
  ];

  // Mission type options
  const missionTypeOptions = [
    { value: 'survey', label: 'Area Survey' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'surveillance', label: 'Surveillance' },
    { value: 'delivery', label: 'Delivery' }
  ];

  // Survey pattern options
  const surveyPatternOptions = [
    { value: 'grid', label: 'Grid Pattern' },
    { value: 'crosshatch', label: 'Crosshatch Pattern' },
    { value: 'perimeter', label: 'Perimeter Patrol' },
    { value: 'spiral', label: 'Spiral Pattern' },
    { value: 'custom', label: 'Custom Waypoints' }
  ];

  // Load data on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    const loadData = async () => {
      setLoading(true);
      
      try {
        // Load drones if not already loaded
        if (!drones.length) {
          await fetchDrones();
        }
        
        // If surveyId is provided, load survey details
        if (surveyIdParam) {
          const { success, survey } = await getSurveyDetails(surveyIdParam);
          
          if (success && survey && survey.boundary) {
            // Set survey boundary and center map on it
            const coordinates = survey.boundary.coordinates[0];
            setSurveyBoundary(coordinates);
            
            // Calculate center of boundary
            if (coordinates && coordinates.length > 0) {
              const lats = coordinates.map(coord => coord[1]);
              const lngs = coordinates.map(coord => coord[0]);
              
              const centerLat = (Math.max(...lats) + Math.min(...lats)) / 2;
              const centerLng = (Math.max(...lngs) + Math.min(...lngs)) / 2;
              
              setMapCenter({ lat: centerLat, lng: centerLng });
              setMapZoom(14);
            }
          }
        }
        
        // If in edit mode, load mission details
        if (isEditMode) {
          const mission = await getMissionDetails(id);
          
          if (mission) {
            setFormData({
              name: mission.name || '',
              description: mission.description || '',
              missionType: mission.missionType || 'survey',
              surveyPattern: mission.surveyPattern || 'grid',
              altitude: mission.altitude || 50,
              speed: mission.speed || 5,
              overlapPercentage: mission.overlapPercentage || 60,
              activeSensors: mission.activeSensors || ['rgb'],
              drone: mission.drone || '',
              surveyId: mission.surveyId || surveyIdParam || '',
              estimatedDuration: mission.estimatedDuration || 15,
              waypoints: mission.waypoints || []
            });
            
            if (mission.waypoints && mission.waypoints.length > 0) {
              // Center map on first waypoint
              const firstWaypoint = mission.waypoints[0];
              setMapCenter({ 
                lat: firstWaypoint.location.coordinates[1], 
                lng: firstWaypoint.location.coordinates[0] 
              });
              setMapZoom(14);
            }
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setSaveError(error.message || 'Failed to load required data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [
    isAuthenticated, navigate, location.pathname, isEditMode, id,
    surveyIdParam, fetchDrones, getSurveyDetails, getMissionDetails, drones.length
  ]);

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    // Handle number inputs
    const processedValue = type === 'number' ? parseFloat(value) : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Clear error if any
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSensorChange = (e) => {
    const { value, checked } = e.target;
    
    setFormData(prev => {
      const updatedSensors = checked
        ? [...prev.activeSensors, value]
        : prev.activeSensors.filter(sensor => sensor !== value);
        
      return {
        ...prev,
        activeSensors: updatedSensors
      };
    });
  };

  const handleWaypointsChange = (newWaypoints) => {
    setFormData(prev => ({
      ...prev,
      waypoints: newWaypoints
    }));
    
    if (formErrors.waypoints) {
      setFormErrors(prev => ({ ...prev, waypoints: '' }));
    }
  };
  
  const handleSurveyPatternChange = (e) => {
    setFormData(prev => ({
      ...prev,
      surveyPattern: e.target.value
    }));
    
    // If changing to custom, don't clear waypoints
    // If changing to a generated pattern, clear existing waypoints
    if (e.target.value !== 'custom') {
      setFormData(prev => ({
        ...prev,
        waypoints: []
      }));
    }
  };

  // Generate waypoints from pattern
  const generateWaypoints = async () => {
    if (!surveyBoundary || surveyBoundary.length < 3) {
      setSaveError('A valid survey boundary is required to generate waypoints');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const patternData = {
        pattern: formData.surveyPattern,
        boundary: {
          type: 'Polygon',
          coordinates: [surveyBoundary]
        },
        altitude: formData.altitude,
        speed: formData.speed,
        overlap: formData.overlapPercentage
      };
      
      const result = await generateMissionFromPattern(patternData);
      
      if (result.success) {
        setFormData(prev => ({
          ...prev,
          waypoints: result.waypoints
        }));
      } else {
        setSaveError(result.error || 'Failed to generate waypoints');
      }
    } catch (error) {
      setSaveError('Error generating waypoints: ' + (error.message || 'Unknown error'));
    } finally {
      setIsGenerating(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Mission name is required';
    }
    
    if (!formData.drone) {
      errors.drone = 'Please select a drone';
    }
    
    if (formData.surveyPattern === 'custom' && (!formData.waypoints || formData.waypoints.length < 2)) {
      errors.waypoints = 'Custom pattern requires at least 2 waypoints';
    }
    
    if (formData.altitude <= 0) {
      errors.altitude = 'Altitude must be greater than 0';
    }
    
    if (formData.speed <= 0) {
      errors.speed = 'Speed must be greater than 0';
    }
    
    return errors;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset states
    setSaveError('');
    setIsSuccess(false);
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Prepare mission data
      const missionData = {
        ...formData,
        // Format waypoints properly if needed
        waypoints: formData.waypoints.map((wp, index) => ({
          order: index + 1,
          location: {
            type: 'Point',
            coordinates: [wp.lng, wp.lat]
          },
          altitude: wp.altitude || formData.altitude,
          action: wp.action || 'takePhoto'
        }))
      };
      
      let result;
      
      if (isEditMode) {
        result = await updateMission(id, missionData);
      } else {
        result = await createMission(missionData);
      }
      
      if (result.success) {
        setIsSuccess(true);
        setTimeout(() => {
          if (formData.surveyId) {
            navigate(`/surveys/${formData.surveyId}`);
          } else {
            navigate(`/missions/${result.mission._id}`);
          }
        }, 1500);
      } else {
        setSaveError(result.error || 'Failed to save mission');
      }
    } catch (error) {
      setSaveError('Error saving mission: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || dronesLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading..." />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title={isEditMode ? 'Edit Mission' : 'Create New Mission'}
        description={isEditMode 
          ? 'Update mission parameters and flight path' 
          : 'Define a new drone mission with waypoints and parameters'}
        backLink={formData.surveyId ? `/surveys/${formData.surveyId}` : '/missions'}
        backText={formData.surveyId ? 'Back to Survey' : 'Back to Missions'}
      />
      
      {/* Alert messages */}
      {saveError && (
        <AlertMessage 
          type="error" 
          message={saveError}
          className="mb-6"
          onClose={() => setSaveError('')}
        />
      )}
      
      {isSuccess && (
        <AlertMessage 
          type="success" 
          message={`Mission ${isEditMode ? 'updated' : 'created'} successfully!`}
          className="mb-6"
        />
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic information section */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FiInfo className="mr-2 text-primary-600" /> Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Mission Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              error={formErrors.name}
              placeholder="Enter mission name"
            />
            
            <FormSelect
              label="Mission Type"
              name="missionType"
              value={formData.missionType}
              onChange={handleInputChange}
              options={missionTypeOptions}
            />
            
            <FormTextArea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter mission details and purpose"
              className="md:col-span-2"
              rows={3}
            />
            
            <FormSelect
              label="Drone"
              name="drone"
              value={formData.drone}
              onChange={handleInputChange}
              options={[
                { value: '', label: 'Select a drone' },
                ...drones
                  .filter(drone => drone.status === 'available')
                  .map(drone => ({ value: drone._id, label: drone.name }))
              ]}
              error={formErrors.drone}
              required
            />
            
            {formData.surveyId ? (
              <div className="flex items-center">
                <div className="text-sm text-gray-500">
                  This mission is part of survey: <strong>{activeSurvey?.name || 'Loading...'}</strong>
                </div>
              </div>
            ) : (
              <FormSelect
                label="Associated Survey (Optional)"
                name="surveyId"
                value={formData.surveyId}
                onChange={handleInputChange}
                options={[
                  { value: '', label: 'None - Independent mission' },
                  // Add survey options here if needed
                ]}
              />
            )}
          </div>
        </div>
        
        {/* Flight parameters section */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FiSettings className="mr-2 text-primary-600" /> Flight Parameters
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormSelect
              label="Survey Pattern"
              name="surveyPattern"
              value={formData.surveyPattern}
              onChange={handleSurveyPatternChange}
              options={surveyPatternOptions}
            />
            
            <FormInput
              label="Altitude (meters)"
              type="number"
              name="altitude"
              min="1"
              value={formData.altitude}
              onChange={handleInputChange}
              error={formErrors.altitude}
            />
            
            <FormInput
              label="Speed (m/s)"
              type="number"
              name="speed"
              min="0.1"
              step="0.1"
              value={formData.speed}
              onChange={handleInputChange}
              error={formErrors.speed}
            />
            
            <FormInput
              label="Estimated Duration (minutes)"
              type="number"
              name="estimatedDuration"
              min="1"
              value={formData.estimatedDuration}
              onChange={handleInputChange}
            />
            
            <FormInput
              label="Overlap Percentage (%)"
              type="number"
              name="overlapPercentage"
              min="0"
              max="90"
              value={formData.overlapPercentage}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Active Sensors
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {sensorOptions.map(sensor => (
                <div key={sensor.value} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`sensor-${sensor.value}`}
                    name="activeSensors"
                    value={sensor.value}
                    checked={formData.activeSensors.includes(sensor.value)}
                    onChange={handleSensorChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`sensor-${sensor.value}`} className="ml-2 text-sm text-gray-700">
                    {sensor.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Map section */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <FiMap className="mr-2 text-primary-600" /> Flight Path
            </h2>
            
            {surveyBoundary.length > 0 && formData.surveyPattern !== 'custom' && (
              <button
                type="button"
                onClick={generateWaypoints}
                disabled={isGenerating}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <LoadingSpinner size="xs" className="mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    {formData.surveyPattern === 'grid' && <FiGrid className="mr-1" />}
                    {formData.surveyPattern === 'crosshatch' && <FiGrid className="mr-1" />}
                    {formData.surveyPattern === 'spiral' && <FiCircle className="mr-1" />}
                    {formData.surveyPattern === 'perimeter' && <FiTarget className="mr-1" />}
                    Generate {formData.surveyPattern.charAt(0).toUpperCase() + formData.surveyPattern.slice(1)} Path
                  </>
                )}
              </button>
            )}
          </div>
          
          {formData.surveyPattern === 'custom' && (
            <p className="text-sm text-gray-500 mb-4">
              Click on the map to add waypoints. Drag waypoints to adjust their position.
            </p>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="h-96 border border-gray-300 rounded-lg">
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  waypoints={formData.waypoints}
                  onWaypointsChange={handleWaypointsChange}
                  boundary={surveyBoundary}
                  pattern={formData.surveyPattern !== 'custom' ? formData.surveyPattern : null}
                  editable={formData.surveyPattern === 'custom'}
                />
              </div>
            </div>
            
            <div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-96 overflow-y-auto">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <FiTarget className="mr-1" /> Waypoints
                </h3>
                
                {formData.waypoints.length > 0 ? (
                  <WaypointsList
                    waypoints={formData.waypoints}
                    onChange={handleWaypointsChange}
                    editable={formData.surveyPattern === 'custom'}
                  />
                ) : (
                  <div className="text-center py-6 text-gray-500 italic">
                    {formData.surveyPattern === 'custom' ? (
                      <p>Click on the map to add waypoints</p>
                    ) : (
                      <p>Click "Generate Path" to create waypoints</p>
                    )}
                  </div>
                )}
                
                {formErrors.waypoints && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.waypoints}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => formData.surveyId ? navigate(`/surveys/${formData.surveyId}`) : navigate('/missions')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <LoadingSpinner size="sm" color="white" className="mr-2" />
                Saving...
              </>
            ) : (
              <>
                <FiSave className="mr-2" />
                {isEditMode ? 'Update Mission' : 'Create Mission'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMissionPage;