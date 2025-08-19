export interface CodaiUser {
    id: string;
    email: string;
    name: string;
    roles: string[];
    permissions: string[];
}

export interface CodaiAuthConfig {
    provider: 'keycloak' | 'auth0' | 'saml' | 'custom';
    clientId: string;
    clientSecret?: string;
    authUrl: string;
    redirectUri: string;
    scopes?: string[];
    // SAML specific
    entityId?: string;
    ssoUrl?: string;
    certificate?: string;
    // Custom provider specific
    customProvider?: CodaiAuthProvider;
}

export interface CodaiOAuthConfig {
    clientId: string;
    clientSecret?: string;
    authUrl: string;
    redirectUri: string;
    scopes?: string[];
}

export interface CodaiSAMLConfig {
    entityId: string;
    ssoUrl: string;
    certificate?: string;
    signRequests?: boolean;
    encryptAssertions?: boolean;
}

export interface CodaiAuthProvider {
    name: string;
    type: 'oauth' | 'saml' | 'custom';
    authenticate(config: CodaiOAuthConfig | CodaiSAMLConfig): Promise<{
        success: boolean;
        authUrl?: string;
        user?: CodaiUser | null;
        error?: string;
    }>;
    callback?(code: string, state: string, config: any): Promise<{
        success: boolean;
        user?: CodaiUser;
        tokens?: {
            accessToken: string;
            refreshToken?: string;
            expiresIn: number;
        };
        error?: string;
    }>;
    refresh?(refreshToken: string): Promise<{
        success: boolean;
        tokens?: {
            accessToken: string;
            refreshToken?: string;
            expiresIn: number;
        };
        error?: string;
    }>;
    logout(): Promise<{ success: boolean; error?: string }>;
}

export interface CodaiSession {
    user: CodaiUser;
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
}

export interface RBACPermission {
    resource: string;
    action: string;
    granted: boolean;
}

export interface DeviceSecurityInfo {
    deviceId: string;
    isTrusted: boolean;
    lastVerified: Date;
    riskScore: number;
}
