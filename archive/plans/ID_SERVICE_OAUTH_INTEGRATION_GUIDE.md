# 🔐 ID Service OAuth Integration Guide

**Date:** August 5, 2025  
**Version:** 1.0.0  
**Service:** https://id.codai.ro

---

## 📋 Overview

The CODAI ID Service provides centralized authentication and authorization for the entire CODAI ecosystem. This guide covers OAuth integration, API key management, and multi-app authentication flows.

## 🌐 Service Endpoints

### Production Service
- **Base URL:** `https://id.codai.ro`
- **Health Check:** `https://id.codai.ro/health`
- **Status:** ✅ Online (Basic Auth Available)

### Local Development
- **Base URL:** `http://localhost:4004`
- **Development Mode:** Next.js with hot reload

---

## 🔧 Current Authentication Features

### ✅ Available Features

#### Basic Authentication
```bash
# Login endpoint
curl -X POST https://id.codai.ro/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123!"
  }'

# Response:
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### User Registration
```bash
# Register endpoint
curl -X POST https://id.codai.ro/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "securePassword123!",
    "name": "Jane Doe"
  }'
```

#### Protected Routes
```bash
# Access protected resources
curl -H "Authorization: Bearer eyJhbGci..." \
     https://id.codai.ro/api/auth/protected
```

---

## 🚧 OAuth Implementation Plan

### Google OAuth Provider

**Status:** 🚧 Implementation Required

#### Step 1: OAuth Configuration
```typescript
// lib/oauth-config.ts
export const oauthConfig = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    redirectUri: 'https://id.codai.ro/api/auth/callback/google',
    scope: ['openid', 'email', 'profile']
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    redirectUri: 'https://id.codai.ro/api/auth/callback/github',
    scope: ['user:email']
  }
};
```

#### Step 2: OAuth Endpoints (To Implement)
```typescript
// src/app/api/auth/providers/route.ts
export async function GET() {
  return NextResponse.json({
    providers: [
      {
        id: 'google',
        name: 'Google',
        type: 'oauth',
        authUrl: 'https://accounts.google.com/oauth/authorize',
        status: 'active'
      },
      {
        id: 'github', 
        name: 'GitHub',
        type: 'oauth',
        authUrl: 'https://github.com/login/oauth/authorize',
        status: 'active'
      }
    ]
  });
}

// src/app/api/auth/login/[provider]/route.ts  
export async function GET(request: NextRequest, { params }) {
  const { provider } = params;
  
  if (provider === 'google') {
    const authUrl = buildGoogleAuthUrl();
    return NextResponse.redirect(authUrl);
  }
  
  // Handle other providers...
}

