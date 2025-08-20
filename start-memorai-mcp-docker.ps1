#!/usr/bin/env pwsh
# MemoraiMCP Complete Ecosystem Docker Startup Script
# Starts the complete MemoraiMCP stack with all services

Write-Host "🧠 Starting MemoraiMCP Complete Ecosystem Docker Stack..." -ForegroundColor Cyan

# Check if Docker is running
try {
    docker --version | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker is not running"
    }
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# Navigate to project root
Set-Location $PSScriptRoot

# Stop any existing services
Write-Host "🧹 Cleaning up existing containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.memorai-complete.yml down --volumes 2>$null

# Stop any external services that might conflict
Write-Host "🧹 Checking for conflicting services..." -ForegroundColor Yellow
$conflictingPorts = @(4006, 4180, 4500, 4950, 5432, 6379)
foreach ($port in $conflictingPorts) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:$port/health" -Method Get -TimeoutSec 2
        Write-Host "⚠️  Service detected on port $port. This may cause conflicts." -ForegroundColor Yellow
    } catch {
        Write-Host "✅ Port $port is available" -ForegroundColor Green
    }
}

# Build and start the complete ecosystem
Write-Host "🚀 Building and starting MemoraiMCP complete ecosystem..." -ForegroundColor Cyan
Write-Host "   Services: CBD, Redis, PostgreSQL, MCP Server, App, GraphQL, Gateway, Monitoring" -ForegroundColor Gray

docker-compose -f docker-compose.memorai-complete.yml up --build -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ MemoraiMCP Complete Ecosystem started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📡 Service Endpoints:" -ForegroundColor White
    Write-Host "   🌐 Gateway (All Services): http://localhost:4000" -ForegroundColor Magenta
    Write-Host "   📱 MemoraiMCP App:         http://localhost:4006" -ForegroundColor Blue
    Write-Host "   🧠 MemoraiMCP Server:      http://localhost:4950" -ForegroundColor Cyan
    Write-Host "   � GraphQL Server:         http://localhost:4500" -ForegroundColor Purple
    Write-Host "   �🗃️  CBD Database:           http://localhost:4180" -ForegroundColor Green
    Write-Host "   � PostgreSQL:             localhost:5432" -ForegroundColor Blue
    Write-Host "   � Redis Cache:            redis://localhost:6379" -ForegroundColor Red
    Write-Host "   � Grafana Dashboard:      http://localhost:4951" -ForegroundColor Orange
    Write-Host "   📈 Prometheus:             http://localhost:4952" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔑 Credentials:" -ForegroundColor White
    Write-Host "   MemoraiMCP API Key:    memorai-dev-key-2025" -ForegroundColor White
    Write-Host "   Grafana Login:         admin / memorai-admin" -ForegroundColor White
    Write-Host "   PostgreSQL:            memorai / memorai-dev-password / memorai_dev" -ForegroundColor White
    
    # Wait for services to initialize
    Write-Host "⏳ Waiting for services to initialize..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
    # Test each service
    Write-Host "🧪 Testing service health..." -ForegroundColor Cyan
    
    # Test Gateway
    try {
        $gatewayHealth = Invoke-RestMethod -Uri "http://localhost:4000/health" -Method Get -TimeoutSec 10
        Write-Host "✅ Gateway: HEALTHY" -ForegroundColor Green
    } catch {
        Write-Host "❌ Gateway: UNHEALTHY" -ForegroundColor Red
    }
    
    # Test CBD Database
    try {
        $cbdHealth = Invoke-RestMethod -Uri "http://localhost:4180/health" -Method Get -TimeoutSec 10
        Write-Host "✅ CBD Database: HEALTHY" -ForegroundColor Green
    } catch {
        Write-Host "❌ CBD Database: UNHEALTHY" -ForegroundColor Red
    }
    
    # Test Redis
    try {
        $redisTest = docker exec memorai-redis redis-cli ping 2>$null
        if ($redisTest -eq "PONG") {
            Write-Host "✅ Redis Cache: HEALTHY" -ForegroundColor Green
        } else {
            Write-Host "❌ Redis Cache: UNHEALTHY" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Redis Cache: UNHEALTHY" -ForegroundColor Red
    }
    
    # Test PostgreSQL
    try {
        docker exec memorai-postgres pg_isready -U memorai -d memorai_dev 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ PostgreSQL: HEALTHY" -ForegroundColor Green
        } else {
            Write-Host "❌ PostgreSQL: UNHEALTHY" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ PostgreSQL: UNHEALTHY" -ForegroundColor Red
    }
    
    # Test MemoraiMCP Server
    try {
        $mcpHealth = Invoke-RestMethod -Uri "http://localhost:4950/health" -Method Get -TimeoutSec 10
        Write-Host "✅ MemoraiMCP Server: HEALTHY" -ForegroundColor Green
    } catch {
        Write-Host "❌ MemoraiMCP Server: UNHEALTHY" -ForegroundColor Red
        Write-Host "   Checking container logs..." -ForegroundColor Yellow
        docker logs memorai-mcp-server --tail 10
    }
    
    # Test MemoraiMCP App
    try {
        $appHealth = Invoke-RestMethod -Uri "http://localhost:4006/api/health" -Method Get -TimeoutSec 10
        Write-Host "✅ MemoraiMCP App: HEALTHY" -ForegroundColor Green
    } catch {
        Write-Host "❌ MemoraiMCP App: UNHEALTHY" -ForegroundColor Red
    }
    
    # Test GraphQL Server
    try {
        $graphqlHealth = Invoke-RestMethod -Uri "http://localhost:4500/health" -Method Get -TimeoutSec 10
        Write-Host "✅ GraphQL Server: HEALTHY" -ForegroundColor Green
    } catch {
        Write-Host "❌ GraphQL Server: UNHEALTHY" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "🎯 MemoraiMCP Complete Ecosystem is ready!" -ForegroundColor Green
    Write-Host "🌐 Access everything through the Gateway: http://localhost:4000" -ForegroundColor Magenta
    Write-Host "🔗 All services are networked and can communicate internally" -ForegroundColor White
    Write-Host "📋 Use 'docker-compose -f docker-compose.memorai-complete.yml logs [service]' to view logs" -ForegroundColor Gray
    Write-Host "📋 Use 'docker-compose -f docker-compose.memorai-complete.yml down' to stop all services" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to start MemoraiMCP Complete Ecosystem" -ForegroundColor Red
    Write-Host "Checking container logs..." -ForegroundColor Yellow
    docker-compose -f docker-compose.memorai-complete.yml logs --tail=20
    exit 1
}