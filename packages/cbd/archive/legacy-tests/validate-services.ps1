# CBD Service Validation Script

Write-Host "🌐 CBD Universal Database - Service Validation" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Test 1: Standard CBD Service Health
Write-Host ""
Write-Host "1️⃣ Testing Standard CBD Service (localhost:4180)..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:4180/health" -Method Get -TimeoutSec 10
    Write-Host "   ✅ Service Health: OK" -ForegroundColor Green
    Write-Host "   📊 Status: $($health.status)" -ForegroundColor Cyan
    Write-Host "   📦 Service: $($health.service)" -ForegroundColor Cyan
    Write-Host "   🔢 Version: $($health.version)" -ForegroundColor Cyan
    Write-Host "   🏛️ Paradigms: $($health.paradigms)" -ForegroundColor Cyan
    Write-Host "   ⏱️ Uptime: $($health.uptime) seconds" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Standard CBD Service: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Standard CBD Stats
Write-Host ""
Write-Host "2️⃣ Testing Standard CBD Statistics..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "http://localhost:4180/stats" -Method Get -TimeoutSec 10
    Write-Host "   ✅ Statistics Retrieved" -ForegroundColor Green
    Write-Host "   📊 Total Requests: $($stats.totalRequests)" -ForegroundColor Cyan
    Write-Host "   ⚡ Average Response Time: $($stats.averageResponseTime)ms" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Statistics: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Cloud-Enhanced Service (port 8002)
Write-Host ""
Write-Host "3️⃣ Testing Cloud-Enhanced Service (localhost:8002)..." -ForegroundColor Yellow
try {
    $cloudHealth = Invoke-RestMethod -Uri "http://localhost:8002/health" -Method Get -TimeoutSec 10
    Write-Host "   ✅ Cloud-Enhanced Service: OK" -ForegroundColor Green
    Write-Host "   📊 Status: $($cloudHealth.status)" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Cloud-Enhanced Service: Not Running or Failed" -ForegroundColor Red
}

# Test 4: Check Running Services
Write-Host ""
Write-Host "4️⃣ Checking Running Services..." -ForegroundColor Yellow
$listeningPorts = netstat -ano | Select-String "LISTENING" | Select-String "4180|8002"
if ($listeningPorts) {
    Write-Host "   ✅ Found listening services:" -ForegroundColor Green
    $listeningPorts | ForEach-Object { Write-Host "   📡 $_" -ForegroundColor Cyan }
} else {
    Write-Host "   ❌ No services found on expected ports" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Validation Complete!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
