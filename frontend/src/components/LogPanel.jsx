import React, { useRef, useEffect } from 'react';
import { FiInfo, FiAlertTriangle, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';

/**
 * LogPanel component for displaying mission logs
 * 
 * @param {Object} props
 * @param {Array} props.logs - Array of log entries
 * @param {string} props.maxHeight - Maximum height for the log container
 * @param {boolean} props.autoScroll - Whether to auto-scroll to bottom on new logs
 */
const LogPanel = ({ 
  logs = [], 
  maxHeight = '300px',
  autoScroll = true
}) => {
  const logContainerRef = useRef(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Get appropriate icon for log type
  const getLogIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'info':
        return <FiInfo className="text-blue-500" />;
      case 'warning':
        return <FiAlertTriangle className="text-yellow-500" />;
      case 'error':
        return <FiXCircle className="text-red-500" />;
      case 'success':
        return <FiCheckCircle className="text-green-500" />;
      default:
        return <FiClock className="text-gray-500" />;
    }
  };

  // Get appropriate text color for log type
  const getLogTextClass = (type) => {
    switch (type?.toLowerCase()) {
      case 'info':
        return 'text-blue-800';
      case 'warning':
        return 'text-yellow-800';
      case 'error':
        return 'text-red-800';
      case 'success':
        return 'text-green-800';
      default:
        return 'text-gray-800';
    }
  };

  // Get appropriate background color for log type
  const getLogBgClass = (type) => {
    switch (type?.toLowerCase()) {
      case 'info':
        return 'bg-blue-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'error':
        return 'bg-red-50';
      case 'success':
        return 'bg-green-50';
      default:
        return 'bg-gray-50';
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div 
      ref={logContainerRef}
      className="overflow-y-auto text-sm border border-gray-200 rounded-md bg-gray-50"
      style={{ maxHeight }}
    >
      {logs.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No logs available
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {logs.map((log, index) => (
            <div 
              key={log.id || index}
              className={`p-2 flex items-start ${index % 2 === 0 ? 'bg-white' : getLogBgClass(log.type)}`}
            >
              <div className="flex-shrink-0 mr-2 mt-0.5">
                {getLogIcon(log.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <p className={`text-xs font-medium ${getLogTextClass(log.type)}`}>{log.title || log.type}</p>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {formatTime(log.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5 break-words">{log.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LogPanel;