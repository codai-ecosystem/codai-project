#!/usr/bin/env pwsh
# CODAI Ecosystem - Monitoring Infrastructure Deployment Script
# Automated setup and validation of production monitoring

param(
    [switch]$Deploy,
    [switch]$Validate,
    [switch]$Restart,
    [switch]$All
)

function Write-Step { param($Message) Write-Host "🔧 $Message" -ForegroundColor Blue }
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }

Write-Host "📊 CODAI Monitoring Infrastructure Manager" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

if ($Deploy -or $All) {
    Write-Step "Deploying monitoring infrastructure..."
    
    # Create required networks
    Write-Step "Creating Docker networks..."
    try {
        docker network create codai-backend -ErrorAction SilentlyContinue
        docker network create codai-monitoring -ErrorAction SilentlyContinue
        Write-Success "Docker networks ready"
    } catch {
        Write-Warning "Networks may already exist: $($_.Exception.Message)"
    }
    
    # Deploy monitoring stack
    Write-Step "Starting monitoring services..."
    docker-compose -f docker-compose.monitoring.yml down --remove-orphans
    docker-compose -f docker-compose.monitoring.yml up -d
    
    Write-Step "Waiting for services to initialize (30 seconds)..."
    Start-Sleep -Seconds 30
    
    Write-Success "Monitoring stack deployment completed"
}

if ($Restart -or $All) {
    Write-Step "Restarting monitoring services..."
    
    $services = @(
        "codai-monitoring-prometheus",
        "codai-monitoring-grafana", 
        "codai-monitoring-alertmanager",
        "codai-node-exporter",
        "codai-monitoring-elasticsearch",
        "codai-kibana",
        "codai-jaeger"
    )
    
    foreach ($service in $services) {
        Write-Step "Restarting $service..."
        docker restart $service
        Start-Sleep -Seconds 2
    }
    
    Write-Step "Waiting for services to stabilize..."
    Start-Sleep -Seconds 15
    Write-Success "Monitoring services restarted"
}

if ($Validate -or $All) {
    Write-Step "Running comprehensive health validation..."
    
    # Run the production health check
    & ".\production-health-check.ps1"
    
    Write-Step "Monitoring service access URLs:"
    Write-Host "  📊 Prometheus: http://localhost:9091" -ForegroundColor Green
    Write-Host "  📈 Grafana: http://localhost:3002 (admin/codai-admin-2025)" -ForegroundColor Green
    Write-Host "  🚨 AlertManager: http://localhost:9093" -ForegroundColor Green  
    Write-Host "  🔍 Elasticsearch: http://localhost:9201" -ForegroundColor Green
    Write-Host "  📋 Kibana: http://localhost:5601" -ForegroundColor Green
    Write-Host "  🔗 Jaeger: http://localhost:16686" -ForegroundColor Green
}

# Default action if no parameters
if (-not ($Deploy -or $Validate -or $Restart -or $All)) {
    Write-Warning "Usage: ./monitoring-manager.ps1 [-Deploy] [-Validate] [-Restart] [-All]"
    Write-Host "  -Deploy    Deploy/redeploy monitoring infrastructure"
    Write-Host "  -Validate  Run health checks and display URLs"
    Write-Host "  -Restart   Restart all monitoring services"  
    Write-Host "  -All       Run all operations"
    exit 1
}

Write-Host "`n🏁 Monitoring infrastructure management completed" -ForegroundColor Cyan