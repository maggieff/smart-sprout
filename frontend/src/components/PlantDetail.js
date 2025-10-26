import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  FiTrash2,
  FiEdit
} from 'react-icons/fi';
import { plantService } from '../services/plantService';
import { logService } from '../services/logService';
import LoadingSpinner from './LoadingSpinner';
import QuickActions from './QuickActions';
import PlantEditModal from './PlantEditModal';
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
  font-family: 'Karla', sans-serif;
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
  font-family: 'Cubano', 'Karla', sans-serif;
`;

const PlantImagePlaceholder = styled.div`
  width: 100%;
  height: 600px;
  background: #E5E7EB;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6B7280;
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 2rem;
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
  font-family: 'Karla', sans-serif;
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
  background: rgba(255, 255, 255, 0.9);
  border-radius: 0.75rem;
  padding: 1.5rem 1.5rem 2.5rem 3.5rem;
  width: 100%;
  height: 250px;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
`;

const CurrentValue = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
`;

const ChartContainer = styled.div`
  flex: 1;
  position: relative;
  width: 100%;
  height: 150px;
  margin-bottom: 1rem;
`;

const YAxisLabels = styled.div`
  position: absolute;
  left: -3rem;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 0.7rem;
  color: #6B7280;
  width: 2.5rem;
`;

const YAxisLabel = styled.div`
  text-align: right;
  line-height: 1;
`;

const ChartLine = styled.svg`
  width: 100%;
  height: 100%;
`;

const ChartGrid = styled.line`
  stroke: #E5E7EB;
  stroke-width: 1;
  stroke-dasharray: 2,2;
`;

const ChartArea = styled.path`
  fill: url(#moistureGradient);
  opacity: 0;
  animation: fadeInArea 2s ease-in-out 0.5s forwards;
  
  @keyframes fadeInArea {
    to {
      opacity: 0.3;
    }
  }
`;

const InteractiveLine = styled.path`
  stroke: #10B981;
  stroke-width: 3;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: drawLine 2s ease-in-out forwards;
  cursor: pointer;
  pointer-events: none;
  
  @keyframes drawLine {
    to {
      stroke-dashoffset: 0;
    }
  }
`;

const InvisibleLine = styled.path`
  stroke: transparent;
  stroke-width: 12;
  fill: none;
  cursor: pointer;
  pointer-events: all;
`;

const ChartLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #6B7280;
  margin-top: 0.5rem;
