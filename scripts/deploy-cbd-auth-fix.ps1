#!/usr/bin/env pwsh

# CBD SimpleAuthenticator Deployment Fix
# Updates the live CBD service with SimpleAuthenticator to fix authentication issues

param(
    [switch]$DryRun,
    [switch]$LocalTest,
    [string]$Environment = "production"
)

$ErrorActionPreference = "Stop"

Write-Host "🔧 CBD SimpleAuthenticator Deployment Fix" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Configuration
$CBD_SERVICE_URL = "https://cbd.memorai.ro"
$LOCAL_CBD_PORT = "4180"

# Check if SimpleAuthenticator is present
Write-Host "🔍 Verifying SimpleAuthenticator implementation..." -ForegroundColor Yellow
$authFile = "packages/cbd/src/auth/SimpleAuthenticator.ts"
if (-not (Test-Path $authFile)) {
    Write-Host "❌ SimpleAuthenticator.ts not found. Please ensure it's created first." -ForegroundColor Red
    exit 1
}

# Check if CBD service is updated to use SimpleAuthenticator
$cbdServiceFile = "packages/cbd/src/CBDUniversalService.ts"
$cbdContent = Get-Content $cbdServiceFile -Raw
if ($cbdContent -notmatch "SimpleAuthenticator") {
    Write-Host "❌ CBDUniversalService.ts not updated to use SimpleAuthenticator" -ForegroundColor Red
    exit 1
}

Write-Host "✅ SimpleAuthenticator implementation verified" -ForegroundColor Green

# Build the CBD service
Write-Host "🏗️ Building CBD service with SimpleAuthenticator..." -ForegroundColor Yellow
Push-Location "packages/cbd"
try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed"
    }
    Write-Host "✅ CBD service built successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Build failed: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}

if ($LocalTest) {
    Write-Host "🧪 Starting local test server..." -ForegroundColor Yellow
    
    # Start local CBD server for testing
    Push-Location "packages/cbd"
    try {
        $env:PORT = $LOCAL_CBD_PORT
        $env:NODE_ENV = "development"
        $env:CBD_LOG_LEVEL = "info"
        
        Start-Process -FilePath "node" -ArgumentList "dist/start.js" -WindowStyle Hidden
        Start-Sleep -Seconds 5
        
        # Test authentication
        Write-Host "🔐 Testing authentication endpoints..." -ForegroundColor Yellow
        
        $testLogin = @{
            username = "admin@codai.ro"
            password = "admin123"
        } | ConvertTo-Json
        
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:$LOCAL_CBD_PORT/security/auth/login" -Method POST -Body $testLogin -ContentType "application/json"
            
            if ($response.success) {
                Write-Host "✅ Local authentication test passed!" -ForegroundColor Green
                Write-Host "User: $($response.user.username)" -ForegroundColor White
                Write-Host "Role: $($response.user.role)" -ForegroundColor White
                Write-Host "Token: $($response.token.substring(0,20))..." -ForegroundColor White
            } else {
                Write-Host "❌ Local authentication test failed: $($response.error)" -ForegroundColor Red
                exit 1
            }
        } catch {
            Write-Host "❌ Local authentication test error: $_" -ForegroundColor Red
            exit 1
        }
        
        # Clean up test server
        Get-Process | Where-Object { $_.ProcessName -eq "node" -and $_.Id -ne $PID } | Stop-Process -Force
        
    } catch {
        Write-Host "❌ Test cleanup error: $_" -ForegroundColor Red
    } finally {
        Pop-Location
    }
    
    Write-Host "✅ Local testing completed successfully" -ForegroundColor Green
}

if ($DryRun) {
    Write-Host "🔍 DRY RUN - No actual deployment performed" -ForegroundColor Cyan
    Write-Host "Would deploy SimpleAuthenticator to: $CBD_SERVICE_URL" -ForegroundColor Cyan
    exit 0
}

# Check if we're ready for production deployment
Write-Host "🚀 Preparing production deployment..." -ForegroundColor Yellow

# Check current live service status
try {
    $healthCheck = Invoke-RestMethod -Uri "$CBD_SERVICE_URL/health" -TimeoutSec 10
    Write-Host "📊 Current service status:" -ForegroundColor White
    Write-Host "  Version: $($healthCheck.version)" -ForegroundColor White
    Write-Host "  Status: $($healthCheck.status)" -ForegroundColor White
    Write-Host "  Security: $($healthCheck.security.status)" -ForegroundColor White
} catch {
    Write-Host "⚠️ Cannot connect to live service: $_" -ForegroundColor Yellow
}

