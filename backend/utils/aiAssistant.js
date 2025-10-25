/**
 * AI Assistant using OpenAI API for plant care recommendations
 */

const OpenAI = require('openai');
const { searchPlantKnowledge } = require('./plantKnowledgeSearch');

let openai = null;

/**
 * Initialize OpenAI client
 */
function initializeOpenAI() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('⚠️ OpenAI API key not found. Using fallback responses.');
      return false;
    }

    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    console.log('✅ OpenAI client initialized');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize OpenAI:', error);
    return false;
  }
}

/**
 * Get AI response for plant care questions
 * @param {Object} params - Request parameters
 * @returns {Object} AI response with answer and metadata
 */
async function getAIResponse(params) {
  try {
    if (!openai) {
      initializeOpenAI();
    }

    if (!openai) {
      return getFallbackResponse(params);
    }

    const { question, species, sensorData, context } = params;

    // Search plant care knowledge base
    const knowledgeResults = searchPlantKnowledge(question, species);
    const enhancedKnowledgeContext = {
      relevantTips: knowledgeResults.map(result => ({
        text: result.text,
        confidence: result.relevanceScore / 5,
        species: result.species,
        category: result.category,
        source: 'plant_knowledge_base'
      })),
      sources: ['plant_knowledge_base'],
      confidence: knowledgeResults.length > 0 ? 0.8 : 0.3
    };

    // Build context for the AI
    const systemPrompt = buildSystemPrompt(species, sensorData, enhancedKnowledgeContext);
    const userPrompt = buildUserPrompt(question, context);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    const aiResponse = completion.choices[0].message.content;
    
    return {
      answer: aiResponse,
      confidence: 0.9,
      sources: enhancedKnowledgeContext?.sources || [],
      recommendations: extractRecommendations(aiResponse),
      model: "gpt-3.5-turbo",
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error getting AI response:', error);
    return getFallbackResponse(params);
  }
}

/**
 * Build system prompt for the AI
 * @param {string} species - Plant species
 * @param {Object} sensorData - Current sensor readings
 * @param {Object} knowledgeContext - Relevant knowledge from Chroma DB
 * @returns {string} System prompt
 */
function buildSystemPrompt(species, sensorData, knowledgeContext) {
  let prompt = `You are a helpful plant care assistant with expertise in houseplant care. You provide practical, actionable advice based on current plant conditions and scientific knowledge.

Current Plant Information:
- Species: ${species || 'Unknown'}
- Sensor Data: ${JSON.stringify(sensorData, null, 2)}

Relevant Knowledge Base:
${knowledgeContext?.relevantTips?.map(tip => `- ${tip.text} (Confidence: ${tip.confidence.toFixed(2)})`).join('\n') || 'No specific knowledge found'}

Guidelines:
1. Provide specific, actionable advice
2. Consider the current sensor readings in your recommendations
3. Be encouraging and supportive
4. Use emojis appropriately to make responses friendly
5. If you're unsure about something, say so
6. Focus on practical care tips that users can implement immediately
7. Consider the plant's specific needs based on its species

Response Format:
- Start with a brief assessment of the current situation
- Provide specific recommendations
- Include any warnings or important notes
- End with encouragement and next steps`;

  return prompt;
}

/**
 * Build user prompt
 * @param {string} question - User's question
 * @param {string} context - Additional context
 * @returns {string} User prompt
 */
function buildUserPrompt(question, context) {
  let prompt = `User Question: ${question}`;
  
  if (context && context !== 'general') {
    prompt += `\n\nContext: ${context}`;
  }
  
  prompt += `\n\nPlease provide a helpful response based on the plant information and knowledge base above.`;
  
  return prompt;
}

/**
 * Extract recommendations from AI response
 * @param {string} response - AI response text
 * @returns {Array} Array of recommendations
 */
function extractRecommendations(response) {
  const recommendations = [];
  
  // Look for bullet points or numbered lists
  const lines = response.split('\n');
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.match(/^[-•*]\s/) || trimmed.match(/^\d+\.\s/)) {
      recommendations.push(trimmed.replace(/^[-•*]\s/, '').replace(/^\d+\.\s/, ''));
    }
  });
  
  return recommendations;
}

/**
 * Get fallback response when AI is unavailable
 * @param {Object} params - Request parameters
 * @returns {Object} Fallback response
 */
