/**
 * Plant health calculation based on sensor data and care history
 */

/**
 * Calculate overall plant health score (0-1)
 * @param {Object} sensorData - Current sensor readings
 * @param {Object} plant - Plant information and care history
 * @returns {number} Health score between 0 and 1
 */
function calculateHealthScore(sensorData, plant) {
  const weights = {
    moisture: 0.3,
    light: 0.25,
    temperature: 0.2,
    humidity: 0.15,
    care: 0.1
  };
  
  // Calculate individual component scores
  const moistureScore = calculateMoistureScore(sensorData.moisture, plant.species);
  const lightScore = calculateLightScore(sensorData.light, plant.species);
  const temperatureScore = calculateTemperatureScore(sensorData.temperature, plant.species);
  const humidityScore = calculateHumidityScore(sensorData.humidity, plant.species);
  const careScore = calculateCareScore(plant);
  
  // Weighted average
  const healthScore = (
    moistureScore * weights.moisture +
    lightScore * weights.light +
    temperatureScore * weights.temperature +
    humidityScore * weights.humidity +
    careScore * weights.care
  );
  
  return Math.max(0, Math.min(1, healthScore));
}

/**
 * Calculate moisture score based on plant species preferences
 * @param {number} moisture - Current moisture level (0-100)
 * @param {string} species - Plant species
 * @returns {number} Score between 0 and 1
 */
function calculateMoistureScore(moisture, species) {
  const preferences = getMoisturePreferences(species);
  
  if (moisture >= preferences.optimalMin && moisture <= preferences.optimalMax) {
    return 1.0;
  } else if (moisture >= preferences.acceptableMin && moisture <= preferences.acceptableMax) {
    return 0.7;
  } else if (moisture >= preferences.tolerableMin && moisture <= preferences.tolerableMax) {
    return 0.4;
  } else {
    return 0.1;
  }
}

/**
 * Calculate light score based on plant species preferences
 * @param {number} light - Current light level (0-1000)
 * @param {string} species - Plant species
 * @returns {number} Score between 0 and 1
 */
function calculateLightScore(light, species) {
  const preferences = getLightPreferences(species);
  
  if (light >= preferences.optimalMin && light <= preferences.optimalMax) {
    return 1.0;
  } else if (light >= preferences.acceptableMin && light <= preferences.acceptableMax) {
    return 0.7;
  } else if (light >= preferences.tolerableMin && light <= preferences.tolerableMax) {
    return 0.4;
  } else {
    return 0.1;
  }
}

/**
 * Calculate temperature score
 * @param {number} temperature - Current temperature in Fahrenheit
 * @param {string} species - Plant species
 * @returns {number} Score between 0 and 1
 */
function calculateTemperatureScore(temperature, species) {
  const preferences = getTemperaturePreferences(species);
  
  if (temperature >= preferences.optimalMin && temperature <= preferences.optimalMax) {
    return 1.0;
  } else if (temperature >= preferences.acceptableMin && temperature <= preferences.acceptableMax) {
    return 0.7;
  } else if (temperature >= preferences.tolerableMin && temperature <= preferences.tolerableMax) {
    return 0.4;
  } else {
    return 0.1;
  }
}

/**
 * Calculate humidity score
 * @param {number} humidity - Current humidity percentage
 * @param {string} species - Plant species
 * @returns {number} Score between 0 and 1
 */
function calculateHumidityScore(humidity, species) {
  const preferences = getHumidityPreferences(species);
  
  if (humidity >= preferences.optimalMin && humidity <= preferences.optimalMax) {
    return 1.0;
  } else if (humidity >= preferences.acceptableMin && humidity <= preferences.acceptableMax) {
    return 0.7;
  } else if (humidity >= preferences.tolerableMin && humidity <= preferences.tolerableMax) {
    return 0.4;
  } else {
    return 0.1;
  }
}

/**
 * Calculate care score based on recent care activities
 * @param {Object} plant - Plant information with care history
 * @returns {number} Score between 0 and 1
 */
function calculateCareScore(plant) {
  let score = 0.5; // Base score
  
  // Check last watering
  const daysSinceWatered = Math.floor((Date.now() - plant.lastWatered.getTime()) / (24 * 60 * 60 * 1000));
  if (daysSinceWatered <= 3) {
    score += 0.2;
  } else if (daysSinceWatered <= 7) {
    score += 0.1;
  } else if (daysSinceWatered > 14) {
    score -= 0.2;
  }
  
  // Check for recent logs (engagement)
  if (plant.recentLogs && plant.recentLogs.length > 0) {
    const recentLogs = plant.recentLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return logDate >= weekAgo;
    });
    
    if (recentLogs.length >= 3) {
      score += 0.2;
    } else if (recentLogs.length >= 1) {
      score += 0.1;
    }
  }
  
  return Math.max(0, Math.min(1, score));
}

/**
 * Get moisture preferences for different plant species
 * @param {string} species - Plant species
 * @returns {Object} Moisture preference ranges
 */
function getMoisturePreferences(species) {
  const preferences = {
    'snake plant': {
      optimalMin: 20, optimalMax: 40,
      acceptableMin: 15, acceptableMax: 50,
      tolerableMin: 10, tolerableMax: 60
    },
    'fiddle leaf fig': {
      optimalMin: 40, optimalMax: 70,
      acceptableMin: 30, acceptableMax: 80,
      tolerableMin: 20, tolerableMax: 90
    },
    'monstera': {
      optimalMin: 50, optimalMax: 80,
      acceptableMin: 40, acceptableMax: 85,
      tolerableMin: 30, tolerableMax: 90
    },
    'pothos': {
      optimalMin: 30, optimalMax: 60,
      acceptableMin: 20, acceptableMax: 70,
      tolerableMin: 15, tolerableMax: 80
    },
    'succulent': {
      optimalMin: 10, optimalMax: 30,
      acceptableMin: 5, acceptableMax: 40,
      tolerableMin: 0, tolerableMax: 50
    }
  };
  
  return preferences[species.toLowerCase()] || preferences['snake plant'];
}

/**
 * Get light preferences for different plant species
 * @param {string} species - Plant species
 * @returns {Object} Light preference ranges
 */
function getLightPreferences(species) {
  const preferences = {
    'snake plant': {
      optimalMin: 200, optimalMax: 800,
      acceptableMin: 100, acceptableMax: 1000,
      tolerableMin: 50, tolerableMax: 1200
    },
    'fiddle leaf fig': {
      optimalMin: 400, optimalMax: 1000,
      acceptableMin: 300, acceptableMax: 1200,
      tolerableMin: 200, tolerableMax: 1500
    },
    'monstera': {
      optimalMin: 300, optimalMax: 900,
      acceptableMin: 200, acceptableMax: 1100,
      tolerableMin: 100, tolerableMax: 1300
    },
    'pothos': {
      optimalMin: 200, optimalMax: 700,
      acceptableMin: 100, acceptableMax: 900,
      tolerableMin: 50, tolerableMax: 1100
    },
    'succulent': {
      optimalMin: 500, optimalMax: 1000,
      acceptableMin: 300, acceptableMax: 1200,
      tolerableMin: 200, tolerableMax: 1500
    }
  };
  
  return preferences[species.toLowerCase()] || preferences['snake plant'];
}

/**
 * Get temperature preferences for different plant species
 * @param {string} species - Plant species
 * @returns {Object} Temperature preference ranges
 */
function getTemperaturePreferences(species) {
  const preferences = {
    'snake plant': {
      optimalMin: 65, optimalMax: 85,
      acceptableMin: 60, acceptableMax: 90,
      tolerableMin: 55, tolerableMax: 95
    },
    'fiddle leaf fig': {
      optimalMin: 65, optimalMax: 75,
      acceptableMin: 60, acceptableMax: 80,
      tolerableMin: 55, tolerableMax: 85
    },
    'monstera': {
      optimalMin: 68, optimalMax: 86,
      acceptableMin: 65, acceptableMax: 90,
      tolerableMin: 60, tolerableMax: 95
    },
    'pothos': {
      optimalMin: 60, optimalMax: 85,
      acceptableMin: 55, acceptableMax: 90,
      tolerableMin: 50, tolerableMax: 95
    },
    'succulent': {
      optimalMin: 60, optimalMax: 90,
      acceptableMin: 55, acceptableMax: 95,
      tolerableMin: 50, tolerableMax: 100
    }
  };
  
  return preferences[species.toLowerCase()] || preferences['snake plant'];
}

/**
 * Get humidity preferences for different plant species
 * @param {string} species - Plant species
 * @returns {Object} Humidity preference ranges
 */
function getHumidityPreferences(species) {
  const preferences = {
    'snake plant': {
      optimalMin: 30, optimalMax: 50,
      acceptableMin: 20, acceptableMax: 60,
      tolerableMin: 15, tolerableMax: 70
    },
    'fiddle leaf fig': {
      optimalMin: 50, optimalMax: 70,
      acceptableMin: 40, acceptableMax: 80,
      tolerableMin: 30, tolerableMax: 90
    },
    'monstera': {
      optimalMin: 60, optimalMax: 80,
      acceptableMin: 50, acceptableMax: 85,
      tolerableMin: 40, tolerableMax: 90
    },
    'pothos': {
      optimalMin: 40, optimalMax: 60,
      acceptableMin: 30, acceptableMax: 70,
      tolerableMin: 20, tolerableMax: 80
    },
    'succulent': {
      optimalMin: 20, optimalMax: 40,
      acceptableMin: 15, acceptableMax: 50,
      tolerableMin: 10, tolerableMax: 60
    }
  };
  
  return preferences[species.toLowerCase()] || preferences['snake plant'];
}

/**
 * Get health status based on score
 * @param {number} healthScore - Health score (0-1)
 * @returns {Object} Health status information
 */
function getHealthStatus(healthScore) {
  if (healthScore >= 0.9) {
    return {
      status: 'excellent',
      message: 'Your plant is thriving! 🌟',
      color: '#10B981',
      emoji: '🌟'
    };
  } else if (healthScore >= 0.7) {
    return {
      status: 'good',
      message: 'Your plant is doing well! 😊',
      color: '#34D399',
      emoji: '😊'
    };
  } else if (healthScore >= 0.5) {
    return {
      status: 'fair',
      message: 'Your plant needs some attention 📝',
      color: '#FBBF24',
      emoji: '📝'
    };
  } else if (healthScore >= 0.3) {
    return {
      status: 'poor',
      message: 'Your plant needs help! 🆘',
      color: '#F59E0B',
      emoji: '🆘'
    };
  } else {
    return {
      status: 'critical',
      message: 'Your plant needs immediate attention! 🚨',
      color: '#EF4444',
      emoji: '🚨'
    };
  }
}

module.exports = {
  calculateHealthScore,
  calculateMoistureScore,
  calculateLightScore,
  calculateTemperatureScore,
  calculateHumidityScore,
  calculateCareScore,
  getHealthStatus
};