// src/app/api/auth/callback/[provider]/route.ts
export async function GET(request: NextRequest, { params }) {
  const { provider } = params;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  
  if (provider === 'google') {
    const tokens = await exchangeGoogleCode(code);
    const userInfo = await getGoogleUserInfo(tokens.access_token);
    
    // Create or update user
    const user = await createOrUpdateUser({
      email: userInfo.email,
      name: userInfo.name,
      provider: 'google',
      providerId: userInfo.sub
    });
    
    // Generate JWT
    const jwt = generateJWT(user);
    
    return NextResponse.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${jwt}`);
  }
}
```

#### Step 3: Frontend Integration
```typescript
// Client-side OAuth integration
export function useOAuth() {
  const loginWithGoogle = () => {
    window.location.href = 'https://id.codai.ro/api/auth/login/google';
  };
  
  const loginWithGitHub = () => {
    window.location.href = 'https://id.codai.ro/api/auth/login/github';
  };
  
  return { loginWithGoogle, loginWithGitHub };
}

// React component
export function LoginPage() {
  const { loginWithGoogle, loginWithGitHub } = useOAuth();
  
  return (
    <div>
      <button onClick={loginWithGoogle}>
        Sign in with Google
      </button>
      <button onClick={loginWithGitHub}>
        Sign in with GitHub  
      </button>
    </div>
  );
}
```

---

## 🔑 API Key Management Integration

### Current Status
The ID service needs integration with CBD's API key management system.

#### Planned API Key Endpoints
```typescript
// Get user's API keys
GET https://id.codai.ro/api/user/api-keys
Authorization: Bearer jwt_token

// Create new API key for user's project
POST https://id.codai.ro/api/user/api-keys
{
  "name": "My App API Key",
  "projectId": "proj_123",
  "scopes": ["read", "write"]
}

// Revoke API key
DELETE https://id.codai.ro/api/user/api-keys/:keyId
```

#### Integration with CBD
```typescript
// ID service will proxy API key requests to CBD
export async function createApiKey(userId: string, request: ApiKeyRequest) {
  // Verify user owns the project
  const project = await cbdClient.getProject(request.projectId);
  if (project.ownerId !== userId) {
    throw new Error('Unauthorized');
  }
  
  // Create API key via CBD
  const apiKey = await cbdClient.createApiKey({
    ...request,
    ownerId: userId
  });
  
  // Store API key reference in ID service
  await userApiKeys.store(userId, apiKey.id);
  
  return apiKey;
}
```

---

## 🌐 Multi-App Authentication Flow

### auth.codai.ro Deployment Plan

**Status:** 🚧 Planned

#### Centralized Auth Service
```typescript
// Central authentication service for all CODAI apps
export class CentralAuthService {
  // Authenticate user and return JWT valid for all apps
  async authenticateUser(credentials: LoginCredentials): Promise<AuthResult> {
    const user = await this.validateCredentials(credentials);
    
    // Generate JWT with app-specific scopes
    const jwt = this.generateJWT(user, {
      apps: ['cbd', 'id', 'memorai', 'bancai', 'codai'],
      scopes: user.permissions,
      issuer: 'auth.codai.ro'
    });
    
    return { user, token: jwt };
  }
  
  // Validate JWT from any CODAI app
  async validateToken(token: string, app: string): Promise<User | null> {
    const payload = this.verifyJWT(token);
    
    if (!payload.apps.includes(app)) {
      throw new Error('Token not valid for this app');
    }
    
    return this.getUser(payload.userId);
  }
}
```

#### App Integration
```typescript
// Each app integrates with central auth
export function withAuth(handler: NextApiHandler): NextApiHandler {
  return async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
      const user = await authService.validateToken(token, 'cbd');
      req.user = user;
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}
```

---

## 🔧 SDK Integration

### @codai/auth Package

**Status:** ✅ Available (v1.1.2)

#### Installation
```bash
npm install @codai/auth
```

#### Usage
```typescript
import { CodaiAuth, useAuth } from '@codai/auth';

// Initialize auth client
const auth = new CodaiAuth({
  baseUrl: 'https://id.codai.ro',
  clientId: 'your-app-id',
  redirectUri: 'https://yourapp.com/auth/callback'
});

// React hook for authentication
export function MyApp() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return (
      <div>
        <button onClick={() => login('google')}>
          Sign in with Google
        </button>
        <button onClick={() => login('github')}>
          Sign in with GitHub
        </button>
      </div>
    );
  }
  
  return (
    <div>
      Welcome, {user.name}!
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```

#### Server-side Usage
```typescript
import { CodaiAuth } from '@codai/auth';

const auth = new CodaiAuth({
  baseUrl: 'https://id.codai.ro',
  clientId: process.env.CODAI_CLIENT_ID,
  clientSecret: process.env.CODAI_CLIENT_SECRET
});

// Middleware for protected routes
export const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await auth.validateToken(token);
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
```

---

## 🔒 Security Implementation

### JWT Token Security
```typescript
// Token generation with enhanced security
export function generateSecureJWT(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      iss: 'id.codai.ro',
      aud: ['cbd.memorai.ro', 'codai.ro'],
      scope: user.permissions
    },
    process.env.JWT_SECRET!,
    { algorithm: 'HS256' }
  );
}
```

### Rate Limiting
```typescript
// Rate limiting for auth endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts',
  standardHeaders: true,
  legacyHeaders: false
});
```

### Input Validation
```typescript
// Enhanced input validation
export const validateLoginInput = (email: string, password: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
  
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  
  // Check for malicious patterns
  const maliciousPatterns = [
    /['";]/,
    /<script/i,
    /drop\s+table/i,
    /union\s+select/i
  ];
  
  for (const pattern of maliciousPatterns) {
    if (pattern.test(email) || pattern.test(password)) {
      throw new Error('Invalid input detected');
    }
  }
};
```

---

## 🧪 Testing Guide

### Authentication Flow Testing
```typescript
// Test OAuth flow
describe('OAuth Authentication', () => {
  test('Google OAuth flow', async () => {
    // Mock Google OAuth response
    const mockGoogleUser = {
      sub: 'google-user-123',
      email: 'user@gmail.com',
      name: 'John Doe'
    };
    
    // Test auth callback
    const response = await request(app)
      .get('/api/auth/callback/google')
      .query({ code: 'mock-auth-code' });
    
    expect(response.status).toBe(302);
    expect(response.headers.location).toContain('token=');
  });
  
  test('JWT validation', async () => {
    const token = generateTestJWT();
    
    const response = await request(app)
      .get('/api/auth/protected')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
  });
});
```

### API Integration Testing
```typescript
// Test API key integration
describe('API Key Management', () => {
  test('Create API key for authenticated user', async () => {
    const token = await loginUser('test@example.com');
    
    const response = await request(app)
      .post('/api/user/api-keys')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test API Key',
        projectId: 'proj_123',
        scopes: ['read', 'write']
      });
    
    expect(response.status).toBe(201);
    expect(response.body.apiKey).toBeDefined();
  });
});
```

---

## 📊 Implementation Timeline

### Phase 1: OAuth Providers (Week 1)
- [x] Google OAuth setup
- [x] GitHub OAuth setup  
- [x] Provider endpoint implementation
- [x] Callback handling

### Phase 2: auth.codai.ro Deployment (Week 2)
- [ ] Central auth service deployment
- [ ] Multi-app JWT validation
- [ ] Cross-domain cookie handling
- [ ] SSO session management

### Phase 3: API Key Integration (Week 2)
- [ ] ID service <-> CBD integration
- [ ] User API key dashboard
- [ ] Key revocation system
- [ ] Usage analytics

### Phase 4: Advanced Features (Week 3)
- [ ] 2FA implementation
- [ ] Enterprise SSO (SAML)
- [ ] Advanced security monitoring
- [ ] Audit logging

---

## 🆘 Troubleshooting

### Common Issues

**1. OAuth Callback Errors**
```bash
# Check OAuth configuration
curl https://id.codai.ro/api/auth/providers

# Verify redirect URIs match OAuth app settings
```

**2. JWT Token Issues**
```typescript
// Debug JWT token
import jwt from 'jsonwebtoken';

try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET!);
  console.log('Token valid:', decoded);
} catch (error) {
  console.error('Token invalid:', error.message);
}
```

**3. CORS Issues**
```typescript
// Configure CORS for auth endpoints
export const corsConfig = {
  origin: [
    'https://codai.ro',
    'https://cbd.memorai.ro', 
    'https://memorai.ro',
    'http://localhost:3000'
  ],
  credentials: true
};
```

---

## 📈 Monitoring and Analytics

### Authentication Metrics
```typescript
// Track authentication events
export const authMetrics = {
  loginAttempts: new Counter('auth_login_attempts_total'),
  loginSuccesses: new Counter('auth_login_successes_total'),
  loginFailures: new Counter('auth_login_failures_total'),
  tokenValidations: new Counter('auth_token_validations_total'),
  oauthCallbacks: new Counter('auth_oauth_callbacks_total')
};
```

### Security Monitoring
```typescript
// Monitor for suspicious activity
export function monitorAuthActivity(event: AuthEvent) {
  // Rate limiting violations
  if (event.type === 'rate_limit_exceeded') {
    alertingService.sendAlert('High authentication rate from IP: ' + event.ip);
  }
  
  // Failed login attempts
  if (event.type === 'login_failed') {
    securityLogger.warn('Failed login attempt', {
      email: event.email,
      ip: event.ip,
      timestamp: event.timestamp
    });
  }
}
```

---

**Last Updated:** August 5, 2025  
**Version:** 1.0.0  
**Status:** Basic Auth Available, OAuth Implementation In Progress

For implementation assistance, contact: dev@codai.ro
