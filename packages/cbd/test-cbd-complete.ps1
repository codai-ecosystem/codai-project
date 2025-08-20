#!/usr/bin/env pwsh
# CBD Universal Database Complete Test

Write-Host "🧪 Testing CBD Universal Database - All 5 Paradigms" -ForegroundColor Green
Write-Host ""

# Health Check
Write-Host "📊 Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:4183/health" -Method GET
    Write-Host "✅ Health Check: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Stats Check
Write-Host ""
Write-Host "📈 Testing Stats Endpoint..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "http://localhost:4183/stats" -Method GET
    $memoryMB = [Math]::Round($stats.memory.heapUsed/1MB, 2)
    Write-Host "✅ Stats Check: Uptime: $($stats.uptime)s, Memory: ${memoryMB}MB" -ForegroundColor Green
} catch {
    Write-Host "❌ Stats Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Document Paradigm Test
Write-Host ""
Write-Host "📄 Testing Document Paradigm..." -ForegroundColor Yellow
try {
    $docData = @{
        collection = "test"
        document = @{
            name = "Vector Engine Test"
            timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
            type = "test_document"
        }
    } | ConvertTo-Json -Depth 3
    
    $response = Invoke-RestMethod -Uri "http://localhost:4183/document/" -Method POST -Body $docData -ContentType "application/json"
    Write-Host "✅ Document Insert: $($response.data.id)" -ForegroundColor Green
} catch {
    Write-Host "❌ Document Insert Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Key-Value Paradigm Test
Write-Host ""
Write-Host "🗃️ Testing Key-Value Paradigm..." -ForegroundColor Yellow
try {
    $kvData = @{
        key = "test_vector_kv"
        value = @{
            name = "Vector KV Test"
            data = "Vector engine compatibility test"
        }
    } | ConvertTo-Json -Depth 3
    
    $response = Invoke-RestMethod -Uri "http://localhost:4183/kv/" -Method POST -Body $kvData -ContentType "application/json"
    Write-Host "✅ Key-Value Store: $($response.success)" -ForegroundColor Green
    
    $getResponse = Invoke-RestMethod -Uri "http://localhost:4183/kv/test_vector_kv" -Method GET
    Write-Host "✅ Key-Value Retrieve: $($getResponse.data.value.name)" -ForegroundColor Green
} catch {
    Write-Host "❌ Key-Value Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Graph Paradigm Test
Write-Host ""
Write-Host "🔗 Testing Graph Paradigm..." -ForegroundColor Yellow
try {
    $nodeData = @{
        id = "vector_test_node"
        properties = @{
            name = "Vector Test Node"
            type = "test"
        }
    } | ConvertTo-Json -Depth 3
    
    $response = Invoke-RestMethod -Uri "http://localhost:4183/graph/node" -Method POST -Body $nodeData -ContentType "application/json"
    Write-Host "✅ Graph Node Creation: $($response.success)" -ForegroundColor Green
} catch {
    Write-Host "❌ Graph Node Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Vector Paradigm Test (FIXED)
Write-Host ""
Write-Host "🧠 Testing Vector Paradigm (FIXED ENGINE)..." -ForegroundColor Yellow
try {
    $vectorData = @{
        id = "test_vector_$(Get-Random)"
        vector = @(0.1, 0.2, 0.3, 0.4, 0.5)
        metadata = @{
            name = "Test Vector"
            type = "embedding"
            source = "cbd_test"
        }
    } | ConvertTo-Json -Depth 3
    
    $response = Invoke-RestMethod -Uri "http://localhost:4183/vector/insert" -Method POST -Body $vectorData -ContentType "application/json"
    Write-Host "✅ Vector Insert (FIXED): $($response.result.id)" -ForegroundColor Green
    
    # Test vector search
    $searchData = @{
        vector = @(0.1, 0.2, 0.3, 0.4, 0.5)
        k = 5
    } | ConvertTo-Json -Depth 3
    
    $searchResponse = Invoke-RestMethod -Uri "http://localhost:4183/vector/search" -Method POST -Body $searchData -ContentType "application/json"
    Write-Host "✅ Vector Search: Found $($searchResponse.result.Count) results" -ForegroundColor Green
} catch {
    Write-Host "❌ Vector Operations Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Time-Series Paradigm Test (FIXED)
Write-Host ""
Write-Host "⏰ Testing Time-Series Paradigm (FIXED ENGINE)..." -ForegroundColor Yellow
try {
    $tsData = @{
        measurement = "cpu_usage"
        tags = @{
            host = "test-server"
            region = "us-east-1"
        }
        fields = @{
            value = 75.5
            cores = 4
        }
        timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    } | ConvertTo-Json -Depth 3
    
    $response = Invoke-RestMethod -Uri "http://localhost:4183/timeseries/write" -Method POST -Body $tsData -ContentType "application/json"
    Write-Host "✅ Time-Series Write (FIXED): $($response.result.id)" -ForegroundColor Green
    
    # Test time-series query
    $queryData = @{
        query = "SELECT * FROM cpu_usage"
    } | ConvertTo-Json -Depth 3
    
    $queryResponse = Invoke-RestMethod -Uri "http://localhost:4183/timeseries/query" -Method POST -Body $queryData -ContentType "application/json"
    Write-Host "✅ Time-Series Query: Retrieved data successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Time-Series Operations Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 CBD Universal Database Test Complete!" -ForegroundColor Green
Write-Host "✅ All 5 paradigms tested with Azure-compatible architecture" -ForegroundColor Cyan
