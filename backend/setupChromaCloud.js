#!/usr/bin/env node

/**
 * Setup Chroma DB Cloud with plant care knowledge
 */

const chromadb = require('chromadb');
const fs = require('fs');
const path = require('path');

async function setupChromaCloud() {
  console.log('🧠 Setting up Chroma DB Cloud for plant care knowledge...\n');
  
  try {
    // Initialize Chroma client (cloud instance)
    const client = new chromadb.ChromaClient({
      path: 'https://api.trychroma.com',
      apiKey: 'ck-BPG2XTtPWBPa2tFsatrfHmbsBTLdJYtKsnX75g8ZccYg',
      tenant: '36db7d89-6330-46bf-a396-2836596dbd9a',
      database: 'plants'
    });
    
    console.log('✅ Connected to Chroma DB Cloud');
    
    // Load plant care dataset
    const datasetPath = path.join(__dirname, 'data/plantCareDataset.json');
    const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
    
    console.log(`📚 Loaded ${dataset.length} plant care items`);
    
    // Create or get collection
    let collection;
    try {
      collection = await client.getCollection({
        name: 'plant_care_knowledge'
      });
      console.log('✅ Connected to existing collection');
    } catch (error) {
      collection = await client.createCollection({
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
    console.log('\n🔄 Adding documents to Chroma DB Cloud...');
    await collection.add({
      documents: documents,
      metadatas: metadatas,
      ids: ids
    });
    
    console.log('✅ Successfully added all documents to Chroma DB Cloud');
    
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
    
    console.log('\n🎉 Chroma DB Cloud setup complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Restart the backend server: npm start');
    console.log('   2. The AI assistant will now use Chroma DB Cloud for sophisticated responses');
    console.log('   3. Test by asking: "Should I water my Snake Plant today?"');
    
  } catch (error) {
    console.error('❌ Error setting up Chroma DB Cloud:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   - Check your API key and credentials');
    console.log('   - Verify network connectivity');
    console.log('   - Ensure the plant care dataset exists');
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupChromaCloud();
}

module.exports = { setupChromaCloud };
