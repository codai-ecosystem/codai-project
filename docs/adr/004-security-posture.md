# ADR 004: Security Posture and Implementation

## Status
Accepted

## Context
CODAI essential services handle sensitive data including user authentication, financial transactions, and AI memory contexts. A comprehensive security strategy is required to meet enterprise standards and compliance requirements (GDPR, ISO27001).

## Decision
We will implement a defense-in-depth security architecture with multiple layers of protection across all essential services.

## Security Architecture

### 1. Authentication & Authorization

#### JWT-Based Authentication
```typescript
interface JWTPayload {
  sub: string;      // User ID
  email: string;    // User email
  role: string;     // User role (user, admin, service)
  iat: number;      // Issued at
  exp: number;      // Expires at
  aud: string;      // Audience (service name)
  iss: string;      // Issuer (identity service)
  jti: string;      // JWT ID for revocation
}
```

**Implementation Details**:
- Access tokens: 15-minute expiry
- Refresh tokens: 7-day expiry with rotation
- Algorithm: RS256 with key rotation every 90 days
- Token revocation via Redis blacklist
- Service-to-service authentication via mutual JWT

#### Role-Based Access Control (RBAC)
```yaml
roles:
  user:
    permissions:
      - "profile:read"
      - "profile:update"
      - "memorai:basic"
  
  admin:
    permissions:
      - "users:read"
      - "users:write"
      - "system:monitor"
      - "bancai:admin"
  
  service:
    permissions:
      - "service:internal"
      - "health:check"
      - "metrics:read"

scopes:
  bancai:
    - "transactions:read"
    - "transactions:write"
    - "accounts:manage"
  
  memorai:
    - "memories:read"
    - "memories:write"
    - "agents:manage"
```

### 2. API Security

#### Rate Limiting Strategy
```typescript
interface RateLimitConfig {
  public: {
    requests: 100;
    window: '15m';
    burst: 20;
  };
  authenticated: {
    requests: 1000;
    window: '15m';
    burst: 100;
  };
  admin: {
    requests: 5000;
    window: '15m';
    burst: 500;
  };
}
```

#### Security Headers
```typescript
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};
```

#### Input Validation & Sanitization
```typescript
// Zod schemas for validation
const LoginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128)
    .refine(password => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password), {
      message: "Password must contain at least one lowercase, uppercase, digit and special character"
    })
});

const TransactionSchema = z.object({
  amount: z.number().positive().max(1000000),
  currency: z.enum(['EUR', 'USD', 'GBP']),
  description: z.string().max(500).optional()
});
```

### 3. Data Protection

#### Encryption Standards
- **Data at Rest**: AES-256 encryption for all databases
- **Data in Transit**: TLS 1.3 for all HTTP communications
- **API Keys**: Argon2id hashing with salt
- **Passwords**: bcrypt with cost factor 12
- **PII Data**: Field-level encryption with separate key management

#### Data Classification
```typescript
enum DataClassification {
  PUBLIC = 'public',           // Marketing content, public APIs
  INTERNAL = 'internal',       // System logs, metrics
  CONFIDENTIAL = 'confidential', // User profiles, preferences
  RESTRICTED = 'restricted'    // Passwords, API keys, financial data
}

interface DataHandlingRules {
  classification: DataClassification;
  encryption: boolean;
  retention: string; // ISO duration (P30D, P1Y, etc.)
  backupRequired: boolean;
  auditLogging: boolean;
}
```

#### Key Management
- Separate encryption keys per service
- Key rotation every 90 days
- Hardware Security Module (HSM) for production
- Azure Key Vault integration for cloud deployments
- Emergency key recovery procedures

### 4. Network Security

#### Service-to-Service Communication
```yaml
network_policies:
  ingress:
    - from: api_gateway
      to: [identity_service, hub_service, memorai_mcp]
      ports: [4003, 4004, 4008, 4950]
    
    - from: identity_service
      to: [postgres, redis]
      ports: [5432, 6379]
    
    - from: memorai_mcp
      to: [cbd_database]
      ports: [4180]
  
  egress:
    - from: all_services
      to: external
      ports: [443] # HTTPS only
      allowed_domains: [
        '*.stripe.com',
        '*.azure.com', 
        'api.openai.com'
      ]
```

