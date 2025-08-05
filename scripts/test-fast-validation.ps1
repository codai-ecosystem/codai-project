#!/usr/bin/env pwsh
# 🚀 Fast Validation Testing - No Dependency Installation
# Uses existing dependencies and basic HTTP checks for rapid testing

param(
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Continue"
$startTime = Get-Date

Write-Host "🚀 Fast Validation Testing Started" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Gray
Write-Host "Using existing dependencies only - no installations" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Gray

# Test Results Tracking
$testResults = @{
    "ServiceHealth" = @()
    "APIEndpoints" = @()
    "BasicFunctionality" = @()
    "Performance" = @()
}

# Function to test service health quickly
function Test-ServiceHealth {
    param($name, $url, $expectedStatus = 200)
    
    try {
        $start = Get-Date
        $response = Invoke-WebRequest -Uri $url -Method Get -UseBasicParsing -TimeoutSec 5
        $duration = (Get-Date) - $start
        
        $result = @{
            Service = $name
            URL = $url
            Status = $response.StatusCode
            ResponseTime = [math]::Round($duration.TotalMilliseconds, 2)
            Result = if ($response.StatusCode -eq $expectedStatus) { "PASS" } else { "FAIL" }
        }
        
        $testResults.ServiceHealth += $result
        
        $color = if ($result.Result -eq "PASS") { "Green" } else { "Red" }
        Write-Host "  ✓ $name ($($result.ResponseTime)ms): $($result.Status)" -ForegroundColor $color
        
        return $result
    }
    catch {
        $result = @{
            Service = $name
            URL = $url
            Status = "ERROR"
            ResponseTime = "TIMEOUT"
            Result = "FAIL"
            Error = $_.Exception.Message
        }
        
        $testResults.ServiceHealth += $result
        Write-Host "  ✗ ${name}: $($_.Exception.Message)" -ForegroundColor Red
        return $result
    }
}

# Function to test API endpoints quickly
function Test-APIEndpoint {
    param($service, $endpoint, $method = "GET", $expectedStatus = 200)
    
    try {
        $start = Get-Date
        $response = Invoke-RestMethod -Uri $endpoint -Method $method -TimeoutSec 5
        $duration = (Get-Date) - $start
        
        $result = @{
            Service = $service
            Endpoint = $endpoint
            Method = $method
            ResponseTime = [math]::Round($duration.TotalMilliseconds, 2)
            Result = "PASS"
            Data = $response
        }
        
        $testResults.APIEndpoints += $result
        Write-Host "  ✓ $service API ($($result.ResponseTime)ms): Working" -ForegroundColor Green
        
        return $result
    }
    catch {
        $result = @{
            Service = $service
            Endpoint = $endpoint
            Method = $method
            ResponseTime = "ERROR"
            Result = "FAIL"
            Error = $_.Exception.Message
        }
        
        $testResults.APIEndpoints += $result
        Write-Host "  ✗ ${service} API: $($_.Exception.Message)" -ForegroundColor Red
        return $result
    }
}

# Function to test basic page functionality
function Test-PageFunctionality {
    param($service, $url)
    
    try {
        $start = Get-Date
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
        $duration = (Get-Date) - $start
        
        $contentLength = $response.Content.Length
        $hasTitle = $response.Content -match "<title"
        $hasCSS = $response.Content -match "stylesheet|\.css"
        $hasJS = $response.Content -match "script|\.js"
        
        $result = @{
            Service = $service
            URL = $url
            StatusCode = $response.StatusCode
            ResponseTime = [math]::Round($duration.TotalMilliseconds, 2)
            ContentSize = $contentLength
            HasTitle = $hasTitle
            HasCSS = $hasCSS
            HasJS = $hasJS
            Result = if ($response.StatusCode -eq 200 -and $contentLength -gt 1000) { "PASS" } else { "FAIL" }
        }
        
        $testResults.BasicFunctionality += $result
        
        $color = if ($result.Result -eq "PASS") { "Green" } else { "Yellow" }
        Write-Host "  ✓ $service Page ($($result.ResponseTime)ms): $($result.ContentSize) bytes" -ForegroundColor $color
        
        return $result
    }
    catch {
        $result = @{
            Service = $service
            URL = $url
            StatusCode = "ERROR"
            ResponseTime = "TIMEOUT"
            Result = "FAIL"
            Error = $_.Exception.Message
        }
        
        $testResults.BasicFunctionality += $result
        Write-Host "  ✗ ${service} Page: $($_.Exception.Message)" -ForegroundColor Red
        return $result
    }
}

Write-Host "`n📊 Phase 1: Service Health Checks" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Gray

# Test core services
Test-ServiceHealth "CBD Database" "http://localhost:4180/health"
Test-ServiceHealth "Gateway Service" "http://localhost:4003/health"
Test-ServiceHealth "Admin Dashboard" "http://localhost:4007/api/health"
Test-ServiceHealth "ID Service" "http://localhost:4004/api/health"
Test-ServiceHealth "Hub Application" "http://localhost:4008/api/health"

Write-Host "`n🔌 Phase 2: API Endpoint Testing" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Gray

# Test API endpoints with existing functionality
Test-APIEndpoint "CBD" "http://localhost:4180/stats"
Test-APIEndpoint "Gateway" "http://localhost:4003/api/v1/health"
Test-APIEndpoint "Admin" "http://localhost:4007/api/health"
Test-APIEndpoint "ID" "http://localhost:4004/api/health"
Test-APIEndpoint "Hub" "http://localhost:4008/api/health"

Write-Host "`n🌐 Phase 3: Frontend Page Loading" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Gray

# Test frontend pages
Test-PageFunctionality "Admin Dashboard" "http://localhost:4007"
Test-PageFunctionality "ID Service" "http://localhost:4004"
Test-PageFunctionality "Hub Application" "http://localhost:4008"

Write-Host "`n⚡ Phase 4: Performance Baseline" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Gray

# Quick performance tests
$services = @(
    @{ Name = "Gateway"; URL = "http://localhost:4003/health" },
    @{ Name = "Admin"; URL = "http://localhost:4007/api/health" },
    @{ Name = "ID"; URL = "http://localhost:4004/api/health" },
    @{ Name = "Hub"; URL = "http://localhost:4008/api/health" }
)

foreach ($service in $services) {
    try {
        $times = @()
        for ($i = 1; $i -le 5; $i++) {
            $start = Get-Date
            Invoke-WebRequest -Uri $service.URL -UseBasicParsing -TimeoutSec 3 | Out-Null
            $duration = (Get-Date) - $start
            $times += $duration.TotalMilliseconds
        }
        
        $avgTime = [math]::Round(($times | Measure-Object -Average).Average, 2)
        $minTime = [math]::Round(($times | Measure-Object -Minimum).Minimum, 2)
        $maxTime = [math]::Round(($times | Measure-Object -Maximum).Maximum, 2)
        
        $perfResult = @{
            Service = $service.Name
            AverageTime = $avgTime
            MinTime = $minTime
            MaxTime = $maxTime
            Result = if ($avgTime -lt 500) { "EXCELLENT" } elseif ($avgTime -lt 1000) { "GOOD" } else { "SLOW" }
        }
        
        $testResults.Performance += $perfResult
        
        $color = switch ($perfResult.Result) {
            "EXCELLENT" { "Green" }
            "GOOD" { "Yellow" }
            "SLOW" { "Red" }
        }
        
        Write-Host "  ✓ $($service.Name): Avg ${avgTime}ms (${minTime}-${maxTime}ms) - $($perfResult.Result)" -ForegroundColor $color
    }
    catch {
        Write-Host "  ✗ $($service.Name): Performance test failed" -ForegroundColor Red
    }
}

# Calculate overall results
$totalTests = ($testResults.ServiceHealth + $testResults.APIEndpoints + $testResults.BasicFunctionality).Count
$passedTests = ($testResults.ServiceHealth + $testResults.APIEndpoints + $testResults.BasicFunctionality | Where-Object { $_.Result -eq "PASS" }).Count
$successRate = if ($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 1) } else { 0 }

