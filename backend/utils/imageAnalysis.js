/**
 * Plant image analysis utilities
 * Real OpenAI Vision API integration for plant identification and health analysis
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const OpenAI = require('openai');
const sharp = require('sharp');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your_openai_api_key_here'
});

// Simple in-memory cache for analysis results
const analysisCache = new Map();

/**
 * Optimize image for faster API processing
 * Reduces file size while maintaining quality for plant identification
 */
async function optimizeImageForAPI(imageBuffer) {
  try {
    return await sharp(imageBuffer)
      .resize(1024, 1024, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ 
        quality: 85,
        progressive: true 
      })
      .toBuffer();
  } catch (error) {
    console.log('⚠️ Image optimization failed, using original:', error.message);
    return imageBuffer; // Fallback to original
  }
}

/**
 * Analyze plant image for health issues and growth stage
 * @param {string} imagePath - Path to the uploaded image
 * @param {string} plantId - Plant ID
 * @returns {Object} Analysis results
 */
async function analyzePlantImage(imagePath, plantId) {
  try {
    console.log(`🔍 Analyzing plant image with OpenAI Vision: ${imagePath}`);
    
    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Create cache key based on image hash
    const imageHash = crypto.createHash('md5').update(imageBuffer).digest('hex');
    const cacheKey = `${imageHash}_${plantId}`;
    
    // Check cache first
    if (analysisCache.has(cacheKey)) {
      console.log('⚡ Using cached analysis result');
      return analysisCache.get(cacheKey);
    }
    
    // Optimize image size for faster processing
    const optimizedBuffer = await optimizeImageForAPI(imageBuffer);
    const base64Image = optimizedBuffer.toString('base64');
    
    // Create OpenAI Vision API request with optimized settings
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 800, // Reduced from 1000 for faster response
      temperature: 0.2, // Lower temperature for more consistent, faster responses
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this plant image and provide detailed information about:
1. Plant species identification (if possible)
2. Overall health assessment (score 0-1)
3. Visible issues or problems
4. Growth stage (seedling, young, mature, flowering, etc.)
5. Specific care recommendations
6. Confidence level in the analysis

Please respond in JSON format with this structure:
{
  "species": "plant name or 'unknown'",
  "healthScore": 0.0-1.0,
  "growthStage": "stage",
  "issues": [{"type": "issue_type", "severity": "low/medium/high", "description": "details"}],
  "recommendations": [{"type": "care_type", "priority": "low/medium/high", "message": "advice", "action": "specific action"}],
  "confidence": 0.0-1.0,
  "analysisNotes": "additional observations"
}`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    });
    
    // Parse the AI response
    const aiResponse = response.choices[0].message.content;
    console.log('🤖 OpenAI Vision Response:', aiResponse);
    
    let analysis;
    try {
      // Try to parse JSON response - handle markdown code blocks
      let jsonString = aiResponse;
      if (aiResponse.includes('```json')) {
        jsonString = aiResponse.match(/```json\s*([\s\S]*?)\s*```/)?.[1] || aiResponse;
      }
      analysis = JSON.parse(jsonString);
    } catch (parseError) {
      console.log('⚠️ Could not parse JSON, extracting structured data...');
      console.log('Raw response:', aiResponse);
      // Fallback: extract information from text response
      analysis = extractAnalysisFromText(aiResponse);
    }
    
    // Ensure required fields exist
    analysis = {
      species: analysis.species || 'Unknown Plant',
      healthScore: parseFloat(analysis.healthScore) || 0.7,
      growthStage: analysis.growthStage || 'mature',
      issues: analysis.issues || [],
      recommendations: analysis.recommendations || [],
      confidence: parseFloat(analysis.confidence) || 0.8,
      analysisNotes: analysis.analysisNotes || '',
      analysisDate: new Date().toISOString(),
      plantId: plantId,
      aiModel: 'gpt-4o'
    };
    
    console.log(`✅ OpenAI Vision analysis complete - Species: ${analysis.species}, Health Score: ${analysis.healthScore.toFixed(2)}`);
    
    // Cache the result for future use
    analysisCache.set(cacheKey, analysis);
    
    // Limit cache size to prevent memory issues
    if (analysisCache.size > 100) {
      const firstKey = analysisCache.keys().next().value;
      analysisCache.delete(firstKey);
    }
    
    return analysis;
    
  } catch (error) {
    console.error('Error analyzing plant image with OpenAI Vision:', error);
    
    // If OpenAI fails, fall back to simulated analysis
    console.log('🔄 Falling back to simulated analysis...');
    return getFallbackAnalysis(plantId);
  }
}

