/**
 * Process Kaggle plant datasets for AI training
 * Converts downloaded datasets into structured format for Chroma DB
 */

const fs = require('fs');
const path = require('path');

async function processPlantNet300K() {
  console.log('🔄 Processing PlantNet-300K dataset...');
  
  const datasetPath = path.join(__dirname, '../backend/data/kaggle_datasets/plantnet-300k');
  
  if (!fs.existsSync(datasetPath)) {
    console.log('❌ PlantNet-300K dataset not found. Please download it first.');
    return null;
  }
  
  const processedData = [];
  const speciesInfo = [];
  
  try {
    // Look for metadata files
    const files = fs.readdirSync(datasetPath, { recursive: true });
    console.log(`📁 Found ${files.length} files in dataset`);
    
    // Process images and extract species information
    let processedCount = 0;
    const maxProcess = 1000; // Limit for demo purposes
    
    for (const file of files) {
      if (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')) {
        const filePath = path.join(datasetPath, file);
        const relativePath = path.relative(datasetPath, filePath);
        
        // Extract species from file path (assuming structure like species/family/genus/image.jpg)
        const pathParts = relativePath.split(path.sep);
        const species = pathParts[0] || 'unknown';
        const family = pathParts[1] || 'unknown';
        const genus = pathParts[2] || 'unknown';
        
        // Create plant care knowledge based on species
        const plantCareItems = generatePlantCareFromSpecies(species, family, genus);
        
        processedData.push(...plantCareItems);
        speciesInfo.push({
          species,
          family,
          genus,
          image_path: relativePath,
          processed: true
        });
        
        processedCount++;
        if (processedCount >= maxProcess) break;
      }
    }
    
    console.log(`✅ Processed ${processedCount} images`);
    console.log(`📊 Generated ${processedData.length} plant care items`);
    
    return {
      plantCareData: processedData,
      speciesInfo: speciesInfo,
      totalImages: processedCount
    };
    
  } catch (error) {
    console.log('❌ Error processing PlantNet-300K:', error.message);
    return null;
  }
}

function generatePlantCareFromSpecies(species, family, genus) {
  const careItems = [];
  
  // Generate basic care information based on plant family
  const familyCare = getFamilyCareInfo(family);
  const speciesCare = getSpeciesCareInfo(species);
  
  // Watering information
  careItems.push({
    id: `kaggle-${species.toLowerCase().replace(/\s+/g, '-')}-watering`,
    species: species,
    category: 'watering',
    text: `Water ${species} ${familyCare.watering}. ${speciesCare.watering || ''}`,
    source: 'kaggle_dataset',
    difficulty: familyCare.difficulty || 'medium',
    family: family,
    genus: genus
  });
  
  // Light requirements
  careItems.push({
    id: `kaggle-${species.toLowerCase().replace(/\s+/g, '-')}-light`,
    species: species,
    category: 'light',
    text: `${species} prefers ${familyCare.light}. ${speciesCare.light || ''}`,
    source: 'kaggle_dataset',
    difficulty: familyCare.difficulty || 'medium',
    family: family,
    genus: genus
  });
  
  // Soil requirements
  careItems.push({
    id: `kaggle-${species.toLowerCase().replace(/\s+/g, '-')}-soil`,
    species: species,
    category: 'soil',
    text: `Use ${familyCare.soil} for ${species}. ${speciesCare.soil || ''}`,
    source: 'kaggle_dataset',
    difficulty: familyCare.difficulty || 'medium',
    family: family,
    genus: genus
  });
  
  // General care
  careItems.push({
    id: `kaggle-${species.toLowerCase().replace(/\s+/g, '-')}-general`,
    species: species,
    category: 'general_care',
    text: `${species} (${family} family) requires ${familyCare.general}. ${speciesCare.general || ''}`,
    source: 'kaggle_dataset',
    difficulty: familyCare.difficulty || 'medium',
    family: family,
    genus: genus
  });
  
  return careItems;
}

function getFamilyCareInfo(family) {
  const familyCareMap = {
    'rosaceae': {
      watering: 'when soil feels dry to touch',
      light: 'full sun to partial shade',
      soil: 'well-draining, fertile soil',
      general: 'regular pruning and fertilizing',
      difficulty: 'medium'
    },
    'asteraceae': {
      watering: 'when top inch of soil is dry',
      light: 'full sun',
      soil: 'well-draining soil',
      general: 'deadheading for continuous blooms',
      difficulty: 'easy'
    },
    'fabaceae': {
      watering: 'deeply but infrequently',
      light: 'full sun',
      soil: 'well-draining soil with good drainage',
      general: 'nitrogen-fixing plants, minimal fertilizer needed',
      difficulty: 'easy'
    },
    'lamiaceae': {
      watering: 'when soil is dry',
      light: 'full sun to partial shade',
      soil: 'well-draining soil',
      general: 'aromatic herbs, regular harvesting',
      difficulty: 'easy'
    },
    'solanaceae': {
      watering: 'consistently moist soil',
      light: 'full sun',
      soil: 'rich, well-draining soil',
      general: 'support for climbing varieties',
      difficulty: 'medium'
    },
    'cactaceae': {
      watering: 'sparingly, when soil is completely dry',
      light: 'full sun',
      soil: 'sandy, well-draining soil',
      general: 'drought-tolerant, minimal care',
      difficulty: 'easy'
    },
    'orchidaceae': {
      watering: 'when potting mix is almost dry',
      light: 'bright, indirect light',
      soil: 'orchid-specific potting mix',
      general: 'high humidity, careful watering',
      difficulty: 'hard'
    }
  };
  
  return familyCareMap[family.toLowerCase()] || {
    watering: 'when soil feels dry',
    light: 'bright, indirect light',
    soil: 'well-draining soil',
    general: 'regular monitoring and care',
    difficulty: 'medium'
  };
}

