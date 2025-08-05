#!/usr/bin/env pwsh
# 🚀 CBD & MemorAI MCP Startup Script
# Portable script to start CBD database and MemorAI MCP server from any location
# Version: 1.0.0
# Date: August 5, 2025

param(
    [string]$CodeaiProjectPath = "",
    [switch]$Help = $false,
    [switch]$StatusCheck = $false,
    [switch]$Stop = $false,
    [switch]$Restart = $false,
    [int]$CBDPort = 8080,
    [int]$MemorAIPort = 4950,
    [switch]$Verbose = $false
)

# Script configuration
$SCRIPT_NAME = "CBD & MemorAI MCP Startup Script"
$VERSION = "1.0.0"

# Color functions for output
function Write-Success { param($Message) Write-Host $Message -ForegroundColor Green }
function Write-Error { param($Message) Write-Host $Message -ForegroundColor Red }
function Write-Warning { param($Message) Write-Host $Message -ForegroundColor Yellow }
function Write-Info { param($Message) Write-Host $Message -ForegroundColor Cyan }
function Write-Debug { param($Message) if ($Verbose) { Write-Host "[DEBUG] $Message" -ForegroundColor Gray } }

# Show help
if ($Help) {
    Write-Host "🚀 $SCRIPT_NAME v$VERSION" -ForegroundColor Cyan
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "USAGE:" -ForegroundColor White
    Write-Host "  .\start-cbd-memorai.ps1 [OPTIONS]" -ForegroundColor Gray
    Write-Host ""
    Write-Host "OPTIONS:" -ForegroundColor White
    Write-Host "  -CodeaiProjectPath <path>  Path to codai-project (auto-detected if not specified)" -ForegroundColor Gray
    Write-Host "  -StatusCheck               Check if services are running" -ForegroundColor Gray
    Write-Host "  -Stop                      Stop all services" -ForegroundColor Gray
    Write-Host "  -Restart                   Restart all services" -ForegroundColor Gray
    Write-Host "  -CBDPort <port>           CBD port (default: 8080)" -ForegroundColor Gray
    Write-Host "  -MemorAIPort <port>       MemorAI MCP port (default: 4950)" -ForegroundColor Gray
    Write-Host "  -Verbose                   Enable verbose logging" -ForegroundColor Gray
    Write-Host "  -Help                      Show this help" -ForegroundColor Gray
    Write-Host ""
    Write-Host "EXAMPLES:" -ForegroundColor White
    Write-Host "  .\start-cbd-memorai.ps1" -ForegroundColor Gray
    Write-Host "  .\start-cbd-memorai.ps1 -StatusCheck" -ForegroundColor Gray
    Write-Host "  .\start-cbd-memorai.ps1 -CodeaiProjectPath 'C:\Dev\codai-project'" -ForegroundColor Gray
    Write-Host "  .\start-cbd-memorai.ps1 -Stop" -ForegroundColor Gray
    Write-Host ""
    exit 0
}

# Header
Write-Host "🚀 $SCRIPT_NAME v$VERSION" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Auto-detect codai-project path if not provided
if ([string]::IsNullOrEmpty($CodeaiProjectPath)) {
    Write-Info "🔍 Auto-detecting codai-project path..."
    
    # Common locations to check
    $possiblePaths = @(
        "E:\GitHub\codai-project",
        "C:\GitHub\codai-project", 
        ".\codai-project",
        "..\codai-project",
        "..\..\codai-project",
        "$env:USERPROFILE\Documents\GitHub\codai-project",
        "$env:USERPROFILE\codai-project"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            if (Test-Path "$path\packages\cbd" -and Test-Path "$path\packages\memorai-mcp") {
                $CodeaiProjectPath = $path
                Write-Success "✅ Found codai-project at: $CodeaiProjectPath"
                break
            }
        }
    }
    
    if ([string]::IsNullOrEmpty($CodeaiProjectPath)) {
        Write-Error "❌ Could not auto-detect codai-project path!"
        Write-Warning "Please specify the path using -CodeaiProjectPath parameter"
        Write-Host "Example: .\start-cbd-memorai.ps1 -CodeaiProjectPath 'C:\Path\To\codai-project'"
        exit 1
    }
}

# Validate paths
if (-not (Test-Path $CodeaiProjectPath)) {
    Write-Error "❌ Path not found: $CodeaiProjectPath"
    exit 1
}

$CBDPath = Join-Path $CodeaiProjectPath "packages\cbd"
$MemorAIPath = Join-Path $CodeaiProjectPath "packages\memorai-mcp"

if (-not (Test-Path $CBDPath)) {
    Write-Error "❌ CBD package not found at: $CBDPath"
    exit 1
}

