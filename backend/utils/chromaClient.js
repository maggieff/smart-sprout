/**
 * Chroma DB client for plant care knowledge base
 * Handles vector embeddings and similarity search
 */

const { ChromaClient } = require('chromadb');
const fs = require('fs');
const path = require('path');

let chromaClient = null;
let plantCareCollection = null;
let userPlantsCollection = null;

/**
 * Initialize Chroma DB client and collections
 */
async function initializeChroma() {
  try {
    // Initialize Chroma client (cloud instance)
    chromaClient = new ChromaClient({
      path: 'https://api.trychroma.com',
      apiKey: process.env.CHROMA_API_KEY || 'ck-BPG2XTtPWBPa2tFsatrfHmbsBTLdJYtKsnX75g8ZccYg',
      tenant: process.env.CHROMA_TENANT || '36db7d89-6330-46bf-a396-2836596dbd9a',
      database: process.env.CHROMA_DATABASE || 'plants'
    });

    // Create or get collections
    try {
      plantCareCollection = await chromaClient.getCollection({
        name: 'plant_care_knowledge'
      });
    } catch (error) {
      plantCareCollection = await chromaClient.createCollection({
        name: 'plant_care_knowledge',
        metadata: { description: 'Plant care tips and knowledge base' }
      });
    }

    try {
      userPlantsCollection = await chromaClient.getCollection({
        name: 'user_plants'
      });
    } catch (error) {
      userPlantsCollection = await chromaClient.createCollection({
        name: 'user_plants',
        metadata: { description: 'User plant data and logs' }
      });
    }

    console.log('✅ Chroma DB initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Chroma DB:', error);
    return false;
  }
}

/**
 * Query plant care knowledge base
 * @param {string} question - User question
 * @param {string} species - Plant species (optional)
 * @returns {Object} Relevant knowledge context
 */
async function queryPlantKnowledge(question, species = null) {
  try {
    if (!plantCareCollection) {
      await initializeChroma();
    }

    if (!plantCareCollection) {
      return getFallbackKnowledge(question, species);
    }

    // Prepare query with species context if provided
    let queryText = question;
    if (species) {
      queryText = `${species} ${question}`;
    }

    // Query the knowledge base
    const results = await plantCareCollection.query({
      queryTexts: [queryText],
      nResults: 5,
      include: ['documents', 'metadatas', 'distances']
    });

    // Process results
    const knowledgeContext = {
      relevantTips: [],
      sources: [],
      confidence: 0
    };

    if (results.documents && results.documents[0]) {
      const documents = results.documents[0];
      const metadatas = results.metadatas[0];
      const distances = results.distances[0];

      documents.forEach((doc, index) => {
        const distance = distances[index];
        const metadata = metadatas[index];
        const confidence = 1 - distance; // Convert distance to confidence

        if (confidence > 0.3) { // Only include relevant results
          knowledgeContext.relevantTips.push({
            text: doc,
            confidence: confidence,
            species: metadata.species || 'general',
            category: metadata.category || 'care',
            source: metadata.source || 'knowledge_base'
          });
        }
      });

      // Calculate overall confidence
      knowledgeContext.confidence = knowledgeContext.relevantTips.length > 0 
        ? knowledgeContext.relevantTips.reduce((sum, tip) => sum + tip.confidence, 0) / knowledgeContext.relevantTips.length
        : 0;

      // Extract sources
      knowledgeContext.sources = [...new Set(
        knowledgeContext.relevantTips.map(tip => tip.source)
      )];
    }

    return knowledgeContext;
  } catch (error) {
    console.error('Error querying plant knowledge:', error);
    return getFallbackKnowledge(question, species);
  }
}

/**
 * Add plant care knowledge to the database
 * @param {Array} knowledgeItems - Array of knowledge items to add
 */
async function addPlantKnowledge(knowledgeItems) {
  try {
    if (!plantCareCollection) {
      await initializeChroma();
    }

    if (!plantCareCollection) {
      console.error('Chroma DB not initialized');
      return false;
    }

    const documents = [];
    const metadatas = [];
    const ids = [];

    knowledgeItems.forEach((item, index) => {
      documents.push(item.text);
      metadatas.push({
        species: item.species || 'general',
        category: item.category || 'care',
        source: item.source || 'manual_entry',
        timestamp: new Date().toISOString()
      });
      ids.push(item.id || `knowledge_${Date.now()}_${index}`);
    });

    await plantCareCollection.add({
      documents: documents,
      metadatas: metadatas,
      ids: ids
    });

    console.log(`✅ Added ${knowledgeItems.length} knowledge items to Chroma DB`);
    return true;
  } catch (error) {
    console.error('Error adding plant knowledge:', error);
    return false;
  }
}

