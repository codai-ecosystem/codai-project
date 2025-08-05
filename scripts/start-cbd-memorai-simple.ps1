# 🚀 Simple CBD & MemorAI MCP Startup Script
# Fixed version that doesn't cause server crashes
# Version: 1.2.0 (Simplified & Stable)

param(
    [string]$CodeaiPath = "",
    [switch]$Status,
    [switch]$Stop,
    [switch]$Help,
    [switch]$Verbose
)

# Colors and logging
function Write-Success { param($msg) Write-Host "✅ $msg" -ForegroundColor Green }
function Write-Error { param($msg) Write-Host "❌ $msg" -ForegroundColor Red }
function Write-Info { param($msg) Write-Host "ℹ️ $msg" -ForegroundColor Cyan }
function Write-Warning { param($msg) Write-Host "⚠️ $msg" -ForegroundColor Yellow }

# Show help
if ($Help) {
    Write-Host "🚀 Simple CBD & MemorAI MCP Startup Script v1.2.0" -ForegroundColor Cyan
    Write-Host "=" * 50 -ForegroundColor Cyan
    Write-Host ""
    Write-Host "USAGE:"
    Write-Host "  .\start-cbd-memorai-simple.ps1 [OPTIONS] [CODAI_PROJECT_PATH]"
    Write-Host ""
    Write-Host "OPTIONS:"
    Write-Host "  -Help           Show this help"
    Write-Host "  -Status         Check if services are running"
    Write-Host "  -Stop           Stop all services"
    Write-Host "  -Verbose        Enable verbose output"
    Write-Host ""
    Write-Host "EXAMPLES:"
    Write-Host "  .\start-cbd-memorai-simple.ps1"
    Write-Host "  .\start-cbd-memorai-simple.ps1 -Status"
    Write-Host "  .\start-cbd-memorai-simple.ps1 -Stop"
    Write-Host ""
    exit 0
}

Write-Host "🚀 Simple CBD & MemorAI MCP Startup Script v1.2.0" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan

# Auto-detect path
if (-not $CodeaiPath) {
    $possiblePaths = @(
        "E:\GitHub\codai-project",
        "C:\Users\$env:USERNAME\codai-project",
        "C:\Users\$env:USERNAME\GitHub\codai-project",
        ".\codai-project",
        "..\codai-project"
    )
    
    foreach ($path in $possiblePaths) {
        if ((Test-Path $path) -and (Test-Path "$path\packages\cbd") -and (Test-Path "$path\packages\memorai-mcp")) {
            $CodeaiPath = $path
            Write-Success "Found codai-project at: $CodeaiPath"
            break
        }
    }
    
    if (-not $CodeaiPath) {
        Write-Error "Could not find codai-project. Please specify the path."
        exit 1
    }
}

$cbdPath = "$CodeaiPath\packages\cbd"
$memoraiPath = "$CodeaiPath\packages\memorai-mcp"

# Validate paths
if (-not (Test-Path $cbdPath)) {
    Write-Error "CBD path not found: $cbdPath"
    exit 1
}

if (-not (Test-Path $memoraiPath)) {
    Write-Error "MemorAI path not found: $memoraiPath"
    exit 1
}

# Check if processes are running
function Test-ProcessRunning {
    param([int]$Port, [string]$ServiceName)
    
    try {
        $connections = netstat -ano | findstr ":$Port "
        if ($connections) {
            Write-Success "$ServiceName is running on port $Port"
            return $true
        } else {
            Write-Warning "$ServiceName is not running on port $Port"
            return $false
        }
    } catch {
        Write-Warning "Could not check $ServiceName status"
        return $false
    }
}

# Stop services
function Stop-Services {
    Write-Info "🛑 Stopping services..."
    
    # Stop processes on specific ports
    $ports = @(8080, 4950, 4180)  # Include both old and new CBD ports
    foreach ($port in $ports) {
        try {
            $processes = netstat -ano | findstr ":$port " | ForEach-Object { ($_ -split '\s+')[-1] } | Sort-Object -Unique
            foreach ($pid in $processes) {
                if ($pid -and $pid -ne "0") {
                    taskkill /F /PID $pid 2>$null
                    if ($?) {
                        Write-Success "Stopped process $pid on port $port"
                    }
                }
            }
        } catch {
            # Ignore errors
        }
    }
    
    # Also stop any tsx or node processes that might be related
    try {
        Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
        Write-Success "Stopped node processes"
    } catch {
        # Ignore errors
    }
}

