# 🔌 CODAI Ecosystem - API Contract & Service Communication Testing
# Based on Microsoft Testing Best Practices & Industry Standards
# Date: August 2025

param(
    [switch]$TestRestAPIs = $true,
    [switch]$TestGraphQL = $true,
    [switch]$TestWebSocket = $true,
    [switch]$Detailed = $false,
    [switch]$ExportResults = $true,
    [string]$OutputPath = ".\test-results"
)

Write-Host "🔌 CODAI ECOSYSTEM - API CONTRACT & SERVICE COMMUNICATION TESTING" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "⏰ Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Green
Write-Host ""

# Initialize test results
$testResults = @()

function Add-TestResult {
    param($Category, $TestName, $Status, $Details, $ExpectedValue, $ActualValue, $Duration)
    
    $script:testResults += [PSCustomObject]@{
        Category = $Category
        TestName = $TestName
        Status = $Status
        Details = $Details
        Expected = $ExpectedValue
        Actual = $ActualValue
        Duration = $Duration
        Timestamp = Get-Date
    }
    
    $statusColor = switch($Status) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "WARN" { "Yellow" }
        "SKIP" { "Cyan" }
        default { "White" }
    }
    
    $statusIcon = switch($Status) {
        "PASS" { "✅" }
        "FAIL" { "❌" }
        "WARN" { "⚠️" }
        "SKIP" { "⏭️" }
        default { "ℹ️" }
    }
    
    Write-Host "  $statusIcon $TestName" -ForegroundColor $statusColor
    if ($Detailed -and $Details) {
        Write-Host "    📋 $Details" -ForegroundColor Gray
    }
}

function Test-RESTEndpoint {
    param($ServiceName, $EndpointName, $Url, $Method, $ExpectedStatus, $Headers, $Body, $ContentType)
    
    try {
        $startTime = Get-Date
        
        $requestParams = @{
            Uri = $Url
            Method = $Method
            TimeoutSec = 10
            UseBasicParsing = $true
            ErrorAction = 'Stop'
        }
        
        if ($Headers) { $requestParams.Headers = $Headers }
        if ($Body) { $requestParams.Body = $Body }
        if ($ContentType) { $requestParams.ContentType = $ContentType }
        
        $response = Invoke-WebRequest @requestParams
        $duration = (Get-Date) - $startTime
        
        $actualStatus = [int]$response.StatusCode
        if ($ExpectedStatus -contains $actualStatus) {
            Add-TestResult "REST API Testing" "$ServiceName - $EndpointName" "PASS" "HTTP $actualStatus (${Method})" "$ExpectedStatus" $actualStatus $duration.TotalMilliseconds
            
            # Validate response content type
            $contentType = $response.Headers["Content-Type"]
            if ($contentType -match "application/json") {
                try {
                    $jsonData = $response.Content | ConvertFrom-Json
                    Add-TestResult "REST API Testing" "$ServiceName - $EndpointName JSON" "PASS" "Valid JSON response" "Valid JSON" "Valid" $duration.TotalMilliseconds
                } catch {
                    Add-TestResult "REST API Testing" "$ServiceName - $EndpointName JSON" "WARN" "Invalid JSON format" "Valid JSON" "Invalid" $duration.TotalMilliseconds
                }
            }
            
            return $response
        } else {
            Add-TestResult "REST API Testing" "$ServiceName - $EndpointName" "FAIL" "HTTP $actualStatus (${Method})" "$ExpectedStatus" $actualStatus $duration.TotalMilliseconds
            return $null
        }
        
    } catch {
        $duration = (Get-Date) - $startTime
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
            if ($ExpectedStatus -contains $statusCode) {
                Add-TestResult "REST API Testing" "$ServiceName - $EndpointName" "PASS" "Expected error: HTTP $statusCode" "$ExpectedStatus" $statusCode $duration.TotalMilliseconds
            } else {
                Add-TestResult "REST API Testing" "$ServiceName - $EndpointName" "FAIL" "HTTP $statusCode" "$ExpectedStatus" $statusCode $duration.TotalMilliseconds
            }
        } else {
            Add-TestResult "REST API Testing" "$ServiceName - $EndpointName" "FAIL" $_.Exception.Message "$ExpectedStatus" "Connection Error" $duration.TotalMilliseconds
        }
        return $null
    }
}

