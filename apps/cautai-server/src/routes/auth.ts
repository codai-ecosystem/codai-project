/**
 * @fileoverview Authentication Routes
 * @author Cautai Team
 * @version 1.0.0
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { Static, Type } from '@sinclair/typebox';

// Auth request/response schemas
const LoginRequest = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 8 }),
});

const RegisterRequest = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 8 }),
  name: Type.String({ minLength: 2 }),
});

const AuthResponse = Type.Object({
  token: Type.String(),
  user: Type.Object({
    id: Type.String(),
    email: Type.String(),
    name: Type.String(),
  }),
});

type LoginRequest = Static<typeof LoginRequest>;
type RegisterRequest = Static<typeof RegisterRequest>;
type AuthResponse = Static<typeof AuthResponse>;

const authRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Login endpoint
  fastify.post<{ Body: LoginRequest; Reply: AuthResponse }>(
    '/auth/login',
    {
      schema: {
        body: LoginRequest,
        response: {
          200: AuthResponse,
        },
      },
    },
    async (request) => {
      const { email, password } = request.body;
      
      // Mock authentication - replace with real auth service
      if (email === 'demo@cautai.ro' && password === 'demo123456') {
        return {
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            id: 'demo-user-id',
            email,
            name: 'Demo User',
          },
        };
      }
      
      throw fastify.httpErrors.unauthorized('Invalid credentials');
    }
  );
  
  // Register endpoint
  fastify.post<{ Body: RegisterRequest; Reply: AuthResponse }>(
    '/auth/register',
    {
      schema: {
        body: RegisterRequest,
        response: {
          200: AuthResponse,
        },
      },
    },
    async (request) => {
      const { email, password, name } = request.body;
      
      // Mock registration - replace with real user service
      const newUser = {
        id: 'user-' + Date.now(),
        email,
        name,
      };
      
      return {
        token: 'mock-jwt-token-' + Date.now(),
        user: newUser,
      };
    }
  );
  
  // Token refresh endpoint
  fastify.post('/auth/refresh', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    // Mock token refresh
    return {
      token: 'refreshed-mock-jwt-token-' + Date.now(),
    };
  });
  
  // Logout endpoint
  fastify.post('/auth/logout', {
    preHandler: [fastify.authenticate],
  }, async () => {
    return { message: 'Successfully logged out' };
  });
};

export { authRoutes };