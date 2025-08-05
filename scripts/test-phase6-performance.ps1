#!/usr/bin/env pwsh
# Phase 6: Performance Testing Implementation  
# Comprehensive performance testing for all services under various load conditions

param(
    [switch]$Verbose = $false,
    [string]$Service = "all", # all, admin, id, hub, gateway, cbd
    [int]$Duration = 30, # Test duration in seconds
    [int]$MaxConcurrent = 50 # Maximum concurrent requests
)

Write-Host "🚀 Starting Phase 6: Performance Testing Implementation" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Gray

# Test tracking
$script:TestResults = @()
$script:PassedTests = 0
$script:FailedTests = 0
$script:TotalTests = 0

function Test-PerformanceScenario {
    param(
        [string]$Name,
        [scriptblock]$TestBlock
    )
    
    $script:TotalTests++
    Write-Host "⚡ Testing Performance Scenario: $Name" -ForegroundColor Yellow
    
    try {
        $startTime = Get-Date
        $result = & $TestBlock
        $duration = (Get-Date) - $startTime
        
        if ($result.Success) {
            Write-Host "✅ $Name : PASSED ($($duration.TotalSeconds)s)" -ForegroundColor Green
            $script:PassedTests++
            $script:TestResults += @{
                Name = $Name
                Status = "PASSED"
                Duration = $duration.TotalSeconds
                Details = $result.Details
                Metrics = $result.Metrics
            }
            return $true
        } else {
            Write-Host "❌ $Name : FAILED" -ForegroundColor Red
            $script:FailedTests++
            $script:TestResults += @{
                Name = $Name
                Status = "FAILED"
                Duration = $duration.TotalSeconds
                Details = $result.Details
                Metrics = $result.Metrics
            }
            return $false
        }
    }
    catch {
        $duration = (Get-Date) - $startTime
        Write-Host "❌ $Name : ERROR - $($_.Exception.Message)" -ForegroundColor Red
        $script:FailedTests++
        $script:TestResults += @{
            Name = $Name
            Status = "ERROR"
            Duration = $duration.TotalSeconds
            Details = $_.Exception.Message
            Metrics = @{}
        }
        return $false
    }
}

function Test-ServiceLatency {
    param([string]$Url, [string]$ServiceName, [int]$Iterations = 20)
    
    $measurements = @()
    $successCount = 0
    
    for ($i = 1; $i -le $Iterations; $i++) {
        try {
            $start = Get-Date
            $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 10
            $end = Get-Date
            $duration = ($end - $start).TotalMilliseconds
            $measurements += $duration
            $successCount++
        }
        catch {
            # Skip failed requests but count them
            continue
        }
    }
    
    if ($measurements.Count -gt 0) {
        $avgTime = ($measurements | Measure-Object -Average).Average
        $minTime = ($measurements | Measure-Object -Minimum).Minimum
        $maxTime = ($measurements | Measure-Object -Maximum).Maximum
        $medianTime = ($measurements | Sort-Object)[[math]::Floor($measurements.Count / 2)]
        
        $successRate = ($successCount / $Iterations) * 100
        
        Write-Host "   📊 $ServiceName Latency: Avg=${avgTime}ms, Min=${minTime}ms, Max=${maxTime}ms, Median=${medianTime}ms" -ForegroundColor White
        Write-Host "   📈 Success Rate: $successRate% ($successCount/$Iterations)" -ForegroundColor White
        
        return @{
            Success = ($avgTime -lt 500 -and $successRate -ge 95)
            Details = "$ServiceName - Avg: ${avgTime}ms, Success: $successRate%"
            Metrics = @{
                Average = $avgTime
                Minimum = $minTime
                Maximum = $maxTime
                Median = $medianTime
                SuccessRate = $successRate
                TotalRequests = $Iterations
                SuccessfulRequests = $successCount
            }
        }
    } else {
        return @{
            Success = $false
            Details = "$ServiceName - All requests failed"
            Metrics = @{}
        }
    }
}

