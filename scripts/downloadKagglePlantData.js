/**
 * Download real plant identification datasets from Kaggle
 * This script downloads large, comprehensive plant datasets for AI training
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Popular plant identification datasets on Kaggle
const kaggleDatasets = [
  {
    name: 'plantnet-300k',
    url: 'https://www.kaggle.com/datasets/plantnet/plantnet-300k',
    description: 'PlantNet-300K: A large-scale plant identification dataset with 300,000 images',
    size: '~15GB',
    categories: ['plant_identification', 'botany', 'species_classification']
  },
  {
    name: 'plant-seedlings-classification',
    url: 'https://www.kaggle.com/datasets/c/plant-seedlings-classification',
    description: 'Plant Seedlings Classification - 12 species of plant seedlings',
    size: '~200MB',
    categories: ['seedlings', 'agriculture', 'crop_classification']
  },
  {
    name: 'plant-pathology-2020-fgvc7',
    url: 'https://www.kaggle.com/datasets/c/plant-pathology-2020-fgvc7',
    description: 'Plant Pathology 2020 - Apple and cherry leaf disease classification',
    size: '~1GB',
    categories: ['plant_disease', 'pathology', 'agriculture']
  },
  {
    name: 'plantnet-300k-species',
    url: 'https://www.kaggle.com/datasets/plantnet/plantnet-300k-species',
    description: 'PlantNet-300K Species - Detailed species information',
    size: '~2GB',
    categories: ['species_data', 'botanical_info', 'taxonomy']
  },
  {
    name: 'herbarium-2022-fgvc9',
    url: 'https://www.kaggle.com/datasets/c/herbarium-2022-fgvc9',
    description: 'Herbarium 2022 - Large-scale herbarium specimen dataset',
    size: '~5GB',
    categories: ['herbarium', 'specimens', 'botanical_collections']
  }
];

async function checkKaggleCLI() {
  try {
    await execAsync('kaggle --version');
    console.log('✅ Kaggle CLI is installed');
    return true;
  } catch (error) {
    console.log('❌ Kaggle CLI not found');
    return false;
  }
}

async function installKaggleCLI() {
  console.log('📦 Installing Kaggle CLI...');
  try {
    await execAsync('pip install kaggle');
    console.log('✅ Kaggle CLI installed successfully');
    return true;
  } catch (error) {
    console.log('❌ Failed to install Kaggle CLI:', error.message);
    return false;
  }
}

async function setupKaggleCredentials() {
  const kaggleDir = path.join(process.env.HOME || process.env.USERPROFILE, '.kaggle');
  const kaggleKeyPath = path.join(kaggleDir, 'kaggle.json');
  
  if (!fs.existsSync(kaggleKeyPath)) {
    console.log('🔑 Kaggle API credentials not found');
    console.log('📋 To set up Kaggle API:');
    console.log('   1. Go to https://www.kaggle.com/account');
    console.log('   2. Scroll to "API" section');
    console.log('   3. Click "Create New API Token"');
    console.log('   4. Download kaggle.json file');
    console.log('   5. Place it in ~/.kaggle/ directory');
    console.log('   6. Run: chmod 600 ~/.kaggle/kaggle.json');
    return false;
  }
  
  console.log('✅ Kaggle credentials found');
  return true;
}

async function downloadDataset(dataset) {
  console.log(`\n📥 Downloading ${dataset.name}...`);
  console.log(`   Description: ${dataset.description}`);
  console.log(`   Size: ${dataset.size}`);
  console.log(`   Categories: ${dataset.categories.join(', ')}`);
  
  const downloadDir = path.join(__dirname, '../backend/data/kaggle_datasets', dataset.name);
  
  try {
    // Create download directory
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }
    
    // Download dataset
    const command = `kaggle datasets download -d ${dataset.name} -p "${downloadDir}" --unzip`;
    console.log(`   Running: ${command}`);
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('Downloading')) {
      console.log(`   ⚠️  Warning: ${stderr}`);
    }
    
    console.log(`   ✅ Downloaded to: ${downloadDir}`);
    
    // List downloaded files
    const files = fs.readdirSync(downloadDir);
    console.log(`   📁 Files: ${files.length} items`);
    
    return {
      success: true,
      path: downloadDir,
      files: files
    };
    
  } catch (error) {
    console.log(`   ❌ Error downloading ${dataset.name}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

async function createDatasetSummary(downloads) {
  const summaryPath = path.join(__dirname, '../backend/data/kaggle_datasets/dataset_summary.json');
  
  const summary = {
    download_date: new Date().toISOString(),
    total_datasets: downloads.length,
    successful_downloads: downloads.filter(d => d.success).length,
    failed_downloads: downloads.filter(d => !d.success).length,
    datasets: downloads.map(d => ({
      name: d.name,
      success: d.success,
      path: d.path,
      file_count: d.files ? d.files.length : 0,
      error: d.error || null
    }))
  };
  
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`\n📊 Dataset summary saved to: ${summaryPath}`);
  
  return summary;
}

async function downloadKagglePlantData() {
  console.log('🌱 Downloading Kaggle Plant Identification Datasets...\n');
  
  // Check if Kaggle CLI is installed
  const kaggleInstalled = await checkKaggleCLI();
  if (!kaggleInstalled) {
    const installed = await installKaggleCLI();
    if (!installed) {
      console.log('❌ Could not install Kaggle CLI. Please install manually:');
      console.log('   pip install kaggle');
      return;
    }
  }
  
  // Check Kaggle credentials
  const credentialsOk = await setupKaggleCredentials();
  if (!credentialsOk) {
    console.log('\n❌ Please set up Kaggle API credentials first');
    return;
  }
  
  console.log('\n📋 Available Plant Datasets:');
  kaggleDatasets.forEach((dataset, index) => {
    console.log(`   ${index + 1}. ${dataset.name}`);
    console.log(`      ${dataset.description}`);
    console.log(`      Size: ${dataset.size}`);
    console.log(`      URL: ${dataset.url}\n`);
  });
  
  // Download all datasets
  const downloads = [];
  for (const dataset of kaggleDatasets) {
    const result = await downloadDataset(dataset);
    downloads.push({
      name: dataset.name,
      ...result
    });
  }
  
  // Create summary
  const summary = await createDatasetSummary(downloads);
  
  console.log('\n🎉 Kaggle Plant Data Download Complete!');
  console.log(`✅ Successfully downloaded: ${summary.successful_downloads} datasets`);
  console.log(`❌ Failed downloads: ${summary.failed_downloads} datasets`);
  
  console.log('\n📋 Next Steps:');
  console.log('   1. Review downloaded datasets in backend/data/kaggle_datasets/');
  console.log('   2. Process images for AI training');
  console.log('   3. Generate embeddings for plant identification');
  console.log('   4. Integrate with Chroma DB for vector search');
  
  return summary;
}

// Run if called directly
if (require.main === module) {
  downloadKagglePlantData().catch(console.error);
}

module.exports = { downloadKagglePlantData, kaggleDatasets };
