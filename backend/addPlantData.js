/**
 * Script to add more plant care data to the knowledge base
 */

const fs = require('fs');
const path = require('path');

// Load existing knowledge base
const knowledgeBasePath = path.join(__dirname, 'data/plantKnowledgeBase.json');
const knowledgeBase = JSON.parse(fs.readFileSync(knowledgeBasePath, 'utf8'));

// New plant care data to add
const newPlantData = [
  {
    id: `plantcare-${Date.now()}-001`,
    species: "Pothos",
    category: "propagation",
    text: "Pothos can be easily propagated in water. Cut a stem with 4-6 leaves, remove bottom leaves, and place in water. Change water weekly and roots will appear in 2-3 weeks.",
    embedding: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
  },
  {
    id: `plantcare-${Date.now()}-002`,
    species: "Fiddle Leaf Fig",
    category: "troubleshooting",
    text: "Brown spots on Fiddle Leaf Fig leaves usually indicate overwatering. Allow soil to dry between waterings and ensure good drainage.",
    embedding: [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.1]
  },
  {
    id: `plantcare-${Date.now()}-003`,
    species: "Monstera",
    category: "lighting",
    text: "Monstera plants need bright, indirect light to develop their characteristic split leaves. Too little light results in solid leaves without splits.",
    embedding: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.1, 0.2]
  }
];

// Add new data to knowledge base
knowledgeBase.items.push(...newPlantData);

// Save updated knowledge base
fs.writeFileSync(knowledgeBasePath, JSON.stringify(knowledgeBase, null, 2));

console.log(`✅ Added ${newPlantData.length} new plant care items to knowledge base`);
console.log(`📊 Total items in knowledge base: ${knowledgeBase.items.length}`);

