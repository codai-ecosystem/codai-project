#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Clean Test Suite Runner for RomAI Project
.DESCRIPTION
    Runs only relevant, current tests for RomAI project, excluding old/archived tests.
    Ensures comprehensive test coverage focusing on core functionality.
#>

Write-Host '🧪 ROMAI CLEAN TEST SUITE' -ForegroundColor Green
Write-Host '=========================' 

# Step 1: Create updated vitest config excluding old tests
Write-Host '⚙️ Updating RomAI test configuration...' -ForegroundColor Cyan

$cleanVitestConfig = @"
import { defineConfig } from 'vitest/config';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    name: 'romai-clean',
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    include: [
      // Only include current, relevant tests
      'src/components/**/*.{test,spec}.{ts,tsx}',
      'src/app/**/*.{test,spec}.{ts,tsx}',
      'tests/comprehensive/**/*.{test,spec}.{ts,tsx}',
      'tests/frontend/**/*.{test,spec}.{ts,tsx}',
      'tests/integration/**/*.{test,spec}.{ts,tsx}',
      'tests/romai.test.tsx'
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      '.next/**',
      'archive/**',
      'backup_naming_cleanup/**',
      'e2e/**',
      'src/tests/**', // Old test structure
      'tests/backend/**', // Server tests run separately
      'tests/ml/**', // Python ML tests run separately
      '**/*.e2e.{test,spec}.{js,ts}',
      '**/playwright/**',
      '**/*old*.{test,spec}.{js,ts}',
      '**/*archive*.{test,spec}.{js,ts}',
      '**/*deprecated*.{test,spec}.{js,ts}'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        'archive/**',
        '.next/**',
        'e2e/**',
        'dist/**',
        'public/**',
        '**/*.test.{ts,tsx,js,jsx}',
        '**/*.spec.{ts,tsx,js,jsx}'
      ],
      thresholds: {
        global: {
          branches: 60,
          functions: 60,
          lines: 60,
          statements: 60
        }
      }
    },
    pool: 'forks',
    maxConcurrency: 1,
    retry: 1
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
"@

Set-Content -Path 'apps/romai/vitest.config.clean.ts' -Value $cleanVitestConfig

Write-Host '  ✅ Created clean vitest config' -ForegroundColor Green

# Step 2: Run focused test suites
Write-Host '🧪 Running RomAI focused test suite...' -ForegroundColor Cyan

$testResults = @{}

# Frontend component tests
Write-Host '📋 Testing Frontend Components...' -ForegroundColor Yellow
try {
    Push-Location 'apps/romai'
    $output = npx vitest run --config vitest.config.clean.ts --reporter=basic 2>&1
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host '  ✅ Frontend tests PASSED' -ForegroundColor Green
        $testResults['Frontend'] = 'PASSED'
    } else {
        Write-Host '  ❌ Frontend tests FAILED' -ForegroundColor Red
        $testResults['Frontend'] = 'FAILED'
        Write-Host "Exit code: $exitCode" -ForegroundColor Yellow
    }
} catch {
    Write-Host '  💥 Frontend tests ERROR' -ForegroundColor Red
    $testResults['Frontend'] = 'ERROR'
} finally {
    Pop-Location
}

# API Health tests
Write-Host '📋 Testing API Health...' -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri 'http://localhost:6101/health' -Method Get -TimeoutSec 5
    if ($healthResponse.status -eq 'healthy') {
        Write-Host '  ✅ API Health PASSED' -ForegroundColor Green
        $testResults['API Health'] = 'PASSED'
    } else {
        Write-Host '  ❌ API Health FAILED' -ForegroundColor Red
        $testResults['API Health'] = 'FAILED'
    }
} catch {
    Write-Host '  ❌ API Health ERROR' -ForegroundColor Red
    $testResults['API Health'] = 'ERROR'
}

# Core functionality test
Write-Host '📋 Testing Core AGI Functionality...' -ForegroundColor Yellow
try {
    $testQuery = @{
        text = "Test basic functionality"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri 'http://localhost:6101/reasoning' -Method Post -Body $testQuery -ContentType 'application/json' -TimeoutSec 10
    
    if ($response.response -and $response.confidence) {
        Write-Host '  ✅ Core AGI PASSED' -ForegroundColor Green
        $testResults['Core AGI'] = 'PASSED'
    } else {
        Write-Host '  ❌ Core AGI FAILED' -ForegroundColor Red
        $testResults['Core AGI'] = 'FAILED'
    }
} catch {
    Write-Host '  ❌ Core AGI ERROR' -ForegroundColor Red
    $testResults['Core AGI'] = 'ERROR'
}

# Summary
Write-Host "`n📊 ROMAI CLEAN TEST SUMMARY" -ForegroundColor Green
Write-Host '============================'

$passed = ($testResults.Values | Where-Object { $_ -eq "PASSED" }).Count
$failed = ($testResults.Values | Where-Object { $_ -eq "FAILED" }).Count
$errors = ($testResults.Values | Where-Object { $_ -eq "ERROR" }).Count

foreach ($test in $testResults.GetEnumerator()) {
    $status = $test.Value
    $color = switch ($status) {
        'PASSED' { 'Green' }
        'FAILED' { 'Red' }
        'ERROR' { 'Magenta' }
        default { 'White' }
    }
    Write-Host "  $($test.Key): " -NoNewline
    Write-Host $status -ForegroundColor $color
}

Write-Host "`n📈 Results:"
Write-Host "✅ Passed: $passed" -ForegroundColor Green
Write-Host "❌ Failed: $failed" -ForegroundColor Red  
Write-Host "💥 Errors: $errors" -ForegroundColor Red

# Deployment readiness
if ($failed -eq 0 -and $errors -eq 0) {
    Write-Host "`n🚀 ROMAI IS DEPLOYMENT READY!" -ForegroundColor Green
    Write-Host "All core functionality tests passed successfully." -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n🛑 ROMAI NOT DEPLOYMENT READY" -ForegroundColor Red
    Write-Host "Fix failing tests before deployment." -ForegroundColor Red
    exit 1
}