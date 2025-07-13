import { z } from 'zod';

import { authenticate } from '../lib/auth-middleware';
import { env } from '../lib/env.js';
import { firebaseAdmin } from '../lib/firebase-admin';

import type { FastifyInstance, FastifyReply, FastifyRequest, preHandlerHookHandler } from 'fastify';

// Type-safe authenticate as preHandler
const authPreHandler = authenticate as preHandlerHookHandler;

// Constants
const USER_NOT_AUTHENTICATED = 'User not authenticated';
const INTERNAL_SERVER_ERROR = 'Internal server error';
const USERS_ME_PATH = '/api/users/me';
const INVALID_REQUEST = 'Invalid request';

// Initialize Firebase and get admin instance (only if Firebase is enabled)
const initializeFirebase = () => {
  if (env.FIREBASE_ENABLED !== true) {
    console.log('Firebase is disabled, skipping Firebase Admin initialization in users module');
    return;
  }

  try {
    firebaseAdmin.initializeApp();
  } catch (error) {
    if (error instanceof Error && !error.message.includes('already exists')) {
      throw error;
    }
  }
};

// For backward compatibility with existing code
const getFirebaseAdmin = () => {
  if (env.FIREBASE_ENABLED !== true) {
    throw new Error('Firebase is disabled. Cannot access Firebase Admin SDK.');
  }
  initializeFirebase();
  return firebaseAdmin;
};

// Validation schemas
const updateUserSchema = z.object({
  displayName: z.string().optional(),
  photoURL: z.string().url().optional(),
});

// Helper function to update user profile
async function updateUserProfile(userId: string, displayName?: string, photoURL?: string) {
  if (env.FIREBASE_ENABLED !== true) {
    // For Firebase-disabled mode, return mock data
    console.log('Firebase disabled - skipping user profile update in database');
    return {
      uid: userId,
      displayName: displayName ?? 'User',
      photoURL: photoURL ?? '',
      email: 'user@example.com', // In a real app, you'd get this from your database
    };
  }

  const admin = getFirebaseAdmin();
  const auth = admin.auth();

  // Update user in Firebase Auth
  const updateData: Record<string, string> = {};
  if (displayName !== undefined) updateData['displayName'] = displayName;
  if (photoURL !== undefined) updateData['photoURL'] = photoURL;

  await auth.updateUser(userId, updateData);

  // Get the updated user record
  const userRecord = await auth.getUser(userId);

  return {
    id: userRecord.uid,
    email: userRecord.email ?? '',
    displayName: userRecord.displayName ?? '',
    photoURL: userRecord.photoURL ?? '',
    emailVerified: userRecord.emailVerified,
  };
}

/**
 * Register user-related routes
 */
export function registerUsersRoutes(fastify: FastifyInstance): void {
  console.log('User routes being registered');

  // Debug route for easier testing (development only)
  if (process.env['NODE_ENV'] !== 'production') {
    fastify.get('/api/users/debug', () => {
      console.log('Users debug route accessed!');
      return { debug: 'Users routes are registered' };
    });
  }

  // Get current user profile
  fastify.get(
    USERS_ME_PATH,
    {
      preHandler: authPreHandler,
      schema: {
        description: 'Get current user profile',
        tags: ['Users'],
        security: [
          {
            bearerAuth: [],
          },
        ],
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              displayName: { type: 'string' },
              photoURL: { type: 'string' },
              emailVerified: { type: 'boolean' },
              createdAt: { type: 'string' },
            },
          },
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // User is guaranteed to be set by the authenticate middleware
        const userId = request.user?.uid;

        if (userId === undefined || userId.trim().length === 0) {
          return reply.code(401).send({ error: USER_NOT_AUTHENTICATED });
        }

        if (env.FIREBASE_ENABLED !== true) {
          // For Firebase-disabled mode, return mock user data
          return {
            id: userId,
            email: 'user@example.com', // In a real app, get from your database
            displayName: 'User',
            photoURL: '',
            emailVerified: true,
            createdAt: new Date().toISOString(),
          };
        }

        const admin = getFirebaseAdmin();
        const auth = admin.auth();
        const userRecord = await auth.getUser(userId);

        return {
          id: userRecord.uid,
          email: userRecord.email ?? '',
          displayName: userRecord.displayName ?? '',
          photoURL: userRecord.photoURL ?? '',
          emailVerified: userRecord.emailVerified,
          createdAt: userRecord.metadata.creationTime,
        };
      } catch (error) {
        fastify.log.error('Get user profile error:', error);
        return reply.code(500).send({ error: INTERNAL_SERVER_ERROR });
      }
    }
  );

  // Update current user profile
  fastify.put(
    USERS_ME_PATH,
    {
      preHandler: authPreHandler,
      schema: {
        description: 'Update current user profile',
        tags: ['Users'],
        security: [
          {
            bearerAuth: [],
          },
        ],
        body: {
          type: 'object',
          properties: {
            displayName: { type: 'string' },
            photoURL: { type: 'string', format: 'uri' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  displayName: { type: 'string' },
                  photoURL: { type: 'string' },
                  emailVerified: { type: 'boolean' },
                },
              },
            },
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // User is guaranteed to be set by the authenticate middleware
        const userId = request.user?.uid;

        if (userId === undefined || userId.trim().length === 0) {
          return reply.code(401).send({ error: USER_NOT_AUTHENTICATED });
        }

        // Validate the request body
        const { displayName, photoURL } = updateUserSchema.parse(request.body);

        const updatedUser = await updateUserProfile(userId, displayName, photoURL);

        return {
          success: true,
          user: updatedUser,
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({ error: error.errors[0]?.message ?? INVALID_REQUEST });
        }

        fastify.log.error('Update user profile error:', error);
        return reply.code(500).send({ error: INTERNAL_SERVER_ERROR });
      }
    }
  );

  // Delete current user account
  fastify.delete(
    USERS_ME_PATH,
    {
      preHandler: authPreHandler,
      schema: {
        description: 'Delete current user account',
        tags: ['Users'],
        security: [
          {
            bearerAuth: [],
          },
        ],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // User is guaranteed to be set by the authenticate middleware
        const userId = request.user?.uid;

        if (userId === undefined || userId.trim().length === 0) {
          return reply.code(401).send({ error: USER_NOT_AUTHENTICATED });
        }

        if (env.FIREBASE_ENABLED !== true) {
          // For Firebase-disabled mode, return success without actually deleting
          console.log('Firebase disabled - simulating account deletion');
          return { success: true, message: 'Account deleted successfully' };
        }

        const admin = getFirebaseAdmin();
        const auth = admin.auth();

        await auth.deleteUser(userId);

        return { success: true, message: 'Account deleted successfully' };
      } catch (error) {
        fastify.log.error('Delete user error:', error);
        return reply.code(500).send({ error: INTERNAL_SERVER_ERROR });
      }
    }
  );
}

// Fastify plugin format
function userRoutesPlugin(fastify: FastifyInstance): Promise<void> {
  return Promise.resolve(registerUsersRoutes(fastify));
}

// Default export for easier importing
export default userRoutesPlugin;
