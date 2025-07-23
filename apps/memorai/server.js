/**
 * Secure Server for MEMORAI - AI-powered memory and knowledge management
 * Implements Phase 2 Security Infrastructure
 */

const express = require('express');
const next = require('next');
const { setupSecurity } = require('@codai/security');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4002;

async function startSecureServer() {
    try {
        console.log('🚀 Starting MEMORAI secure server...');
        await app.prepare();

        const server = express();

        // Configure security middleware
        const securityConfig = {
            serviceName: 'memorai',
            port: PORT,
            app: server,
            httpsEnabled: process.env.NODE_ENV === 'production' || process.env.FORCE_HTTPS === 'true',
            wafEnabled: true,
            rateLimitEnabled: true
        };

        console.log('🔒 Configuring MEMORAI security middleware...');

        // Apply security middleware
        const securityIntegration = await setupSecurity(securityConfig);

        // Health check endpoint (before Next.js handler)
        server.get('/health', (req, res) => {
            res.json({
                service: 'memorai',
                status: 'healthy',
                description: 'AI-powered memory and knowledge management',
                timestamp: new Date().toISOString(),
                security: securityIntegration.getSecurityStats(),
                uptime: process.uptime(),
                version: '1.0.0',
                port: PORT,
                type: 'memory-management',
                category: 'ai-services'
            });
        });

        // Security status endpoint
        server.get('/security/status', async (req, res) => {
            const healthCheck = await securityIntegration.performSecurityHealthCheck();
            res.json(healthCheck);
        });

        // Memory API health endpoint
        server.get('/api/health', (req, res) => {
            res.json({
                service: 'memorai-api',
                status: 'operational',
                timestamp: new Date().toISOString(),
                capabilities: [
                    'Memory storage and retrieval',
                    'Knowledge graph management',
                    'AI-powered search',
                    'Context preservation'
                ]
            });
        });

        // Handle all other requests with Next.js
        server.all('*', (req, res) => {
            return handle(req, res);
        });

        console.log('✅ MEMORAI secure server configuration complete');
        console.log(`🧠 MEMORAI running on port ${PORT} (HTTP) and ${PORT + 443} (HTTPS)`);
        console.log(`🏥 Health check: http://localhost:${PORT}/health`);
        console.log(`🔒 Security status: http://localhost:${PORT}/security/status`);

        // Graceful shutdown
        process.on('SIGINT', async () => {
            console.log('🛑 Shutting down MEMORAI secure server...');
            await securityIntegration.shutdown();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            console.log('🛑 Shutting down MEMORAI secure server...');
            await securityIntegration.shutdown();
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Failed to start MEMORAI secure server:', error);
        process.exit(1);
    }
}

// Start the server
startSecureServer();
