# PowerShell Health Check for Codai Ecosystem
$apps = @(
    @{name="codai"; port=4030; priority="CRITICAL"},
    @{name="memorai"; port=4031; priority="CRITICAL"},
    @{name="analizai"; port=4032; priority="HIGH"},
    @{name="bancai"; port=4033; priority="CRITICAL"},
    @{name="wallet"; port=4034; priority="HIGH"},
    @{name="legalizai"; port=4035; priority="MEDIUM"},
    @{name="fabricai"; port=4036; priority="HIGH"},
    @{name="studiai"; port=4037; priority="HIGH"},
    @{name="marketai"; port=4038; priority="HIGH"},
    @{name="x"; port=4039; priority="HIGH"},
    @{name="publicai"; port=4040; priority="HIGH"},
    @{name="admin"; port=4041; priority="HIGH"},
    @{name="aide"; port=4042; priority="CRITICAL"},
    @{name="ajutai"; port=4043; priority="HIGH"},
    @{name="dash"; port=4044; priority="MEDIUM"},
    @{name="docs"; port=4045; priority="MEDIUM"},
    @{name="explorer"; port=4046; priority="MEDIUM"},
    @{name="id"; port=4047; priority="HIGH"},
    @{name="hub"; port=4048; priority="MEDIUM"},
    @{name="kodex"; port=4049; priority="HIGH"},
    @{name="cumparai"; port=4061; priority="HIGH"},
    @{name="sociai"; port=4062; priority="MEDIUM"},
    @{name="stocai"; port=4063; priority="HIGH"}
)

Write-Host "🔍 CODAI ECOSYSTEM HEALTH CHECK" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

$results = @()

foreach ($app in $apps) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($app.port)" -Method GET -TimeoutSec 3 -ErrorAction Stop
        $status = "RUNNING"
        $message = "✅ $($app.name) is running on port $($app.port)"
        Write-Host $message -ForegroundColor Green
    }
    catch {
        $status = "NOT_RUNNING"
        $message = "❌ $($app.name) is not running on port $($app.port)"
        Write-Host $message -ForegroundColor Red
    }
    
    $results += @{
        name = $app.name
        port = $app.port
        priority = $app.priority
        status = $status
    }
}

Write-Host "`n📊 SUMMARY BY PRIORITY:" -ForegroundColor Yellow
Write-Host "========================" -ForegroundColor Yellow

$priorities = @("CRITICAL", "HIGH", "MEDIUM", "LOW")
$totalRunning = 0
$totalApps = 0

foreach ($priority in $priorities) {
    $priorityApps = $results | Where-Object { $_.priority -eq $priority }
    $running = ($priorityApps | Where-Object { $_.status -eq "RUNNING" }).Count
    $total = $priorityApps.Count
    $percentage = if ($total -gt 0) { [math]::Round(($running / $total) * 100) } else { 0 }
    
    $totalRunning += $running
    $totalApps += $total
    
    Write-Host "$priority`: $running/$total running ($percentage%)" -ForegroundColor White
}

$overallPercentage = if ($totalApps -gt 0) { [math]::Round(($totalRunning / $totalApps) * 100) } else { 0 }
Write-Host "`n🎯 OVERALL HEALTH: $totalRunning/$totalApps apps running ($overallPercentage%)" -ForegroundColor Magenta

$runningApps = $results | Where-Object { $_.status -eq "RUNNING" }
if ($runningApps.Count -gt 0) {
    Write-Host "`n✅ RUNNING APPS:" -ForegroundColor Green
    foreach ($app in $runningApps) {
        Write-Host "   • $($app.name) ($($app.priority)) - http://localhost:$($app.port)" -ForegroundColor Green
    }
}

$criticalDown = $results | Where-Object { $_.priority -eq "CRITICAL" -and $_.status -ne "RUNNING" }
if ($criticalDown.Count -gt 0) {
    Write-Host "`n🚨 CRITICAL APPS DOWN:" -ForegroundColor Red
    foreach ($app in $criticalDown) {
        Write-Host "   • $($app.name) - port $($app.port)" -ForegroundColor Red
    }
}
