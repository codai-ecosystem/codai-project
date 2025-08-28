#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Start RomAI Production Monitoring Integration System
    
.DESCRIPTION
    Starts the complete RomAI monitoring stack including:
    - Production Monitor (health checks, alerts)
    - Performance Optimizer (caching, GPU acceleration)
    - Real-time Dashboard (WebSocket updates)
    - Integration Server (coordination layer)
    
.PARAMETER Port
    Port for the integration server (default: 6102)
    
.PARAMETER RomAIPort
    Port where RomAI main server is running (default: 6101)
    
.PARAMETER DashboardPort
    Port for dashboard access (integrated into main server)
    
.PARAMETER LogLevel
    Logging level (default: INFO)
    
.EXAMPLE
    .\start-romai-monitoring.ps1
    
.EXAMPLE
    .\start-romai-monitoring.ps1 -Port 6103 -LogLevel DEBUG
#>

param(
    [int]$Port = 6102,
    [int]$RomAIPort = 6101,
    [string]$LogLevel = "INFO"
)

# Script configuration
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Colors for output
$ColorInfo = "Cyan"
$ColorSuccess = "Green"
$ColorWarning = "Yellow"
$ColorError = "Red"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Test-RomAIServer {
    param([int]$Port)
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:$Port/health" -Method Get -TimeoutSec 5
        return $true
    }
    catch {
        return $false
    }
}

