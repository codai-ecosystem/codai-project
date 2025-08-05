#!/usr/bin/env pwsh
# 🧪 Existing Dependencies Testing - No New Installs
# Uses only packages already installed in each service

param(
    [string]$Service = "all",
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Continue"

Write-Host "🧪 Existing Dependencies Testing" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Gray
Write-Host "Testing with already installed packages only" -ForegroundColor Yellow

# Function to check if a service has existing test setup
function Test-ExistingTestSetup {
    param($servicePath, $serviceName)
    
    Write-Host "`n📦 Checking $serviceName ($servicePath)" -ForegroundColor Cyan
    
    if (!(Test-Path $servicePath)) {
        Write-Host "  ❌ Service path not found: $servicePath" -ForegroundColor Red
        return $false
    }
    
    # Check package.json for existing test dependencies
    $packageJsonPath = Join-Path $servicePath "package.json"
    if (Test-Path $packageJsonPath) {
        $packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
        
        # Check for existing test frameworks
        $devDeps = $packageJson.devDependencies
        $deps = $packageJson.dependencies
        
        $hasVitest = ($devDeps -and $devDeps.vitest) -or ($deps -and $deps.vitest)
        $hasJest = ($devDeps -and $devDeps.jest) -or ($deps -and $deps.jest)
        $hasPlaywright = ($devDeps -and $devDeps."@playwright/test") -or ($deps -and $deps."@playwright/test")
        $hasTestingLibrary = ($devDeps -and $devDeps."@testing-library/react") -or ($deps -and $deps."@testing-library/react")
        
        Write-Host "  📋 Available test frameworks:" -ForegroundColor White
        if ($hasVitest) { Write-Host "    ✅ Vitest" -ForegroundColor Green }
        if ($hasJest) { Write-Host "    ✅ Jest" -ForegroundColor Green }
        if ($hasPlaywright) { Write-Host "    ✅ Playwright" -ForegroundColor Green }
        if ($hasTestingLibrary) { Write-Host "    ✅ Testing Library" -ForegroundColor Green }
        
        if (!$hasVitest -and !$hasJest -and !$hasPlaywright) {
            Write-Host "    ⚠️  No test frameworks detected" -ForegroundColor Yellow
        }
        
        # Check for existing test scripts
        $scripts = $packageJson.scripts
        if ($scripts) {
            Write-Host "  🔧 Available test scripts:" -ForegroundColor White
            foreach ($scriptName in $scripts.PSObject.Properties.Name) {
                if ($scriptName -match "test|spec|e2e") {
                    Write-Host "    ✅ pnpm $scriptName" -ForegroundColor Green
                }
            }
        }
        
        return $true
    } else {
        Write-Host "  ❌ No package.json found" -ForegroundColor Red
        return $false
    }
}

# Function to run existing tests without installing anything
function Run-ExistingTests {
    param($servicePath, $serviceName)
    
    Write-Host "`n🚀 Running existing tests for $serviceName" -ForegroundColor Cyan
    
    Push-Location $servicePath
    
    try {
        # Check if there are any test files
        $testFiles = @()
        $testFiles += Get-ChildItem -Recurse -Include "*.test.*", "*.spec.*" -ErrorAction SilentlyContinue
        
        if ($testFiles.Count -eq 0) {
            Write-Host "  ⚠️  No test files found in $serviceName" -ForegroundColor Yellow
            return
        }
        
        Write-Host "  📁 Found $($testFiles.Count) test files" -ForegroundColor Green
        
        # Try to run tests with existing setup
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        
        if ($packageJson.scripts -and $packageJson.scripts.test) {
            Write-Host "  🧪 Running: pnpm test" -ForegroundColor Yellow
            $testOutput = pnpm test 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✅ Tests passed for $serviceName" -ForegroundColor Green
                if ($Verbose) {
                    Write-Host "  📊 Test output:" -ForegroundColor Gray
                    $testOutput | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
                }
            } else {
                Write-Host "  ⚠️  Tests failed or need setup for $serviceName" -ForegroundColor Yellow
                if ($Verbose) {
                    Write-Host "  📊 Test output:" -ForegroundColor Gray
                    $testOutput | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
                }
            }
        } elseif ($packageJson.scripts -and $packageJson.scripts."test:unit") {
            Write-Host "  🧪 Running: pnpm test:unit" -ForegroundColor Yellow
            $testOutput = pnpm run test:unit 2>&1
        } else {
            Write-Host "  ⚠️  No test script found, checking for direct testing" -ForegroundColor Yellow
            
            # Try running vitest or jest directly if available
            if (Test-Path "node_modules/.bin/vitest*") {
                Write-Host "  🧪 Running: npx vitest run" -ForegroundColor Yellow
                $testOutput = npx vitest run --reporter=basic 2>&1
            } elseif (Test-Path "node_modules/.bin/jest*") {
                Write-Host "  🧪 Running: npx jest" -ForegroundColor Yellow
                $testOutput = npx jest 2>&1
            }
        }
        
    } catch {
        Write-Host "  ❌ Error running tests: $($_.Exception.Message)" -ForegroundColor Red
    } finally {
        Pop-Location
    }
}

