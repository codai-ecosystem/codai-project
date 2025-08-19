import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

import { env } from './lib/env';
import { errorHandler } from './lib/error-handler';
import authRoutes from './routes/auth';
import healthRoutes from './routes/health';
// eslint-disable-next-line import/no-named-as-default
import stripeRoutes from './routes/stripe';
import userRoutes from './routes/users';

import type { FastifyInstance } from 'fastify';

/**
 * Initialize the Fastify application with all routes and plugins
 * This is extracted into a separate function for better testability
 * and to allow for both standalone and serverless deployments
 */
export async function initApp(app: FastifyInstance): Promise<void> {
  // Register plugins
  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
      },
    },
  });

  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW_MS,
  });

  // Only register Swagger in development environment
  if (env.NODE_ENV !== 'production') {
    await app.register(swagger, {
      swagger: {
        info: {
          title: 'METU Backend API',
          description: 'API documentation for METU Backend',
          version: '1.0.0',
        },
        securityDefinitions: {
          bearerAuth: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
          },
        },
      },
    });

    await app.register(swaggerUI, {
      routePrefix: '/documentation',
    });
  }
  // Global error handler
  app.setErrorHandler(errorHandler);
  // Register routes as plugins
  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(userRoutes);
  await app.register(stripeRoutes);

  // Ready handler
  app.addHook('onReady', () => {
    app.log.info('Application is ready!');
    app.log.info(`Server listening on ${env.HOST}:${env.PORT}`);

    if (env.NODE_ENV !== 'production') {
      app.log.info(`Documentation available at http://${env.HOST}:${env.PORT}/documentation`);
      app.log.info(`Health endpoint available at http://${env.HOST}:${env.PORT}/api/health`);
      app.log.info(`API prefix: /api`);
    }
  });
}
