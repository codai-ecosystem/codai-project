# 🚀 Quick Local Production Deployment Script
# For testing the production setup locally

param(
    [switch]$Build,
    [switch]$Start,
    [switch]$Stop,
    [switch]$Logs,
    [switch]$Status,
    [string]$Service = "all"
)

# Colors for PowerShell output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    } else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Green { Write-ColorOutput Green $args }
function Write-Yellow { Write-ColorOutput Yellow $args }
function Write-Red { Write-ColorOutput Red $args }
function Write-Blue { Write-ColorOutput Blue $args }

# Check if Docker is running
function Test-DockerRunning {
    try {
        docker info | Out-Null
        return $true
    } catch {
        Write-Red "❌ Docker is not running. Please start Docker Desktop first."
        return $false
    }
}

# Build all containers
function Build-Containers {
    Write-Blue "🐳 Building production containers..."
    
    if (-not (Test-DockerRunning)) { return }
    
    Write-Yellow "📦 Building CBD Database..."
    docker build -t codai-cbd:prod ./packages/cbd
    
    Write-Yellow "📦 Building Hub Application..."
    docker build -t codai-hub:prod ./apps/hub
    
    if (Test-Path "./apps/gateway") {
        Write-Yellow "📦 Building Gateway..."
        docker build -t codai-gateway:prod ./apps/gateway
    }
    
    if (Test-Path "./packages/memorai-mcp") {
        Write-Yellow "📦 Building MemorAI MCP..."
        docker build -t codai-memorai-mcp:prod ./packages/memorai-mcp
    }
    
    Write-Green "✅ All containers built successfully!"
}

# Start production stack
function Start-ProductionStack {
    Write-Blue "🚀 Starting CODAI Production Stack..."
    
    if (-not (Test-DockerRunning)) { return }
    
    # Check if .env.production exists
    if (-not (Test-Path ".env.production")) {
        Write-Yellow "⚠️  Creating .env.production from example..."
        Copy-Item ".env.production.example" ".env.production"
        Write-Yellow "📝 Please edit .env.production with your actual values"
    }
    
    # Start with docker-compose
    docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
    
    Write-Green "✅ Production stack started!"
    Write-Blue "🌐 Services should be available at:"
    Write-Yellow "   Hub:     http://localhost:4008"
    Write-Yellow "   API:     http://localhost:4180"
    Write-Yellow "   Gateway: http://localhost:4003"
}

# Stop production stack
function Stop-ProductionStack {
    Write-Blue "🛑 Stopping CODAI Production Stack..."
    
    docker-compose -f docker-compose.prod.yml down
    
    Write-Green "✅ Production stack stopped!"
}

# Show logs
function Show-Logs {
    param([string]$ServiceName = "")
    
    if ($ServiceName -eq "" -or $ServiceName -eq "all") {
        docker-compose -f docker-compose.prod.yml logs -f
    } else {
        docker-compose -f docker-compose.prod.yml logs -f $ServiceName
    }
}

# Show status
function Show-Status {
    Write-Blue "📊 CODAI Production Stack Status"
    Write-Blue "================================"
    
    if (-not (Test-DockerRunning)) { return }
    
    # Check running containers
    $containers = docker ps --filter "name=codai" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    if ($containers) {
        Write-Green "🟢 Running Containers:"
        $containers
    } else {
        Write-Yellow "⚠️  No CODAI containers are running"
    }
    
    # Check service health
    Write-Blue "`n🏥 Health Checks:"
    
    # Test Hub
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4008" -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Green "✅ Hub (4008): HEALTHY"
        }
    } catch {
        Write-Red "❌ Hub (4008): NOT RESPONDING"
    }
    
    # Test CBD API
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:4180/health" -TimeoutSec 5
        if ($response.status -eq "healthy") {
            Write-Green "✅ CBD API (4180): HEALTHY"
        }
    } catch {
        Write-Red "❌ CBD API (4180): NOT RESPONDING"
    }
    
    # Test Gateway
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4003" -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Green "✅ Gateway (4003): HEALTHY"
        }
    } catch {
        Write-Yellow "⚠️  Gateway (4003): NOT RESPONDING (may not be implemented yet)"
    }
}

# Main execution logic
switch ($true) {
    $Build { Build-Containers }
    $Start { Start-ProductionStack }
    $Stop { Stop-ProductionStack }
    $Logs { Show-Logs -ServiceName $Service }
    $Status { Show-Status }
    default {
        Write-Blue "🚀 CODAI Production Deployment Helper"
        Write-Blue "===================================="
        Write-Yellow "Usage:"
        Write-Yellow "  .\deploy-local-prod.ps1 -Build          # Build all containers"
        Write-Yellow "  .\deploy-local-prod.ps1 -Start          # Start production stack"
        Write-Yellow "  .\deploy-local-prod.ps1 -Stop           # Stop production stack"
        Write-Yellow "  .\deploy-local-prod.ps1 -Status         # Show stack status"
        Write-Yellow "  .\deploy-local-prod.ps1 -Logs           # Show all logs"
        Write-Yellow "  .\deploy-local-prod.ps1 -Logs hub-app   # Show specific service logs"
        Write-Blue "`nExample workflow:"
        Write-Yellow "  1. .\deploy-local-prod.ps1 -Build"
        Write-Yellow "  2. .\deploy-local-prod.ps1 -Start"
        Write-Yellow "  3. .\deploy-local-prod.ps1 -Status"
    }
}
