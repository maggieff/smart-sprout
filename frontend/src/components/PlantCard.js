import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiDroplet, 
  FiSun, 
  FiThermometer, 
  FiWind,
  FiTrendingUp,
  FiClock,
  FiArrowRight
} from 'react-icons/fi';

const Card = styled(motion.div)`
  background: #65876a;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #5a6b5d;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1);
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
  width: 4rem;
  height: 4rem;
  background: linear-gradient(135deg, #10B981, #34D399);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
`;

const PlantDetails = styled.div`
  flex: 1;
`;

const PlantName = styled.h3`
  font-family: 'Cubano', 'Karla', sans-serif;
  font-size: 1.25rem;
  font-weight: normal;
  color: white;
  margin-bottom: 0.25rem;
`;

const PlantSpecies = styled.p`
  font-size: 0.875rem;
  color: white;
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
  color: white;
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
  color: white;
  margin-bottom: 0.125rem;
`;

const SensorValue = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
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

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
`;

const LastWatered = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: white;
`;

const ViewButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #10B981;
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #059669;
    transform: translateY(-1px);
  }
`;

const PlantCard = ({ plant, onClick }) => {
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

  const { sensorData, healthScore, status, lastWatered } = plant;

  return (
    <Card
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
    >
      <CardHeader>
        <PlantInfo>
          <PlantImage>
            🌱
          </PlantImage>
          <PlantDetails>
            <PlantName>{plant.name}</PlantName>
            <PlantSpecies>{plant.species}</PlantSpecies>
          </PlantDetails>
        </PlantInfo>
        <HealthScore>
          <ScoreValue score={healthScore}>
            {Math.round(healthScore * 100)}%
          </ScoreValue>
          <ScoreLabel>Health</ScoreLabel>
        </HealthScore>
      </CardHeader>

      <StatusBadge status={status}>
        {getStatusEmoji(status)} {getStatusText(status)}
      </StatusBadge>

      {sensorData && (
        <SensorGrid>
          <SensorItem>
            <SensorIcon color="#0ea5e9">
              <FiDroplet />
            </SensorIcon>
            <SensorInfo>
              <SensorLabel>Moisture</SensorLabel>
              <SensorValue>{sensorData.moisture}%</SensorValue>
            </SensorInfo>
          </SensorItem>

          <SensorItem>
            <SensorIcon color="#f59e0b">
              <FiSun />
            </SensorIcon>
            <SensorInfo>
              <SensorLabel>Light</SensorLabel>
              <SensorValue>{sensorData.light}</SensorValue>
            </SensorInfo>
          </SensorItem>

          <SensorItem>
            <SensorIcon color="#ef4444">
              <FiThermometer />
            </SensorIcon>
            <SensorInfo>
              <SensorLabel>Temperature</SensorLabel>
              <SensorValue>{sensorData.temperature}°F</SensorValue>
            </SensorInfo>
          </SensorItem>

          <SensorItem>
            <SensorIcon color="#10b981">
              <FiWind />
            </SensorIcon>
            <SensorInfo>
              <SensorLabel>Humidity</SensorLabel>
              <SensorValue>{sensorData.humidity}%</SensorValue>
            </SensorInfo>
          </SensorItem>
        </SensorGrid>
      )}

      <CardFooter>
        <LastWatered>
          <FiClock />
          Last watered: {formatLastWatered(lastWatered)}
        </LastWatered>
        <ViewButton to={`/plant/${plant.id}`}>
          View Details
          <FiArrowRight />
        </ViewButton>
      </CardFooter>
    </Card>
  );
};

export default PlantCard;
