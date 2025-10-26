import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiDroplet, 
  FiSun, 
  FiThermometer, 
  FiWind,
  FiClock,
  FiMessageCircle,
  FiCamera,
  FiPlus,
  FiEdit3
} from 'react-icons/fi';
import { plantService } from '../services/plantService';
import { logService } from '../services/logService';
import ProgressBar from './ProgressBar';
import SensorChart from './SensorChart';
import RecentLogs from './RecentLogs';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

const DetailContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const BackButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 2rem;
  transition: all 0.2s ease;

  &:hover {
    color: #f3f4f6;
    transform: translateX(-4px);
  }
`;

const PlantHeader = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 2rem;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const PlantImage = styled.div`
  width: 6rem;
  height: 6rem;
  background: linear-gradient(135deg, #10B981, #34D399);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: white;
`;

const PlantInfo = styled.div`
  flex: 1;
`;

const PlantName = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const PlantSpecies = styled.p`
  font-size: 1.125rem;
  color: #6b7280;
  margin-bottom: 1rem;
`;

const PlantStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
`;

const HealthSection = styled.div`
  text-align: center;
`;

const HealthScore = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #10B981;
  margin-bottom: 0.5rem;
`;

const HealthLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const Card = styled(motion.div)`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #059669;
    transform: translateY(-1px);
  }
`;

const SensorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const SensorCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
`;

const SensorIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: ${props => props.bgColor || '#f3f4f6'};
  border-radius: 0.75rem;
  color: ${props => props.color || '#6b7280'};
  font-size: 1.5rem;
`;

const SensorInfo = styled.div`
  flex: 1;
`;

const SensorLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
`;

const SensorValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
`;

const CareInstructions = styled.div`
  background: #f0fdf4;
  border-radius: 0.75rem;
  padding: 1rem;
  margin-top: 1rem;
`;

const InstructionsTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: #065f46;
  margin-bottom: 0.75rem;
`;

const InstructionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #d1fae5;
  font-size: 0.875rem;

  &:last-child {
    border-bottom: none;
  }
`;

const InstructionLabel = styled.span`
  color: #374151;
  font-weight: 500;
`;

const InstructionValue = styled.span`
  color: #6b7280;
`;

const PlantDetail = ({ plants, onPlantUpdate }) => {
  const { plantId } = useParams();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    loadPlantData();
  }, [plantId]);

  const loadPlantData = async () => {
    try {
      setLoading(true);
      const plantData = await plantService.getPlantData(plantId);
      setPlant(plantData);
      
      const logsData = await logService.getLogs(plantId, 10);
      setLogs(logsData.logs || []);
    } catch (error) {
      console.error('Error loading plant data:', error);
      toast.error('Failed to load plant data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLog = async (logData) => {
    try {
      await logService.createLog({
        plantId,
        ...logData
      });
      
      // Reload logs
      const logsData = await logService.getLogs(plantId, 10);
      setLogs(logsData.logs || []);
      
      toast.success('Log added successfully!');
    } catch (error) {
      console.error('Error adding log:', error);
      toast.error('Failed to add log');
    }
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

  if (loading) {
    return <LoadingSpinner message="Loading plant details..." />;
  }

  if (!plant) {
    return (
      <DetailContainer>
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Plant Not Found
          </h2>
          <p className="text-white/80 mb-6">
            The plant you're looking for doesn't exist.
          </p>
          <Link to="/" className="btn btn-primary">
            <FiArrowLeft />
            Back to Dashboard
          </Link>
        </div>
      </DetailContainer>
    );
  }

  const { sensorData, healthScore, status, careInstructions } = plant;

  return (
    <DetailContainer>
      <BackButton to="/">
        <FiArrowLeft />
        Back to Dashboard
      </BackButton>

      <PlantHeader>
        <PlantImage>
          🌱
        </PlantImage>
        <PlantInfo>
          <PlantName>{plant.name}</PlantName>
          <PlantSpecies>{plant.species}</PlantSpecies>
          <PlantStatus>
            {getStatusEmoji(status)} {getStatusText(status)} Health
          </PlantStatus>
        </PlantInfo>
        <HealthSection>
          <HealthScore>{Math.round(healthScore * 100)}%</HealthScore>
          <HealthLabel>Health Score</HealthLabel>
        </HealthSection>
      </PlantHeader>

      <Grid>
        <Card
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CardHeader>
            <CardTitle>Health Progress</CardTitle>
          </CardHeader>
          <ProgressBar 
            value={healthScore} 
            status={status}
            showLabel={true}
            height="1rem"
          />
        </Card>

        <Card
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <ActionButton>
              <FiPlus />
              Add Log
            </ActionButton>
          </CardHeader>
          <div className="grid grid-cols-2 gap-2">
            <ActionButton>
              <FiDroplet />
              Water
            </ActionButton>
            <ActionButton>
              <FiCamera />
              Photo
            </ActionButton>
          </div>
        </Card>
      </Grid>

      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <CardHeader>
          <CardTitle>Current Sensor Data</CardTitle>
        </CardHeader>
        <SensorGrid>
          <SensorCard>
            <SensorIcon bgColor="#0ea5e9" color="white">
              <FiDroplet />
            </SensorIcon>
            <SensorInfo>
              <SensorLabel>Moisture</SensorLabel>
              <SensorValue>{sensorData?.moisture || 0}%</SensorValue>
            </SensorInfo>
          </SensorCard>

          <SensorCard>
            <SensorIcon bgColor="#f59e0b" color="white">
              <FiSun />
            </SensorIcon>
            <SensorInfo>
              <SensorLabel>Light</SensorLabel>
              <SensorValue>{sensorData?.light || 0}</SensorValue>
            </SensorInfo>
          </SensorCard>

          <SensorCard>
            <SensorIcon bgColor="#ef4444" color="white">
              <FiThermometer />
            </SensorIcon>
            <SensorInfo>
              <SensorLabel>Temperature</SensorLabel>
              <SensorValue>{sensorData?.temperature || 0}°F</SensorValue>
            </SensorInfo>
          </SensorCard>

          <SensorCard>
            <SensorIcon bgColor="#10b981" color="white">
              <FiWind />
            </SensorIcon>
            <SensorInfo>
              <SensorLabel>Humidity</SensorLabel>
              <SensorValue>{sensorData?.humidity || 0}%</SensorValue>
            </SensorInfo>
          </SensorCard>
        </SensorGrid>
      </Card>

      <Grid>
        <Card
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <CardHeader>
            <CardTitle>Care Instructions</CardTitle>
          </CardHeader>
          <CareInstructions>
            <InstructionsTitle>Care Guidelines</InstructionsTitle>
            {careInstructions && Object.entries(careInstructions).map(([key, value]) => (
              <InstructionItem key={key}>
                <InstructionLabel>{key.charAt(0).toUpperCase() + key.slice(1)}</InstructionLabel>
                <InstructionValue>{value}</InstructionValue>
              </InstructionItem>
            ))}
          </CareInstructions>
        </Card>

        <Card
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <ActionButton>
              <FiMessageCircle />
              View All
            </ActionButton>
          </CardHeader>
          <RecentLogs plantId={plantId} />
        </Card>
      </Grid>

      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <CardHeader>
          <CardTitle>Sensor History</CardTitle>
        </CardHeader>
        <SensorChart data={[]} />
      </Card>
    </DetailContainer>
  );
};

export default PlantDetail;
