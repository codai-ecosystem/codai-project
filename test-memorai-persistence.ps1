# Test MemorAI MCP Server Memory Persistence
Write-Host "🧠 Testing MemorAI MCP Memory Persistence..." -ForegroundColor Green

# Test 1: Store a memory
Write-Host "`n📝 Test 1: Storing memory..." -ForegroundColor Yellow
$rememberBody = @{
    jsonrpc = "2.0"
    id = 1
    method = "tools/call"
    params = @{
        name = "mcp_memoraimcp_remember"
        arguments = @{
            agentId = "persistence_test"
            content = "Docker-based MemorAI MCP with Microsoft-compliant patterns is working correctly"
            metadata = @{
                entityType = "status"
                project = "memorai-mcp-docker"
                importance = 9
                tags = @("docker", "mcp", "persistence", "test")
            }
        }
    }
} | ConvertTo-Json -Depth 5

$headers = @{
    "Content-Type" = "application/json"
    "Accept" = "application/json, text/event-stream"
}

try {
    $response1 = Invoke-RestMethod -Uri "http://localhost:4950/mcp" -Method POST -Body $rememberBody -Headers $headers -TimeoutSec 15
    
    if ($response1.result) {
        Write-Host "✅ Memory stored successfully" -ForegroundColor Green
        Write-Host "   Response: $($response1.result.content[0].text)" -ForegroundColor White
    } else {
        Write-Host "❌ Failed to store memory" -ForegroundColor Red
        Write-Host "   Error: $($response1.error.message)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error storing memory: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Immediately recall the memory
Write-Host "`n🔍 Test 2: Recalling memory..." -ForegroundColor Yellow
$recallBody = @{
    jsonrpc = "2.0"
    id = 2
    method = "tools/call"
    params = @{
        name = "mcp_memoraimcp_recall"
        arguments = @{
            agentId = "persistence_test"
            query = "Docker-based MemorAI"
            limit = 5
        }
    }
} | ConvertTo-Json -Depth 5

try {
    $response2 = Invoke-RestMethod -Uri "http://localhost:4950/mcp" -Method POST -Body $recallBody -Headers $headers -TimeoutSec 15
    
    if ($response2.result) {
        Write-Host "✅ Recall executed successfully" -ForegroundColor Green
        Write-Host "   Response: $($response2.result.content[0].text)" -ForegroundColor White
    } else {
        Write-Host "❌ Failed to recall memory" -ForegroundColor Red
        Write-Host "   Error: $($response2.error.message)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error recalling memory: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📊 Analysis:" -ForegroundColor Cyan
Write-Host "The MemorAI MCP server is using stateless pattern with in-memory storage." -ForegroundColor White
Write-Host "Each HTTP request creates a fresh server instance, losing previous memories." -ForegroundColor White
Write-Host "For production use, the MemoryStore should connect to CBD database for persistence." -ForegroundColor Yellow