/**
 * Plant Care Database Search Utility
 * Searches through the fast_plant_care_data.json for matching plants
 */

const fs = require('fs');
const path = require('path');

let plantCareData = null;

/**
 * Load plant care data from JSON file
 */
function loadPlantCareData() {
  if (plantCareData) return plantCareData;
  
  try {
    const dataPath = path.join(__dirname, '../fast_plant_care_data.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    plantCareData = JSON.parse(rawData);
    console.log(`✅ Loaded ${plantCareData.length} plant care records`);
    return plantCareData;
  } catch (error) {
    console.error('Error loading plant care data:', error);
    return [];
  }
}

/**
 * Search for plant care information by name
 * @param {string} plantName - Name of the plant to search for
 * @returns {Object|null} Plant care information or null if not found
 */
function searchPlantCare(plantName) {
  const data = loadPlantCareData();
  if (!data || data.length === 0) return null;

  const searchName = plantName.toLowerCase().trim();
  
  // Exact match first
  let match = data.find(plant => 
    plant.name.toLowerCase() === searchName
  );
  
  if (match) {
    return {
      ...match,
      matchType: 'exact',
      confidence: 1.0
    };
  }
  
  // Partial match
  match = data.find(plant => 
    plant.name.toLowerCase().includes(searchName) ||
    searchName.includes(plant.name.toLowerCase())
  );
  
  if (match) {
    return {
      ...match,
      matchType: 'partial',
      confidence: 0.8
    };
  }
  
  // Fuzzy match - check for common plant name variations
  const commonNames = {
    'snake plant': ['sansevieria', 'mother-in-law tongue'],
    'monstera': ['swiss cheese plant', 'split leaf philodendron'],
    'spider plant': ['chlorophytum', 'airplane plant'],
    'pothos': ['devil\'s ivy', 'golden pothos'],
    'fiddle leaf fig': ['ficus lyrata'],
    'rubber plant': ['ficus elastica'],
    'peace lily': ['spathiphyllum'],
    'aloe vera': ['aloe'],
    'jade plant': ['crassula ovata', 'money tree'],
    'philodendron': ['heartleaf philodendron']
  };
  
  for (const [key, variations] of Object.entries(commonNames)) {
    if (variations.some(variation => searchName.includes(variation))) {
      match = data.find(plant => plant.name.toLowerCase().includes(key));
      if (match) {
        return {
          ...match,
          matchType: 'fuzzy',
          confidence: 0.7
        };
      }
    }
  }
  
  return null;
}

/**
 * Get care tips for a plant
 * @param {string} plantName - Name of the plant
 * @returns {Object} Care tips and information
 */
function getPlantCareTips(plantName) {
  const careData = searchPlantCare(plantName);
  
  if (!careData) {
    return {
      found: false,
      message: `No specific care information found for "${plantName}"`,
      generalTips: [
        'Water when top 2 inches of soil are dry',
        'Provide bright, indirect light',
        'Use well-draining soil',
        'Check for pests regularly'
      ]
    };
  }
  
  return {
    found: true,
    plantName: careData.name,
    matchType: careData.matchType,
    confidence: careData.confidence,
    careInfo: {
      watering: careData.watering,
      light: careData.light,
      soil: careData.soil,
      temperature: careData.temperature,
      humidity: careData.humidity,
      fertilizer: careData.fertilizer,
      pruning: careData.pruning,
      propagation: careData.propagation,
      commonProblems: careData.common_problems,
      tips: careData.tips,
      difficulty: careData.difficulty,
      toxicity: careData.toxicity,
      category: careData.category
    },
    quickTips: [
      careData.watering,
      careData.light,
      careData.tips
    ].filter(tip => tip && tip.trim())
  };
}

/**
 * Get all available plant names for autocomplete
 * @returns {Array} List of plant names
 */
function getAllPlantNames() {
  const data = loadPlantCareData();
  return data ? data.map(plant => plant.name) : [];
}

/**
 * Get plants by category
 * @param {string} category - Plant category (e.g., 'Houseplant', 'Succulent')
 * @returns {Array} Plants in that category
 */
function getPlantsByCategory(category) {
  const data = loadPlantCareData();
  if (!data) return [];
  
  return data.filter(plant => 
    plant.category && plant.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Get care summary for display
 * @param {string} plantName - Name of the plant
 * @returns {string} Formatted care summary
 */
function getCareSummary(plantName) {
  const tips = getPlantCareTips(plantName);
  
  if (!tips.found) {
    return `No specific care information available for ${plantName}. Use general plant care guidelines.`;
  }
  
  const { careInfo } = tips;
  return `${careInfo.watering} ${careInfo.light} ${careInfo.tips}`;
}

module.exports = {
  searchPlantCare,
  getPlantCareTips,
  getAllPlantNames,
  getPlantsByCategory,
  getCareSummary,
  loadPlantCareData
};
