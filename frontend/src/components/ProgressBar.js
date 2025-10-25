import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const ProgressContainer = styled.div`
  width: 100%;
  background: #f3f4f6;
  border-radius: 0.5rem;
  overflow: hidden;
  position: relative;
  height: ${props => props.height || '0.75rem'};
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: ${props => {
    if (props.value >= 0.8) return 'linear-gradient(90deg, #10B981, #34D399)';
    if (props.value >= 0.6) return 'linear-gradient(90deg, #34D399, #6EE7B7)';
    if (props.value >= 0.4) return 'linear-gradient(90deg, #FBBF24, #FCD34D)';
    if (props.value >= 0.2) return 'linear-gradient(90deg, #F59E0B, #FBBF24)';
    return 'linear-gradient(90deg, #EF4444, #F87171)';
  }};
  border-radius: 0.5rem;
  position: relative;
  overflow: hidden;
`;

const ProgressGlow = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
`;

const ProgressLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const Label = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const Value = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => {
    if (props.value >= 0.8) return '#10B981';
    if (props.value >= 0.6) return '#34D399';
    if (props.value >= 0.4) return '#FBBF24';
    if (props.value >= 0.2) return '#F59E0B';
    return '#EF4444';
  }};
`;

const StatusText = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
  text-align: center;
`;

const StatusIcon = styled.span`
  margin-right: 0.25rem;
`;

const ProgressBar = ({ 
  value = 0, 
  max = 1, 
  label = 'Health Score', 
  showLabel = true, 
  showValue = true, 
  showStatus = true,
  status,
  height = '0.75rem',
  animated = true
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const getStatusInfo = (score) => {
    if (score >= 0.8) return { text: 'Excellent', icon: '🌟', color: '#10B981' };
    if (score >= 0.6) return { text: 'Good', icon: '😊', color: '#34D399' };
    if (score >= 0.4) return { text: 'Fair', icon: '📝', color: '#FBBF24' };
    if (score >= 0.2) return { text: 'Poor', icon: '🆘', color: '#F59E0B' };
    return { text: 'Critical', icon: '🚨', color: '#EF4444' };
  };

  const statusInfo = getStatusInfo(value);

  return (
    <div>
      {showLabel && (
        <ProgressLabel>
          <Label>{label}</Label>
          {showValue && (
            <Value value={value}>
              {Math.round(percentage)}%
            </Value>
          )}
        </ProgressLabel>
      )}
      
      <ProgressContainer height={height}>
        <ProgressFill
          value={value}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: animated ? 1 : 0,
            ease: "easeOut"
          }}
        >
          {animated && <ProgressGlow />}
        </ProgressFill>
      </ProgressContainer>
      
      {showStatus && (
        <StatusText>
          <StatusIcon>{statusInfo.icon}</StatusIcon>
          {status || statusInfo.text}
        </StatusText>
      )}
    </div>
  );
};

export default ProgressBar;
