#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Simplified Health Monitoring for Essential CodAI Services
.DESCRIPTION
    Robust health monitoring with performance metrics and alerting
.NOTES
    Sprint: Essential CodAI Services Enhancement
    User Story: US-MON-001 - Comprehensive Health Monitoring
#>

param(
    [switch]$Continuous = $false,
    [int]$Interval = 30,
    [string]$LogFile = "monitoring-$(Get-Date -Format 'yyyyMMdd').log"
)

Write-Host "🎯 CodAI Services Health Monitor" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""

# Service configuration
$services = @(
    @{ Name = "Identity API"; Port = 8100; Endpoint = "/api/health"; Critical = $true },
    @{ Name = "API Gateway"; Port = 8010; Endpoint = "/api/health"; Critical = $true },
    @{ Name = "Hub API"; Port = 8110; Endpoint = "/api/health"; Critical = $true },
    @{ Name = "MemorAI Frontend"; Port = 8006; Endpoint = "/api/health"; Critical = $false },
    @{ Name = "CBD Database"; Port = 8180; Endpoint = "/health"; Critical = $true },
    @{ Name = "MemorAI MCP"; Port = 4950; Endpoint = "/health"; Critical = $false }
)

# Monitoring state
$global:metrics = @{}
$global:alertHistory = @()

function Test-ServiceHealth {
    param([hashtable]$service)
    
    $result = @{
        Service = $service.Name
        Port = $service.Port
        Status = "Unhealthy"
        ResponseTime = 0
        Error = $null
        Timestamp = Get-Date
        Data = $null
    }
    
    try {
        $uri = "http://localhost:$($service.Port)$($service.Endpoint)"
        $startTime = Get-Date
        
        $response = Invoke-RestMethod -Uri $uri -Method Get -TimeoutSec 5
        $endTime = Get-Date
        
        $result.ResponseTime = [math]::Round(($endTime - $startTime).TotalMilliseconds, 2)
        $result.Status = "Healthy"
        $result.Data = $response
        
    } catch {
        $result.Error = $_.Exception.Message
        $result.ResponseTime = 5000  # Timeout value
    }
    
    return $result
}

function Update-ServiceMetrics {
    param([hashtable]$checkResult)
    
    $serviceName = $checkResult.Service
    
    if (-not $global:metrics.ContainsKey($serviceName)) {
        $global:metrics[$serviceName] = @{
            SuccessCount = 0
            FailureCount = 0
            TotalResponseTime = 0
            MinResponseTime = [double]::MaxValue
            MaxResponseTime = 0
            LastResponseTime = 0
            Availability = 0
            ErrorRate = 0
            CheckHistory = @()
        }
    }
    
    $metric = $global:metrics[$serviceName]
    
    if ($checkResult.Status -eq "Healthy") {
        $metric.SuccessCount++
        $metric.TotalResponseTime += $checkResult.ResponseTime
        
        if ($checkResult.ResponseTime -lt $metric.MinResponseTime) {
            $metric.MinResponseTime = $checkResult.ResponseTime
        }
        if ($checkResult.ResponseTime -gt $metric.MaxResponseTime) {
            $metric.MaxResponseTime = $checkResult.ResponseTime
        }
    } else {
        $metric.FailureCount++
    }
    
    $metric.LastResponseTime = $checkResult.ResponseTime
    $totalChecks = $metric.SuccessCount + $metric.FailureCount
    
    if ($totalChecks -gt 0) {
        $metric.Availability = [math]::Round(($metric.SuccessCount / $totalChecks) * 100, 2)
        $metric.ErrorRate = [math]::Round(($metric.FailureCount / $totalChecks) * 100, 2)
    }
    
    # Keep last 50 checks
    $metric.CheckHistory += @{
        Timestamp = $checkResult.Timestamp
        Status = $checkResult.Status
        ResponseTime = $checkResult.ResponseTime
    }
    
    if ($metric.CheckHistory.Count -gt 50) {
        $metric.CheckHistory = $metric.CheckHistory[-50..-1]
    }
}

function Test-Alerts {
    param([hashtable]$checkResult, [hashtable]$serviceConfig)
    
    $alerts = @()
    $metric = $global:metrics[$checkResult.Service]
    
    # Response time alerts
    if ($checkResult.ResponseTime -gt 500 -and $checkResult.Status -eq "Healthy") {
        $alerts += "CRITICAL: $($checkResult.Service) response time is $($checkResult.ResponseTime)ms (>500ms)"
    } elseif ($checkResult.ResponseTime -gt 100 -and $checkResult.Status -eq "Healthy") {
        $alerts += "WARNING: $($checkResult.Service) response time is $($checkResult.ResponseTime)ms (>100ms)"
    }
    
    # Service down alerts
    if ($checkResult.Status -eq "Unhealthy" -and $serviceConfig.Critical) {
        $alerts += "CRITICAL: $($checkResult.Service) is DOWN - $($checkResult.Error)"
    } elseif ($checkResult.Status -eq "Unhealthy") {
        $alerts += "WARNING: $($checkResult.Service) is DOWN - $($checkResult.Error)"
    }
    
    # Availability alerts
    if ($metric.Availability -lt 90 -and ($metric.SuccessCount + $metric.FailureCount) -gt 5) {
        $alerts += "CRITICAL: $($checkResult.Service) availability is $($metric.Availability)% (<90%)"
    } elseif ($metric.Availability -lt 95 -and ($metric.SuccessCount + $metric.FailureCount) -gt 10) {
        $alerts += "WARNING: $($checkResult.Service) availability is $($metric.Availability)% (<95%)"
    }
    
    # Process alerts
    foreach ($alert in $alerts) {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $logEntry = "[$timestamp] $alert"
        
        # Console output
        if ($alert.StartsWith("CRITICAL")) {
            Write-Host "🚨 $alert" -ForegroundColor Red
        } else {
            Write-Host "⚠️ $alert" -ForegroundColor Yellow
        }
        
        # Log to file
        try {
            $logEntry | Out-File -FilePath $LogFile -Append -Encoding UTF8
        } catch {
            Write-Host "Failed to write to log: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        $global:alertHistory += @{
            Timestamp = Get-Date
            Alert = $alert
        }
    }
}

