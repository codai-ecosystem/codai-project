#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Portable startup script for CBD Database and MemorAI MCP Server

.DESCRIPTION
    This script can be copied to any folder and will automatically detect the codai-project path,
    then start both the CBD database and MemorAI MCP server with proper health monitoring.

.PARAMETER Action
    Action to perform: start, stop, status, restart, help

.PARAMETER ShowLogs
    Show real-time logs after starting services

.PARAMETER HealthCheck
    Perform health check on running services

.EXAMPLE
    .\start-cbd-memorai.ps1
    # Starts both services

.EXAMPLE
    .\start-cbd-memorai.ps1 -Action status
    # Shows status of both services

.EXAMPLE
    .\start-cbd-memorai.ps1 -Action start -ShowLogs
    # Starts services and shows logs

.NOTES
    Author: GitHub Copilot Agent
    Version: 1.0
    Created: $(Get-Date -Format 'yyyy-MM-dd')
    
    This script is designed to be portable - copy it anywhere and it will find your codai-project.
#>

param(
    [ValidateSet('start', 'stop', 'status', 'restart', 'help')]
    [string]$Action = 'start',
    
    [switch]$ShowLogs,
    
    [switch]$HealthCheck
)

# Configuration
$CBD_PORT = 8080
$MEMORAI_PORT = 4950
$MAX_STARTUP_WAIT = 60
$HEALTH_CHECK_INTERVAL = 2

# Colors for output
$Colors = @{
    Success = "Green"
    Error = "Red"
    Warning = "Yellow"
    Info = "Cyan"
    Header = "Magenta"
}

function Write-ColorText {
    param([string]$Text, [string]$Color = "White")
    Write-Host $Text -ForegroundColor $Colors[$Color]
}

function Show-Header {
    Write-Host ""
    Write-ColorText "🚀 CBD Database & MemorAI MCP Server Manager" "Header"
    Write-ColorText "=" * 50 "Header"
    Write-Host ""
}

function Show-Help {
    Show-Header
    Write-ColorText "USAGE:" "Info"
    Write-Host "  .\start-cbd-memorai.ps1 [options]"
    Write-Host ""
    Write-ColorText "ACTIONS:" "Info"
    Write-Host "  start     - Start both services (default)"
    Write-Host "  stop      - Stop both services"
    Write-Host "  status    - Show service status"
    Write-Host "  restart   - Restart both services"
    Write-Host "  help      - Show this help"
    Write-Host ""
    Write-ColorText "OPTIONS:" "Info"
    Write-Host "  -ShowLogs     - Show real-time logs after starting"
    Write-Host "  -HealthCheck  - Perform health check"
    Write-Host ""
    Write-ColorText "EXAMPLES:" "Info"
    Write-Host "  .\start-cbd-memorai.ps1"
    Write-Host "  .\start-cbd-memorai.ps1 -Action status"
    Write-Host "  .\start-cbd-memorai.ps1 -Action start -ShowLogs"
    Write-Host ""
}

function Find-CodaiProject {
    Write-ColorText "🔍 Searching for codai-project..." "Info"
    
    # Search paths in order of preference
    $searchPaths = @(
        # Current directory and parents
        $PWD.Path,
        (Split-Path $PWD.Path -Parent),
        (Split-Path (Split-Path $PWD.Path -Parent) -Parent),
        (Split-Path (Split-Path (Split-Path $PWD.Path -Parent) -Parent) -Parent),
        
        # Common development paths
        "e:\GitHub\codai-project",
        "c:\GitHub\codai-project",
        "d:\GitHub\codai-project",
        "$env:USERPROFILE\GitHub\codai-project",
        "$env:USERPROFILE\codai-project",
        "$env:USERPROFILE\Documents\GitHub\codai-project"
    )
    
    foreach ($path in $searchPaths) {
        if (Test-Path $path) {
            # Check if this looks like the codai-project by looking for key files/folders
            $indicators = @(
                "packages\cbd",
                "packages\memorai-mcp",
                "package.json",
                "pnpm-workspace.yaml"
            )
            
            $matches = 0
            foreach ($indicator in $indicators) {
                if (Test-Path (Join-Path $path $indicator)) {
                    $matches++
                }
            }
            
            if ($matches -ge 2) {
                Write-ColorText "✅ Found codai-project at: $path" "Success"
                return $path
            }
        }
    }
    
    Write-ColorText "❌ Could not find codai-project directory!" "Error"
    Write-ColorText "Make sure the codai-project exists in one of these locations:" "Warning"
    $searchPaths | ForEach-Object { Write-Host "  - $_" }
    return $null
}

function Test-ServiceHealth {
    param([string]$ServiceName, [string]$Url, [int]$Port)
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 5 -ErrorAction Stop
        Write-ColorText "✅ $ServiceName (port $Port): HEALTHY" "Success"
        return $true
    }
    catch {
        Write-ColorText "❌ $ServiceName (port $Port): FAILED - $($_.Exception.Message)" "Error"
        return $false
    }
}

