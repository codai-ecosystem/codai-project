# Production Deployment Script for METU

Write-Host "Starting METU Production Deployment..." -ForegroundColor Cyan

# Set production environment
$env:NODE_ENV = "production"

# Validate environment
Write-Host "Validating production environment..." -ForegroundColor Yellow

# Check if required files exist
$requiredFiles = @(
    "package.json",
    ".env.production",
    "Dockerfile",
    "docker-compose.prod.yml",
    "src/server/index.ts"
)

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Host "Missing required file: $file" -ForegroundColor Red
        exit 1
    }
}

Write-Host "All required files present" -ForegroundColor Green

# Build the application
Write-Host "🔨 Building production application..." -ForegroundColor Yellow
try {
    pnpm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed"
    }
    Write-Host "✅ Application built successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Build failed: $_" -ForegroundColor Red
    exit 1
}

# Run security checks
Write-Host "🔐 Running security audit..." -ForegroundColor Yellow
try {
    pnpm audit --audit-level high
    Write-Host "✅ Security audit passed" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Security vulnerabilities found. Please review before deploying." -ForegroundColor Yellow
}

# Build Docker image
Write-Host "🐳 Building Docker image..." -ForegroundColor Yellow
try {
    docker build -t metu:latest -t metu:$(Get-Date -Format "yyyyMMdd-HHmmss") .
    if ($LASTEXITCODE -ne 0) {
        throw "Docker build failed"
    }
    Write-Host "✅ Docker image built successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker build failed: $_" -ForegroundColor Red
    exit 1
}

# Check if production stack is already running
Write-Host "🔍 Checking for existing production stack..." -ForegroundColor Yellow
$existingContainers = docker ps -a --format "{{.Names}}" | Where-Object { $_ -match "metu-" }

if ($existingContainers) {
    Write-Host "📦 Found existing containers: $($existingContainers -join ', ')" -ForegroundColor Yellow
    $response = Read-Host "Do you want to stop and remove existing containers? (y/N)"
    
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Host "Stopping existing containers..." -ForegroundColor Yellow
        docker-compose -f docker-compose.prod.yml down --remove-orphans
        Write-Host "✅ Existing containers stopped" -ForegroundColor Green
    }
}

# Start production stack
Write-Host "🚀 Starting production stack..." -ForegroundColor Yellow
try {
    docker-compose -f docker-compose.prod.yml up -d
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to start production stack"
    }
    Write-Host "✅ Production stack started successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to start production stack: $_" -ForegroundColor Red
    exit 1
}

# Wait for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Health check
Write-Host "🏥 Performing health checks..." -ForegroundColor Yellow
$healthChecksPassed = 0
$totalHealthChecks = 3

# Check main server
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4400/api/health" -TimeoutSec 10
    if ($response.status -eq "healthy") {
        Write-Host "✅ Main server health check passed" -ForegroundColor Green
        $healthChecksPassed++
    } else {
        Write-Host "⚠️ Main server health check warning: $($response.status)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Main server health check failed: $_" -ForegroundColor Red
}

# Check device server
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4402/api/health" -TimeoutSec 10
    if ($response.status -eq "healthy") {
        Write-Host "✅ Device server health check passed" -ForegroundColor Green
        $healthChecksPassed++
    } else {
        Write-Host "⚠️ Device server health check warning: $($response.status)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Device server health check failed: $_" -ForegroundColor Red
}

# Check metrics endpoint
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4400/api/metrics" -TimeoutSec 10
    if ($response) {
        Write-Host "✅ Metrics endpoint check passed" -ForegroundColor Green
        $healthChecksPassed++
    }
} catch {
    Write-Host "❌ Metrics endpoint check failed: $_" -ForegroundColor Red
}

# Display deployment status
Write-Host "`n🎯 Deployment Status:" -ForegroundColor Cyan
Write-Host "Health Checks Passed: $healthChecksPassed/$totalHealthChecks" -ForegroundColor White

if ($healthChecksPassed -eq $totalHealthChecks) {
    Write-Host "🎉 METU Production Deployment Successful!" -ForegroundColor Green
    Write-Host "`n📊 Access Points:" -ForegroundColor Cyan
    Write-Host "🌐 Main Application: http://localhost:4400" -ForegroundColor White
    Write-Host "🔧 Device Server: http://localhost:4402" -ForegroundColor White
    Write-Host "🏥 Health Check: http://localhost:4400/api/health" -ForegroundColor White
    Write-Host "📈 Metrics: http://localhost:4400/api/metrics" -ForegroundColor White
    Write-Host "📊 Prometheus: http://localhost:9090" -ForegroundColor White
    Write-Host "📈 Grafana: http://localhost:3000 (admin/admin)" -ForegroundColor White
} else {
    Write-Host "⚠️ METU Deployment Completed with Issues" -ForegroundColor Yellow
    Write-Host "Some health checks failed. Please review the logs and fix any issues." -ForegroundColor Yellow
}

# Display container status
Write-Host "`n📦 Container Status:" -ForegroundColor Cyan
docker-compose -f docker-compose.prod.yml ps

# Display logs command
Write-Host "`n📝 To view logs, run:" -ForegroundColor Cyan
Write-Host "docker-compose -f docker-compose.prod.yml logs -f" -ForegroundColor White

# Display monitoring URLs
Write-Host "`n📊 Monitoring Dashboard Setup:" -ForegroundColor Cyan
Write-Host "1. Access Grafana at http://localhost:3000" -ForegroundColor White
Write-Host "2. Login with admin/admin" -ForegroundColor White  
Write-Host "3. Import the METU dashboard from configs/grafana/dashboards/" -ForegroundColor White
Write-Host "4. Configure Prometheus data source: http://prometheus:9090" -ForegroundColor White

Write-Host "`n🔧 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update .env.production with your actual Azure OpenAI credentials" -ForegroundColor White
Write-Host "2. Configure SSL certificates for HTTPS" -ForegroundColor White
Write-Host "3. Set up domain name and reverse proxy (nginx/caddy)" -ForegroundColor White
Write-Host "4. Configure backup procedures for data persistence" -ForegroundColor White
Write-Host "5. Set up monitoring alerts and notifications" -ForegroundColor White

Write-Host "`n✅ METU Production Deployment Complete!" -ForegroundColor Green
