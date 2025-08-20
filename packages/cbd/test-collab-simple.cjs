#!/usr/bin/env node

/**
 * Simple Collaboration Service Test
 * Test if basic Express server with Socket.io works
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

console.log('🔧 Creating basic collaboration service test...');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Basic health endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'CBD Collaboration Service Test',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Basic WebSocket connection
io.on('connection', (socket) => {
    console.log('🔗 WebSocket connection established:', socket.id);

    socket.on('disconnect', () => {
        console.log('🔌 WebSocket disconnected:', socket.id);
    });
});

const PORT = 4600;

server.listen(PORT, (err) => {
    if (err) {
        console.error('❌ Server failed to start:', err);
        process.exit(1);
    }

    console.log('✅ CBD Collaboration Test Service');
    console.log('🌐 Server running on port', PORT);
    console.log('🔗 Health Check: http://localhost:' + PORT + '/health');
    console.log('🚀 WebSocket ready on ws://localhost:' + PORT);

    // Keep the process alive
    console.log('📡 Service is running... Press Ctrl+C to stop');
});

// Handle process termination gracefully
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down collaboration service...');
    server.close(() => {
        console.log('✅ Service stopped');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down...');
    server.close(() => {
        console.log('✅ Service stopped');
        process.exit(0);
    });
});
