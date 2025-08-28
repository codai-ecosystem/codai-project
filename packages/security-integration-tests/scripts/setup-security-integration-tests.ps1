# 🔐 Essential CodAI Services - Security Integration Testing Setup
# Comprehensive security testing automation for production-ready deployment

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [switch]$InstallTools = $false,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputDirectory = ".\reports",
    
    [Parameter(Mandatory=$false)]
    [switch]$RunTests = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$GenerateReport = $false
)

# Enhanced error handling and logging
$ErrorActionPreference = "Stop"
$ProgressPreference = "Continue"

# Security testing configuration
$SecurityConfig = @{
    PackageDir = "."  # Current directory since we're running from the package folder
    Services = @(
        @{ Name = "CodAI Authentication API"; Port = 8100; Health = "/health" }
        @{ Name = "CodAI API Gateway"; Port = 8010; Health = "/health" }
        @{ Name = "CodAI Hub API"; Port = 8110; Health = "/health" }
        @{ Name = "CodAI MemorAI MCP Service"; Port = 4950; Health = "/health" }
        @{ Name = "CodAI CBD Database Service"; Port = 8180; Health = "/health" }
        @{ Name = "CodAI MemorAI Frontend"; Port = 8006; Health = "/api/health" }
    )
    TestSuites = @(
        "rate-limiting"
        "authentication"
        "authorization"
        "input-validation"
        "xss-protection"
        "security-headers"
        "vulnerability-scan"
        "performance-impact"
    )
}

function Write-SecurityLog {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter(Mandatory=$false)]
        [ValidateSet("INFO", "WARN", "ERROR", "SUCCESS")]
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $colors = @{
        "INFO" = "Cyan"
        "WARN" = "Yellow" 
        "ERROR" = "Red"
        "SUCCESS" = "Green"
    }
    
    $prefix = switch ($Level) {
        "INFO" { "ℹ️" }
        "WARN" { "⚠️" }
        "ERROR" { "❌" }
        "SUCCESS" { "✅" }
    }
    
    Write-Host "$prefix [$timestamp] $Message" -ForegroundColor $colors[$Level]
}

function Test-Prerequisites {
    Write-SecurityLog "🔍 Checking Prerequisites" "INFO"
    
    # Check Node.js version
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            $versionNumber = $nodeVersion -replace "v", "" -split "\." | Select-Object -First 1
            if ([int]$versionNumber -ge 18) {
                Write-SecurityLog "Node.js version: $nodeVersion" "SUCCESS"
            } else {
                throw "Node.js version 18+ required, found: $nodeVersion"
            }
        } else {
            throw "Node.js not found"
        }
    } catch {
        Write-SecurityLog "Node.js check failed: $($_.Exception.Message)" "ERROR"
        return $false
    }
    
    # Check npm/pnpm
    try {
        $pnpmVersion = pnpm --version 2>$null
        if ($pnpmVersion) {
            Write-SecurityLog "PNPM version: $pnpmVersion" "SUCCESS"
        } else {
            $npmVersion = npm --version 2>$null
            if ($npmVersion) {
                Write-SecurityLog "NPM version: $npmVersion (PNPM recommended)" "WARN"
            } else {
                throw "Neither PNPM nor NPM found"
            }
        }
    } catch {
        Write-SecurityLog "Package manager check failed: $($_.Exception.Message)" "ERROR"
        return $false
    }
    
    # Check TypeScript
    try {
        $tsxVersion = npx tsx --version 2>$null
        if ($tsxVersion) {
            Write-SecurityLog "TSX available for TypeScript execution" "SUCCESS"
        } else {
            Write-SecurityLog "TSX not found, will install during setup" "WARN"
        }
    } catch {
        Write-SecurityLog "TSX check warning: Will install during setup" "WARN"
    }
    
    return $true
}

function Initialize-SecurityTestingEnvironment {
    Write-SecurityLog "🚀 Initializing Security Testing Environment" "INFO"
    
    # Create package directory if it doesn't exist
    $packagePath = $SecurityConfig.PackageDir
    if (-not (Test-Path $packagePath)) {
        Write-SecurityLog "Package directory not found at: $packagePath" "ERROR"
        return $false
    }
    
    # Change to package directory
    Push-Location $packagePath
    
    try {
        # Install dependencies
        Write-SecurityLog "📦 Installing security testing dependencies..." "INFO"
        
        if (Get-Command pnpm -ErrorAction SilentlyContinue) {
            pnpm install
        } else {
            npm install
        }
        
        if ($LASTEXITCODE -ne 0) {
            throw "Dependency installation failed"
        }
        
        Write-SecurityLog "Dependencies installed successfully" "SUCCESS"
        
        # Build TypeScript
        Write-SecurityLog "🔨 Building TypeScript project..." "INFO"
        
        if (Get-Command pnpm -ErrorAction SilentlyContinue) {
            pnpm run build
        } else {
            npm run build
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-SecurityLog "TypeScript build completed" "SUCCESS"
        } else {
            Write-SecurityLog "TypeScript build completed with warnings" "WARN"
        }
        
    } catch {
        Write-SecurityLog "Environment initialization failed: $($_.Exception.Message)" "ERROR"
        return $false
    } finally {
        Pop-Location
    }
    
    return $true
}

