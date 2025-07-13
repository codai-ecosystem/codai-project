import * as jwt from 'jsonwebtoken';

import { env } from './env';

import type { FastifyReply, FastifyRequest } from 'fastify';

// Type for the authenticated user
export interface AuthUser {
  uid: string;
}

// Add user to the FastifyRequest type
declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

/**
 * Authentication middleware for protecting routes
 * Verifies JWT token from Authorization header and adds user to request
 */
export async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authHeader = request.headers.authorization;

  if (authHeader?.startsWith('Bearer ') !== true) {
    return reply.code(401).send({ error: 'Authorization required' });
  }

  try {
    const token = authHeader.split(' ')[1];

    if (token === undefined || token.length === 0) {
      return reply.code(401).send({ error: 'Token missing' });
    }

    // Use the JWT secret from environment
    const secret = env.JWT_SECRET;

    try {
      // Verify the JWT token synchronously with proper typing
      const decoded = jwt.verify(token, secret);

      if (typeof decoded === 'string' || !('uid' in decoded)) {
        throw new Error('Invalid token format');
      }

      // TypeScript now knows decoded has 'uid' property
      request.user = { uid: (decoded as { uid: string }).uid };
    } catch (jwtError) {
      request.log.error({ err: jwtError }, 'JWT verification failed');
      return reply.code(401).send({ error: 'Invalid token' });
    }
  } catch (error) {
    request.log.error({ err: error }, 'Authentication error');
    return reply.code(401).send({ error: 'Authentication failed' });
  }
}
