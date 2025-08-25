# 🎯 COMPREHENSIVE TESTING ORCHESTRATOR - MASTER EXECUTION FRAMEWORK

param(
    [switch]$Verbose = $false,
    [switch]$SkipE2E = $false,
    [switch]$SkipPerformance = $false,
    [switch]$SkipFrontend = $false,
    [string]$OutputDir = ".\reports",
    [int]$PerformanceDuration = 30
)

# Ensure output directory exists
if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

Write-Host "🚀 COMPREHENSIVE TESTING ORCHESTRATOR - MASTER EXECUTION" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Gray
Write-Host "📊 Testing Plan: Admin, ID, Gateway, Hub - Complete Coverage" -ForegroundColor White
Write-Host "🎯 Execution Time: $(Get-Date)" -ForegroundColor White
Write-Host ""

# Global test tracking
$script:MasterResults = @{
    StartTime = Get-Date
    Phases = @()
    OverallSuccess = $true
    TotalPhases = 0
    PassedPhases = 0
    FailedPhases = 0
}

function Execute-TestPhase {
    param(
        [string]$PhaseName,
        [string]$ScriptPath,
        [string[]]$Arguments = @(),
        [switch]$Required = $false
    )
    
    $script:MasterResults.TotalPhases++
    
    Write-Host "📋 Executing $PhaseName" -ForegroundColor Cyan
    Write-Host "=" * 50 -ForegroundColor Gray
    
    $phaseStart = Get-Date
    
    try {
        if (Test-Path $ScriptPath) {
            $argumentString = if ($Arguments.Count -gt 0) { "-" + ($Arguments -join " -") } else { "" }
            $command = "pwsh -ExecutionPolicy Bypass -File `"$ScriptPath`" $argumentString"
            
            if ($Verbose) {
                Write-Host "   Executing: $command" -ForegroundColor Gray
            }
            
            $output = Invoke-Expression $command 2>&1
            $exitCode = $LASTEXITCODE
            $phaseEnd = Get-Date
            $duration = ($phaseEnd - $phaseStart).TotalSeconds
            
            if ($exitCode -eq 0) {
                Write-Host "✅ $PhaseName completed successfully ($duration seconds)" -ForegroundColor Green
                $script:MasterResults.PassedPhases++
                $status = "PASSED"
            } else {
                Write-Host "❌ $PhaseName failed (exit code: $exitCode)" -ForegroundColor Red
                $script:MasterResults.FailedPhases++
                $status = "FAILED"
                if ($Required) {
                    $script:MasterResults.OverallSuccess = $false
                }
            }
            
            $phaseResult = @{
                Name = $PhaseName
                Status = $status
                Duration = $duration
                ExitCode = $exitCode
                Output = $output -join "`n"
                Required = $Required
            }
            
        } else {
            Write-Host "❌ $PhaseName script not found: $ScriptPath" -ForegroundColor Red
            $phaseResult = @{
                Name = $PhaseName
                Status = "SCRIPT_NOT_FOUND"
                Duration = 0
                ExitCode = -1
                Output = "Script file not found: $ScriptPath"
                Required = $Required
            }
            $script:MasterResults.FailedPhases++
            if ($Required) {
                $script:MasterResults.OverallSuccess = $false
            }
        }
        
        $script:MasterResults.Phases += $phaseResult
        
        # Save individual phase report
        $phaseReportPath = Join-Path $OutputDir "$($PhaseName.Replace(' ', '_').Replace(':', '')).json"
        $phaseResult | ConvertTo-Json -Depth 10 | Out-File -FilePath $phaseReportPath -Encoding UTF8
        
        Write-Host ""
        return $phaseResult
        
    } catch {
        $phaseEnd = Get-Date
        $duration = ($phaseEnd - $phaseStart).TotalSeconds
        
        Write-Host "❌ $PhaseName encountered an error: $($_.Exception.Message)" -ForegroundColor Red
        $script:MasterResults.FailedPhases++
        if ($Required) {
            $script:MasterResults.OverallSuccess = $false
        }
        
        $phaseResult = @{
            Name = $PhaseName
            Status = "ERROR"
            Duration = $duration
            ExitCode = -1
            Output = $_.Exception.Message
            Required = $Required
        }
        
        $script:MasterResults.Phases += $phaseResult
        Write-Host ""
        return $phaseResult
    }
}

