# ROMAI Security Policy

## Supported Versions

We actively maintain and provide security updates for the following versions:

| Version | Supported         |
| ------- | ----------------- |
| 1.0.x   | ✅ Active support |
| 0.x.x   | ❌ No support     |

## Reporting a Vulnerability

We take security seriously at ROMAI. If you discover a security vulnerability, please follow our responsible disclosure process:

### Reporting Process

1. **DO NOT** create a public GitHub issue for security vulnerabilities
2. **Email us directly** at: security@codai.ro
3. **Include the following information**:
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact assessment
   - Suggested fix (if available)
   - Your contact information

### Response Timeline

- **Initial Response**: Within 24 hours
- **Assessment**: Within 72 hours
- **Fix Development**: 1-7 days (depending on severity)
- **Public Disclosure**: After fix is deployed

### Vulnerability Categories

#### High Severity

- Remote code execution
- Authentication bypass
- Data breach potential
- Azure OpenAI credential exposure

#### Medium Severity

- Privilege escalation
- Cross-site scripting (XSS)
- Denial of service (DoS)
- Information disclosure

#### Low Severity

- Minor information leaks
- Configuration issues
- Non-critical input validation

## Security Best Practices

### Environment Configuration

```bash
# Use strong, unique API keys
AZURE_OPENAI_API_KEY=your-secure-api-key

# Use HTTPS endpoints only
AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com/

# Restrict access with proper deployment names
AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment

# Use secure random tokens
ROMAI_SECRET_TOKEN=$(openssl rand -hex 32)
```

### Input Validation

All inputs are validated using Zod schemas:

```typescript
// Request validation
const requestSchema = z.object({
  query: z.string().min(1).max(10000),
  language: z.enum(['ro', 'en']),
  domain: z.string().optional(),
});

// Validate before processing
const validatedRequest = requestSchema.parse(userInput);
```

### Secure Logging

```typescript
// Safe logging - no sensitive data
logger.info('Processing request', {
  requestId: req.id,
  language: req.language,
  // Never log: API keys, user data, responses
});
```

## Security Features

### Built-in Protections

1. **Input Sanitization**
   - All user inputs validated with Zod
   - HTML/script injection prevention
   - Size limits on requests

2. **Credential Management**
   - Environment variable isolation
   - No hardcoded secrets
   - Secure Azure OpenAI communication

3. **Request Rate Limiting**
   - MCP tool execution limits
   - API request throttling
   - Resource usage monitoring

4. **Error Handling**
   - No sensitive data in error messages
   - Structured error logging
   - Graceful failure modes

### Secure Development

```typescript
// Example secure implementation
export class RomaiCore {
  private config: RomaiConfig;
  private logger: winston.Logger;

  constructor(config: RomaiConfig) {
    // Validate configuration
    this.config = validateConfig(config);
    this.logger = createSecureLogger();
  }

  async processRequest(request: IntelligenceRequest): Promise<IntelligenceResponse> {
    // Validate input
    const validated = validateRequest(request);

    try {
      // Process securely
      const response = await this.openai.chat.completions.create({
        // Sanitized parameters only
        messages: this.sanitizeMessages(validated.query),
        model: this.config.azure.deploymentName,
        max_tokens: Math.min(validated.maxTokens || 1000, MAX_ALLOWED_TOKENS),
      });

      return this.sanitizeResponse(response);
    } catch (error) {
      // Log error safely (no sensitive data)
      this.logger.error('Request processing failed', {
        requestId: validated.id,
        error: error.message,
      });
      throw new SecurityError('Request processing failed');
    }
  }
}
```

## Deployment Security

### Production Checklist

- [ ] All environment variables properly configured
- [ ] HTTPS/TLS enabled for all communications
- [ ] Access logs configured and monitored
- [ ] Error monitoring with secure logging
- [ ] Regular security updates applied
- [ ] Network access properly restricted
- [ ] Backup and recovery procedures tested

### Environment Security

```bash
# Production environment setup
export NODE_ENV=production
export ROMAI_LOG_LEVEL=warn
export ROMAI_SECURE_MODE=true

# Restrict network access
export ROMAI_ALLOWED_ORIGINS="https://your-domain.com"
export ROMAI_CORS_ENABLED=true

# Enable security headers
export ROMAI_SECURITY_HEADERS=true
```

### Docker Security

```dockerfile
# Use non-root user
FROM node:20-alpine
RUN addgroup -g 1001 -S romai
RUN adduser -S romai -u 1001

# Set working directory
WORKDIR /app
CHOWN romai:romai /app

# Copy and install dependencies
COPY --chown=romai:romai package*.json ./
RUN npm ci --only=production

# Copy application code
COPY --chown=romai:romai . .

# Switch to non-root user
USER romai

# Expose port
EXPOSE 3001

# Start application
CMD ["node", "apps/mcp-server/dist/server.js"]
```

## Security Monitoring

### Logging

```typescript
// Security event logging
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.File({
      filename: 'security.log',
      level: 'warn',
    }),
  ],
});

// Log security events
securityLogger.warn('Suspicious request detected', {
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  requestId: req.id,
  timestamp: new Date().toISOString(),
});
```

### Health Monitoring

```typescript
// Security health checks
export async function securityHealthCheck(): Promise<SecurityStatus> {
  return {
    credentialsValid: await validateAzureCredentials(),
    certificatesValid: await checkTLSCertificates(),
    rateLimit: await checkRateLimitStatus(),
    lastSecurityScan: getLastScanTimestamp(),
    securityScore: calculateSecurityScore(),
  };
}
```

## Compliance

### Data Protection

- **GDPR Compliance**: No personal data stored or logged
- **Data Minimization**: Only necessary data processed
- **Right to Erasure**: No persistent user data storage
- **Transparency**: Clear data processing documentation

### Industry Standards

- **OWASP Top 10**: Protection against common vulnerabilities
- **ISO 27001**: Information security management practices
- **SOC 2**: Security controls and procedures
- **NIST Framework**: Cybersecurity risk management

## Security Updates

### Update Process

1. **Security patches** released immediately for critical issues
2. **Regular updates** included in minor version releases
3. **Breaking changes** only in major version releases
4. **Notification** via GitHub security advisories

### Automatic Updates

```bash
# Enable automated security updates
npm audit fix

# Check for vulnerabilities
pnpm audit

# Update dependencies
pnpm update
```

## Contact Information

### Security Team

- **Email**: security@codai.ro
- **PGP Key**: [Download](https://codai.ro/security/pgp-key.asc)
- **Response Time**: 24 hours maximum

### Bug Bounty

Currently, we don't have a formal bug bounty program, but we recognize and appreciate security researchers who help improve ROMAI's security.

### Acknowledgments

We thank the security community for helping keep ROMAI secure:

- [Security researchers will be listed here]

---

## Legal

This security policy is subject to our [Terms of Service](https://romai.ro/terms) and [Privacy Policy](https://romai.ro/privacy).

---

_Security is a shared responsibility. Help us keep ROMAI secure!_ 🔒
