import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { FiX } from 'react-icons/fi';

/**
 * Modal component for displaying content in an overlay
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {React.ReactNode} props.children - Content to render inside the modal
 * @param {string} props.title - Modal title
 * @param {string} props.size - Modal size (sm, md, lg, xl, full)
 * @param {boolean} props.closeOnClickOutside - Whether to close modal when clicking outside
 * @param {boolean} props.showCloseButton - Whether to show the close button
 * @param {React.ReactNode} props.footer - Content to render in the modal footer
 * @param {string} props.contentClassName - Additional class names for the content area
 */
const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  closeOnClickOutside = true,
  showCloseButton = true,
  footer,
  contentClassName = ''
}) => {
  // Modal ref to detect clicks outside
  const modalContentRef = useRef(null);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      // Restore body scrolling when modal is closed
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Click handler for backdrop
  const handleBackdropClick = (e) => {
    if (closeOnClickOutside && modalContentRef.current && !modalContentRef.current.contains(e.target)) {
      onClose();
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
    '3xl': 'sm:max-w-3xl',
    '4xl': 'sm:max-w-4xl',
    '5xl': 'sm:max-w-5xl',
    '6xl': 'sm:max-w-6xl',
    '7xl': 'sm:max-w-7xl',
    full: 'sm:max-w-full sm:m-4'
  };

  // Don't render if not open
  if (!isOpen) return null;

  // Create portal to render at the end of the document body
  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
        ></div>

        {/* This element is to trick the browser into centering the modal contents. */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        {/* Modal panel */}
        <div
          ref={modalContentRef}
          className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-full ${sizeClasses[size]}`}
        >
          {/* Modal header */}
          {(title || showCloseButton) && (
            <div className="bg-white px-4 py-3 border-b border-gray-200 sm:px-6 flex justify-between items-center">
              {title && (
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <FiX className="h-6 w-6" aria-hidden="true" />
                </button>
              )}
            </div>
          )}

          {/* Modal content */}
          <div className={`bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${contentClassName}`}>
            {children}
          </div>

          {/* Modal footer */}
          {footer && (
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;