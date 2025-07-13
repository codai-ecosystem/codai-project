import type { CodaiConfig, AuthConfig } from '../types';
import { HttpUtils, StorageUtils, ValidationUtils, ErrorUtils } from '../utils';

// Authentication interfaces
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  roles: string[];
  permissions: string[];
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface Session {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  isValid: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

// Authentication service for CODAI ecosystem
export class AuthService {
  private config: CodaiConfig;
  private httpClient: any;
  private authState: AuthState;

  constructor(config: CodaiConfig) {
    this.config = config;
    this.httpClient = HttpUtils.createHttpClient(
      config.endpoints?.auth || 'https://logai.ro/api'
    );

    this.authState = {
      isAuthenticated: false,
      user: null,
      session: null,
      loading: false,
      error: null
    };

    // Initialize from stored session
    this.initializeFromStorage();
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<User> {
    this.setLoading(true);
    this.setError(null);

    try {
      // Validate credentials
      if (!ValidationUtils.isValidEmail(credentials.email)) {
        throw ErrorUtils.createError('Invalid email address', 'INVALID_EMAIL');
      }

      // Send login request
      const response = await this.httpClient.post('/auth/login', {
        email: credentials.email,
        password: credentials.password,
        rememberMe: credentials.rememberMe || false
      });

      const { user, session } = response.data;

      // Store session
      this.setSession(session);
      this.setUser(user);

      // Persist to storage if enabled
      if (this.config.authentication?.storage !== 'memory') {
        this.persistSession(session);
      }

      this.setAuthenticated(true);
      this.setLoading(false);

      return user;
    } catch (error) {
      this.setError((error as Error).message);
      this.setLoading(false);
      throw error;
    }
  }

  /**
   * Login with social provider
   */
  async loginWithProvider(provider: string, redirectUri?: string): Promise<void> {
    const authUrl = await this.getAuthorizationUrl(provider, redirectUri);
    window.location.href = authUrl;
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    this.setLoading(true);

    try {
      if (this.authState.session) {
        // Send logout request
        await this.httpClient.post('/auth/logout', {
          sessionId: this.authState.session.id
        });
      }

      // Clear local state
      this.clearSession();
      this.setAuthenticated(false);
      this.setUser(null);
      this.setLoading(false);
    } catch (error) {
      console.warn('Logout error:', error);
      // Force clear even if server request fails
      this.clearSession();
      this.setAuthenticated(false);
      this.setUser(null);
      this.setLoading(false);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<Session> {
    if (!this.authState.session?.refreshToken) {
      throw ErrorUtils.createError('No refresh token available', 'NO_REFRESH_TOKEN');
    }

    try {
      const response = await this.httpClient.post('/auth/refresh', {
        refreshToken: this.authState.session.refreshToken
      });

      const session = response.data;
      this.setSession(session);

      // Persist updated session
      if (this.config.authentication?.storage !== 'memory') {
        this.persistSession(session);
      }

      return session;
    } catch (error) {
      // If refresh fails, clear session
      this.clearSession();
      this.setAuthenticated(false);
      throw error;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.authState.user;
  }

  /**
   * Get current session
   */
  getCurrentSession(): Session | null {
    return this.authState.session;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authState.isAuthenticated && this.isSessionValid();
  }

  /**
   * Get authentication state
   */
  getAuthState(): AuthState {
    return { ...this.authState };
  }

  /**
   * Validate access token
   */
  async validateToken(token: string): Promise<User> {
    const response = await this.httpClient.post('/auth/validate', {
      token
    });

    return response.data.user;
  }

  /**
   * Get user permissions
   */
  getUserPermissions(): string[] {
    return this.authState.user?.permissions || [];
  }

  /**
   * Check if user has permission
   */
  hasPermission(permission: string): boolean {
    return this.getUserPermissions().includes(permission);
  }

  /**
   * Get user roles
   */
  getUserRoles(): string[] {
    return this.authState.user?.roles || [];
  }

  /**
   * Check if user has role
   */
  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }

  // Private methods
  private async getAuthorizationUrl(provider: string, redirectUri?: string): Promise<string> {
    const response = await this.httpClient.get(`/auth/providers/${provider}/url`, {
      params: { redirectUri }
    });
    return response.data.url;
  }

  private initializeFromStorage(): void {
    if (this.config.authentication?.storage === 'memory') {
      return;
    }

    const storedSession = StorageUtils.getItem<Session>('codai_session');
    if (storedSession && this.isSessionValid(storedSession)) {
      this.setSession(storedSession);
      this.setAuthenticated(true);

      // Auto-refresh if needed
      this.scheduleTokenRefresh();
    }
  }

  private persistSession(session: Session): void {
    if (this.config.authentication?.storage === 'memory') {
      return;
    }

    StorageUtils.setItem('codai_session', session);
  }

  private clearSession(): void {
    if (this.config.authentication?.storage !== 'memory') {
      StorageUtils.removeItem('codai_session');
    }
  }

  private isSessionValid(session?: Session): boolean {
    const currentSession = session || this.authState.session;
    if (!currentSession) return false;

    return new Date(currentSession.expiresAt) > new Date();
  }

  private scheduleTokenRefresh(): void {
    if (!this.authState.session) return;

    const expiresAt = new Date(this.authState.session.expiresAt);
    const refreshThreshold = this.config.authentication?.refreshThreshold || 5 * 60 * 1000;
    const refreshTime = expiresAt.getTime() - refreshThreshold;
    const currentTime = Date.now();

    if (refreshTime > currentTime) {
      setTimeout(() => {
        this.refreshToken().catch(console.error);
      }, refreshTime - currentTime);
    }
  }

  // State setters
  private setLoading(loading: boolean): void {
    this.authState.loading = loading;
  }

  private setError(error: string | null): void {
    this.authState.error = error;
  }

  private setAuthenticated(isAuthenticated: boolean): void {
    this.authState.isAuthenticated = isAuthenticated;
  }

  private setUser(user: User | null): void {
    this.authState.user = user;
  }

  private setSession(session: Session | null): void {
    this.authState.session = session;
    if (session) {
      this.scheduleTokenRefresh();
    }
  }
}
