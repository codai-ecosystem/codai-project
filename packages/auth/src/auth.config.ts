import { OAuth2Provider } from './auth.types';

export interface AuthConfig {
  jwt: {
    accessTokenSecret: string;
    refreshTokenSecret: string;
    passwordResetSecret: string;
    emailVerificationSecret: string;
    accessTokenExpiry: string;
    refreshTokenExpiry: string;
    issuer: string;
    audience: string;
  };
  oauth2: {
    providers: {
      google: OAuth2Provider;
      github: OAuth2Provider;
    };
  };
  security: {
    bcryptRounds: number;
    maxLoginAttempts: number;
    lockoutDuration: number; // in minutes
    passwordMinLength: number;
    requireStrongPassword: boolean;
    sessionTimeout: number; // in minutes
    mfaIssuer: string;
  };
  email: {
    from: string;
    templates: {
      emailVerification: string;
      passwordReset: string;
      welcome: string;
    };
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
}

export const createAuthConfig = (): AuthConfig => {
  // Validate required environment variables
  const requiredVars = [
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'OAUTH2_GOOGLE_CLIENT_ID',
    'OAUTH2_GOOGLE_CLIENT_SECRET',
    'OAUTH2_GITHUB_CLIENT_ID',
    'OAUTH2_GITHUB_CLIENT_SECRET',
  ];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  }

  return {
    jwt: {
      accessTokenSecret: process.env.JWT_ACCESS_SECRET!,
      refreshTokenSecret: process.env.JWT_REFRESH_SECRET!,
      passwordResetSecret: process.env.JWT_PASSWORD_RESET_SECRET || process.env.JWT_ACCESS_SECRET!,
      emailVerificationSecret: process.env.JWT_EMAIL_VERIFICATION_SECRET || process.env.JWT_ACCESS_SECRET!,
      accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
      refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
      issuer: process.env.JWT_ISSUER || 'codai-api',
      audience: process.env.JWT_AUDIENCE || 'codai-app',
    },
    oauth2: {
      providers: {
        google: {
          name: 'google',
          clientId: process.env.OAUTH2_GOOGLE_CLIENT_ID!,
          clientSecret: process.env.OAUTH2_GOOGLE_CLIENT_SECRET!,
          authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
          tokenUrl: 'https://oauth2.googleapis.com/token',
          userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
          scope: 'email profile',
          redirectUri: process.env.OAUTH2_GOOGLE_REDIRECT_URI || 'http://localhost:8100/auth/callback/google',
        },
        github: {
          name: 'github',
          clientId: process.env.OAUTH2_GITHUB_CLIENT_ID!,
          clientSecret: process.env.OAUTH2_GITHUB_CLIENT_SECRET!,
          authorizeUrl: 'https://github.com/login/oauth/authorize',
          tokenUrl: 'https://github.com/login/oauth/access_token',
          userInfoUrl: 'https://api.github.com/user',
          scope: 'user:email',
          redirectUri: process.env.OAUTH2_GITHUB_REDIRECT_URI || 'http://localhost:8100/auth/callback/github',
        },
      },
    },
    security: {
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
      maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
      lockoutDuration: parseInt(process.env.LOCKOUT_DURATION || '15'), // 15 minutes
      passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8'),
      requireStrongPassword: process.env.REQUIRE_STRONG_PASSWORD === 'true',
      sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '480'), // 8 hours
      mfaIssuer: process.env.MFA_ISSUER || 'CodAI',
    },
    email: {
      from: process.env.EMAIL_FROM || 'noreply@codai.com',
      templates: {
        emailVerification: process.env.EMAIL_VERIFICATION_TEMPLATE || 'email-verification',
        passwordReset: process.env.PASSWORD_RESET_TEMPLATE || 'password-reset',
        welcome: process.env.WELCOME_TEMPLATE || 'welcome',
      },
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    },
  };
};

export const authConfig = createAuthConfig();