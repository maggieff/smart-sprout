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
`;

const ActionStatus = styled.div`
  font-size: 0.625rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

const QuickActions = ({ plant }) => {
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
      
      // Simulate other actions
      setActions(prev => ({ ...prev, [actionType]: true }));
      
      // Show success message
      const messages = {
        watered: 'Plant watered! 💧',
        fertilized: 'Fertilizer applied! 🌱',
        repotted: 'Repotting logged! 🪴',
        photographed: 'Photo uploaded! 📸'
      };
      
      toast.success(messages[actionType]);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setActions(prev => ({ ...prev, [actionType]: false }));
      }, 3000);
      
    } catch (error) {
      console.error('Error performing action:', error);
      toast.error('Failed to perform action');
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
    
    // Create camera modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    `;
    
    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.style.cssText = `
      width: 90%;
      max-width: 500px;
      height: auto;
      border-radius: 1rem;
    `;
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      margin-top: 2rem;
      display: flex;
      gap: 1rem;
    `;
    
    const captureButton = document.createElement('button');
    captureButton.innerHTML = '📸 Capture';
    captureButton.style.cssText = `
      padding: 1rem 2rem;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-size: 1rem;
      cursor: pointer;
    `;
    
    const cancelButton = document.createElement('button');
    cancelButton.innerHTML = '❌ Cancel';
    cancelButton.style.cssText = `
      padding: 1rem 2rem;
      background: #6b7280;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-size: 1rem;
      cursor: pointer;
    `;
    
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
        document.body.removeChild(modal);
      }, 'image/jpeg', 0.8);
    };
    
    cancelButton.onclick = () => {
      stream.getTracks().forEach(track => track.stop());
      document.body.removeChild(modal);
    };
    
    buttonContainer.appendChild(captureButton);
    buttonContainer.appendChild(cancelButton);
    modal.appendChild(video);
    modal.appendChild(buttonContainer);
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
      
      // You can add logic here to save the photo to your backend
      console.log('Photo captured:', photoData);
      
      toast.success('Photo captured successfully! 📸');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setActions(prev => ({ ...prev, photographed: false }));
      }, 3000);
      
    } catch (error) {
      console.error('Error processing photo:', error);
      toast.error('Failed to process photo');
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
