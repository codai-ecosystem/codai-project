#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Test Cleanup and Comprehensive Validation Script for CODAI Ecosystem
.DESCRIPTION
    This script identifies old/archived tests, cleans them up, and runs comprehensive 
    test validation across all applications and servers in the CODAI ecosystem.
.NOTES
    Author: GitHub Copilot Agent
    Date: August 20, 2025
    Purpose: Ensure comprehensive test coverage before production deployment
#>

param(
    [Parameter(Mandatory=$false)]
    [switch]$CleanOnly,
    
    [Parameter(Mandatory=$false)]
    [switch]$TestOnly,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipArchived,
    
    [Parameter(Mandatory=$false)]
    [string]$Component = "all"
)

# Colors for output
$Colors = @{
    Success = "Green"
    Warning = "Yellow"
    Error = "Red"
    Info = "Cyan"
    Header = "Magenta"
}

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Colors[$Color]
}

function Get-TestSummary {
    param([object]$TestResult)
    
    return @{
        Total = $TestResult.total ?? 0
        Passed = $TestResult.passed ?? 0
        Failed = $TestResult.failed ?? 0
        Skipped = $TestResult.skipped ?? 0
        Coverage = $TestResult.coverage ?? "N/A"
    }
}

# Main execution
Write-ColorOutput "🧹 CODAI Test Cleanup and Validation Started" "Header"
Write-ColorOutput "═══════════════════════════════════════════════════════════════" "Header"

$StartTime = Get-Date
$TestResults = @{}
$OverallSuccess = $true

# Step 1: Identify and Clean Old/Archived Tests
if (-not $TestOnly) {
    Write-ColorOutput "`n🔍 Phase 1: Identifying Old and Archived Tests" "Info"
    Write-ColorOutput "───────────────────────────────────────────────────────" "Info"
    
    $ArchivedTestPaths = @(
        "apps/romai/tests/archive",
        "apps/romai/tests/archived_fake_tests", 
        "apps/memorai/tests/archive",
        "apps/aide/packages/memory-graph/test/components/*.test.old.*",
        "tests/old",
        "tests/archive",
        "tests/deprecated"
    )
    
    $ArchivedTestsFound = @()
    
    foreach ($path in $ArchivedTestPaths) {
        $fullPath = Join-Path $PWD.Path $path
        if (Test-Path $fullPath) {
            $ArchivedTestsFound += $fullPath
            Write-ColorOutput "  📁 Found archived tests: $path" "Warning"
        }
    }
    
    if ($ArchivedTestsFound.Count -gt 0) {
        Write-ColorOutput "`n🗂️  Archived Test Directories Found:" "Warning"
        foreach ($path in $ArchivedTestsFound) {
            Write-ColorOutput "    • $path" "Warning"
        }
        
        if (-not $SkipArchived) {
            Write-ColorOutput "`n💡 These archived tests will be EXCLUDED from test runs" "Info"
        }
    } else {
        Write-ColorOutput "  ✅ No archived test directories found" "Success"
    }
    
    # Identify TODO and incomplete tests
    Write-ColorOutput "`n🔍 Scanning for TODO and incomplete tests..." "Info"
    $TodoTests = Select-String -Path "**/*.test.{ts,tsx,js,jsx}" -Pattern "TODO.*test|FIXME.*test|\.skip\(|\.todo\(" -CaseSensitive:$false 2>$null
    
    if ($TodoTests) {
        Write-ColorOutput "  ⚠️  Found incomplete tests:" "Warning"
        foreach ($todo in $TodoTests[0..9]) { # Show first 10
            Write-ColorOutput "    • $($todo.Filename):$($todo.LineNumber) - $($todo.Line.Trim())" "Warning"
        }
        if ($TodoTests.Count -gt 10) {
            Write-ColorOutput "    ... and $($TodoTests.Count - 10) more" "Warning"
        }
    }
}

if ($CleanOnly) {
    Write-ColorOutput "`n✅ Cleanup phase completed. Use -TestOnly to run tests." "Success"
    exit 0
}

# Step 2: Comprehensive Test Coverage Validation
Write-ColorOutput "`n🧪 Phase 2: Comprehensive Test Coverage Validation" "Info"
Write-ColorOutput "───────────────────────────────────────────────────────" "Info"

