import React from 'react';
import styled from 'styled-components';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

const ChartContainer = styled.div`
  width: 100%;
  height: 300px;
  margin-top: 1rem;
`;

const ChartTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
`;

const NoDataMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #6b7280;
  font-size: 0.875rem;
`;

const CustomTooltip = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const TooltipLabel = styled.div`
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const TooltipItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
`;

const TooltipColor = styled.div`
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background: ${props => props.color};
`;

const SensorChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <ChartContainer>
        <ChartTitle>Sensor History</ChartTitle>
        <NoDataMessage>
          No sensor data available. Data will appear here as sensors collect information.
        </NoDataMessage>
      </ChartContainer>
    );
  }

  // Format data for the chart
  const chartData = data.map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    moisture: Math.round(item.moisture),
    light: Math.round(item.light),
    temperature: Math.round(item.temperature),
    humidity: Math.round(item.humidity)
  }));

  const CustomTooltipContent = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <CustomTooltip>
          <TooltipLabel>{`Time: ${label}`}</TooltipLabel>
          {payload.map((entry, index) => (
            <TooltipItem key={index}>
              <TooltipColor color={entry.color} />
              <span>{entry.name}: {entry.value}</span>
            </TooltipItem>
          ))}
        </CustomTooltip>
      );
    }
    return null;
  };

  return (
    <ChartContainer>
      <ChartTitle>Sensor History (Last 24 Hours)</ChartTitle>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="time" 
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltipContent />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="moisture" 
            stroke="#0ea5e9" 
            strokeWidth={2}
            dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
            name="Moisture (%)"
          />
          <Line 
            type="monotone" 
            dataKey="light" 
            stroke="#f59e0b" 
            strokeWidth={2}
            dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
            name="Light Level"
          />
          <Line 
            type="monotone" 
            dataKey="temperature" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
            name="Temperature (°F)"
          />
          <Line 
            type="monotone" 
            dataKey="humidity" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            name="Humidity (%)"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default SensorChart;
