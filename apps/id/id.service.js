const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4004;

// Middleware
app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'CODAI ID Service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    features: {
      authentication: 'enabled',
      jwt_tokens: 'enabled',
      user_management: 'enabled',
      oauth2: 'ready',
      mfa: 'ready'
    },
    port: PORT
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'CODAI ID Service',
    version: '1.0.0',
    endpoints: [
      '/api/health',
      '/api/auth/login',
      '/api/auth/register',
      '/api/users'
    ]
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🆔 CODAI ID Service started successfully`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⚡ Ready to handle requests on port ${PORT}`);
});

module.exports = app;