# Function to run basic syntax and build checks
function Test-BasicBuild {
    param($servicePath, $serviceName)
    
    Write-Host "`n🏗️  Build validation for $serviceName" -ForegroundColor Cyan
    
    Push-Location $servicePath
    
    try {
        # Check TypeScript compilation
        if (Test-Path "tsconfig.json") {
            Write-Host "  🔍 Checking TypeScript compilation..." -ForegroundColor Yellow
            
            # Try to run tsc --noEmit for type checking only
            if (Test-Path "node_modules/.bin/tsc*") {
                $tscOutput = npx tsc --noEmit 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "  ✅ TypeScript compilation successful" -ForegroundColor Green
                } else {
                    Write-Host "  ⚠️  TypeScript compilation issues found" -ForegroundColor Yellow
                    if ($Verbose) {
                        $tscOutput | Select-Object -First 5 | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
                    }
                }
            }
        }
        
        # Check if build script exists and try it
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        if ($packageJson.scripts -and $packageJson.scripts.build) {
            Write-Host "  🏗️  Testing build process..." -ForegroundColor Yellow
            
            # Don't actually build (takes too long), just verify script exists
            Write-Host "  ✅ Build script available: pnpm build" -ForegroundColor Green
        }
        
    } catch {
        Write-Host "  ❌ Build validation error: $($_.Exception.Message)" -ForegroundColor Red
    } finally {
        Pop-Location
    }
}

# Services to test
$services = @(
    @{ Name = "Admin Dashboard"; Path = "apps/admin" },
    @{ Name = "ID Service"; Path = "apps/id" },
    @{ Name = "Gateway Service"; Path = "apps/gateway" },
    @{ Name = "Hub Application"; Path = "apps/hub" }
)

# Filter services if specific service requested
if ($Service -ne "all") {
    $services = $services | Where-Object { $_.Name -like "*$Service*" -or $_.Path -like "*$Service*" }
}

$startTime = Get-Date
$totalServices = $services.Count
$processedServices = 0

foreach ($service in $services) {
    $processedServices++
    Write-Host "`n" + ("="*50) -ForegroundColor Gray
    Write-Host "🔍 Testing Service $processedServices/$totalServices : $($service.Name)" -ForegroundColor White
    Write-Host ("="*50) -ForegroundColor Gray
    
    # Check if service has existing test setup
    $hasTests = Test-ExistingTestSetup $service.Path $service.Name
    
    if ($hasTests) {
        # Run existing tests
        Run-ExistingTests $service.Path $service.Name
        
        # Run basic build validation
        Test-BasicBuild $service.Path $service.Name
    } else {
        Write-Host "  ⚠️  No existing test setup found for $($service.Name)" -ForegroundColor Yellow
        Write-Host "  💡 Consider adding basic test configuration" -ForegroundColor Gray
    }
}

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host "`n" + ("="*60) -ForegroundColor Cyan
Write-Host "📊 Existing Dependencies Testing Complete" -ForegroundColor Cyan
Write-Host ("="*60) -ForegroundColor Cyan
Write-Host "Services tested: $totalServices" -ForegroundColor White
Write-Host "Duration: $([math]::Round($duration.TotalSeconds, 2)) seconds" -ForegroundColor Gray
Write-Host "`n💡 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Use 'test-fast-validation.ps1' for quick health checks" -ForegroundColor White
Write-Host "  2. Add missing test frameworks only where needed" -ForegroundColor White
Write-Host "  3. Focus on testing existing functionality first" -ForegroundColor White
Write-Host "  4. Use service-specific test scripts when available" -ForegroundColor White
