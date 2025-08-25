#!/usr/bin/env pwsh
# 🚀 Comprehensive Testing with Existing Dependencies
# Runs all available tests using already installed frameworks

param(
    [string]$Service = "all",
    [switch]$SkipBuild = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Continue"
$startTime = Get-Date

Write-Host "🚀 Comprehensive Testing with Existing Dependencies" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Gray
Write-Host "Running tests with existing Vitest/Jest installations" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Gray

$results = @{
    ServiceHealth = @()
    UnitTests = @()
    BuildTests = @()
    APITests = @()
}

# Function to run unit tests for a service
function Run-ServiceTests {
    param($serviceName, $servicePath, $testFramework)
    
    Write-Host "`n🧪 Running $testFramework tests for $serviceName" -ForegroundColor Cyan
    
    Push-Location $servicePath
    
    try {
        $testStart = Get-Date
        
        # Run the appropriate test command
        switch ($testFramework) {
            "Vitest" {
                Write-Host "  📝 Running: pnpm test:run" -ForegroundColor Yellow
                $output = pnpm run test:run --reporter=basic 2>&1
            }
            "Jest" {
                Write-Host "  📝 Running: pnpm test" -ForegroundColor Yellow
                $output = pnpm test --passWithNoTests 2>&1
            }
        }
        
        $testDuration = (Get-Date) - $testStart
        
        # Parse results
        $passed = $false
        $testCount = 0
        $passCount = 0
        
        if ($LASTEXITCODE -eq 0) {
            $passed = $true
            # Try to extract test counts from output
            $output | ForEach-Object {
                if ($_ -match "(\d+) passed") {
                    $passCount = [int]$Matches[1]
                    $testCount = $passCount
                }
                if ($_ -match "Tests:.*?(\d+) passed.*?(\d+) total") {
                    $passCount = [int]$Matches[1]
                    $testCount = [int]$Matches[2]
                }
            }
        }
        
        $result = @{
            Service = $serviceName
            Framework = $testFramework
            Passed = $passed
            TestCount = $testCount
            PassCount = $passCount
            Duration = [math]::Round($testDuration.TotalSeconds, 2)
            ExitCode = $LASTEXITCODE
        }
        
        $results.UnitTests += $result
        
        if ($passed) {
            Write-Host "  ✅ Tests passed ($($result.PassCount)/$($result.TestCount)) in $($result.Duration)s" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Tests failed (Exit: $($result.ExitCode)) in $($result.Duration)s" -ForegroundColor Red
            if ($Verbose) {
                Write-Host "  📊 Test output:" -ForegroundColor Gray
                $output | Select-Object -Last 10 | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
            }
        }
        
        return $result
        
    } catch {
        Write-Host "  ❌ Error running tests: $($_.Exception.Message)" -ForegroundColor Red
        return @{
            Service = $serviceName
            Framework = $testFramework
            Passed = $false
            Error = $_.Exception.Message
        }
    } finally {
        Pop-Location
    }
}

# Function to test build process
function Test-ServiceBuild {
    param($serviceName, $servicePath)
    
    if ($SkipBuild) {
        Write-Host "  ⏭️  Skipping build test (--SkipBuild specified)" -ForegroundColor Yellow
        return
    }
    
    Write-Host "`n🏗️  Testing build for $serviceName" -ForegroundColor Cyan
    
    Push-Location $servicePath
    
    try {
        $buildStart = Get-Date
        
        # Try TypeScript check first (faster)
        if (Test-Path "node_modules/.bin/tsc*") {
            Write-Host "  🔍 TypeScript check..." -ForegroundColor Yellow
            $tscOutput = npx tsc --noEmit 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✅ TypeScript compilation successful" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️  TypeScript issues found" -ForegroundColor Yellow
                if ($Verbose) {
                    $tscOutput | Select-Object -First 5 | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
                }
            }
        }
        
        $buildDuration = (Get-Date) - $buildStart
        
        $result = @{
            Service = $serviceName
            BuildPassed = ($LASTEXITCODE -eq 0)
            Duration = [math]::Round($buildDuration.TotalSeconds, 2)
            Type = "TypeScript Check"
        }
        
        $results.BuildTests += $result
        
    } catch {
        Write-Host "  ❌ Build test error: $($_.Exception.Message)" -ForegroundColor Red
    } finally {
        Pop-Location
    }
}

# Function to test API endpoints
function Test-ServiceAPI {
    param($serviceName, $port)
    
    Write-Host "`n🔌 Testing API for $serviceName" -ForegroundColor Cyan
    
    try {
        # Test health endpoint
        $healthUrl = "http://localhost:$port/api/health"
        $start = Get-Date
        $response = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 5
        $duration = (Get-Date) - $start
        
        $result = @{
            Service = $serviceName
            URL = $healthUrl
            ResponseTime = [math]::Round($duration.TotalMilliseconds, 2)
            Status = "Success"
            Data = $response
        }
        
        $results.APITests += $result
        Write-Host "  ✅ API healthy ($($result.ResponseTime)ms)" -ForegroundColor Green
        
        # Test main page
        $pageUrl = "http://localhost:$port"
        $pageStart = Get-Date
        $pageResponse = Invoke-WebRequest -Uri $pageUrl -UseBasicParsing -TimeoutSec 5
        $pageDuration = (Get-Date) - $pageStart
        
        Write-Host "  ✅ Frontend page loads ($([math]::Round($pageDuration.TotalMilliseconds, 2))ms, $($pageResponse.Content.Length) bytes)" -ForegroundColor Green
        
    } catch {
        Write-Host "  ❌ API test failed: $($_.Exception.Message)" -ForegroundColor Red
        $results.APITests += @{
            Service = $serviceName
            URL = $healthUrl
            Status = "Failed"
            Error = $_.Exception.Message
        }
    }
}

