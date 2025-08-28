// Advanced Authentication System for CodAI Services
export { AuthService } from './auth.service';
export { JWTManager } from './jwt-manager';
export { MfaManager } from './mfa-manager';
export { OAuth2Manager } from './oauth2-manager';
export { RbacManager } from './rbac-manager';

// Configuration
export { authConfig, createAuthConfig } from './auth.config';

// Types
export type {
  User,
  UserRole,
  TokenPair,
  LoginRequest,
  RegisterRequest,
  OAuth2Provider,
  OAuth2TokenResponse,
  OAuth2UserInfo,
  AuthSession,
  MfaSetup,
  AuthError,
  AuthRequest,
  AuthMiddlewareOptions,
  AuthConfig,
} from './auth.types';

export {
  AuthErrorCodes,
  Permissions,
  DefaultRoles,
} from './auth.types';

// Middleware
export { createAuthMiddleware } from './middleware/auth.middleware';
export { createRbacMiddleware } from './middleware/rbac.middleware';
export { createRateLimitMiddleware } from './middleware/rate-limit.middleware';

// Utilities
export { PasswordValidator } from './utils/password-validator';
export { SessionManager } from './utils/session-manager';
export { AuthLogger } from './utils/auth-logger';