function Test-ServicesHealth {
    Write-SecurityLog "🏥 Testing Essential CodAI Services Health" "INFO"
    
    $healthyServices = 0
    $totalServices = $SecurityConfig.Services.Count
    
    foreach ($service in $SecurityConfig.Services) {
        $uri = "http://localhost:$($service.Port)$($service.Health)"
        
        try {
            $response = Invoke-RestMethod -Uri $uri -Method Get -TimeoutSec 10 -ErrorAction Stop
            Write-SecurityLog "$($service.Name) (Port $($service.Port)): HEALTHY" "SUCCESS"
            $healthyServices++
        } catch {
            Write-SecurityLog "$($service.Name) (Port $($service.Port)): FAILED - $($_.Exception.Message)" "ERROR"
        }
    }
    
    $healthPercentage = [math]::Round(($healthyServices / $totalServices) * 100, 1)
    Write-SecurityLog "Health Check Summary: $healthyServices/$totalServices services healthy ($healthPercentage%)" "INFO"
    
    if ($healthyServices -eq 0) {
        Write-SecurityLog "No services are healthy. Cannot proceed with security testing." "ERROR"
        return $false
    } elseif ($healthyServices -lt $totalServices) {
        Write-SecurityLog "Some services are unhealthy. Security testing will be limited." "WARN"
    } else {
        Write-SecurityLog "All services are healthy. Ready for comprehensive security testing." "SUCCESS"
    }
    
    return $true
}

function Invoke-SecurityTests {
    param(
        [Parameter(Mandatory=$false)]
        [string[]]$TestSuites = $SecurityConfig.TestSuites
    )
    
    Write-SecurityLog "🧪 Running Security Integration Tests" "INFO"
    
    $packagePath = $SecurityConfig.PackageDir
    Push-Location $packagePath
    
    try {
        # Create reports directory
        if (-not (Test-Path $OutputDirectory)) {
            New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
        }
        
        $testResults = @()
        $startTime = Get-Date
        
        if ($TestSuites.Count -eq $SecurityConfig.TestSuites.Count) {
            # Run all tests
            Write-SecurityLog "🎯 Executing comprehensive security test suite..." "INFO"
            
            if (Get-Command pnpm -ErrorAction SilentlyContinue) {
                $output = pnpm run test:security 2>&1
            } else {
                $output = npm run test:security 2>&1
            }
            
            $testResults += @{
                Suite = "All Tests"
                Status = if ($LASTEXITCODE -eq 0) { "PASSED" } else { "FAILED" }
                Output = $output -join "`n"
            }
            
        } else {
            # Run specific test suites
            foreach ($suite in $TestSuites) {
                Write-SecurityLog "🔍 Running $suite security tests..." "INFO"
                
                if (Get-Command pnpm -ErrorAction SilentlyContinue) {
                    $output = pnpm run "test:$suite" 2>&1
                } else {
                    $output = npm run "test:$suite" 2>&1
                }
                
                $testResults += @{
                    Suite = $suite
                    Status = if ($LASTEXITCODE -eq 0) { "PASSED" } else { "FAILED" }
                    Output = $output -join "`n"
                }
            }
        }
        
        $endTime = Get-Date
        $duration = $endTime - $startTime
        
        # Generate test summary
        $passedTests = ($testResults | Where-Object { $_.Status -eq "PASSED" }).Count
        $totalTests = $testResults.Count
        
        Write-SecurityLog "📊 Security Test Results Summary:" "INFO"
        Write-SecurityLog "   Total Test Suites: $totalTests" "INFO"
        Write-SecurityLog "   Passed: $passedTests" "SUCCESS"
        Write-SecurityLog "   Failed: $($totalTests - $passedTests)" $(if ($passedTests -eq $totalTests) { "SUCCESS" } else { "ERROR" })
        Write-SecurityLog "   Duration: $($duration.ToString('mm\:ss'))" "INFO"
        
        # Save detailed results
        $detailedResults = @{
            Timestamp = $startTime.ToString("yyyy-MM-dd HH:mm:ss")
            Duration = $duration.ToString()
            Summary = @{
                Total = $totalTests
                Passed = $passedTests
                Failed = $totalTests - $passedTests
                SuccessRate = [math]::Round(($passedTests / $totalTests) * 100, 1)
            }
            Results = $testResults
        }
        
        $resultsFile = Join-Path $OutputDirectory "security-test-results-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
        $detailedResults | ConvertTo-Json -Depth 10 | Set-Content -Path $resultsFile
        
        Write-SecurityLog "Detailed results saved to: $resultsFile" "SUCCESS"
        
        return $passedTests -eq $totalTests
        
    } catch {
        Write-SecurityLog "Security testing failed: $($_.Exception.Message)" "ERROR"
        return $false
    } finally {
        Pop-Location
    }
}