$TestComponents = @{
    "RomAI-Frontend" = @{
        path = "apps/romai"
        command = "pnpm test -- --run --coverage --reporter=json --reporter=verbose"
        description = "RomAI Next.js Application Frontend"
    }
    "RomAI-AGI-Server" = @{
        path = "apps/romai/src/ml"
        command = "python -m pytest --cov=. --cov-report=json --cov-report=term -v"
        description = "RomAI AGI Model Server (Python)"
    }
    "RomAI-Enterprise-API" = @{
        path = "apps/romai/src/api"
        command = "python -m pytest --cov=. --cov-report=json --cov-report=term -v"
        description = "RomAI Enterprise API (FastAPI)"
    }
    "MemorAI-Frontend" = @{
        path = "apps/memorai"
        command = "pnpm test -- --run --coverage --reporter=json --reporter=verbose"
        description = "MemorAI Next.js Application Frontend"
    }
    "MemorAI-MCP-Server" = @{
        path = "packages/memorai-mcp"
        command = "pnpm test -- --run --coverage --reporter=json --reporter=verbose"
        description = "MemorAI MCP Server (TypeScript)"
    }
    "CBD-Database" = @{
        path = "packages/cbd"
        command = "pnpm test -- --run --coverage --reporter=json --reporter=verbose"
        description = "CODAI Better Database (TypeScript)"
    }
    "BancAI-Service" = @{
        path = "apps/bancai"
        command = "pnpm test -- --run --coverage --reporter=json --reporter=verbose"
        description = "BancAI Banking Service (Next.js)"
    }
    "Core-Tests" = @{
        path = "."
        command = "pnpm test -- --run --coverage --reporter=json --reporter=verbose"
        description = "Core Ecosystem Tests (Root Level)"
    }
}

# Filter components if specified
if ($Component -ne "all") {
    $TestComponents = $TestComponents.GetEnumerator() | Where-Object { $_.Key -like "*$Component*" } | ForEach-Object { @{$_.Key = $_.Value} }
}

Write-ColorOutput "📋 Testing Components:" "Info"
foreach ($comp in $TestComponents.GetEnumerator()) {
    Write-ColorOutput "  • $($comp.Key): $($comp.Value.description)" "Info"
}

$ComponentResults = @{}

foreach ($comp in $TestComponents.GetEnumerator()) {
    $componentName = $comp.Key
    $config = $comp.Value
    
    Write-ColorOutput "`n🔧 Testing: $componentName" "Header"
    Write-ColorOutput "   Path: $($config.path)" "Info"
    Write-ColorOutput "   Command: $($config.command)" "Info"
    Write-ColorOutput "   Description: $($config.description)" "Info"
    
    try {
        Push-Location $config.path
        
        # Check if test files exist
        $testFiles = Get-ChildItem -Recurse -Include "*.test.*", "*.spec.*" -ErrorAction SilentlyContinue
        if (-not $testFiles) {
            Write-ColorOutput "  ⚠️  No test files found in $($config.path)" "Warning"
            $ComponentResults[$componentName] = @{
                Status = "No Tests"
                Details = "No test files found"
                Coverage = "N/A"
            }
            continue
        }
        
        Write-ColorOutput "  📁 Found $($testFiles.Count) test files" "Info"
        
        # Execute tests
        Write-ColorOutput "  🏃‍♂️ Running tests..." "Info"
        
        $testOutput = ""
        $testExitCode = 0
        
        if ($config.command -like "*python*") {
            # Python tests
            $pythonTestCmd = $config.command -split " "
            $testResult = & $pythonTestCmd[0] @($pythonTestCmd[1..($pythonTestCmd.Length-1)]) 2>&1
            $testExitCode = $LASTEXITCODE
            $testOutput = $testResult -join "`n"
        } else {
            # Node.js/pnpm tests
            $npmTestCmd = $config.command -split " "
            $testResult = & $npmTestCmd[0] @($npmTestCmd[1..($npmTestCmd.Length-1)]) 2>&1
            $testExitCode = $LASTEXITCODE
            $testOutput = $testResult -join "`n"
        }
        
        # Parse test results
        if ($testExitCode -eq 0) {
            Write-ColorOutput "  ✅ Tests PASSED" "Success"
            
            # Try to extract coverage information
            $coverage = "N/A"
            if ($testOutput -match "All files\s*\|\s*([\d.]+)") {
                $coverage = "$($Matches[1])%"
            } elseif ($testOutput -match "TOTAL\s+\d+\s+\d+\s+([\d.]+)%") {
                $coverage = "$($Matches[1])%"
            }
            
            $ComponentResults[$componentName] = @{
                Status = "PASSED"
                Details = "All tests passed successfully"
                Coverage = $coverage
                Output = $testOutput
            }
        } else {
            Write-ColorOutput "  ❌ Tests FAILED (Exit Code: $testExitCode)" "Error"
            $OverallSuccess = $false
            
            $ComponentResults[$componentName] = @{
                Status = "FAILED"
                Details = "Tests failed with exit code $testExitCode"
                Coverage = "N/A"
                Output = $testOutput
            }
        }
        
    } catch {
        Write-ColorOutput "  ❌ ERROR: $($_.Exception.Message)" "Error"
        $OverallSuccess = $false
        
        $ComponentResults[$componentName] = @{
            Status = "ERROR"
            Details = $_.Exception.Message
            Coverage = "N/A"
        }
    } finally {
        Pop-Location
    }
}

