# JavaScript Module Files to TypeScript Migration Script
# Converts remaining JavaScript module files to TypeScript with proper type safety

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("all", "analyze", "test", "src", "services", "utils", "components")]
    [string]$MigrationType = "analyze",
    
    [Parameter(Mandatory=$false)]
    [switch]$ShowDetails,
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun,
    
    [Parameter(Mandatory=$false)]
    [int]$BatchSize = 50
)

# Initialize counters
$script:FilesConverted = 0
$script:LinesConverted = 0
$script:ErrorsFound = 0
$script:SkippedFiles = 0

Write-Host "🚀 Starting JavaScript Module Files to TypeScript Migration" -ForegroundColor Yellow
Write-Host "Migration Type: $MigrationType" -ForegroundColor Cyan
Write-Host "Batch Size: $BatchSize files" -ForegroundColor Cyan
if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No files will be modified" -ForegroundColor Magenta
}

# Function to analyze JavaScript file and determine migration complexity
function Get-FileComplexity {
    param([string]$FilePath)
    
    $content = Get-Content $FilePath -Raw -ErrorAction SilentlyContinue
    if (-not $content) { return "unknown" }
    
    $complexity = "simple"
    
    # Check for complex patterns
    if ($content -match "class\s+\w+|function\s*\*|async\s+function|\.prototype\.|this\.|export\s+class") {
        $complexity = "moderate"
    }
    
    if ($content -match "import\s*\(|require\s*\(|module\.exports|exports\.|__dirname|__filename") {
        $complexity = "complex"
    }
    
    if ($content -match "eval\(|Function\(|with\s*\(|arguments\.|\.call\(|\.apply\(") {
        $complexity = "advanced"
    }
    
    return $complexity
}

# Function to convert simple JavaScript utility files
function Convert-SimpleJSFile {
    param([string]$JsPath)
    
    if (-not (Test-Path $JsPath)) { return $false }
    
    $content = Get-Content $JsPath -Raw
    $originalLineCount = ($content -split "`n").Length
    $tsPath = $JsPath -replace '\.js$', '.ts'
    
    # Basic TypeScript conversion
    $tsContent = $content
    
    # Convert common patterns
    $tsContent = $tsContent -replace 'const\s+(\w+)\s*=\s*require\s*\(\s*["''`]([^"''`]+)["''`]\s*\)', 'import $1 from ''$2'';'
    $tsContent = $tsContent -replace 'module\.exports\s*=\s*{', 'export default {'
    $tsContent = $tsContent -replace 'module\.exports\s*=\s*', 'export default '
    $tsContent = $tsContent -replace 'exports\.(\w+)', 'export const $1'
    
    # Add basic type annotations for common patterns
    $tsContent = $tsContent -replace 'function\s+(\w+)\s*\(\s*([^)]*)\s*\)\s*{', 'function $1($2): any {'
    $tsContent = $tsContent -replace 'const\s+(\w+)\s*=\s*\(\s*([^)]*)\s*\)\s*=>\s*{', 'const $1 = ($2): any => {'
    
    # Add type assertion for common cases
    $tsContent = $tsContent -replace 'JSON\.parse\s*\(([^)]+)\)', '(JSON.parse($1) as any)'
    
    if (-not $DryRun) {
        Set-Content -Path $tsPath -Value $tsContent -Encoding UTF8
    }
    
    $newLineCount = ($tsContent -split "`n").Length
    if ($ShowDetails) {
        Write-Host "  📄 Simple JS→TS: $(Split-Path $JsPath -Leaf) → $(Split-Path $tsPath -Leaf)" -ForegroundColor White
        Write-Host "    Lines: $originalLineCount → $newLineCount" -ForegroundColor Gray
    }
    
    $script:FilesConverted++
    $script:LinesConverted += $originalLineCount
    return $true
}

