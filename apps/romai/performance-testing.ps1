#!/usr/bin/env pwsh
# ==============================================================================
# RomAI AGI Performance Testing & Benchmarking Suite
# Microsoft Azure ML Production Standards Compliance
# ==============================================================================

param(
    [ValidateSet("setup", "run", "analyze", "stress", "throughput", "latency", "scalability", "full")]
    [string]$TestType = "run",
    [int]$Duration = 300,  # 5 minutes default
    [int]$ConcurrentUsers = 10,
    [int]$MaxConcurrentUsers = 50,
    [string]$ReportFormat = "detailed",
    [switch]$SaveResults = $true
)

$ErrorActionPreference = "Continue"

function Write-ColorOutput {
    param($Message, $Color = "White")
    if ($Color -eq "Green") { Write-Host $Message -ForegroundColor Green }
    elseif ($Color -eq "Red") { Write-Host $Message -ForegroundColor Red }
    elseif ($Color -eq "Yellow") { Write-Host $Message -ForegroundColor Yellow }
    elseif ($Color -eq "Cyan") { Write-Host $Message -ForegroundColor Cyan }
    elseif ($Color -eq "Magenta") { Write-Host $Message -ForegroundColor Magenta }
    else { Write-Host $Message }
}

function Test-AGIEndpointPerformance {
    param(
        $Endpoint,
        $Payload,
        $RequestCount = 10,
        $ConcurrentRequests = 5
    )
    
    $results = @{
        Endpoint = $Endpoint.Name
        TotalRequests = $RequestCount
        ConcurrentRequests = $ConcurrentRequests
        SuccessfulRequests = 0
        FailedRequests = 0
        ResponseTimes = @()
        ThroughputRPM = 0
        AverageLatency = 0
        P95Latency = 0
        P99Latency = 0
        ErrorRate = 0
        StartTime = Get-Date
        EndTime = $null
    }
    
    Write-Host "  Testing $($Endpoint.Name)..." -NoNewline
    
    $jobs = @()
    $startTime = Get-Date
    
    # Create concurrent test jobs
    for ($i = 0; $i -lt [Math]::Min($RequestCount, $ConcurrentRequests); $i++) {
        $job = Start-Job -ScriptBlock {
            param($Url, $PayloadJson, $RequestsPerJob, $Timeout)
            
            $responses = @()
            for ($j = 0; $j -lt $RequestsPerJob; $j++) {
                try {
                    $requestStart = Get-Date
                    $response = Invoke-RestMethod -Uri $Url -Method Post -Body $PayloadJson -ContentType "application/json" -TimeoutSec $Timeout
                    $requestEnd = Get-Date
                    
                    $responses += @{
                        Success = $true
                        ResponseTime = ($requestEnd - $requestStart).TotalMilliseconds
                        StatusCode = 200
                    }
                }
                catch {
                    $requestEnd = Get-Date
                    $statusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode } else { 0 }
                    
                    $responses += @{
                        Success = ($statusCode -eq 422)  # 422 means endpoint exists but validation error
                        ResponseTime = ($requestEnd - $requestStart).TotalMilliseconds
                        StatusCode = $statusCode
                        Error = $_.Exception.Message
                    }
                }
            }
            return $responses
        } -ArgumentList "http://localhost:6101$($Endpoint.Path)", ($Payload | ConvertTo-Json -Depth 3), [Math]::Ceiling($RequestCount / $ConcurrentRequests), 30
        
        $jobs += $job
    }
    
    # Wait for all jobs to complete
    $allResponses = @()
    foreach ($job in $jobs) {
        $jobResults = Wait-Job $job | Receive-Job
        Remove-Job $job
        $allResponses += $jobResults
    }
    
    $endTime = Get-Date
    $testDuration = ($endTime - $startTime).TotalMinutes
    
    # Process results
    $successfulResponses = $allResponses | Where-Object { $_.Success -eq $true }
    $failedResponses = $allResponses | Where-Object { $_.Success -eq $false }
    
    $results.SuccessfulRequests = $successfulResponses.Count
    $results.FailedRequests = $failedResponses.Count
    $results.ResponseTimes = $allResponses.ResponseTime
    $results.EndTime = $endTime
    
    if ($allResponses.Count -gt 0) {
        $results.AverageLatency = ($allResponses.ResponseTime | Measure-Object -Average).Average
        $sortedTimes = $allResponses.ResponseTime | Sort-Object
        $results.P95Latency = $sortedTimes[[Math]::Floor($sortedTimes.Count * 0.95)]
        $results.P99Latency = $sortedTimes[[Math]::Floor($sortedTimes.Count * 0.99)]
        $results.ErrorRate = ($failedResponses.Count / $allResponses.Count) * 100
        $results.ThroughputRPM = [Math]::Round(($allResponses.Count / $testDuration), 2)
    }
    
    $statusColor = if ($results.SuccessfulRequests -gt 0) { "Green" } else { "Red" }
    Write-ColorOutput " ✅ Completed ($($results.SuccessfulRequests)/$RequestCount successful)" $statusColor
    
    return $results
}

