import React from 'react';
import { PieChart as RechartsComponent, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const PieChart = ({ data, nameKey, dataKey, colors = COLORS, showLegend = true }) => {
  // Safety check for empty data
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }
  
  // Use provided colors or default to COLORS
  const chartColors = colors || COLORS;
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsComponent>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey={dataKey}
          nameKey={nameKey}
          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={chartColors[index % chartColors.length]} 
            />
          ))}
        </Pie>
        {showLegend && <Legend layout="vertical" align="right" verticalAlign="middle" />}
        <Tooltip 
          formatter={(value) => [`${value}`, 'Count']} 
          labelFormatter={(name) => `${name}`}
        />
      </RechartsComponent>
    </ResponsiveContainer>
  );
};

export default PieChart;