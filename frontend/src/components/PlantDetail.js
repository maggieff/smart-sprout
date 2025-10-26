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
  FiTrash2
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
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  min-height: calc(100vh - 80px);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const LeftContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const RightSidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const BackButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 1rem;
  transition: all 0.2s ease;

  &:hover {
    color: #f3f4f6;
    transform: translateX(-4px);
  }
`;

const PlantName = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1.5rem;
`;

const PlantImageContainer = styled.div`
  width: 100%;
  height: 300px;
  background: #E0E0E0;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  color: #9CA3AF;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.75rem 1rem;
  background: #3C4737;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: #2D3529;
    transform: translateY(-1px);
  }
`;

const PlantDescription = styled.div`
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  line-height: 1.6;
  color: #374151;
  font-size: 0.875rem;
`;

const HighlightedTerm = styled.span`
  text-decoration: underline;
  font-weight: 500;
`;

const SidebarCard = styled.div`
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SidebarTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
`;

const HealthProgressContainer = styled.div`
  margin-bottom: 1rem;
`;

const StyledProgressBar = styled.div`
  width: 100%;
  height: 1rem;
  background: #E0E0D0;
  border-radius: 0.5rem;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.percentage}%;
  background: #3C4737;
  border-radius: 0.5rem;
  transition: width 0.3s ease;
`;

const MoistureChart = styled.div`
  width: 100%;
  height: 120px;
  background: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 0.875rem;
`;

const TemperatureContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const TemperatureBar = styled.div`
  width: 0.5rem;
  height: 4rem;
  background: #E0E0D0;
  border-radius: 0.25rem;
  position: relative;
  overflow: hidden;
`;

const TemperatureFill = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  height: ${props => props.percentage}%;
  background: #3C4737;
  border-radius: 0.25rem;
  transition: height 0.3s ease;
`;

const TemperatureValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
`;

const OtherPlantsContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const OtherPlantCard = styled.div`
  flex: 1;
  height: 80px;
  background: #E0E0E0;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9CA3AF;
  font-size: 0.875rem;
  font-weight: 500;
`;

const OtherPlantsLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  text-decoration: underline;
  margin-bottom: 0.5rem;
