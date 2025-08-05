# RomAI AGI Day 7 - Docker Production Build Script
# Comprehensive build and deployment automation for production-ready AGI system

param(
    [string]$Action = "build",
    [string]$Environment = "production",
    [switch]$Verbose,
    [switch]$Push
)

$ErrorActionPreference = "Stop"

# Configuration
$ImageName = "romai-agi"
$Version = "1.7.0"
$Registry = "romai-registry"

Write-Host "🚀 RomAI AGI Day 7 - Docker Production Deployment" -ForegroundColor Green
Write-Host "Action: $Action | Environment: $Environment | Version: $Version" -ForegroundColor Cyan
Write-Host "=" * 60

function Write-Step {
    param([string]$Message)
    Write-Host "📋 $Message" -ForegroundColor Yellow
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Test-Docker {
    Write-Step "Checking Docker availability..."
    try {
        $dockerVersion = docker --version
        Write-Success "Docker is available: $dockerVersion"
        return $true
    }
    catch {
        Write-Error "Docker is not available. Please install Docker Desktop."
        return $false
    }
}

function Build-Images {
    Write-Step "Building RomAI AGI production images..."
    
    # Build multi-stage production image
    Write-Step "Building production AGI image with real AI models..."
    docker build -t "${ImageName}:${Version}" `
                 -t "${ImageName}:latest" `
                 -f apps/romai/Dockerfile.agi `
                 --target production `
                 --build-arg VERSION=$Version `
                 --build-arg ENVIRONMENT=$Environment `
                 .
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "AGI image built successfully"
    } else {
        Write-Error "Failed to build AGI image"
        exit 1
    }

    # Verify image size and layers
    Write-Step "Analyzing image characteristics..."
    docker images "${ImageName}:${Version}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedSince}}"
    
    Write-Success "Image build completed successfully"
}

function Test-Images {
    Write-Step "Testing built images..."
    
    # Test image can start
    Write-Step "Testing image startup..."
    $containerId = docker run -d -p 8001:8000 "${ImageName}:${Version}"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Container started with ID: $containerId"
        
        # Wait for startup
        Write-Step "Waiting for AGI server initialization..."
        Start-Sleep -Seconds 30
        
        # Test health endpoint
        try {
            $healthCheck = Invoke-RestMethod -Uri "http://localhost:8001/health" -TimeoutSec 10
            Write-Success "Health check passed: $($healthCheck.status)"
        }
        catch {
            Write-Error "Health check failed: $($_.Exception.Message)"
        }
        
        # Cleanup test container
        docker stop $containerId | Out-Null
        docker rm $containerId | Out-Null
        Write-Success "Test container cleaned up"
    } else {
        Write-Error "Failed to start test container"
        exit 1
    }
}

function Start-Stack {
    Write-Step "Starting RomAI AGI production stack..."
    
    # Start complete environment
    docker-compose -f docker-compose.agi.yml up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Production stack started successfully"
        
        # Show running services
        Write-Step "Running services:"
        docker-compose -f docker-compose.agi.yml ps
        
        Write-Host ""
        Write-Host "🌟 RomAI AGI Production Environment Ready!" -ForegroundColor Green
        Write-Host "🧠 AGI Server: http://localhost:8000" -ForegroundColor Cyan
        Write-Host "📊 Grafana: http://localhost:3000 (admin/romai-admin-2025)" -ForegroundColor Cyan
        Write-Host "🔍 Prometheus: http://localhost:9090" -ForegroundColor Cyan
        Write-Host "💾 Redis: localhost:6379" -ForegroundColor Cyan
        
    } else {
        Write-Error "Failed to start production stack"
        exit 1
    }
}

function Stop-Stack {
    Write-Step "Stopping RomAI AGI production stack..."
    docker-compose -f docker-compose.agi.yml down -v
    Write-Success "Production stack stopped"
}

function Push-Images {
    if ($Push) {
        Write-Step "Pushing images to registry..."
        docker tag "${ImageName}:${Version}" "${Registry}/${ImageName}:${Version}"
        docker tag "${ImageName}:${Version}" "${Registry}/${ImageName}:latest"
        
        docker push "${Registry}/${ImageName}:${Version}"
        docker push "${Registry}/${ImageName}:latest"
        
        Write-Success "Images pushed to registry"
    }
}

function Show-Logs {
    Write-Step "Showing AGI server logs..."
    docker-compose -f docker-compose.agi.yml logs -f romai-agi
}

function Show-Status {
    Write-Step "RomAI AGI Production Status:"
    docker-compose -f docker-compose.agi.yml ps
    
    Write-Step "Container resource usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
    
    Write-Step "Image information:"
    docker images "${ImageName}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedSince}}"
}

function Show-Help {
    Write-Host "RomAI AGI Day 7 - Docker Production Deployment Script" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage: .\build-docker-agi.ps1 -Action <action> [options]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Actions:" -ForegroundColor Yellow
    Write-Host "  build      Build production Docker images"
    Write-Host "  test       Test built images"
    Write-Host "  start      Start production stack"
    Write-Host "  stop       Stop production stack"
    Write-Host "  logs       Show AGI server logs"
    Write-Host "  status     Show production status"
    Write-Host "  help       Show this help"
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -Environment   Target environment (default: production)"
    Write-Host "  -Push          Push images to registry after build"
    Write-Host "  -Verbose       Enable verbose output"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Cyan
    Write-Host "  .\build-docker-agi.ps1 -Action build"
    Write-Host "  .\build-docker-agi.ps1 -Action start"
    Write-Host "  .\build-docker-agi.ps1 -Action build -Push"
}

# Main execution logic
try {
    if (-not (Test-Docker)) {
        exit 1
    }

    switch ($Action.ToLower()) {
        "build" {
            Build-Images
            Push-Images
        }
        "test" {
            Test-Images
        }
        "start" {
            Start-Stack
        }
        "stop" {
            Stop-Stack
        }
        "logs" {
            Show-Logs
        }
        "status" {
            Show-Status
        }
        "help" {
            Show-Help
        }
        default {
            Write-Error "Unknown action: $Action"
            Show-Help
            exit 1
        }
    }
    
    Write-Host ""
    Write-Success "RomAI AGI Day 7 operation completed successfully!"
    
} catch {
    Write-Error "Error during operation: $($_.Exception.Message)"
    exit 1
}
