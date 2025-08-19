import type { CodaiAuthConfig, CodaiSession, CodaiUser } from '../types/index.js';

export function createCodaiAuth(config: CodaiAuthConfig) {
    return {
        signIn: async (credentials: { email: string; password: string }) => {
            // Mock implementation for development
            console.log('CodAI Auth: Sign in attempt', credentials.email);
            return {
                user: {
                    id: '1',
                    email: credentials.email,
                    name: 'Test User',
                    roles: ['user'],
                    permissions: ['read']
                } as CodaiUser,
                accessToken: 'mock-access-token',
                expiresAt: Date.now() + 3600000
            } as CodaiSession;
        },

        signOut: async () => {
            console.log('CodAI Auth: Sign out');
            return true;
        },

        getSession: async () => {
            // Mock session for development
            return null;
        },

        refreshToken: async (refreshToken: string) => {
            console.log('CodAI Auth: Refresh token');
            return 'new-mock-token';
        }
    };
}

export function createCodaiSSOConfig(options: Partial<CodaiAuthConfig> = {}): CodaiAuthConfig {
    return {
        provider: 'keycloak',
        clientId: options.clientId || process.env.CODAI_CLIENT_ID || 'codai-dev',
        clientSecret: options.clientSecret || process.env.CODAI_CLIENT_SECRET || 'codai-secret',
        authUrl: options.authUrl || process.env.CODAI_AUTH_URL || 'https://auth.codai.local',
        redirectUri: options.redirectUri || process.env.CODAI_REDIRECT_URI || 'http://localhost:4001/api/auth/callback',
        scopes: options.scopes || ['openid', 'profile', 'email']
    };
}

export function createKeycloakProvider(config: CodaiAuthConfig) {
    return {
        id: 'codai-keycloak',
        name: 'CodAI Keycloak',
        type: 'oauth',
        version: '1.0',
        authorization: {
            url: `${config.authUrl}/auth/realms/codai/protocol/openid-connect/auth`,
            params: {
                scope: 'openid email profile roles',
                response_type: 'code',
                client_id: config.clientId
            }
        },
        token: `${config.authUrl}/auth/realms/codai/protocol/openid-connect/token`,
        userinfo: `${config.authUrl}/auth/realms/codai/protocol/openid-connect/userinfo`,
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        wellKnown: `${config.authUrl}/auth/realms/codai/.well-known/openid_configuration`
    };
}
