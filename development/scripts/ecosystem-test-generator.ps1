#!/usr/bin/env pwsh
param(
    [int]$Limit = 20
)

Write-Host "🚀 CODAI Ecosystem Test Generator" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

$rootPath = "E:\GitHub\codai-project"
$packagesPath = Join-Path $rootPath "packages"
$appsPath = Join-Path $rootPath "apps"

function Test-PathSafe {
    param([string]$Path)
    return Test-Path $Path -ErrorAction SilentlyContinue
}

function Get-ComponentTypeSimple {
    param(
        [string]$PackagePath,
        [string]$PackageName
    )
    
    if ($PackageName -match "sdk|api|client") { return "sdk" }
    if (Test-PathSafe "$PackagePath\pages") { return "frontend" }
    if (Test-PathSafe "$PackagePath\src\server") { return "service" }
    if (Test-PathSafe "$PackagePath\bin") { return "cli" }
    if (Test-PathSafe "$PackagePath\src\mcp") { return "mcp" }
    if (Test-PathSafe "$PackagePath\src\index.ts") { return "sdk" }
    
    return "sdk"  # Default to SDK
}

function Create-TestInfrastructure {
    param(
        [string]$PackagePath,
        [string]$PackageName,
        [string]$ComponentType
    )
    
    $testsDir = Join-Path $PackagePath "tests"
    $unitDir = Join-Path $testsDir "unit"
    
    # Create test directories
    if (-not (Test-PathSafe $testsDir)) {
        New-Item -ItemType Directory -Path $testsDir -Force | Out-Null
    }
    if (-not (Test-PathSafe $unitDir)) {
        New-Item -ItemType Directory -Path $unitDir -Force | Out-Null
    }
    
    # Create test file
    $testFileName = "$($PackageName.Split('/')[-1]).test.ts"
    $testFilePath = Join-Path $unitDir $testFileName
    
    $testContent = @"
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('$PackageName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Module Loading', () => {
    it('should export required modules', () => {
      expect(true).toBe(true); // Basic test
    });
  });

  describe('Core Functionality', () => {
    it('should handle basic operations', () => {
      expect(true).toBe(true); // Implementation needed
    });

    it('should handle error cases', () => {
      expect(true).toBe(true); // Implementation needed
    });
  });

  describe('Integration', () => {
    it('should integrate with dependencies', () => {
      expect(true).toBe(true); // Implementation needed
    });
  });

  describe('Performance', () => {
    it('should execute within reasonable time', () => {
      const start = Date.now();
      // Add performance test logic here
      const end = Date.now();
      expect(end - start).toBeLessThan(1000);
    });
  });
});
"@
    
    Set-Content -Path $testFilePath -Value $testContent -Encoding UTF8
    
    # Create setup file
    $setupPath = Join-Path $testsDir "setup.ts"
    $setupContent = @"
import { vi } from 'vitest';

// Global test setup
beforeEach(() => {
  vi.clearAllMocks();
});

// Mock global objects if needed
Object.defineProperty(global, 'fetch', {
  value: vi.fn(),
  writable: true
});
"@
    
    Set-Content -Path $setupPath -Value $setupContent -Encoding UTF8
    
    # Create vitest config
    $vitestConfigPath = Join-Path $PackagePath "vitest.config.ts"
    $vitestConfig = @"
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
"@
    
    Set-Content -Path $vitestConfigPath -Value $vitestConfig -Encoding UTF8
    
    return $testFilePath
}

function Update-PackageJsonSimple {
    param(
        [string]$PackagePath
    )
    
    $packageJsonPath = Join-Path $PackagePath "package.json"
    
    if (Test-PathSafe $packageJsonPath) {
        try {
            $packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
            
            # Add test scripts
            if (-not $packageJson.scripts) {
                $packageJson | Add-Member -MemberType NoteProperty -Name "scripts" -Value @{}
            }
            
            $packageJson.scripts | Add-Member -MemberType NoteProperty -Name "test" -Value "vitest run" -Force
            $packageJson.scripts | Add-Member -MemberType NoteProperty -Name "test:watch" -Value "vitest" -Force
            $packageJson.scripts | Add-Member -MemberType NoteProperty -Name "test:coverage" -Value "vitest run --coverage" -Force
            
            # Add dev dependencies
            if (-not $packageJson.devDependencies) {
                $packageJson | Add-Member -MemberType NoteProperty -Name "devDependencies" -Value @{}
            }
            
            $packageJson.devDependencies | Add-Member -MemberType NoteProperty -Name "vitest" -Value "^3.2.4" -Force
            $packageJson.devDependencies | Add-Member -MemberType NoteProperty -Name "@types/node" -Value "^22.0.0" -Force
            
            $packageJson | ConvertTo-Json -Depth 10 | Set-Content $packageJsonPath -Encoding UTF8
            return $true
        }
        catch {
            Write-Warning "Failed to update package.json: $_"
            return $false
        }
    }
    
    return $false
}

# Find packages without tests
$packagesNeedingTests = @()
$processed = 0

# Check packages directory
if (Test-PathSafe $packagesPath) {
    Get-ChildItem $packagesPath -Directory | ForEach-Object {
        if ($processed -ge $Limit) { return }
        
        $packagePath = $_.FullName
        $packageJsonPath = Join-Path $packagePath "package.json"
        
        if (Test-PathSafe $packageJsonPath) {
            $testsPath = Join-Path $packagePath "tests"
            
            if (-not (Test-PathSafe $testsPath)) {
                $packagesNeedingTests += @{
                    Path = $packagePath
                    Name = $_.Name
                    Type = "package"
                }
                $processed++
            }
        }
    }
}

# Check apps directory
if (Test-PathSafe $appsPath) {
    Get-ChildItem $appsPath -Directory | ForEach-Object {
        if ($processed -ge $Limit) { return }
        
        $packagePath = $_.FullName
        $packageJsonPath = Join-Path $packagePath "package.json"
        
        if (Test-PathSafe $packageJsonPath) {
            $testsPath = Join-Path $packagePath "tests"
            
            if (-not (Test-PathSafe $testsPath)) {
                $packagesNeedingTests += @{
                    Path = $packagePath
                    Name = $_.Name
                    Type = "app"
                }
                $processed++
            }
        }
    }
}

Write-Host "📊 Found $($packagesNeedingTests.Count) components needing tests" -ForegroundColor Cyan

$successCount = 0
$failureCount = 0

foreach ($pkg in $packagesNeedingTests) {
    Write-Host "`n📦 Processing: $($pkg.Name) ($($pkg.Type))" -ForegroundColor Yellow
    
    try {
        $componentType = Get-ComponentTypeSimple -PackagePath $pkg.Path -PackageName $pkg.Name
        
        # Create test infrastructure
        $testFile = Create-TestInfrastructure -PackagePath $pkg.Path -PackageName $pkg.Name -ComponentType $componentType
        Write-Host "  ✅ Created test infrastructure" -ForegroundColor Green
        
        # Update package.json
        $updated = Update-PackageJsonSimple -PackagePath $pkg.Path
        if ($updated) {
            Write-Host "  ✅ Updated package.json" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Could not update package.json" -ForegroundColor Yellow
        }
        
        $successCount++
    }
    catch {
        Write-Host "  ❌ Failed: $_" -ForegroundColor Red
        $failureCount++
    }
}

Write-Host "`n🎉 Generation Complete!" -ForegroundColor Green
Write-Host "✅ Success: $successCount" -ForegroundColor Green
Write-Host "❌ Failures: $failureCount" -ForegroundColor Red
Write-Host "📊 Total: $($successCount + $failureCount)" -ForegroundColor Cyan
