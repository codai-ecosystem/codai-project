# PowerShell script to fix vitest watch mode across all applications
# This script adds 'watch: false' to all vitest.config.ts files in the apps directory

Write-Host "🚀 FIXING VITEST WATCH MODE ACROSS ECOSYSTEM" -ForegroundColor Green

$appsDir = "e:\GitHub\codai-project\apps"
$configFiles = @()

# Get all main vitest.config.ts files (excluding node_modules)
Get-ChildItem -Path $appsDir -Recurse -Name "vitest.config.ts" | Where-Object { 
    $_ -notlike "*node_modules*" -and $_ -notlike "*packages*" 
} | ForEach-Object {
    $fullPath = Join-Path $appsDir $_
    $configFiles += $fullPath
}

Write-Host "Found $($configFiles.Count) vitest config files to update" -ForegroundColor Yellow

foreach ($configFile in $configFiles) {
    Write-Host "Processing: $configFile" -ForegroundColor Cyan
    
    try {
        $content = Get-Content $configFile -Raw
        
        # Check if watch: false already exists
        if ($content -notmatch "watch:\s*false") {
            # Add watch: false to the test configuration
            if ($content -match "test:\s*\{") {
                # Find the test block and add watch: false
                $updatedContent = $content -replace "test:\s*\{", "test: {`n    watch: false, // Prevent watch mode by default"
                Set-Content -Path $configFile -Value $updatedContent -Encoding UTF8
                Write-Host "  ✅ Added watch: false" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️ Could not find test block - manual review needed" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  ✅ Already has watch: false" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "  ❌ Error processing file: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎉 VITEST WATCH MODE FIX COMPLETE!" -ForegroundColor Green
Write-Host "All applications now configured to prevent watch mode by default" -ForegroundColor Green
