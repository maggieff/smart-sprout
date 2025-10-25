import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`🌱 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const plantService = {
  /**
   * Get all plants
   */
  async getAllPlants() {
    try {
      const response = await api.get('/plant-data/all');
      return response.data;
    } catch (error) {
      console.error('Error fetching all plants:', error);
      throw new Error('Failed to fetch plants');
    }
  },

  /**
   * Get specific plant data
   */
  async getPlantData(plantId) {
    try {
      const response = await api.get(`/plant-data?plantId=${plantId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching plant data:', error);
      throw new Error('Failed to fetch plant data');
    }
  },

  /**
   * Get sensor history for a plant
   */
  async getSensorHistory(plantId, hours = 24) {
    try {
      // For demo purposes, generate mock sensor history
      const history = this.generateMockSensorHistory(hours);
      return history;
    } catch (error) {
      console.error('Error fetching sensor history:', error);
      throw new Error('Failed to fetch sensor history');
    }
  },

  /**
   * Generate mock sensor history for demo
   */
  generateMockSensorHistory(hours = 24) {
    const history = [];
    const now = new Date();
    const interval = (hours * 60 * 60 * 1000) / 24; // 24 data points
    
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now - (23 - i) * interval);
      const baseMoisture = 50 + Math.sin((i / 24) * Math.PI * 2) * 20;
      const baseLight = 500 + Math.sin((i / 24) * Math.PI * 2 + Math.PI) * 200;
      const baseTemp = 72 + Math.sin((i / 24) * Math.PI * 2) * 10;
      const baseHumidity = 50 + Math.sin((i / 24) * Math.PI * 2 + Math.PI/2) * 15;
      
      history.push({
        timestamp: timestamp.toISOString(),
        moisture: Math.max(0, Math.min(100, baseMoisture + (Math.random() - 0.5) * 10)),
        light: Math.max(0, baseLight + (Math.random() - 0.5) * 100),
        temperature: Math.max(50, Math.min(100, baseTemp + (Math.random() - 0.5) * 5)),
        humidity: Math.max(20, Math.min(90, baseHumidity + (Math.random() - 0.5) * 10))
      });
    }
    
    return history;
  },

  /**
   * Update plant data
   */
  async updatePlantData(plantId, data) {
    try {
      const response = await api.put(`/plant-data/${plantId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating plant data:', error);
      throw new Error('Failed to update plant data');
    }
  },

  /**
   * Get plant recommendations
   */
  async getRecommendations(plantId) {
    try {
      const response = await api.get(`/plant-data/${plantId}/recommendations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw new Error('Failed to fetch recommendations');
    }
  },

  /**
   * Get plant alerts
   */
  async getAlerts(plantId) {
    try {
      const response = await api.get(`/plant-data/${plantId}/alerts`);
      return response.data;
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw new Error('Failed to fetch alerts');
    }
  },

  /**
   * Simulate sensor data update
   */
  async simulateSensorUpdate(plantId) {
    try {
      const response = await api.post(`/plant-data/${plantId}/simulate`);
      return response.data;
    } catch (error) {
      console.error('Error simulating sensor update:', error);
      throw new Error('Failed to simulate sensor update');
    }
  }
};

export default plantService;
