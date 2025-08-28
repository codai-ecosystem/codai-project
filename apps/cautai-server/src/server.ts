/**
 * @fileoverview Cautai HTTP Server Entry Point
 * @author Cautai Team
 * @version 1.0.0
 */

import Fastify, { FastifyInstance } from 'fastify';
import { config } from './config.js';
import { searchRoutes } from './routes/search.js';
import { authRoutes } from './routes/auth.js';
import { healthRoutes } from './routes/health.js';
import { rateLimitMiddleware } from './middleware/rateLimit.js';
import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/errors.js';

export class CautaiServer {
  private server: FastifyInstance;
  
  constructor() {
    this.server = Fastify({
      logger: {
        level: config.logLevel,
      },
    });
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }
  
  private setupMiddleware(): void {
    // CORS
    this.server.register(import('@fastify/cors'), {
      origin: config.cors.origin,
      credentials: config.cors.credentials,
    });
    
    // Rate limiting
    this.server.register(rateLimitMiddleware);
    
    // Authentication
    this.server.register(authMiddleware);
  }
  
  private setupRoutes(): void {
    const apiPrefix = `${config.api.prefix}/${config.api.version}`;
    
    // Health check (no prefix)
    this.server.register(healthRoutes);
    
    // API routes
    this.server.register(authRoutes, { prefix: apiPrefix });
    this.server.register(searchRoutes, { prefix: apiPrefix });
  }
  
  private setupErrorHandling(): void {
    this.server.setErrorHandler(errorHandler);
  }
  
  public async start(): Promise<void> {
    try {
      await this.server.listen({
        port: config.port,
        host: config.host,
      });
      
      this.server.log.info(
        `🚀 Cautai Server started on http://${config.host}:${config.port}`
      );
      this.server.log.info(
        `📚 API documentation: http://${config.host}:${config.port}${config.api.prefix}/${config.api.version}/docs`
      );
    } catch (error) {
      this.server.log.error(error);
      process.exit(1);
    }
  }
  
  public async stop(): Promise<void> {
    await this.server.close();
  }
  
  public getFastifyInstance(): FastifyInstance {
    return this.server;
  }
}

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new CautaiServer();
  
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, gracefully shutting down...');
    await server.stop();
    process.exit(0);
  });
  
  server.start();
}