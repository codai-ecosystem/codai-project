# CBD Enterprise Production Deployment Validation Script
# 
# This script validates the production deployment by running comprehensive
# tests against the deployed system.

param(
    [string]$BaseUrl = "https://cbd-enterprise.example.com",
    [string]$Namespace = "cbd-enterprise",
    [int]$TimeoutSec = 30,
    [switch]$Verbose = $false
)

# Test results storage
$TestResults = @()

# Logging functions
function Write-TestInfo {
    param([string]$Message)
    if ($Verbose) { Write-Host "[TEST] $Message" -ForegroundColor Blue }
}

function Write-TestPass {
    param([string]$TestName, [string]$Message = "")
    Write-Host "[PASS] $TestName" -ForegroundColor Green
    if ($Message) { Write-Host "       $Message" -ForegroundColor Gray }
}

function Write-TestFail {
    param([string]$TestName, [string]$Message = "")
    Write-Host "[FAIL] $TestName" -ForegroundColor Red
    if ($Message) { Write-Host "       $Message" -ForegroundColor Gray }
}

# Test function wrapper
function Invoke-Test {
    param(
        [string]$TestName,
        [scriptblock]$TestScript
    )
    
    Write-TestInfo "Running test: $TestName"
    
    try {
        $result = & $TestScript
        $TestResults += @{
            Name = $TestName
            Status = "PASS"
            Message = $result.Message
            Duration = $result.Duration
        }
        Write-TestPass $TestName $result.Message
        return $true
    }
    catch {
        $TestResults += @{
            Name = $TestName
            Status = "FAIL"
            Message = $_.Exception.Message
            Duration = 0
        }
        Write-TestFail $TestName $_.Exception.Message
        return $false
    }
}

# Kubernetes connectivity test
function Test-KubernetesConnectivity {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    $clusterInfo = kubectl cluster-info 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Cannot connect to Kubernetes cluster"
    }
    
    $stopwatch.Stop()
    return @{
        Message = "Kubernetes cluster is accessible"
        Duration = $stopwatch.ElapsedMilliseconds
    }
}

# Deployment status test
function Test-DeploymentStatus {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    $deployment = kubectl get deployment cbd-engine -n $Namespace -o json 2>&1 | ConvertFrom-Json
    if ($LASTEXITCODE -ne 0) {
        throw "CBD Engine deployment not found"
    }
    
    $availableReplicas = $deployment.status.availableReplicas
    $desiredReplicas = $deployment.status.replicas
    
    if ($availableReplicas -ne $desiredReplicas) {
        throw "Deployment not ready: $availableReplicas/$desiredReplicas replicas available"
    }
    
    $stopwatch.Stop()
    return @{
        Message = "All $desiredReplicas replicas are available and ready"
        Duration = $stopwatch.ElapsedMilliseconds
    }
}

# Pod health test
function Test-PodHealth {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    $pods = kubectl get pods -n $Namespace -l app=cbd-engine -o json 2>&1 | ConvertFrom-Json
    if ($LASTEXITCODE -ne 0) {
        throw "Cannot retrieve pod information"
    }
    
    $healthyPods = 0
    $totalPods = $pods.items.Count
    
    foreach ($pod in $pods.items) {
        $phase = $pod.status.phase
        if ($phase -eq "Running") {
            $readyCondition = $pod.status.conditions | Where-Object { $_.type -eq "Ready" }
            if ($readyCondition.status -eq "True") {
                $healthyPods++
            }
        }
    }
    
    if ($healthyPods -ne $totalPods) {
        throw "Pod health check failed: $healthyPods/$totalPods pods are healthy"
    }
    
    $stopwatch.Stop()
    return @{
        Message = "All $totalPods pods are running and healthy"
        Duration = $stopwatch.ElapsedMilliseconds
    }
}

# Service connectivity test
function Test-ServiceConnectivity {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    $service = kubectl get service cbd-engine-service -n $Namespace -o json 2>&1 | ConvertFrom-Json
    if ($LASTEXITCODE -ne 0) {
        throw "CBD Engine service not found"
    }
    
    $clusterIP = $service.spec.clusterIP
    if (-not $clusterIP -or $clusterIP -eq "None") {
        throw "Service does not have a valid cluster IP"
    }
    
    $stopwatch.Stop()
    return @{
        Message = "Service is accessible at $clusterIP"
        Duration = $stopwatch.ElapsedMilliseconds
    }
}

# HTTP health endpoint test
function Test-HealthEndpoint {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/health" -TimeoutSec $TimeoutSec
        
        if ($response -match "healthy|ok") {
            $stopwatch.Stop()
            return @{
                Message = "Health endpoint returned healthy status"
                Duration = $stopwatch.ElapsedMilliseconds
            }
        } else {
            throw "Health endpoint returned unexpected response: $response"
        }
    }
    catch {
        throw "Health endpoint is not accessible: $($_.Exception.Message)"
    }
}

