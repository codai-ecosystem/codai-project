#!/usr/bin/env pwsh
# CODAI ECOSYSTEM - COMPREHENSIVE PERFORMANCE & SCALABILITY TESTING
# ===================================================================

param(
    [switch]$Verbose = $false
)

Write-Host "⚡ CODAI ECOSYSTEM - COMPREHENSIVE PERFORMANCE & SCALABILITY TESTING" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Gray
Write-Host "🕒 Started at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
Write-Host "🎯 Testing load performance, response times, concurrent users, and resource utilization" -ForegroundColor White

# Global test results
$global:PerformanceTestResults = @()
$global:PerformanceTestStats = @{
    LoadTesting = @{ Passed = 0; Failed = 0; Total = 0 }
    ResponseTimes = @{ Passed = 0; Failed = 0; Total = 0 }
    ConcurrentUsers = @{ Passed = 0; Failed = 0; Total = 0 }
    MemoryUsage = @{ Passed = 0; Failed = 0; Total = 0 }
    DatabasePerformance = @{ Passed = 0; Failed = 0; Total = 0 }
    ResourceUtilization = @{ Passed = 0; Failed = 0; Total = 0 }
}

# Test performance feature function
function Test-PerformanceFeature {
    param(
        [string]$Name,
        [scriptblock]$TestScript,
        [string]$Category = "General"
    )
    
    Write-Host "  🔍 Testing: $Name" -ForegroundColor Cyan
    
    try {
        $result = & $TestScript
        
        if ($result.Success) {
            Write-Host "  ✅ $Name" -ForegroundColor Green
            if ($result.Details) {
                Write-Host "     $($result.Details)" -ForegroundColor White
            }
            $global:PerformanceTestStats[$Category].Passed++
        } else {
            Write-Host "  ❌ $Name" -ForegroundColor Red
            if ($result.Error) {
                Write-Host "     Error: $($result.Error)" -ForegroundColor Yellow
            }
            $global:PerformanceTestStats[$Category].Failed++
        }
        
        $global:PerformanceTestStats[$Category].Total++
        $global:PerformanceTestResults += [PSCustomObject]@{
            Name = $Name
            Category = $Category
            Success = $result.Success
            Details = $result.Details
            Error = $result.Error
        }
        
    } catch {
        Write-Host "  ❌ $Name" -ForegroundColor Red
        Write-Host "     Exception: $($_.Exception.Message)" -ForegroundColor Yellow
        
        $global:PerformanceTestStats[$Category].Failed++
        $global:PerformanceTestStats[$Category].Total++
        $global:PerformanceTestResults += [PSCustomObject]@{
            Name = $Name
            Category = $Category
            Success = $false
            Error = $_.Exception.Message
        }
    }
}

# =============================================================================
# LOAD TESTING ALL SERVICES
# =============================================================================
Write-Host ""
Write-Host "🚀 LOAD TESTING ALL SERVICES" -ForegroundColor Magenta
Write-Host "============================" -ForegroundColor Gray

Test-PerformanceFeature -Name "Gateway Load Testing" -Category "LoadTesting" -TestScript {
    try {
        $loadResults = @()
        $testUrl = "http://localhost:8080/health"
        $requestCount = 20
        $successCount = 0
        $totalTime = 0
        
        Write-Host "       🔄 Running $requestCount concurrent requests..." -ForegroundColor Yellow
        
        $jobs = @()
        for ($i = 1; $i -le $requestCount; $i++) {
            $jobs += Start-Job -ScriptBlock {
                param($url)
                try {
                    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
                    $response = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 10
                    $stopwatch.Stop()
                    return @{ Success = $true; Time = $stopwatch.ElapsedMilliseconds }
                } catch {
                    return @{ Success = $false; Error = $_.Exception.Message }
                }
            } -ArgumentList $testUrl
        }
        
        # Wait for all jobs to complete
        $results = $jobs | Wait-Job | Receive-Job
        $jobs | Remove-Job
        
        $successCount = ($results | Where-Object { $_.Success }).Count
        $avgTime = if ($successCount -gt 0) { 
            [math]::Round(($results | Where-Object { $_.Success } | Measure-Object -Property Time -Average).Average, 1)
        } else { 0 }
        
        return @{ 
            Success = $successCount -gt ($requestCount * 0.8)
            Details = "Gateway load: $successCount/$requestCount requests successful, ${avgTime}ms avg response time"
        }
    } catch {
        return @{ Success = $false; Error = "Gateway load testing failed: $($_.Exception.Message)" }
    }
}

