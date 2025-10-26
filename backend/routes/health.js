const express = require('express');
const { calculatePlantHealth } = require('../utils/healthCalculator');

const router = express.Router();

/**
 * POST /api/health/calculate
 * Calculate plant health score from sensor readings
 */
router.post('/calculate', (req, res) => {
  try {
    const { soil_temp, air_humidity, soil_moisture, light_lumens } = req.body;
    
    // Validate required fields
    if (typeof soil_temp !== 'number' || typeof air_humidity !== 'number' || 
        typeof soil_moisture !== 'number' || typeof light_lumens !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'All sensor readings (soil_temp, air_humidity, soil_moisture, light_lumens) must be provided as numbers'
      });
    }
    
    const result = calculatePlantHealth({
      soil_temp,
      air_humidity,
      soil_moisture,
      light_lumens
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Health calculation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate plant health score'
    });
  }
});

/**
 * GET /api/health/ranges
 * Get ideal and danger ranges for each sensor type
 */
router.get('/ranges', (req, res) => {
  res.json({
    success: true,
    data: {
      soil_temp: {
        ideal: [18, 25],
        danger: [10, 35],
        unit: "°C"
      },
      air_humidity: {
        ideal: [40, 70],
        danger: [20, 90],
        unit: "%"
      },
      soil_moisture: {
        ideal: [40, 60],
        danger: [20, 90],
        unit: "%"
      },
      light_lumens: {
        ideal: [10000, 40000],
        danger: [5000, 80000],
        unit: "lumens"
      },
      weights: {
        soil_moisture: 0.35,
        light: 0.25,
        air_humidity: 0.20,
        soil_temp: 0.20
      },
      status_thresholds: {
        healthy: [80, 100],
        okay: [60, 79],
        weak: [40, 59],
        unhealthy: [0, 39]
      }
    }
  });
});

module.exports = router;
