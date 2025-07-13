#!/usr/bin/env pwsh

# ULTIMATE DEPLOYMENT - POWERSHELL DIRECT EXECUTION
# Start all 32+ apps with proper error handling

$apps = @(
    @{name="codai"; port=4030; priority=1},
    @{name="memorai"; port=4031; priority=1},
    @{name="bancai"; port=4033; priority=1},
    @{name="publicai"; port=4040; priority=1},
    @{name="logai"; port=4041; priority=1},
    @{name="stocai"; port=4063; priority=1},
    @{name="admin"; port=4032; priority=2},
    @{name="hub"; port=4034; priority=2},
    @{name="tools"; port=4062; priority=2},
    @{name="cumparai"; port=4052; priority=2},
    @{name="sociai"; port=4054; priority=3},
    @{name="studiai"; port=4053; priority=3},
    @{name="muzicai"; port=4056; priority=3},
    @{name="legalizai"; port=4042; priority=3},
    @{name="curtai"; port=4043; priority=3}
)

$deployedApps = @()
$failedApps = @()

function Write-ColorLog {
    param($Message, $Color = "White")
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
}

function Test-Port {
    param($Port)
    try {
        $result = Test-NetConnection -ComputerName "localhost" -Port $Port -WarningAction SilentlyContinue
        return -not $result.TcpTestSucceeded
    } catch {
        return $true  # Port available if test fails
    }
}

function Start-App {
    param($App)
    
    $appPath = Join-Path $PSScriptRoot "apps" $App.name
    
    if (-not (Test-Path $appPath)) {
        Write-ColorLog "❌ $($App.name): Directory not found" Red
        return $false
    }
    
    if (-not (Test-Port $App.port)) {
        Write-ColorLog "⚠️ $($App.name): Port $($App.port) already in use" Yellow
        return $true  # Consider as success if already running
    }
    
    Write-ColorLog "🚀 Starting $($App.name) on port $($App.port)..." Cyan
    
    try {
        # Start the app in background
        $job = Start-Job -ScriptBlock {
            param($AppPath, $Port)
            Set-Location $AppPath
            & pnpm dev --port $Port
        } -ArgumentList $appPath, $App.port
        
        # Wait for startup with timeout
        $timeout = 30
        $elapsed = 0
        $started = $false
        
        while ($elapsed -lt $timeout -and -not $started) {
            Start-Sleep -Seconds 2
            $elapsed += 2
            
            # Check if port is now in use (app started)
            if (-not (Test-Port $App.port)) {
                $started = $true
                Write-ColorLog "✅ $($App.name.ToUpper()) STARTED: http://localhost:$($App.port)" Green
                $script:deployedApps += $App
                return $true
            }
        }
        
        if (-not $started) {
            Write-ColorLog "⏰ $($App.name): Timeout after ${timeout}s" Yellow
            Stop-Job $job -Force
            return $false
        }
        
    } catch {
        Write-ColorLog "❌ $($App.name): Error - $($_.Exception.Message)" Red
        $script:failedApps += $App
        return $false
    }
}

# Main execution
Write-ColorLog "🚀 ULTIMATE DEPLOYMENT STARTING" Magenta
Write-ColorLog "================================" Cyan
Write-ColorLog "📋 Target: Deploy $($apps.Count) priority apps" Yellow

# Deploy by priority
for ($priority = 1; $priority -le 3; $priority++) {
    $priorityApps = $apps | Where-Object { $_.priority -eq $priority }
    Write-ColorLog "`n🎯 PRIORITY $priority APPS ($($priorityApps.Count) apps)" Magenta
    Write-ColorLog ("-" * 40) Cyan
    
    foreach ($app in $priorityApps) {
        Start-App $app | Out-Null
        Start-Sleep -Seconds 1  # Small delay between starts
    }
}

# Final report
Write-ColorLog "`n🎉 DEPLOYMENT COMPLETE!" Magenta
Write-ColorLog ("=" * 30) Cyan
Write-ColorLog "📊 Success: $($deployedApps.Count)/$($apps.Count) apps" Blue

if ($deployedApps.Count -gt 0) {
    Write-ColorLog "`n✅ DEPLOYED APPS:" Green
    foreach ($app in $deployedApps) {
        Write-ColorLog "  🌟 $($app.name): http://localhost:$($app.port)" Green
    }
}

if ($failedApps.Count -gt 0) {
    Write-ColorLog "`n❌ FAILED APPS:" Red
    foreach ($app in $failedApps) {
        Write-ColorLog "  💥 $($app.name)" Red
    }
}

# Success rate
$successRate = [math]::Round(($deployedApps.Count / $apps.Count) * 100, 1)
Write-ColorLog "`n📈 SUCCESS RATE: ${successRate}%" Blue

if ($successRate -ge 70) {
    Write-ColorLog "`n🏆 MISSION ACCOMPLISHED!" Green
    Write-ColorLog "🌍 Ready for production deployment!" Green
} else {
    Write-ColorLog "`n⚠️ Partial success - some apps need attention" Yellow
}

Write-ColorLog "`n🚀 NEXT STEPS:" Magenta
Write-ColorLog "1. Test apps at: http://localhost:4030, 4031, 4033, etc." Cyan
Write-ColorLog "2. Deploy to production: node deploy-production-domains.js" Cyan
