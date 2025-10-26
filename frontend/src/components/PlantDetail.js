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
  FiEdit3,
  FiTrash2
} from 'react-icons/fi';
import { plantService } from '../services/plantService';
import { logService } from '../services/logService';
import LoadingSpinner from './LoadingSpinner';
import QuickActions from './QuickActions';
import toast from 'react-hot-toast';

const Container = styled.div`
  min-height: 100vh;
  background: #9CAF88;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const LeftContent = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const RightSidebar = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const BackButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  text-decoration: none;
  font-weight: 500;
  font-size: 1.1rem;
  transition: all 0.2s ease;

  &:hover {
    color: #f3f4f6;
    transform: translateX(-4px);
  }
`;

const PlantName = styled.h1`
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  font-family: 'Fredoka One', cursive;
`;

const PlantImagePlaceholder = styled.div`
  width: 100%;
  height: 400px;
  background: #E5E7EB;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6B7280;
  font-size: 1.2rem;
  font-weight: 500;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  background: ${props => props.primary ? '#065f46' : '#EF4444'};
  color: white;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Section = styled.div`
  background: #65876a;
  border-radius: 1rem;
  padding: 2rem;
  color: white;
`;

const SectionTitle = styled.h2`
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  font-family: 'Karla', sans-serif;
`;

const SectionContent = styled.div`
  color: white;
  line-height: 1.6;
`;

const SensorHistoryPlaceholder = styled.div`
  width: 100%;
  height: 200px;
  background: #E5E7EB;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6B7280;
  font-size: 1rem;
  font-weight: 500;
`;

// Sidebar Components
const SidebarSection = styled.div`
  background: #65876a;
  border-radius: 1rem;
  padding: 1.5rem;
  color: white;
`;

const SidebarTitle = styled.h3`
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  font-family: 'Karla', sans-serif;
`;

const HealthBar = styled.div`
  width: 100%;
  height: 1rem;
  background: #E5E7EB;
  border-radius: 0.5rem;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const HealthFill = styled.div`
  height: 100%;
  background: #065f46;
  border-radius: 0.5rem;
  width: ${props => props.percentage}%;
  transition: width 0.3s ease;
`;

const MoistureChart = styled.div`
  width: 100%;
  height: 80px;
  background: #F3F4F6;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6B7280;
  font-size: 0.9rem;
  position: relative;
  overflow: hidden;
`;

const ChartLine = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const TemperatureBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const TemperatureBarContainer = styled.div`
  width: 20px;
  height: 100px;
  background: #E5E7EB;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
`;

const TemperatureFill = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  background: #065f46;
  border-radius: 10px;
  height: ${props => props.percentage}%;
  transition: height 0.3s ease;
`;

const TemperatureValue = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
`;

const TemperatureNumber = styled.span`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1F2937;
`;

const TemperatureLabel = styled.span`
  font-size: 0.9rem;
  color: #1F2937;
`;

const OtherPlants = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const OtherPlantCard = styled(Link)`
  background: #F3F4F6;
  border-radius: 0.75rem;
  padding: 1rem;
  text-align: center;
  color: #6B7280;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: block;

  &:hover {
    background: #E5E7EB;
    transform: translateY(-2px);
    color: #374151;
  }
`;

const PlantImage = styled.div`
  width: 40px;
  height: 40px;
  background: ${props => props.hasImage ? 'transparent' : '#D1D5DB'};
  border-radius: 50%;
  margin: 0 auto 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  overflow: hidden;
`;

const OtherPlantName = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
`;

const OtherPlantSpecies = styled.div`
  font-size: 0.75rem;
  color: #6B7280;