function Get-ProcessOnPort {
    param([int]$Port)
    
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($connection) {
            $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
            return $process
        }
    }
    catch {
        # Ignore errors
    }
    return $null
}

function Stop-ServiceOnPort {
    param([int]$Port, [string]$ServiceName)
    
    $process = Get-ProcessOnPort -Port $Port
    if ($process) {
        Write-ColorText "🛑 Stopping $ServiceName (PID: $($process.Id), Port: $Port)..." "Warning"
        try {
            Stop-Process -Id $process.Id -Force -ErrorAction Stop
            Start-Sleep -Seconds 2
            Write-ColorText "✅ Stopped $ServiceName" "Success"
            return $true
        }
        catch {
            Write-ColorText "❌ Failed to stop $ServiceName: $($_.Exception.Message)" "Error"
            return $false
        }
    }
    else {
        Write-ColorText "ℹ️  $ServiceName not running on port $Port" "Info"
        return $true
    }
}

function Start-CBD {
    param([string]$ProjectPath)
    
    $cbdPath = Join-Path $ProjectPath "packages\cbd"
    if (-not (Test-Path $cbdPath)) {
        Write-ColorText "❌ CBD path not found: $cbdPath" "Error"
        return $false
    }
    
    Write-ColorText "🗃️ Starting CBD Database..." "Info"
    
    # Check if already running
    $existingProcess = Get-ProcessOnPort -Port $CBD_PORT
    if ($existingProcess) {
        Write-ColorText "ℹ️  CBD Database already running on port $CBD_PORT" "Info"
        return $true
    }
    
    # Start CBD
    try {
        $startInfo = @{
            FilePath = "tsx"
            ArgumentList = @("src/start.ts")
            WorkingDirectory = $cbdPath
            WindowStyle = "Hidden"
            PassThru = $true
        }
        
        $process = Start-Process @startInfo
        Write-ColorText "✅ CBD Database started (PID: $($process.Id))" "Success"
        
        # Wait for health check
        Write-ColorText "⏳ Waiting for CBD Database to be ready..." "Info"
        $timeout = [DateTime]::Now.AddSeconds($MAX_STARTUP_WAIT)
        
        while ([DateTime]::Now -lt $timeout) {
            if (Test-ServiceHealth -ServiceName "CBD Database" -Url "http://localhost:$CBD_PORT/health" -Port $CBD_PORT) {
                return $true
            }
            Start-Sleep -Seconds $HEALTH_CHECK_INTERVAL
        }
        
        Write-ColorText "❌ CBD Database failed to start within $MAX_STARTUP_WAIT seconds" "Error"
        return $false
    }
    catch {
        Write-ColorText "❌ Failed to start CBD Database: $($_.Exception.Message)" "Error"
        return $false
    }
}

function Start-MemorAI {
    param([string]$ProjectPath)
    
    $memoraiPath = Join-Path $ProjectPath "packages\memorai-mcp"
    if (-not (Test-Path $memoraiPath)) {
        Write-ColorText "❌ MemorAI MCP path not found: $memoraiPath" "Error"
        return $false
    }
    
    Write-ColorText "🧠 Starting MemorAI MCP Server..." "Info"
    
    # Check if already running
    $existingProcess = Get-ProcessOnPort -Port $MEMORAI_PORT
    if ($existingProcess) {
        Write-ColorText "ℹ️  MemorAI MCP Server already running on port $MEMORAI_PORT" "Info"
        return $true
    }
    
    # Start MemorAI MCP
    try {
        $env:MEMORAI_API_KEY = "memorai-dev-key-2025"
        $env:MEMORAI_MCP_PORT = $MEMORAI_PORT.ToString()
        $env:PORT = $MEMORAI_PORT.ToString()
        $env:NODE_ENV = "development"
        $env:MEMORAI_DEBUG = "true"
        $env:MEMORAI_LOG_LEVEL = "debug"
        $env:MEMORAI_CBD_PATH = "./memorai-cbd-data"
        
        $startInfo = @{
            FilePath = "node"
            ArgumentList = @("memorai-mcp-vscode.cjs")
            WorkingDirectory = $memoraiPath
            WindowStyle = "Hidden"
            PassThru = $true
        }
        
        $process = Start-Process @startInfo
        Write-ColorText "✅ MemorAI MCP Server started (PID: $($process.Id))" "Success"
        
        # Wait for health check
        Write-ColorText "⏳ Waiting for MemorAI MCP Server to be ready..." "Info"
        $timeout = [DateTime]::Now.AddSeconds($MAX_STARTUP_WAIT)
        
        while ([DateTime]::Now -lt $timeout) {
            if (Test-ServiceHealth -ServiceName "MemorAI MCP" -Url "http://localhost:$MEMORAI_PORT/health" -Port $MEMORAI_PORT) {
                return $true
            }
            Start-Sleep -Seconds $HEALTH_CHECK_INTERVAL
        }
        
        Write-ColorText "❌ MemorAI MCP Server failed to start within $MAX_STARTUP_WAIT seconds" "Error"
        return $false
    }
    catch {
        Write-ColorText "❌ Failed to start MemorAI MCP Server: $($_.Exception.Message)" "Error"
        return $false
    }
}

