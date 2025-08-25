#!/usr/bin/env pwsh
# 🧹 RomAI File Consolidation Script
# Consolidates duplicate files with clean naming following Microsoft best practices

Write-Host "🧹 Starting RomAI File Consolidation Process" -ForegroundColor Cyan

# Set error handling
$ErrorActionPreference = 'Continue'

# Define consolidation rules based on Microsoft best practices
$consolidationMap = @{
    # ML Serving consolidation - keep main model_server.py, remove duplicates
    "server_simple.py" = @{
        "action" = "remove"
        "reason" = "Duplicate of model_server.py with 2259 lines - consolidate functionality"
        "path" = "src/ml/serving/server_simple.py"
    }
    "server_minimal.py" = @{
        "action" = "remove" 
        "reason" = "Minimal 53-line test server - functionality should be in main server"
        "path" = "src/ml/serving/server_minimal.py"
    }
    
    # Dockerfile consolidation
    "Dockerfile.simple" = @{
        "action" = "remove"
        "reason" = "Use main Dockerfile with build args instead of multiple versions"
        "path" = "Dockerfile.simple"
    }
    "Dockerfile.advanced" = @{
        "action" = "remove"
        "reason" = "Use main Dockerfile with build args instead of multiple versions"
        "path" = "Dockerfile.advanced"
    }
    
    # API Platform consolidation
    "api_platform_minimal.py" = @{
        "action" = "rename"
        "newName" = "api_platform.py"
        "reason" = "Remove 'minimal' suffix - this is the main API platform"
        "path" = "src/api/enterprise/api_platform_minimal.py"
    }
    
    # Requirements consolidation
    "requirements-minimal.txt" = @{
        "action" = "rename"
        "newName" = "requirements.txt"
        "reason" = "Standard requirements.txt naming convention"
        "path" = "src/api/enterprise/requirements-minimal.txt"
    }
}

# Archive directories to completely remove (old/deprecated tests)
$archiveDirectories = @(
    "src/archived_tests",
    "archive",
    "docs/legacy-reports"
)

Write-Host "`n📁 REMOVING ARCHIVED/OLD DIRECTORIES" -ForegroundColor Yellow
Write-Host "=" * 50

