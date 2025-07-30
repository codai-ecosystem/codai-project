# 🔐 CENTRALIZED AUTHENTICATION SYSTEM PLAN

## Executive Summary

Implementation of a centralized Single Sign-On (SSO) authentication system using `id.codai.ro` as the authentication hub with browser token-based authentication across all 32 applications in the CODAI ecosystem.

## Architecture Overview

```mermaid
graph TB
    A[User] --> B[id.codai.ro:4800]
    B --> C[@codai/auth Package]
    C --> D[Browser Token Storage]
    D --> E[App 1 - codai.codai.ro]
    D --> F[App 2 - memorai.codai.ro]
    D --> G[App 3 - bancai.codai.ro]
    D --> H[... All 32 Apps]
    
    B --> I[JWT Token Service]
    B --> J[User Management]
    B --> K[Session Management]
    
    E --> L[Token Validation]
    F --> L
    G --> L
    H --> L
```

## Phase 1: Core Authentication Infrastructure Enhancement

### 1.1 ID App Enhancement (id.codai.ro:4800)

**Current State**: Basic Next.js app
**Target State**: Full-featured authentication hub

#### Routes to Implement:
- `/login` - User authentication with email/password
- `/register` - New user registration with validation
- `/forgot` - Password reset flow with email verification
- `/verify` - Email verification for new accounts
- `/logout` - Global logout across all apps
- `/profile` - User profile management
- `/admin` - Admin panel for user management (admin users only)
- `/api/auth/*` - Authentication API endpoints

#### Features:
- JWT token issuance with configurable expiration
- Secure cookie management with httpOnly and SameSite
- Rate limiting for authentication attempts
- Account lockout protection
- Email verification system
- Password strength validation
- Multi-factor authentication support

### 1.2 Enhanced @codai/auth Package

**Current Capabilities**: JWT utilities, basic React hooks
**Enhanced Capabilities**:

```typescript
// Enhanced @codai/auth Package Structure
export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'user' | 'admin' | 'super_admin'
  permissions: string[]
  lastLogin: Date
  emailVerified: boolean
  twoFactorEnabled: boolean
}

export interface AuthConfig {
  authUrl: string // https://id.codai.ro
  tokenKey: string // 'codai_auth_token'
  refreshKey: string // 'codai_refresh_token'
  redirectAfterLogin: string
  redirectAfterLogout: string
}

// Enhanced Auth Service
export class CentralizedAuthService {
  async loginWithRedirect(email: string, password: string): Promise<AuthUser>
  async registerWithVerification(userData: RegisterData): Promise<void>
  async validateToken(token: string): Promise<AuthUser | null>
  async refreshToken(): Promise<string | null>
  async logout(): Promise<void>
  async forgotPassword(email: string): Promise<void>
  async resetPassword(token: string, newPassword: string): Promise<void>
  async updateProfile(updates: Partial<AuthUser>): Promise<AuthUser>
  
  // Cross-app token management
  async syncTokenAcrossApps(): Promise<void>
  async revokeAllTokens(): Promise<void>
  isAuthenticated(): boolean
  getCurrentUser(): AuthUser | null
  hasPermission(permission: string): boolean
  hasRole(role: string): boolean
}

// React Hooks
export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Implementation with centralized auth service
}

// Middleware for Next.js apps
export const withAuth = (handler: NextApiHandler, options?: AuthOptions) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Token validation middleware
  }
}

// Route protection HOC
export const withAuthProtection = (
  Component: React.ComponentType,
  requiredPermissions?: string[]
) => {
  // Protected route wrapper
}
```

### 1.3 Browser Token Management System

#### Token Storage Strategy:
- **Primary**: HttpOnly cookies for maximum security
- **Fallback**: Secure localStorage with encryption
- **Cross-domain**: Subdomain cookie sharing (.codai.ro)

#### Token Security Features:
- JWT tokens with short expiration (15 minutes)
- Refresh tokens with longer expiration (7 days)
- Automatic token refresh before expiration
- Token blacklisting for logout/security
- CSRF protection with double-submit cookies

## Phase 2: Cross-App Integration

### 2.1 Universal App Integration Pattern

