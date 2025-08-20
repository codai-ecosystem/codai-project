/**
 * ID Service
 * Authentication and identity management operations
 */

import { CodeaiClient } from '../client/CodeaiClient';
import {
    AuthCredentials,
    AuthToken,
    AuthUser,
    RegisterRequest,
    LoginRequest,
    RefreshTokenRequest,
    AuthSession
} from '../types/auth';
import { HealthStatus } from '../types/common';

export class IdService {
    constructor(private client: CodeaiClient) { }

    /**
     * Get ID Service health status
     */
    async getHealth(): Promise<HealthStatus> {
        return this.client.request<HealthStatus>({
            method: 'GET',
            url: '/api/v1/id/health'
        });
    }

    /**
     * Register a new user
     */
    async register(data: RegisterRequest): Promise<AuthSession> {
        const response = await this.client.request<{
            user: AuthUser;
            token: AuthToken;
        }>({
            method: 'POST',
            url: '/api/v1/id/auth/register',
            data
        });

        const session: AuthSession = {
            user: response.user,
            token: response.token,
            isAuthenticated: true
        };

        this.client.setSession(session);
        return session;
    }

    /**
     * Login user
     */
    async login(credentials: LoginRequest): Promise<AuthSession> {
        const response = await this.client.request<{
            user: AuthUser;
            token: AuthToken;
        }>({
            method: 'POST',
            url: '/api/v1/id/auth/login',
            data: credentials
        });

        const session: AuthSession = {
            user: response.user,
            token: response.token,
            isAuthenticated: true
        };

        this.client.setSession(session);
        return session;
    }

    /**
     * Logout user
     */
    async logout(): Promise<void> {
        await this.client.request({
            method: 'POST',
            url: '/api/v1/id/auth/logout'
        });

        this.client.clearAuthToken();
    }

    /**
     * Refresh authentication token
     */
    async refreshToken(request: RefreshTokenRequest): Promise<AuthToken> {
        const token = await this.client.request<AuthToken>({
            method: 'POST',
            url: '/api/v1/id/auth/refresh',
            data: request
        });

        this.client.setAuthToken(token.accessToken);
        return token;
    }

    /**
     * Get current user profile
     */
    async getProfile(): Promise<AuthUser> {
        return this.client.request<AuthUser>({
            method: 'GET',
            url: '/api/v1/id/auth/profile'
        });
    }

    /**
     * Update user profile
     */
    async updateProfile(updates: Partial<AuthUser>): Promise<AuthUser> {
        return this.client.request<AuthUser>({
            method: 'PUT',
            url: '/api/v1/id/auth/profile',
            data: updates
        });
    }

    /**
     * Verify authentication token
     */
    async verifyToken(): Promise<AuthUser> {
        return this.client.request<AuthUser>({
            method: 'GET',
            url: '/api/v1/id/auth/verify'
        });
    }

    /**
     * Change user password
     */
    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
        await this.client.request({
            method: 'POST',
            url: '/api/v1/id/auth/change-password',
            data: {
                currentPassword,
                newPassword
            }
        });
    }

    /**
     * Request password reset
     */
    async requestPasswordReset(email: string): Promise<void> {
        await this.client.request({
            method: 'POST',
            url: '/api/v1/id/auth/password-reset',
            data: { email }
        });
    }

    /**
     * Reset password with token
     */
    async resetPassword(token: string, newPassword: string): Promise<void> {
        await this.client.request({
            method: 'POST',
            url: '/api/v1/id/auth/password-reset/confirm',
            data: {
                token,
                newPassword
            }
        });
    }

    /**
     * List user sessions
     */
    async getSessions(): Promise<any[]> {
        return this.client.request<any[]>({
            method: 'GET',
            url: '/api/v1/id/auth/sessions'
        });
    }

    /**
     * Revoke specific session
     */
    async revokeSession(sessionId: string): Promise<void> {
        await this.client.request({
            method: 'DELETE',
            url: `/api/v1/id/auth/sessions/${sessionId}`
        });
    }

    /**
     * Revoke all sessions
     */
    async revokeAllSessions(): Promise<void> {
        await this.client.request({
            method: 'DELETE',
            url: '/api/v1/id/auth/sessions'
        });
    }
}
