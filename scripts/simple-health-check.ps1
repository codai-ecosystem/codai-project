# CODAI Ecosystem - Simple Service Health Check
# Created by AGENT 8 - Service Integration Specialist
# Date: 2025-07-15

Write-Host "CODAI Ecosystem Service Health Monitor" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

$services = @(
    @{Port=4030; Name="CODAI - Central Platform"}
    @{Port=4031; Name="MEMORAI - Memory Backbone"}
    @{Port=4033; Name="BANCAI - Banking Platform"}
    @{Port=4065; Name="STOCAI - Trading Platform"}
    @{Port=4076; Name="AIDE - Development Environment"}
    @{Port=4081; Name="PREZENTAI - Portfolio Platform"}
)

$healthyCount = 0

Write-Host "`nService Status Report - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow

foreach ($service in $services) {
    try {
        $connection = Get-NetTCPConnection -LocalPort $service.Port -ErrorAction SilentlyContinue
        if ($connection -and $connection.State -eq 'Listen') {
            Write-Host "Port $($service.Port): HEALTHY - $($service.Name)" -ForegroundColor Green
            $healthyCount++
        } else {
            Write-Host "Port $($service.Port): DOWN - $($service.Name)" -ForegroundColor Red
        }
    } catch {
        Write-Host "Port $($service.Port): ERROR - $($service.Name)" -ForegroundColor Yellow
    }
}

$healthPercentage = [math]::Round(($healthyCount / $services.Count) * 100, 1)
Write-Host "`nEcosystem Health: $healthyCount/$($services.Count) services ($healthPercentage%)" -ForegroundColor White

if ($healthyCount -ge 2) {
    Write-Host "Service mesh foundation is operational!" -ForegroundColor Green
} else {
    Write-Host "Critical infrastructure needs attention!" -ForegroundColor Red
}
