#!/usr/bin/env pwsh

param(
    [Parameter()]
    [string]$Mode = "list",
    
    [Parameter()]
    [string[]]$Files = @(),
    
    [Parameter()]
    [switch]$DryRun = $false
)

Write-Host "🚀 Focused JavaScript to TypeScript Migration Tool" -ForegroundColor Cyan
Write-Host "Mode: $Mode" -ForegroundColor Yellow

# High-value files to convert first
$HighValueFiles = @(
    "production-test-suite.js",
    "scripts\dev-helper.js", 
    "tests\test-setup.js",
    "scripts\run-comprehensive-tests.js",
    "scripts\validate-deployment.js",
    "scripts\production-test-suite.js",
    "scripts\phase4-gateway.js"
)

# Utility and library files
$UtilityFiles = @(
    "libs\advanced-visualizations\index.js",
    "libs\quality-gates\index.js", 
    "libs\dev-workflows\index.js",
    "libs\dev-environment\index.js",
    "libs\microservice-orchestration\index.js"
)

# Test files
$TestFiles = @(
    "security\security-test.js",
    "security\owasp\security-scanner.js",
    "tests\accessibility\accessibility-tester.js",
    "tests\comprehensive-validation-suite.js",
    "tests\comprehensive-testing-suite.js",
    "tests\e2e\codai-playwright-tester.js"
)

function Convert-JSToTS {
    param($FilePath)
    
    if (-not (Test-Path $FilePath)) {
        Write-Host "  ⚠️  File not found: $FilePath" -ForegroundColor Yellow
        return $false
    }
    
    $tsPath = $FilePath -replace '\.js$', '.ts'
    
    if (Test-Path $tsPath) {
        Write-Host "  ⏭️  TypeScript version exists: $FilePath" -ForegroundColor Gray
        return $false
    }
    
    if ($DryRun) {
        Write-Host "  🔍 Would convert: $FilePath → $tsPath" -ForegroundColor Cyan
        return $true
    }
    
    try {
        # Read content
        $content = Get-Content $FilePath -Raw -Encoding UTF8
        
        # Basic CommonJS to ES modules conversion
        $content = $content -replace 'const\s+(.+?)\s*=\s*require\([''"](.+?)[''"]\)', 'import $1 from ''$2'''
        $content = $content -replace 'module\.exports\s*=\s*(.+)', 'export default $1'
        $content = $content -replace 'module\.exports\.(\w+)\s*=', 'export const $1 ='
        $content = $content -replace 'exports\.(\w+)\s*=', 'export const $1 ='
        
        # Add basic TypeScript types for common patterns
        $content = $content -replace 'function\s+(\w+)\s*\(([^)]*)\)\s*\{', 'function $1($2): any {'
        
        # Write TypeScript file
        $content | Set-Content $tsPath -Encoding UTF8
        
        Write-Host "  ✅ Converted: $FilePath → $tsPath" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "  ❌ Failed to convert: $FilePath - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

switch ($Mode) {
    "list" {
        Write-Host "`n📋 Available file categories:" -ForegroundColor Cyan
        Write-Host "  🎯 high-value: $($HighValueFiles.Count) critical script files" -ForegroundColor Green
        Write-Host "  📦 utility: $($UtilityFiles.Count) library and utility files" -ForegroundColor Blue  
        Write-Host "  🧪 test: $($TestFiles.Count) test and validation files" -ForegroundColor Magenta
        Write-Host "`n💡 Usage examples:" -ForegroundColor Yellow
        Write-Host "  .\scripts\focused-js-to-ts.ps1 -Mode high-value" -ForegroundColor Gray
        Write-Host "  .\scripts\focused-js-to-ts.ps1 -Mode utility -DryRun" -ForegroundColor Gray
        Write-Host "  .\scripts\focused-js-to-ts.ps1 -Mode test" -ForegroundColor Gray
    }
    
    "high-value" {
        Write-Host "`n🎯 Converting high-value script files..." -ForegroundColor Green
        $converted = 0
        foreach ($file in $HighValueFiles) {
            if (Convert-JSToTS $file) { $converted++ }
        }
        Write-Host "`n✨ Converted $converted high-value files!" -ForegroundColor Green
    }
    
    "utility" {
        Write-Host "`n📦 Converting utility library files..." -ForegroundColor Blue
        $converted = 0
        foreach ($file in $UtilityFiles) {
            if (Convert-JSToTS $file) { $converted++ }
        }
        Write-Host "`n✨ Converted $converted utility files!" -ForegroundColor Blue
    }
    
    "test" {
        Write-Host "`n🧪 Converting test files..." -ForegroundColor Magenta
        $converted = 0
        foreach ($file in $TestFiles) {
            if (Convert-JSToTS $file) { $converted++ }
        }
        Write-Host "`n✨ Converted $converted test files!" -ForegroundColor Magenta
    }
    
    "custom" {
        if ($Files.Count -eq 0) {
            Write-Host "❌ No files specified for custom conversion" -ForegroundColor Red
            exit 1
        }
        Write-Host "`n🔧 Converting custom files..." -ForegroundColor Cyan
        $converted = 0
        foreach ($file in $Files) {
            if (Convert-JSToTS $file) { $converted++ }
        }
        Write-Host "`n✨ Converted $converted custom files!" -ForegroundColor Cyan
    }
    
    default {
        Write-Host "❌ Unknown mode: $Mode" -ForegroundColor Red
        Write-Host "Available modes: list, high-value, utility, test, custom" -ForegroundColor Yellow
    }
}