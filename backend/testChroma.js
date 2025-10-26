const { ChromaClient, CloudClient } = require('chromadb');
const { OpenAIEmbeddingFunction } = require('chromadb');
require('dotenv').config(); // Added to load .env

async function testChroma() {
  try {
    console.log('Testing Chroma Cloud connection...');
    
    const chroma = new CloudClient({
      apiKey: process.env.CHROMA_API_KEY || 'ck-GWpo9jeE6H2Trwa69Gt77zviEqx7EZTw7s1UpvMcGFGu',
      tenant: process.env.CHROMA_TENANT || '36db7d89-6330-46bf-a396-2836596dbd9a',
      database: process.env.CHROMA_DATABASE || 'plants'
    });
    
    console.log('Chroma Cloud client created');
    
    // Test basic connection
    const collections = await chroma.listCollections();
    console.log('Collections:', collections);
    
    // Create embedding function
    console.log('OpenAI API Key loaded:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');
    console.log('API Key starts with:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'Not found');
    const embedder = new OpenAIEmbeddingFunction({
      openai_api_key: process.env.OPENAI_API_KEY
    });

    // Test query with embedding function
    const collection = await chroma.getCollection({
      name: 'plant_care_knowledge',
      embeddingFunction: embedder
    });
    
    console.log('Collection retrieved');
    
    const results = await collection.query({
      queryTexts: ['Monstera care'],
      nResults: 3
    });
    
    console.log('Query results:', results);
    
  } catch (error) {
    console.error('Chroma Cloud test failed:', error.message);
    console.error('Full error:', error);
  }
}

testChroma();
