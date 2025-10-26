import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FiCamera, 
  FiSearch,
  FiPlus,
  FiX,
  FiUpload,
  FiImage
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import PlantEditModal from './PlantEditModal';

const Container = styled.div`
  min-height: 100vh;
  background: #9CAF88;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  gap: 2rem;
`;

const SearchSection = styled.div`
  width: 100%;
  max-width: 500px;
  margin-bottom: 1rem;
`;

const QuickAddHeader = styled.h2`
  font-family: 'Cubano', 'Karla', sans-serif;
  font-size: 2rem;
  font-weight: normal;
  color: white;
  text-align: center;
  margin: 1rem 0 0.5rem 0;
`;

const PlantGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  width: 100%;
  max-width: 800px;
  margin-top: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    max-width: 600px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    max-width: 300px;
  }
`;

const PlantCard = styled(motion.div)`
  background: #7A8B73;
  border-radius: 0.75rem;
  padding: 1rem;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const PlantImage = styled.div`
  width: 100%;
  height: 120px;
  background: #E0E0E0;
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9CA3AF;
  font-size: 2rem;
`;

const PlantName = styled.div`
  color: white;
  font-weight: 500;
  font-size: 0.875rem;
  font-family: 'Karla', sans-serif;
  margin-bottom: 0.5rem;
`;

const AddButton = styled.button`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: #3C4737;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  font-family: 'Karla', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s ease;

  &:hover {
    background: #2D3529;
    transform: scale(1.05);
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 3rem 1rem 3rem;
  border: none;
  border-radius: 0.75rem;
  background: #E0E0D0;
  font-size: 1rem;
  font-family: 'Karla', sans-serif;
  color: #1f2937;
  outline: none;
  transition: all 0.2s ease;

  &::placeholder {
    color: #6b7280;
  }

  &:focus {
    box-shadow: 0 0 0 3px rgba(148, 168, 139, 0.3);
  }
`;

const CameraIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #1f2937;
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #374151;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #1f2937;
  font-size: 1.2rem;
`;

const CameraModal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #1f2937;
  font-size: 1.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  font-family: 'Karla', sans-serif;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const CameraOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const OptionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  background: white;
  font-family: 'Karla', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #9CAF88;
    background: #f9fafb;
  }
`;

const OptionIcon = styled.div`
  font-size: 1.5rem;
  color: #6b7280;
`;

const OptionText = styled.div`
  flex: 1;
  text-align: left;
`;

const OptionTitle = styled.div`
  font-weight: 600;
  color: #1f2937;
  font-family: 'Karla', sans-serif;
  margin-bottom: 0.25rem;
`;

const OptionDescription = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-family: 'Karla', sans-serif;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const GalleryFileInput = styled.input`
  display: none;
`;

const PreviewContainer = styled.div`
  margin-top: 1rem;
  text-align: center;
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 300px;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
`;

