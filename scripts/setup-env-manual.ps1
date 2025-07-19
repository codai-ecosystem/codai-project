# Simplified Environment Variables Setup
# This script creates commands you can run manually

param(
    [string]$Team = "codai-ro"
)

$existingProjects = @(
    "acasai", "admin", "aide", "ajutai", "bancai", "codai", "docs", "fabricai", 
    "glass", "hub", "id", "jucai", "kodex", "memorai", "metu-web", "publicai", 
    "romai", "stocai", "wallet", "adoptai"
)

Write-Host "🚀 CODAI Environment Variables Setup Commands" -ForegroundColor Magenta
Write-Host "=============================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "Run these commands manually to set up environment variables:" -ForegroundColor Cyan
Write-Host ""

foreach ($app in $existingProjects) {
    Write-Host "# $app" -ForegroundColor Yellow
    Write-Host "cd apps\$app"
    
    # Key environment variables to set
    Write-Host "vercel env add NODE_ENV production production --force --scope $Team"
    Write-Host "vercel env add NODE_ENV preview production --force --scope $Team"
    Write-Host "vercel env add NODE_ENV development development --force --scope $Team"
    
    Write-Host "vercel env add AZURE_OPENAI_ENDPOINT production `"https://codai-openai.openai.azure.com/`" --force --scope $Team"
    Write-Host "vercel env add AZURE_OPENAI_ENDPOINT preview `"https://codai-openai.openai.azure.com/`" --force --scope $Team"
    Write-Host "vercel env add AZURE_OPENAI_ENDPOINT development `"https://codai-openai.openai.azure.com/`" --force --scope $Team"
    
    # Production URL
    $prodUrl = switch ($app) {
        "admin" { "https://admin.codai.ro" }
        "aide" { "https://aide.codai.ro" }
        "dash" { "https://dash.codai.ro" }
        "docs" { "https://docs.codai.ro" }
        "hub" { "https://hub.codai.ro" }
        "id" { "https://id.codai.ro" }
        "kodex" { "https://kodex.codai.ro" }
        "glass" { "https://controlai.ro" }
        "tools" { "https://romcp.ro" }
        "romai" { "https://romcp.ro" }
        "wallet" { "https://wallet.bancai.ro" }
        default { "https://$app.ro" }
    }
    
    Write-Host "vercel env add NEXTAUTH_URL production `"$prodUrl`" --force --scope $Team"
    Write-Host "vercel env add NEXTAUTH_URL preview `"https://$app-git-preview-codai-ro.vercel.app`" --force --scope $Team"
    
    Write-Host "cd ..\.. # Back to root"
    Write-Host ""
}

Write-Host "📝 Alternative: Bulk Environment Variable Script" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Create a batch script for Windows
$batchContent = @"
@echo off
echo Setting up CODAI environment variables...

"@

foreach ($app in $existingProjects) {
    $batchContent += @"
echo.
echo Setting up $app...
cd apps\$app
echo production | vercel env add NODE_ENV production --force --scope $Team
echo production | vercel env add NODE_ENV preview --force --scope $Team  
echo development | vercel env add NODE_ENV development --force --scope $Team
echo https://codai-openai.openai.azure.com/ | vercel env add AZURE_OPENAI_ENDPOINT production --force --scope $Team
echo https://codai-openai.openai.azure.com/ | vercel env add AZURE_OPENAI_ENDPOINT preview --force --scope $Team
echo https://codai-openai.openai.azure.com/ | vercel env add AZURE_OPENAI_ENDPOINT development --force --scope $Team
cd ..\..

"@
}

$batchContent += @"
echo.
echo Environment variables setup completed!
pause
"@

# Write batch file
$batchContent | Out-File -FilePath "scripts\setup-env-batch.bat" -Encoding ASCII

Write-Host "Created batch file: scripts\setup-env-batch.bat" -ForegroundColor Green
Write-Host "You can run this file to set up environment variables with auto-input" -ForegroundColor Yellow
