import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiDroplet, 
  FiSun, 
  FiThermometer, 
  FiWind,
  FiMessageCircle,
  FiCamera,
  FiPlus,
  FiCheck
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
`;

const ActionButton = styled(motion.button)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: ${props => props.bgColor || '#f9fafb'};
  border: 1px solid ${props => props.borderColor || '#e5e7eb'};
  border-radius: 0.75rem;
  color: ${props => props.color || '#374151'};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ActionIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
`;

const ActionLabel = styled.div`
  font-size: 0.75rem;
  text-align: center;
  line-height: 1.2;
`;

const ActionStatus = styled.div`
  font-size: 0.625rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

const QuickActions = ({ plant }) => {
  const [actions, setActions] = useState({
    watered: false,
    fertilized: false,
    repotted: false,
    photographed: false
  });

  const handleAction = async (actionType) => {
    try {
      // Simulate action
      setActions(prev => ({ ...prev, [actionType]: true }));
      
      // Show success message
      const messages = {
        watered: 'Plant watered! 💧',
        fertilized: 'Fertilizer applied! 🌱',
        repotted: 'Repotting logged! 🪴',
        photographed: 'Photo uploaded! 📸'
      };
      
      toast.success(messages[actionType]);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setActions(prev => ({ ...prev, [actionType]: false }));
      }, 3000);
      
    } catch (error) {
      console.error('Error performing action:', error);
      toast.error('Failed to perform action');
    }
  };

  const getActionConfig = (type) => {
    const configs = {
      watered: {
        icon: <FiDroplet />,
        label: 'Water Plant',
        bgColor: '#f0f9ff',
        borderColor: '#0ea5e9',
        color: '#0ea5e9'
      },
      fertilized: {
        icon: <FiSun />,
        label: 'Add Fertilizer',
        bgColor: '#fffbeb',
        borderColor: '#f59e0b',
        color: '#f59e0b'
      },
      repotted: {
        icon: <FiWind />,
        label: 'Log Repotting',
        bgColor: '#f0fdf4',
        borderColor: '#10b981',
        color: '#10b981'
      },
      photographed: {
        icon: <FiCamera />,
        label: 'Take Photo',
        bgColor: '#fef2f2',
        borderColor: '#ef4444',
        color: '#ef4444'
      }
    };
    return configs[type];
  };

  const getStatusText = (actionType) => {
    if (actions[actionType]) {
      return 'Done!';
    }
    
    switch (actionType) {
      case 'watered':
        return 'Tap to water';
      case 'fertilized':
        return 'Add nutrients';
      case 'repotted':
        return 'Log activity';
      case 'photographed':
        return 'Upload photo';
      default:
        return 'Tap to perform';
    }
  };

  return (
    <ActionsGrid>
      {Object.keys(actions).map((actionType) => {
        const config = getActionConfig(actionType);
        const isCompleted = actions[actionType];
        
        return (
          <ActionButton
            key={actionType}
            onClick={() => handleAction(actionType)}
            disabled={isCompleted}
            bgColor={isCompleted ? '#d1fae5' : config.bgColor}
            borderColor={isCompleted ? '#10b981' : config.borderColor}
            color={isCompleted ? '#065f46' : config.color}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ActionIcon>
              {isCompleted ? <FiCheck /> : config.icon}
            </ActionIcon>
            <ActionLabel>{config.label}</ActionLabel>
            <ActionStatus>{getStatusText(actionType)}</ActionStatus>
          </ActionButton>
        );
      })}
    </ActionsGrid>
  );
};

export default QuickActions;
