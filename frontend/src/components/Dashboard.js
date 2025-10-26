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
  FiEyeOff
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
  padding: 2rem;
  gap: 2rem;
`;

const WelcomeSection = styled.div`
  flex: 1;
`;

const WelcomeTitle = styled.h1`
  font-family: 'Cubano', 'Karla', sans-serif;
  font-size: 2.5rem;
  font-weight: normal;
  color: #1f2937;
  margin-bottom: 1rem;
`;

const PlaceholderBox = styled.div`
  width: 60%;
  height: 120px;
  background: #D1D5DB;
  border-radius: 0.5rem;
  margin-top: 1rem;
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

const Card = styled(motion.div)`
  background: rgba(107, 124, 50, 0.3);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin: 1rem 2rem 0 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
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
  color: #1f2937;
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
  background: rgba(209, 213, 219, 0.6);
  border-radius: 0.5rem;
  backdrop-filter: blur(5px);
`;

const CareTips = styled.div`
  color: #1f2937;
  font-size: 1rem;
`;

const CareTipsLabel = styled.div`
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #1f2937;
`;

const CareTipsText = styled.div`
  color: #6b7280;
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
  color: #1f2937;
`;

const MetricValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
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

const Dashboard = ({ plants, selectedPlant, onPlantSelect, onPlantUpdate }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, signIn, signUp } = useAuth();
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [location, setLocation] = useState(null);
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

  useEffect(() => {
    loadWeatherData();
  }, []);

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
          <PlaceholderBox />
        </WelcomeSection>
        
        <WeatherWidget>
          <RefreshButton onClick={loadWeatherData} disabled={weatherLoading}>
            <FiRefreshCcw className={weatherLoading ? 'animate-spin' : ''} />
          </RefreshButton>
          
          {weatherLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🌤️</div>
              <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Loading weather...</div>
            </div>
          ) : weather ? (
            <>
              <WeatherLocation>
                <FiMapPin />
                {weather.name}
              </WeatherLocation>
              
              <WeatherIcon>
                {weather.weather[0].main === 'Clear' ? '☀️' :
                 weather.weather[0].main === 'Clouds' ? '☁️' :
                 weather.weather[0].main === 'Rain' ? '🌧️' :
                 weather.weather[0].main === 'Snow' ? '❄️' : '🌤️'}
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
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🌤️</div>
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
            <PlantImage />
            <CareTips>
              <CareTipsLabel>Care tips:</CareTipsLabel>
              <CareTipsText>bla bla bla bla</CareTipsText>
            </CareTips>
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
    </DashboardContainer>
  );
};

export default Dashboard;