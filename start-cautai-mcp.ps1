#!/usr/bin/env pwsh

# Start CAUTAI MCP Server
Write-Host "🚀 Starting CAUTAI MCP Server..." -ForegroundColor Cyan

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$mcpPath = Join-Path $scriptPath "packages\cautai-mcp"

try {
    Set-Location $mcpPath
    Write-Host "📂 Working directory: $mcpPath" -ForegroundColor Green
    Write-Host "🔧 Running npm run start:mcp..." -ForegroundColor Yellow
    
    npm run start:mcp
} catch {
    Write-Host "❌ Error starting CAUTAI MCP Server: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}