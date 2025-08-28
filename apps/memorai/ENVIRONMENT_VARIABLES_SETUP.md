# MemorAI Production Environment Variables Setup

## Overview
This document outlines the environment variables required for production deployment of the MemorAI application to Azure Static Web Apps with GitHub Actions CI/CD.

## Required Environment Variables

### 1. Authentication & Security
```bash
# NextAuth.js Configuration
NEXTAUTH_SECRET=<randomly-generated-256-bit-secret>
NEXTAUTH_URL=https://memorai.azurestaticapps.net

# JWT Configuration
JWT_SECRET=<randomly-generated-jwt-secret>
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d

# API Keys Encryption
API_KEY_ENCRYPTION_KEY=<randomly-generated-encryption-key>

# Session Security
SESSION_SECRET=<randomly-generated-session-secret>
```

### 2. Azure OpenAI Integration
```bash
# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://swedencentral.api.cognitive.microsoft.com/
AZURE_OPENAI_API_KEY=<your-azure-openai-api-key>
AZURE_OPENAI_DEPLOYMENT_NAME=text-embedding-3-large
AZURE_OPENAI_API_VERSION=2024-02-01
AZURE_OPENAI_GPT_DEPLOYMENT_NAME=gpt-4o
```

### 3. Database Configuration
```bash
# CBD Database
CBD_BASE_URL=https://cbd-production.azurecontainerapps.io
CBD_API_KEY=<your-cbd-api-key>

# PostgreSQL (if used)
DATABASE_URL=<postgresql-connection-string>
POSTGRES_DB=memorai_production
POSTGRES_USER=<postgres-username>
POSTGRES_PASSWORD=<postgres-password>

# Redis Cache
REDIS_URL=<redis-connection-string>
CACHE_TTL=3600
```

### 4. OAuth Providers
```bash
# Google OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=<your-github-client-id>
GITHUB_CLIENT_SECRET=<your-github-client-secret>
```

### 5. Email Configuration
```bash
# SMTP Configuration
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<your-sendgrid-api-key>
FROM_EMAIL=noreply@memorai.com
```

### 6. Monitoring & Analytics
```bash
# Application Insights
NEXT_PUBLIC_APPLICATION_INSIGHTS_CONNECTION_STRING=<your-app-insights-connection-string>

# Sentry (optional)
SENTRY_DSN=<your-sentry-dsn>
SENTRY_ORG=<your-sentry-org>
SENTRY_PROJECT=<your-sentry-project>
```

### 7. Feature Flags & Configuration
```bash
# Environment
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production

# Feature Flags
ENABLE_AI_SEARCH=true
ENABLE_COLLABORATION=true
ENABLE_ANALYTICS=true
ENABLE_EXPERIMENTAL_FEATURES=false

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# CORS Configuration
CORS_ORIGINS=https://memorai.azurestaticapps.net,https://memorai.com
```

### 8. Security Configuration
```bash
# Content Security Policy
CSP_ENABLED=true
SECURITY_HEADERS_ENABLED=true

# API Security
API_RATE_LIMIT_ENABLED=true
API_AUTH_REQUIRED=true

# Input Sanitization
XSS_PROTECTION_ENABLED=true
SQL_INJECTION_PROTECTION_ENABLED=true
```

## Setup Instructions

### 1. Generate Secrets
Use the following commands to generate secure secrets:

```bash
# NextAuth Secret (256-bit)
openssl rand -base64 32

# JWT Secret
openssl rand -base64 64

# API Key Encryption Key
openssl rand -hex 32

# Session Secret
openssl rand -base64 32
```

### 2. Azure Static Web Apps Configuration

#### Via Azure Portal:
1. Navigate to your Azure Static Web App
2. Go to Configuration > Application Settings
3. Add each environment variable with its value
4. Click Save

#### Via Azure CLI:
```bash
# Set environment variables for Azure Static Web Apps
az staticwebapp appsettings set \
  --name memorai-prod \
  --setting-names \
    NEXTAUTH_SECRET="<your-secret>" \
    NEXTAUTH_URL="https://memorai.azurestaticapps.net" \
    JWT_SECRET="<your-jwt-secret>" \
    AZURE_OPENAI_API_KEY="<your-openai-key>" \
    CBD_API_KEY="<your-cbd-key>"
```

