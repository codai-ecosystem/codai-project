#!/usr/bin/env pwsh
# Test Infrastructure Rollout Script
# Systematically applies proven test fixes to all packages

param(
    [string[]]$Packages = @("api-keys", "auth", "config", "deployment", "eslint-config")
)

Write-Host "🚀 Starting Test Infrastructure Rollout for packages: $($Packages -join ', ')" -ForegroundColor Green

$TotalPackages = $Packages.Count
$SuccessCount = 0
$FailureCount = 0
$Results = @()

foreach ($Package in $Packages) {
    Write-Host "`n📦 Processing package: $Package" -ForegroundColor Cyan
    
    $PackagePath = "E:\GitHub\codai-project\packages\$Package"
    
    if (-not (Test-Path $PackagePath)) {
        Write-Host "❌ Package not found: $Package" -ForegroundColor Red
        $FailureCount++
        continue
    }
    
    # Step 1: Fix import path in test file
    $TestFile = "$PackagePath\tests\unit\$Package.test.ts"
    if (Test-Path $TestFile) {
        Write-Host "  🔧 Fixing import path in test file" -ForegroundColor Yellow
        (Get-Content $TestFile) -replace "from '\.\./src/index'", "from '../../src/index'" | Set-Content $TestFile
    }
    
    # Step 2: Create setup.ts file if missing
    $SetupFile = "$PackagePath\tests\setup.ts"
    if (-not (Test-Path $SetupFile)) {
        Write-Host "  📝 Creating setup.ts file" -ForegroundColor Yellow
        
        $SetupContent = @"
/**
 * 🧪 $Package Package Test Setup
 * Global test configuration and mocks for $Package package testing
 */

import { vi } from 'vitest';

// Mock console for testing output
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'info').mockImplementation(() => {});

// Mock fetch for HTTP requests
global.fetch = vi.fn();

// Set up global test utilities
global.beforeEach = () => {
  vi.clearAllMocks();
};

// Clean up after each test
global.afterEach = () => {
  vi.restoreAllMocks();
};
"@
        Set-Content $SetupFile $SetupContent
    }
    
    # Step 3: Update package.json to use vitest
    $PackageJsonFile = "$PackagePath\package.json"
    if (Test-Path $PackageJsonFile) {
        Write-Host "  ⚙️ Updating package.json to use vitest" -ForegroundColor Yellow
        (Get-Content $PackageJsonFile) -replace '"test": "jest"', '"test": "vitest run"' | Set-Content $PackageJsonFile
    }
    
    # Step 4: Update vitest.config.ts for node environment
    $VitestConfig = "$PackagePath\vitest.config.ts"
    if (Test-Path $VitestConfig) {
        Write-Host "  🔧 Updating vitest config for node environment" -ForegroundColor Yellow
        $ConfigContent = @"
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    name: 'pkg-$Package',
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**'
      ],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
"@
        Set-Content $VitestConfig $ConfigContent
    }
    
    # Step 5: Test the package
    Write-Host "  🧪 Running tests for $Package" -ForegroundColor Yellow
    
    Push-Location $PackagePath
    $TestResult = & pnpm test 2>&1
    $TestExitCode = $LASTEXITCODE
    Pop-Location
    
    if ($TestExitCode -eq 0) {
        Write-Host "  ✅ Tests passed for $Package" -ForegroundColor Green
        $SuccessCount++
        $Results += [PSCustomObject]@{
            Package = $Package
            Status = "SUCCESS"
            Output = "Tests passed"
        }
    } else {
        Write-Host "  ❌ Tests failed for $Package" -ForegroundColor Red
        $FailureCount++
        $Results += [PSCustomObject]@{
            Package = $Package
            Status = "FAILED"
            Output = $TestResult[-5..-1] -join "`n"
        }
    }
}

# Summary
Write-Host "`n📊 Test Infrastructure Rollout Summary" -ForegroundColor Magenta
Write-Host "Total Packages: $TotalPackages" -ForegroundColor White
Write-Host "Successful: $SuccessCount" -ForegroundColor Green
Write-Host "Failed: $FailureCount" -ForegroundColor Red
Write-Host "Success Rate: $([math]::Round(($SuccessCount / $TotalPackages) * 100, 2))%" -ForegroundColor Cyan

# Detailed Results
Write-Host "`n📋 Detailed Results:" -ForegroundColor Magenta
$Results | Format-Table -AutoSize

Write-Host "`n🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "- Review failed packages and address specific issues" -ForegroundColor White
Write-Host "- Continue with remaining packages in the ecosystem" -ForegroundColor White
Write-Host "- Monitor overall test infrastructure completion progress" -ForegroundColor White
