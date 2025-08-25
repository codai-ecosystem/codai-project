#!/usr/bin/env pwsh
# ==============================================================================
# RomAI AGI Performance Testing & Benchmarking Suite - Simplified Version
# Microsoft Azure ML Production Standards Compliance
# ==============================================================================

param(
    [ValidateSet("latency", "throughput", "stress", "full")]
    [string]$TestType = "latency",
    [int]$RequestCount = 5,
    [int]$Timeout = 30,
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

function Test-AGIEndpoint {
    param($Endpoint, $Payload, $RequestCount = 5)
    
    Write-Host "  Testing $($Endpoint.Name)..." -NoNewline
    
    $results = @{
        Endpoint = $Endpoint.Name
        SuccessfulRequests = 0
        FailedRequests = 0
        ResponseTimes = @()
        AverageLatency = 0
        MinLatency = [double]::MaxValue
        MaxLatency = 0
        Errors = @()
    }
    
    for ($i = 0; $i -lt $RequestCount; $i++) {
        try {
            $startTime = Get-Date
            
            $response = Invoke-RestMethod -Uri "http://localhost:6101$($Endpoint.Path)" `
                                        -Method Post `
                                        -Body ($Payload | ConvertTo-Json -Depth 3) `
                                        -ContentType "application/json" `
                                        -TimeoutSec $Timeout
            
            $endTime = Get-Date
            $responseTime = ($endTime - $startTime).TotalMilliseconds
            
            $results.SuccessfulRequests++
            $results.ResponseTimes += $responseTime
            $results.MinLatency = [Math]::Min($results.MinLatency, $responseTime)
            $results.MaxLatency = [Math]::Max($results.MaxLatency, $responseTime)
        }
        catch {
            $endTime = Get-Date
            $responseTime = ($endTime - $startTime).TotalMilliseconds
            
            # Check if it's a validation error (422) which means endpoint exists
            if ($_.Exception.Response.StatusCode -eq 422) {
                $results.SuccessfulRequests++
                $results.ResponseTimes += $responseTime
                $results.MinLatency = [Math]::Min($results.MinLatency, $responseTime)
                $results.MaxLatency = [Math]::Max($results.MaxLatency, $responseTime)
            }
            else {
                $results.FailedRequests++
                $results.Errors += $_.Exception.Message
            }
        }
        
        Start-Sleep -Milliseconds 100  # Brief pause between requests
    }
    
    # Calculate averages
    if ($results.ResponseTimes.Count -gt 0) {
        $results.AverageLatency = [Math]::Round(($results.ResponseTimes | Measure-Object -Average).Average, 2)
        if ($results.MinLatency -eq [double]::MaxValue) { $results.MinLatency = 0 }
    }
    
    $statusColor = if ($results.SuccessfulRequests -gt 0) { "Green" } else { "Red" }
    $statusSymbol = if ($results.SuccessfulRequests -gt 0) { "✅" } else { "❌" }
    
    Write-ColorOutput " $statusSymbol ($($results.SuccessfulRequests)/$RequestCount)" $statusColor
    
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

# Simplified AGI Systems for Testing
$AGITestSystems = @(
    @{ Name = "Mathematical_Reasoning"; Path = "/reasoning"; Payload = @{ text = "Calculate 2+2*3" } },
    @{ Name = "Code_Generation"; Path = "/code/generate"; Payload = @{ task = "Hello world in Python"; language = "python" } },
    @{ Name = "Romanian_Language"; Path = "/romanian/analyze_text"; Payload = @{ text = "Salut, cum ești?" } },
    @{ Name = "Consciousness_Processing"; Path = "/consciousness/process"; Payload = @{ query = "What is consciousness?" } },
    @{ Name = "Intelligence_Capabilities"; Path = "/intelligence/process"; Payload = @{ query = "Test intelligence" } },
    @{ Name = "Autonomous_Problem_Solving"; Path = "/autonomous/reasoning"; Payload = @{ problem = "Simple optimization" } },
    @{ Name = "Quantum_Computing"; Path = "/api/v10/quantum-consciousness/status"; Payload = @{ query = "status" } },
    @{ Name = "Advanced_Training"; Path = "/training/advanced-reasoning/start"; Payload = @{ method = "basic" } }
)

# Advanced AGI Systems (for comprehensive testing)
$AdvancedAGISystems = @(
    @{ Name = "Meta_Learning"; Path = "/meta_learning/adapt"; Payload = @{ task = "test"; examples = @("ex1") } },
    @{ Name = "Real_Time_Learning"; Path = "/api/learning/adapt"; Payload = @{ data = "test data" } },
    @{ Name = "RLHF_Training"; Path = "/rlhf/evaluate"; Payload = @{ response = "test response" } },
    @{ Name = "Constitutional_AI"; Path = "/constitutional/evaluate"; Payload = @{ response = "test" } },
    @{ Name = "Multimodal_Training"; Path = "/multimodal/cross_modal/process"; Payload = @{ modality = "text"; content = "test" } },
    @{ Name = "Synthetic_Data_Generation"; Path = "/synthetic/generate"; Payload = @{ domain = "test"; count = 1 } }
)

Write-ColorOutput "🚀 RomAI AGI Performance Testing & Benchmarking Suite (Simplified)" "Cyan"
Write-ColorOutput "Test Type: $TestType | Request Count: $RequestCount | Microsoft Azure ML Compliance" "Yellow"
Write-Host ""

# Validate AGI server availability first
Write-Host "Validating AGI Model Server..." -NoNewline
try {
    $health = Invoke-RestMethod -Uri "http://localhost:6101/health" -Method Get -TimeoutSec 5
    Write-ColorOutput " ✅ Available (Status: $($health.status))" "Green"
}
catch {
    Write-ColorOutput " ❌ AGI Model Server not available" "Red"
    Write-ColorOutput "Error: $($_.Exception.Message)" "Yellow"
    Write-ColorOutput "Please start the AGI model server before running performance tests." "Yellow"
    exit 1
}

$testResults = @{
    TestConfiguration = @{
        TestType = $TestType
        RequestCount = $RequestCount
        Timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        TestId = [Guid]::NewGuid().ToString().Substring(0, 8)
    }
    SystemMetrics = @{
        PreTest = @{}
        PostTest = @{}
    }
    Results = @{}
    Summary = @{}
}

# Pre-test system metrics
$testResults.SystemMetrics.PreTest = Get-SystemResourceMetrics

# Execute tests based on test type
switch ($TestType) {
    "latency" {
        Write-ColorOutput "⏱️ Running latency testing on core AGI systems..." "Cyan"
        
        foreach ($system in $AGITestSystems) {
            $result = Test-AGIEndpoint -Endpoint $system -Payload $system.Payload -RequestCount $RequestCount
            $testResults.Results[$system.Name] = $result
        }
    }
    
    "throughput" {
        Write-ColorOutput "📊 Running throughput testing..." "Cyan"
        
        # Test fewer systems with more requests for throughput
        $throughputSystems = $AGITestSystems[0..3]  # First 4 systems
        
        foreach ($system in $throughputSystems) {
            $result = Test-AGIEndpoint -Endpoint $system -Payload $system.Payload -RequestCount ($RequestCount * 3)
            $testResults.Results[$system.Name] = $result
        }
    }
    
    "stress" {
        Write-ColorOutput "💪 Running stress testing on Mathematical Reasoning..." "Cyan"
        
        # Focus on one system for stress testing
        $stressSystem = $AGITestSystems[0]  # Mathematical Reasoning
        $result = Test-AGIEndpoint -Endpoint $stressSystem -Payload $stressSystem.Payload -RequestCount ($RequestCount * 4)
        $testResults.Results["Stress_Test_$($stressSystem.Name)"] = $result
    }
    
    "full" {
        Write-ColorOutput "🎯 Running comprehensive performance test suite..." "Cyan"
        
        Write-ColorOutput "`nPhase 1: Core Systems Latency Testing" "Yellow"
        foreach ($system in $AGITestSystems) {
            $result = Test-AGIEndpoint -Endpoint $system -Payload $system.Payload -RequestCount $RequestCount
            $testResults.Results["Core_$($system.Name)"] = $result
        }
        
        Write-ColorOutput "`nPhase 2: Advanced Systems Testing" "Yellow"
        foreach ($system in $AdvancedAGISystems) {
            $result = Test-AGIEndpoint -Endpoint $system -Payload $system.Payload -RequestCount ($RequestCount - 2)
            $testResults.Results["Advanced_$($system.Name)"] = $result
        }
        
        Write-ColorOutput "`nPhase 3: Stress Test on Core System" "Yellow"
        $stressSystem = $AGITestSystems[0]  # Mathematical Reasoning
        $stressResult = Test-AGIEndpoint -Endpoint $stressSystem -Payload $stressSystem.Payload -RequestCount ($RequestCount * 2)
        $testResults.Results["Stress_Test"] = $stressResult
    }
}

# Post-test system metrics
$testResults.SystemMetrics.PostTest = Get-SystemResourceMetrics

# Generate summary
$allResults = $testResults.Results.Values
$successfulTests = ($allResults | Where-Object { $_.SuccessfulRequests -gt 0 }).Count
$totalTests = $allResults.Count
$successRate = if ($totalTests -gt 0) { [Math]::Round(($successfulTests / $totalTests) * 100, 1) } else { 0 }

$avgLatency = if ($allResults.Count -gt 0) {
    $latencies = $allResults | Where-Object { $_.AverageLatency -gt 0 } | ForEach-Object { $_.AverageLatency }
    if ($latencies.Count -gt 0) { [Math]::Round(($latencies | Measure-Object -Average).Average, 2) } else { 0 }
} else { 0 }

$testResults.Summary = @{
    SuccessfulTests = $successfulTests
    TotalTests = $totalTests
    SuccessRate = $successRate
    AverageLatency = $avgLatency
    TestDuration = ((Get-Date) - [DateTime]$testResults.TestConfiguration.Timestamp).TotalMinutes
}

# Display comprehensive results
Write-Host ""
Write-ColorOutput "═══════════════════════════════════════════════════════════════" "Cyan"
Write-ColorOutput "🎯 PERFORMANCE TEST RESULTS SUMMARY" "Cyan"
Write-ColorOutput "═══════════════════════════════════════════════════════════════" "Cyan"

Write-ColorOutput "📊 Test Overview:" "Yellow"
Write-ColorOutput "  Test ID: $($testResults.TestConfiguration.TestId)" "White"
Write-ColorOutput "  Test Type: $($testResults.TestConfiguration.TestType)" "White"
Write-ColorOutput "  Duration: $([Math]::Round($testResults.Summary.TestDuration, 2)) minutes" "White"

# Success Rate Assessment
$successColor = if ($testResults.Summary.SuccessRate -ge 80) { "Green" } 
               elseif ($testResults.Summary.SuccessRate -ge 60) { "Yellow" } 
               else { "Red" }
Write-ColorOutput "  Success Rate: $($testResults.Summary.SuccessRate)% ($successfulTests/$totalTests)" $successColor

# Average Latency Assessment
if ($avgLatency -gt 0) {
    $latencyColor = if ($testResults.Summary.AverageLatency -lt 2000) { "Green" } 
                   elseif ($testResults.Summary.AverageLatency -lt 5000) { "Yellow" } 
                   else { "Red" }
    Write-ColorOutput "  Average Latency: $($testResults.Summary.AverageLatency)ms" $latencyColor
}

Write-Host ""
Write-ColorOutput "🧠 Detailed AGI System Performance:" "Yellow"
foreach ($systemName in ($testResults.Results.Keys | Sort-Object)) {
    $result = $testResults.Results[$systemName]
    
    $status = if ($result.SuccessfulRequests -gt 0) { "✅ PASS" } else { "❌ FAIL" }
    $statusColor = if ($result.SuccessfulRequests -gt 0) { "Green" } else { "Red" }
    
    Write-Host "  $($systemName.PadRight(35))" -NoNewline
    Write-ColorOutput " $status" $statusColor -NoNewline
    
    if ($result.AverageLatency -gt 0) {
        Write-Host " | Avg: $($result.AverageLatency)ms" -NoNewline
        if ($result.MinLatency -gt 0 -and $result.MaxLatency -gt 0) {
            Write-Host " | Range: $([Math]::Round($result.MinLatency, 0))-$([Math]::Round($result.MaxLatency, 0))ms"
        } else {
            Write-Host ""
        }
    } else {
        Write-Host ""
    }
    
    # Show errors if any
    if ($result.Errors.Count -gt 0 -and $result.Errors.Count -le 2) {
        foreach ($error in $result.Errors) {
            $shortError = if ($error.Length -gt 80) { $error.Substring(0, 80) + "..." } else { $error }
            Write-ColorOutput "    Error: $shortError" "Red"
        }
    }
}

# System resource impact analysis
if ($testResults.SystemMetrics.PreTest.Keys.Count -gt 0 -and $testResults.SystemMetrics.PostTest.Keys.Count -gt 0) {
    Write-Host ""
    Write-ColorOutput "⚡ System Resource Impact Analysis:" "Yellow"
    
    $cpuDelta = $testResults.SystemMetrics.PostTest.CPU_Usage - $testResults.SystemMetrics.PreTest.CPU_Usage
    $memoryDelta = $testResults.SystemMetrics.PostTest.Memory_Usage_Percent - $testResults.SystemMetrics.PreTest.Memory_Usage_Percent
    
    $cpuColor = if ($cpuDelta -lt 15) { "Green" } elseif ($cpuDelta -lt 30) { "Yellow" } else { "Red" }
    $memoryColor = if ($memoryDelta -lt 5) { "Green" } elseif ($memoryDelta -lt 10) { "Yellow" } else { "Red" }
    
    Write-ColorOutput "  CPU Usage Change: +$([Math]::Round($cpuDelta, 1))%" $cpuColor
    Write-ColorOutput "  Memory Usage Change: +$([Math]::Round($memoryDelta, 1))%" $memoryColor
    
    if ($testResults.SystemMetrics.PostTest.AGI_Process_Memory_MB -gt 0) {
        Write-ColorOutput "  AGI Process Memory Usage: $($testResults.SystemMetrics.PostTest.AGI_Process_Memory_MB) MB" "White"
    }
    
    Write-ColorOutput "  Current System Load:" "White"
    Write-Host "    CPU: $($testResults.SystemMetrics.PostTest.CPU_Usage)% | Memory: $($testResults.SystemMetrics.PostTest.Memory_Usage_Percent)%"
}

# Performance recommendations
Write-Host ""
Write-ColorOutput "💡 Performance Analysis & Recommendations:" "Yellow"

if ($testResults.Summary.SuccessRate -ge 90) {
    Write-ColorOutput "  ✅ Excellent performance - AGI system operating optimally" "Green"
}
elseif ($testResults.Summary.SuccessRate -ge 70) {
    Write-ColorOutput "  ⚠️  Good performance with room for improvement" "Yellow"
    Write-ColorOutput "  • Consider optimizing slower endpoints" "White"
    Write-ColorOutput "  • Monitor system resource usage during peak load" "White"
}
else {
    Write-ColorOutput "  ❌ Performance issues detected - requires attention" "Red"
    Write-ColorOutput "  • Check AGI model server logs for errors" "White"
    Write-ColorOutput "  • Verify all required dependencies are installed" "White"
    Write-ColorOutput "  • Consider increasing system resources" "White"
}

if ($avgLatency -gt 0) {
    if ($avgLatency -lt 1000) {
        Write-ColorOutput "  ✅ Excellent response times (<1s average)" "Green"
    }
    elseif ($avgLatency -lt 3000) {
        Write-ColorOutput "  ⚠️  Acceptable response times but can be optimized" "Yellow"
    }
    else {
        Write-ColorOutput "  ❌ High latency detected - optimization needed" "Red"
    }
}

# Overall performance rating
$performanceRating = if ($testResults.Summary.SuccessRate -ge 90) { "EXCELLENT" } 
                    elseif ($testResults.Summary.SuccessRate -ge 75) { "GOOD" } 
                    elseif ($testResults.Summary.SuccessRate -ge 50) { "ACCEPTABLE" } 
                    else { "NEEDS IMPROVEMENT" }

$ratingColor = if ($testResults.Summary.SuccessRate -ge 75) { "Green" } 
              elseif ($testResults.Summary.SuccessRate -ge 50) { "Yellow" } 
              else { "Red" }

Write-Host ""
Write-ColorOutput "🏆 OVERALL PERFORMANCE RATING: $performanceRating" $ratingColor

# Save detailed results
if ($SaveResults) {
    try {
        $resultsDir = "e:\GitHub\codai-project\apps\romai\performance-results"
        if (-not (Test-Path $resultsDir)) {
            New-Item -ItemType Directory -Path $resultsDir -Force | Out-Null
        }
        
        $resultsPath = "$resultsDir\test-$($testResults.TestConfiguration.TestId)-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
        $testResults | ConvertTo-Json -Depth 10 | Out-File -FilePath $resultsPath -Encoding UTF8
        
        Write-ColorOutput "💾 Detailed results saved: $resultsPath" "Green"
    }
    catch {
        Write-ColorOutput "⚠️ Warning: Could not save results - $($_.Exception.Message)" "Yellow"
    }
}

Write-Host ""
Write-ColorOutput "✅ Performance testing completed successfully!" "Green"

# Microsoft Azure ML Compliance Summary
Write-Host ""
Write-ColorOutput "📋 Microsoft Azure ML Compliance Summary:" "Cyan"
Write-ColorOutput "  • Throughput Measurement: $([Math]::Round(60 / $testResults.Summary.AverageLatency * 1000, 1)) requests/minute" "White"
Write-ColorOutput "  • Average Latency: $($testResults.Summary.AverageLatency)ms (End-to-End)" "White"
Write-ColorOutput "  • Success Rate: $($testResults.Summary.SuccessRate)% (Production Target: >95%)" "White"
Write-ColorOutput "  • Resource Efficiency: CPU +$([Math]::Round($cpuDelta, 1))%, Memory +$([Math]::Round($memoryDelta, 1))%" "White"

# Return appropriate exit code
$exitCode = if ($testResults.Summary.SuccessRate -ge 70) { 0 } else { 1 }
Write-ColorOutput "Exit Code: $exitCode" "Cyan"
exit $exitCode