import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PlantCard from './PlantCard';
import { 
  FiPlus,
  FiSearch,
  FiFilter
} from 'react-icons/fi';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: 100vh;
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
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
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
  border-radius: 0.75rem;
  font-size: 0.875rem;
  width: 250px;
  transition: all 0.2s ease;
  background: white;

  &:focus {
    outline: none;
    border-color: #6B8E6F;
    box-shadow: 0 0 0 3px rgba(107, 142, 111, 0.1);
  }

  &::placeholder {
    color: #9CA3AF;
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
  padding: 0.75rem 1.25rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f9fafb;
    border-color: #6B8E6F;
  }
`;

const AddPlantButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #2D3E2D;
  color: white;
  text-decoration: none;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background: #1F2A1F;
    transform: translateY(-1px);
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled(motion.div)`
  background: #6B8E6F;
  padding: 2rem 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.05);
    pointer-events: none;
  }
`;

const StatValue = styled.div`
  font-size: 3rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const StatLabel = styled.div`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 500;
`;

const StatIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  display: none;
`;

const PlantsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
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
          
          <AddPlantButton to="/add-plant">
            <FiPlus />
            Add Plants
          </AddPlantButton>
        </Controls>
      </Header>

      <StatsContainer>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatValue>{statusCounts.all}</StatValue>
          <StatLabel>Total Plants</StatLabel>
        </StatCard>
        
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatValue>{statusCounts.excellent + statusCounts.good}</StatValue>
          <StatLabel>Good Condition</StatLabel>
        </StatCard>
        
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
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
                onClick={() => {/* Navigate in PlantCard component */}}
              />
            </motion.div>
          ))}
        </PlantsGrid>
      )}
    </Container>
  );
};

export default MyPlants;
