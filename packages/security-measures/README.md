# 🛡️ CodAI Security Measures

Comprehensive security package for Essential CodAI Services providing enterprise-grade security features including rate limiting, threat detection, vulnerability scanning, and security monitoring.

## ✨ Features

- **🚦 Rate Limiting**: Advanced rate limiting with Redis support and custom endpoint configurations
- **🔒 Security Headers**: Comprehensive security headers including CSP, HSTS, XSS protection
- **🛡️ CORS Protection**: Configurable Cross-Origin Resource Sharing protection
- **🧼 Input Sanitization**: HTML sanitization, XSS prevention, SQL injection protection
- **🕵️ Threat Detection**: Real-time pattern-based threat detection and behavioral analysis
- **🔍 Vulnerability Scanning**: Automated vulnerability scanning with npm audit and Snyk integration
- **📊 Security Dashboard**: Real-time security monitoring dashboard with interactive visualizations
- **🚨 Incident Response**: Automated incident response with configurable escalation rules
- **📝 Security Logging**: Structured security event logging with Elasticsearch integration
- **⚡ Performance Optimized**: Minimal performance impact with intelligent caching

## 🚀 Quick Start

### Installation

```bash
npm install @codai/security-measures
```

### Basic Setup

```typescript
import { FastifyInstance } from 'fastify';
import { SecurityManager, getDefaultSecurityConfig } from '@codai/security-measures';

// Initialize security manager
const securityConfig = getDefaultSecurityConfig();
const securityManager = new SecurityManager(securityConfig);

// Apply security to your Fastify application
async function setupSecurity(fastify: FastifyInstance) {
  await securityManager.initializeSecurity(fastify, 'your-service-id');
}
```

### Essential CodAI Services Integration

```typescript
import { getServiceSecurityProfile } from '@codai/security-measures';

// Get pre-configured security profile for Essential CodAI Services
const authServiceProfile = getServiceSecurityProfile('codai-auth-api');
const gatewayServiceProfile = getServiceSecurityProfile('codai-gateway-api');
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with your configuration:

```bash
# Rate Limiting
SECURITY_RATE_LIMIT_ENABLED=true
SECURITY_RATE_LIMIT_WINDOW_MS=60000
SECURITY_RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
SECURITY_CORS_ENABLED=true
SECURITY_CORS_ORIGIN=http://localhost:3000,http://localhost:4000,https://codai.ro

# Security Headers
SECURITY_HEADERS_ENABLED=true
SECURITY_CSP_ENABLED=true
SECURITY_HSTS_ENABLED=true

# Monitoring
SECURITY_MONITORING_ENABLED=true
SECURITY_THREAT_DETECTION_ENABLED=true
SECURITY_BRUTE_FORCE_DETECTION_ENABLED=true

# Vulnerability Scanning
SECURITY_VULNERABILITY_SCANNING_ENABLED=true
SNYK_TOKEN=your-snyk-token-here

# Alerting
SECURITY_ALERTING_ENABLED=true
SECURITY_ALERT_EMAIL=security@codai.ro
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
```

### Custom Configuration

```typescript
import { SecurityConfig } from '@codai/security-measures';

const customConfig: SecurityConfig = {
  rateLimit: {
    enabled: true,
    windowMs: 60000,
    maxRequests: 100,
    customLimits: {
      auth_endpoints: {
        windowMs: 300000, // 5 minutes
        maxRequests: 10,
        endpoints: ['/api/auth/login', '/api/auth/register']
      }
    }
  },
  // ... other configuration options
};
```

## 📊 Essential CodAI Services Security Profiles

Pre-configured security profiles for all Essential CodAI Services:

| Service | Port | Rate Limit | Security Features |
|---------|------|------------|-------------------|
| **CodAI Auth API** | 8100 | 100/min, Auth: 10/5min | Enhanced auth security, MFA protection |
| **CodAI Gateway API** | 8010 | 1000/min | API gateway protection, request routing security |
| **CodAI Hub API** | 8110 | 500/min | Hub service security, resource protection |
| **MemorAI MCP Server** | 4950 | 200/min | MCP protocol security, memory access control |
| **CBD Database** | 8180 | 100/min | Database security, query protection |
| **MemorAI Frontend** | 8006 | 300/min | Frontend security headers, asset protection |

## 🖥️ CLI Tools

### Security Management CLI

```bash
# Show help
npx codai-security --help

# Check security status
npx codai-security status

# Run vulnerability scan
npx codai-security scan

# Start security monitoring dashboard
npx codai-security monitor --port 8080

# Test security measures
npx codai-security test --url http://localhost:8100

# Show configuration
npx codai-security config

