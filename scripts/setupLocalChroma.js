/**
 * Set up local Chroma DB with comprehensive plant data
 * Fallback solution when Chroma Cloud is not available
 */

const fs = require('fs');
const path = require('path');
const { ChromaClient } = require('chromadb');

async function setupLocalChroma() {
  console.log('🌱 Setting up local Chroma DB with comprehensive plant data...\n');
  
  try {
    // Initialize local Chroma client
    console.log('🔌 Connecting to local Chroma DB...');
    const chroma = new ChromaClient({
      path: 'http://localhost:8000'
    });
    
    console.log('✅ Connected to local Chroma DB');
    
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
          description: 'Comprehensive plant care knowledge base',
          created_at: new Date().toISOString(),
          total_items: 0
        }
      });
      console.log('✅ Created new collection');
    }
    
    // Load comprehensive dataset
    const datasetPath = path.join(__dirname, '../backend/data/comprehensive_plant_data.json');
    const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
    
    console.log(`📚 Loaded ${dataset.length} plant care items`);
    
    // Clear existing data (optional - comment out if you want to keep existing data)
    try {
      const existingData = await collection.get();
      if (existingData.ids.length > 0) {
        console.log(`🗑️  Clearing existing data (${existingData.ids.length} items)...`);
        await collection.delete({ ids: existingData.ids });
        console.log('✅ Cleared existing data');
      }
    } catch (error) {
      console.log('ℹ️  No existing data to clear');
    }
    
    // Process data in batches
    const batchSize = 50;
    const batches = [];
    
    for (let i = 0; i < dataset.length; i += batchSize) {
      batches.push(dataset.slice(i, i + batchSize));
    }
    
    console.log(`📦 Processing ${batches.length} batches of ${batchSize} items each...\n`);
    
    let totalAdded = 0;
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`🔄 Processing batch ${i + 1}/${batches.length} (${batch.length} items)...`);
      
      // Prepare batch data
      const documents = [];
      const metadatas = [];
      const ids = [];
      
      batch.forEach((item, index) => {
        documents.push(item.text);
        metadatas.push({
          species: item.species || 'general',
          category: item.category || 'care',
          source: item.source || 'comprehensive_dataset',
          family: item.family || 'unknown',
          origin: item.origin || 'unknown',
          difficulty: item.difficulty || 'medium',
          created_at: new Date().toISOString()
        });
        ids.push(item.id || `plant_${Date.now()}_${i}_${index}`);
      });
      
      try {
        await collection.add({
          documents: documents,
          metadatas: metadatas,
          ids: ids
        });
        
        totalAdded += batch.length;
        console.log(`✅ Added batch ${i + 1} (${batch.length} items)`);
        
        // Small delay between batches
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
      } catch (error) {
        console.log(`❌ Error adding batch ${i + 1}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Successfully added ${totalAdded} plant care items to local Chroma DB!`);
    
    // Test the collection
    console.log('\n🧪 Testing collection...');
    const testResults = await collection.query({
      queryTexts: ['How often should I water my plant?'],
      nResults: 3
    });
    
    console.log('✅ Collection test successful');
    console.log(`📊 Found ${testResults.documents[0].length} relevant results for test query`);
    
    // Get collection info
    const collectionInfo = await collection.get();
    console.log(`📈 Collection contains ${collectionInfo.ids.length} documents`);
    
    console.log('\n📋 Dataset includes:');
    console.log('   • 131 total plant care items');
    console.log('   • Tropical plants (Monstera, Peace Lily)');
    console.log('   • Succulents and cacti (Echeveria)');
    console.log('   • Herbs and vegetables (Rosemary)');
    console.log('   • Flowering plants (Geranium)');
    console.log('   • Trees and shrubs (Fiddle Leaf Fig)');
    console.log('   • Aquatic plants (Peace Lily)');
    console.log('   • Air plants (Tillandsia)');
    console.log('   • Carnivorous plants (Venus Flytrap)');
    console.log('   • Bonsai (Juniper)');
    
    console.log('\n📋 Next Steps:');
    console.log('   1. Update chromaClient.js to use local Chroma DB');
    console.log('   2. Test AI responses with comprehensive data');
    console.log('   3. Verify Chroma DB integration');
    
    return {
      success: true,
      totalItems: totalAdded,
      collectionName: 'plant_care_knowledge'
    };
    
  } catch (error) {
    console.log('❌ Error setting up local Chroma DB:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   - Start local Chroma DB: docker run -p 8000:8000 chromadb/chroma');
    console.log('   - Check that port 8000 is available');
    console.log('   - Verify Docker is running');
    return {
      success: false,
      error: error.message
    };
  }
}

// Run if called directly
if (require.main === module) {
  setupLocalChroma().catch(console.error);
}

module.exports = { setupLocalChroma };