if (-not (Test-Path $MemorAIPath)) {
    Write-Error "❌ MemorAI MCP package not found at: $MemorAIPath"
    exit 1
}

Write-Success "✅ Project paths validated"
Write-Debug "CBD Path: $CBDPath"
Write-Debug "MemorAI Path: $MemorAIPath"

# Functions for service management
function Test-ServiceHealth {
    param([string]$Url, [string]$ServiceName)
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 5 -ErrorAction Stop
        Write-Success "✅ $ServiceName is healthy"
        return $true
    }
    catch {
        Write-Warning "⚠️ $ServiceName is not responding"
        Write-Debug "Health check error: $($_.Exception.Message)"
        return $false
    }
}

function Stop-ServiceOnPort {
    param([int]$Port, [string]$ServiceName)
    
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($connections) {
            foreach ($conn in $connections) {
                $processId = $conn.OwningProcess
                $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                if ($process) {
                    Stop-Process -Id $processId -Force -ErrorAction Stop
                    Write-Success "✅ Stopped $ServiceName (PID: $processId)"
                }
            }
        }
        else {
            Write-Info "ℹ️ $ServiceName is not running on port $Port"
        }
    }
    catch {
        Write-Error "❌ Failed to stop $ServiceName`: $($_.Exception.Message)"
    }
}

function Start-CBDDatabase {
    Write-Info "🗃️ Starting CBD Database..."
    Write-Debug "CBD Path: $CBDPath"
    
    try {
        # Set environment variables for CBD
        $env:CBD_PORT = $CBDPort
        $env:CBD_LOG_LEVEL = if ($Verbose) { "debug" } else { "info" }
        $env:NODE_ENV = "development"
        
        # Start CBD database
        $cbdProcess = Start-Process -FilePath "tsx" -ArgumentList "src/start.ts" -WorkingDirectory $CBDPath -PassThru -NoNewWindow
        
        if ($cbdProcess) {
            Write-Success "✅ CBD Database started (PID: $($cbdProcess.Id))"
            Start-Sleep -Seconds 3  # Wait for startup
            
            # Verify it's running
            if (Test-ServiceHealth -Url "http://localhost:$CBDPort/health" -ServiceName "CBD Database") {
                return $cbdProcess
            }
            else {
                Write-Warning "⚠️ CBD Database may not have started correctly"
                return $cbdProcess
            }
        }
        else {
            Write-Error "❌ Failed to start CBD Database"
            return $null
        }
    }
    catch {
        Write-Error "❌ Error starting CBD Database: $($_.Exception.Message)"
        return $null
    }
}

function Start-MemorAIMCP {
    Write-Info "🧠 Starting MemorAI MCP Server..."
    Write-Debug "MemorAI Path: $MemorAIPath"
    
    try {
        # Set environment variables for MemorAI
        $env:MEMORAI_API_KEY = "memorai-dev-key-2025"
        $env:MEMORAI_MCP_PORT = $MemorAIPort
        $env:PORT = $MemorAIPort
        $env:NODE_ENV = "development"
        $env:DEBUG = if ($Verbose) { "memorai:*" } else { "" }
        $env:MEMORAI_DEBUG = if ($Verbose) { "true" } else { "false" }
        $env:MEMORAI_LOG_LEVEL = if ($Verbose) { "debug" } else { "info" }
        $env:MEMORAI_CBD_PATH = "./memorai-cbd-data"
        
        # Start MemorAI MCP Server
        $memoraiProcess = Start-Process -FilePath "node" -ArgumentList "memorai-mcp-vscode.cjs" -WorkingDirectory $MemorAIPath -PassThru -NoNewWindow
        
        if ($memoraiProcess) {
            Write-Success "✅ MemorAI MCP Server started (PID: $($memoraiProcess.Id))"
            Start-Sleep -Seconds 5  # Wait for startup
            
            # Verify it's running
            if (Test-ServiceHealth -Url "http://localhost:$MemorAIPort/health" -ServiceName "MemorAI MCP Server") {
                return $memoraiProcess
            }
            else {
                Write-Warning "⚠️ MemorAI MCP Server may not have started correctly"
                return $memoraiProcess
            }
        }
        else {
            Write-Error "❌ Failed to start MemorAI MCP Server"
            return $null
        }
    }
    catch {
        Write-Error "❌ Error starting MemorAI MCP Server: $($_.Exception.Message)"
        return $null
    }
}

