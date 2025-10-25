/**
 * Populate Chroma DB Cloud with plant care knowledge
 * This script handles the cloud database population
 */

const { ChromaClient } = require('chromadb');
const fs = require('fs');
const path = require('path');

async function populateChromaCloud() {
  console.log('🧠 Populating Chroma DB Cloud with plant care knowledge...\n');
  
  try {
    // Initialize Chroma client with cloud configuration
    const client = new ChromaClient({
      path: 'https://api.trychroma.com',
      apiKey: 'ck-BPG2XTtPWBPa2tFsatrfHmbsBTLdJYtKsnX75g8ZccYg',
      tenant: '36db7d89-6330-46bf-a396-2836596dbd9a',
      database: 'plants'
    });
    
    console.log('✅ Connected to Chroma DB Cloud');
    
    // Load plant care dataset
    const datasetPath = path.join(__dirname, 'data/plantCareDataset.json');
    const plantCareData = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));
    console.log(`📚 Loaded ${plantCareData.length} plant care items`);
    
    // Create or get the plant_care_knowledge collection
    let plantCareCollection;
    try {
      plantCareCollection = await client.getCollection({ 
        name: 'plant_care_knowledge' 
      });
      console.log('✅ Found existing plant_care_knowledge collection');
    } catch (error) {
      plantCareCollection = await client.createCollection({
        name: 'plant_care_knowledge',
        metadata: { description: 'Plant care tips and knowledge base' }
      });
      console.log('✨ Created new plant_care_knowledge collection');
    }
    
    // Prepare data for insertion
    const documents = plantCareData.map(item => item.text);
    const metadatas = plantCareData.map(item => ({
      species: item.species,
      category: item.category,
      id: item.id,
      source: 'plant_care_dataset'
    }));
    const ids = plantCareData.map(item => item.id);
    
    console.log('🔄 Adding documents to Chroma DB Cloud...');
    
    // Add documents in batches to avoid timeout
    const batchSize = 10;
    for (let i = 0; i < documents.length; i += batchSize) {
      const batchDocs = documents.slice(i, i + batchSize);
      const batchMetadatas = metadatas.slice(i, i + batchSize);
      const batchIds = ids.slice(i, i + batchSize);
      
      await plantCareCollection.add({
        documents: batchDocs,
        metadatas: batchMetadatas,
        ids: batchIds
      });
      
      console.log(`📝 Added batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(documents.length/batchSize)} (${batchDocs.length} items)`);
    }
    
    console.log('✅ Successfully populated Chroma DB Cloud!');
    console.log(`📊 Total items added: ${documents.length}`);
    
    // Test the collection
    console.log('\n🧪 Testing the collection...');
    const testResults = await plantCareCollection.query({
      queryTexts: ['Snake Plant watering'],
      nResults: 3,
      include: ['documents', 'metadatas', 'distances']
    });
    
    console.log('✅ Test query successful!');
    console.log(`Found ${testResults.documents[0].length} relevant results`);
    
  } catch (error) {
    console.error('❌ Error populating Chroma DB Cloud:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('   - Check your API key and credentials');
    console.log('   - Verify network connectivity');
    console.log('   - Ensure the plant care dataset exists');
    console.log('   - Check if the tenant and database exist');
  }
}

// Run the population script
populateChromaCloud();
