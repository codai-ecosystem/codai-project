/**
 * Authentication and authorization types
 */

export interface AuthCredentials {
    email: string;
    password: string;
}

export interface AuthToken {
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
    tokenType: 'Bearer';
}

export interface AuthUser {
    id: string;
    email: string;
    name?: string;
    roles: string[];
    permissions: string[];
    createdAt: string;
    updatedAt: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name?: string;
    metadata?: Record<string, any>;
}

export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface AuthSession {
    user: AuthUser;
    token: AuthToken;
    isAuthenticated: boolean;
}

export interface JwtPayload {
    sub: string;
    email: string;
    roles: string[];
    iat: number;
    exp: number;
    iss: string;
}
