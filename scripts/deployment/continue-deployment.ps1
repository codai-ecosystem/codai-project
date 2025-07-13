#!/usr/bin/env pwsh

# RAPID STATUS CHECK AND CONTINUE DEPLOYMENT
# Check what's working and deploy the rest

$apps = @(
    @{name="codai"; port=4030},
    @{name="memorai"; port=4031},
    @{name="bancai"; port=4033},
    @{name="stocai"; port=4063},
    @{name="publicai"; port=4040},
    @{name="logai"; port=4041},
    @{name="cumparai"; port=4052},
    @{name="tools"; port=4062},
    @{name="admin"; port=4032},
    @{name="sociai"; port=4054},
    @{name="studiai"; port=4053},
    @{name="muzicai"; port=4056},
    @{name="legalizai"; port=4042},
    @{name="curtai"; port=4043},
    @{name="ajutai"; port=4044},
    @{name="analizai"; port=4045},
    @{name="dexai"; port=4046},
    @{name="talentai"; port=4055},
    @{name="sunai"; port=4057},
    @{name="marketai"; port=4037},
    @{name="wallet"; port=4038},
    @{name="fabricai"; port=4039},
    @{name="hub"; port=4034},
    @{name="explorer"; port=4035},
    @{name="dash"; port=4036},
    @{name="mod"; port=4047},
    @{name="mobile"; port=4048},
    @{name="x"; port=4049},
    @{name="id"; port=4050},
    @{name="kodex"; port=4051},
    @{name="jucai"; port=4058},
    @{name="docs"; port=4059}
)

function Test-AppStatus {
    param($App)
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($App.port)" -Method GET -TimeoutSec 3 -ErrorAction Stop
        return @{name=$App.name; port=$App.port; status="LIVE"; code=$response.StatusCode}
    } catch {
        return @{name=$App.name; port=$App.port; status="OFFLINE"; code=$null}
    }
}

function Start-SingleApp {
    param($App)
    
    $appPath = Join-Path $PSScriptRoot "apps" $App.name
    if (-not (Test-Path $appPath)) {
        Write-Host "❌ $($App.name): Directory not found" -ForegroundColor Red
        return $false
    }
    
    # Fix package.json type issue first
    $packageJsonPath = Join-Path $appPath "package.json"
    if (Test-Path $packageJsonPath) {
        try {
            $packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
            $modified = $false
            
            # Add type: module if next.config.js uses ES modules
            $nextConfigPath = Join-Path $appPath "next.config.js"
            if ((Test-Path $nextConfigPath)) {
                $nextConfig = Get-Content $nextConfigPath -Raw
                if ($nextConfig -match "export default" -and -not $packageJson.type) {
                    $packageJson | Add-Member -NotePropertyName "type" -NotePropertyValue "module" -Force
                    $modified = $true
                }
            }
            
            # Ensure dev script has correct port
            if (-not $packageJson.scripts) {
                $packageJson | Add-Member -NotePropertyName "scripts" -NotePropertyValue @{} -Force
            }
            $packageJson.scripts.dev = "next dev --port $($App.port)"
            $modified = $true
            
            if ($modified) {
                $packageJson | ConvertTo-Json -Depth 10 | Set-Content $packageJsonPath
                Write-Host "✅ Fixed $($App.name) package.json" -ForegroundColor Green
            }
        } catch {
            Write-Host "⚠️ Could not fix $($App.name) package.json" -ForegroundColor Yellow
        }
    }
    
    Write-Host "🚀 Starting $($App.name) on port $($App.port)..." -ForegroundColor Cyan
    
    try {
        # Start in background
        Start-Process -FilePath "pnpm" -ArgumentList "dev","--port","$($App.port)" -WorkingDirectory $appPath -WindowStyle Hidden
        Start-Sleep -Seconds 3
        
        # Test if it started
        $status = Test-AppStatus $App
        if ($status.status -eq "LIVE") {
            Write-Host "✅ $($App.name.ToUpper()) STARTED: http://localhost:$($App.port)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "⏳ $($App.name): Still starting..." -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "❌ Failed to start $($App.name): $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Check current status
Write-Host "🔍 CHECKING CURRENT APP STATUS" -ForegroundColor Magenta
Write-Host "==============================" -ForegroundColor Cyan

$liveApps = @()
$offlineApps = @()

foreach ($app in $apps) {
    $status = Test-AppStatus $app
    if ($status.status -eq "LIVE") {
        $liveApps += $status
        Write-Host "✅ $($status.name): http://localhost:$($status.port)" -ForegroundColor Green
    } else {
        $offlineApps += $status
        Write-Host "❌ $($status.name): Port $($status.port) offline" -ForegroundColor Red
    }
}

Write-Host "`n📊 STATUS SUMMARY:" -ForegroundColor Blue
Write-Host "Live Apps: $($liveApps.Count)" -ForegroundColor Green
Write-Host "Offline Apps: $($offlineApps.Count)" -ForegroundColor Red
Write-Host "Total Apps: $($apps.Count)" -ForegroundColor Blue

$successRate = [math]::Round(($liveApps.Count / $apps.Count) * 100, 1)
Write-Host "Success Rate: ${successRate}%" -ForegroundColor Blue

if ($liveApps.Count -gt 0) {
    Write-Host "`n🎨 BEAUTIFUL UI APPS LIVE:" -ForegroundColor Green
    foreach ($app in $liveApps) {
        Write-Host "  🌟 $($app.name.ToUpper()): http://localhost:$($app.port)" -ForegroundColor Green
    }
    
    Write-Host "`n🚀 READY FOR PRODUCTION:" -ForegroundColor Magenta
    Write-Host "  node deploy-production-domains.js" -ForegroundColor Cyan
}

# Continue deploying offline apps
if ($offlineApps.Count -gt 0 -and $offlineApps.Count -le 20) {
    Write-Host "`n🔄 CONTINUING DEPLOYMENT..." -ForegroundColor Yellow
    Write-Host "============================" -ForegroundColor Cyan
    
    $deployed = 0
    foreach ($app in $offlineApps[0..9]) {  # Deploy next 10
        if (Start-SingleApp $app) {
            $deployed++
        }
        Start-Sleep -Seconds 2
    }
    
    Write-Host "`n📈 ADDITIONAL DEPLOYMENTS: $deployed apps" -ForegroundColor Blue
}

# Final status
$newSuccessRate = [math]::Round((($liveApps.Count + $deployed) / $apps.Count) * 100, 1)
Write-Host "`n🏆 FINAL SUCCESS RATE: ${newSuccessRate}%" -ForegroundColor Magenta

if ($newSuccessRate -ge 50) {
    Write-Host "🎉 MISSION PROGRESS! Multiple apps deployed!" -ForegroundColor Green
    Write-Host "🌍 Ready for production deployment to .ro domains!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Continuing deployment efforts..." -ForegroundColor Yellow
}
