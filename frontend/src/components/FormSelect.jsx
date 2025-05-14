import React from 'react';
import { FiAlertCircle, FiChevronDown } from 'react-icons/fi';

/**
 * FormSelect component for consistent select dropdowns
 * 
 * @param {Object} props
 * @param {string} props.id - Select id (also used for htmlFor in label)
 * @param {string} props.name - Select name attribute
 * @param {string} props.label - Select label text
 * @param {string|number} props.value - Selected value
 * @param {Function} props.onChange - onChange handler
 * @param {Function} props.onBlur - onBlur handler
 * @param {Array} props.options - Array of options [{value, label}]
 * @param {string} props.placeholder - Optional placeholder text
 * @param {string} props.error - Error message to display
 * @param {boolean} props.required - Whether the field is required
 * @param {boolean} props.disabled - Whether the select is disabled
 * @param {string} props.className - Additional class names for the wrapper
 * @param {React.ReactNode} props.helpText - Optional help text to display
 * @param {Object} props.selectProps - Additional props to pass to the select element
 */
const FormSelect = ({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = 'Select an option',
  error,
  required = false,
  disabled = false,
  className = '',
  helpText,
  selectProps = {}
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative rounded-md shadow-sm">
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`
            block w-full rounded-md border sm:text-sm pl-3 pr-10 py-2 appearance-none
            ${error 
              ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          `}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          {...selectProps}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <FiChevronDown
            className={`h-4 w-4 ${error ? 'text-red-500' : 'text-gray-400'}`}
            aria-hidden="true"
          />
        </div>
      </div>
      
      {error ? (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      ) : helpText ? (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      ) : null}
    </div>
  );
};

export default FormSelect;