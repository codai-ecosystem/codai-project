# Advanced Service Mesh Status
Write-Host "CODAI Advanced Service Mesh Analysis" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

$services = @(
    @{Port=4030; Name="CODAI - Central Platform"; Critical=$true}
    @{Port=4031; Name="MEMORAI - Memory Backbone"; Critical=$true}
    @{Port=4033; Name="BANCAI - Banking Platform"; Critical=$true}
    @{Port=4065; Name="STOCAI - Trading Platform"; Critical=$true}
    @{Port=4076; Name="AIDE - Development Environment"; Critical=$false}
    @{Port=4081; Name="PREZENTAI - Portfolio Platform"; Critical=$false}
)

$healthyCount = 0
$criticalDown = 0

Write-Host "`nService Mesh Status:" -ForegroundColor Yellow
foreach ($service in $services) {
    try {
        $connection = Get-NetTCPConnection -LocalPort $service.Port -ErrorAction SilentlyContinue
        if ($connection -and $connection.State -eq 'Listen') {
            Write-Host "Port $($service.Port): HEALTHY - $($service.Name)" -ForegroundColor Green
            $healthyCount++
        } else {
            if ($service.Critical) {
                Write-Host "Port $($service.Port): CRITICAL DOWN - $($service.Name)" -ForegroundColor Red
                $criticalDown++
            } else {
                Write-Host "Port $($service.Port): DOWN - $($service.Name)" -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Host "Port $($service.Port): ERROR - $($service.Name)" -ForegroundColor Red
    }
}

$healthPercentage = [math]::Round(($healthyCount / $services.Count) * 100, 1)

Write-Host "`nService Mesh Health: $healthyCount/$($services.Count) services ($healthPercentage percent)" -ForegroundColor White

Write-Host "`nInfrastructure Assessment:" -ForegroundColor Blue
if ($criticalDown -eq 0) {
    Write-Host "All critical services operational - mesh integrity STABLE" -ForegroundColor Green
} else {
    Write-Host "$criticalDown critical service(s) down - mesh integrity DEGRADED" -ForegroundColor Yellow
}

Write-Host "`nNext Step Recommendations:" -ForegroundColor Green
if ($healthPercentage -ge 66) {
    Write-Host "EXPANSION READY:" -ForegroundColor Green
    Write-Host "  1. Deploy service coordination layer" -ForegroundColor White
    Write-Host "  2. Implement lightweight API Gateway" -ForegroundColor White
    Write-Host "  3. Begin systematic application integration" -ForegroundColor White
} else {
    Write-Host "OPTIMIZATION FOCUS:" -ForegroundColor Yellow
    Write-Host "  1. Stabilize existing services" -ForegroundColor White
    Write-Host "  2. Recover intermittent services" -ForegroundColor White
    Write-Host "  3. Strengthen service connections" -ForegroundColor White
}
