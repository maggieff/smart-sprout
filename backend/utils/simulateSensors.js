/**
 * Simulated sensor data for plant monitoring
 * In a real implementation, this would connect to actual IoT sensors
 */

// Base sensor ranges for different plant types
const PLANT_SENSOR_RANGES = {
  'snake plant': {
    moisture: { min: 20, max: 40, optimal: 30 },
    light: { min: 200, max: 800, optimal: 500 },
    temperature: { min: 65, max: 85, optimal: 75 },
    humidity: { min: 30, max: 50, optimal: 40 }
  },
  'fiddle leaf fig': {
    moisture: { min: 40, max: 70, optimal: 55 },
    light: { min: 400, max: 1000, optimal: 700 },
    temperature: { min: 65, max: 75, optimal: 70 },
    humidity: { min: 50, max: 70, optimal: 60 }
  },
  'monstera': {
    moisture: { min: 50, max: 80, optimal: 65 },
    light: { min: 300, max: 900, optimal: 600 },
    temperature: { min: 68, max: 86, optimal: 77 },
    humidity: { min: 60, max: 80, optimal: 70 }
  },
  'pothos': {
    moisture: { min: 30, max: 60, optimal: 45 },
    light: { min: 200, max: 700, optimal: 450 },
    temperature: { min: 60, max: 85, optimal: 72 },
    humidity: { min: 40, max: 60, optimal: 50 }
  },
  'succulent': {
    moisture: { min: 10, max: 30, optimal: 20 },
    light: { min: 500, max: 1000, optimal: 750 },
    temperature: { min: 60, max: 90, optimal: 75 },
    humidity: { min: 20, max: 40, optimal: 30 }
  }
};

// Global sensor state for realistic simulation
let sensorState = {
  moisture: 50,
  light: 500,
  temperature: 72,
  humidity: 50,
  lastUpdate: Date.now()
};

/**
 * Get simulated sensor data with realistic variations
 * @param {string} species - Plant species for optimal ranges
 * @returns {Object} Simulated sensor readings
 */
function getSimulatedSensorData(species = 'snake plant') {
  const now = Date.now();
  const timeSinceUpdate = now - sensorState.lastUpdate;
  
  // Update sensors every 5-10 seconds for demo
  if (timeSinceUpdate > 5000) {
    updateSensorState(species);
    sensorState.lastUpdate = now;
  }
  
  return {
    moisture: Math.round(sensorState.moisture),
    light: Math.round(sensorState.light),
    temperature: Math.round(sensorState.temperature * 10) / 10,
    humidity: Math.round(sensorState.humidity),
    timestamp: new Date().toISOString(),
    battery: Math.floor(Math.random() * 20) + 80, // 80-100%
    signal: Math.floor(Math.random() * 20) + 80   // 80-100%
  };
}

/**
 * Update sensor state with realistic drift
 * @param {string} species - Plant species
 */
function updateSensorState(species) {
  const ranges = PLANT_SENSOR_RANGES[species.toLowerCase()] || PLANT_SENSOR_RANGES['snake plant'];
  
  // Simulate gradual changes with some randomness
  sensorState.moisture = driftValue(sensorState.moisture, ranges.moisture, 0.1);
  sensorState.light = driftValue(sensorState.light, ranges.light, 0.15);
  sensorState.temperature = driftValue(sensorState.temperature, ranges.temperature, 0.05);
  sensorState.humidity = driftValue(sensorState.humidity, ranges.humidity, 0.1);
}

/**
 * Gradually drift a value towards optimal range with some randomness
 * @param {number} current - Current value
 * @param {Object} range - Target range {min, max, optimal}
 * @param {number} driftRate - How fast to drift (0-1)
 * @returns {number} New value
 */
function driftValue(current, range, driftRate) {
  const target = range.optimal + (Math.random() - 0.5) * (range.max - range.min) * 0.2;
  const drift = (target - current) * driftRate;
  const random = (Math.random() - 0.5) * 2; // -1 to 1
  
  return Math.max(range.min, Math.min(range.max, current + drift + random));
}

