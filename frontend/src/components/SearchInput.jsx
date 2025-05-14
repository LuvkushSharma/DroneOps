import React, { useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

/**
 * SearchInput component for search functionality
 * 
 * @param {Object} props
 * @param {string} props.value - Current search value
 * @param {Function} props.onChange - Handler when search value changes
 * @param {Function} props.onSearch - Handler when search is submitted
 * @param {string} props.placeholder - Placeholder text
 * @param {number} props.minLength - Minimum length for search
 * @param {boolean} props.autoSearch - Whether to trigger search while typing
 * @param {number} props.debounceMs - Debounce delay for auto search
 * @param {string} props.className - Additional CSS classes
 */
const SearchInput = ({
  value = '',
  onChange,
  onSearch,
  placeholder = 'Search',
  minLength = 2,
  autoSearch = false,
  debounceMs = 300,
  className = ''
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [timer, setTimer] = useState(null);
  
  // Handle input change
  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    if (onChange) {
      onChange(newValue);
    }
    
    // Auto search with debounce
    if (autoSearch && newValue.length >= minLength) {
      clearTimeout(timer);
      const newTimer = setTimeout(() => {
        if (onSearch) {
          onSearch(newValue);
        }
      }, debounceMs);
      setTimer(newTimer);
    }
  };
  
  // Handle search submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (localValue.length >= minLength && onSearch) {
      clearTimeout(timer);
      onSearch(localValue);
    }
  };
  
  // Clear search field
  const handleClear = () => {
    setLocalValue('');
    if (onChange) {
      onChange('');
    }
    if (autoSearch && onSearch) {
      onSearch('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        
        <input
          type="text"
          value={localValue}
          onChange={handleChange}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder={placeholder}
          aria-label="Search"
        />
        
        {localValue && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <FiX className="h-5 w-5 text-gray-400 hover:text-gray-500" aria-hidden="true" />
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchInput;