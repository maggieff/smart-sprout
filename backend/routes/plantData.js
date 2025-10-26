const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getSimulatedSensorData, PLANT_SENSOR_RANGES } = require('../utils/simulateSensors');
const { calculateHealthScore } = require('../utils/healthCalculator');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'plant-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

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
    
    // Get optimal ranges for this species
    const speciesKey = plant.species.toLowerCase().replace('sansevieria trifasciata', 'snake plant')
      .replace('ficus lyrata', 'fiddle leaf fig')
      .replace('monstera deliciosa', 'monstera')
      .replace('epipremnum aureum', 'pothos')
      .replace(/succulent.*/i, 'succulent');
    
    console.log('Species:', plant.species);
    console.log('Species Key:', speciesKey);
    console.log('PLANT_SENSOR_RANGES available:', Object.keys(PLANT_SENSOR_RANGES || {}));
    
    const optimalRanges = PLANT_SENSOR_RANGES[speciesKey] || PLANT_SENSOR_RANGES['snake plant'];
    
    console.log('Optimal Ranges:', optimalRanges);

    const response = {
      ...plant,
      sensorData: {
        moisture: sensorData.moisture,
        light: sensorData.light,
        temperature: sensorData.temperature,
        humidity: sensorData.humidity,
        timestamp: new Date().toISOString()
      },
      optimalRanges,
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

// GET /api/plant-data/all - Get all plants with sensor data
router.get('/all', (req, res) => {
  try {
    const plants = Object.values(plantStorage).map(plant => {
      // Get simulated sensor data for each plant
      const sensorData = getSimulatedSensorData(plant.species);
      
      // Calculate health score
      const healthScore = calculateHealthScore(sensorData, plant);
      
      return {
        id: plant.id,
        name: plant.name,
        species: plant.species,
        image: plant.image,
        lastWatered: plant.lastWatered,
        sensorData: {
          moisture: sensorData.moisture,
          light: sensorData.light,
          temperature: sensorData.temperature,
          humidity: sensorData.humidity
        },
        healthScore: healthScore,
        status: getPlantStatus(healthScore)
      };
    });
    
    res.json({ plants });
  } catch (error) {
    console.error('Error fetching all plants:', error);
    res.status(500).json({ error: 'Failed to fetch plants' });
  }
});

// POST /api/plant-data - Create a new plant (with optional image upload)
router.post('/', upload.single('image'), (req, res) => {
  try {
    console.log('Received request body:', req.body);
    console.log('Received file:', req.file ? req.file.filename : 'No file');
    
    const { name, species, notes } = req.body;
    
    console.log('Extracted data:', { name, species, notes });
    
    if (!name || !species) {
      console.log('Validation failed - missing name or species');
      return res.status(400).json({ 
        error: 'Name and species are required',
        received: { name, species }
      });
    }
    
    // Generate unique ID
    const plantId = `plant-${Date.now()}`;
    
    // Map species to display name
    const speciesMap = {
      'snake-plant': 'Sansevieria trifasciata',
      'fiddle-leaf-fig': 'Ficus lyrata',
      'monstera': 'Monstera deliciosa',
      'pothos': 'Epipremnum aureum',
      'succulent': 'Succulent',
      'peace-lily': 'Spathiphyllum',
      'spider-plant': 'Chlorophytum comosum',
      'aloe-vera': 'Aloe vera',
      'rubber-plant': 'Ficus elastica',
      'zz-plant': 'Zamioculcas zamiifolia'
    };
    
    // Get image path if uploaded
    const imagePath = req.file 
      ? `/uploads/${req.file.filename}` 
      : '/images/plant-placeholder.jpg';
    
    // Create new plant object
    const newPlant = {
      id: plantId,
      name: name.trim(),
      species: speciesMap[species] || species,
      image: imagePath,
      lastWatered: new Date(),
      notes: notes || '',
      careInstructions: {
        watering: 'Adjust based on plant type',
        light: 'Adjust based on plant type',
        temperature: '60-85°F',
        humidity: '40-60%'
      }
    };
    
    // Store the plant
    plantStorage[plantId] = newPlant;
    
    console.log(`Created new plant: ${name} (${plantId})${req.file ? ' with image' : ''}`);
    
    res.status(201).json({
      success: true,
      plant: newPlant,
      message: 'Plant created successfully'
    });
    
  } catch (error) {
    console.error('Error creating plant:', error);
    res.status(500).json({ error: 'Failed to create plant' });
  }
});

// PUT /api/plant-data/:id - Update an existing plant
router.put('/:id', upload.single('image'), (req, res) => {
  try {
    const { id } = req.params;
    const { name, species, notes, existingImage } = req.body;
    
    console.log(`Updating plant ${id}:`, { name, species, notes });
    
    if (!plantStorage[id]) {
      return res.status(404).json({ error: 'Plant not found' });
    }
    
    if (!name || !species) {
      return res.status(400).json({ error: 'Name and species are required' });
    }
    
    // Map species to display name
    const speciesMap = {
      'snake-plant': 'Sansevieria trifasciata',
      'fiddle-leaf-fig': 'Ficus lyrata',
      'monstera': 'Monstera deliciosa',
      'pothos': 'Epipremnum aureum',
      'succulent': 'Succulent',
      'peace-lily': 'Spathiphyllum',
      'spider-plant': 'Chlorophytum comosum',
      'aloe-vera': 'Aloe vera',
      'rubber-plant': 'Ficus elastica',
      'zz-plant': 'Zamioculcas zamiifolia'
    };
    
    // Determine image path
    let imagePath;
    if (req.file) {
      // New image uploaded
      imagePath = `/uploads/${req.file.filename}`;
    } else if (existingImage) {
      // Keep existing image
      imagePath = existingImage;
    } else {
      // Use existing plant's image or placeholder
      imagePath = plantStorage[id].image || '/images/plant-placeholder.jpg';
    }
    
    // Update plant
    plantStorage[id] = {
      ...plantStorage[id],
      name: name.trim(),
      species: speciesMap[species] || species,
      image: imagePath,
      notes: notes || '',
      lastUpdated: new Date()
    };
    
    console.log(`Updated plant: ${name} (${id})${req.file ? ' with new image' : ''}`);
    
    res.json({
      success: true,
      plant: plantStorage[id],
      message: 'Plant updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating plant:', error);
    res.status(500).json({ error: 'Failed to update plant' });
  }
});

// DELETE /api/plant-data/:id - Delete a plant
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    if (!plantStorage[id]) {
      return res.status(404).json({ error: 'Plant not found' });
    }
    
    const plantName = plantStorage[id].name;
    delete plantStorage[id];
    
    console.log(`Deleted plant: ${plantName} (${id})`);
    
    res.json({
      success: true,
      message: 'Plant deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting plant:', error);
    res.status(500).json({ error: 'Failed to delete plant' });
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
