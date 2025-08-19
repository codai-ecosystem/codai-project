/* eslint-disable sonarjs/cognitive-complexity */
import * as jwt from 'jsonwebtoken';
import { z } from 'zod';

import { env } from '../lib/env';
import { firebaseAdmin } from '../lib/firebase-admin';

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

// Constants
const INTERNAL_SERVER_ERROR = 'Internal server error';
const INVALID_REQUEST = 'Invalid request';

// Firebase API response types
interface FirebaseAuthResponse {
  localId: string;
  email: string;
  idToken: string;
  refreshToken: string;
  expiresIn: string;
}

interface FirebaseAuthError {
  error: {
    code: number;
    message: string;
    errors?: Array<{
      message: string;
      domain: string;
      reason: string;
    }>;
  };
}

// Initialize Firebase Admin SDK only if Firebase is enabled
const initializeFirebase = (): void => {
  try {
    // Check if Firebase is enabled before initializing
    if (!env.FIREBASE_ENABLED) {
      console.log('Firebase is disabled, skipping Firebase Admin initialization');
      return;
    }

    // Initialize the Firebase Admin app if not already initialized
    firebaseAdmin.initializeApp();
  } catch (error) {
    // Catch any initialization errors (especially helpful for testing)
    if (!String(error).includes('already exists')) {
      throw error;
    }
  }
};

// For backward compatibility with existing code
const getFirebaseAdmin = () => {
  if (!env.FIREBASE_ENABLED) {
    throw new Error('Firebase is disabled. Cannot access Firebase Admin SDK.');
  }
  initializeFirebase();
  return firebaseAdmin;
};

// Helper to check if Firebase has proper permissions
const checkFirebasePermissions = async (): Promise<boolean> => {
  try {
    if (!env.FIREBASE_ENABLED) {
      return false;
    }

    const admin = getFirebaseAdmin();
    // Test permissions with a minimal operation
    await admin.auth().listUsers(1);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('PERMISSION_DENIED')) {
      console.warn('Firebase permissions insufficient - falling back to mock mode');
      return false;
    }
    throw error;
  }
};

// Helper to generate JWT
const generateToken = (userId: string): string => {
  const secret = env.JWT_SECRET;
  return jwt.sign({ uid: userId }, secret, {
    expiresIn: Number(env.JWT_EXPIRES_IN),
  });
};

