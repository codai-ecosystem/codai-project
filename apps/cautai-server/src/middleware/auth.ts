/**
 * @fileoverview Authentication Middleware
 * @author Cautai Team
 * @version 1.0.0
 */

import { FastifyInstance, FastifyPluginAsync, FastifyRequest } from 'fastify';
import { config } from '../config.js';

// Extend Fastify's type definitions
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest) => Promise<void>;
  }
  
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
      name: string;
    };
  }
}

const authMiddleware: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Register JWT plugin
  await fastify.register(import('@fastify/jwt'), {
    secret: config.jwt.secret,
  });
  
  // Add authenticate decorator
  fastify.decorate('authenticate', async function(request: FastifyRequest) {
    try {
      await request.jwtVerify();
    } catch (err) {
      throw fastify.httpErrors.unauthorized('Invalid or expired token');
    }
  });
  
  // Register HTTP errors plugin
  await fastify.register(import('@fastify/sensible'));
};

export { authMiddleware };