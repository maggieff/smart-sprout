import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiDroplet, 
  FiSun, 
  FiThermometer, 
  FiWind,
  FiMessageCircle,
  FiCamera,
  FiPlus,
  FiCheck
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { logService } from '../services/logService';
import { plantService } from '../services/plantService';

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
`;

const ActionButton = styled(motion.button)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: ${props => props.bgColor || '#f9fafb'};
  border: 1px solid ${props => props.borderColor || '#e5e7eb'};
  border-radius: 0.75rem;
  color: ${props => props.color || '#374151'};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: 'Karla', sans-serif;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ActionIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
`;

const ActionLabel = styled.div`
  font-size: 0.75rem;
  text-align: center;
  line-height: 1.2;
  font-family: 'Karla', sans-serif;
`;

const ActionStatus = styled.div`
  font-size: 0.625rem;
  color: #6b7280;
  margin-top: 0.25rem;
  font-family: 'Karla', sans-serif;
`;

const QuickActions = ({ plant, onActionComplete, onPhotoCaptured }) => {
  const [actions, setActions] = useState({
    watered: false,
    fertilized: false,
    repotted: false,
    photographed: false
  });

  const handleAction = async (actionType) => {
    try {
      if (actionType === 'photographed') {
        await handleTakePhoto();
        return;
      }
      
      // Check if plant exists
      if (!plant || !plant.id) {
        toast.error('Plant not found. Please refresh the page.');
        return;
      }
      
      // Set loading state
      setActions(prev => ({ ...prev, [actionType]: true }));
      
      console.log('Creating log for plant:', plant.id, 'action:', actionType);
      
      // Check if user is authenticated
      const userId = localStorage.getItem('smart-sprout-user');
      console.log('Current user from localStorage:', userId);
      
      if (!userId) {
        toast.error('Please log in to create logs');
        setActions(prev => ({ ...prev, [actionType]: false }));
        return;
      }
      
      // Create log data based on action type
      const logData = {
        plantId: plant.id,
        note: getLogNote(actionType),
        type: getLogType(actionType),
        mood: 'positive'
      };
      
      console.log('Log data:', logData);
      
      // Create log entry
      const logResult = await logService.createLog(logData);
      console.log('Log creation result:', logResult);
      
      // For watering, also update the plant's last_watered field
      if (actionType === 'watered') {
        console.log('Updating plant last watered date...');
        const updateResult = await plantService.updatePlant(plant.id, {
          last_watered: new Date().toISOString()
        });
        console.log('Plant update result:', updateResult);
      }
      
      // Show success message
      const messages = {
        watered: 'Plant watered! 💧',
        fertilized: 'Fertilizer applied! 🌱',
        repotted: 'Repotting logged! 🪴',
        photographed: 'Photo uploaded! 📸'
      };
      
      toast.success(messages[actionType]);
      
      // Call the callback to refresh plant data
      if (onActionComplete) {
        onActionComplete();
      }
      
      // Reset after 3 seconds
      setTimeout(() => {
        setActions(prev => ({ ...prev, [actionType]: false }));
      }, 3000);
      
    } catch (error) {
      console.error('Error performing action:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // More specific error messages
      if (error.response?.status === 404) {
        toast.error('Plant not found in database. Please add plants first.');
      } else if (error.response?.status === 401) {
        toast.error('Please log in again.');
      } else if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.error || 'Invalid request';
        toast.error(`Invalid request: ${errorMsg}`);
      } else {
        toast.error(`Failed to ${actionType}: ${error.message}`);
      }
      
      setActions(prev => ({ ...prev, [actionType]: false }));
    }
  };

  const handleTakePhoto = async () => {
    try {
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Camera not available on this device');
        return;
      }

      // Try to use camera directly first (for better UX)
      try {
        await openCameraDirectly();
      } catch (cameraError) {
        console.log('Direct camera access failed, falling back to file input');
        // Fallback to file input if direct camera access fails
        openFileInput();
      }
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Failed to access camera');
    }
  };

  const openCameraDirectly = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment', // Use back camera on mobile
        width: { ideal: 1280 },
        height: { ideal: 720 }
      } 
    });
    
    // Create camera modal with template design
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: 'Karla', sans-serif;
    `;
    
    // Modal content container
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      width: 90%;
      max-width: 600px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    `;
    
    // Title
    const title = document.createElement('h2');
    title.textContent = 'TAKE A PHOTO';
    title.style.cssText = `
      font-size: 1.5rem;
      font-weight: 700;
      color: #374151;
      margin: 0;
      text-align: center;
      letter-spacing: 0.05em;
    `;
    
    // Camera feed container
    const cameraContainer = document.createElement('div');
    cameraContainer.style.cssText = `
      width: 100%;
      height: 400px;
      background: #f3f4f6;
      border-radius: 0.75rem;
      border: 2px solid #e5e7eb;
      overflow: hidden;
      position: relative;
    `;
    
    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
    `;
    
    // Button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 1rem;
      width: 100%;
      justify-content: space-between;
    `;
    
    // Cancel button
    const cancelButton = document.createElement('button');
    cancelButton.innerHTML = 'Cancel';
    cancelButton.style.cssText = `
      flex: 1;
      padding: 0.75rem 1.5rem;
      background: #6b7280;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-size: 1rem;
      font-weight: 500;
      font-family: 'Karla', sans-serif;
      cursor: pointer;
      transition: all 0.2s ease;
    `;
    
    // Upload File button
    const uploadButton = document.createElement('button');
    uploadButton.innerHTML = 'Upload File';
    uploadButton.style.cssText = `
      flex: 1;
      padding: 0.75rem 1.5rem;
      background: #6b7280;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-size: 1rem;
      font-weight: 500;
      font-family: 'Karla', sans-serif;
      cursor: pointer;
      transition: all 0.2s ease;
    `;
    
    // Take Photo button (circular, green)
    const captureButton = document.createElement('button');
    captureButton.innerHTML = '📸';
    captureButton.style.cssText = `
      width: 60px;
      height: 60px;
      background: #10b981;
      color: white;
      border: none;
      border-radius: 50%;
      font-size: 1.5rem;
      font-family: 'Karla', sans-serif;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    `;
    
    // Hover effects
    cancelButton.onmouseover = () => cancelButton.style.background = '#4b5563';
    cancelButton.onmouseout = () => cancelButton.style.background = '#6b7280';
    
    uploadButton.onmouseover = () => uploadButton.style.background = '#4b5563';
    uploadButton.onmouseout = () => uploadButton.style.background = '#6b7280';
    
    captureButton.onmouseover = () => {
      captureButton.style.background = '#059669';
      captureButton.style.transform = 'scale(1.05)';
    };
    captureButton.onmouseout = () => {
      captureButton.style.background = '#10b981';
      captureButton.style.transform = 'scale(1)';
    };
    
    // Event handlers
    captureButton.onclick = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          await processCapturedPhoto(blob);
        }
        stream.getTracks().forEach(track => track.stop());
        if (modal && modal.parentNode) {
          document.body.removeChild(modal);
        }
      }, 'image/jpeg', 0.8);
    };
    
    uploadButton.onclick = () => {
      stream.getTracks().forEach(track => track.stop());
      if (modal && modal.parentNode) {
        document.body.removeChild(modal);
      }
      openFileInput();
    };
    
    cancelButton.onclick = () => {
      stream.getTracks().forEach(track => track.stop());
      if (modal && modal.parentNode) {
        document.body.removeChild(modal);
      }
    };
    
    // Assemble modal
    cameraContainer.appendChild(video);
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(uploadButton);
    buttonContainer.appendChild(captureButton);
    
    modalContent.appendChild(title);
    modalContent.appendChild(cameraContainer);
    modalContent.appendChild(buttonContainer);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
  };

  const openFileInput = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use back camera on mobile
    
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        await processCapturedPhoto(file);
      }
    };
    
    input.click();
  };

  const processCapturedPhoto = async (file) => {
    try {
      // Show loading state
      setActions(prev => ({ ...prev, photographed: true }));
      
      // Simulate photo upload (you can replace this with actual upload logic)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a preview URL for the photo
      const photoUrl = URL.createObjectURL(file);
      
      // Store photo info (you can extend this to save to backend)
      const photoData = {
        id: Date.now(),
        file: file,
        url: photoUrl,
        plantId: plant?.id,
        timestamp: new Date().toISOString(),
        name: file.name || `plant-photo-${Date.now()}.jpg`
      };
      
      // Check if plant exists
      if (!plant || !plant.id) {
        toast.error('Plant not found. Please refresh the page.');
        setActions(prev => ({ ...prev, photographed: false }));
        return;
      }
      
      // Create log entry for photo
      const logData = {
        plantId: plant.id,
        note: getLogNote('photographed'),
        type: getLogType('photographed'),
        mood: 'positive',
        photos: [photoData.url]
      };
      
      console.log('Creating photo log:', logData);
      await logService.createLog(logData);
      
      // You can add logic here to save the photo to your backend
      console.log('Photo captured:', photoData);
      
      // Call the callback to update the plant image
      if (onPhotoCaptured) {
        onPhotoCaptured(photoData);
      }
      
      // Call the callback to refresh plant data
      if (onActionComplete) {
        onActionComplete();
      }
      
      toast.success('Photo captured successfully! 📸');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setActions(prev => ({ ...prev, photographed: false }));
      }, 3000);
      
    } catch (error) {
      console.error('Error processing photo:', error);
      console.error('Photo error details:', error.response?.data || error.message);
      
      if (error.response?.status === 404) {
        toast.error('Plant not found in database. Please add plants first.');
      } else if (error.response?.status === 401) {
        toast.error('Please log in again.');
      } else if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.error || 'Invalid request';
        toast.error(`Invalid request: ${errorMsg}`);
      } else {
        toast.error(`Failed to save photo: ${error.message}`);
      }
      
      setActions(prev => ({ ...prev, photographed: false }));
    }
  };

  const getActionConfig = (type) => {
    const configs = {
      watered: {
        icon: <FiDroplet />,
        label: 'Water Plant',
        bgColor: '#f0f9ff',
        borderColor: '#0ea5e9',
        color: '#0ea5e9'
      },
      fertilized: {
        icon: <FiSun />,
        label: 'Add Fertilizer',
        bgColor: '#fffbeb',
        borderColor: '#f59e0b',
        color: '#f59e0b'
      },
      repotted: {
        icon: <FiWind />,
        label: 'Log Repotting',
        bgColor: '#f0fdf4',
        borderColor: '#10b981',
        color: '#10b981'
      },
      photographed: {
        icon: <FiCamera />,
        label: 'Take Photo',
        bgColor: '#fef2f2',
        borderColor: '#ef4444',
        color: '#ef4444'
      }
    };
    return configs[type];
  };

  const getLogNote = (actionType) => {
    switch (actionType) {
      case 'watered':
        return 'Plant watered - soil moisture refreshed';
      case 'fertilized':
        return 'Fertilizer applied - nutrients added to soil';
      case 'repotted':
        return 'Plant repotted - moved to new container';
      case 'photographed':
        return 'Photo taken - plant documented';
      default:
        return 'Plant care activity logged';
    }
  };

  const getLogType = (actionType) => {
    switch (actionType) {
      case 'watered':
        return 'watering';
      case 'fertilized':
        return 'fertilizing';
      case 'repotted':
        return 'repotting';
      case 'photographed':
        return 'photography';
      default:
        return 'general';
    }
  };

  const getStatusText = (actionType) => {
    if (actions[actionType]) {
      return 'Done!';
    }
    
    switch (actionType) {
      case 'watered':
        return 'Tap to water';
      case 'fertilized':
        return 'Add nutrients';
      case 'repotted':
        return 'Log activity';
      case 'photographed':
        return 'Upload photo';
      default:
        return 'Tap to perform';
    }
  };

  return (
    <ActionsGrid>
      {Object.keys(actions).map((actionType) => {
        const config = getActionConfig(actionType);
        const isCompleted = actions[actionType];
        
        return (
          <ActionButton
            key={actionType}
            onClick={() => handleAction(actionType)}
            disabled={isCompleted}
            bgColor={isCompleted ? '#d1fae5' : config.bgColor}
            borderColor={isCompleted ? '#10b981' : config.borderColor}
            color={isCompleted ? '#065f46' : config.color}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ActionIcon>
              {isCompleted ? <FiCheck /> : config.icon}
            </ActionIcon>
            <ActionLabel>{config.label}</ActionLabel>
            <ActionStatus>{getStatusText(actionType)}</ActionStatus>
          </ActionButton>
        );
      })}
    </ActionsGrid>
  );
};

export default QuickActions;
