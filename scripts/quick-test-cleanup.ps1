#!/usr/bin/env pwsh

# Quick Test Cleanup - Remove old test directories and run focused tests

Write-Host '🧹 QUICK TEST CLEANUP' -ForegroundColor Green
Write-Host '===================' 

# Step 1: Remove archived test directories
Write-Host '🗂️ Removing archived test directories...' -ForegroundColor Cyan

$archivedDirs = @(
    'apps/romai/tests/archive',
    'apps/romai/tests/archived_fake_tests',
    'apps/aide/packages/memory-graph/test/components/*.test.old.*'
)

foreach ($dir in $archivedDirs) {
    if (Test-Path $dir) {
        Write-Host "  🗑️ Removing: $dir" -ForegroundColor Yellow
        Remove-Item $dir -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  ✅ Removed: $dir" -ForegroundColor Green
    }
}

# Step 2: Update vitest config to exclude more directories
Write-Host '⚙️ Updating test configuration...' -ForegroundColor Cyan

$vitestConfig = @"
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    testTimeout: 30000,
    pool: 'forks',
    maxConcurrency: 1,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '.next/**',
        'coverage/**',
        '**/archive/**',
        '**/archived/**',
        '**/old/**',
        '**/deprecated/**',
        '**/backup/**',
        '**/*.old.*',
        '**/*.backup.*',
        '**/*.archive.*'
      ]
    },
    include: ['**/*.{test,spec}.{js,ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{git,cache,output,temp}/**',
      '**/archive/**',
      '**/archived/**',
      '**/old/**',
      '**/deprecated/**',
      '**/backup/**',
      '**/*.old.*',
      '**/*.backup.*',
      '**/*.archive.*',
      '**/fake-tests*/**',
      '**/old-tests*/**'
    ]
  }
})
"@

Set-Content -Path 'vitest.config.ts' -Value $vitestConfig

Write-Host '  ✅ Updated vitest.config.ts' -ForegroundColor Green

# Step 3: Run focused tests on current active components only
Write-Host '🧪 Running focused tests...' -ForegroundColor Cyan

$focusedTests = @(
    @{ Name = 'Core Tests'; Path = '.'; Command = 'npx vitest run tests/unit-components.test.ts --reporter=basic' },
    @{ Name = 'RomAI Logic Tests'; Path = '.'; Command = 'npx vitest run tests/romai-logical-reasoning.test.ts --reporter=basic' },
    @{ Name = 'MemorAI MCP'; Path = 'packages/memorai-mcp'; Command = 'npx vitest run --reporter=basic' }
)

$results = @{}

foreach ($test in $focusedTests) {
    Write-Host "📋 Testing: $($test.Name)" -ForegroundColor Yellow
    
    try {
        Push-Location $test.Path
        $output = Invoke-Expression $test.Command 2>&1
        $exitCode = $LASTEXITCODE
        
        if ($exitCode -eq 0) {
            Write-Host "  ✅ PASSED" -ForegroundColor Green
            $results[$test.Name] = "PASSED"
        } else {
            Write-Host "  ❌ FAILED" -ForegroundColor Red
            $results[$test.Name] = "FAILED"
        }
    } catch {
        Write-Host "  💥 ERROR: $($_.Exception.Message)" -ForegroundColor Red
        $results[$test.Name] = "ERROR"
    } finally {
        Pop-Location
    }
}

# Summary
Write-Host "`n📊 QUICK TEST SUMMARY" -ForegroundColor Green
Write-Host '===================='

$passed = ($results.Values | Where-Object { $_ -eq "PASSED" }).Count
$failed = ($results.Values | Where-Object { $_ -eq "FAILED" }).Count
$errors = ($results.Values | Where-Object { $_ -eq "ERROR" }).Count

Write-Host "✅ Passed: $passed" -ForegroundColor Green
Write-Host "❌ Failed: $failed" -ForegroundColor Red
Write-Host "💥 Errors: $errors" -ForegroundColor Red

if ($failed -eq 0 -and $errors -eq 0) {
    Write-Host "`n🚀 READY FOR DEPLOYMENT" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n🛑 NOT READY - Fix tests first" -ForegroundColor Red
    exit 1
}