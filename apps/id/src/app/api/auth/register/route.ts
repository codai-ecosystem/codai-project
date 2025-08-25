import { createEnhancedRegisterEndpoint } from '@codai/api-utils/auth';

/**
 * CODAI ID Registration API  
 * Migrated to use @codai/api-utils standardized auth utilities with enhanced security
 */

// Create standardized register endpoint with enhanced security validation
const registerEndpoint = createEnhancedRegisterEndpoint({
  service: 'CODAI ID',
  version: '1.0.0',
  cookieName: 'codai_auth_token',
  cookieDomain: process.env.NODE_ENV === 'production' ? '.codai.ro' : undefined,
  onSuccess: async (user, request) => {
    console.log(`[CODAI ID] User registered successfully: ${user.email} (${user.name})`);
    // TODO: Send welcome email
    // TODO: Add user to CBD database
  },
  onFailure: async (error, request) => {
    console.error(`[CODAI ID] Registration failed:`, error.message);
    // TODO: Log registration attempt for security monitoring
  },
  customValidator: async (request) => {
    // Additional custom validation can be added here
    // e.g., rate limiting, IP blacklist checking, etc.
    return true;
  }
});

export const { POST } = registerEndpoint;
