import { JWTManager } from './jwt-manager';
import { MfaManager } from './mfa-manager';
import { OAuth2Manager } from './oauth2-manager';
import { RbacManager } from './rbac-manager';
import { AuthConfig } from './auth.config';
import {
  User,
  LoginRequest,
  RegisterRequest,
  TokenPair,
  AuthError,
  AuthErrorCodes,
  OAuth2UserInfo
} from './auth.types';

export class AuthService {
  private jwtManager: JWTManager;
  private mfaManager: MfaManager;
  private oauth2Manager: OAuth2Manager;
  private rbacManager: RbacManager;
  private config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
    this.jwtManager = new JWTManager(config);
    this.mfaManager = new MfaManager(config.security.mfaIssuer);
    this.oauth2Manager = new OAuth2Manager(config.oauth2.providers);
    this.rbacManager = new RbacManager();
  }

  /**
   * Authenticate user with email/password
   */
  async login(loginRequest: LoginRequest): Promise<{ user: User; tokens: TokenPair }> {
    const { email, password, mfaCode } = loginRequest;

    try {
      // This would typically fetch user from database
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw this.createAuthError(AuthErrorCodes.INVALID_CREDENTIALS, 'Invalid email or password');
      }

      // Verify password
      const isPasswordValid = await this.jwtManager.verifyPassword(password, user.passwordHash);
      if (!isPasswordValid) {
        throw this.createAuthError(AuthErrorCodes.INVALID_CREDENTIALS, 'Invalid email or password');
      }

      // Check if email is verified
      if (!user.isEmailVerified) {
        throw this.createAuthError(AuthErrorCodes.EMAIL_NOT_VERIFIED, 'Email not verified');
      }

      // Check MFA if enabled
      if (user.isMfaEnabled) {
        if (!mfaCode) {
          throw this.createAuthError(AuthErrorCodes.MFA_REQUIRED, 'MFA code required');
        }

        const isMfaValid = this.mfaManager.verifyTotpCode(user.mfaSecret!, mfaCode);
        if (!isMfaValid) {
          throw this.createAuthError(AuthErrorCodes.INVALID_MFA_CODE, 'Invalid MFA code');
        }
      }

      // Generate tokens
      const tokens = this.jwtManager.generateTokenPair(user);

      // Update last login
      await this.updateLastLogin(user.id);

      return { user, tokens };
    } catch (error) {
      if (error instanceof Error && error.message.includes('AUTH_ERROR:')) {
        throw error;
      }
      throw this.createAuthError(AuthErrorCodes.INVALID_CREDENTIALS, 'Authentication failed');
    }
  }

  /**
   * Register new user
   */
  async register(registerRequest: RegisterRequest): Promise<{ user: User; tokens: TokenPair }> {
    const { email, password, username, fullName } = registerRequest;

    try {
      // Check if user already exists
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        throw this.createAuthError(AuthErrorCodes.EMAIL_ALREADY_EXISTS, 'Email already registered');
      }

      // Validate password strength
      this.validatePasswordStrength(password);

      // Hash password
      const passwordHash = await this.jwtManager.hashPassword(password);

      // Create user
      const newUser: User = {
        id: this.generateUserId(),
        email,
        username,
        fullName,
        passwordHash,
        roles: [{ id: 'user', name: 'user', description: 'Standard user', permissions: [] }],
        permissions: [],
        isEmailVerified: false,
        isMfaEnabled: false,
        tokenVersion: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save user to database (mock)
      await this.saveUser(newUser);

      // Generate email verification token
      const verificationToken = this.jwtManager.generateEmailVerificationToken(newUser.id, email);
      await this.sendEmailVerification(email, verificationToken);

      // Generate tokens
      const tokens = this.jwtManager.generateTokenPair(newUser);

      return { user: newUser, tokens };
    } catch (error) {
      if (error instanceof Error && error.message.includes('AUTH_ERROR:')) {
        throw error;
      }
      throw this.createAuthError(AuthErrorCodes.USER_NOT_FOUND, 'Registration failed');
    }
  }

  /**
   * OAuth2 login/register
   */
  async oauth2Login(provider: string, code: string, state: string): Promise<{ user: User; tokens: TokenPair }> {
    try {
      // Exchange code for token
      const tokenResponse = await this.oauth2Manager.exchangeCodeForToken(provider, code, state);

      // Get user info
      const oauth2User = await this.oauth2Manager.getUserInfo(provider, tokenResponse.accessToken);

      // Find or create user
      let user = await this.getUserByOAuth2(provider, oauth2User.id);

      if (!user) {
        // Create new user from OAuth2 info
        user = await this.createUserFromOAuth2(oauth2User);
      }

      // Generate tokens
      const tokens = this.jwtManager.generateTokenPair(user);

      return { user, tokens };
    } catch (error) {
      throw this.createAuthError(AuthErrorCodes.INVALID_CREDENTIALS, 'OAuth2 authentication failed');
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    try {
      const decoded = this.jwtManager.verifyRefreshToken(refreshToken);
      const user = await this.getUserById(decoded.userId);

      if (!user || user.tokenVersion !== decoded.tokenVersion) {
        throw new Error('Invalid refresh token');
      }

      return this.jwtManager.generateTokenPair(user);
    } catch (error) {
      throw this.createAuthError(AuthErrorCodes.TOKEN_INVALID, 'Invalid refresh token');
    }
  }

  /**
   * Setup MFA for user
   */
  async setupMfa(userId: string) {
    const user = await this.getUserById(userId);
    if (!user) {
      throw this.createAuthError(AuthErrorCodes.USER_NOT_FOUND, 'User not found');
    }

    return this.mfaManager.generateMfaSetup(user);
  }

  /**
   * Enable MFA for user
   */
  async enableMfa(userId: string, secret: string, verificationCode: string): Promise<{ backupCodes: string[] }> {
    // Verify the setup
    const isValid = this.mfaManager.validateMfaSetup(secret, verificationCode);
    if (!isValid) {
      throw this.createAuthError(AuthErrorCodes.INVALID_MFA_CODE, 'Invalid verification code');
    }

    // Generate backup codes
    const backupCodes = this.mfaManager.generateBackupCodes();

    // Update user (mock)
    await this.updateUserMfa(userId, secret, true, backupCodes);

    return { backupCodes };
  }

  /**
   * Get OAuth2 authorization URL
   */
  getOAuth2AuthUrl(provider: string): string {
    return this.oauth2Manager.getAuthorizationUrl(provider);
  }

  /**
   * Check user permissions
   */
  checkPermission(user: User, permission: string): boolean {
    return this.rbacManager.hasPermission(user, permission);
  }

  /**
   * Get user permissions
   */
  getUserPermissions(user: User): string[] {
    return this.rbacManager.getUserPermissions(user);
  }

  // Private helper methods
  private createAuthError(code: AuthErrorCodes, message: string): AuthError {
    const error = new Error(`AUTH_ERROR: ${message}`) as any;
    error.code = code;
    error.message = message;
    return error;
  }

  private validatePasswordStrength(password: string): void {
    if (password.length < this.config.security.passwordMinLength) {
      throw this.createAuthError(
        AuthErrorCodes.PASSWORD_TOO_WEAK,
        `Password must be at least ${this.config.security.passwordMinLength} characters`
      );
    }

    if (this.config.security.requireStrongPassword) {
      const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
      if (!strongPasswordRegex.test(password)) {
        throw this.createAuthError(
          AuthErrorCodes.PASSWORD_TOO_WEAK,
          'Password must contain uppercase, lowercase, number and special character'
        );
      }
    }
  }

  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Mock database methods (these would be replaced with actual database calls)
  private async getUserByEmail(email: string): Promise<User | null> {
    // Mock implementation
    return null;
  }

  private async getUserById(id: string): Promise<User | null> {
    // Mock implementation
    return null;
  }

  private async getUserByOAuth2(provider: string, providerId: string): Promise<User | null> {
    // Mock implementation
    return null;
  }

  private async saveUser(user: User): Promise<void> {
    // Mock implementation
  }

  private async updateLastLogin(userId: string): Promise<void> {
    // Mock implementation
  }

  private async updateUserMfa(userId: string, secret: string, enabled: boolean, backupCodes: string[]): Promise<void> {
    // Mock implementation
  }

  private async sendEmailVerification(email: string, token: string): Promise<void> {
    // Mock implementation - would integrate with email service
    console.log(`Email verification sent to ${email} with token: ${token}`);
  }

  private async createUserFromOAuth2(oauth2User: OAuth2UserInfo): Promise<User> {
    // Mock implementation
    const user: User = {
      id: this.generateUserId(),
      email: oauth2User.email,
      username: oauth2User.username,
      fullName: oauth2User.name,
      passwordHash: '', // No password for OAuth2 users
      roles: [{ id: 'user', name: 'user', description: 'Standard user', permissions: [] }],
      permissions: [],
      isEmailVerified: true, // OAuth2 emails are typically verified
      isMfaEnabled: false,
      tokenVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.saveUser(user);
    return user;
  }
}