function Test-LoadCapacity {
    param([string]$Url, [string]$ServiceName, [int]$ConcurrentUsers = 20, [int]$DurationSec = 15)
    
    Write-Host "   🔥 Load testing $ServiceName with $ConcurrentUsers concurrent users for ${DurationSec}s" -ForegroundColor White
    
    $jobs = @()
    $results = @()
    $startTime = Get-Date
    
    # Start concurrent jobs
    for ($i = 1; $i -le $ConcurrentUsers; $i++) {
        $job = Start-Job -ScriptBlock {
            param($Url, $DurationSec)
            
            $endTime = (Get-Date).AddSeconds($DurationSec)
            $requests = 0
            $successes = 0
            $totalTime = 0
            
            while ((Get-Date) -lt $endTime) {
                try {
                    $start = Get-Date
                    Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 5 | Out-Null
                    $duration = ((Get-Date) - $start).TotalMilliseconds
                    $totalTime += $duration
                    $successes++
                } catch {
                    # Count failed requests
                }
                $requests++
                Start-Sleep -Milliseconds 100 # Small delay between requests
            }
            
            return @{
                Requests = $requests
                Successes = $successes
                TotalTime = $totalTime
            }
        } -ArgumentList $Url, $DurationSec
        
        $jobs += $job
    }
    
    # Wait for all jobs to complete
    $jobs | Wait-Job | Out-Null
    
    # Collect results
    foreach ($job in $jobs) {
        $result = Receive-Job -Job $job
        $results += $result
        Remove-Job -Job $job
    }
    
    $totalRequests = ($results | Measure-Object -Property Requests -Sum).Sum
    $totalSuccesses = ($results | Measure-Object -Property Successes -Sum).Sum
    $avgResponseTime = if ($totalSuccesses -gt 0) { 
        ($results | Measure-Object -Property TotalTime -Sum).Sum / $totalSuccesses 
    } else { 0 }
    
    $actualDuration = ((Get-Date) - $startTime).TotalSeconds
    $requestsPerSecond = if ($actualDuration -gt 0) { $totalRequests / $actualDuration } else { 0 }
    $successRate = if ($totalRequests -gt 0) { ($totalSuccesses / $totalRequests) * 100 } else { 0 }
    
    Write-Host "   📊 Load Test Results:" -ForegroundColor White
    Write-Host "      Total Requests: $totalRequests" -ForegroundColor Gray
    Write-Host "      Successful Requests: $totalSuccesses" -ForegroundColor Gray
    Write-Host "      Success Rate: $successRate%" -ForegroundColor Gray
    Write-Host "      Requests/Second: $requestsPerSecond" -ForegroundColor Gray
    Write-Host "      Avg Response Time: ${avgResponseTime}ms" -ForegroundColor Gray
    
    return @{
        Success = ($successRate -ge 90 -and $avgResponseTime -lt 1000)
        Details = "$ServiceName Load Test - RPS: $requestsPerSecond, Success: $successRate%"
        Metrics = @{
            TotalRequests = $totalRequests
            SuccessfulRequests = $totalSuccesses
            SuccessRate = $successRate
            RequestsPerSecond = $requestsPerSecond
            AverageResponseTime = $avgResponseTime
            ConcurrentUsers = $ConcurrentUsers
            Duration = $actualDuration
        }
    }
}

# Phase 6.1: CBD Database Performance Testing
if ($Service -eq "all" -or $Service -eq "cbd") {
    Write-Host ""
    Write-Host "🏗️ CBD Database Performance Tests" -ForegroundColor Cyan
    Write-Host "==================================" -ForegroundColor Gray

    Test-PerformanceScenario "CBD Database Latency Test" {
        return Test-ServiceLatency "http://localhost:4180/health" "CBD Database" 30
    }

    Test-PerformanceScenario "CBD Database Load Test" {
        return Test-LoadCapacity "http://localhost:4180/health" "CBD Database" 15 $Duration
    }

    Test-PerformanceScenario "CBD Database Stats Performance" {
        return Test-ServiceLatency "http://localhost:4180/stats" "CBD Stats" 20
    }
}

# Phase 6.2: Gateway Performance Testing
if ($Service -eq "all" -or $Service -eq "gateway") {
    Write-Host ""
    Write-Host "🌐 Gateway Service Performance Tests" -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Gray

    Test-PerformanceScenario "Gateway Latency Test" {
        return Test-ServiceLatency "http://localhost:4003/health" "Gateway" 30
    }

    Test-PerformanceScenario "Gateway Load Test" {
        return Test-LoadCapacity "http://localhost:4003/health" "Gateway" 20 $Duration
    }

    Test-PerformanceScenario "Gateway Routing Performance" {
        return Test-ServiceLatency "http://localhost:4003/api/v1/hub/health" "Gateway Routing" 15
    }
}

