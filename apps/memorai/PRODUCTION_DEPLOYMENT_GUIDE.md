# 🚀 MemorAI Production Deployment Guide

## Overview

This document provides comprehensive instructions for deploying MemorAI to production using Azure Static Web Apps with enterprise-grade security, monitoring, and performance optimizations.

## 🏗️ Architecture Overview

### Deployment Stack
- **Frontend**: Next.js 15.4.1 with App Router (Static Site Generation + Server-Side Rendering)
- **Hosting**: Azure Static Web Apps with hybrid rendering support
- **API Backend**: CBD v1.0.10 (Container-Based Database) + MemorAI MCP Server
- **Authentication**: NextAuth.js v5 with Credentials + Google OAuth
- **Database**: PostgreSQL with Redis caching layer
- **Security**: OWASP-compliant security framework with CSP, rate limiting, input sanitization
- **Monitoring**: Azure Application Insights + custom security monitoring
- **Internationalization**: English and Romanian language support

### Security Features
✅ Content Security Policy (CSP) with environment-specific configurations  
✅ Rate limiting with sliding window algorithm  
✅ CSRF protection with token-based validation  
✅ Input sanitization and XSS protection  
✅ SQL injection prevention  
✅ Security event logging and threat detection  
✅ OWASP Top 10 compliance  

## 🛠️ Prerequisites

### Required Azure Resources
1. **Azure Static Web Apps** - Primary hosting platform
2. **Azure Application Insights** - Performance and error monitoring
3. **Azure Container Registry** (optional) - For custom container images
4. **Azure Key Vault** - Secret management
5. **Azure PostgreSQL** - Production database
6. **Azure Redis Cache** - Caching layer

### Required Environment Variables

#### Production Environment Variables
```bash
# Application Configuration
NEXT_PUBLIC_APP_URL=https://memorai.azurestaticapps.net
NEXTAUTH_SECRET=<generate-secure-secret>
NEXTAUTH_URL=https://memorai.azurestaticapps.net
NODE_ENV=production

# Database Configuration
CBD_BASE_URL=https://cbd-api.azurewebsites.net
DATABASE_URL=postgresql://user:password@postgres.azure.com:5432/memorai_prod
REDIS_URL=redis://memorai-redis.redis.cache.windows.net:6380

# Authentication Providers
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>

# AI Services
AZURE_OPENAI_API_KEY=<azure-openai-api-key>
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
AZURE_OPENAI_API_VERSION=2024-02-01

# Monitoring
APPLICATIONINSIGHTS_CONNECTION_STRING=<azure-app-insights-connection-string>

# Security
CSRF_SECRET=<generate-secure-csrf-secret>
ENCRYPTION_KEY=<generate-secure-encryption-key>

# Rate Limiting
RATE_LIMIT_REDIS_URL=<redis-url-for-rate-limiting>
```

#### Staging Environment Variables
```bash
# Application Configuration
NEXT_PUBLIC_APP_URL=https://memorai-staging.azurestaticapps.net
NEXTAUTH_SECRET=<staging-secret>
NEXTAUTH_URL=https://memorai-staging.azurestaticapps.net
NODE_ENV=test

# Database Configuration (use staging resources)
CBD_BASE_URL=https://cbd-api-staging.azurewebsites.net
DATABASE_URL=postgresql://user:password@postgres-staging.azure.com:5432/memorai_staging
REDIS_URL=redis://memorai-redis-staging.redis.cache.windows.net:6380

# Other variables same as production but with staging values
```

## 📦 Pre-Deployment Steps

### 1. Build and Test Locally
```bash
# Install dependencies
pnpm install

# Run all tests
pnpm test
pnpm test:e2e

# Build production bundle
pnpm build

# Analyze bundle size
pnpm analyze

# Run security audit
pnpm audit

# Verify no TypeScript errors
pnpm type-check
```

### 2. Environment Configuration Validation
```bash
# Validate all required environment variables
node -e "
const { validateEnvironmentConfig } = require('./src/lib/security/config.ts');
const result = validateEnvironmentConfig();
if (!result.valid) {
  console.error('Environment validation failed:', result.errors);
  process.exit(1);
}
console.log('✅ Environment configuration is valid');
"
```

### 3. Security Configuration Verification
```bash
# Test security headers
node -e "
const { getSecurityConfig } = require('./src/lib/security/config.ts');
const config = getSecurityConfig();
console.log('Security configuration:', config);
"

# Test rate limiting configuration
node -e "
const { getRateLimitConfig } = require('./src/lib/security/config.ts');
const config = getRateLimitConfig();
console.log('Rate limit configuration:', config);
"
```

## 🚀 Deployment Process

### Option 1: GitHub Actions Deployment (Recommended)

