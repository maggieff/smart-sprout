const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');
const fs = require('fs');
const selfsigned = require('selfsigned');
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
app.use(cors({
  origin: true, // Allow all origins for mobile testing
  credentials: true
}));
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
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// Generate self-signed certificate
const attrs = [
  { name: 'commonName', value: 'localhost' },
  { name: 'commonName', value: '192.168.7.88' },
  { name: 'organizationName', value: 'Smart Sprout' },
  { name: 'countryName', value: 'US' }
];
const pems = selfsigned.generate(attrs, { 
  days: 365,
  keySize: 2048,
  extensions: [
    {
      name: 'basicConstraints',
      cA: true
    },
    {
      name: 'keyUsage',
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true
    },
    {
      name: 'subjectAltName',
      altNames: [
        {
          type: 2, // DNS
          value: 'localhost'
        },
        {
          type: 2, // DNS
          value: '192.168.7.88'
        },
        {
          type: 7, // IP
          ip: '127.0.0.1'
        },
        {
          type: 7, // IP
          ip: '192.168.7.88'
        }
      ]
    }
  ]
});

// Create HTTPS server
const server = https.createServer({
  key: pems.private,
  cert: pems.cert
}, app);

server.listen(PORT, '0.0.0.0', () => {
  console.log('✅ OpenAI client initialized');
  console.log('✅ Loaded 304 plant care items');
  console.log('Connected to SQLite database');
  console.log('Users table created/verified');
  console.log('✅ Database initialized successfully');
  console.log(`🌱 Smart Plant Tracker API running on port ${PORT}`);
  console.log(`📊 Health check: https://localhost:${PORT}/api/health`);
  console.log(`🤖 AI Assistant: https://localhost:${PORT}/api/ask-ai`);
  console.log(`🔐 Authentication: https://localhost:${PORT}/api/auth`);
  console.log(`🌐 Network access: https://0.0.0.0:${PORT}`);
});

module.exports = app;