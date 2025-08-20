#!/usr/bin/env pwsh
# CBD Universal Database - Phase 3 Five-Paradigm Test
# Tests Document, Vector, Graph, Key-Value, and Time-Series paradigms

$baseUrl = "http://localhost:4180"
$testResults = @()

Write-Host "🧪 CBD Universal Database - 5-Paradigm Integration Test" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# Function to test endpoint
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Url,
        [object]$Body = $null,
        [string]$Description
    )
    
    Write-Host "Testing: $Description" -ForegroundColor Yellow
    
    try {
        $headers = @{ "Content-Type" = "application/json" }
        
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Body $jsonBody -Headers $headers -TimeoutSec 10
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $headers -TimeoutSec 10
        }
        
        Write-Host "✅ SUCCESS: $Description" -ForegroundColor Green
        $global:testResults += @{ Test = $Description; Status = "PASS"; Response = $response }
        return $response
    }
    catch {
        Write-Host "❌ FAILED: $Description - $($_.Exception.Message)" -ForegroundColor Red
        $global:testResults += @{ Test = $Description; Status = "FAIL"; Error = $_.Exception.Message }
        return $null
    }
}

# Wait for service to be ready
Write-Host "⏳ Waiting for service to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# 1. Health Check
Write-Host "`n1️⃣ HEALTH CHECK TEST" -ForegroundColor Magenta
$health = Test-Endpoint -Method "GET" -Url "$baseUrl/health" -Description "Health Check"

if ($health -and $health.engines) {
    Write-Host "Paradigms Available: $($health.paradigms -join ', ')" -ForegroundColor Cyan
    Write-Host "Engine Status:" -ForegroundColor Cyan
    $health.engines.PSObject.Properties | ForEach-Object {
        Write-Host "  $($_.Name): $($_.Value)" -ForegroundColor White
    }
}

# 2. Document Storage Test
Write-Host "`n2️⃣ DOCUMENT STORAGE TEST" -ForegroundColor Magenta

$testDoc = @{
    document = @{
        name = "Test User"
        email = "test@example.com"
        age = 30
        tags = @("developer", "nodejs")
    }
}

$docResult = Test-Endpoint -Method "POST" -Url "$baseUrl/document/users" -Body $testDoc -Description "Insert Document"

if ($docResult) {
    Write-Host "Document ID: $($docResult.insertedId)" -ForegroundColor Green
    
    # Test document retrieval
    Test-Endpoint -Method "GET" -Url "$baseUrl/document/users" -Description "Get Documents"
}

# 3. Vector Storage Test
Write-Host "`n3️⃣ VECTOR STORAGE TEST" -ForegroundColor Magenta

$testVector = @{
    id = "vec_001"
    vector = @(0.1, 0.2, 0.3, 0.4, 0.5)
    metadata = @{
        type = "test"
        category = "example"
    }
}

$vectorResult = Test-Endpoint -Method "POST" -Url "$baseUrl/vector/store" -Body $testVector -Description "Store Vector"

if ($vectorResult) {
    # Test vector search
    $searchVector = @{
        vector = @(0.1, 0.2, 0.3, 0.4, 0.5)
        limit = 5
    }
    
    Test-Endpoint -Method "POST" -Url "$baseUrl/vector/search" -Body $searchVector -Description "Search Similar Vectors"
}

# 4. Graph Storage Test
Write-Host "`n4️⃣ GRAPH STORAGE TEST" -ForegroundColor Magenta

$testNode1 = @{
    id = "user_1"
    labels = @("User", "Person")
    properties = @{
        name = "Alice"
        role = "Developer"
    }
}

$nodeResult1 = Test-Endpoint -Method "POST" -Url "$baseUrl/graph/node" -Body $testNode1 -Description "Create Node 1"

$testNode2 = @{
    id = "user_2"
    labels = @("User", "Person")
    properties = @{
        name = "Bob"
        role = "Designer"
    }
}

$nodeResult2 = Test-Endpoint -Method "POST" -Url "$baseUrl/graph/node" -Body $testNode2 -Description "Create Node 2"

if ($nodeResult1 -and $nodeResult2) {
    # Create relationship
    $testRelationship = @{
        fromNodeId = "user_1"
        toNodeId = "user_2"
        type = "WORKS_WITH"
        properties = @{
            since = "2024"
            project = "CBD Database"
        }
    }
    
    Test-Endpoint -Method "POST" -Url "$baseUrl/graph/relationship" -Body $testRelationship -Description "Create Relationship"
    
    # Test node retrieval
    Test-Endpoint -Method "GET" -Url "$baseUrl/graph/node/user_1" -Description "Get Node"
}

