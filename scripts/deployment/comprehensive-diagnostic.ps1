# COMPREHENSIVE DIAGNOSTIC AND COMPLETION PUSH
Write-Host "🎯 COMPREHENSIVE DIAGNOSTIC: Pushing toward 100% completion..." -ForegroundColor Magenta

# Get current status
$services = Get-NetTCPConnection | Where-Object {$_.LocalPort -ge 4000 -and $_.LocalPort -le 5000 -and $_.State -eq 'Listen'}
$currentCount = $services.Count
$activePorts = $services | Sort-Object LocalPort | Select-Object -ExpandProperty LocalPort

Write-Host "📊 CURRENT STATUS:" -ForegroundColor Yellow
Write-Host "   ✅ Services Online: $currentCount" -ForegroundColor Green
Write-Host "   📈 Progress: $([math]::Round(($currentCount / 35) * 100, 1))%" -ForegroundColor Cyan

Write-Host ""
Write-Host "🌐 ACTIVE SERVICES:" -ForegroundColor White
$activePorts | ForEach-Object {
    Write-Host "   ✅ Port $_" -ForegroundColor Green
}

# Define all expected services
$allExpected = @(4030,4031,4032,4033,4034,4035,4036,4037,4038,4039,4040,4041,4042,4043,4044,4045,4046,4047,4048,4049,4050,4051,4052,4053,4054,4055,4056,4057,4058,4059,4060,4061,4997,4998,4999)
$missing = $allExpected | Where-Object {$_ -notin $activePorts}

Write-Host ""
Write-Host "🔍 MISSING SERVICES ($($missing.Count)):" -ForegroundColor Red
$missing | ForEach-Object {
    Write-Host "   ❌ Port $_" -ForegroundColor Red
}

# Strategic restart of critical missing services
if ($missing.Count -gt 0) {
    Write-Host ""
    Write-Host "🚀 STRATEGIC RESTART: Launching missing services..." -ForegroundColor Yellow
    
    $restartApps = @()
    foreach ($port in $missing) {
        switch ($port) {
            4035 { $restartApps += @{name="codai"; port=4035} }
            4043 { $restartApps += @{name="kodex"; port=4043} }
            4045 { $restartApps += @{name="logai"; port=4045} }
            4047 { $restartApps += @{name="memorai"; port=4047} }
            4048 { $restartApps += @{name="mod"; port=4048} }
            4049 { $restartApps += @{name="publicai"; port=4049} }
            4050 { $restartApps += @{name="sociai"; port=4050} }
            4052 { $restartApps += @{name="studiai"; port=4052} }
            4053 { $restartApps += @{name="tools"; port=4053} }
            4054 { $restartApps += @{name="wallet"; port=4054} }
            4055 { $restartApps += @{name="x"; port=4055} }
            4056 { $restartApps += @{name="mobile"; port=4056} }
            4057 { $restartApps += @{name="muzicai"; port=4057} }
            4058 { $restartApps += @{name="acasai"; port=4058} }
            4059 { $restartApps += @{name="curtai"; port=4059} }
            4060 { $restartApps += @{name="dexai"; port=4060} }
            4061 { $restartApps += @{name="jucai"; port=4061} }
        }
    }
    
    $count = 0
    foreach ($app in $restartApps) {
        $count++
        Write-Host "   ⚡ [$count/$($restartApps.Count)] $($app.name) → Port $($app.port)" -ForegroundColor Cyan
        $cmd = "cd e:\GitHub\codai-project\apps\$($app.name) && npx next dev --port $($app.port)"
        Start-Process pwsh.exe -ArgumentList "-Command", $cmd -WindowStyle Hidden
        Start-Sleep 1
    }
}

Write-Host ""
Write-Host "💪 RELENTLESS COMMITMENT: Continuing until 100%!" -ForegroundColor Red
Write-Host "🎯 TARGET: Push from $currentCount to 35+ services" -ForegroundColor Magenta
