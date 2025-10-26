import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FiCamera, 
  FiSearch,
  FiPlus,
  FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';

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

const AddPlant = ({ onPlantAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [addingPlants, setAddingPlants] = useState(new Set());
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
    // TODO: Implement camera functionality
    console.log('Camera clicked');
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleAddPlant = async (plantId) => {
    if (addingPlants.has(plantId)) {
      return; // Already adding this plant
    }

    const plant = allPlants.find(p => p.id === plantId);
    if (!plant) return;

    try {
      setAddingPlants(prev => new Set(prev).add(plantId));
      
      // Simulate API call to add plant
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
        }
      };

      // Call the parent component's add function
      if (onPlantAdd) {
        onPlantAdd(newPlant);
      }

      toast.success(`${plant.name} added to your collection!`);
      
      // Navigate to My Plants page after a short delay
      setTimeout(() => {
        navigate('/my-plants');
      }, 1500);

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
                  placeholder="Search by plant name..."
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
    </Container>
  );
};

export default AddPlant;
