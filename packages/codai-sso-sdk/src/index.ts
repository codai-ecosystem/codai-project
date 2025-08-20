/**
 * CODAI SSO SDK - Enterprise Authentication Integration
 * 
 * This SDK provides seamless integration with the CODAI ID Enterprise System
 * for all applications in the CODAI ecosystem.
 * 
 * Features:
 * - Keycloak SSO integration
 * - Zero Trust device management
 * - Role-based access control (RBAC)
 * - Session management
 * - Security event logging
 * - Multi-factor authentication support
 */

export * from './auth/types';
export * from './auth/keycloak-provider-new';
export * from './hooks/use-auth';
export * from './utils/security';
export * from './config/sso-config';

// Re-export commonly used functions
export { createCodaiSSOConfig, getEnvironmentConfig, createSSOConfig } from './config/sso-config';
export { createKeycloakProvider } from './auth/keycloak-provider-new';
export { useCodaiAuth, useRBAC, usePermissions, useDeviceSecurity } from './hooks/use-auth';
export { generateDeviceFingerprint, calculateRiskScore, validateJWT } from './utils/security';
