const express = require('express');
const router = express.Router();
const { getSimulatedSensorData } = require('../utils/simulateSensors');
const { calculateHealthScore } = require('../utils/healthCalculator');

// In-memory storage for demo purposes
let plantStorage = {
  'plant-001': {
    id: 'plant-001',
    name: 'Snake Plant',
    species: 'Sansevieria trifasciata',
    image: '/images/snake-plant.jpg',
    lastWatered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    careInstructions: {
      watering: 'Every 2-3 weeks',
      light: 'Low to bright indirect light',
      temperature: '60-85°F',
      humidity: '40-50%'
    }
  },
  'plant-002': {
    id: 'plant-002',
    name: 'Fiddle Leaf Fig',
    species: 'Ficus lyrata',
    image: '/images/fiddle-leaf.jpg',
    lastWatered: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    careInstructions: {
      watering: 'Weekly',
      light: 'Bright indirect light',
      temperature: '65-75°F',
      humidity: '50-60%'
    }
  }
};

// GET /api/plant-data - Get current plant data with simulated sensors
router.get('/', async (req, res) => {
  try {
    const plantId = req.query.plantId || 'plant-001';
    const plant = plantStorage[plantId];
    
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    // Get simulated sensor data
    const sensorData = getSimulatedSensorData();
    
    // Calculate health score based on sensor data and plant care
    const healthScore = calculateHealthScore(sensorData, plant);
    
    // Get recent logs for this plant
    const recentLogs = await getRecentLogs(plantId);
    
    const response = {
      ...plant,
      sensorData: {
        moisture: sensorData.moisture,
        light: sensorData.light,
        temperature: sensorData.temperature,
        humidity: sensorData.humidity,
        timestamp: new Date().toISOString()
      },
      healthScore: healthScore,
      status: getPlantStatus(healthScore),
      recentLogs: recentLogs,
      nextWatering: calculateNextWatering(plant, sensorData),
      recommendations: getRecommendations(sensorData, plant)
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching plant data:', error);
    res.status(500).json({ error: 'Failed to fetch plant data' });
  }
});

// GET /api/plant-data/all - Get all plants
router.get('/all', (req, res) => {
  try {
    const plants = Object.values(plantStorage).map(plant => ({
      id: plant.id,
      name: plant.name,
      species: plant.species,
      image: plant.image,
      lastWatered: plant.lastWatered
    }));
    
    res.json({ plants });
  } catch (error) {
    console.error('Error fetching all plants:', error);
    res.status(500).json({ error: 'Failed to fetch plants' });
  }
});

// Helper functions
async function getRecentLogs(plantId) {
  // In a real app, this would query the database
  return [
    {
      id: 'log-001',
      plantId: plantId,
      note: 'Plant looks healthy, leaves are perky',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      type: 'observation'
    },
    {
      id: 'log-002',
      plantId: plantId,
      note: 'Watered thoroughly, soil was dry',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'watering'
    }
  ];
}

function getPlantStatus(healthScore) {
  if (healthScore >= 0.8) return 'excellent';
  if (healthScore >= 0.6) return 'good';
  if (healthScore >= 0.4) return 'fair';
  return 'needs_attention';
}

function calculateNextWatering(plant, sensorData) {
  const daysSinceWatered = Math.floor((Date.now() - plant.lastWatered.getTime()) / (24 * 60 * 60 * 1000));
  const moistureLevel = sensorData.moisture;
  
  // Simple logic: if moisture is low and it's been a while, suggest watering
  if (moistureLevel < 30 && daysSinceWatered >= 2) {
    return 'today';
  } else if (moistureLevel < 50 && daysSinceWatered >= 1) {
    return 'soon';
  } else {
    return 'not_needed';
  }
}

function getRecommendations(sensorData, plant) {
  const recommendations = [];
  
  if (sensorData.moisture < 30) {
    recommendations.push('💧 Water your plant - soil is dry');
  }
  
  if (sensorData.light < 300) {
    recommendations.push('☀️ Move to brighter location');
  }
  
  if (sensorData.temperature < 60 || sensorData.temperature > 85) {
    recommendations.push('🌡️ Check temperature - plant may be too hot/cold');
  }
  
  if (sensorData.humidity < 40) {
    recommendations.push('💨 Increase humidity around plant');
  }
  
  return recommendations;
}

module.exports = router;
