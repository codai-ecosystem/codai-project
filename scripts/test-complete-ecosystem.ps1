#!/usr/bin/env pwsh
# CODAI Complete Ecosystem Health Check

$services = @(
    @{ Name = "CODAI Gateway"; Url = "http://localhost:4010/api/health"; Port = 4010; Container = "codai-gateway" }
    @{ Name = "CODAI ID Service"; Url = "http://localhost:4100/api/health"; Port = 4100; Container = "codai-id-service" }
    @{ Name = "CODAI Hub Service"; Url = "http://localhost:4110/api/health"; Port = 4110; Container = "codai-hub-service" }
    @{ Name = "BancAI Service"; Url = "http://localhost:4120/api/health"; Port = 4120; Container = "codai-bancai-service" }
)

Write-Host "🚀 CODAI Complete Ecosystem Health Check" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

$results = @()

foreach ($service in $services) {
    Write-Host ""
    Write-Host "Testing $($service.Name) (Port $($service.Port))..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri $service.Url -Method Get -TimeoutSec 10
        Write-Host "✅ $($service.Name): HEALTHY" -ForegroundColor Green
        Write-Host "   Service: $($response.service)" -ForegroundColor White
        Write-Host "   Status: $($response.status)" -ForegroundColor White
        Write-Host "   Version: $($response.version)" -ForegroundColor White
        Write-Host "   Container: $($service.Container)" -ForegroundColor Gray
        
        if ($response.features) {
            Write-Host "   Features:" -ForegroundColor Cyan
            $response.features.PSObject.Properties | ForEach-Object {
                Write-Host "     $($_.Name): $($_.Value)" -ForegroundColor White
            }
        }
        
        if ($response.bankingOperations) {
            Write-Host "   Banking Operations:" -ForegroundColor Cyan
            $response.bankingOperations.PSObject.Properties | ForEach-Object {
                Write-Host "     $($_.Name): $($_.Value)" -ForegroundColor White
            }
        }
        
        $results += @{ Service = $service.Name; Status = "HEALTHY"; Response = $response; Port = $service.Port }
    } catch {
        Write-Host "❌ $($service.Name): FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
        $results += @{ Service = $service.Name; Status = "FAILED"; Error = $_.Exception.Message; Port = $service.Port }
    }
}

Write-Host ""
Write-Host "🏗️ Infrastructure Services" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

$infraServices = @(
    @{ Name = "PostgreSQL"; Command = "docker exec codai-postgres pg_isready -U codai_user -d codai_ecosystem" }
    @{ Name = "Redis"; Command = "docker exec codai-redis redis-cli ping" }
)

foreach ($infra in $infraServices) {
    Write-Host ""
    Write-Host "Testing $($infra.Name)..." -ForegroundColor Yellow
    
    try {
        $result = Invoke-Expression $infra.Command
        if ($result -match "accepting connections|PONG") {
            Write-Host "✅ $($infra.Name): HEALTHY" -ForegroundColor Green
            Write-Host "   Result: $result" -ForegroundColor White
            $results += @{ Service = $infra.Name; Status = "HEALTHY"; Result = $result }
        } else {
            Write-Host "⚠️  $($infra.Name): UNKNOWN" -ForegroundColor Yellow
            Write-Host "   Result: $result" -ForegroundColor White
            $results += @{ Service = $infra.Name; Status = "UNKNOWN"; Result = $result }
        }
    } catch {
        Write-Host "❌ $($infra.Name): FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
        $results += @{ Service = $infra.Name; Status = "FAILED"; Error = $_.Exception.Message }
    }
}

Write-Host ""
Write-Host "📊 Summary" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

$healthyCount = ($results | Where-Object { $_.Status -eq "HEALTHY" }).Count
$failedCount = ($results | Where-Object { $_.Status -eq "FAILED" }).Count
$totalCount = $results.Count

Write-Host "Total Services: $totalCount" -ForegroundColor White
Write-Host "Healthy: $healthyCount" -ForegroundColor Green
Write-Host "Failed: $failedCount" -ForegroundColor Red
Write-Host "Success Rate: $([math]::Round(($healthyCount / $totalCount) * 100, 1))%" -ForegroundColor $(if ($healthyCount -eq $totalCount) { "Green" } else { "Yellow" })

Write-Host ""
Write-Host "🌐 Service Endpoints" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "Gateway:    http://localhost:4010/api/health" -ForegroundColor White
Write-Host "ID Service: http://localhost:4100/api/health" -ForegroundColor White
Write-Host "Hub Service: http://localhost:4110/api/health" -ForegroundColor White
Write-Host "BancAI:     http://localhost:4120/api/health" -ForegroundColor White

Write-Host ""
Write-Host "🐳 Docker Container Status" -ForegroundColor Cyan
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Out-String | Write-Host

Write-Host ""
if ($healthyCount -eq $totalCount) {
    Write-Host "🎉 CODAI Ecosystem: FULLY OPERATIONAL" -ForegroundColor Green
    Write-Host "All services are healthy and ready for use!" -ForegroundColor Green
} else {
    Write-Host "⚠️  CODAI Ecosystem: PARTIALLY OPERATIONAL" -ForegroundColor Yellow
    Write-Host "Some services need attention." -ForegroundColor Yellow
}