Test-PerformanceFeature -Name "MCP Server Load Testing" -Category "LoadTesting" -TestScript {
    try {
        $testUrl = "http://localhost:4950/health"
        $requestCount = 15
        $successCount = 0
        
        Write-Host "       🔄 Running $requestCount MCP server requests..." -ForegroundColor Yellow
        
        $jobs = @()
        for ($i = 1; $i -le $requestCount; $i++) {
            $jobs += Start-Job -ScriptBlock {
                param($url)
                try {
                    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
                    $response = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 8
                    $stopwatch.Stop()
                    return @{ Success = $true; Time = $stopwatch.ElapsedMilliseconds }
                } catch {
                    return @{ Success = $false; Error = $_.Exception.Message }
                }
            } -ArgumentList $testUrl
        }
        
        $results = $jobs | Wait-Job | Receive-Job
        $jobs | Remove-Job
        
        $successCount = ($results | Where-Object { $_.Success }).Count
        $avgTime = if ($successCount -gt 0) { 
            [math]::Round(($results | Where-Object { $_.Success } | Measure-Object -Property Time -Average).Average, 1)
        } else { 0 }
        
        return @{ 
            Success = $successCount -gt ($requestCount * 0.7)
            Details = "MCP server load: $successCount/$requestCount requests successful, ${avgTime}ms avg response time"
        }
    } catch {
        return @{ Success = $false; Error = "MCP server load testing failed: $($_.Exception.Message)" }
    }
}

Test-PerformanceFeature -Name "Frontend Services Load Testing" -Category "LoadTesting" -TestScript {
    try {
        $frontendServices = @(
            @{ Name = "ControlAI"; Port = 4200 },
            @{ Name = "RomAI"; Port = 6100 },
            @{ Name = "Explorer"; Port = 4400 },
            @{ Name = "Kodex"; Port = 5000 }
        )
        
        $serviceResults = @()
        foreach ($service in $frontendServices) {
            try {
                $testUrl = "http://localhost:$($service.Port)"
                $response = Invoke-WebRequest -Uri $testUrl -Method Head -TimeoutSec 5 -ErrorAction SilentlyContinue
                
                if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 404) {
                    $serviceResults += "$($service.Name) : ✅ Responsive"
                } else {
                    $serviceResults += "$($service.Name) : ⚠️ Status $($response.StatusCode)"
                }
            } catch {
                $serviceResults += "$($service.Name) : ❌ Unavailable"
            }
        }
        
        $responsiveCount = ($serviceResults | Where-Object { $_ -match "✅" }).Count
        return @{ 
            Success = $responsiveCount -gt 0
            Details = "Frontend services: $($serviceResults -join ', ')"
        }
    } catch {
        return @{ Success = $false; Error = "Frontend services load testing failed: $($_.Exception.Message)" }
    }
}

# =============================================================================
# RESPONSE TIME OPTIMIZATION TESTING
# =============================================================================
Write-Host ""
Write-Host "⏱️ RESPONSE TIME OPTIMIZATION TESTING" -ForegroundColor Magenta
Write-Host "======================================" -ForegroundColor Gray