# =============================================================================
# REST API TESTING
# =============================================================================
if ($TestRestAPIs) {
    Write-Host "🌐 REST API CONTRACT TESTING" -ForegroundColor Yellow
    Write-Host "-" * 50

    # Test CBD Database API
    Write-Host "`n💾 CBD Database API Testing" -ForegroundColor Cyan
    Test-RESTEndpoint "CBD Database" "Health Check" "http://localhost:8180/health" "GET" @(200)
    Test-RESTEndpoint "CBD Database" "API Root" "http://localhost:8180/" "GET" @(200, 404)
    Test-RESTEndpoint "CBD Database" "Status" "http://localhost:8180/status" "GET" @(200, 404)
    Test-RESTEndpoint "CBD Database" "Metrics" "http://localhost:8180/metrics" "GET" @(200, 404)

    # Test MemorAI MCP API
    Write-Host "`n🧠 MemorAI MCP API Testing" -ForegroundColor Cyan
    Test-RESTEndpoint "MemorAI MCP" "Health Check" "http://localhost:4950/health" "GET" @(200)
    Test-RESTEndpoint "MemorAI MCP" "Root Endpoint" "http://localhost:4950/" "GET" @(200, 404)
    Test-RESTEndpoint "MemorAI MCP" "Memory API" "http://localhost:4950/memory" "GET" @(200, 404, 401)
    Test-RESTEndpoint "MemorAI MCP" "Recall API" "http://localhost:4950/recall" "POST" @(200, 400, 401, 404) -ContentType "application/json" -Body '{"query":"test"}'

    # Test GraphQL API
    Write-Host "`n🚀 GraphQL API Testing" -ForegroundColor Cyan
    Test-RESTEndpoint "GraphQL API" "Health Check" "http://localhost:4500/health" "GET" @(200)
    Test-RESTEndpoint "GraphQL API" "GraphQL Introspection" "http://localhost:4500/graphql" "POST" @(200, 400) -ContentType "application/json" -Body '{"query":"{ __schema { types { name } } }"}'
    Test-RESTEndpoint "GraphQL API" "GraphQL Query" "http://localhost:4500/graphql" "POST" @(200, 400) -ContentType "application/json" -Body '{"query":"{ health { status } }"}'

    # Test Frontend API Endpoints
    Write-Host "`n🌐 Frontend Application APIs" -ForegroundColor Cyan
    Test-RESTEndpoint "MemorAI Frontend" "Home Page" "http://localhost:8006/" "GET" @(200)
    Test-RESTEndpoint "MemorAI Frontend" "API Endpoint" "http://localhost:8006/api/health" "GET" @(200, 404)
    Test-RESTEndpoint "BancAI Frontend" "Home Page" "http://localhost:8120/" "GET" @(200)
    Test-RESTEndpoint "BancAI Frontend" "API Endpoint" "http://localhost:8120/api/health" "GET" @(200, 404)

    # Test Gateway Services
    Write-Host "`n🚪 Gateway Service APIs" -ForegroundColor Cyan
    Test-RESTEndpoint "Main Gateway" "Health Check" "http://localhost:8010/health" "GET" @(200, 404)
    Test-RESTEndpoint "Hub Service" "Health Check" "http://localhost:8110/health" "GET" @(200, 404)
    Test-RESTEndpoint "Identity Service" "Health Check" "http://localhost:8100/health" "GET" @(200, 404)
    Test-RESTEndpoint "WebSocket Service" "Health Check" "http://localhost:4900/health" "GET" @(200, 404)
}

