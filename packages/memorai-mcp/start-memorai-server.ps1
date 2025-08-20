#!/usr/bin/env pwsh

# MemorAI MCP Server Startup Script
# Starts the server in a separate process for VS Code integration

param(
    [switch]$Stop,
    [switch]$Status,
    [switch]$Test
)

$ServerPath = "e:\GitHub\codai-project\packages\memorai-mcp\memorai-mcp-vscode.cjs"
$ProcessName = "memorai-mcp-server"
$Port = 4950

function Start-MemorAIServer {
    Write-Host "🧠 Starting MemorAI MCP Server..." -ForegroundColor Cyan
    
    # Check if already running
    $existing = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*memorai-mcp-vscode.cjs*"
    }
    
    if ($existing) {
        Write-Host "✅ MemorAI MCP Server is already running (PID: $($existing.Id))" -ForegroundColor Green
        return $existing.Id
    }
    
    # Start the server
    $process = Start-Process -FilePath "node" -ArgumentList $ServerPath -WindowStyle Hidden -PassThru
    Start-Sleep -Seconds 3
    
    # Verify it started
    if (Test-ServerHealth) {
        Write-Host "✅ MemorAI MCP Server started successfully (PID: $($process.Id))" -ForegroundColor Green
        return $process.Id
    } else {
        Write-Host "❌ Failed to start MemorAI MCP Server" -ForegroundColor Red
        return $null
    }
}

function Stop-MemorAIServer {
    Write-Host "🛑 Stopping MemorAI MCP Server..." -ForegroundColor Yellow
    
    $processes = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*memorai-mcp-vscode.cjs*"
    }
    
    if ($processes) {
        $processes | Stop-Process -Force
        Write-Host "✅ MemorAI MCP Server stopped" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ MemorAI MCP Server is not running" -ForegroundColor Yellow
    }
}

function Get-ServerStatus {
    $processes = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*memorai-mcp-vscode.cjs*"
    }
    
    if ($processes) {
        Write-Host "✅ MemorAI MCP Server Status: RUNNING" -ForegroundColor Green
        foreach ($proc in $processes) {
            Write-Host "   PID: $($proc.Id), Memory: $([math]::Round($proc.WorkingSet64/1MB, 2)) MB" -ForegroundColor Cyan
        }
        return $true
    } else {
        Write-Host "❌ MemorAI MCP Server Status: NOT RUNNING" -ForegroundColor Red
        return $false
    }
}

function Test-ServerHealth {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:$Port/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ Health Check: PASSED" -ForegroundColor Green
        Write-Host "   Service: $($response.service)" -ForegroundColor Cyan
        Write-Host "   Version: $($response.version)" -ForegroundColor Cyan
        Write-Host "   Port: $($response.port)" -ForegroundColor Cyan
        Write-Host "   Uptime: $([math]::Round($response.uptime, 2)) seconds" -ForegroundColor Cyan
        Write-Host "   Total Memories: $($response.totalMemories)" -ForegroundColor Cyan
        return $true
    } catch {
        Write-Host "❌ Health Check: FAILED - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Main execution
if ($Stop) {
    Stop-MemorAIServer
} elseif ($Status) {
    Get-ServerStatus
} elseif ($Test) {
    if (Get-ServerStatus) {
        Test-ServerHealth
    }
} else {
    Start-MemorAIServer
}
