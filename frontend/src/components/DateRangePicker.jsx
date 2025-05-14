import React, { useState, useRef, useEffect } from 'react';
import { FiCalendar, FiChevronDown, FiX } from 'react-icons/fi';
import { formatDate } from '../utils/dateFormatter';

/**
 * DateRangePicker component for selecting date ranges
 * 
 * @param {Object} props
 * @param {Function} props.onChange - Callback when date range changes
 * @param {Object} props.initialRange - Initial date range {startDate, endDate}
 * @param {string} props.className - Additional CSS classes
 */
const DateRangePicker = ({ onChange, initialRange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [range, setRange] = useState(initialRange || {
    startDate: null,
    endDate: null
  });
  const [hoveredDate, setHoveredDate] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  
  const dropdownRef = useRef(null);

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

  // Get formatted display text for the date range
  const getDisplayText = () => {
    if (range.startDate && range.endDate) {
      return `${formatDate(range.startDate, 'MMM D, YYYY')} - ${formatDate(range.endDate, 'MMM D, YYYY')}`;
    }
    if (range.startDate) {
      return `${formatDate(range.startDate, 'MMM D, YYYY')} - Select end date`;
    }
    return 'Select date range';
  };

  // Handle date selection
  const handleDateClick = (date) => {
    const newDate = new Date(year, month, date);
    
    if (!range.startDate || (range.startDate && range.endDate)) {
      // Start new selection
      setRange({
        startDate: newDate,
        endDate: null
      });
    } else {
      // Complete the selection
      if (newDate < range.startDate) {
        setRange({
          startDate: newDate,
          endDate: range.startDate
        });
      } else {
        setRange({
          ...range,
          endDate: newDate
        });
      }
      
      // Notify parent with the complete range
      if (onChange) {
        onChange({
          startDate: newDate < range.startDate ? newDate : range.startDate,
          endDate: newDate < range.startDate ? range.startDate : newDate
        });
      }
      
      // Close the dropdown after selection is complete
      setTimeout(() => setIsOpen(false), 300);
    }
  };

  // Handle date hover for range preview
  const handleDateHover = (date) => {
    if (range.startDate && !range.endDate) {
      setHoveredDate(new Date(year, month, date));
    }
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  // Navigate to next month
  const goToNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  // Clear the selection
  const clearSelection = (e) => {
    e.stopPropagation();
    setRange({
      startDate: null,
      endDate: null
    });
    if (onChange) {
      onChange(null);
    }
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isSelected = range.startDate && range.endDate &&
        date >= new Date(range.startDate.setHours(0, 0, 0, 0)) &&
        date <= new Date(range.endDate.setHours(0, 0, 0, 0));
      const isStart = range.startDate && 
        date.getDate() === range.startDate.getDate() && 
        date.getMonth() === range.startDate.getMonth() &&
        date.getFullYear() === range.startDate.getFullYear();
      const isEnd = range.endDate && 
        date.getDate() === range.endDate.getDate() && 
        date.getMonth() === range.endDate.getMonth() &&
        date.getFullYear() === range.endDate.getFullYear();
      const isHovered = hoveredDate && range.startDate && !range.endDate &&
        date >= new Date(range.startDate.setHours(0, 0, 0, 0)) &&
        date <= new Date(hoveredDate.setHours(0, 0, 0, 0));
      
      days.push(
        <div 
          key={day}
          className={`h-8 w-8 flex items-center justify-center text-sm rounded-full cursor-pointer
            ${isSelected || isHovered ? 'bg-blue-100' : 'hover:bg-gray-100'}
            ${isStart ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
            ${isEnd ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
          `}
          onClick={() => handleDateClick(day)}
          onMouseEnter={() => handleDateHover(day)}
        >
          {day}
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className={`inline-block relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FiCalendar className="mr-2 -ml-1 h-4 w-4 text-gray-500" />
        <span className="max-w-xs truncate">{getDisplayText()}</span>
        <FiChevronDown className="ml-2 -mr-1 h-4 w-4 text-gray-500" />
        {(range.startDate || range.endDate) && (
          <button
            type="button"
            className="ml-1 text-gray-400 hover:text-gray-600"
            onClick={clearSelection}
          >
            <FiX className="h-4 w-4" />
          </button>
        )}
      </button>
      
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-4">
            {/* Calendar header */}
            <div className="flex justify-between items-center mb-4">
              <button
                type="button"
                className="p-1 rounded-full hover:bg-gray-100"
                onClick={goToPreviousMonth}
              >
                <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="text-gray-700 font-medium">
                {new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </div>
              
              <button
                type="button"
                className="p-1 rounded-full hover:bg-gray-100"
                onClick={goToNextMonth}
              >
                <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div key={day} className="h-8 text-center text-xs font-medium text-gray-500 flex items-center justify-center">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {generateCalendarDays()}
            </div>
            
            {/* Quick selections */}
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="text-sm px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                onClick={() => {
                  const today = new Date();
                  const lastWeek = new Date();
                  lastWeek.setDate(today.getDate() - 7);
                  
                  const newRange = {
                    startDate: lastWeek,
                    endDate: today
                  };
                  
                  setRange(newRange);
                  if (onChange) {
                    onChange(newRange);
                  }
                  setIsOpen(false);
                }}
              >
                Last 7 Days
              </button>
              
              <button
                type="button"
                className="text-sm px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                onClick={() => {
                  const today = new Date();
                  const lastMonth = new Date();
                  lastMonth.setMonth(today.getMonth() - 1);
                  
                  const newRange = {
                    startDate: lastMonth,
                    endDate: today
                  };
                  
                  setRange(newRange);
                  if (onChange) {
                    onChange(newRange);
                  }
                  setIsOpen(false);
                }}
              >
                Last 30 Days
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;