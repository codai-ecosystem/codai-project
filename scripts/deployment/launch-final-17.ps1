# FINAL 17 SERVICES - COMPLETE THE MISSION!
Write-Host "🎯 LAUNCHING FINAL 17 SERVICES FOR 100% COMPLETION!" -ForegroundColor Magenta

$missingServices = @(
    @{name="codai"; port=4035},
    @{name="kodex"; port=4043}, 
    @{name="logai"; port=4045},
    @{name="memorai"; port=4047},
    @{name="mod"; port=4048},
    @{name="publicai"; port=4049},
    @{name="sociai"; port=4050},
    @{name="studiai"; port=4052},
    @{name="tools"; port=4053},
    @{name="wallet"; port=4054},
    @{name="x"; port=4055},
    @{name="mobile"; port=4056},
    @{name="muzicai"; port=4057},
    @{name="acasai"; port=4058},
    @{name="curtai"; port=4059},
    @{name="dexai"; port=4060},
    @{name="jucai"; port=4061}
)

Write-Host "🚀 DEPLOYING $($missingServices.Count) FINAL SERVICES..." -ForegroundColor Red

$count = 0
foreach ($service in $missingServices) {
    $count++
    Write-Host "⚡ [$count/$($missingServices.Count)] $($service.name) → Port $($service.port)" -ForegroundColor Green
    $cmd = "cd e:\GitHub\codai-project\apps\$($service.name) && npx next dev --port $($service.port)"
    Start-Process pwsh.exe -ArgumentList "-Command", $cmd -WindowStyle Hidden
    Start-Sleep 1  # Brief delay for stability
}

Write-Host ""
Write-Host "✅ FINAL 17 SERVICES DEPLOYED!" -ForegroundColor Green
Write-Host "🎯 TARGET: 25 + 17 = 42 TOTAL SERVICES" -ForegroundColor Magenta
Write-Host "💪 MISSION: 100% COMPLETION IN PROGRESS!" -ForegroundColor Red
