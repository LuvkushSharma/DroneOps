/Flytbase/frontend/src/components/PatternSelector.jsx
import React, { useState } from 'react';
import {
  FiGrid,
  FiCrosshair,
  FiSquare,
  FiCornerDownRight,
  FiMap,
  FiCheckCircle
} from 'react-icons/fi';

/**
 * PatternSelector component for selecting drone survey flight patterns
 * 
 * @param {Object} props
 * @param {string} props.value - Current selected pattern
 * @param {Function} props.onChange - Callback when pattern is changed
 */
const PatternSelector = ({ value = 'grid', onChange }) => {
  const [showPatternInfo, setShowPatternInfo] = useState(null);
  
  // Define available patterns with their descriptions and icons
  const patterns = [
    {
      id: 'grid',
      name: 'Grid Pattern',
      icon: <FiGrid className="h-5 w-5" />,
      description: 'Standard pattern covering the entire area in parallel lines. Best for general mapping and surveys.',
      image: 'grid-pattern.svg'
    },
    {
      id: 'crosshatch',
      name: 'Crosshatch',
      icon: <FiCrosshair className="h-5 w-5" />,
      description: 'Double grid pattern with perpendicular flight lines. Provides better detail and data for 3D models.',
      image: 'crosshatch-pattern.svg'
    },
    {
      id: 'perimeter',
      name: 'Perimeter',
      icon: <FiSquare className="h-5 w-5" />,
      description: 'Follows the boundary of the target area. Ideal for inspection of fences, borders, or linear features.',
      image: 'perimeter-pattern.svg'
    },
    {
      id: 'spiral',
      name: 'Spiral',
      icon: <FiCornerDownRight className="h-5 w-5" />,
      description: 'Starts from the center and moves outward in a spiral pattern. Good for focused surveys of specific structures.',
      image: 'spiral-pattern.svg'
    },
    {
      id: 'custom',
      name: 'Custom',
      icon: <FiMap className="h-5 w-5" />,
      description: 'Create a custom flight path by placing waypoints manually on the map.',
      image: 'custom-pattern.svg'
    }
  ];

  // Handle pattern selection
  const handlePatternSelect = (patternId) => {
    if (onChange) {
      onChange(patternId);
    }
  };

  // Toggle pattern info modal
  const togglePatternInfo = (patternId) => {
    if (showPatternInfo === patternId) {
      setShowPatternInfo(null);
    } else {
      setShowPatternInfo(patternId);
    }
  };

  // Find the selected pattern
  const selectedPattern = patterns.find(pattern => pattern.id === value) || patterns[0];

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">Flight Pattern</h3>
        <p className="text-sm text-gray-500 mt-1">
          Select the flight pattern for your drone survey
        </p>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {patterns.map((pattern) => (
            <button
              key={pattern.id}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${
                value === pattern.id
                  ? 'bg-primary-50 border-primary-200 ring-2 ring-primary-500 ring-opacity-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => handlePatternSelect(pattern.id)}
            >
              <div className={`p-2 rounded-full ${
                value === pattern.id ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {pattern.icon}
              </div>
              <div className="mt-2 text-center">
                <h4 className={`text-sm font-medium ${
                  value === pattern.id ? 'text-primary-700' : 'text-gray-700'
                }`}>
                  {pattern.name}
                </h4>
              </div>
              <button
                type="button"
                className="mt-1 text-xs text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePatternInfo(pattern.id);
                }}
              >
                Info
              </button>
            </button>
          ))}
        </div>
        
        {/* Selected pattern detailed info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start">
            <div className={`p-2 rounded-full ${value ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'} flex-shrink-0`}>
              {selectedPattern.icon}
            </div>
            <div className="ml-3">
              <h4 className="font-medium text-gray-900">
                {selectedPattern.name}
              </h4>
              <p className="mt-1 text-sm text-gray-500">
                {selectedPattern.description}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Pattern info modal */}
      {showPatternInfo && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="pattern-info-modal" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              {/* Modal header */}
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="sm:flex sm:items-start">
                  {/* Pattern icon */}
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 sm:mx-0 sm:h-10 sm:w-10">
                    {patterns.find(p => p.id === showPatternInfo)?.icon}
                  </div>
                  
                  {/* Pattern name and description */}
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      {patterns.find(p => p.id === showPatternInfo)?.name}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {patterns.find(p => p.id === showPatternInfo)?.description}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Pattern diagram */}
                <div className="mt-4 bg-gray-50 rounded-lg p-4 flex justify-center">
                  {/* This would ideally be replaced with actual SVG diagrams */}
                  <div className="w-full h-48 flex items-center justify-center text-gray-400 border border-dashed border-gray-300 rounded">
                    {/* Pattern diagram would go here */}
                    <span className="text-sm">Pattern Diagram</span>
                  </div>
                </div>
              </div>
              
              {/* Modal actions */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    handlePatternSelect(showPatternInfo);
                    setShowPatternInfo(null);
                  }}
                >
                  <FiCheckCircle className="mr-2 -ml-1 h-4 w-4" />
                  Select Pattern
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowPatternInfo(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatternSelector;