/**
 * Plant Health Score Calculator
 * Calculates overall plant health (0-100%) from sensor readings
 */

/**
 * Clamps a value between min and max bounds
 * @param {number} value - The value to clamp
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} Clamped value
 */
function clampValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Normalizes a sensor reading into a score between 0 and 1
 * @param {number} value - The sensor reading
 * @param {number} idealMin - Minimum of ideal range
 * @param {number} idealMax - Maximum of ideal range
 * @param {number} absoluteMin - Absolute minimum value
 * @param {number} absoluteMax - Absolute maximum value
 * @returns {number} Normalized score between 0 and 1
 */
function normalizeSensorReading(value, idealMin, idealMax, absoluteMin, absoluteMax) {
  // Clamp value to absolute bounds
  const clampedValue = clampValue(value, absoluteMin, absoluteMax);
  
  // If value is outside absolute bounds, return 0
  if (clampedValue <= absoluteMin || clampedValue >= absoluteMax) {
    return 0;
  }
  
  // If value is in ideal range, return 1
  if (clampedValue >= idealMin && clampedValue <= idealMax) {
    return 1;
  }
  
  // Linear scaling for values between ideal and absolute ranges
  if (clampedValue < idealMin) {
    // Between absoluteMin and idealMin
    const range = idealMin - absoluteMin;
    const position = clampedValue - absoluteMin;
    return Math.max(0, position / range);
  } else {
    // Between idealMax and absoluteMax
    const range = absoluteMax - idealMax;
    const position = absoluteMax - clampedValue;
    return Math.max(0, position / range);
  }
}

/**
 * Calculates plant health score from sensor readings
 * @param {Object} sensors - Sensor readings object
 * @param {number} sensors.soil_temp - Soil temperature in °C
 * @param {number} sensors.air_humidity - Air humidity percentage
 * @param {number} sensors.soil_moisture - Soil moisture percentage
 * @param {number} sensors.light_lux - Light intensity in lux
 * @returns {Object} Health score and status
 */
function calculatePlantHealth(sensors) {
  const {
    soil_temp,
    air_humidity,
    soil_moisture,
    light_lux
  } = sensors;

  // Validate input parameters
  if (typeof soil_temp !== 'number' || typeof air_humidity !== 'number' || 
      typeof soil_moisture !== 'number' || typeof light_lux !== 'number') {
    throw new Error('All sensor readings must be numbers');
  }

  // Define ideal and absolute ranges for each metric
  const ranges = {
    soil_temp: {
      ideal: [18, 25],
      absolute: [10, 35]
    },
    air_humidity: {
      ideal: [40, 70],
      absolute: [20, 90]
    },
    soil_moisture: {
      ideal: [40, 60],
      absolute: [20, 90]
    },
    light_lux: {
      ideal: [10000, 40000],
      absolute: [5000, 80000]
    }
  };

  // Clamp sensor values to absolute bounds
  const clampedSoilTemp = clampValue(soil_temp, ranges.soil_temp.absolute[0], ranges.soil_temp.absolute[1]);
  const clampedAirHumidity = clampValue(air_humidity, ranges.air_humidity.absolute[0], ranges.air_humidity.absolute[1]);
  const clampedSoilMoisture = clampValue(soil_moisture, ranges.soil_moisture.absolute[0], ranges.soil_moisture.absolute[1]);
  const clampedLightLux = clampValue(light_lux, ranges.light_lux.absolute[0], ranges.light_lux.absolute[1]);

  // Calculate normalized scores for each sensor
  const soilTempScore = normalizeSensorReading(
    clampedSoilTemp,
    ranges.soil_temp.ideal[0],
    ranges.soil_temp.ideal[1],
    ranges.soil_temp.absolute[0],
    ranges.soil_temp.absolute[1]
  );

  const humidityScore = normalizeSensorReading(
    clampedAirHumidity,
    ranges.air_humidity.ideal[0],
    ranges.air_humidity.ideal[1],
    ranges.air_humidity.absolute[0],
    ranges.air_humidity.absolute[1]
  );

  const moistureScore = normalizeSensorReading(
    clampedSoilMoisture,
    ranges.soil_moisture.ideal[0],
    ranges.soil_moisture.ideal[1],
    ranges.soil_moisture.absolute[0],
    ranges.soil_moisture.absolute[1]
  );

  const lightScore = normalizeSensorReading(
    clampedLightLux,
    ranges.light_lux.ideal[0],
    ranges.light_lux.ideal[1],
    ranges.light_lux.absolute[0],
    ranges.light_lux.absolute[1]
  );

  // Define weights for each metric
  const weights = {
    soil_moisture: 0.35,
    light: 0.25,
    air_humidity: 0.20,
    soil_temp: 0.20
  };

  // Calculate weighted overall score
  const overallScore = (
    moistureScore * weights.soil_moisture +
    lightScore * weights.light +
    humidityScore * weights.air_humidity +
    soilTempScore * weights.soil_temp
  ) * 100;

  // Round to 1 decimal place
  const healthScore = Math.round(overallScore * 10) / 10;

  // Determine status based on score
  let status;
  if (healthScore >= 80) {
    status = "Healthy 🌱";
  } else if (healthScore >= 60) {
    status = "Okay 🌤️";
  } else if (healthScore >= 40) {
    status = "Weak 🌧️";
  } else {
    status = "Unhealthy ☠️";
  }

  return {
    health_score: healthScore,
    status: status,
    breakdown: {
      soil_temp: {
        value: clampedSoilTemp,
        score: Math.round(soilTempScore * 100) / 100,
        weight: weights.soil_temp
      },
      air_humidity: {
        value: clampedAirHumidity,
        score: Math.round(humidityScore * 100) / 100,
        weight: weights.air_humidity
      },
      soil_moisture: {
        value: clampedSoilMoisture,
        score: Math.round(moistureScore * 100) / 100,
        weight: weights.soil_moisture
      },
      light_lux: {
        value: clampedLightLux,
        score: Math.round(lightScore * 100) / 100,
        weight: weights.light
      }
    }
  };
}