`;

const PlantDetail = ({ plants, onPlantUpdate, onPlantRemove }) => {
  const { plantId } = useParams();
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [plantPhoto, setPlantPhoto] = useState(null);

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
    } catch (error) {
      console.error('Error loading plant data:', error);
      toast.error('Failed to load plant data');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoCaptured = (photoData) => {
    setPlantPhoto(photoData);
    // You can also update the plant object to include the photo
    if (plant) {
      const updatedPlant = { ...plant, image: photoData.url, photoData: photoData };
      setPlant(updatedPlant);
      if (onPlantUpdate) {
        onPlantUpdate(updatedPlant);
      }
    }
  };

  const handleDeletePhoto = () => {
    if (window.confirm('Are you sure you want to delete this plant\'s photo?')) {
      try {
        // Clear the plant photo state
        setPlantPhoto(null);
        
        // Update the plant object to remove the image
        if (plant) {
          const updatedPlant = { ...plant, image: null, photoData: null };
          setPlant(updatedPlant);
          
          // Update the parent component
          if (onPlantUpdate) {
            onPlantUpdate(updatedPlant);
          }
        }
        
        toast.success('Plant photo deleted successfully!');
      } catch (error) {
        console.error('Error deleting photo:', error);
        toast.error('Failed to delete photo');
      }
    }
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

  if (loading) {
    return (
      <Container>
        <LoadingSpinner />
      </Container>
    );
  }

  if (!plant) {
    return (
      <Container>
        <div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>
          <h2>Plant not found</h2>
          <p>The plant you're looking for doesn't exist.</p>
          <Link to="/my-plants" style={{ color: 'white', textDecoration: 'underline' }}>
            Back to My Plants
          </Link>
        </div>
      </Container>
    );
  }

  const healthPercentage = Math.round((plant.healthScore || 0.8) * 100);
  const moisturePercentage = plant.sensorData?.moisture || 65;
  const temperature = plant.sensorData?.temperature || 22;

  return (
    <Container>
      <MainContent>
        <LeftContent>
          <BackButton to="/my-plants">
            <FiArrowLeft />
            Back
          </BackButton>

          <PlantName>{plant.name}</PlantName>

          <PlantImagePlaceholder>
            {plantPhoto ? (
              <img 
                src={plantPhoto.url} 
                alt={plant.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '1rem'
                }}
              />
            ) : plant?.image ? (
              <img 
                src={plant.image} 
                alt={plant.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '1rem'
                }}
              />
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                fontSize: '4rem',
                color: '#9CA3AF'
              }}>
                🌱
              </div>
            )}
          </PlantImagePlaceholder>

          <ActionButtons>
            <ActionButton primary onClick={handleDeletePhoto}>
              <FiEdit3 />
              Delete Photo
            </ActionButton>
            <ActionButton onClick={handleRemovePlant}>
              <FiTrash2 />
              Remove Plant
            </ActionButton>
          </ActionButtons>

          <Section>
            <SectionTitle>About Plant</SectionTitle>
            <SectionContent>
              <p><strong>Species:</strong> {plant.species}</p>
              <p><strong>Last Watered:</strong> {plant.lastWatered ? new Date(plant.lastWatered).toLocaleDateString() : 'Never'}</p>
              <p><strong>Status:</strong> {plant.status || 'Good'}</p>
              <p>This is a beautiful {plant.species} that requires regular care and attention. Make sure to water it regularly and provide adequate sunlight for optimal growth.</p>
            </SectionContent>
          </Section>

          <Section>
            <SectionTitle>Care Tips</SectionTitle>
            <SectionContent>
              <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                <li>Water when soil feels dry to touch</li>
                <li>Place in bright, indirect sunlight</li>
                <li>Fertilize monthly during growing season</li>
                <li>Check for pests regularly</li>
                <li>Rotate plant weekly for even growth</li>
              </ul>
            </SectionContent>
          </Section>

          <Section>
            <SectionTitle>Quick Actions</SectionTitle>
            <QuickActions 
              plant={plant}
              onActionComplete={() => {
                // Refresh plant data after action
                loadPlantData();
              }}
              onPhotoCaptured={handlePhotoCaptured}
            />
          </Section>

          <Section>
            <SectionTitle>Sensor History</SectionTitle>
            <SensorHistoryPlaceholder>
              Sensor Data Chart
            </SensorHistoryPlaceholder>
          </Section>
        </LeftContent>

        <RightSidebar>
          <SidebarSection>
            <SidebarTitle>Overall Health</SidebarTitle>
            <HealthBar>
              <HealthFill percentage={healthPercentage} />
            </HealthBar>
            <div style={{ color: '#1F2937', fontSize: '0.9rem' }}>
              {healthPercentage}% Healthy
            </div>
          </SidebarSection>

          <SidebarSection>
            <SidebarTitle>Moisture Levels</SidebarTitle>
            <MoistureChart>
              <ChartLine viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline
                  points="0,80 20,60 40,70 60,40 80,50 100,30"
                  fill="none"
                  stroke="#065f46"
                  strokeWidth="2"
                />
              </ChartLine>
            </MoistureChart>
            <div style={{ color: '#1F2937', fontSize: '0.9rem', textAlign: 'center', marginTop: '0.5rem' }}>
              {moisturePercentage}% Moisture
            </div>
          </SidebarSection>

          <SidebarSection>
            <SidebarTitle>Soil Temperature</SidebarTitle>
            <TemperatureBar>
              <TemperatureBarContainer>
                <TemperatureFill percentage={Math.min((temperature / 30) * 100, 100)} />
              </TemperatureBarContainer>
              <TemperatureValue>
                <TemperatureNumber>{temperature}°</TemperatureNumber>
                <TemperatureLabel>Temperature</TemperatureLabel>
              </TemperatureValue>
            </TemperatureBar>
          </SidebarSection>

          <SidebarSection>
            <SidebarTitle style={{ textDecoration: 'underline' }}>Other Plants</SidebarTitle>
            <OtherPlants>
              {plants
                .filter(p => p.id !== plantId)
                .slice(0, 3)
                .map(otherPlant => (
                  <OtherPlantCard 
                    key={otherPlant.id} 
                    to={`/plant/${otherPlant.id}`}
                  >
                    <PlantImage hasImage={!!otherPlant.image}>
                      {otherPlant.image ? (
                        <img 
                          src={otherPlant.image} 
                          alt={otherPlant.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '50%'
                          }}
                        />
                      ) : null}
                    </PlantImage>
                    <OtherPlantName>{otherPlant.name}</OtherPlantName>
                    <OtherPlantSpecies>{otherPlant.species}</OtherPlantSpecies>
                  </OtherPlantCard>
                ))}
              {plants.filter(p => p.id !== plantId).length === 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#6B7280', 
                  fontStyle: 'italic',
                  padding: '1rem'
                }}>
                  No other plants in collection
                </div>
              )}
            </OtherPlants>
          </SidebarSection>
        </RightSidebar>
      </MainContent>
    </Container>
  );
};

export default PlantDetail;