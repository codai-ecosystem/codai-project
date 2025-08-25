import { createEnhancedLogoutEndpoint } from '@codai/api-utils/auth';

/**
 * CODAI ID Logout API
 * Migrated to use @codai/api-utils standardized auth utilities
 */

// Create standardized logout endpoint with multiple cookie clearing
const logoutEndpoint = createEnhancedLogoutEndpoint({
  service: 'CODAI ID',
  cookieName: 'codai_auth_token',
  cookieDomain: process.env.NODE_ENV === 'production' ? '.codai.ro' : undefined,
  onSuccess: async (user, request) => {
    console.log(`[CODAI ID] User logged out successfully`);
    // TODO: Log logout event for security monitoring
    // TODO: Revoke refresh tokens if applicable
  }
});

export const { POST } = logoutEndpoint;
