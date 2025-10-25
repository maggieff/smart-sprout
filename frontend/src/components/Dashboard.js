import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiDroplet, 
  FiSun, 
  FiThermometer, 
  FiWind,
  FiTrendingUp,
  FiClock,
  FiMessageCircle,
  FiPlus,
  FiRefreshCw
} from 'react-icons/fi';
import toast from 'react-hot-toast';

// Components
import PlantCard from './PlantCard';
import ProgressBar from './ProgressBar';
import SensorChart from './SensorChart';
import RecentLogs from './RecentLogs';
import QuickActions from './QuickActions';
import LoadingSpinner from './LoadingSpinner';

// Services
import { plantService } from '../services/plantService';

const DashboardContainer = styled.div`
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
  background: #97AC83;
  min-height: 100vh;
`;

const DashboardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #333333;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    font-size: 2rem;
    text-align: center;
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #6B8E23;
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #5A7A1F;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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

const FullWidthGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const Card = styled(motion.div)`
  background: #E8EADF;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
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
  color: #333333;
`;

const SensorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const SensorCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #F0F0F0;
  border-radius: 0.75rem;
  border: 1px solid #D9D9D9;
`;

const SensorIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: #6B8E23;
  border-radius: 0.75rem;
  color: white;
  font-size: 1.5rem;
`;

const SensorInfo = styled.div`
  flex: 1;
`;

const SensorLabel = styled.div`
  font-size: 0.875rem;
  color: #666666;
  margin-bottom: 0.25rem;
`;

const SensorValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: #333333;
`;

const SensorStatus = styled.div`
  font-size: 0.75rem;
  color: ${props => {
    switch (props.status) {
      case 'excellent': return '#10B981';
      case 'good': return '#34D399';
      case 'fair': return '#FBBF24';
      case 'poor': return '#F59E0B';
      case 'critical': return '#EF4444';
      default: return '#6b7280';
    }
  }};
  font-weight: 500;
`;

const QuickStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: #E8EADF;
  border-radius: 0.75rem;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #333333;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #666666;
`;

