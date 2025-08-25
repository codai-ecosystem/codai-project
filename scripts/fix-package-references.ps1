# Fix incorrect package references in workspace
# Corrects common package name mistakes in package.json files

param(
    [switch]$DryRun = $false
)

Write-Host "🔧 Fixing Incorrect Package References" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Common package name corrections
$packageCorrections = @{
    "@codai/ui" = "@codai/shared-ui"
    "@codai/eslint" = "@codai/eslint-config"
    "@codai/prettier" = "@codai/prettier-config"
    "@codai/typescript" = "@codai/typescript-config"
    "@codai/test-utils" = "@codai/testing-utils"
    "@codai/test" = "@codai/testing-utils"
    "@codai/performance-monitor-utils" = "@codai/performance-monitoring"
}

Write-Host "🔍 Scanning for incorrect package references..." -ForegroundColor Yellow

$correctedCount = 0
$totalFiles = 0

# Find all package.json files
$packageJsonFiles = Get-ChildItem -Path "." -Recurse -Filter "package.json" | 
    Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.next*" }

foreach ($file in $packageJsonFiles) {
    $totalFiles++
    $relativePath = $file.FullName.Replace((Get-Location).Path, "").TrimStart('\')
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileChanged = $false
    
    Write-Host "`n📁 Checking: $relativePath" -ForegroundColor Cyan
    
    # Check each correction
    foreach ($incorrectName in $packageCorrections.Keys) {
        $correctName = $packageCorrections[$incorrectName]
        
        # Check in dependencies
        $depPattern = '"' + [regex]::Escape($incorrectName) + '":\s*"[^"]*"'
        if ($content -match $depPattern) {
            Write-Host "   🔧 Found incorrect dependency: $incorrectName -> $correctName" -ForegroundColor Yellow
            $content = $content -replace ([regex]::Escape('"' + $incorrectName + '"')), ('"' + $correctName + '"')
            $fileChanged = $true
        }
        
        # Check in devDependencies  
        if ($content -match '"devDependencies"[\s\S]*?"' + [regex]::Escape($incorrectName) + '"') {
            Write-Host "   🔧 Found incorrect devDependency: $incorrectName -> $correctName" -ForegroundColor Yellow
            $content = $content -replace ([regex]::Escape('"' + $incorrectName + '"')), ('"' + $correctName + '"')
            $fileChanged = $true
        }
        
        # Check in peerDependencies
        if ($content -match '"peerDependencies"[\s\S]*?"' + [regex]::Escape($incorrectName) + '"') {
            Write-Host "   🔧 Found incorrect peerDependency: $incorrectName -> $correctName" -ForegroundColor Yellow
            $content = $content -replace ([regex]::Escape('"' + $incorrectName + '"')), ('"' + $correctName + '"')
            $fileChanged = $true
        }
    }
    
    if ($fileChanged) {
        Write-Host "   ✅ Corrections needed in this file" -ForegroundColor Green
        
        if (!$DryRun) {
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8
            Write-Host "   💾 File updated" -ForegroundColor Green
        } else {
            Write-Host "   🔄 Would update (DRY RUN)" -ForegroundColor Magenta
        }
        
        $correctedCount++
    } else {
        Write-Host "   ✅ No corrections needed" -ForegroundColor Gray
    }
}

Write-Host "`n📊 Package Reference Correction Summary:" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow
Write-Host "Files Scanned: $totalFiles" -ForegroundColor White
Write-Host "$(if($DryRun){'Would Correct'}else{'Corrected'}) Files: $correctedCount" -ForegroundColor Cyan

if ($correctedCount -gt 0) {
    Write-Host "`n📦 Next Steps:" -ForegroundColor Green
    Write-Host "1. Run: pnpm install (to install correct dependencies)"
    Write-Host "2. Check for any remaining dependency issues"
    Write-Host "3. Test affected packages"
}

Write-Host "`n✨ Package Reference Correction Complete!" -ForegroundColor Green