#### 1. Create GitHub Action Workflow
```yaml
# .github/workflows/azure-static-web-apps.yml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests
        run: pnpm test

      - name: Run TypeScript check
        run: pnpm type-check

      - name: Run security audit
        run: pnpm audit

      - name: Build application
        run: pnpm build
        env:
          NEXT_PUBLIC_APP_URL: ${{ secrets.NEXT_PUBLIC_APP_URL }}
          
      - name: Deploy to Azure Static Web Apps
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/apps/memorai"
          api_location: ""
          output_location: "out"
        env:
          NEXT_PUBLIC_APP_URL: ${{ secrets.NEXT_PUBLIC_APP_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
          NEXTAUTH_URL: ${{ secrets.NEXTAUTH_URL }}
          CBD_BASE_URL: ${{ secrets.CBD_BASE_URL }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          REDIS_URL: ${{ secrets.REDIS_URL }}
          GOOGLE_CLIENT_ID: ${{ secrets.GOOGLE_CLIENT_ID }}
          GOOGLE_CLIENT_SECRET: ${{ secrets.GOOGLE_CLIENT_SECRET }}
          AZURE_OPENAI_API_KEY: ${{ secrets.AZURE_OPENAI_API_KEY }}
          AZURE_OPENAI_ENDPOINT: ${{ secrets.AZURE_OPENAI_ENDPOINT }}
          APPLICATIONINSIGHTS_CONNECTION_STRING: ${{ secrets.APPLICATIONINSIGHTS_CONNECTION_STRING }}

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

#### 2. Configure GitHub Secrets
Navigate to your GitHub repository → Settings → Secrets and add:
- `AZURE_STATIC_WEB_APPS_API_TOKEN`
- `NEXT_PUBLIC_APP_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `CBD_BASE_URL`
- `DATABASE_URL`
- `REDIS_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_ENDPOINT`
- `APPLICATIONINSIGHTS_CONNECTION_STRING`

### Option 2: Azure CLI Deployment

#### 1. Install Azure CLI
```bash
# Windows
winget install Microsoft.AzureCLI

# macOS
brew install azure-cli

# Linux
curl -sL https://aka.ms/InstallAzureCLI | sudo bash
```

#### 2. Deploy Using SWA CLI
```bash
# Install Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

# Login to Azure
az login

# Build the application
pnpm build

# Deploy to Azure Static Web Apps
swa deploy ./out --env production
```

## 🔧 Post-Deployment Configuration

### 1. Domain Configuration
```bash
# Configure custom domain
az staticwebapp hostname set \
  --name memorai-prod \
  --resource-group memorai-rg \
  --hostname memorai.com
```

### 2. SSL Certificate Setup
```bash
# Enable SSL certificate
az staticwebapp hostname bind \
  --name memorai-prod \
  --resource-group memorai-rg \
  --hostname memorai.com \
  --validation-method cname-delegation
```

### 3. Monitoring Configuration
```bash
# Configure Application Insights
az monitor app-insights component create \
  --app memorai-insights \
  --location eastus \
  --resource-group memorai-rg \
  --application-type web
```

## 📊 Production Monitoring

### Health Check Endpoints
- `https://memorai.com/api/health` - Application health status
- `https://memorai.com/api/security/status` - Security system status
- `https://memorai.com/api/monitoring/metrics` - Performance metrics

### Key Metrics to Monitor
1. **Performance Metrics**
   - Page load times (Target: < 3 seconds)
   - Core Web Vitals scores
   - API response times (Target: < 500ms)
   - Error rates (Target: < 1%)

2. **Security Metrics**
   - Failed authentication attempts
   - Rate limit violations
   - CSRF token failures
   - Blocked malicious requests

3. **Business Metrics**
   - User registrations
   - Memory creation/retrieval rates
   - Search query performance
   - User session duration

### Alerting Rules
```yaml
# Azure Monitor Alert Rules
- name: "High Error Rate"
  condition: "requests/failed > 5% over 5 minutes"
  action: "Send email to ops team"

- name: "Security Threats Detected"
  condition: "securityEvents/severity >= high"
  action: "Send immediate notification"

- name: "Performance Degradation"
  condition: "requests/duration > 3000ms over 10 minutes"
  action: "Scale up resources"
```

## 🔄 Backup and Recovery

### Database Backup Strategy
```bash
# Automated daily backups
az postgres flexible-server backup create \
  --resource-group memorai-rg \
  --name memorai-postgres-prod \
  --backup-name daily-$(date +%Y%m%d)
```

### Disaster Recovery Plan
1. **RTO (Recovery Time Objective)**: 4 hours
2. **RPO (Recovery Point Objective)**: 1 hour
3. **Backup retention**: 30 days for daily, 12 months for monthly

