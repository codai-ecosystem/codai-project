#!/usr/bin/env pwsh
# CODAI Docker Services Health Test

$services = @(
    @{ Name = "PostgreSQL Database"; Url = "http://localhost:5432"; Note = "Not HTTP endpoint - use docker exec" }
    @{ Name = "Redis Cache"; Url = "http://localhost:4020"; Note = "Not HTTP endpoint - use docker exec" }
    @{ Name = "CODAI Gateway"; Url = "http://localhost:4010/api/health"; Port = 4010 }
    @{ Name = "PostgreSQL (Direct)"; Command = "docker exec codai-postgres pg_isready -U codai_user -d codai_ecosystem" }
    @{ Name = "Redis (Direct)"; Command = "docker exec codai-redis redis-cli ping" }
)

Write-Host "🔍 CODAI Docker Services Health Check" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Gray

$results = @()

foreach ($service in $services) {
    Write-Host ""
    Write-Host "Testing $($service.Name)..." -ForegroundColor Yellow
    
    if ($service.Command) {
        try {
            $result = Invoke-Expression $service.Command
            if ($result -match "accepting connections|PONG") {
                Write-Host "✅ $($service.Name): HEALTHY" -ForegroundColor Green
                Write-Host "   Result: $result" -ForegroundColor White
                $results += @{ Service = $service.Name; Status = "HEALTHY"; Result = $result }
            } else {
                Write-Host "⚠️  $($service.Name): UNKNOWN" -ForegroundColor Yellow
                Write-Host "   Result: $result" -ForegroundColor White
                $results += @{ Service = $service.Name; Status = "UNKNOWN"; Result = $result }
            }
        } catch {
            Write-Host "❌ $($service.Name): FAILED" -ForegroundColor Red
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
            $results += @{ Service = $service.Name; Status = "FAILED"; Error = $_.Exception.Message }
        }
    } elseif ($service.Url -and -not $service.Note.StartsWith("Not HTTP")) {
        try {
            $response = Invoke-RestMethod -Uri $service.Url -Method Get -TimeoutSec 10
            Write-Host "✅ $($service.Name): HEALTHY" -ForegroundColor Green
            Write-Host "   Service: $($response.service)" -ForegroundColor White
            Write-Host "   Status: $($response.status)" -ForegroundColor White
            if ($response.version) { Write-Host "   Version: $($response.version)" -ForegroundColor White }
            if ($response.port) { Write-Host "   Port: $($response.port)" -ForegroundColor White }
            $results += @{ Service = $service.Name; Status = "HEALTHY"; Response = $response }
        } catch {
            Write-Host "❌ $($service.Name): FAILED" -ForegroundColor Red
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
            $results += @{ Service = $service.Name; Status = "FAILED"; Error = $_.Exception.Message }
        }
    } else {
        Write-Host "ℹ️  $($service.Name): $($service.Note)" -ForegroundColor Cyan
        $results += @{ Service = $service.Name; Status = "INFO"; Note = $service.Note }
    }
}

Write-Host ""
Write-Host "📊 Summary" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Gray

$healthyCount = ($results | Where-Object { $_.Status -eq "HEALTHY" }).Count
$failedCount = ($results | Where-Object { $_.Status -eq "FAILED" }).Count
$totalCount = $results.Count

Write-Host "Total Services: $totalCount" -ForegroundColor White
Write-Host "Healthy: $healthyCount" -ForegroundColor Green
Write-Host "Failed: $failedCount" -ForegroundColor Red
Write-Host "Success Rate: $([math]::Round(($healthyCount / ($totalCount - ($results | Where-Object { $_.Status -eq "INFO" }).Count)) * 100, 1))%" -ForegroundColor $(if ($healthyCount -eq ($totalCount - ($results | Where-Object { $_.Status -eq "INFO" }).Count)) { "Green" } else { "Yellow" })

Write-Host ""
Write-Host "🐳 Docker Container Status" -ForegroundColor Cyan
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Out-String | Write-Host

Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Fix Next.js workspace dependencies for ID, Hub, BancAI services" -ForegroundColor Yellow
Write-Host "2. Deploy remaining CODAI ecosystem services" -ForegroundColor Yellow
Write-Host "3. Configure Nginx reverse proxy" -ForegroundColor Yellow