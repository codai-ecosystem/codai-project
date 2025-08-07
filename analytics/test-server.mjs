#!/usr/bin/env node

/**
 * Simple CODAI Analytics Test Server
 */

import express from 'express';

const app = express();
const port = 9999;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'CODAI Analytics Dashboard', status: 'running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Simple Analytics Test Server running on http://localhost:${port}`);
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
});
