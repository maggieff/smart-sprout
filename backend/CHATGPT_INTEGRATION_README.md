# ChatGPT Integration Guide

## Current Status ✅
- **304 plant care items** loaded and ready
- **AI Assistant** (`utils/aiAssistant.js`) is set up with OpenAI integration
- **API endpoint** (`/api/ask-ai`) is working
- **Fallback system** works when OpenAI API key is not set

## What's Ready
1. **Enhanced Dataset**: 304 comprehensive plant care tips covering:
   - Succulents, herbs, flowering plants, tropical plants
   - Ferns, palms, vining plants, air plants
   - Watering, light, fertilizing, pruning, propagation, troubleshooting

2. **AI Assistant**: `utils/aiAssistant.js`
   - Searches plant knowledge based on question and species
   - Builds system prompt with relevant plant tips
   - Calls OpenAI GPT-3.5-turbo
   - Has fallback when API key is missing

3. **API Endpoint**: `routes/askAI.js`
   - POST `/api/ask-ai`
   - Accepts: `{ question, plantId, species, sensorData, context }`
   - Returns: `{ answer, confidence, sources, recommendations, timestamp }`

## To Complete ChatGPT Integration

### 1. Set OpenAI API Key
```bash
# Copy env.example to .env
cp env.example .env

# Edit .env and add your OpenAI API key
OPENAI_API_KEY=your_actual_openai_api_key_here
```

### 2. Test the Integration
```bash
# Start the backend
npm start

# Test with curl
curl -X POST http://localhost:5000/api/ask-ai \
  -H "Content-Type: application/json" \
  -d '{"question": "How do I care for a Monstera?", "species": "Monstera"}'
```

### 3. Expected Response
```json
{
  "success": true,
  "answer": "Monstera Deliciosa needs bright, indirect light and well-draining soil...",
  "confidence": 0.9,
  "sources": [...],
  "recommendations": [...],
  "timestamp": "2025-10-26T00:00:00.000Z"
}
```

## How It Works
1. User asks a question via `/api/ask-ai`
2. System searches 304 plant care items for relevant tips
3. Builds a system prompt with the most relevant plant knowledge
4. Sends to OpenAI GPT-3.5-turbo with the plant context
5. Returns AI response with sources and recommendations

## Files to Focus On
- `utils/aiAssistant.js` - Main AI logic
- `routes/askAI.js` - API endpoint
- `data/plantCareDataset.json` - 304 plant care items
- `.env` - Add your OpenAI API key here

## Notes
- The system gracefully falls back when OpenAI is unavailable
- All Chroma DB code has been removed as requested
- The dataset is comprehensive and ready for production use
