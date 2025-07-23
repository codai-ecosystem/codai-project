/**
 * Secure Server for CODAI - AI-native development environment
 * Implements Phase 2 Security Infrastructure
 */

const express = require('express');
const next = require('next');
const { setupSecurity } = require('@codai/security');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4001;

async function startSecureServer() {
    try {
        console.log('🚀 Starting CODAI secure server...');
        await app.prepare();

        const server = express();

        // Configure security middleware
        const securityConfig = {
            serviceName: 'codai',
            port: PORT,
            app: server,
            httpsEnabled: process.env.NODE_ENV === 'production' || process.env.FORCE_HTTPS === 'true',
            wafEnabled: true,
            rateLimitEnabled: true
        };

        console.log('🔒 Configuring CODAI security middleware...');

        // Apply security middleware
        const securityIntegration = await setupSecurity(securityConfig);

        // Health check endpoint (before Next.js handler)
        server.get('/health', (req, res) => {
            res.json({
                service: 'codai',
                status: 'healthy',
                description: 'AI-native development environment',
                timestamp: new Date().toISOString(),
                security: securityIntegration.getSecurityStats(),
                uptime: process.uptime(),
                version: '1.0.0'
            });
        });

        // Security status endpoint
        server.get('/security/status', async (req, res) => {
            const healthCheck = await securityIntegration.performSecurityHealthCheck();
            res.json(healthCheck);
        });

        // API health endpoint
        server.get('/api/health', (req, res) => {
            res.json({
                service: 'codai-api',
                status: 'operational',
                timestamp: new Date().toISOString(),
                endpoints: ['GET /health', 'GET /api/health', 'GET /security/status']
            });
        });

        // Handle all other requests with Next.js
        server.all('*', (req, res) => {
            return handle(req, res);
        });

        console.log('✅ CODAI secure server configuration complete');
        console.log(`🌐 CODAI running on port ${PORT} (HTTP) and ${PORT + 443} (HTTPS)`);
        console.log(`🏥 Health check: http://localhost:${PORT}/health`);
        console.log(`🔒 Security status: http://localhost:${PORT}/security/status`);

        // Graceful shutdown
        process.on('SIGINT', async () => {
            console.log('🛑 Shutting down CODAI secure server...');
            await securityIntegration.shutdown();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            console.log('🛑 Shutting down CODAI secure server...');
            await securityIntegration.shutdown();
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Failed to start CODAI secure server:', error);
        process.exit(1);
    }
}

// Start the server
startSecureServer();
