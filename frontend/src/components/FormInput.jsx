import React from 'react';
import { FiAlertCircle } from 'react-icons/fi';

/**
 * FormInput component for consistent form input elements
 * 
 * @param {Object} props
 * @param {string} props.id - Input id (also used for htmlFor in label)
 * @param {string} props.name - Input name attribute
 * @param {string} props.label - Input label text
 * @param {string} props.type - Input type (text, email, password, number, etc.)
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - onChange handler
 * @param {Function} props.onBlur - onBlur handler
 * @param {string} props.placeholder - Input placeholder text
 * @param {string} props.error - Error message to display
 * @param {boolean} props.required - Whether the field is required
 * @param {boolean} props.disabled - Whether the input is disabled
 * @param {string} props.className - Additional class names for the wrapper
 * @param {React.ReactNode} props.helpText - Optional help text to display
 * @param {Object} props.inputProps - Additional props to pass to the input element
 */
const FormInput = ({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  helpText,
  inputProps = {}
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
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`
            block w-full rounded-md border sm:text-sm px-3 py-2 
            ${error 
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          `}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          {...inputProps}
        />
        
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <FiAlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
          </div>
        )}
      </div>
      
      {error ? (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      ) : helpText ? (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      ) : null}
    </div>
  );
};

export default FormInput;