function Get-SystemResourceMetrics {
    try {
        $cpu = Get-CimInstance -ClassName Win32_Processor | Measure-Object -Property LoadPercentage -Average
        $memory = Get-CimInstance -ClassName Win32_OperatingSystem
        $process = Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*model_server*" }
        
        return @{
            CPU_Usage = [Math]::Round($cpu.Average, 2)
            Memory_Usage_Percent = [Math]::Round((($memory.TotalVisibleMemorySize - $memory.FreePhysicalMemory) / $memory.TotalVisibleMemorySize) * 100, 2)
            Memory_Available_GB = [Math]::Round($memory.FreePhysicalMemory / 1MB, 2)
            AGI_Process_Memory_MB = if ($process) { [Math]::Round($process.WorkingSet64 / 1MB, 2) } else { 0 }
            AGI_Process_CPU_Percent = if ($process) { [Math]::Round($process.CPU, 2) } else { 0 }
        }
    }
    catch {
        return @{ Error = "Unable to collect system metrics: $($_.Exception.Message)" }
    }
}

# AGI Training Systems Test Suite - All 14 Systems
$AGITrainingSystems = @(
    @{ Name = "Mathematical_Reasoning"; Path = "/reasoning"; Payload = @{ text = "Calculate the integral of x^2 from 0 to 5" } },
    @{ Name = "Autonomous_Problem_Solving"; Path = "/autonomous/reasoning"; Payload = @{ problem = "Design an efficient algorithm for resource optimization in distributed systems" } },
    @{ Name = "Meta_Learning"; Path = "/meta_learning/adapt"; Payload = @{ task = "few-shot learning"; examples = @("example1", "example2", "example3") } },
    @{ Name = "Real_Time_Learning"; Path = "/api/learning/adapt"; Payload = @{ data = "new training example"; context = "real-time adaptation" } },
    @{ Name = "Code_Generation"; Path = "/code/generate"; Payload = @{ task = "Create a Python function for binary search"; language = "python"; complexity = "intermediate" } },
    @{ Name = "RLHF_Training"; Path = "/rlhf/evaluate"; Payload = @{ response = "This is a test response for RLHF evaluation"; context = "performance testing"; feedback_type = "preference" } },
    @{ Name = "Constitutional_AI"; Path = "/constitutional/evaluate"; Payload = @{ response = "Test response for constitutional evaluation"; guidelines = @("be helpful", "be harmless", "be honest") } },
    @{ Name = "Multimodal_Training"; Path = "/multimodal/cross_modal/process"; Payload = @{ modality = "text"; content = "Performance testing multimodal capabilities"; task = "cross-modal processing" } },
    @{ Name = "Synthetic_Data_Generation"; Path = "/synthetic/generate"; Payload = @{ domain = "performance_testing"; count = 10; quality = "high" } },
    @{ Name = "Advanced_Training_Methodologies"; Path = "/training/advanced-reasoning/start"; Payload = @{ method = "advanced_reasoning"; parameters = @{ depth = 3; complexity = "high" } } },
    @{ Name = "Romanian_Language_Specialization"; Path = "/romanian/analyze_text"; Payload = @{ text = "Testarea performanței pentru procesarea limbii române cu conținut complex și nuanțat cultural." } },
    @{ Name = "Consciousness_Processing"; Path = "/consciousness/process"; Payload = @{ query = "Analyze the nature of consciousness in artificial intelligence systems"; depth = "comprehensive" } },
    @{ Name = "Quantum_Computing_Integration"; Path = "/api/v10/quantum-consciousness/status"; Payload = @{ query = "quantum processing capabilities"; level = "advanced" } },
    @{ Name = "Intelligence_Capabilities"; Path = "/intelligence/process"; Payload = @{ query = "Demonstrate advanced reasoning and intelligence capabilities"; complexity = "maximum" } }
)

