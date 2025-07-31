import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import Fastify from 'fastify';

import { authenticate } from './lib/auth-middleware';
import { env } from './lib/env';
import { errorHandler } from './lib/error-handler';
import { firebaseAdmin } from './lib/firebase-admin';
import { registerAuthRoutes } from './routes/auth';
import { registerHealthRoutes } from './routes/health';
import { registerMemoryRoutes } from './routes/memory';
import { registerUsersRoutes } from './routes/users';

// Authentication types are defined in auth-middleware.ts

// Initialize Fastify
const fastify = Fastify({
  logger: {
    level: env.LOG_LEVEL,
    transport:
      env.NODE_ENV === 'development'
        ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
          },
        }
        : undefined,
  } as Record<string, unknown>, // Type assertion needed for strict mode compatibility
});

// Register plugins
async function registerPlugins() {
  // Security
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  });

  // CORS
  await fastify.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });

  // Rate limiting
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Register global error handler
  fastify.setErrorHandler(errorHandler);

  // Swagger documentation
  await fastify.register(swagger, {
    swagger: {
      info: {
        title: 'METU Backend API',
        description: 'Modern backend API built with Fastify and Firebase',
        version: '1.0.0',
      },
      host: `localhost:${env.PORT}`,
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      securityDefinitions: {
        Bearer: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
          description: 'Enter: Bearer {token}',
        },
      },
    },
  });

  await fastify.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
  });
}

// Authentication is now handled by the authenticate middleware from auth-middleware.ts

// Register routes
function registerRoutes(): void {
  console.log('Registering routes...');

  // Add a test route directly
  fastify.get('/test', () => {
    return { message: 'Test route is working' };
  });

  console.log('Health routes being registered');
  registerHealthRoutes(fastify);
  console.log('Auth routes being registered');
  registerAuthRoutes(fastify);
  console.log('Memory routes being registered');
  registerMemoryRoutes(fastify);

  console.log('User routes being registered');
  // Register user routes - routes already include the full path
  registerUsersRoutes(fastify);
  console.log('All routes registered');
}

// Start server
async function start() {
  try {
    console.log('Starting server...');
    await registerPlugins();
    console.log('Plugins registered');
    registerRoutes();
    console.log('Routes registered');

    // Print all registered routes for debugging
    console.log('Registered routes:');
    fastify.printRoutes();

    // Initialize Firebase Admin only if Firebase is enabled
    if (env.FIREBASE_ENABLED) {
      firebaseAdmin.initializeApp();
      console.log('Firebase Admin initialized');
      fastify.log.info('Firebase Admin initialized');
    } else {
      console.log('Firebase is disabled - skipping Firebase Admin initialization');
      fastify.log.info('Firebase is disabled - skipping Firebase Admin initialization');
    }

    await fastify.listen({
      port: env.PORT,
      host: env.HOST,
    });

    fastify.log.info(`Server running on http://${env.HOST}:${env.PORT}`);
    fastify.log.info(`Documentation available at http://${env.HOST}:${env.PORT}/docs`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
}

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  fastify.log.info(`Received ${signal}, shutting down gracefully`);
  try {
    await fastify.close();
    process.exit(0);
  } catch (error) {
    fastify.log.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => {
  void gracefulShutdown('SIGTERM');
});
process.on('SIGINT', () => {
  void gracefulShutdown('SIGINT');
});

// Start the server if this file is run directly
// eslint-disable-next-line unicorn/prefer-module
if (typeof require !== 'undefined' && require.main === module) {
  void start();
}

export { authenticate, fastify };