# Metrics endpoint test
function Test-MetricsEndpoint {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/metrics" -TimeoutSec $TimeoutSec
        
        if ($response -match "cbd_engine_") {
            $stopwatch.Stop()
            return @{
                Message = "Metrics endpoint is exposing CBD Engine metrics"
                Duration = $stopwatch.ElapsedMilliseconds
            }
        } else {
            throw "Metrics endpoint not returning CBD Engine metrics"
        }
    }
    catch {
        throw "Metrics endpoint is not accessible: $($_.Exception.Message)"
    }
}

# TLS/SSL certificate test
function Test-TLSCertificate {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    if (-not $BaseUrl.StartsWith("https://")) {
        throw "TLS test requires HTTPS URL"
    }
    
    try {
        # Create web request to check certificate
        $uri = [System.Uri]$BaseUrl
        $request = [System.Net.HttpWebRequest]::Create($uri)
        $request.Timeout = $TimeoutSec * 1000
        $request.Method = "HEAD"
        
        $response = $request.GetResponse()
        $cert = $request.ServicePoint.Certificate
        
        if ($cert) {
            $expiryDate = [DateTime]::Parse($cert.GetExpirationDateString())
            $daysUntilExpiry = ($expiryDate - (Get-Date)).Days
            
            if ($daysUntilExpiry -lt 30) {
                throw "TLS certificate expires in $daysUntilExpiry days"
            }
            
            $stopwatch.Stop()
            return @{
                Message = "TLS certificate is valid and expires in $daysUntilExpiry days"
                Duration = $stopwatch.ElapsedMilliseconds
            }
        } else {
            throw "No TLS certificate found"
        }
    }
    catch {
        throw "TLS certificate validation failed: $($_.Exception.Message)"
    }
}

# Performance baseline test
function Test-PerformanceBaseline {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    $totalRequests = 10
    $successCount = 0
    $responseTimes = @()
    
    for ($i = 1; $i -le $totalRequests; $i++) {
        try {
            $requestStart = Get-Date
            $response = Invoke-RestMethod -Uri "$BaseUrl/health" -TimeoutSec 5
            $requestEnd = Get-Date
            
            $responseTime = ($requestEnd - $requestStart).TotalMilliseconds
            $responseTimes += $responseTime
            $successCount++
        }
        catch {
            # Request failed, continue
        }
    }
    
    if ($successCount -eq 0) {
        throw "All performance test requests failed"
    }
    
    $avgResponseTime = ($responseTimes | Measure-Object -Average).Average
    $maxResponseTime = ($responseTimes | Measure-Object -Maximum).Maximum
    $successRate = ($successCount / $totalRequests) * 100
    
    if ($avgResponseTime -gt 1000) {
        throw "Average response time too high: ${avgResponseTime}ms"
    }
    
    if ($successRate -lt 90) {
        throw "Success rate too low: $successRate%"
    }
    
    $stopwatch.Stop()
    return @{
        Message = "Performance baseline met: ${avgResponseTime}ms avg, ${maxResponseTime}ms max, $successRate% success rate"
        Duration = $stopwatch.ElapsedMilliseconds
    }
}

# Resource utilization test
function Test-ResourceUtilization {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    $pods = kubectl top pods -n $Namespace -l app=cbd-engine --no-headers 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Cannot retrieve pod resource metrics (metrics-server required)"
    }
    
    $highCpuPods = @()
    $highMemoryPods = @()
    
    foreach ($line in $pods) {
        if ($line -match '(\S+)\s+(\d+)m\s+(\d+)Mi') {
            $podName = $matches[1]
            $cpuUsage = [int]$matches[2]
            $memoryUsage = [int]$matches[3]
            
            # Check if CPU usage is > 80% of 4000m limit (3200m)
            if ($cpuUsage -gt 3200) {
                $highCpuPods += $podName
            }
            
            # Check if memory usage is > 80% of 8Gi limit (6553Mi)
            if ($memoryUsage -gt 6553) {
                $highMemoryPods += $podName
            }
        }
    }
    
    if ($highCpuPods.Count -gt 0) {
        throw "High CPU usage detected in pods: $($highCpuPods -join ', ')"
    }
    
    if ($highMemoryPods.Count -gt 0) {
        throw "High memory usage detected in pods: $($highMemoryPods -join ', ')"
    }
    
    $stopwatch.Stop()
    return @{
        Message = "Resource utilization is within acceptable limits"
        Duration = $stopwatch.ElapsedMilliseconds
    }
}

