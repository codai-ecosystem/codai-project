#!/usr/bin/env node
/**
 * Simple test HTTP server for debugging
 */

const express = require('express');
const cors = require('cors');

const app = express();
const port = 8003;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    console.log('Health endpoint called');
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        server: 'Test MemorAI MCP'
    });
});

app.get('/test', (req, res) => {
    console.log('Test endpoint called');
    res.json({
        message: 'Test successful',
        timestamp: new Date().toISOString()
    });
});

app.listen(port, () => {
    console.log(`🧪 Test server running on http://localhost:${port}`);
    console.log(`📊 Health: http://localhost:${port}/health`);
    console.log(`🔍 Test: http://localhost:${port}/test`);
});

process.on('SIGINT', () => {
    console.log('\n🛑 Test server shutting down...');
    process.exit(0);
});