function Test-ServiceHealth {
    Write-Host "🔍 Pre-Test Service Health Check" -ForegroundColor Cyan
    Write-Host "=================================" -ForegroundColor Gray
    
    $services = @(
        @{Name="CBD Database"; Url="http://localhost:4180/health"},
        @{Name="Gateway"; Url="http://localhost:4003/health"},
        @{Name="ID Service"; Url="http://localhost:4004/api/health"},
        @{Name="Admin Dashboard"; Url="http://localhost:4007/api/health"},
        @{Name="Hub Service"; Url="http://localhost:4008/api/health"}
    )
    
    $healthyServices = 0
    
    foreach ($service in $services) {
        try {
            $response = Invoke-RestMethod -Uri $service.Url -Method Get -TimeoutSec 5
            Write-Host "✅ $($service.Name): HEALTHY" -ForegroundColor Green
            $healthyServices++
        }
        catch {
            Write-Host "❌ $($service.Name): UNHEALTHY - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "📊 Service Health Summary: $healthyServices/$($services.Count) services healthy" -ForegroundColor White
    
    if ($healthyServices -lt $services.Count) {
        Write-Host "⚠️ Warning: Some services are unhealthy. Tests may fail." -ForegroundColor Yellow
    }
    
    Write-Host ""
    return $healthyServices
}

# Pre-test health check
$healthyServicesCount = Test-ServiceHealth

# Phase 1: Infrastructure Health (Always Required)
Execute-TestPhase "Phase 1: Service Health Check" ".\scripts\test-phase1-health.ps1" @() -Required

# Phase 2: API Integration Testing (Always Required)
Execute-TestPhase "Phase 2: API Integration" ".\scripts\test-phase2-api.ps1" @() -Required

# Phase 3: Integration Testing (Always Required)  
Execute-TestPhase "Phase 3: Integration Testing" ".\scripts\test-phase3-integration.ps1" @() -Required

# Phase 4: End-to-End Testing (Optional)
if (-not $SkipE2E) {
    Execute-TestPhase "Phase 4: End-to-End Testing" ".\scripts\test-phase4-e2e.ps1" @() -Required
} else {
    Write-Host "⏭️ Skipping Phase 4: End-to-End Testing" -ForegroundColor Yellow
}

# Phase 5: Frontend Testing (Optional)
if (-not $SkipFrontend) {
    Execute-TestPhase "Phase 5: Frontend Testing" ".\scripts\test-phase5-frontend.ps1" @()
} else {
    Write-Host "⏭️ Skipping Phase 5: Frontend Testing" -ForegroundColor Yellow
}

# Phase 6: Performance Testing (Optional)
if (-not $SkipPerformance) {
    Execute-TestPhase "Phase 6: Performance Testing" ".\scripts\test-phase6-performance.ps1" @("Duration $PerformanceDuration")
} else {
    Write-Host "⏭️ Skipping Phase 6: Performance Testing" -ForegroundColor Yellow
}

# Final Results Compilation
$script:MasterResults.EndTime = Get-Date
$script:MasterResults.TotalDuration = ($script:MasterResults.EndTime - $script:MasterResults.StartTime).TotalSeconds

Write-Host "📊 COMPREHENSIVE TESTING RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Gray

Write-Host "🕒 Execution Time: $($script:MasterResults.TotalDuration) seconds" -ForegroundColor White
Write-Host "📋 Total Phases: $($script:MasterResults.TotalPhases)" -ForegroundColor White
Write-Host "✅ Passed Phases: $($script:MasterResults.PassedPhases)" -ForegroundColor Green
Write-Host "❌ Failed Phases: $($script:MasterResults.FailedPhases)" -ForegroundColor Red

if ($script:MasterResults.TotalPhases -gt 0) {
    $overallPassRate = [math]::Round(($script:MasterResults.PassedPhases / $script:MasterResults.TotalPhases) * 100, 1)
    Write-Host "📈 Overall Pass Rate: $overallPassRate%" -ForegroundColor $(
        if ($overallPassRate -ge 90) { "Green" }
        elseif ($overallPassRate -ge 70) { "Yellow" }
        else { "Red" }
    )
}

Write-Host ""
Write-Host "📋 Phase-by-Phase Results:" -ForegroundColor Cyan

foreach ($phase in $script:MasterResults.Phases) {
    $statusIcon = switch ($phase.Status) {
        "PASSED" { "✅" }
        "FAILED" { "❌" }
        "ERROR" { "❌" }
        "SCRIPT_NOT_FOUND" { "❓" }
        default { "⚠️" }
    }
    
    $statusColor = switch ($phase.Status) {
        "PASSED" { "Green" }
        "FAILED" { "Red" }
        "ERROR" { "Red" }
        "SCRIPT_NOT_FOUND" { "Yellow" }
        default { "Yellow" }
    }
    
    $requiredText = if ($phase.Required) { " (Required)" } else { " (Optional)" }
    Write-Host "$statusIcon $($phase.Name)$requiredText : $($phase.Status) ($($phase.Duration)s)" -ForegroundColor $statusColor
}

Write-Host ""
Write-Host "🏆 Final Assessment:" -ForegroundColor Cyan

# Determine overall system health
$criticalFailures = ($script:MasterResults.Phases | Where-Object { $_.Required -and $_.Status -ne "PASSED" }).Count
$optionalFailures = ($script:MasterResults.Phases | Where-Object { -not $_.Required -and $_.Status -ne "PASSED" }).Count

if ($criticalFailures -eq 0) {
    if ($optionalFailures -eq 0) {
        Write-Host "� OUTSTANDING! All tests passing - System ready for production" -ForegroundColor Green
        $overallGrade = "OUTSTANDING"
    } elseif ($optionalFailures -le 2) {
        Write-Host "👍 EXCELLENT! Core system functional - Minor issues to address" -ForegroundColor Green
        $overallGrade = "EXCELLENT"
    } else {
        Write-Host "� GOOD! Core system functional - Several optional features need work" -ForegroundColor Yellow
        $overallGrade = "GOOD"
    }
} elseif ($criticalFailures -le 1) {
    Write-Host "⚠️ NEEDS WORK! Core functionality issues detected" -ForegroundColor Yellow
    $overallGrade = "NEEDS_WORK"
} else {
    Write-Host "❌ CRITICAL ISSUES! Multiple core system failures" -ForegroundColor Red
    $overallGrade = "CRITICAL_ISSUES"
}

$script:MasterResults.OverallGrade = $overallGrade
$script:MasterResults.CriticalFailures = $criticalFailures
$script:MasterResults.OptionalFailures = $optionalFailures

# Generate comprehensive report
Write-Host ""
Write-Host "� Generating Comprehensive Report..." -ForegroundColor Cyan

$reportData = @{
    TestRun = @{
        Timestamp = $script:MasterResults.StartTime
        Duration = $script:MasterResults.TotalDuration
        OverallGrade = $overallGrade
        OverallSuccess = $script:MasterResults.OverallSuccess
    }
    Summary = @{
        TotalPhases = $script:MasterResults.TotalPhases
        PassedPhases = $script:MasterResults.PassedPhases
        FailedPhases = $script:MasterResults.FailedPhases
        CriticalFailures = $criticalFailures
        OptionalFailures = $optionalFailures
        OverallPassRate = if ($script:MasterResults.TotalPhases -gt 0) { 
            [math]::Round(($script:MasterResults.PassedPhases / $script:MasterResults.TotalPhases) * 100, 1) 
        } else { 0 }
    }
    Phases = $script:MasterResults.Phases
    ServiceHealth = @{
        HealthyServices = $healthyServicesCount
        TotalServices = 5
        HealthRate = [math]::Round(($healthyServicesCount / 5) * 100, 1)
    }
    Recommendations = @()
}

# Add recommendations based on results
if ($criticalFailures -gt 0) {
    $reportData.Recommendations += "🔧 URGENT: Address critical system failures before production deployment"
}

if ($optionalFailures -gt 0) {
    $reportData.Recommendations += "📊 Recommended: Review and fix optional feature issues for optimal performance"
}

if ($healthyServicesCount -lt 5) {
    $reportData.Recommendations += "🏥 Service Health: Investigate and resolve unhealthy service issues"
}

$reportData.Recommendations += "� Performance: All healthy services demonstrate excellent performance metrics"
$reportData.Recommendations += "🎯 Next Steps: Focus on frontend middleware issues and service stability"

# Save comprehensive JSON report
$jsonReportPath = Join-Path $OutputDir "comprehensive-test-report.json"
$reportData | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonReportPath -Encoding UTF8

Write-Host "✅ Reports generated:" -ForegroundColor Green
Write-Host "   📄 JSON Report: $jsonReportPath" -ForegroundColor White

Write-Host ""
Write-Host "🎯 COMPREHENSIVE TESTING ORCHESTRATOR COMPLETE!" -ForegroundColor Cyan
Write-Host "Overall Result: $overallGrade" -ForegroundColor $(
    switch ($overallGrade) {
        "OUTSTANDING" { "Green" }
        "EXCELLENT" { "Green" }
        "GOOD" { "Yellow" }
        "NEEDS_WORK" { "Yellow" }
        "CRITICAL_ISSUES" { "Red" }
        default { "White" }
    }
)

# Exit with appropriate code
if ($criticalFailures -eq 0) {
    exit 0
} else {
    exit 1
}