function Test-Port {
    param([int]$Port)
    
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

function Start-MonitoringIntegration {
    param(
        [int]$Port,
        [int]$RomAIPort,
        [string]$LogLevel
    )
    
    Write-ColorOutput "🚀 ROMAI PRODUCTION MONITORING INTEGRATION" $ColorInfo
    Write-ColorOutput "=============================================" $ColorInfo
    Write-ColorOutput ""
    
    # Check prerequisites
    Write-ColorOutput "📋 Checking prerequisites..." $ColorInfo
    
    # Check if RomAI server is running
    Write-ColorOutput "🔍 Checking RomAI server on port $RomAIPort..." $ColorWarning
    if (-not (Test-RomAIServer -Port $RomAIPort)) {
        Write-ColorOutput "❌ RomAI server not running on port $RomAIPort" $ColorError
        Write-ColorOutput "   Please start RomAI server first using:" $ColorWarning
        Write-ColorOutput "   python -m uvicorn ml.serving.model_server:app --host 0.0.0.0 --port $RomAIPort" $ColorWarning
        return $false
    }
    Write-ColorOutput "✅ RomAI server is running and healthy" $ColorSuccess
    
    # Check if integration port is available
    Write-ColorOutput "🔍 Checking integration port $Port..." $ColorWarning
    if (Test-Port -Port $Port) {
        Write-ColorOutput "❌ Port $Port is already in use" $ColorError
        Write-ColorOutput "   Please choose a different port or stop the service using this port" $ColorWarning
        return $false
    }
    Write-ColorOutput "✅ Port $Port is available" $ColorSuccess
    
    # Check Python environment
    Write-ColorOutput "🐍 Checking Python environment..." $ColorWarning
    try {
        $pythonVersion = python --version 2>&1
        Write-ColorOutput "✅ Python: $pythonVersion" $ColorSuccess
    }
    catch {
        Write-ColorOutput "❌ Python not found in PATH" $ColorError
        return $false
    }
    
    # Set environment variables
    $env:PYTHONPATH = "$(Get-Location)\src"
    $env:ROMAI_MONITORING_PORT = $Port
    $env:ROMAI_SERVER_PORT = $RomAIPort
    $env:ROMAI_LOG_LEVEL = $LogLevel
    
    Write-ColorOutput "🔧 Environment configured:" $ColorInfo
    Write-ColorOutput "   PYTHONPATH: $env:PYTHONPATH" $ColorWarning
    Write-ColorOutput "   Current Directory: $(Get-Location)" $ColorWarning
    Write-ColorOutput "   Monitoring Port: $Port" $ColorWarning
    Write-ColorOutput "   RomAI Port: $RomAIPort" $ColorWarning
    Write-ColorOutput "   Log Level: $LogLevel" $ColorWarning
    Write-ColorOutput ""
    
    # Start the monitoring integration
    Write-ColorOutput "🚀 Starting RomAI Monitoring Integration..." $ColorInfo
    Write-ColorOutput "📊 Components starting:" $ColorWarning
    Write-ColorOutput "   • Production Monitor (health checks, alerts)" $ColorWarning
    Write-ColorOutput "   • Performance Optimizer (caching, GPU acceleration)" $ColorWarning
    Write-ColorOutput "   • Real-time Dashboard (WebSocket updates)" $ColorWarning
    Write-ColorOutput "   • Integration Server (coordination layer)" $ColorWarning
    Write-ColorOutput ""
    
    Write-ColorOutput "🌐 Access Points:" $ColorInfo
    Write-ColorOutput "   • Integration API: http://localhost:$Port" $ColorSuccess
    Write-ColorOutput "   • Health Check: http://localhost:$Port/integration/health" $ColorSuccess
    Write-ColorOutput "   • Metrics API: http://localhost:$Port/integration/metrics" $ColorSuccess
    Write-ColorOutput "   • Dashboard: http://localhost:$Port/dashboard/" $ColorSuccess
    Write-ColorOutput "   • WebSocket: ws://localhost:$Port/ws" $ColorSuccess
    Write-ColorOutput ""
    
    Write-ColorOutput "⚡ Starting monitoring integration server..." $ColorSuccess
    Write-ColorOutput "   Press Ctrl+C to stop the server" $ColorWarning
    Write-ColorOutput ""
    
    try {
        # Change to RomAI directory
        Push-Location "apps\romai"
        
        # Start the monitoring integration
        python monitoring\monitor_integration.py
        
    }
    catch {
        Write-ColorOutput "❌ Failed to start monitoring integration: $($_.Exception.Message)" $ColorError
        return $false
    }
    finally {
        Pop-Location
    }
    
    return $true
}

function Show-Help {
    Write-ColorOutput "🔧 RomAI Production Monitoring Integration" $ColorInfo
    Write-ColorOutput "==========================================" $ColorInfo
    Write-ColorOutput ""
    Write-ColorOutput "This script starts the complete RomAI monitoring stack:" $ColorWarning
    Write-ColorOutput "• Production health monitoring and alerting" $ColorWarning
    Write-ColorOutput "• Performance optimization with caching and GPU acceleration" $ColorWarning
    Write-ColorOutput "• Real-time dashboard with WebSocket updates" $ColorWarning
    Write-ColorOutput "• Integration server for component coordination" $ColorWarning
    Write-ColorOutput ""
    Write-ColorOutput "Usage:" $ColorInfo
    Write-ColorOutput "  .\start-romai-monitoring.ps1 [-Port <port>] [-RomAIPort <port>] [-LogLevel <level>]" $ColorWarning
    Write-ColorOutput ""
    Write-ColorOutput "Parameters:" $ColorInfo
    Write-ColorOutput "  -Port         Integration server port (default: 6102)" $ColorWarning
    Write-ColorOutput "  -RomAIPort    RomAI main server port (default: 6101)" $ColorWarning
    Write-ColorOutput "  -LogLevel     Logging level: DEBUG, INFO, WARNING, ERROR (default: INFO)" $ColorWarning
    Write-ColorOutput ""
    Write-ColorOutput "Prerequisites:" $ColorInfo
    Write-ColorOutput "• RomAI main server must be running on the specified port" $ColorWarning
    Write-ColorOutput "• Python environment with required dependencies" $ColorWarning
    Write-ColorOutput "• Redis server (for caching optimization)" $ColorWarning
    Write-ColorOutput ""
}

# Main execution
try {
    Write-ColorOutput "🧠 RomAI Production Monitoring Integration Starter" $ColorInfo
    Write-ColorOutput "===================================================" $ColorInfo
    Write-ColorOutput ""
    
    # Validate parameters
    if ($Port -lt 1 -or $Port -gt 65535) {
        Write-ColorOutput "❌ Invalid port number: $Port" $ColorError
        Show-Help
        exit 1
    }
    
    if ($RomAIPort -lt 1 -or $RomAIPort -gt 65535) {
        Write-ColorOutput "❌ Invalid RomAI port number: $RomAIPort" $ColorError
        Show-Help
        exit 1
    }
    
    $validLogLevels = @("DEBUG", "INFO", "WARNING", "ERROR")
    if ($LogLevel -notin $validLogLevels) {
        Write-ColorOutput "❌ Invalid log level: $LogLevel" $ColorError
        Write-ColorOutput "   Valid levels: $($validLogLevels -join ', ')" $ColorWarning
        Show-Help
        exit 1
    }
    
    # Start monitoring integration
    $success = Start-MonitoringIntegration -Port $Port -RomAIPort $RomAIPort -LogLevel $LogLevel
    
    if (-not $success) {
        Write-ColorOutput ""
        Write-ColorOutput "❌ Failed to start monitoring integration" $ColorError
        Write-ColorOutput "   Check the prerequisites and try again" $ColorWarning
        exit 1
    }
    
}
catch {
    Write-ColorOutput ""
    Write-ColorOutput "❌ Unexpected error: $($_.Exception.Message)" $ColorError
    Write-ColorOutput "   Stack trace:" $ColorWarning
    Write-ColorOutput $_.ScriptStackTrace $ColorWarning
    exit 1
}
finally {
    Write-ColorOutput ""
    Write-ColorOutput "🏁 RomAI Monitoring Integration session ended" $ColorInfo
}