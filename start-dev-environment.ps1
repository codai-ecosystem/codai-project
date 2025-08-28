#!/usr/bin/env pwsh
<#
.SYNOPSIS
    CodAI Services Development Startup Script
#>

Write-Host "🚀 Starting CodAI Development Environment..." -ForegroundColor Cyan

$services = @(
    @{Name="Identity API"; Path="./services/identity-api"; Port=8102; Command="npx nodemon"; Color="Blue"},
    @{Name="API Gateway"; Path="./services/api-gateway"; Port=8010; Command="npx nodemon"; Color="Green"},
    @{Name="Hub API"; Path="./services/hub-api"; Port=8110; Command="npx nodemon"; Color="Yellow"},
    @{Name="BancAI Service"; Path="./services/bancai-service"; Port=8120; Command="npx nodemon"; Color="Magenta"},
    @{Name="CBD Database Service"; Path="./services/cbd-database"; Port=8180; Command="npx nodemon"; Color="Cyan"},
    @{Name="Dashboard App"; Path="./apps/codai-dashboard"; Port=4250; Command="pnpm dev"; Color="White"}
)

foreach ($service in $services) {
    Write-Host "🔧 Starting $($service.Name) on port $($service.Port)..." -ForegroundColor $service.Color
    if (Test-Path $service.Path) {
        Set-Location $service.Path
        Start-Process -FilePath "pwsh" -ArgumentList "-ExecutionPolicy", "Bypass", "-Command", "$($service.Command)" -WindowStyle Minimized
        Set-Location (Split-Path (Split-Path $service.Path -Parent) -Parent)
        Write-Host "  ✅ $($service.Name) started" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Path not found: $($service.Path)" -ForegroundColor Red
    }
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "🎉 All development services started!" -ForegroundColor Green
Write-Host "🌐 Access points:" -ForegroundColor Yellow
Write-Host "  • Identity API: http://localhost:8102/api/health" -ForegroundColor White
Write-Host "  • API Gateway: http://localhost:8010/api/health" -ForegroundColor White
Write-Host "  • Hub API: http://localhost:8110/api/health" -ForegroundColor White
Write-Host "  • BancAI Service: http://localhost:8120/api/health" -ForegroundColor White
Write-Host "  • CBD Database: http://localhost:8180/health" -ForegroundColor White
Write-Host "  • Dashboard: http://localhost:4250" -ForegroundColor White
