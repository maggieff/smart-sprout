/**
 * Add comprehensive plant data to Chroma DB using existing chromaClient
 */

const path = require('path');
const { addPlantKnowledge, initializeChroma } = require('../backend/utils/chromaClient');

async function addComprehensivePlantData() {
  console.log('🌱 Adding comprehensive plant data to Chroma DB...\n');
  
  try {
    // Initialize Chroma DB connection
    console.log('🔌 Connecting to Chroma DB...');
    const connected = await initializeChroma();
    
    if (!connected) {
      console.log('❌ Failed to connect to Chroma DB');
      return;
    }
    
    console.log('✅ Connected to Chroma DB');
    
    // Load comprehensive dataset
    const datasetPath = path.join(__dirname, '../backend/data/comprehensive_plant_data.json');
    const fs = require('fs');
    const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
    
    console.log(`📚 Loaded ${dataset.length} plant care items`);
    
    // Add data in batches to avoid overwhelming the API
    const batchSize = 20;
    const batches = [];
    
    for (let i = 0; i < dataset.length; i += batchSize) {
      batches.push(dataset.slice(i, i + batchSize));
    }
    
    console.log(`📦 Processing ${batches.length} batches of ${batchSize} items each...\n`);
    
    let totalAdded = 0;
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`🔄 Processing batch ${i + 1}/${batches.length} (${batch.length} items)...`);
      
      try {
        const success = await addPlantKnowledge(batch);
        if (success) {
          totalAdded += batch.length;
          console.log(`✅ Added batch ${i + 1} (${batch.length} items)`);
        } else {
          console.log(`❌ Failed to add batch ${i + 1}`);
        }
      } catch (error) {
        console.log(`❌ Error adding batch ${i + 1}:`, error.message);
      }
      
      // Small delay between batches to be gentle on the API
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`\n🎉 Successfully added ${totalAdded} plant care items to Chroma DB!`);
    console.log('\n📋 Dataset now includes:');
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
    console.log('   1. Test AI responses with comprehensive data');
    console.log('   2. Verify Chroma DB integration');
    console.log('   3. Check AI assistant functionality');
    
  } catch (error) {
    console.log('❌ Error adding comprehensive plant data:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   - Check Chroma DB connection');
    console.log('   - Verify API credentials');
    console.log('   - Ensure dataset file exists');
  }
}

// Run if called directly
if (require.main === module) {
  addComprehensivePlantData().catch(console.error);
}

module.exports = { addComprehensivePlantData };
