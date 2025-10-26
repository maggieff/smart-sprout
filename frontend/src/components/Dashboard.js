import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  FiRefreshCw,
  FiCloud,
  FiMapPin,
  FiRefreshCcw,
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight
} from 'react-icons/fi';
import toast from 'react-hot-toast';

// Components
import PlantCard from './PlantCard';
import ProgressBar from './ProgressBar';
import SensorChart from './SensorChart';
import RecentLogs from './RecentLogs';
import QuickActions from './QuickActions';
import LoadingSpinner from './LoadingSpinner';

// Context
import { useAuth } from '../contexts/AuthContext';

// Services
import { plantService } from '../services/plantService';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: #9CAF88;
  padding: 0;
`;

// Sign-in interface styles
const SignInContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #9CAF88 0%, #7A8B73 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const SignInCard = styled(motion.div)`
  background: #65876a;
  border-radius: 1rem;
  padding: 3rem;
  color: white;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  position: relative;
`;

const SignInTitle = styled.h1`
  font-family: 'Cubano', 'Karla', sans-serif;
  font-size: 2.5rem;
  font-weight: normal;
  color: #1f2937;
  text-align: center;
  margin-bottom: 0.5rem;
`;

const SignInSubtitle = styled.p`
  font-size: 1.125rem;
  color: #6b7280;
  text-align: center;
  margin-bottom: 2rem;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 2rem;
  border-radius: 0.5rem;
  background: #f3f4f6;
  padding: 0.25rem;
