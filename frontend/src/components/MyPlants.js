import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PlantCard from './PlantCard';
import { 
  FiPlus,
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiChevronDown
} from 'react-icons/fi';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-family: 'Cubano', 'Karla', sans-serif;
  font-size: 2rem;
  font-weight: normal;
  color: #1f2937;
  margin: 0;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-family: 'Karla', sans-serif;
  width: 250px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #10B981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 0.75rem;
  color: #6b7280;
  font-size: 1rem;
`;

const FilterContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: 'Karla', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
  justify-content: space-between;

  &:hover {
    background: #f9fafb;
    border-color: #10B981;
  }
`;

const FilterDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 50;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 0.25rem;
`;

const FilterOption = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  background: none;
  border: none;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:hover {
    background: #f3f4f6;
  }

  &:first-child {
    border-radius: 0.5rem 0.5rem 0 0;
  }

  &:last-child {
    border-radius: 0 0 0.5rem 0.5rem;
  }
`;

const FilterCount = styled.span`
  background: #e5e7eb;
  color: #6b7280;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  font-family: 'Karla', sans-serif;
`;

const ViewToggle = styled.div`
  display: flex;
  background: #f3f4f6;
  border-radius: 0.5rem;
  overflow: hidden;
`;

const ViewButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: ${props => props.active ? '#10B981' : 'transparent'};
  color: ${props => props.active ? 'white' : '#6b7280'};
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: 'Karla', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? '#059669' : '#e5e7eb'};
  }
`;

const AddPlantButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #10B981;
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: 'Karla', sans-serif;
  transition: all 0.2s ease;

  &:hover {
    background: #059669;
    transform: translateY(-1px);
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: #65876a;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  color: white;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: white;
  font-weight: 500;
`;

const StatIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
`;

const PlantsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const PlantsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: #65876a;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  color: white;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const EmptyTitle = styled.h3`
  font-family: 'Cubano', 'Karla', sans-serif;
  font-size: 1.25rem;
  font-weight: normal;
  color: white;
  margin-bottom: 0.5rem;
`;

const EmptyDescription = styled.p`
  color: white;
  margin-bottom: 2rem;