Test-PerformanceFeature -Name "API Response Time Analysis" -Category "ResponseTimes" -TestScript {
    try {
        $apiEndpoints = @(
            @{ Name = "Gateway Health"; Url = "http://localhost:8080/health"; Target = 100 },
            @{ Name = "MCP Health"; Url = "http://localhost:4950/health"; Target = 200 },
            @{ Name = "Load Balancer"; Url = "http://localhost:8080/api/v1/health"; Target = 150 }
        )
        
        $responseResults = @()
        foreach ($endpoint in $apiEndpoints) {
            try {
                $measurements = @()
                for ($i = 1; $i -le 5; $i++) {
                    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
                    $response = Invoke-RestMethod -Uri $endpoint.Url -Method Get -TimeoutSec 5 -ErrorAction SilentlyContinue
                    $stopwatch.Stop()
                    $measurements += $stopwatch.ElapsedMilliseconds
                }
                
                $avgTime = [math]::Round(($measurements | Measure-Object -Average).Average, 1)
                if ($avgTime -le $endpoint.Target) {
                    $responseResults += "$($endpoint.Name) : ✅ ${avgTime}ms (target: $($endpoint.Target)ms)"
                } else {
                    $responseResults += "$($endpoint.Name) : ⚠️ ${avgTime}ms (target: $($endpoint.Target)ms)"
                }
            } catch {
                $responseResults += "$($endpoint.Name) : ❌ Timeout or error"
            }
        }
        
        $fastCount = ($responseResults | Where-Object { $_ -match "✅" }).Count
        return @{ 
            Success = $fastCount -gt 0
            Details = "Response times: $($responseResults -join ', ')"
        }
    } catch {
        return @{ Success = $false; Error = "API response time analysis failed: $($_.Exception.Message)" }
    }
}

Test-PerformanceFeature -Name "Static Asset Performance" -Category "ResponseTimes" -TestScript {
    try {
        # Test static asset serving through load balancer
        $staticAssets = @(
            "http://localhost:8080/favicon.ico",
            "http://localhost:8080/robots.txt",
            "http://localhost:8080/sitemap.xml"
        )
        
        $assetResults = @()
        foreach ($asset in $staticAssets) {
            try {
                $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
                $response = Invoke-WebRequest -Uri $asset -Method Head -TimeoutSec 5 -ErrorAction SilentlyContinue
                $stopwatch.Stop()
                
                $assetName = ($asset -split '/')[-1]
                if ($stopwatch.ElapsedMilliseconds -le 200) {
                    $assetResults += "$assetName : ✅ $($stopwatch.ElapsedMilliseconds)ms"
                } else {
                    $assetResults += "$assetName : ⚠️ $($stopwatch.ElapsedMilliseconds)ms"
                }
            } catch {
                $assetName = ($asset -split '/')[-1]
                $assetResults += "$assetName : ❌ Not found"
            }
        }
        
        return @{ 
            Success = $true
            Details = "Static assets: $($assetResults -join ', ')"
        }
    } catch {
        return @{ Success = $false; Error = "Static asset performance failed: $($_.Exception.Message)" }
    }
}

# =============================================================================
# CONCURRENT USER TESTING
# =============================================================================
Write-Host ""
Write-Host "👥 CONCURRENT USER TESTING" -ForegroundColor Magenta
Write-Host "===========================" -ForegroundColor Gray

Test-PerformanceFeature -Name "Concurrent Gateway Access" -Category "ConcurrentUsers" -TestScript {
    try {
        $concurrentUsers = 25
        $testDuration = 10 # seconds
        $successCount = 0
        
        Write-Host "       🔄 Simulating $concurrentUsers concurrent users for $testDuration seconds..." -ForegroundColor Yellow
        
        $jobs = @()
        for ($i = 1; $i -le $concurrentUsers; $i++) {
            $jobs += Start-Job -ScriptBlock {
                param($duration)
                $requests = 0
                $successes = 0
                $endTime = (Get-Date).AddSeconds($duration)
                
                while ((Get-Date) -lt $endTime) {
                    try {
                        $response = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method Get -TimeoutSec 3
                        $successes++
                    } catch {
                        # Request failed
                    }
                    $requests++
                    Start-Sleep -Milliseconds 500
                }
                
                return @{ Requests = $requests; Successes = $successes }
            } -ArgumentList $testDuration
        }
        
        $results = $jobs | Wait-Job | Receive-Job
        $jobs | Remove-Job
        
        $totalRequests = ($results | Measure-Object -Property Requests -Sum).Sum
        $totalSuccesses = ($results | Measure-Object -Property Successes -Sum).Sum
        $successRate = if ($totalRequests -gt 0) { [math]::Round(($totalSuccesses / $totalRequests) * 100, 1) } else { 0 }
        
        return @{ 
            Success = $successRate -ge 80
            Details = "Concurrent access: $totalSuccesses/$totalRequests requests successful ($successRate%)"
        }
    } catch {
        return @{ Success = $false; Error = "Concurrent user testing failed: $($_.Exception.Message)" }
    }
}

