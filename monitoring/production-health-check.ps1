#!/usr/bin/env pwsh
# CODAI Ecosystem - Comprehensive Production Health Check
# Monitors all services, infrastructure, and monitoring stack

param(
    [switch]$Verbose,
    [switch]$Json,
    [int]$TimeoutSeconds = 10
)

# Color output functions
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }

# Health check function
function Test-ServiceHealth {
    param(
        [string]$Name,
        [string]$URL,
        [int]$Port,
        [int]$TimeoutSec = 10
    )
    
    try {
        if ($Verbose) { Write-Host "Checking $Name..." -NoNewline }
        
        $response = Invoke-RestMethod -Uri $URL -Method Get -TimeoutSec $TimeoutSec -ErrorAction Stop
        
        $result = @{
            Name = $Name
            Status = "Healthy"
            URL = $URL
            Port = $Port
            ResponseTime = 0
            Details = $response
        }
        
        if ($Verbose) { Write-Success " Healthy" }
        return $result
    }
    catch {
        $result = @{
            Name = $Name
            Status = "Unhealthy"
            URL = $URL
            Port = $Port
            ResponseTime = -1
            Error = $_.Exception.Message
        }
        
        if ($Verbose) { Write-Error " Unhealthy - $($_.Exception.Message)" }
        return $result
    }
}

# Service definitions
$services = @{
    "Core Services" = @(
        @{ Name = "CBD Database"; URL = "http://localhost:4180/health"; Port = 4180 }
        @{ Name = "MemorAI MCP Server"; URL = "http://localhost:4950/health"; Port = 4950 }
        @{ Name = "MemorAI App"; URL = "http://localhost:4006/api/health"; Port = 4006 }
        @{ Name = "MemorAI GraphQL"; URL = "http://localhost:4500/health"; Port = 4500 }
        @{ Name = "RomAI AGI Server"; URL = "http://localhost:6101/health"; Port = 6101 }
        @{ Name = "RomAI Enterprise API"; URL = "http://localhost:8001/api/v1/health"; Port = 8001 }
        @{ Name = "RomAI App"; URL = "http://localhost:3000/api/health"; Port = 3000 }
    )
    
    "Applications" = @(
        @{ Name = "BancAI App"; URL = "http://localhost:4005/api/health"; Port = 4005 }
        @{ Name = "ControlAI Dashboard"; URL = "http://localhost:3001/api/health"; Port = 3001 }
        @{ Name = "Hub App"; URL = "http://localhost:3002/api/health"; Port = 3002 }
        @{ Name = "Admin App"; URL = "http://localhost:3003/api/health"; Port = 3003 }
        @{ Name = "ID App"; URL = "http://localhost:3004/api/health"; Port = 3004 }
    )
    
    "Monitoring Stack" = @(
        @{ Name = "Prometheus"; URL = "http://localhost:9091/api/v1/query?query=up"; Port = 9091 }
        @{ Name = "Grafana"; URL = "http://localhost:3002/api/health"; Port = 3002 }
        @{ Name = "AlertManager"; URL = "http://localhost:9093/api/v1/status"; Port = 9093 }
        @{ Name = "Node Exporter"; URL = "http://localhost:9100/metrics"; Port = 9100 }
        @{ Name = "Elasticsearch"; URL = "http://localhost:9201/_cluster/health"; Port = 9201 }
        @{ Name = "Kibana"; URL = "http://localhost:5601/api/status"; Port = 5601 }
        @{ Name = "Jaeger"; URL = "http://localhost:16686/api/services"; Port = 16686 }
    )
    
    "Infrastructure" = @(
        @{ Name = "Redis Cache"; URL = "http://localhost:6380/info"; Port = 6380 }
    )
}

Write-Info "🏥 CODAI Ecosystem - Production Health Check"
Write-Info "============================================="

$allResults = @{}
$totalServices = 0
$healthyServices = 0

