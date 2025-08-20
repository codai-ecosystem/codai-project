#!/usr/bin/env pwsh

# Start MemorAI MCP Server
# Navigate to correct directory
Set-Location "E:\GitHub\codai-project\packages\memorai-mcp"

# Set environment variables
$env:MEMORAI_API_KEY = "memorai-dev-key-2025"
$env:MEMORAI_MCP_PORT = "4950"
$env:PORT = "4950"
$env:NODE_ENV = "development"
$env:DEBUG = "memorai:*"
$env:MEMORAI_DEBUG = "true"
$env:MEMORAI_LOG_LEVEL = "debug"
$env:MEMORAI_CBD_PATH = "./memorai-cbd-data"

Write-Host "🚀 Starting MemorAI MCP Server..." -ForegroundColor Green
Write-Host "📁 Working Directory: $(Get-Location)" -ForegroundColor Cyan
Write-Host "🔧 Port: $env:PORT" -ForegroundColor Cyan
Write-Host "🔑 API Key: $env:MEMORAI_API_KEY" -ForegroundColor Cyan

# Start the server
node memorai-mcp-vscode.cjs