`;

const Tooltip = styled.div`
  position: absolute;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  pointer-events: none;
  z-index: 1000;
  transform: translate(-50%, -100%);
  margin-top: -0.5rem;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.8);
  }
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
  const [showEditModal, setShowEditModal] = useState(false);
  const tooltipRef = useRef(null);
  const chartDataRef = useRef(null);

  // Generate moisture data for the chart
  const generateMoistureChartData = () => {
    if (!plant?.sensorData?.moisture) {
      // Generate sample data if no real data
      const points = [];
      for (let i = 0; i < 12; i++) {
        const x = (i / 11) * 100;
        const y = 50 + Math.sin(i * 0.5) * 20 + Math.random() * 10;
        points.push({ x, y, time: new Date(Date.now() - (11 - i) * 2 * 60 * 60 * 1000) });
      }
      return points;
    }

    // Use real moisture data if available
    const currentMoisture = plant.sensorData.moisture;
    const points = [];
    
    // Generate historical data points (last 12 hours)
    for (let i = 0; i < 12; i++) {
      const hoursAgo = 11 - i;
      const time = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
      const variation = (Math.sin(i * 0.5) * 10) + (Math.random() * 5 - 2.5);
      const moisture = Math.max(0, Math.min(100, currentMoisture + variation));
      
      points.push({
        x: (i / 11) * 100,
        y: 100 - moisture, // Invert Y for SVG coordinates
        time,
        moisture
      });
    }
    
    return points;
  };

  const createMoisturePath = (data) => {
    if (!data || data.length === 0) return '';
    
    const pathData = data.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');
    
    return pathData;
  };

  const createMoistureArea = (data) => {
    if (!data || data.length === 0) return '';
    
    const firstPoint = data[0];
    const lastPoint = data[data.length - 1];
    
    const pathData = data.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');
    
    return `${pathData} L ${lastPoint.x} 100 L ${firstPoint.x} 100 Z`;
  };

  const handleMouseMove = useCallback((event) => {
    if (!chartDataRef.current) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const relativeX = (x / rect.width) * 100;
    
    // Find the closest data point
    const closestPoint = chartDataRef.current.reduce((prev, curr) => 
      Math.abs(curr.x - relativeX) < Math.abs(prev.x - relativeX) ? curr : prev
    );
    
    // Update tooltip position directly without causing re-renders
    if (tooltipRef.current) {
      tooltipRef.current.style.left = `${x}px`;
      tooltipRef.current.style.top = `${y}px`;
      tooltipRef.current.style.display = 'block';
      
      // Update tooltip content
      const moistureValue = Math.round(100 - closestPoint.y);
      const timeValue = closestPoint.time ? closestPoint.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Time unknown';
      
      tooltipRef.current.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 0.25rem;">
          ${moistureValue}% moisture
        </div>
        <div style="font-size: 0.7rem; opacity: 0.8;">
          ${timeValue}
        </div>
      `;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (tooltipRef.current) {
      tooltipRef.current.style.display = 'none';
    }
  }, []);

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

  const handleEditSave = (editedPlant) => {
    if (onPlantUpdate) {
      onPlantUpdate(editedPlant);
    }
    setPlant(editedPlant);
    setShowEditModal(false);
    toast.success('Plant updated successfully!');
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
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
                fontSize: '6rem',
                color: '#9CA3AF'
              }}>
                🌱
              </div>
            )}
          </PlantImagePlaceholder>

          <ActionButtons>
            <ActionButton primary onClick={() => setShowEditModal(true)}>
              <FiEdit />
              Edit Plant
            </ActionButton>
            <ActionButton onClick={handleDeletePhoto}>
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
            <SectionTitle>Quick Log!</SectionTitle>
            <QuickActions 
              plant={plant}
              onActionComplete={() => {
                // Refresh plant data after action
                loadPlantData();
              }}
              onPhotoCaptured={handlePhotoCaptured}
            />
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
            <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>
              Last 24 Hours
            </div>
            <MoistureChart>
              <CurrentValue>{moisturePercentage}%</CurrentValue>
              <ChartContainer>
                <YAxisLabels>
                  <YAxisLabel>100%</YAxisLabel>
                  <YAxisLabel>75%</YAxisLabel>
                  <YAxisLabel>50%</YAxisLabel>
                  <YAxisLabel>25%</YAxisLabel>
                  <YAxisLabel>0%</YAxisLabel>
                </YAxisLabels>
                <ChartLine 
                  viewBox="0 0 100 100" 
                  preserveAspectRatio="none"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onMouseEnter={() => {
                    // Store chart data in ref to avoid re-calculations
                    chartDataRef.current = generateMoistureChartData();
                  }}
                >
                  <defs>
                    <linearGradient id="moistureGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.05"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Grid lines */}
                  <ChartGrid x1="0" y1="20" x2="100" y2="20" />
                  <ChartGrid x1="0" y1="40" x2="100" y2="40" />
                  <ChartGrid x1="0" y1="60" x2="100" y2="60" />
                  <ChartGrid x1="0" y1="80" x2="100" y2="80" />
                  
                  {/* Area under the curve */}
                  <ChartArea d={createMoistureArea(generateMoistureChartData())} />
                  
                  {/* Interactive line path */}
                  <InteractiveLine d={createMoisturePath(generateMoistureChartData())} />
                  
                  {/* Invisible wider line for easier hovering */}
                  <InvisibleLine d={createMoisturePath(generateMoistureChartData())} />
                  
                </ChartLine>
                
                {/* Tooltip */}
                <Tooltip
                  ref={tooltipRef}
                  style={{
                    display: 'none',
                    position: 'absolute',
                  }}
                />
              </ChartContainer>
              <ChartLabels>
                <span>12h ago</span>
                <span>6h ago</span>
                <span>Now</span>
              </ChartLabels>
            </MoistureChart>
            <div style={{ color: '#1F2937', fontSize: '0.9rem', textAlign: 'center', marginTop: '0.5rem' }}>
              {moisturePercentage}% Moisture
            </div>
          </SidebarSection>

          <SidebarSection>
            <SidebarTitle>Environment</SidebarTitle>
            <TemperatureBar>
              <TemperatureBarContainer>
                <TemperatureFill percentage={Math.min((temperature / 30) * 100, 100)} />
              </TemperatureBarContainer>
              <TemperatureValue>
                <TemperatureNumber>{temperature}°</TemperatureNumber>
                <TemperatureLabel>Temperature</TemperatureLabel>
              </TemperatureValue>
            </TemperatureBar>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', gap: '1rem' }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1F2937' }}>
                  {plant.sensorData?.light || 400}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Light (lumens)</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1F2937' }}>
                  {plant.sensorData?.humidity || 50}%
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Humidity</div>
              </div>
            </div>
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

      <PlantEditModal
        isOpen={showEditModal}
        onClose={handleEditCancel}
        plantData={plant}
        onSave={handleEditSave}
        title="Edit Plant Details"
      />
    </Container>
  );
};

export default PlantDetail;