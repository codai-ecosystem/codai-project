# MemorAI Environment Variables Setup - Complete Guide

This comprehensive guide covers everything you need to set up environment variables for MemorAI across all deployment environments.

## 🎯 Quick Start

For the fastest setup, follow these steps:

### 1. Local Development Setup

```powershell
# Clone and navigate to project
cd e:\GitHub\codai-project\apps\memorai

# Copy the existing development environment file
cp .env.local .env

# Verify your development environment
pwsh -ExecutionPolicy Bypass -File .\scripts\validate-environment.ps1 -Environment development
```

### 2. GitHub Secrets Setup (Production)

```powershell
# Install GitHub CLI if not installed
# winget install GitHub.cli

# Login to GitHub
gh auth login

# Set up all required secrets
gh secret set NEXTAUTH_SECRET --body "$(openssl rand -base64 32)"
gh secret set JWT_SECRET --body "$(openssl rand -base64 64)"  
gh secret set CSRF_SECRET --body "$(openssl rand -base64 32)"
gh secret set MEMORAI_API_KEY --body "memorai-prod-key-2025-$(openssl rand -hex 16)"

# Set OAuth secrets (get from Google Cloud Console)
gh secret set GOOGLE_CLIENT_ID --body "YOUR_GOOGLE_CLIENT_ID_HERE"
gh secret set GOOGLE_CLIENT_SECRET --body "YOUR_GOOGLE_CLIENT_SECRET_HERE"

# Set Azure deployment token (get from Azure Portal)
gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN --body "YOUR_AZURE_TOKEN_HERE"
```

### 3. Azure Static Web Apps Configuration

Use the automated setup script:

```powershell
# Set up production environment variables in Azure
pwsh -ExecutionPolicy Bypass -File .\scripts\setup-environment-variables.ps1 -Environment production -ResourceGroupName "memorai-resources" -StaticWebAppName "memorai-app"
```

## 📋 Environment-Specific Configuration

### Development Environment

**File**: `.env.local` (already configured)

```bash
NODE_ENV=development
NEXTAUTH_SECRET=memorai-nextauth-secret-2025-dev
NEXTAUTH_URL=http://localhost:4006
NEXT_PUBLIC_MEMORAI_MCP_URL=http://localhost:4950
NEXT_PUBLIC_MEMORAI_API_KEY=memorai-dev-key-2025
NEXT_PUBLIC_CBD_BASE_URL=http://localhost:4180
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Staging Environment

**Configuration Location**: Azure Static Web Apps Settings

```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://memorai-staging.azurestaticapps.net
NEXT_PUBLIC_API_BASE_URL=https://memorai-api-staging.azurestaticapps.net
NEXTAUTH_URL=https://memorai-staging.azurestaticapps.net
NEXT_PUBLIC_MEMORAI_MCP_URL=https://memorai-mcp-staging.azurestaticapps.net
NEXT_PUBLIC_CBD_BASE_URL=https://cbd-api-staging.azurestaticapps.net
DEBUG_MODE=false
VERBOSE_LOGGING=false
```

### Production Environment

**Configuration Location**: GitHub Secrets + Azure Static Web Apps

```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://memorai.azurestaticapps.net
NEXT_PUBLIC_API_BASE_URL=https://memorai-api.azurestaticapps.net
NEXTAUTH_URL=https://memorai.azurestaticapps.net
NEXT_PUBLIC_MEMORAI_MCP_URL=https://memorai-mcp.azurestaticapps.net
NEXT_PUBLIC_CBD_BASE_URL=https://cbd-api.azurestaticapps.net
NEXT_TELEMETRY_DISABLED=1
NODE_OPTIONS=--max-old-space-size=2048
```

## 🔐 Required Secrets by Environment

### Development (Optional OAuth)
- ✅ `NODE_ENV` - Set to "development"
- ✅ `NEXTAUTH_SECRET` - Any secure string (already set)
- ✅ `NEXTAUTH_URL` - http://localhost:4006 (already set)
- ⚪ `GOOGLE_CLIENT_ID` - Optional for OAuth testing
- ⚪ `GOOGLE_CLIENT_SECRET` - Optional for OAuth testing

### Production (All Required)
- ❗ `NEXTAUTH_SECRET` - Secure 32+ char string
- ❗ `JWT_SECRET` - Secure 64+ char string
- ❗ `CSRF_SECRET` - Secure 32+ char string
- ❗ `GOOGLE_CLIENT_ID` - Google OAuth Client ID
- ❗ `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret
- ❗ `MEMORAI_API_KEY` - MemorAI service API key
- ❗ `AZURE_STATIC_WEB_APPS_API_TOKEN` - Azure deployment token

