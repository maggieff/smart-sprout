#!/usr/bin/env node

/**
 * Simple Chroma DB setup without server dependency
 */

const fs = require('fs');
const path = require('path');

async function setupSimpleChroma() {
  console.log('🧠 Setting up plant care knowledge base...\n');
  
  try {
    // Load plant care dataset
    const datasetPath = path.join(__dirname, 'data/plantCareDataset.json');
    const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
    
    console.log(`📚 Loaded ${dataset.length} plant care items`);
    
    // Create a simple knowledge base file
    const knowledgeBase = {
      items: dataset,
      created_at: new Date().toISOString(),
      version: '1.0.0'
    };
    
    // Save to backend directory
    const outputPath = path.join(__dirname, 'data/plantKnowledgeBase.json');
    fs.writeFileSync(outputPath, JSON.stringify(knowledgeBase, null, 2));
    
    console.log('✅ Plant care knowledge base created');
    console.log(`📁 Saved to: ${outputPath}`);
    
    // Create a simple search function
    const searchFunction = `
// Simple plant care knowledge search
function searchPlantKnowledge(query, species = null) {
  const knowledgeBase = require('./data/plantKnowledgeBase.json');
  const results = [];
  
  const lowerQuery = query.toLowerCase();
  
  knowledgeBase.items.forEach(item => {
    let score = 0;
    
    // Species match
    if (species && item.species.toLowerCase().includes(species.toLowerCase())) {
      score += 3;
    }
    
    // Text match
    if (item.text.toLowerCase().includes(lowerQuery)) {
      score += 2;
    }
    
    // Category match
    if (item.category && lowerQuery.includes(item.category)) {
      score += 1;
    }
    
    if (score > 0) {
      results.push({
        ...item,
        relevanceScore: score
      });
    }
  });
  
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 5);
}

module.exports = { searchPlantKnowledge };
`;
    
    const searchPath = path.join(__dirname, 'utils/plantKnowledgeSearch.js');
    fs.writeFileSync(searchPath, searchFunction);
    
    console.log('✅ Plant knowledge search function created');
    console.log(`📁 Saved to: ${searchPath}`);
    
    console.log('\n🎉 Plant care knowledge base setup complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Restart the backend server: npm start');
    console.log('   2. The AI assistant will now use the knowledge base for better responses');
    console.log('   3. Test by asking: "Should I water my Snake Plant today?"');
    
  } catch (error) {
    console.error('❌ Error setting up knowledge base:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   - Check that the dataset file exists');
    console.log('   - Ensure you have write permissions in the backend directory');
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupSimpleChroma();
}

module.exports = { setupSimpleChroma };

