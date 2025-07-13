#!/usr/bin/env node

import { createRealtimeServer, defaultRealtimeConfig } from './packages/realtime/src/server-standalone';

async function startRealtimeServer() {
  console.log('🚀 Starting CODAI Real-time Server...');

  const config = {
    ...defaultRealtimeConfig,
    port: parseInt(process.env.REALTIME_PORT || '3001'),
    host: process.env.REALTIME_HOST || '0.0.0.0',
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || [
        'http://localhost:3000',
        'http://localhost:4000',
        'https://*.codai.ro',
        'https://aide.codai.ro',
        'https://memorai.ro',
        'https://logai.ro',
        'https://bancai.ro',
        'https://stocai.ro',
        'https://studiai.ro',
      ],
      credentials: true,
    },
    redis: process.env.REDIS_URL ? {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    } : undefined,
    auth: {
      secret: process.env.JWT_SECRET || 'codai-realtime-secret-key-change-in-production',
    },
  };

  const server = createRealtimeServer(config);

  try {
    await server.start();
    
    console.log('✅ CODAI Real-time Server started successfully!');
    console.log(`📡 Listening on ${config.host}:${config.port}`);
    console.log(`🔐 Authentication: ${config.auth.secret ? 'Enabled' : 'Disabled'}`);
    console.log(`📊 Redis: ${config.redis ? 'Enabled' : 'Disabled'}`);
    
    // Log stats every 30 seconds
    const statsInterval = setInterval(() => {
      const stats = server.getStats();
      console.log(`📈 Stats: ${stats.totalConnections} total, ${stats.activeConnections} active`);
      console.log(`📱 Apps: ${Object.entries(stats.connectionsByApp).map(([app, count]) => `${app}:${count}`).join(', ')}`);
    }, 30000);

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down CODAI Real-time Server...');
      clearInterval(statsInterval);
      await server.stop();
      console.log('✅ Server stopped gracefully');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Received SIGTERM, shutting down...');
      clearInterval(statsInterval);
      await server.stop();
      console.log('✅ Server stopped gracefully');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start real-time server:', error);
    process.exit(1);
  }
}

// Health check endpoint
function setupHealthCheck() {
  const http = require('http');
  const healthServer = http.createServer((req: any, res: any) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'codai-realtime-server',
      }));
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  const healthPort = parseInt(process.env.HEALTH_PORT || '3002');
  healthServer.listen(healthPort, () => {
    console.log(`🏥 Health check server listening on port ${healthPort}`);
  });
}

// Start both servers
setupHealthCheck();
startRealtimeServer();
