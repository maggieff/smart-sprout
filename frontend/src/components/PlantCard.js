import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiDroplet, 
  FiSun, 
  FiThermometer, 
  FiWind,
  FiTrendingUp,
  FiClock,
  FiArrowRight,
  FiEdit2
} from 'react-icons/fi';

const Card = styled(motion.div)`
  background: #6B8E6F;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const PlantInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const PlantImage = styled.div`
  width: 100%;
  height: 180px;
  background: #D3D3D3;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PlantDetails = styled.div`
  flex: 1;
`;

const PlantName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
  text-align: left;
`;

const PlantSpecies = styled.p`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1rem;
  text-align: left;
`;

const HealthScore = styled.div`
  text-align: right;
`;

const ScoreValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => {
    if (props.score >= 0.8) return '#10B981';
    if (props.score >= 0.6) return '#34D399';
    if (props.score >= 0.4) return '#FBBF24';
    if (props.score >= 0.2) return '#F59E0B';
    return '#EF4444';
  }};
`;

const ScoreLabel = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

const SensorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 1rem 0;
`;

const SensorItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
`;

const SensorIcon = styled.div`
  color: ${props => props.color || '#6b7280'};
  font-size: 1rem;
`;

const SensorInfo = styled.div`
  flex: 1;
`;

const SensorLabel = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.125rem;
`;

const SensorValue = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'excellent': return '#d1fae5';
      case 'good': return '#d1fae5';
      case 'fair': return '#fef3c7';
      case 'poor': return '#fed7aa';
      case 'critical': return '#fecaca';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'excellent': return '#065f46';
      case 'good': return '#065f46';
      case 'fair': return '#92400e';
      case 'poor': return '#9a3412';
      case 'critical': return '#991b1b';
      default: return '#374151';
    }
  }};
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  margin-top: auto;
`;

const ProgressBarLabel = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const ProgressBarTrack = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 999px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div`
  height: 100%;
  background: ${props => {
    const score = props.value || 0;
    if (score >= 0.8) return '#10B981';
    if (score >= 0.6) return '#34D399';
    if (score >= 0.4) return '#FBBF24';
    if (score >= 0.2) return '#F59E0B';
    return '#EF4444';
  }};
  width: ${props => (props.value || 0) * 100}%;
  border-radius: 999px;
  transition: width 0.3s ease;
`;

const EditButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  &:hover {
    background: white;
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  svg {
    color: #2D3E2D;
    font-size: 16px;
  }
`;

const PlantCard = ({ plant, onClick }) => {
  const navigate = useNavigate();

  const handleEditClick = (e) => {
    e.stopPropagation(); // Prevent card click event
    navigate(`/edit-plant/${plant.id}`);
  };

  const handleCardClick = () => {
    navigate(`/plant/${plant.id}`);
  };

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'excellent': return '🌟';
      case 'good': return '😊';
      case 'fair': return '📝';
      case 'poor': return '🆘';
      case 'critical': return '🚨';
      default: return '❓';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'fair': return 'Fair';
      case 'poor': return 'Poor';
      case 'critical': return 'Critical';
      default: return 'Unknown';
    }
  };

  const formatLastWatered = (date) => {
    if (!date) return 'Unknown';
    const now = new Date();
    const watered = new Date(date);
    const diffTime = Math.abs(now - watered);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const { healthScore, image } = plant;

  return (
    <Card
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={handleCardClick}
    >
      <EditButton onClick={handleEditClick} title="Edit plant">
        <FiEdit2 />
      </EditButton>
      
      <PlantImage>
        {image && image !== '/images/plant-placeholder.jpg' ? (
          <img src={image} alt={plant.name} />
        ) : null}
      </PlantImage>
      
      <PlantName>{plant.name}</PlantName>
      
      <ProgressBarContainer>
        <ProgressBarLabel>Overall</ProgressBarLabel>
        <ProgressBarTrack>
          <ProgressBarFill value={healthScore} />
        </ProgressBarTrack>
      </ProgressBarContainer>
    </Card>
  );
};

export default PlantCard;
