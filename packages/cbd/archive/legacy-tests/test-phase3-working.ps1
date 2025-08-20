# CBD Universal Database Phase 3 - Working Service Tests
# Test all 4 paradigms: Document, Vector, Graph, Key-Value

Write-Host "🧪 Testing CBD Universal Database Phase 3 - Working Service" -ForegroundColor Green

$baseUrl = "http://localhost:4180"
$testsPassed = 0
$testsTotal = 0

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Url,
        [object]$Body = $null,
        [string]$TestName
    )
    
    $global:testsTotal++
    Write-Host "🔍 Testing: $TestName" -ForegroundColor Cyan
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = $Body | ConvertTo-Json -Depth 10
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "✅ PASS: $TestName" -ForegroundColor Green
        Write-Host "   Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
        $global:testsPassed++
        return $response
    }
    catch {
        Write-Host "❌ FAIL: $TestName" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Wait for service to be ready
Write-Host "⏳ Waiting for service to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Health check
Test-Endpoint -Method "GET" -Url "$baseUrl/health" -TestName "Health Check"

# Document Database Tests
Write-Host "`n📄 Testing Document Database" -ForegroundColor Blue

$doc1 = @{
    document = @{
        name = "John Doe"
        age = 30
        email = "john@example.com"
        tags = @("developer", "nodejs")
    }
}
$insertResult = Test-Endpoint -Method "POST" -Url "$baseUrl/document/users" -Body $doc1 -TestName "Insert Document"

Test-Endpoint -Method "GET" -Url "$baseUrl/document/users" -TestName "Find Documents"

if ($insertResult -and $insertResult.insertedId) {
    $update = @{
        update = @{
            '$set' = @{
                age = 31
                status = "active"
            }
        }
    }
    Test-Endpoint -Method "PUT" -Url "$baseUrl/document/users/$($insertResult.insertedId)" -Body $update -TestName "Update Document"
}

# Vector Database Tests
Write-Host "`n🔍 Testing Vector Database" -ForegroundColor Blue

$vector1 = @{
    id = "vec1"
    vector = @(0.1, 0.2, 0.3, 0.4, 0.5)
    metadata = @{
        type = "test_vector"
        category = "sample"
    }
}
Test-Endpoint -Method "POST" -Url "$baseUrl/vector/store" -Body $vector1 -TestName "Store Vector"

$vector2 = @{
    id = "vec2"
    vector = @(0.15, 0.25, 0.35, 0.45, 0.55)
    metadata = @{
        type = "test_vector"
        category = "similar"
    }
}
Test-Endpoint -Method "POST" -Url "$baseUrl/vector/store" -Body $vector2 -TestName "Store Second Vector"

$searchQuery = @{
    vector = @(0.12, 0.22, 0.32, 0.42, 0.52)
    limit = 5
}
Test-Endpoint -Method "POST" -Url "$baseUrl/vector/search" -Body $searchQuery -TestName "Vector Similarity Search"

# Graph Database Tests
Write-Host "`n🕸️  Testing Graph Database" -ForegroundColor Blue

$node1 = @{
    id = "person1"
    labels = @("Person", "Developer")
    properties = @{
        name = "Alice"
        age = 28
        skills = @("JavaScript", "Python")
    }
}
Test-Endpoint -Method "POST" -Url "$baseUrl/graph/node" -Body $node1 -TestName "Create Graph Node 1"

$node2 = @{
    id = "person2"
    labels = @("Person", "Manager")
    properties = @{
        name = "Bob"
        age = 35
        department = "Engineering"
    }
}
Test-Endpoint -Method "POST" -Url "$baseUrl/graph/node" -Body $node2 -TestName "Create Graph Node 2"

$relationship = @{
    fromNodeId = "person2"
    toNodeId = "person1"
    type = "MANAGES"
    properties = @{
        since = "2023-01-01"
        rating = "excellent"
    }
}
Test-Endpoint -Method "POST" -Url "$baseUrl/graph/relationship" -Body $relationship -TestName "Create Graph Relationship"

Test-Endpoint -Method "GET" -Url "$baseUrl/graph/node/person1" -TestName "Get Graph Node"

# Key-Value Database Tests
Write-Host "`n🔑 Testing Key-Value Database" -ForegroundColor Blue

$kv1 = @{
    key = "config:app:version"
    value = "1.0.0"
}
Test-Endpoint -Method "POST" -Url "$baseUrl/kv/set" -Body $kv1 -TestName "Set Key-Value"

$kv2 = @{
    key = "session:user123"
    value = @{
        userId = 123
        username = "testuser"
        loginTime = "2024-01-01T10:00:00Z"
    }
    ttl = 3600000  # 1 hour in milliseconds
}
Test-Endpoint -Method "POST" -Url "$baseUrl/kv/set" -Body $kv2 -TestName "Set Key-Value with TTL"

Test-Endpoint -Method "GET" -Url "$baseUrl/kv/config:app:version" -TestName "Get Key-Value"
Test-Endpoint -Method "GET" -Url "$baseUrl/kv/session:user123" -TestName "Get Key-Value with TTL"

# Stats
Write-Host "`n📈 Testing Stats" -ForegroundColor Blue
Test-Endpoint -Method "GET" -Url "$baseUrl/stats" -TestName "Get Service Stats"

# Clean up - Delete some test data
Write-Host "`n🧹 Cleanup Tests" -ForegroundColor Blue
Test-Endpoint -Method "DELETE" -Url "$baseUrl/kv/config:app:version" -TestName "Delete Key-Value"

if ($insertResult -and $insertResult.insertedId) {
    Test-Endpoint -Method "DELETE" -Url "$baseUrl/document/users/$($insertResult.insertedId)" -TestName "Delete Document"
}

# Summary
Write-Host "`n📊 Test Summary" -ForegroundColor Green
Write-Host "Tests Passed: $testsPassed / $testsTotal" -ForegroundColor $(if ($testsPassed -eq $testsTotal) { "Green" } else { "Yellow" })

if ($testsPassed -eq $testsTotal) {
    Write-Host "🎉 All tests passed! CBD Universal Database Phase 3 is working correctly." -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Check the output above for details." -ForegroundColor Yellow
}

Write-Host "`n✨ CBD Universal Database Phase 3 Testing Complete!" -ForegroundColor Magenta