$endTime = Get-Date
$totalDuration = $endTime - $startTime

Write-Host "`n📋 Fast Validation Summary" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Gray
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $($totalTests - $passedTests)" -ForegroundColor Red
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -gt 80) { "Green" } elseif ($successRate -gt 60) { "Yellow" } else { "Red" })
Write-Host "Total Duration: $([math]::Round($totalDuration.TotalSeconds, 2)) seconds" -ForegroundColor Gray

# Service Status Summary
Write-Host "`n🏥 Service Status Summary" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Gray
foreach ($service in $testResults.ServiceHealth) {
    $statusColor = if ($service.Result -eq "PASS") { "Green" } else { "Red" }
    $statusIcon = if ($service.Result -eq "PASS") { "✅" } else { "❌" }
    Write-Host "$statusIcon $($service.Service): $($service.Status) ($($service.ResponseTime)ms)" -ForegroundColor $statusColor
}

# Performance Summary
if ($testResults.Performance.Count -gt 0) {
    Write-Host "`n⚡ Performance Summary" -ForegroundColor Cyan
    Write-Host "=====================" -ForegroundColor Gray
    foreach ($perf in $testResults.Performance) {
        $perfColor = switch ($perf.Result) {
            "EXCELLENT" { "Green" }
            "GOOD" { "Yellow" }
            "SLOW" { "Red" }
        }
        Write-Host "⚡ $($perf.Service): $($perf.AverageTime)ms - $($perf.Result)" -ForegroundColor $perfColor
    }
}

# Recommendations
Write-Host "`n💡 Quick Recommendations" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Gray

$failedServices = $testResults.ServiceHealth | Where-Object { $_.Result -eq "FAIL" }
if ($failedServices.Count -eq 0) {
    Write-Host "✅ All services are healthy and responsive!" -ForegroundColor Green
    Write-Host "✅ System is ready for comprehensive testing" -ForegroundColor Green
} else {
    Write-Host "⚠️  Fix the following services:" -ForegroundColor Yellow
    foreach ($failed in $failedServices) {
        Write-Host "   - $($failed.Service): $($failed.Error)" -ForegroundColor Red
    }
}

$slowServices = $testResults.Performance | Where-Object { $_.Result -eq "SLOW" }
if ($slowServices.Count -gt 0) {
    Write-Host "⚡ Performance optimization needed for:" -ForegroundColor Yellow
    foreach ($slow in $slowServices) {
        Write-Host "   - $($slow.Service): $($slow.AverageTime)ms average" -ForegroundColor Red
    }
}

Write-Host "`n🎯 Fast Validation Complete!" -ForegroundColor Green
Write-Host "Use this for quick health checks without dependency installations" -ForegroundColor Gray