function Show-MonitoringSummary {
    $healthyCount = 0
    $unhealthyCount = 0
    $criticalCount = 0
    $totalResponseTime = 0
    $responseTimeCount = 0
    
    Write-Host ""
    Write-Host "📊 Service Status Summary:" -ForegroundColor Yellow
    Write-Host "=========================" -ForegroundColor Yellow
    
    foreach ($service in $services) {
        $metric = $global:metrics[$service.Name]
        if ($metric -and ($metric.SuccessCount + $metric.FailureCount) -gt 0) {
            $avgResponseTime = if ($metric.SuccessCount -gt 0) { 
                [math]::Round($metric.TotalResponseTime / $metric.SuccessCount, 1) 
            } else { 
                "N/A" 
            }
            
            $statusIcon = if ($metric.Availability -gt 95) { "✅" } elseif ($metric.Availability -gt 90) { "⚠️" } else { "🚨" }
            
            Write-Host "$statusIcon $($service.Name):" -ForegroundColor White
            Write-Host "   📈 Availability: $($metric.Availability)%" -ForegroundColor Gray
            Write-Host "   ⏱️ Avg Response: $avgResponseTime ms" -ForegroundColor Gray
            Write-Host "   📊 Success: $($metric.SuccessCount) | Failures: $($metric.FailureCount)" -ForegroundColor Gray
            
            if ($metric.Availability -gt 95) {
                $healthyCount++
                if ($avgResponseTime -ne "N/A") {
                    $totalResponseTime += $avgResponseTime
                    $responseTimeCount++
                }
            } elseif ($metric.Availability -gt 90) {
                $unhealthyCount++
            } else {
                $criticalCount++
            }
        } else {
            Write-Host "❓ $($service.Name): No data" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    Write-Host "🎯 Overall System Health:" -ForegroundColor Cyan
    Write-Host "  ✅ Healthy Services: $healthyCount" -ForegroundColor Green
    Write-Host "  ⚠️ Degraded Services: $unhealthyCount" -ForegroundColor Yellow
    Write-Host "  🚨 Critical Services: $criticalCount" -ForegroundColor Red
    
    if ($responseTimeCount -gt 0) {
        $avgSystemResponse = [math]::Round($totalResponseTime / $responseTimeCount, 1)
        Write-Host "  ⏱️ System Avg Response: $avgSystemResponse ms" -ForegroundColor White
    }
    
    $recentAlerts = $global:alertHistory | Where-Object { $_.Timestamp -gt (Get-Date).AddMinutes(-10) }
    Write-Host "  🚨 Recent Alerts (10min): $($recentAlerts.Count)" -ForegroundColor White
    Write-Host ""
}

function Start-MonitoringCycle {
    Write-Host "🔍 Running monitoring cycle at $(Get-Date -Format 'HH:mm:ss')..." -ForegroundColor Cyan
    
    foreach ($service in $services) {
        $checkResult = Test-ServiceHealth -service $service
        Update-ServiceMetrics -checkResult $checkResult
        Test-Alerts -checkResult $checkResult -serviceConfig $service
        
        # Brief status
        $statusIcon = if ($checkResult.Status -eq "Healthy") { "✅" } else { "❌" }
        Write-Host "  $statusIcon $($service.Name): $($checkResult.Status) ($($checkResult.ResponseTime)ms)" -ForegroundColor White
    }
    
    Show-MonitoringSummary
}

# Main execution
if ($Continuous) {
    Write-Host "🚀 Starting continuous monitoring (Press Ctrl+C to stop)" -ForegroundColor Green
    Write-Host "Interval: $Interval seconds" -ForegroundColor Gray
    Write-Host "Log file: $LogFile" -ForegroundColor Gray
    Write-Host ""
    
    try {
        while ($true) {
            Start-MonitoringCycle
            Write-Host "⏳ Next check in $Interval seconds..." -ForegroundColor Gray
            Write-Host ("=" * 60) -ForegroundColor DarkGray
            Start-Sleep -Seconds $Interval
        }
    } catch {
        Write-Host ""
        Write-Host "⏹️ Monitoring stopped" -ForegroundColor Yellow
    }
} else {
    Write-Host "📋 Running single monitoring check..." -ForegroundColor Green
    Start-MonitoringCycle
    
    Write-Host "💡 To start continuous monitoring:" -ForegroundColor Yellow
    Write-Host "   pwsh -File monitor-services-simple.ps1 -Continuous" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "🎉 Monitoring cycle completed!" -ForegroundColor Green