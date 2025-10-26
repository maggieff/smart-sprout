#!/usr/bin/env node

/**
 * Generate embeddings for plant care knowledge base
 * This script processes the plant care dataset and generates embeddings
 */

const fs = require('fs');
const path = require('path');
const { ChromaClient } = require('chromadb');

async function generateEmbeddings() {
  console.log('🧠 Generating embeddings for plant care knowledge base...\n');
  
  try {
    // Load comprehensive plant care dataset
    const datasetPath = path.join(__dirname, '../backend/data/comprehensive_plant_data.json');
    const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
    
    console.log(`📚 Loaded ${dataset.length} plant care items`);
    
    // Initialize Chroma Cloud client
    const chroma = new ChromaClient({
      path: 'https://api.trychroma.com',
      apiKey: 'ck-BPG2XTtPWBPa2tFsatrfHmbsBTLdJYtKsnX75g8ZccYg',
      tenant: '36db7d89-6330-46bf-a396-2836596dbd9a',
      database: 'plants'
    });
    
    // Create or get collection
    let collection;
    try {
      collection = await chroma.getCollection({
        name: 'plant_care_knowledge'
      });
      console.log('✅ Connected to existing collection');
    } catch (error) {
      collection = await chroma.createCollection({
        name: 'plant_care_knowledge',
        metadata: { 
          description: 'Plant care tips and knowledge base',
          created_at: new Date().toISOString()
        }
      });
      console.log('✅ Created new collection');
    }
    
    // Process each item in the dataset
    const documents = [];
    const metadatas = [];
    const ids = [];
    
    for (let i = 0; i < dataset.length; i++) {
      const item = dataset[i];
      
      documents.push(item.text);
      metadatas.push({
        species: item.species,
        category: item.category,
        source: 'plant_care_dataset',
        created_at: new Date().toISOString()
      });
      ids.push(item.id);
      
      if ((i + 1) % 10 === 0) {
        console.log(`📝 Processed ${i + 1}/${dataset.length} items`);
      }
    }
    
    // Add documents to collection
    console.log('\n🔄 Adding documents to Chroma DB...');
    await collection.add({
      documents: documents,
      metadatas: metadatas,
      ids: ids
    });
    
    console.log('✅ Successfully added all documents to Chroma DB');
    
    // Test the collection
    console.log('\n🧪 Testing collection...');
    const testResults = await collection.query({
      queryTexts: ['How often should I water my plant?'],
      nResults: 3
    });
    
    console.log('✅ Collection test successful');
    console.log(`📊 Found ${testResults.documents[0].length} relevant results`);
    
    // Get collection info
    const collectionInfo = await collection.get();
    console.log(`📈 Collection contains ${collectionInfo.ids.length} documents`);
    
    console.log('\n🎉 Embeddings generation complete!');
    console.log('\n📋 Collection ready for use with:');
    console.log('   - Plant care question answering');
    console.log('   - Species-specific recommendations');
    console.log('   - Context-aware AI responses');
    
  } catch (error) {
    console.error('❌ Error generating embeddings:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   - Ensure Chroma DB is running: docker run -p 8000:8000 chromadb/chroma');
    console.log('   - Check that the dataset file exists');
    console.log('   - Verify network connectivity to Chroma DB');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateEmbeddings();
}

module.exports = { generateEmbeddings };
