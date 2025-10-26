import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Longer timeout for AI requests
  headers: {
    'Content-Type': 'application/json',
  },
});

export const aiService = {
  /**
   * Ask a question to the AI assistant
   */
  async askQuestion({ question, plantId, species, sensorData }) {
    try {
      const response = await api.post('/ask-ai', {
        question,
        plantId,
        species,
        sensorData,
        context: 'plant_care'
      });
      return response.data;
    } catch (error) {
      console.error('Error asking AI question:', error);
      
      // Return fallback response
      return {
        answer: this.getFallbackResponse(question, species),
        confidence: 0.3,
        sources: ['fallback_knowledge'],
        recommendations: [],
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * Get suggested questions
   */
  async getSuggestions(species = null) {
    try {
      const response = await api.get(`/ask-ai/suggestions?species=${species || ''}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return {
        suggestions: this.getDefaultSuggestions(),
        species: species || 'general'
      };
    }
  },

  /**
   * Get plant care recommendations based on sensor data
   */
  async getCareRecommendations(plantId, sensorData) {
    try {
      const response = await api.post('/ask-ai', {
        question: "What care recommendations do you have based on my current sensor readings?",
        plantId,
        sensorData,
        context: 'recommendations'
      });
      return response.data;
    } catch (error) {
      console.error('Error getting care recommendations:', error);
      return {
        answer: this.getFallbackRecommendations(sensorData),
        confidence: 0.3,
        sources: ['fallback_knowledge'],
        recommendations: [],
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * Analyze plant health based on sensor data
   */
  async analyzePlantHealth(plantId, sensorData) {
    try {
      const response = await api.post('/ask-ai', {
        question: "Analyze my plant's health based on the current sensor readings and provide insights.",
        plantId,
        sensorData,
        context: 'health_analysis'
      });
      return response.data;
    } catch (error) {
      console.error('Error analyzing plant health:', error);
      return {
        answer: this.getFallbackHealthAnalysis(sensorData),
        confidence: 0.3,
        sources: ['fallback_knowledge'],
        recommendations: [],
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * Get fallback response when AI is unavailable
   */
  getFallbackResponse(question, species) {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('water') || lowerQuestion.includes('watering')) {
      return `For your ${species || 'plant'}, water when the top 2 inches of soil are dry. Stick your finger in the soil to check moisture levels. Water thoroughly until water drains from the bottom of the pot.`;
    }
    
    if (lowerQuestion.includes('light') || lowerQuestion.includes('sunlight')) {
      return `Your ${species || 'plant'} prefers bright, indirect light. Avoid direct sunlight which can burn the leaves. A spot near a bright window with filtered light is ideal.`;
    }
    
    if (lowerQuestion.includes('yellow') || lowerQuestion.includes('leaves')) {
      return `Yellow leaves can indicate several issues: overwatering, underwatering, or nutrient deficiency. Check the soil moisture and adjust your watering schedule accordingly. Remove yellow leaves to help the plant focus energy on healthy growth.`;
    }
    
    if (lowerQuestion.includes('brown') || lowerQuestion.includes('tips')) {
      return `Brown tips often indicate low humidity or over-fertilization. Try misting the plant or using a humidifier. If you've been fertilizing recently, consider reducing the frequency.`;
    }
    
    if (lowerQuestion.includes('drooping') || lowerQuestion.includes('wilting')) {
      return `Drooping or wilting usually indicates the plant needs water. Check the soil moisture and water if dry. However, if the soil is wet and the plant is still drooping, it might be overwatered.`;
    }
    
    if (lowerQuestion.includes('fertiliz') || lowerQuestion.includes('nutrient')) {
      return `Fertilize your ${species || 'plant'} during the growing season (spring and summer) with a balanced liquid fertilizer diluted to half strength. Avoid fertilizing in winter when growth slows.`;
    }
    
    if (lowerQuestion.includes('repot') || lowerQuestion.includes('pot')) {
      return `Repot your ${species || 'plant'} when roots are visible at drainage holes or the plant becomes root-bound. Use a pot one size larger with fresh, well-draining soil.`;
    }
    
    return `I'd be happy to help with your ${species || 'plant'} care! For the best advice, please provide more specific details about your plant's current condition and what you'd like to know.`;
  },

  /**
   * Get fallback recommendations based on sensor data
   */
  getFallbackRecommendations(sensorData) {
    const recommendations = [];
    
    if (sensorData?.moisture < 30) {
      recommendations.push('💧 Your plant needs water - soil is quite dry');
    } else if (sensorData?.moisture > 80) {
      recommendations.push('💧 Soil is very wet - hold off on watering for a few days');
    }
    
    if (sensorData?.light < 300) {
      recommendations.push('☀️ Move your plant to a brighter location');
    } else if (sensorData?.light > 1000) {
      recommendations.push('🕶️ Light might be too intense - consider moving away from direct sun');
    }
    
    if (sensorData?.temperature < 60) {
      recommendations.push('❄️ Temperature is quite low - move to a warmer location');
    } else if (sensorData?.temperature > 90) {
      recommendations.push('🔥 Temperature is quite high - move to a cooler location');
    }
    
    if (sensorData?.humidity < 40) {
      recommendations.push('💨 Increase humidity around your plant with misting or a humidifier');
    }
    
    if (recommendations.length === 0) {
      return 'Your plant conditions look good! Continue with your current care routine.';
    }
    
    return `Based on your sensor readings, here are my recommendations:\n\n${recommendations.join('\n')}`;
  },

  /**
   * Get fallback health analysis
   */
  getFallbackHealthAnalysis(sensorData) {
    let healthScore = 0.7; // Base score
    const factors = [];
    
    // Moisture analysis
    if (sensorData?.moisture >= 40 && sensorData?.moisture <= 70) {
      healthScore += 0.1;
      factors.push('✅ Moisture levels are optimal');
    } else if (sensorData?.moisture < 30) {
      healthScore -= 0.2;
      factors.push('⚠️ Soil is too dry - needs watering');
    } else if (sensorData?.moisture > 80) {
      healthScore -= 0.1;
      factors.push('⚠️ Soil is too wet - risk of overwatering');
    }
    
    // Light analysis
    if (sensorData?.light >= 400 && sensorData?.light <= 800) {
      healthScore += 0.1;
      factors.push('✅ Light levels are good');
    } else if (sensorData?.light < 200) {
      healthScore -= 0.15;
      factors.push('⚠️ Light levels are too low');
    } else if (sensorData?.light > 1200) {
      healthScore -= 0.1;
      factors.push('⚠️ Light might be too intense');
    }
    
    // Temperature analysis
    if (sensorData?.temperature >= 65 && sensorData?.temperature <= 80) {
      healthScore += 0.1;
      factors.push('✅ Temperature is ideal');
    } else if (sensorData?.temperature < 60 || sensorData?.temperature > 90) {
      healthScore -= 0.1;
      factors.push('⚠️ Temperature is outside optimal range');
    }
    
    const status = healthScore >= 0.8 ? 'excellent' : 
                  healthScore >= 0.6 ? 'good' : 
                  healthScore >= 0.4 ? 'fair' : 'needs attention';
    
    return `Health Analysis (${Math.round(healthScore * 100)}% - ${status}):\n\n${factors.join('\n')}\n\nOverall, your plant is ${status}. Continue monitoring and adjust care as needed.`;
  },

  /**
   * Ask AI with enhanced plant context and log analysis
   */
  async askAI(question, plantData = null, plantLogs = []) {
    try {
      const response = await api.post('/ask-ai', {
        question,
        plantData,
        plantLogs,
        context: 'plant_care_with_logs'
      });
      return response.data;
    } catch (error) {
      console.error('Error asking AI with logs:', error);
      return {
        success: false,
        error: 'Failed to get AI response',
        response: this.getFallbackResponse(question, plantData?.species)
      };
    }
  },

  /**
   * Analyze plant care patterns from logs
   */
  analyzeCarePatterns(plantLogs) {
    if (!plantLogs || plantLogs.length === 0) {
      return {
        patterns: [],
        insights: "No care logs available for analysis.",
        recommendations: []
      };
    }

    const patterns = [];
    const insights = [];
    const recommendations = [];

    // Analyze watering frequency
    const wateringLogs = plantLogs.filter(log => log.type === 'watering');
    if (wateringLogs.length > 0) {
      const daysBetweenWatering = [];
      for (let i = 1; i < wateringLogs.length; i++) {
        const daysDiff = Math.floor((new Date(wateringLogs[i-1].created_at) - new Date(wateringLogs[i].created_at)) / (1000 * 60 * 60 * 24));
        daysBetweenWatering.push(Math.abs(daysDiff));
      }
      
      if (daysBetweenWatering.length > 0) {
        const avgDays = daysBetweenWatering.reduce((a, b) => a + b, 0) / daysBetweenWatering.length;
        patterns.push(`Watering every ${Math.round(avgDays)} days on average`);
        
        if (avgDays < 3) {
          insights.push("⚠️ Watering very frequently - check if plant needs this much water");
          recommendations.push("Consider checking soil moisture before watering");
        } else if (avgDays > 14) {
          insights.push("💧 Long gaps between watering - plant might be thirsty");
          recommendations.push("Consider watering more frequently");
        }
      }
    }

    // Analyze care activity types
    const activityTypes = {};
    plantLogs.forEach(log => {
      activityTypes[log.type] = (activityTypes[log.type] || 0) + 1;
    });

    const mostCommonActivity = Object.keys(activityTypes).reduce((a, b) => 
      activityTypes[a] > activityTypes[b] ? a : b
    );

    patterns.push(`Most common activity: ${mostCommonActivity} (${activityTypes[mostCommonActivity]} times)`);

    // Check for recent activity
    const recentLogs = plantLogs.filter(log => {
      const logDate = new Date(log.created_at);
      const daysAgo = (new Date() - logDate) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7;
    });

    if (recentLogs.length === 0) {
      insights.push("📅 No recent care activity - plant might need attention");
      recommendations.push("Consider checking on your plant and logging any care activities");
    } else {
      insights.push(`✅ Active care in the last week (${recentLogs.length} activities)`);
    }

    // Analyze mood patterns
    const moodLogs = plantLogs.filter(log => log.mood);
    if (moodLogs.length > 0) {
      const positiveMoods = moodLogs.filter(log => log.mood === 'positive').length;
      const totalMoods = moodLogs.length;
      const positiveRatio = positiveMoods / totalMoods;
      
      if (positiveRatio > 0.8) {
        insights.push("😊 Mostly positive care experiences");
      } else if (positiveRatio < 0.5) {
        insights.push("😟 Some challenges with plant care");
        recommendations.push("Consider adjusting care routine based on what's working");
      }
    }

    return {
      patterns,
      insights,
      recommendations,
      totalLogs: plantLogs.length,
      recentActivity: recentLogs.length
    };
  },

  /**
   * Get default suggestions
   */
  getDefaultSuggestions() {
    return [
      "How often should I water my plant?",
      "What's the best lighting for my plant?",
      "Why are my plant's leaves turning yellow?",
      "How do I know if my plant is healthy?",
      "What should I do about brown leaf tips?",
      "When should I fertilize my plant?",
      "How do I know if my plant needs repotting?",
      "What causes drooping leaves?"
    ];
  }
};

export default aiService;