Each of the 32 apps will be updated with this pattern:

```typescript
// app/layout.tsx - Root layout with auth provider
import { AuthProvider, AuthConfig } from '@codai/auth'

const authConfig: AuthConfig = {
  authUrl: 'https://id.codai.ro',
  tokenKey: 'codai_auth_token',
  refreshKey: 'codai_refresh_token',
  redirectAfterLogin: `https://${process.env.NEXT_PUBLIC_APP_NAME}.codai.ro/dashboard`,
  redirectAfterLogout: `https://id.codai.ro/login`
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider config={authConfig}>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

// middleware.ts - Route protection
import { NextResponse } from 'next/server'
import { validateToken } from '@codai/auth/server'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('codai_auth_token')?.value
  
  if (!token) {
    return NextResponse.redirect(new URL('https://id.codai.ro/login', request.url))
  }
  
  const user = await validateToken(token)
  if (!user) {
    return NextResponse.redirect(new URL('https://id.codai.ro/login', request.url))
  }
  
  // Add user info to headers for API routes
  const response = NextResponse.next()
  response.headers.set('X-User-ID', user.id)
  response.headers.set('X-User-Role', user.role)
  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*', '/admin/:path*']
}

// pages/api/auth/callback.ts - Auth callback handler
import { handleAuthCallback } from '@codai/auth/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  const { token, refreshToken, redirectUrl } = await handleAuthCallback(req)
  
  // Set secure cookies
  res.setHeader('Set-Cookie', [
    `codai_auth_token=${token}; HttpOnly; Secure; SameSite=Lax; Max-Age=900; Domain=.codai.ro`,
    `codai_refresh_token=${refreshToken}; HttpOnly; Secure; SameSite=Lax; Max-Age=604800; Domain=.codai.ro`
  ])
  
  res.redirect(redirectUrl || '/dashboard')
}
```

### 2.2 App-Specific Updates Required

#### Tier 1 Critical Apps (Immediate Priority):
1. **CODAI Platform** (codai.codai.ro:4031)
   - Update login flow to redirect to ID app
   - Implement token validation middleware
   - Update project access controls

2. **MEMORAI** (memorai.codai.ro:4032)
   - Integrate with centralized user management
   - Update memory privacy controls
   - Sync user preferences

3. **ADMIN** (admin.codai.ro:4030)
   - Enhanced admin authentication
   - Role-based access control
   - User management integration

4. **HUB** (hub.codai.ro:4033)
   - Service discovery authentication
   - API gateway token validation
   - Cross-service authentication

5. **LOGAI** (logai.codai.ro:4034)
   - Centralized logging authentication
   - User activity tracking
   - Admin log access controls

#### Tier 2 Business Critical Apps (Secondary Priority):
- BANCAI, ROMAI, SOCIAI, CONVERSAI, GLASS, etc.

### 2.3 Domain Configuration

#### DNS Updates Required:
All 32 domains need to be configured for shared authentication:

```
id.codai.ro           -> Authentication Hub (Port 4800)
codai.codai.ro        -> Main Platform (Port 4031)
memorai.codai.ro      -> Memory AI (Port 4032)
admin.codai.ro        -> Admin Panel (Port 4030)
hub.codai.ro          -> Integration Hub (Port 4033)
logai.codai.ro        -> Logging Service (Port 4034)
[... 27 more domains]
```

## Phase 3: Enhanced Shared Services

### 3.1 Identified Shared Service Packages

#### Authentication Services:
- **@codai/auth** - Enhanced with SSO capabilities
- **@codai/shared-services** - Inter-app authentication
- **@codai/service-registry** - Auth service discovery

#### Communication Services:
- **@codai/api** - Authenticated API communication
- **@codai/realtime** - Live authentication sync
- **@codai/shared-services** - Cross-app messaging

#### Data Services:
- **@codai/shared-services** - MemoryService, ProjectService, FinancialService
- **@codai/service-registry** - Service health checks
- **@codai/analytics** - Cross-app analytics

#### Infrastructure Services:
- **@codai/security** - Security utilities
- **@codai/deployment** - Deployment automation
- **@codai/testing-utils** - Testing frameworks

### 3.2 Service Architecture Enhancement

```typescript
// Enhanced EcosystemService with Authentication
export class EcosystemService {
  private authService: CentralizedAuthService
  