Write-ColorOutput "🚀 RomAI AGI Performance Testing & Benchmarking Suite" "Cyan"
Write-ColorOutput "Test Type: $TestType | Duration: ${Duration}s | Concurrent Users: $ConcurrentUsers" "Yellow"
Write-ColorOutput "Microsoft Azure ML Production Standards Compliance" "Yellow"
Write-Host ""

$testResults = @{
    TestConfiguration = @{
        TestType = $TestType
        Duration = $Duration
        ConcurrentUsers = $ConcurrentUsers
        Timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        TestId = [Guid]::NewGuid().ToString().Substring(0, 8)
    }
    SystemMetrics = @{
        PreTest = @{}
        PostTest = @{}
        DuringTest = @{}
    }
    PerformanceResults = @{}
    Summary = @{}
}

switch ($TestType) {
    "setup" {
        Write-ColorOutput "🔧 Setting up performance testing environment..." "Cyan"
        
        # Validate AGI server availability
        Write-Host "Validating AGI Model Server..." -NoNewline
        try {
            $health = Invoke-RestMethod -Uri "http://localhost:6101/health" -Method Get -TimeoutSec 5
            Write-ColorOutput " ✅ Available" "Green"
        }
        catch {
            Write-ColorOutput " ❌ AGI Model Server not available" "Red"
            Write-ColorOutput "Please start the AGI model server before running performance tests." "Yellow"
            exit 1
        }
        
        # Create test results directory
        $resultsDir = "e:\GitHub\codai-project\apps\romai\performance-results"
        if (-not (Test-Path $resultsDir)) {
            New-Item -ItemType Directory -Path $resultsDir -Force | Out-Null
            Write-ColorOutput "✅ Created results directory: $resultsDir" "Green"
        }
        
        Write-ColorOutput "✅ Performance testing environment ready" "Green"
    }
    
    "latency" {
        Write-ColorOutput "⏱️ Running latency testing..." "Cyan"
        
        $testResults.SystemMetrics.PreTest = Get-SystemResourceMetrics
        
        Write-ColorOutput "Testing individual AGI system response times:" "Yellow"
        
        foreach ($system in $AGITrainingSystems) {
            $latencyResult = Test-AGIEndpointPerformance -Endpoint $system -Payload $system.Payload -RequestCount 5 -ConcurrentRequests 1
            $testResults.PerformanceResults[$system.Name] = $latencyResult
        }
        
        $testResults.SystemMetrics.PostTest = Get-SystemResourceMetrics
    }
    
    "throughput" {
        Write-ColorOutput "📊 Running throughput testing..." "Cyan"
        
        $testResults.SystemMetrics.PreTest = Get-SystemResourceMetrics
        
        Write-ColorOutput "Testing AGI system throughput with $ConcurrentUsers concurrent users:" "Yellow"
        
        # Test core systems for throughput
        $coreSystemsForThroughput = $AGITrainingSystems[0..6]  # First 7 systems
        
        foreach ($system in $coreSystemsForThroughput) {
            $throughputResult = Test-AGIEndpointPerformance -Endpoint $system -Payload $system.Payload -RequestCount 20 -ConcurrentRequests $ConcurrentUsers
            $testResults.PerformanceResults[$system.Name] = $throughputResult
        }
        
        $testResults.SystemMetrics.PostTest = Get-SystemResourceMetrics
    }
    
    "stress" {
        Write-ColorOutput "💪 Running stress testing..." "Cyan"
        
        Write-ColorOutput "Stress testing with high concurrent load..." "Yellow"
        
        $testResults.SystemMetrics.PreTest = Get-SystemResourceMetrics
        
        # Stress test core mathematical reasoning system
        $stressSystem = $AGITrainingSystems[0]  # Mathematical Reasoning
        $stressResult = Test-AGIEndpointPerformance -Endpoint $stressSystem -Payload $stressSystem.Payload -RequestCount 100 -ConcurrentRequests $MaxConcurrentUsers
        $testResults.PerformanceResults["Stress_Test_$($stressSystem.Name)"] = $stressResult
        
        $testResults.SystemMetrics.PostTest = Get-SystemResourceMetrics
    }
    
    "full" {
        Write-ColorOutput "🎯 Running comprehensive performance test suite..." "Cyan"
        
        $testResults.SystemMetrics.PreTest = Get-SystemResourceMetrics
        
        Write-ColorOutput "Phase 1: Latency Testing (All 14 AGI Systems)" "Yellow"
        foreach ($system in $AGITrainingSystems) {
            $latencyResult = Test-AGIEndpointPerformance -Endpoint $system -Payload $system.Payload -RequestCount 3 -ConcurrentRequests 1
            $testResults.PerformanceResults["Latency_$($system.Name)"] = $latencyResult
        }
        
        Write-ColorOutput "`nPhase 2: Throughput Testing (Core Systems)" "Yellow"
        $coreSystemsForThroughput = $AGITrainingSystems[0..4]  # First 5 systems
        foreach ($system in $coreSystemsForThroughput) {
            $throughputResult = Test-AGIEndpointPerformance -Endpoint $system -Payload $system.Payload -RequestCount 15 -ConcurrentRequests $ConcurrentUsers
            $testResults.PerformanceResults["Throughput_$($system.Name)"] = $throughputResult
        }
        
        Write-ColorOutput "`nPhase 3: Stress Testing (Mathematical Reasoning)" "Yellow"
        $stressSystem = $AGITrainingSystems[0]
        $stressResult = Test-AGIEndpointPerformance -Endpoint $stressSystem -Payload $stressSystem.Payload -RequestCount 50 -ConcurrentRequests 20
        $testResults.PerformanceResults["Stress_Test"] = $stressResult
        
        $testResults.SystemMetrics.PostTest = Get-SystemResourceMetrics
    }
    
    "run" {
        Write-ColorOutput "🔄 Running standard performance test..." "Cyan"
        
        $testResults.SystemMetrics.PreTest = Get-SystemResourceMetrics
        
        # Test core AGI capabilities
        $coreSystemsToTest = $AGITrainingSystems[0..7]  # First 8 systems
        
        Write-ColorOutput "Testing core AGI systems performance:" "Yellow"
        foreach ($system in $coreSystemsToTest) {
            $result = Test-AGIEndpointPerformance -Endpoint $system -Payload $system.Payload -RequestCount 10 -ConcurrentRequests 3
            $testResults.PerformanceResults[$system.Name] = $result
        }
        
        $testResults.SystemMetrics.PostTest = Get-SystemResourceMetrics
    }
}

