/**
 * @fileoverview Rate Limiting Middleware
 * @author Cautai Team
 * @version 1.0.0
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { config } from '../config.js';

const rateLimitMiddleware: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  await fastify.register(import('@fastify/rate-limit'), {
    max: config.rateLimit.maxRequests,
    timeWindow: config.rateLimit.windowMs,
    errorResponseBuilder: (request, context) => {
      return {
        code: 429,
        error: 'Too Many Requests',
        message: `Rate limit exceeded, retry in ${Math.round(context.ttl / 1000)} seconds`,
        expiresIn: Math.round(context.ttl / 1000),
      };
    },
  });
};

export { rateLimitMiddleware };