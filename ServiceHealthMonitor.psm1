# CodAI Services Health Monitoring Module
# Version: 1.0
# Date: August 27, 2025

class ServiceHealthMonitor {
    [hashtable]$Services
    [hashtable]$Config
    [hashtable]$MetricsHistory
    [string]$LogFile
    
    ServiceHealthMonitor([hashtable]$config) {
        $this.Config = $config
        $this.Services = @{}
        $this.MetricsHistory = @{}
        $this.LogFile = $config.Alerting.LogFile
        
        # Initialize services
        foreach ($service in $config.Services) {
            $this.Services[$service.Name] = @{
                Config = $service
                Status = "Unknown"
                LastCheck = $null
                ResponseTime = 0
                ErrorCount = 0
                SuccessCount = 0
                Availability = 0
                Metrics = @()
            }
            $this.MetricsHistory[$service.Name] = @()
        }
    }
    
    [hashtable] CheckServiceHealth([hashtable]$serviceConfig) {
        $result = @{
            Service = $serviceConfig.Name
            Status = "Unhealthy"
            ResponseTime = 0
            Error = $null
            Timestamp = Get-Date
            Data = $null
        }
        
        try {
            $uri = "http://localhost:$($serviceConfig.Port)$($serviceConfig.HealthEndpoint)"
            $startTime = Get-Date
            
            $response = Invoke-RestMethod -Uri $uri -Method Get -TimeoutSec ($this.Config.Monitoring.HealthCheckTimeout / 1000)
            $endTime = Get-Date
            
            $result.ResponseTime = ($endTime - $startTime).TotalMilliseconds
            $result.Status = "Healthy"
            $result.Data = $response
            
        } catch {
            $result.Error = $_.Exception.Message
            $result.Status = "Unhealthy"
        }
        
        return $result
    }
    
    [void] UpdateServiceMetrics([string]$serviceName, [hashtable]$checkResult) {
        $service = $this.Services[$serviceName]
        $service.LastCheck = $checkResult.Timestamp
        $service.ResponseTime = $checkResult.ResponseTime
        
        if ($checkResult.Status -eq "Healthy") {
            $service.SuccessCount++
        } else {
            $service.ErrorCount++
        }
        
        $totalChecks = $service.SuccessCount + $service.ErrorCount
        if ($totalChecks -gt 0) {
            $service.Availability = ($service.SuccessCount / $totalChecks) * 100
        }
        
        # Add to metrics history
        $metric = @{
            Timestamp = $checkResult.Timestamp
            ResponseTime = $checkResult.ResponseTime
            Status = $checkResult.Status
            ErrorRate = if ($totalChecks -gt 0) { ($service.ErrorCount / $totalChecks) * 100 } else { 0 }
        }
        
        $this.MetricsHistory[$serviceName] += $metric
        
        # Keep only last 1000 metrics per service
        if ($this.MetricsHistory[$serviceName].Count -gt 1000) {
            $this.MetricsHistory[$serviceName] = $this.MetricsHistory[$serviceName][-1000..-1]
        }
    }
    
    [void] CheckAlert([string]$serviceName, [hashtable]$checkResult) {
        $service = $this.Services[$serviceName]
        $thresholds = $this.Config.Monitoring.AlertThresholds
        
        $alerts = @()
        
        # Response time alerts
        if ($checkResult.ResponseTime -gt $thresholds.ResponseTime.Critical) {
            $alerts += @{
                Level = "CRITICAL"
                Message = "$serviceName response time is critical: $([math]::Round($checkResult.ResponseTime, 2))ms"
                Metric = "ResponseTime"
                Value = $checkResult.ResponseTime
                Threshold = $thresholds.ResponseTime.Critical
            }
        } elseif ($checkResult.ResponseTime -gt $thresholds.ResponseTime.Warning) {
            $alerts += @{
                Level = "WARNING"
                Message = "$serviceName response time is high: $([math]::Round($checkResult.ResponseTime, 2))ms"
                Metric = "ResponseTime"
                Value = $checkResult.ResponseTime
                Threshold = $thresholds.ResponseTime.Warning
            }
        }
        
        # Availability alerts
        if ($service.Availability -lt $thresholds.Availability.Critical) {
            $alerts += @{
                Level = "CRITICAL"
                Message = "$serviceName availability is critical: $([math]::Round($service.Availability, 2))%"
                Metric = "Availability"
                Value = $service.Availability
                Threshold = $thresholds.Availability.Critical
            }
        } elseif ($service.Availability -lt $thresholds.Availability.Warning) {
            $alerts += @{
                Level = "WARNING"
                Message = "$serviceName availability is low: $([math]::Round($service.Availability, 2))%"
                Metric = "Availability"
                Value = $service.Availability
                Threshold = $thresholds.Availability.Warning
            }
        }
        
        # Service down alert
        if ($checkResult.Status -eq "Unhealthy" -and $service.Config.Critical) {
            $alerts += @{
                Level = "CRITICAL"
                Message = "$serviceName is DOWN: $($checkResult.Error)"
                Metric = "ServiceStatus"
                Value = "Unhealthy"
                Threshold = "Healthy"
            }
        }
        
        # Process alerts
        foreach ($alert in $alerts) {
            $this.ProcessAlert($alert)
        }
    }
    
