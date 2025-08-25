const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4008;

// Middleware
app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'CODAI Hub Service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    features: {
      ecosystem_management: 'enabled',
      service_discovery: 'enabled',
      orchestration: 'enabled',
      monitoring: 'ready',
      analytics: 'ready'
    },
    port: PORT
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'CODAI Hub Service',
    version: '1.0.0',
    endpoints: [
      '/api/health',
      '/api/services',
      '/api/orchestration',
      '/api/analytics'
    ]
  });
});

// Services endpoint
app.get('/api/services', (req, res) => {
  res.json({
    services: [
      { name: 'gateway', status: 'running', port: 4010 },
      { name: 'id-service', status: 'running', port: 4100 },
      { name: 'hub-service', status: 'running', port: 4110 },
      { name: 'bancai-service', status: 'running', port: 4120 },
      { name: 'romai-service', status: 'running', port: 4130 }
    ]
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🏢 CODAI Hub Service started successfully`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⚡ Ready to handle requests on port ${PORT}`);
});

module.exports = app;