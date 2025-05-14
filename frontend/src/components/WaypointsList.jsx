import React, { useState } from 'react';
import { FiMapPin, FiArrowUp, FiArrowDown, FiTrash2, FiPlus, FiEye, FiEyeOff, FiMenu } from 'react-icons/fi';

/**
 * WaypointsList component for displaying and editing mission waypoints
 * 
 * @param {Object} props
 * @param {Array} props.waypoints - Array of waypoint objects
 * @param {Function} props.onChange - Handler for waypoint changes
 * @param {Function} props.onFocus - Handler when a waypoint is focused
 * @param {number} props.focusedIndex - Index of the currently focused waypoint
 * @param {boolean} props.editable - Whether waypoints can be edited
 * @param {boolean} props.showAdd - Whether to show add waypoint button
 * @param {string} props.className - Additional CSS classes
 */
const WaypointsList = ({
  waypoints = [],
  onChange,
  onFocus,
  focusedIndex = -1,
  editable = false,
  showAdd = true,
  className = ''
}) => {
  const [hoverIndex, setHoverIndex] = useState(-1);
  const [allExpanded, setAllExpanded] = useState(false);
  
  // Move waypoint up in the list
  const moveWaypointUp = (index) => {
    if (index <= 0 || !editable) return;
    
    const newWaypoints = [...waypoints];
    const temp = newWaypoints[index];
    newWaypoints[index] = newWaypoints[index - 1];
    newWaypoints[index - 1] = temp;
    
    if (onChange) onChange(newWaypoints);
    if (onFocus && focusedIndex === index) onFocus(index - 1);
  };
  
  // Move waypoint down in the list
  const moveWaypointDown = (index) => {
    if (index >= waypoints.length - 1 || !editable) return;
    
    const newWaypoints = [...waypoints];
    const temp = newWaypoints[index];
    newWaypoints[index] = newWaypoints[index + 1];
    newWaypoints[index + 1] = temp;
    
    if (onChange) onChange(newWaypoints);
    if (onFocus && focusedIndex === index) onFocus(index + 1);
  };
  
  // Remove waypoint from list
  const removeWaypoint = (index) => {
    if (!editable) return;
    
    const newWaypoints = waypoints.filter((_, i) => i !== index);
    
    if (onChange) onChange(newWaypoints);
    if (onFocus && focusedIndex === index) onFocus(-1);
  };
  
  // Add a new waypoint
  const addWaypoint = () => {
    if (!editable) return;
    
    const lastWaypoint = waypoints[waypoints.length - 1] || { lat: 0, lng: 0, alt: 100 };
    const newWaypoint = {
      lat: lastWaypoint.lat + 0.0001,
      lng: lastWaypoint.lng + 0.0001,
      alt: lastWaypoint.alt,
      speed: lastWaypoint.speed || 5,
      action: 'navigate',
    };
    
    const newWaypoints = [...waypoints, newWaypoint];
    if (onChange) onChange(newWaypoints);
    if (onFocus) onFocus(newWaypoints.length - 1);
  };
  
  // Update a waypoint property
  const updateWaypoint = (index, field, value) => {
    if (!editable) return;
    
    const newWaypoints = [...waypoints];
    newWaypoints[index] = { ...newWaypoints[index], [field]: value };
    
    if (onChange) onChange(newWaypoints);
  };
  
  // Focus on a waypoint
  const handleWaypointFocus = (index) => {
    if (onFocus) onFocus(index === focusedIndex ? -1 : index);
  };
  
  // Toggle expand/collapse all waypoints
  const toggleAllExpanded = () => {
    setAllExpanded(!allExpanded);
  };
  
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Waypoints</h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={toggleAllExpanded}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
            title={allExpanded ? "Collapse all waypoints" : "Expand all waypoints"}
          >
            {allExpanded ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
          {editable && showAdd && (
            <button
              type="button"
              onClick={addWaypoint}
              className="p-1.5 text-primary-500 hover:text-primary-700 hover:bg-primary-50 rounded-md"
              title="Add waypoint"
            >
              <FiPlus size={18} />
            </button>
          )}
        </div>
      </div>
      
      {waypoints.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FiMapPin className="mx-auto h-8 w-8 mb-2" />
          <p className="text-sm">No waypoints defined</p>
          {editable && showAdd && (
            <button
              type="button"
              onClick={addWaypoint}
              className="mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
            >
              Add Waypoint
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {waypoints.map((waypoint, index) => {
            const isExpanded = allExpanded || focusedIndex === index;
            const isHovered = hoverIndex === index;
            
            return (
              <div 
                key={index}
                className={`
                  border rounded-md overflow-hidden transition-all
                  ${focusedIndex === index ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}
                  ${isHovered && !isExpanded ? 'bg-gray-50' : ''}
                `}
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(-1)}
              >
                {/* Waypoint header */}
                <div 
                  className="flex items-center justify-between p-3 cursor-pointer"
                  onClick={() => handleWaypointFocus(index)}
                >
                  <div className="flex items-center">
                    <div className={`
                      flex items-center justify-center h-6 w-6 rounded-full mr-3
                      ${focusedIndex === index ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-700'}
                    `}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        {waypoint.name || `Waypoint ${index + 1}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {waypoint.lat.toFixed(6)}, {waypoint.lng.toFixed(6)}, {waypoint.alt}m
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {isHovered && !isExpanded && editable && (
                      <div className="flex space-x-1">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveWaypointUp(index);
                            }}
                            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                            title="Move up"
                          >
                            <FiArrowUp size={16} />
                          </button>
                        )}
                        
                        {index < waypoints.length - 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveWaypointDown(index);
                            }}
                            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                            title="Move down"
                          >
                            <FiArrowDown size={16} />
                          </button>
                        )}
                        
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeWaypoint(index);
                          }}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                          title="Remove waypoint"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    )}
                    
                    {(!isHovered || !editable) && (
                      <FiMenu size={16} className="text-gray-400" />
                    )}
                  </div>
                </div>
                
                {/* Expanded waypoint details */}
                {isExpanded && (
                  <div className="p-3 border-t border-gray-200 bg-white">
                    <div className="grid grid-cols-2 gap-3">
                      {/* Latitude */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Latitude
                        </label>
                        {editable ? (
                          <input
                            type="number"
                            step="0.000001"
                            value={waypoint.lat}
                            onChange={(e) => updateWaypoint(index, 'lat', parseFloat(e.target.value))}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          />
                        ) : (
                          <div className="text-sm">{waypoint.lat.toFixed(6)}</div>
                        )}
                      </div>
                      
                      {/* Longitude */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Longitude
                        </label>
                        {editable ? (
                          <input
                            type="number"
                            step="0.000001"
                            value={waypoint.lng}
                            onChange={(e) => updateWaypoint(index, 'lng', parseFloat(e.target.value))}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          />
                        ) : (
                          <div className="text-sm">{waypoint.lng.toFixed(6)}</div>
                        )}
                      </div>
                      
                      {/* Altitude */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Altitude (m)
                        </label>
                        {editable ? (
                          <input
                            type="number"
                            value={waypoint.alt}
                            onChange={(e) => updateWaypoint(index, 'alt', parseInt(e.target.value))}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          />
                        ) : (
                          <div className="text-sm">{waypoint.alt} m</div>
                        )}
                      </div>
                      
                      {/* Speed */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Speed (m/s)
                        </label>
                        {editable ? (
                          <input
                            type="number"
                            value={waypoint.speed || 5}
                            onChange={(e) => updateWaypoint(index, 'speed', parseFloat(e.target.value))}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          />
                        ) : (
                          <div className="text-sm">{waypoint.speed || 5} m/s</div>
                        )}
                      </div>
                      
                      {/* Action */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Action
                        </label>
                        {editable ? (
                          <select
                            value={waypoint.action || 'navigate'}
                            onChange={(e) => updateWaypoint(index, 'action', e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          >
                            <option value="navigate">Navigate</option>
                            <option value="hover">Hover</option>
                            <option value="take_photo">Take Photo</option>
                            <option value="start_video">Start Video</option>
                            <option value="stop_video">Stop Video</option>
                            <option value="land">Land</option>
                            <option value="return_home">Return Home</option>
                          </select>
                        ) : (
                          <div className="text-sm">
                            {waypoint.action ? waypoint.action.replace('_', ' ') : 'Navigate'}
                          </div>
                        )}
                      </div>
                      
                      {/* Delay */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Wait Time (s)
                        </label>
                        {editable ? (
                          <input
                            type="number"
                            value={waypoint.delay || 0}
                            onChange={(e) => updateWaypoint(index, 'delay', parseInt(e.target.value))}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          />
                        ) : (
                          <div className="text-sm">{waypoint.delay || 0} s</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Add waypoint button at the bottom */}
      {editable && showAdd && waypoints.length > 0 && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={addWaypoint}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
          >
            Add Waypoint
          </button>
        </div>
      )}
    </div>
  );
};

export default WaypointsList;