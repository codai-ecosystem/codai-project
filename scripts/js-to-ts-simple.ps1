# JavaScript Module Files Analysis and Migration Script
# Analyzes and converts remaining JavaScript module files to TypeScript

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("analyze", "simple", "test", "service")]
    [string]$Mode = "analyze"
)

Write-Host "🚀 JavaScript Module Files Migration Tool" -ForegroundColor Yellow
Write-Host "Mode: $Mode" -ForegroundColor Cyan

# Find all JavaScript files (excluding configs)
$allJSFiles = @()

# Scan apps and packages directories
@("apps", "packages") | ForEach-Object {
    if (Test-Path $_) {
        Get-ChildItem -Path $_ -Directory | ForEach-Object {
            $dir = $_.FullName
            Get-ChildItem -Path $dir -Filter "*.js" -Recurse -ErrorAction SilentlyContinue | 
            Where-Object { 
                $_.DirectoryName -notmatch "node_modules|\.git|dist|build|\.next|coverage" -and 
                $_.Name -notmatch "config\.js$" 
            } | ForEach-Object { 
                $allJSFiles += $_ 
            }
        }
    }
}

Write-Host "Found $($allJSFiles.Count) JavaScript files to analyze" -ForegroundColor Green

if ($Mode -eq "analyze") {
    Write-Host "`n📊 ANALYSIS RESULTS:" -ForegroundColor Yellow
    Write-Host "====================" -ForegroundColor Yellow
    
    # Categorize files by directory type
    $categories = @{}
    $allJSFiles | ForEach-Object {
        $relativePath = $_.FullName.Replace("$PWD\", "")
        $category = "other"
        
        if ($relativePath -match "test|spec|__test__|__spec__") { $category = "test" }
        elseif ($relativePath -match "service|api|route|endpoint") { $category = "service" }
        elseif ($relativePath -match "util|helper|lib|tool") { $category = "utility" }
        elseif ($relativePath -match "component|ui|widget") { $category = "component" }
        elseif ($relativePath -match "src|source") { $category = "source" }
        elseif ($relativePath -match "example|demo|sample") { $category = "example" }
        elseif ($relativePath -match "script|bin|cli") { $category = "script" }
        
        if (-not $categories[$category]) {
            $categories[$category] = @()
        }
        $categories[$category] += $_
    }
    
    Write-Host "`n📂 FILE CATEGORIES:" -ForegroundColor Cyan
    $categories.Keys | Sort-Object | ForEach-Object {
        $count = $categories[$_].Count
        Write-Host "  📄 $($_): $count files" -ForegroundColor White
        
        # Show top directories for this category
        $categories[$_] | ForEach-Object {
            Split-Path $_.DirectoryName -Leaf
        } | Group-Object | Sort-Object Count -Descending | Select-Object -First 3 | ForEach-Object {
            Write-Host "    📁 $($_.Name): $($_.Count) files" -ForegroundColor Gray
        }
    }
    
    # Size analysis
    $totalSize = ($allJSFiles | Measure-Object Length -Sum).Sum
    Write-Host "`n📏 SIZE ANALYSIS:" -ForegroundColor Cyan
    Write-Host "  Total size: $([Math]::Round($totalSize / 1KB, 2)) KB" -ForegroundColor White
    Write-Host "  Average file size: $([Math]::Round($totalSize / $allJSFiles.Count / 1KB, 2)) KB" -ForegroundColor White
    
    # Complexity estimation
    Write-Host "`n🔍 COMPLEXITY ESTIMATION:" -ForegroundColor Cyan
    $complexityCount = @{ simple = 0; moderate = 0; complex = 0 }
    
    $allJSFiles | ForEach-Object {
        $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
        if ($content) {
            $complexity = "simple"
            if ($content -match "class\s+\w+|async\s+function|Promise|\.then\(|\.catch\(") {
                $complexity = "moderate"
            }
            if ($content -match "require\s*\(|module\.exports|__dirname|eval\s*\(") {
                $complexity = "complex"
            }
            $complexityCount[$complexity]++
        }
    }
    
    $complexityCount.Keys | ForEach-Object {
        Write-Host "  🎯 $($_): $($complexityCount[$_]) files" -ForegroundColor White
    }
    
    Write-Host "`n✨ MIGRATION RECOMMENDATIONS:" -ForegroundColor Green
    Write-Host "=============================" -ForegroundColor Green
    Write-Host "1. Start with utility files ($($categories['utility'].Count) files) - usually simple conversions" -ForegroundColor White
    Write-Host "2. Convert test files ($($categories['test'].Count) files) - isolated and easy to validate" -ForegroundColor White
    Write-Host "3. Handle service files ($($categories['service'].Count) files) - may need API type definitions" -ForegroundColor White
    Write-Host "4. Convert source files ($($categories['source'].Count) files) - core application logic" -ForegroundColor White
    Write-Host "5. Address examples/scripts last - lower priority for functionality" -ForegroundColor White
    
    Write-Host "`n📋 NEXT STEPS:" -ForegroundColor Yellow
    Write-Host "  Run with -Mode 'simple' to start converting utility files" -ForegroundColor White
    Write-Host "  Run with -Mode 'test' to convert test files" -ForegroundColor White
    Write-Host "  Run with -Mode 'service' to convert API/service files" -ForegroundColor White
    
    return
}

# Simple conversion mode - convert basic utility files
if ($Mode -eq "simple") {
    Write-Host "`n🔄 Converting simple utility files..." -ForegroundColor Green
    
    $targetFiles = $allJSFiles | Where-Object {
        $_.FullName -match "util|helper|lib|tool" -and
        $_.FullName -notmatch "test|spec"
    }
    
    Write-Host "Converting $($targetFiles.Count) utility files..." -ForegroundColor Cyan
    
    $converted = 0
    $targetFiles | ForEach-Object {
        $jsPath = $_.FullName
        $tsPath = $jsPath -replace '\.js$', '.ts'
        
        if (Test-Path $tsPath) {
            Write-Host "  ⏭️  Skipped (TS exists): $($_.Name)" -ForegroundColor Yellow
            return
        }
        
        try {
            $content = Get-Content $jsPath -Raw
            
            # Basic CommonJS to ES modules conversion
            $content = $content -replace 'const\s+(\w+)\s*=\s*require\s*\(\s*[''"`]([^''"`]+)[''"`]\s*\)', 'import $1 from ''$2'';'
            $content = $content -replace 'module\.exports\s*=\s*{', 'export default {'
            $content = $content -replace 'module\.exports\s*=', 'export default'
            $content = $content -replace 'exports\.(\w+)\s*=', 'export const $1 ='
            
            Set-Content -Path $tsPath -Value $content -Encoding UTF8
            Write-Host "  ✅ Converted: $($_.Name) → $(Split-Path $tsPath -Leaf)" -ForegroundColor Green
            $converted++
            
        } catch {
            Write-Host "  ❌ Failed: $($_.Name) - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host "`n✨ Converted $converted utility files to TypeScript!" -ForegroundColor Green
}

Write-Host "`nMigration analysis complete! 🎉" -ForegroundColor Green