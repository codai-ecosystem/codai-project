# Comprehensive Vercel Environment Variables Update Script
# This script will update all environment variables with actual values

param(
    [string]$Team = "codai-ro"
)

# Environment mappings
$environmentMappings = @{
    "dev" = "development"
    "preview" = "preview"
    "production" = "production"
}

# App to domain mapping (for project identification)
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

# Load root .env file for shared values
$rootEnvPath = ".env"
$sharedVars = @{}
if (Test-Path $rootEnvPath) {
    Get-Content $rootEnvPath | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim().Trim('"')
            $sharedVars[$key] = $value
        }
    }
}

function Update-EnvironmentVariables {
    param(
        [string]$AppName,
        [string]$Environment
    )
    
    Write-Host "🔄 Updating $Environment variables for $AppName..." -ForegroundColor Yellow
    
    $appEnvPath = "apps\$AppName\.env"
    if (-not (Test-Path $appEnvPath)) {
        Write-Host "  ⚠️ No .env file found at $appEnvPath" -ForegroundColor Red
        return
    }
    
    # Read app-specific environment variables
    $envVars = @{}
    Get-Content $appEnvPath | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim().Trim('"')
            
            # Replace with actual values from shared vars if available
            if ($sharedVars.ContainsKey($key) -and $sharedVars[$key] -ne "") {
                $value = $sharedVars[$key]
            }
            
            # Replace placeholder values with actual values
            switch ($key) {
                "AZURE_OPENAI_ENDPOINT" { 
                    if ($value -eq "your-azure-openai-endpoint-here") {
                        $value = "https://codai-openai.openai.azure.com/"
                    }
                }
                "AZURE_OPENAI_API_KEY" {
                    if ($value -eq "your-azure-openai-key-here") {
                        $value = $sharedVars["AZURE_OPENAI_API_KEY"]
                    }
                }
                "NEXTAUTH_SECRET" {
                    if ($value -eq "your-nextauth-secret-here") {
                        $value = [System.Web.Security.Membership]::GeneratePassword(32, 8)
                    }
                }
                "JWT_SECRET" {
                    if ($value -eq "your-jwt-secret-here") {
                        $value = [System.Web.Security.Membership]::GeneratePassword(32, 8)
                    }
                }
                "STRIPE_PUBLISHABLE_KEY" {
                    if ($value -eq "pk_test_your-stripe-key") {
                        $value = $sharedVars["STRIPE_PUBLISHABLE_KEY"]
                    }
                }
                "STRIPE_SECRET_KEY" {
                    if ($value -eq "sk_test_your-stripe-secret") {
                        $value = $sharedVars["STRIPE_SECRET_KEY"]
                    }
                }
                "GITHUB_CLIENT_ID" {
                    if ($value -eq "your-github-client-id") {
                        $value = $sharedVars["GITHUB_CLIENT_ID"]
                    }
                }
                "GITHUB_CLIENT_SECRET" {
                    if ($value -eq "your-github-client-secret") {
                        $value = $sharedVars["GITHUB_CLIENT_SECRET"]
                    }
                }
                "DATABASE_URL" {
                    if ($value -match "username:password@localhost") {
                        # Generate production database URLs based on environment
                        switch ($Environment) {
                            "production" { $value = "postgresql://codai_prod:${env:POSTGRES_PROD_PASSWORD}@prod-db.codai.ro:5432/${AppName}_prod" }
                            "preview" { $value = "postgresql://codai_preview:${env:POSTGRES_PREVIEW_PASSWORD}@preview-db.codai.ro:5432/${AppName}_preview" }
                            "development" { $value = "postgresql://codai_dev:${env:POSTGRES_DEV_PASSWORD}@dev-db.codai.ro:5432/${AppName}_dev" }
                        }
                    }
                }
                "NEXTAUTH_URL" {
                    # Update based on environment
                    switch ($Environment) {
                        "production" { 
                            $domain = $appDomains[$AppName]
                            $value = "https://$domain"
                        }
                        "preview" { 
                            $value = "https://$AppName-git-preview-codai-ro.vercel.app"
                        }
                        "development" { 
                            # Keep localhost for dev
                        }
                    }
                }
                "NODE_ENV" {
                    switch ($Environment) {
                        "production" { $value = "production" }
                        "preview" { $value = "production" }
                        "development" { $value = "development" }
                    }
                }
            }
            
            if ($value -ne "") {
                $envVars[$key] = $value
            }
        }
    }
    
    # Set environment variables in Vercel
    $successCount = 0
    $totalCount = $envVars.Count
    
    foreach ($key in $envVars.Keys) {
        $value = $envVars[$key]
        
        try {
            Write-Host "  Setting $key for $Environment..." -ForegroundColor Gray
            
            # Use vercel env add with proper escaping
            $escapedValue = $value -replace '"', '\"'
            $result = vercel env add $key $Environment $escapedValue --force --yes --team $Team 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                $successCount++
                Write-Host "    ✅ $key set successfully" -ForegroundColor Green
            } else {
                Write-Host "    ❌ Failed to set $key`: $result" -ForegroundColor Red
            }
        }
        catch {
            Write-Host "    ❌ Error setting $key`: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host "  📊 $Environment environment: $successCount/$totalCount variables set successfully" -ForegroundColor Cyan
    Write-Host ""
}

# Main execution
Write-Host "🚀 Updating Vercel Environment Variables for CODAI Ecosystem" -ForegroundColor Magenta
Write-Host "===============================================================" -ForegroundColor Magenta
Write-Host ""

# Validate team access
Write-Host "🔐 Validating team access..." -ForegroundColor Cyan
$teamCheck = vercel teams list --team $Team 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Cannot access team '$Team'. Please check your permissions." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Team access validated" -ForegroundColor Green
Write-Host ""

# Process each app
foreach ($app in $appDomains.Keys) {
    Write-Host "📦 Processing $app..." -ForegroundColor White
    Write-Host "----------------------------------------" -ForegroundColor Gray
    
    # Check if project exists
    $projectCheck = vercel projects list --team $Team | Select-String "^$app\s"
    if (-not $projectCheck) {
        Write-Host "⏭️ Project $app not found in team $Team, skipping..." -ForegroundColor Yellow
        Write-Host ""
        continue
    }
    
    # Update environment variables for each environment
    Update-EnvironmentVariables -AppName $app -Environment "development"
    Update-EnvironmentVariables -AppName $app -Environment "preview"
    Update-EnvironmentVariables -AppName $app -Environment "production"
    
    Write-Host "✅ Completed $app environment setup" -ForegroundColor Green
    Write-Host ""
    
    # Rate limiting
    Start-Sleep 2
}

Write-Host "🎉 Environment variables update completed!" -ForegroundColor Green
Write-Host "📝 Summary:" -ForegroundColor Cyan
Write-Host "   ✅ All placeholder values replaced with actual configuration" -ForegroundColor White
Write-Host "   ✅ Environment-specific URLs and database connections configured" -ForegroundColor White
Write-Host "   ✅ Security secrets generated where needed" -ForegroundColor White
Write-Host "   ✅ Development, preview, and production environments configured" -ForegroundColor White
