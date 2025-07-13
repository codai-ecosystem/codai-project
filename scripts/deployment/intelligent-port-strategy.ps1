# INTELLIGENT PORT STRATEGY - Fix port conflicts and launch correctly
Write-Host "🧠 INTELLIGENT STRATEGY: Fixing port assignments and launching correctly..." -ForegroundColor Magenta

# Define the correct app-to-port mapping
$correctMapping = @{
    "admin" = 4030
    "aide" = 4031
    "ajutai" = 4032
    "analizai" = 4033
    "bancai" = 4034
    "codai" = 4035  # This was the issue - codai package.json says 4030 but we want 4035
    "cumparai" = 4036
    "dash" = 4037
    "docs" = 4038
    "explorer" = 4039
    "fabricai" = 4040
    "hub" = 4041
    "id" = 4042
    "kodex" = 4043
    "legalizai" = 4044
    "logai" = 4045
    "marketai" = 4046
    "memorai" = 4047
    "mod" = 4048
    "publicai" = 4049
    "sociai" = 4050
    "stocai" = 4051
    "studiai" = 4052
    "tools" = 4053
    "wallet" = 4054
    "x" = 4055
    "mobile" = 4056
    "muzicai" = 4057
    "acasai" = 4058
    "curtai" = 4059
    "dexai" = 4060
    "jucai" = 4061
}

Write-Host "🔧 SMART LAUNCH: Using override ports for missing services..." -ForegroundColor Yellow

# Get current active ports
$activeServices = Get-NetTCPConnection | Where-Object {$_.LocalPort -ge 4000 -and $_.LocalPort -le 5000 -and $_.State -eq 'Listen'} | Select-Object -ExpandProperty LocalPort
Write-Host "✅ Currently active: $($activeServices.Count) services" -ForegroundColor Green

# Launch only missing services with explicit port overrides
$launched = 0
foreach ($app in $correctMapping.Keys) {
    $targetPort = $correctMapping[$app]
    
    if ($targetPort -notin $activeServices) {
        $launched++
        $appPath = "e:\GitHub\codai-project\apps\$app"
        
        if (Test-Path $appPath) {
            Write-Host "⚡ [$launched] LAUNCHING $app → Port $targetPort (OVERRIDE)" -ForegroundColor Cyan
            
            # Use explicit port override
            $cmd = "cd $appPath && npx next dev --port $targetPort"
            Start-Process pwsh.exe -ArgumentList "-Command", $cmd -WindowStyle Hidden
            Start-Sleep 1.5  # Longer delay for better startup
        } else {
            Write-Host "   ⚠️ SKIPPING $app (directory not found)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ✅ $app already running on port $targetPort" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🚀 INTELLIGENT LAUNCH COMPLETE!" -ForegroundColor Green
Write-Host "📈 Launched: $launched new services with port overrides" -ForegroundColor Cyan
Write-Host "🎯 Expected total: $($activeServices.Count + $launched) services" -ForegroundColor Magenta
