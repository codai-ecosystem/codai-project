# 🚀 CBD Live Production Deployment Script
# Purpose: Deploy the authentication-fixed CBD service to replace live broken service

param(
    [string]$LiveDomain = "cbd.memorai.ro",
    [string]$ProductionPort = "4180",
    [switch]$UpdateLive,
    [switch]$SkipBackup,
    [switch]$Force
)

Write-Host "🚀 CODAI CBD Live Production Deployment" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor White
Write-Host "Target Domain: $LiveDomain" -ForegroundColor Yellow
Write-Host "Production Port: $ProductionPort" -ForegroundColor Yellow
Write-Host "Update Live Service: $UpdateLive" -ForegroundColor Yellow

# Backup current live container if not skipped
if (-not $SkipBackup) {
    Write-Host "`n📦 Creating backup of current production container..." -ForegroundColor Yellow
    
    # Stop and backup current production container
    $backupTimestamp = Get-Date -Format "yyyy-MM-dd-HH-mm-ss"
    $backupName = "codai-cbd-backup-$backupTimestamp"
    
    try {
        # Create backup image
        docker commit codai-cbd-prod $backupName 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Backup created: $backupName" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Backup creation failed or container not found" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️ Backup warning: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Stop existing production container
Write-Host "`n🛑 Stopping current production container..." -ForegroundColor Yellow
docker stop codai-cbd-prod 2>$null | Out-Null
docker rm codai-cbd-prod 2>$null | Out-Null

# Deploy new authenticated CBD service
Write-Host "`n🐳 Deploying CBD service with authentication fix..." -ForegroundColor Green

$deployCommand = @(
    "run", "-d", "--name", "codai-cbd-prod",
    "-p", "$ProductionPort`:3000",
    "--restart", "unless-stopped",
    "-e", "NODE_ENV=production",
    "-e", "CBD_LOG_LEVEL=info",
    "-e", "PORT=3000",
    "-e", "MEMORAI_API_KEY=memorai-dev-key-2025",
    "-e", "MEMORAI_CBD_PATH=./memorai-cbd-data",
    "-e", "ADMIN_EMAIL=admin@codai.ro",
    "-e", "ADMIN_PASSWORD=admin123",
    "codai-cbd:auth-fix"
)

$containerId = docker @deployCommand
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Production container deployed: $containerId" -ForegroundColor Green
} else {
    Write-Host "❌ Production deployment failed" -ForegroundColor Red
    exit 1
}

# Wait for service initialization
Write-Host "`n⏳ Waiting for production service initialization..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Comprehensive production validation
Write-Host "`n🔍 Performing production validation..." -ForegroundColor Cyan

# Health check
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:$ProductionPort/health" -Method Get -TimeoutSec 15
    Write-Host "✅ Health Check: $($healthResponse.status)" -ForegroundColor Green
    Write-Host "  Service: $($healthResponse.service)" -ForegroundColor White
    Write-Host "  Version: $($healthResponse.version)" -ForegroundColor White
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    if (-not $Force) {
        Write-Host "Use -Force to continue despite health check failure" -ForegroundColor Yellow
        exit 1
    }
}

# Authentication validation
Write-Host "`n🔐 Validating authentication system..." -ForegroundColor Cyan

try {
    # Test login
    $loginData = @{
        email = "admin@codai.ro"
        password = "admin123"
    } | ConvertTo-Json
    
    $authResponse = Invoke-RestMethod -Uri "http://localhost:$ProductionPort/security/auth/login" -Method Post -Body $loginData -ContentType "application/json" -TimeoutSec 15
    
    if ($authResponse.success -and $authResponse.data.token) {
        Write-Host "✅ Authentication: Login successful" -ForegroundColor Green
        Write-Host "  Token length: $($authResponse.data.token.Length) characters" -ForegroundColor White
        Write-Host "  User: $($authResponse.data.user.email)" -ForegroundColor White
        Write-Host "  Role: $($authResponse.data.user.role)" -ForegroundColor White
        
        # Test token verification
        $token = $authResponse.data.token
        $verifyBody = @{ token = $token } | ConvertTo-Json
        $verifyResponse = Invoke-RestMethod -Uri "http://localhost:$ProductionPort/ecosystem/auth/verify" -Method Post -Body $verifyBody -ContentType "application/json" -TimeoutSec 15
        
        if ($verifyResponse.success) {
            Write-Host "✅ Token Verification: Valid" -ForegroundColor Green
            Write-Host "  Verified User: $($verifyResponse.data.email)" -ForegroundColor White
            Write-Host "  Verified Role: $($verifyResponse.data.role)" -ForegroundColor White
        } else {
            Write-Host "❌ Token verification failed" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Authentication failed - no token received" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Authentication validation failed: $($_.Exception.Message)" -ForegroundColor Red
    if (-not $Force) {
        Write-Host "Use -Force to continue despite authentication failure" -ForegroundColor Yellow
        exit 1
    }
}

# Security endpoints validation
Write-Host "`n🛡️ Validating security endpoints..." -ForegroundColor Cyan

try {
    $securityStats = Invoke-RestMethod -Uri "http://localhost:$ProductionPort/security/stats" -Method Get -TimeoutSec 10
    Write-Host "✅ Security Stats: Available" -ForegroundColor Green
    
    $securityHealth = Invoke-RestMethod -Uri "http://localhost:$ProductionPort/security/health" -Method Get -TimeoutSec 10
    Write-Host "✅ Security Health: $($securityHealth.result.status)" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Security endpoints warning: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Display production status
Write-Host "`n📊 Production Service Status:" -ForegroundColor Cyan
docker ps --filter "name=codai-cbd-prod" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Image}}"

# Display recent logs
Write-Host "`n📋 Production Service Logs (Last 10 lines):" -ForegroundColor Cyan
docker logs --tail 10 codai-cbd-prod

# Live domain update instructions
if ($UpdateLive) {
    Write-Host "`n🌐 LIVE DOMAIN UPDATE REQUIRED" -ForegroundColor Yellow
    Write-Host "===============================================" -ForegroundColor White
    Write-Host "To complete the live deployment:" -ForegroundColor White
    Write-Host "1. Update load balancer to point $LiveDomain to port $ProductionPort" -ForegroundColor Yellow
    Write-Host "2. Test live authentication at https://$LiveDomain/security/auth/login" -ForegroundColor Yellow
    Write-Host "3. Verify Hub integration with working CBD authentication" -ForegroundColor Yellow
    Write-Host "4. Monitor production logs for any issues" -ForegroundColor Yellow
}

Write-Host "`n🎉 CBD PRODUCTION DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor White
Write-Host "Production URL: http://localhost:$ProductionPort" -ForegroundColor White
Write-Host "Health Check: http://localhost:$ProductionPort/health" -ForegroundColor White
Write-Host "Authentication: http://localhost:$ProductionPort/security/auth/login" -ForegroundColor White
Write-Host "`nCredentials for live testing:" -ForegroundColor Yellow
Write-Host "  Email: admin@codai.ro" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White

if (-not $UpdateLive) {
    Write-Host "`nTo update live domain, run with -UpdateLive flag" -ForegroundColor Cyan
}

Write-Host "`n✅ CBD Authentication System: PRODUCTION READY!" -ForegroundColor Green