`;

const PlantDetail = ({ plants, onPlantUpdate, onPlantRemove }) => {
  const { plantId } = useParams();
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    loadPlantData();
  }, [plantId, plants]);

  const loadPlantData = async () => {
    try {
      setLoading(true);
      
      // Find the plant in the plants array
      const foundPlant = plants.find(p => p.id === plantId);
      if (foundPlant) {
        setPlant(foundPlant);
      } else {
        // If not found in local state, try API call as fallback
        const plantData = await plantService.getPlantData(plantId);
        setPlant(plantData);
      }
      
      // Load logs
      const logsData = await logService.getLogs(plantId, 10);
      setLogs(logsData.logs || []);
    } catch (error) {
      console.error('Error loading plant data:', error);
      toast.error('Failed to load plant data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPlant = () => {
    // TODO: Implement edit functionality
    toast.success('Edit functionality coming soon!');
  };

  const handleRemovePlant = async () => {
    if (window.confirm('Are you sure you want to remove this plant?')) {
      try {
        // For plants added through the frontend (with IDs like plant-${timestamp}-${id}),
        // we only need to update the frontend state
        if (plantId.startsWith('plant-') && plantId.includes('-')) {
          // This is a frontend-added plant, just update the state
          if (onPlantRemove) {
            onPlantRemove(plantId);
          }
          toast.success('Plant removed successfully!');
          navigate('/my-plants');
        } else {
          // This is a backend plant, try to delete from backend
          const response = await fetch(`http://localhost:5001/api/plant-data/${plantId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            // Update the parent component's plants list
            if (onPlantRemove) {
              onPlantRemove(plantId);
            }
            toast.success('Plant removed successfully!');
            navigate('/my-plants');
          } else {
            // If backend deletion fails, still remove from frontend state
            if (onPlantRemove) {
              onPlantRemove(plantId);
            }
            toast.success('Plant removed from your collection!');
            navigate('/my-plants');
          }
        }
      } catch (error) {
        console.error('Error removing plant:', error);
        // Even if there's an error, try to remove from frontend state
        if (onPlantRemove) {
          onPlantRemove(plantId);
        }
        toast.success('Plant removed from your collection!');
        navigate('/my-plants');
      }
    }
  };

  const getPlantDescription = (plant) => {
    if (!plant) return '';
    
    // Generate a sample description based on plant data
    const descriptions = {
      'carrot': 'The carrot (Daucus carota subsp. sativus) is a root vegetable, typically orange in color, though purple, black, red, white, and yellow cultivars exist, all of which are domesticated forms of the wild carrot, Daucus carota, native to Europe and Southwestern Asia. The plant probably originated in Persia and was originally cultivated for its leaves and seeds. The most commonly eaten part of the plant is the taproot, although the stems and leaves are also eaten. The domestic carrot has been selectively bred for its greatly enlarged, more palatable, less woody-textured taproot.',
      'tomato': 'The tomato is the edible berry of the plant Solanum lycopersicum, commonly known as a tomato plant. The species originated in western South America, Mexico, and Central America. The Nahuatl word tomatl gave rise to the Spanish word tomate, from which the English word tomato derived. Its domestication and use as a cultivated food may have originated with the indigenous peoples of Mexico.',
      'basil': 'Basil, also called great basil, is a culinary herb of the family Lamiaceae (mints). It is a tender plant, and is used in cuisines worldwide. In Western cuisine, the generic term "basil" refers to the variety also known as sweet basil or Genovese basil. Basil is native to tropical regions from Central Africa to Southeast Asia.'
    };
    
    return descriptions[plant.species?.toLowerCase()] || descriptions['carrot'];
  };

  const getHighlightedDescription = (description) => {
    const terms = ['Daucus carota subsp. sativus', 'root vegetable', 'heirloom variants', 'wild carrot', 'Iran', 'biennial plant', 'umbellifer family, Apiaceae', 'turnips', 'tonnes', 'China', 'beta-carotene', 'vitamin A', 'Second World War', 'radar'];
    
    let highlightedText = description;
    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<span style="text-decoration: underline; font-weight: 500;">$1</span>');
    });
    
    return highlightedText;
  };

  if (loading) {
    return <LoadingSpinner message="Loading plant details..." />;
  }

  if (!plant) {
    return (
      <DetailContainer>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '1rem' }}>
            Plant Not Found
          </h2>
          <p style={{ marginBottom: '2rem', opacity: 0.8 }}>
            The plant you're looking for doesn't exist.
          </p>
          <Link to="/" style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: '#10B981',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '0.5rem',
            fontWeight: '500'
          }}>
            <FiArrowLeft />
            Back to Dashboard
          </Link>
        </div>
      </DetailContainer>
    );
  }

  const { sensorData, healthScore, status } = plant;
  const healthPercentage = Math.round(healthScore * 100);
  const temperaturePercentage = Math.min(100, Math.max(0, (sensorData?.temperature || 0) / 100 * 100));

  return (
    <DetailContainer>
      <LeftContent>
        <BackButton to="/my-plants">
          <FiArrowLeft />
          Back
        </BackButton>
        
        <PlantName>{plant.name}</PlantName>
        
        <PlantImageContainer>
          🌱
        </PlantImageContainer>
        
        <ActionButtons>
          <ActionButton onClick={handleEditPlant}>
            <FiEdit3 />
            Edit Plant
          </ActionButton>
          <ActionButton onClick={handleRemovePlant}>
            <FiTrash2 />
            Remove Plant
          </ActionButton>
        </ActionButtons>
        
        <PlantDescription 
          dangerouslySetInnerHTML={{ 
            __html: getHighlightedDescription(getPlantDescription(plant)) 
          }}
        />
      </LeftContent>

      <RightSidebar>
        <SidebarCard>
          <SidebarTitle>Overall Health</SidebarTitle>
          <HealthProgressContainer>
            <StyledProgressBar>
              <ProgressFill percentage={healthPercentage} />
            </StyledProgressBar>
          </HealthProgressContainer>
        </SidebarCard>

        <SidebarCard>
          <SidebarTitle>Moisture Levels</SidebarTitle>
          <MoistureChart>
            📈 Moisture Chart
          </MoistureChart>
        </SidebarCard>

        <SidebarCard>
          <SidebarTitle>Soil Temperature</SidebarTitle>
          <TemperatureContainer>
            <TemperatureBar>
              <TemperatureFill percentage={temperaturePercentage} />
            </TemperatureBar>
            <TemperatureValue>{sensorData?.temperature || 0}°</TemperatureValue>
          </TemperatureContainer>
        </SidebarCard>

        <SidebarCard>
          <OtherPlantsLabel>Other plants</OtherPlantsLabel>
          <OtherPlantsContainer>
            <OtherPlantCard>Plant A</OtherPlantCard>
            <OtherPlantCard>Plant B</OtherPlantCard>
          </OtherPlantsContainer>
        </SidebarCard>
      </RightSidebar>
    </DetailContainer>
  );
};

export default PlantDetail;
