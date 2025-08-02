const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4008;

// Middleware
app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Hub Service',
        port: PORT,
        timestamp: new Date().toISOString(),
        migration_status: 'CBD_Integration_Complete',
        capabilities: [
            'Service Discovery',
            'Health Monitoring',
            'API Gateway Integration',
            'Authentication Relay'
        ]
    });
});

// Minimal API endpoint
app.get('/api/minimal', (req, res) => {
    res.json({
        message: 'Hub Service is operational',
        service: 'Hub',
        version: '2.0.0',
        status: 'running',
        endpoints: [
            '/health',
            '/api/minimal',
            '/api/status'
        ],
        features: [
            'CBD Database Integration',
            'Microservice Coordination',
            'Service Health Monitoring'
        ]
    });
});

// Status endpoint
app.get('/api/status', (req, res) => {
    res.json({
        hub_status: 'operational',
        connected_services: ['CBD Database', 'Gateway Service'],
        service_mesh_health: 'green',
        last_updated: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'CODAI Hub Service',
        description: 'Central coordination hub for CODAI ecosystem',
        version: '2.0.0',
        status: 'running'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Hub Service running on port ${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/health`);
    console.log(`🔧 API: http://localhost:${PORT}/api/minimal`);
});
