import React from 'react';
import { FiAlertCircle } from 'react-icons/fi';

/**
 * FormTextArea component for consistent textarea elements
 * 
 * @param {Object} props
 * @param {string} props.id - Textarea id (also used for htmlFor in label)
 * @param {string} props.name - Textarea name attribute
 * @param {string} props.label - Textarea label text
 * @param {string} props.value - Textarea value
 * @param {Function} props.onChange - onChange handler
 * @param {Function} props.onBlur - onBlur handler
 * @param {string} props.placeholder - Textarea placeholder text
 * @param {string} props.error - Error message to display
 * @param {boolean} props.required - Whether the field is required
 * @param {boolean} props.disabled - Whether the textarea is disabled
 * @param {string} props.className - Additional class names for the wrapper
 * @param {React.ReactNode} props.helpText - Optional help text to display
 * @param {number} props.rows - Number of rows for the textarea
 * @param {Object} props.textareaProps - Additional props to pass to the textarea element
 */
const FormTextArea = ({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  helpText,
  rows = 4,
  textareaProps = {}
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
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          rows={rows}
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
          {...textareaProps}
        />
        
        {error && (
          <div className="absolute top-2 right-2 flex items-center pointer-events-none">
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

export default FormTextArea;