# Log analysis test
function Test-LogAnalysis {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    $pods = kubectl get pods -n $Namespace -l app=cbd-engine -o name 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Cannot retrieve pod list for log analysis"
    }
    
    $errorCount = 0
    $warningCount = 0
    
    foreach ($pod in $pods) {
        $logs = kubectl logs $pod -n $Namespace --tail=100 2>&1
        
        $errors = $logs | Select-String -Pattern "ERROR|FATAL|PANIC" -AllMatches
        $warnings = $logs | Select-String -Pattern "WARN" -AllMatches
        
        $errorCount += $errors.Count
        $warningCount += $warnings.Count
    }
    
    if ($errorCount -gt 5) {
        throw "High error count in logs: $errorCount errors found"
    }
    
    $stopwatch.Stop()
    return @{
        Message = "Log analysis complete: $errorCount errors, $warningCount warnings"
        Duration = $stopwatch.ElapsedMilliseconds
    }
}

# Generate validation report
function New-ValidationReport {
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $reportFile = "validation-report-$timestamp.md"
    
    $passCount = ($TestResults | Where-Object { $_.Status -eq "PASS" }).Count
    $failCount = ($TestResults | Where-Object { $_.Status -eq "FAIL" }).Count
    $totalCount = $TestResults.Count
    
    $report = @"
# CBD Enterprise Production Deployment Validation Report

**Validation Date**: $(Get-Date)
**Base URL**: $BaseUrl
**Namespace**: $Namespace
**Overall Status**: $(if ($failCount -eq 0) { "✅ PASS" } else { "❌ FAIL" })

## Summary

- **Total Tests**: $totalCount
- **Passed**: $passCount
- **Failed**: $failCount
- **Success Rate**: $(if ($totalCount -gt 0) { [math]::Round(($passCount / $totalCount) * 100, 2) } else { 0 })%

## Test Results

"@
    
    foreach ($result in $TestResults) {
        $status = if ($result.Status -eq "PASS") { "✅" } else { "❌" }
        $report += @"

### $status $($result.Name)

- **Status**: $($result.Status)
- **Duration**: $($result.Duration)ms
- **Message**: $($result.Message)

"@
    }
    
    $report += @"

## Recommendations

"@
    
    if ($failCount -eq 0) {
        $report += "- ✅ All validation tests passed successfully"
        $report += "`n- ✅ Production deployment is healthy and ready"
    } else {
        $report += "- ❌ $failCount validation tests failed"
        $report += "`n- ❌ Please review and address the failed tests before considering the deployment production-ready"
    }
    
    $report | Out-File -FilePath $reportFile -Encoding UTF8
    Write-Host "`nValidation report generated: $reportFile" -ForegroundColor Cyan
    
    return $failCount -eq 0
}

# Main validation function
function Start-ValidationTests {
    Write-Host "🚀 Starting CBD Enterprise Production Deployment Validation" -ForegroundColor Cyan
    Write-Host "Base URL: $BaseUrl" -ForegroundColor Gray
    Write-Host "Namespace: $Namespace" -ForegroundColor Gray
    Write-Host "Timeout: $TimeoutSec seconds" -ForegroundColor Gray
    Write-Host ""
    
    $tests = @(
        @{ Name = "Kubernetes Connectivity"; Script = { Test-KubernetesConnectivity } },
        @{ Name = "Deployment Status"; Script = { Test-DeploymentStatus } },
        @{ Name = "Pod Health"; Script = { Test-PodHealth } },
        @{ Name = "Service Connectivity"; Script = { Test-ServiceConnectivity } },
        @{ Name = "Health Endpoint"; Script = { Test-HealthEndpoint } },
        @{ Name = "Metrics Endpoint"; Script = { Test-MetricsEndpoint } },
        @{ Name = "Performance Baseline"; Script = { Test-PerformanceBaseline } },
        @{ Name = "Resource Utilization"; Script = { Test-ResourceUtilization } },
        @{ Name = "Log Analysis"; Script = { Test-LogAnalysis } }
    )
    
    # Add TLS test only for HTTPS URLs
    if ($BaseUrl.StartsWith("https://")) {
        $tests += @{ Name = "TLS Certificate"; Script = { Test-TLSCertificate } }
    }
    
    $overallSuccess = $true
    
    foreach ($test in $tests) {
        $success = Invoke-Test -TestName $test.Name -TestScript $test.Script
        if (-not $success) {
            $overallSuccess = $false
        }
    }
    
    Write-Host ""
    $reportSuccess = New-ValidationReport
    
    if ($overallSuccess -and $reportSuccess) {
        Write-Host "🎉 All validation tests passed! Production deployment is healthy." -ForegroundColor Green
        exit 0
    } else {
        Write-Host "💥 Validation failed! Please review the failed tests." -ForegroundColor Red
        exit 1
    }
}

# Run validation
Start-ValidationTests