/**
 * Store user plant data in Chroma DB
 * @param {Object} plantData - Plant data to store
 */
async function storeUserPlantData(plantData) {
  try {
    if (!userPlantsCollection) {
      await initializeChroma();
    }

    if (!userPlantsCollection) {
      console.error('Chroma DB not initialized');
      return false;
    }

    const document = JSON.stringify(plantData);
    const metadata = {
      plantId: plantData.id,
      species: plantData.species,
      timestamp: new Date().toISOString(),
      healthScore: plantData.healthScore || 0
    };

    await userPlantsCollection.add({
      documents: [document],
      metadatas: [metadata],
      ids: [plantData.id]
    });

    return true;
  } catch (error) {
    console.error('Error storing user plant data:', error);
    return false;
  }
}

/**
 * Get fallback knowledge when Chroma DB is unavailable
 * @param {string} question - User question
 * @param {string} species - Plant species
 * @returns {Object} Fallback knowledge context
 */
function getFallbackKnowledge(question, species) {
  const fallbackTips = [
    {
      text: "Water your plant when the top 2 inches of soil are dry. Stick your finger in the soil to check moisture levels.",
      confidence: 0.8,
      species: "general",
      category: "watering",
      source: "fallback_knowledge"
    },
    {
      text: "Most houseplants prefer bright, indirect light. Avoid direct sunlight which can burn the leaves.",
      confidence: 0.8,
      species: "general",
      category: "lighting",
      source: "fallback_knowledge"
    },
    {
      text: "Yellow leaves often indicate overwatering. Check soil moisture and adjust watering schedule.",
      confidence: 0.7,
      species: "general",
      category: "troubleshooting",
      source: "fallback_knowledge"
    }
  ];

  return {
    relevantTips: fallbackTips,
    sources: ['fallback_knowledge'],
    confidence: 0.7
  };
}

/**
 * Load plant care dataset from JSON file
 * @param {string} filePath - Path to the dataset file
 * @returns {Array} Plant care knowledge items
 */
function loadPlantCareDataset(filePath) {
  try {
    const fullPath = path.resolve(filePath);
    const data = fs.readFileSync(fullPath, 'utf8');
    const dataset = JSON.parse(data);
    
    console.log(`✅ Loaded ${dataset.length} plant care items from ${filePath}`);
    return dataset;
  } catch (error) {
    console.error('Error loading plant care dataset:', error);
    return [];
  }
}

/**
 * Initialize the knowledge base with sample data
 */
async function initializeKnowledgeBase() {
  try {
    const datasetPath = process.env.PLANT_DATASET_PATH || './data/plantCareDataset.json';
    const knowledgeItems = loadPlantCareDataset(datasetPath);
    
    if (knowledgeItems.length > 0) {
      await addPlantKnowledge(knowledgeItems);
      return true;
    } else {
      console.log('No knowledge items to load');
      return false;
    }
  } catch (error) {
    console.error('Error initializing knowledge base:', error);
    return false;
  }
}

/**
 * Search for similar plant care questions
 * @param {string} question - User question
 * @returns {Array} Similar questions and answers
 */
async function findSimilarQuestions(question) {
  try {
    if (!plantCareCollection) {
      return [];
    }

    const results = await plantCareCollection.query({
      queryTexts: [question],
      nResults: 3,
      include: ['documents', 'metadatas', 'distances']
    });

    const similarQuestions = [];
    if (results.documents && results.documents[0]) {
      results.documents[0].forEach((doc, index) => {
        const distance = results.distances[0][index];
        const confidence = 1 - distance;
        
        if (confidence > 0.5) {
          similarQuestions.push({
            question: doc,
            confidence: confidence,
            metadata: results.metadatas[0][index]
          });
        }
      });
    }

    return similarQuestions;
  } catch (error) {
    console.error('Error finding similar questions:', error);
    return [];
  }
}

module.exports = {
  initializeChroma,
  queryPlantKnowledge,
  addPlantKnowledge,
  storeUserPlantData,
  loadPlantCareDataset,
  initializeKnowledgeBase,
  findSimilarQuestions
};