# 5. Key-Value Storage Test
Write-Host "`n5️⃣ KEY-VALUE STORAGE TEST" -ForegroundColor Magenta

$testKV = @{
    key = "session_123"
    value = @{
        userId = "user_1"
        loginTime = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
        preferences = @{
            theme = "dark"
            language = "en"
        }
    }
    ttl = 3600
}

$kvResult = Test-Endpoint -Method "POST" -Url "$baseUrl/kv/set" -Body $testKV -Description "Set Key-Value"

if ($kvResult) {
    # Test key retrieval
    Test-Endpoint -Method "GET" -Url "$baseUrl/kv/session_123" -Description "Get Key-Value"
}

# 6. Time-Series Storage Test
Write-Host "`n6️⃣ TIME-SERIES STORAGE TEST" -ForegroundColor Magenta

$currentTime = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ"

$testTimeSeries = @{
    measurement = "cpu_usage"
    tags = @{
        host = "server-01"
        region = "us-east-1"
        environment = "production"
    }
    fields = @{
        usage_percent = 75.5
        load_average = 1.2
        active_processes = 156
    }
    timestamp = $currentTime
}

$tsResult = Test-Endpoint -Method "POST" -Url "$baseUrl/timeseries/write" -Body $testTimeSeries -Description "Write Time-Series Point"

if ($tsResult) {
    # Write additional points for testing
    $testBatch = @{
        points = @(
            @{
                measurement = "cpu_usage"
                tags = @{ host = "server-01"; region = "us-east-1" }
                fields = @{ usage_percent = 80.2; load_average = 1.5 }
                timestamp = (Get-Date).AddMinutes(-5).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
            },
            @{
                measurement = "cpu_usage"
                tags = @{ host = "server-01"; region = "us-east-1" }
                fields = @{ usage_percent = 70.1; load_average = 1.0 }
                timestamp = (Get-Date).AddMinutes(-10).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
            }
        )
    }
    
    Test-Endpoint -Method "POST" -Url "$baseUrl/timeseries/write-batch" -Body $testBatch -Description "Batch Write Time-Series"
    
    # Test time-series query
    $tsQuery = @{
        measurement = "cpu_usage"
        startTime = (Get-Date).AddHours(-1).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        endTime = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        tags = @{ host = "server-01" }
        limit = 10
    }
    
    Test-Endpoint -Method "POST" -Url "$baseUrl/timeseries/query" -Body $tsQuery -Description "Query Time-Series Data"
    
    # Test measurements list
    Test-Endpoint -Method "GET" -Url "$baseUrl/timeseries/measurements" -Description "List Measurements"
    
    # Test time-series stats
    Test-Endpoint -Method "GET" -Url "$baseUrl/timeseries/stats" -Description "Get Time-Series Stats"
}

# 7. Stats Test
Write-Host "`n7️⃣ STATISTICS TEST" -ForegroundColor Magenta
$stats = Test-Endpoint -Method "GET" -Url "$baseUrl/stats" -Description "Get Service Statistics"

if ($stats) {
    Write-Host "Service Uptime: $([math]::Round($stats.uptime / 1000, 2)) seconds" -ForegroundColor Cyan
    if ($stats.timeSeries) {
        Write-Host "Time-Series Points: $($stats.timeSeries.totalPoints)" -ForegroundColor Cyan
        Write-Host "Measurements: $($stats.timeSeries.measurements | ConvertTo-Json -Compress)" -ForegroundColor Cyan
    }
}

# Test Summary
Write-Host "`n📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

$totalTests = $testResults.Count
$passedTests = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failedTests = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count

Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red
Write-Host "Success Rate: $([math]::Round(($passedTests / $totalTests) * 100, 2))%" -ForegroundColor Cyan

if ($failedTests -gt 0) {
    Write-Host "`nFailed Tests:" -ForegroundColor Red
    $testResults | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
        Write-Host "  ❌ $($_.Test): $($_.Error)" -ForegroundColor Red
    }
}

if ($passedTests -eq $totalTests) {
    Write-Host "`n🎉 ALL TESTS PASSED! CBD 5-Paradigm Database is fully operational!" -ForegroundColor Green
    Write-Host "✅ Document Storage: Working" -ForegroundColor Green
    Write-Host "✅ Vector Search: Working" -ForegroundColor Green  
    Write-Host "✅ Graph Database: Working" -ForegroundColor Green
    Write-Host "✅ Key-Value Store: Working" -ForegroundColor Green
    Write-Host "✅ Time-Series Database: Working" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ Some tests failed. Please check the service implementation." -ForegroundColor Yellow
}

Write-Host "`n🏁 Test completed!" -ForegroundColor Cyan