# Function to convert test files
function Convert-TestFile {
    param([string]$JsPath)
    
    if (-not (Test-Path $JsPath)) { return $false }
    
    $content = Get-Content $JsPath -Raw
    $originalLineCount = ($content -split "`n").Length
    $tsPath = $JsPath -replace '\.js$', '.ts'
    
    # Test-specific TypeScript conversion
    $tsContent = $content
    
    # Convert Jest/Vitest imports
    $tsContent = $tsContent -replace 'const\s*{\s*([^}]+)\s*}\s*=\s*require\s*\(\s*["''`]vitest["''`]\s*\)', 'import { $1 } from ''vitest'';'
    $tsContent = $tsContent -replace 'const\s*{\s*([^}]+)\s*}\s*=\s*require\s*\(\s*["''`]@testing-library/([^"''`]+)["''`]\s*\)', 'import { $1 } from ''@testing-library/$2'';'
    
    # Add basic test type annotations
    $tsContent = $tsContent -replace 'test\s*\(\s*[\'"]([^\'"]+)[\'"]', 'test(''$1'''
    $tsContent = $tsContent -replace 'describe\s*\(\s*[\'"]([^\'"]+)[\'"]', 'describe(''$1'''
    $tsContent = $tsContent -replace 'it\s*\(\s*[\'"]([^\'"]+)[\'"]', 'it(''$1'''
    
    # Convert module exports for test utilities
    $tsContent = $tsContent -replace 'module\.exports\s*=\s*{', 'export default {'
    $tsContent = $tsContent -replace 'module\.exports\s*=\s*', 'export default '
    
    if (-not $DryRun) {
        Set-Content -Path $tsPath -Value $tsContent -Encoding UTF8
    }
    
    $newLineCount = ($tsContent -split "`n").Length
    if ($ShowDetails) {
        Write-Host "  🧪 Test JS→TS: $(Split-Path $JsPath -Leaf) → $(Split-Path $tsPath -Leaf)" -ForegroundColor Green
        Write-Host "    Lines: $originalLineCount → $newLineCount" -ForegroundColor Gray
    }
    
    $script:FilesConverted++
    $script:LinesConverted += $originalLineCount
    return $true
}

# Function to convert service/API files
function Convert-ServiceFile {
    param([string]$JsPath)
    
    if (-not (Test-Path $JsPath)) { return $false }
    
    $content = Get-Content $JsPath -Raw
    $originalLineCount = ($content -split "`n").Length
    $tsPath = $JsPath -replace '\.js$', '.ts'
    
    # Service-specific TypeScript conversion
    $tsContent = $content
    
    # Add type imports for common service patterns
    if ($tsContent -match "express|fastify|koa") {
        $tsContent = "import type { Request, Response, NextFunction } from 'express';`n" + $tsContent
    }
    
    if ($tsContent -match "axios|fetch|request") {
        $tsContent = "import type { AxiosResponse, AxiosError } from 'axios';`n" + $tsContent
    }
    
    # Convert common service patterns
    $tsContent = $tsContent -replace 'const\s+(\w+)\s*=\s*require\s*\(\s*["''`]express["''`]\s*\)', 'import express from ''express'';'
    $tsContent = $tsContent -replace 'const\s+(\w+)\s*=\s*require\s*\(\s*["''`]axios["''`]\s*\)', 'import axios from ''axios'';'
    
    # Add basic route handler types
    $tsContent = $tsContent -replace 'app\.(\w+)\s*\(\s*[\'"]([^\'"]+)[\'"],\s*([^)]+)\)', 'app.$1(''$2'', $3)'
    $tsContent = $tsContent -replace 'router\.(\w+)\s*\(\s*[\'"]([^\'"]+)[\'"],\s*([^)]+)\)', 'router.$1(''$2'', $3)'
    
    # Convert exports
    $tsContent = $tsContent -replace 'module\.exports\s*=\s*{', 'export default {'
    $tsContent = $tsContent -replace 'module\.exports\s*=\s*', 'export default '
    
    if (-not $DryRun) {
        Set-Content -Path $tsPath -Value $tsContent -Encoding UTF8
    }
    
    $newLineCount = ($tsContent -split "`n").Length
    if ($ShowDetails) {
        Write-Host "  ⚙️  Service JS→TS: $(Split-Path $JsPath -Leaf) → $(Split-Path $tsPath -Leaf)" -ForegroundColor Blue
        Write-Host "    Lines: $originalLineCount → $newLineCount" -ForegroundColor Gray
    }
    
    $script:FilesConverted++
    $script:LinesConverted += $originalLineCount
    return $true
}

