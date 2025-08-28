# GitHub Repository Secrets Configuration Guide

This document describes all the GitHub repository secrets that need to be configured for the MemorAI CI/CD pipeline.

## Setting Up Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions  
3. Click "New repository secret" for each secret below

## Required Repository Secrets

### Azure Deployment
```
AZURE_STATIC_WEB_APPS_API_TOKEN
Description: API token for Azure Static Web Apps deployment
How to get: Azure Portal → Static Web Apps → Your App → Manage deployment token
```

### Authentication & Security
```
NEXTAUTH_SECRET
Description: Secret key for NextAuth.js session encryption
How to generate: openssl rand -base64 32
Example: Use the generated random string
```

```
JWT_SECRET
Description: Secret key for JWT token signing
How to generate: openssl rand -base64 64
Example: Use the generated random string
```

```
API_KEY_ENCRYPTION_KEY
Description: Key for encrypting stored API keys
How to generate: openssl rand -hex 32
Example: Use the generated random string
```

### Azure OpenAI
```
AZURE_OPENAI_ENDPOINT
Description: Azure OpenAI service endpoint URL
Example: https://swedencentral.api.cognitive.microsoft.com/
```

```
AZURE_OPENAI_API_KEY
Description: API key for Azure OpenAI service
How to get: Azure Portal → Cognitive Services → Your OpenAI resource → Keys and Endpoint
```

```
AZURE_OPENAI_DEPLOYMENT_NAME
Description: Name of your text embedding deployment
Example: text-embedding-3-large
```

```
AZURE_OPENAI_GPT_DEPLOYMENT_NAME
Description: Name of your GPT model deployment
Example: gpt-4o
```

### Database Configuration
```
CBD_BASE_URL
Description: Base URL for CBD database service
Example: https://cbd-production.azurecontainerapps.io
```

```
CBD_API_KEY
Description: API key for CBD database access
How to get: From your CBD service configuration
```

```
DATABASE_URL
Description: PostgreSQL connection string for production
Example: postgresql://username:password@host:5432/memorai_production
```

```
REDIS_URL
Description: Redis connection string for caching
Example: redis://username:password@host:6379
```

### OAuth Providers
```
GOOGLE_CLIENT_ID
Description: Google OAuth client ID
How to get: Google Cloud Console → APIs & Services → Credentials
```

```
GOOGLE_CLIENT_SECRET
Description: Google OAuth client secret
How to get: Google Cloud Console → APIs & Services → Credentials
```

### Email & Notifications
```
SMTP_PASSWORD
Description: SMTP password for SendGrid or email service
How to get: SendGrid → API Keys (use API key as password)
```

```
FROM_EMAIL
Description: Email address for system notifications
Example: noreply@memorai.com
```

### Monitoring & Analytics
```
APPLICATION_INSIGHTS_CONNECTION_STRING
Description: Azure Application Insights connection string
How to get: Azure Portal → Application Insights → Your resource → Connection String
```

```
SENTRY_DSN
Description: Sentry error tracking DSN (optional)
How to get: Sentry → Settings → Projects → Your project → Client Keys
```

```
GA_ID
Description: Google Analytics measurement ID (optional)
Example: G-XXXXXXXXXX
```

### Security & Compliance
```
RATE_LIMIT_MAX_REQUESTS
Description: Maximum requests per window for rate limiting
Example: 100
```

```
CORS_ORIGINS
Description: Allowed CORS origins for production
Example: https://memorai.azurestaticapps.net,https://memorai.com
```

### File Storage (Optional)
```
AZURE_STORAGE_ACCOUNT_NAME
Description: Azure storage account name for file uploads
How to get: Azure Portal → Storage Accounts → Your account
```

```
AZURE_STORAGE_ACCOUNT_KEY
Description: Azure storage account access key
How to get: Azure Portal → Storage Accounts → Your account → Access keys
```

### Backup & Recovery
```
BACKUP_STORAGE_URL
Description: URL for backup storage location
Example: Azure blob storage URL or other backup service
```

## Environment-Specific Configuration

### Production Environment Variables (Azure Static Web Apps)
Set these in Azure Portal → Static Web Apps → Your app → Configuration:

```bash
# Core Application
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production

# Authentication
NEXTAUTH_URL=https://memorai.azurestaticapps.net

# Feature Flags
ENABLE_AI_SEARCH=true
ENABLE_COLLABORATION=true
ENABLE_ANALYTICS=true
RATE_LIMIT_ENABLED=true
CSP_ENABLED=true
SECURITY_HEADERS_ENABLED=true

# Compliance
GDPR_ENABLED=true
DATA_RETENTION_DAYS=365
COOKIE_CONSENT_REQUIRED=true
```

## Security Best Practices

1. **Never commit secrets to version control**
2. **Use different secrets for development and production**
3. **Regularly rotate secrets (especially API keys)**
4. **Use Azure Key Vault for highly sensitive secrets**
5. **Monitor secret usage and access logs**
6. **Use least-privilege principle for API keys**

## Validation Commands

After setting up secrets, validate your configuration:

```bash
# Check GitHub secrets are set
gh secret list

# Test deployment pipeline
gh workflow run memorai-deploy.yml

# Validate production environment
curl -f https://memorai.azurestaticapps.net/api/health
```

## Troubleshooting

### Common Issues

1. **Deployment fails with authentication error**
   - Check AZURE_STATIC_WEB_APPS_API_TOKEN is correct
   - Regenerate token if needed

2. **NextAuth callback errors**
   - Verify NEXTAUTH_SECRET is set
   - Check NEXTAUTH_URL matches deployed domain

3. **Azure OpenAI connection issues**
   - Validate AZURE_OPENAI_API_KEY
   - Check deployment names match Azure resources
   - Verify endpoint URL is correct

4. **Database connection failures**
   - Test DATABASE_URL connection string
   - Check firewall rules for production database
   - Verify SSL certificates if using SSL

### Testing Secrets

Use GitHub Actions workflow to test secret configuration:

```yaml
name: Test Secrets
on:
  workflow_dispatch:
jobs:
  test-secrets:
    runs-on: ubuntu-latest
    steps:
      - name: Test Azure OpenAI
        run: |
          curl -H "api-key: ${{ secrets.AZURE_OPENAI_API_KEY }}" \
               "${{ secrets.AZURE_OPENAI_ENDPOINT }}/openai/deployments?api-version=2024-02-01"
      
      - name: Test JWT Secret
        run: |
          echo "JWT secret length: ${#JWT_SECRET}"
        env:
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

## Secret Rotation Schedule

Recommend rotating secrets according to this schedule:

- **Monthly**: API keys, JWT secrets, encryption keys
- **Quarterly**: OAuth client secrets, database passwords
- **Yearly**: Certificates, long-term storage keys
- **Immediately**: Any compromised secrets

## Emergency Response

If secrets are compromised:

1. **Immediately** rotate the compromised secret
2. Update GitHub repository secrets
3. Update Azure Static Web Apps configuration  
4. Redeploy application to use new secrets
5. Monitor logs for unauthorized access
6. Review security audit logs
7. Document incident for future prevention

## Contact

For questions about secret configuration:
- Development Team: dev@memorai.com
- Security Team: security@memorai.com
- Emergency: emergency@memorai.com