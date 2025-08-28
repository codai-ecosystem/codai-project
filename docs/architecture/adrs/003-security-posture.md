# ADR-003: Security Posture and Zero-Trust Architecture

**Status**: Accepted  
**Date**: 2025-08-27  
**Deciders**: Security Team, Engineering Team  
**Technical Story**: Implement enterprise-grade security for AI-native microservices

## Context and Problem Statement

CODAI ecosystem requires comprehensive security covering:
- AI/ML model protection and governance
- Microservices zero-trust architecture
- Compliance with GDPR, SOC2, and EU AI Act
- API security and rate limiting
- Data protection and privacy controls

## Decision Drivers

- **Regulatory Compliance**: GDPR, SOC2, EU AI Act requirements
- **Zero Trust**: Never trust, always verify principle
- **AI Security**: Model protection, data poisoning prevention
- **Incident Response**: Rapid threat detection and mitigation
- **Developer Experience**: Security that doesn't slow development

## Security Architecture Decision

### Zero-Trust Microservices Model

```yaml
Security Layers:
  1. Network Segmentation:
     - Service mesh with mTLS
     - Container network isolation
     - Ingress/egress controls
  
  2. Identity & Access:
     - Service-to-service authentication
     - JWT with short TTL (15 min)
     - API key management
     - Role-based access control (RBAC)
  
  3. Data Protection:
     - Encryption at rest (AES-256)
     - Encryption in transit (TLS 1.3)
     - Field-level encryption for PII
     - Key rotation every 30 days
  
  4. API Security:
     - Rate limiting (sliding window)
     - Input validation (JSON Schema)
     - CORS with strict origins
     - Security headers (HSTS, CSP, etc.)
  
  5. Monitoring & Response:
     - Real-time threat detection
     - Audit logging (immutable)
     - Automated incident response
     - Security metrics dashboard
```

### AI-Specific Security Controls

```yaml
AI Model Security:
  - Model versioning and integrity checks
  - Input sanitization for prompts
  - Output filtering for sensitive data
  - Model access logging and audit trails
  
Data Governance:
  - PII detection and classification
  - Automated data anonymization
  - Retention policy enforcement
  - Right to deletion (GDPR)
  
AI Ethics & Compliance:
  - Bias detection and mitigation
  - Explainability requirements
  - Human oversight controls
  - Algorithmic impact assessments
```

## Authentication & Authorization

### JWT Token Structure

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT",
    "kid": "codai-2025-key-1"
  },
  "payload": {
    "sub": "user-uuid",
    "iss": "codai-identity-service",
    "aud": ["gateway", "romai", "memorai"],
    "iat": 1724740800,
    "exp": 1724741700,
    "roles": ["developer", "ai-user"],
    "permissions": ["read:models", "write:projects"],
    "tenant": "org-uuid"
  }
}
```

### RBAC Implementation

```yaml
Roles:
  admin:
    permissions:
      - "*:*"  # Full access
  
  developer:
    permissions:
      - "read:projects"
      - "write:projects"
      - "read:models"
      - "execute:ai-inference"
  
  ai-user:
    permissions:
      - "read:models"
      - "execute:ai-inference"
      - "read:own-data"
  
  viewer:
    permissions:
      - "read:public-data"
      - "read:own-data"

Resources:
  - projects
  - models
  - data
  - system-config
  - user-management
```

### API Security Headers

```typescript
// Security middleware implementation
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // HSTS - Force HTTPS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // CSP - Prevent XSS
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' wss: https:;"
  );
  
  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent XSS
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Hide server information
  res.removeHeader('X-Powered-By');
  
  next();
};
```

## Rate Limiting Strategy

### Sliding Window Implementation

```typescript
import { RateLimiterRedis } from 'rate-limiter-flexible';

const rateLimiters = {
  // API endpoints
  api: new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'api_limit',
    points: 1000, // requests
    duration: 60,  // per 60 seconds
  }),
  
  // AI inference (more restrictive)
  ai: new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'ai_limit',
    points: 100,
    duration: 60,
  }),
  
  // Authentication attempts
  auth: new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'auth_limit',
    points: 5,     // attempts
    duration: 300, // per 5 minutes
    blockDuration: 900, // block for 15 minutes
  })
};
```

## Data Protection Implementation

### Encryption Standards

```typescript
// Field-level encryption for PII
import crypto from 'crypto';

export class DataEncryption {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyRotationInterval = 30 * 24 * 60 * 60 * 1000; // 30 days
  
