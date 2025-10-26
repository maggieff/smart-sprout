const express = require('express');
const { getPlantCareTips, searchPlantCare, getAllPlantNames } = require('../utils/plantCareSearch');

const router = express.Router();

// POST /api/plant-care/search - Search for plant care information
router.post('/search', async (req, res) => {
  try {
    const { plantName } = req.body;
    
    if (!plantName) {
      return res.status(400).json({ 
        error: 'Plant name is required' 
      });
    }

    console.log(`🔍 Searching for plant care info: ${plantName}`);

    // Get plant care tips
    const careTips = getPlantCareTips(plantName);
    
    if (!careTips.found) {
      return res.json({
        success: true,
        found: false,
        plantName: plantName,
        message: careTips.message,
        generalTips: careTips.generalTips,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`✅ Found care info for ${careTips.plantName} (${careTips.matchType}, confidence: ${careTips.confidence})`);

    res.json({
      success: true,
      found: true,
      plantName: careTips.plantName,
      matchType: careTips.matchType,
      confidence: careTips.confidence,
      careInfo: careTips.careInfo,
      quickTips: careTips.quickTips,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error searching plant care:', error);
    res.status(500).json({ 
      error: 'Failed to search plant care information',
      details: error.message 
    });
  }
});

// GET /api/plant-care/plants - Get all available plant names
router.get('/plants', async (req, res) => {
  try {
    const plantNames = getAllPlantNames();
    
    res.json({
      success: true,
      plants: plantNames,
      count: plantNames.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting plant names:', error);
    res.status(500).json({ 
      error: 'Failed to get plant names',
      details: error.message 
    });
  }
});

// GET /api/plant-care/search/:plantName - Get care info by plant name (GET method)
router.get('/search/:plantName', async (req, res) => {
  try {
    const { plantName } = req.params;
    
    console.log(`🔍 Getting care info for: ${plantName}`);

    const careTips = getPlantCareTips(plantName);
    
    if (!careTips.found) {
      return res.json({
        success: true,
        found: false,
        plantName: plantName,
        message: careTips.message,
        generalTips: careTips.generalTips,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      found: true,
      plantName: careTips.plantName,
      matchType: careTips.matchType,
      confidence: careTips.confidence,
      careInfo: careTips.careInfo,
      quickTips: careTips.quickTips,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting plant care:', error);
    res.status(500).json({ 
      error: 'Failed to get plant care information',
      details: error.message 
    });
  }
});

module.exports = router;