# Status check
if ($StatusCheck) {
    Write-Info "🔍 Checking service status..."
    
    $cbdHealthy = Test-ServiceHealth -Url "http://localhost:$CBDPort/health" -ServiceName "CBD Database"
    $memoraiHealthy = Test-ServiceHealth -Url "http://localhost:$MemorAIPort/health" -ServiceName "MemorAI MCP Server"
    
    Write-Host ""
    Write-Host "📊 Service Status Summary:" -ForegroundColor Cyan
    Write-Host "  CBD Database (port $CBDPort): $(if ($cbdHealthy) { '✅ HEALTHY' } else { '❌ DOWN' })"
    Write-Host "  MemorAI MCP (port $MemorAIPort): $(if ($memoraiHealthy) { '✅ HEALTHY' } else { '❌ DOWN' })"
    Write-Host ""
    
    exit 0
}

# Stop services
if ($Stop) {
    Write-Info "🛑 Stopping services..."
    
    Stop-ServiceOnPort -Port $CBDPort -ServiceName "CBD Database"
    Stop-ServiceOnPort -Port $MemorAIPort -ServiceName "MemorAI MCP Server"
    
    Write-Success "✅ All services stopped"
    exit 0
}

# Restart services
if ($Restart) {
    Write-Info "🔄 Restarting services..."
    
    # Stop first
    Stop-ServiceOnPort -Port $CBDPort -ServiceName "CBD Database"
    Stop-ServiceOnPort -Port $MemorAIPort -ServiceName "MemorAI MCP Server"
    
    Start-Sleep -Seconds 2
    
    # Then start (continue to main start logic)
}

# Main startup logic
Write-Info "🚀 Starting CBD Database and MemorAI MCP Server..."

# Ensure ports are clean
Write-Debug "Cleaning up ports before starting..."
Stop-ServiceOnPort -Port $CBDPort -ServiceName "CBD Database"
Stop-ServiceOnPort -Port $MemorAIPort -ServiceName "MemorAI MCP Server"

Start-Sleep -Seconds 1

# Start CBD Database first
$cbdProcess = Start-CBDDatabase
if (-not $cbdProcess) {
    Write-Error "❌ Failed to start CBD Database - aborting"
    exit 1
}

# Wait a moment for CBD to fully initialize
Write-Info "⏳ Waiting for CBD Database to initialize..."
Start-Sleep -Seconds 5

# Start MemorAI MCP Server
$memoraiProcess = Start-MemorAIMCP
if (-not $memoraiProcess) {
    Write-Error "❌ Failed to start MemorAI MCP Server"
    Write-Warning "🛑 Stopping CBD Database due to MemorAI failure..."
    if ($cbdProcess -and -not $cbdProcess.HasExited) {
        Stop-Process -Id $cbdProcess.Id -Force -ErrorAction SilentlyContinue
    }
    exit 1
}

# Final health check
Write-Info "🔍 Performing final health check..."
Start-Sleep -Seconds 3

$cbdHealthy = Test-ServiceHealth -Url "http://localhost:$CBDPort/health" -ServiceName "CBD Database"
$memoraiHealthy = Test-ServiceHealth -Url "http://localhost:$MemorAIPort/health" -ServiceName "MemorAI MCP Server"

# Summary
Write-Host ""
Write-Host "🎉 Startup Complete!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "📊 Service Status:" -ForegroundColor White
Write-Host "  🗃️ CBD Database:" -ForegroundColor Gray
Write-Host "    - Port: $CBDPort" -ForegroundColor Gray
Write-Host "    - Health: $(if ($cbdHealthy) { '✅ HEALTHY' } else { '❌ DOWN' })" -ForegroundColor Gray
Write-Host "    - URL: http://localhost:$CBDPort" -ForegroundColor Gray
Write-Host ""
Write-Host "  🧠 MemorAI MCP Server:" -ForegroundColor Gray
Write-Host "    - Port: $MemorAIPort" -ForegroundColor Gray
Write-Host "    - Health: $(if ($memoraiHealthy) { '✅ HEALTHY' } else { '❌ DOWN' })" -ForegroundColor Gray
Write-Host "    - URL: http://localhost:$MemorAIPort" -ForegroundColor Gray
Write-Host ""
Write-Host "🔧 Management Commands:" -ForegroundColor White
Write-Host "  Check Status: .\start-cbd-memorai.ps1 -StatusCheck" -ForegroundColor Gray
Write-Host "  Stop Services: .\start-cbd-memorai.ps1 -Stop" -ForegroundColor Gray
Write-Host "  Restart Services: .\start-cbd-memorai.ps1 -Restart" -ForegroundColor Gray
Write-Host ""

if ($cbdHealthy -and $memoraiHealthy) {
    Write-Success "🎯 All services are running successfully!"
    Write-Info "💡 Services will continue running in the background"
    Write-Info "💡 Close this window to keep services running, or press Ctrl+C to stop"
}
else {
    Write-Warning "⚠️ Some services may not be fully operational"
    Write-Info "💡 Check the service logs for more details"
}

Write-Host "=================================================" -ForegroundColor Cyan