# List all services
npx codai-security list
```

### Available Commands

| Command | Description | Options |
|---------|-------------|---------|
| `scan` | Perform vulnerability scan | `--type`, `--output` |
| `status` | Check security status | - |
| `health` | Check security health | `--service` |
| `monitor` | Start monitoring dashboard | `--port` |
| `config` | Show configuration | `--service`, `--env` |
| `list` | List all services | - |
| `test` | Test security measures | `--url` |

## 🔍 Security Features

### Rate Limiting

```typescript
// Custom rate limits for specific endpoints
const rateLimitConfig = {
  enabled: true,
  windowMs: 60000,
  maxRequests: 100,
  customLimits: {
    auth_critical: {
      windowMs: 300000, // 5 minutes
      maxRequests: 5,
      endpoints: ['/api/auth/login'],
      methods: ['POST']
    }
  }
};
```

### Threat Detection

```typescript
// Configure threat detection patterns
const threatPatterns = [
  {
    id: 'xss_attempt',
    name: 'Cross-Site Scripting Attempt',
    pattern: '<script[^>]*>.*?</script>|javascript:|onload=',
    severity: 'high',
    action: 'block'
  },
  {
    id: 'sql_injection',
    name: 'SQL Injection Attempt',
    pattern: "(union|select|insert|delete|update|drop)\\s+(.*\\s+)*(from|into|table)",
    severity: 'critical',
    action: 'block'
  }
];
```

### Security Headers

Automatically applied security headers:
- **Content Security Policy (CSP)**: Prevents XSS attacks
- **HTTP Strict Transport Security (HSTS)**: Forces HTTPS
- **X-Content-Type-Options**: Prevents MIME sniffing
- **X-Frame-Options**: Prevents clickjacking
- **X-XSS-Protection**: Browser XSS protection
- **Referrer Policy**: Controls referrer information
- **Permissions Policy**: Controls browser features

### Input Sanitization

- **HTML Sanitization**: Removes dangerous HTML tags and attributes
- **XSS Prevention**: Filters malicious scripts and code injection
- **SQL Injection Prevention**: Basic SQL injection pattern filtering
- **Output Sanitization**: Ensures safe output rendering

## 📈 Monitoring & Alerts

### Security Dashboard

Access the interactive security dashboard at:
```
http://localhost:8080/security/dashboard
```

Features:
- Real-time security event monitoring
- Threat severity visualization
- Top attacking sources
- Security metrics and performance impact
- Interactive event filtering

### Security Metrics

```typescript
// Get security metrics
const metrics = securityManager.getSecurityMetrics();
console.log(`Rate limit hits: ${metrics.rateLimitHits}`);
console.log(`Blocked requests: ${metrics.blockedRequests}`);
```

### Alerting

Configure email alerts for security events:

```typescript
const alertingConfig = {
  enabled: true,
  channels: [
    {
      type: 'email',
      config: {
        to: 'security@codai.ro',
        smtp: {
          host: 'smtp.gmail.com',
          port: 587,
          auth: {
            user: 'your-email@gmail.com',
            pass: 'your-app-password'
          }
        }
      }
    }
  ],
  thresholds: [
    {
      metric: 'security_events_per_minute',
      operator: 'gt',
      value: 10,
      severity: 'high'
    }
  ]
};
```

## 🔍 Vulnerability Scanning

### Automated Scanning

```bash
# Run comprehensive vulnerability scan
npx codai-security scan

# Run specific scan type
npx codai-security scan --type npm

# Save results to file
npx codai-security scan --output security-report.json
```

### Supported Scan Tools

- **npm audit**: Built-in npm vulnerability scanning
- **Snyk**: Commercial vulnerability scanning (requires token)
- **OWASP Dependency Check**: OWASP security scanning (planned)

### Scan Results

```json
{
  "timestamp": "2025-01-27T10:00:00.000Z",
  "scanId": "scan_1738915200000_abc123",
  "status": "completed",
  "vulnerabilities": [
    {
      "id": "npm-package-123",
      "title": "Prototype Pollution vulnerability",
      "severity": "high",
      "packageName": "lodash",
      "currentVersion": "4.17.20",
      "fixedVersion": "4.17.21",
      "remediation": "Update to version 4.17.21"
    }
  ],
  "summary": {
    "total": 1,
    "critical": 0,
    "high": 1,
    "medium": 0,
    "low": 0,
    "fixed": 1,
    "pending": 0
  },
  "recommendations": [
    "UPDATE: 1 vulnerabilities can be fixed by updating packages"
  ]
}
```

## 🏗️ Architecture

### Components

```
├── SecurityManager          # Main security orchestration
├── SecurityMiddleware       # Fastify middleware integration
├── ThreatDetector          # Real-time threat detection
├── VulnerabilityScanner    # Automated vulnerability scanning
├── SecurityDashboard       # Monitoring dashboard
├── SecurityLogger          # Event logging and analysis
└── CLI Tools              # Command-line management
```

### Integration Pattern

```typescript
// 1. Initialize SecurityManager
const securityManager = new SecurityManager(config);

