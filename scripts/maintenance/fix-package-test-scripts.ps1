# PowerShell script to ensure all app package.json files use vitest run instead of vitest
# This prevents watch mode in CI/CD and automated testing

Write-Host "🔧 UPDATING PACKAGE.JSON TEST SCRIPTS ACROSS ECOSYSTEM" -ForegroundColor Green

$appsDir = "e:\GitHub\codai-project\apps"
$packageFiles = @()

# Get all main package.json files (excluding node_modules)
Get-ChildItem -Path $appsDir -Recurse -Name "package.json" | Where-Object { 
    $_ -notlike "*node_modules*" 
} | ForEach-Object {
    $fullPath = Join-Path $appsDir $_
    $packageFiles += $fullPath
}

Write-Host "Found $($packageFiles.Count) package.json files to check" -ForegroundColor Yellow

foreach ($packageFile in $packageFiles) {
    Write-Host "Processing: $packageFile" -ForegroundColor Cyan
    
    try {
        $content = Get-Content $packageFile -Raw
        $updated = $false
        
        # Replace "test": "vitest" with "test": "vitest run"
        if ($content -match '"test":\s*"vitest"[^a-zA-Z]') {
            $content = $content -replace '"test":\s*"vitest"', '"test": "vitest run"'
            $updated = $true
        }
        
        # Ensure other test scripts use run where appropriate
        if ($content -match '"test:run":\s*"vitest"[^a-zA-Z]') {
            $content = $content -replace '"test:run":\s*"vitest"', '"test:run": "vitest run"'
            $updated = $true
        }
        
        if ($content -match '"test:coverage":\s*"vitest"[^a-zA-Z]') {
            $content = $content -replace '"test:coverage":\s*"vitest"', '"test:coverage": "vitest run --coverage"'
            $updated = $true
        }
        
        if ($updated) {
            Set-Content -Path $packageFile -Value $content -Encoding UTF8
            Write-Host "  ✅ Updated test scripts" -ForegroundColor Green
        } else {
            Write-Host "  ✅ Test scripts already correct" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "  ❌ Error processing file: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎉 PACKAGE.JSON TEST SCRIPTS UPDATE COMPLETE!" -ForegroundColor Green
Write-Host "All applications now use vitest run for automated testing" -ForegroundColor Green
