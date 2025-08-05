# 🧪 API Testing Suite - Phase 2 Implementation

Write-Host "🚀 Starting CODAI API Testing Suite" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Gray

# Test Configuration
$TestResults = @{
    Total = 0
    Passed = 0
    Failed = 0
    Services = @{}
}

function Test-ServiceHealth {
    param(
        [string]$ServiceName,
        [string]$HealthUrl,
        [int]$TimeoutSeconds = 10
    )
    
    Write-Host "🔍 Testing $ServiceName..." -ForegroundColor Yellow
    
    try {
        $start = Get-Date
        $response = Invoke-RestMethod -Uri $HealthUrl -Method Get -TimeoutSec $TimeoutSeconds
        $duration = ((Get-Date) - $start).TotalMilliseconds
        
        $TestResults.Total++
        $TestResults.Passed++
        $TestResults.Services[$ServiceName] = @{
            Status = "HEALTHY"
            ResponseTime = "${duration}ms"
            Details = $response
        }
        
        Write-Host "✅ ${ServiceName}: HEALTHY (${duration}ms)" -ForegroundColor Green
        
        # Validate response structure
        if ($response.status -eq "healthy") {
            Write-Host "   ✅ Status: Valid" -ForegroundColor Green
        }
        if ($response.service) {
            Write-Host "   ✅ Service Name: $($response.service)" -ForegroundColor Green
        }
        if ($response.timestamp) {
            Write-Host "   ✅ Timestamp: Valid" -ForegroundColor Green
        }
        
        return $true
    }
    catch {
        $TestResults.Total++
        $TestResults.Failed++
        $TestResults.Services[$ServiceName] = @{
            Status = "ERROR"
            Error = $_.Exception.Message
        }
        
        Write-Host "❌ ${ServiceName}: ERROR - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Test-ServiceEndpoint {
    param(
        [string]$ServiceName,
        [string]$EndpointUrl,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )
    
    try {
        $params = @{
            Uri = $EndpointUrl
            Method = $Method
            TimeoutSec = 10
        }
        
        if ($Headers.Count -gt 0) {
            $params.Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = $Body | ConvertTo-Json
            $params.ContentType = "application/json"
        }
        
        $start = Get-Date
        $response = Invoke-RestMethod @params
        $duration = ((Get-Date) - $start).TotalMilliseconds
        
        Write-Host "   ✅ $Method $EndpointUrl (${duration}ms)" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "   ❌ $Method $EndpointUrl - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Core Services Testing
Write-Host ""
Write-Host "📊 Phase 2: API Health Testing" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Gray

# Test CBD Universal Database
Test-ServiceHealth -ServiceName "CBD Universal Database" -HealthUrl "http://localhost:4180/health"

# Test Hub Service 
Test-ServiceHealth -ServiceName "Hub Service" -HealthUrl "http://localhost:4008/api/health"

# Additional CBD Endpoints Testing
Write-Host ""
Write-Host "🔬 CBD Database Endpoint Testing:" -ForegroundColor Yellow
Test-ServiceEndpoint -ServiceName "CBD" -EndpointUrl "http://localhost:4180/stats"
Test-ServiceEndpoint -ServiceName "CBD" -EndpointUrl "http://localhost:4180/"

# Hub Service Endpoint Testing  
Write-Host ""
Write-Host "🔬 Hub Service Endpoint Testing:" -ForegroundColor Yellow
Test-ServiceEndpoint -ServiceName "Hub" -EndpointUrl "http://localhost:4008/api/test"

# Performance Testing
Write-Host ""
Write-Host "⚡ Performance Testing:" -ForegroundColor Yellow

$performanceTests = @(
    @{Name="CBD Health"; Url="http://localhost:4180/health"; Iterations=5},
    @{Name="Hub Health"; Url="http://localhost:4008/api/health"; Iterations=5}
)

foreach ($test in $performanceTests) {
    $times = @()
    Write-Host "🏃 Testing $($test.Name) performance..." -ForegroundColor Yellow
    
    for ($i = 1; $i -le $test.Iterations; $i++) {
        try {
            $start = Get-Date
            Invoke-RestMethod -Uri $test.Url -Method Get -TimeoutSec 5 | Out-Null
            $duration = ((Get-Date) - $start).TotalMilliseconds
            $times += $duration
        }
        catch {
            Write-Host "   ❌ Iteration $i failed" -ForegroundColor Red
        }
    }
    
    if ($times.Count -gt 0) {
        $avgTime = ($times | Measure-Object -Average).Average
        $minTime = ($times | Measure-Object -Minimum).Minimum
        $maxTime = ($times | Measure-Object -Maximum).Maximum
        
        Write-Host "   📈 $($test.Name): Avg: ${avgTime}ms, Min: ${minTime}ms, Max: ${maxTime}ms" -ForegroundColor Green
    }
}

# Test Results Summary
Write-Host ""
Write-Host "📊 Test Results Summary" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Gray
Write-Host "Total Tests: $($TestResults.Total)" -ForegroundColor White
Write-Host "Passed: $($TestResults.Passed)" -ForegroundColor Green  
Write-Host "Failed: $($TestResults.Failed)" -ForegroundColor Red

if ($TestResults.Failed -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed - review errors above" -ForegroundColor Yellow
}

# Service Status Summary
Write-Host ""
Write-Host "🌐 Service Status Summary:" -ForegroundColor Cyan
foreach ($service in $TestResults.Services.Keys) {
    $status = $TestResults.Services[$service]
    if ($status.Status -eq "HEALTHY") {
        Write-Host "✅ $service : $($status.Status) ($($status.ResponseTime))" -ForegroundColor Green
    } else {
        Write-Host "❌ $service : $($status.Status)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ API Testing Phase 2 Complete!" -ForegroundColor Green