# Define services to test
$services = @(
    @{ Name = "Admin Dashboard"; Path = "apps/admin"; Framework = "Vitest"; Port = 4007 },
    @{ Name = "ID Service"; Path = "apps/id"; Framework = "Vitest"; Port = 4004 },
    @{ Name = "Gateway Service"; Path = "apps/gateway"; Framework = "Jest"; Port = 4003 },
    @{ Name = "Hub Application"; Path = "apps/hub"; Framework = "Vitest"; Port = 4008 }
)

# Filter services if specific service requested
if ($Service -ne "all") {
    $services = $services | Where-Object { $_.Name -like "*$Service*" -or $_.Path -like "*$Service*" }
}

Write-Host "`n🏥 Phase 1: Service Health Check" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Gray

foreach ($service in $services) {
    try {
        $healthUrl = "http://localhost:$($service.Port)/api/health"
        $response = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 3
        $results.ServiceHealth += @{ Service = $service.Name; Status = "Healthy"; Port = $service.Port }
        Write-Host "✅ $($service.Name) - Port $($service.Port): Healthy" -ForegroundColor Green
    } catch {
        $results.ServiceHealth += @{ Service = $service.Name; Status = "Unhealthy"; Port = $service.Port; Error = $_.Exception.Message }
        Write-Host "❌ $($service.Name) - Port $($service.Port): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🧪 Phase 2: Unit Testing" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Gray

foreach ($service in $services) {
    Run-ServiceTests $service.Name $service.Path $service.Framework
}

Write-Host "`n🏗️  Phase 3: Build Testing" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Gray

foreach ($service in $services) {
    Test-ServiceBuild $service.Name $service.Path
}

Write-Host "`n🔌 Phase 4: API & Frontend Testing" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Gray

foreach ($service in $services) {
    Test-ServiceAPI $service.Name $service.Port
}

# Generate final report
$endTime = Get-Date
$totalDuration = $endTime - $startTime

Write-Host "`n" + ("="*60) -ForegroundColor Cyan
Write-Host "📊 COMPREHENSIVE TESTING REPORT" -ForegroundColor Cyan
Write-Host ("="*60) -ForegroundColor Cyan

# Service Health Summary
$healthyServices = ($results.ServiceHealth | Where-Object { $_.Status -eq "Healthy" }).Count
$totalServices = $results.ServiceHealth.Count
Write-Host "🏥 Service Health: $healthyServices/$totalServices healthy" -ForegroundColor $(if ($healthyServices -eq $totalServices) { "Green" } else { "Yellow" })

# Unit Test Summary
$passedTests = ($results.UnitTests | Where-Object { $_.Passed }).Count
$totalTestRuns = $results.UnitTests.Count
Write-Host "🧪 Unit Tests: $passedTests/$totalTestRuns passed" -ForegroundColor $(if ($passedTests -eq $totalTestRuns) { "Green" } else { "Yellow" })

# Build Test Summary
$passedBuilds = ($results.BuildTests | Where-Object { $_.BuildPassed }).Count
$totalBuilds = $results.BuildTests.Count
if ($totalBuilds -gt 0) {
    Write-Host "🏗️  Build Tests: $passedBuilds/$totalBuilds passed" -ForegroundColor $(if ($passedBuilds -eq $totalBuilds) { "Green" } else { "Yellow" })
}

# API Test Summary
$workingAPIs = ($results.APITests | Where-Object { $_.Status -eq "Success" }).Count
$totalAPIs = $results.APITests.Count
Write-Host "🔌 API Tests: $workingAPIs/$totalAPIs working" -ForegroundColor $(if ($workingAPIs -eq $totalAPIs) { "Green" } else { "Yellow" })

Write-Host "`nTotal Duration: $([math]::Round($totalDuration.TotalMinutes, 2)) minutes" -ForegroundColor Gray

# Detailed Results
if ($Verbose) {
    Write-Host "`n📋 Detailed Results:" -ForegroundColor Cyan
    
    if ($results.UnitTests.Count -gt 0) {
        Write-Host "`n🧪 Unit Test Details:" -ForegroundColor Blue
        foreach ($test in $results.UnitTests) {
            $status = if ($test.Passed) { "✅" } else { "❌" }
            Write-Host "  $status $($test.Service) ($($test.Framework)): $($test.PassCount)/$($test.TestCount) in $($test.Duration)s"
        }
    }
    
    if ($results.APITests.Count -gt 0) {
        Write-Host "`n🔌 API Test Details:" -ForegroundColor Blue
        foreach ($api in $results.APITests) {
            $status = if ($api.Status -eq "Success") { "✅" } else { "❌" }
            Write-Host "  $status $($api.Service): $($api.ResponseTime)ms"
        }
    }
}

Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "  • All services tested with existing dependencies" -ForegroundColor White
Write-Host "  • Use 'test-fast-validation.ps1' for quick health checks" -ForegroundColor White
Write-Host "  • Add specific tests only where gaps are identified" -ForegroundColor White
Write-Host "  • Focus on fixing any failing tests before adding new ones" -ForegroundColor White

Write-Host "`n✨ Testing Complete!" -ForegroundColor Green
