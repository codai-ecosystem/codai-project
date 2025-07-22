/**
 * CODAI Application - Enterprise SSO Integration
 * NextAuth.js configuration using CODAI SSO SDK
 */

import NextAuth from 'next-auth';
import { createKeycloakProvider, createCodaiSSOConfig } from '@codai/sso-sdk';

// Create SSO configuration for CODAI application
const ssoConfig = createCodaiSSOConfig({
  appName: 'codai',
  clientId: process.env.KEYCLOAK_CLIENT_ID!,
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  port: 4001, // Updated to enterprise port standard
  customConfig: {
    // CODAI-specific configuration
    scopes: ['openid', 'profile', 'email', 'roles', 'code'],
    sessionTimeout: 3600, // 1 hour for development environment
    enableZeroTrust: true,
    enableAuditLogging: true
  }
});

// Export NextAuth configuration
const handler = NextAuth(createKeycloakProvider(ssoConfig));

export { handler as GET, handler as POST };