# Test current broken authentication
Write-Host "🔍 Testing current broken authentication..." -ForegroundColor Yellow
$testAuth = @{
    username = "admin@codai.ro"
    password = "admin123"
} | ConvertTo-Json

try {
    $currentAuth = Invoke-RestMethod -Uri "$CBD_SERVICE_URL/security/auth/login" -Method POST -Body $testAuth -ContentType "application/json"
    if ($currentAuth.success) {
        Write-Host "⚠️ Current authentication is working - deployment may not be needed" -ForegroundColor Yellow
        Read-Host "Press Enter to continue anyway or Ctrl+C to cancel"
    } else {
        Write-Host "❌ Current authentication broken as expected: $($currentAuth.error)" -ForegroundColor Red
        Write-Host "✅ Deployment needed to fix authentication" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Current authentication endpoint error: $_" -ForegroundColor Red
    Write-Host "✅ Deployment needed to fix authentication" -ForegroundColor Green
}

Write-Host "`n🚨 PRODUCTION DEPLOYMENT READY" -ForegroundColor Red
Write-Host "This will update the live CBD service at $CBD_SERVICE_URL" -ForegroundColor Red
Write-Host "SimpleAuthenticator will replace EnterpriseSecurityOrchestrator" -ForegroundColor Red

$confirmation = Read-Host "`nProceed with production deployment? (type 'deploy' to confirm)"
if ($confirmation -ne "deploy") {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Red
    exit 1
}

# Here would be the actual deployment steps
# Since this is a live service, we'd need to:
# 1. Build a new Docker image with SimpleAuthenticator
# 2. Push to container registry
# 3. Update the running service
# 4. Verify the update

Write-Host "📝 DEPLOYMENT INSTRUCTIONS:" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Manual steps required for live service update:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Build Docker image:" -ForegroundColor White
Write-Host "   docker build -t codai-cbd-fixed ./packages/cbd" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Tag for registry:" -ForegroundColor White
Write-Host "   docker tag codai-cbd-fixed:latest your-registry/codai-cbd:fixed" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Push to registry:" -ForegroundColor White
Write-Host "   docker push your-registry/codai-cbd:fixed" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Update live service (depends on your deployment method):" -ForegroundColor White
Write-Host "   - AWS ECS: Update task definition and service" -ForegroundColor Gray
Write-Host "   - Kubernetes: kubectl set image deployment/cbd-service cbd=your-registry/codai-cbd:fixed" -ForegroundColor Gray
Write-Host "   - Docker Compose: docker-compose up -d cbd" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Verify fix:" -ForegroundColor White
Write-Host "   curl -X POST $CBD_SERVICE_URL/security/auth/login \" -ForegroundColor Gray
Write-Host "        -H 'Content-Type: application/json' \" -ForegroundColor Gray
Write-Host "        -d '{\"username\": \"admin@codai.ro\", \"password\": \"admin123\"}'" -ForegroundColor Gray
Write-Host ""

# Create deployment verification script
$verifyScript = @"
#!/usr/bin/env pwsh
# CBD Authentication Fix Verification Script

Write-Host "🔍 Verifying CBD Authentication Fix..." -ForegroundColor Cyan

try {
    `$testAuth = @{
        username = "admin@codai.ro"
        password = "admin123"
    } | ConvertTo-Json
    
    `$response = Invoke-RestMethod -Uri "$CBD_SERVICE_URL/security/auth/login" -Method POST -Body `$testAuth -ContentType "application/json"
    
    if (`$response.success) {
        Write-Host "✅ Authentication Fix SUCCESSFUL!" -ForegroundColor Green
        Write-Host "User: `$(`$response.user.username)" -ForegroundColor White
        Write-Host "Role: `$(`$response.user.role)" -ForegroundColor White
        Write-Host "SimpleAuthenticator is working correctly" -ForegroundColor Green
    } else {
        Write-Host "❌ Authentication still broken: `$(`$response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Verification failed: `$_" -ForegroundColor Red
}
"@

$verifyScript | Out-File -FilePath "scripts/verify-cbd-auth-fix.ps1" -Encoding UTF8
Write-Host "💾 Verification script created: scripts/verify-cbd-auth-fix.ps1" -ForegroundColor Green

Write-Host "`n🎯 DEPLOYMENT SUMMARY:" -ForegroundColor Cyan
Write-Host "✅ SimpleAuthenticator implementation ready" -ForegroundColor Green
Write-Host "✅ Local build successful" -ForegroundColor Green
Write-Host "✅ Verification script created" -ForegroundColor Green
Write-Host "📋 Manual deployment steps provided above" -ForegroundColor Yellow
Write-Host "🔧 Run verification script after deployment" -ForegroundColor Yellow

Write-Host "`n🏁 Ready for production deployment!" -ForegroundColor Green