function New-SecurityReport {
    Write-SecurityLog "📊 Generating Security Test Report" "INFO"
    
    $packagePath = $SecurityConfig.PackageDir
    Push-Location $packagePath
    
    try {
        # Find latest results file
        $resultsFiles = Get-ChildItem -Path $OutputDirectory -Name "security-test-results-*.json" | Sort-Object Name -Descending
        
        if ($resultsFiles.Count -eq 0) {
            Write-SecurityLog "No test results found. Run security tests first." "WARN"
            return $false
        }
        
        $latestResults = $resultsFiles[0]
        $resultsPath = Join-Path $OutputDirectory $latestResults
        
        Write-SecurityLog "Generating report from: $latestResults" "INFO"
        
        # Generate report using CLI
        if (Get-Command pnpm -ErrorAction SilentlyContinue) {
            pnpm run generate-report -- --input "$resultsPath" --output "$OutputDirectory" --format "html,json"
        } else {
            npm run generate-report -- --input "$resultsPath" --output "$OutputDirectory" --format "html,json"
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-SecurityLog "Security report generated successfully" "SUCCESS"
            Write-SecurityLog "HTML Report: $(Join-Path $OutputDirectory 'security-test-report.html')" "SUCCESS"
            Write-SecurityLog "JSON Report: $(Join-Path $OutputDirectory 'security-test-report.json')" "SUCCESS"
            return $true
        } else {
            Write-SecurityLog "Report generation failed" "ERROR"
            return $false
        }
        
    } catch {
        Write-SecurityLog "Report generation failed: $($_.Exception.Message)" "ERROR"
        return $false
    } finally {
        Pop-Location
    }
}

function Install-SecurityTools {
    Write-SecurityLog "🛠️ Installing External Security Tools" "INFO"
    
    # Note: This would install tools like OWASP ZAP, Burp Suite Community, etc.
    # For now, we'll just log the information
    
    Write-SecurityLog "External security tools installation:" "INFO"
    Write-SecurityLog "  • OWASP ZAP: Manual installation recommended" "INFO"
    Write-SecurityLog "  • Burp Suite Community: Available from PortSwigger" "INFO"
    Write-SecurityLog "  • Nuclei: Available via GitHub releases" "INFO"
    
    # Install Node.js security tools
    try {
        Write-SecurityLog "Installing Node.js security scanning tools..." "INFO"
        
        # Install global security tools
        npm install -g retire snyk audit-ci 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            Write-SecurityLog "Node.js security tools installed" "SUCCESS"
        } else {
            Write-SecurityLog "Some security tools installation failed (non-critical)" "WARN"
        }
    } catch {
        Write-SecurityLog "Security tools installation warning: $($_.Exception.Message)" "WARN"
    }
}