# Phase 6.3: ID Service Performance Testing
if ($Service -eq "all" -or $Service -eq "id") {
    Write-Host ""
    Write-Host "🔐 ID Service Performance Tests" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Gray

    Test-PerformanceScenario "ID Service Latency Test" {
        return Test-ServiceLatency "http://localhost:4004/api/health" "ID Service" 25
    }

    Test-PerformanceScenario "ID Service Load Test" {
        return Test-LoadCapacity "http://localhost:4004/api/health" "ID Service" 15 $Duration
    }
}

# Phase 6.4: Admin Service Performance Testing
if ($Service -eq "all" -or $Service -eq "admin") {
    Write-Host ""
    Write-Host "🏠 Admin Service Performance Tests" -ForegroundColor Cyan
    Write-Host "===================================" -ForegroundColor Gray

    Test-PerformanceScenario "Admin Service Latency Test" {
        return Test-ServiceLatency "http://localhost:4007/api/health" "Admin Service" 25
    }

    Test-PerformanceScenario "Admin Service Load Test" {
        return Test-LoadCapacity "http://localhost:4007/api/health" "Admin Service" 15 $Duration
    }
}

# Phase 6.5: Hub Service Performance Testing
if ($Service -eq "all" -or $Service -eq "hub") {
    Write-Host ""
    Write-Host "🏡 Hub Service Performance Tests" -ForegroundColor Cyan
    Write-Host "=================================" -ForegroundColor Gray

    Test-PerformanceScenario "Hub Service Latency Test" {
        return Test-ServiceLatency "http://localhost:4008/api/health" "Hub Service" 25
    }

    Test-PerformanceScenario "Hub Service Load Test" {
        return Test-LoadCapacity "http://localhost:4008/api/health" "Hub Service" 15 $Duration
    }
}

# Phase 6.6: Cross-Service Performance Testing
if ($Service -eq "all") {
    Write-Host ""
    Write-Host "🔗 Cross-Service Performance Tests" -ForegroundColor Cyan
    Write-Host "===================================" -ForegroundColor Gray

    Test-PerformanceScenario "Multi-Service Sequential Performance" {
        $services = @(
            @{Url="http://localhost:4180/health"; Name="CBD"},
            @{Url="http://localhost:4003/health"; Name="Gateway"},
            @{Url="http://localhost:4004/api/health"; Name="ID"},
            @{Url="http://localhost:4007/api/health"; Name="Admin"},
            @{Url="http://localhost:4008/api/health"; Name="Hub"}
        )
        
        $totalTime = 0
        $allSuccess = $true
        
        foreach ($service in $services) {
            $start = Get-Date
            try {
                Invoke-RestMethod -Uri $service.Url -Method Get -TimeoutSec 5 | Out-Null
                $duration = ((Get-Date) - $start).TotalMilliseconds
                $totalTime += $duration
                Write-Host "   ✅ $($service.Name): ${duration}ms" -ForegroundColor White
            }
            catch {
                Write-Host "   ❌ $($service.Name): Failed" -ForegroundColor Red
                $allSuccess = $false
            }
        }
        
        Write-Host "   📊 Total sequential time: ${totalTime}ms" -ForegroundColor White
        
        return @{
            Success = ($allSuccess -and $totalTime -lt 2000)
            Details = "Multi-Service Sequential - Total: ${totalTime}ms"
            Metrics = @{
                TotalTime = $totalTime
                AllServicesResponding = $allSuccess
                ServicesCount = $services.Count
            }
        }
    }

    Test-PerformanceScenario "System-Wide Load Test" {
        Write-Host "   🔥 Testing all services under concurrent load" -ForegroundColor White
        
        $services = @(
            @{Url="http://localhost:4180/health"; Name="CBD"},
            @{Url="http://localhost:4003/health"; Name="Gateway"},
            @{Url="http://localhost:4004/api/health"; Name="ID"},
            @{Url="http://localhost:4007/api/health"; Name="Admin"},
            @{Url="http://localhost:4008/api/health"; Name="Hub"}
        )
        
        $jobs = @()
        
        # Start load tests for each service concurrently
        foreach ($service in $services) {
            $job = Start-Job -ScriptBlock {
                param($Url, $ServiceName, $Duration)
                
                $endTime = (Get-Date).AddSeconds($Duration)
                $requests = 0
                $successes = 0
                
                while ((Get-Date) -lt $endTime) {
                    try {
                        Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 3 | Out-Null
                        $successes++
                    } catch {
                        # Count failed requests
                    }
                    $requests++
                    Start-Sleep -Milliseconds 200
                }
                
                return @{
                    Service = $ServiceName
                    Requests = $requests
                    Successes = $successes
                    SuccessRate = if ($requests -gt 0) { ($successes / $requests) * 100 } else { 0 }
                }
            } -ArgumentList $service.Url, $service.Name, ($Duration / 2)
            
            $jobs += $job
        }
        
        # Wait for all jobs and collect results
        $jobs | Wait-Job | Out-Null
        $results = @()
        
        foreach ($job in $jobs) {
            $result = Receive-Job -Job $job
            $results += $result
            Remove-Job -Job $job
        }
        
        $overallSuccess = $true
        foreach ($result in $results) {
            Write-Host "   📊 $($result.Service): $($result.SuccessRate)% success ($($result.Successes)/$($result.Requests))" -ForegroundColor White
            if ($result.SuccessRate -lt 80) { $overallSuccess = $false }
        }
        
        return @{
            Success = $overallSuccess
            Details = "System-Wide Load Test - All services under concurrent load"
            Metrics = @{
                ServiceResults = $results
                OverallSuccess = $overallSuccess
            }
        }
    }
}

