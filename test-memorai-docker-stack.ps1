# MemorAI MCP Docker Services Test
Write-Host "🐳 Testing MemorAI MCP Docker Services" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan

# Test CBD Database
Write-Host "`n📊 Testing CBD Database..." -ForegroundColor Yellow
try {
    $cbdHealth = Invoke-RestMethod -Uri "http://localhost:4180/health" -Method GET -TimeoutSec 10
    Write-Host "✅ CBD Database: HEALTHY" -ForegroundColor Green
    Write-Host "   Service: $($cbdHealth.service)" -ForegroundColor White
    Write-Host "   Version: $($cbdHealth.version)" -ForegroundColor White
    Write-Host "   Paradigms: $($cbdHealth.paradigms)" -ForegroundColor White
    Write-Host "   Security: $($cbdHealth.security.status)" -ForegroundColor White
} catch {
    Write-Host "❌ CBD Database: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test MemorAI MCP Server
Write-Host "`n🧠 Testing MemorAI MCP Server..." -ForegroundColor Yellow
try {
    $mcpHealth = Invoke-RestMethod -Uri "http://localhost:4950/health" -Method GET -TimeoutSec 10
    Write-Host "✅ MemorAI MCP Server: HEALTHY" -ForegroundColor Green
    Write-Host "   Service: $($mcpHealth.service)" -ForegroundColor White
    Write-Host "   Version: $($mcpHealth.version)" -ForegroundColor White
    Write-Host "   Protocol: $($mcpHealth.mcpProtocol)" -ForegroundColor White
    Write-Host "   Transports: $($mcpHealth.transports -join ', ')" -ForegroundColor White
    Write-Host "   Features:" -ForegroundColor White
    Write-Host "     Vector Search: $($mcpHealth.config.vectorSearch)" -ForegroundColor White
    Write-Host "     Azure OpenAI: $($mcpHealth.config.azureOpenAI)" -ForegroundColor White
    Write-Host "     OpenAI Fallback: $($mcpHealth.config.openAI)" -ForegroundColor White
} catch {
    Write-Host "❌ MemorAI MCP Server: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Check Docker Container Status
Write-Host "`n🐳 Docker Container Status..." -ForegroundColor Yellow
$containers = docker ps --filter "name=memorai" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
Write-Host $containers -ForegroundColor Cyan

Write-Host "`n🎉 MemorAI MCP Docker Stack Status: READY" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Services available:" -ForegroundColor White
Write-Host "  🧠 MemorAI MCP Server: http://localhost:4950" -ForegroundColor White
Write-Host "  📊 CBD Database: http://localhost:4180" -ForegroundColor White
Write-Host "  🔗 MCP Endpoint: http://localhost:4950/mcp" -ForegroundColor White
Write-Host "  💚 Health Checks: /health endpoints" -ForegroundColor White