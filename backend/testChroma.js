const { ChromaClient } = require('chromadb');

async function testChroma() {
  try {
    console.log('Testing Chroma Cloud connection...');
    
    const chroma = new ChromaClient({
      path: 'https://api.trychroma.com',
      apiKey: process.env.CHROMA_API_KEY || 'ck-BPG2XTtPWBPa2tFsatrfHmbsBTLdJYtKsnX75g8ZccYg',
      tenant: process.env.CHROMA_TENANT || '36db7d89-6330-46bf-a396-2836596dbd9a',
      database: process.env.CHROMA_DATABASE || 'plants'
    });
    
    console.log('Chroma Cloud client created');
    
    // Test basic connection
    const collections = await chroma.listCollections();
    console.log('Collections:', collections);
    
    // Test query
    const collection = await chroma.getCollection({
      name: 'plant_care_knowledge'
    });
    
    console.log('Collection retrieved');
    
    const results = await collection.query({
      queryTexts: ['Monstera care'],
      nResults: 3
    });
    
    console.log('Query results:', results);
    
  } catch (error) {
    console.error('Chroma Cloud test failed:', error.message);
    console.error('Full error:', error);
  }
}

testChroma();
