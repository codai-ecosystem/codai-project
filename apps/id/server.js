/**
 * Secure Server Setup for ID Service
 * Implements Phase 2 Security Infrastructure
 */

const express = require('express');
const next = require('next');
const { setupSecurity } = require('@codai/security');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4032;

async function startSecureServer() {
  try {
    await app.prepare();

    const server = express();

    // Configure security middleware
    const securityConfig = {
      serviceName: 'id-service',
      port: PORT,
      app: server,
      httpsEnabled: process.env.NODE_ENV === 'production' || process.env.FORCE_HTTPS === 'true',
      wafEnabled: true,
      rateLimitEnabled: true
    };

    console.log('🔒 Configuring ID Service security...');

    // Apply security middleware
    const securityIntegration = await setupSecurity(securityConfig);

    // Health check endpoint (before Next.js handler)
    server.get('/health', (req, res) => {
      res.json({
        service: 'id-service',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        security: securityIntegration.getSecurityStats(),
        uptime: process.uptime()
      });
    });

    // Security status endpoint
    server.get('/security/status', async (req, res) => {
      const healthCheck = await securityIntegration.performSecurityHealthCheck();
      res.json(healthCheck);
    });

    // Handle all other requests with Next.js
    server.all('*', (req, res) => {
      return handle(req, res);
    });

    console.log('🚀 ID Service secure server configuration complete');

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('🛑 Shutting down ID Service...');
      await securityIntegration.shutdown();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('🛑 Shutting down ID Service...');
      await securityIntegration.shutdown();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start ID Service:', error);
    process.exit(1);
  }
}

// Start the server
startSecureServer();
