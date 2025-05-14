import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

/**
 * PageHeader component for displaying a consistent header across pages
 * 
 * @param {Object} props
 * @param {string} props.title - The main heading text
 * @param {string} props.description - Optional subheading or description text
 * @param {string} props.backLink - Optional URL to navigate back to
 * @param {string} props.backText - Optional text for the back link
 * @param {React.ReactNode} props.actions - Optional actions to display on the right side (buttons, etc)
 */
const PageHeader = ({ 
  title, 
  description, 
  backLink, 
  backText = 'Back', 
  actions 
}) => {
  return (
    <div className="mb-6">
      {backLink && (
        <div className="mb-4">
          <Link 
            to={backLink} 
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <FiArrowLeft className="mr-1" /> {backText}
          </Link>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500">
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="mt-4 md:mt-0 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;