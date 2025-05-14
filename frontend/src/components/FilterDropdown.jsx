import React, { useState, useRef, useEffect } from 'react';
import { FiFilter, FiCheck, FiChevronDown } from 'react-icons/fi';

/**
 * FilterDropdown component for filtering data
 * 
 * @param {Object} props
 * @param {Array} props.options - Array of filter options {value, label}
 * @param {string|Array} props.value - Selected value(s)
 * @param {Function} props.onChange - Callback when selection changes
 * @param {string} props.label - Button label
 * @param {boolean} props.multi - Allow multiple selections
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.filterIcon - Custom filter icon
 */
const FilterDropdown = ({
  options = [],
  value = '',
  onChange,
  label = 'Filter',
  multi = false,
  className = '',
  filterIcon = <FiFilter />
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Convert value to array for consistent handling
  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

  // Handle selecting an option
  const handleSelect = (option) => {
    if (multi) {
      // For multi-select, toggle the selection
      const newValue = selectedValues.includes(option.value)
        ? selectedValues.filter(val => val !== option.value)
        : [...selectedValues, option.value];
      
      onChange(newValue);
    } else {
      // For single select, just set the value and close dropdown
      onChange(option.value);
      setIsOpen(false);
    }
  };

  // Clear all selections
  const clearAll = () => {
    onChange(multi ? [] : '');
    if (!multi) setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get selected option label(s) for display
  const getFilterLabel = () => {
    if (selectedValues.length === 0) {
      return label;
    }

    if (selectedValues.length === 1) {
      const selectedOption = options.find(o => o.value === selectedValues[0]);
      return selectedOption ? selectedOption.label : label;
    }

    return `${label} (${selectedValues.length})`;
  };

  // Check if an option is selected
  const isSelected = (optionValue) => {
    return selectedValues.includes(optionValue);
  };

  // Calculate if any filter is active
  const isActive = selectedValues.length > 0;

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className={`
          inline-flex justify-between items-center px-3 py-2 border rounded-md shadow-sm text-sm font-medium
          ${isActive 
            ? 'bg-primary-100 border-primary-300 text-primary-700' 
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
        `}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center">
          <span className="mr-2">{filterIcon}</span>
          <span>{getFilterLabel()}</span>
        </span>
        <FiChevronDown className="ml-2 -mr-1 h-4 w-4" />
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1 divide-y divide-gray-100">
            <div className="px-3 py-2">
              <h3 className="text-sm font-medium text-gray-900">{label}</h3>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {options.length > 0 ? (
                options.map((option) => (
                  <div 
                    key={option.value} 
                    className={`
                      px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-50
                      ${isSelected(option.value) ? 'bg-primary-50 text-primary-700' : 'text-gray-700'}
                    `}
                    onClick={() => handleSelect(option)}
                  >
                    <div className="flex items-center">
                      {option.icon && <span className="mr-2">{option.icon}</span>}
                      <span>{option.label}</span>
                    </div>
                    {isSelected(option.value) && <FiCheck className="h-4 w-4" />}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">
                  No options available
                </div>
              )}
            </div>
            {isActive && (
              <div className="px-3 py-2">
                <button
                  type="button"
                  className="w-full text-sm text-left text-primary-600 hover:text-primary-800"
                  onClick={clearAll}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;