  async authenticatedCall<T>(
    appId: string,
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: unknown
  ): Promise<APIResponse<T>> {
    const token = await this.authService.getValidToken()
    
    const app = this.getApp(appId)
    if (!app) {
      throw new Error(`App ${appId} not found`)
    }

    const url = `https://${app.id}.codai.ro${endpoint}`
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Source-App': 'ecosystem'
      },
      body: data ? JSON.stringify(data) : undefined
    })

    if (response.status === 401) {
      // Token expired, attempt refresh
      await this.authService.refreshToken()
      return this.authenticatedCall(appId, endpoint, method, data)
    }

    return response.json() as Promise<APIResponse<T>>
  }
}

// Service Registry with Authentication
export class ServiceRegistry {
  async registerService(service: ServiceDefinition): Promise<void> {
    const token = await this.authService.getServiceToken()
    // Register service with authentication
  }
  
  async discoverServices(userId: string): Promise<ServiceDefinition[]> {
    // Return services based on user permissions
  }
}
```

## Implementation Timeline

### Week 1: Foundation
- [ ] Enhance ID app with authentication routes
- [ ] Extend @codai/auth package with SSO capabilities
- [ ] Implement browser token management
- [ ] Create authentication middleware

### Week 2: Core Integration
- [ ] Update Tier 1 apps (CODAI, MEMORAI, ADMIN, HUB, LOGAI)
- [ ] Implement cross-domain authentication
- [ ] Set up token validation across services
- [ ] Test authentication flows

### Week 3: Ecosystem Integration
- [ ] Update remaining 27 apps with centralized auth
- [ ] Implement role-based access controls
- [ ] Configure service-to-service authentication
- [ ] Set up monitoring and logging

### Week 4: Advanced Features & Testing
- [ ] Multi-factor authentication
- [ ] Admin user management panel
- [ ] Performance optimization
- [ ] Comprehensive testing across all apps
- [ ] Security audit and penetration testing

## Success Metrics

### Technical Metrics:
- Single sign-on working across all 32 apps
- Token refresh success rate > 99.5%
- Authentication response time < 200ms
- Zero authentication-related security vulnerabilities

### User Experience Metrics:
- Seamless navigation between apps without re-login
- Login success rate > 99%
- User satisfaction with unified authentication

### Operational Metrics:
- Centralized user management for all 32 apps
- Audit trail for all authentication events
- Automated token lifecycle management
- 99.9% authentication service uptime

## Security Considerations

### Token Security:
- JWT tokens signed with RS256 asymmetric keys
- Token payload contains minimal user info
- Regular token rotation and blacklist management
- Secure key storage and rotation procedures

### Cross-Domain Security:
- Proper CORS configuration for all domains
- SameSite cookie attributes configured correctly
- CSRF protection on all authenticated endpoints
- Content Security Policy headers

### Monitoring & Auditing:
- All authentication events logged to LOGAI
- Failed login attempt monitoring and alerting
- Suspicious activity detection and response
- Regular security audits and penetration testing

## Risk Mitigation

### High-Risk Scenarios:
1. **Authentication Service Downtime**
   - Mitigation: Implement fallback authentication cache
   - Recovery: Automated failover and health monitoring

2. **Token Compromise**
   - Mitigation: Short token expiration and refresh rotation
   - Recovery: Immediate token revocation capabilities

3. **Cross-Domain Cookie Issues**
   - Mitigation: Comprehensive browser testing
   - Recovery: Fallback to localStorage with encryption

4. **Migration Complexity**
   - Mitigation: Phased rollout with rollback capabilities
   - Recovery: Per-app rollback procedures

## Next Steps

1. **Immediate**: Begin ID app enhancement and @codai/auth package extension
2. **Week 1**: Start with MEMORAI integration (currently has TypeScript issues)
3. **Week 2**: Move to other Tier 1 critical apps
4. **Weeks 3-4**: Complete ecosystem integration and testing

This centralized authentication system will transform the CODAI ecosystem into a cohesive platform with seamless user experience and robust security across all applications.