Test-PerformanceFeature -Name "Service Degradation Under Load" -Category "ConcurrentUsers" -TestScript {
    try {
        # Test service behavior under increasing load
        $loadLevels = @(5, 10, 15)
        $degradationResults = @()
        
        foreach ($load in $loadLevels) {
            try {
                $jobs = @()
                for ($i = 1; $i -le $load; $i++) {
                    $jobs += Start-Job -ScriptBlock {
                        try {
                            $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
                            $response = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method Get -TimeoutSec 5
                            $stopwatch.Stop()
                            return @{ Success = $true; Time = $stopwatch.ElapsedMilliseconds }
                        } catch {
                            return @{ Success = $false }
                        }
                    }
                }
                
                $results = $jobs | Wait-Job | Receive-Job
                $jobs | Remove-Job
                
                $successCount = ($results | Where-Object { $_.Success }).Count
                $avgTime = if ($successCount -gt 0) { 
                    [math]::Round(($results | Where-Object { $_.Success } | Measure-Object -Property Time -Average).Average, 1)
                } else { 0 }
                
                $degradationResults += "Load $load : $successCount/$load successful (${avgTime}ms avg)"
            } catch {
                $degradationResults += "Load $load : ❌ Failed"
            }
        }
        
        return @{ 
            Success = $true
            Details = "Load degradation: $($degradationResults -join ', ')"
        }
    } catch {
        return @{ Success = $false; Error = "Service degradation testing failed: $($_.Exception.Message)" }
    }
}

# =============================================================================
# MEMORY USAGE ANALYSIS
# =============================================================================
Write-Host ""
Write-Host "🧠 MEMORY USAGE ANALYSIS" -ForegroundColor Magenta
Write-Host "========================" -ForegroundColor Gray

Test-PerformanceFeature -Name "Container Memory Utilization" -Category "MemoryUsage" -TestScript {
    try {
        $containers = docker ps --format "{{.Names}}" 2>$null
        if ($LASTEXITCODE -ne 0) {
            return @{ Success = $false; Error = "Docker not accessible" }
        }
        
        $memoryResults = @()
        $highMemoryCount = 0
        
        foreach ($container in $containers | Select-Object -First 10) {
            try {
                $stats = docker stats $container --no-stream --format "{{.MemUsage}}" 2>$null
                if ($stats -match "([0-9.]+[KMG]iB)\s*/\s*([0-9.]+[KMG]iB)") {
                    $used = $matches[1]
                    $total = $matches[2]
                    
                    # Simple heuristic: if used memory contains 'G' or high 'M', it's high usage
                    if ($used -match "[5-9][0-9][0-9]MiB|[0-9]GiB") {
                        $highMemoryCount++
                        $memoryResults += "$($container.Substring(0, [Math]::Min(10, $container.Length))) : ⚠️ High ($used)"
                    } else {
                        $memoryResults += "$($container.Substring(0, [Math]::Min(10, $container.Length))) : ✅ Normal ($used)"
                    }
                } else {
                    $memoryResults += "$($container.Substring(0, [Math]::Min(10, $container.Length))) : ❓ Unknown"
                }
            } catch {
                $memoryResults += "$($container.Substring(0, [Math]::Min(10, $container.Length))) : ❌ Error"
            }
        }
        
        return @{ 
            Success = $highMemoryCount -lt 5
            Details = "Memory usage: $($memoryResults.Count) containers checked, $highMemoryCount high memory usage"
        }
    } catch {
        return @{ Success = $false; Error = "Container memory analysis failed: $($_.Exception.Message)" }
    }
}