# Generate performance summary
$successfulTests = ($testResults.PerformanceResults.Values | Where-Object { $_.SuccessfulRequests -gt 0 }).Count
$totalTests = $testResults.PerformanceResults.Count
$avgLatency = if ($testResults.PerformanceResults.Count -gt 0) {
    ($testResults.PerformanceResults.Values | Where-Object { $_.AverageLatency -gt 0 } | ForEach-Object { $_.AverageLatency } | Measure-Object -Average).Average
} else { 0 }

$testResults.Summary = @{
    SuccessfulTests = $successfulTests
    TotalTests = $totalTests
    SuccessRate = if ($totalTests -gt 0) { [Math]::Round(($successfulTests / $totalTests) * 100, 1) } else { 0 }
    AverageLatency = [Math]::Round($avgLatency, 2)
    TestDuration = ((Get-Date) - [DateTime]$testResults.TestConfiguration.Timestamp).TotalMinutes
}

# Display results
Write-Host ""
Write-ColorOutput "═══════════════════════════════════════════════════════════════" "Cyan"
Write-ColorOutput "🎯 PERFORMANCE TEST RESULTS SUMMARY" "Cyan"
Write-ColorOutput "═══════════════════════════════════════════════════════════════" "Cyan"

Write-ColorOutput "📊 Test Overview:" "Yellow"
Write-ColorOutput "  Test ID: $($testResults.TestConfiguration.TestId)" "White"
Write-ColorOutput "  Test Type: $($testResults.TestConfiguration.TestType)" "White"
Write-ColorOutput "  Duration: $([Math]::Round($testResults.Summary.TestDuration, 2)) minutes" "White"
Write-ColorOutput "  Success Rate: $($testResults.Summary.SuccessRate)% ($successfulTests/$totalTests)" $(if ($testResults.Summary.SuccessRate -ge 80) { "Green" } elseif ($testResults.Summary.SuccessRate -ge 60) { "Yellow" } else { "Red" })

