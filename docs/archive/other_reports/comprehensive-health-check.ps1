# CODAI Ecosystem Comprehensive Health Check Script
# Tests all running services and provides detailed status

Write-Host "🎯 CODAI Ecosystem Complete Health Check" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Gray
Write-Host ""

# Backend Services Health Check
Write-Host "🔧 Backend Services:" -ForegroundColor Yellow
$backendServices = @(
    @{ Name = "CBD Database"; Url = "http://localhost:4180/health"; Port = "4180" },
    @{ Name = "API Gateway"; Url = "http://localhost:4000/health"; Port = "4000" },
    @{ Name = "Collaboration"; Url = "http://localhost:4600/health"; Port = "4600" },
    @{ Name = "AI Analytics"; Url = "http://localhost:4700/health"; Port = "4700" },
    @{ Name = "GraphQL Gateway"; Url = "http://localhost:4800/health"; Port = "4800" }
)

foreach ($service in $backendServices) {
    try {
        $response = Invoke-WebRequest -Uri $service.Url -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $($service.Name) ($($service.Port)) - Healthy" -ForegroundColor Green
        } else {
            Write-Host "⚠️ $($service.Name) ($($service.Port)) - Status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ $($service.Name) ($($service.Port)) - Error: $($_.Exception.Message.Split('.')[0])" -ForegroundColor Red
    }
}

Write-Host ""

# Frontend Applications Health Check
Write-Host "🌐 Frontend Applications:" -ForegroundColor Yellow
$frontendServices = @(
    @{ Name = "ID Service"; Url = "http://localhost:4004"; Port = "4004" },
    @{ Name = "Admin Dashboard"; Url = "http://localhost:4007"; Port = "4007" },
    @{ Name = "Hub App"; Url = "http://localhost:4008"; Port = "4008" },
    @{ Name = "RomAI App"; Url = "http://localhost:6100"; Port = "6100" }
)

foreach ($service in $frontendServices) {
    try {
        $response = Invoke-WebRequest -Uri $service.Url -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $($service.Name) ($($service.Port)) - Running" -ForegroundColor Green
        } elseif ($response.StatusCode -eq 500) {
            Write-Host "⚠️ $($service.Name) ($($service.Port)) - App Error (500)" -ForegroundColor Yellow
        } else {
            Write-Host "⚠️ $($service.Name) ($($service.Port)) - Status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ $($service.Name) ($($service.Port)) - Not responding" -ForegroundColor Red
    }
}

Write-Host ""

# Optional Services Check
Write-Host "🔍 Optional Services:" -ForegroundColor Yellow
$optionalServices = @(
    @{ Name = "CODAI Main App"; Url = "http://localhost:4001"; Port = "4001" },
    @{ Name = "MemorAI App"; Url = "http://localhost:4006"; Port = "4006" },
    @{ Name = "BancAI App"; Url = "http://localhost:4005"; Port = "4005" },
    @{ Name = "ControlAI Dashboard"; Url = "http://localhost:4200"; Port = "4200" }
)

foreach ($service in $optionalServices) {
    try {
        $response = Invoke-WebRequest -Uri $service.Url -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ $($service.Name) ($($service.Port)) - Running" -ForegroundColor Green
    } catch {
        Write-Host "⏸️ $($service.Name) ($($service.Port)) - Not started" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "✅ Health Check Complete!" -ForegroundColor Green
Write-Host "📊 Use 'Service Status' task for detailed process information" -ForegroundColor Gray