// 2. Apply to Fastify instance
await securityManager.initializeSecurity(fastify, serviceId);

// 3. Access security features
const scanResult = await securityManager.performVulnerabilityScan();
const securityStatus = securityManager.getSecurityStatus();
```

## 📝 API Reference

### SecurityManager

```typescript
class SecurityManager {
  constructor(config: SecurityConfig)
  
  // Initialize security for a service
  async initializeSecurity(fastify: FastifyInstance, serviceId: string): Promise<void>
  
  // Perform vulnerability scan
  async performVulnerabilityScan(): Promise<VulnerabilityScanResult>
  
  // Get security status
  getSecurityStatus(): SecurityStatus
  
  // Cleanup resources
  async cleanup(): Promise<void>
}
```

### Security Events

```typescript
interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: SecurityEventType;
  severity: SecuritySeverity;
  source: string;
  target?: string;
  description: string;
  metadata: Record<string, any>;
  correlationId?: string;
}
```

### Configuration Types

```typescript
interface SecurityConfig {
  rateLimit: RateLimitConfig;
  cors: CorsConfig;
  headers: SecurityHeadersConfig;
  validation: ValidationConfig;
  monitoring: SecurityMonitoringConfig;
  vulnerability: VulnerabilityConfig;
}
```

## 🔧 Development & Testing

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/codai-ecosystem/codai-project
cd codai-project/packages/security-measures

# Install dependencies
npm install

# Build package
npm run build

# Run setup script
pwsh ./scripts/setup-security-measures.ps1

# Start development server
npm run dev
```

### Running Tests

```bash
# Run all tests
npm test

# Run security tests
npm run test:security

# Run integration tests
npm run test:integration
```

### Testing Security Measures

```bash
# Test security configuration
npx codai-security test --url http://localhost:8100

# Monitor security dashboard
npx codai-security monitor --port 8080

# Run vulnerability scan
npx codai-security scan --output test-results.json
```

## 🤝 Integration Examples

### Express.js Integration

```typescript
import express from 'express';
import { SecurityManager } from '@codai/security-measures';

const app = express();
const securityManager = new SecurityManager(securityConfig);

// Note: This package is designed for Fastify
// Express integration would require additional middleware adaptation
```

### Next.js Integration

```typescript
// pages/api/security/dashboard.ts
import { SecurityManager } from '@codai/security-measures';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const securityManager = new SecurityManager(securityConfig);
  const metrics = securityManager.getSecurityMetrics();
  res.json(metrics);
}
```

### Docker Integration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Create security directories
RUN mkdir -p logs/security security-scans

EXPOSE 8080
CMD ["npm", "run", "security:monitor"]
```

## 🚨 Security Best Practices

### Production Deployment

1. **Environment Configuration**
   ```bash
   # Use strong secrets
   SECURITY_JWT_SECRET=your-super-secure-jwt-secret
   SECURITY_ENCRYPTION_KEY=your-32-char-encryption-key
   
   # Enable all security features
   SECURITY_RATE_LIMIT_ENABLED=true
   SECURITY_HEADERS_ENABLED=true
   SECURITY_MONITORING_ENABLED=true
   ```

2. **Rate Limiting Strategy**
   - Configure appropriate limits for each endpoint
   - Use Redis for distributed rate limiting
   - Implement progressive penalties for repeat offenders

3. **Monitoring & Alerting**
   - Set up email/Slack alerts for critical events
   - Monitor security dashboard regularly
   - Review security logs weekly

4. **Vulnerability Management**
   - Schedule weekly vulnerability scans
   - Set up automated dependency updates
   - Maintain incident response procedures

### Security Headers Configuration

```typescript
const productionHeaders = {
  contentSecurityPolicy: {
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'connect-src': ["'self'"],
      'font-src': ["'self'", 'https:'],
      'object-src': ["'none'"],
      'media-src': ["'self'"],
      'frame-src': ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
};
```

## 📚 Documentation

### Additional Resources

- [Security Configuration Guide](./docs/configuration.md)
- [Threat Detection Patterns](./docs/threat-detection.md)
- [Vulnerability Scanning Setup](./docs/vulnerability-scanning.md)
- [Monitoring & Alerting](./docs/monitoring.md)
- [API Reference](./docs/api-reference.md)

### Support

For support and questions:
- GitHub Issues: [https://github.com/codai-ecosystem/codai-project/issues](https://github.com/codai-ecosystem/codai-project/issues)
- Email: security@codai.ro
- Documentation: [https://docs.codai.ro/security](https://docs.codai.ro/security)

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🏆 Credits

Developed by the CodAI Ecosystem team as part of the Essential CodAI Services security enhancement initiative.

---

**🛡️ Stay Secure with CodAI Security Measures!**