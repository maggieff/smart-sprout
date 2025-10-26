/**
 * Setup script for Chroma Cloud
 * This script helps you get the correct credentials and test the connection
 */

const { ChromaClient } = require('chromadb');

async function setupChromaCloud() {
  console.log('🌱 Setting up Chroma Cloud for Smart Sprout...\n');
  
  console.log('📋 Steps to get your Chroma Cloud credentials:');
  console.log('1. Go to https://cloud.trychroma.com/');
  console.log('2. Sign up or log in to your account');
  console.log('3. Create a new database (or use existing one)');
  console.log('4. Get your API key from the dashboard');
  console.log('5. Get your tenant ID from your account settings\n');
  
  // Test with current credentials
  console.log('🔍 Testing current credentials...');
  
  try {
    const chroma = new ChromaClient({
      path: 'https://api.trychroma.com',
      apiKey: process.env.CHROMA_API_KEY || 'ck-BPG2XTtPWBPa2tFsatrfHmbsBTLdJYtKsnX75g8ZccYg',
      tenant: process.env.CHROMA_TENANT || '36db7d89-6330-46bf-a396-2836596dbd9a',
      database: process.env.CHROMA_DATABASE || 'plants'
    });
    
    console.log('✅ Chroma Cloud client created successfully');
    
    // Try to list collections
    const collections = await chroma.listCollections();
    console.log('✅ Successfully connected to Chroma Cloud!');
    console.log('📊 Collections found:', collections.length);
    
    if (collections.length > 0) {
      console.log('📋 Available collections:');
      collections.forEach((col, index) => {
        console.log(`   ${index + 1}. ${col.name}`);
      });
    }
    
    // Test creating a collection
    console.log('\n🧪 Testing collection creation...');
    try {
      const testCollection = await chroma.createCollection({
        name: 'smart_sprout_test',
        metadata: { 
          description: 'Test collection for Smart Sprout',
          created_at: new Date().toISOString()
        }
      });
      console.log('✅ Test collection created successfully');
      
      // Clean up test collection
      await chroma.deleteCollection({ name: 'smart_sprout_test' });
      console.log('🧹 Test collection cleaned up');
      
    } catch (error) {
      console.log('⚠️  Collection creation test failed:', error.message);
    }
    
    console.log('\n🎉 Chroma Cloud setup is working correctly!');
    console.log('💡 You can now use Chroma Cloud for your plant care knowledge base.');
    
  } catch (error) {
    console.log('❌ Chroma Cloud connection failed:');
    console.log('   Error:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Verify your API key is correct');
    console.log('2. Verify your tenant ID is correct');
    console.log('3. Make sure you have created a database in Chroma Cloud');
    console.log('4. Check that your account has the necessary permissions');
    console.log('\n📖 For more help, visit: https://docs.trychroma.com/docs/overview/getting-started');
  }
}

// Run the setup
setupChromaCloud().catch(console.error);