#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Performance Baseline Assessment Script for Essential CodAI Services
.DESCRIPTION
    Measures current response times and resource utilization for all 5 backend services
    to establish baseline metrics before optimization
.NOTES
    Sprint: Essential CodAI Services Enhancement
    User Story: US-PERF-001 - Service Response Time Optimization
    Target: <100ms response time for 95% of requests
#>

param(
    [int]$TestDuration = 60,      # Duration in seconds
    [int]$RequestsPerSecond = 10, # Concurrent requests per service
    [switch]$Detailed = $false,   # Show detailed metrics
    [string]$OutputFile = "performance_baseline_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
)

Write-Host "🚀 CodAI Services Performance Baseline Assessment" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Test Configuration:" -ForegroundColor Yellow
Write-Host "  • Duration: $TestDuration seconds" -ForegroundColor White
Write-Host "  • Requests/sec per service: $RequestsPerSecond" -ForegroundColor White
Write-Host "  • Output file: $OutputFile" -ForegroundColor White
Write-Host ""

# Service endpoints configuration (Updated with correct health endpoints)
$services = @(
    @{
        Name = "Identity API"
        Port = 8100
        Endpoint = "/api/health"
        ExpectedStatus = 200
    },
    @{
        Name = "API Gateway"
        Port = 8010
        Endpoint = "/api/health"
        ExpectedStatus = 200
    },
    @{
        Name = "Hub API"
        Port = 8110
        Endpoint = "/api/health"
        ExpectedStatus = 200
    },
    @{
        Name = "MemorAI Frontend"
        Port = 8006
        Endpoint = "/api/health"
        ExpectedStatus = 200
    },
    @{
        Name = "CBD Database"
        Port = 8180
        Endpoint = "/health"
        ExpectedStatus = 200
    }
)

$results = @{}
$startTime = Get-Date