`;

const Tab = styled.button`
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? '#1f2937' : '#6b7280'};
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  padding-left: ${props => props.hasIcon ? '2.5rem' : '1rem'};
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-family: 'Karla', sans-serif;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #10B981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const Icon = styled.div`
  position: absolute;
  left: 0.75rem;
  color: #6b7280;
  z-index: 1;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;

  &:hover {
    color: #374151;
    background: #f3f4f6;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  background: #10B981;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  font-family: 'Karla', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;

  &:hover {
    background: #059669;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const WelcomeMessage = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const WelcomeText = styled.p`
  color: #6b7280;
  font-size: 1rem;
`;

const TopSection = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.5rem 2rem 0.5rem 2rem;
  gap: 2rem;
`;

const WelcomeSection = styled.div`
  flex: 1;
  margin-bottom: 0.25rem;
`;

const WelcomeTitle = styled.h1`
  font-family: 'Cubano', 'Karla', sans-serif;
  font-size: 2.5rem;
  font-weight: normal;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const MotivationalQuote = styled.div`
  width: 100%;
  min-height: 80px;
  background: linear-gradient(135deg, #E8F5E8 0%, #D4F1D4 50%, #C8E6C8 100%);
  border-radius: 1rem;
  margin-top: 0.25rem;
  margin-bottom: 0;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  box-shadow: 
    0 8px 20px -5px rgba(156, 175, 136, 0.3),
    0 4px 6px -2px rgba(156, 175, 136, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(156, 175, 136, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 15px 30px -8px rgba(156, 175, 136, 0.4),
      0 6px 12px -4px rgba(156, 175, 136, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.5);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(156, 175, 136, 0.15) 0%, rgba(156, 175, 136, 0.08) 100%);
    border-radius: 1rem;
    pointer-events: none;
  }
`;

const QuoteRefreshButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(156, 175, 136, 0.3);
  border-radius: 0.5rem;
  color: #2D5016;
  font-family: 'Karla', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.4rem 0.6rem;
  transition: all 0.2s ease;
  backdrop-filter: blur(5px);
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: rgba(255, 255, 255, 0.95);
    color: #1A3A0A;
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const QuoteText = styled.p`
  font-family: 'Karla', sans-serif;
  font-style: italic;
  font-size: 1.125rem;
  font-weight: 500;
  color: #2D5016;
  line-height: 1.6;
  margin: 0;
  max-width: 100%;
  position: relative;
  z-index: 1;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
  
  &::before {
    content: '"';
    font-size: 2.5rem;
    color: rgba(156, 175, 136, 0.4);
    position: absolute;
    top: -0.25rem;
    left: -0.75rem;
    font-family: 'Cubano', 'Karla', sans-serif;
    line-height: 1;
  }
  
  &::after {
    content: '"';
    font-size: 2.5rem;
    color: rgba(156, 175, 136, 0.4);
    position: absolute;
    bottom: -1.25rem;
    right: -0.25rem;
    font-family: 'Cubano', 'Karla', sans-serif;
    line-height: 1;
  }
`;

const WeatherWidget = styled.div`
  background: #F9FAFB;
  border-radius: 0.5rem;
  padding: 2.5rem;
  min-width: 400px;
  text-align: center;
`;

const WeatherTitle = styled.h3`
  font-family: 'Cubano', 'Karla', sans-serif;
  font-size: 1rem;
  font-weight: normal;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const WeatherTemp = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const WeatherDescription = styled.div`
  font-size: 0.875rem;
  color: #6B7280;
  margin-bottom: 1rem;
  text-transform: capitalize;
`;

const WeatherDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #6B7280;
`;

const WeatherLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #6B7280;
  margin-bottom: 0.5rem;
`;

const RefreshButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  color: #6B7280;
  font-family: 'Karla', sans-serif;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #F3F4F6;
    color: #374151;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const WeatherIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
`;

const TimeDisplay = styled.div`
  font-size: 0.875rem;
  color: #6B7280;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const Card = styled(motion.div)`
  background: #65876a;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin: 0.5rem 2rem 0 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #5a6b5d;
  color: white;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-family: 'Cubano', 'Karla', sans-serif;
  font-size: 1.5rem;
  font-weight: normal;
  color: white;
  margin: 0;
`;

const NewPlantButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #D1D5DB;
  color: #1f2937;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  font-family: 'Karla', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #9CA3AF;
    transform: translateY(-1px);
  }
`;

const PlantContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: start;
`;

const PlantInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PlantImage = styled.div`
  width: 100%;
  height: 200px;
  background: ${props => props.hasImage ? 'transparent' : 'rgba(209, 213, 219, 0.6)'};
  border-radius: 0.5rem;
  backdrop-filter: ${props => props.hasImage ? 'none' : 'blur(5px)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  margin-bottom: 1rem;
  overflow: hidden;
`;

const PlantDetails = styled.div`
  margin-bottom: 1rem;
`;

const PlantName = styled.h3`
  font-family: 'Cubano', 'Karla', sans-serif;
  font-size: 1.5rem;
  font-weight: normal;
  color: white;
  margin: 0 0 0.5rem 0;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: #E5E7EB;
    text-decoration: underline;
  }
`;

const PlantSpecies = styled.p`
  font-size: 1rem;
  color: #E5E7EB;
  margin: 0;
`;

const CareTips = styled.div`
  color: white;
  font-size: 1rem;
`;

const CareTipsLabel = styled.div`
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: white;
`;

const CareTipsText = styled.div`
  color: #E5E7EB;
`;

const ViewDetailsButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  font-family: 'Karla', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 1rem;
  font-size: 0.875rem;

  &:hover {
    background: #059669;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

const PlantMetrics = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const MetricItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const MetricLabel = styled.div`
  font-size: 1rem;
  font-weight: 500;
  color: white;
  font-family: 'Cubano', 'Karla', sans-serif;
`;

const MetricValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  background: transparent;
  padding: 0.5rem 0;
`;

const HealthProgressContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  backdrop-filter: blur(5px);
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const HealthProgressBar = styled.div`
  height: 100%;
  background: ${props => {
    if (props.value >= 80) return 'linear-gradient(90deg, #10B981, #34D399)';
    if (props.value >= 60) return 'linear-gradient(90deg, #34D399, #6EE7B7)';
    if (props.value >= 40) return 'linear-gradient(90deg, #FBBF24, #FCD34D)';
    if (props.value >= 20) return 'linear-gradient(90deg, #F59E0B, #FBBF24)';
    return 'linear-gradient(90deg, #EF4444, #F87171)';
  }};
  width: ${props => props.value}%;
  transition: width 0.8s ease;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ProgressText = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
  margin: 0.5rem 0;
`;

const HealthStatus = styled.div`
  font-size: 0.75rem;
  color: ${props => {
    if (props.value >= 80) return '#10B981';
    if (props.value >= 60) return '#34D399';
    if (props.value >= 40) return '#F59E0B';
    if (props.value >= 20) return '#F59E0B';
    return '#EF4444';
  }};
  font-weight: 600;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  background: ${props => {
    if (props.value >= 80) return 'rgba(16, 185, 129, 0.15)';
    if (props.value >= 60) return 'rgba(52, 211, 153, 0.15)';
    if (props.value >= 40) return 'rgba(245, 158, 11, 0.15)';
    if (props.value >= 20) return 'rgba(245, 158, 11, 0.15)';
    return 'rgba(239, 68, 68, 0.15)';
  }};
  display: inline-block;
  margin-top: 0.5rem;
`;

const MoistureChart = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 0.75rem;
  padding: 1.5rem 1.5rem 1.5rem 3.5rem;
  width: 400px;
  height: 300px;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
`;

const ChartContainer = styled.div`
  flex: 1;
  position: relative;
  width: 100%;
  height: 200px;
`;

const ChartSVG = styled.svg`
  width: 100%;
  height: 100%;
`;

const ChartPath = styled.path`
  stroke: #10B981;
  stroke-width: 3;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: drawLine 2s ease-in-out forwards;
  
  @keyframes drawLine {
    to {
      stroke-dashoffset: 0;
    }
  }
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

const ChartGrid = styled.line`
  stroke: #E5E7EB;
  stroke-width: 1;
  stroke-dasharray: 2,2;
`;

const ChartLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #6B7280;
  margin-top: 0.5rem;
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

const CurrentMoisture = styled.div`
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

// New content sections for filling whitespace
const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 0.5rem 2rem 2rem 2rem;
  margin-top: 0;
`;

const ContentCard = styled(motion.div)`
  background: #65876a;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #5a6b5d;
  color: white;
`;

const CardTitle = styled.h3`
  font-family: 'Cubano', 'Karla', sans-serif;
  font-size: 1.25rem;
  font-weight: normal;
  color: white;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TipItem = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-left: 3px solid #9CAF88;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const TipTitle = styled.h4`
  font-family: 'Karla', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: #E5E7EB;
  margin: 0 0 0.5rem 0;
`;

const TipDescription = styled.p`
  font-family: 'Karla', sans-serif;
  font-size: 0.8rem;
  color: #D1D5DB;
  margin: 0;
  line-height: 1.4;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const StatItem = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 1rem;
  text-align: center;
`;

const StatValue = styled.div`
  font-family: 'Cubano', 'Karla', sans-serif;
  font-size: 1.5rem;
  font-weight: normal;
  color: #9CAF88;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-family: 'Karla', sans-serif;
  font-size: 0.75rem;
  color: #D1D5DB;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ActivityItem = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ActivityIcon = styled.div`
  width: 2rem;
  height: 2rem;
  background: rgba(156, 175, 136, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  color: #9CAF88;
`;

const ActivityText = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-family: 'Karla', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  color: #E5E7EB;
  margin-bottom: 0.25rem;
`;

const ActivityTime = styled.div`
  font-family: 'Karla', sans-serif;
  font-size: 0.7rem;
  color: #9CA3AF;
`;

const QuickActionButton = styled.button`
  background: rgba(156, 175, 136, 0.2);
  border: 1px solid rgba(156, 175, 136, 0.3);
  border-radius: 0.5rem;
  color: #E5E7EB;
  font-family: 'Karla', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  justify-content: center;
  
  &:hover {
    background: rgba(156, 175, 136, 0.3);
    transform: translateY(-1px);
  }
`;

// Motivational plant quotes
const plantQuotes = [
  "Grow through what you go through.",
  "Be patient—nothing blooms all year.",
  "Roots before branches, always.",
  "Bloom where you're planted.",
  "Stay rooted but reach for the sun.",
  "Every flower must push through dirt first.",
  "Keep growing even when no one's watching.",
  "Let your growth be silent but powerful.",
  "A little sunlight can change everything.",
  "You can't rush a blooming season.",
  "Storms help plants grow stronger roots.",
  "Don't fear change—it's just repotting.",
  "Growth takes time, not perfection.",
  "Like a cactus, thrive in your own conditions.",
  "Your pace is your process.",
  "Be like moss—soft but unstoppable.",
  "Even weeds find ways to grow.",
  "Let go of what withers.",
  "Breathe, root, and rise.",
  "Tiny seeds, mighty forests.",
  "Keep your petals open to possibility.",
  "Grow in the direction of light.",
  "Every day is a new leaf.",
  "Soil your hands in what you love.",
  "Nature doesn't compare blooms—neither should you.",
  "Photosynthesize your energy into joy.",
  "Even the smallest sprout has power.",
  "Let adversity be your fertilizer.",
  "You are the gardener of your own life.",
  "Grow wild and free.",
  "Be your own sunlight.",
  "Water yourself with kindness.",
  "Every scar is just where you've grown.",
  "Stay grounded and let yourself stretch.",
  "Be still—growth is happening.",
  "New roots need room.",
  "Don't just exist—thrive.",
  "Leaves fall so new ones can grow.",
  "You are allowed to outgrow your pot.",
  "Let your growth make noise in silence.",
  "Patience is the best fertilizer.",
  "The storm passes; growth remains.",
  "Your roots are stronger than you think.",
  "Even the tallest tree started as a seed.",
  "Nurture your soil, not just your surface.",
  "Rise again, even after pruning.",
  "Let the light in, one leaf at a time.",
  "Your season will come.",
  "The world needs your bloom.",
  "You're not behind; you're germinating.",
  "Growth isn't linear—it's organic.",
  "Don't rush the sprout.",
  "The dirt is part of the story.",
  "Water what matters most.",
  "Grow softer, not smaller.",
  "Every sunrise is a chance to photosynthesize.",
  "Don't pluck your potential too soon.",
  "Flowers don't bloom to impress—they just do.",
  "Keep your heart like a garden—tended and open.",
  "Roots know no fear of depth.",
  "Even after winter, spring finds its way.",
  "Grow like ivy—persistent and patient.",
  "Drink in life like rain.",
  "Keep blooming through the cracks.",
  "Let go of wilted dreams.",
  "Every petal is proof of progress.",
  "Be your own ecosystem.",
  "The greenest growth happens in time.",
  "Stay curious like a vine reaching for light.",
  "You can't fake natural growth.",
  "The earth remembers every effort.",
  "Stretch toward hope like sunflowers.",
  "Grow at your own rhythm.",
  "Even shadows mean there's light nearby.",
  "Be the calm in your own garden.",
  "Sometimes rest is part of growing.",
  "Don't fear pruning; it's preparation.",
  "Roots intertwine—lean on others.",
  "Every season serves a purpose.",
  "Grow resilient, not resistant.",
  "Blossom without apology.",
  "Let your roots be deep and your petals wide.",
  "Be patient with your seedlings of change.",
  "The forest started with one seed that dared.",
  "Nature doesn't hurry, yet everything grows.",
  "Let yourself photosynthesize peace.",
  "You are both soil and seed.",
  "Keep tending even when nothing shows.",
  "Growth comes quietly, then all at once.",
  "Don't hide your bloom out of fear.",
  "Be the wildflower in a garden of roses.",
  "The sun will find you again.",
  "Even broken stems can regrow.",
  "Your roots tell your story—honor them.",
  "Grow tall, even if no one claps.",
  "Rain nourishes more than it ruins.",
  "Plant hope, harvest joy.",
  "Let every day be a new sprout of strength.",
  "Grow because you can.",
  "You are proof that growth is beautiful."
];

const Dashboard = ({ plants, selectedPlant, onPlantSelect, onPlantUpdate }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, signIn, signUp } = useAuth();
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentQuote, setCurrentQuote] = useState('');
  const tooltipRef = useRef(null);
  const chartDataRef = useRef(null);

  // Sign-in form state
  const [activeTab, setActiveTab] = useState('signin');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Time and day/night functions
  const getTimeOfDay = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    // Determine if it's day (6 AM to 6 PM) or night
    const isDay = hours >= 6 && hours < 18;
    
    return {
      timeString,
      isDay,
      hours
    };
  };

  // Weather API functions
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Location found:', position.coords.latitude, position.coords.longitude);
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          if (error.code === error.PERMISSION_DENIED) {
            reject(new Error('Location access denied. Please allow location access to see weather for your area.'));
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            reject(new Error('Location information is unavailable.'));
          } else {
            reject(new Error('Location request timed out.'));
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  };

  const fetchWeatherData = async (lat, lon) => {
    try {
      // Using a free weather API that doesn't require API keys
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m&timezone=auto`
      );
      
      if (!response.ok) {
        throw new Error('Weather API request failed');
      }
      
      const data = await response.json();
      
      // Get location name using reverse geocoding
      const locationResponse = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      const locationData = await locationResponse.json();
      
      return {
        name: locationData.city || locationData.locality || 'Your Location',
        main: {
          temp: Math.round(data.current_weather.temperature),
          humidity: data.hourly.relativehumidity_2m[0] || 50,
          feels_like: Math.round(data.current_weather.temperature)
        },
        weather: [{
          main: data.current_weather.weathercode < 3 ? 'Clear' : 
                data.current_weather.weathercode < 50 ? 'Clouds' : 
                data.current_weather.weathercode < 70 ? 'Rain' : 'Snow',
          description: data.current_weather.weathercode < 3 ? 'Clear sky' :
                      data.current_weather.weathercode < 50 ? 'Partly cloudy' :
                      data.current_weather.weathercode < 70 ? 'Light rain' : 'Snow',
          icon: '01d'
        }],
        wind: {
          speed: Math.round(data.current_weather.windspeed)
        }
      };
    } catch (error) {
      console.error('Error fetching weather:', error);
      // Fallback to mock data for demo purposes
      return {
        name: 'Your Location',
        main: {
          temp: Math.round(Math.random() * 30 + 5), // Random temp between 5-35°C
          humidity: Math.round(Math.random() * 40 + 30), // Random humidity 30-70%
          feels_like: Math.round(Math.random() * 30 + 5)
        },
        weather: [{
          main: ['Clear', 'Clouds', 'Rain', 'Snow'][Math.floor(Math.random() * 4)],
          description: 'Partly cloudy',
          icon: '01d'
        }],
        wind: {
          speed: Math.round(Math.random() * 20 + 5) // Random wind speed 5-25 km/h
        }
      };
    }
  };

  const loadWeatherData = async () => {
    setWeatherLoading(true);
    try {
      console.log('Getting location...');
      const coords = await getCurrentLocation();
      console.log('Location obtained:', coords);
      setLocation(coords);
      
      console.log('Fetching weather data...');
      const weatherData = await fetchWeatherData(coords.lat, coords.lon);
      console.log('Weather data received:', weatherData);
      setWeather(weatherData);
      
      toast.success(`Weather loaded for ${weatherData.name}`);
    } catch (error) {
      console.error('Error loading weather:', error);
      toast.error(error.message || 'Unable to get weather data');
      // Set fallback weather data
      setWeather({
        name: 'Unknown Location',
        main: { temp: 20, humidity: 50, feels_like: 20 },
        weather: [{ main: 'Clear', description: 'Sunny', icon: '01d' }],
        wind: { speed: 10 }
      });
    } finally {
      setWeatherLoading(false);
    }
  };

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadWeatherData();
  }, []);

  // Set initial quote on component mount
  useEffect(() => {
    const getRandomQuote = () => {
      const randomIndex = Math.floor(Math.random() * plantQuotes.length);
      return plantQuotes[randomIndex];
    };
    setCurrentQuote(getRandomQuote());
  }, []);

  const getNewQuote = () => {
    const getRandomQuote = () => {
      const randomIndex = Math.floor(Math.random() * plantQuotes.length);
      return plantQuotes[randomIndex];
    };
    setCurrentQuote(getRandomQuote());
  };

  // Generate moisture data for the chart based on real plant data
  const generateMoistureChartData = () => {
    if (!selectedPlant?.sensorData?.moisture) {
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
    const currentMoisture = selectedPlant.sensorData.moisture;
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

  const handleNewPlant = () => {
    navigate('/add-plant');
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

  // Sign-in form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (activeTab === 'signin') {
        result = await signIn(formData.email, formData.password);
      } else {
        result = await signUp(formData.name, formData.email, formData.password);
      }

      if (result.success) {
        toast.success(activeTab === 'signin' ? 'Signed in successfully!' : 'Account created successfully!');
        setFormData({ name: '', email: '', password: '' });
      } else {
        setError(result.error || 'Something went wrong');
      }
    } catch (error) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setFormData({ name: '', email: '', password: '' });
  };

  // If user is not authenticated, show sign-in interface
  if (!isAuthenticated) {
    return (
      <SignInContainer>
        <SignInCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SignInTitle>🌱 Smart Sprout</SignInTitle>
          <SignInSubtitle>Your AI-powered plant care assistant</SignInSubtitle>

          <TabContainer>
            <Tab 
              active={activeTab === 'signin'} 
              onClick={() => handleTabChange('signin')}
            >
              Sign In
            </Tab>
            <Tab 
              active={activeTab === 'signup'} 
              onClick={() => handleTabChange('signup')}
            >
              Sign Up
            </Tab>
          </TabContainer>

          <Form onSubmit={handleSubmit}>
            {activeTab === 'signup' && (
              <InputGroup>
                <Label htmlFor="name">Name</Label>
                <InputContainer>
                  <Icon>
                    <FiUser size={16} />
                  </Icon>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleInputChange}
                    hasIcon
                    required
                  />
                </InputContainer>
              </InputGroup>
            )}

            <InputGroup>
              <Label htmlFor="email">Email</Label>
              <InputContainer>
                <Icon>
                  <FiMail size={16} />
                </Icon>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  hasIcon
                  required
                />
              </InputContainer>
            </InputGroup>

            <InputGroup>
              <Label htmlFor="password">Password</Label>
              <InputContainer>
                <Icon>
                  <FiLock size={16} />
                </Icon>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  hasIcon
                  required
                />
                <PasswordToggle
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </PasswordToggle>
              </InputContainer>
            </InputGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <SubmitButton type="submit" disabled={loading}>
              {loading ? 'Please wait...' : (activeTab === 'signin' ? 'Sign In' : 'Create Account')}
            </SubmitButton>
          </Form>
        </SignInCard>
      </SignInContainer>
    );
  }

  // If user is authenticated, show the dashboard
  return (
    <DashboardContainer>
      {/* Top Section */}
      <TopSection>
        <WelcomeSection>
          <WelcomeTitle>Welcome back, {user?.name || 'Plant Lover'}!</WelcomeTitle>
          <MotivationalQuote>
            <QuoteRefreshButton onClick={getNewQuote} title="Get new quote">
              ✨ New
            </QuoteRefreshButton>
            <motion.div
              key={currentQuote}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <QuoteText>{currentQuote}</QuoteText>
            </motion.div>
          </MotivationalQuote>
        </WelcomeSection>
        
        <WeatherWidget>
          <RefreshButton onClick={loadWeatherData} disabled={weatherLoading}>
            <FiRefreshCcw className={weatherLoading ? 'animate-spin' : ''} />
          </RefreshButton>
          
          {weatherLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <TimeDisplay>
                <FiClock style={{ marginRight: '0.25rem' }} />
                {getTimeOfDay().timeString}
              </TimeDisplay>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                {getTimeOfDay().isDay ? '☀️' : '🌙'}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Loading weather...</div>
            </div>
          ) : weather ? (
            <>
              <WeatherLocation>
                <FiMapPin />
                {weather.name}
              </WeatherLocation>
              
              <TimeDisplay>
                <FiClock style={{ marginRight: '0.25rem' }} />
                {getTimeOfDay().timeString}
              </TimeDisplay>
              
              <WeatherIcon>
                {(() => {
                  const { isDay } = getTimeOfDay();
                  const weatherType = weather.weather[0].main;
                  
                  // Use sun/moon based on time of day for clear weather
                  if (weatherType === 'Clear') {
                    return isDay ? '☀️' : '🌙';
                  }
                  
                  // For other weather types, use sun/moon with weather overlay
                  if (weatherType === 'Clouds') {
                    return isDay ? '⛅' : '☁️';
                  }
                  
                  if (weatherType === 'Rain') {
                    return isDay ? '🌦️' : '🌧️';
                  }
                  
                  if (weatherType === 'Snow') {
                    return isDay ? '🌨️' : '❄️';
                  }
                  
                  return isDay ? '🌤️' : '🌙';
                })()}
              </WeatherIcon>
              
              <WeatherTemp>{Math.round(weather.main.temp)}° C</WeatherTemp>
              <WeatherDescription>{weather.weather[0].description}</WeatherDescription>
              
              <WeatherDetails>
                <div>
                  <FiThermometer />
                  Feels like {Math.round(weather.main.feels_like)}°C
                </div>
                <div>
                  <FiDroplet />
                  {weather.main.humidity}% humidity
                </div>
                <div>
                  <FiWind />
                  {weather.wind.speed} km/h
                </div>
                <div>
                  <FiCloud />
                  {weather.weather[0].main}
                </div>
              </WeatherDetails>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <TimeDisplay>
                <FiClock style={{ marginRight: '0.25rem' }} />
                {getTimeOfDay().timeString}
              </TimeDisplay>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                {getTimeOfDay().isDay ? '☀️' : '🌙'}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Unable to load weather</div>
            </div>
          )}
        </WeatherWidget>
      </TopSection>

      {/* Bottom Section */}
      <Card>
        <SectionHeader>
          <SectionTitle>Your most recent plant</SectionTitle>
          <NewPlantButton onClick={handleNewPlant}>
            <FiPlus />
            New plant
          </NewPlantButton>
        </SectionHeader>

        <PlantContent>
          <PlantInfo>
            <PlantImage hasImage={!!(selectedPlant && selectedPlant.image)}>
              {selectedPlant && selectedPlant.image ? (
                <img 
                  src={selectedPlant.image} 
                  alt={selectedPlant.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '0.5rem'
                  }}
                />
              ) : null}
            </PlantImage>
            <PlantDetails>
              <PlantName onClick={() => selectedPlant && navigate(`/plant/${selectedPlant.id}`)}>
                {selectedPlant ? selectedPlant.name : 'No plants yet'}
              </PlantName>
              <PlantSpecies>{selectedPlant ? selectedPlant.species : 'Add your first plant to get started'}</PlantSpecies>
            </PlantDetails>
            <CareTips>
              <CareTipsLabel>Care tips:</CareTipsLabel>
              <CareTipsText>
                {selectedPlant ? 
                  `Keep your ${selectedPlant.name} healthy by watering regularly and providing adequate sunlight. Monitor soil moisture and temperature for optimal growth.` 
                  : 'Add a plant to see personalized care tips'
                }
              </CareTipsText>
            </CareTips>
            {selectedPlant && (
              <ViewDetailsButton onClick={() => navigate(`/plant/${selectedPlant.id}`)}>
                View Details
                <FiArrowRight />
              </ViewDetailsButton>
            )}
          </PlantInfo>

          <PlantMetrics>
            <MetricItem>
              <MetricLabel>Overall health:</MetricLabel>
              <HealthProgressContainer>
                <ProgressBarContainer>
                  <HealthProgressBar value={selectedPlant ? Math.round(selectedPlant.healthScore * 100) : 0} />
                </ProgressBarContainer>
                <ProgressText>
                  {selectedPlant ? Math.round(selectedPlant.healthScore * 100) : 0}%
                </ProgressText>
                <HealthStatus value={selectedPlant ? Math.round(selectedPlant.healthScore * 100) : 0}>
                  {selectedPlant ? 
                    (Math.round(selectedPlant.healthScore * 100) >= 80 ? 'Excellent' :
                     Math.round(selectedPlant.healthScore * 100) >= 60 ? 'Good' :
                     Math.round(selectedPlant.healthScore * 100) >= 40 ? 'Fair' :
                     Math.round(selectedPlant.healthScore * 100) >= 20 ? 'Poor' : 'Critical') 
                    : 'Unknown'
                  }
                </HealthStatus>
              </HealthProgressContainer>
            </MetricItem>

            <MetricItem>
              <MetricLabel>Temperature:</MetricLabel>
              <MetricValue>
                {selectedPlant?.sensorData?.temperature ? `${selectedPlant.sensorData.temperature}° C` : 'N/A'}
              </MetricValue>
            </MetricItem>

            <MetricItem>
              <MetricLabel>Moisture</MetricLabel>
              <MoistureChart>
                {selectedPlant?.sensorData?.moisture && (
                  <CurrentMoisture>
                    {selectedPlant.sensorData.moisture}%
                  </CurrentMoisture>
                )}
                <ChartContainer>
                  <YAxisLabels>
                    <YAxisLabel>100%</YAxisLabel>
                    <YAxisLabel>75%</YAxisLabel>
                    <YAxisLabel>50%</YAxisLabel>
                    <YAxisLabel>25%</YAxisLabel>
                    <YAxisLabel>0%</YAxisLabel>
                  </YAxisLabels>
                  <ChartSVG 
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
                    
                  </ChartSVG>
                  
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
            </MetricItem>
          </PlantMetrics>
        </PlantContent>
      </Card>

      {/* Content Grid to fill whitespace */}
      <ContentGrid>
        {/* Plant Care Tips */}
        <ContentCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <CardTitle>
            🌱 Plant Care Tips
          </CardTitle>
          <TipItem>
            <TipTitle>Watering Schedule</TipTitle>
            <TipDescription>Check soil moisture before watering. Most plants prefer slightly dry soil over constantly wet roots.</TipDescription>
          </TipItem>
          <TipItem>
            <TipTitle>Light Requirements</TipTitle>
            <TipDescription>Rotate your plants weekly to ensure even growth and prevent leaning toward light sources.</TipDescription>
          </TipItem>
          <TipItem>
            <TipTitle>Humidity Control</TipTitle>
            <TipDescription>Group plants together or use a pebble tray to increase humidity around tropical plants.</TipDescription>
          </TipItem>
        </ContentCard>

        {/* Quick Stats & Activity */}
        <ContentCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <CardTitle>
            📊 Your Garden Stats
          </CardTitle>
          <StatsGrid>
            <StatItem>
              <StatValue>{plants?.length || 0}</StatValue>
              <StatLabel>Plants</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{Math.floor(Math.random() * 30) + 15}</StatValue>
              <StatLabel>Days Active</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{Math.floor(Math.random() * 20) + 5}</StatValue>
              <StatLabel>Care Logs</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>85%</StatValue>
              <StatLabel>Avg Health</StatLabel>
            </StatItem>
          </StatsGrid>
          
          <CardTitle style={{ marginTop: '1.5rem', marginBottom: '0.75rem' }}>
            🕒 Recent Activity
          </CardTitle>
          <ActivityItem>
            <ActivityIcon>💧</ActivityIcon>
            <ActivityText>
              <ActivityTitle>Watered Monstera</ActivityTitle>
              <ActivityTime>2 hours ago</ActivityTime>
            </ActivityText>
          </ActivityItem>
          <ActivityItem>
            <ActivityIcon>📸</ActivityIcon>
            <ActivityText>
              <ActivityTitle>Photo of Snake Plant</ActivityTitle>
              <ActivityTime>Yesterday</ActivityTime>
            </ActivityText>
          </ActivityItem>
          <ActivityItem>
            <ActivityIcon>🌱</ActivityIcon>
            <ActivityText>
              <ActivityTitle>Added new Pothos</ActivityTitle>
              <ActivityTime>3 days ago</ActivityTime>
            </ActivityText>
          </ActivityItem>
          
          <QuickActionButton onClick={() => navigate('/add-plant')}>
            <FiPlus size={16} />
            Add New Plant
          </QuickActionButton>
        </ContentCard>
      </ContentGrid>
    </DashboardContainer>
  );
};

export default Dashboard;