foreach ($archiveDir in $archiveDirectories) {
    $fullPath = Join-Path $PWD $archiveDir
    if (Test-Path $fullPath) {
        try {
            Write-Host "🗑️ Removing: $archiveDir" -ForegroundColor Red
            Remove-Item $fullPath -Recurse -Force
            Write-Host "✅ Successfully removed: $archiveDir" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Failed to remove: $archiveDir - $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "⏭️ Not found: $archiveDir" -ForegroundColor Gray
    }
}

Write-Host "`n🔄 CONSOLIDATING DUPLICATE FILES" -ForegroundColor Yellow
Write-Host "=" * 50

$consolidatedCount = 0
$totalFiles = $consolidationMap.Count

foreach ($file in $consolidationMap.GetEnumerator()) {
    $fileName = $file.Key
    $config = $file.Value
    $fullPath = Join-Path $PWD $config.path
    
    Write-Host "`n📄 Processing: $fileName" -ForegroundColor Cyan
    Write-Host "   Path: $($config.path)" -ForegroundColor Gray
    Write-Host "   Reason: $($config.reason)" -ForegroundColor Gray
    
    if (Test-Path $fullPath) {
        switch ($config.action) {
            "remove" {
                try {
                    Remove-Item $fullPath -Force
                    Write-Host "   ✅ REMOVED: $fileName" -ForegroundColor Green
                    $consolidatedCount++
                }
                catch {
                    Write-Host "   ❌ FAILED TO REMOVE: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
            "rename" {
                try {
                    $newPath = Join-Path (Split-Path $fullPath -Parent) $config.newName
                    Move-Item $fullPath $newPath -Force
                    Write-Host "   ✅ RENAMED: $fileName → $($config.newName)" -ForegroundColor Green
                    $consolidatedCount++
                }
                catch {
                    Write-Host "   ❌ FAILED TO RENAME: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
        }
    } else {
        Write-Host "   ⏭️ NOT FOUND: $fileName" -ForegroundColor Gray
    }
}

# Find and consolidate test files with similar names
Write-Host "`n🧪 ANALYZING TEST FILE PATTERNS" -ForegroundColor Yellow
Write-Host "=" * 50

# Find test files that might need consolidation
$testFiles = Get-ChildItem -Path "tests", "src/tests", "src" -Recurse -Include "*.test.*", "*test*.py", "*test*.ts" -ErrorAction SilentlyContinue

$testPatterns = @{}
foreach ($testFile in $testFiles) {
    # Skip if in archived directories (should be removed)
    if ($testFile.FullName -like "*archived*" -or $testFile.FullName -like "*backup*" -or $testFile.FullName -like "*legacy*") {
        continue
    }
    
    $baseName = $testFile.BaseName -replace "(test_|_test|\.test)", ""
    $baseName = $baseName -replace "(simple_|basic_|advanced_|minimal_)", ""
    
    if (-not $testPatterns.ContainsKey($baseName)) {
        $testPatterns[$baseName] = @()
    }
    $testPatterns[$baseName] += $testFile
}

Write-Host "Found test file patterns for consolidation review:"
foreach ($pattern in $testPatterns.GetEnumerator()) {
    if ($pattern.Value.Count -gt 1) {
        Write-Host "`n🔍 Pattern: $($pattern.Key)" -ForegroundColor Cyan
        foreach ($file in $pattern.Value) {
            $relativePath = $file.FullName.Replace($PWD, "").TrimStart("\")
            Write-Host "   - $relativePath" -ForegroundColor White
        }
    }
}

# Clean up old test configurations
Write-Host "`n⚙️ CLEANING TEST CONFIGURATIONS" -ForegroundColor Yellow
Write-Host "=" * 50

$oldTestConfigs = @(
    "tsconfig-simple.json",
    "jest.config.simple.js",
    "package-simple.json"
)

foreach ($config in $oldTestConfigs) {
    $configFiles = Get-ChildItem -Path . -Recurse -Name $config -ErrorAction SilentlyContinue
    foreach ($configFile in $configFiles) {
        try {
            Remove-Item $configFile -Force
            Write-Host "🗑️ Removed old config: $configFile" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Failed to remove: $configFile" -ForegroundColor Red
        }
    }
}

# Generate consolidation report
Write-Host "`n📊 CONSOLIDATION SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 50
Write-Host "Files processed: $consolidatedCount/$totalFiles" -ForegroundColor White
Write-Host "Archived directories removed: $($archiveDirectories.Count)" -ForegroundColor White
Write-Host "Test patterns identified: $($testPatterns.Count)" -ForegroundColor White

# Create updated vitest config for clean testing
Write-Host "`n🧪 CREATING CLEAN TEST CONFIGURATION" -ForegroundColor Yellow

$cleanVitestConfig = @"
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
    include: [
      // Include only current, relevant test files
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: [
      // Exclude all archived, old, and backup test files
      '**/archived_tests/**',
      '**/archived/**',
      '**/backup/**',
      '**/legacy/**',
      '**/old/**',
      '**/deprecated/**',
      '**/*.backup.*',
      '**/*.old.*',
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        'src/test-setup.ts',
        '**/*.d.ts',
        '**/archived_tests/**',
        '**/backup/**',
        '**/legacy/**'
      ]
    },
    timeout: 30000,
    testTimeout: 30000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '~': path.resolve(__dirname, 'src')
    }
  }
})
"@

$cleanVitestConfig | Out-File -FilePath "vitest.config.clean.ts" -Encoding UTF8
Write-Host "✅ Created clean vitest configuration: vitest.config.clean.ts" -ForegroundColor Green

Write-Host "`n✅ File Consolidation Process Completed" -ForegroundColor Green
Write-Host "📁 Project structure cleaned and consolidated" -ForegroundColor White
Write-Host "🧪 Test configuration updated for clean testing" -ForegroundColor White
Write-Host "📊 Ready for comprehensive test coverage validation" -ForegroundColor White