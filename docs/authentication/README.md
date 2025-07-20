# 🔐 Universal Authentication Documentation

**Complete guide to the CODAI ecosystem's universal authentication system powered by the ID service.**

## 📋 Overview

The CODAI ecosystem uses a centralized authentication system where:
- **ID service** handles all authentication operations
- **JWT tokens** provide secure, stateless authentication
- **Cross-domain cookies** enable seamless SSO across all applications
- **@codai/auth package** provides authentication middleware
- **Role-based access control** manages permissions across services

## 🏗️ Authentication Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Login    │────│   ID Service    │────│  JWT Token      │
│   (Frontend)    │    │   Port 4001     │    │  Generation     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Cross-Domain    │    │ Authentication  │    │  All CODAI      │
│ Cookie Set      │    │ Middleware      │    │  Applications   │
│ (.codai.ro)     │    │ (@codai/auth)   │    │  (32+ apps)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### For New Applications

1. **Install the authentication package**:
```bash
npm install @codai/auth
```

2. **Add authentication middleware**:
```javascript
import { authMiddleware } from '@codai/auth';

// Express.js
app.use(authMiddleware);

// Next.js API routes
export default authMiddleware(async (req, res) => {
  // Your protected route logic
});
```

3. **Access user information**:
```javascript
app.get('/protected-route', (req, res) => {
  const { user } = req;
  res.json({ 
    message: 'Authenticated successfully',
    userId: user.id,
    email: user.email,
    roles: user.roles
  });
});
```

## 🔑 Authentication Flows

### 1. Login Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant I as ID Service
    participant A as Application

    U->>F: Enter credentials
    F->>I: POST /auth/login
    I->>I: Validate credentials
    I->>I: Generate JWT token
    I->>F: Return JWT + Set cookie
    F->>A: Request with JWT
    A->>A: Validate JWT
    A->>F: Return protected data
```

### 2. Registration Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant I as ID Service
    participant M as MEMORAI

    U->>F: Enter registration data
    F->>I: POST /auth/register
    I->>I: Validate data
    I->>M: Store user profile
    I->>I: Generate JWT token
    I->>F: Return JWT + Set cookie
```

### 3. Token Validation Flow

```mermaid
sequenceDiagram
    participant A as Application
    participant M as Middleware
    participant I as ID Service

    A->>M: Request with JWT
    M->>M: Extract JWT from header/cookie
    M->>I: Validate JWT signature
    I->>M: Return user data
    M->>A: Attach user to request
```

## 🔧 Configuration

### Environment Variables

```bash
# ID Service Configuration
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=24h
COOKIE_DOMAIN=.codai.ro
COOKIE_SECURE=true
COOKIE_HTTP_ONLY=true

# Database Configuration
DATABASE_URL=postgresql://user:pass@localhost:5432/codai_auth
REDIS_URL=redis://localhost:6379

# Email Configuration (for registration)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Middleware Configuration

```javascript
import { authMiddleware } from '@codai/auth';