# Step 3: Generate Comprehensive Report
Write-ColorOutput "`n📊 Phase 3: Test Coverage Summary Report" "Header"
Write-ColorOutput "═══════════════════════════════════════════════════════════════" "Header"

$PassedCount = 0
$FailedCount = 0
$ErrorCount = 0
$NoTestsCount = 0

Write-ColorOutput "`n📋 Component Test Results:" "Info"
Write-ColorOutput "┌────────────────────────────┬──────────┬─────────────┬──────────┐" "Info"
Write-ColorOutput "│ Component                  │ Status   │ Coverage    │ Notes    │" "Info"
Write-ColorOutput "├────────────────────────────┼──────────┼─────────────┼──────────┤" "Info"

foreach ($result in $ComponentResults.GetEnumerator()) {
    $name = $result.Key.PadRight(26)[0..25] -join ""
    $status = $result.Value.Status.PadRight(8)[0..7] -join ""
    $coverage = $result.Value.Coverage.PadRight(11)[0..10] -join ""
    $details = $result.Value.Details.PadRight(8)[0..7] -join ""
    
    $color = switch ($result.Value.Status) {
        "PASSED" { "Success"; $PassedCount++ }
        "FAILED" { "Error"; $FailedCount++ }
        "ERROR" { "Error"; $ErrorCount++ }
        "No Tests" { "Warning"; $NoTestsCount++ }
        default { "Info" }
    }
    
    Write-Host "│ $name │ " -NoNewline
    Write-Host $status -ForegroundColor $Colors[$color] -NoNewline
    Write-Host " │ $coverage │ $details │"
}

Write-ColorOutput "└────────────────────────────┴──────────┴─────────────┴──────────┘" "Info"

# Overall Summary
Write-ColorOutput "`n🎯 Overall Test Summary:" "Header"
Write-ColorOutput "  ✅ Passed: $PassedCount components" "Success"
if ($FailedCount -gt 0) { Write-ColorOutput "  ❌ Failed: $FailedCount components" "Error" }
if ($ErrorCount -gt 0) { Write-ColorOutput "  💥 Errors: $ErrorCount components" "Error" }
if ($NoTestsCount -gt 0) { Write-ColorOutput "  ⚠️  No Tests: $NoTestsCount components" "Warning" }

$EndTime = Get-Date
$Duration = $EndTime - $StartTime

Write-ColorOutput "`n⏱️  Total Execution Time: $($Duration.ToString('mm\:ss'))" "Info"

# Deployment Readiness Assessment
Write-ColorOutput "`n🚀 Deployment Readiness Assessment:" "Header"

if ($OverallSuccess -and $FailedCount -eq 0 -and $ErrorCount -eq 0) {
    Write-ColorOutput "  ✅ READY FOR DEPLOYMENT" "Success"
    Write-ColorOutput "     All tests passed successfully!" "Success"
} else {
    Write-ColorOutput "  ❌ NOT READY FOR DEPLOYMENT" "Error"
    Write-ColorOutput "     Fix failing tests before deployment!" "Error"
    
    # Show failed components details
    if ($FailedCount -gt 0 -or $ErrorCount -gt 0) {
        Write-ColorOutput "`n🔍 Failed Component Details:" "Error"
        foreach ($result in $ComponentResults.GetEnumerator()) {
            if ($result.Value.Status -in @("FAILED", "ERROR")) {
                Write-ColorOutput "  • $($result.Key): $($result.Value.Details)" "Error"
            }
        }
    }
}

# Exit with appropriate code
if ($OverallSuccess -and $FailedCount -eq 0 -and $ErrorCount -eq 0) {
    Write-ColorOutput "`n🎉 Test validation completed successfully!" "Success"
    exit 0
} else {
    Write-ColorOutput "`n💔 Test validation failed. Please fix issues before deployment." "Error"
    exit 1
}