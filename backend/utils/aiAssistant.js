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

    const { question, species, sensorData, plantData, context } = params;

    // Search plant care knowledge base (with fallback)
    let knowledgeResults = [];
    try {
      knowledgeResults = searchPlantKnowledge(question, species);
    } catch (error) {
      console.log('Using fallback knowledge search');
      knowledgeResults = getFallbackKnowledge(question, species);
    }
    
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
    const systemPrompt = buildSystemPrompt(species, sensorData, plantData, enhancedKnowledgeContext);
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
 * @param {Object} plantData - Plant information from database
 * @param {Object} knowledgeContext - Relevant knowledge from Chroma DB
 * @returns {string} System prompt
 */
function buildSystemPrompt(species, sensorData, plantData, knowledgeContext) {
  let prompt = `You are a helpful plant care assistant with expertise in houseplant care. You provide practical, actionable advice based on current plant conditions and scientific knowledge.

Current Plant Information:
- Species: ${species || 'Unknown'}
- Plant Name: ${plantData?.name || 'Not specified'}
- Health Score: ${plantData?.health_score || 'Not available'}
- Sensor Data: ${JSON.stringify(sensorData, null, 2)}

Plant Details from Database:
${plantData ? `
- Name: ${plantData.name}
- Species: ${plantData.species || 'Unknown'}
- Variety: ${plantData.variety || 'Not specified'}
- Description: ${plantData.description || 'No description available'}
- Health Score: ${plantData.health_score || 0.8}
- Created: ${plantData.created_at}
` : 'No plant data available'}

Relevant Knowledge Base:
${knowledgeContext?.relevantTips?.map(tip => `- ${tip.text} (Confidence: ${tip.confidence.toFixed(2)})`).join('\n') || 'No specific knowledge found'}

SPECIAL EASTER EGG: If the user mentions "doubles as a AI study tutor" or asks math/science questions, you can help with:
- Math problems (calculus, algebra, geometry)
- Science concepts (physics, chemistry, biology)
- Programming and computer science
- Academic subjects and study help
- Step-by-step problem solving

Guidelines:
1. Provide specific, actionable advice based on the plant's current condition
2. Consider the current sensor readings in your recommendations
3. Reference the plant by name when possible for a personal touch
4. Be encouraging and supportive
5. Use emojis appropriately to make responses friendly
6. If you're unsure about something, say so
7. Focus on practical care tips that users can implement immediately
8. Consider the plant's specific needs based on its species and variety
9. Take into account the plant's health score when making recommendations
10. If asked about math/science/academic topics, provide helpful educational assistance

Response Format:
- Start with a brief assessment of the current situation
- Provide specific recommendations tailored to this plant
- Include any warnings or important notes
- End with encouragement and next steps
- For academic questions, provide step-by-step solutions with explanations`;

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
  
  // Dying plant questions
  else if (lowerQuestion.includes('dying') || lowerQuestion.includes('dying')) {
    answer = `If your plant appears to be dying, let's diagnose the issue systematically: `;
    
    if (sensorData) {
      answer += `Based on your current readings (moisture: ${sensorData.moisture}%, light: ${sensorData.light}, temperature: ${sensorData.temperature}°F), `;
      
      if (sensorData.moisture > 80) {
        answer += `your soil is very wet - this could cause root rot. Let the soil dry out completely before watering again. `;
      } else if (sensorData.moisture < 20) {
        answer += `your soil is very dry - your plant is likely underwatered. Water thoroughly and check drainage. `;
      }
      
      if (sensorData.light < 200) {
        answer += `Your light level is very low - move to a brighter location. `;
      } else if (sensorData.light > 1000) {
        answer += `Your light might be too intense - consider moving away from direct sun. `;
      }
      
      if (sensorData.temperature < 60 || sensorData.temperature > 90) {
        answer += `Your temperature is outside the ideal range - most plants prefer 65-75°F. `;
      }
    }
    
    answer += `Common causes of plant decline: 1) Overwatering (yellow leaves, mushy stems) - let soil dry out, 2) Underwatering (dry, crispy leaves) - water more frequently, 3) Poor lighting - move to appropriate light level, 4) Root rot - repot with fresh soil, 5) Pests - inspect leaves and stems. Start with the most obvious issue.`;
    recommendations.push('Check for overwatering signs');
    recommendations.push('Assess lighting conditions');
    recommendations.push('Inspect for pests');
    recommendations.push('Consider repotting if needed');
  }
  
  // EASTER EGG: AI Study Tutor Mode
  else if (lowerQuestion.includes('doubles as a ai study tutor') || lowerQuestion.includes('doubles as a ai study tutor')) {
    answer = `🎓 *AI Study Tutor Mode Activated* 🎓\n\nI can help you with math, science, and other academic subjects! Here are some examples of what I can solve:\n\n`;
    
    // Math problems
    if (lowerQuestion.includes('integral') || lowerQuestion.includes('derivative') || lowerQuestion.includes('calculus')) {
      if (lowerQuestion.includes('x squared') || lowerQuestion.includes('x^2')) {
        answer += `📐 **Calculus Help:**\nThe integral of x² is:\n∫x² dx = (x³/3) + C\n\nWhere C is the constant of integration. This uses the power rule: ∫xⁿ dx = (xⁿ⁺¹)/(n+1) + C\n\n`;
      } else {
        answer += `📐 **Calculus Help:**\nI can help with derivatives, integrals, limits, and more! Just ask me to solve specific problems.\n\n`;
      }
    }
    
    // Science subjects
    if (lowerQuestion.includes('physics') || lowerQuestion.includes('chemistry') || lowerQuestion.includes('biology')) {
      answer += `🔬 **Science Help:**\nI can assist with physics formulas, chemistry equations, biology concepts, and more!\n\n`;
    }
    
    // Programming
    if (lowerQuestion.includes('programming') || lowerQuestion.includes('code') || lowerQuestion.includes('python') || lowerQuestion.includes('javascript')) {
      answer += `💻 **Programming Help:**\nI can help with coding problems, algorithms, data structures, and debugging!\n\n`;
    }
    
    // General study help
    answer += `📚 **General Study Support:**\n- Math problems and step-by-step solutions\n- Science concepts and explanations\n- Programming and computer science\n- Language learning and grammar\n- History and social studies\n- Essay writing and research help\n\nJust ask me any academic question and I'll help you understand it! 🌟`;
    
    recommendations.push('Ask specific math problems');
    recommendations.push('Request science explanations');
    recommendations.push('Get programming help');
    recommendations.push('Study any subject with AI tutor');
  }
  
  // Math problems (when in tutor mode or math-related)
  else if (lowerQuestion.includes('integral') || lowerQuestion.includes('derivative') || lowerQuestion.includes('solve') || lowerQuestion.includes('calculate')) {
    if (lowerQuestion.includes('x squared') || lowerQuestion.includes('x^2')) {
      answer = `📐 **Math Solution:**\nThe integral of x² is:\n\n∫x² dx = (x³/3) + C\n\n**Step-by-step:**\n1. Use the power rule: ∫xⁿ dx = (xⁿ⁺¹)/(n+1) + C\n2. For x²: n = 2, so n+1 = 3\n3. Therefore: ∫x² dx = (x³/3) + C\n\nWhere C is the constant of integration. This is a fundamental result in calculus! 🧮`;
      recommendations.push('Practice more integrals');
      recommendations.push('Learn power rule');
      recommendations.push('Understand integration constants');
    } else if (lowerQuestion.includes('derivative')) {
      answer = `📐 **Calculus Help:**\nI can help with derivatives! The derivative of x² is 2x (using the power rule: d/dx[xⁿ] = nxⁿ⁻¹).\n\nAsk me to solve specific derivatives or integrals!`;
      recommendations.push('Practice derivatives');
      recommendations.push('Learn power rule for derivatives');
    } else {
      answer = `📐 **Math Help:**\nI can solve various math problems! Try asking me to:\n- Solve specific integrals or derivatives\n- Calculate equations\n- Explain mathematical concepts\n- Help with algebra, geometry, or calculus\n\nWhat math problem would you like me to solve?`;
      recommendations.push('Ask specific math problems');
      recommendations.push('Request step-by-step solutions');
    }
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

/**
 * Get fallback knowledge when external knowledge base is unavailable
 * @param {string} query - User's question
 * @param {string} species - Plant species
 * @returns {Array} Array of knowledge results
 */
function getFallbackKnowledge(query, species) {
  const lowerQuery = query.toLowerCase();
  const results = [];
  
  // Watering-related knowledge
  if (lowerQuery.includes('water') || lowerQuery.includes('watering')) {
    results.push({
      text: `Water your ${species || 'plant'} when the top 2 inches of soil are dry. For most houseplants, this means watering once every 7-10 days, but always check the soil first.`,
      species: species || 'general',
      category: 'watering',
      relevanceScore: 4
    });
  }
  
  // Light-related knowledge
  if (lowerQuery.includes('light') || lowerQuery.includes('sunlight') || lowerQuery.includes('bright')) {
    results.push({
      text: `Most houseplants prefer bright, indirect light. Avoid direct sunlight which can burn leaves. A spot near a bright window with filtered light is ideal.`,
      species: species || 'general',
      category: 'lighting',
      relevanceScore: 4
    });
  }
  
  // Health/troubleshooting knowledge
  if (lowerQuery.includes('yellow') || lowerQuery.includes('leaves') || lowerQuery.includes('dying')) {
    results.push({
      text: `Yellow leaves can indicate overwatering, underwatering, or nutrient deficiency. Check soil moisture and adjust watering schedule. Remove yellow leaves to help the plant focus energy on healthy growth.`,
      species: species || 'general',
      category: 'health',
      relevanceScore: 4
    });
  }
  
  // Temperature knowledge
  if (lowerQuery.includes('temperature') || lowerQuery.includes('cold') || lowerQuery.includes('hot')) {
    results.push({
      text: `Most houseplants prefer temperatures between 65-75°F (18-24°C). Avoid placing plants near heating vents, air conditioners, or drafty windows.`,
      species: species || 'general',
      category: 'environment',
      relevanceScore: 3
    });
  }
  
  // Fertilizer knowledge
  if (lowerQuery.includes('fertiliz') || lowerQuery.includes('nutrient') || lowerQuery.includes('feed')) {
    results.push({
      text: `Fertilize your ${species || 'plant'} during the growing season (spring and summer) with a balanced liquid fertilizer diluted to half strength. Avoid fertilizing in winter when growth slows.`,
      species: species || 'general',
      category: 'fertilizing',
      relevanceScore: 3
    });
  }
  
  return results;
}

module.exports = {
  initializeOpenAI,
  getAIResponse,
  generateCareReminders
};
