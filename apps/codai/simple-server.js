const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4001;

// Middleware
app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'CODAI Service',
        port: PORT,
        timestamp: new Date().toISOString(),
        migration_status: 'CBD_Integration_Complete',
        capabilities: [
            'AI Development Environment',
            'Code Generation',
            'Model Management',
            'Conversation API'
        ]
    });
});

// API endpoints
app.get('/api/status', (req, res) => {
    res.json({
        codai_status: 'operational',
        ai_models: ['gpt-4', 'claude-3', 'local-models'],
        features: ['code-generation', 'chat', 'analysis'],
        last_updated: new Date().toISOString()
    });
});

app.get('/api/models', (req, res) => {
    res.json({
        available_models: [
            { id: 'gpt-4', name: 'GPT-4', status: 'available' },
            { id: 'claude-3', name: 'Claude 3', status: 'available' },
            { id: 'codai-local', name: 'CODAI Local', status: 'available' }
        ]
    });
});

app.post('/api/chat', (req, res) => {
    const { message, model = 'gpt-4' } = req.body;

    res.json({
        response: `CODAI AI Response to: "${message}" using ${model}`,
        model_used: model,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        service: 'CODAI',
        status: 'healthy',
        version: '2.0.0',
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'CODAI Service',
        description: 'AI-native development environment',
        version: '2.0.0',
        status: 'running'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 CODAI Service running on port ${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/health`);
    console.log(`🤖 API: http://localhost:${PORT}/api/status`);
    console.log(`💬 Chat: http://localhost:${PORT}/api/chat`);
});
