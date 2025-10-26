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
  const navigate = useNavigate();

  // Sample plant data
  const allPlants = [
    { id: 1, name: 'Snake Plant', image: '🌱', species: 'Sansevieria' },
    { id: 2, name: 'Monstera', image: '🌿', species: 'Monstera deliciosa' },
    { id: 3, name: 'Cactus', image: '🌵', species: 'Cactaceae' },
    { id: 4, name: 'Rose', image: '🌺', species: 'Rosa' },
    { id: 5, name: 'Sunflower', image: '🌻', species: 'Helianthus' },
    { id: 6, name: 'Tulip', image: '🌷', species: 'Tulipa' },
    { id: 7, name: 'Lavender', image: '💜', species: 'Lavandula' },
    { id: 8, name: 'Bamboo', image: '🎋', species: 'Bambusoideae' },
    { id: 9, name: 'Fern', image: '🌿', species: 'Pteridophyta' },
    { id: 10, name: 'Orchid', image: '🌺', species: 'Orchidaceae' },
    { id: 11, name: 'Aloe', image: '🌵', species: 'Aloe vera' },
    { id: 12, name: 'Jade Plant', image: '🌱', species: 'Crassula ovata' }
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

  const handleTakePhoto = () => {
    // For now, we'll trigger file input for camera
    // In a real implementation, you'd use getUserMedia API
    fileInputRef.current?.click();
  };

  const handleUploadFromGallery = () => {
    fileInputRef.current?.click();
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