# =============================================================================
# GRAPHQL SPECIFIC TESTING
# =============================================================================
if ($TestGraphQL) {
    Write-Host "`n🚀 GRAPHQL SCHEMA & QUERY TESTING" -ForegroundColor Yellow
    Write-Host "-" * 50

    $graphqlUrl = "http://localhost:4500/graphql"
    $headers = @{"Content-Type" = "application/json"}

    # Test GraphQL Schema Introspection
    $introspectionQuery = @{
        query = "{ __schema { queryType { name } mutationType { name } subscriptionType { name } } }"
    } | ConvertTo-Json -Compress

    try {
        $startTime = Get-Date
        $response = Invoke-RestMethod -Uri $graphqlUrl -Method POST -Body $introspectionQuery -Headers $headers -TimeoutSec 10
        $duration = (Get-Date) - $startTime
        
        if ($response.data) {
            Add-TestResult "GraphQL Testing" "Schema Introspection" "PASS" "Schema accessible" "Schema Data" "Available" $duration.TotalMilliseconds
        } else {
            Add-TestResult "GraphQL Testing" "Schema Introspection" "WARN" "No schema data returned" "Schema Data" "Empty" $duration.TotalMilliseconds
        }
    } catch {
        $duration = (Get-Date) - $startTime
        Add-TestResult "GraphQL Testing" "Schema Introspection" "FAIL" $_.Exception.Message "Schema Data" "Error" $duration.TotalMilliseconds
    }

    # Test GraphQL Health Query
    $healthQuery = @{
        query = "{ health { status version uptime } }"
    } | ConvertTo-Json -Compress

    try {
        $startTime = Get-Date
        $response = Invoke-RestMethod -Uri $graphqlUrl -Method POST -Body $healthQuery -Headers $headers -TimeoutSec 10
        $duration = (Get-Date) - $startTime
        
        if ($response.data -and $response.data.health) {
            Add-TestResult "GraphQL Testing" "Health Query" "PASS" "Health data retrieved" "Health Object" "Available" $duration.TotalMilliseconds
        } else {
            Add-TestResult "GraphQL Testing" "Health Query" "WARN" "No health data" "Health Object" "Empty" $duration.TotalMilliseconds
        }
    } catch {
        $duration = (Get-Date) - $startTime
        Add-TestResult "GraphQL Testing" "Health Query" "FAIL" $_.Exception.Message "Health Object" "Error" $duration.TotalMilliseconds
    }

    # Test GraphQL Error Handling
    $invalidQuery = @{
        query = "{ invalidField { nonExistentData } }"
    } | ConvertTo-Json -Compress

    try {
        $startTime = Get-Date
        $response = Invoke-RestMethod -Uri $graphqlUrl -Method POST -Body $invalidQuery -Headers $headers -TimeoutSec 10
        $duration = (Get-Date) - $startTime
        
        if ($response.errors) {
            Add-TestResult "GraphQL Testing" "Error Handling" "PASS" "Errors properly returned" "Error Array" "Present" $duration.TotalMilliseconds
        } else {
            Add-TestResult "GraphQL Testing" "Error Handling" "WARN" "No error handling" "Error Array" "Missing" $duration.TotalMilliseconds
        }
    } catch {
        $duration = (Get-Date) - $startTime
        Add-TestResult "GraphQL Testing" "Error Handling" "FAIL" $_.Exception.Message "Error Array" "Exception" $duration.TotalMilliseconds
    }
}

# =============================================================================
# WEBSOCKET CONNECTION TESTING  
# =============================================================================
if ($TestWebSocket) {
    Write-Host "`n🔌 WEBSOCKET CONNECTION TESTING" -ForegroundColor Yellow
    Write-Host "-" * 50

    # Test WebSocket Service Availability
    try {
        $startTime = Get-Date
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $connection = $tcpClient.BeginConnect("localhost", 4900, $null, $null)
        $success = $connection.AsyncWaitHandle.WaitOne(3000, $false)
        $tcpClient.Close()
        $duration = (Get-Date) - $startTime
        
        if ($success) {
            Add-TestResult "WebSocket Testing" "WebSocket Port Connectivity" "PASS" "Port 4900 accessible" "Connected" "Success" $duration.TotalMilliseconds
        } else {
            Add-TestResult "WebSocket Testing" "WebSocket Port Connectivity" "FAIL" "Port 4900 not accessible" "Connected" "Failed" $duration.TotalMilliseconds
        }
    } catch {
        $duration = (Get-Date) - $startTime
        Add-TestResult "WebSocket Testing" "WebSocket Port Connectivity" "FAIL" $_.Exception.Message "Connected" "Error" $duration.TotalMilliseconds
    }

    # Test WebSocket HTTP Upgrade Headers
    try {
        $startTime = Get-Date
        $headers = @{
            "Connection" = "Upgrade"
            "Upgrade" = "websocket"
            "Sec-WebSocket-Key" = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes("test-key"))
            "Sec-WebSocket-Version" = "13"
        }
        
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:4900/" -Headers $headers -TimeoutSec 5 -ErrorAction Stop
            $duration = (Get-Date) - $startTime
            Add-TestResult "WebSocket Testing" "WebSocket Upgrade Support" "PASS" "WebSocket upgrade headers accepted" "101 or 426" $response.StatusCode $duration.TotalMilliseconds
        } catch {
            $duration = (Get-Date) - $startTime
            if ($_.Exception.Response) {
                $statusCode = [int]$_.Exception.Response.StatusCode
                if ($statusCode -eq 101 -or $statusCode -eq 426) {
                    Add-TestResult "WebSocket Testing" "WebSocket Upgrade Support" "PASS" "WebSocket upgrade response" "101 or 426" $statusCode $duration.TotalMilliseconds
                } else {
                    Add-TestResult "WebSocket Testing" "WebSocket Upgrade Support" "WARN" "Non-standard WebSocket response" "101 or 426" $statusCode $duration.TotalMilliseconds
                }
            } else {
                Add-TestResult "WebSocket Testing" "WebSocket Upgrade Support" "FAIL" $_.Exception.Message "101 or 426" "Connection Error" $duration.TotalMilliseconds
            }
        }
    } catch {
        $duration = (Get-Date) - $startTime
        Add-TestResult "WebSocket Testing" "WebSocket Upgrade Support" "FAIL" $_.Exception.Message "WebSocket Support" "Error" $duration.TotalMilliseconds
    }
}

