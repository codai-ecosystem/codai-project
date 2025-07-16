# Simple Dependency Analysis Tool
# CODAI Ecosystem - AGENT 8

Write-Host "CODAI Ecosystem Dependency Analysis" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

$appsPath = "E:\GitHub\codai-project\apps"
$workingApps = @()
$brokenApps = @()

Write-Host "`nAnalyzing applications..." -ForegroundColor Yellow

$appDirs = Get-ChildItem -Path $appsPath -Directory
foreach ($dir in $appDirs) {
    $appName = $dir.Name
    $appPath = $dir.FullName
    $packageJson = Join-Path $appPath "package.json"
    $nextBinary = Join-Path $appPath "node_modules\next\dist\bin\next"
    
    if (Test-Path $packageJson) {
        if (Test-Path $nextBinary) {
            Write-Host "✅ $appName`: WORKING" -ForegroundColor Green
            $workingApps += $appName
        } else {
            Write-Host "❌ $appName`: BROKEN (missing Next.js binary)" -ForegroundColor Red
            $brokenApps += $appName
        }
    } else {
        Write-Host "🚫 $appName`: NO CONFIG" -ForegroundColor Gray
    }
}

Write-Host "`nSUMMARY:" -ForegroundColor Cyan
Write-Host "Working Apps ($($workingApps.Count)): $($workingApps -join ', ')" -ForegroundColor Green
Write-Host "Broken Apps ($($brokenApps.Count)): $($brokenApps -join ', ')" -ForegroundColor Red
Write-Host "Total Apps: $($appDirs.Count)" -ForegroundColor White

$workingPercentage = [math]::Round(($workingApps.Count / $appDirs.Count) * 100, 1)
Write-Host "Working Percentage: $workingPercentage%" -ForegroundColor $(if($workingPercentage -gt 30) {"Green"} else {"Red"})

Write-Host "`nRecommendation: Focus on repairing broken apps for ecosystem expansion" -ForegroundColor Blue
