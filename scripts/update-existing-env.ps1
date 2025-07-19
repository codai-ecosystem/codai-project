# Targeted Environment Variables Update for Existing Projects
# This script will update environment variables for the projects that actually exist

param(
    [string]$Team = "codai-ro"
)

# List of confirmed existing projects from Vercel output
$existingProjects = @(
    "acasai", "admin", "aide", "ajutai", "bancai", "codai", "docs", "fabricai", 
    "glass", "hub", "id", "jucai", "kodex", "memorai", "metu-web", "publicai", 
    "romai", "stocai", "wallet", "adoptai"
)

# Load root .env file for shared values
$rootEnvPath = ".env"
$sharedVars = @{}
if (Test-Path $rootEnvPath) {
    Write-Host "📄 Loading shared environment variables from root .env..." -ForegroundColor Cyan
    Get-Content $rootEnvPath | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim().Trim('"')
            if ($value -ne "") {
                $sharedVars[$key] = $value
                Write-Host "  ✅ Loaded $key" -ForegroundColor Green
            }
        }
    }
    Write-Host "✅ Loaded $($sharedVars.Count) shared variables" -ForegroundColor Green
} else {
    Write-Host "⚠️ No root .env file found" -ForegroundColor Yellow
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
    $updatedCount = 0
    
    Get-Content $appEnvPath | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim().Trim('"')
            
            # Replace placeholder values with actual values
            $originalValue = $value
            
            # Use shared values if available and current value is placeholder
            if ($sharedVars.ContainsKey($key) -and $sharedVars[$key] -ne "" -and 
                ($value -eq "" -or $value -match "your-.*-here|placeholder")) {
                $value = $sharedVars[$key]
            }
            
            # Handle specific placeholder patterns
            switch -Regex ($value) {
                "your-azure-openai-endpoint-here" { 
                    $value = "https://codai-openai.openai.azure.com/"
                }
                "your-.*-secret-here" {
                    if ($key -eq "NEXTAUTH_SECRET" -or $key -eq "JWT_SECRET") {
                        # Generate a proper secret
                        $bytes = New-Object byte[] 32
                        ([System.Security.Cryptography.RNG]::Create()).GetBytes($bytes)
                        $value = [Convert]::ToBase64String($bytes)
                    }
                }
                "pk_test_your-stripe-key" { 
                    if ($sharedVars.ContainsKey("STRIPE_PUBLISHABLE_KEY")) {
                        $value = $sharedVars["STRIPE_PUBLISHABLE_KEY"]
                    }
                }
                "sk_test_your-stripe-secret" { 
                    if ($sharedVars.ContainsKey("STRIPE_SECRET_KEY")) {
                        $value = $sharedVars["STRIPE_SECRET_KEY"]
                    }
                }
                "your-github-client-id" { 
                    if ($sharedVars.ContainsKey("GITHUB_CLIENT_ID")) {
                        $value = $sharedVars["GITHUB_CLIENT_ID"]
                    }
                }
                "your-github-client-secret" { 
                    if ($sharedVars.ContainsKey("GITHUB_CLIENT_SECRET")) {
                        $value = $sharedVars["GITHUB_CLIENT_SECRET"]
                    }
                }
            }
            
            # Environment-specific URLs
            if ($key -eq "NEXTAUTH_URL") {
                switch ($Environment) {
                    "production" { 
                        # Use domain mapping for production
                        switch ($AppName) {
                            "admin" { $value = "https://admin.codai.ro" }
                            "aide" { $value = "https://aide.codai.ro" }
                            "dash" { $value = "https://dash.codai.ro" }
                            "docs" { $value = "https://docs.codai.ro" }
                            "hub" { $value = "https://hub.codai.ro" }
                            "id" { $value = "https://id.codai.ro" }
                            "kodex" { $value = "https://kodex.codai.ro" }
                            "glass" { $value = "https://controlai.ro" }
                            "tools" { $value = "https://romcp.ro" }
                            "romai" { $value = "https://romcp.ro" }
                            "wallet" { $value = "https://wallet.bancai.ro" }
                            default { $value = "https://$AppName.ro" }
                        }
                    }
                    "preview" { 
                        $value = "https://$AppName-git-preview-codai-ro.vercel.app"
                    }
                    "development" { 
                        # Keep localhost for development
                    }
                }
            }
            
            if ($key -eq "NODE_ENV") {
                switch ($Environment) {
                    "production" { $value = "production" }
                    "preview" { $value = "production" }
                    "development" { $value = "development" }
                }
            }
            
            # Only add if we have a valid value and it's not empty
            if ($value -ne "" -and $value -ne $originalValue) {
                $envVars[$key] = $value
                $updatedCount++
            }
        }
    }
    
    # Set environment variables in Vercel if we have updates
    if ($envVars.Count -eq 0) {
        Write-Host "  ⚠️ No variables to update for $Environment" -ForegroundColor Yellow
        return
    }
    
    $successCount = 0
    
    foreach ($key in $envVars.Keys) {
        $value = $envVars[$key]
        
        try {
            Write-Host "  Setting $key..." -ForegroundColor Gray
            
            # Use vercel env add with proper team parameter
            $result = vercel env add $key $Environment $value --force --scope $Team 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                $successCount++
                Write-Host "    ✅ $key updated successfully" -ForegroundColor Green
            } else {
                Write-Host "    ❌ Failed to set $key`: $result" -ForegroundColor Red
            }
        }
        catch {
            Write-Host "    ❌ Error setting $key`: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host "  📊 $Environment environment: $successCount/$($envVars.Count) variables updated" -ForegroundColor Cyan
}

# Main execution
Write-Host "🚀 Updating Environment Variables for Existing CODAI Projects" -ForegroundColor Magenta
Write-Host "=============================================================" -ForegroundColor Magenta
Write-Host ""

# Process each existing project
foreach ($app in $existingProjects) {
    Write-Host "📦 Processing $app..." -ForegroundColor White
    Write-Host "----------------------------------------" -ForegroundColor Gray
    
    # Update environment variables for each environment
    Update-EnvironmentVariables -AppName $app -Environment "development"
    Start-Sleep 1
    Update-EnvironmentVariables -AppName $app -Environment "preview"
    Start-Sleep 1
    Update-EnvironmentVariables -AppName $app -Environment "production"
    
    Write-Host "✅ Completed $app environment updates" -ForegroundColor Green
    Write-Host ""
    
    # Rate limiting
    Start-Sleep 2
}

Write-Host "🎉 Environment variables update completed!" -ForegroundColor Green
Write-Host "📝 Summary:" -ForegroundColor Cyan
Write-Host "   ✅ Updated placeholder values with actual configuration" -ForegroundColor White
Write-Host "   ✅ Generated security secrets for authentication" -ForegroundColor White
Write-Host "   ✅ Configured environment-specific URLs" -ForegroundColor White
Write-Host "   ✅ Applied settings to development, preview, and production" -ForegroundColor White