# =============================================================================
# SERVICE COMMUNICATION PATTERNS TESTING
# =============================================================================
Write-Host "`n🔄 SERVICE COMMUNICATION PATTERNS TESTING" -ForegroundColor Yellow
Write-Host "-" * 50

# Test Request/Response Pattern
Write-Host "`n📤 Request/Response Pattern Testing" -ForegroundColor Cyan

$communicationTests = @(
    @{Name="Client → Gateway → CBD Database"; SourceUrl="http://localhost:8010"; TargetPath="/api/cbd/health"},
    @{Name="Client → Gateway → MemorAI MCP"; SourceUrl="http://localhost:8010"; TargetPath="/api/memorai/health"},
    @{Name="Client → Direct CBD Database"; SourceUrl="http://localhost:8180"; TargetPath="/health"},
    @{Name="Client → Direct MemorAI MCP"; SourceUrl="http://localhost:4950"; TargetPath="/health"}
)

foreach ($test in $communicationTests) {
    try {
        $startTime = Get-Date
        $fullUrl = "$($test.SourceUrl)$($test.TargetPath)"
        $response = Invoke-WebRequest -Uri $fullUrl -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        $duration = (Get-Date) - $startTime
        
        Add-TestResult "Service Communication" $test.Name "PASS" "Communication successful (HTTP $($response.StatusCode))" "2xx" $response.StatusCode $duration.TotalMilliseconds
        
    } catch {
        $duration = (Get-Date) - $startTime
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
            if ($statusCode -ge 200 -and $statusCode -lt 400) {
                Add-TestResult "Service Communication" $test.Name "PASS" "HTTP $statusCode" "2xx-3xx" $statusCode $duration.TotalMilliseconds
            } else {
                Add-TestResult "Service Communication" $test.Name "WARN" "HTTP $statusCode" "2xx" $statusCode $duration.TotalMilliseconds
            }
        } else {
            Add-TestResult "Service Communication" $test.Name "FAIL" $_.Exception.Message "Success" "Connection Failed" $duration.TotalMilliseconds
        }
    }
}

# Test API Response Format Consistency
Write-Host "`n📋 API Response Format Consistency Testing" -ForegroundColor Cyan

$formatTests = @(
    @{Service="CBD Database"; Url="http://localhost:8180/health"; ExpectedFields=@("status")},
    @{Service="MemorAI MCP"; Url="http://localhost:4950/health"; ExpectedFields=@("status")}
)

foreach ($test in $formatTests) {
    try {
        $startTime = Get-Date
        $response = Invoke-RestMethod -Uri $test.Url -Method Get -TimeoutSec 10 -ErrorAction Stop
        $duration = (Get-Date) - $startTime
        
        $missingFields = @()
        foreach ($field in $test.ExpectedFields) {
            if (-not $response.$field) {
                $missingFields += $field
            }
        }
        
        if ($missingFields.Count -eq 0) {
            Add-TestResult "API Format Testing" "$($test.Service) Response Format" "PASS" "All expected fields present" $test.ExpectedFields "Complete" $duration.TotalMilliseconds
        } else {
            Add-TestResult "API Format Testing" "$($test.Service) Response Format" "WARN" "Missing fields: $($missingFields -join ', ')" $test.ExpectedFields "Partial" $duration.TotalMilliseconds
        }
        
    } catch {
        $duration = (Get-Date) - $startTime
        Add-TestResult "API Format Testing" "$($test.Service) Response Format" "FAIL" $_.Exception.Message $test.ExpectedFields "Error" $duration.TotalMilliseconds
    }
}

