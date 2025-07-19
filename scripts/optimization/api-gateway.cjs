// CODAI Ecosystem API Gateway
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const config = require('../../configs/ecosystem-config.json');

const app = express();
const PORT = config.ecosystem.integration.api_gateway.port || 8080;

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:4030', 'http://localhost:4031', 'http://localhost:4033', 'http://localhost:4066', 'http://localhost:4074'],
  credentials: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    ecosystem: 'CODAI',
    timestamp: new Date().toISOString(),
    services: ["codai", "memorai", "bancai", "stocai", "analizai", "talentai", "aide"]
  });
});

// Service discovery endpoint
app.get('/api/services', (req, res) => {
  const services = Object.entries(config.ecosystem.services).map(([key, service]) => ({
    id: key,
    name: service.name,
    url: service.url,
    role: service.role,
    status: 'running' // TODO: Add actual health checks
  }));

  res.json({
    services,
    total: services.length,
    gateway_url: `http://localhost:${PORT}`
  });
});

// Proxy routes for each service
const routes = [
  { path: '/codai', target: 'http://localhost:5000' },
  { path: '/memorai', target: 'http://localhost:5002' },
  { path: '/bancai', target: 'http://localhost:5004' },
  { path: '/stocai', target: 'http://localhost:5005' },
  { path: '/analizai', target: 'http://localhost:5003' },
  { path: '/talentai', target: 'http://localhost:5037' },
  { path: '/marketai', target: 'http://localhost:5026' },
  { path: '/muzicai', target: 'http://localhost:4060' },
  { path: '/aide', target: 'http://localhost:5008' }
];

routes.forEach(({ path, target }) => {
  const serviceName = path.replace('/', '');

  // Proxy static assets (/_next/static/*)
  app.use(`${path}/_next`, createProxyMiddleware({
    target,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
      console.log(`📦 Static asset: ${req.method} ${req.url} to ${target}`);
    }
  }));

  // Proxy main service routes
  app.use(path, createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: {
      [`^${path}`]: '', // Remove service prefix
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`🔄 Proxying ${req.method} ${req.url} to ${target}`);
    },
    onError: (err, req, res) => {
      console.error(`❌ Proxy error for ${serviceName}:`, err.message);
      res.status(503).json({
        error: 'Service Unavailable',
        service: serviceName,
        message: 'The requested service is temporarily unavailable'
      });
    }
  }));
});

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'CODAI Ecosystem API Gateway',
    version: config.ecosystem.version,
    services: `/api/services`,
    health: `/health`,
    documentation: '/docs'
  });
});

// Start the gateway
app.listen(PORT, () => {
  console.log(`🚀 CODAI Ecosystem API Gateway running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Service discovery: http://localhost:${PORT}/api/services`);
  console.log(`📋 Available routes:`);

  routes.forEach(({ path, target }) => {
    console.log(`   ${path} → ${target}`);
  });
});

module.exports = app;
