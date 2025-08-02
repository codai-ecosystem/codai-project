#!/usr/bin/env node

import 'dotenv/config';
import { RomaiService } from '@codai/romai';
import * as http from 'http';

class RomaiApiServer {
  private server: http.Server | null = null;
  private romai: RomaiService;
  private port: number;

  constructor() {
    this.romai = RomaiService.getInstance();
    this.port = parseInt(process.env.PORT || '3001', 10);
  }

  async start(): Promise<void> {
    await this.romai.initialize();

    this.server = http.createServer((req, res) => {
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Content-Type', 'application/json');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify({ status: 'healthy', service: 'romai-api' }));
        return;
      }

      if (req.url === '/analytics' && req.method === 'GET') {
        const analytics = this.romai.getAnalytics();
        res.writeHead(200);
        res.end(JSON.stringify(analytics));
        return;
      }

      // Default 404
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    });

    this.server.listen(this.port, () => {
      console.log(`🇷🇴 ROMAI API Server listening on port ${this.port}`);
    });
  }

  async stop(): Promise<void> {
    if (this.server) {
      return new Promise((resolve) => {
        this.server!.close(() => {
          console.log('🇷🇴 ROMAI API Server stopped');
          resolve();
        });
      });
    }
  }
}

async function main(): Promise<void> {
  console.log('🚀 Starting ROMAI API Server...');

  try {
    const server = new RomaiApiServer();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n⏹️  Shutting down ROMAI API Server...');
      try {
        await server.stop();
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    });

    process.on('SIGTERM', async () => {
      console.log('\n⏹️  Shutting down ROMAI API Server (SIGTERM)...');
      try {
        await server.stop();
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    });

    await server.start();
  } catch (error) {
    console.error('❌ Failed to start ROMAI API Server:', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

export { main };
