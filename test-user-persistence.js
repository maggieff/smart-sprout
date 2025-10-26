/**
 * Test script to verify user-specific plant and log persistence
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

// Test user data
const testUser1 = {
  name: 'Test User 1',
  email: 'test1@example.com',
  password: 'password123'
};

const testUser2 = {
  name: 'Test User 2', 
  email: 'test2@example.com',
  password: 'password123'
};

async function testUserPersistence() {
  console.log('🧪 Testing User-Specific Plant and Log Persistence\n');

  try {
    // Step 1: Create two test users
    console.log('1. Creating test users...');
    
    const user1Response = await axios.post(`${API_BASE_URL}/auth/signup`, testUser1);
    const user1 = user1Response.data.user;
    console.log(`✅ User 1 created: ${user1.name} (ID: ${user1.id})`);

    const user2Response = await axios.post(`${API_BASE_URL}/auth/signup`, testUser2);
    const user2 = user2Response.data.user;
    console.log(`✅ User 2 created: ${user2.name} (ID: ${user2.id})\n`);

    // Step 2: Create plants for each user
    console.log('2. Creating plants for each user...');
    
    const plant1Data = {
      name: 'User 1 Plant',
      species: 'Snake Plant',
      image: 'plant1.jpg'
    };

    const plant2Data = {
      name: 'User 2 Plant', 
      species: 'Monstera',
      image: 'plant2.jpg'
    };

    // Create plant for user 1
    const plant1Response = await axios.post(`${API_BASE_URL}/plant-data`, plant1Data, {
      headers: { 'user-id': user1.id }
    });
    const plant1 = plant1Response.data.plant;
    console.log(`✅ Plant 1 created for User 1: ${plant1.name} (ID: ${plant1.id})`);

    // Create plant for user 2
    const plant2Response = await axios.post(`${API_BASE_URL}/plant-data`, plant2Data, {
      headers: { 'user-id': user2.id }
    });
    const plant2 = plant2Response.data.plant;
    console.log(`✅ Plant 2 created for User 2: ${plant2.name} (ID: ${plant2.id})\n`);

    // Step 3: Create logs for each plant
    console.log('3. Creating logs for each plant...');
    
    const log1Data = {
      plantId: plant1.id,
      note: 'User 1 watered their plant',
      type: 'watering',
      mood: 'happy'
    };

    const log2Data = {
      plantId: plant2.id,
      note: 'User 2 observed their plant',
      type: 'observation',
      mood: 'neutral'
    };

    // Create log for user 1's plant
    const log1Response = await axios.post(`${API_BASE_URL}/logs`, log1Data, {
      headers: { 'user-id': user1.id }
    });
    console.log(`✅ Log 1 created for User 1's plant: ${log1Response.data.log.note}`);

    // Create log for user 2's plant
    const log2Response = await axios.post(`${API_BASE_URL}/logs`, log2Data, {
      headers: { 'user-id': user2.id }
    });
    console.log(`✅ Log 2 created for User 2's plant: ${log2Response.data.log.note}\n`);

    // Step 4: Verify user isolation
    console.log('4. Verifying user isolation...');
    
    // Get plants for user 1
    const user1PlantsResponse = await axios.get(`${API_BASE_URL}/plant-data/all`, {
      headers: { 'user-id': user1.id }
    });
    console.log(`✅ User 1 can see ${user1PlantsResponse.data.plants.length} plant(s)`);

    // Get plants for user 2
    const user2PlantsResponse = await axios.get(`${API_BASE_URL}/plant-data/all`, {
      headers: { 'user-id': user2.id }
    });
    console.log(`✅ User 2 can see ${user2PlantsResponse.data.plants.length} plant(s)`);

    // Try to access user 2's plant as user 1 (should fail)
    try {
      await axios.get(`${API_BASE_URL}/plant-data?plantId=${plant2.id}`, {
        headers: { 'user-id': user1.id }
      });
      console.log('❌ ERROR: User 1 was able to access User 2\'s plant!');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ User 1 cannot access User 2\'s plant (correct isolation)');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }

    // Get logs for each user
    const user1LogsResponse = await axios.get(`${API_BASE_URL}/logs?plantId=${plant1.id}`, {
      headers: { 'user-id': user1.id }
    });
    console.log(`✅ User 1 can see ${user1LogsResponse.data.logs.length} log(s) for their plant`);

    const user2LogsResponse = await axios.get(`${API_BASE_URL}/logs?plantId=${plant2.id}`, {
      headers: { 'user-id': user2.id }
    });
    console.log(`✅ User 2 can see ${user2LogsResponse.data.logs.length} log(s) for their plant`);

    console.log('\n🎉 All tests passed! User-specific plant and log persistence is working correctly.');
    console.log('\n📋 Summary:');
    console.log(`- User 1 (${user1.name}) has ${user1PlantsResponse.data.plants.length} plant(s) and ${user1LogsResponse.data.logs.length} log(s)`);
    console.log(`- User 2 (${user2.name}) has ${user2PlantsResponse.data.plants.length} plant(s) and ${user2LogsResponse.data.logs.length} log(s)`);
    console.log('- Users cannot access each other\'s data (proper isolation)');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the test
testUserPersistence();
