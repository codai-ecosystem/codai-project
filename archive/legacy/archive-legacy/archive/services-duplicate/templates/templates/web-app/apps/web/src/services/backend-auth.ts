import { ApiService } from './api';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    displayName: string;
  };
  expiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  displayName: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordUpdateRequest {
  oldPassword: string;
  newPassword: string;
}

/**
 * Auth service for backend authentication
 */
export class BackendAuthService {
  /**
   * Login with email and password
   */
  static async login(
    credentials: LoginCredentials
  ): Promise<AuthResponse | null> {
    const response = await ApiService.post<AuthResponse>(
      '/auth/login',
      credentials
    );

    if (response.error || !response.data) {
      return null;
    }

    return response.data;
  }

  /**
   * Register a new user
   */
  static async register(
    credentials: RegisterCredentials
  ): Promise<AuthResponse | null> {
    const response = await ApiService.post<AuthResponse>(
      '/auth/register',
      credentials
    );

    if (response.error || !response.data) {
      return null;
    }

    return response.data;
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(
    data: PasswordResetRequest
  ): Promise<boolean> {
    const response = await ApiService.post<{ success: boolean }>(
      '/auth/password-reset',
      data
    );
    return !response.error && response.data?.success === true;
  }

  /**
   * Update password (requires authentication)
   */
  static async updatePassword(data: PasswordUpdateRequest): Promise<boolean> {
    const response = await ApiService.post<{ success: boolean }>(
      '/auth/update-password',
      data
    );
    return !response.error && response.data?.success === true;
  }

  /**
   * Logout the user
   */
  static async logout(): Promise<boolean> {
    const response = await ApiService.post<{ success: boolean }>(
      '/auth/logout',
      {}
    );
    return !response.error && response.data?.success === true;
  }

  /**
   * Verify current auth token
   */
  static async verifyToken(): Promise<boolean> {
    const response = await ApiService.get<{ valid: boolean }>('/auth/verify');
    return !response.error && response.data?.valid === true;
  }
}
