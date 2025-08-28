# GitHub Repository Secrets Setup Guide

This guide walks you through setting up the required GitHub repository secrets for MemorAI production deployment.

## 🔐 Required Secrets Configuration

### Step 1: Access Repository Settings

1. Go to your GitHub repository
2. Click on **Settings** tab
3. Navigate to **Secrets and variables** → **Actions**
4. Click **New repository secret**

### Step 2: Configure Required Secrets

#### Authentication & Security Secrets

**1. NEXTAUTH_SECRET**
- **Description**: Secret key for NextAuth.js session encryption
- **How to generate**: 
  ```bash
  openssl rand -base64 32
  ```
- **Example**: `Kf9sA2nD8jL4mP7qR3tY6wE9rT1uI5oP8sA3dF6gH9jK2lM5nP7qS0tV3wX6yZ9c`

**2. JWT_SECRET**
- **Description**: Secret key for JWT token signing and verification
- **How to generate**:
  ```bash
  openssl rand -base64 64
  ```
- **Example**: `A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8S9t0U1v2W3x4Y5z6A7b8C9d0E1f2G3h4I5j6K7l8M9n0`

**3. CSRF_SECRET**
- **Description**: Secret key for CSRF token generation
- **How to generate**:
  ```bash
  openssl rand -base64 32
  ```
- **Example**: `P9o8I7u6Y5t4R3e2W1q0A9s8D7f6G5h4J3k2L1z9X8c7V6b5N4m3Q2w1E0r9T8y7`

#### OAuth Configuration

**4. GOOGLE_CLIENT_ID**
- **Description**: Google OAuth 2.0 Client ID
- **How to get**: 
  1. Go to [Google Cloud Console](https://console.cloud.google.com/)
  2. Create a new project or select existing
  3. Enable Google+ API
  4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
  5. Set **Authorized redirect URIs**:
     - `https://memorai.azurestaticapps.net/api/auth/callback/google`
- **Example**: `123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com`

**5. GOOGLE_CLIENT_SECRET**
- **Description**: Google OAuth 2.0 Client Secret
- **How to get**: Generated when creating OAuth 2.0 Client ID (above)
- **Example**: `GOCSPX-abcdefghijklmnopqrstuvwxyz123456`

#### MemorAI API Configuration

**6. MEMORAI_API_KEY**
- **Description**: API key for MemorAI MCP service authentication
- **How to generate**: Use a secure random string generator
- **Example**: `memorai-prod-key-2025-A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6`

#### Azure Services

**7. AZURE_STATIC_WEB_APPS_API_TOKEN**
- **Description**: Deployment token for Azure Static Web Apps
- **How to get**:
  1. Go to [Azure Portal](https://portal.azure.com/)
  2. Create or navigate to your Static Web App
  3. Go to **Settings** → **Deployment tokens**
  4. Copy the deployment token
- **Example**: `1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5i6j7k8l9m0`

### Step 3: Configure Optional Secrets (Enhanced Functionality)

#### Monitoring & Analytics

**8. APPLICATIONINSIGHTS_CONNECTION_STRING**
- **Description**: Azure Application Insights connection string
- **How to get**: From Azure Application Insights resource
- **Example**: `InstrumentationKey=12345678-1234-1234-1234-123456789012;IngestionEndpoint=https://eastus-1.in.applicationinsights.azure.com/`

**9. SENTRY_DSN**
- **Description**: Sentry error tracking DSN
- **How to get**: From Sentry project settings
- **Example**: `https://abcdef123456789012345678901234567890@o123456.ingest.sentry.io/1234567`

#### Database Configuration

**10. DATABASE_URL**
- **Description**: PostgreSQL database connection string
- **Format**: `postgresql://username:password@host:port/database?sslmode=require`
- **Example**: `postgresql://memorai_admin:SecurePassword123@memorai-db.postgres.database.azure.com:5432/memorai_prod?sslmode=require`

## 🚀 Quick Setup Script

Use this PowerShell script to quickly set up all secrets:

```powershell
# Set GitHub repository secrets using GitHub CLI
gh secret set NEXTAUTH_SECRET --body "$(openssl rand -base64 32)"
gh secret set JWT_SECRET --body "$(openssl rand -base64 64)"
gh secret set CSRF_SECRET --body "$(openssl rand -base64 32)"
gh secret set MEMORAI_API_KEY --body "memorai-prod-key-2025-$(openssl rand -hex 16)"

# Set OAuth secrets (replace with your actual values)
gh secret set GOOGLE_CLIENT_ID --body "YOUR_GOOGLE_CLIENT_ID_HERE"
gh secret set GOOGLE_CLIENT_SECRET --body "YOUR_GOOGLE_CLIENT_SECRET_HERE"

# Set Azure deployment token (replace with your actual token)
gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN --body "YOUR_AZURE_STATIC_WEB_APPS_TOKEN_HERE"

# Optional: Set monitoring secrets
gh secret set APPLICATIONINSIGHTS_CONNECTION_STRING --body "YOUR_APP_INSIGHTS_CONNECTION_STRING_HERE"
gh secret set SENTRY_DSN --body "YOUR_SENTRY_DSN_HERE"
gh secret set DATABASE_URL --body "YOUR_DATABASE_URL_HERE"
```

## ✅ Verification Checklist

After setting up all secrets, verify your configuration:

- [ ] **NEXTAUTH_SECRET**: 32+ character secure string
- [ ] **JWT_SECRET**: 64+ character secure string  
- [ ] **CSRF_SECRET**: 32+ character secure string
- [ ] **GOOGLE_CLIENT_ID**: Valid Google OAuth Client ID
- [ ] **GOOGLE_CLIENT_SECRET**: Valid Google OAuth Client Secret
- [ ] **MEMORAI_API_KEY**: Secure API key for MemorAI service
- [ ] **AZURE_STATIC_WEB_APPS_API_TOKEN**: Valid Azure deployment token
- [ ] **APPLICATIONINSIGHTS_CONNECTION_STRING**: (Optional) Valid Azure Application Insights connection
- [ ] **SENTRY_DSN**: (Optional) Valid Sentry error tracking DSN
- [ ] **DATABASE_URL**: (Optional) Valid PostgreSQL connection string

## 🔒 Security Best Practices

1. **Never commit secrets to version control**
2. **Rotate secrets regularly** (every 90 days recommended)
3. **Use different secrets for each environment** (development, staging, production)
4. **Monitor secret usage** and set up alerts for unusual activity
5. **Use least-privilege access** - only grant necessary permissions
6. **Enable audit logging** for secret access and modifications

## 🚨 Emergency Secret Rotation

If a secret is compromised:

1. **Immediately rotate the compromised secret**
2. **Update the secret in GitHub repository settings**
3. **Trigger a new deployment** to use the updated secret
4. **Review audit logs** to understand the scope of compromise
5. **Monitor for any unauthorized access**

## 📞 Support

If you need help with secret configuration:

1. Check the [GitHub Actions documentation](https://docs.github.com/en/actions/reference/encrypted-secrets)
2. Review the [Azure Static Web Apps deployment guide](https://docs.microsoft.com/en-us/azure/static-web-apps/)
3. Contact the development team for environment-specific secrets

---

**⚠️ Important**: Keep this guide secure and only share with authorized team members who need access to production secrets.