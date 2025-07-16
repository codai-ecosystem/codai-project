# CODAI Ecosystem - Dependency Analysis & Repair Tool
# Created by AGENT 8 - Service Integration Specialist
# Date: 2025-07-15

param(
    [switch]$AnalyzeOnly,
    [switch]$RepairAll,
    [string]$TargetApp = "",
    [switch]$Verbose
)

Write-Host "CODAI Ecosystem - Dependency Analysis & Repair Tool" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

function Test-NextJsAvailable {
    param([string]$AppPath)
    
    $nextBinary = Join-Path $AppPath "node_modules\next\dist\bin\next"
    $packageJson = Join-Path $AppPath "package.json"
    
    return @{
        HasPackageJson = Test-Path $packageJson
        HasNextBinary = Test-Path $nextBinary
        HasNodeModules = Test-Path (Join-Path $AppPath "node_modules")
        Path = $AppPath
    }
}

function Get-AppList {
    $appsPath = "E:\GitHub\codai-project\apps"
    $apps = @()
    
    if (Test-Path $appsPath) {
        $appDirs = Get-ChildItem -Path $appsPath -Directory
        foreach ($dir in $appDirs) {
            $appPath = $dir.FullName
            $analysis = Test-NextJsAvailable -AppPath $appPath
            $analysis.Name = $dir.Name
            $apps += $analysis
        }
    }
    
    return $apps
}

function Show-DependencyStatus {
    param([array]$Apps)
    
    Write-Host "`nDependency Status Analysis:" -ForegroundColor Yellow
    Write-Host "===========================" -ForegroundColor Yellow
    
    $workingApps = @()
    $brokenApps = @()
    
    foreach ($app in $Apps) {
        if ($app.HasPackageJson -and $app.HasNextBinary) {
            Write-Host "✅ $($app.Name): WORKING (has Next.js binary)" -ForegroundColor Green
            $workingApps += $app.Name
        } elseif ($app.HasPackageJson -and $app.HasNodeModules) {
            Write-Host "⚠️  $($app.Name): PARTIAL (has node_modules, missing Next.js)" -ForegroundColor Yellow
            $brokenApps += $app.Name
        } elseif ($app.HasPackageJson) {
            Write-Host "❌ $($app.Name): BROKEN (missing node_modules)" -ForegroundColor Red
            $brokenApps += $app.Name
        } else {
            Write-Host "🚫 $($app.Name): NO CONFIG (missing package.json)" -ForegroundColor Gray
        }
    }
    
    Write-Host "`nSUMMARY:" -ForegroundColor Cyan
    Write-Host "Working Apps: $($workingApps.Count) - $($workingApps -join ', ')" -ForegroundColor Green
    Write-Host "Broken Apps: $($brokenApps.Count) - $($brokenApps -join ', ')" -ForegroundColor Red
    Write-Host "Total Apps Analyzed: $($Apps.Count)" -ForegroundColor White
    
    return @{
        Working = $workingApps
        Broken = $brokenApps
        Total = $Apps.Count
    }
}

function Repair-AppDependencies {
    param([string]$AppName)
    
    $appPath = "E:\GitHub\codai-project\apps\$AppName"
    if (-not (Test-Path $appPath)) {
        Write-Host "❌ App '$AppName' not found at $appPath" -ForegroundColor Red
        return $false
    }
    
    Write-Host "`n🔧 Repairing dependencies for $AppName..." -ForegroundColor Yellow
    
    try {
        Set-Location $appPath
        
        # Remove existing node_modules if it exists
        if (Test-Path "node_modules") {
            Write-Host "  📁 Removing existing node_modules..." -ForegroundColor Gray
            Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
        }
        
        # Run pnpm install
        Write-Host "  📦 Running pnpm install..." -ForegroundColor Gray
        $result = Start-Process -FilePath "pnpm" -ArgumentList "install" -Wait -NoNewWindow -PassThru
        
        if ($result.ExitCode -eq 0) {
            # Verify Next.js binary exists
            $verification = Test-NextJsAvailable -AppPath $appPath
            if ($verification.HasNextBinary) {
                Write-Host "  ✅ $AppName dependencies repaired successfully!" -ForegroundColor Green
                return $true
            } else {
                Write-Host "  ⚠️  $AppName installed but Next.js binary missing" -ForegroundColor Yellow
                return $false
            }
        } else {
            Write-Host "  ❌ Failed to install dependencies for $AppName (Exit Code: $($result.ExitCode))" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "  ❌ Error repairing $AppName`: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    } finally {
        Set-Location "E:\GitHub\codai-project"
    }
}

# Main execution
$apps = Get-AppList
$status = Show-DependencyStatus -Apps $apps

if ($AnalyzeOnly) {
    Write-Host "`n📊 Analysis complete. Use -RepairAll or -TargetApp to repair dependencies." -ForegroundColor Blue
} elseif ($RepairAll) {
    Write-Host "`n🔧 Starting repair process for all broken applications..." -ForegroundColor Yellow
    $repairedCount = 0
    foreach ($brokenApp in $status.Broken) {
        if (Repair-AppDependencies -AppName $brokenApp) {
            $repairedCount++
        }
        Start-Sleep -Seconds 2  # Prevent system overload
    }
    Write-Host "`n🎯 Repair Summary: $repairedCount/$($status.Broken.Count) applications repaired" -ForegroundColor Cyan
} elseif ($TargetApp) {
    Repair-AppDependencies -AppName $TargetApp
} else {
    Write-Host "`n💡 Usage Examples:" -ForegroundColor Blue
    Write-Host "  .\dependency-repair.ps1 -AnalyzeOnly" -ForegroundColor Gray
    Write-Host "  .\dependency-repair.ps1 -TargetApp analizai" -ForegroundColor Gray
    Write-Host "  .\dependency-repair.ps1 -RepairAll" -ForegroundColor Gray
}
