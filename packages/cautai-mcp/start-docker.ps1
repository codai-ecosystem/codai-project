#!/usr/bin/env pwsh
# CAUTAI MCP HTTP Server Docker Startup Script

Write-Host '🔍 Starting CAUTAI MCP HTTP Server (Local Docker)...' -ForegroundColor Cyan
Write-Host '=======================================================' -ForegroundColor Cyan

# Stop existing container
Write-Host '📋 Stopping existing container...' -ForegroundColor Yellow
docker stop cautai-mcp-http-server 2>$null | Out-Null
docker rm cautai-mcp-http-server 2>$null | Out-Null

# Build Docker image
Write-Host '🔨 Building Docker image...' -ForegroundColor Green
docker build -f Dockerfile -t cautai-mcp-http-local . | Select-String -Pattern '(Successfully built|Successfully tagged|ERROR|FAILED)' | Write-Host

# Start container
Write-Host '🚀 Starting container...' -ForegroundColor Green
$containerId = docker run -d --name cautai-mcp-http-server -p 4952:4952 cautai-mcp-http-local
Write-Host "✅ Container started: $containerId" -ForegroundColor Green

# Wait for startup
Write-Host '⏳ Waiting for startup...' -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check status
Write-Host '📊 Container status:' -ForegroundColor Cyan
docker ps --filter name=cautai-mcp-http-server --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}"

# Health check
Write-Host '💚 Health check:' -ForegroundColor Magenta
try {
    $health = Invoke-RestMethod -Uri 'http://localhost:4952/health' -Method Get -TimeoutSec 5
    Write-Host '✅ Server: HEALTHY' -ForegroundColor Green
    Write-Host '🔗 Endpoint: http://localhost:4952' -ForegroundColor White
    Write-Host '🛠️  Tools: search_web, compose_answer' -ForegroundColor White
    Write-Host "📋 Service: $($health.service)" -ForegroundColor White
    Write-Host "🏷️  Version: $($health.version)" -ForegroundColor White
} catch {
    Write-Host '❌ Health check failed' -ForegroundColor Red
    Write-Host 'Recent logs:' -ForegroundColor Yellow
    docker logs cautai-mcp-http-server --tail 5
}

Write-Host ''
Write-Host '🎉 CAUTAI MCP HTTP Server is ready!' -ForegroundColor Green
Write-Host 'Test search: curl -X POST http://localhost:4952/mcp -H "Content-Type: application/json" -d "{\"jsonrpc\":\"2.0\",\"method\":\"tools/call\",\"params\":{\"name\":\"search_web\",\"arguments\":{\"query\":\"test\",\"maxResults\":3}},\"id\":1}"'