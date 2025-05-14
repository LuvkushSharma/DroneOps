import React from 'react';
import { 
  FiArrowUpRight, 
  FiArrowDownRight, 
  FiMinus
} from 'react-icons/fi';

/**
 * StatCard component to display statistics with comparison to previous period
 * 
 * @param {Object} props
 * @param {string} props.title - The title of the statistic
 * @param {string|number} props.value - The current value
 * @param {string} props.unit - Optional unit to display (%, km, etc.)
 * @param {number} props.change - Percentage change from previous period
 * @param {string} props.period - Description of the comparison period (e.g. "vs last week")
 * @param {string} props.icon - Optional icon component
 * @param {string} props.color - Color theme for the card ("primary", "success", "warning", "danger", "info")
 */
const StatCard = ({ 
  title, 
  value, 
  unit = '', 
  change = null, 
  period = 'vs last week', 
  icon = null,
  color = 'primary'
}) => {
  // Determine color classes based on the color prop
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-green-50 text-green-600',
    warning: 'bg-yellow-50 text-yellow-600',
    danger: 'bg-red-50 text-red-600',
    info: 'bg-blue-50 text-blue-600'
  };
  
  // Determine icon and color for the change indicator
  const getChangeDisplay = () => {
    if (change === 0) {
      return {
        icon: <FiMinus className="mr-1" />,
        colorClass: 'text-gray-500'
      };
    } else if (change > 0) {
      return {
        icon: <FiArrowUpRight className="mr-1" />,
        colorClass: 'text-green-500'
      };
    } else {
      return {
        icon: <FiArrowDownRight className="mr-1" />,
        colorClass: 'text-red-500'
      };
    }
  };
  
  const changeDisplay = change !== null ? getChangeDisplay() : null;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">
              {value}{unit && <span className="ml-1 text-sm text-gray-500">{unit}</span>}
            </p>
          </div>
          
          {change !== null && (
            <div className={`mt-2 flex items-center ${changeDisplay.colorClass}`}>
              {changeDisplay.icon}
              <span className="text-sm font-medium">
                {Math.abs(change)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">
                {period}
              </span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;