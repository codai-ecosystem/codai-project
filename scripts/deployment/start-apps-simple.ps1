# SIMPLE APP STARTER
# Start apps one by one with proper checks

Write-Host "🚀 STARTING PRIORITY APPS" -ForegroundColor Magenta
Write-Host "=========================" -ForegroundColor Cyan

$apps = @(
    @{name="stocai"; port=4063},
    @{name="codai"; port=4030},
    @{name="memorai"; port=4031},
    @{name="bancai"; port=4033}
)

$started = @()

foreach ($app in $apps) {
    Write-Host "🔄 Starting $($app.name) on port $($app.port)..." -ForegroundColor Yellow
    
    $appPath = ".\apps\$($app.name)"
    
    if (Test-Path $appPath) {
        try {
            # Start in new PowerShell window
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$appPath'; pnpm dev --port $($app.port)" -WindowStyle Minimized
            
            Write-Host "✅ $($app.name) started in background" -ForegroundColor Green
            $started += @{name=$app.name; port=$app.port}
            
            Start-Sleep -Seconds 3
        }
        catch {
            Write-Host "❌ Failed to start $($app.name): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    else {
        Write-Host "❌ Directory not found: $appPath" -ForegroundColor Red
    }
}

Write-Host "`n🎉 STARTUP COMPLETE!" -ForegroundColor Magenta
Write-Host "==================" -ForegroundColor Cyan

if ($started.Count -gt 0) {
    Write-Host "`n✅ STARTED APPS:" -ForegroundColor Green
    foreach ($app in $started) {
        Write-Host "  🌟 $($app.name): http://localhost:$($app.port)" -ForegroundColor Green
    }
    
    Write-Host "`n🎯 TEST YOUR BEAUTIFUL UI NOW!" -ForegroundColor Magenta
    Write-Host "Wait 30-60 seconds for apps to fully load..." -ForegroundColor Yellow
}

Write-Host "`n📊 Started: $($started.Count)/$($apps.Count) apps" -ForegroundColor Blue
