# CODAI SSO SDK

Enterprise Single Sign-On (SSO) integration SDK for the CODAI ecosystem. This SDK provides seamless authentication and authorization integration with the CODAI ID Enterprise System using Keycloak.

## Features

- 🔐 **Keycloak SSO Integration** - Complete OAuth2/OIDC integration
- 🛡️ **Zero Trust Security** - Device fingerprinting and risk assessment
- 👥 **Role-Based Access Control (RBAC)** - Granular permission management
- 📊 **Session Management** - Secure session handling with JWT
- 📝 **Audit Logging** - Comprehensive authentication event logging
- 🔑 **Multi-Factor Authentication** - MFA support and validation
- 🌐 **Cross-Application Support** - Seamless integration across CODAI apps

## Installation

```bash
pnpm add @codai/sso-sdk
```

## Quick Start

### 1. Configure NextAuth.js

```typescript
// pages/api/auth/[...nextauth].ts
import { createKeycloakProvider, createCodaiSSOConfig } from '@codai/sso-sdk';

const ssoConfig = createCodaiSSOConfig({
  appName: 'my-app',
  clientId: process.env.KEYCLOAK_CLIENT_ID!,
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
  environment: 'development',
  port: 3000
});

export default NextAuth(createKeycloakProvider(ssoConfig));
```

### 2. Use Authentication Hooks

```typescript
// components/UserProfile.tsx
import { useCodaiAuth } from '@codai/sso-sdk';

export default function UserProfile() {
  const { user, isAuthenticated, roles, permissions, hasRole } = useCodaiAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <p>Roles: {roles.join(', ')}</p>
      {hasRole('admin') && <AdminPanel />}
    </div>
  );
}
```

### 3. Role-Based Access Control

```typescript
// components/AdminPanel.tsx
import { useRBAC } from '@codai/sso-sdk';

export default function AdminPanel() {
  const { isAuthorized } = useRBAC(['admin', 'super_admin'], ['users:write']);
  
  if (!isAuthorized) {
    return <div>Access denied</div>;
  }
  
  return <div>Admin content</div>;
}
```

## Configuration

### Environment Variables

```env
# Keycloak Configuration
KEYCLOAK_CLIENT_ID=your-client-id
KEYCLOAK_CLIENT_SECRET=your-client-secret

# CODAI ID Service
CODAI_ID_URL=http://localhost:4032
CODAI_ID_SERVICE_TOKEN=your-service-token

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

### SSO Configuration Options

```typescript
interface SSOConfig {
  keycloakUrl: string;           // Keycloak server URL
  realm: string;                 // Keycloak realm name
  clientId: string;              // Application client ID
  clientSecret: string;          // Application client secret
  redirectUri: string;           // OAuth2 redirect URI
  postLogoutRedirectUri: string; // Post-logout redirect URI
  scopes: string[];              // OAuth2 scopes
  enableZeroTrust: boolean;      // Enable Zero Trust features
  enableAuditLogging: boolean;   // Enable audit logging
  sessionTimeout: number;        // Session timeout in seconds
  refreshTokenRotation: boolean; // Enable token rotation
}
```

## Hooks Reference

### useCodaiAuth()

Main authentication hook providing user session data and authentication state.

```typescript
const {
  user,              // Current user object
  isAuthenticated,   // Authentication status
  isLoading,         // Loading state
  roles,             // User roles array
  permissions,       // User permissions array
  hasRole,           // Check if user has role
  hasPermission,     // Check if user has permission
  deviceId,          // Device identifier
  riskScore,         // Security risk score
  isTrusted          // Device trust status
} = useCodaiAuth();
```

### useRBAC(roles?, permissions?)

Role-based access control hook for component-level authorization.

```typescript
const { isAuthorized } = useRBAC(
  ['admin', 'developer'],           // Required roles (any)
  ['apps:read', 'apps:write']       // Required permissions (any)
);
```

### usePermissions(permissions)

Permission-specific hook for granular access control.

```typescript
const { permissions, hasAll, hasAny } = usePermissions([
  'users:read',
  'users:write',
  'apps:deploy'
]);
```

### useDeviceSecurity()

Device and security information hook for Zero Trust features.

```typescript
const {
  deviceId,     // Unique device identifier
  riskScore,    // Risk assessment score (0-1)
  riskLevel,    // Risk level: 'low' | 'medium' | 'high' | 'critical'
  isTrusted,    // Device trust status
  isSecure      // Overall security status
} = useDeviceSecurity();
```

## Security Features

### Zero Trust Architecture

- **Device Fingerprinting**: Unique device identification
- **Risk Assessment**: Continuous risk evaluation
- **Behavioral Analysis**: Unusual activity detection
- **Location Validation**: Geographic risk assessment

### Audit Logging

All authentication events are automatically logged:

- Login attempts and results
- Token refresh operations
- MFA challenges and results
- Device registration events
- Risk-based challenges
- Session expiration events

### Permission System

Hierarchical permission system with:

- **Roles**: Collections of permissions (admin, developer, user)
- **Permissions**: Specific actions (users:read, apps:write)
- **Wildcards**: Super-admin permissions (*)
- **Inheritance**: Role-based permission inheritance

## Integration Examples

### CODAI Application

```typescript
// apps/codai/pages/api/auth/[...nextauth].ts
import { createKeycloakProvider, createCodaiSSOConfig } from '@codai/sso-sdk';

const config = createCodaiSSOConfig({
  appName: 'codai',
  clientId: process.env.KEYCLOAK_CLIENT_ID!,
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  port: 3000
});

export default NextAuth(createKeycloakProvider(config));
```

### BancAI Application

```typescript
// apps/bancai/pages/api/auth/[...nextauth].ts
import { createKeycloakProvider, createCodaiSSOConfig } from '@codai/sso-sdk';

const config = createCodaiSSOConfig({
  appName: 'bancai',
  clientId: process.env.KEYCLOAK_CLIENT_ID!,
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  port: 3522,
  customConfig: {
    // Banking-specific configuration
    enableZeroTrust: true,
    sessionTimeout: 1800, // 30 minutes for banking
    scopes: ['openid', 'profile', 'email', 'roles', 'banking']
  }
});

export default NextAuth(createKeycloakProvider(config));
```

## Development

### Building the SDK

```bash
pnpm build
```

### Running Tests

```bash
pnpm test
```

### Type Checking

```bash
pnpm type-check
```

## Environment-Specific Configurations

### Development
- Keycloak: `http://localhost:4080`
- Realm: `codai`
- Default port: `3000`

### Staging
- Keycloak: `https://id-staging.codai.dev`
- Realm: `codai`
- Base URL: `https://staging.codai.dev`

### Production
- Keycloak: `https://id.codai.dev`
- Realm: `codai`
- Base URL: `https://app.codai.dev`

## License

Private - CODAI Ecosystem
