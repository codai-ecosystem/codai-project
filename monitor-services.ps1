#!/usr/bin/env pwsh

# Import the monitoring module
Import-Module ./ServiceHealthMonitor.psm1 -Force

# Load configuration
$config = Get-Content 'monitoring-config.json' | ConvertFrom-Json -AsHashtable

# Create monitor instance
$monitor = [ServiceHealthMonitor]::new($config)

# Check command line arguments
param(
    [switch]$Continuous = $false,
    [switch]$SingleRun = $false,
    [switch]$Export = $false,
    [string]$ExportFile = "metrics-export-$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
)

Write-Host "🎯 CodAI Services Health Monitoring" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

if ($Export) {
    $monitor.ExportMetrics($ExportFile)
} elseif ($Continuous) {
    $monitor.StartContinuousMonitoring()
} else {
    $monitor.RunMonitoringCycle()
}
