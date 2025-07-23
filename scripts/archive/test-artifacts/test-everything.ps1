#!/usr/bin/env pwsh

# AIDE Ecosystem Comprehensive Test Script
Write-Host "🧪 AIDE ECOSYSTEM COMPREHENSIVE TESTING" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$ErrorActionPreference = "Continue"
$TestResults = @()

function Test-Step {
    param($Name, $Command, $WorkingDir = ".")
    Write-Host "`n🔍 Testing: $Name" -ForegroundColor Yellow
    Write-Host "Command: $Command" -ForegroundColor Gray
    Write-Host "Working Dir: $WorkingDir" -ForegroundColor Gray
    
    $prevDir = Get-Location
    try {
        Set-Location $WorkingDir
        $result = Invoke-Expression $Command
        $exitCode = $LASTEXITCODE
        if ($exitCode -eq 0) {
            Write-Host "✅ PASSED: $Name" -ForegroundColor Green
            $script:TestResults += [PSCustomObject]@{Test = $Name; Status = "PASSED"; Error = $null}
        } else {
            Write-Host "❌ FAILED: $Name (Exit Code: $exitCode)" -ForegroundColor Red
            $script:TestResults += [PSCustomObject]@{Test = $Name; Status = "FAILED"; Error = "Exit code: $exitCode"}
        }
    }
    catch {
        Write-Host "❌ ERROR: $Name - $($_.Exception.Message)" -ForegroundColor Red
        $script:TestResults += [PSCustomObject]@{Test = $Name; Status = "ERROR"; Error = $_.Exception.Message}
    }
    finally {
        Set-Location $prevDir
    }
}

# Navigate to project root
Set-Location "e:\GitHub\codai-project"

Write-Host "`n📦 DEPENDENCY & SETUP TESTS" -ForegroundColor Magenta
Test-Step "Install Dependencies" "pnpm install"
Test-Step "Verify Workspaces" "pnpm list --depth=0"

Write-Host "`n🔧 BUILD TESTS" -ForegroundColor Magenta  
Test-Step "TypeScript Check" "pnpm type-check"
Test-Step "Lint Check" "pnpm lint"
Test-Step "Full Build" "pnpm build"

Write-Host "`n🎯 SPECIFIC PACKAGE TESTS" -ForegroundColor Magenta
Test-Step "Build Optimization Package" "pnpm build" "packages/aide-optimization"
Test-Step "Build Enterprise Package" "pnpm build" "packages/aide-enterprise"
Test-Step "Build Integration Package" "pnpm build" "packages/aide-integration"
Test-Step "Build Analytics Package" "pnpm build" "packages/aide-analytics"

Write-Host "`n🧪 UNIT & INTEGRATION TESTS" -ForegroundColor Magenta
Test-Step "Unit Tests" "pnpm test"
Test-Step "Test Coverage" "pnpm test:coverage"

Write-Host "`n🏥 HEALTH & VALIDATION CHECKS" -ForegroundColor Magenta
Test-Step "Security Audit" "pnpm audit"
Test-Step "Outdated Dependencies" "pnpm outdated"
Test-Step "Validation Suite" "pnpm validate"

Write-Host "`n📊 TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

$passed = ($TestResults | Where-Object {$_.Status -eq "PASSED"}).Count
$failed = ($TestResults | Where-Object {$_.Status -eq "FAILED"}).Count
$errors = ($TestResults | Where-Object {$_.Status -eq "ERROR"}).Count
$total = $TestResults.Count

Write-Host "Total Tests: $total" -ForegroundColor White
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host "Errors: $errors" -ForegroundColor Red

if ($failed -gt 0 -or $errors -gt 0) {
    Write-Host "`n❌ FAILING TESTS:" -ForegroundColor Red
    $TestResults | Where-Object {$_.Status -ne "PASSED"} | ForEach-Object {
        Write-Host "  - $($_.Test): $($_.Status) - $($_.Error)" -ForegroundColor Red
    }
}

$successRate = [math]::Round(($passed / $total) * 100, 2)
Write-Host "`n📈 Success Rate: $successRate%" -ForegroundColor $(if($successRate -ge 90) {"Green"} elseif($successRate -ge 75) {"Yellow"} else {"Red"})

if ($successRate -eq 100) {
    Write-Host "🎉 ALL TESTS PASSED! AIDE Ecosystem is ready for production!" -ForegroundColor Green
} elseif ($successRate -ge 90) {
    Write-Host "⚠️  MOSTLY PASSING - Minor issues need attention" -ForegroundColor Yellow
} else {
    Write-Host "🚨 SIGNIFICANT ISSUES - Requires immediate attention" -ForegroundColor Red
}

# Save results to file
$TestResults | ConvertTo-Json | Out-File "test-results-$(Get-Date -Format 'yyyy-MM-dd-HH-mm').json"
Write-Host "`n💾 Results saved to test-results-$(Get-Date -Format 'yyyy-MM-dd-HH-mm').json"
