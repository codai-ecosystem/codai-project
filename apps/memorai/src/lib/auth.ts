/**
 * CODAI Authentication Configuration for MemorAI
 * Real authentication setup using CODAI ecosystem integration
 */

// Direct import of SSO configuration functions
interface CodaiSSOConfig {
    clientId: string;
    clientSecret?: string;
    authUrl: string;
    redirectUri: string;
    scopes: string[];
}

function createCodaiSSOConfig(config: Partial<CodaiSSOConfig>): CodaiSSOConfig {
    return {
        clientId: config.clientId || 'memorai-app-client',
        clientSecret: config.clientSecret,
        authUrl: config.authUrl || 'https://auth.codai.ro',
        redirectUri: config.redirectUri || 'http://localhost:4006/api/auth/callback/codai',
        scopes: config.scopes || ['openid', 'profile', 'email', 'organizations', 'memorai:read', 'memorai:write']
    };
}

// Extended user type for CODAI integration
export interface CodaiUser {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    roles?: string[];
    organizations?: any[];
    permissions?: string[];
}

// Extended session type
export interface CodaiSession {
    user?: CodaiUser;
    accessToken?: string;
    error?: string;
    expires: string;
}

// Create CODAI SSO Configuration
const codaiSSOConfig = createCodaiSSOConfig({
    clientId: process.env.CODAI_CLIENT_ID || 'memorai-app-client',
    clientSecret: process.env.CODAI_CLIENT_SECRET,
    authUrl: process.env.CODAI_AUTH_URL || 'https://auth.codai.ro',
    redirectUri: `${process.env.NEXTAUTH_URL || 'http://localhost:4006'}/api/auth/callback/codai`,
    scopes: ['openid', 'profile', 'email', 'organizations', 'memorai:read', 'memorai:write']
});

// CODAI OAuth Provider Configuration using real SSO SDK
export const CodaiProvider = {
    id: 'codai',
    name: 'CODAI',
    type: 'oauth' as const,
    version: '2.0',
    authorization: {
        url: `${codaiSSOConfig.authUrl}/oauth/authorize`,
        params: {
            scope: codaiSSOConfig.scopes.join(' '),
            response_type: 'code',
            grant_type: 'authorization_code'
        }
    },
    token: `${codaiSSOConfig.authUrl}/oauth/token`,
    userinfo: `${process.env.CODAI_ID_URL || 'https://id.codai.ro'}/api/user/profile`,
    clientId: codaiSSOConfig.clientId,
    clientSecret: codaiSSOConfig.clientSecret,

    // Profile mapping from CODAI ID service
    profile(profile: any): CodaiUser {
        return {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            image: profile.avatar_url || profile.picture,
            roles: profile.roles || [],
            organizations: profile.organizations || [],
            permissions: profile.permissions || []
        };
    }
};

// Helper functions for role and permission checking
export function hasRole(session: CodaiSession | null, role: string): boolean {
    return session?.user?.roles?.includes(role) ?? false;
}

export function hasPermission(session: CodaiSession | null, permission: string): boolean {
    return session?.user?.permissions?.includes(permission) ?? false;
}

export function isMemorAIUser(session: CodaiSession | null): boolean {
    return hasPermission(session, 'memorai:read') || hasPermission(session, 'memorai:write');
}

/**
 * Authentication Configuration
 */
export const authConfig = {
    providers: [CodaiProvider],

    // Session configuration
    session: {
        strategy: 'jwt' as const,
        maxAge: 24 * 60 * 60, // 24 hours
        updateAge: 60 * 60,   // 1 hour
    },

    // JWT configuration
    jwt: {
        maxAge: 24 * 60 * 60, // 24 hours
    },

    // Pages configuration
    pages: {
        signIn: '/auth/signin',
        signOut: '/auth/signout',
        error: '/auth/error',
        verifyRequest: '/auth/verify-request',
        newUser: '/auth/new-user'
    },

    // Environment variables
    env: {
        CODAI_AUTH_URL: process.env.CODAI_AUTH_URL || 'https://auth.codai.ro',
        CODAI_ID_URL: process.env.CODAI_ID_URL || 'https://id.codai.ro',
        CODAI_CLIENT_ID: process.env.CODAI_CLIENT_ID || 'memorai-app-client',
        CODAI_CLIENT_SECRET: process.env.CODAI_CLIENT_SECRET || 'development-secret',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:4006',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'development-secret'
    }
};

/**
 * Refresh Access Token
 * Handles token refresh with CODAI auth service
 */
export async function refreshAccessToken(token: any) {
    try {
        const url = `${authConfig.env.CODAI_AUTH_URL}/oauth/token`;

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            method: 'POST',
            body: new URLSearchParams({
                client_id: authConfig.env.CODAI_CLIENT_ID,
                client_secret: authConfig.env.CODAI_CLIENT_SECRET,
                grant_type: 'refresh_token',
                refresh_token: token.refreshToken,
            }),
        });

        const refreshedTokens = await response.json();

        if (!response.ok) {
            throw refreshedTokens;
        }

        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
        };
    } catch (error) {
        console.error('[NextAuth] Error refreshing access token:', error);

        return {
            ...token,
            error: 'RefreshAccessTokenError',
        };
    }
}

/**
 * Authentication Helper Functions
 */
export const auth = {
    // Check if user has specific role
    hasRole: (session: CodaiSession | null, role: string): boolean => {
        return session?.user?.roles?.includes(role) ?? false;
    },

    // Check if user has specific permission
    hasPermission: (session: CodaiSession | null, permission: string): boolean => {
        return session?.user?.permissions?.includes(permission) ?? false;
    },

    // Check if user belongs to organization
    hasOrganization: (session: CodaiSession | null, orgId: string): boolean => {
        return session?.user?.organizations?.some((org: any) => org.id === orgId) ?? false;
    },

    // Get user's organizations
    getUserOrganizations: (session: CodaiSession | null) => {
        return session?.user?.organizations ?? [];
    }
};

/**
 * Mock auth functions for development
 * These will be replaced with actual NextAuth.js functions once it's properly installed
 */
export const mockAuth = {
    signIn: async (provider: string, options?: any) => {
        console.log(`[Mock Auth] Sign in with ${provider}`, options);
        // In development, redirect to a mock authentication page
        if (typeof window !== 'undefined') {
            window.location.href = '/auth/mock-signin?provider=' + provider;
        }
    },

    signOut: async (options?: any) => {
        console.log('[Mock Auth] Sign out', options);
        if (typeof window !== 'undefined') {
            window.location.href = '/auth/mock-signout';
        }
    },

    useSession: () => {
        // Mock session for development
        return {
            data: null,
            status: 'unauthenticated' as const
        };
    },

    getSession: async () => {
        // Mock session getter
        return null;
    }
};