/**
 * Extract analysis data from text response when JSON parsing fails
 * @param {string} textResponse - Raw text response from OpenAI
 * @returns {Object} Structured analysis data
 */
function extractAnalysisFromText(textResponse) {
  const analysis = {
    species: 'Unknown Plant',
    healthScore: 0.7,
    growthStage: 'mature',
    issues: [],
    recommendations: [],
    confidence: 0.8,
    analysisNotes: textResponse
  };
  
  // Try to extract species from JSON-like structure
  const speciesMatch = textResponse.match(/"species":\s*"([^"]+)"/i);
  if (speciesMatch) {
    analysis.species = speciesMatch[1].trim();
  } else {
    // Fallback: try to extract species from text
    const speciesMatch2 = textResponse.match(/(?:species|plant|type)[:\s]+([^,\n]+)/i);
    if (speciesMatch2) {
      analysis.species = speciesMatch2[1].trim();
    }
  }
  
  // Try to extract health score from JSON-like structure
  const healthMatch = textResponse.match(/"healthScore":\s*([0-9.]+)/i);
  if (healthMatch) {
    analysis.healthScore = parseFloat(healthMatch[1]);
  } else {
    // Fallback: try to extract health score from text
    const healthMatch2 = textResponse.match(/health[^0-9]*([0-9.]+)/i);
    if (healthMatch2) {
      analysis.healthScore = parseFloat(healthMatch2[1]);
    }
  }
  
  // Try to extract growth stage from JSON-like structure
  const stageMatch = textResponse.match(/"growthStage":\s*"([^"]+)"/i);
  if (stageMatch) {
    analysis.growthStage = stageMatch[1].trim().toLowerCase();
  } else {
    // Fallback: try to extract growth stage from text
    const stageMatch2 = textResponse.match(/(?:stage|growth)[:\s]+([^,\n]+)/i);
    if (stageMatch2) {
      analysis.growthStage = stageMatch2[1].trim().toLowerCase();
    }
  }
  
  // Try to extract confidence from JSON-like structure
  const confidenceMatch = textResponse.match(/"confidence":\s*([0-9.]+)/i);
  if (confidenceMatch) {
    analysis.confidence = parseFloat(confidenceMatch[1]);
  }
  
  return analysis;
}

/**
 * Get random growth stage for simulation
 * @returns {string} Growth stage
 */
function getRandomGrowthStage() {
  const stages = ['seedling', 'young', 'mature', 'flowering', 'dormant'];
  return stages[Math.floor(Math.random() * stages.length)];
}

/**
 * Detect simulated plant issues
 * @returns {Array} Array of detected issues
 */