### Recovery Procedures
```bash
# Restore from backup
az postgres flexible-server restore \
  --resource-group memorai-rg \
  --name memorai-postgres-restored \
  --source-server memorai-postgres-prod \
  --restore-time "2024-01-15T10:00:00Z"

# Redeploy application
swa deploy ./out --env production
```

## 🚨 Incident Response

### Severity Levels
- **P0 (Critical)**: Complete service outage
- **P1 (High)**: Major functionality unavailable
- **P2 (Medium)**: Minor functionality issues
- **P3 (Low)**: Performance degradation

### Response Procedures
1. **Incident Detection**: Automated monitoring alerts
2. **Initial Response**: Acknowledge within 15 minutes
3. **Investigation**: Root cause analysis
4. **Resolution**: Apply fix and verify
5. **Post-Incident**: Review and improvement plan

## 🔐 Security Hardening Checklist

### Pre-Production Security Review
- [ ] All environment variables secured in Azure Key Vault
- [ ] OWASP security headers implemented and tested
- [ ] Rate limiting configured for all API endpoints
- [ ] CSRF protection enabled on all forms
- [ ] Input validation implemented for all user inputs
- [ ] SQL injection prevention verified
- [ ] XSS protection tested
- [ ] Authentication flow security tested
- [ ] Authorization rules verified
- [ ] Security event logging enabled
- [ ] Threat detection configured
- [ ] SSL/TLS certificates validated
- [ ] Security scanning completed (no high/critical vulnerabilities)

### Production Security Monitoring
- [ ] Security dashboard accessible to ops team
- [ ] Security event alerts configured
- [ ] Threat detection rules active
- [ ] Audit logging enabled
- [ ] Compliance reporting automated
- [ ] Security incident response plan ready
- [ ] Regular security assessments scheduled

## 📋 Maintenance Procedures

### Regular Maintenance Tasks
- **Daily**: Monitor health checks and security alerts
- **Weekly**: Review performance metrics and error logs
- **Monthly**: Security assessment and dependency updates
- **Quarterly**: Disaster recovery testing and compliance audit

### Update Procedures
```bash
# Update dependencies
pnpm update

# Run security audit
pnpm audit

# Test in staging environment
pnpm build && pnpm test

# Deploy to production
swa deploy ./out --env production
```

## 📞 Support and Troubleshooting

### Common Issues and Solutions

#### 1. Build Failures
```bash
# Check build logs
swa logs --deployment-id <deployment-id>

# Common fixes
pnpm install --frozen-lockfile
pnpm build --verbose
```

#### 2. Authentication Issues
```bash
# Verify environment variables
echo $NEXTAUTH_SECRET
echo $NEXTAUTH_URL

# Check provider configuration
curl -X GET https://memorai.com/api/auth/providers
```

#### 3. Performance Issues
```bash
# Check Application Insights
az monitor app-insights query \
  --app memorai-insights \
  --analytics-query "requests | summarize avg(duration) by bin(timestamp, 5m)"
```

### Emergency Contacts
- **Primary On-Call**: DevOps Engineer
- **Secondary On-Call**: Senior Developer  
- **Escalation**: Engineering Manager
- **Security Issues**: Security Team Lead

### Support Resources
- **Documentation**: `/docs` directory in repository
- **Runbooks**: `/runbooks` directory
- **Monitoring Dashboard**: Azure Portal + Custom Security Dashboard
- **Log Analysis**: Azure Application Insights + Custom audit logs

---

## ✅ Deployment Success Validation

After deployment, verify the following:

1. **Application Loading**: https://memorai.com loads successfully
2. **Health Checks**: All health endpoints return 200 OK
3. **Authentication**: Login/registration flow works
4. **Core Functionality**: Memory CRUD operations work
5. **Performance**: Page load times < 3 seconds
6. **Security**: Security headers present in responses
7. **Monitoring**: Application Insights receiving data
8. **Internationalization**: Language switching works (EN/RO)
9. **Responsive Design**: Mobile and desktop layouts render correctly
10. **SSL Certificate**: HTTPS enabled with valid certificate

## 🎯 Success Criteria

✅ **Zero Downtime Deployment**: Blue-green deployment strategy  
✅ **Performance Targets**: < 3s load time, > 95% uptime  
✅ **Security Standards**: OWASP Top 10 compliance, A+ SSL rating  
✅ **Monitoring Coverage**: 100% endpoint monitoring, real-time alerts  
✅ **Backup Strategy**: Automated daily backups, tested recovery procedures  
✅ **Documentation**: Complete operational and incident response documentation  

---

**Deployment Complete**: MemorAI is now production-ready with enterprise-grade security, performance, and monitoring! 🚀