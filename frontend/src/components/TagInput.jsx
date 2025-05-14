import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiAlertCircle } from 'react-icons/fi';

/**
 * TagInput component for entering multiple tags or keywords
 * 
 * @param {Object} props
 * @param {Array} props.tags - Array of current tags
 * @param {Function} props.onChange - Function to call when tags change
 * @param {string} props.label - Input label text
 * @param {string} props.placeholder - Input placeholder text
 * @param {string} props.error - Error message to display
 * @param {boolean} props.required - Whether the field is required
 * @param {Function} props.validateTag - Function to validate a tag before adding it
 * @param {number} props.maxTags - Maximum number of tags allowed
 * @param {string} props.className - Additional class names for the container
 * @param {React.ReactNode} props.helpText - Optional help text to display
 */
const TagInput = ({
  tags = [],
  onChange,
  label = 'Tags',
  placeholder = 'Type and press Enter to add tags',
  error,
  required = false,
  validateTag,
  maxTags,
  className = '',
  helpText
}) => {
  const [inputValue, setInputValue] = useState('');
  const [localError, setLocalError] = useState('');
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Focus the input when clicking on the container
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setLocalError('');
  };

  // Add a tag when Enter is pressed
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove the last tag when backspace is pressed and input is empty
      removeTag(tags.length - 1);
    }
  };

  // Add a new tag
  const addTag = (tag) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;

    // Skip if we've reached the maximum number of tags
    if (maxTags && tags.length >= maxTags) {
      setLocalError(`Maximum ${maxTags} tags allowed`);
      return;
    }

    // Skip if the tag already exists
    if (tags.includes(trimmedTag)) {
      setLocalError('This tag already exists');
      return;
    }

    // Validate tag if a validation function is provided
    if (validateTag) {
      const validationResult = validateTag(trimmedTag);
      if (validationResult !== true) {
        setLocalError(validationResult || 'Invalid tag');
        return;
      }
    }

    // Add the tag
    const newTags = [...tags, trimmedTag];
    onChange(newTags);
    setInputValue('');
    setLocalError('');
  };

  // Remove a tag
  const removeTag = (index) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    onChange(newTags);
    setLocalError('');
  };

  // Handle blur event (for form validation)
  const handleBlur = () => {
    // Add current input as tag if it's not empty when input loses focus
    if (inputValue.trim()) {
      addTag(inputValue.trim());
    }
  };

  // Allow clicking outside to add current tag
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        if (inputValue.trim()) {
          addTag(inputValue.trim());
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [inputValue]);

  // Display either the provided error or local validation error
  const displayError = error || localError;

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div
        ref={containerRef}
        onClick={handleContainerClick}
        className={`
          flex flex-wrap items-center p-2 border rounded-md min-h-[42px] bg-white
          ${displayError ? 'border-red-300 focus-within:ring-red-500 focus-within:border-red-500' : 'border-gray-300 focus-within:ring-primary-500 focus-within:border-primary-500'}
          focus-within:outline-none focus-within:ring-1
        `}
      >
        {/* Display existing tags */}
        {tags.map((tag, index) => (
          <div
            key={index}
            className="flex items-center bg-primary-100 text-primary-800 rounded-md px-2 py-1 m-1"
          >
            <span className="mr-1 text-sm">{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="text-primary-600 hover:text-primary-800 focus:outline-none"
            >
              <FiX className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Input for new tags */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="flex-grow min-w-[120px] outline-none border-none text-sm p-1 bg-transparent"
          placeholder={tags.length === 0 ? placeholder : ''}
          disabled={maxTags && tags.length >= maxTags}
        />
        
        {/* Error icon */}
        {displayError && (
          <div className="flex items-center ml-auto mr-2">
            <FiAlertCircle className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>

      {/* Error message or help text */}
      {displayError ? (
        <p className="mt-1 text-sm text-red-600">{displayError}</p>
      ) : helpText ? (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      ) : null}
      
      {/* Display max tags limit if provided */}
      {maxTags && (
        <p className="mt-1 text-xs text-gray-500 text-right">
          {tags.length} / {maxTags}
        </p>
      )}
    </div>
  );
};

export default TagInput;