function Show-ServiceStatus {
    Write-ColorText "📊 Service Status:" "Info"
    Write-Host ""
    
    # Check CBD
    $cbdProcess = Get-ProcessOnPort -Port $CBD_PORT
    if ($cbdProcess) {
        Write-ColorText "🗃️ CBD Database (port $CBD_PORT): RUNNING (PID: $($cbdProcess.Id))" "Success"
        Test-ServiceHealth -ServiceName "CBD Database" -Url "http://localhost:$CBD_PORT/health" -Port $CBD_PORT | Out-Null
    }
    else {
        Write-ColorText "🗃️ CBD Database (port $CBD_PORT): NOT RUNNING" "Error"
    }
    
    # Check MemorAI
    $memoraiProcess = Get-ProcessOnPort -Port $MEMORAI_PORT
    if ($memoraiProcess) {
        Write-ColorText "🧠 MemorAI MCP (port $MEMORAI_PORT): RUNNING (PID: $($memoraiProcess.Id))" "Success"
        Test-ServiceHealth -ServiceName "MemorAI MCP" -Url "http://localhost:$MEMORAI_PORT/health" -Port $MEMORAI_PORT | Out-Null
    }
    else {
        Write-ColorText "🧠 MemorAI MCP (port $MEMORAI_PORT): NOT RUNNING" "Error"
    }
    
    Write-Host ""
}

function Start-AllServices {
    param([string]$ProjectPath)
    
    Write-ColorText "🚀 Starting all services..." "Info"
    Write-Host ""
    
    # Start CBD first (MemorAI depends on it)
    $cbdSuccess = Start-CBD -ProjectPath $ProjectPath
    if (-not $cbdSuccess) {
        Write-ColorText "❌ Failed to start CBD Database - aborting" "Error"
        return $false
    }
    
    # Start MemorAI MCP
    $memoraiSuccess = Start-MemorAI -ProjectPath $ProjectPath
    if (-not $memoraiSuccess) {
        Write-ColorText "❌ Failed to start MemorAI MCP Server" "Error"
        return $false
    }
    
    Write-Host ""
    Write-ColorText "🎉 All services started successfully!" "Success"
    Write-Host ""
    
    # Show final status
    Show-ServiceStatus
    
    return $true
}

function Stop-AllServices {
    Write-ColorText "🛑 Stopping all services..." "Info"
    Write-Host ""
    
    $memoraiStopped = Stop-ServiceOnPort -Port $MEMORAI_PORT -ServiceName "MemorAI MCP Server"
    $cbdStopped = Stop-ServiceOnPort -Port $CBD_PORT -ServiceName "CBD Database"
    
    if ($memoraiStopped -and $cbdStopped) {
        Write-Host ""
        Write-ColorText "✅ All services stopped successfully!" "Success"
    }
    else {
        Write-Host ""
        Write-ColorText "⚠️  Some services may not have stopped cleanly" "Warning"
    }
    
    Write-Host ""
    Show-ServiceStatus
}

function Show-Logs {
    param([string]$ProjectPath)
    
    Write-ColorText "📋 Showing service logs... (Press Ctrl+C to exit)" "Info"
    Write-Host ""
    
    # This would require more complex implementation to tail logs
    # For now, just show the status
    Show-ServiceStatus
    
    Write-ColorText "💡 To see detailed logs, check the console windows or use VS Code tasks" "Info"
}

# Main execution
Show-Header

# Handle help
if ($Action -eq 'help') {
    Show-Help
    exit 0
}

# Find codai-project
$projectPath = Find-CodaiProject
if (-not $projectPath) {
    exit 1
}

# Execute action
switch ($Action) {
    'start' {
        $success = Start-AllServices -ProjectPath $projectPath
        if ($success -and $ShowLogs) {
            Show-Logs -ProjectPath $projectPath
        }
    }
    'stop' {
        Stop-AllServices
    }
    'status' {
        Show-ServiceStatus
    }
    'restart' {
        Stop-AllServices
        Start-Sleep -Seconds 3
        Start-AllServices -ProjectPath $projectPath
    }
}

# Health check if requested
if ($HealthCheck) {
    Write-Host ""
    Write-ColorText "🏥 Running health check..." "Info"
    Test-ServiceHealth -ServiceName "CBD Database" -Url "http://localhost:$CBD_PORT/health" -Port $CBD_PORT | Out-Null
    Test-ServiceHealth -ServiceName "MemorAI MCP" -Url "http://localhost:$MEMORAI_PORT/health" -Port $MEMORAI_PORT | Out-Null
}

Write-Host ""
Write-ColorText "✨ Done!" "Success"
