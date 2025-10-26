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
  FiList
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
  font-size: 2rem;
  font-weight: 700;
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
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f9fafb;
    border-color: #10B981;
  }
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
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
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
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const EmptyTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const EmptyDescription = styled.p`
  color: #6b7280;
  margin-bottom: 2rem;
`;

const MyPlants = ({ plants, onPlantSelect, onPlantUpdate }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [viewMode, setViewMode] = React.useState('grid');
  const [filterStatus, setFilterStatus] = React.useState('all');

  const filteredPlants = plants.filter(plant => {
    const matchesSearch = plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plant.species.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || plant.status === filterStatus;
    return matchesSearch && matchesFilter;
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
          
          <FilterButton onClick={() => setFilterStatus(filterStatus === 'all' ? 'excellent' : 'all')}>
            <FiFilter />
            Filter
          </FilterButton>
          
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
            {searchTerm || filterStatus !== 'all' 
              ? 'No plants found' 
              : 'No plants yet'
            }
          </EmptyTitle>
          <EmptyDescription>
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Add your first plant to start tracking its health and growth'
            }
          </EmptyDescription>
          {!searchTerm && filterStatus === 'all' && (
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