const AnalyzeButton = styled.button`
  background: #9CAF88;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  font-family: 'Karla', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #7A8B73;
  }
  
  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const AddPlant = ({ onPlantAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [addingPlants, setAddingPlants] = useState(new Set());
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [identifiedPlant, setIdentifiedPlant] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [plantToEdit, setPlantToEdit] = useState(null);
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const navigate = useNavigate();

  // Comprehensive plant data - 60 most common plants
  const allPlants = [
    // Popular Houseplants
    { id: 1, name: 'Snake Plant', image: '🌱', species: 'Sansevieria trifasciata' },
    { id: 2, name: 'Monstera', image: '🌿', species: 'Monstera deliciosa' },
    { id: 3, name: 'Pothos', image: '🌿', species: 'Epipremnum aureum' },
    { id: 4, name: 'Fiddle Leaf Fig', image: '🌿', species: 'Ficus lyrata' },
    { id: 5, name: 'Rubber Plant', image: '🌿', species: 'Ficus elastica' },
    { id: 6, name: 'Peace Lily', image: '🌺', species: 'Spathiphyllum' },
    { id: 7, name: 'ZZ Plant', image: '🌱', species: 'Zamioculcas zamiifolia' },
    { id: 8, name: 'Spider Plant', image: '🌿', species: 'Chlorophytum comosum' },
    { id: 9, name: 'Philodendron', image: '🌿', species: 'Philodendron hederaceum' },
    { id: 10, name: 'Chinese Evergreen', image: '🌿', species: 'Aglaonema' },
    { id: 11, name: 'Dracaena', image: '🌿', species: 'Dracaena fragrans' },
    { id: 12, name: 'Dieffenbachia', image: '🌿', species: 'Dieffenbachia' },
    { id: 13, name: 'Calathea', image: '🌿', species: 'Calathea orbifolia' },
    { id: 14, name: 'Maranta', image: '🌿', species: 'Maranta leuconeura' },
    { id: 15, name: 'Anthurium', image: '🌺', species: 'Anthurium andraeanum' },
    { id: 16, name: 'Bird of Paradise', image: '🌿', species: 'Strelitzia reginae' },
    { id: 17, name: 'Croton', image: '🌿', species: 'Codiaeum variegatum' },
    { id: 18, name: 'Schefflera', image: '🌿', species: 'Schefflera arboricola' },
    { id: 19, name: 'Parlor Palm', image: '🌿', species: 'Chamaedorea elegans' },
    { id: 20, name: 'Boston Fern', image: '🌿', species: 'Nephrolepis exaltata' },

    // Succulents & Cacti
    { id: 21, name: 'Aloe Vera', image: '🌵', species: 'Aloe vera' },
    { id: 22, name: 'Jade Plant', image: '🌱', species: 'Crassula ovata' },
    { id: 23, name: 'Echeveria', image: '🌵', species: 'Echeveria elegans' },
    { id: 24, name: 'Hens and Chicks', image: '🌵', species: 'Sempervivum' },
    { id: 25, name: 'Barrel Cactus', image: '🌵', species: 'Echinocactus grusonii' },
    { id: 26, name: 'Christmas Cactus', image: '🌵', species: 'Schlumbergera' },
    { id: 27, name: 'String of Pearls', image: '🌵', species: 'Senecio rowleyanus' },
    { id: 28, name: 'Haworthia', image: '🌵', species: 'Haworthia attenuata' },
    { id: 29, name: 'Kalanchoe', image: '🌵', species: 'Kalanchoe blossfeldiana' },
    { id: 30, name: 'Sedum', image: '🌵', species: 'Sedum morganianum' },

    // Herbs & Edibles
    { id: 31, name: 'Basil', image: '🌿', species: 'Ocimum basilicum' },
    { id: 32, name: 'Mint', image: '🌿', species: 'Mentha' },
    { id: 33, name: 'Rosemary', image: '🌿', species: 'Rosmarinus officinalis' },
    { id: 34, name: 'Thyme', image: '🌿', species: 'Thymus vulgaris' },
    { id: 35, name: 'Oregano', image: '🌿', species: 'Origanum vulgare' },
    { id: 36, name: 'Parsley', image: '🌿', species: 'Petroselinum crispum' },
    { id: 37, name: 'Cilantro', image: '🌿', species: 'Coriandrum sativum' },
    { id: 38, name: 'Chives', image: '🌿', species: 'Allium schoenoprasum' },
    { id: 39, name: 'Lavender', image: '💜', species: 'Lavandula angustifolia' },
    { id: 40, name: 'Sage', image: '🌿', species: 'Salvia officinalis' },

    // Flowering Plants
    { id: 41, name: 'Rose', image: '🌺', species: 'Rosa' },
    { id: 42, name: 'Orchid', image: '🌺', species: 'Phalaenopsis' },
    { id: 43, name: 'Geranium', image: '🌺', species: 'Pelargonium' },
    { id: 44, name: 'Begonia', image: '🌺', species: 'Begonia' },
    { id: 45, name: 'African Violet', image: '🌺', species: 'Saintpaulia' },
    { id: 46, name: 'Hibiscus', image: '🌺', species: 'Hibiscus rosa-sinensis' },
    { id: 47, name: 'Petunia', image: '🌺', species: 'Petunia' },
    { id: 48, name: 'Impatiens', image: '🌺', species: 'Impatiens walleriana' },
    { id: 49, name: 'Marigold', image: '🌻', species: 'Tagetes' },
    { id: 50, name: 'Pansy', image: '🌺', species: 'Viola tricolor' },

    // Garden Plants
    { id: 51, name: 'Tomato', image: '🍅', species: 'Solanum lycopersicum' },
    { id: 52, name: 'Pepper', image: '🌶️', species: 'Capsicum' },
    { id: 53, name: 'Lettuce', image: '🥬', species: 'Lactuca sativa' },
    { id: 54, name: 'Spinach', image: '🥬', species: 'Spinacia oleracea' },
    { id: 55, name: 'Carrot', image: '🥕', species: 'Daucus carota' },
    { id: 56, name: 'Sunflower', image: '🌻', species: 'Helianthus annuus' },
    { id: 57, name: 'Tulip', image: '🌷', species: 'Tulipa' },
    { id: 58, name: 'Daffodil', image: '🌼', species: 'Narcissus' },
    { id: 59, name: 'Bamboo', image: '🎋', species: 'Bambusoideae' },
    { id: 60, name: 'Ivy', image: '🌿', species: 'Hedera helix' }
  ];

  // Filter plants based on search term
  const filteredPlants = allPlants.filter(plant => 
    plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plant.species.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by the filteredPlants array
    console.log('Searching for:', searchTerm);
  };

  const handleCameraClick = () => {
    setShowCameraModal(true);
    setSelectedImage(null);
    setIdentifiedPlant(null);
  };

  const handleCloseModal = () => {
    setShowCameraModal(false);
    setSelectedImage(null);
    setIdentifiedPlant(null);
    setIsAnalyzing(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTakePhoto = async () => {
    try {
      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Camera not supported in this browser. Please use gallery upload.');
        galleryInputRef.current?.click();
        return;
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use rear camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      // Create video element to show camera feed
      const video = document.createElement('video');
      video.srcObject = stream;
      video.style.width = '100%';
      video.style.height = 'auto';
      video.style.borderRadius = '0.75rem';
      video.autoplay = true;
      video.muted = true;
      
      // Create container for camera interface
      const cameraContainer = document.createElement('div');
      cameraContainer.style.position = 'fixed';
      cameraContainer.style.top = '0';
      cameraContainer.style.left = '0';
      cameraContainer.style.width = '100vw';
      cameraContainer.style.height = '100vh';
      cameraContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
      cameraContainer.style.zIndex = '99999';
      cameraContainer.style.display = 'flex';
      cameraContainer.style.flexDirection = 'column';
      cameraContainer.style.alignItems = 'center';
      cameraContainer.style.justifyContent = 'center';
      cameraContainer.style.gap = '2rem';
      cameraContainer.style.padding = '2rem';
      cameraContainer.style.boxSizing = 'border-box';
      
      // Create capture button
      const captureBtn = document.createElement('button');
      captureBtn.innerHTML = '📸 Capture Photo';
      captureBtn.style.padding = '1.5rem 3rem';
      captureBtn.style.backgroundColor = '#9CAF88';
      captureBtn.style.color = 'white';
      captureBtn.style.border = 'none';
      captureBtn.style.borderRadius = '0.75rem';
      captureBtn.style.fontSize = '1.25rem';
      captureBtn.style.fontWeight = '700';
      captureBtn.style.cursor = 'pointer';
      captureBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
      captureBtn.style.transition = 'all 0.2s ease';
      captureBtn.style.fontFamily = 'Karla, sans-serif';
      
      // Add hover effect
      captureBtn.onmouseover = () => {
        captureBtn.style.backgroundColor = '#7A8B73';
        captureBtn.style.transform = 'scale(1.05)';
      };
      captureBtn.onmouseout = () => {
        captureBtn.style.backgroundColor = '#9CAF88';
        captureBtn.style.transform = 'scale(1)';
      };
      
      // Create cancel button
      const cancelBtn = document.createElement('button');
      cancelBtn.innerHTML = '❌ Cancel';
      cancelBtn.style.padding = '1.5rem 3rem';
      cancelBtn.style.backgroundColor = '#ef4444';
      cancelBtn.style.color = 'white';
      cancelBtn.style.border = 'none';
      cancelBtn.style.borderRadius = '0.75rem';
      cancelBtn.style.fontSize = '1.25rem';
      cancelBtn.style.fontWeight = '700';
      cancelBtn.style.cursor = 'pointer';
      cancelBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
      cancelBtn.style.transition = 'all 0.2s ease';
      cancelBtn.style.fontFamily = 'Karla, sans-serif';
      
      // Add hover effect
      cancelBtn.onmouseover = () => {
        cancelBtn.style.backgroundColor = '#dc2626';
        cancelBtn.style.transform = 'scale(1.05)';
      };
      cancelBtn.onmouseout = () => {
        cancelBtn.style.backgroundColor = '#ef4444';
        cancelBtn.style.transform = 'scale(1)';
      };
      
      // Create instruction text
      const instructionText = document.createElement('div');
      instructionText.innerHTML = '📸 Position your plant in the camera view and click "Capture Photo"<br><small style="font-size: 0.9rem; opacity: 0.8;">Press Enter to capture or Escape to cancel</small>';
      instructionText.style.color = 'white';
      instructionText.style.fontSize = '1.25rem';
      instructionText.style.fontWeight = '600';
      instructionText.style.textAlign = 'center';
      instructionText.style.fontFamily = 'Karla, sans-serif';
      instructionText.style.marginBottom = '1rem';
      
      // Create button container
      const buttonContainer = document.createElement('div');
      buttonContainer.style.display = 'flex';
      buttonContainer.style.gap = '2rem';
      buttonContainer.style.flexWrap = 'wrap';
      buttonContainer.style.justifyContent = 'center';
      
      buttonContainer.appendChild(captureBtn);
      buttonContainer.appendChild(cancelBtn);
      
      cameraContainer.appendChild(video);
      cameraContainer.appendChild(instructionText);
      cameraContainer.appendChild(buttonContainer);
      document.body.appendChild(cameraContainer);
      
      // Add keyboard shortcut for capture (Enter key)
      const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !captureBtn.disabled) {
          captureBtn.click();
        } else if (e.key === 'Escape') {
          cancelBtn.click();
        }
      };
      document.addEventListener('keydown', handleKeyPress);
      
      // Handle capture
      const handleCapture = () => {
        document.removeEventListener('keydown', handleKeyPress);
        
        // Show loading state
        captureBtn.innerHTML = '⏳ Processing...';
        captureBtn.style.backgroundColor = '#6b7280';
        captureBtn.disabled = true;
        
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        // Convert to blob and handle as file
        canvas.toBlob((blob) => {
          const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
          handleFileUpload({ target: { files: [file] } });
          
          // Clean up
          stream.getTracks().forEach(track => track.stop());
          document.body.removeChild(cameraContainer);
        }, 'image/jpeg', 0.8);
      };
      
      // Handle cancel
      const handleCancel = () => {
        document.removeEventListener('keydown', handleKeyPress);
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(cameraContainer);
      };
      
      captureBtn.onclick = handleCapture;
      cancelBtn.onclick = handleCancel;
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      
      if (error.name === 'NotAllowedError') {
        toast.error('Camera access denied. Please allow camera permissions and try again.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No camera found. Please use gallery upload instead.');
      } else if (error.name === 'NotSupportedError') {
        toast.error('Camera not supported. Please use gallery upload instead.');
      } else {
        toast.error('Could not access camera. Please try uploading from gallery instead.');
      }
      
      // Fallback to file input
      galleryInputRef.current?.click();
    }
  };

  const handleUploadFromGallery = () => {
    galleryInputRef.current?.click();
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    try {
      // Convert base64 to blob
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      
      // Create FormData for upload
      const formData = new FormData();
      formData.append('photo', blob, 'plant-photo.jpg');
      formData.append('plantId', 'unknown');

      // Upload and identify plant using the new endpoint
      const identifyResponse = await fetch('/api/upload/identify', {
        method: 'POST',
        body: formData
      });

      if (!identifyResponse.ok) {
        throw new Error('Failed to identify plant');
      }

      const result = await identifyResponse.json();
      const identification = result.identification;

      // Create identified plant object
      const plantData = {
        id: `identified-${Date.now()}`,
        name: identification.species,
        species: identification.species,
        image: selectedImage,
        healthScore: identification.healthScore,
        growthStage: identification.growthStage,
        issues: identification.issues || [],
        recommendations: identification.recommendations || [],
        careInfo: identification.aiCareAdvice,
        careKnowledge: identification.careKnowledge,
        confidence: identification.confidence,
        identifiedAt: identification.identifiedAt
      };

      setIdentifiedPlant(plantData);
      toast.success(`Identified as ${identification.species}!`);
      
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error('Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddIdentifiedPlant = async () => {
    if (!identifiedPlant) return;

    try {
      // Get additional care information from the database
      const careResponse = await fetch('/api/plant-care/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plantName: identifiedPlant.species
        })
      });

      let additionalCareInfo = null;
      if (careResponse.ok) {
        const careData = await careResponse.json();
        additionalCareInfo = careData;
      }

      // Create new plant object with required fields
      const newPlant = {
        id: `plant-${Date.now()}-${identifiedPlant.id}`,
        name: identifiedPlant.name,
        species: identifiedPlant.species,
        image: identifiedPlant.image,
        lastWatered: new Date(),
        healthScore: identifiedPlant.healthScore,
        status: identifiedPlant.healthScore > 0.7 ? 'good' : 'needs_attention',
        sensorData: {
          moisture: Math.floor(Math.random() * 40) + 30, // 30-70%
          light: Math.floor(Math.random() * 200) + 300,  // 300-500
          temperature: Math.floor(Math.random() * 20) + 65, // 65-85°F
          humidity: Math.floor(Math.random() * 30) + 40   // 40-70%
        },
        careInfo: identifiedPlant.careInfo,
        careKnowledge: identifiedPlant.careKnowledge,
        additionalCareInfo: additionalCareInfo,
        careTips: additionalCareInfo ? additionalCareInfo.quickTips : null,
        careSummary: additionalCareInfo ? additionalCareInfo.careInfo : null,
        growthStage: identifiedPlant.growthStage,
        issues: identifiedPlant.issues,
        recommendations: identifiedPlant.recommendations,
        identifiedByAI: true,
        confidence: identifiedPlant.confidence
      };

      // Show edit modal instead of directly adding
      setPlantToEdit(newPlant);
      setShowEditModal(true);
      handleCloseModal();

    } catch (error) {
      console.error('Error adding identified plant:', error);
      toast.error('Failed to add plant. Please try again.');
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleEditSave = (editedPlant) => {
    if (onPlantAdd) {
      onPlantAdd(editedPlant);
    }
    toast.success(`${editedPlant.name} added to your collection!`);
    setShowEditModal(false);
    setPlantToEdit(null);
    setTimeout(() => {
      navigate('/my-plants');
    }, 1500);
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setPlantToEdit(null);
  };

  const handleAddPlant = async (plantId) => {
    if (addingPlants.has(plantId)) {
      return; // Already adding this plant
    }

    const plant = allPlants.find(p => p.id === plantId);
    if (!plant) return;

    try {
      setAddingPlants(prev => new Set(prev).add(plantId));
      
      // Get care information from the database
      const careResponse = await fetch('/api/plant-care/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plantName: plant.name
        })
      });

      let careInfo = null;
      if (careResponse.ok) {
        const careData = await careResponse.json();
        careInfo = careData;
      }
      
      // Create new plant object with required fields
      const newPlant = {
        id: `plant-${Date.now()}-${plantId}`,
        name: plant.name,
        species: plant.species,
        image: plant.image,
        lastWatered: new Date(),
        healthScore: 0.8 + Math.random() * 0.2, // Random health between 80-100%
        status: 'good',
        sensorData: {
          moisture: Math.floor(Math.random() * 40) + 30, // 30-70%
          light: Math.floor(Math.random() * 200) + 300,  // 300-500
          temperature: Math.floor(Math.random() * 20) + 65, // 65-85°F
          humidity: Math.floor(Math.random() * 30) + 40   // 40-70%
        },
        careInfo: careInfo,
        careTips: careInfo ? careInfo.quickTips : null,
        careSummary: careInfo ? careInfo.careInfo : null
      };

      // Show edit modal instead of directly adding
      setPlantToEdit(newPlant);
      setShowEditModal(true);

    } catch (error) {
      console.error('Error adding plant:', error);
      toast.error('Failed to add plant. Please try again.');
    } finally {
      setAddingPlants(prev => {
        const newSet = new Set(prev);
        newSet.delete(plantId);
        return newSet;
      });
    }
  };

  return (
    <Container>
      <MainContent>
        <SearchSection>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <SearchContainer>
              <CameraIcon onClick={handleCameraClick}>
                <FiCamera />
              </CameraIcon>
              <form onSubmit={handleSearch}>
                <SearchInput
                  type="text"
                  placeholder="Search by plant name/species or upload a photo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </form>
              {searchTerm ? (
                <SearchIcon onClick={handleClearSearch} style={{ cursor: 'pointer' }}>
                  <FiX />
                </SearchIcon>
              ) : (
                <SearchIcon>
                  <FiSearch />
                </SearchIcon>
              )}
            </SearchContainer>
          </motion.div>
        </SearchSection>

        {filteredPlants.length > 0 ? (
          <>
            <QuickAddHeader>Quick Add</QuickAddHeader>
            <PlantGrid>
            {filteredPlants.map((plant, index) => (
              <PlantCard
                key={plant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
              <AddButton 
                onClick={() => handleAddPlant(plant.id)}
                disabled={addingPlants.has(plant.id)}
                style={{
                  opacity: addingPlants.has(plant.id) ? 0.7 : 1,
                  cursor: addingPlants.has(plant.id) ? 'not-allowed' : 'pointer'
                }}
              >
                <FiPlus />
                {addingPlants.has(plant.id) ? 'Adding...' : 'Add'}
              </AddButton>
                <PlantImage>
                  {plant.image}
                </PlantImage>
                <PlantName>{plant.name}</PlantName>
              </PlantCard>
            ))}
          </PlantGrid>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              textAlign: 'center',
              color: 'white',
              padding: '2rem',
              background: '#7A8B73',
              borderRadius: '0.75rem',
              maxWidth: '400px',
              margin: '0 auto'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>No plants found</h3>
            <p style={{ margin: 0, opacity: 0.8 }}>
              Try searching for a different plant name or species
            </p>
          </motion.div>
        )}
      </MainContent>

      {/* Camera Modal */}
      {showCameraModal && (
        <CameraModal
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && handleCloseModal()}
        >
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Identify Plant</ModalTitle>
              <CloseButton onClick={handleCloseModal}>
                <FiX />
              </CloseButton>
            </ModalHeader>

            {!selectedImage ? (
              <CameraOptions>
                <OptionButton onClick={handleTakePhoto}>
                  <OptionIcon>
                    <FiCamera />
                  </OptionIcon>
                  <OptionText>
                    <OptionTitle>Take Photo</OptionTitle>
                    <OptionDescription>Use your camera to take a new photo</OptionDescription>
                  </OptionText>
                </OptionButton>

                <OptionButton onClick={handleUploadFromGallery}>
                  <OptionIcon>
                    <FiImage />
                  </OptionIcon>
                  <OptionText>
                    <OptionTitle>Upload from Gallery</OptionTitle>
                    <OptionDescription>Choose an existing photo from your device</OptionDescription>
                  </OptionText>
                </OptionButton>
              </CameraOptions>
            ) : (
              <div>
                <PreviewContainer>
                  <PreviewImage src={selectedImage} alt="Selected plant" />
                  
                  {!identifiedPlant ? (
                    <AnalyzeButton 
                      onClick={analyzeImage}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <>
                          <LoadingSpinner />
                          Analyzing...
                        </>
                      ) : (
                        'Identify Plant'
                      )}
                    </AnalyzeButton>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <h3 style={{ color: '#1f2937', marginBottom: '1rem' }}>
                        Identified: {identifiedPlant.name}
                      </h3>
                      <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                        Confidence: {Math.round(identifiedPlant.confidence * 100)}%
                      </p>
                      <AnalyzeButton onClick={handleAddIdentifiedPlant}>
                        Add to My Plants
                      </AnalyzeButton>
                    </div>
                  )}
                </PreviewContainer>
              </div>
            )}

            <HiddenFileInput
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
            />
            
            <GalleryFileInput
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
            />
          </ModalContent>
        </CameraModal>
      )}

      <PlantEditModal
        isOpen={showEditModal}
        onClose={handleEditCancel}
        plantData={plantToEdit}
        onSave={handleEditSave}
        title="Customize Your Plant"
      />
    </Container>
  );
};

export default AddPlant;
