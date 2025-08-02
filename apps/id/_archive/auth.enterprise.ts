/**
 * Enterprise Authentication Library
 * Exports Enhanced Auth Service for production and advanced security features
 */

import { EnhancedAuthService } from '../services/enhanced-auth';

// Create and export singleton instance with enterprise security configuration
const enterpriseAuthInstance = new EnhancedAuthService();

// Export the service instance
export const enterpriseAuth = enterpriseAuthInstance;

// Export the service class for direct instantiation if needed
export { EnhancedAuthService } from '../services/enhanced-auth';

// Export types for TypeScript support
export type {
  User,
  CreateUserData,
  LoginCredentials,
  AuthenticationResult,
  UserSession,
  SecurityConfig,
  SecurityAlert
} from '../services/enhanced-auth';

// Temporary compatibility - TODO: Update API routes to use auth middleware
export const authOptions = {
  // This is a placeholder - routes should use the auth middleware instead
  providers: [],
  session: { strategy: 'jwt' as const }
};

// Default export for convenience
export default enterpriseAuthInstance;