# Main analysis and conversion logic
try {
    # Find all JavaScript files (excluding configs)
    $allJSFiles = @()
    
    # Scan apps directory
    if (Test-Path "apps") {
        Get-ChildItem -Path "apps" -Directory | ForEach-Object {
            $appDir = $_.FullName
            Get-ChildItem -Path $appDir -Filter "*.js" -Recurse -ErrorAction SilentlyContinue | 
            Where-Object { 
                $_.DirectoryName -notmatch "node_modules|\.git|dist|build|\.next|coverage" -and 
                $_.Name -notmatch "config\.js$" 
            } | ForEach-Object { 
                $allJSFiles += $_ 
            }
        }
    }
    
    # Scan packages directory
    if (Test-Path "packages") {
        Get-ChildItem -Path "packages" -Directory | ForEach-Object {
            $pkgDir = $_.FullName
            Get-ChildItem -Path $pkgDir -Filter "*.js" -Recurse -ErrorAction SilentlyContinue | 
            Where-Object { 
                $_.DirectoryName -notmatch "node_modules|\.git|dist|build|\.next|coverage" -and 
                $_.Name -notmatch "config\.js$" 
            } | ForEach-Object { 
                $allJSFiles += $_ 
            }
        }
    }
    
    Write-Host "`nFound $($allJSFiles.Count) JavaScript files to process" -ForegroundColor Cyan
    
    # Analysis mode
    if ($MigrationType -eq "analyze") {
        Write-Host "`n📊 FILE ANALYSIS:" -ForegroundColor Yellow
        Write-Host "==================" -ForegroundColor Yellow
        
        $complexityGroups = $allJSFiles | ForEach-Object {
            [PSCustomObject]@{
                File = $_.FullName
                Name = $_.Name
                Directory = Split-Path $_.DirectoryName -Leaf
                Complexity = Get-FileComplexity $_.FullName
                Size = $_.Length
            }
        } | Group-Object Complexity
        
        foreach ($group in $complexityGroups) {
            Write-Host "`n🔍 $($group.Name.ToUpper()) Complexity Files: $($group.Count)" -ForegroundColor Cyan
            $group.Group | Group-Object Directory | Sort-Object Count -Descending | Select-Object -First 5 | ForEach-Object {
                Write-Host "  📁 $($_.Name): $($_.Count) files" -ForegroundColor White
            }
        }
        
        # File type analysis
        Write-Host "`n📂 FILE TYPE BREAKDOWN:" -ForegroundColor Yellow
        $allJSFiles | ForEach-Object {
            $type = "utility"
            if ($_.DirectoryName -match "test|spec|__test__|__spec__") { $type = "test" }
            elseif ($_.DirectoryName -match "service|api|route|endpoint") { $type = "service" }
            elseif ($_.DirectoryName -match "component|ui|widget") { $type = "component" }
            elseif ($_.DirectoryName -match "util|helper|lib|tool") { $type = "utility" }
            elseif ($_.DirectoryName -match "src|source") { $type = "source" }
            
            [PSCustomObject]@{ Type = $type; File = $_ }
        } | Group-Object Type | Sort-Object Count -Descending | ForEach-Object {
            Write-Host "  📄 $($_.Name): $($_.Count) files" -ForegroundColor White
        }
        
        Write-Host "`n✨ Migration recommendations:" -ForegroundColor Green
        Write-Host "  1. Start with 'simple' complexity files (utilities, helpers)" -ForegroundColor White
        Write-Host "  2. Convert test files next (isolated and easier to validate)" -ForegroundColor White
        Write-Host "  3. Handle service/API files (may need more type definitions)" -ForegroundColor White
        Write-Host "  4. Address complex files last (may need manual intervention)" -ForegroundColor White
        
        return
    }
    
    # Filter files based on migration type
    $targetFiles = switch ($MigrationType) {
        "test" { $allJSFiles | Where-Object { $_.DirectoryName -match "test|spec|__test__|__spec__" } }
        "src" { $allJSFiles | Where-Object { $_.DirectoryName -match "src|source" } }
        "services" { $allJSFiles | Where-Object { $_.DirectoryName -match "service|api|route|endpoint" } }
        "utils" { $allJSFiles | Where-Object { $_.DirectoryName -match "util|helper|lib|tool" } }
        "components" { $allJSFiles | Where-Object { $_.DirectoryName -match "component|ui|widget" } }
        "all" { $allJSFiles }
        default { $allJSFiles | Select-Object -First $BatchSize }
    }
    
    Write-Host "`nProcessing $($targetFiles.Count) files..." -ForegroundColor Cyan
    
    $processedCount = 0
    foreach ($file in $targetFiles) {
        $processedCount++
        
        if ($processedCount % 10 -eq 0) {
            Write-Host "Progress: $processedCount/$($targetFiles.Count) files processed" -ForegroundColor Yellow
        }
        
        try {
            $complexity = Get-FileComplexity $file.FullName
            $converted = $false
            
            # Route to appropriate converter based on file type and complexity
            if ($file.DirectoryName -match "test|spec|__test__|__spec__") {
                $converted = Convert-TestFile $file.FullName
            }
            elseif ($file.DirectoryName -match "service|api|route|endpoint") {
                $converted = Convert-ServiceFile $file.FullName
            }
            elseif ($complexity -eq "simple" -or $complexity -eq "moderate") {
                $converted = Convert-SimpleJSFile $file.FullName
            }
            else {
                Write-Host "  ⚠️  Skipped complex file: $($file.Name) (requires manual conversion)" -ForegroundColor Yellow
                $script:SkippedFiles++
            }
            
        } catch {
            Write-Host "  ❌ Error processing $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
            $script:ErrorsFound++
        }
    }
    
    # Summary
    Write-Host "`n🎉 JAVASCRIPT TO TYPESCRIPT MODULE MIGRATION COMPLETE!" -ForegroundColor Green
    Write-Host "=======================================================" -ForegroundColor Green
    
    Write-Host "`n📊 CONVERSION RESULTS:" -ForegroundColor Cyan
    Write-Host "----------------------" -ForegroundColor Cyan
    Write-Host "✅ Files converted: $script:FilesConverted" -ForegroundColor Green
    Write-Host "📏 Lines converted: $script:LinesConverted" -ForegroundColor Green
    Write-Host "⏭️  Files skipped: $script:SkippedFiles" -ForegroundColor Yellow
    Write-Host "❌ Errors encountered: $script:ErrorsFound" -ForegroundColor Red
    
    if ($script:FilesConverted -gt 0) {
        Write-Host "`n✨ Next steps:" -ForegroundColor Green
        Write-Host "   1. Run 'pnpm type-check' to identify type errors" -ForegroundColor White
        Write-Host "   2. Install missing type definitions (@types/* packages)" -ForegroundColor White
        Write-Host "   3. Add proper type annotations to converted files" -ForegroundColor White
        Write-Host "   4. Update import statements in dependent files" -ForegroundColor White
        Write-Host "   5. Remove original .js files once TypeScript versions work" -ForegroundColor White
    }
    
} catch {
    Write-Host "`n❌ Error during module migration: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Gray
    exit 1
}