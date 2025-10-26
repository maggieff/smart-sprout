#!/usr/bin/env node

/**
 * Add sponsor data to Chroma DB for AI training
 * This script processes sponsor data and adds it to the plant care knowledge base
 */

const fs = require('fs');
const path = require('path');
const { ChromaClient } = require('chromadb');

// Chroma DB configuration (using cloud instance)
const CHROMA_CONFIG = {
  path: 'https://api.trychroma.com',
  apiKey: 'ck-BPG2XTtPWBPa2tFsatrfHmbsBTLdJYtKsnX75g8ZccYg',
  tenant: '36db7d89-6330-46bf-a396-2836596dbd9a',
  database: 'plants'
};

async function addSponsorData() {
  console.log('🌱 Adding sponsor data to Chroma DB for AI training...\n');
  
  try {
    // Initialize Chroma client
    const chroma = new ChromaClient(CHROMA_CONFIG);
    console.log('✅ Connected to Chroma Cloud');
    
    // Get or create collection
    let collection;
    try {
      collection = await chroma.getCollection({
        name: 'plant_care_knowledge'
      });
      console.log('✅ Connected to existing plant care collection');
    } catch (error) {
      collection = await chroma.createCollection({
        name: 'plant_care_knowledge',
        metadata: { 
          description: 'Plant care tips and knowledge base with sponsor data',
          updated_at: new Date().toISOString()
        }
      });
      console.log('✅ Created new plant care collection');
    }
    
    // Example sponsor data - replace with your actual sponsor data
    const sponsorData = [
      {
        id: 'sponsor-001',
        species: 'Snake Plant',
        category: 'sponsor_product',
        text: 'Our premium plant food provides essential nutrients for Snake Plants. Apply monthly during growing season for optimal growth.',
        source: 'sponsor_data',
        sponsor: 'PlantCare Pro'
      },
      {
        id: 'sponsor-002', 
        species: 'Fiddle Leaf Fig',
        category: 'sponsor_tips',
        text: 'Use our specialized moisture meter to check soil moisture levels. Fiddle Leaf Figs prefer soil that is slightly moist but not wet.',
        source: 'sponsor_data',
        sponsor: 'PlantCare Pro'
      },
      {
        id: 'sponsor-003',
        species: 'Monstera',
        category: 'sponsor_equipment',
        text: 'Our humidity monitor helps maintain the 60-80% humidity that Monsteras love. Place near your plant for real-time readings.',
        source: 'sponsor_data',
        sponsor: 'PlantCare Pro'
      }
    ];
    
    console.log(`📚 Processing ${sponsorData.length} sponsor data items...`);
    
    // Prepare data for Chroma DB
    const documents = [];
    const metadatas = [];
    const ids = [];
    
    for (let i = 0; i < sponsorData.length; i++) {
      const item = sponsorData[i];
      
      documents.push(item.text);
      metadatas.push({
        species: item.species,
        category: item.category,
        source: item.source,
        sponsor: item.sponsor,
        created_at: new Date().toISOString()
      });
      ids.push(item.id);
      
      console.log(`📝 Processed: ${item.species} - ${item.category}`);
    }
    
    // Add documents to collection
    console.log('\n🔄 Adding sponsor data to Chroma DB...');
    await collection.add({
      documents: documents,
      metadatas: metadatas,
      ids: ids
    });
    
    console.log('✅ Successfully added sponsor data to Chroma DB');
    
    // Test the collection with sponsor data
    console.log('\n🧪 Testing sponsor data integration...');
    const testResults = await collection.query({
      queryTexts: ['What products do you recommend for plant care?'],
      nResults: 5
    });
    
    console.log('✅ Sponsor data test successful');
    console.log(`📊 Found ${testResults.documents[0].length} relevant results`);
    
    // Show some results
    console.log('\n📋 Sample results:');
    testResults.documents[0].forEach((doc, index) => {
      const metadata = testResults.metadatas[0][index];
      console.log(`   ${index + 1}. [${metadata.sponsor}] ${doc.substring(0, 80)}...`);
    });
    
    // Get collection info
    const collectionInfo = await collection.get();
    console.log(`\n📈 Collection now contains ${collectionInfo.ids.length} total documents`);
    
    console.log('\n🎉 Sponsor data integration complete!');
    console.log('\n📋 AI Assistant now has access to:');
    console.log('   - Sponsor product recommendations');
    console.log('   - Brand-specific care tips');
    console.log('   - Equipment suggestions');
    console.log('   - Enhanced plant care knowledge');
    
  } catch (error) {
    console.error('❌ Error adding sponsor data:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   - Check Chroma DB API credentials');
    console.log('   - Verify network connectivity');
    console.log('   - Ensure sponsor data format is correct');
    process.exit(1);
  }
}

// Function to add custom sponsor data
async function addCustomSponsorData(sponsorData) {
  console.log('🌱 Adding custom sponsor data to Chroma DB...\n');
  
  try {
    const chroma = new ChromaClient(CHROMA_CONFIG);
    const collection = await chroma.getCollection({
      name: 'plant_care_knowledge'
    });
    
    // Process custom data
    const documents = [];
    const metadatas = [];
    const ids = [];
    
    sponsorData.forEach((item, index) => {
      documents.push(item.text);
      metadatas.push({
        species: item.species || 'general',
        category: item.category || 'sponsor_tips',
        source: 'sponsor_data',
        sponsor: item.sponsor || 'Custom Sponsor',
        created_at: new Date().toISOString()
      });
      ids.push(item.id || `sponsor-custom-${Date.now()}-${index}`);
    });
    
    await collection.add({
      documents: documents,
      metadatas: metadatas,
      ids: ids
    });
    
    console.log(`✅ Added ${sponsorData.length} custom sponsor data items`);
    
  } catch (error) {
    console.error('❌ Error adding custom sponsor data:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  addSponsorData();
}

module.exports = { addSponsorData, addCustomSponsorData };
