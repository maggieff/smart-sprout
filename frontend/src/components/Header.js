import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiHome, 
  FiMessageCircle, 
  FiMenu, 
  FiX,
  FiDroplet,
  FiSun,
  FiThermometer,
  FiGrid
} from 'react-icons/fi';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #10B981;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: #059669;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    display: ${props => props.isOpen ? 'flex' : 'none'};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    flex-direction: column;
    padding: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border-radius: 0 0 1rem 1rem;
  }
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  color: ${props => props.active ? '#10B981' : '#6b7280'};
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    color: #10B981;
    background-color: #f0fdf4;
  }
`;

const PlantSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;

  @media (max-width: 768px) {
    display: none;
  }
`;

const PlantInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PlantName = styled.span`
  font-weight: 600;
  color: #1f2937;
`;

const PlantStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
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
`;

const SensorData = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.75rem;
  color: #6b7280;

  @media (max-width: 768px) {
    display: none;
  }
`;

const SensorItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;

  @media (max-width: 768px) {
    display: block;
  }
`;

const Header = ({ plants, selectedPlant, onPlantSelect }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const getStatusColor = (healthScore) => {
    if (healthScore >= 0.8) return 'excellent';
    if (healthScore >= 0.6) return 'good';
    if (healthScore >= 0.4) return 'fair';
    if (healthScore >= 0.2) return 'poor';
    return 'critical';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent': return '🌟';
      case 'good': return '😊';
      case 'fair': return '📝';
      case 'poor': return '🆘';
      case 'critical': return '🚨';
      default: return '❓';
    }
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo to="/">
          🌱 Smart Plant Tracker
        </Logo>

        <Nav isOpen={isMenuOpen}>
          <NavLink 
            to="/" 
            active={location.pathname === '/'}
          >
            <FiHome />
            Dashboard
          </NavLink>
          
          <NavLink 
            to="/ai-chat" 
            active={location.pathname === '/ai-chat'}
          >
            <FiMessageCircle />
            AI Assistant
          </NavLink>
          
          <NavLink 
            to="/my-plants" 
            active={location.pathname === '/my-plants'}
          >
            <FiGrid />
            My Plants
          </NavLink>

          {selectedPlant && (
            <PlantSelector>
              <PlantInfo>
                <PlantName>{selectedPlant.name}</PlantName>
                <PlantStatus status={getStatusColor(selectedPlant.healthScore)}>
                  {getStatusIcon(getStatusColor(selectedPlant.healthScore))}
                </PlantStatus>
              </PlantInfo>
              
              {selectedPlant.sensorData && (
                <SensorData>
                  <SensorItem>
                    <FiDroplet />
                    {selectedPlant.sensorData.moisture}%
                  </SensorItem>
                  <SensorItem>
                    <FiSun />
                    {selectedPlant.sensorData.light}
                  </SensorItem>
                  <SensorItem>
                    <FiThermometer />
                    {selectedPlant.sensorData.temperature}°F
                  </SensorItem>
                </SensorData>
              )}
            </PlantSelector>
          )}
        </Nav>

        <MobileMenuButton onClick={toggleMenu}>
          {isMenuOpen ? <FiX /> : <FiMenu />}
        </MobileMenuButton>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;
