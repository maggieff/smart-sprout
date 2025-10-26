/**
 * Add more plant care data to your working knowledge base
 */

const fs = require('fs');
const path = require('path');

// Load existing knowledge base
const knowledgeBasePath = path.join(__dirname, 'data/plantKnowledgeBase.json');
const knowledgeBase = JSON.parse(fs.readFileSync(knowledgeBasePath, 'utf8'));

// New comprehensive plant care data
const newPlantData = [
  // Succulent care
  {
    id: `plantcare-${Date.now()}-001`,
    species: "Succulent",
    category: "watering",
    text: "Succulents need very little water. Water only when soil is completely dry, usually every 2-4 weeks. Overwatering is the #1 cause of succulent death.",
    embedding: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
  },
  {
    id: `plantcare-${Date.now()}-002`,
    species: "Succulent",
    category: "lighting",
    text: "Succulents need bright, direct sunlight for 6+ hours daily. Place near south-facing windows for best results.",
    embedding: [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.1]
  },
  
  // Spider Plant care
  {
    id: `plantcare-${Date.now()}-003`,
    species: "Spider Plant",
    category: "watering",
    text: "Spider Plants like consistently moist soil. Water when top inch of soil feels dry. They're very forgiving and great for beginners.",
    embedding: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.1, 0.2]
  },
  {
    id: `plantcare-${Date.now()}-004`,
    species: "Spider Plant",
    category: "propagation",
    text: "Spider Plants produce baby plantlets that can be easily propagated. Cut the plantlet and place in water or soil.",
    embedding: [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.1, 0.2, 0.3]
  },
  
  // ZZ Plant care
  {
    id: `plantcare-${Date.now()}-005`,
    species: "ZZ Plant",
    category: "watering",
    text: "ZZ Plants are extremely drought tolerant. Water only when soil is completely dry, every 2-3 weeks. They store water in their rhizomes.",
    embedding: [0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.1, 0.2, 0.3, 0.4]
  },
  {
    id: `plantcare-${Date.now()}-006`,
    species: "ZZ Plant",
    category: "lighting",
    text: "ZZ Plants can tolerate low light conditions but prefer bright, indirect light. They're perfect for offices and dim rooms.",
    embedding: [0.6, 0.7, 0.8, 0.9, 1.0, 0.1, 0.2, 0.3, 0.4, 0.5]
  },
  
  // Aloe Vera care
  {
    id: `plantcare-${Date.now()}-007`,
    species: "Aloe Vera",
    category: "watering",
    text: "Aloe Vera is a succulent that needs minimal water. Water deeply but infrequently, allowing soil to dry completely between waterings.",
    embedding: [0.7, 0.8, 0.9, 1.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6]
  },
  {
    id: `plantcare-${Date.now()}-008`,
    species: "Aloe Vera",
    category: "troubleshooting",
    text: "If Aloe Vera leaves turn brown or mushy, it's usually overwatering. Reduce watering frequency and ensure good drainage.",
    embedding: [0.8, 0.9, 1.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]
  },
  
  // Peace Lily care
  {
    id: `plantcare-${Date.now()}-009`,
    species: "Peace Lily",
    category: "watering",
    text: "Peace Lilies like consistently moist soil but not soggy. Water when top inch of soil feels dry. They'll droop when thirsty.",
    embedding: [0.9, 1.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]
  },
  {
    id: `plantcare-${Date.now()}-010`,
    species: "Peace Lily",
    category: "lighting",
    text: "Peace Lilies prefer bright, indirect light but can tolerate low light. Avoid direct sunlight which can burn their leaves.",
    embedding: [1.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]
  }
];

// Add new data to knowledge base
knowledgeBase.items.push(...newPlantData);

// Save updated knowledge base
fs.writeFileSync(knowledgeBasePath, JSON.stringify(knowledgeBase, null, 2));

console.log(`✅ Added ${newPlantData.length} new plant care items to knowledge base`);
console.log(`📊 Total items in knowledge base: ${knowledgeBase.items.length}`);
console.log('\n🌱 New species added:');
console.log('   - Succulent (watering, lighting)');
console.log('   - Spider Plant (watering, propagation)');
console.log('   - ZZ Plant (watering, lighting)');
console.log('   - Aloe Vera (watering, troubleshooting)');
console.log('   - Peace Lily (watering, lighting)');
console.log('\n🎯 Your AI assistant now has even more sophisticated responses!');

