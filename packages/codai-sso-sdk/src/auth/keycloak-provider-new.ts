import { NextAuthOptions } from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';
import { SSOConfig, AuthEvent, AuthEventType } from './types';

/**
 * Creates NextAuth configuration for Keycloak SSO integration
 */
export function createKeycloakProvider(config: SSOConfig): NextAuthOptions {
  return {
    providers: [
      KeycloakProvider({
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        issuer: `${config.keycloakUrl}/realms/${config.realm}`,
        authorization: {
          params: {
            scope: config.scopes.join(' ')
          }
        }
      })
    ],

    session: {
      strategy: 'jwt',
      maxAge: config.sessionTimeout
    },

    jwt: {
      maxAge: config.sessionTimeout
    },

    callbacks: {
      async jwt({ token, user, account }) {
        // Store additional user information in JWT
        if (user && account) {
          // Extract roles and permissions from Keycloak token
          const profile = account.profile || {};
          token.roles = extractRoles(profile);
          token.permissions = extractPermissions(profile);
          token.lastActivity = Date.now();

          // Generate device fingerprint and ID
          token.deviceId = generateDeviceId();
          token.riskScore = 0.1; // Initial low risk
          token.isTrusted = false; // New device
        }

        return token;
      },

      async session({ session, token }) {
        // Include CODAI-specific session data
        if (token && session.user) {
          // Add CODAI extensions to session
          (session as any).user.roles = token.roles || [];
          (session as any).user.permissions = token.permissions || [];

          (session as any).codai = {
            deviceId: token.deviceId || '',
            deviceFingerprint: '', // Will be set by middleware
            riskScore: token.riskScore || 0.1,
            isTrusted: token.isTrusted || false,
            roles: token.roles || [],
            permissions: token.permissions || [],
            lastActivity: new Date((token.lastActivity as number) || Date.now())
          };
        }

        return session;
      },

      async signIn({ user, account, profile }) {
        try {
          // Log authentication attempt
          await logAuthEvent({
            type: AuthEventType.LOGIN_ATTEMPT,
            userId: user.id || '',
            success: true,
            timestamp: new Date()
          });

          return true;
        } catch (error) {
          await logAuthEvent({
            type: AuthEventType.LOGIN_FAILED,
            userId: user.id || '',
            success: false,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date()
          });

          return false;
        }
      },

      async redirect({ url, baseUrl }) {
        if (url.startsWith('/')) {
          return `${baseUrl}${url}`;
        } else if (new URL(url).origin === baseUrl) {
          return url;
        }
        return baseUrl;
      }
    },

    events: {
      async signIn(message) {
        await logAuthEvent({
          type: AuthEventType.LOGIN_SUCCESS,
          userId: message.user.id || '',
          success: true,
          timestamp: new Date()
        });
      },

      async signOut(message) {
        if (message.token) {
          await logAuthEvent({
            type: AuthEventType.LOGOUT,
            userId: (message.token as any).sub || '',
            success: true,
            timestamp: new Date()
          });
        }
      }
    },

    pages: {
      signIn: '/auth/signin',
      signOut: '/auth/signout',
      error: '/auth/error'
    },

    debug: process.env.NODE_ENV === 'development'
  };
}

/**
 * Extract roles from Keycloak profile
 */
function extractRoles(profile: any): string[] {
  const roles: string[] = [];

  // Extract realm roles
  if (profile.realm_access?.roles) {
    roles.push(...profile.realm_access.roles);
  }

  // Extract client roles
  if (profile.resource_access) {
    Object.values(profile.resource_access).forEach((client: any) => {
      if (client.roles) {
        roles.push(...client.roles);
      }
    });
  }

  return roles.filter(role => !['offline_access', 'uma_authorization'].includes(role));
}

/**
 * Extract permissions from Keycloak profile
 */
function extractPermissions(profile: any): string[] {
  const permissions: string[] = [];

  // Extract from custom claims
  if (profile.permissions) {
    permissions.push(...profile.permissions);
  }

  // Extract from roles (role-based permissions)
  const roles = extractRoles(profile);
  const rolePermissions = mapRolesToPermissions(roles);
  permissions.push(...rolePermissions);

  return [...new Set(permissions)]; // Remove duplicates
}

/**
 * Map roles to permissions based on RBAC configuration
 */
function mapRolesToPermissions(roles: string[]): string[] {
  const rolePermissionMap: Record<string, string[]> = {
    'super_admin': ['*'],
    'admin': ['users:read', 'users:write', 'apps:read', 'apps:write', 'system:read'],
    'developer': ['apps:read', 'apps:write', 'code:read', 'code:write'],
    'user': ['profile:read', 'profile:write'],
    'viewer': ['profile:read']
  };

  const permissions: string[] = [];
  for (const role of roles) {
    if (rolePermissionMap[role]) {
      permissions.push(...rolePermissionMap[role]);
    }
  }

  return [...new Set(permissions)];
}

/**
 * Generate unique device identifier
 */
function generateDeviceId(): string {
  return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Log authentication events for audit trail
 */
async function logAuthEvent(event: AuthEvent): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    console.log('[AUTH EVENT]', event);
  }

  // In production, this would send to logging service
  try {
    // Send to CODAI ID audit service
    await fetch(`${process.env.CODAI_ID_URL}/api/audit/auth-events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CODAI_ID_SERVICE_TOKEN}`
      },
      body: JSON.stringify(event)
    });
  } catch (error) {
    console.error('Failed to log auth event:', error);
  }
}