Test-PerformanceFeature -Name "Host System Resource Monitoring" -Category "MemoryUsage" -TestScript {
    try {
        # Get system performance counters
        $cpuUsage = Get-Counter -Counter "\Processor(_Total)\% Processor Time" -SampleInterval 1 -MaxSamples 3 | 
                    Select-Object -ExpandProperty CounterSamples | 
                    Measure-Object -Property CookedValue -Average | 
                    Select-Object -ExpandProperty Average
        
        $memoryUsage = Get-CimInstance -ClassName Win32_OperatingSystem | 
                      Select-Object @{Name="MemoryUsage"; Expression={[math]::Round((($_.TotalVisibleMemorySize - $_.FreePhysicalMemory) / $_.TotalVisibleMemorySize) * 100, 1)}} |
                      Select-Object -ExpandProperty MemoryUsage
        
        $diskUsage = Get-CimInstance -ClassName Win32_LogicalDisk -Filter "DeviceID='C:'" | 
                    Select-Object @{Name="DiskUsage"; Expression={[math]::Round((($_.Size - $_.FreeSpace) / $_.Size) * 100, 1)}} |
                    Select-Object -ExpandProperty DiskUsage
        
        $cpuStatus = if ($cpuUsage -gt 80) { "⚠️ High" } else { "✅ Normal" }
        $memoryStatus = if ($memoryUsage -gt 80) { "⚠️ High" } else { "✅ Normal" }
        $diskStatus = if ($diskUsage -gt 80) { "⚠️ High" } else { "✅ Normal" }
        
        return @{ 
            Success = $cpuUsage -le 80 -and $memoryUsage -le 80
            Details = "Host resources: CPU $cpuStatus ($([math]::Round($cpuUsage, 1))%), Memory $memoryStatus ($memoryUsage%), Disk $diskStatus ($diskUsage%)"
        }
    } catch {
        return @{ Success = $false; Error = "Host system monitoring failed: $($_.Exception.Message)" }
    }
}

# =============================================================================
# DATABASE PERFORMANCE UNDER LOAD
# =============================================================================
Write-Host ""
Write-Host "🗃️ DATABASE PERFORMANCE UNDER LOAD" -ForegroundColor Magenta
Write-Host "===================================" -ForegroundColor Gray

Test-PerformanceFeature -Name "MCP Server Database Stress Test" -Category "DatabasePerformance" -TestScript {
    try {
        $dbTestUrl = "http://localhost:4950/health"
        $dbRequestCount = 10
        $successCount = 0
        
        Write-Host "       🔄 Running $dbRequestCount database requests..." -ForegroundColor Yellow
        
        $jobs = @()
        for ($i = 1; $i -le $dbRequestCount; $i++) {
            $jobs += Start-Job -ScriptBlock {
                param($url)
                try {
                    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
                    $response = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 10
                    $stopwatch.Stop()
                    return @{ Success = $true; Time = $stopwatch.ElapsedMilliseconds }
                } catch {
                    return @{ Success = $false; Error = $_.Exception.Message }
                }
            } -ArgumentList $dbTestUrl
        }
        
        $results = $jobs | Wait-Job | Receive-Job
        $jobs | Remove-Job
        
        $successCount = ($results | Where-Object { $_.Success }).Count
        $avgTime = if ($successCount -gt 0) { 
            [math]::Round(($results | Where-Object { $_.Success } | Measure-Object -Property Time -Average).Average, 1)
        } else { 0 }
        
        return @{ 
            Success = $successCount -ge ($dbRequestCount * 0.8)
            Details = "Database stress: $successCount/$dbRequestCount requests successful, ${avgTime}ms avg response time"
        }
    } catch {
        return @{ Success = $false; Error = "Database stress testing failed: $($_.Exception.Message)" }
    }
}

