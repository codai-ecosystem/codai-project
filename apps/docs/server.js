const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 4055;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'docs',
    description: 'Developer Docs & SDK Guides',
    port: PORT,
    type: 'undefined',
    category: 'documentation',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Status endpoint
app.get('/status', (req, res) => {
  res.json({
    name: 'docs',
    status: 'operational',
    version: '1.0.0',
    framework: 'express',
    environment: 'development',
    port: PORT,
    compliance: 'port-4000-plus-policy'
  });
});

// Main service endpoint
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoints
app.get('/api', (req, res) => {
  res.json({
    service: 'docs',
    endpoints: [
      'GET /',
      'GET /health',
      'GET /status', 
      'GET /api'
    ],
    documentation: 'https://docs.codai.ro/docs'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 docs service running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down docs service...');
  process.exit(0);
});
