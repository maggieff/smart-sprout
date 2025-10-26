import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  FiEdit3,
  FiChevronDown,
  FiChevronUp,
  FiBook
} from 'react-icons/fi';
import { plantService } from '../services/plantService';
import { logService } from '../services/logService';
import ProgressBar from './ProgressBar';
import SensorChart from './SensorChart';
import RecentLogs from './RecentLogs';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';
import { getSpeciesInfo } from '../data/speciesInfo';

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
  grid-template-columns: auto 1fr auto auto;
  gap: 2rem;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 1rem;
  }
`;

const PlantImage = styled.div`
  width: 8rem;
  height: 8rem;
  background: linear-gradient(135deg, #10B981, #34D399);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: white;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
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

const EditPlantButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #6B8E6F;
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #5a7a5e;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(107, 142, 111, 0.3);
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

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
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

const SensorStatus = styled.div`
  font-size: 0.75rem;
  color: ${props => props.color || '#6b7280'};
  font-weight: 500;
  margin-top: 0.25rem;
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

const BioSection = styled(motion.div)`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const BioHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 0.5rem 0;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
`;

const BioHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BioIcon = styled.div`
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #6B8E6F, #8BAB8F);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
`;

const BioToggle = styled.div`
  color: #6B8E6F;
  font-size: 1.5rem;
  transition: transform 0.3s ease;
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const BioTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
`;

const BioSubtitle = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  font-style: italic;
  margin: 0.25rem 0 0 0;
`;

const BioContent = styled(motion.div)`
  overflow: hidden;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #f3f4f6;
`;

const BioDescription = styled.p`
  font-size: 1rem;
  line-height: 1.75;
  color: #374151;
  margin-bottom: 1.5rem;
  text-align: justify;
`;

const BioMetadata = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.75rem;
`;

const MetadataItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const MetadataLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
`;

const MetadataValue = styled.span`
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 500;
`;

const BioList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
`;

const BioListItem = styled.li`
  font-size: 0.875rem;
  line-height: 1.6;
  color: #374151;
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;

  &:before {
    content: '•';
    position: absolute;
    left: 0.5rem;
    color: #6B8E6F;
    font-weight: bold;
    font-size: 1.2rem;
  }
`;

const BioSectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.75rem;
`;

const PlantDetail = ({ plants, onPlantUpdate }) => {
  const { plantId } = useParams();
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [isBioExpanded, setIsBioExpanded] = useState(false);

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

  const getSensorStatus = (value, range, sensorType) => {
    if (!range) return { message: '', color: '#6b7280' };

    const { min, max, optimal } = range;
    const percentDiff = ((value - optimal) / optimal) * 100;

    // Critical thresholds
    if (value < min * 0.5 || value > max * 1.5) {
      if (sensorType === 'moisture' && value < min * 0.5) {
        return { message: '⚠️ Very dry - water needed', color: '#dc2626' };
      } else if (sensorType === 'moisture' && value > max * 1.5) {
        return { message: '⚠️ Too wet - check drainage', color: '#dc2626' };
      } else if (sensorType === 'temperature' && value < min) {
        return { message: '❄️ Too cold for this plant', color: '#dc2626' };
      } else if (sensorType === 'temperature' && value > max) {
        return { message: '🔥 Too hot for this plant', color: '#dc2626' };
      }
      return { message: '⚠️ Outside safe range', color: '#dc2626' };
    }

    // Below minimum
    if (value < min) {
      if (sensorType === 'moisture') {
        return { message: '💧 Could use some water', color: '#f59e0b' };
      } else if (sensorType === 'light') {
        return { message: '☀️ A bit dim - more light would help', color: '#f59e0b' };
      } else if (sensorType === 'temperature') {
        return { message: '🌡️ A little cool', color: '#f59e0b' };
      } else if (sensorType === 'humidity') {
        return { message: '💨 Slightly dry air', color: '#f59e0b' };
      }
      return { message: 'Below ideal range', color: '#f59e0b' };
    }

    // Above maximum
    if (value > max) {
      if (sensorType === 'moisture') {
        return { message: '💦 Soil is quite moist', color: '#f59e0b' };
      } else if (sensorType === 'light') {
        return { message: '☀️ Very bright - ensure no leaf burn', color: '#f59e0b' };
      } else if (sensorType === 'temperature') {
        return { message: '🌡️ Quite warm', color: '#f59e0b' };
      } else if (sensorType === 'humidity') {
        return { message: '💧 High humidity', color: '#f59e0b' };
      }
      return { message: 'Above ideal range', color: '#f59e0b' };
    }

    // Within range but not optimal
    if (Math.abs(percentDiff) > 15) {
      if (value < optimal) {
        if (sensorType === 'moisture') {
          return { message: 'Good - may need water soon', color: '#059669' };
        } else if (sensorType === 'light') {
          return { message: 'Good - could be brighter', color: '#059669' };
        }
        return { message: 'Good - slightly below optimal', color: '#059669' };
      } else {
        if (sensorType === 'moisture') {
          return { message: 'Good - well hydrated', color: '#059669' };
        } else if (sensorType === 'light') {
          return { message: 'Good - plenty of light', color: '#059669' };
        }
        return { message: 'Good - slightly above optimal', color: '#059669' };
      }
    }

    // Perfect range
    return { message: '✨ Perfect conditions!', color: '#10b981' };
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
          <Link to="/my-plants" className="btn btn-primary">
            <FiArrowLeft />
            Back to My Plants
          </Link>
        </div>
      </DetailContainer>
    );
  }

  const { sensorData, healthScore, status, careInstructions, optimalRanges } = plant;
  const speciesData = getSpeciesInfo(plant.species);

  return (
    <DetailContainer>
      <BackButton to="/my-plants">
        <FiArrowLeft />
        Back to My Plants
      </BackButton>

      <PlantHeader>
        <PlantImage>
          {plant.image && plant.image !== '/images/plant-placeholder.jpg' ? (
            <img src={plant.image} alt={plant.name} />
          ) : (
            '🌱'
          )}
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
        <EditPlantButton onClick={() => navigate(`/edit-plant/${plantId}`)}>
          <FiEdit3 />
          Edit Plant
        </EditPlantButton>
      </PlantHeader>

      <BioSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <BioHeader onClick={() => setIsBioExpanded(!isBioExpanded)}>
          <BioHeaderLeft>
            <BioIcon>
              <FiBook />
            </BioIcon>
            <div>
              <BioTitle>Species Information</BioTitle>
              <BioSubtitle>{speciesData.scientificName}</BioSubtitle>
            </div>
          </BioHeaderLeft>
          <BioToggle isOpen={isBioExpanded}>
            <FiChevronDown />
          </BioToggle>
        </BioHeader>

        {isBioExpanded && (
          <BioContent
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <BioDescription>
              {speciesData.description}
            </BioDescription>

            <BioMetadata>
              <MetadataItem>
                <MetadataLabel>Family</MetadataLabel>
                <MetadataValue>{speciesData.family}</MetadataValue>
              </MetadataItem>
              <MetadataItem>
                <MetadataLabel>Origin</MetadataLabel>
                <MetadataValue>{speciesData.origin}</MetadataValue>
              </MetadataItem>
              <MetadataItem>
                <MetadataLabel>Common Name</MetadataLabel>
                <MetadataValue>{speciesData.commonName}</MetadataValue>
              </MetadataItem>
            </BioMetadata>

            {speciesData.characteristics && speciesData.characteristics.length > 0 && (
              <div>
                <BioSectionTitle>Key Characteristics</BioSectionTitle>
                <BioList>
                  {speciesData.characteristics.map((char, index) => (
                    <BioListItem key={index}>{char}</BioListItem>
                  ))}
                </BioList>
              </div>
            )}

            {speciesData.funFacts && speciesData.funFacts.length > 0 && (
              <div>
                <BioSectionTitle>Did You Know?</BioSectionTitle>
                <BioList>
                  {speciesData.funFacts.map((fact, index) => (
                    <BioListItem key={index}>{fact}</BioListItem>
                  ))}
                </BioList>
              </div>
            )}
          </BioContent>
        )}
      </BioSection>

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
          <QuickActionsGrid>
            <ActionButton>
              <FiDroplet />
              Water
            </ActionButton>
            <ActionButton>
              <FiCamera />
              Photo
            </ActionButton>
          </QuickActionsGrid>
        </Card>
      </Grid>

      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ marginBottom: '2rem' }}
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
              {optimalRanges && (
                <SensorStatus color={getSensorStatus(sensorData?.moisture || 0, optimalRanges.moisture, 'moisture').color}>
                  {getSensorStatus(sensorData?.moisture || 0, optimalRanges.moisture, 'moisture').message}
                </SensorStatus>
              )}
            </SensorInfo>
          </SensorCard>

          <SensorCard>
            <SensorIcon bgColor="#f59e0b" color="white">
              <FiSun />
            </SensorIcon>
            <SensorInfo>
              <SensorLabel>Light</SensorLabel>
              <SensorValue>{sensorData?.light || 0} lux</SensorValue>
              {optimalRanges && (
                <SensorStatus color={getSensorStatus(sensorData?.light || 0, optimalRanges.light, 'light').color}>
                  {getSensorStatus(sensorData?.light || 0, optimalRanges.light, 'light').message}
                </SensorStatus>
              )}
            </SensorInfo>
          </SensorCard>

          <SensorCard>
            <SensorIcon bgColor="#ef4444" color="white">
              <FiThermometer />
            </SensorIcon>
            <SensorInfo>
              <SensorLabel>Temperature</SensorLabel>
              <SensorValue>{sensorData?.temperature || 0}°F</SensorValue>
              {optimalRanges && (
                <SensorStatus color={getSensorStatus(sensorData?.temperature || 0, optimalRanges.temperature, 'temperature').color}>
                  {getSensorStatus(sensorData?.temperature || 0, optimalRanges.temperature, 'temperature').message}
                </SensorStatus>
              )}
            </SensorInfo>
          </SensorCard>

          <SensorCard>
            <SensorIcon bgColor="#10b981" color="white">
              <FiWind />
            </SensorIcon>
            <SensorInfo>
              <SensorLabel>Humidity</SensorLabel>
              <SensorValue>{sensorData?.humidity || 0}%</SensorValue>
              {optimalRanges && (
                <SensorStatus color={getSensorStatus(sensorData?.humidity || 0, optimalRanges.humidity, 'humidity').color}>
                  {getSensorStatus(sensorData?.humidity || 0, optimalRanges.humidity, 'humidity').message}
                </SensorStatus>
              )}
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
