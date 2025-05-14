import React, { useState, useEffect } from 'react';
import { 
  FiAlertCircle,
  FiInfo,
  FiCheckCircle,
  FiX,
  FiAlertTriangle
} from 'react-icons/fi';

/**
 * AlertMessage component for displaying alert and notification messages
 * 
 * @param {Object} props
 * @param {string} props.type - The type of alert: 'success', 'error', 'warning', or 'info'
 * @param {string} props.message - The message to display
 * @param {boolean} props.dismissible - Whether the alert can be dismissed (default: true)
 * @param {function} props.onClose - Optional callback function when alert is closed
 * @param {number} props.autoClose - Optional auto-close time in milliseconds
 * @param {string} props.className - Optional additional CSS classes
 * @param {string} props.title - Optional alert title
 */
const AlertMessage = ({ 
  type = 'info', 
  message, 
  dismissible = true, 
  onClose, 
  autoClose,
  className = '',
  title
}) => {
  const [visible, setVisible] = useState(true);

  // Handle alert styles based on type
  const alertStyles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: <FiCheckCircle className="h-5 w-5 text-green-500" />,
      title: title || 'Success'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: <FiAlertCircle className="h-5 w-5 text-red-500" />,
      title: title || 'Error'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: <FiAlertTriangle className="h-5 w-5 text-yellow-500" />,
      title: title || 'Warning'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: <FiInfo className="h-5 w-5 text-blue-500" />,
      title: title || 'Information'
    }
  };

  const styles = alertStyles[type] || alertStyles.info;

  // Handle auto-close
  useEffect(() => {
    if (autoClose && visible) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoClose);

      return () => clearTimeout(timer);
    }
  }, [autoClose, visible]);

  // Handle close action
  const handleClose = () => {
    setVisible(false);
    if (onClose) {
      onClose();
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <div className={`rounded-md border p-4 ${styles.bg} ${styles.border} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {styles.icon}
        </div>
        <div className="ml-3 flex-grow">
          {title && <h3 className={`text-sm font-medium ${styles.text}`}>{styles.title}</h3>}
          <div className={`text-sm ${styles.text} ${title ? 'mt-2' : ''}`}>
            {typeof message === 'string' ? message : 'An error occurred'}
          </div>
        </div>
        {dismissible && (
          <div className="pl-3 ml-auto">
            <button
              type="button"
              className={`inline-flex rounded-md ${styles.bg} p-1.5 ${styles.text} hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              onClick={handleClose}
              aria-label="Dismiss"
            >
              <span className="sr-only">Dismiss</span>
              <FiX className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertMessage;