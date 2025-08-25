# CODAI Ecosystem - Performance and Load Testing
# Based on Microsoft Performance Testing Best Practices and Azure Load Testing Guidelines

param(
    [string]$OutputFile = "performance-load-test-results.txt",
    [switch]$Detailed = $false,
    [switch]$ExportResults = $true,
    [int]$LoadTestDuration = 30,
    [int]$MaxConcurrentUsers = 50
)

$global:testResults = @()
$global:passedTests = 0
$global:failedTests = 0
$global:totalTests = 0

function Add-TestResult {
    param(
        [Parameter(Mandatory=$true)]
        [string]$TestName,
        
        [Parameter(Mandatory=$true)]
        [ValidateSet("PASS", "FAIL", "WARN", "SKIP")]
        [string]$Status,
        
        [string]$Details = "",
        [string]$Metric = "",
        [string]$Category = ""
    )
    
    $global:totalTests++
    if ($Status -eq "PASS") {
        $global:passedTests++
    } elseif ($Status -eq "FAIL") {
        $global:failedTests++
    }
    
    $result = [PSCustomObject]@{
        TestName = $TestName
        Status = $Status
        Details = $Details
        Metric = $Metric
        Category = $Category
        Timestamp = Get-Date
    }
    
    $global:testResults += $result
    
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
    if ($Metric) {
        Write-Host "    📊 $Metric" -ForegroundColor Magenta
    }
}

function Test-EndpointPerformance {
    param(
        [string]$URL,
        [string]$Name,
        [string]$Method = "GET",
        [string]$Body = $null,
        [int]$Iterations = 10
    )
    
    Write-Host "`n⚡ Testing Performance: $Name" -ForegroundColor Yellow
    
    $responseTimes = @()
    $successCount = 0
    $errorCount = 0
    
    for ($i = 1; $i -le $Iterations; $i++) {
        try {
            $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
            
            if ($Method -eq "POST" -and $Body) {
                $response = Invoke-WebRequest -Uri $URL -Method $Method -Body $Body -ContentType "application/json" -TimeoutSec 10 -ErrorAction Stop
            } else {
                $response = Invoke-WebRequest -Uri $URL -Method $Method -TimeoutSec 10 -ErrorAction Stop
            }
            
            $stopwatch.Stop()
            $responseTime = $stopwatch.ElapsedMilliseconds
            $responseTimes += $responseTime
            $successCount++
            
            Write-Host "    Request $i/$Iterations : ${responseTime}ms" -ForegroundColor Gray
            
        } catch {
            $errorCount++
            Write-Host "    Request $i/$Iterations : FAILED" -ForegroundColor Red
        }
        
        Start-Sleep -Milliseconds 100
    }
    
    if ($responseTimes.Count -gt 0) {
        $avgResponseTime = [math]::Round(($responseTimes | Measure-Object -Average).Average, 2)
        $minResponseTime = ($responseTimes | Measure-Object -Minimum).Minimum
        $maxResponseTime = ($responseTimes | Measure-Object -Maximum).Maximum
        $successRate = [math]::Round(($successCount / $Iterations) * 100, 1)
        
        $metric = "Avg: ${avgResponseTime}ms, Min: ${minResponseTime}ms, Max: ${maxResponseTime}ms, Success: ${successRate}%"
        
        if ($avgResponseTime -lt 1000 -and $successRate -ge 95) {
            Add-TestResult -TestName "Performance Test ($Name)" -Status "PASS" -Details "Excellent response times" -Metric $metric -Category "Performance"
        } elseif ($avgResponseTime -lt 2000 -and $successRate -ge 90) {
            Add-TestResult -TestName "Performance Test ($Name)" -Status "WARN" -Details "Acceptable response times" -Metric $metric -Category "Performance"
        } else {
            Add-TestResult -TestName "Performance Test ($Name)" -Status "FAIL" -Details "Poor response times or low success rate" -Metric $metric -Category "Performance"
        }
    } else {
        Add-TestResult -TestName "Performance Test ($Name)" -Status "FAIL" -Details "All requests failed" -Category "Performance"
    }
}

function Test-ConcurrentLoad {
    param(
        [string]$URL,
        [string]$Name,
        [int]$ConcurrentUsers = 10,
        [int]$Duration = 30
    )
    
    Write-Host "`n🚀 Testing Concurrent Load: $Name ($ConcurrentUsers users for ${Duration}s)" -ForegroundColor Yellow
    
    $jobs = @()
    $results = @()
    
    # Start concurrent requests
    for ($i = 1; $i -le $ConcurrentUsers; $i++) {
        $job = Start-Job -ScriptBlock {
            param($URL, $Duration)
            
            $startTime = Get-Date
            $endTime = $startTime.AddSeconds($Duration)
            $requestCount = 0
            $successCount = 0
            $responseTimes = @()
            
            while ((Get-Date) -lt $endTime) {
                try {
                    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
                    $response = Invoke-WebRequest -Uri $URL -TimeoutSec 5 -ErrorAction Stop
                    $stopwatch.Stop()
                    
                    $responseTimes += $stopwatch.ElapsedMilliseconds
                    $successCount++
                    $requestCount++
                } catch {
                    $requestCount++
                }
                
                Start-Sleep -Milliseconds 500
            }
            
            return @{
                RequestCount = $requestCount
                SuccessCount = $successCount
                ResponseTimes = $responseTimes
            }
            
        } -ArgumentList $URL, $Duration
        
        $jobs += $job
    }
    
    Write-Host "    ⏳ Running concurrent load test for ${Duration} seconds..." -ForegroundColor Gray
    
    # Wait for all jobs to complete
    $jobResults = $jobs | Wait-Job | Receive-Job
    $jobs | Remove-Job
    
    # Analyze results
    $totalRequests = ($jobResults | Measure-Object -Property RequestCount -Sum).Sum
    $totalSuccess = ($jobResults | Measure-Object -Property SuccessCount -Sum).Sum
    $allResponseTimes = $jobResults | ForEach-Object { $_.ResponseTimes }
    
    if ($allResponseTimes.Count -gt 0) {
        $avgResponseTime = [math]::Round(($allResponseTimes | Measure-Object -Average).Average, 2)
        $successRate = [math]::Round(($totalSuccess / $totalRequests) * 100, 1)
        $throughput = [math]::Round($totalSuccess / $Duration, 2)
        
        $metric = "Requests: $totalRequests, Success: ${successRate}%, Avg Response: ${avgResponseTime}ms, Throughput: ${throughput} req/s"
        
        if ($successRate -ge 95 -and $avgResponseTime -lt 2000) {
            Add-TestResult -TestName "Concurrent Load Test ($Name)" -Status "PASS" -Details "System handled concurrent load well" -Metric $metric -Category "Load Testing"
        } elseif ($successRate -ge 85 -and $avgResponseTime -lt 5000) {
            Add-TestResult -TestName "Concurrent Load Test ($Name)" -Status "WARN" -Details "System showed degradation under load" -Metric $metric -Category "Load Testing"
        } else {
            Add-TestResult -TestName "Concurrent Load Test ($Name)" -Status "FAIL" -Details "System failed under concurrent load" -Metric $metric -Category "Load Testing"
        }
    } else {
        Add-TestResult -TestName "Concurrent Load Test ($Name)" -Status "FAIL" -Details "No successful requests during load test" -Category "Load Testing"
    }
}

function Test-ResourceUtilization {
    Write-Host "`n📊 RESOURCE UTILIZATION TESTING" -ForegroundColor Cyan
    
    # Test Docker container resource usage
    try {
        $containerStats = docker stats --no-stream --format "table {{.Name}},{{.CPUPerc}},{{.MemUsage}},{{.MemPerc}}" 2>$null
        if ($containerStats) {
            $statsLines = $containerStats -split "`n" | Select-Object -Skip 1
            $highCpuContainers = @()
            $highMemoryContainers = @()
            
            foreach ($line in $statsLines) {
                if (-not $line.Trim()) { continue }
                $parts = $line -split ","
                if ($parts.Count -ge 4) {
                    $containerName = $parts[0].Trim()
                    $cpuPerc = $parts[1].Trim() -replace '%', ''
                    $memPerc = $parts[3].Trim() -replace '%', ''
                    
                    if ([double]$cpuPerc -gt 80) {
                        $highCpuContainers += "$containerName (${cpuPerc}%)"
                    }
                    if ([double]$memPerc -gt 80) {
                        $highMemoryContainers += "$containerName (${memPerc}%)"
                    }
                }
            }
            
            if ($highCpuContainers.Count -eq 0 -and $highMemoryContainers.Count -eq 0) {
                Add-TestResult -TestName "Container Resource Usage" -Status "PASS" -Details "All containers within normal resource limits" -Category "Resource Utilization"
            } else {
                $issues = @()
                if ($highCpuContainers.Count -gt 0) { $issues += "High CPU: $($highCpuContainers -join ', ')" }
                if ($highMemoryContainers.Count -gt 0) { $issues += "High Memory: $($highMemoryContainers -join ', ')" }
                Add-TestResult -TestName "Container Resource Usage" -Status "WARN" -Details ($issues -join '; ') -Category "Resource Utilization"
            }
        } else {
            Add-TestResult -TestName "Container Resource Usage" -Status "SKIP" -Details "Unable to retrieve container statistics" -Category "Resource Utilization"
        }
    } catch {
        Add-TestResult -TestName "Container Resource Usage" -Status "SKIP" -Details "Docker stats not available" -Category "Resource Utilization"
    }
}

function Test-ScalabilityBenchmarks {
    Write-Host "`n📈 SCALABILITY BENCHMARKING" -ForegroundColor Cyan
    
    # Test scalability with increasing user loads
    $endpoints = @(
        @{ URL = "http://localhost:8080"; Name = "Nginx Load Balancer"; Critical = $true }
        @{ URL = "http://localhost:8006/api/health"; Name = "MemorAI Frontend API"; Critical = $true }
        @{ URL = "http://localhost:4950/health"; Name = "MemorAI MCP Server"; Critical = $true }
    )
    
    foreach ($endpoint in $endpoints) {
        $userLoads = @(5, 10, 20)
        $scalabilityResults = @()
        
        foreach ($userLoad in $userLoads) {
            Write-Host "    Testing $($endpoint.Name) with $userLoad concurrent users..." -ForegroundColor Gray
            
            $jobs = @()
            for ($i = 1; $i -le $userLoad; $i++) {
                $job = Start-Job -ScriptBlock {
                    param($URL)
                    try {
                        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
                        $response = Invoke-WebRequest -Uri $URL -TimeoutSec 10 -ErrorAction Stop
                        $stopwatch.Stop()
                        return @{ Success = $true; ResponseTime = $stopwatch.ElapsedMilliseconds }
                    } catch {
                        return @{ Success = $false; ResponseTime = 0 }
                    }
                } -ArgumentList $endpoint.URL
                $jobs += $job
            }
            
            $jobResults = $jobs | Wait-Job | Receive-Job
            $jobs | Remove-Job
            
            $successCount = ($jobResults | Where-Object { $_.Success }).Count
            $avgResponseTime = if ($successCount -gt 0) {
                [math]::Round((($jobResults | Where-Object { $_.Success } | Measure-Object -Property ResponseTime -Average).Average), 2)
            } else { 0 }
            
            $scalabilityResults += @{
                Users = $userLoad
                SuccessRate = [math]::Round(($successCount / $userLoad) * 100, 1)
                AvgResponseTime = $avgResponseTime
            }
        }
        
        # Analyze scalability trends
        $performanceDegradation = $false
        for ($i = 1; $i -lt $scalabilityResults.Count; $i++) {
            if ($scalabilityResults[$i].AvgResponseTime -gt ($scalabilityResults[$i-1].AvgResponseTime * 2)) {
                $performanceDegradation = $true
                break
            }
        }
        
        $finalResult = $scalabilityResults[-1]
        $metric = "Final Load: $($finalResult.Users) users, Success: $($finalResult.SuccessRate)%, Avg Response: $($finalResult.AvgResponseTime)ms"
        
        if (-not $performanceDegradation -and $finalResult.SuccessRate -ge 90) {
            Add-TestResult -TestName "Scalability Test ($($endpoint.Name))" -Status "PASS" -Details "System scales well under increasing load" -Metric $metric -Category "Scalability"
        } elseif ($finalResult.SuccessRate -ge 75) {
            Add-TestResult -TestName "Scalability Test ($($endpoint.Name))" -Status "WARN" -Details "Performance degradation detected" -Metric $metric -Category "Scalability"
        } else {
            Add-TestResult -TestName "Scalability Test ($($endpoint.Name))" -Status "FAIL" -Details "Poor scalability performance" -Metric $metric -Category "Scalability"
        }
    }
}

function Test-StressLimits {
    Write-Host "`n💥 STRESS TESTING - SYSTEM LIMITS" -ForegroundColor Cyan
    
    # Stress test critical endpoints
    $criticalEndpoints = @(
        @{ URL = "http://localhost:8080"; Name = "Load Balancer" }
        @{ URL = "http://localhost:4950/health"; Name = "MemorAI MCP" }
    )
    
    foreach ($endpoint in $criticalEndpoints) {
        Write-Host "    Stress testing $($endpoint.Name)..." -ForegroundColor Gray
        
        # Aggressive stress test
        $jobs = @()
        for ($i = 1; $i -le 25; $i++) {
            $job = Start-Job -ScriptBlock {
                param($URL)
                $results = @()
                for ($j = 1; $j -le 20; $j++) {
                    try {
                        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
                        $response = Invoke-WebRequest -Uri $URL -TimeoutSec 5 -ErrorAction Stop
                        $stopwatch.Stop()
                        $results += @{ Success = $true; ResponseTime = $stopwatch.ElapsedMilliseconds }
                    } catch {
                        $results += @{ Success = $false; ResponseTime = 0 }
                    }
                    Start-Sleep -Milliseconds 50
                }
                return $results
            } -ArgumentList $endpoint.URL
            $jobs += $job
        }
        
        Write-Host "      Running intensive stress test (25 threads x 20 requests each)..." -ForegroundColor DarkGray
        $jobResults = $jobs | Wait-Job | Receive-Job
        $jobs | Remove-Job
        
        $allResults = $jobResults | ForEach-Object { $_ }
        $totalRequests = $allResults.Count
        $successCount = ($allResults | Where-Object { $_.Success }).Count
        $successRate = [math]::Round(($successCount / $totalRequests) * 100, 1)
        
        $avgResponseTime = if ($successCount -gt 0) {
            [math]::Round((($allResults | Where-Object { $_.Success } | Measure-Object -Property ResponseTime -Average).Average), 2)
        } else { 0 }
        
        $metric = "Total Requests: $totalRequests, Success: ${successRate}%, Avg Response: ${avgResponseTime}ms"
        
        if ($successRate -ge 80) {
            Add-TestResult -TestName "Stress Test ($($endpoint.Name))" -Status "PASS" -Details "System survived stress conditions" -Metric $metric -Category "Stress Testing"
        } elseif ($successRate -ge 50) {
            Add-TestResult -TestName "Stress Test ($($endpoint.Name))" -Status "WARN" -Details "System partially degraded under stress" -Metric $metric -Category "Stress Testing"
        } else {
            Add-TestResult -TestName "Stress Test ($($endpoint.Name))" -Status "FAIL" -Details "System failed under stress conditions" -Metric $metric -Category "Stress Testing"
        }
    }
}

# Main execution
Write-Host "⚡ CODAI ECOSYSTEM - PERFORMANCE AND LOAD TESTING" -ForegroundColor Cyan
Write-Host "=" * 70
Write-Host "Based on Microsoft Performance Testing Best Practices and Azure Load Testing Guidelines" -ForegroundColor Gray
Write-Host ""

# Core Performance Testing
Write-Host "`n🎯 CORE PERFORMANCE TESTING" -ForegroundColor Cyan

$coreEndpoints = @(
    @{ URL = "http://localhost:8080"; Name = "Nginx Load Balancer"; Method = "GET" }
    @{ URL = "http://localhost:4950/health"; Name = "MemorAI MCP Server"; Method = "GET" }
    @{ URL = "http://localhost:4500/health"; Name = "MemorAI GraphQL"; Method = "POST"; Body = '{"query": "{ health { status } }"}' }
    @{ URL = "http://localhost:8006/api/health"; Name = "MemorAI Frontend"; Method = "GET" }
    @{ URL = "http://localhost:8120/api/health"; Name = "BancAI Frontend"; Method = "GET" }
)

foreach ($endpoint in $coreEndpoints) {
    Test-EndpointPerformance -URL $endpoint.URL -Name $endpoint.Name -Method $endpoint.Method -Body $endpoint.Body -Iterations 15
}

# Load Testing
Write-Host "`n🚀 LOAD TESTING" -ForegroundColor Cyan

$loadTestEndpoints = @(
    @{ URL = "http://localhost:8080"; Name = "Load Balancer" }
    @{ URL = "http://localhost:4950/health"; Name = "MemorAI MCP" }
    @{ URL = "http://localhost:8006/api/health"; Name = "MemorAI Frontend" }
)

foreach ($endpoint in $loadTestEndpoints) {
    Test-ConcurrentLoad -URL $endpoint.URL -Name $endpoint.Name -ConcurrentUsers 15 -Duration $LoadTestDuration
}

# Resource Utilization Testing
Test-ResourceUtilization

# Scalability Testing
Test-ScalabilityBenchmarks

# Stress Testing
Test-StressLimits

# Summary
Write-Host "`n⚡ PERFORMANCE AND LOAD TESTING SUMMARY:" -ForegroundColor Yellow
Write-Host "=" * 60
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "✅ Passed Tests ($([math]::Round(($passedTests / $totalTests) * 100, 1))%): $passedTests" -ForegroundColor Green
Write-Host "❌ Failed Tests ($([math]::Round(($failedTests / $totalTests) * 100, 1))%): $failedTests" -ForegroundColor Red
Write-Host "⚠️ Warnings: $($testResults | Where-Object { $_.Status -eq 'WARN' } | Measure-Object | Select-Object -ExpandProperty Count)" -ForegroundColor Yellow
Write-Host "⏭️ Skipped: $($testResults | Where-Object { $_.Status -eq 'SKIP' } | Measure-Object | Select-Object -ExpandProperty Count)" -ForegroundColor Cyan

# Performance metrics summary
$performanceTests = $testResults | Where-Object { $_.Category -eq "Performance" -and $_.Metric }
if ($performanceTests.Count -gt 0) {
    Write-Host "`n📊 PERFORMANCE METRICS SUMMARY:" -ForegroundColor Magenta
    foreach ($test in $performanceTests) {
        $status = if ($test.Status -eq "PASS") { "✅" } elseif ($test.Status -eq "WARN") { "⚠️" } else { "❌" }
        Write-Host "  $status $($test.TestName): $($test.Metric)" -ForegroundColor Gray
    }
}

# Critical performance issues
$criticalIssues = $testResults | Where-Object { $_.Status -eq "FAIL" -and ($_.Category -eq "Performance" -or $_.Category -eq "Load Testing") }
if ($criticalIssues.Count -gt 0) {
    Write-Host "`n🚨 CRITICAL PERFORMANCE ISSUES:" -ForegroundColor Red
    foreach ($issue in $criticalIssues) {
        Write-Host "  🔴 $($issue.TestName): $($issue.Details)" -ForegroundColor Red
    }
}

# Export results
if ($ExportResults) {
    $testResults | ConvertTo-Json -Depth 3 | Out-File -FilePath $OutputFile -Encoding UTF8
    Write-Host "`n📄 Test results exported to: $OutputFile" -ForegroundColor Green
}

Write-Host "`n⚡ Performance and Load Testing Complete!" -ForegroundColor Green
Write-Host "=" * 70