# =============================================================================
# GENERATE COMPREHENSIVE TEST REPORT
# =============================================================================
Write-Host "`n📊 GENERATING COMPREHENSIVE TEST REPORT" -ForegroundColor Cyan
Write-Host "=" * 80

$totalTests = $testResults.Count
$passedTests = ($testResults | Where-Object Status -eq "PASS").Count  
$failedTests = ($testResults | Where-Object Status -eq "FAIL").Count
$warnTests = ($testResults | Where-Object Status -eq "WARN").Count
$skippedTests = ($testResults | Where-Object Status -eq "SKIP").Count

$successRate = if($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 1) } else { 0 }

Write-Host "`n🎯 API CONTRACT & SERVICE COMMUNICATION SUMMARY:" -ForegroundColor Yellow
Write-Host "   Total Tests Executed: $totalTests" -ForegroundColor White
Write-Host "   ✅ Passed: $passedTests ($([math]::Round(($passedTests / $totalTests) * 100, 1))%)" -ForegroundColor Green
Write-Host "   ❌ Failed: $failedTests ($([math]::Round(($failedTests / $totalTests) * 100, 1))%)" -ForegroundColor Red  
Write-Host "   ⚠️  Warnings: $warnTests ($([math]::Round(($warnTests / $totalTests) * 100, 1))%)" -ForegroundColor Yellow
Write-Host "   ⏭️  Skipped: $skippedTests ($([math]::Round(($skippedTests / $totalTests) * 100, 1))%)" -ForegroundColor Cyan
Write-Host "   📈 Overall Success Rate: $successRate%" -ForegroundColor $(if ($successRate -gt 80) { "Green" } elseif ($successRate -gt 60) { "Yellow" } else { "Red" })

# Category breakdown
Write-Host "`n📋 CATEGORY BREAKDOWN:" -ForegroundColor Yellow
$categories = $testResults | Group-Object Category
foreach ($category in $categories) {
    $categoryPassed = ($category.Group | Where-Object Status -eq "PASS").Count
    $categoryTotal = $category.Count
    $categoryRate = [math]::Round(($categoryPassed / $categoryTotal) * 100, 1)
    
    Write-Host "   $($category.Name): $categoryPassed/$categoryTotal ($categoryRate%)" -ForegroundColor $(if ($categoryRate -gt 80) { "Green" } elseif ($categoryRate -gt 60) { "Yellow" } else { "Red" })
}

# Performance metrics
$avgDuration = if ($testResults.Duration) { 
    [math]::Round(($testResults | Where-Object Duration | Measure-Object Duration -Average).Average, 2) 
} else { 0 }
Write-Host "`n⚡ PERFORMANCE METRICS:" -ForegroundColor Yellow
Write-Host "   Average API Response Time: ${avgDuration}ms" -ForegroundColor White

# Export results if requested
if ($ExportResults) {
    if (-not (Test-Path $OutputPath)) {
        New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
    }
    
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $jsonFile = Join-Path $OutputPath "api-contract-test-results-$timestamp.json"
    
    $testResults | ConvertTo-Json -Depth 3 | Out-File -FilePath $jsonFile -Encoding UTF8
    
    Write-Host "`n💾 Results exported to: $jsonFile" -ForegroundColor Green
}

# Show failed tests
if ($failedTests -gt 0) {
    Write-Host "`n❌ FAILED TESTS REQUIRING ATTENTION:" -ForegroundColor Red
    $testResults | Where-Object Status -eq "FAIL" | ForEach-Object {
        Write-Host "   • $($_.Category) - $($_.TestName): $($_.Details)" -ForegroundColor Red
    }
}

Write-Host "`n⏰ Completed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Green
Write-Host "🎉 API Contract & Service Communication testing complete!" -ForegroundColor Cyan