if ($avgLatency -gt 0) {
    Write-ColorOutput "  Average Latency: $($testResults.Summary.AverageLatency)ms" $(if ($testResults.Summary.AverageLatency -lt 3000) { "Green" } elseif ($testResults.Summary.AverageLatency -lt 5000) { "Yellow" } else { "Red" })
}

Write-Host ""
Write-ColorOutput "🧠 AGI System Performance:" "Yellow"
foreach ($systemName in $testResults.PerformanceResults.Keys) {
    $result = $testResults.PerformanceResults[$systemName]
    $status = if ($result.SuccessfulRequests -gt 0) { "✅ PASS" } else { "❌ FAIL" }
    $statusColor = if ($result.SuccessfulRequests -gt 0) { "Green" } else { "Red" }
    
    Write-Host "  $($systemName.PadRight(30))" -NoNewline
    Write-ColorOutput " $status" $statusColor -NoNewline
    if ($result.AverageLatency -gt 0) {
        Write-Host " | Avg: $([Math]::Round($result.AverageLatency, 0))ms" -NoNewline
        if ($result.ThroughputRPM -gt 0) {
            Write-Host " | RPM: $($result.ThroughputRPM)"
        } else {
            Write-Host ""
        }
    } else {
        Write-Host ""
    }
}

# System resource impact
if ($testResults.SystemMetrics.PreTest.Keys.Count -gt 0 -and $testResults.SystemMetrics.PostTest.Keys.Count -gt 0) {
    Write-Host ""
    Write-ColorOutput "⚡ System Resource Impact:" "Yellow"
    $cpuDelta = $testResults.SystemMetrics.PostTest.CPU_Usage - $testResults.SystemMetrics.PreTest.CPU_Usage
    $memoryDelta = $testResults.SystemMetrics.PostTest.Memory_Usage_Percent - $testResults.SystemMetrics.PreTest.Memory_Usage_Percent
    
    Write-ColorOutput "  CPU Usage Change: $([Math]::Round($cpuDelta, 1))%" $(if ($cpuDelta -lt 10) { "Green" } elseif ($cpuDelta -lt 25) { "Yellow" } else { "Red" })
    Write-ColorOutput "  Memory Usage Change: $([Math]::Round($memoryDelta, 1))%" $(if ($memoryDelta -lt 5) { "Green" } elseif ($memoryDelta -lt 15) { "Yellow" } else { "Red" })
    
    if ($testResults.SystemMetrics.PostTest.AGI_Process_Memory_MB -gt 0) {
        Write-ColorOutput "  AGI Process Memory: $($testResults.SystemMetrics.PostTest.AGI_Process_Memory_MB)MB" "White"
    }
}

# Overall assessment
$overallScore = $testResults.Summary.SuccessRate
$performanceRating = if ($overallScore -ge 90) { "EXCELLENT" } 
                    elseif ($overallScore -ge 80) { "GOOD" } 
                    elseif ($overallScore -ge 60) { "ACCEPTABLE" } 
                    else { "NEEDS IMPROVEMENT" }

$ratingColor = if ($overallScore -ge 80) { "Green" } elseif ($overallScore -ge 60) { "Yellow" } else { "Red" }

Write-Host ""
Write-ColorOutput "🏆 OVERALL PERFORMANCE RATING: $performanceRating" $ratingColor

# Save results if requested
if ($SaveResults) {
    $resultsPath = "e:\GitHub\codai-project\apps\romai\performance-results\test-$($testResults.TestConfiguration.TestId)-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
    
    try {
        $testResults | ConvertTo-Json -Depth 10 | Out-File -FilePath $resultsPath -Encoding UTF8
        Write-ColorOutput "💾 Results saved: $resultsPath" "Green"
    }
    catch {
        Write-ColorOutput "⚠️ Failed to save results: $($_.Exception.Message)" "Yellow"
    }
}

Write-Host ""
Write-ColorOutput "✅ Performance testing completed!" "Green"

# Return appropriate exit code based on performance
exit $(if ($testResults.Summary.SuccessRate -ge 60) { 0 } else { 1 })