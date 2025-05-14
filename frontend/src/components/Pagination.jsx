import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

/**
 * Pagination component for navigating through pages of data
 * 
 * @param {Object} props
 * @param {number} props.currentPage - Current active page (1-based)
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Callback when page is changed
 * @param {number} props.siblingCount - Number of page buttons to show on each side of current page
 * @param {string} props.className - Additional CSS class
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  siblingCount = 1,
  className = ''
}) => {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }
  
  // Handler for page change
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }
    if (onPageChange) {
      onPageChange(page);
    }
  };
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    // Always show first and last pages
    const pageNumbers = [];
    
    // Calculate range based on siblingCount
    let startPage = Math.max(1, currentPage - siblingCount);
    let endPage = Math.min(totalPages, currentPage + siblingCount);
    
    // Ensure we show at least 2*siblingCount+1 pages if possible
    if (endPage - startPage < 2 * siblingCount) {
      if (currentPage < totalPages / 2) {
        endPage = Math.min(totalPages, startPage + 2 * siblingCount);
      } else {
        startPage = Math.max(1, endPage - 2 * siblingCount);
      }
    }
    
    // Add ellipsis and numbers
    if (startPage > 1) {
      pageNumbers.push(1);
      if (startPage > 2) {
        pageNumbers.push('...');
      }
    }
    
    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    // Add ellipsis and last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  return (
    <div className={`flex justify-center items-center space-x-1 ${className}`}>
      {/* Previous button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-md text-sm font-medium flex items-center ${
          currentPage === 1
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        aria-label="Previous page"
      >
        <FiChevronLeft className="mr-1" />
        <span className="hidden sm:inline">Previous</span>
      </button>
      
      {/* Page numbers */}
      <div className="hidden sm:flex space-x-1">
        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-500">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                currentPage === page
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          )
        ))}
      </div>
      
      {/* Mobile current page indicator */}
      <div className="sm:hidden px-3 py-1 text-sm">
        Page {currentPage} of {totalPages}
      </div>
      
      {/* Next button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-md text-sm font-medium flex items-center ${
          currentPage === totalPages
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <FiChevronRight className="ml-1" />
      </button>
    </div>
  );
};

export default Pagination;