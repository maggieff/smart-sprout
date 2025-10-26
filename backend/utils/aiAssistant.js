const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// Initialize OpenAI client
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'your_openai_api_key_here'
  });
  console.log('✅ OpenAI client initialized');
} catch (error) {
  console.log('⚠️ OpenAI client initialization failed:', error.message);
}

// Load plant care dataset
let plantCareData = [];
try {
  const dataPath = path.join(__dirname, '../data/plantCareDataset.json');
  const rawData = fs.readFileSync(dataPath, 'utf8');
  plantCareData = JSON.parse(rawData);
  console.log(`✅ Loaded ${plantCareData.length} plant care items`);
} catch (error) {
  console.error('❌ Error loading plant care data:', error.message);
}

/**
 * Search plant knowledge for relevant tips
 */
function searchPlantKnowledge(question, species) {
  if (!plantCareData || plantCareData.length === 0) {
    return [];
  }

  const query = question.toLowerCase();
  const speciesQuery = species ? species.toLowerCase() : '';
  
  // Score and filter plant care tips
  const scoredTips = plantCareData.map(tip => {
    let score = 0;
    
    // Species match (highest priority)
    if (speciesQuery && tip.species && tip.species.toLowerCase().includes(speciesQuery)) {
      score += 10;
    }
    
    // Question keyword matches
    const tipText = tip.text.toLowerCase();
    const tipCategory = tip.category.toLowerCase();
    
    // High-value keywords
    const highValueKeywords = ['water', 'watering', 'light', 'sun', 'soil', 'fertilizer', 'prune', 'propagate', 'repot', 'disease', 'pest', 'yellow', 'brown', 'droop', 'wilt'];
    highValueKeywords.forEach(keyword => {
      if (query.includes(keyword) && tipText.includes(keyword)) {
        score += 3;
      }
    });
    
    // General keyword matches
    const words = query.split(' ').filter(word => word.length > 2);
    words.forEach(word => {
      if (tipText.includes(word)) {
        score += 1;
      }
      if (tipCategory.includes(word)) {
        score += 2;
      }
    });
    
    return { ...tip, score };
  });
  
  // Filter out zero scores and sort by score
  return scoredTips
    .filter(tip => tip.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5); // Return top 5 matches
}

/**
 * Build system prompt for OpenAI
 */
function buildSystemPrompt(species, sensorData, knowledgeContext) {
  let prompt = `You are a helpful plant care assistant with access to a comprehensive plant care database.

RELEVANT PLANT KNOWLEDGE:
`;

  if (knowledgeContext && knowledgeContext.length > 0) {
    knowledgeContext.forEach((tip, index) => {
      prompt += `${index + 1}. **${tip.category}**: ${tip.text}\n`;
    });
  } else {
    prompt += `No specific knowledge found for this query. Use your general plant care knowledge.`;
  }

  prompt += `

CURRENT PLANT CONTEXT:
- Species: ${species || 'Not specified'}
- Sensor Data: ${JSON.stringify(sensorData || {})}

INSTRUCTIONS:
1. Provide specific, actionable advice based on the knowledge above
2. If sensor data is available, reference it in your response
3. Be encouraging and supportive
4. If you don't have specific information, say so and provide general guidance
5. Keep responses concise but helpful
6. Use emojis sparingly and appropriately

Respond as a friendly plant care expert:`;

  return prompt;
}

/**
 * Extract recommendations from AI response
 */
function extractRecommendations(response) {
  const recommendations = [];
  const lines = response.split('\n');
  
  lines.forEach(line => {
    if (line.includes('•') || line.includes('-') || line.includes('*')) {
      const clean = line.replace(/[•\-*]\s*/, '').trim();
      if (clean.length > 0) {
        recommendations.push(clean);
      }
    }
  });
  
  return recommendations.slice(0, 3); // Max 3 recommendations
}

/**
 * Get AI response
 */
async function getAIResponse(params) {
  try {
    const { question, species, sensorData } = params;

    // Search for relevant plant care tips
    const relevantTips = searchPlantKnowledge(question, species);
    console.log(`✅ Found ${relevantTips.length} relevant tips for "${question}"`);

    // Build system prompt
    const systemPrompt = buildSystemPrompt(species, sensorData, relevantTips);

    if (!openai) {
      console.log('⚠️ OpenAI not available, using fallback response');
      return {
        answer: "I'd be happy to help with your plant care! For the best advice, please provide more specific details about your plant's current condition.",
        confidence: 0.3,
        sources: ['fallback_knowledge'],
        recommendations: ['Provide more specific details about your plant'],
        model: 'fallback',
        timestamp: new Date().toISOString()
      };
    }

    // Generate AI response using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const aiResponse = completion.choices[0].message.content;

    return {
      answer: aiResponse,
      confidence: 0.9,
      sources: ['plant_care_database', 'openai_gpt3.5'],
      recommendations: extractRecommendations(aiResponse),
      model: 'gpt-3.5-turbo',
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error getting AI response:', error);
    return {
      answer: "I'm having trouble accessing my plant care database right now. Please try again later.",
      confidence: 0.1,
      sources: ['error_fallback'],
      recommendations: ['Try again later'],
      model: 'error_fallback',
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = {
  getAIResponse,
  searchPlantKnowledge
};