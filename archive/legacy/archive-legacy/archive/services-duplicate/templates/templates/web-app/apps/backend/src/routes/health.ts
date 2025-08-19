import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
}

/**
 * Register health-related routes
 */
export function registerHealthRoutes(fastify: FastifyInstance): void {
  console.log('Health routes being registered');

  // Add a debug route for easier testing (development only)
  if (process.env['NODE_ENV'] !== 'production') {
    fastify.get('/api/health/debug', () => {
      console.log('Debug route accessed!');
      return { debug: 'Health routes are registered' };
    });
  }

  fastify.get(
    '/api/health',
    {
      schema: {
        description: 'Health check endpoint',
        tags: ['Health'],
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
              uptime: { type: 'number' },
              version: { type: 'string' },
              environment: { type: 'string' },
            },
          },
        },
      },
    },
    async (_request: FastifyRequest, _reply: FastifyReply): Promise<HealthResponse> => {
      console.log('Health route hit!');
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env['npm_package_version'] ?? '1.0.0',
        environment: process.env['NODE_ENV'] ?? 'development',
      };
    }
  );

  fastify.get(
    '/api/health/ready',
    {
      schema: {
        description: 'Readiness check endpoint',
        tags: ['Health'],
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              checks: {
                type: 'object',
                properties: {
                  database: { type: 'boolean' },
                  cache: { type: 'boolean' },
                  storage: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
    },
    async (_request: FastifyRequest, _reply: FastifyReply) => {
      // TODO: Perform actual health checks for database, cache, etc.
      const dbCheck = true; // Replace with actual database check
      const cacheCheck = true; // Replace with actual cache check
      const storageCheck = true; // Replace with actual storage check

      return {
        status: 'ok', // Will be 'error' when actual checks are implemented
        checks: {
          database: dbCheck,
          cache: cacheCheck,
          storage: storageCheck,
        },
      };
    }
  );

  fastify.get(
    '/api/health/live',
    {
      schema: {
        description: 'Liveness check endpoint',
        tags: ['Health'],
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
            },
          },
        },
      },
    },
    () => {
      return { status: 'ok' };
    }
  );
}

// Fastify plugin format
function healthRoutesPlugin(fastify: FastifyInstance): Promise<void> {
  return Promise.resolve(registerHealthRoutes(fastify));
}

// Default export for easier importing
export default healthRoutesPlugin;
