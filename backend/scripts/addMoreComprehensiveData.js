const fs = require('fs');
const path = require('path');

// Load existing data
let existingData = [];
try {
  const dataPath = path.join(__dirname, '../data/plantCareDataset.json');
  const rawData = fs.readFileSync(dataPath, 'utf8');
  existingData = JSON.parse(rawData);
  console.log(`✅ Loaded ${existingData.length} existing plant care items`);
} catch (error) {
  console.error('❌ Error loading existing data:', error.message);
}

// Additional comprehensive plant data to reach 250+ items
const morePlantData = [
  // More Succulents
  { id: 'succ-101', species: 'Jade Plant', category: 'watering', text: 'Water Jade Plant when soil is completely dry. These succulents store water in their leaves.' },
  { id: 'succ-102', species: 'Jade Plant', category: 'light', text: 'Jade Plant needs bright light for 4-6 hours daily. Some direct sun is beneficial.' },
  { id: 'succ-103', species: 'Jade Plant', category: 'pruning', text: 'Prune Jade Plant to maintain shape and encourage branching. Cut above leaf nodes.' },
  { id: 'succ-104', species: 'Jade Plant', category: 'propagation', text: 'Propagate Jade Plant from stem or leaf cuttings. Let cuttings dry before planting.' },
  { id: 'succ-105', species: 'Jade Plant', category: 'fertilizing', text: 'Feed Jade Plant monthly with diluted succulent fertilizer during growing season.' },
  
  { id: 'succ-106', species: 'Hens and Chicks', category: 'watering', text: 'Water Hens and Chicks sparingly. Let soil dry completely between waterings.' },
  { id: 'succ-107', species: 'Hens and Chicks', category: 'light', text: 'Hens and Chicks need full sun - at least 6 hours of direct sunlight daily.' },
  { id: 'succ-108', species: 'Hens and Chicks', category: 'propagation', text: 'Hens and Chicks produce offsets that can be separated and replanted.' },
  { id: 'succ-109', species: 'Hens and Chicks', category: 'winter', text: 'Hens and Chicks are cold hardy and can survive winter outdoors in many climates.' },
  { id: 'succ-110', species: 'Hens and Chicks', category: 'soil', text: 'Use well-draining soil mix with sand or perlite for Hens and Chicks.' },
  
  { id: 'succ-111', species: 'String of Pearls', category: 'watering', text: 'Water String of Pearls when soil is dry. These plants are very drought tolerant.' },
  { id: 'succ-112', species: 'String of Pearls', category: 'light', text: 'String of Pearls needs bright, indirect light. Some direct morning sun is okay.' },
  { id: 'succ-113', species: 'String of Pearls', category: 'display', text: 'String of Pearls looks best in hanging baskets where stems can cascade down.' },
  { id: 'succ-114', species: 'String of Pearls', category: 'propagation', text: 'Propagate String of Pearls by placing stem cuttings on soil surface.' },
  { id: 'succ-115', species: 'String of Pearls', category: 'troubleshooting', text: 'Shriveled pearls indicate underwatering. Mushy pearls mean overwatering.' },
  
  // More Herbs
  { id: 'herb-101', species: 'Thyme', category: 'watering', text: 'Water Thyme when soil feels dry. These herbs prefer slightly dry conditions.' },
  { id: 'herb-102', species: 'Thyme', category: 'light', text: 'Thyme needs full sun - at least 6 hours of direct sunlight daily.' },
  { id: 'herb-103', species: 'Thyme', category: 'harvesting', text: 'Harvest Thyme by cutting stems just above a leaf node. Regular harvesting promotes growth.' },
  { id: 'herb-104', species: 'Thyme', category: 'pruning', text: 'Prune Thyme regularly to prevent woody growth and maintain compact shape.' },
  { id: 'herb-105', species: 'Thyme', category: 'winter', text: 'Thyme is perennial and can survive winter in many climates with protection.' },
  
  { id: 'herb-106', species: 'Oregano', category: 'watering', text: 'Water Oregano when soil is dry to touch. These herbs prefer well-drained soil.' },
  { id: 'herb-107', species: 'Oregano', category: 'light', text: 'Oregano thrives in full sun. Provide at least 6 hours of direct sunlight daily.' },
  { id: 'herb-108', species: 'Oregano', category: 'harvesting', text: 'Harvest Oregano leaves before flowering for best flavor. Cut stems above leaf nodes.' },
  { id: 'herb-109', species: 'Oregano', category: 'fertilizing', text: 'Feed Oregano lightly with balanced fertilizer once in spring.' },
  { id: 'herb-110', species: 'Oregano', category: 'propagation', text: 'Propagate Oregano from stem cuttings or by dividing established plants.' },
  
  { id: 'herb-111', species: 'Sage', category: 'watering', text: 'Water Sage when soil is dry. These herbs are drought tolerant once established.' },
  { id: 'herb-112', species: 'Sage', category: 'light', text: 'Sage needs full sun for best growth and flavor development.' },
  { id: 'herb-113', species: 'Sage', category: 'harvesting', text: 'Harvest Sage leaves as needed. Pick before flowering for best flavor.' },
  { id: 'herb-114', species: 'Sage', category: 'pruning', text: 'Prune Sage in spring to remove dead growth and encourage new shoots.' },
  { id: 'herb-115', species: 'Sage', category: 'winter', text: 'Sage is hardy and can survive winter in many climates with minimal protection.' },
  
  // More Flowering Plants
  { id: 'flow-101', species: 'Begonia', category: 'watering', text: 'Water Begonia when top inch of soil is dry. Keep soil evenly moist but not soggy.' },
  { id: 'flow-102', species: 'Begonia', category: 'light', text: 'Begonia prefers bright, indirect light. Some varieties can handle direct morning sun.' },
  { id: 'flow-103', species: 'Begonia', category: 'humidity', text: 'Begonia appreciates higher humidity. Mist leaves regularly or use humidifier.' },
  { id: 'flow-104', species: 'Begonia', category: 'fertilizing', text: 'Feed Begonia monthly with balanced liquid fertilizer during growing season.' },
  { id: 'flow-105', species: 'Begonia', category: 'deadheading', text: 'Remove spent flowers regularly to encourage continuous blooming.' },
  
  { id: 'flow-106', species: 'Impatiens', category: 'watering', text: 'Keep Impatiens soil consistently moist. These plants wilt quickly when dry.' },
  { id: 'flow-107', species: 'Impatiens', category: 'light', text: 'Impatiens prefer partial shade. Too much direct sun can burn the leaves.' },
  { id: 'flow-108', species: 'Impatiens', category: 'fertilizing', text: 'Feed Impatiens every 2 weeks with balanced liquid fertilizer for best blooms.' },
  { id: 'flow-109', species: 'Impatiens', category: 'pinching', text: 'Pinch back Impatiens to encourage bushier growth and more flowers.' },
  { id: 'flow-110', species: 'Impatiens', category: 'propagation', text: 'Propagate Impatiens easily from stem cuttings in water or moist soil.' },
  
  { id: 'flow-111', species: 'Petunia', category: 'watering', text: 'Water Petunias regularly to keep soil moist. They need consistent moisture for best blooms.' },
  { id: 'flow-112', species: 'Petunia', category: 'light', text: 'Petunias need full sun - at least 6 hours of direct sunlight daily.' },
  { id: 'flow-113', species: 'Petunia', category: 'deadheading', text: 'Deadhead Petunias regularly to encourage continuous flowering throughout season.' },
  { id: 'flow-114', species: 'Petunia', category: 'fertilizing', text: 'Feed Petunias weekly with high-phosphorus fertilizer for abundant blooms.' },
  { id: 'flow-115', species: 'Petunia', category: 'pruning', text: 'Cut back leggy Petunias by half to encourage bushier growth and more flowers.' },
  
  // More Tropical Plants
  { id: 'trop-101', species: 'Calathea', category: 'watering', text: 'Keep Calathea soil evenly moist but not soggy. Use filtered or distilled water.' },
  { id: 'trop-102', species: 'Calathea', category: 'light', text: 'Calathea prefers bright, indirect light. Avoid direct sun which can fade leaf patterns.' },
  { id: 'trop-103', species: 'Calathea', category: 'humidity', text: 'Calathea needs high humidity. Mist daily or use humidifier to prevent brown edges.' },
  { id: 'trop-104', species: 'Calathea', category: 'temperature', text: 'Calathea prefers temperatures between 65-80°F. Avoid cold drafts.' },
  { id: 'trop-105', species: 'Calathea', category: 'fertilizing', text: 'Feed Calathea monthly with diluted liquid fertilizer during growing season.' },
  
  { id: 'trop-106', species: 'Maranta', category: 'watering', text: 'Water Maranta when top inch of soil is dry. Keep soil consistently moist.' },
  { id: 'trop-107', species: 'Maranta', category: 'light', text: 'Maranta prefers bright, indirect light. Too much sun can fade the leaf patterns.' },
  { id: 'trop-108', species: 'Maranta', category: 'humidity', text: 'Maranta needs high humidity. Place on pebble tray or use humidifier.' },
  { id: 'trop-109', species: 'Maranta', category: 'movement', text: 'Maranta leaves move throughout the day - this is normal behavior.' },
  { id: 'trop-110', species: 'Maranta', category: 'fertilizing', text: 'Feed Maranta monthly with balanced liquid fertilizer during growing season.' },
  
  { id: 'trop-111', species: 'Anthurium', category: 'watering', text: 'Water Anthurium when top inch of soil is dry. Keep soil evenly moist.' },
  { id: 'trop-112', species: 'Anthurium', category: 'light', text: 'Anthurium needs bright, indirect light. Some direct morning sun is beneficial.' },
  { id: 'trop-113', species: 'Anthurium', category: 'humidity', text: 'Anthurium appreciates high humidity. Mist leaves regularly or use humidifier.' },
  { id: 'trop-114', species: 'Anthurium', category: 'fertilizing', text: 'Feed Anthurium monthly with balanced liquid fertilizer for best flowering.' },
  { id: 'trop-115', species: 'Anthurium', category: 'repotting', text: 'Repot Anthurium every 2-3 years in spring using well-draining potting mix.' },
  
  // More Vining Plants
  { id: 'vine-101', species: 'Tradescantia', category: 'watering', text: 'Water Tradescantia when top inch of soil is dry. Allow soil to dry between waterings.' },
  { id: 'vine-102', species: 'Tradescantia', category: 'light', text: 'Tradescantia needs bright, indirect light. Variegated varieties need more light.' },
  { id: 'vine-103', species: 'Tradescantia', category: 'fertilizing', text: 'Feed Tradescantia monthly with balanced liquid fertilizer during growing season.' },
  { id: 'vine-104', species: 'Tradescantia', category: 'propagation', text: 'Propagate Tradescantia easily from stem cuttings in water or soil.' },
  { id: 'vine-105', species: 'Tradescantia', category: 'pruning', text: 'Prune Tradescantia regularly to maintain shape and encourage bushiness.' },
  
  { id: 'vine-106', species: 'String of Hearts', category: 'watering', text: 'Water String of Hearts when soil is dry. These succulents store water in their leaves.' },
  { id: 'vine-107', species: 'String of Hearts', category: 'light', text: 'String of Hearts needs bright, indirect light. Some direct morning sun is okay.' },
  { id: 'vine-108', species: 'String of Hearts', category: 'display', text: 'String of Hearts looks beautiful in hanging baskets where it can cascade down.' },
  { id: 'vine-109', species: 'String of Hearts', category: 'propagation', text: 'Propagate String of Hearts from stem cuttings or by placing tubers on soil.' },
  { id: 'vine-110', species: 'String of Hearts', category: 'fertilizing', text: 'Feed String of Hearts monthly with diluted succulent fertilizer during growing season.' },
  
  { id: 'vine-111', species: 'Hoya', category: 'watering', text: 'Water Hoya when soil is dry to touch. These plants prefer to dry out between waterings.' },
  { id: 'vine-112', species: 'Hoya', category: 'light', text: 'Hoya needs bright, indirect light. Some direct morning sun can encourage flowering.' },
  { id: 'vine-113', species: 'Hoya', category: 'fertilizing', text: 'Feed Hoya monthly with balanced liquid fertilizer during growing season.' },
  { id: 'vine-114', species: 'Hoya', category: 'flowering', text: 'Hoya flowers on old spurs, so avoid cutting them off when pruning.' },
  { id: 'vine-115', species: 'Hoya', category: 'repotting', text: 'Hoya prefers to be root-bound. Only repot when absolutely necessary.' },
  
  // More Ferns
  { id: 'fern-101', species: 'Staghorn Fern', category: 'watering', text: 'Water Staghorn Fern by soaking the root ball weekly. Let it drain completely.' },
  { id: 'fern-102', species: 'Staghorn Fern', category: 'light', text: 'Staghorn Fern needs bright, indirect light. Some direct morning sun is beneficial.' },
  { id: 'fern-103', species: 'Staghorn Fern', category: 'mounting', text: 'Mount Staghorn Fern on wood or cork bark for best growth and display.' },
  { id: 'fern-104', species: 'Staghorn Fern', category: 'fertilizing', text: 'Feed Staghorn Fern monthly with diluted liquid fertilizer during growing season.' },
  { id: 'fern-105', species: 'Staghorn Fern', category: 'humidity', text: 'Staghorn Fern needs high humidity. Mist regularly or use humidifier.' },
  
  { id: 'fern-106', species: 'Rabbit Foot Fern', category: 'watering', text: 'Keep Rabbit Foot Fern soil evenly moist. Water when top inch feels dry.' },
  { id: 'fern-107', species: 'Rabbit Foot Fern', category: 'light', text: 'Rabbit Foot Fern prefers bright, indirect light. Avoid direct sun.' },
  { id: 'fern-108', species: 'Rabbit Foot Fern', category: 'humidity', text: 'Rabbit Foot Fern needs high humidity. Place on pebble tray with water.' },
  { id: 'fern-109', species: 'Rabbit Foot Fern', category: 'fertilizing', text: 'Feed Rabbit Foot Fern monthly with balanced liquid fertilizer during growing season.' },
  { id: 'fern-110', species: 'Rabbit Foot Fern', category: 'repotting', text: 'Repot Rabbit Foot Fern annually in spring using peat-based potting mix.' },
  
  // More Palms
  { id: 'palm-101', species: 'Parlor Palm', category: 'watering', text: 'Water Parlor Palm when top inch of soil is dry. Keep soil evenly moist.' },
  { id: 'palm-102', species: 'Parlor Palm', category: 'light', text: 'Parlor Palm tolerates low to bright indirect light. Avoid direct sun.' },
  { id: 'palm-103', species: 'Parlor Palm', category: 'humidity', text: 'Parlor Palm appreciates higher humidity. Mist leaves regularly.' },
  { id: 'palm-104', species: 'Parlor Palm', category: 'fertilizing', text: 'Feed Parlor Palm monthly with balanced liquid fertilizer during growing season.' },
  { id: 'palm-105', species: 'Parlor Palm', category: 'repotting', text: 'Repot Parlor Palm every 2-3 years in spring when roots fill the container.' },
  
  { id: 'palm-106', species: 'Lady Palm', category: 'watering', text: 'Water Lady Palm when top 2 inches of soil are dry. Water deeply and allow to drain.' },
  { id: 'palm-107', species: 'Lady Palm', category: 'light', text: 'Lady Palm prefers bright, indirect light. Can tolerate lower light conditions.' },
  { id: 'palm-108', species: 'Lady Palm', category: 'humidity', text: 'Lady Palm needs high humidity. Mist regularly or use humidifier.' },
  { id: 'palm-109', species: 'Lady Palm', category: 'fertilizing', text: 'Feed Lady Palm monthly with palm-specific fertilizer during growing season.' },
  { id: 'palm-110', species: 'Lady Palm', category: 'pruning', text: 'Remove dead or yellow fronds by cutting at the base of the stem.' },
  
  // Seasonal Care
  { id: 'season-001', species: 'General', category: 'spring', text: 'Spring is the best time for repotting, fertilizing, and propagating most houseplants.' },
  { id: 'season-002', species: 'General', category: 'summer', text: 'Summer is peak growing season. Increase watering and fertilizing frequency.' },
  { id: 'season-003', species: 'General', category: 'fall', text: 'Fall is time to reduce fertilizing and prepare plants for winter dormancy.' },
  { id: 'season-004', species: 'General', category: 'winter', text: 'Winter care involves reducing watering, stopping fertilizing, and providing adequate light.' },
  { id: 'season-005', species: 'General', category: 'dormancy', text: 'Many plants go dormant in winter. Reduce watering and stop fertilizing during this time.' },
  
  // Problem Solving
  { id: 'prob-001', species: 'General', category: 'yellow-leaves', text: 'Yellow leaves often indicate overwatering, underwatering, or nutrient deficiency.' },
  { id: 'prob-002', species: 'General', category: 'brown-tips', text: 'Brown leaf tips usually indicate low humidity, over-fertilizing, or water quality issues.' },
  { id: 'prob-003', species: 'General', category: 'drooping', text: 'Drooping leaves can mean underwatering, overwatering, or root problems.' },
  { id: 'prob-004', species: 'General', category: 'no-growth', text: 'Lack of growth may indicate insufficient light, nutrients, or need for repotting.' },
  { id: 'prob-005', species: 'General', category: 'leaf-drop', text: 'Leaf drop can be caused by overwatering, underwatering, or environmental stress.' },
  { id: 'prob-006', species: 'General', category: 'pests', text: 'Common pests include spider mites, mealybugs, aphids, and scale insects.' },
  { id: 'prob-007', species: 'General', category: 'diseases', text: 'Plant diseases often result from overwatering, poor air circulation, or contaminated soil.' },
  { id: 'prob-008', species: 'General', category: 'root-rot', text: 'Root rot is caused by overwatering. Remove affected roots and repot in fresh soil.' },
  { id: 'prob-009', species: 'General', category: 'wilting', text: 'Wilting can indicate underwatering, overwatering, or root damage.' },
  { id: 'prob-010', species: 'General', category: 'stunted-growth', text: 'Stunted growth may indicate insufficient light, nutrients, or need for larger pot.' }
];

// Combine existing and new data
const combinedData = [...existingData, ...morePlantData];

// Remove duplicates based on id
const uniqueData = combinedData.filter((item, index, self) => 
  index === self.findIndex(t => t.id === item.id)
);

console.log(`✅ Added ${morePlantData.length} new plant care items`);
console.log(`📊 Total plant care items: ${uniqueData.length}`);

// Save updated data
try {
  const outputPath = path.join(__dirname, '../data/plantCareDataset.json');
  fs.writeFileSync(outputPath, JSON.stringify(uniqueData, null, 2));
  console.log(`✅ Successfully saved ${uniqueData.length} plant care items to plantCareDataset.json`);
} catch (error) {
  console.error('❌ Error saving data:', error.message);
}
