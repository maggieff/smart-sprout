const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getSimulatedSensorData } = require('../utils/simulateSensors');
const { calculateHealthScore } = require('../utils/healthCalculator');
const database = require('../utils/database');
const { authenticateUser } = require('../middleware/auth');

// GET /api/plant-data - Get current plant data with simulated sensors
router.get('/', authenticateUser, async (req, res) => {
  try {
    const plantId = req.query.plantId;
    
    if (!plantId) {
      return res.status(400).json({ error: 'Plant ID is required' });
    }
    
    const plant = await database.getPlantById(plantId, req.user.id);
    
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    // Get simulated sensor data
    const sensorData = getSimulatedSensorData();
    
    // Calculate health score based on sensor data and plant care
    const healthScore = calculateHealthScore(sensorData, plant);
    
    // Get recent logs for this plant
    const recentLogs = await database.getUserLogs(req.user.id, plantId, 5);
    
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

// GET /api/plant-data/all - Get all plants for authenticated user
router.get('/all', authenticateUser, async (req, res) => {
  try {
    const plants = await database.getUserPlants(req.user.id);
    
    const formattedPlants = plants.map(plant => ({
      id: plant.id,
      name: plant.name,
      species: plant.species,
      image: plant.image,
      lastWatered: plant.last_watered,
      createdAt: plant.created_at
    }));
    
    res.json({ plants: formattedPlants });
  } catch (error) {
    console.error('Error fetching all plants:', error);
    res.status(500).json({ error: 'Failed to fetch plants' });
  }
});

// POST /api/plant-data - Create a new plant
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { name, species, image } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Plant name is required' });
    }

    const plantData = {
      id: uuidv4(),
      name,
      species: species || 'Unknown',
      image: image || null,
      lastWatered: new Date().toISOString()
    };

    const result = await database.createPlant(req.user.id, plantData);
    
    if (result.success) {
      res.status(201).json({
        success: true,
        plant: result.plant,
        message: 'Plant created successfully'
      });
    } else {
      res.status(500).json({ error: 'Failed to create plant' });
    }
  } catch (error) {
    console.error('Error creating plant:', error);
    res.status(500).json({ error: 'Failed to create plant' });
  }
});

// PUT /api/plant-data/:plantId - Update a plant
router.put('/:plantId', authenticateUser, async (req, res) => {
  try {
    const { plantId } = req.params;
    const updates = req.body;

    const result = await database.updatePlant(plantId, req.user.id, updates);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Plant updated successfully'
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error updating plant:', error);
    res.status(500).json({ error: 'Failed to update plant' });
  }
});

// DELETE /api/plant-data/:plantId - Delete a plant
router.delete('/:plantId', authenticateUser, async (req, res) => {
  try {
    const { plantId } = req.params;

    const result = await database.deletePlant(plantId, req.user.id);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Plant deleted successfully'
      });
    } else {
      res.status(404).json({ error: 'Plant not found' });
    }
  } catch (error) {
    console.error('Error deleting plant:', error);
    res.status(500).json({ error: 'Failed to delete plant' });
  }
});

// Helper functions

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
