#!/usr/bin/env node

/**
 * 🚀 CODAI Development Helper
 * Simple development server for testing
 */

import http from 'http';
const port = process.env.PORT || 3000;

console.log(`🚀 Starting development helper on port ${port}`);

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'healthy',
    service: 'CODAI Development Helper',
    timestamp: new Date().toISOString(),
    path: req.url
  }));
});

server.listen(port, () => {
  console.log(`✅ Development helper running on http://localhost:${port}`);
});

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down development helper');
  server.close();
});

process.on('SIGINT', () => {
  console.log('🛑 Shutting down development helper');
  server.close();
  process.exit(0);
});