### 3. GitHub Repository Secrets
Add the following secrets to your GitHub repository (Settings > Secrets and variables > Actions):

```yaml
# Azure Deployment
AZURE_STATIC_WEB_APPS_API_TOKEN_MEMORAI_PROD: <your-deployment-token>

# Application Secrets
NEXTAUTH_SECRET: <your-nextauth-secret>
JWT_SECRET: <your-jwt-secret>
AZURE_OPENAI_API_KEY: <your-openai-key>
CBD_API_KEY: <your-cbd-key>
GOOGLE_CLIENT_SECRET: <your-google-client-secret>
API_KEY_ENCRYPTION_KEY: <your-encryption-key>
SESSION_SECRET: <your-session-secret>

# Database
DATABASE_URL: <your-database-url>
POSTGRES_PASSWORD: <your-postgres-password>
REDIS_URL: <your-redis-url>

# Email
SMTP_PASSWORD: <your-sendgrid-key>

# Monitoring
APPLICATION_INSIGHTS_CONNECTION_STRING: <your-app-insights-connection>
SENTRY_DSN: <your-sentry-dsn>
```

### 4. Environment Validation
The application includes environment validation. Ensure all required variables are set by checking:

1. **Local Development**: Create `.env.local` with development values
2. **Staging**: Verify in staging environment before production
3. **Production**: Use Azure Static Web Apps application settings

## Security Best Practices

### 1. Secret Rotation
- Rotate secrets every 90 days
- Use Azure Key Vault for sensitive secrets
- Monitor secret usage and access

### 2. Access Control
- Limit access to production environment variables
- Use Azure RBAC for fine-grained permissions
- Enable audit logging for configuration changes

### 3. Backup & Recovery
- Document all environment variables
- Keep encrypted backups of configuration
- Test disaster recovery procedures

## Testing Configuration

### Development Environment (.env.local)
```bash
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-not-for-production
JWT_SECRET=dev-jwt-secret
AZURE_OPENAI_API_KEY=<your-dev-openai-key>
CBD_BASE_URL=http://localhost:4180
ENABLE_ANALYTICS=false
RATE_LIMIT_ENABLED=false
```

### Staging Environment
```bash
NODE_ENV=staging
NEXTAUTH_URL=https://memorai-staging.azurestaticapps.net
# Use production-like values but separate instances
```

## Troubleshooting

### Common Issues:
1. **Authentication failures**: Check NEXTAUTH_SECRET and NEXTAUTH_URL
2. **Database connection errors**: Verify DATABASE_URL and credentials
3. **AI features not working**: Confirm Azure OpenAI configuration
4. **CORS errors**: Update CORS_ORIGINS with correct domains

### Verification Commands:
```bash
# Check if variables are loaded (run in production)
console.log('Environment check:', {
  nodeEnv: process.env.NODE_ENV,
  nextAuthUrl: process.env.NEXTAUTH_URL,
  hasOpenAIKey: !!process.env.AZURE_OPENAI_API_KEY,
  hasJwtSecret: !!process.env.JWT_SECRET
});
```

## Deployment Checklist

Before deploying to production:

- [ ] All secrets generated and stored securely
- [ ] Azure Static Web Apps application settings configured
- [ ] GitHub repository secrets added
- [ ] Environment validation passing
- [ ] Database connections tested
- [ ] OAuth providers configured and tested
- [ ] Email configuration verified
- [ ] Monitoring and analytics setup
- [ ] Security headers and CSP configured
- [ ] Rate limiting configured
- [ ] CORS origins updated for production domain

## Support

For environment configuration issues:
1. Check Azure Static Web Apps logs
2. Verify GitHub Actions deployment logs
3. Test individual service connections
4. Review security and compliance requirements

Remember: Never commit secrets to version control. Use environment variables for all sensitive configuration.