### Optional (Enhanced Features)
- ⚪ `APPLICATIONINSIGHTS_CONNECTION_STRING` - Azure Application Insights
- ⚪ `SENTRY_DSN` - Error tracking
- ⚪ `DATABASE_URL` - PostgreSQL connection
- ⚪ `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics

## 🛠️ Setup Scripts

### 1. Environment Validation Script

```powershell
# Validate current environment
.\scripts\validate-environment.ps1 -Environment development

# Validate with service health checks
.\scripts\validate-environment.ps1 -Environment production -CheckServices

# Generate detailed report
.\scripts\validate-environment.ps1 -Environment production -GenerateReport
```

### 2. Azure Configuration Script

```powershell
# Set up production environment
.\scripts\setup-environment-variables.ps1 -Environment production

# Dry run (preview changes)
.\scripts\setup-environment-variables.ps1 -Environment production -DryRun

# Validate existing configuration
.\scripts\setup-environment-variables.ps1 -Environment production -Validate
```

## 🚀 Deployment Workflow

### Automated Deployment (Recommended)

The GitHub Actions workflow (`.github/workflows/memorai-deploy.yml`) automatically:

1. ✅ Builds the application with production environment variables
2. ✅ Runs comprehensive tests
3. ✅ Performs security scans
4. ✅ Deploys to Azure Static Web Apps
5. ✅ Validates deployment health

### Manual Deployment Steps

If you need to deploy manually:

1. **Set up GitHub secrets** (see `GITHUB_SECRETS_SETUP_GUIDE.md`)
2. **Configure Azure resources** using the setup script
3. **Validate environment** using the validation script
4. **Deploy via GitHub Actions** or Azure CLI

## 🔍 Troubleshooting

### Common Issues

**❌ "Environment variable not found"**
- Solution: Run the validation script to identify missing variables
- Command: `.\scripts\validate-environment.ps1 -Environment production`

**❌ "OAuth configuration invalid"**
- Solution: Verify Google Cloud Console settings
- Check: Authorized redirect URIs include your domain

**❌ "Deployment token invalid"**
- Solution: Regenerate Azure Static Web Apps deployment token
- Location: Azure Portal > Static Web App > Settings > Deployment tokens

### Validation Commands

```powershell
# Check all environment variables
.\scripts\validate-environment.ps1 -Environment production

# Test service endpoints
.\scripts\validate-environment.ps1 -Environment production -CheckServices

# Generate diagnostic report
.\scripts\validate-environment.ps1 -Environment production -GenerateReport
```

### Debug Mode

Enable verbose logging for debugging:

```powershell
$env:DEBUG_MODE = "true"
$env:VERBOSE_LOGGING = "true"
.\scripts\validate-environment.ps1 -Environment development
```

## 📞 Support Resources

### Documentation Files
- 📖 `GITHUB_SECRETS_SETUP_GUIDE.md` - GitHub secrets configuration
- 📖 `.env.azure-production` - Production environment template
- 📖 `PRODUCTION_DEPLOYMENT_GUIDE.md` - Complete deployment guide

### Scripts
- 🔧 `setup-environment-variables.ps1` - Azure environment setup
- 🔍 `validate-environment.ps1` - Environment validation
- 🚀 `memorai-deploy.yml` - CI/CD pipeline

### External Resources
- [Azure Static Web Apps Documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [Google OAuth Setup Guide](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration)

## ✅ Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] All GitHub secrets are configured
- [ ] Azure Static Web Apps resource is created
- [ ] Google OAuth is configured with correct redirect URIs
- [ ] Environment validation script passes
- [ ] CI/CD pipeline runs successfully
- [ ] Service health endpoints are accessible
- [ ] Monitoring and error tracking are configured

---

**🎉 You're ready for production deployment!**

Run the final validation:
```powershell
.\scripts\validate-environment.ps1 -Environment production -CheckServices -GenerateReport
```

If all checks pass, proceed with deployment using the CI/CD pipeline.