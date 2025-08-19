import type { CodaiAuthConfig, CodaiOAuthConfig, CodaiSAMLConfig } from '../types/index.js';

export const DEFAULT_OAUTH_SCOPES = ['openid', 'profile', 'email'];
export const DEFAULT_SESSION_TIMEOUT = 3600; // 1 hour

export function createKeycloakConfig(options: {
    realm: string;
    clientId: string;
    clientSecret?: string;
    baseUrl: string;
    redirectUri: string;
    scopes?: string[];
}): CodaiAuthConfig {
    return {
        provider: 'keycloak',
        clientId: options.clientId,
        clientSecret: options.clientSecret,
        authUrl: `${options.baseUrl}/realms/${options.realm}/protocol/openid-connect`,
        redirectUri: options.redirectUri,
        scopes: options.scopes || DEFAULT_OAUTH_SCOPES
    };
}

export function createAuth0Config(options: {
    domain: string;
    clientId: string;
    clientSecret?: string;
    redirectUri: string;
    scopes?: string[];
}): CodaiAuthConfig {
    return {
        provider: 'auth0',
        clientId: options.clientId,
        clientSecret: options.clientSecret,
        authUrl: `https://${options.domain}`,
        redirectUri: options.redirectUri,
        scopes: options.scopes || DEFAULT_OAUTH_SCOPES
    };
}

export function createSAMLConfig(options: {
    entityId: string;
    ssoUrl: string;
    certificate?: string;
    signRequests?: boolean;
    encryptAssertions?: boolean;
}): CodaiAuthConfig {
    return {
        provider: 'saml',
        clientId: options.entityId,
        authUrl: options.ssoUrl,
        redirectUri: '', // Not used for SAML
        entityId: options.entityId,
        ssoUrl: options.ssoUrl,
        certificate: options.certificate
    };
}

export function validateAuthConfig(config: CodaiAuthConfig): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (!config.clientId) {
        errors.push('clientId is required');
    }

    if (!config.authUrl) {
        errors.push('authUrl is required');
    }

    if ((config.provider === 'keycloak' || config.provider === 'auth0') && !config.redirectUri) {
        errors.push('redirectUri is required for OAuth providers');
    }

    if (config.provider === 'saml') {
        if (!config.entityId) {
            errors.push('entityId is required for SAML provider');
        }
        if (!config.ssoUrl) {
            errors.push('ssoUrl is required for SAML provider');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

export function getAuthConfigFromEnvironment(): Partial<CodaiAuthConfig> {
    return {
        provider: (process.env.CODAI_AUTH_PROVIDER as any) || 'keycloak',
        clientId: process.env.CODAI_AUTH_CLIENT_ID || '',
        clientSecret: process.env.CODAI_AUTH_CLIENT_SECRET,
        authUrl: process.env.CODAI_AUTH_URL || '',
        redirectUri: process.env.CODAI_AUTH_REDIRECT_URI || '',
        scopes: process.env.CODAI_AUTH_SCOPES?.split(',') || DEFAULT_OAUTH_SCOPES,
        entityId: process.env.CODAI_SAML_ENTITY_ID,
        ssoUrl: process.env.CODAI_SAML_SSO_URL,
        certificate: process.env.CODAI_SAML_CERTIFICATE
    };
}
