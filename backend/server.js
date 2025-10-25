const express = require('express');
const cors = require('cors');
const path = require('path');
const database = require('./utils/database');
require('dotenv').config();

// Import routes
const plantDataRoute = require('./routes/plantData');
const logsRoute = require('./routes/logs');
const askAIRoute = require('./routes/askAI');
const uploadRoute = require('./routes/upload');
const authRoute = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/plant-data', plantDataRoute);
app.use('/api/logs', logsRoute);
app.use('/api/ask-ai', askAIRoute);
app.use('/api/upload', uploadRoute);
app.use('/api/auth', authRoute);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Smart Plant Tracker API'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
async function startServer() {
  try {
    await database.init();
    console.log('✅ Database initialized successfully');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🌱 Smart Plant Tracker API running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🤖 AI Assistant: http://localhost:${PORT}/api/ask-ai`);
      console.log(`🔐 Authentication: http://localhost:${PORT}/api/auth`);
      console.log(`🌐 Network access: http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