#### API Gateway Security
- CORS configuration with explicit origin whitelist
- Request/response size limits
- Timeout configurations
- Circuit breaker pattern for upstream failures
- DDoS protection via rate limiting

### 5. Vulnerability Management

#### Static Application Security Testing (SAST)
```yaml
sast_tools:
  - tool: semgrep
    rules: [javascript, typescript, security]
    fail_on: [error, warning]
  
  - tool: eslint-plugin-security
    rules: [detect-object-injection, detect-non-literal-regexp]
  
  - tool: audit
    command: pnpm audit --audit-level moderate
```

#### Dynamic Application Security Testing (DAST)
```yaml
dast_tools:
  - tool: zap
    target: http://localhost:8010
    scan_types: [baseline, full]
  
  - tool: custom_security_tests
    tests: [
      sql_injection,
      xss_attacks,
      authentication_bypass,
      authorization_flaws
    ]
```

#### Dependency Security
- Automated vulnerability scanning with Snyk
- Dependency update automation with security patches
- License compliance checking
- Third-party component inventory

### 6. Monitoring & Incident Response

#### Security Event Logging
```typescript
interface SecurityEvent {
  eventType: 'login' | 'logout' | 'api_access' | 'permission_denied' | 'suspicious_activity';
  userId?: string;
  serviceId: string;
  sourceIP: string;
  userAgent?: string;
  requestId: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata: Record<string, any>;
}
```

#### Alerting Rules
```yaml
alerts:
  - name: multiple_failed_logins
    condition: failed_login_count > 5 in 5m
    severity: high
    action: [block_ip, notify_security_team]
  
  - name: unusual_api_access_pattern
    condition: api_requests > 1000 in 1m from single_ip
    severity: medium
    action: [rate_limit, investigate]
  
  - name: privilege_escalation_attempt
    condition: unauthorized_admin_access
    severity: critical
    action: [block_user, immediate_alert]
```

### 7. Compliance & Auditing

#### GDPR Compliance
- Data mapping and inventory
- Privacy by design principles
- User consent management
- Data subject rights automation (access, rectification, erasure)
- Data breach notification procedures

#### Audit Trail Requirements
```typescript
interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;        // User or service ID
  action: string;       // CRUD operation
  resource: string;     // Resource affected
  resourceId?: string;  // Specific resource ID
  changes?: object;     // Before/after values
  ipAddress: string;
  userAgent?: string;
  sessionId?: string;
  result: 'success' | 'failure';
  metadata: object;
}
```

### 8. Secure Development Lifecycle

#### Code Review Security Checklist
- [ ] Input validation implemented
- [ ] Authentication/authorization checked
- [ ] Sensitive data properly handled
- [ ] Error messages don't leak information
- [ ] SQL injection prevention
- [ ] XSS prevention measures
- [ ] CSRF tokens implemented
- [ ] Rate limiting configured
- [ ] Audit logging included

#### Security Testing Pipeline
1. **Pre-commit**: ESLint security rules, secret detection
2. **CI Pipeline**: SAST scanning, dependency check
3. **Staging**: DAST scanning, penetration testing
4. **Production**: Continuous monitoring, threat detection

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Implement JWT authentication system
- Set up basic RBAC
- Configure security headers middleware
- Establish input validation schemas

### Phase 2: API Security (Week 3-4)
- Implement rate limiting
- Set up API key management
- Configure CORS policies
- Add request/response logging

### Phase 3: Data Protection (Week 5-6)
- Enable database encryption
- Implement field-level encryption for PII
- Set up key management system
- Configure backup encryption

### Phase 4: Monitoring & Compliance (Week 7-8)
- Deploy security event logging
- Set up alerting rules
- Implement audit trail system
- Configure GDPR compliance tools

### Phase 5: Advanced Security (Week 9-10)
- Deploy SAST/DAST tools
- Set up vulnerability management
- Implement threat detection
- Conduct security assessment

## Success Metrics
- Zero critical security vulnerabilities
- Authentication response time < 100ms
- Rate limiting effectiveness > 99%
- Audit log completeness > 99.9%
- GDPR compliance score > 95%
- Security incident response time < 15 minutes