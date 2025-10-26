const fs = require('fs');
const path = require('path');
const axios = require('axios');

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

// Comprehensive plant data from multiple sources
const additionalPlantData = [
  // Succulents and Cacti
  { id: 'succ-001', species: 'Echeveria', category: 'watering', text: 'Water Echeveria when soil is completely dry. Soak thoroughly and let excess water drain. Reduce watering in winter.' },
  { id: 'succ-002', species: 'Echeveria', category: 'light', text: 'Echeveria needs bright, direct sunlight for 6+ hours daily. Place near south-facing windows for best results.' },
  { id: 'succ-003', species: 'Echeveria', category: 'soil', text: 'Use well-draining cactus/succulent soil mix. Add perlite or sand to improve drainage.' },
  { id: 'succ-004', species: 'Echeveria', category: 'propagation', text: 'Propagate Echeveria from leaf cuttings. Let leaves callous for 2-3 days before placing on soil.' },
  { id: 'succ-005', species: 'Echeveria', category: 'troubleshooting', text: 'Yellow, mushy leaves indicate overwatering. Brown, crispy leaves mean underwatering or too much sun.' },
  
  { id: 'cact-001', species: 'Barrel Cactus', category: 'watering', text: 'Water Barrel Cactus monthly in summer, every 2-3 months in winter. Let soil dry completely between waterings.' },
  { id: 'cact-002', species: 'Barrel Cactus', category: 'light', text: 'Barrel Cactus thrives in full sun. Provide 8+ hours of direct sunlight daily.' },
  { id: 'cact-003', species: 'Barrel Cactus', category: 'soil', text: 'Use fast-draining cactus soil. Mix regular potting soil with sand and perlite for better drainage.' },
  { id: 'cact-004', species: 'Barrel Cactus', category: 'fertilizing', text: 'Fertilize Barrel Cactus once in spring with diluted cactus fertilizer. Avoid over-fertilizing.' },
  
  { id: 'cact-005', species: 'Christmas Cactus', category: 'watering', text: 'Keep Christmas Cactus soil evenly moist but not soggy. Water when top inch of soil feels dry.' },
  { id: 'cact-006', species: 'Christmas Cactus', category: 'light', text: 'Christmas Cactus prefers bright, indirect light. Avoid direct sun which can burn leaves.' },
  { id: 'cact-007', species: 'Christmas Cactus', category: 'flowering', text: 'To encourage blooming, provide 12-14 hours of darkness daily for 6-8 weeks before desired bloom time.' },
  { id: 'cact-008', species: 'Christmas Cactus', category: 'temperature', text: 'Christmas Cactus prefers temperatures between 60-70°F. Cooler temps help trigger flowering.' },
  
  // Herbs
  { id: 'herb-001', species: 'Basil', category: 'watering', text: 'Water Basil when top inch of soil is dry. Keep soil consistently moist but not waterlogged.' },
  { id: 'herb-002', species: 'Basil', category: 'light', text: 'Basil needs 6-8 hours of bright, direct sunlight daily. Place in south-facing window or under grow lights.' },
  { id: 'herb-003', species: 'Basil', category: 'harvesting', text: 'Harvest Basil by pinching off leaves above a node. This encourages bushier growth.' },
  { id: 'herb-004', species: 'Basil', category: 'pruning', text: 'Pinch off flower buds to prevent bolting and maintain leaf production.' },
  { id: 'herb-005', species: 'Basil', category: 'fertilizing', text: 'Feed Basil with balanced liquid fertilizer every 2-3 weeks during growing season.' },
  
  { id: 'herb-006', species: 'Mint', category: 'watering', text: 'Keep Mint soil consistently moist. Water when top inch feels dry to touch.' },
  { id: 'herb-007', species: 'Mint', category: 'light', text: 'Mint grows best in partial shade to full sun. 4-6 hours of sunlight is ideal.' },
  { id: 'herb-008', species: 'Mint', category: 'containment', text: 'Plant Mint in containers to prevent spreading. It can be invasive in garden beds.' },
  { id: 'herb-009', species: 'Mint', category: 'harvesting', text: 'Harvest Mint by cutting stems just above a leaf node. Regular harvesting promotes growth.' },
  { id: 'herb-010', species: 'Mint', category: 'propagation', text: 'Propagate Mint easily from stem cuttings placed in water until roots form.' },
  
  { id: 'herb-011', species: 'Rosemary', category: 'watering', text: 'Water Rosemary when soil is dry to touch. Allow soil to dry between waterings to prevent root rot.' },
  { id: 'herb-012', species: 'Rosemary', category: 'light', text: 'Rosemary needs full sun - at least 6-8 hours of direct sunlight daily.' },
  { id: 'herb-013', species: 'Rosemary', category: 'soil', text: 'Use well-draining soil with sand or perlite. Rosemary prefers slightly alkaline soil.' },
  { id: 'herb-014', species: 'Rosemary', category: 'pruning', text: 'Prune Rosemary regularly to maintain shape and encourage new growth. Never cut into woody stems.' },
  { id: 'herb-015', species: 'Rosemary', category: 'winter', text: 'Protect Rosemary from freezing temperatures. Move indoors or cover during cold spells.' },
  
  // Flowering Plants
  { id: 'flow-001', species: 'African Violet', category: 'watering', text: 'Water African Violets from bottom to avoid wetting leaves. Use room temperature water.' },
  { id: 'flow-002', species: 'African Violet', category: 'light', text: 'African Violets prefer bright, indirect light. East or north-facing windows work well.' },
  { id: 'flow-003', species: 'African Violet', category: 'humidity', text: 'African Violets need high humidity. Place on pebble tray or use humidifier.' },
  { id: 'flow-004', species: 'African Violet', category: 'fertilizing', text: 'Feed African Violets with balanced fertilizer every 2-3 weeks during growing season.' },
  { id: 'flow-005', species: 'African Violet', category: 'repotting', text: 'Repot African Violets annually in spring. Use shallow pots as they have shallow root systems.' },
  
  { id: 'flow-006', species: 'Orchid', category: 'watering', text: 'Water Orchids when potting medium is nearly dry. Soak thoroughly and drain completely.' },
  { id: 'flow-007', species: 'Orchid', category: 'light', text: 'Orchids need bright, indirect light. East-facing windows provide ideal conditions.' },
  { id: 'flow-008', species: 'Orchid', category: 'humidity', text: 'Orchids require 50-70% humidity. Use humidifier or pebble tray to increase moisture.' },
  { id: 'flow-009', species: 'Orchid', category: 'fertilizing', text: 'Fertilize Orchids weekly with diluted orchid fertilizer during growing season.' },
  { id: 'flow-010', species: 'Orchid', category: 'repotting', text: 'Repot Orchids every 1-2 years using orchid-specific potting mix with bark and moss.' },
  
  { id: 'flow-011', species: 'Geranium', category: 'watering', text: 'Water Geraniums when soil surface feels dry. Water thoroughly and allow excess to drain.' },
  { id: 'flow-012', species: 'Geranium', category: 'light', text: 'Geraniums need full sun - at least 6 hours of direct sunlight daily for best flowering.' },
  { id: 'flow-013', species: 'Geranium', category: 'deadheading', text: 'Remove spent flowers regularly to encourage continuous blooming throughout season.' },
  { id: 'flow-014', species: 'Geranium', category: 'fertilizing', text: 'Feed Geraniums with balanced fertilizer every 2-3 weeks during growing season.' },
  { id: 'flow-015', species: 'Geranium', category: 'winter', text: 'Overwinter Geraniums indoors in cool, bright location. Reduce watering in winter.' },
  
  // Tropical Plants
  { id: 'trop-001', species: 'Bird of Paradise', category: 'watering', text: 'Water Bird of Paradise when top 2 inches of soil are dry. Water deeply and allow to drain.' },
  { id: 'trop-002', species: 'Bird of Paradise', category: 'light', text: 'Bird of Paradise needs bright, indirect light. Some direct morning sun is beneficial.' },
  { id: 'trop-003', species: 'Bird of Paradise', category: 'humidity', text: 'Bird of Paradise prefers high humidity. Mist leaves regularly or use humidifier.' },
  { id: 'trop-004', species: 'Bird of Paradise', category: 'fertilizing', text: 'Feed Bird of Paradise monthly with balanced liquid fertilizer during growing season.' },
  { id: 'trop-005', species: 'Bird of Paradise', category: 'repotting', text: 'Repot Bird of Paradise every 2-3 years in spring. Use well-draining potting mix.' },
  
  { id: 'trop-006', species: 'Rubber Plant', category: 'watering', text: 'Water Rubber Plant when top inch of soil is dry. Allow soil to dry between waterings.' },
  { id: 'trop-007', species: 'Rubber Plant', category: 'light', text: 'Rubber Plant thrives in bright, indirect light. Can tolerate some direct morning sun.' },
  { id: 'trop-008', species: 'Rubber Plant', category: 'cleaning', text: 'Wipe Rubber Plant leaves regularly with damp cloth to remove dust and improve photosynthesis.' },
  { id: 'trop-009', species: 'Rubber Plant', category: 'pruning', text: 'Prune Rubber Plant to control height and encourage branching. Cut just above a leaf node.' },
  { id: 'trop-010', species: 'Rubber Plant', category: 'propagation', text: 'Propagate Rubber Plant from stem cuttings. Root in water or moist soil.' },
  
  { id: 'trop-011', species: 'Dracaena', category: 'watering', text: 'Water Dracaena when soil is dry to touch. These plants are drought tolerant.' },
  { id: 'trop-012', species: 'Dracaena', category: 'light', text: 'Dracaena prefers bright, indirect light. Can tolerate lower light conditions.' },
  { id: 'trop-013', species: 'Dracaena', category: 'fertilizing', text: 'Feed Dracaena monthly with balanced liquid fertilizer during growing season.' },
  { id: 'trop-014', species: 'Dracaena', category: 'troubleshooting', text: 'Brown leaf tips on Dracaena usually indicate overwatering or low humidity.' },
  { id: 'trop-015', species: 'Dracaena', category: 'repotting', text: 'Repot Dracaena every 2-3 years when roots fill the container.' },
  
  // Ferns
  { id: 'fern-001', species: 'Boston Fern', category: 'watering', text: 'Keep Boston Fern soil consistently moist but not soggy. Water when top inch feels dry.' },
  { id: 'fern-002', species: 'Boston Fern', category: 'light', text: 'Boston Fern prefers bright, indirect light. Avoid direct sun which can burn fronds.' },
  { id: 'fern-003', species: 'Boston Fern', category: 'humidity', text: 'Boston Fern needs high humidity. Mist daily or place on pebble tray with water.' },
  { id: 'fern-004', species: 'Boston Fern', category: 'fertilizing', text: 'Feed Boston Fern monthly with diluted liquid fertilizer during growing season.' },
  { id: 'fern-005', species: 'Boston Fern', category: 'repotting', text: 'Repot Boston Fern annually in spring. Use peat-based potting mix.' },
  
  { id: 'fern-006', species: 'Maidenhair Fern', category: 'watering', text: 'Keep Maidenhair Fern soil evenly moist. Never let it dry out completely.' },
  { id: 'fern-007', species: 'Maidenhair Fern', category: 'light', text: 'Maidenhair Fern needs bright, indirect light. East-facing windows are ideal.' },
  { id: 'fern-008', species: 'Maidenhair Fern', category: 'humidity', text: 'Maidenhair Fern requires very high humidity. Consider using a terrarium or humidifier.' },
  { id: 'fern-009', species: 'Maidenhair Fern', category: 'temperature', text: 'Maidenhair Fern prefers temperatures between 60-75°F. Avoid drafts and cold air.' },
  { id: 'fern-010', species: 'Maidenhair Fern', category: 'troubleshooting', text: 'Brown, crispy fronds on Maidenhair Fern indicate low humidity or underwatering.' },
  
  // Vining Plants
  { id: 'vine-001', species: 'Pothos', category: 'watering', text: 'Water Pothos when top inch of soil is dry. Allow soil to dry between waterings.' },
  { id: 'vine-002', species: 'Pothos', category: 'light', text: 'Pothos tolerates low to bright indirect light. Variegated varieties need more light.' },
  { id: 'vine-003', species: 'Pothos', category: 'fertilizing', text: 'Feed Pothos monthly with balanced liquid fertilizer during growing season.' },
  { id: 'vine-004', species: 'Pothos', category: 'propagation', text: 'Propagate Pothos easily from stem cuttings in water or soil.' },
  { id: 'vine-005', species: 'Pothos', category: 'pruning', text: 'Prune Pothos to control length and encourage bushiness. Cut just above a leaf node.' },
  
  { id: 'vine-006', species: 'Philodendron', category: 'watering', text: 'Water Philodendron when top inch of soil is dry. Water thoroughly and drain excess.' },
  { id: 'vine-007', species: 'Philodendron', category: 'light', text: 'Philodendron prefers bright, indirect light. Can tolerate lower light conditions.' },
  { id: 'vine-008', species: 'Philodendron', category: 'fertilizing', text: 'Feed Philodendron monthly with balanced liquid fertilizer during growing season.' },
  { id: 'vine-009', species: 'Philodendron', category: 'support', text: 'Provide moss pole or trellis for climbing Philodendron varieties to grow upward.' },
  { id: 'vine-010', species: 'Philodendron', category: 'repotting', text: 'Repot Philodendron every 2-3 years when roots fill the container.' },
  
  { id: 'vine-011', species: 'English Ivy', category: 'watering', text: 'Keep English Ivy soil evenly moist. Water when top inch feels dry to touch.' },
  { id: 'vine-012', species: 'English Ivy', category: 'light', text: 'English Ivy prefers bright, indirect light. Can tolerate lower light conditions.' },
  { id: 'vine-013', species: 'English Ivy', category: 'humidity', text: 'English Ivy appreciates higher humidity. Mist leaves regularly or use humidifier.' },
  { id: 'vine-014', species: 'English Ivy', category: 'fertilizing', text: 'Feed English Ivy monthly with balanced liquid fertilizer during growing season.' },
  { id: 'vine-015', species: 'English Ivy', category: 'pruning', text: 'Prune English Ivy regularly to control growth and maintain desired shape.' },
  
  // Air Plants
  { id: 'air-001', species: 'Tillandsia', category: 'watering', text: 'Soak Tillandsia in water for 20-30 minutes weekly. Shake off excess water after soaking.' },
  { id: 'air-002', species: 'Tillandsia', category: 'light', text: 'Tillandsia needs bright, indirect light. Some varieties can tolerate direct morning sun.' },
  { id: 'air-003', species: 'Tillandsia', category: 'air', text: 'Tillandsia needs good air circulation. Avoid placing in enclosed containers.' },
  { id: 'air-004', species: 'Tillandsia', category: 'fertilizing', text: 'Fertilize Tillandsia monthly with diluted bromeliad or air plant fertilizer.' },
  { id: 'air-005', species: 'Tillandsia', category: 'display', text: 'Display Tillandsia on driftwood, rocks, or in open terrariums for best results.' },
  
  // Palms
  { id: 'palm-001', species: 'Areca Palm', category: 'watering', text: 'Water Areca Palm when top inch of soil is dry. Keep soil evenly moist but not soggy.' },
  { id: 'palm-002', species: 'Areca Palm', category: 'light', text: 'Areca Palm prefers bright, indirect light. Avoid direct sun which can burn leaves.' },
  { id: 'palm-003', species: 'Areca Palm', category: 'humidity', text: 'Areca Palm needs high humidity. Mist regularly or use humidifier.' },
  { id: 'palm-004', species: 'Areca Palm', category: 'fertilizing', text: 'Feed Areca Palm monthly with palm-specific fertilizer during growing season.' },
  { id: 'palm-005', species: 'Areca Palm', category: 'repotting', text: 'Repot Areca Palm every 2-3 years in spring. Use well-draining potting mix.' },
  
  { id: 'palm-006', species: 'Kentia Palm', category: 'watering', text: 'Water Kentia Palm when top 2 inches of soil are dry. Water deeply and allow to drain.' },
  { id: 'palm-007', species: 'Kentia Palm', category: 'light', text: 'Kentia Palm tolerates low to bright indirect light. Avoid direct sun.' },
  { id: 'palm-008', species: 'Kentia Palm', category: 'humidity', text: 'Kentia Palm appreciates higher humidity. Mist leaves regularly.' },
  { id: 'palm-009', species: 'Kentia Palm', category: 'fertilizing', text: 'Feed Kentia Palm monthly with balanced liquid fertilizer during growing season.' },
  { id: 'palm-010', species: 'Kentia Palm', category: 'cleaning', text: 'Wipe Kentia Palm leaves with damp cloth to remove dust and improve appearance.' },
  
  // Additional comprehensive data
  { id: 'gen-001', species: 'General', category: 'watering', text: 'Most houseplants prefer to dry out slightly between waterings. Check soil moisture with your finger.' },
  { id: 'gen-002', species: 'General', category: 'light', text: 'Bright, indirect light means near a window but not in direct sunbeams. East-facing windows are ideal.' },
  { id: 'gen-003', species: 'General', category: 'fertilizing', text: 'Fertilize houseplants monthly during growing season (spring through fall) with balanced liquid fertilizer.' },
  { id: 'gen-004', species: 'General', category: 'repotting', text: 'Repot plants when roots fill the container or grow out of drainage holes. Spring is the best time.' },
  { id: 'gen-005', species: 'General', category: 'drainage', text: 'Always use pots with drainage holes to prevent root rot from waterlogged soil.' },
  { id: 'gen-006', species: 'General', category: 'temperature', text: 'Most houseplants prefer temperatures between 65-75°F. Avoid drafts and extreme temperature changes.' },
  { id: 'gen-007', species: 'General', category: 'humidity', text: 'Group plants together or use pebble trays to increase humidity around your plants.' },
  { id: 'gen-008', species: 'General', category: 'pests', text: 'Check plants regularly for pests like spider mites, mealybugs, and aphids. Treat early for best results.' },
  { id: 'gen-009', species: 'General', category: 'cleaning', text: 'Wipe plant leaves regularly with damp cloth to remove dust and improve photosynthesis.' },
  { id: 'gen-010', species: 'General', category: 'rotation', text: 'Rotate plants weekly to ensure even growth and prevent leaning toward light sources.' }
];

// Combine existing and new data
const combinedData = [...existingData, ...additionalPlantData];

// Remove duplicates based on id
const uniqueData = combinedData.filter((item, index, self) => 
  index === self.findIndex(t => t.id === item.id)
);

console.log(`✅ Added ${additionalPlantData.length} new plant care items`);
console.log(`📊 Total plant care items: ${uniqueData.length}`);

// Save updated data
try {
  const outputPath = path.join(__dirname, '../data/plantCareDataset.json');
  fs.writeFileSync(outputPath, JSON.stringify(uniqueData, null, 2));
  console.log(`✅ Successfully saved ${uniqueData.length} plant care items to plantCareDataset.json`);
} catch (error) {
  console.error('❌ Error saving data:', error.message);
}