function getSpeciesCareInfo(species) {
  // Add specific care tips for common species
  const speciesCareMap = {
    'rose': {
      watering: 'Water at base, not on leaves',
      light: '6+ hours of direct sun',
      soil: 'Rich, well-draining soil',
      general: 'Prune in late winter, fertilize regularly'
    },
    'tomato': {
      watering: 'Deep watering 2-3 times per week',
      light: 'Full sun for 8+ hours',
      soil: 'Rich, fertile soil with good drainage',
      general: 'Support with stakes or cages'
    },
    'basil': {
      watering: 'Keep soil consistently moist',
      light: '6+ hours of direct sun',
      soil: 'Well-draining, fertile soil',
      general: 'Pinch flowers to encourage leaf growth'
    },
    'lavender': {
      watering: 'Sparingly, let soil dry between waterings',
      light: 'Full sun for 6+ hours',
      soil: 'Sandy, well-draining soil',
      general: 'Prune after flowering, avoid overwatering'
    }
  };
  
  return speciesCareMap[species.toLowerCase()] || {};
}

async function processPlantSeedlings() {
  console.log('🔄 Processing Plant Seedlings dataset...');
  
  const datasetPath = path.join(__dirname, '../backend/data/kaggle_datasets/plant-seedlings-classification');
  
  if (!fs.existsSync(datasetPath)) {
    console.log('❌ Plant Seedlings dataset not found. Please download it first.');
    return null;
  }
  
  const processedData = [];
  
  try {
    const files = fs.readdirSync(datasetPath, { recursive: true });
    console.log(`📁 Found ${files.length} files in dataset`);
    
    // Process seedling images
    let processedCount = 0;
    const maxProcess = 500; // Limit for demo
    
    for (const file of files) {
      if (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')) {
        const filePath = path.join(datasetPath, file);
        const relativePath = path.relative(datasetPath, filePath);
        
        // Extract species from file path
        const pathParts = relativePath.split(path.sep);
        const species = pathParts[0] || 'unknown_seedling';
        
        // Generate seedling-specific care information
        const seedlingCare = generateSeedlingCare(species);
        processedData.push(...seedlingCare);
        
        processedCount++;
        if (processedCount >= maxProcess) break;
      }
    }
    
    console.log(`✅ Processed ${processedCount} seedling images`);
    console.log(`📊 Generated ${processedData.length} seedling care items`);
    
    return {
      plantCareData: processedData,
      totalImages: processedCount
    };
    
  } catch (error) {
    console.log('❌ Error processing Plant Seedlings:', error.message);
    return null;
  }
}

function generateSeedlingCare(species) {
  const careItems = [];
  
  // Seedling-specific care information
  careItems.push({
    id: `seedling-${species.toLowerCase().replace(/\s+/g, '-')}-germination`,
    species: species,
    category: 'germination',
    text: `${species} seeds need consistent moisture and warm temperatures for germination. Keep soil moist but not waterlogged.`,
    source: 'kaggle_seedlings',
    difficulty: 'medium',
    stage: 'seedling'
  });
  
  careItems.push({
    id: `seedling-${species.toLowerCase().replace(/\s+/g, '-')}-transplanting`,
    species: species,
    category: 'transplanting',
    text: `Transplant ${species} seedlings when they have 2-3 true leaves. Handle gently by the leaves, not the stem.`,
    source: 'kaggle_seedlings',
    difficulty: 'medium',
    stage: 'seedling'
  });
  
  careItems.push({
    id: `seedling-${species.toLowerCase().replace(/\s+/g, '-')}-light`,
    species: species,
    category: 'light',
    text: `${species} seedlings need bright, indirect light. Avoid direct sun which can burn tender leaves.`,
    source: 'kaggle_seedlings',
    difficulty: 'easy',
    stage: 'seedling'
  });
  
  return careItems;
}

async function processAllKaggleData() {
  console.log('🌱 Processing All Kaggle Plant Datasets...\n');
  
  const allProcessedData = [];
  let totalItems = 0;
  
  // Process PlantNet-300K
  const plantNetData = await processPlantNet300K();
  if (plantNetData) {
    allProcessedData.push(...plantNetData.plantCareData);
    totalItems += plantNetData.plantCareData.length;
  }
  
  // Process Plant Seedlings
  const seedlingsData = await processPlantSeedlings();
  if (seedlingsData) {
    allProcessedData.push(...seedlingsData.plantCareData);
    totalItems += seedlingsData.plantCareData.length;
  }
  
  // Save processed data
  const outputPath = path.join(__dirname, '../backend/data/kaggle_processed_data.json');
  fs.writeFileSync(outputPath, JSON.stringify(allProcessedData, null, 2));
  
  console.log(`\n🎉 Processing Complete!`);
  console.log(`📊 Total plant care items generated: ${totalItems}`);
  console.log(`💾 Saved to: ${outputPath}`);
  
  console.log('\n📋 Next Steps:');
  console.log('   1. Review processed data');
  console.log('   2. Generate embeddings for Chroma DB');
  console.log('   3. Test AI responses with new data');
  
  return {
    totalItems,
    outputPath,
    data: allProcessedData
  };
}

// Run if called directly
if (require.main === module) {
  processAllKaggleData().catch(console.error);
}

module.exports = { processAllKaggleData, processPlantNet300K, processPlantSeedlings };
