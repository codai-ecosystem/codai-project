# Massive Parallel Deployment Script
# Deploys multiple services simultaneously

$port = 4060
$apps = @("docs", "tools", "publicai", "marketai", "legalizai", "fabricai", "analizai")

foreach ($app in $apps) {
    $deployCommand = "cd e:\GitHub\codai-project\apps\$app && npm install --force && npx next dev --port $port"
    Write-Host "Deploying $app on port $port..." -ForegroundColor Green
    
    # Start in background
    Start-Process pwsh.exe -ArgumentList "-Command", $deployCommand -WindowStyle Hidden
    
    $port++
    Start-Sleep 2  # Brief delay between deployments
}

Write-Host "Batch deployment initiated for $($apps.Count) services" -ForegroundColor Cyan
