import { createEnhancedLoginEndpoint, type DemoUser } from '@codai/api-utils/auth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userStorage } from '../../../../lib/user-storage';

/**
 * CODAI ID Login API
 * Migrated to use @codai/api-utils standardized auth utilities with userStorage integration
 */

// Create standardized login endpoint with userStorage integration and JWT tokens
const loginEndpoint = createEnhancedLoginEndpoint({
  service: 'CODAI ID',
  version: '1.0.0',
  demoUsers: [], // No demo users - use userStorage
  cookieName: 'codai_auth_token',
  cookieDomain: process.env.NODE_ENV === 'production' ? '.codai.ro' : undefined,
  tokenExpiry: 24 * 60 * 60, // 24 hours
  onSuccess: async (user, request) => {
    console.log(`[CODAI ID] User logged in: ${user.email} (${user.name})`);

    try {
      // Enhanced login flow with userStorage and JWT integration
      const body = await request.json();
      const { email, password } = body;

      // Find user in storage
      const storedUser = userStorage.getUser(email.toLowerCase().trim());
      if (!storedUser) {
        throw new Error('User not found in storage');
      }

      // Validate password with bcrypt
      const isValidPassword = await bcrypt.compare(password, storedUser.password);
      if (!isValidPassword) {
        throw new Error('Invalid password');
      }

      // Generate JWT token with role and groups
      const jwtToken = jwt.sign(
        {
          userId: storedUser.id,
          email: storedUser.email,
          role: storedUser.role,
          groups: storedUser.groups,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        },
        process.env.JWT_SECRET || 'secure-jwt-secret-change-in-production',
        { algorithm: 'HS256' }
      );

      console.log(`[CODAI ID] JWT token generated for user: ${storedUser.email}`);

    } catch (error: any) {
      console.error(`[CODAI ID] Enhanced login integration error:`, error.message);
      throw error;
    }
  },
  onFailure: async (error, request) => {
    console.error(`[CODAI ID] Login failed:`, error.message);
  },
  customValidator: async (request) => {
    try {
      const body = await request.json();
      const { email, password } = body;

      // Basic validation
      if (!email || !password) {
        return false;
      }

      // Find user in userStorage to validate credentials
      const user = userStorage.getUser(email.toLowerCase().trim());
      if (!user) {
        return false;
      }

      // Validate password with bcrypt
      const isValidPassword = await bcrypt.compare(password, user.password);
      return isValidPassword;

    } catch (error: any) {
      console.error(`[CODAI ID] Login validation failed:`, error.message);
      return false;
    }
  }
});

export const { POST } = loginEndpoint;