function getFallbackResponse(params) {
  const { question, species, sensorData } = params;
  const lowerQuestion = question.toLowerCase();
  
  let answer = '';
  let recommendations = [];
  
  // Watering-related questions
  if (lowerQuestion.includes('water') || lowerQuestion.includes('watering')) {
    answer = `For your ${species || 'plant'}, water when the top 2 inches of soil are dry. `;
    if (sensorData && sensorData.moisture < 30) {
      answer += `Your current moisture level is ${sensorData.moisture}%, which suggests the soil is quite dry. I recommend watering your plant today. `;
    } else if (sensorData && sensorData.moisture > 80) {
      answer += `Your current moisture level is ${sensorData.moisture}%, which suggests the soil is very wet. Hold off on watering for a few days. `;
    } else {
      answer += `Check the soil moisture by sticking your finger 2 inches into the soil. `;
    }
    answer += `Water thoroughly until water drains from the bottom of the pot.`;
    recommendations.push('Check soil moisture before watering');
    recommendations.push('Water thoroughly and allow drainage');
  }
  
  // Light-related questions
  else if (lowerQuestion.includes('light') || lowerQuestion.includes('sunlight')) {
    answer = `Your ${species || 'plant'} prefers bright, indirect light. `;
    if (sensorData && sensorData.light < 300) {
      answer += `Your current light level is ${sensorData.light}, which is quite low. Consider moving your plant to a brighter location. `;
    } else if (sensorData && sensorData.light > 1000) {
      answer += `Your current light level is ${sensorData.light}, which might be too intense. Consider moving your plant away from direct sunlight. `;
    } else {
      answer += `Avoid direct sunlight which can burn the leaves. `;
    }
    answer += `A spot near a bright window with filtered light is ideal.`;
    recommendations.push('Provide bright, indirect light');
    recommendations.push('Avoid direct sunlight');
  }
  
  // Health/troubleshooting questions
  else if (lowerQuestion.includes('yellow') || lowerQuestion.includes('leaves')) {
    answer = `Yellow leaves can indicate several issues: overwatering, underwatering, or nutrient deficiency. `;
    if (sensorData && sensorData.moisture > 80) {
      answer += `Your high moisture level (${sensorData.moisture}%) suggests overwatering might be the cause. `;
    } else if (sensorData && sensorData.moisture < 20) {
      answer += `Your low moisture level (${sensorData.moisture}%) suggests underwatering might be the cause. `;
    }
    answer += `Check the soil moisture and adjust your watering schedule accordingly. Remove yellow leaves to help the plant focus energy on healthy growth.`;
    recommendations.push('Check soil moisture levels');
    recommendations.push('Remove yellow leaves');
    recommendations.push('Adjust watering schedule');
  }
  
  // General care questions
  else {
    answer = `I'd be happy to help with your ${species || 'plant'} care! `;
    if (sensorData) {
      answer += `Based on your current sensor readings (moisture: ${sensorData.moisture}%, light: ${sensorData.light}, temperature: ${sensorData.temperature}°F), `;
    }
    answer += `here are some general care tips: water when soil is dry, provide bright indirect light, and maintain consistent care. For specific advice, please provide more details about your plant's current condition.`;
    recommendations.push('Water when soil is dry');
    recommendations.push('Provide bright indirect light');
    recommendations.push('Maintain consistent care');
  }
  
  return {
    answer: answer,
    confidence: 0.6,
    sources: ['fallback_knowledge'],
    recommendations: recommendations,
    model: 'fallback',
    timestamp: new Date().toISOString()
  };
}

/**
 * Generate plant care reminders based on sensor data
 * @param {Object} sensorData - Current sensor readings
 * @param {Object} plant - Plant information
 * @returns {Array} Array of reminders
 */
function generateCareReminders(sensorData, plant) {
  const reminders = [];
  
  // Moisture-based reminders
  if (sensorData.moisture < 20) {
    reminders.push({
      type: 'watering',
      priority: 'high',
      message: '🌱 Your plant needs water - soil is very dry',
      action: 'Water thoroughly until water drains from bottom'
    });
  } else if (sensorData.moisture > 90) {
    reminders.push({
      type: 'watering',
      priority: 'medium',
      message: '💧 Soil is very wet - hold off on watering',
      action: 'Check for drainage issues and reduce watering frequency'
    });
  }
  
  // Light-based reminders
  if (sensorData.light < 200) {
    reminders.push({
      type: 'lighting',
      priority: 'medium',
      message: '☀️ Plant needs more light',
      action: 'Move to a brighter location with indirect light'
    });
  } else if (sensorData.light > 1200) {
    reminders.push({
      type: 'lighting',
      priority: 'low',
      message: '🕶️ Light might be too intense',
      action: 'Consider moving away from direct sunlight'
    });
  }
  
  // Temperature-based reminders
  if (sensorData.temperature < 60) {
    reminders.push({
      type: 'environment',
      priority: 'medium',
      message: '❄️ Temperature is quite low',
      action: 'Move to a warmer location or check for drafts'
    });
  } else if (sensorData.temperature > 90) {
    reminders.push({
      type: 'environment',
      priority: 'medium',
      message: '🔥 Temperature is quite high',
      action: 'Move to a cooler location or provide shade'
    });
  }
  
  return reminders;
}

module.exports = {
  initializeOpenAI,
  getAIResponse,
  generateCareReminders
};
