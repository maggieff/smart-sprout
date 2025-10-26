const { ChromaClient } = require('chromadb');

async function testChroma() {
  try {
    console.log('Testing Chroma DB connection...');
    
    const chroma = new ChromaClient({
      path: 'http://localhost:8000'
    });
    
    console.log('Chroma client created');
    
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
    console.error('Chroma DB test failed:', error.message);
    console.error('Full error:', error);
  }
}

testChroma();