const authConfig = {
  jwtSecret: process.env.JWT_SECRET,
  cookieName: 'codai_auth_token',
  publicRoutes: ['/health', '/docs'],
  requiredRoles: ['user'], // Default role requirement
  onError: (error, req, res, next) => {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

app.use(authMiddleware(authConfig));
```

## 🛡️ Security Features

### JWT Token Security

- **Strong Secrets**: 256-bit random secrets for JWT signing
- **Short Expiration**: 24-hour token expiration by default
- **Refresh Tokens**: Automatic token refresh on activity
- **Signature Validation**: HMAC SHA-256 signature verification

### Cookie Security

- **HTTP-Only**: Cookies cannot be accessed via JavaScript
- **Secure Flag**: Cookies only sent over HTTPS in production
- **SameSite**: CSRF protection with SameSite=Strict
- **Domain**: Cross-domain support for .codai.ro

### Password Security

- **bcrypt Hashing**: Industry-standard password hashing
- **Salt Rounds**: 12 rounds for secure hashing
- **Password Policies**: Minimum 8 characters, complexity requirements
- **Breach Detection**: Integration with HaveIBeenPwned API

## 👥 Role-Based Access Control (RBAC)

### Available Roles

```javascript
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
  GUEST: 'guest'
};

const ROLE_HIERARCHY = {
  super_admin: ['admin', 'moderator', 'user', 'guest'],
  admin: ['moderator', 'user', 'guest'],
  moderator: ['user', 'guest'],
  user: ['guest'],
  guest: []
};
```

### Permission Checking

```javascript
// Middleware for role-based access
import { requireRole } from '@codai/auth';

// Require specific role
app.get('/admin/*', requireRole('admin'), (req, res) => {
  // Admin-only route
});

// Check permissions in code
app.get('/data', authMiddleware, (req, res) => {
  if (!req.user.hasRole('moderator')) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  // Return sensitive data
});
```

## 🔌 API Endpoints

### ID Service Endpoints

#### Authentication

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "12345",
    "email": "user@example.com",
    "name": "John Doe",
    "roles": ["user"]
  }
}
```

```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "secure-password",
  "confirmPassword": "secure-password"
}

Response:
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": "12345",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

```http
POST /auth/logout
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### User Management

```http
GET /auth/profile
Authorization: Bearer <token>

Response:
{
  "id": "12345",
  "email": "user@example.com",
  "name": "John Doe",
  "roles": ["user"],
  "createdAt": "2025-01-01T00:00:00Z",
  "lastLogin": "2025-07-19T12:00:00Z"
}
```

```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "email": "updated@example.com"
}

Response:
{
  "success": true,
  "user": {
    "id": "12345",
    "name": "John Updated",
    "email": "updated@example.com"
  }
}
```

#### Token Validation

```http
GET /auth/validate
Authorization: Bearer <token>

Response:
{
  "valid": true,
  "user": {
    "id": "12345",
    "email": "user@example.com",
    "roles": ["user"]
  },
  "expiresAt": "2025-07-20T12:00:00Z"
}
```

## 🔧 Integration Examples

### Express.js Integration

```javascript
const express = require('express');
const { authMiddleware, requireRole } = require('@codai/auth');

const app = express();

// Global authentication middleware
app.use(authMiddleware);

// Public routes (no authentication required)
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Protected routes
app.get('/profile', (req, res) => {
  res.json({ user: req.user });
});

// Admin-only routes
app.get('/admin/users', requireRole('admin'), (req, res) => {
  // Admin functionality
});

app.listen(3000);
```

### Next.js Integration

```javascript
// pages/api/protected.js
import { authMiddleware } from '@codai/auth';

export default authMiddleware(async (req, res) => {
  if (req.method === 'GET') {
    res.json({ 
      message: 'This is a protected endpoint',
      user: req.user 
    });
  }
});

// pages/api/admin/users.js
import { authMiddleware, requireRole } from '@codai/auth';

export default authMiddleware(
  requireRole('admin')(async (req, res) => {
    // Admin-only endpoint
    res.json({ users: [] });
  })
);
```

### React Frontend Integration

```javascript
// hooks/useAuth.js
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    fetch('/api/auth/profile')
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Not authenticated');
      })
      .then(userData => setUser(userData))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    if (response.ok) {
      const data = await response.json();
      setUser(data.user);
      return data;
    }
    
    throw new Error('Login failed');
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  return { user, loading, login, logout };
};
```

## 🧪 Testing

### Unit Tests Example

```javascript
// tests/auth.test.js
const request = require('supertest');
const app = require('../app');

describe('Authentication', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('email', 'test@example.com');
  });

  it('should reject invalid credentials', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });
});
```

### Integration Tests Example

```javascript
// tests/integration/auth-flow.test.js
describe('Complete Authentication Flow', () => {
  it('should complete full login-to-protected-route flow', async () => {
    // 1. Login
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    
    const token = loginResponse.body.token;

    // 2. Access protected route
    const protectedResponse = await request(app)
      .get('/protected-route')
      .set('Authorization', `Bearer ${token}`);

    expect(protectedResponse.status).toBe(200);
    expect(protectedResponse.body.user).toBeDefined();

    // 3. Logout
    const logoutResponse = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(logoutResponse.status).toBe(200);
  });
});
```

## 🐛 Troubleshooting

### Common Issues

#### 1. JWT Token Invalid

**Problem**: "Invalid token" errors
**Solution**: 
- Check JWT secret configuration
- Verify token hasn't expired
- Ensure proper token format in Authorization header

```javascript
// Debug token validation
const jwt = require('jsonwebtoken');
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('Token valid:', decoded);
} catch (error) {
  console.error('Token validation failed:', error.message);
}
```

#### 2. Cross-Domain Cookie Issues

**Problem**: Authentication not persisting across domains
**Solution**:
- Ensure COOKIE_DOMAIN is set to `.codai.ro`
- Check HTTPS configuration for secure cookies
- Verify SameSite cookie settings

#### 3. Role Permission Denied

**Problem**: Users can't access routes despite having correct roles
**Solution**:
- Check role hierarchy configuration
- Verify user roles are properly assigned
- Test role checking logic

```javascript
// Debug role checking
console.log('User roles:', req.user.roles);
console.log('Required role:', requiredRole);
console.log('Has permission:', req.user.hasRole(requiredRole));
```

### Debugging Tools

```javascript
// Enable authentication debugging
process.env.DEBUG = 'codai:auth';

// Log all authentication attempts
app.use((req, res, next) => {
  console.log('Auth attempt:', {
    path: req.path,
    method: req.method,
    hasAuth: !!req.headers.authorization,
    cookies: Object.keys(req.cookies || {})
  });
  next();
});
```

## 📊 Monitoring

### Authentication Metrics

- **Login Success Rate**: Track successful vs failed logins
- **Token Validation Rate**: Monitor token validation performance
- **Session Duration**: Average user session length
- **Role Distribution**: Usage patterns by user role

### Health Check Endpoints

```http
GET /auth/health
Response:
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "uptime": 3600
}
```

## 🚀 Performance Optimization

### Caching Strategy

- **JWT Validation**: Cache user data for valid tokens
- **Role Checking**: Cache role hierarchies
- **Database Queries**: Use Redis for frequently accessed user data

### Scalability Considerations

- **Stateless Design**: JWT tokens enable horizontal scaling
- **Load Balancing**: Multiple ID service instances
- **Database Optimization**: Indexed user lookup queries

---

**Last Updated**: July 19, 2025  
**Authentication System Version**: 2.0.0  
**Status**: Production Ready ✅
