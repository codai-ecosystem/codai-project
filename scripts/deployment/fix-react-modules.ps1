# Batch Service Deployment Fix Script
# This script systematically fixes React module issues for all services

Write-Host "🔧 REACT MODULE FIX - BATCH DEPLOYMENT" -ForegroundColor Green

$problematicServices = @("cumparai", "legalizai", "fabricai", "bancai")

foreach ($service in $problematicServices) {
    Write-Host "`n🎯 FIXING: $service" -ForegroundColor Cyan
    
    $appPath = "e:\GitHub\codai-project\apps\$service"
    
    if (Test-Path $appPath) {
        Set-Location $appPath
        
        # Clean node_modules
        Write-Host "🗑️ Cleaning node_modules..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
        Remove-Item package-lock.json -ErrorAction SilentlyContinue
        
        # Fresh install with local modules
        Write-Host "📦 Installing fresh dependencies..." -ForegroundColor Yellow
        npm install --force
        
        # Start service
        $port = switch ($service) {
            "cumparai" { 4034 }
            "legalizai" { 4035 }
            "fabricai" { 4036 }
            "bancai" { 4033 }
        }
        
        Write-Host "🚀 Starting $service on port $port..." -ForegroundColor Green
        Start-Process powershell -ArgumentList "-Command", "cd '$appPath'; npx next dev --port $port" -WindowStyle Minimized
        Start-Sleep 2
        
        # Quick verification
        try {
            $connection = Get-NetTCPConnection | Where-Object {$_.LocalPort -eq $port} | Select-Object -First 1
            if ($connection) {
                Write-Host "✅ $service successfully bound to port $port" -ForegroundColor Green
            } else {
                Write-Host "⚠️ $service port binding pending..." -ForegroundColor Yellow
            }
        } catch {
            Write-Host "⚠️ $service verification pending..." -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ $service directory not found" -ForegroundColor Red
    }
}

Write-Host "`n📊 CHECKING OVERALL STATUS..." -ForegroundColor Magenta

Start-Sleep 5

# Check all target ports
$allPorts = @(4030,4031,4032,4033,4034,4035,4036,4037)
$activePorts = Get-NetTCPConnection | Where-Object {$_.LocalPort -in $allPorts -and $_.State -eq "Listen"} | Select-Object LocalPort | Sort-Object LocalPort

Write-Host "`n🎉 ACTIVE SERVICES:" -ForegroundColor Green
$serviceMappings = @{
    4030 = "CodAI"
    4031 = "MemorAI" 
    4032 = "AnalizAI"
    4033 = "BancAI"
    4034 = "CumparAI"
    4035 = "LegalizAI"
    4036 = "FabricAI"
    4037 = "StudiAI"
}

$activeCount = 0
foreach ($port in $activePorts) {
    $serviceName = $serviceMappings[$port.LocalPort]
    Write-Host "✅ $serviceName (Port: $($port.LocalPort))" -ForegroundColor Green
    $activeCount++
}

$totalServices = 29
$coveragePercent = [math]::Round(($activeCount / $totalServices) * 100, 2)

Write-Host "`n📈 DEPLOYMENT METRICS:" -ForegroundColor Cyan
Write-Host "Active Services: $activeCount/$totalServices" -ForegroundColor Yellow
Write-Host "Coverage: $coveragePercent%" -ForegroundColor Yellow
Write-Host "Phase 1 Target: 20% (6 services)" -ForegroundColor Yellow

if ($activeCount -ge 6) {
    Write-Host "`n🎯 PHASE 1 TARGET ACHIEVED!" -ForegroundColor Green
    Write-Host "Ready to proceed to Phase 2: App Activation" -ForegroundColor Green
} else {
    Write-Host "`n🔧 Continue deployment for remaining services..." -ForegroundColor Yellow
}

Set-Location "e:\GitHub\codai-project"
