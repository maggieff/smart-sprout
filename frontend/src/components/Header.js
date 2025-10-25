import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiHome, 
  FiMessageCircle, 
  FiMenu, 
  FiX,
  FiGrid,
  FiUser,
  FiLogOut
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

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

const AuthSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const AuthButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${props => props.isAuthenticated ? '#10B981' : 'transparent'};
  color: ${props => props.isAuthenticated ? 'white' : '#6b7280'};
  border: ${props => props.isAuthenticated ? 'none' : '1px solid #d1d5db'};
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.isAuthenticated ? '#059669' : '#f3f4f6'};
    color: ${props => props.isAuthenticated ? 'white' : '#374151'};
  }

  @media (max-width: 768px) {
    padding: 0.5rem;
    font-size: 0.875rem;
  }
`;

const UserMenu = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-right: 0.5rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const UserName = styled.span`
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
`;

const UserEmail = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #dc2626;
  }
`;

const Header = ({ plants, selectedPlant, onPlantSelect }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, signOut } = useAuth();

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

        <AuthSection>
          {isAuthenticated ? (
            <UserMenu>
              <UserInfo>
                <UserName>{user.name}</UserName>
                <UserEmail>{user.email}</UserEmail>
              </UserInfo>
              <LogoutButton onClick={signOut} title="Sign Out">
                <FiLogOut size={16} />
                <span>Sign Out</span>
              </LogoutButton>
            </UserMenu>
          ) : (
            <AuthButton 
              onClick={() => setShowAuthModal(true)}
              isAuthenticated={false}
            >
              <FiUser size={16} />
              Sign In
            </AuthButton>
          )}
        </AuthSection>

        <MobileMenuButton onClick={toggleMenu}>
          {isMenuOpen ? <FiX /> : <FiMenu />}
        </MobileMenuButton>
      </HeaderContent>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </HeaderContainer>
  );
};

export default Header;
