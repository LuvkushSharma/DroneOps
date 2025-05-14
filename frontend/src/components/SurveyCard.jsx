import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiCalendar, 
  FiMapPin, 
  FiClock, 
  FiCheck, 
  FiCpu, 
  FiMap,
  FiAlertCircle,
  FiFileText,
  FiMoreVertical
} from 'react-icons/fi';
import moment from 'moment';

/**
 * SurveyCard component for displaying survey summary information
 * 
 * @param {Object} props
 * @param {Object} props.survey - Survey data object
 * @param {boolean} props.minimal - Whether to show a minimal version of the card
 * @param {Function} props.onDelete - Function to call when delete is requested
 */
const SurveyCard = ({ survey, minimal = false, onDelete }) => {
  // Get status color based on status value
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    return moment(dateString).format('MMM D, YYYY');
  };
  
  // Calculate completion percentage based on missions
  const getCompletionPercentage = () => {
    if (!survey.missions || survey.missions.length === 0) return 0;
    
    const completedMissions = survey.missions.filter(
      mission => mission.status === 'completed'
    ).length;
    
    return Math.round((completedMissions / survey.missions.length) * 100);
  };
  
  // Handle menu actions
  const handleMenuAction = (action) => {
    if (action === 'delete' && onDelete) {
      onDelete(survey._id);
    }
  };
  
  // If minimal is true, return a simplified card
  if (minimal) {
    return (
      <Link to={`/surveys/${survey._id}`} className="block">
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
          <div className="flex justify-between">
            <h3 className="font-medium text-gray-900 truncate">{survey.name}</h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(survey.status)}`}>
              {survey.status}
            </span>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <FiMapPin className="mr-1" />
            <span>{survey.site?.name || 'No site specified'}</span>
          </div>
          {survey.scheduledDate && (
            <div className="mt-1 flex items-center text-sm text-gray-500">
              <FiCalendar className="mr-1" />
              <span>{formatDate(survey.scheduledDate)}</span>
            </div>
          )}
        </div>
      </Link>
    );
  }
  
  // Return full card
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <Link to={`/surveys/${survey._id}`} className="block">
            <h3 className="text-lg font-medium text-gray-900 hover:text-primary-600 transition-colors duration-200">
              {survey.name}
            </h3>
          </Link>
          
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(survey.status)}`}>
              {survey.status}
            </span>
            
            <div className="relative ml-2">
              <button className="p-1 rounded-full text-gray-400 hover:text-gray-500">
                <FiMoreVertical />
              </button>
              {/* Dropdown menu would go here */}
            </div>
          </div>
        </div>
        
        <div className="mt-2 text-sm text-gray-500">
          {survey.description && (
            <p className="line-clamp-2">{survey.description}</p>
          )}
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <FiMapPin className="mr-2 text-gray-400" />
            <span className="text-sm text-gray-700">{survey.site?.name || 'No site specified'}</span>
          </div>
          
          <div className="flex items-center">
            <FiCalendar className="mr-2 text-gray-400" />
            <span className="text-sm text-gray-700">
              {survey.scheduledDate ? formatDate(survey.scheduledDate) : 'Not scheduled'}
            </span>
          </div>
          
          <div className="flex items-center">
            <FiClock className="mr-2 text-gray-400" />
            <span className="text-sm text-gray-700">
              {survey.estimatedDuration ? `${survey.estimatedDuration} min` : 'Duration N/A'}
            </span>
          </div>
          
          <div className="flex items-center">
            <FiCpu className="mr-2 text-gray-400" />
            <span className="text-sm text-gray-700">
              {survey.missions?.length || 0} mission{survey.missions?.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
      
      {/* Progress section */}
      {survey.status === 'in progress' && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Progress</span>
            <span className="font-medium">{getCompletionPercentage()}%</span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${getCompletionPercentage()}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Survey stats summary */}
      {survey.status === 'completed' && survey.stats && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <div className="text-gray-500">Area Covered</div>
            <div className="font-medium text-gray-900">{survey.stats.areaCovered || 0} m²</div>
          </div>
          <div>
            <div className="text-gray-500">Images</div>
            <div className="font-medium text-gray-900">{survey.stats.imagesCollected || 0}</div>
          </div>
          <div>
            <div className="text-gray-500">Flight Time</div>
            <div className="font-medium text-gray-900">{survey.stats.totalFlightTime || 0} min</div>
          </div>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex space-x-2">
        <Link 
          to={`/surveys/${survey._id}`} 
          className="flex-1 inline-flex justify-center items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <FiFileText className="mr-1" />
          Details
        </Link>
        
        {survey.status === 'completed' && (
          <Link 
            to={`/analytics/surveys/${survey._id}`} 
            className="flex-1 inline-flex justify-center items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <FiMap className="mr-1" />
            View Results
          </Link>
        )}
        
        {survey.status === 'scheduled' && (
          <Link 
            to={`/missions/create?surveyId=${survey._id}`} 
            className="flex-1 inline-flex justify-center items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <FiCheck className="mr-1" />
            Start Survey
          </Link>
        )}
        
        {survey.status === 'in progress' && (
          <Link 
            to={`/monitor?surveyId=${survey._id}`} 
            className="flex-1 inline-flex justify-center items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <FiAlertCircle className="mr-1" />
            Monitor
          </Link>
        )}
      </div>
    </div>
  );
};

export default SurveyCard;