  encrypt(data: string, key: Buffer): EncryptedData {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, key);
    cipher.setAAD(Buffer.from('codai-metadata'));
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      keyVersion: this.getCurrentKeyVersion()
    };
  }
  
  // Automatic PII detection
  detectPII(data: any): PIIReport {
    const patterns = {
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      phone: /\b\d{3}-\d{3}-\d{4}\b/g,
      ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
      creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g
    };
    
    const findings: PIIFinding[] = [];
    // Implementation details...
    return { findings, riskLevel: 'HIGH' };
  }
}
```

## Compliance Implementation

### GDPR Compliance

```typescript
export class GDPRCompliance {
  // Right to erasure (Article 17)
  async deleteUserData(userId: string): Promise<DeletionReport> {
    const services = ['gateway', 'memorai', 'romai', 'bancai'];
    const results = await Promise.all(
      services.map(service => this.deleteFromService(service, userId))
    );
    
    return {
      userId,
      timestamp: new Date().toISOString(),
      deletedFrom: results.filter(r => r.success).map(r => r.service),
      failures: results.filter(r => !r.success)
    };
  }
  
  // Data portability (Article 20)
  async exportUserData(userId: string): Promise<UserDataExport> {
    // Implementation for complete data export
  }
  
  // Consent management
  async updateConsent(userId: string, consent: ConsentRecord): Promise<void> {
    // Granular consent tracking
  }
}
```

### SOC 2 Controls

```yaml
Type II Controls:
  
  Security (CC6):
    - CC6.1: Logical access controls
    - CC6.2: Authentication and authorization
    - CC6.3: Network security controls
    - CC6.7: Data transmission controls
    - CC6.8: Data classification and handling
  
  Availability (CC7):
    - CC7.1: System availability monitoring
    - CC7.2: Disaster recovery procedures
    - CC7.4: System backup and restoration
  
  Processing Integrity (CC8):
    - CC8.1: Data processing controls
    - CC8.2: System input completeness
  
  Confidentiality (CC9):
    - CC9.1: Confidential information access
    - CC9.2: Data loss prevention
  
  Privacy (CC10):
    - CC10.1: Privacy notice and consent
    - CC10.2: Personal information collection
    - CC10.3: Personal information retention
```

## Monitoring and Incident Response

### Security Metrics Dashboard

```yaml
Key Security Metrics:
  - Failed authentication attempts/hour
  - Rate limit violations/hour
  - API error rates by endpoint
  - Anomalous traffic patterns
  - Privilege escalation attempts
  - Data access pattern anomalies
  - Model inference abuse patterns
  
Alerting Thresholds:
  - >10 failed auth attempts/minute → Alert
  - >5% API error rate → Warning
  - >10% API error rate → Critical
  - Unusual geographic access → Alert
  - Privilege escalation → Critical
```

### Automated Incident Response

```typescript
export class SecurityIncidentResponse {
  private readonly alertHandlers = {
    'bruteforce-attack': this.handleBruteForce,
    'data-breach-attempt': this.handleDataBreach,
    'privilege-escalation': this.handlePrivilegeEscalation,
    'model-abuse': this.handleModelAbuse
  };
  
  async handleSecurityAlert(alert: SecurityAlert): Promise<void> {
    // Automatic response based on severity
    if (alert.severity === 'CRITICAL') {
      await this.lockdownService(alert.affectedService);
      await this.notifySecurityTeam(alert);
    }
    
    // Log to immutable audit trail
    await this.auditLogger.logSecurityEvent(alert);
    
    // Execute handler
    const handler = this.alertHandlers[alert.type];
    if (handler) {
      await handler(alert);
    }
  }
}
```

## Security Testing Strategy

### Automated Security Scanning

```yaml
# Security pipeline integration
security-scan:
  runs-on: ubuntu-latest
  steps:
    - name: SAST - Static Application Security Testing
      uses: github/super-linter@v4
      
    - name: Dependency Vulnerability Scan
      run: |
        pnpm audit --audit-level moderate
        npm audit --audit-level moderate
        
    - name: Container Security Scan
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: 'codai-gateway:latest'
        
    - name: API Security Testing
      run: |
        # OWASP ZAP API security testing
        docker run -t owasp/zap2docker-stable zap-api-scan.py \
          -t http://localhost:4003/api/v1/openapi.json
```

### Penetration Testing Schedule

```yaml
Testing Schedule:
  - Quarterly: External penetration testing
  - Monthly: Internal security assessments
  - Weekly: Automated vulnerability scans
  - Daily: Dependency security checks
  - Continuous: SAST/DAST in CI/CD
```

## Implementation Checklist

### Phase 1: Foundation (Week 1-2)
- [ ] JWT authentication service
- [ ] RBAC implementation
- [ ] API security middleware
- [ ] Rate limiting infrastructure
- [ ] Basic audit logging

### Phase 2: Data Protection (Week 3-4)
- [ ] Encryption at rest/transit
- [ ] PII detection system
- [ ] GDPR compliance tools
- [ ] Key rotation automation
- [ ] Data classification

### Phase 3: Monitoring (Week 5-6)
- [ ] Security metrics dashboard
- [ ] Incident response automation
- [ ] Threat detection rules
- [ ] Compliance reporting
- [ ] Security testing integration

## Links

- [Architecture Decision](./001-architecture-decision.md)
- [API Contracts](./002-api-contracts.md)
- [Deployment Strategy](./004-deployment-strategy.md)
- [Security Policies](../policies/security.md)