    [void] ProcessAlert([hashtable]$alert) {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $alertMessage = "[$timestamp] [$($alert.Level)] $($alert.Message)"
        
        # Console output
        $color = if ($alert.Level -eq "CRITICAL") { "Red" } else { "Yellow" }
        Write-Host "🚨 $alertMessage" -ForegroundColor $color
        
        # File logging
        try {
            $alertMessage | Out-File -FilePath $this.LogFile -Append -Encoding UTF8
        } catch {
            Write-Host "⚠️ Failed to write to log file: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    
    [hashtable] GetServiceSummary() {
        $summary = @{
            TotalServices = $this.Services.Count
            HealthyServices = 0
            UnhealthyServices = 0
            CriticalServices = 0
            AverageResponseTime = 0
            OverallAvailability = 0
            LastUpdate = Get-Date
        }
        
        $totalResponseTime = 0
        $totalAvailability = 0
        $healthyCount = 0
        
        foreach ($service in $this.Services.Values) {
            if ($service.LastCheck -ne $null) {
                $totalResponseTime += $service.ResponseTime
                $totalAvailability += $service.Availability
                
                if ($service.Availability -gt 95) {
                    $summary.HealthyServices++
                    $healthyCount++
                } elseif ($service.Availability -lt 90) {
                    $summary.CriticalServices++
                } else {
                    $summary.UnhealthyServices++
                }
            }
        }
        
        if ($healthyCount -gt 0) {
            $summary.AverageResponseTime = $totalResponseTime / $healthyCount
            $summary.OverallAvailability = $totalAvailability / $this.Services.Count
        }
        
        return $summary
    }
    
    [void] RunMonitoringCycle() {
        Write-Host "🔍 Running health monitoring cycle..." -ForegroundColor Cyan
        
        foreach ($serviceConfig in $this.Config.Services) {
            $checkResult = $this.CheckServiceHealth($serviceConfig)
            $this.UpdateServiceMetrics($serviceConfig.Name, $checkResult)
            $this.CheckAlert($serviceConfig.Name, $checkResult)
            
            # Brief status output
            $statusIcon = if ($checkResult.Status -eq "Healthy") { "✅" } else { "❌" }
            $responseTime = [math]::Round($checkResult.ResponseTime, 1)
            Write-Host "  $statusIcon $($serviceConfig.Name): $($checkResult.Status) ($($responseTime)ms)" -ForegroundColor White
        }
        
        # Display summary
        $summary = $this.GetServiceSummary()
        Write-Host ""
        Write-Host "📊 Monitoring Summary:" -ForegroundColor Yellow
        Write-Host "  ✅ Healthy: $($summary.HealthyServices)" -ForegroundColor Green
        Write-Host "  ⚠️ Unhealthy: $($summary.UnhealthyServices)" -ForegroundColor Yellow
        Write-Host "  🚨 Critical: $($summary.CriticalServices)" -ForegroundColor Red
        Write-Host "  ⏱️ Avg Response: $([math]::Round($summary.AverageResponseTime, 1))ms" -ForegroundColor White
        Write-Host "  📈 Availability: $([math]::Round($summary.OverallAvailability, 1))%" -ForegroundColor White
        Write-Host ""
    }
    
    [void] StartContinuousMonitoring() {
        Write-Host "🚀 Starting continuous monitoring (Ctrl+C to stop)..." -ForegroundColor Green
        Write-Host "Monitoring interval: $($this.Config.Monitoring.Interval) seconds" -ForegroundColor Gray
        Write-Host ""
        
        try {
            while ($true) {
                $this.RunMonitoringCycle()
                Start-Sleep -Seconds $this.Config.Monitoring.Interval
            }
        } catch [System.Management.Automation.ParameterBindingException] {
            Write-Host "⏹️ Monitoring stopped by user" -ForegroundColor Yellow
        }
    }
    
    [void] ExportMetrics([string]$filePath) {
        $exportData = @{
            Services = $this.Services
            MetricsHistory = $this.MetricsHistory
            Summary = $this.GetServiceSummary()
            ExportedAt = Get-Date
        }
        
        try {
            $exportData | ConvertTo-Json -Depth 10 | Out-File -FilePath $filePath -Encoding UTF8
            Write-Host "✅ Metrics exported to: $filePath" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to export metrics: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Export the class and functions
Export-ModuleMember -Function * -Variable *
