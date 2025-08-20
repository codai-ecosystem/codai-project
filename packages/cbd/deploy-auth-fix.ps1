# 🔧 Deploy CBD Authentication Fix Script
# Purpose: Deploy SimpleAuthenticator to fix live CBD service authentication issues

param(
    [string]$Environment = "production",
    [string]$Port = "4190",
    [switch]$SkipHealthCheck,
    [switch]$Force
)

Write-Host "🚀 Starting CBD Authentication Fix Deployment..." -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor White
Write-Host "Target Port: $Port" -ForegroundColor White

# Stop existing container if running
Write-Host "`n🛑 Stopping existing CBD container..." -ForegroundColor Yellow
docker stop codai-cbd-auth-fix 2>$null | Out-Null
docker rm codai-cbd-auth-fix 2>$null | Out-Null

# Start new container with authentication fix
Write-Host "`n🐳 Starting CBD container with authentication fix..." -ForegroundColor Green
$containerCommand = @(
    "run", "-d", "--name", "codai-cbd-auth-fix",
    "-p", "$Port`:3000",
    "-e", "NODE_ENV=production",
    "-e", "CBD_LOG_LEVEL=info",
    "-e", "PORT=3000",
    "-e", "MEMORAI_API_KEY=memorai-dev-key-2025",
    "-e", "MEMORAI_CBD_PATH=./memorai-cbd-data",
    "codai-cbd:auth-fix"
)

$containerId = docker @containerCommand
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Container started successfully: $containerId" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to start container" -ForegroundColor Red
    exit 1
}

# Wait for container to initialize
Write-Host "`n⏳ Waiting for service initialization..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Health check
if (-not $SkipHealthCheck) {
    Write-Host "`n🔍 Performing health check..." -ForegroundColor Cyan
    
    try {
        $healthResponse = Invoke-RestMethod -Uri "http://localhost:$Port/health" -Method Get -TimeoutSec 10
        Write-Host "✅ Health Check: $($healthResponse.status)" -ForegroundColor Green
        Write-Host "Service: $($healthResponse.service)" -ForegroundColor White
        Write-Host "Version: $($healthResponse.version)" -ForegroundColor White
    } catch {
        Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
        if (-not $Force) {
            exit 1
        }
    }
    
    # Test authentication endpoints
    Write-Host "`n🔐 Testing authentication endpoints..." -ForegroundColor Cyan
    
    try {
        # Test login
        $loginData = @{
            email = "admin@codai.ro"
            password = "admin123"
        } | ConvertTo-Json
        
        $authResponse = Invoke-RestMethod -Uri "http://localhost:$Port/auth/login" -Method Post -Body $loginData -ContentType "application/json" -TimeoutSec 10
        
        if ($authResponse.token) {
            Write-Host "✅ Authentication: Login successful" -ForegroundColor Green
            Write-Host "Token received: $($authResponse.token.Substring(0, 20))..." -ForegroundColor White
            
            # Test token verification
            $headers = @{ "Authorization" = "Bearer $($authResponse.token)" }
            $verifyResponse = Invoke-RestMethod -Uri "http://localhost:$Port/auth/verify" -Method Get -Headers $headers -TimeoutSec 10
            
            if ($verifyResponse.valid) {
                Write-Host "✅ Authentication: Token verification successful" -ForegroundColor Green
                Write-Host "User: $($verifyResponse.user.email)" -ForegroundColor White
            } else {
                Write-Host "❌ Authentication: Token verification failed" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Authentication: Login failed - no token received" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Authentication test failed: $($_.Exception.Message)" -ForegroundColor Red
        if (-not $Force) {
            Write-Host "Use -Force to continue despite authentication test failure" -ForegroundColor Yellow
        }
    }
}

# Display container status
Write-Host "`n📊 Container Status:" -ForegroundColor Cyan
docker ps --filter "name=codai-cbd-auth-fix" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Display logs (last 20 lines)
Write-Host "`n📋 Recent Logs:" -ForegroundColor Cyan
docker logs --tail 20 codai-cbd-auth-fix

Write-Host "`n🎉 CBD Authentication Fix Deployment Complete!" -ForegroundColor Green
Write-Host "Service URL: http://localhost:$Port" -ForegroundColor White
Write-Host "Health Check: http://localhost:$Port/health" -ForegroundColor White
Write-Host "Login Endpoint: http://localhost:$Port/auth/login" -ForegroundColor White
Write-Host "`nCredentials:" -ForegroundColor Yellow
Write-Host "  Email: admin@codai.ro" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
