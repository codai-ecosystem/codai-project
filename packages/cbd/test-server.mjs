#!/usr/bin/env node

import express from 'express';
import { SimpleAuthenticator } from './dist/auth/SimpleAuthenticator.js';

const app = express();
const port = 4180;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for testing
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Initialize authenticator
const authenticator = new SimpleAuthenticator();

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'CBD Universal Database - Phase 4: Innovation & Scale',
        version: '4.0.0',
        timestamp: new Date().toISOString(),
        authentication: 'SimpleAuthenticator'
    });
});

// Ecosystem health
app.get('/ecosystem/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Developer Ecosystem',
        features: ['Authentication', 'Security', 'Project Management'],
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
    });
});

// Security routes
app.post('/security/auth/login', async (req, res) => {
    try {
        console.log('🔐 Login attempt:', req.body.email);
        const result = await authenticator.authenticateUser(req.body);

        if (result.success) {
            res.json({ success: true, data: result });
        } else {
            res.status(401).json({ success: false, error: result.reason, details: result.details });
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

app.get('/security/stats', async (req, res) => {
    try {
        const stats = authenticator.getSecurityStats();
        res.json({ success: true, result: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to get stats' });
    }
});

app.get('/security/health', async (req, res) => {
    try {
        const health = authenticator.getSecurityHealth();
        res.json({ success: true, result: health });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to get health' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`🚀 CBD Authentication Test Server running on http://localhost:${port}`);
    console.log(`✅ SimpleAuthenticator initialized with admin user`);
    console.log(`\n🧪 Test endpoints:`);
    console.log(`   GET  /health - Service health`);
    console.log(`   POST /security/auth/login - Login with email/password`);
    console.log(`   GET  /security/stats - Security statistics`);
    console.log(`   GET  /security/health - Security health`);
    console.log(`\n🔑 Test login: admin@codai.ro / admin123`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down CBD Authentication Test Server...');
    process.exit(0);
});
