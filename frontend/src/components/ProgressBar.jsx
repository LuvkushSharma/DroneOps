import React from 'react';

/**
 * ProgressBar component for displaying progress of various tasks
 * 
 * @param {Object} props
 * @param {number} props.progress - Progress value (0-100)
 * @param {string} props.color - Color theme for the progress bar (primary, success, warning, danger, info)
 * @param {string} props.size - Size of the progress bar (xs, sm, md, lg)
 * @param {boolean} props.showLabel - Whether to show the progress percentage label
 * @param {boolean} props.striped - Whether to use striped effect
 * @param {boolean} props.animated - Whether to use animation (requires striped to be true)
 */
const ProgressBar = ({
  progress = 0,
  color = 'primary',
  size = 'md',
  showLabel = false,
  striped = false,
  animated = false,
}) => {
  // Normalize progress value between 0-100
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
  
  // Calculate the width style
  const widthStyle = {
    // Ensure even 0% progress shows at least 2px width for visibility
    width: normalizedProgress > 0 && normalizedProgress < 1 ? '2px' : `${normalizedProgress}%`,
    minWidth: normalizedProgress > 0 ? '2px' : '0px'
  };
  
  // Color classes mapping
  const colorClasses = {
    primary: 'bg-primary-600',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
  };
  
  // Size classes mapping for the container
  const sizeClasses = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };
  
  // Striped effect class
  const stripedClass = striped ? 'bg-stripes' : '';
  
  // Animation class
  const animationClass = striped && animated ? 'animate-progress-stripes' : '';
  
  // Generate the wrapper and progress bar classes
  const wrapperClass = `overflow-hidden rounded-full ${sizeClasses[size] || sizeClasses.md}`;
  const barClass = `${colorClasses[color] || colorClasses.primary} ${stripedClass} ${animationClass}`;
  
  return (
    <div className="relative">
      <div className={`${wrapperClass} bg-gray-200`}>
        <div
          className={`h-full transition-all duration-300 ease-in-out ${barClass}`}
          style={widthStyle}
          role="progressbar"
          aria-valuenow={normalizedProgress}
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
      {showLabel && (
        <div className="text-center text-xs mt-1 font-medium text-gray-600">
          {Math.round(normalizedProgress)}%
        </div>
      )}
    </div>
  );
};

// Custom striped background effect (add this to your global CSS)
// This is a comment to indicate where the CSS would go in a separate CSS file
/*
.bg-stripes {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 1rem 1rem;
}

@keyframes progress-stripes {
  from {
    background-position: 1rem 0;
  }
  to {
    background-position: 0 0;
  }
}

.animate-progress-stripes {
  animation: progress-stripes 1s linear infinite;
}
*/

export default ProgressBar;