function detectSimulatedIssues() {
  const issues = [];
  const possibleIssues = [
    {
      type: 'yellow_leaves',
      severity: 'low',
      description: 'Some yellowing leaves detected',
      confidence: 0.8
    },
    {
      type: 'brown_tips',
      severity: 'medium',
      description: 'Brown tips on leaves',
      confidence: 0.7
    },
    {
      type: 'wilting',
      severity: 'high',
      description: 'Leaves appear wilted',
      confidence: 0.9
    },
    {
      type: 'pest_damage',
      severity: 'medium',
      description: 'Possible pest damage',
      confidence: 0.6
    },
    {
      type: 'nutrient_deficiency',
      severity: 'low',
      description: 'Possible nutrient deficiency',
      confidence: 0.5
    }
  ];
  
  // Randomly select 0-2 issues
  const numIssues = Math.floor(Math.random() * 3);
  const selectedIssues = [];
  
  for (let i = 0; i < numIssues; i++) {
    const randomIssue = possibleIssues[Math.floor(Math.random() * possibleIssues.length)];
    if (!selectedIssues.find(issue => issue.type === randomIssue.type)) {
      selectedIssues.push(randomIssue);
    }
  }
  
  return selectedIssues;
}

/**
 * Generate recommendations based on detected issues
 * @param {Array} issues - Detected plant issues
 * @returns {Array} Array of recommendations
 */
function generateRecommendations(issues) {
  const recommendations = [];
  
  issues.forEach(issue => {
    switch (issue.type) {
      case 'yellow_leaves':
        recommendations.push({
          type: 'watering',
          priority: 'medium',
          message: 'Yellow leaves may indicate overwatering',
          action: 'Check soil moisture and reduce watering frequency',
          emoji: '💧'
        });
        break;
        
      case 'brown_tips':
        recommendations.push({
          type: 'humidity',
          priority: 'low',
          message: 'Brown tips suggest low humidity',
          action: 'Increase humidity with misting or humidifier',
          emoji: '💨'
        });
        break;
        
      case 'wilting':
        recommendations.push({
          type: 'watering',
          priority: 'high',
          message: 'Wilting indicates urgent watering need',
          action: 'Water immediately and check soil drainage',
          emoji: '🚨'
        });
        break;
        
      case 'pest_damage':
        recommendations.push({
          type: 'pest_control',
          priority: 'high',
          message: 'Possible pest infestation detected',
          action: 'Inspect leaves closely and treat with appropriate pest control',
          emoji: '🐛'
        });
        break;
        
      case 'nutrient_deficiency':
        recommendations.push({
          type: 'fertilizing',
          priority: 'medium',
          message: 'Plant may need nutrients',
          action: 'Consider fertilizing with balanced plant food',
          emoji: '🌱'
        });
        break;
    }
  });
  
  // Add general recommendations if no specific issues
  if (recommendations.length === 0) {
    recommendations.push({
      type: 'general',
      priority: 'low',
      message: 'Plant appears healthy',
      action: 'Continue current care routine',
      emoji: '✅'
    });
  }
  
  return recommendations;
}

/**
 * Get fallback analysis when image processing fails
 * @param {string} plantId - Plant ID
 * @returns {Object} Fallback analysis
 */
function getFallbackAnalysis(plantId) {
  return {
    species: 'Unknown Plant',
    healthScore: 0.7,
    growthStage: 'mature',
    issues: [],
    recommendations: [
      {
        type: 'general',
        priority: 'low',
        message: 'Unable to analyze image with AI',
        action: 'Please try uploading a clearer photo or check your OpenAI API key',
        emoji: '📷'
      }
    ],
    confidence: 0.3,
    analysisDate: new Date().toISOString(),
    plantId: plantId,
    aiModel: 'fallback',
    note: 'Analysis failed - using fallback data'
  };
}

/**
 * Extract plant features from image (simulated)
 * @param {string} imagePath - Path to image
 * @returns {Object} Extracted features
 */
async function extractPlantFeatures(imagePath) {
  try {
    // Simulate feature extraction
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      leafCount: Math.floor(Math.random() * 20) + 10,
      leafSize: Math.random() * 0.5 + 0.5, // 0.5-1.0
      colorVariance: Math.random() * 0.3 + 0.1, // 0.1-0.4
      growthPattern: ['bushy', 'tall', 'spreading'][Math.floor(Math.random() * 3)],
      overallVigor: Math.random() * 0.4 + 0.6 // 0.6-1.0
    };
  } catch (error) {
    console.error('Error extracting plant features:', error);
    return null;
  }
}

