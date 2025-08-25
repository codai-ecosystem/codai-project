#!/usr/bin/env pwsh
# AGI Monitoring Validation Script

$services = @(
    @{ Name = "Prometheus"; URL = "http://localhost:9091/api/v1/query?query=up"; Port = 9091 },
    @{ Name = "Grafana"; URL = "http://localhost:3002/api/health"; Port = 3002 },
    @{ Name = "AlertManager"; URL = "http://localhost:9093/api/v1/status"; Port = 9093 },
    @{ Name = "AGI Model Server"; URL = "http://localhost:6101/health"; Port = 6101 },
    @{ Name = "Node Exporter"; URL = "http://localhost:9100/metrics"; Port = 9100 }
)

$healthyCount = 0
foreach ($service in $services) {
    Write-Host "Checking $($service.Name)..." -NoNewline
    try {
        $response = Invoke-RestMethod -Uri $service.URL -Method Get -TimeoutSec 5
        Write-Host " ✅ Healthy" -ForegroundColor Green
        $healthyCount++
    }
    catch {
        Write-Host " ❌ Unhealthy" -ForegroundColor Red
    }
}

$healthPercentage = ($healthyCount / $services.Count) * 100
Write-Host ""
Write-Host "Monitoring Health: $([math]::Round($healthPercentage, 1))% ($healthyCount/$($services.Count) services)" -ForegroundColor Cyan 
