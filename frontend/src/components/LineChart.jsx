import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const LineChart = ({ data, xKey, yKey, xLabel, yLabel, color = '#3b82f6' }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(item => {
          // Format date if it looks like a date string
          if (typeof item[xKey] === 'string' && item[xKey].includes('-')) {
            const date = new Date(item[xKey]);
            return date.toLocaleDateString();
          }
          return item[xKey];
        }),
        datasets: [
          {
            label: yLabel || '',
            data: data.map(item => item[yKey]),
            borderColor: color,
            backgroundColor: `${color}33`, // Add transparency
            fill: true,
            tension: 0.3,
            pointRadius: 3,
            pointHoverRadius: 5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.7)'
          }
        },
        scales: {
          x: {
            title: {
              display: Boolean(xLabel),
              text: xLabel || ''
            },
            grid: {
              display: false
            }
          },
          y: {
            title: {
              display: Boolean(yLabel),
              text: yLabel || ''
            },
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, xKey, yKey, xLabel, yLabel, color]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 text-gray-400">
        No data available
      </div>
    );
  }

  return <canvas ref={chartRef} />;
};

export default LineChart;