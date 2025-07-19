# Set up environment variables for all Vercel projects
$vercelTeam = "codai-ro"

# App port mappings for local development
$appPorts = @{
    "acasai" = 3100; "admin" = 6600; "adoptai" = 7100; "aide" = 6700; "ajutai" = 3200
    "analizai" = 3300; "bancai" = 3400; "codai" = 3000; "conversai" = 3500; "cumparai" = 3600
    "curtai" = 3700; "dash" = 6800; "dexai" = 3800; "docs" = 6900; "donai" = 3900
    "explorer" = 4000; "fabricai" = 4100; "glass" = 6400; "hub" = 6000; "id" = 6100
    "jucai" = 4200; "kodex" = 6200; "legalizai" = 4300; "logai" = 4400; "marketai" = 4500
    "memorai" = 4600; "metu" = 5000; "metu-web" = 5100; "muzicai" = 4700; "prezentai" = 4800
    "promovai" = 7200; "publicai" = 4900; "romai" = 5200; "sociai" = 5300; "stocai" = 5400
    "studiai" = 5500; "sunai" = 5600; "talentai" = 5700; "tools" = 6300; "wallet" = 5800
}

function Set-EnvironmentVariablesForProject {
    param([string]$AppName)
    
    $envFile = "apps\$AppName\.env"
    if (!(Test-Path $envFile)) {
        Write-Host "❌ No .env file found for $AppName" -ForegroundColor Red
        return
    }
    
    Write-Host "⚙️  Setting environment variables for $AppName" -ForegroundColor Yellow
    
    $envContent = Get-Content $envFile
    $successCount = 0
    $errorCount = 0
    
    # Change to app directory for vercel commands
    Push-Location "apps\$AppName"
    
    try {
        foreach ($line in $envContent) {
            if ($line -match '^([^=]+)=(.+)$' -and !$line.StartsWith('#')) {
                $key = $Matches[1].Trim()
                $value = $Matches[2].Trim().Trim('"')
                
                # Skip NODE_ENV as we'll set it separately
                if ($key -eq "NODE_ENV") { continue }
                
                Write-Host "  Setting $key..." -ForegroundColor Gray
                
                try {
                    # Production environment
                    $cmd = "vercel env add `"$key`" production `"$value`" --force --scope $vercelTeam"
                    Invoke-Expression $cmd 2>$null | Out-Null
                    
                    # Preview environment (same as production for most vars)
                    $cmd = "vercel env add `"$key`" preview `"$value`" --force --scope $vercelTeam"
                    Invoke-Expression $cmd 2>$null | Out-Null
                    
                    # Development environment (adjust URLs for localhost)
                    $devValue = $value
                    if ($key -match "NEXTAUTH_URL|API_URL|APP_URL") {
                        $port = $appPorts[$AppName]
                        if ($port) {
                            if ($key -match "API_URL") {
                                $devValue = "http://localhost:$port/api"
                            } else {
                                $devValue = "http://localhost:$port"
                            }
                        }
                    }
                    
                    $cmd = "vercel env add `"$key`" development `"$devValue`" --force --scope $vercelTeam"
                    Invoke-Expression $cmd 2>$null | Out-Null
                    
                    $successCount++
                }
                catch {
                    $errorCount++
                }
            }
        }
        
        # Set NODE_ENV for each environment
        Write-Host "  Setting NODE_ENV for all environments..." -ForegroundColor Gray
        Invoke-Expression "vercel env add `"NODE_ENV`" production `"production`" --force --scope $vercelTeam" 2>$null | Out-Null
        Invoke-Expression "vercel env add `"NODE_ENV`" preview `"preview`" --force --scope $vercelTeam" 2>$null | Out-Null
        Invoke-Expression "vercel env add `"NODE_ENV`" development `"development`" --force --scope $vercelTeam" 2>$null | Out-Null
        
        Write-Host "✅ Set $successCount variables for $AppName" -ForegroundColor Green
        if ($errorCount -gt 0) {
            Write-Host "⚠️  $errorCount variables failed for $AppName" -ForegroundColor Yellow
        }
    }
    finally {
        Pop-Location
    }
}

# Main execution
Write-Host "⚙️  CODAI Ecosystem Environment Variables Setup" -ForegroundColor Magenta
Write-Host "===================================================" -ForegroundColor Magenta

# Get all directories in apps folder
$appsPath = "apps"
$skipApps = @('bancai-mobile', 'codai-mobile', 'mod', 'x', '_config', 'README.md')

foreach ($appDir in Get-ChildItem $appsPath -Directory) {
    $appName = $appDir.Name
    
    if ($skipApps -contains $appName) {
        Write-Host "⏭️  Skipping $appName" -ForegroundColor Gray
        continue
    }
    
    # Check if .env file exists
    if (Test-Path "apps\$appName\.env") {
        Set-EnvironmentVariablesForProject -AppName $appName
        Start-Sleep 1  # Rate limiting
    } else {
        Write-Host "⚠️  No .env file for $appName" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎉 Environment variables setup complete!" -ForegroundColor Green
Write-Host "📝 Summary:" -ForegroundColor Cyan
Write-Host "   ✅ Production: Uses production values" -ForegroundColor White
Write-Host "   ✅ Preview: Uses production values (preview branch)" -ForegroundColor White  
Write-Host "   ✅ Development: Uses localhost URLs (dev branch)" -ForegroundColor White
