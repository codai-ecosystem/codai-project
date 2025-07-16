const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 4050;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'admin',
    description: 'Internal Admin & Service Health Dashboard',
    port: PORT,
    type: 'undefined',
    category: 'infrastructure',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Status endpoint
app.get('/status', (req, res) => {
  res.json({
    name: 'admin',
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
    service: 'admin',
    endpoints: [
      'GET /',
      'GET /health',
      'GET /status',
      'GET /api'
    ],
    documentation: 'https://docs.codai.ro/admin'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 admin service running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down admin service...');
  process.exit(0);
});