/**
 * Compare plant images for growth tracking
 * @param {string} currentImagePath - Current image path
 * @param {string} previousImagePath - Previous image path
 * @returns {Object} Growth comparison
 */
async function comparePlantGrowth(currentImagePath, previousImagePath) {
  try {
    // Simulate growth comparison
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const growthChange = {
      sizeChange: (Math.random() - 0.5) * 0.2, // -0.1 to 0.1
      leafGrowth: Math.floor(Math.random() * 5), // 0-4 new leaves
      healthImprovement: Math.random() * 0.3 - 0.1, // -0.1 to 0.2
      timeElapsed: Math.floor(Math.random() * 30) + 7, // 7-36 days
      overallTrend: ['improving', 'stable', 'declining'][Math.floor(Math.random() * 3)]
    };
    
    return growthChange;
  } catch (error) {
    console.error('Error comparing plant growth:', error);
    return null;
  }
}

/**
 * Generate plant care report based on image analysis
 * @param {Object} analysis - Image analysis results
 * @param {Object} sensorData - Current sensor data
 * @returns {Object} Comprehensive care report
 */
function generateCareReport(analysis, sensorData) {
  const report = {
    summary: {
      overallHealth: analysis.healthScore > 0.8 ? 'Excellent' : 
                   analysis.healthScore > 0.6 ? 'Good' : 
                   analysis.healthScore > 0.4 ? 'Fair' : 'Needs Attention',
      confidence: analysis.confidence,
      analysisDate: analysis.analysisDate
    },
    issues: analysis.issues,
    recommendations: analysis.recommendations,
    sensorCorrelation: correlateWithSensors(analysis, sensorData),
    nextSteps: generateNextSteps(analysis),
    followUp: {
      suggestedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      priority: analysis.healthScore < 0.6 ? 'high' : 'normal'
    }
  };
  
  return report;
}

/**
 * Correlate image analysis with sensor data
 * @param {Object} analysis - Image analysis
 * @param {Object} sensorData - Sensor readings
 * @returns {Object} Correlation insights
 */
function correlateWithSensors(analysis, sensorData) {
  const correlations = [];
  
  if (sensorData && analysis.issues) {
    analysis.issues.forEach(issue => {
      if (issue.type === 'yellow_leaves' && sensorData.moisture > 80) {
        correlations.push({
          issue: 'Yellow leaves',
          sensor: 'High moisture detected',
          correlation: 'Likely overwatering',
          confidence: 0.8
        });
      }
      
      if (issue.type === 'wilting' && sensorData.moisture < 30) {
        correlations.push({
          issue: 'Wilting',
          sensor: 'Low moisture detected',
          correlation: 'Likely underwatering',
          confidence: 0.9
        });
      }
    });
  }
  
  return {
    correlations: correlations,
    overallMatch: correlations.length > 0 ? 'high' : 'low'
  };
}

/**
 * Generate next steps based on analysis
 * @param {Object} analysis - Image analysis results
 * @returns {Array} Next steps
 */
function generateNextSteps(analysis) {
  const steps = [];
  
  if (analysis.healthScore < 0.6) {
    steps.push({
      priority: 'high',
      action: 'Immediate care needed',
      timeline: 'Today',
      description: 'Plant needs immediate attention based on visual analysis'
    });
  }
  
  if (analysis.issues.length > 0) {
    steps.push({
      priority: 'medium',
      action: 'Address detected issues',
      timeline: 'Within 3 days',
      description: 'Focus on the specific issues identified in the analysis'
    });
  }
  
  steps.push({
    priority: 'low',
    action: 'Continue monitoring',
    timeline: 'Ongoing',
    description: 'Regular care and observation'
  });
  
  return steps;
}

module.exports = {
  analyzePlantImage,
  extractPlantFeatures,
  comparePlantGrowth,
  generateCareReport
};
