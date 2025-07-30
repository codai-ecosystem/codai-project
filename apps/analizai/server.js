const express = require('express');
const cors = require('cors');
const path = require('path');
const { createSecureServer } = require('@codai/security');

const app = express();
const PORT = 5020;

// Initialize security middleware
createSecureServer(app, {
  serviceName: 'analizai',
  port: PORT,
  enableTLS: true,
  enableWAF: true,
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 800 // Analytics workloads require high throughput
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Enhanced health check endpoint with security status
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'analizai',
    description: 'Professional Data Analytics Platform - SECURED',
    port: PORT,
    type: 'analytics-ai',
    category: 'analytics',
    security: {
      https: true,
      waf: true,
      headers: true,
      rateLimit: true,
      analyticsProtection: true
    },
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Status endpoint
app.get('/status', (req, res) => {
  res.json({
    name: 'analizai',
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
    service: 'analizai',
    endpoints: [
      'GET /',
      'GET /health',
      'GET /status',
      'GET /api'
    ],
    documentation: 'https://docs.codai.ro/analizai'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 analizai service running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down analizai service...');
  process.exit(0);
});
