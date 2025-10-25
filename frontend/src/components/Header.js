import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FiHome, 
  FiMessageCircle, 
  FiMenu, 
  FiX,
  FiGrid
} from 'react-icons/fi';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: #DCDFC4;
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
        </Nav>

        <MobileMenuButton onClick={toggleMenu}>
          {isMenuOpen ? <FiX /> : <FiMenu />}
        </MobileMenuButton>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;
