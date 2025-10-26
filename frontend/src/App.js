import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import styled from 'styled-components';

// Components
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import PlantDetail from './components/PlantDetail';
import AIChat from './components/AIChat';
import MyPlants from './components/MyPlants';
import AddPlant from './components/AddPlant';
import LoadingSpinner from './components/LoadingSpinner';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Services
import { plantService } from './services/plantService';

const AppContainer = styled.div`
  min-height: 100vh;
  background: #9CAF88;
`;

const MainContent = styled.main`
  padding-top: 80px;
  min-height: calc(100vh - 80px);
`;

function AuthenticatedApp() {
  const [loading, setLoading] = useState(true);
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      initializeApp();
    } else {
      setPlants([]);
      setSelectedPlant(null);
      setLoading(false);
    }
  }, [user]);

  const initializeApp = async () => {
    try {
      setLoading(true);
      
      // Load plants data for the current user
      const plantsData = await plantService.getAllPlants();
      const formattedPlants = (plantsData.plants || []).map(plant => ({
        ...plant,
        // Add default values for missing fields
        healthScore: plant.healthScore || 0.8,
        status: plant.status || 'good',
        sensorData: plant.sensorData || {
          moisture: Math.floor(Math.random() * 40) + 30,
          light: Math.floor(Math.random() * 200) + 300,
          temperature: Math.floor(Math.random() * 20) + 65,
          humidity: Math.floor(Math.random() * 30) + 40
        },
        lastWatered: plant.lastWatered ? new Date(plant.lastWatered) : new Date(),
        careInfo: plant.careInfo || null,
        careTips: plant.careTips || null,
        careSummary: plant.careSummary || null
      }));
      setPlants(formattedPlants);
      
      // Set most recently added plant as selected
      if (formattedPlants && formattedPlants.length > 0) {
        // Sort plants by creation time (most recent first)
        const sortedPlants = formattedPlants.sort((a, b) => {
          return new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at);
        });
        setSelectedPlant(sortedPlants[0]);
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

  const handlePlantAdd = (newPlant) => {
    setPlants(prevPlants => [...prevPlants, newPlant]);
    // Automatically select the newly added plant as the most recent plant
    setSelectedPlant(newPlant);
  };

  const handlePlantRemove = (plantId) => {
    setPlants(prevPlants => prevPlants.filter(plant => plant.id !== plantId));
    if (selectedPlant && selectedPlant.id === plantId) {
      setSelectedPlant(null);
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
                onPlantRemove={handlePlantRemove}
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
          <Route 
            path="/my-plants" 
            element={
              <MyPlants 
                plants={plants}
                onPlantSelect={handlePlantSelect}
                onPlantUpdate={handlePlantUpdate}
              />
            } 
          />
          <Route 
            path="/add-plant" 
            element={
              <AddPlant 
                onPlantAdd={handlePlantAdd}
              />
            } 
          />
        </Routes>
      </MainContent>
    </AppContainer>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;