# Results Summary
Write-Host ""
Write-Host "📊 Performance Test Results Summary" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Gray
Write-Host "Total Performance Scenarios: $script:TotalTests" -ForegroundColor White
Write-Host "Passed: $script:PassedTests" -ForegroundColor Green
Write-Host "Failed: $script:FailedTests" -ForegroundColor Red

if ($script:TotalTests -gt 0) {
    $passRate = [math]::Round(($script:PassedTests / $script:TotalTests) * 100, 1)
    Write-Host "Performance Pass Rate: $passRate%" -ForegroundColor $(if ($passRate -ge 90) { "Green" } elseif ($passRate -ge 70) { "Yellow" } else { "Red" })
}

Write-Host ""
Write-Host "⚡ Performance Scenario Results:" -ForegroundColor Cyan
foreach ($result in $script:TestResults) {
    $statusColor = switch ($result.Status) {
        "PASSED" { "Green" }
        "FAILED" { "Red" }
        "ERROR" { "Red" }
        default { "Yellow" }
    }
    
    $icon = switch ($result.Status) {
        "PASSED" { "✅" }
        "FAILED" { "❌" }
        "ERROR" { "❌" }
        default { "⚠️" }
    }
    
    Write-Host "$icon $($result.Name) : $($result.Status)" -ForegroundColor $statusColor
    if ($result.Metrics -and $result.Metrics.Average) {
        Write-Host "   Average Response: $([math]::Round($result.Metrics.Average, 2))ms" -ForegroundColor Gray
    }
    if ($result.Metrics -and $result.Metrics.RequestsPerSecond) {
        Write-Host "   Throughput: $([math]::Round($result.Metrics.RequestsPerSecond, 2)) req/sec" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "🏆 Final Performance Assessment:" -ForegroundColor Cyan
if ($script:PassedTests -eq $script:TotalTests -and $script:TotalTests -gt 0) {
    Write-Host "🎉 OUTSTANDING! All performance targets met" -ForegroundColor Green
    Write-Host "🚀 System ready for high-load production deployment" -ForegroundColor Green
} elseif ($script:PassedTests / $script:TotalTests -ge 0.8) {
    Write-Host "👍 GOOD! Most performance targets met" -ForegroundColor Yellow
    Write-Host "🔧 Minor performance optimization recommended" -ForegroundColor Yellow
} else {
    Write-Host "⚠️ NEEDS WORK! Performance issues detected" -ForegroundColor Red
    Write-Host "🔧 Performance optimization required before production" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Phase 6: Performance Testing Implementation Complete!" -ForegroundColor Green

# Return exit code based on results
if ($script:FailedTests -eq 0) {
    exit 0
} else {
    exit 1
}
