import React from 'react';

/**
 * LoadingSpinner component for indicating loading state
 * 
 * @param {Object} props
 * @param {string} props.size - Size of the spinner (sm, md, lg)
 * @param {string} props.color - Color theme for spinner (primary, white, gray)
 * @param {string} props.text - Optional text to display alongside spinner
 * @param {boolean} props.fullScreen - Whether to display the spinner centered in full screen
 * @param {string} props.className - Additional CSS classes to apply
 */
const LoadingSpinner = ({
  size = 'md',
  color = 'primary',
  text,
  fullScreen = false,
  className = ''
}) => {
  // Generate size classes
  const sizeClasses = {
    xs: 'h-4 w-4 border-2',
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-2',
    lg: 'h-16 w-16 border-4',
    xl: 'h-24 w-24 border-4'
  };

  // Generate color classes
  const colorClasses = {
    primary: 'border-primary-200 border-t-primary-600',
    white: 'border-gray-200 border-t-white',
    gray: 'border-gray-100 border-t-gray-500',
    blue: 'border-blue-200 border-t-blue-600',
    green: 'border-green-200 border-t-green-600',
    red: 'border-red-200 border-t-red-600',
    yellow: 'border-yellow-200 border-t-yellow-600'
  };

  const spinnerClasses = `
    inline-block rounded-full animate-spin 
    ${sizeClasses[size] || sizeClasses.md} 
    ${colorClasses[color] || colorClasses.primary}
    ${className}
  `;

  // Full screen spinner with overlay
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        <div className="text-center">
          <div className={spinnerClasses}></div>
          {text && (
            <p className="mt-4 text-gray-600 text-sm font-medium">{text}</p>
          )}
        </div>
      </div>
    );
  }

  // Spinner with optional text
  if (text) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className={spinnerClasses}></div>
        <p className="mt-2 text-gray-600 text-sm">{text}</p>
      </div>
    );
  }

  // Just the spinner
  return <div className={spinnerClasses}></div>;
};

// Loading overlay for full component sections
export const LoadingOverlay = ({ message = 'Loading...' }) => (
  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
    <div className="text-center">
      <div className="inline-block h-8 w-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      <p className="mt-2 text-gray-600 text-sm">{message}</p>
    </div>
  </div>
);

// Loading placeholders for content that hasn't loaded yet
export const LoadingPlaceholder = ({ lines = 3, type = 'text' }) => {
  if (type === 'card') {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-4"></div>
        <div className="space-y-2">
          {[...Array(lines)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 rounded-md w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'table-row') {
    return (
      <div className="animate-pulse">
        {[...Array(lines)].map((_, i) => (
          <div key={i} className="flex space-x-4 py-3">
            <div className="h-4 bg-gray-100 rounded-md w-1/4"></div>
            <div className="h-4 bg-gray-100 rounded-md w-1/4"></div>
            <div className="h-4 bg-gray-100 rounded-md w-1/4"></div>
            <div className="h-4 bg-gray-100 rounded-md w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-pulse space-y-2">
      {[...Array(lines)].map((_, i) => (
        <div 
          key={i} 
          className="h-4 bg-gray-100 rounded-md" 
          style={{ width: `${Math.floor(Math.random() * 40) + 60}%` }}
        ></div>
      ))}
    </div>
  );
};

export default LoadingSpinner;