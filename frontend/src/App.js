import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// Components
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import PlantDetail from './components/PlantDetail';
import AIChat from './components/AIChat';
import LoadingSpinner from './components/LoadingSpinner';

// Services
import { plantService } from './services/plantService';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const MainContent = styled.main`
  padding-top: 80px;
  min-height: calc(100vh - 80px);
`;

function App() {
  const [loading, setLoading] = useState(true);
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      
      // Load plants data
      const plantsData = await plantService.getAllPlants();
      setPlants(plantsData.plants || []);
      
      // Set default selected plant
      if (plantsData.plants && plantsData.plants.length > 0) {
        setSelectedPlant(plantsData.plants[0]);
      }
      
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlantSelect = (plant) => {
    setSelectedPlant(plant);
  };

  const handlePlantUpdate = (updatedPlant) => {
    setPlants(prevPlants => 
      prevPlants.map(plant => 
        plant.id === updatedPlant.id ? updatedPlant : plant
      )
    );
    
    if (selectedPlant && selectedPlant.id === updatedPlant.id) {
      setSelectedPlant(updatedPlant);
    }
  };

  if (loading) {
    return (
      <AppContainer>
        <LoadingSpinner />
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <Header 
        plants={plants}
        selectedPlant={selectedPlant}
        onPlantSelect={handlePlantSelect}
      />
      
      <MainContent>
        <Routes>
          <Route 
            path="/" 
            element={
              <Dashboard 
                plants={plants}
                selectedPlant={selectedPlant}
                onPlantSelect={handlePlantSelect}
                onPlantUpdate={handlePlantUpdate}
              />
            } 
          />
          <Route 
            path="/plant/:plantId" 
            element={
              <PlantDetail 
                plants={plants}
                onPlantUpdate={handlePlantUpdate}
              />
            } 
          />
          <Route 
            path="/ai-chat" 
            element={
              <AIChat 
                selectedPlant={selectedPlant}
              />
            } 
          />
        </Routes>
      </MainContent>
    </AppContainer>
  );
}

export default App;
