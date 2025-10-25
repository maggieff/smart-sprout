
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