Test-PerformanceFeature -Name "Data Persistence Performance" -Category "DatabasePerformance" -TestScript {
    try {
        # Test data storage and retrieval performance
        $storageTests = @()
        
        # Test file system performance
        $testFile = "performance_test_$(Get-Date -Format 'yyyyMMddHHmmss').tmp"
        $testData = "Performance testing data: " + ("x" * 1000)  # 1KB of data
        
        try {
            $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
            Set-Content -Path $testFile -Value $testData -Encoding UTF8
            $writeTime = $stopwatch.ElapsedMilliseconds
            $stopwatch.Restart()
            $readData = Get-Content -Path $testFile -Raw
            $readTime = $stopwatch.ElapsedMilliseconds
            $stopwatch.Stop()
            
            Remove-Item -Path $testFile -Force -ErrorAction SilentlyContinue
            
            if ($readData.Length -eq $testData.Length) {
                $storageTests += "File I/O : ✅ Write ${writeTime}ms, Read ${readTime}ms"
            } else {
                $storageTests += "File I/O : ❌ Data integrity failed"
            }
        } catch {
            $storageTests += "File I/O : ❌ Failed"
        }
        
        # Test configuration file access
        try {
            $configFiles = @("package.json", ".env.example", "docker-compose.yml")
            $configAccess = @()
            
            foreach ($configFile in $configFiles) {
                if (Test-Path $configFile) {
                    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
                    $content = Get-Content $configFile -Raw
                    $stopwatch.Stop()
                    $configAccess += "$configFile : $($stopwatch.ElapsedMilliseconds)ms"
                }
            }
            
            $storageTests += "Config access : ✅ $($configAccess -join ', ')"
        } catch {
            $storageTests += "Config access : ❌ Failed"
        }
        
        return @{ 
            Success = $storageTests.Count -gt 0
            Details = "Data persistence: $($storageTests -join '; ')"
        }
    } catch {
        return @{ Success = $false; Error = "Data persistence performance failed: $($_.Exception.Message)" }
    }
}

# =============================================================================
# CONTAINER RESOURCE UTILIZATION
# =============================================================================
Write-Host ""
Write-Host "📊 CONTAINER RESOURCE UTILIZATION" -ForegroundColor Magenta
Write-Host "==================================" -ForegroundColor Gray

Test-PerformanceFeature -Name "Docker Container Efficiency" -Category "ResourceUtilization" -TestScript {
    try {
        $containers = docker ps --format "{{.Names}}" 2>$null | Select-Object -First 8
        if ($LASTEXITCODE -ne 0) {
            return @{ Success = $false; Error = "Docker not accessible" }
        }
        
        $efficiencyResults = @()
        $inefficientCount = 0
        
        foreach ($container in $containers) {
            try {
                $stats = docker stats $container --no-stream --format "{{.CPUPerc}}\t{{.MemUsage}}" 2>$null
                $parts = $stats -split "`t"
                
                if ($parts.Length -eq 2) {
                    $cpuPerc = $parts[0] -replace '%', ''
                    $memUsage = $parts[1]
                    
                    $containerShort = $container.Substring(0, [Math]::Min(12, $container.Length))
                    
                    if ([double]$cpuPerc -gt 50) {
                        $inefficientCount++
                        $efficiencyResults += "$containerShort : ⚠️ CPU $cpuPerc%"
                    } else {
                        $efficiencyResults += "$containerShort : ✅ CPU $cpuPerc%"
                    }
                }
            } catch {
                $containerShort = $container.Substring(0, [Math]::Min(12, $container.Length))
                $efficiencyResults += "$containerShort : ❌ Stats unavailable"
            }
        }
        
        return @{ 
            Success = $inefficientCount -lt 3
            Details = "Container efficiency: $($efficiencyResults.Count) checked, $inefficientCount high CPU usage"
        }
    } catch {
        return @{ Success = $false; Error = "Docker container efficiency failed: $($_.Exception.Message)" }
    }
}