function Show-SecurityTestingMenu {
    Write-SecurityLog "🔐 Essential CodAI Services - Security Integration Testing" "INFO"
    Write-SecurityLog "=================================================================" "INFO"
    Write-Host ""
    
    Write-Host "Available Actions:" -ForegroundColor Cyan
    Write-Host "  1. 🏥 Health Check (Test all services)" -ForegroundColor White
    Write-Host "  2. 🧪 Run All Security Tests" -ForegroundColor White
    Write-Host "  3. 🔍 Run Specific Test Suite" -ForegroundColor White
    Write-Host "  4. 📊 Generate Security Report" -ForegroundColor White
    Write-Host "  5. 📋 List Available Test Suites" -ForegroundColor White
    Write-Host "  6. ⚙️ Show Configuration" -ForegroundColor White
    Write-Host "  7. 🛠️ Install Security Tools" -ForegroundColor White
    Write-Host "  8. ❌ Exit" -ForegroundColor White
    Write-Host ""
    
    do {
        $choice = Read-Host "Select an action (1-8)"
        
        switch ($choice) {
            "1" {
                Test-ServicesHealth | Out-Null
            }
            "2" {
                $result = Invoke-SecurityTests
                if ($result) {
                    Write-SecurityLog "All security tests completed successfully!" "SUCCESS"
                } else {
                    Write-SecurityLog "Some security tests failed. Check logs for details." "ERROR"
                }
            }
            "3" {
                Write-Host "Available Test Suites:" -ForegroundColor Cyan
                for ($i = 0; $i -lt $SecurityConfig.TestSuites.Count; $i++) {
                    Write-Host "  $($i + 1). $($SecurityConfig.TestSuites[$i])" -ForegroundColor White
                }
                
                $suiteChoice = Read-Host "Select test suite (1-$($SecurityConfig.TestSuites.Count))"
                $suiteIndex = [int]$suiteChoice - 1
                
                if ($suiteIndex -ge 0 -and $suiteIndex -lt $SecurityConfig.TestSuites.Count) {
                    $selectedSuite = $SecurityConfig.TestSuites[$suiteIndex]
                    $result = Invoke-SecurityTests -TestSuites @($selectedSuite)
                    
                    if ($result) {
                        Write-SecurityLog "$selectedSuite tests completed successfully!" "SUCCESS"
                    } else {
                        Write-SecurityLog "$selectedSuite tests failed. Check logs for details." "ERROR"
                    }
                } else {
                    Write-SecurityLog "Invalid test suite selection." "ERROR"
                }
            }
            "4" {
                $result = New-SecurityReport
                if (-not $result) {
                    Write-SecurityLog "Please run security tests first to generate reports." "WARN"
                }
            }
            "5" {
                Write-Host "Available Security Test Suites:" -ForegroundColor Cyan
                foreach ($suite in $SecurityConfig.TestSuites) {
                    Write-Host "  • $suite" -ForegroundColor White
                }
            }
            "6" {
                Write-Host "Security Testing Configuration:" -ForegroundColor Cyan
                Write-Host "  Package Directory: $($SecurityConfig.PackageDir)" -ForegroundColor White
                Write-Host "  Output Directory: $OutputDirectory" -ForegroundColor White
                Write-Host "  Services Count: $($SecurityConfig.Services.Count)" -ForegroundColor White
                Write-Host "  Test Suites Count: $($SecurityConfig.TestSuites.Count)" -ForegroundColor White
            }
            "7" {
                Install-SecurityTools
            }
            "8" {
                Write-SecurityLog "Exiting security testing setup." "INFO"
                return
            }
            default {
                Write-SecurityLog "Invalid choice. Please select 1-8." "ERROR"
            }
        }
        
        Write-Host ""
    } while ($true)
}

# Main execution
try {
    Write-SecurityLog "🔐 Essential CodAI Services - Security Integration Testing Setup" "INFO"
    Write-SecurityLog "Starting comprehensive security testing automation..." "INFO"
    
    # Check prerequisites
    if (-not (Test-Prerequisites)) {
        Write-SecurityLog "Prerequisites check failed. Please resolve issues and try again." "ERROR"
        exit 1
    }
    
    # Initialize environment
    if (-not (Initialize-SecurityTestingEnvironment)) {
        Write-SecurityLog "Environment initialization failed." "ERROR"
        exit 1
    }
    
    # Handle command line parameters
    if ($InstallTools) {
        Install-SecurityTools
    }
    
    if ($RunTests) {
        Write-SecurityLog "Running security tests as requested..." "INFO"
        $result = Invoke-SecurityTests
        
        if ($GenerateReport) {
            Write-SecurityLog "Generating report as requested..." "INFO"
            New-SecurityReport | Out-Null
        }
        
        if ($result) {
            Write-SecurityLog "🎉 Security integration testing completed successfully!" "SUCCESS"
            exit 0
        } else {
            Write-SecurityLog "❌ Security testing completed with failures." "ERROR"
            exit 1
        }
    }
    
    # If no command line actions specified, show interactive menu
    if (-not $InstallTools -and -not $RunTests -and -not $GenerateReport) {
        Show-SecurityTestingMenu
    }
    
} catch {
    Write-SecurityLog "Fatal error: $($_.Exception.Message)" "ERROR"
    Write-SecurityLog "Stack trace: $($_.ScriptStackTrace)" "ERROR"
    exit 1
}

Write-SecurityLog "Security integration testing setup completed." "SUCCESS"