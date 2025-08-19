/**
 * ID Service Client for CODAI SDK
 * Manages authentication, user identity, and authorization
 */

import type {
  CODAIConfig,
  ApiResponse,
  ServiceHealth
} from '../types/common';
import type {
  User,
  AuthToken,
  LoginCredentials,
  RegisterData
} from '../types/services';
import { BaseClient } from './BaseClient';

export class IdClient extends BaseClient {
  constructor(config: CODAIConfig) {
    super(config.endpoints.id, config);
  }

  /**
   * Get ID service health status
   */
  async health(): Promise<ApiResponse<ServiceHealth>> {
    return this.request<ServiceHealth>({
      method: 'GET',
      url: '/health'
    });
  }

  /**
   * User authentication
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthToken>> {
    return this.request<AuthToken>({
      method: 'POST',
      url: '/auth/login',
      data: credentials
    });
  }

  /**
   * User registration
   */
  async register(userData: RegisterData): Promise<ApiResponse<{
    user: User;
    token: AuthToken;
  }>> {
    return this.request({
      method: 'POST',
      url: '/auth/register',
      data: userData
    });
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthToken>> {
    return this.request<AuthToken>({
      method: 'POST',
      url: '/auth/refresh',
      data: { refreshToken }
    });
  }

  /**
   * User logout
   */
  async logout(): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'POST',
      url: '/auth/logout'
    });
  }

  /**
   * Logout from all devices
   */
  async logoutAll(): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'POST',
      url: '/auth/logout-all'
    });
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<ApiResponse<{
    success: boolean;
    message: string;
  }>> {
    return this.request({
      method: 'POST',
      url: '/auth/verify-email',
      data: { token }
    });
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(email: string): Promise<ApiResponse<{
    success: boolean;
    message: string;
  }>> {
    return this.request({
      method: 'POST',
      url: '/auth/send-verification',
      data: { email }
    });
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<ApiResponse<{
    success: boolean;
    message: string;
  }>> {
    return this.request({
      method: 'POST',
      url: '/auth/password-reset',
      data: { email }
    });
  }

  /**
   * Reset password with token
   */
  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<ApiResponse<{
    success: boolean;
    message: string;
  }>> {
    return this.request({
      method: 'POST',
      url: '/auth/password-reset/confirm',
      data: { token, password: newPassword }
    });
  }

  /**
   * Change password (authenticated)
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<{
    success: boolean;
    message: string;
  }>> {
    return this.request({
      method: 'PUT',
      url: '/auth/change-password',
      data: { currentPassword, newPassword }
    });
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>({
      method: 'GET',
      url: '/user/profile'
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>({
      method: 'PUT',
      url: '/user/profile',
      data: updates
    });
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(avatar: File | Buffer): Promise<ApiResponse<{
    avatarUrl: string;
  }>> {
    const formData = new FormData();
    formData.append('avatar', avatar);

    return this.request({
      method: 'POST',
      url: '/user/avatar',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  /**
   * Delete user avatar
   */
  async deleteAvatar(): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'DELETE',
      url: '/user/avatar'
    });
  }

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<ApiResponse<Record<string, any>>> {
    return this.request<Record<string, any>>({
      method: 'GET',
      url: '/user/preferences'
    });
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    preferences: Record<string, any>
  ): Promise<ApiResponse<Record<string, any>>> {
    return this.request<Record<string, any>>({
      method: 'PUT',
      url: '/user/preferences',
      data: preferences
    });
  }

  /**
   * Get user sessions
   */
  async getSessions(): Promise<ApiResponse<Array<{
    id: string;
    device: string;
    location: string;
    current: boolean;
    lastActive: string;
    created: string;
  }>>> {
    return this.request({
      method: 'GET',
      url: '/user/sessions'
    });
  }

  /**
   * Revoke specific session
   */
  async revokeSession(sessionId: string): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'DELETE',
      url: `/user/sessions/${sessionId}`
    });
  }

  /**
   * Get user activity log
   */
  async getActivityLog(options?: {
    limit?: number;
    offset?: number;
    type?: string;
  }): Promise<ApiResponse<Array<{
    id: string;
    type: string;
    description: string;
    ip: string;
    userAgent: string;
    timestamp: string;
  }>>> {
    return this.request({
      method: 'GET',
      url: '/user/activity',
      params: options
    });
  }

  /**
   * Enable two-factor authentication
   */
  async enableTwoFactor(): Promise<ApiResponse<{
    secret: string;
    qrCode: string;
    backupCodes: string[];
  }>> {
    return this.request({
      method: 'POST',
      url: '/auth/2fa/enable'
    });
  }

  /**
   * Confirm two-factor authentication setup
   */
  async confirmTwoFactor(token: string): Promise<ApiResponse<{
    success: boolean;
    backupCodes: string[];
  }>> {
    return this.request({
      method: 'POST',
      url: '/auth/2fa/confirm',
      data: { token }
    });
  }

  /**
   * Disable two-factor authentication
   */
  async disableTwoFactor(token: string): Promise<ApiResponse<{
    success: boolean;
    message: string;
  }>> {
    return this.request({
      method: 'POST',
      url: '/auth/2fa/disable',
      data: { token }
    });
  }

  /**
   * Verify two-factor authentication token
   */
  async verifyTwoFactor(token: string): Promise<ApiResponse<{
    valid: boolean;
  }>> {
    return this.request({
      method: 'POST',
      url: '/auth/2fa/verify',
      data: { token }
    });
  }

  /**
   * Generate new backup codes
   */
  async generateBackupCodes(): Promise<ApiResponse<{
    backupCodes: string[];
  }>> {
    return this.request({
      method: 'POST',
      url: '/auth/2fa/backup-codes'
    });
  }

  /**
   * Get user roles and permissions
   */
  async getRoles(): Promise<ApiResponse<{
    roles: string[];
    permissions: string[];
  }>> {
    return this.request({
      method: 'GET',
      url: '/user/roles'
    });
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(permission: string): Promise<ApiResponse<{
    hasPermission: boolean;
  }>> {
    return this.request({
      method: 'GET',
      url: `/user/permissions/${permission}`
    });
  }

  /**
   * Get API keys for user
   */
  async getApiKeys(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    keyPrefix: string;
    scopes: string[];
    lastUsed?: string;
    created: string;
    expiresAt?: string;
  }>>> {
    return this.request({
      method: 'GET',
      url: '/user/api-keys'
    });
  }

  /**
   * Create new API key
   */
  async createApiKey(data: {
    name: string;
    scopes: string[];
    expiresAt?: string;
  }): Promise<ApiResponse<{
    id: string;
    name: string;
    key: string;
    scopes: string[];
    expiresAt?: string;
  }>> {
    return this.request({
      method: 'POST',
      url: '/user/api-keys',
      data
    });
  }

  /**
   * Revoke API key
   */
  async revokeApiKey(keyId: string): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'DELETE',
      url: `/user/api-keys/${keyId}`
    });
  }

  /**
   * Delete user account
   */
  async deleteAccount(password: string): Promise<ApiResponse<{
    success: boolean;
    message: string;
  }>> {
    return this.request({
      method: 'DELETE',
      url: '/user/account',
      data: { password }
    });
  }

  /**
   * Export user data (GDPR compliance)
   */
  async exportUserData(): Promise<ApiResponse<{
    downloadUrl: string;
    expiresAt: string;
  }>> {
    return this.request({
      method: 'POST',
      url: '/user/export'
    });
  }
}
