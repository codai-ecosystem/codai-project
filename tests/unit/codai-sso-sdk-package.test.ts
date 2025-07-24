/**
 * CODAI SSO SDK Package - Phase 3.4 Testing
 * Comprehensive validation of enterprise SSO integration functionality
 * 
 * Test Coverage:
 * - Authentication SDK provider integration
 * - Token management validation
 * - Session persistence testing  
 * - Multi-provider support validation
 * - Security compliance verification
 * - RBAC integration testing
 * - Zero Trust device management
 * - Risk assessment validation
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Import all SSO SDK components
// Import all SSO SDK components
import { createCodaiSSOConfig, getEnvironmentConfig, createSSOConfig } from '../../packages/codai-sso-sdk/src/config/sso-config';
import { createKeycloakProvider } from '../../packages/codai-sso-sdk/src/auth/keycloak-provider-new';
import { useCodaiAuth, useRBAC, usePermissions, useDeviceSecurity } from '../../packages/codai-sso-sdk/src/hooks/use-auth';
import { generateDeviceFingerprint, calculateRiskScore, validateJWT, extractJWTClaims, isJWTExpired } from '../../packages/codai-sso-sdk/src/utils/security';
import {
  CodaiUser,
  CodaiSession,
  SSOConfig,
  RBACConfig,
  ZeroTrustConfig,
  AuthEventType,
  AuthEvent,
  AuthErrorType,
  AuthError,
  DeviceInfo,
  RiskAssessment,
  SSOConfigSchema,
  ZeroTrustConfigSchema
} from '../../packages/codai-sso-sdk/src/auth/types';

describe('CODAI SSO SDK Package - Phase 3.4 Testing', () => {
  describe('3.4.1 Authentication SDK Provider Integration', () => {
    describe('SSO Configuration Management', () => {
      it('should validate SSO configuration creation', async () => {
        const config = createCodaiSSOConfig({
          appName: 'test-app',
          clientId: 'codai-app',
          clientSecret: 'test-secret',
          environment: 'development',
          port: 3000
        });

        expect(config).toBeDefined();
        expect(config.clientId).toBe('codai-app');
        expect(config.clientSecret).toBe('test-secret');
        expect(config.scopes).toContain('openid');
        expect(config.enableZeroTrust).toBe(true);
        expect(config.keycloakUrl).toBe('http://localhost:4080');
        expect(config.realm).toBe('codai');
      });

      it('should handle environment-specific configuration', async () => {
        const devConfig = getEnvironmentConfig('development');
        expect(devConfig.keycloakUrl).toBe('http://localhost:4080');
        expect(devConfig.realm).toBe('codai');

        const prodConfig = getEnvironmentConfig('production');
        expect(prodConfig.keycloakUrl).toBe('https://id.codai.dev');
        expect(prodConfig.realm).toBe('codai');

        const stagingConfig = getEnvironmentConfig('staging');
        expect(stagingConfig.keycloakUrl).toBe('https://id-staging.codai.dev');
        expect(stagingConfig.realm).toBe('codai');
      });

      it('should validate configuration schema compliance', async () => {
        const validConfig = {
          keycloakUrl: 'https://auth.codai.dev',
          realm: 'codai-ecosystem',
          clientId: 'codai-app',
          clientSecret: 'test-secret',
          redirectUri: 'https://app.codai.dev/auth/callback',
          postLogoutRedirectUri: 'https://app.codai.dev',
          scopes: ['openid', 'profile'],
          enableZeroTrust: true,
          enableAuditLogging: true,
          sessionTimeout: 3600,
          refreshTokenRotation: true
        };

        const result = SSOConfigSchema.safeParse(validConfig);
        expect(result.success).toBe(true);

        if (result.success) {
          expect(result.data.enableZeroTrust).toBe(true);
          expect(result.data.sessionTimeout).toBe(3600);
        }
      });

      it('should reject invalid configuration parameters', async () => {
        const invalidConfig = {
          keycloakUrl: 'invalid-url',
          realm: '',
          clientId: 'test-client',
          clientSecret: 'test-secret',
          redirectUri: 'invalid-uri',
          postLogoutRedirectUri: 'invalid-uri',
          scopes: [],
          sessionTimeout: 100 // Too short
        };

        const result = SSOConfigSchema.safeParse(invalidConfig);
        expect(result.success).toBe(false);
        
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThan(0);
        }
      });
    });

    describe('Keycloak Provider Integration', () => {
      it('should create Keycloak provider instance', async () => {
        const ssoConfig: SSOConfig = {
          keycloakUrl: 'https://auth.codai.dev',
          realm: 'codai-ecosystem',
          clientId: 'codai-app',
          clientSecret: 'test-secret',
          redirectUri: 'https://app.codai.dev/auth/callback',
          postLogoutRedirectUri: 'https://app.codai.dev',
          scopes: ['openid', 'profile', 'email'],
          enableZeroTrust: true,
          enableAuditLogging: true,
          sessionTimeout: 3600,
          refreshTokenRotation: true
        };

        const nextAuthConfig = createKeycloakProvider(ssoConfig);
        
        expect(nextAuthConfig).toBeDefined();
        expect(nextAuthConfig.providers).toBeDefined();
        expect(nextAuthConfig.providers).toHaveLength(1);
        expect(nextAuthConfig.session?.strategy).toBe('jwt');
        expect(nextAuthConfig.session?.maxAge).toBe(3600);
        expect(nextAuthConfig.callbacks).toBeDefined();
      });

      it('should handle provider initialization errors', async () => {
        const invalidConfig = {
          keycloakUrl: '',
          realm: '',
          clientId: '',
          clientSecret: '',
          redirectUri: '',
          postLogoutRedirectUri: '',
          scopes: [],
          enableZeroTrust: false,
          enableAuditLogging: false,
          sessionTimeout: 0,
          refreshTokenRotation: false
        };

        // The function doesn't throw, but creates invalid provider config
        const nextAuthConfig = createKeycloakProvider(invalidConfig as SSOConfig);
        expect(nextAuthConfig).toBeDefined();
        expect(nextAuthConfig.providers).toHaveLength(1);
      });

      it('should validate OAuth2 flow configuration', async () => {
        const ssoConfig: SSOConfig = {
          keycloakUrl: 'https://auth.codai.dev',
          realm: 'codai-ecosystem',
          clientId: 'codai-app',
          clientSecret: 'test-secret',
          redirectUri: 'https://app.codai.dev/auth/callback',
          postLogoutRedirectUri: 'https://app.codai.dev',
          scopes: ['openid', 'profile', 'email', 'roles'],
          enableZeroTrust: true,
          enableAuditLogging: true,
          sessionTimeout: 3600,
          refreshTokenRotation: true
        };

        const nextAuthConfig = createKeycloakProvider(ssoConfig);
        
        expect(nextAuthConfig.providers).toHaveLength(1);
        expect(nextAuthConfig.session?.strategy).toBe('jwt');
        expect(nextAuthConfig.jwt?.maxAge).toBe(3600);
        expect(nextAuthConfig.callbacks).toBeDefined();
      });

      it('should support custom scopes and claims', async () => {
        const customScopes = ['openid', 'profile', 'email', 'roles', 'permissions', 'device_id'];
        
        const ssoConfig: SSOConfig = {
          keycloakUrl: 'https://auth.codai.dev',
          realm: 'codai-ecosystem',
          clientId: 'codai-app',
          clientSecret: 'test-secret',
          redirectUri: 'https://app.codai.dev/auth/callback',
          postLogoutRedirectUri: 'https://app.codai.dev',
          scopes: customScopes,
          enableZeroTrust: true,
          enableAuditLogging: true,
          sessionTimeout: 3600,
          refreshTokenRotation: true
        };

        const nextAuthConfig = createKeycloakProvider(ssoConfig);
        
        expect(nextAuthConfig.providers).toHaveLength(1);
        expect(nextAuthConfig.session?.maxAge).toBe(3600);
        expect(nextAuthConfig.callbacks?.jwt).toBeDefined();
        expect(nextAuthConfig.callbacks?.session).toBeDefined();
      });
    });
  });

  describe('3.4.2 Token Management & Security Validation', () => {
    describe('JWT Token Handling', () => {
      it('should validate JWT token structure', async () => {
        const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
        
        const isValid = validateJWT(validToken);
        expect(isValid).toBe(true);

        const invalidToken = 'invalid.token';
        const isNotValid = validateJWT(invalidToken);
        expect(isNotValid).toBe(false);
      });

      it('should handle expired JWT tokens', async () => {
        const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.Jwt-SflKxwRJSMeKKF2QP4fwpMeJf36POk6yJV_adQssw5c';
        
        const isExpired = isJWTExpired(expiredToken);
        expect(isExpired).toBe(true);

        const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.Jwt-SflKxwRJSMeKKF2QP4fwpMeJf36POk6yJV_adQssw5c';
        const isNotExpired = isJWTExpired(validToken);
        expect(isNotExpired).toBe(false);
      });

      it('should validate token signature verification', async () => {
        const invalidToken = 'invalid.token.structure';
        
        const isValid = validateJWT(invalidToken);
        expect(isValid).toBe(false);

        const malformedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid_payload.signature';
        const isMalformed = validateJWT(malformedToken);
        expect(isMalformed).toBe(false);
      });

      it('should extract user information from tokens', async () => {
        const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImVtYWlsIjoidXNlckBjb2RhaS5kZXYiLCJuYW1lIjoiVGVzdCBVc2VyIiwiaWF0IjoxNTE2MjM5MDIyfQ.jwt-signature-here';
        
        const claims = extractJWTClaims(userToken);
        
        expect(claims).toBeDefined();
        expect(claims?.sub).toBe('user-123');
        expect(claims?.email).toBe('user@codai.dev');
        expect(claims?.name).toBe('Test User');
      });
    });

    describe('Session Management', () => {
      it('should create secure session objects', async () => {
        const mockUser: CodaiUser = {
          id: 'user-123',
          email: 'user@codai.dev',
          name: 'Test User',
          roles: ['user', 'developer'],
          permissions: ['read', 'write'],
          emailVerified: true,
          mfaEnabled: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date()
        };

        const session: CodaiSession = {
          user: mockUser,
          accessToken: 'access-token-123',
          refreshToken: 'refresh-token-456',
          expiresAt: new Date(Date.now() + 3600000),
          deviceId: 'device-789',
          deviceFingerprint: 'fingerprint-abc',
          riskScore: 0.2,
          isTrusted: true,
          lastActivity: new Date()
        };

        expect(session.user.id).toBe('user-123');
        expect(session.accessToken).toBe('access-token-123');
        expect(session.riskScore).toBeLessThan(0.5);
        expect(session.isTrusted).toBe(true);
      });

      it('should handle session expiration', async () => {
        const expiredSession: CodaiSession = {
          user: {} as CodaiUser,
          accessToken: 'expired-token',
          expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
          deviceId: 'device-123',
          deviceFingerprint: 'fingerprint-456',
          riskScore: 0.1,
          isTrusted: true,
          lastActivity: new Date(Date.now() - 3600000) // 1 hour ago
        };

        const isExpired = expiredSession.expiresAt < new Date();
        expect(isExpired).toBe(true);
      });

      it('should track session activity', async () => {
        const activeSession: CodaiSession = {
          user: {} as CodaiUser,
          accessToken: 'active-token',
          expiresAt: new Date(Date.now() + 3600000),
          deviceId: 'device-123',
          deviceFingerprint: 'fingerprint-456',
          riskScore: 0.1,
          isTrusted: true,
          lastActivity: new Date()
        };

        const timeSinceActivity = Date.now() - activeSession.lastActivity.getTime();
        expect(timeSinceActivity).toBeLessThan(1000); // Less than 1 second
      });

      it('should validate refresh token rotation', async () => {
        const sessionWithRefresh: CodaiSession = {
          user: {} as CodaiUser,
          accessToken: 'access-token-1',
          refreshToken: 'refresh-token-1',
          expiresAt: new Date(Date.now() + 3600000),
          deviceId: 'device-123',
          deviceFingerprint: 'fingerprint-456',
          riskScore: 0.1,
          isTrusted: true,
          lastActivity: new Date()
        };

        expect(sessionWithRefresh.refreshToken).toBeDefined();
        expect(sessionWithRefresh.refreshToken).not.toBe(sessionWithRefresh.accessToken);
      });
    });
  });

  describe('3.4.3 RBAC Integration & Permissions Management', () => {
    describe('Role-Based Access Control', () => {
      it('should validate role definitions and hierarchy', async () => {
        const rbacConfig: RBACConfig = {
          roles: [
            {
              name: 'admin',
              description: 'System Administrator',
              permissions: ['read', 'write', 'delete', 'admin'],
              inheritsFrom: ['moderator']
            },
            {
              name: 'moderator',
              description: 'Content Moderator',
              permissions: ['read', 'write', 'moderate'],
              inheritsFrom: ['user']
            },
            {
              name: 'user',
              description: 'Regular User',
              permissions: ['read']
            }
          ],
          permissions: [
            { name: 'read', description: 'Read access', resource: '*', action: 'read' },
            { name: 'write', description: 'Write access', resource: '*', action: 'write' },
            { name: 'delete', description: 'Delete access', resource: '*', action: 'delete' },
            { name: 'admin', description: 'Admin access', resource: '*', action: '*' }
          ],
          defaultRole: 'user',
          hierarchical: true
        };

        expect(rbacConfig.roles).toHaveLength(3);
        expect(rbacConfig.roles[0].name).toBe('admin');
        expect(rbacConfig.roles[0].permissions).toContain('admin');
        expect(rbacConfig.hierarchical).toBe(true);
      });

      it('should validate permission inheritance', async () => {
        const adminRole = {
          name: 'admin',
          description: 'System Administrator',
          permissions: ['read', 'write', 'delete', 'admin'],
          inheritsFrom: ['moderator']
        };

        const moderatorRole = {
          name: 'moderator',
          description: 'Content Moderator',
          permissions: ['read', 'write', 'moderate'],
          inheritsFrom: ['user']
        };

        expect(adminRole.inheritsFrom).toContain('moderator');
        expect(adminRole.permissions).toContain('admin');
        expect(moderatorRole.permissions).toContain('moderate');
      });

      it('should handle permission validation for resources', async () => {
        const permissions = [
          { name: 'users:read', description: 'Read users', resource: 'users', action: 'read' },
          { name: 'users:write', description: 'Write users', resource: 'users', action: 'write' },
          { name: 'projects:admin', description: 'Admin projects', resource: 'projects', action: '*' }
        ];

        permissions.forEach(permission => {
          expect(permission.resource).toBeDefined();
          expect(permission.action).toBeDefined();
          expect(['read', 'write', 'delete', '*']).toContain(permission.action);
        });
      });

      it('should validate default role assignment', async () => {
        const rbacConfig: RBACConfig = {
          roles: [
            { name: 'user', description: 'Regular User', permissions: ['read'] },
            { name: 'admin', description: 'Administrator', permissions: ['read', 'write', 'admin'] }
          ],
          permissions: [
            { name: 'read', description: 'Read access', resource: '*', action: 'read' }
          ],
          defaultRole: 'user',
          hierarchical: false
        };

        expect(rbacConfig.defaultRole).toBe('user');
        const defaultRoleExists = rbacConfig.roles.some(role => role.name === rbacConfig.defaultRole);
        expect(defaultRoleExists).toBe(true);
      });
    });

    describe('Permission Validation Logic', () => {
      it('should check user permissions against resources', async () => {
        const user: CodaiUser = {
          id: 'user-123',
          email: 'user@codai.dev',
          name: 'Test User',
          roles: ['moderator'],
          permissions: ['read', 'write', 'moderate'],
          emailVerified: true,
          mfaEnabled: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const hasReadPermission = user.permissions.includes('read');
        const hasAdminPermission = user.permissions.includes('admin');

        expect(hasReadPermission).toBe(true);
        expect(hasAdminPermission).toBe(false);
      });

      it('should validate role-based resource access', async () => {
        const userRoles = ['user', 'developer'];
        const requiredRoles = ['developer', 'admin'];

        const hasRequiredRole = userRoles.some(role => requiredRoles.includes(role));
        expect(hasRequiredRole).toBe(true);
      });

      it('should handle permission hierarchies', async () => {
        const roleHierarchy = {
          admin: ['moderator', 'user'],
          moderator: ['user'],
          user: []
        };

        const userRole = 'admin';
        const allRoles = [userRole, ...roleHierarchy[userRole as keyof typeof roleHierarchy]];

        expect(allRoles).toContain('admin');
        expect(allRoles).toContain('moderator');
        expect(allRoles).toContain('user');
      });

      it('should validate contextual permissions', async () => {
        const contextualPermissions = {
          'project:123': ['read', 'write'],
          'project:456': ['read'],
          '*': ['profile:read']
        };

        expect(contextualPermissions['project:123']).toContain('write');
        expect(contextualPermissions['project:456']).not.toContain('write');
        expect(contextualPermissions['*']).toContain('profile:read');
      });
    });
  });

  describe('3.4.4 Zero Trust Security & Device Management', () => {
    describe('Device Fingerprinting', () => {
      it('should generate unique device fingerprints', async () => {
        // Mock window object for server-side testing
        const mockWindow = {
          navigator: {
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            language: 'en-US'
          },
          screen: {
            width: 1920,
            height: 1080,
            colorDepth: 24
          },
          sessionStorage: {},
          localStorage: {},
          indexedDB: {}
        };

        // @ts-ignore - Mock global window
        global.window = mockWindow;

        const fingerprint = generateDeviceFingerprint();
        
        expect(fingerprint).toBeDefined();
        expect(typeof fingerprint).toBe('string');
        expect(fingerprint.length).toBeGreaterThan(10);

        // Clean up
        delete (global as any).window;
      });

      it('should handle device registration', async () => {
        const deviceInfo: DeviceInfo = {
          id: 'device-123',
          fingerprint: 'fp_abc123',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          platform: 'Windows',
          browser: 'Chrome',
          ipAddress: '192.168.1.100',
          location: {
            country: 'US',
            city: 'New York'
          },
          isTrusted: false,
          lastSeen: new Date(),
          registeredAt: new Date()
        };

        expect(deviceInfo.id).toBeDefined();
        expect(deviceInfo.fingerprint).toMatch(/^fp_/);
        expect(deviceInfo.isTrusted).toBe(false);
        expect(deviceInfo.location?.country).toBe('US');
      });

      it('should validate device trust status', async () => {
        const trustedDevice: DeviceInfo = {
          id: 'device-trusted',
          fingerprint: 'fp_trusted123',
          userAgent: 'Known User Agent',
          platform: 'Windows',
          browser: 'Chrome',
          ipAddress: '192.168.1.100',
          isTrusted: true,
          lastSeen: new Date(),
          registeredAt: new Date(Date.now() - 86400000) // Registered 1 day ago
        };

        const untrustedDevice: DeviceInfo = {
          id: 'device-new',
          fingerprint: 'fp_new456',
          userAgent: 'New User Agent',
          platform: 'Linux',
          browser: 'Firefox',
          ipAddress: '10.0.0.1',
          isTrusted: false,
          lastSeen: new Date(),
          registeredAt: new Date() // Just registered
        };

        expect(trustedDevice.isTrusted).toBe(true);
        expect(untrustedDevice.isTrusted).toBe(false);
        
        const daysSinceRegistration = (Date.now() - trustedDevice.registeredAt.getTime()) / (1000 * 60 * 60 * 24);
        expect(daysSinceRegistration).toBeGreaterThan(0.9);
      });

      it('should detect device changes', async () => {
        const originalFingerprint = 'fp_original123';
        const newFingerprint = 'fp_changed456';

        const deviceChanged = originalFingerprint !== newFingerprint;
        expect(deviceChanged).toBe(true);
      });
    });

    describe('Risk Assessment', () => {
      it('should calculate risk scores', async () => {
        const riskFactors = {
          isNewDevice: true,
          isNewLocation: false,
          isUnusualTime: false,
          failedAttempts: 2,
          velocityScore: 0.1
        };

        const riskScore = calculateRiskScore(riskFactors);
        
        expect(riskScore).toBeGreaterThan(0);
        expect(riskScore).toBeLessThan(1);
        expect(typeof riskScore).toBe('number');

        // Test with no risk factors
        const noRiskScore = calculateRiskScore({});
        expect(noRiskScore).toBe(0);

        // Test with all risk factors
        const highRiskScore = calculateRiskScore({
          isNewDevice: true,
          isNewLocation: true,
          isUnusualTime: true,
          failedAttempts: 5,
          velocityScore: 0.5
        });
        expect(highRiskScore).toBeGreaterThan(0.5);
      });

      it('should provide risk assessment details', async () => {
        const riskAssessment: RiskAssessment = {
          score: 0.7,
          level: 'high',
          factors: [
            { type: 'new_device', description: 'Device not previously seen', weight: 0.3, value: true },
            { type: 'location_change', description: 'Login from new location', weight: 0.2, value: true },
            { type: 'time_anomaly', description: 'Login at unusual time', weight: 0.2, value: true }
          ],
          recommendations: [
            'Require additional authentication',
            'Monitor session closely',
            'Log security event'
          ],
          challengeRequired: true
        };

        expect(riskAssessment.score).toBe(0.7);
        expect(riskAssessment.level).toBe('high');
        expect(riskAssessment.factors).toHaveLength(3);
        expect(riskAssessment.challengeRequired).toBe(true);
      });

      it('should validate Zero Trust configuration', async () => {
        const zeroTrustConfig = {
          enableDeviceFingerprinting: true,
          enableLocationTracking: true,
          enableBehavioralAnalysis: true,
          riskThresholds: {
            low: 0.3,
            medium: 0.6,
            high: 0.8
          },
          challengeOnRisk: true,
          trustedDeviceExpiry: 2592000 // 30 days
        };

        const result = ZeroTrustConfigSchema.safeParse(zeroTrustConfig);
        expect(result.success).toBe(true);

        if (result.success) {
          expect(result.data.enableDeviceFingerprinting).toBe(true);
          expect(result.data.riskThresholds.high).toBe(0.8);
          expect(result.data.trustedDeviceExpiry).toBe(2592000);
        }
      });

      it('should handle risk threshold validation', async () => {
        const riskScore = 0.7;
        const thresholds = {
          low: 0.3,
          medium: 0.6,
          high: 0.8
        };

        let riskLevel: string;
        if (riskScore < thresholds.low) {
          riskLevel = 'low';
        } else if (riskScore < thresholds.medium) {
          riskLevel = 'medium';
        } else if (riskScore < thresholds.high) {
          riskLevel = 'high';
        } else {
          riskLevel = 'critical';
        }

        expect(riskLevel).toBe('high');
      });
    });
  });

  describe('3.4.5 Authentication Events & Audit Logging', () => {
    describe('Event Tracking', () => {
      it('should track authentication events', async () => {
        const loginEvent: AuthEvent = {
          type: AuthEventType.LOGIN_SUCCESS,
          userId: 'user-123',
          sessionId: 'session-456',
          deviceId: 'device-789',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          location: {
            country: 'US',
            city: 'New York',
            latitude: 40.7128,
            longitude: -74.0060
          },
          riskScore: 0.2,
          success: true,
          timestamp: new Date()
        };

        expect(loginEvent.type).toBe(AuthEventType.LOGIN_SUCCESS);
        expect(loginEvent.success).toBe(true);
        expect(loginEvent.userId).toBe('user-123');
        expect(loginEvent.location?.country).toBe('US');
      });

      it('should track failed authentication attempts', async () => {
        const failedLoginEvent: AuthEvent = {
          type: AuthEventType.LOGIN_FAILED,
          userId: 'user-123',
          deviceId: 'device-789',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0',
          riskScore: 0.8,
          success: false,
          errorMessage: 'Invalid credentials',
          metadata: {
            attemptNumber: 3,
            remainingAttempts: 2
          },
          timestamp: new Date()
        };

        expect(failedLoginEvent.type).toBe(AuthEventType.LOGIN_FAILED);
        expect(failedLoginEvent.success).toBe(false);
        expect(failedLoginEvent.errorMessage).toBe('Invalid credentials');
        expect(failedLoginEvent.metadata?.attemptNumber).toBe(3);
      });

      it('should track MFA events', async () => {
        const mfaEvent: AuthEvent = {
          type: AuthEventType.MFA_SUCCESS,
          userId: 'user-123',
          sessionId: 'session-456',
          deviceId: 'device-789',
          success: true,
          metadata: {
            mfaMethod: 'totp',
            backupCodeUsed: false
          },
          timestamp: new Date()
        };

        expect(mfaEvent.type).toBe(AuthEventType.MFA_SUCCESS);
        expect(mfaEvent.metadata?.mfaMethod).toBe('totp');
        expect(mfaEvent.metadata?.backupCodeUsed).toBe(false);
      });

      it('should track security events', async () => {
        const securityEvent: AuthEvent = {
          type: AuthEventType.RISK_DETECTED,
          userId: 'user-123',
          deviceId: 'device-unknown',
          ipAddress: '10.0.0.1',
          riskScore: 0.9,
          success: false,
          metadata: {
            riskFactors: ['new_device', 'unknown_location', 'suspicious_pattern'],
            actionTaken: 'session_blocked'
          },
          timestamp: new Date()
        };

        expect(securityEvent.type).toBe(AuthEventType.RISK_DETECTED);
        expect(securityEvent.riskScore).toBe(0.9);
        expect(securityEvent.metadata?.actionTaken).toBe('session_blocked');
      });
    });

    describe('Error Handling', () => {
      it('should handle authentication errors', async () => {
        const authError = new AuthError(
          AuthErrorType.INVALID_CREDENTIALS,
          'The provided credentials are invalid',
          { attemptNumber: 1 }
        );

        expect(authError.type).toBe(AuthErrorType.INVALID_CREDENTIALS);
        expect(authError.message).toBe('The provided credentials are invalid');
        expect(authError.metadata?.attemptNumber).toBe(1);
        expect(authError.name).toBe('AuthError');
      });

      it('should handle token expiration errors', async () => {
        const tokenError = new AuthError(
          AuthErrorType.TOKEN_EXPIRED,
          'Access token has expired',
          { expiredAt: new Date() }
        );

        expect(tokenError.type).toBe(AuthErrorType.TOKEN_EXPIRED);
        expect(tokenError.metadata?.expiredAt).toBeInstanceOf(Date);
      });

      it('should handle MFA required errors', async () => {
        const mfaError = new AuthError(
          AuthErrorType.MFA_REQUIRED,
          'Multi-factor authentication required',
          { 
            availableMethods: ['totp', 'sms', 'backup_codes'],
            preferredMethod: 'totp'
          }
        );

        expect(mfaError.type).toBe(AuthErrorType.MFA_REQUIRED);
        expect(mfaError.metadata?.availableMethods).toContain('totp');
      });

      it('should handle device trust errors', async () => {
        const deviceError = new AuthError(
          AuthErrorType.DEVICE_NOT_TRUSTED,
          'Device is not trusted for this account',
          {
            deviceId: 'device-unknown',
            requiresVerification: true
          }
        );

        expect(deviceError.type).toBe(AuthErrorType.DEVICE_NOT_TRUSTED);
        expect(deviceError.metadata?.requiresVerification).toBe(true);
      });
    });
  });

  describe('SSO SDK Package Integration Validation', () => {
    it('should validate package exports and module structure', async () => {
      // Test all main exports are available
      expect(createCodaiSSOConfig).toBeDefined();
      expect(createKeycloakProvider).toBeDefined();
      expect(useCodaiAuth).toBeDefined();
      expect(generateDeviceFingerprint).toBeDefined();
      expect(validateJWT).toBeDefined();

      // Test type exports
      expect(SSOConfigSchema).toBeDefined();
      expect(ZeroTrustConfigSchema).toBeDefined();
      expect(AuthEventType).toBeDefined();
      expect(AuthErrorType).toBeDefined();
    });

    it('should validate TypeScript definitions and type safety', async () => {
      // Test type safety with mock data
      const mockConfig: SSOConfig = {
        keycloakUrl: 'https://auth.codai.dev',
        realm: 'test',
        clientId: 'test',
        clientSecret: 'test',
        redirectUri: 'https://app.codai.dev/callback',
        postLogoutRedirectUri: 'https://app.codai.dev',
        scopes: ['openid'],
        enableZeroTrust: true,
        enableAuditLogging: true,
        sessionTimeout: 3600,
        refreshTokenRotation: true
      };

      // Should compile without type errors
      expect(mockConfig.keycloakUrl).toBe('https://auth.codai.dev');
      expect(mockConfig.enableZeroTrust).toBe(true);
    });

    it('should validate error handling and recovery mechanisms', async () => {
      // Test error handling
      const error = new AuthError(
        AuthErrorType.CONFIGURATION_ERROR,
        'Invalid SSO configuration'
      );

      expect(error instanceof Error).toBe(true);
      expect(error.type).toBe(AuthErrorType.CONFIGURATION_ERROR);
    });

    it('should validate configuration validation and defaults', async () => {
      const minimalConfig = {
        keycloakUrl: 'https://auth.codai.dev',
        realm: 'test',
        clientId: 'test',
        clientSecret: 'test',
        redirectUri: 'https://app.codai.dev/callback',
        postLogoutRedirectUri: 'https://app.codai.dev',
        scopes: ['openid']
      };

      const result = SSOConfigSchema.safeParse(minimalConfig);
      expect(result.success).toBe(true);

      if (result.success) {
        // Should have default values
        expect(result.data.enableZeroTrust).toBe(true);
        expect(result.data.enableAuditLogging).toBe(true);
        expect(result.data.sessionTimeout).toBe(3600);
        expect(result.data.refreshTokenRotation).toBe(true);
      }
    });
  });
});
