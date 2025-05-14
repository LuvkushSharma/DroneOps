import React from 'react';

/**
 * MiniTable component for displaying small tables in dashboards and cards
 * 
 * @param {Object} props
 * @param {Array} props.headers - Array of header text strings
 * @param {Array} props.data - 2D array of table data rows
 * @param {boolean} props.compact - Whether to use compact styling
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onRowClick - Callback when a row is clicked
 */
const MiniTable = ({
  headers = [],
  data = [],
  compact = false,
  className = '',
  onRowClick
}) => {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className={`-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8 ${compact ? 'sm:px-0' : ''}`}>
        <div className={`inline-block min-w-full py-2 align-middle ${compact ? '' : 'sm:px-6 lg:px-8'}`}>
          <table className="min-w-full divide-y divide-gray-200">
            {headers.length > 0 && (
              <thead className="bg-gray-50">
                <tr>
                  {headers.map((header, index) => (
                    <th
                      key={index}
                      scope="col"
                      className={`${
                        compact ? 'px-2 py-2' : 'px-3 py-3.5'
                      } text-left text-xs font-medium text-gray-500 uppercase tracking-wider`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length > 0 ? (
                data.map((row, rowIndex) => (
                  <tr 
                    key={rowIndex} 
                    className={onRowClick ? 'hover:bg-gray-50 cursor-pointer' : ''}
                    onClick={onRowClick ? () => onRowClick(rowIndex, row) : undefined}
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={`${
                          compact ? 'px-2 py-2' : 'px-3 py-3.5'
                        } whitespace-nowrap ${cellIndex === 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={headers.length || 1}
                    className={`${
                      compact ? 'px-2 py-4' : 'px-3 py-8'
                    } text-sm text-center text-gray-500`}
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MiniTable;