const Dashboard = ({ plants, selectedPlant, onPlantSelect, onPlantUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [sensorHistory, setSensorHistory] = useState([]);

  useEffect(() => {
    if (selectedPlant) {
      loadSensorHistory();
    }
  }, [selectedPlant]);

  const loadSensorHistory = async () => {
    try {
      const history = await plantService.getSensorHistory(selectedPlant.id);
      setSensorHistory(history);
    } catch (error) {
      console.error('Error loading sensor history:', error);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      if (selectedPlant) {
        const updatedPlant = await plantService.getPlantData(selectedPlant.id);
        onPlantUpdate(updatedPlant);
        await loadSensorHistory();
        toast.success('Data refreshed!');
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const getSensorStatus = (value, type) => {
    if (!selectedPlant) return 'unknown';
    
    const sensorData = selectedPlant.sensorData;
    if (!sensorData) return 'unknown';
    
    switch (type) {
      case 'moisture':
        if (value >= 40 && value <= 70) return 'excellent';
        if (value >= 30 && value <= 80) return 'good';
        if (value >= 20 && value <= 90) return 'fair';
        return 'poor';
      case 'light':
        if (value >= 400 && value <= 800) return 'excellent';
        if (value >= 300 && value <= 1000) return 'good';
        if (value >= 200 && value <= 1200) return 'fair';
        return 'poor';
      case 'temperature':
        if (value >= 68 && value <= 78) return 'excellent';
        if (value >= 65 && value <= 85) return 'good';
        if (value >= 60 && value <= 90) return 'fair';
        return 'poor';
      case 'humidity':
        if (value >= 45 && value <= 65) return 'excellent';
        if (value >= 35 && value <= 75) return 'good';
        if (value >= 25 && value <= 85) return 'fair';
        return 'poor';
      default:
        return 'unknown';
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

  if (!selectedPlant) {
    return (
      <DashboardContainer>
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">
            No Plant Selected
          </h2>
          <p className="text-white/80 mb-6">
            Select a plant from the header to view its dashboard
          </p>
        </div>
      </DashboardContainer>
    );
  }

  const { sensorData, healthScore, status } = selectedPlant;

  return (
    <DashboardContainer>
      <DashboardHeader>
        <Title>Plant Dashboard</Title>
        <RefreshButton onClick={handleRefresh} disabled={loading}>
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          Refresh Data
        </RefreshButton>
      </DashboardHeader>

      <QuickStats>
        <StatCard>
          <StatValue>{Math.round(healthScore * 100)}%</StatValue>
          <StatLabel>Health Score</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{sensorData?.moisture || 0}%</StatValue>
          <StatLabel>Moisture</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{sensorData?.light || 0}</StatValue>
          <StatLabel>Light Level</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{sensorData?.temperature || 0}°F</StatValue>
          <StatLabel>Temperature</StatLabel>
        </StatCard>
      </QuickStats>

      <Grid>
        <Card
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CardHeader>
            <CardTitle>Plant Health</CardTitle>
          </CardHeader>
          <ProgressBar 
            value={healthScore} 
            status={status}
            showLabel={true}
          />
        </Card>

        <Card
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <QuickActions plant={selectedPlant} />
        </Card>
      </Grid>

      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ marginBottom: '2rem' }}
      >
        <CardHeader>
          <CardTitle>Sensor Data</CardTitle>
        </CardHeader>
         <SensorGrid>
           <SensorCard>
             <SensorIcon>
               <FiDroplet />
             </SensorIcon>
             <SensorInfo>
               <SensorLabel>Moisture</SensorLabel>
               <SensorValue>{sensorData?.moisture || 0}%</SensorValue>
               <SensorStatus status={getSensorStatus(sensorData?.moisture, 'moisture')}>
                 {getStatusText(getSensorStatus(sensorData?.moisture, 'moisture'))}
               </SensorStatus>
             </SensorInfo>
           </SensorCard>

           <SensorCard>
             <SensorIcon>
               <FiSun />
             </SensorIcon>
             <SensorInfo>
               <SensorLabel>Light</SensorLabel>
               <SensorValue>{sensorData?.light || 0} lux</SensorValue>
               <SensorStatus status={getSensorStatus(sensorData?.light, 'light')}>
                 {getStatusText(getSensorStatus(sensorData?.light, 'light'))}
               </SensorStatus>
             </SensorInfo>
           </SensorCard>

           <SensorCard>
             <SensorIcon>
               <FiThermometer />
             </SensorIcon>
             <SensorInfo>
               <SensorLabel>Temperature</SensorLabel>
               <SensorValue>{sensorData?.temperature || 0}°F</SensorValue>
               <SensorStatus status={getSensorStatus(sensorData?.temperature, 'temperature')}>
                 {getStatusText(getSensorStatus(sensorData?.temperature, 'temperature'))}
               </SensorStatus>
             </SensorInfo>
           </SensorCard>

           <SensorCard>
             <SensorIcon>
               <FiWind />
             </SensorIcon>
             <SensorInfo>
               <SensorLabel>Humidity</SensorLabel>
               <SensorValue>{sensorData?.humidity || 0}%</SensorValue>
               <SensorStatus status={getSensorStatus(sensorData?.humidity, 'humidity')}>
                 {getStatusText(getSensorStatus(sensorData?.humidity, 'humidity'))}
               </SensorStatus>
             </SensorInfo>
           </SensorCard>
         </SensorGrid>
      </Card>

      <FullWidthGrid>
        <Card
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <CardHeader>
            <CardTitle>Sensor History</CardTitle>
          </CardHeader>
          <SensorChart data={sensorHistory} />
        </Card>

        <Card
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <RecentLogs plantId={selectedPlant.id} />
        </Card>
      </FullWidthGrid>
    </DashboardContainer>
  );
};

export default Dashboard;
