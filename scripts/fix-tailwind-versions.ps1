# Fix Tailwind CSS versions across all apps - downgrade from v4 to stable v3.4.17

$ErrorActionPreference = "Stop"

Write-Host "🎨 Starting Tailwind CSS version fix across CODAI ecosystem..." -ForegroundColor Cyan

# List of apps that need Tailwind CSS v4 -> v3 downgrade
$appsToFix = @(
    "apps/analizai",
    "apps/jucai", 
    "apps/kodex",
    "apps/legalizai",
    "apps/logai",
    "apps/marketai",
    "apps/memorai/apps/dashboard",
    "apps/metu",
    "apps/metu-web", 
    "apps/mobile",
    "apps/mod",
    "apps/prezentai",
    "apps/publicai",
    "apps/sociai",
    "apps/stocai",
    "apps/studiai",
    "apps/sunai",
    "apps/talentai",
    "apps/tools",
    "apps/wallet",
    "apps/x"
)

$targetVersion = "^3.4.17"
$oldVersionPattern = "\^4\.1\.11|4\.1\.11"

Write-Host "📦 Target Tailwind CSS version: $targetVersion" -ForegroundColor Green

foreach ($app in $appsToFix) {
    $packageJsonPath = "$app/package.json"
    
    if (Test-Path $packageJsonPath) {
        Write-Host "🔧 Updating $app..." -ForegroundColor Yellow
        
        # Read and update package.json
        $content = Get-Content $packageJsonPath -Raw
        
        if ($content -match $oldVersionPattern) {
            # Replace Tailwind CSS version
            $updatedContent = $content -replace '"tailwindcss":\s*"\^4\.1\.11"', '"tailwindcss": "^3.4.17"'
            $updatedContent = $updatedContent -replace '"tailwindcss":\s*"4\.1\.11"', '"tailwindcss": "^3.4.17"'
            
            # Write back to file
            $updatedContent | Set-Content $packageJsonPath -NoNewline
            
            Write-Host "✅ Updated $app to Tailwind CSS v3.4.17" -ForegroundColor Green
        } else {
            Write-Host "ℹ️ $app already using correct version" -ForegroundColor Blue
        }
    } else {
        Write-Host "⚠️ Package.json not found for $app" -ForegroundColor Red
    }
}

Write-Host "🎨 Tailwind CSS version fix completed!" -ForegroundColor Cyan
Write-Host "📝 Next step: Run 'pnpm install' to update dependencies" -ForegroundColor Yellow
