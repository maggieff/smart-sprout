import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Helper function to get current user ID from localStorage
const getCurrentUserId = () => {
  try {
    const user = localStorage.getItem('smart-sprout-user');
    if (user) {
      const userData = JSON.parse(user);
      return userData.id;
    }
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add user ID header
api.interceptors.request.use(
  (config) => {
    const userId = getCurrentUserId();
    console.log('logService: Adding user-id header:', userId);
    if (userId) {
      config.headers['user-id'] = userId;
    } else {
      console.warn('logService: No user ID found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

export const logService = {
  /**
   * Get logs for a specific plant
   */
  async getLogs(plantId, limit = 10, type = null) {
    try {
      const params = new URLSearchParams({
        plantId,
        limit: limit.toString()
      });
      
      if (type) {
        params.append('type', type);
      }
      
      const response = await api.get(`/logs?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw new Error('Failed to fetch logs');
    }
  },

  /**
   * Create a new log entry
   */
  async createLog(logData) {
    try {
      console.log('logService.createLog called with:', logData);
      const response = await api.post('/logs', logData);
      console.log('logService.createLog response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating log:', error);
      console.error('Error response:', error.response?.data);
      throw new Error('Failed to create log');
    }
  },

  /**
   * Update an existing log
   */
  async updateLog(logId, logData) {
    try {
      const response = await api.put(`/logs/${logId}`, logData);
      return response.data;
    } catch (error) {
      console.error('Error updating log:', error);
      throw new Error('Failed to update log');
    }
  },

  /**
   * Delete a log entry
   */
  async deleteLog(logId) {
    try {
      const response = await api.delete(`/logs/${logId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting log:', error);
      throw new Error('Failed to delete log');
    }
  },

  /**
   * Get log statistics for a plant
   */
  async getLogStats(plantId) {
    try {
      const response = await api.get(`/logs/stats?plantId=${plantId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching log stats:', error);
      throw new Error('Failed to fetch log statistics');
    }
  },

  /**
   * Get logs by type
   */
  async getLogsByType(plantId, type) {
    try {
      const response = await api.get(`/logs?plantId=${plantId}&type=${type}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching logs by type:', error);
      throw new Error('Failed to fetch logs by type');
    }
  },

  /**
   * Get recent activity summary
   */
  async getRecentActivity(plantId, days = 7) {
    try {
      const response = await api.get(`/logs/activity?plantId=${plantId}&days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw new Error('Failed to fetch recent activity');
    }
  }
};

export default logService;
