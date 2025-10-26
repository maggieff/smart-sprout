/**
 * Test Chroma DB Cloud connection
 */

const { ChromaClient } = require('chromadb');

async function testChromaConnection() {
  console.log('🧪 Testing Chroma DB Cloud connection...\n');
  
  try {
    // Test different connection methods
    console.log('Method 1: Standard ChromaClient');
    const client1 = new ChromaClient({
      path: 'https://api.trychroma.com',
      apiKey: 'ck-BPG2XTtPWBPa2tFsatrfHmbsBTLdJYtKsnX75g8ZccYg',
      tenant: '36db7d89-6330-46bf-a396-2836596dbd9a',
      database: 'plants'
    });
    
    console.log('✅ Client created successfully');
    
    // Try to list collections
    const collections = await client1.listCollections();
    console.log('✅ Successfully connected to Chroma DB Cloud!');
    console.log(`📊 Found ${collections.length} collections`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    // Try alternative connection method
    try {
      console.log('\n🔄 Trying alternative connection method...');
      
      const client2 = new ChromaClient({
        path: 'https://api.trychroma.com',
        apiKey: 'ck-BPG2XTtPWBPa2tFsatrfHmbsBTLdJYtKsnX75g8ZccYg'
      });
      
      const collections = await client2.listCollections();
      console.log('✅ Alternative connection successful!');
      console.log(`📊 Found ${collections.length} collections`);
      
      return true;
      
    } catch (error2) {
      console.error('❌ Alternative connection also failed:', error2.message);
      return false;
    }
  }
}

testChromaConnection();