/**
 * Get sensor data with specific conditions for testing
 * @param {string} condition - 'healthy', 'needs_water', 'too_much_light', 'cold', 'hot'
 * @returns {Object} Simulated sensor readings
 */
function getSimulatedSensorDataForCondition(condition) {
  const baseData = getSimulatedSensorData();
  
  switch (condition) {
    case 'healthy':
      return {
        ...baseData,
        moisture: 60,
        light: 600,
        temperature: 72,
        humidity: 55
      };
    
    case 'needs_water':
      return {
        ...baseData,
        moisture: 15,
        light: 500,
        temperature: 70,
        humidity: 45
      };
    
    case 'overwatered':
      return {
        ...baseData,
        moisture: 90,
        light: 400,
        temperature: 68,
        humidity: 80
      };
    
    case 'too_much_light':
      return {
        ...baseData,
        moisture: 40,
        light: 1200,
        temperature: 85,
        humidity: 30
      };
    
    case 'too_little_light':
      return {
        ...baseData,
        moisture: 50,
        light: 100,
        temperature: 65,
        humidity: 60
      };
    
    case 'cold':
      return {
        ...baseData,
        moisture: 45,
        light: 500,
        temperature: 55,
        humidity: 70
      };
    
    case 'hot':
      return {
        ...baseData,
        moisture: 35,
        light: 800,
        temperature: 95,
        humidity: 20
      };
    
    default:
      return baseData;
  }
}

/**
 * Get sensor history for charts (simulated)
 * @param {number} hours - Number of hours of history
 * @returns {Array} Array of sensor readings over time
 */
function getSensorHistory(hours = 24) {
  const history = [];
  const now = Date.now();
  const interval = (hours * 60 * 60 * 1000) / 24; // 24 data points
  
  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(now - (23 - i) * interval);
    const baseData = getSimulatedSensorData();
    
    // Add some time-based variation
    const timeVariation = Math.sin((i / 24) * Math.PI * 2) * 10;
    
    history.push({
      timestamp: timestamp.toISOString(),
      moisture: Math.max(0, Math.min(100, baseData.moisture + timeVariation)),
      light: Math.max(0, baseData.light + timeVariation * 5),
      temperature: Math.max(50, Math.min(100, baseData.temperature + timeVariation * 0.5)),
      humidity: Math.max(20, Math.min(90, baseData.humidity + timeVariation))
    });
  }
  
  return history;
}

/**
 * Simulate sensor alerts
 * @param {Object} sensorData - Current sensor readings
 * @returns {Array} Array of alerts
 */
function getSensorAlerts(sensorData) {
  const alerts = [];
  
  if (sensorData.moisture < 20) {
    alerts.push({
      type: 'warning',
      message: '🌱 Low moisture detected - consider watering',
      sensor: 'moisture',
      value: sensorData.moisture,
      threshold: 20
    });
  }
  
  if (sensorData.moisture > 90) {
    alerts.push({
      type: 'warning',
      message: '💧 High moisture detected - check for overwatering',
      sensor: 'moisture',
      value: sensorData.moisture,
      threshold: 90
    });
  }
  
  if (sensorData.light < 200) {
    alerts.push({
      type: 'info',
      message: '☀️ Low light levels - consider moving to brighter location',
      sensor: 'light',
      value: sensorData.light,
      threshold: 200
    });
  }
  
  if (sensorData.temperature < 60) {
    alerts.push({
      type: 'warning',
      message: '❄️ Low temperature - plant may be too cold',
      sensor: 'temperature',
      value: sensorData.temperature,
      threshold: 60
    });
  }
  
  if (sensorData.temperature > 90) {
    alerts.push({
      type: 'warning',
      message: '🔥 High temperature - plant may be too hot',
      sensor: 'temperature',
      value: sensorData.temperature,
      threshold: 90
    });
  }
  
  return alerts;
}

module.exports = {
  getSimulatedSensorData,
  getSimulatedSensorDataForCondition,
  getSensorHistory,
  getSensorAlerts,
  PLANT_SENSOR_RANGES
};
