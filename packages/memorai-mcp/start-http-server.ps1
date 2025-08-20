#!/usr/bin/env pwsh
# Start MemorAI MCP HTTP Server with API key
$env:MEMORAI_API_KEY = "memorai-dev-key-2025"
$env:NODE_ENV = "development"
$env:DEBUG = "memorai:*"

Write-Host "🚀 Starting MemorAI MCP HTTP Server on port 8002..." -ForegroundColor Green
Write-Host "API Key: memorai-dev-key-2025" -ForegroundColor Yellow
Write-Host "Environment: Development" -ForegroundColor Yellow

node http-mcp-server.cjs
