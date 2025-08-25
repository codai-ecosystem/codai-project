#!/usr/bin/env pwsh
# CODAI Ecosystem - Load Balancing Validation and Testing Script
# Performance testing and validation for auto-scaling infrastructure

param(
    [switch]$ValidateLoadBalancer,
    [switch]$TestAutoScaling,
    [switch]$PerformanceTest,
    [switch]$ConnectionPoolTest,
    [switch]$FailoverTest,
    [int]$ConcurrentUsers = 50,
    [int]$TestDuration = 300,
    [switch]$All
)

function Write-Step { param($Message) Write-Host "🔧 $Message" -ForegroundColor Blue }
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }

Write-Host "🧪 CODAI Load Balancing Validation Suite" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

function Test-LoadBalancerHealth {
    Write-Step "Validating Nginx Load Balancer health..."
    
    $healthChecks = @(
        @{ Name = "Nginx Health"; URL = "http://localhost:8080/nginx-health" }
        @{ Name = "Nginx Status"; URL = "http://localhost:8080/nginx-status" }
        @{ Name = "Nginx Metrics"; URL = "http://localhost:9113/metrics" }
        @{ Name = "Connection Pool Health"; URL = "http://localhost:9000/database-health" }
    )
    
    $healthyCount = 0
    foreach ($check in $healthChecks) {
        try {
            $response = Invoke-RestMethod -Uri $check.URL -Method Get -TimeoutSec 5 -ErrorAction Stop
            Write-Success "$($check.Name): Healthy"
            $healthyCount++
        } catch {
            Write-Error "$($check.Name): Failed - $($_.Exception.Message)"
        }
    }
    
    $healthPercentage = ($healthyCount / $healthChecks.Count) * 100
    Write-Info "Load Balancer Health: $([math]::Round($healthPercentage, 1))% ($healthyCount/$($healthChecks.Count) checks)"
    
    return $healthPercentage -ge 75
}

function Test-ServiceDistribution {
    Write-Step "Testing load distribution across service instances..."
    
    $services = @('memorai-app', 'memorai-mcp', 'romai-agi', 'memorai-graphql')
    $results = @{}
    
    foreach ($service in $services) {
        Write-Info "Testing $service distribution..."
        $instanceHits = @{}
        $totalRequests = 100
        
        for ($i = 1; $i -le $totalRequests; $i++) {
            try {
                $baseUrl = switch ($service) {
                    'memorai-app' { "http://localhost/memorai/api/health" }
                    'memorai-mcp' { "http://localhost/api/v1/mcp/health" }
                    'romai-agi' { "http://localhost/api/v1/agi/health" }
                    'memorai-graphql' { "http://localhost/graphql" }
                }
                
                $response = Invoke-RestMethod -Uri $baseUrl -Method Get -TimeoutSec 5 -Headers @{
                    'X-Request-ID' = "test-$i"
                } -ErrorAction Stop
                
                # Extract instance information from response headers
                $instance = $response.Headers['X-Instance-ID'] ?? "unknown-$([math]::Floor($i / 10))"
                if (-not $instanceHits.ContainsKey($instance)) {
                    $instanceHits[$instance] = 0
                }
                $instanceHits[$instance]++
                
                if ($i % 25 -eq 0) {
                    Write-Host "." -NoNewline -ForegroundColor Gray
                }
            } catch {
                # Expected for some services that aren't running
            }
        }
        
        Write-Host ""
        if ($instanceHits.Count -gt 0) {
            Write-Success "$service distribution:"
            foreach ($instance in $instanceHits.Keys) {
                $percentage = ($instanceHits[$instance] / $totalRequests) * 100
                Write-Host "    $instance`: $($instanceHits[$instance]) requests ($([math]::Round($percentage, 1))%)" -ForegroundColor White
            }
            $results[$service] = $instanceHits
        } else {
            Write-Warning "$service`: No instances responding (expected for non-running services)"
            $results[$service] = @{}
        }
    }
    
    return $results
}

function Test-AutoScalingResponse {
    Write-Step "Testing auto-scaling response to load..."
    
    $service = 'memorai-app'
    Write-Info "Initial instance count for $service..."
    
    # Get initial instance count
    $initialContainers = docker ps --filter "label=com.codai.service=$service" --format "{{.Names}}"
    $initialCount = ($initialContainers | Measure-Object).Count
    Write-Info "Initial instances: $initialCount"
    
    # Simulate high load
    Write-Step "Simulating high CPU load for 120 seconds..."
    $loadJobs = @()
    
    for ($i = 1; $i -le 20; $i++) {
        $loadJobs += Start-Job -ScriptBlock {
            param($serviceUrl, $duration)
            $endTime = (Get-Date).AddSeconds($duration)
            while ((Get-Date) -lt $endTime) {
                try {
                    Invoke-RestMethod -Uri $serviceUrl -Method Get -TimeoutSec 2 -ErrorAction SilentlyContinue
                    Start-Sleep -Milliseconds 100
                } catch {}
            }
        } -ArgumentList "http://localhost/memorai/api/health", 120
    }
    
    # Monitor for scaling events
    Write-Info "Monitoring for auto-scaling response..."
    $monitoringDuration = 180  # 3 minutes
    $checkInterval = 15       # Check every 15 seconds
    $checks = $monitoringDuration / $checkInterval
    
    for ($check = 1; $check -le $checks; $check++) {
        Start-Sleep -Seconds $checkInterval
        
        $currentContainers = docker ps --filter "label=com.codai.service=$service" --format "{{.Names}}"
        $currentCount = ($currentContainers | Measure-Object).Count
        
        Write-Host "Check $check/$checks - Instances: $currentCount" -ForegroundColor Gray
        
        if ($currentCount -gt $initialCount) {
            Write-Success "Auto-scaling detected! Instances scaled from $initialCount to $currentCount"
            break
        }
    }
    
    # Cleanup load jobs
    $loadJobs | Stop-Job -PassThru | Remove-Job -Force
    
    # Final instance count
    $finalContainers = docker ps --filter "label=com.codai.service=$service" --format "{{.Names}}"
    $finalCount = ($finalContainers | Measure-Object).Count
    
    Write-Info "Final instances: $finalCount"
    
    if ($finalCount -gt $initialCount) {
        Write-Success "Auto-scaling test: PASSED (Scaled from $initialCount to $finalCount)"
        return $true
    } else {
        Write-Warning "Auto-scaling test: No scaling detected (may require longer load duration)"
        return $false
    }
}

function Test-PerformanceUnderLoad {
    Write-Step "Running performance test under load..."
    
    $testResults = @{
        requests = 0
        successful = 0
        failed = 0
        avgResponseTime = 0
        maxResponseTime = 0
        minResponseTime = [double]::MaxValue
        errors = @()
        throughputPerSecond = 0
    }
    
    $endpoints = @(
        "http://localhost/memorai/api/health",
        "http://localhost/api/v1/database/health",
        "http://localhost/api/v1/mcp/health"
    )
    
    Write-Info "Running $ConcurrentUsers concurrent users for $TestDuration seconds..."
    
    $jobs = @()
    $startTime = Get-Date
    
    for ($i = 1; $i -le $ConcurrentUsers; $i++) {
        $jobs += Start-Job -ScriptBlock {
            param($endpoints, $duration, $userId)
            
            $results = @{
                requests = 0
                successful = 0
                failed = 0
                responseTimes = @()
                errors = @()
            }
            
            $endTime = (Get-Date).AddSeconds($duration)
            
            while ((Get-Date) -lt $endTime) {
                $endpoint = $endpoints | Get-Random
                $requestStart = Get-Date
                
                try {
                    $response = Invoke-RestMethod -Uri $endpoint -Method Get -TimeoutSec 5 -ErrorAction Stop
                    $requestTime = ((Get-Date) - $requestStart).TotalMilliseconds
                    
                    $results.requests++
                    $results.successful++
                    $results.responseTimes += $requestTime
                    
                } catch {
                    $results.requests++
                    $results.failed++
                    $results.errors += $_.Exception.Message
                }
                
                Start-Sleep -Milliseconds (Get-Random -Minimum 50 -Maximum 200)
            }
            
            return $results
        } -ArgumentList $endpoints, $TestDuration, $i
    }
    
    # Monitor progress
    Write-Info "Test running... (Press Ctrl+C to stop early)"
    for ($elapsed = 0; $elapsed -lt $TestDuration; $elapsed += 10) {
        Start-Sleep -Seconds 10
        $progress = ($elapsed / $TestDuration) * 100
        Write-Host "Progress: $([math]::Round($progress, 1))% ($elapsed/$TestDuration seconds)" -ForegroundColor Gray
    }
    
    # Collect results
    Write-Step "Collecting results from $ConcurrentUsers workers..."
    
    $allResponseTimes = @()
    foreach ($job in $jobs) {
        $jobResult = Receive-Job -Job $job -Wait
        $testResults.requests += $jobResult.requests
        $testResults.successful += $jobResult.successful
        $testResults.failed += $jobResult.failed
        $allResponseTimes += $jobResult.responseTimes
        $testResults.errors += $jobResult.errors
    }
    
    $jobs | Remove-Job -Force
    
    # Calculate statistics
    if ($allResponseTimes.Count -gt 0) {
        $testResults.avgResponseTime = ($allResponseTimes | Measure-Object -Average).Average
        $testResults.maxResponseTime = ($allResponseTimes | Measure-Object -Maximum).Maximum
        $testResults.minResponseTime = ($allResponseTimes | Measure-Object -Minimum).Minimum
    }
    
    $actualDuration = ((Get-Date) - $startTime).TotalSeconds
    $testResults.throughputPerSecond = $testResults.successful / $actualDuration
    
    # Display results
    Write-Host "`n" + ("=" * 50) -ForegroundColor Magenta
    Write-Host "📊 PERFORMANCE TEST RESULTS" -ForegroundColor White -BackgroundColor Blue
    Write-Host ("=" * 50) -ForegroundColor Magenta
    
    Write-Host "Total Requests: $($testResults.requests)" -ForegroundColor White
    Write-Host "Successful: $($testResults.successful)" -ForegroundColor Green
    Write-Host "Failed: $($testResults.failed)" -ForegroundColor Red
    Write-Host "Success Rate: $([math]::Round(($testResults.successful / $testResults.requests) * 100, 2))%" -ForegroundColor Cyan
    Write-Host "Average Response Time: $([math]::Round($testResults.avgResponseTime, 2))ms" -ForegroundColor White
    Write-Host "Min/Max Response Time: $([math]::Round($testResults.minResponseTime, 2))ms / $([math]::Round($testResults.maxResponseTime, 2))ms" -ForegroundColor White
    Write-Host "Throughput: $([math]::Round($testResults.throughputPerSecond, 2)) requests/second" -ForegroundColor Green
    
    # Performance assessment
    $successRate = ($testResults.successful / $testResults.requests) * 100
    if ($successRate -ge 95 -and $testResults.avgResponseTime -le 500) {
        Write-Success "Performance test: EXCELLENT"
    } elseif ($successRate -ge 90 -and $testResults.avgResponseTime -le 1000) {
        Write-Success "Performance test: GOOD"
    } elseif ($successRate -ge 80 -and $testResults.avgResponseTime -le 2000) {
        Write-Warning "Performance test: ACCEPTABLE"
    } else {
        Write-Error "Performance test: NEEDS IMPROVEMENT"
    }
    
    return $testResults
}

function Test-ConnectionPoolEfficiency {
    Write-Step "Testing database connection pool efficiency..."
    
    # Test connection pool health endpoints
    $poolTests = @(
        @{ Name = "Database Pool"; URL = "http://localhost:9000/database-health" }
        @{ Name = "Redis Pool"; URL = "http://localhost:9000/redis-health" }
        @{ Name = "MongoDB Pool"; URL = "http://localhost:9000/mongodb-health" }
    )
    
    Write-Info "Connection Pool Health Check:"
    $healthyPools = 0
    
    foreach ($pool in $poolTests) {
        try {
            $response = Invoke-RestMethod -Uri $pool.URL -Method Get -TimeoutSec 5 -ErrorAction Stop
            Write-Success "$($pool.Name): Healthy"
            $healthyPools++
        } catch {
            Write-Warning "$($pool.Name): Not accessible (may not be configured)"
        }
    }
    
    # Simulate connection pool stress test
    Write-Step "Simulating concurrent database connections..."
    
    $connectionJobs = @()
    for ($i = 1; $i -le 20; $i++) {
        $connectionJobs += Start-Job -ScriptBlock {
            param($testId)
            $results = @{ successful = 0; failed = 0; avgTime = 0 }
            $times = @()
            
            for ($j = 1; $j -le 10; $j++) {
                $start = Get-Date
                try {
                    # Simulate database operations
                    Invoke-RestMethod -Uri "http://localhost/api/v1/database/health" -Method Get -TimeoutSec 3 -ErrorAction Stop | Out-Null
                    $time = ((Get-Date) - $start).TotalMilliseconds
                    $times += $time
                    $results.successful++
                } catch {
                    $results.failed++
                }
                Start-Sleep -Milliseconds 100
            }
            
            if ($times.Count -gt 0) {
                $results.avgTime = ($times | Measure-Object -Average).Average
            }
            
            return $results
        } -ArgumentList $i
    }
    
    # Wait for connection tests to complete
    Start-Sleep -Seconds 15
    
    $totalSuccessful = 0
    $totalFailed = 0
    $allAvgTimes = @()
    
    foreach ($job in $connectionJobs) {
        $jobResult = Receive-Job -Job $job -Wait
        $totalSuccessful += $jobResult.successful
        $totalFailed += $jobResult.failed
        if ($jobResult.avgTime -gt 0) {
            $allAvgTimes += $jobResult.avgTime
        }
    }
    
    $connectionJobs | Remove-Job -Force
    
    Write-Info "Connection Pool Test Results:"
    Write-Host "  Successful Connections: $totalSuccessful" -ForegroundColor Green
    Write-Host "  Failed Connections: $totalFailed" -ForegroundColor Red
    
    if ($allAvgTimes.Count -gt 0) {
        $overallAvgTime = ($allAvgTimes | Measure-Object -Average).Average
        Write-Host "  Average Connection Time: $([math]::Round($overallAvgTime, 2))ms" -ForegroundColor White
        
        if ($overallAvgTime -le 100) {
            Write-Success "Connection pool efficiency: EXCELLENT"
        } elseif ($overallAvgTime -le 250) {
            Write-Success "Connection pool efficiency: GOOD"
        } else {
            Write-Warning "Connection pool efficiency: NEEDS OPTIMIZATION"
        }
    }
    
    return @{
        healthyPools = $healthyPools
        totalPools = $poolTests.Count
        successful = $totalSuccessful
        failed = $totalFailed
        avgConnectionTime = if ($allAvgTimes.Count -gt 0) { ($allAvgTimes | Measure-Object -Average).Average } else { 0 }
    }
}

function Test-FailoverCapability {
    Write-Step "Testing failover and recovery capabilities..."
    
    Write-Warning "This test will temporarily disable service instances to test failover"
    Write-Host "Press any key to continue or Ctrl+C to abort..." -NoNewline
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Write-Host ""
    
    $service = 'memorai-app'
    $testUrl = "http://localhost/memorai/api/health"
    
    # Get current instances
    $allInstances = docker ps --filter "label=com.codai.service=$service" --format "{{.Names}}"
    $instanceCount = ($allInstances | Measure-Object).Count
    
    if ($instanceCount -lt 2) {
        Write-Error "Failover test requires at least 2 instances. Current count: $instanceCount"
        return $false
    }
    
    Write-Info "Found $instanceCount instances for failover testing"
    
    # Test baseline availability
    Write-Step "Testing baseline availability..."
    $baselineTest = Test-EndpointAvailability -URL $testUrl -Requests 20
    Write-Info "Baseline success rate: $($baselineTest.successRate)%"
    
    # Stop one instance
    $instanceToStop = $allInstances | Select-Object -First 1
    Write-Step "Stopping instance: $instanceToStop"
    docker stop $instanceToStop | Out-Null
    
    # Wait for load balancer to detect the failure
    Write-Step "Waiting for load balancer to detect failure (30 seconds)..."
    Start-Sleep -Seconds 30
    
    # Test availability during failover
    Write-Step "Testing availability during failover..."
    $failoverTest = Test-EndpointAvailability -URL $testUrl -Requests 50
    Write-Info "Failover success rate: $($failoverTest.successRate)%"
    
    # Restart the stopped instance
    Write-Step "Restarting stopped instance: $instanceToStop"
    docker start $instanceToStop | Out-Null
    
    # Wait for recovery
    Write-Step "Waiting for service recovery (45 seconds)..."
    Start-Sleep -Seconds 45
    
    # Test availability after recovery
    Write-Step "Testing availability after recovery..."
    $recoveryTest = Test-EndpointAvailability -URL $testUrl -Requests 30
    Write-Info "Recovery success rate: $($recoveryTest.successRate)%"
    
    # Evaluate failover performance
    Write-Host "`n" + ("=" * 40) -ForegroundColor Magenta
    Write-Host "🔄 FAILOVER TEST RESULTS" -ForegroundColor White -BackgroundColor Blue
    Write-Host ("=" * 40) -ForegroundColor Magenta
    
    Write-Host "Baseline: $($baselineTest.successRate)%" -ForegroundColor Green
    Write-Host "Failover: $($failoverTest.successRate)%" -ForegroundColor $(if ($failoverTest.successRate -ge 80) { "Green" } else { "Red" })
    Write-Host "Recovery: $($recoveryTest.successRate)%" -ForegroundColor $(if ($recoveryTest.successRate -ge 95) { "Green" } else { "Yellow" })
    
    if ($failoverTest.successRate -ge 80 -and $recoveryTest.successRate -ge 95) {
        Write-Success "Failover test: PASSED"
        return $true
    } else {
        Write-Error "Failover test: FAILED"
        return $false
    }
}

function Test-EndpointAvailability {
    param(
        [string]$URL,
        [int]$Requests = 20
    )
    
    $successful = 0
    for ($i = 1; $i -le $Requests; $i++) {
        try {
            Invoke-RestMethod -Uri $URL -Method Get -TimeoutSec 5 -ErrorAction Stop | Out-Null
            $successful++
        } catch {
            # Request failed
        }
        Start-Sleep -Milliseconds 100
    }
    
    return @{
        successful = $successful
        total = $Requests
        successRate = [math]::Round(($successful / $Requests) * 100, 1)
    }
}

# Main execution logic
if ($ValidateLoadBalancer -or $All) {
    $lbHealthy = Test-LoadBalancerHealth
    $distribution = Test-ServiceDistribution
}

if ($TestAutoScaling -or $All) {
    $scalingWorked = Test-AutoScalingResponse
}

if ($PerformanceTest -or $All) {
    $perfResults = Test-PerformanceUnderLoad
}

if ($ConnectionPoolTest -or $All) {
    $poolResults = Test-ConnectionPoolEfficiency
}

if ($FailoverTest) {
    $failoverPassed = Test-FailoverCapability
}

# Summary
if ($All) {
    Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
    Write-Host "📊 LOAD BALANCING VALIDATION SUMMARY" -ForegroundColor White -BackgroundColor Blue
    Write-Host ("=" * 60) -ForegroundColor Cyan
    
    $testsPassed = 0
    $totalTests = 0
    
    if ($lbHealthy) {
        Write-Success "✅ Load Balancer Health: PASSED"
        $testsPassed++
    } else {
        Write-Error "❌ Load Balancer Health: FAILED"
    }
    $totalTests++
    
    if ($scalingWorked) {
        Write-Success "✅ Auto-Scaling Response: PASSED"
        $testsPassed++
    } else {
        Write-Warning "⚠️  Auto-Scaling Response: NO SCALING DETECTED"
    }
    $totalTests++
    
    if ($perfResults -and $perfResults.successful -gt 0) {
        $successRate = ($perfResults.successful / $perfResults.requests) * 100
        if ($successRate -ge 90) {
            Write-Success "✅ Performance Under Load: PASSED ($([math]::Round($successRate, 1))% success)"
            $testsPassed++
        } else {
            Write-Warning "⚠️  Performance Under Load: DEGRADED ($([math]::Round($successRate, 1))% success)"
        }
    }
    $totalTests++
    
    if ($poolResults -and $poolResults.successful -gt 0) {
        if ($poolResults.successful -gt $poolResults.failed) {
            Write-Success "✅ Connection Pool Efficiency: PASSED"
            $testsPassed++
        } else {
            Write-Warning "⚠️  Connection Pool Efficiency: NEEDS IMPROVEMENT"
        }
    }
    $totalTests++
    
    Write-Host ("=" * 60) -ForegroundColor Cyan
    Write-Host "Overall Test Results: $testsPassed/$totalTests tests passed" -ForegroundColor $(if ($testsPassed -eq $totalTests) { "Green" } elseif ($testsPassed -ge ($totalTests * 0.75)) { "Yellow" } else { "Red" })
}

# Default action if no parameters
if (-not ($ValidateLoadBalancer -or $TestAutoScaling -or $PerformanceTest -or $ConnectionPoolTest -or $FailoverTest -or $All)) {
    Write-Warning "Usage: ./load-balancing-validation.ps1 [options]"
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Cyan
    Write-Host "  -ValidateLoadBalancer    Test load balancer health and distribution"
    Write-Host "  -TestAutoScaling         Test auto-scaling response to load"
    Write-Host "  -PerformanceTest         Run performance test under load"
    Write-Host "  -ConnectionPoolTest      Test database connection pool efficiency"
    Write-Host "  -FailoverTest           Test failover and recovery capabilities"
    Write-Host "  -ConcurrentUsers <n>    Number of concurrent users (default: 50)"
    Write-Host "  -TestDuration <s>       Test duration in seconds (default: 300)"
    Write-Host "  -All                    Run all validation tests"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Green
    Write-Host "  ./load-balancing-validation.ps1 -All"
    Write-Host "  ./load-balancing-validation.ps1 -PerformanceTest -ConcurrentUsers 100"
    Write-Host "  ./load-balancing-validation.ps1 -ValidateLoadBalancer"
    exit 1
}

Write-Host "`n🏁 Load balancing validation completed" -ForegroundColor Cyan