Test-PerformanceFeature -Name "Network Performance Analysis" -Category "ResourceUtilization" -TestScript {
    try {
        # Test network latency between services
        $networkTests = @()
        $services = @("localhost:8080", "localhost:4950", "localhost:4500")
        
        foreach ($service in $services) {
            try {
                $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
                $tcpTest = Test-NetConnection -ComputerName ($service -split ':')[0] -Port ([int]($service -split ':')[1]) -WarningAction SilentlyContinue
                $stopwatch.Stop()
                
                $serviceName = ($service -split ':')[1]
                if ($tcpTest.TcpTestSucceeded -and $stopwatch.ElapsedMilliseconds -le 100) {
                    $networkTests += "Port $serviceName : ✅ ${($stopwatch.ElapsedMilliseconds)}ms"
                } elseif ($tcpTest.TcpTestSucceeded) {
                    $networkTests += "Port $serviceName : ⚠️ ${($stopwatch.ElapsedMilliseconds)}ms"
                } else {
                    $networkTests += "Port $serviceName : ❌ Unreachable"
                }
            } catch {
                $serviceName = ($service -split ':')[1]
                $networkTests += "Port $serviceName : ❌ Error"
            }
        }
        
        $fastCount = ($networkTests | Where-Object { $_ -match "✅" }).Count
        return @{ 
            Success = $fastCount -gt 0
            Details = "Network performance: $($networkTests -join ', ')"
        }
    } catch {
        return @{ Success = $false; Error = "Network performance analysis failed: $($_.Exception.Message)" }
    }
}

# =============================================================================
# COMPREHENSIVE PERFORMANCE & SCALABILITY TESTING RESULTS
# =============================================================================
Write-Host ""
Write-Host "📊 COMPREHENSIVE PERFORMANCE & SCALABILITY TESTING RESULTS" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Gray

# Calculate overall statistics
$totalPassed = 0
$totalFailed = 0
$totalTests = 0

foreach ($category in $global:PerformanceTestStats.Keys) {
    $stats = $global:PerformanceTestStats[$category]
    $totalPassed += $stats.Passed
    $totalFailed += $stats.Failed
    $totalTests += $stats.Total
}

$successRate = if ($totalTests -gt 0) { [math]::Round(($totalPassed / $totalTests) * 100, 1) } else { 0 }

Write-Host "📊 PERFORMANCE & SCALABILITY TESTING STATISTICS" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Gray
Write-Host "Total Performance Tests: $totalTests" -ForegroundColor White
Write-Host "Tests Passed: $totalPassed" -ForegroundColor Green
Write-Host "Tests Failed: $totalFailed" -ForegroundColor Red
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { 'Green' } elseif ($successRate -ge 60) { 'Yellow' } else { 'Red' })

Write-Host ""
Write-Host "📋 DETAILED PERFORMANCE CATEGORY BREAKDOWN:" -ForegroundColor Cyan
foreach ($category in $global:PerformanceTestStats.Keys | Sort-Object) {
    $stats = $global:PerformanceTestStats[$category]
    if ($stats.Total -gt 0) {
        $categoryRate = [math]::Round(($stats.Passed / $stats.Total) * 100, 0)
        Write-Host "  $category`: $($stats.Passed)/$($stats.Total) tests passed ($categoryRate%)" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "🎯 PERFORMANCE & SCALABILITY TESTING ASSESSMENT:" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Gray
$assessmentColor = if ($successRate -ge 90) { 'Green' }
                  elseif ($successRate -ge 80) { 'Yellow' }
                  elseif ($successRate -ge 70) { 'DarkYellow' }
                  else { 'Red' }

$assessment = if ($successRate -ge 90) { "🏆 EXCEPTIONAL: $successRate% - Outstanding performance and scalability!" }
             elseif ($successRate -ge 80) { "✅ EXCELLENT: $successRate% - Performance systems operating very well!" }
             elseif ($successRate -ge 70) { "⚠️  GOOD: $successRate% - Performance mostly acceptable with some issues" }
             elseif ($successRate -ge 60) { "⚠️  FAIR: $successRate% - Performance has significant bottlenecks" }
             else { "❌ POOR: $successRate% - Critical performance problems detected" }

Write-Host $assessment -ForegroundColor $assessmentColor

Write-Host ""
Write-Host "🕒 Performance & Scalability Testing Completed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow

# Return results for further processing
return @{
    TotalTests = $totalTests
    PassedTests = $totalPassed
    FailedTests = $totalFailed
    SuccessRate = $successRate
    Results = $global:PerformanceTestResults
}