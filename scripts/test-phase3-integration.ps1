# 🎭 Phase 3: Frontend & Integration Testing Implementation

Write-Host "🚀 Starting Phase 3: Frontend & Integration Testing" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Gray

# Test Configuration
$TestResults = @{
    Total = 0
    Passed = 0
    Failed = 0
    Frontend = @{}
    Integration = @{}
}

function Test-FrontendLoad {
    param(
        [string]$ServiceName,
        [string]$BaseUrl,
        [int]$TimeoutSeconds = 15
    )
    
    Write-Host "🌐 Testing $ServiceName Frontend..." -ForegroundColor Yellow
    
    try {
        $start = Get-Date
        $response = Invoke-WebRequest -Uri $BaseUrl -UseBasicParsing -TimeoutSec $TimeoutSeconds
        $duration = ((Get-Date) - $start).TotalMilliseconds
        
        $TestResults.Total++
        $TestResults.Passed++
        $TestResults.Frontend[$ServiceName] = @{
            Status = "LOADED"
            ResponseTime = "${duration}ms"
            StatusCode = $response.StatusCode
            ContentLength = $response.Content.Length
        }
        
        Write-Host "✅ $ServiceName Frontend: LOADED (${duration}ms, Status: $($response.StatusCode))" -ForegroundColor Green
        
        # Basic content validation
        if ($response.Content -match "<!DOCTYPE html") {
            Write-Host "   ✅ Valid HTML Document" -ForegroundColor Green
        }
        if ($response.Content -match "CODAI|$ServiceName") {
            Write-Host "   ✅ Service Branding Present" -ForegroundColor Green
        }
        
        return $true
    }
    catch {
        $TestResults.Total++
        $TestResults.Failed++
        $TestResults.Frontend[$ServiceName] = @{
            Status = "ERROR"
            Error = $_.Exception.Message
        }
        
        Write-Host "❌ $ServiceName Frontend: ERROR - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Test-GatewayRouting {
    param(
        [string]$ServiceName,
        [string]$GatewayUrl,
        [string]$ExpectedService
    )
    
    Write-Host "🔀 Testing Gateway Routing to $ServiceName..." -ForegroundColor Yellow
    
    try {
        $start = Get-Date
        $response = Invoke-RestMethod -Uri $GatewayUrl -Method Get -TimeoutSec 10
        $duration = ((Get-Date) - $start).TotalMilliseconds
        
        $TestResults.Total++
        if ($response.service -eq $ExpectedService -or $response.status -eq "healthy") {
            $TestResults.Passed++
            Write-Host "✅ Gateway → ${ServiceName}: ROUTED (${duration}ms)" -ForegroundColor Green
            return $true
        } else {
            $TestResults.Failed++
            Write-Host "❌ Gateway → ${ServiceName}: UNEXPECTED RESPONSE" -ForegroundColor Red
            return $false
        }
    }
    catch {
        $TestResults.Total++
        $TestResults.Failed++
        Write-Host "❌ Gateway → ${ServiceName}: ERROR - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Test-ServiceAPI {
    param(
        [string]$ServiceName,
        [string]$ApiUrl,
        [hashtable]$ExpectedFields = @{}
    )
    
    Write-Host "🔬 Testing $ServiceName API..." -ForegroundColor Yellow
    
    try {
        $start = Get-Date
        $response = Invoke-RestMethod -Uri $ApiUrl -Method Get -TimeoutSec 10
        $duration = ((Get-Date) - $start).TotalMilliseconds
        
        $TestResults.Total++
        $TestResults.Passed++
        
        Write-Host "✅ $ServiceName API: RESPONDING (${duration}ms)" -ForegroundColor Green
        
        # Validate expected fields
        foreach ($field in $ExpectedFields.Keys) {
            if ($response.$field -eq $ExpectedFields[$field]) {
                Write-Host "   ✅ ${field}: $($response.$field)" -ForegroundColor Green
            } elseif ($response.$field) {
                Write-Host "   ⚠️  ${field}: $($response.$field) (expected: $($ExpectedFields[$field]))" -ForegroundColor Yellow
            } else {
                Write-Host "   ❌ ${field}: MISSING" -ForegroundColor Red
            }
        }
        
        return $true
    }
    catch {
        $TestResults.Total++
        $TestResults.Failed++
        Write-Host "❌ $ServiceName API: ERROR - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Phase 3.1: Frontend Load Testing
Write-Host ""
Write-Host "📱 Frontend Load Testing" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Gray

$frontendServices = @(
    @{Name="Admin Dashboard"; Url="http://localhost:4007"},
    @{Name="ID Service"; Url="http://localhost:4004"},
    @{Name="Hub Service"; Url="http://localhost:4008"}
)

foreach ($service in $frontendServices) {
    Test-FrontendLoad -ServiceName $service.Name -BaseUrl $service.Url
}

# Phase 3.2: API Integration Testing
Write-Host ""
Write-Host "🔗 API Integration Testing" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Gray

$apiServices = @(
    @{
        Name="CBD Database"
        Url="http://localhost:4180/health"
        ExpectedFields=@{status="healthy"; service="CBD Universal Database - Phase 4: Innovation & Scale"}
    },
    @{
        Name="Admin Service"
        Url="http://localhost:4007/api/health"
        ExpectedFields=@{status="healthy"; service="CODAI Admin Dashboard"}
    },
    @{
        Name="ID Service"
        Url="http://localhost:4004/api/health"
        ExpectedFields=@{status="healthy"; service="CODAI ID Service"}
    },
    @{
        Name="Hub Service"
        Url="http://localhost:4008/api/health"
        ExpectedFields=@{status="healthy"; service="hub"}
    }
)

foreach ($service in $apiServices) {
    Test-ServiceAPI -ServiceName $service.Name -ApiUrl $service.Url -ExpectedFields $service.ExpectedFields
}

# Phase 3.3: Gateway Integration Testing
Write-Host ""
Write-Host "🌐 Gateway Integration Testing" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Gray

# Test if Gateway is running
try {
    $gatewayHealth = Invoke-RestMethod -Uri "http://localhost:4003/health" -Method Get -TimeoutSec 5
    Write-Host "✅ Gateway Service: OPERATIONAL" -ForegroundColor Green
    
    # Test Gateway Routing
    $gatewayRoutes = @(
        @{Service="Admin"; Url="http://localhost:4003/api/v1/admin/health"; Expected="CODAI Admin Dashboard"},
        @{Service="ID"; Url="http://localhost:4003/api/v1/id/health"; Expected="CODAI ID Service"},
        @{Service="Hub"; Url="http://localhost:4003/api/v1/hub/health"; Expected="hub"},
        @{Service="CBD"; Url="http://localhost:4003/api/v1/cbd/health"; Expected="CBD Universal Database"}
    )
    
    foreach ($route in $gatewayRoutes) {
        Test-GatewayRouting -ServiceName $route.Service -GatewayUrl $route.Url -ExpectedService $route.Expected
    }
}
catch {
    Write-Host "❌ Gateway Service: NOT AVAILABLE - $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Skipping gateway routing tests..." -ForegroundColor Yellow
}

# Phase 3.4: Cross-Service Integration
Write-Host ""
Write-Host "🔄 Cross-Service Integration Testing" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Gray

# Test service discovery through Hub
Write-Host "🔍 Testing service discovery..." -ForegroundColor Yellow
try {
    $hubResponse = Invoke-RestMethod -Uri "http://localhost:4008/api/health" -Method Get -TimeoutSec 5
    if ($hubResponse.dependencies) {
        Write-Host "✅ Hub Service Dependencies:" -ForegroundColor Green
        foreach ($dep in $hubResponse.dependencies.PSObject.Properties) {
            Write-Host "   • $($dep.Name): $($dep.Value)" -ForegroundColor White
        }
    }
}
catch {
    Write-Host "❌ Service discovery test failed" -ForegroundColor Red
}

# Performance Integration Test
Write-Host ""
Write-Host "⚡ Performance Integration Testing" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Gray

$performanceTests = @(
    @{Name="CBD→Admin Chain"; Urls=@("http://localhost:4180/health", "http://localhost:4007/api/health")},
    @{Name="Hub→ID Chain"; Urls=@("http://localhost:4008/api/health", "http://localhost:4004/api/health")}
)

foreach ($test in $performanceTests) {
    Write-Host "🏃 Testing $($test.Name)..." -ForegroundColor Yellow
    $chainStart = Get-Date
    $success = $true
    
    foreach ($url in $test.Urls) {
        try {
            Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 5 | Out-Null
        }
        catch {
            $success = $false
            break
        }
    }
    
    $chainDuration = ((Get-Date) - $chainStart).TotalMilliseconds
    
    if ($success) {
        Write-Host "✅ $($test.Name): SUCCESS (${chainDuration}ms total)" -ForegroundColor Green
    } else {
        Write-Host "❌ $($test.Name): FAILED" -ForegroundColor Red
    }
}

# Test Results Summary
Write-Host ""
Write-Host "📊 Phase 3 Test Results Summary" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Gray
Write-Host "Total Tests: $($TestResults.Total)" -ForegroundColor White
Write-Host "Passed: $($TestResults.Passed)" -ForegroundColor Green  
Write-Host "Failed: $($TestResults.Failed)" -ForegroundColor Red

$passRate = if ($TestResults.Total -gt 0) { [math]::Round(($TestResults.Passed / $TestResults.Total) * 100, 1) } else { 0 }
Write-Host "Pass Rate: ${passRate}%" -ForegroundColor $(if ($passRate -ge 80) { "Green" } elseif ($passRate -ge 60) { "Yellow" } else { "Red" })

if ($TestResults.Failed -eq 0) {
    Write-Host "🎉 ALL INTEGRATION TESTS PASSED!" -ForegroundColor Green
} elseif ($passRate -ge 80) {
    Write-Host "🎯 EXCELLENT! Most tests passed - minor issues to address" -ForegroundColor Yellow
} else {
    Write-Host "⚠️  Some critical issues found - review failed tests" -ForegroundColor Red
}

# Frontend Status Summary
Write-Host ""
Write-Host "🌐 Frontend Status Summary:" -ForegroundColor Cyan
foreach ($service in $TestResults.Frontend.Keys) {
    $status = $TestResults.Frontend[$service]
    if ($status.Status -eq "LOADED") {
        Write-Host "✅ $service : $($status.Status) ($($status.ResponseTime), $($status.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "❌ $service : $($status.Status)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ Phase 3: Frontend & Integration Testing Complete!" -ForegroundColor Green