// Helper functions to reduce cognitive complexity
async function refreshFirebaseToken(
  refreshToken: string,
  apiKey: string
): Promise<{ id_token: string; refresh_token: string; }> {
  const response = await fetch(`https://securetoken.googleapis.com/v1/token?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  const data = (await response.json()) as {
    id_token?: string;
    refresh_token?: string;
    error?: { message?: string; };
  };

  if (!response.ok) {
    const errorMessage =
      data.error?.message !== undefined ? data.error.message : 'Failed to refresh token';
    throw new Error(errorMessage);
  }

  if (data.id_token === undefined || data.id_token.trim().length === 0) {
    throw new Error('Invalid token response format');
  }

  if (data.refresh_token === undefined || data.refresh_token.trim().length === 0) {
    throw new Error('No refresh token in response');
  }

  return {
    id_token: data.id_token,
    refresh_token: data.refresh_token,
  };
}

async function verifyAndGenerateTokens(
  idToken: string
): Promise<{ token: string; expiresAt: string; }> {
  const admin = getFirebaseAdmin();
  const decodedToken = await admin.auth().verifyIdToken(idToken);

  const token = generateToken(decodedToken.uid);
  const expiresAt = new Date(Date.now() + parseInt(env.JWT_EXPIRES_IN) * 1000).toISOString();

  return { token, expiresAt };
}

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const registerSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(2, 'Display name is required'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const verifyTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

/**
 * Register authentication-related routes
 */
export function registerAuthRoutes(fastify: FastifyInstance): void {
  console.log('Auth routes being registered');

  // Debug route for easier testing (development only)
  if (process.env['NODE_ENV'] !== 'production') {
    fastify.get('/api/auth/debug', () => {
      console.log('Auth debug route accessed!');
      return { debug: 'Auth routes are registered' };
    });
  }

  // Login route
  fastify.post(
    '/api/auth/login',
    {
      schema: {
        description: 'Authenticate a user',
        tags: ['Authentication'],
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              token: { type: 'string' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  displayName: { type: 'string' },
                },
              },
              expiresAt: { type: 'string' },
            },
          },
          400: {
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
        const { email, password } = loginSchema.parse(request.body);

        // Check if Firebase is enabled and has proper permissions
        const hasFirebasePermissions = await checkFirebasePermissions();

        if (!env.FIREBASE_ENABLED || !hasFirebasePermissions) {
          // For Firebase-disabled mode or permission issues, provide a mock authentication response
          console.log(
            'Firebase disabled or insufficient permissions - providing mock authentication for testing'
          );

          // Simple mock validation (replace with your actual auth logic)
          if (email.trim() !== '' && password.trim() !== '' && password.length >= 8) {
            const mockUser = {
              id: `mock-${Date.now()}`,
              email,
              displayName: email.split('@')[0] ?? 'User',
            };

            const token = generateToken(mockUser.id);
            const expiresAt = new Date(
              Date.now() + Number(env.JWT_EXPIRES_IN) * 1000
            ).toISOString();

            return reply.send({
              token,
              user: mockUser,
              expiresAt,
            });
          } else {
            return reply.code(400).send({ error: 'Invalid credentials' });
          }
        } // Firebase authentication flow
        try {
          const admin = getFirebaseAdmin();
          const auth = admin.auth();

          // Attempt to sign in with Firebase Auth REST API
          if (env.FIREBASE_API_KEY === undefined || env.FIREBASE_API_KEY.trim().length === 0) {
            return reply.code(500).send({ error: 'Firebase API key not configured' });
          }

          const firebaseResponse = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${env.FIREBASE_API_KEY}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email,
                password,
                returnSecureToken: true,
              }),
            }
          );

          const firebaseData = (await firebaseResponse.json()) as
            | FirebaseAuthResponse
            | FirebaseAuthError;

          if (!firebaseResponse.ok) {
            const errorData = firebaseData as FirebaseAuthError;
            const errorMessage = errorData.error.message || 'Authentication failed';
            return reply.code(401).send({ error: errorMessage });
          }

          const authData = firebaseData as FirebaseAuthResponse;

          // Get user record from Firebase
          const userRecord = await auth.getUser(authData.localId);

          // Generate our own JWT
          const token = generateToken(userRecord.uid);
          const expiresAt = new Date(
            Date.now() + parseInt(env.JWT_EXPIRES_IN) * 1000
          ).toISOString();

          return {
            token,
            user: {
              id: userRecord.uid,
              email: userRecord.email ?? '',
              displayName: userRecord.displayName ?? '',
            },
            expiresAt,
          };
        } catch (firebaseError) {
          // Handle Firebase permission errors by falling back to mock
          if (
            firebaseError instanceof Error &&
            firebaseError.message.includes('PERMISSION_DENIED')
          ) {
            console.warn('Firebase permission denied during login - falling back to mock');
            // For permission errors, provide mock authentication if credentials are valid
            if (email.trim() !== '' && password.trim() !== '' && password.length >= 8) {
              const mockUser = {
                id: `mock-fallback-${Date.now()}`,
                email,
                displayName: email.split('@')[0] ?? 'User',
              };

              const token = generateToken(mockUser.id);
              const expiresAt = new Date(
                Date.now() + Number(env.JWT_EXPIRES_IN) * 1000
              ).toISOString();

              return reply.send({
                token,
                user: mockUser,
                expiresAt,
              });
            } else {
              return reply.code(401).send({ error: 'Invalid credentials' });
            }
          }

          throw firebaseError;
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({ error: error.errors[0]?.message ?? INVALID_REQUEST });
        }
        fastify.log.error('Login error:', error);
        return reply.code(500).send({ error: INTERNAL_SERVER_ERROR });
      }
    }
  );

  // Register route
  fastify.post(
    '/api/auth/register',
    {
      schema: {
        description: 'Register a new user',
        tags: ['Authentication'],
        body: {
          type: 'object',
          required: ['email', 'password', 'displayName'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            displayName: { type: 'string', minLength: 2 },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              token: { type: 'string' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  displayName: { type: 'string' },
                },
              },
              expiresAt: { type: 'string' },
            },
          },
          400: {
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
        const { email, password, displayName } = registerSchema.parse(request.body);

        // Check if Firebase is enabled and has proper permissions
        const hasFirebasePermissions = await checkFirebasePermissions();

        if (!env.FIREBASE_ENABLED || !hasFirebasePermissions) {
          // For Firebase-disabled mode or permission issues, provide a mock registration response
          console.log(
            'Firebase disabled or insufficient permissions - providing mock registration for testing'
          );

          // Simple mock validation (replace with your actual registration logic)
          if (email && password && password.length >= 8 && displayName && displayName.length >= 2) {
            const mockUser = {
              id: `mock-${Date.now()}`,
              email,
              displayName,
            };

            const token = generateToken(mockUser.id);
            const expiresAt = new Date(
              Date.now() + Number(env.JWT_EXPIRES_IN) * 1000
            ).toISOString();

            return reply.code(201).send({
              token,
              user: mockUser,
              expiresAt,
            });
          } else {
            return reply.code(400).send({ error: 'Invalid registration data' });
          }
        } // Firebase registration flow
        const admin = getFirebaseAdmin();
        const auth = admin.auth();

        try {
          // Create user in Firebase Auth
          const userRecord = await auth.createUser({
            email,
            password,
            displayName,
            emailVerified: false,
          });

          // Generate our own JWT
          const token = generateToken(userRecord.uid);
          const expiresAt = new Date(
            Date.now() + parseInt(env.JWT_EXPIRES_IN) * 1000
          ).toISOString();

          return reply.code(201).send({
            token,
            user: {
              id: userRecord.uid,
              email: userRecord.email ?? '',
              displayName: userRecord.displayName ?? '',
            },
            expiresAt,
          });
        } catch (firebaseError) {
          // Handle Firebase permission errors by falling back to mock
          if (
            firebaseError instanceof Error &&
            firebaseError.message.includes('PERMISSION_DENIED')
          ) {
            console.warn('Firebase permission denied during registration - falling back to mock');
            const mockUser = {
              id: `mock-fallback-${Date.now()}`,
              email,
              displayName,
            };

            const token = generateToken(mockUser.id);
            const expiresAt = new Date(
              Date.now() + Number(env.JWT_EXPIRES_IN) * 1000
            ).toISOString();

            return reply.code(201).send({
              token,
              user: mockUser,
              expiresAt,
            });
          }

          // Handle other Firebase Auth errors
          const authError = firebaseError as { code?: string; };
          if (authError.code === 'auth/email-already-exists') {
            return reply.code(409).send({ error: 'Email already in use' });
          }

          throw firebaseError;
        }
      } catch (error: unknown) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({ error: error.errors[0]?.message ?? INVALID_REQUEST });
        }

        fastify.log.error('Registration error:', error);
        return reply.code(500).send({ error: INTERNAL_SERVER_ERROR });
      }
    }
  );

  // Logout route
  fastify.post(
    '/api/auth/logout',
    {
      schema: {
        description: 'Logout the current user',
        tags: ['Authentication'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
            },
          },
        },
      },
    },
    async (_request: FastifyRequest, _reply: FastifyReply) => {
      // Since JWT is stateless, actual logout happens on client
      // Here we just return success
      return { success: true };
    }
  );

  // Token refresh route
  fastify.post(
    '/api/auth/refresh',
    {
      schema: {
        description: 'Refresh authentication token',
        tags: ['Authentication'],
        body: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              token: { type: 'string' },
              refreshToken: { type: 'string' },
              expiresIn: { type: 'number' },
            },
          },
          400: {
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
        const { refreshToken } = refreshTokenSchema.parse(request.body);

        // Check if Firebase is enabled
        if (!env.FIREBASE_ENABLED) {
          // For Firebase-disabled mode, provide a mock refresh response
          console.log('Firebase disabled - providing mock token refresh');

          // Simple mock token refresh (replace with your actual refresh logic)
          try {
            const decoded = jwt.verify(refreshToken, env.JWT_SECRET) as { uid: string; };
            const newToken = generateToken(decoded.uid);
            const expiresIn = Number(env.JWT_EXPIRES_IN);
            return {
              token: newToken,
              refreshToken, // In a real system, you'd generate a new refresh token
              expiresIn,
            };
          } catch {
            return reply.code(400).send({ error: 'Invalid refresh token' });
          }
        }

        // Firebase refresh flow
        // Validate Firebase API key
        if (env.FIREBASE_API_KEY === undefined || env.FIREBASE_API_KEY.trim().length === 0) {
          return reply.code(500).send({ error: 'Firebase API key not configured' });
        }

        const { id_token, refresh_token } = await refreshFirebaseToken(
          refreshToken,
          env.FIREBASE_API_KEY
        ); // Verify token and generate new JWT
        const { token, expiresAt } = await verifyAndGenerateTokens(id_token);

        // Calculate expiresIn from expiresAt for API compatibility
        const expiresIn = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);

        return {
          token,
          refreshToken: refresh_token,
          expiresIn,
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({ error: error.errors[0]?.message ?? INVALID_REQUEST });
        }
        fastify.log.error('Token refresh error:', error);
        return reply.code(500).send({ error: INTERNAL_SERVER_ERROR });
      }
    }
  ); // Token verification route
  fastify.post(
    '/api/auth/verify',
    {
      schema: {
        description: 'Verify authentication token',
        tags: ['Authentication'],
        body: {
          type: 'object',
          required: ['token'],
          properties: {
            token: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              valid: { type: 'boolean' },
              user: {
                type: 'object',
                properties: {
                  uid: { type: 'string' },
                  email: { type: 'string' },
                  displayName: { type: 'string' },
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
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { token } = verifyTokenSchema.parse(request.body);

        // Check if Firebase is enabled
        if (!env.FIREBASE_ENABLED) {
          // For Firebase-disabled mode, verify JWT token
          console.log('Firebase disabled - verifying JWT token');

          try {
            const decoded = jwt.verify(token, env.JWT_SECRET) as { uid: string; };
            // In a real application, you would fetch user data from your database
            const mockUser = {
              uid: decoded.uid,
              email: 'user@example.com', // Replace with actual user data lookup
              displayName: 'User',
            };

            return {
              valid: true,
              user: mockUser,
            };
          } catch {
            return reply.code(400).send({ error: 'Invalid or expired token' });
          }
        }

        // Firebase verification flow
        const admin = getFirebaseAdmin();
        const auth = admin.auth();
        const decodedToken = await auth.verifyIdToken(token);

        // Get user from Firebase
        const userRecord = await auth.getUser(decodedToken.uid);

        return {
          valid: true,
          user: {
            uid: userRecord.uid,
            email: userRecord.email ?? '',
            displayName: userRecord.displayName ?? '',
          },
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({ error: error.errors[0]?.message ?? INVALID_REQUEST });
        }
        fastify.log.error('Token verification error:', error);
        return reply.code(400).send({ error: 'Invalid or expired token' });
      }
    }
  );
}

// Fastify plugin format
function authRoutesPlugin(fastify: FastifyInstance): Promise<void> {
  return Promise.resolve(registerAuthRoutes(fastify));
}

// Default export for easier importing
export default authRoutesPlugin;
