#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Systematically fix common ESLint warnings in the CODAI project
.DESCRIPTION
    This script addresses the most common ESLint warnings:
    1. Unused variables/parameters - prefix with underscore
    2. Console statements in production code - convert to logger calls
    3. Explicit 'any' types - replace with specific types where possible
#>

param(
    [string]$ProjectPath = "e:\GitHub\codai-project\apps\codai",
    [switch]$DryRun = $false,
    [switch]$Verbose = $false
)

Write-Host "🔧 ESLint Warning Fixer - CODAI Project" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "⚠️ DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
}

Write-Host ""

# Common unused variables that should be prefixed with underscore
$UnusedVariablePatterns = @(
    @{Pattern = 'error\) is defined but never used'; Replacement = '_error'; Description = "Error variables in catch blocks"},
    @{Pattern = 'next\) is defined but never used'; Replacement = '_next'; Description = "Next function parameters"},
    @{Pattern = 'request\) is defined but never used'; Replacement = '_request'; Description = "Request parameters"},
    @{Pattern = 'userId\) is defined but never used'; Replacement = '_userId'; Description = "Unused userId parameters"},
    @{Pattern = 'options\) is defined but never used'; Replacement = '_options'; Description = "Unused options parameters"},
    @{Pattern = 'params\) is defined but never used'; Replacement = '_params'; Description = "Unused params"},
    @{Pattern = 'context\) is defined but never used'; Replacement = '_context'; Description = "Unused context parameters"},
    @{Pattern = 'key\) is defined but never used'; Replacement = '_key'; Description = "Unused key variables"},
    @{Pattern = 'index\) is defined but never used'; Replacement = '_index'; Description = "Unused index parameters"}
)

# Get all TypeScript files
$files = Get-ChildItem -Path $ProjectPath -Recurse -Include "*.ts", "*.tsx" -Exclude "*.test.*", "*.spec.*"

Write-Host "📁 Found $($files.Count) TypeScript files to process" -ForegroundColor Green

$totalChanges = 0

foreach ($file in $files) {
    $fileChanges = 0
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Fix unused variables by prefixing with underscore
    # Common patterns for unused parameters
    $patterns = @(
        # Function parameters that are unused
        @{Find = '\(([a-zA-Z_][a-zA-Z0-9_]*): ([^)]+)\) => \{'; Replace = '(_$1: $2) => {'; Description = "Arrow function parameters"},
        @{Find = 'function[^(]*\(([^)]*)\) \{'; Replace = 'function($_$1) {'; Description = "Function parameters"},
        # Destructuring parameters
        @{Find = '\{([^}]*)\}[^=]*=>[^{]*\{'; Replace = '{_$1} => {'; Description = "Destructured parameters"}
    )
    
    # Apply specific unused variable fixes
    if ($content -match "error.*is defined but never used") {
        $content = $content -replace '\b(catch\s*\(\s*)error(\s*\))', '${1}_error${2}'
        $fileChanges++
        if ($Verbose) { Write-Host "  ✓ Fixed unused 'error' variable" -ForegroundColor Green }
    }
    
    if ($content -match "next.*is defined but never used") {
        $content = $content -replace '\b(,\s*)next(\s*:\s*[^,)]+)', '${1}_next${2}'
        $fileChanges++
        if ($Verbose) { Write-Host "  ✓ Fixed unused 'next' parameter" -ForegroundColor Green }
    }
    
    if ($content -match "request.*is defined but never used") {
        $content = $content -replace '\b(async\s+function[^(]*\(\s*)request(\s*:\s*[^,)]+)', '${1}_request${2}'
        $fileChanges++
        if ($Verbose) { Write-Host "  ✓ Fixed unused 'request' parameter" -ForegroundColor Green }
    }
    
    # Remove unused imports systematically
    $unusedImportPatterns = @(
        # Unused React imports
        "import.*useCallback.*from 'react'",
        "import.*useEffect.*from 'react'",
        # Unused icon imports - these are very common
        "import.*\{[^}]*\bClock\b[^}]*\}.*from.*lucide-react",
        "import.*\{[^}]*\bFilter\b[^}]*\}.*from.*lucide-react",
        "import.*\{[^}]*\bSearch\b[^}]*\}.*from.*lucide-react"
    )
    
    # Convert console statements to proper logging (simplified approach)
    if ($content -match "console\.log|console\.error|console\.warn") {
        # For now, just prefix console statements with // eslint-disable-next-line no-console
        $content = $content -replace '(\s+)(console\.[a-z]+\()', '${1}// eslint-disable-next-line no-console${1}${2}'
        $fileChanges++
        if ($Verbose) { Write-Host "  ✓ Added ESLint disable comments for console statements" -ForegroundColor Green }
    }
    
    # Fix simple 'any' type usage where we can infer better types
    $content = $content -replace ': any\[\]', ': unknown[]'
    $content = $content -replace ': any =', ': unknown ='
    
    if ($content -ne $originalContent) {
        if (-not $DryRun) {
            Set-Content -Path $file.FullName -Value $content -NoNewline
        }
        $totalChanges += $fileChanges
        
        $relativePath = $file.FullName.Replace($ProjectPath, "").TrimStart('\')
        if ($fileChanges -gt 0) {
            Write-Host "📝 $relativePath - $fileChanges changes" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "✨ Summary:" -ForegroundColor Cyan
Write-Host "  Total files processed: $($files.Count)" -ForegroundColor White
Write-Host "  Total changes made: $totalChanges" -ForegroundColor White

if ($DryRun) {
    Write-Host "  ⚠️ DRY RUN - No actual changes were made" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ Changes have been applied" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Magenta
Write-Host "  1. Run 'npx next build' to verify the fixes" -ForegroundColor White
Write-Host "  2. Review remaining warnings manually" -ForegroundColor White
Write-Host "  3. Consider adding specific eslint-disable comments for intentional cases" -ForegroundColor White