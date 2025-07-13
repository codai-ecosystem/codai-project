# Batch fix script for Codai apps
# Apply Tailwind 3.x fix to all structured apps

$apps = @(
    "fabricai", "kodex", "logai", "marketai", "mod", "sociai"
)

foreach ($app in $apps) {
    Write-Host "=== Fixing $app ===" -ForegroundColor Green
    
    $packagePath = "apps\$app\package.json"
    
    if (Test-Path $packagePath) {
        # Read package.json
        $content = Get-Content $packagePath -Raw
        
        # Apply Tailwind 3.x fix
        $content = $content -replace '"tailwindcss": "\^4\.1\.0"', '"tailwindcss": "^3.4.0"'
        $content = $content -replace ',\s*"@tailwindcss/postcss": "\^4\.1\.0"', ''
        
        # Write back
        $content | Set-Content $packagePath
        
        Write-Host "✅ Fixed $app package.json" -ForegroundColor Green
    } else {
        Write-Host "❌ Package.json not found for $app" -ForegroundColor Red
    }
}

Write-Host "=== Batch fix completed ===" -ForegroundColor Cyan
