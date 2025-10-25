const express = require('express');
const { getAIResponse } = require('../utils/aiAssistant');
const { queryPlantKnowledge } = require('../utils/chromaClient');

const router = express.Router();

// POST /api/ask-ai - Ask AI assistant about plant care
router.post('/', async (req, res) => {
  try {
    const { 
      question, 
      plantId, 
      species, 
      sensorData, 
      context = 'general' 
    } = req.body;
    
    if (!question) {
      return res.status(400).json({ 
        error: 'Question is required' 
      });
    }

    console.log('🤖 AI Question:', question);
    console.log('🌱 Plant Context:', { plantId, species, sensorData });

    // Query Chroma DB for relevant plant care knowledge
    const knowledgeContext = await queryPlantKnowledge(question, species);
    
    // Generate AI response using OpenAI
    const aiResponse = await getAIResponse({
      question,
      species: species || 'plant',
      sensorData: sensorData || {},
      knowledgeContext,
      context
    });

    // Log the interaction for analytics
    logAIInteraction({
      question,
      plantId,
      species,
      response: aiResponse,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      answer: aiResponse.answer,
      confidence: aiResponse.confidence,
      sources: aiResponse.sources,
      recommendations: aiResponse.recommendations,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in AI assistant:', error);
    
    // Fallback response if AI service is unavailable
    const fallbackResponse = getFallbackResponse(req.body.question, req.body.species);
    
    res.json({
      success: true,
      answer: fallbackResponse,
      confidence: 0.3,
      sources: [],
      recommendations: [],
      timestamp: new Date().toISOString(),
      note: 'Using fallback response - AI service temporarily unavailable'
    });
  }
});

// GET /api/ask-ai/suggestions - Get suggested questions
router.get('/suggestions', async (req, res) => {
  try {
    const { species } = req.query;
    
    const suggestions = getSuggestedQuestions(species);
    
    res.json({
      suggestions,
      species: species || 'general'
    });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// Helper functions
function logAIInteraction(interaction) {
  // In a real app, this would be stored in a database
  console.log('📝 AI Interaction Logged:', {
    question: interaction.question,
    plantId: interaction.plantId,
    timestamp: interaction.timestamp
  });
}

function getFallbackResponse(question, species) {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('water') || lowerQuestion.includes('watering')) {
    return `For ${species || 'your plant'}, water when the top 2 inches of soil are dry. Stick your finger in the soil to check moisture levels.`;
  }
  
  if (lowerQuestion.includes('light') || lowerQuestion.includes('sunlight')) {
    return `${species || 'Your plant'} prefers bright, indirect light. Avoid direct sunlight which can burn the leaves.`;
  }
  
  if (lowerQuestion.includes('yellow') || lowerQuestion.includes('leaves')) {
    return `Yellow leaves can indicate overwatering, underwatering, or nutrient deficiency. Check soil moisture and consider adjusting your watering schedule.`;
  }
  
  if (lowerQuestion.includes('brown') || lowerQuestion.includes('tips')) {
    return `Brown tips often indicate low humidity or over-fertilization. Try misting the plant or using a humidifier.`;
  }
  
  return `I'd be happy to help with your ${species || 'plant'} care question! For the best advice, please provide more specific details about your plant's current condition.`;
}

function getSuggestedQuestions(species) {
  const generalQuestions = [
    "How often should I water my plant?",
    "What's the best lighting for my plant?",
    "Why are my plant's leaves turning yellow?",
    "How do I know if my plant is healthy?",
    "What should I do about brown leaf tips?"
  ];
  
  const speciesSpecific = {
    'snake plant': [
      "How often should I water my Snake Plant?",
      "Why is my Snake Plant drooping?",
      "Can Snake Plants survive in low light?",
      "How do I propagate my Snake Plant?"
    ],
    'fiddle leaf fig': [
      "Why are my Fiddle Leaf Fig leaves falling?",
      "How much light does my Fiddle Leaf Fig need?",
      "Why is my Fiddle Leaf Fig not growing?",
      "How do I clean Fiddle Leaf Fig leaves?"
    ]
  };
  
  if (species && speciesSpecific[species.toLowerCase()]) {
    return speciesSpecific[species.toLowerCase()];
  }
  
  return generalQuestions;
}

module.exports = router;
