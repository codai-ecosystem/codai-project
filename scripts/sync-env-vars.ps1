# CODAI Ecosystem Environment Variables Sync Script
# Syncs environment variables from .env files to Vercel projects under codai-ro team

# App to domain mapping (same as setup script)
$appDomains = @{
    "acasai" = "acasai.ro"
    "admin" = "admin.codai.ro"
    "adoptai" = "adoptai.ro"
    "aide" = "aide.codai.ro"
    "ajutai" = "ajutai.ro"
    "analizai" = "analizai.ro"
    "bancai" = "bancai.ro"
    "codai" = "codai.ro"
    "conversai" = "conversai.ro"
    "cumparai" = "cumparai.ro"
    "curtai" = "curtai.ro"
    "dash" = "dash.codai.ro"
    "dexai" = "dexai.ro"
    "docs" = "docs.codai.ro"
    "donai" = "donai.ro"
    "explorer" = "explorai.ro"
    "fabricai" = "fabricai.ro"
    "glass" = "controlai.ro"
    "hub" = "hub.codai.ro"
    "id" = "id.codai.ro"
    "jucai" = "jucai.ro"
    "kodex" = "kodex.codai.ro"
    "legalizai" = "legalizai.ro"
    "logai" = "logai.ro"
    "marketai" = "marketai.ro"
    "memorai" = "memorai.ro"
    "metu" = "metu.ro"
    "metu-web" = "metu.ro"
    "muzicai" = "muzicai.ro"
    "prezentai" = "prezentai.ro"
    "promovai" = "promovai.ro"
    "publicai" = "publicai.ro"
    "romai" = "romcp.ro"
    "sociai" = "sociai.ro"
    "stocai" = "stocai.ro"
    "studiai" = "studiai.ro"
    "sunai" = "sunai.ro"
    "talentai" = "talentai.ro"
    "tools" = "romcp.ro"
    "wallet" = "wallet.bancai.ro"
}

# Apps to skip
$skipApps = @('bancai-mobile', 'codai-mobile', 'mod', 'x', '_config', 'README.md')

function Sync-EnvironmentVariables {
    param(
        [string]$AppName
    )
    
    $envFile = "apps\$AppName\.env"
    if (!(Test-Path $envFile)) {
        Write-Host "❌ No .env file found for $AppName" -ForegroundColor Red
        return
    }
    
    Write-Host "⚙️  Syncing environment variables for $AppName" -ForegroundColor Yellow
    
    # Read .env file and set Vercel environment variables
    $envContent = Get-Content $envFile
    
    $successCount = 0
    $totalCount = 0
    
    foreach ($line in $envContent) {
        if ($line -match '^([^=]+)=(.*)$' -and !$line.StartsWith('#')) {
            $key = $Matches[1].Trim()
            $value = $Matches[2].Trim()
            
            # Remove quotes if present
            if ($value.StartsWith('"') -and $value.EndsWith('"')) {
                $value = $value.Substring(1, $value.Length - 2)
            }
            
            # Skip certain variables that shouldn't be in production
            if ($key -match '^(NODE_ENV|DEBUG_MODE|NEXTAUTH_URL)$') {
                continue
            }
            
            $totalCount++
            Write-Host "  🔑 $key" -ForegroundColor Gray -NoNewline
            
            try {
                # Use environment variable approach to handle special characters
                $env:TEMP_VAR_KEY = $key
                $env:TEMP_VAR_VALUE = $value
                
                # Use PowerShell's Start-Process to handle the command properly
                $process = Start-Process -FilePath "vercel" -ArgumentList @("env", "add", $env:TEMP_VAR_KEY, "production", $env:TEMP_VAR_VALUE, "--force", "--scope", "codai-ro") -NoNewWindow -Wait -PassThru -RedirectStandardOutput "nul" -RedirectStandardError "nul"
                
                if ($process.ExitCode -eq 0) {
                    Write-Host " ✅" -ForegroundColor Green
                    $successCount++
                } else {
                    Write-Host " ⚠️" -ForegroundColor Yellow
                }
                
                # Clean up temp env vars
                Remove-Item env:TEMP_VAR_KEY -ErrorAction SilentlyContinue
                Remove-Item env:TEMP_VAR_VALUE -ErrorAction SilentlyContinue
                
            } catch {
                Write-Host " ❌" -ForegroundColor Red
            }
        }
    }
    
    Write-Host "✅ Environment sync complete for $AppName ($successCount/$totalCount variables)" -ForegroundColor Green
    Write-Host ""
}

# Main execution
Write-Host "🔄 CODAI Ecosystem Environment Variables Sync" -ForegroundColor Magenta
Write-Host "=============================================" -ForegroundColor Magenta
Write-Host ""

$processedApps = 0
$totalApps = ($appDomains.Keys | Where-Object { $skipApps -notcontains $_ }).Count

foreach ($app in $appDomains.Keys) {
    # Skip excluded apps
    if ($skipApps -contains $app) {
        continue
    }
    
    $processedApps++
    Write-Host "📱 [$processedApps/$totalApps] $app" -ForegroundColor Cyan
    Sync-EnvironmentVariables -AppName $app
    
    # Small delay to prevent rate limiting
    Start-Sleep 1
}

Write-Host "🎉 Environment variables sync completed!" -ForegroundColor Green
Write-Host "📊 Processed $processedApps apps under codai-ro team" -ForegroundColor Cyan
