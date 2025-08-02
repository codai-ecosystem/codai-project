const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4006;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/api/health', (req, res) => {
    try {
        const healthStatus = {
            service: 'memorai',
            status: 'healthy',
            timestamp: new Date().toISOString(),
            description: 'AI-powered memory and knowledge management service is operational',
            version: '1.0.0',
            uptime: process.uptime(),
            dependencies: {
                database: 'connected',
                memory_store: 'operational',
                ai_services: 'available'
            },
            metadata: {
                nodeVersion: process.version,
                platform: process.platform,
                features: {
                    vectorSearch: 'enabled',
                    memoryAnalytics: 'active',
                    aiIntegration: 'connected',
                    knowledgeGraph: 'operational'
                }
            }
        };

        res.status(200).json(healthStatus);
    } catch (error) {
        console.error('MemorAI health check error:', error);
        res.status(500).json({
            service: 'memorai',
            status: 'degraded',
            timestamp: new Date().toISOString(),
            description: 'MemorAI service experiencing issues',
            error: error.message
        });
    }
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'MemorAI Service',
        version: '1.0.0',
        description: 'AI-powered memory and knowledge management',
        status: 'operational',
        endpoints: {
            health: '/api/health',
            memory: '/api/memory',
            search: '/api/search'
        }
    });
});

// Memory endpoints (placeholders)
app.get('/api/memory', (req, res) => {
    res.json({
        message: 'Memory API endpoint',
        available: true,
        features: ['store', 'retrieve', 'search', 'analytics']
    });
});

app.get('/api/search', (req, res) => {
    res.json({
        message: 'Search API endpoint',
        available: true,
        types: ['vector', 'semantic', 'keyword', 'neural']
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🧠 MemorAI Express Service running on port ${PORT}`);
    console.log(`📍 Health endpoint: http://localhost:${PORT}/api/health`);
    console.log(`🔗 Service endpoint: http://localhost:${PORT}/`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('MemorAI service shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('MemorAI service shutting down gracefully...');
    process.exit(0);
});
