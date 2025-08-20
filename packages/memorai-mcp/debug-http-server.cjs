#!/usr/bin/env node

const express = require('express');
const cors = require('cors');

class DebugMemorAIMCPServer {
    constructor() {
        this.app = express();
        this.port = 8002;
        this.startTime = Date.now();
        this.operationCount = 0;

        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    setupMiddleware() {
        // Enable CORS
        this.app.use(cors());
        this.app.use(express.json());

        // Request logging
        this.app.use((req, res, next) => {
            console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
            next();
        });
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            console.log('🩺 Health check requested');
            try {
                const response = {
                    status: 'healthy',
                    server: {
                        name: 'MemorAI MCP Debug Server',
                        version: '9.6.5-debug',
                        uptime: `${Math.floor((Date.now() - this.startTime) / 1000)}s`
                    },
                    timestamp: new Date().toISOString()
                };
                console.log('✅ Health check response:', JSON.stringify(response, null, 2));
                res.json(response);
            } catch (error) {
                console.error('❌ Health check error:', error);
                res.status(500).json({ error: 'Internal server error', message: error.message });
            }
        });

        // Test endpoint
        this.app.get('/test', (req, res) => {
            console.log('🧪 Test endpoint requested');
            res.json({ message: 'Test successful', timestamp: new Date().toISOString() });
        });

        // Tools endpoint (for MCP compatibility)
        this.app.get('/tools', (req, res) => {
            console.log('🛠️ Tools endpoint requested');
            res.json({
                tools: [
                    {
                        name: 'debug_test',
                        description: 'Debug test tool',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string' }
                            }
                        }
                    }
                ]
            });
        });
    }

    setupErrorHandling() {
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('💥 Uncaught Exception:', error);
            console.error('Stack:', error.stack);
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
        });

        // Express error handler
        this.app.use((error, req, res, next) => {
            console.error('💥 Express Error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        });
    }

    async start() {
        return new Promise((resolve, reject) => {
            try {
                this.server = this.app.listen(this.port, () => {
                    console.log(`🚀 MemorAI MCP Debug Server started on port ${this.port}`);
                    console.log(`📊 Health: http://localhost:${this.port}/health`);
                    console.log(`🧪 Test: http://localhost:${this.port}/test`);
                    console.log(`🛠️ Tools: http://localhost:${this.port}/tools`);
                    console.log(`🕐 Started at: ${new Date().toISOString()}`);
                    resolve();
                });

                this.server.on('error', (error) => {
                    console.error('💥 Server Error:', error);
                    reject(error);
                });
            } catch (error) {
                console.error('💥 Start Error:', error);
                reject(error);
            }
        });
    }

    async stop() {
        return new Promise((resolve) => {
            if (this.server) {
                this.server.close(() => {
                    console.log('🛑 MemorAI MCP Debug Server stopped');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}

// CLI entry point
if (require.main === module) {
    const server = new DebugMemorAIMCPServer();

    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log('🛑 Shutting down debug server...');
        await server.stop();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log('🛑 Shutting down debug server (SIGTERM)...');
        await server.stop();
        process.exit(0);
    });

    // Start server
    server.start().catch(error => {
        console.error('💥 Failed to start debug server:', error);
        process.exit(1);
    });
}

module.exports = DebugMemorAIMCPServer;
