# CODAI Local Ecosystem Startup Script
# This script starts all CODAI services locally for development

param(
    [switch]$SkipInstall,
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"

# Configuration
$Services = @{
    "MemorAI Frontend" = @{
        Path = "apps\memorai"
        Port = 4006
        Command = "pnpm dev"
        HealthCheck = "http://localhost:4006"
    }
    "CBD Service" = @{
        Path = "packages\cbd"
        Port = 4180
        Command = "npm run service"
        HealthCheck = "http://localhost:4180/health"
    }
    "MemorAI Backend" = @{
        Path = "packages\memorai"
        Port = 4007
        Command = "pnpm run dev --port 4007"
        HealthCheck = "http://localhost:4007/health"
    }
    "MemorAI MCP" = @{
        Path = "packages\@codai\memorai-mcp"
        Port = 8000
        Command = "pnpm start"
        HealthCheck = "http://localhost:8000"
    }
    "ControlAI Dashboard" = @{
        Path = "apps\controlai-dashboard"
        Port = 3000
        Command = "pnpm dev"
        HealthCheck = "http://localhost:3000"
    }
    "Gateway Service" = @{
        Path = "apps\gateway"
        Port = 3001
        Command = "node gateway-simple.js"
        HealthCheck = "http://localhost:3001/health"
    }
    "Hub Service" = @{
        Path = "apps\hub"
        Port = 3002
        Command = "pnpm dev --port 3002"
        HealthCheck = "http://localhost:3002"
    }
    "Admin Service" = @{
        Path = "apps\admin"
        Port = 3003
        Command = "pnpm dev --port 3003"
        HealthCheck = "http://localhost:3003"
    }
    "ID Service" = @{
        Path = "apps\id"
        Port = 3004
        Command = "pnpm dev --port 3004"
        HealthCheck = "http://localhost:3004"
    }
    "RomAI Service" = @{
        Path = "apps\romai"
        Port = 3005
        Command = "pnpm dev --port 3005"
        HealthCheck = "http://localhost:3005"
    }
}

# Color functions
function Write-Success { param($Message) Write-Host $Message -ForegroundColor Green }
function Write-Info { param($Message) Write-Host $Message -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host $Message -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host $Message -ForegroundColor Red }

# Check if port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

# Install dependencies if needed
function Install-Dependencies {
    if ($SkipInstall) {
        Write-Info "Skipping dependency installation"
        return
    }
    
    Write-Info "Installing dependencies..."
    
    if (Test-Path "pnpm-lock.yaml") {
        Write-Info "Using pnpm to install dependencies"
        pnpm install --frozen-lockfile=false
    } elseif (Test-Path "package-lock.json") {
        Write-Info "Using npm to install dependencies"
        npm install
    } else {
        Write-Warning "No lock file found, using npm install"
        npm install
    }
}

# Start a service
function Start-Service {
    param(
        [string]$Name,
        [hashtable]$Config
    )
    
    Write-Info "Starting $Name..."
    
    # Check if port is already in use
    if (Test-Port -Port $Config.Port) {
        Write-Warning "$Name is already running on port $($Config.Port)"
        return
    }
    
    # Check if path exists
    if (-not (Test-Path $Config.Path)) {
        Write-Error "Path not found: $($Config.Path)"
        return
    }
    
    # Start the service
    try {
        $windowTitle = "CODAI - $Name"
        $startArgs = @(
            "-NoExit"
            "-Command"
            "& { " +
            "`$Host.UI.RawUI.WindowTitle = '$windowTitle'; " +
            "cd '$($Config.Path)'; " +
            "Write-Host 'Starting $Name on port $($Config.Port)...' -ForegroundColor Green; " +
            "$($Config.Command)" +
            " }"
        )
        
        Start-Process PowerShell -ArgumentList $startArgs -WindowStyle Normal
        Write-Success "$Name started in new window"
        
        # Wait a moment for service to start
        Start-Sleep 2
        
    } catch {
        Write-Error "Failed to start ${Name}: $($_.Exception.Message)"
    }
}

# Check service health
function Test-ServiceHealth {
    param(
        [string]$Name,
        [string]$Url,
        [int]$TimeoutSec = 5
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec $TimeoutSec -UseBasicParsing -ErrorAction Stop
        Write-Success "✅ $Name - Healthy"
        return $true
    } catch {
        Write-Error "❌ $Name - Not responding"
        return $false
    }
}

# Main execution
function Main {
    Write-Host ""
    Write-Host "🚀 CODAI Local Ecosystem Startup" -ForegroundColor Green
    Write-Host "=================================" -ForegroundColor Green
    Write-Host ""
    
    # Install dependencies
    Install-Dependencies
    
    Write-Host ""
    Write-Info "Starting services..."
    Write-Host ""
    
    # Start all services
    foreach ($serviceName in $Services.Keys) {
        Start-Service -Name $serviceName -Config $Services[$serviceName]
        Start-Sleep 1
    }
    
    Write-Host ""
    Write-Info "Waiting for services to start..."
    Start-Sleep 10
    
    Write-Host ""
    Write-Info "Checking service health..."
    Write-Host ""
    
    # Check health of all services
    $healthyServices = 0
    foreach ($serviceName in $Services.Keys) {
        $config = $Services[$serviceName]
        if (Test-ServiceHealth -Name $serviceName -Url $config.HealthCheck) {
            $healthyServices++
        }
    }
    
    Write-Host ""
    Write-Info "Health Check Summary:"
    Write-Host "Healthy Services: $healthyServices / $($Services.Count)" -ForegroundColor $(if ($healthyServices -eq $Services.Count) { "Green" } else { "Yellow" })
    
    if ($healthyServices -eq $Services.Count) {
        Write-Success "🎉 All services are running successfully!"
    } else {
        Write-Warning "⚠️  Some services may need more time to start. Check the individual service windows."
    }
    
    Write-Host ""
    Write-Info "Service URLs:"
    foreach ($serviceName in $Services.Keys) {
        $config = $Services[$serviceName]
        Write-Host "  $serviceName`: http://localhost:$($config.Port)" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Info "To stop all services, close the individual PowerShell windows."
    Write-Host "Press any key to continue..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Run main function
Main
