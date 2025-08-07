#!/usr/bin/env pwsh
# Deploy SimpleAuthenticator to Live CBD Service

Write-Host "🚀 Deploying SimpleAuthenticator to Live CBD Service" -ForegroundColor Cyan
Write-Host "Target: https://cbd.memorai.ro" -ForegroundColor Yellow

# Step 1: Prepare deployment package
Write-Host "`n📦 Preparing deployment package..." -ForegroundColor Green
$deployDir = "E:\GitHub\codai-project\deployment\cbd-auth-update"
if (Test-Path $deployDir) {
    Remove-Item $deployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deployDir -Force | Out-Null

# Copy essential files
$sourceDir = "E:\GitHub\codai-project\packages\cbd"
Copy-Item "$sourceDir\src\auth\SimpleAuthenticator.ts" "$deployDir\" -Force
Copy-Item "$sourceDir\src\CBDUniversalService.ts" "$deployDir\" -Force
Copy-Item "$sourceDir\package.json" "$deployDir\" -Force

Write-Host "✅ Files prepared for deployment" -ForegroundColor Green

# Step 2: Create deployment instructions
$instructionsFile = "$deployDir\DEPLOYMENT_INSTRUCTIONS.md"
@"
# CBD Authentication System Update

## Files to Deploy

1. **SimpleAuthenticator.ts** → Replace broken EnterpriseSecurityOrchestrator
2. **CBDUniversalService.ts** → Updated to use SimpleAuthenticator
3. **package.json** → Dependencies for bcrypt and jsonwebtoken

## Deployment Steps

### Option A: Direct File Replacement
1. Replace `/src/security/EnterpriseSecurityOrchestrator.ts` with `SimpleAuthenticator.ts`
2. Update `/src/CBDUniversalService.ts` with new version
3. Install dependencies: `npm install bcrypt jsonwebtoken`
4. Restart CBD service

### Option B: Environment Variable Update
1. Set `USE_SIMPLE_AUTH=true` environment variable
2. Deploy SimpleAuthenticator alongside existing files
3. Restart CBD service

## Test Authentication

```bash
curl -X POST https://cbd.memorai.ro/api/security/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@codai.ro","password":"admin123"}'
```

Expected Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {"email": "admin@codai.ro", "role": "admin"}
}
```

## Admin Credentials
- **Email**: admin@codai.ro
- **Password**: admin123
- **Hash**: `$2b$10$rIc.../` (bcrypt)

## Verification Endpoints
- `/api/security/auth/login` - Authentication
- `/api/security/auth/verify` - Token verification
- `/api/security/health` - Security health check
- `/api/ecosystem/projects` - Project management (requires auth)
"@ | Out-File $instructionsFile -Encoding UTF8

Write-Host "✅ Deployment instructions created" -ForegroundColor Green

# Step 3: Test local authentication before deployment
Write-Host "`n🧪 Testing local authentication..." -ForegroundColor Blue
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4180/api/security/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"admin@codai.ro","password":"admin123"}' -TimeoutSec 10
    Write-Host "✅ Local authentication working:" -ForegroundColor Green
    Write-Host "  Token: $($response.token.Substring(0,20))..." -ForegroundColor White
    Write-Host "  User: $($response.user.email)" -ForegroundColor White
} catch {
    Write-Host "❌ Local authentication failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Check live CBD current status
Write-Host "`n🔍 Checking live CBD current status..." -ForegroundColor Blue
try {
    $response = Invoke-RestMethod -Uri "https://cbd.memorai.ro/health" -Method Get -TimeoutSec 10
    Write-Host "✅ Live CBD service healthy:" -ForegroundColor Green
    Write-Host "  Status: $($response.status)" -ForegroundColor White
    Write-Host "  Version: $($response.version)" -ForegroundColor White
} catch {
    Write-Host "❌ Live CBD health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 5: Test live authentication (will fail - that's expected)
Write-Host "`n🔍 Testing live authentication (expected to fail)..." -ForegroundColor Blue
try {
    $response = Invoke-RestMethod -Uri "https://cbd.memorai.ro/api/security/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"admin@codai.ro","password":"admin123"}' -TimeoutSec 10
    Write-Host "✅ Live authentication already working!" -ForegroundColor Green
} catch {
    Write-Host "❌ Live authentication failed (expected): $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "   This is why we need to deploy the fix" -ForegroundColor Yellow
}

Write-Host "`n📋 Deployment Summary:" -ForegroundColor Cyan
Write-Host "  📁 Files ready: $deployDir" -ForegroundColor White
Write-Host "  📄 Instructions: $instructionsFile" -ForegroundColor White
Write-Host "  🎯 Target: https://cbd.memorai.ro" -ForegroundColor White
Write-Host "  🔑 Admin: admin@codai.ro / admin123" -ForegroundColor White

Write-Host "`n🚀 Next Steps:" -ForegroundColor Green
Write-Host "  1. Deploy SimpleAuthenticator to live CBD service" -ForegroundColor White
Write-Host "  2. Test authentication at https://cbd.memorai.ro" -ForegroundColor White
Write-Host "  3. Configure Hub to use authenticated CBD" -ForegroundColor White
Write-Host "  4. Validate end-to-end integration" -ForegroundColor White
