#!/usr/bin/env pwsh
# PowerShell script to standardize Playwright versions across the monorepo

Write-Host "🔧 Standardizing Playwright versions across CODAI monorepo..." -ForegroundColor Cyan

$TARGET_VERSION = "^1.54.2"
$UPDATED_COUNT = 0

# Find all package.json files that contain @playwright/test
$packageFiles = Get-ChildItem -Recurse -Filter "package.json" | Where-Object { 
    $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
    $content -and ($content -match '"@playwright/test"')
}

Write-Host "📦 Found $($packageFiles.Count) package.json files with @playwright/test" -ForegroundColor White

foreach ($packageFile in $packageFiles) {
    try {
        $filePath = $packageFile.FullName
        $content = Get-Content $filePath -Raw
        $originalContent = $content
        
        # Replace all @playwright/test version patterns
        $content = $content -replace '"@playwright/test":\s*"[^"]*"', "`"@playwright/test`": `"$TARGET_VERSION`""
        
        if ($content -ne $originalContent) {
            Set-Content -Path $filePath -Value $content -NoNewline
            Write-Host "  ✅ Updated: $($packageFile.Name) in $($packageFile.Directory.Name)" -ForegroundColor Green
            $UPDATED_COUNT++
        }
    }
    catch {
        Write-Host "  ❌ Error updating $($packageFile.FullName)`: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎯 Summary:" -ForegroundColor Yellow
Write-Host "  📁 Files processed: $($packageFiles.Count)" -ForegroundColor White
Write-Host "  ✅ Files updated: $UPDATED_COUNT" -ForegroundColor Green
Write-Host "  🎭 Target version: $TARGET_VERSION" -ForegroundColor White

if ($UPDATED_COUNT -gt 0) {
    Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Run 'pnpm install' to update dependencies" -ForegroundColor White
    Write-Host "  2. Run E2E tests to verify resolution" -ForegroundColor White
}

Write-Host "`n✨ Playwright version standardization complete!" -ForegroundColor Green