`;

const MyPlants = ({ plants, onPlantSelect, onPlantUpdate }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [viewMode, setViewMode] = React.useState('grid');
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [filterCategory, setFilterCategory] = React.useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = React.useState(false);
  const filterRef = React.useRef(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Plant categories
  const plantCategories = [
    'Flower',
    'Tree', 
    'Shrub',
    'Grass',
    'Fern',
    'Vine / Climber',
    'Succulent',
    'Cactus',
    'Herb',
    'Vegetable',
    'Fruit plant',
    'Aquatic plant',
    'Moss',
    'Algae',
    'Mushroom / Fungus'
  ];

  // Function to determine plant category based on species
  const getPlantCategory = (plant) => {
    const species = plant.species?.toLowerCase() || '';
    const name = plant.name?.toLowerCase() || '';
    const description = plant.description?.toLowerCase() || '';
    
    // Handle careInfo - it might be an object or string
    let careInfoText = '';
    if (plant.careInfo) {
      if (typeof plant.careInfo === 'string') {
        careInfoText = plant.careInfo.toLowerCase();
      } else if (typeof plant.careInfo === 'object') {
        // If it's an object, try to extract text from common properties
        careInfoText = Object.values(plant.careInfo)
          .filter(value => typeof value === 'string')
          .join(' ')
          .toLowerCase();
      }
    }
    
    // Handle additionalCareInfo - it might be an object or string
    let additionalCareInfoText = '';
    if (plant.additionalCareInfo) {
      if (typeof plant.additionalCareInfo === 'string') {
        additionalCareInfoText = plant.additionalCareInfo.toLowerCase();
      } else if (typeof plant.additionalCareInfo === 'object') {
        // If it's an object, try to extract text from common properties
        additionalCareInfoText = Object.values(plant.additionalCareInfo)
          .filter(value => typeof value === 'string')
          .join(' ')
          .toLowerCase();
      }
    }
    
    // Handle careTips - it might be an array or string
    let careTipsText = '';
    if (plant.careTips) {
      if (Array.isArray(plant.careTips)) {
        careTipsText = plant.careTips.join(' ').toLowerCase();
      } else if (typeof plant.careTips === 'string') {
        careTipsText = plant.careTips.toLowerCase();
      }
    }
    
    // Handle careSummary - it might be an object or string
    let careSummaryText = '';
    if (plant.careSummary) {
      if (typeof plant.careSummary === 'string') {
        careSummaryText = plant.careSummary.toLowerCase();
      } else if (typeof plant.careSummary === 'object') {
        // If it's an object, try to extract text from common properties
        careSummaryText = Object.values(plant.careSummary)
          .filter(value => typeof value === 'string')
          .join(' ')
          .toLowerCase();
      }
    }
    
    // Combine all text for better matching
    const allText = `${species} ${name} ${description} ${careInfoText} ${additionalCareInfoText} ${careTipsText} ${careSummaryText}`;
    
    // Cactus detection
    if (allText.includes('cactus') || allText.includes('cactaceae') || allText.includes('opuntia') || 
        allText.includes('mammillaria') || allText.includes('echinocactus') || allText.includes('ferocactus')) {
      return 'Cactus';
    }
    
    // Succulent detection
    if (allText.includes('succulent') || allText.includes('aloe') || allText.includes('crassula') || 
        allText.includes('echeveria') || allText.includes('sedum') || allText.includes('haworthia') ||
        allText.includes('agave') || allText.includes('kalanchoe') || allText.includes('sempervivum') ||
        allText.includes('jade plant') || allText.includes('snake plant') || allText.includes('sansevieria')) {
      return 'Succulent';
    }
    
    // Tree detection
    if (allText.includes('tree') || allText.includes('oak') || allText.includes('pine') || 
        allText.includes('maple') || allText.includes('birch') || allText.includes('elm') ||
        allText.includes('cedar') || allText.includes('spruce') || allText.includes('fir') ||
        allText.includes('willow') || allText.includes('poplar') || allText.includes('ash') ||
        allText.includes('cherry tree') || allText.includes('apple tree') || allText.includes('citrus tree')) {
      return 'Tree';
    }
    
    // Shrub detection
    if (allText.includes('shrub') || allText.includes('bush') || allText.includes('azalea') ||
        allText.includes('rhododendron') || allText.includes('hydrangea') || allText.includes('rose bush') ||
        allText.includes('lilac') || allText.includes('forsythia') || allText.includes('boxwood')) {
      return 'Shrub';
    }
    
    // Grass detection
    if (allText.includes('grass') || allText.includes('lawn') || allText.includes('turf') ||
        allText.includes('bamboo') || allText.includes('reed') || allText.includes('sedge')) {
      return 'Grass';
    }
    
    // Fern detection
    if (allText.includes('fern') || allText.includes('pteridophyta') || allText.includes('boston fern') ||
        allText.includes('maidenhair') || allText.includes('bracken') || allText.includes('tree fern')) {
      return 'Fern';
    }
    
    // Vine/Climber detection
    if (allText.includes('vine') || allText.includes('climber') || allText.includes('ivy') ||
        allText.includes('climbing') || allText.includes('trailing') || allText.includes('pothos') ||
        allText.includes('philodendron') || allText.includes('monstera') || allText.includes('hoya')) {
      return 'Vine / Climber';
    }
    
    // Herb detection
    if (allText.includes('herb') || allText.includes('basil') || allText.includes('mint') || 
        allText.includes('oregano') || allText.includes('thyme') || allText.includes('rosemary') ||
        allText.includes('sage') || allText.includes('parsley') || allText.includes('cilantro') ||
        allText.includes('chives') || allText.includes('dill') || allText.includes('tarragon')) {
      return 'Herb';
    }
    
    // Vegetable detection
    if (allText.includes('vegetable') || allText.includes('tomato') || allText.includes('pepper') ||
        allText.includes('lettuce') || allText.includes('spinach') || allText.includes('carrot') ||
        allText.includes('onion') || allText.includes('garlic') || allText.includes('cucumber') ||
        allText.includes('squash') || allText.includes('bean') || allText.includes('pea')) {
      return 'Vegetable';
    }
    
    // Fruit plant detection
    if (allText.includes('fruit') || allText.includes('berry') || allText.includes('apple') ||
        allText.includes('orange') || allText.includes('lemon') || allText.includes('lime') ||
        allText.includes('grape') || allText.includes('strawberry') || allText.includes('blueberry') ||
        allText.includes('raspberry') || allText.includes('blackberry') || allText.includes('citrus')) {
      return 'Fruit plant';
    }
    
    // Flower detection
    if (allText.includes('flower') || allText.includes('rose') || allText.includes('tulip') || 
        allText.includes('sunflower') || allText.includes('lavender') || allText.includes('orchid') || 
        allText.includes('lily') || allText.includes('daisy') || allText.includes('marigold') ||
        allText.includes('petunia') || allText.includes('geranium') || allText.includes('begonia') ||
        allText.includes('impatiens') || allText.includes('pansy') || allText.includes('zinnia')) {
      return 'Flower';
    }
    
    // Aquatic plant detection
    if (allText.includes('aquatic') || allText.includes('water') || allText.includes('pond') ||
        allText.includes('lily pad') || allText.includes('lotus') || allText.includes('water hyacinth') ||
        allText.includes('duckweed') || allText.includes('water lettuce')) {
      return 'Aquatic plant';
    }
    
    // Moss detection
    if (allText.includes('moss') || allText.includes('sphagnum') || allText.includes('peat moss')) {
      return 'Moss';
    }
    
    // Algae detection
    if (allText.includes('algae') || allText.includes('seaweed') || allText.includes('kelp')) {
      return 'Algae';
    }
    
    // Mushroom/Fungus detection
    if (allText.includes('mushroom') || allText.includes('fungus') || allText.includes('mycelium') ||
        allText.includes('toadstool') || allText.includes('mold')) {
      return 'Mushroom / Fungus';
    }
    
    // Default to 'Other' if no category matches
    return 'Other';
  };

  const filteredPlants = plants.filter(plant => {
    const matchesSearch = plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plant.species.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || plant.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || getPlantCategory(plant) === filterCategory;
    return matchesSearch && matchesFilter && matchesCategory;
  });

  const getStatusCounts = () => {
    const counts = {
      all: plants.length,
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0,
      critical: 0
    };

    plants.forEach(plant => {
      if (counts[plant.status] !== undefined) {
        counts[plant.status]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  const getCategoryCounts = () => {
    const counts = { all: plants.length };
    plantCategories.forEach(category => {
      counts[category] = plants.filter(plant => getPlantCategory(plant) === category).length;
    });
    return counts;
  };

  const categoryCounts = getCategoryCounts();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent': return '🌟';
      case 'good': return '😊';
      case 'fair': return '📝';
      case 'poor': return '🆘';
      case 'critical': return '🚨';
      default: return '🌱';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return '#10B981';
      case 'good': return '#34D399';
      case 'fair': return '#FBBF24';
      case 'poor': return '#F59E0B';
      case 'critical': return '#EF4444';
      default: return '#6b7280';
    }
  };

  return (
    <Container>
      <Header>
        <Title>My Plants</Title>
        <Controls>
          <SearchContainer>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Search plants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
          
          <FilterContainer ref={filterRef}>
            <FilterButton onClick={() => setShowFilterDropdown(!showFilterDropdown)}>
              <FiFilter />
              {filterCategory === 'all' ? 'All Categories' : filterCategory}
              <FiChevronDown />
            </FilterButton>
            
            {showFilterDropdown && (
              <FilterDropdown>
                <FilterOption 
                  onClick={() => {
                    setFilterCategory('all');
                    setShowFilterDropdown(false);
                  }}
                >
                  All Categories
                  <FilterCount>{categoryCounts.all}</FilterCount>
                </FilterOption>
                {plantCategories.map(category => (
                  <FilterOption 
                    key={category}
                    onClick={() => {
                      setFilterCategory(category);
                      setShowFilterDropdown(false);
                    }}
                  >
                    {category}
                    <FilterCount>{categoryCounts[category] || 0}</FilterCount>
                  </FilterOption>
                ))}
              </FilterDropdown>
            )}
          </FilterContainer>
          
          <ViewToggle>
            <ViewButton 
              active={viewMode === 'grid'} 
              onClick={() => setViewMode('grid')}
            >
              <FiGrid />
              Grid
            </ViewButton>
            <ViewButton 
              active={viewMode === 'list'} 
              onClick={() => setViewMode('list')}
            >
              <FiList />
              List
            </ViewButton>
          </ViewToggle>
          
          <AddPlantButton to="/add-plant">
            <FiPlus />
            Add Plant
          </AddPlantButton>
        </Controls>
      </Header>

      <StatsContainer>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatIcon>🌱</StatIcon>
          <StatValue>{statusCounts.all}</StatValue>
          <StatLabel>Total Plants</StatLabel>
        </StatCard>
        
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatIcon>🌟</StatIcon>
          <StatValue>{statusCounts.excellent}</StatValue>
          <StatLabel>Excellent Health</StatLabel>
        </StatCard>
        
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatIcon>📝</StatIcon>
          <StatValue>{statusCounts.fair + statusCounts.poor + statusCounts.critical}</StatValue>
          <StatLabel>Need Attention</StatLabel>
        </StatCard>
      </StatsContainer>

      {filteredPlants.length === 0 ? (
        <EmptyState>
          <EmptyIcon>🌱</EmptyIcon>
          <EmptyTitle>
            {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
              ? 'No plants found' 
              : 'No plants yet'
            }
          </EmptyTitle>
          <EmptyDescription>
            {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Add your first plant to start tracking its health and growth'
            }
          </EmptyDescription>
          {!searchTerm && filterStatus === 'all' && filterCategory === 'all' && (
            <AddPlantButton to="/add-plant">
              <FiPlus />
              Add Your First Plant
            </AddPlantButton>
          )}
        </EmptyState>
      ) : (
        viewMode === 'grid' ? (
          <PlantsGrid>
            {filteredPlants.map((plant, index) => (
              <motion.div
                key={plant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PlantCard 
                  plant={plant} 
                  onClick={() => onPlantSelect(plant)}
                />
              </motion.div>
            ))}
          </PlantsGrid>
        ) : (
          <PlantsList>
            {filteredPlants.map((plant, index) => (
              <motion.div
                key={plant.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <PlantCard 
                  plant={plant} 
                  onClick={() => onPlantSelect(plant)}
                />
              </motion.div>
            ))}
          </PlantsList>
        )
      )}
    </Container>
  );
};

export default MyPlants;
