import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiClock, 
  FiDroplet, 
  FiSun, 
  FiThermometer, 
  FiWind,
  FiPlus,
  FiMessageCircle,
  FiTrendingUp
} from 'react-icons/fi';
import { logService } from '../services/logService';

const LogsContainer = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const LogItem = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  background: ${props => {
    switch (props.type) {
      case 'watering': return '#f0f9ff';
      case 'observation': return '#f0fdf4';
      case 'fertilizing': return '#fffbeb';
      case 'repotting': return '#fef2f2';
      default: return '#f9fafb';
    }
  }};
  border-left: 3px solid ${props => {
    switch (props.type) {
      case 'watering': return '#0ea5e9';
      case 'observation': return '#10b981';
      case 'fertilizing': return '#f59e0b';
      case 'repotting': return '#ef4444';
      default: return '#6b7280';
    }
  }};
`;

const LogIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: ${props => {
    switch (props.type) {
      case 'watering': return '#0ea5e9';
      case 'observation': return '#10b981';
      case 'fertilizing': return '#f59e0b';
      case 'repotting': return '#ef4444';
      default: return '#6b7280';
    }
  }};
  color: white;
  font-size: 0.875rem;
  flex-shrink: 0;
`;

const LogContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const LogText = styled.div`
  font-size: 0.875rem;
  color: #374151;
  margin-bottom: 0.25rem;
  line-height: 1.4;
`;

const LogTime = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

const LogType = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: capitalize;
  margin-top: 0.25rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6b7280;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const EmptyText = styled.div`
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const AddLogButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #059669;
    transform: translateY(-1px);
  }
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6b7280;
`;

const RecentLogs = ({ plantId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, [plantId]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await logService.getLogs(plantId, 5);
      setLogs(response.logs || []);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'watering': return <FiDroplet />;
      case 'observation': return <FiMessageCircle />;
      case 'fertilizing': return <FiTrendingUp />;
      case 'repotting': return <FiSun />;
      default: return <FiMessageCircle />;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <LoadingState>
        <div className="spinner" />
        Loading logs...
      </LoadingState>
    );
  }

  if (logs.length === 0) {
    return (
      <EmptyState>
        <EmptyIcon>
          <FiMessageCircle />
        </EmptyIcon>
        <EmptyText>No recent activity</EmptyText>
        <AddLogButton>
          <FiPlus />
          Add Log
        </AddLogButton>
      </EmptyState>
    );
  }

  return (
    <LogsContainer>
      {logs.map((log, index) => (
        <LogItem
          key={log.id}
          type={log.type}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <LogIcon type={log.type}>
            {getLogIcon(log.type)}
          </LogIcon>
          <LogContent>
            <LogText>{log.note}</LogText>
            <LogTime>{formatTime(log.timestamp)}</LogTime>
            <LogType>{log.type}</LogType>
          </LogContent>
        </LogItem>
      ))}
    </LogsContainer>
  );
};

export default RecentLogs;