foreach ($service in $services) {
    Write-Host "🔍 Testing $($service.Name) on port $($service.Port)..." -ForegroundColor Green
    
    $serviceResults = @{
        ServiceName = $service.Name
        Port = $service.Port
        Endpoint = $service.Endpoint
        ResponseTimes = @()
        SuccessfulRequests = 0
        FailedRequests = 0
        AverageResponseTime = 0
        MinResponseTime = [double]::MaxValue
        MaxResponseTime = 0
        P95ResponseTime = 0
        P99ResponseTime = 0
        RequestsPerSecond = 0
        ErrorRate = 0
        StartTime = $startTime
        EndTime = $null
    }
    
    # Warm up request
    try {
        $warmupResponse = Invoke-RestMethod -Uri "http://localhost:$($service.Port)$($service.Endpoint)" -Method Get -TimeoutSec 5
        Write-Host "  ✅ Service is accessible" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Service not accessible: $($_.Exception.Message)" -ForegroundColor Red
        $serviceResults.FailedRequests = 1
        $results[$service.Name] = $serviceResults
        continue
    }
    
    # Performance testing
    $testEndTime = $startTime.AddSeconds($TestDuration)
    $requestCount = 0
    
    while ((Get-Date) -lt $testEndTime) {
        try {
            $requestStart = Get-Date
            $response = Invoke-RestMethod -Uri "http://localhost:$($service.Port)$($service.Endpoint)" -Method Get -TimeoutSec 5
            $requestEnd = Get-Date
            
            $responseTime = ($requestEnd - $requestStart).TotalMilliseconds
            $serviceResults.ResponseTimes += $responseTime
            $serviceResults.SuccessfulRequests++
            
            # Update min/max
            if ($responseTime -lt $serviceResults.MinResponseTime) {
                $serviceResults.MinResponseTime = $responseTime
            }
            if ($responseTime -gt $serviceResults.MaxResponseTime) {
                $serviceResults.MaxResponseTime = $responseTime
            }
            
            $requestCount++
            
            # Progress indicator
            if ($requestCount % 10 -eq 0) {
                Write-Host "    📊 Completed $requestCount requests..." -ForegroundColor Gray
            }
            
            # Rate limiting
            Start-Sleep -Milliseconds (1000 / $RequestsPerSecond)
            
        } catch {
            $serviceResults.FailedRequests++
            Write-Host "    ⚠️ Request failed: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    
    $serviceResults.EndTime = Get-Date
    $actualDuration = ($serviceResults.EndTime - $serviceResults.StartTime).TotalSeconds
    
    # Calculate metrics
    if ($serviceResults.ResponseTimes.Count -gt 0) {
        $sortedTimes = $serviceResults.ResponseTimes | Sort-Object
        $serviceResults.AverageResponseTime = [math]::Round(($sortedTimes | Measure-Object -Average).Average, 2)
        
        # Calculate percentiles
        $p95Index = [math]::Floor($sortedTimes.Count * 0.95)
        $p99Index = [math]::Floor($sortedTimes.Count * 0.99)
        $serviceResults.P95ResponseTime = [math]::Round($sortedTimes[$p95Index], 2)
        $serviceResults.P99ResponseTime = [math]::Round($sortedTimes[$p99Index], 2)
        
        $totalRequests = $serviceResults.SuccessfulRequests + $serviceResults.FailedRequests
        $serviceResults.RequestsPerSecond = [math]::Round($totalRequests / $actualDuration, 2)
        $serviceResults.ErrorRate = [math]::Round(($serviceResults.FailedRequests / $totalRequests) * 100, 2)
    }
    
    # Display results
    Write-Host "  📈 Results for $($service.Name):" -ForegroundColor Cyan
    Write-Host "    ✅ Successful requests: $($serviceResults.SuccessfulRequests)" -ForegroundColor Green
    Write-Host "    ❌ Failed requests: $($serviceResults.FailedRequests)" -ForegroundColor Red
    Write-Host "    ⏱️ Average response: $($serviceResults.AverageResponseTime)ms" -ForegroundColor White
    Write-Host "    📊 95th percentile: $($serviceResults.P95ResponseTime)ms" -ForegroundColor White
    Write-Host "    📊 99th percentile: $($serviceResults.P99ResponseTime)ms" -ForegroundColor White
    Write-Host "    🚀 Requests/sec: $($serviceResults.RequestsPerSecond)" -ForegroundColor White
    Write-Host "    💯 Error rate: $($serviceResults.ErrorRate)%" -ForegroundColor White
    Write-Host ""
    
    $results[$service.Name] = $serviceResults
}

# Generate summary report
Write-Host "📋 PERFORMANCE BASELINE SUMMARY" -ForegroundColor Magenta
Write-Host "================================" -ForegroundColor Magenta
Write-Host ""

$overallStats = @{
    TotalServices = $services.Count
    HealthyServices = 0
    UnhealthyServices = 0
    AverageResponseTime = 0
    BestPerformer = ""
    WorstPerformer = ""
    ServicesUnder100ms = 0
    ServicesOver100ms = 0
}

$responseTimes = @()
foreach ($result in $results.Values) {
    if ($result.SuccessfulRequests -gt 0) {
        $overallStats.HealthyServices++
        $responseTimes += $result.AverageResponseTime
        
        if ($result.P95ResponseTime -lt 100) {
            $overallStats.ServicesUnder100ms++
        } else {
            $overallStats.ServicesOver100ms++
        }
    } else {
        $overallStats.UnhealthyServices++
    }
}

if ($responseTimes.Count -gt 0) {
    $overallStats.AverageResponseTime = [math]::Round(($responseTimes | Measure-Object -Average).Average, 2)
    $bestService = $results.Values | Where-Object { $_.SuccessfulRequests -gt 0 } | Sort-Object AverageResponseTime | Select-Object -First 1
    $worstService = $results.Values | Where-Object { $_.SuccessfulRequests -gt 0 } | Sort-Object AverageResponseTime -Descending | Select-Object -First 1
    $overallStats.BestPerformer = $bestService.ServiceName
    $overallStats.WorstPerformer = $worstService.ServiceName
}

Write-Host "🏆 Overall Performance:" -ForegroundColor Yellow
Write-Host "  📊 Healthy services: $($overallStats.HealthyServices)/$($overallStats.TotalServices)" -ForegroundColor Green
Write-Host "  ⏱️ Average response time: $($overallStats.AverageResponseTime)ms" -ForegroundColor White
Write-Host "  🎯 Services under 100ms (95th percentile): $($overallStats.ServicesUnder100ms)" -ForegroundColor Green
Write-Host "  ⚠️ Services over 100ms (95th percentile): $($overallStats.ServicesOver100ms)" -ForegroundColor Yellow
Write-Host "  🥇 Best performer: $($overallStats.BestPerformer)" -ForegroundColor Green
Write-Host "  🐌 Needs optimization: $($overallStats.WorstPerformer)" -ForegroundColor Yellow
Write-Host ""

# Generate recommendations
Write-Host "🎯 OPTIMIZATION RECOMMENDATIONS" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""

foreach ($result in $results.Values) {
    if ($result.SuccessfulRequests -gt 0) {
        Write-Host "📝 $($result.ServiceName):" -ForegroundColor Yellow
        
        if ($result.P95ResponseTime -lt 50) {
            Write-Host "  ✅ Excellent performance - maintain current optimization" -ForegroundColor Green
        } elseif ($result.P95ResponseTime -lt 100) {
            Write-Host "  ⚡ Good performance - minor optimization opportunities" -ForegroundColor Green
        } elseif ($result.P95ResponseTime -lt 200) {
            Write-Host "  ⚠️ Moderate performance - optimization recommended" -ForegroundColor Yellow
            Write-Host "    • Consider database query optimization" -ForegroundColor Gray
            Write-Host "    • Review caching strategy" -ForegroundColor Gray
            Write-Host "    • Check for unnecessary processing" -ForegroundColor Gray
        } else {
            Write-Host "  🚨 Poor performance - immediate optimization required" -ForegroundColor Red
            Write-Host "    • Database queries need optimization" -ForegroundColor Gray
            Write-Host "    • Implement aggressive caching" -ForegroundColor Gray
            Write-Host "    • Profile for bottlenecks" -ForegroundColor Gray
            Write-Host "    • Consider service splitting" -ForegroundColor Gray
        }
        
        if ($result.ErrorRate -gt 1) {
            Write-Host "  🚨 High error rate detected - stability issues" -ForegroundColor Red
        }
        
        Write-Host ""
    }
}

# Save results to JSON file
$reportData = @{
    TestConfiguration = @{
        Duration = $TestDuration
        RequestsPerSecond = $RequestsPerSecond
        TestStartTime = $startTime
        TestEndTime = Get-Date
    }
    ServiceResults = $results
    OverallStatistics = $overallStats
    GeneratedAt = Get-Date
    Version = "1.0"
}

try {
    $reportData | ConvertTo-Json -Depth 10 | Out-File -FilePath $OutputFile -Encoding UTF8
    Write-Host "💾 Results saved to: $OutputFile" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to save results: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Performance baseline assessment completed!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review optimization recommendations above" -ForegroundColor White
Write-Host "  2. Implement database query optimizations" -ForegroundColor White
Write-Host "  3. Enhance caching strategies" -ForegroundColor White
Write-Host "  4. Re-run this test after optimizations" -ForegroundColor White
Write-Host ""