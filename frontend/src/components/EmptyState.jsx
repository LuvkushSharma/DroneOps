import React from 'react';
import { Link } from 'react-router-dom';

/**
 * EmptyState component for displaying when no data is available
 * 
 * @param {Object} props
 * @param {string} props.title - Main title text
 * @param {string} props.description - Descriptive text
 * @param {React.ReactNode} props.icon - Icon to display
 * @param {string} props.actionText - Text for action button
 * @param {string} props.actionLink - Link for action button
 * @param {Function} props.onAction - Click handler for action button
 * @param {string} props.className - Additional CSS classes
 */
const EmptyState = ({
  title = 'No data available',
  description = 'Get started by creating a new item.',
  icon,
  actionText,
  actionLink,
  onAction,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      {icon && (
        <div className="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center">
          {icon}
        </div>
      )}
      
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      
      {(actionText && (actionLink || onAction)) && (
        <div className="mt-6">
          {actionLink ? (
            <Link
              to={actionLink}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {actionText}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;