#!/usr/bin/env node

/**
 * Setup script for Chroma DB initialization
 * This script initializes the Chroma DB with plant care knowledge
 */

const { initializeChroma, initializeKnowledgeBase } = require('../backend/utils/chromaClient');
const path = require('path');

async function setupChroma() {
  console.log('🌱 Setting up Chroma DB for Smart Plant Tracker...\n');
  
  try {
    // Initialize Chroma DB connection
    console.log('📡 Connecting to Chroma DB...');
    const connected = await initializeChroma();
    
    if (!connected) {
      console.error('❌ Failed to connect to Chroma DB');
      console.log('\n💡 Make sure Chroma DB is running:');
      console.log('   docker run -p 8000:8000 chromadb/chroma');
      process.exit(1);
    }
    
    console.log('✅ Connected to Chroma DB');
    
    // Initialize knowledge base
    console.log('\n📚 Loading plant care knowledge base...');
    const knowledgeLoaded = await initializeKnowledgeBase();
    
    if (knowledgeLoaded) {
      console.log('✅ Plant care knowledge base loaded successfully');
    } else {
      console.log('⚠️  No knowledge base data found - using fallback responses');
    }
    
    console.log('\n🎉 Chroma DB setup complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Start the backend server: cd backend && npm start');
    console.log('   2. Start the frontend: cd frontend && npm start');
    console.log('   3. Open http://localhost:3000 in your browser');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   - Ensure Chroma DB is running on localhost:8000');
    console.log('   - Check that all dependencies are installed');
    console.log('   - Verify the plant care dataset exists');
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupChroma();
}

module.exports = { setupChroma };