foreach ($category in $services.Keys) {
    Write-Info "`n📂 $category"
    Write-Host "   " + ("-" * ($category.Length + 20))
    
    $categoryResults = @()
    
    foreach ($service in $services[$category]) {
        $totalServices++
        $result = Test-ServiceHealth -Name $service.Name -URL $service.URL -Port $service.Port -TimeoutSec $TimeoutSeconds
        
        if ($result.Status -eq "Healthy") {
            $healthyServices++
            if (-not $Verbose) { Write-Success "   $($service.Name) - Healthy" }
        } else {
            if (-not $Verbose) { Write-Error "   $($service.Name) - Unhealthy" }
        }
        
        $categoryResults += $result
    }
    
    $allResults[$category] = $categoryResults
}

# Calculate overall health
$overallHealthPercentage = if ($totalServices -gt 0) { 
    [math]::Round(($healthyServices / $totalServices) * 100, 1) 
} else { 
    0 
}

$healthColor = switch ($overallHealthPercentage) {
    { $_ -ge 90 } { "Green" }
    { $_ -ge 70 } { "Yellow" }
    default { "Red" }
}

Write-Host "`n" + ("=" * 50) -ForegroundColor Cyan
Write-Host "📊 OVERALL HEALTH SUMMARY" -ForegroundColor White -BackgroundColor Blue
Write-Host ("=" * 50) -ForegroundColor Cyan
Write-Host "Health Status: $overallHealthPercentage% ($healthyServices/$totalServices services)" -ForegroundColor $healthColor

# Category breakdown
foreach ($category in $services.Keys) {
    $categoryHealthy = ($allResults[$category] | Where-Object { $_.Status -eq "Healthy" }).Count
    $categoryTotal = $allResults[$category].Count
    $categoryPercentage = if ($categoryTotal -gt 0) { 
        [math]::Round(($categoryHealthy / $categoryTotal) * 100, 1) 
    } else { 
        0 
    }
    
    $categoryColor = switch ($categoryPercentage) {
        { $_ -ge 90 } { "Green" }
        { $_ -ge 70 } { "Yellow" }
        default { "Red" }
    }
    
    Write-Host "  $category`: $categoryPercentage% ($categoryHealthy/$categoryTotal)" -ForegroundColor $categoryColor
}

# Critical alerts
$criticalServices = @()
foreach ($category in $allResults.Keys) {
    $unhealthy = $allResults[$category] | Where-Object { $_.Status -ne "Healthy" }
    $criticalServices += $unhealthy
}

if ($criticalServices.Count -gt 0) {
    Write-Host "`n🚨 CRITICAL ALERTS" -ForegroundColor Red -BackgroundColor Yellow
    foreach ($service in $criticalServices) {
        Write-Error "   $($service.Name) - $($service.Error)"
    }
}

# Recommendations
Write-Host "`n💡 RECOMMENDATIONS" -ForegroundColor Blue
if ($overallHealthPercentage -ge 95) {
    Write-Success "   Excellent! System is production-ready."
} elseif ($overallHealthPercentage -ge 85) {
    Write-Warning "   Good health. Monitor critical services closely."
} elseif ($overallHealthPercentage -ge 70) {
    Write-Warning "   Acceptable health. Address unhealthy services."
} else {
    Write-Error "   Poor health. Immediate attention required."
}

# JSON output if requested
if ($Json) {
    $jsonResult = @{
        timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
        overallHealthPercentage = $overallHealthPercentage
        healthyServices = $healthyServices
        totalServices = $totalServices
        services = $allResults
        criticalAlerts = $criticalServices
    }
    
    Write-Host "`n📄 JSON OUTPUT:" -ForegroundColor Magenta
    $jsonResult | ConvertTo-Json -Depth 5
}

Write-Host "`n🏁 Health check completed at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan

# Exit with appropriate code
exit $(if ($overallHealthPercentage -ge 70) { 0 } else { 1 })