/**
 * Express.js endpoint handler for health calculation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function healthCalculationEndpoint(req, res) {
  try {
    const { soil_temp, air_humidity, soil_moisture, light_lux } = req.body;
    
    const result = calculatePlantHealth({
      soil_temp,
      air_humidity,
      soil_moisture,
      light_lux
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

// Test cases
if (require.main === module) {
  console.log('🧪 Testing Plant Health Calculator\n');
  
  const testCases = [
    {
      name: "Perfect Conditions",
      input: { soil_temp: 23, air_humidity: 55, soil_moisture: 50, light_lux: 20000 },
      expected: "Should be very high score"
    },
    {
      name: "Good Conditions",
      input: { soil_temp: 22, air_humidity: 60, soil_moisture: 45, light_lux: 25000 },
      expected: "Should be high score"
    },
    {
      name: "Poor Soil Moisture",
      input: { soil_temp: 20, air_humidity: 50, soil_moisture: 15, light_lux: 30000 },
      expected: "Should be lower due to moisture"
    },
    {
      name: "Dangerous Conditions",
      input: { soil_temp: 5, air_humidity: 10, soil_moisture: 5, light_lux: 1000 },
      expected: "Should be very low"
    },
    {
      name: "Edge Case - Just Outside Ideal",
      input: { soil_temp: 17, air_humidity: 39, soil_moisture: 39, light_lux: 9500 },
      expected: "Should be moderate"
    },
    {
      name: "Out of Bounds Values (Should be Clamped)",
      input: { soil_temp: 50, air_humidity: 150, soil_moisture: 200, light_lux: 100000 },
      expected: "Should be clamped to absolute bounds"
    }
  ];

  testCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: ${testCase.name}`);
    console.log(`Input:`, testCase.input);
    
    try {
      const result = calculatePlantHealth(testCase.input);
      console.log(`Output:`, result);
      console.log(`Expected: ${testCase.expected}`);
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
    console.log('---\n');
  });
}

module.exports = {
  calculatePlantHealth,
  healthCalculationEndpoint,
  normalizeSensorReading,
  clampValue
};