# Status check
if ($Status) {
    Write-Info "🔍 Checking service status..."
    $cbdRunning = Test-ProcessRunning -Port 8080 -ServiceName "CBD Database"
    $memoraiRunning = Test-ProcessRunning -Port 4950 -ServiceName "MemorAI MCP"
    
    Write-Host ""
    Write-Host "📊 Service Status Summary:" -ForegroundColor Cyan
    Write-Host "  CBD Database (port 8080): $(if ($cbdRunning) { '✅ RUNNING' } else { '❌ STOPPED' })"
    Write-Host "  MemorAI MCP (port 4950): $(if ($memoraiRunning) { '✅ RUNNING' } else { '❌ STOPPED' })"
    Write-Host ""
    exit 0
}

# Stop services
if ($Stop) {
    Stop-Services
    Write-Success "All services stopped"
    exit 0
}

# Start services
Write-Info "🚀 Starting CBD Database and MemorAI MCP Server..."

# Clean up first
Stop-Services
Start-Sleep -Seconds 2

Write-Info "🗃️ Starting CBD Database..."

# Start CBD in background
$cbdJob = Start-Job -ScriptBlock {
    param($cbdPath)
    Set-Location $cbdPath
    $env:NODE_ENV = "development"
    $env:PORT = "8080"  # Set CBD to run on port 8080
    Remove-Item Env:\MEMORAI_* -ErrorAction SilentlyContinue  # Remove any MemorAI env vars
    npx tsx src/start.ts
} -ArgumentList $cbdPath

if ($cbdJob) {
    Write-Success "CBD Database job started (Job ID: $($cbdJob.Id))"
} else {
    Write-Error "Failed to start CBD Database"
    exit 1
}

# Wait a bit for CBD to start
Write-Info "⏳ Waiting for CBD to initialize..."
Start-Sleep -Seconds 8

Write-Info "🧠 Starting MemorAI MCP Server..."

# Start MemorAI in background
$memoraiJob = Start-Job -ScriptBlock {
    param($memoraiPath)
    Set-Location $memoraiPath
    $env:MEMORAI_API_KEY = "memorai-dev-key-2025"
    $env:MEMORAI_MCP_PORT = "4950"
    $env:PORT = "4950"
    $env:NODE_ENV = "development"
    if ($using:Verbose) {
        $env:DEBUG = "memorai:*"
        $env:MEMORAI_DEBUG = "true"
        $env:MEMORAI_LOG_LEVEL = "debug"
    } else {
        $env:MEMORAI_LOG_LEVEL = "info"
    }
    $env:MEMORAI_CBD_PATH = "./memorai-cbd-data"
    node memorai-mcp-vscode.cjs
} -ArgumentList $memoraiPath

if ($memoraiJob) {
    Write-Success "MemorAI MCP job started (Job ID: $($memoraiJob.Id))"
} else {
    Write-Error "Failed to start MemorAI MCP"
    Stop-Job $cbdJob -PassThru | Remove-Job
    exit 1
}

# Wait for services to start
Write-Info "⏳ Waiting for services to start..."
Start-Sleep -Seconds 5

# Final status check
Write-Info "🔍 Checking final status..."
$cbdRunning = Test-ProcessRunning -Port 8080 -ServiceName "CBD Database"
$memoraiRunning = Test-ProcessRunning -Port 4950 -ServiceName "MemorAI MCP"

# Summary
Write-Host ""
Write-Host "🎉 Startup Complete!" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host "📊 Service Status:" -ForegroundColor Cyan
Write-Host "  🗃️ CBD Database:"
Write-Host "    - Port: 8080"
Write-Host "    - Status: $(if ($cbdRunning) { '✅ RUNNING' } else { '❌ FAILED' })"
Write-Host "    - URL: http://localhost:8080"
Write-Host ""
Write-Host "  🧠 MemorAI MCP Server:"
Write-Host "    - Port: 4950"
Write-Host "    - Status: $(if ($memoraiRunning) { '✅ RUNNING' } else { '❌ FAILED' })"
Write-Host "    - URL: http://localhost:4950"
Write-Host ""

if ($cbdRunning -and $memoraiRunning) {
    Write-Success "🎯 All services started successfully!"
    Write-Info "💡 Services are running in background jobs"
    Write-Info "💡 Use -Status to check status, -Stop to stop services"
    Write-Info "💡 Job IDs: CBD=$($cbdJob.Id), MemorAI=$($memoraiJob.Id)"
} else {
    Write-Warning "⚠️ Some services failed to start properly"
    Write-Info "💡 Use -Status to check detailed status"
    if (-not $cbdRunning) { Write-Error "CBD Database failed to start on port 4180" }
    if (-not $memoraiRunning) { Write-Error "MemorAI MCP failed to start on port 4950" }
}

Write-Host "=" * 50 -ForegroundColor Cyan
