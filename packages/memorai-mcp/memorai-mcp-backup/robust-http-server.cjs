#!/usr/bin/env node

/**
 * Robust MemorAI MCP HTTP Server
 * Enhanced version with better error handling and signal management
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 8002;
const API_KEY = process.env.MEMORAI_API_KEY || 'memorai-dev-key-2025';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for demo
const memories = new Map();

// Authentication middleware for API routes
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    if (token !== API_KEY) {
        return res.status(401).json({ error: 'Invalid API key' });
    }

    next();
};

// Enhanced logging
const logRequest = (req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
    next();
};

app.use(logRequest);

// Public health endpoint
app.get('/health', (req, res) => {
    console.log('Health check requested from:', req.ip);
    try {
        const response = {
            status: 'healthy',
            service: 'MemorAI MCP HTTP Server',
            version: '1.0.1',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            port: PORT,
            memoryCount: memories.size
        };
        res.json(response);
        console.log('Health check completed successfully');
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// MCP Tools endpoint
app.get('/tools', authenticate, (req, res) => {
    console.log('Tools list requested from:', req.ip);
    try {
        res.json({
            tools: [
                {
                    name: 'remember',
                    description: 'Store a memory with content and metadata',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            content: { type: 'string' },
                            metadata: { type: 'object' }
                        },
                        required: ['content']
                    }
                },
                {
                    name: 'recall',
                    description: 'Search and retrieve memories',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            query: { type: 'string' },
                            limit: { type: 'number', default: 10 }
                        },
                        required: ['query']
                    }
                },
                {
                    name: 'forget',
                    description: 'Delete a memory by ID',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' }
                        },
                        required: ['id']
                    }
                }
            ]
        });
        console.log('Tools list completed successfully');
    } catch (error) {
        console.error('Tools list failed:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// MCP Tool execution endpoint
app.post('/tools/:toolName', authenticate, (req, res) => {
    const { toolName } = req.params;
    const args = req.body;

    console.log(`Tool ${toolName} called with args:`, JSON.stringify(args, null, 2));

    try {
        switch (toolName) {
            case 'remember':
                const id = uuidv4();
                const memory = {
                    id,
                    content: args.content,
                    metadata: args.metadata || {},
                    timestamp: new Date().toISOString()
                };
                memories.set(id, memory);
                console.log(`Memory stored with ID: ${id}`);
                res.json({
                    success: true,
                    id,
                    message: 'Memory stored successfully'
                });
                break;

            case 'recall':
                const query = (args.query || '').toLowerCase();
                const limit = args.limit || 10;
                const results = [];

                for (const [id, memory] of memories.entries()) {
                    if (memory.content.toLowerCase().includes(query)) {
                        results.push(memory);
                    }
                    if (results.length >= limit) break;
                }

                console.log(`Recall found ${results.length} results for query: ${query}`);
                res.json({
                    success: true,
                    results,
                    count: results.length,
                    query
                });
                break;

            case 'forget':
                if (memories.has(args.id)) {
                    memories.delete(args.id);
                    console.log(`Memory deleted: ${args.id}`);
                    res.json({
                        success: true,
                        message: 'Memory deleted successfully'
                    });
                } else {
                    console.log(`Memory not found: ${args.id}`);
                    res.status(404).json({
                        success: false,
                        error: 'Memory not found'
                    });
                }
                break;

            default:
                console.log(`Unknown tool requested: ${toolName}`);
                res.status(400).json({
                    success: false,
                    error: `Unknown tool: ${toolName}`
                });
        }
    } catch (error) {
        console.error(`Error in tool ${toolName}:`, error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: error.message
    });
});

// 404 handler
app.use((req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.path}`);
    res.status(404).json({
        error: 'Route not found',
        path: req.path,
        method: req.method
    });
});

// Enhanced server startup
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(60));
    console.log('🚀 MemorAI MCP HTTP Server STARTED');
    console.log('='.repeat(60));
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/health`);
    console.log(`🛠️ Tools: http://localhost:${PORT}/tools`);
    console.log(`🔑 API Key: ${API_KEY}`);
    console.log(`🕐 Started: ${new Date().toISOString()}`);
    console.log(`💾 Memory Store: Empty (${memories.size} entries)`);
    console.log('='.repeat(60));
    console.log('📡 Server is ready to accept connections...');
});

// Enhanced error handling
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.log('🔍 Check for other processes using this port:');
        console.log(`   Get-NetTCPConnection -LocalPort ${PORT}`);
        process.exit(1);
    } else {
        console.error('❌ Server error:', error);
        process.exit(1);
    }
});

// Enhanced graceful shutdown
let isShuttingDown = false;

const gracefulShutdown = (signal) => {
    if (isShuttingDown) {
        console.log(`⚠️ Force shutdown received (${signal})`);
        process.exit(1);
    }

    isShuttingDown = true;
    console.log(`\n🛑 Graceful shutdown initiated (${signal})`);
    console.log('📊 Final Statistics:');
    console.log(`   - Uptime: ${Math.round(process.uptime())}s`);
    console.log(`   - Memories stored: ${memories.size}`);
    console.log(`   - Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);

    server.close((error) => {
        if (error) {
            console.error('❌ Error during shutdown:', error);
            process.exit(1);
        } else {
            console.log('✅ Server closed successfully');
            process.exit(0);
        }
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
        console.log('⚠️ Force shutdown after timeout');
        process.exit(1);
    }, 10000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGHUP', () => gracefulShutdown('SIGHUP'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
});

console.log('🎯 MemorAI MCP HTTP Server initialized successfully');
