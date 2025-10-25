const database = require('../utils/database');
const bcrypt = require('bcrypt');

async function initializeDatabase() {
  try {
    console.log('🚀 Initializing database...');
    
    // Initialize the database
    await database.init();
    console.log('✅ Database initialized successfully');
    
    // Create a demo user for testing
    const demoUser = {
      name: 'Demo User',
      email: 'demo@example.com',
      password: 'password123'
    };
    
    console.log('👤 Creating demo user...');
    const result = await database.createUser(
      demoUser.name, 
      demoUser.email, 
      demoUser.password
    );
    
    if (result.success) {
      console.log('✅ Demo user created successfully');
      console.log(`   Email: ${demoUser.email}`);
      console.log(`   Password: ${demoUser.password}`);
    } else if (result.error === 'User with this email already exists') {
      console.log('ℹ️  Demo user already exists');
    } else {
      console.error('❌ Error creating demo user:', result.error);
    }
    
    console.log('\n🎉 Database setup complete!');
    console.log('You can now start the server with: npm start');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    database.close();
  }
}

// Run the initialization
initializeDatabase();
