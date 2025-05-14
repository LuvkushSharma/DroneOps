import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiSave, 
  FiMap, 
  FiCalendar, 
  FiTag,
  FiInfo,
  FiCheck,
  FiX
} from 'react-icons/fi';
import { useSurveys } from '../context/SurveysContext';
import { useAuth } from '../context/AuthContext';
import MapDrawingTool from '../components/MapDrawingTool';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import FormInput from '../components/FormInput';
import FormTextArea from '../components/FormTextArea';
import FormSelect from '../components/FormSelect';
import TagInput from '../components/TagInput';
import AlertMessage from '../components/AlertMessage';

const CreateSurveyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { createSurvey, getSurveyDetails, updateSurvey, activeSurvey, loading } = useSurveys();
  
  // Check if this is an edit mode
  const isEditMode = Boolean(id);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    site: {
      name: '',
      location: {
        type: 'Point',
        coordinates: [0, 0]
      }
    },
    startDate: '',
    endDate: '',
    frequency: 'once',
    tags: [],
    objectives: ''
  });
  
  const [boundary, setBoundary] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Load survey data if in edit mode
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    const loadSurvey = async () => {
      if (isEditMode) {
        try {
          const { success, survey, error } = await getSurveyDetails(id);
          
          if (success && survey) {
            setFormData({
              name: survey.name || '',
              description: survey.description || '',
              site: survey.site || {
                name: '',
                location: {
                  type: 'Point',
                  coordinates: [0, 0]
                }
              },
              startDate: survey.startDate ? new Date(survey.startDate).toISOString().split('T')[0] : '',
              endDate: survey.endDate ? new Date(survey.endDate).toISOString().split('T')[0] : '',
              frequency: survey.frequency || 'once',
              tags: survey.tags || [],
              objectives: survey.objectives || ''
            });
            
            if (survey.boundary && survey.boundary.coordinates) {
              setBoundary(survey.boundary.coordinates[0]);
            }
          } else {
            setSaveError(error || 'Failed to load survey details');
          }
        } catch (err) {
          setSaveError('Error loading survey: ' + (err.message || 'Unknown error'));
        }
      }
    };
    
    loadSurvey();
  }, [isAuthenticated, navigate, location.pathname, isEditMode, id, getSurveyDetails]);

  // Form input handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested site properties
    if (name.startsWith('site.')) {
      const siteProp = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        site: {
          ...prev.site,
          [siteProp]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field if any
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTagsChange = (tags) => {
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  const handleBoundaryChange = (newBoundary) => {
    setBoundary(newBoundary);
    
    if (formErrors.boundary) {
      setFormErrors(prev => ({
        ...prev,
        boundary: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Survey name is required';
    }
    
    if (!formData.site.name.trim()) {
      errors['site.name'] = 'Site name is required';
    }
    
    if (boundary.length < 3) {
      errors.boundary = 'Please draw a valid boundary on the map (at least 3 points)';
    }
    
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (end < start) {
        errors.endDate = 'End date cannot be before start date';
      }
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
      // Prepare data for API
      const surveyData = {
        ...formData,
        boundary: {
          type: 'Polygon',
          coordinates: [boundary]
        }
      };
      
      let result;
      
      if (isEditMode) {
        result = await updateSurvey(id, surveyData);
      } else {
        result = await createSurvey(surveyData);
      }
      
      if (result.success) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate(`/surveys/${result.survey._id}`);
        }, 1500);
      } else {
        setSaveError(result.error || 'Failed to save survey');
      }
    } catch (err) {
      setSaveError('Error saving survey: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title={isEditMode ? 'Edit Survey' : 'Create New Survey'}
        description={isEditMode 
          ? 'Update survey details and coverage area' 
          : 'Define a new survey project and its coverage area'}
        backLink="/surveys"
        backText="Back to Surveys"
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
          message={`Survey ${isEditMode ? 'updated' : 'created'} successfully!`}
          className="mb-6"
        />
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic information section */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FiInfo className="mr-2 text-primary-600" /> Basic Information
          </h2>
          
          <div className="grid grid-cols-1 gap-6">
            <FormInput
              label="Survey Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              error={formErrors.name}
              placeholder="Enter survey name"
            />
            
            <FormTextArea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the purpose and goals of this survey"
              rows={3}
            />
            
            <FormInput
              label="Site Name"
              name="site.name"
              value={formData.site.name}
              onChange={handleInputChange}
              required
              error={formErrors['site.name']}
              placeholder="Enter site name"
            />
            
            <TagInput
              label="Tags"
              tags={formData.tags}
              onChange={handleTagsChange}
              placeholder="Add tags (press Enter after each tag)"
            />
            
            <FormTextArea
              label="Survey Objectives"
              name="objectives"
              value={formData.objectives}
              onChange={handleInputChange}
              placeholder="List the main objectives of this survey"
              rows={3}
            />
          </div>
        </div>
        
        {/* Schedule section */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FiCalendar className="mr-2 text-primary-600" /> Survey Schedule
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Start Date"
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              error={formErrors.startDate}
            />
            
            <FormInput
              label="End Date"
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              error={formErrors.endDate}
            />
            
            <FormSelect
              label="Frequency"
              name="frequency"
              value={formData.frequency}
              onChange={handleInputChange}
              options={[
                { value: 'once', label: 'One-time survey' },
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'biweekly', label: 'Bi-weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'quarterly', label: 'Quarterly' }
              ]}
            />
          </div>
        </div>
        
        {/* Map section */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FiMap className="mr-2 text-primary-600" /> Survey Area
          </h2>
          
          <p className="text-sm text-gray-500 mb-4">
            Draw the boundary of your survey area on the map. Click to add points, and close the shape to complete.
          </p>
          
          {/* Update the map container to fix overflow issues */}
          <div className="h-96 rounded-lg border border-gray-300 mb-2 overflow-hidden relative">
            <MapDrawingTool
              boundary={boundary}
              onChange={handleBoundaryChange}
              center={formData.site.location.coordinates.length === 2 
                ? {lat: formData.site.location.coordinates[1], lng: formData.site.location.coordinates[0]} 
                : null}
              editable={true}
            />
          </div>
          
          {formErrors.boundary && (
            <p className="mt-2 text-sm text-red-600">{formErrors.boundary}</p>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/surveys')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <LoadingSpinner size="sm" color="gray" className="mr-2" />
                Saving...
              </>
            ) : (
              <>
                <FiSave className="mr-2" />
                {isEditMode ? 'Update Survey' : 'Create Survey'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSurveyPage;