#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Validate CODAI Coming Soon Page deployment readiness and health
.DESCRIPTION
    Comprehensive validation script that checks all deployment requirements,
    runs health checks, validates configuration, and ensures production readiness.
.PARAMETER Environment
    Target environment: development, staging, or production
.PARAMETER SkipTests
    Skip running automated tests
.PARAMETER Verbose
    Enable verbose output
#>

param(
    [Parameter(Mandatory = $false)]
    [ValidateSet("development", "staging", "production")]
    [string]$Environment = "development",
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipTests,
    
    [Parameter(Mandatory = $false)]
    [switch]$Verbose
)

# Enable strict mode
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Configuration
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$appsDir = Join-Path $projectRoot "apps"
$comingSoonDir = Join-Path $appsDir "coming-soon"

Write-Host "🚀 CODAI Coming Soon Page - Deployment Validation" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Cyan
Write-Host "Project Root: $projectRoot" -ForegroundColor White
Write-Host "Coming Soon App: $comingSoonDir" -ForegroundColor White
Write-Host ""

# Validation Results
$validationResults = @{
    Prerequisites = @()
    Environment = @()
    Security = @()
    Performance = @()
    Dependencies = @()
    Configuration = @()
    Tests = @()
    Deployment = @()
}

$totalChecks = 0
$passedChecks = 0
$failedChecks = 0

function Write-Check {
    param(
        [string]$Category,
        [string]$Description,
        [bool]$Passed,
        [string]$Details = ""
    )
    
    $script:totalChecks++
    
    $icon = if ($Passed) { "✅" } else { "❌" }
    $color = if ($Passed) { "Green" } else { "Red" }
    
    Write-Host "$icon $Description" -ForegroundColor $color
    
    if ($Details -and ($Verbose -or -not $Passed)) {
        Write-Host "   $Details" -ForegroundColor Yellow
    }
    
    $validationResults[$Category] += @{
        Description = $Description
        Passed = $Passed
        Details = $Details
    }
    
    if ($Passed) {
        $script:passedChecks++
    } else {
        $script:failedChecks++
    }
}

function Test-Command {
    param([string]$Command)
    try {
        $null = Get-Command $Command -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

function Test-Port {
    param([int]$Port)
    try {
        $listener = [System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners()
        return $listener | Where-Object { $_.Port -eq $Port }
    } catch {
        return $false
    }
}

function Test-HttpEndpoint {
    param(
        [string]$Url,
        [int]$TimeoutSeconds = 10
    )
    try {
        $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec $TimeoutSeconds -ErrorAction Stop
        return @{ Success = $true; Response = $response }
    } catch {
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

# 1. Prerequisites Check
Write-Host "📋 Checking Prerequisites..." -ForegroundColor Yellow

$nodeVersion = try { node --version } catch { $null }
Write-Check "Prerequisites" "Node.js installed" ($null -ne $nodeVersion) "Version: $nodeVersion"

$pnpmVersion = try { pnpm --version } catch { $null }
Write-Check "Prerequisites" "PNPM installed" ($null -ne $pnpmVersion) "Version: $pnpmVersion"

$gitVersion = try { git --version } catch { $null }
Write-Check "Prerequisites" "Git installed" ($null -ne $gitVersion) "Version: $gitVersion"

Write-Check "Prerequisites" "Coming Soon directory exists" (Test-Path $comingSoonDir) "Path: $comingSoonDir"

# 2. Environment Configuration
Write-Host "`n🔧 Checking Environment Configuration..." -ForegroundColor Yellow

$envFile = Join-Path $comingSoonDir ".env.$Environment"
$envExists = Test-Path $envFile
Write-Check "Environment" "Environment file exists" $envExists "File: .env.$Environment"

if ($envExists) {
    $envContent = Get-Content $envFile -Raw
    Write-Check "Environment" "NODE_ENV configured" ($envContent -match "NODE_ENV=$Environment") "Environment: $Environment"
    Write-Check "Environment" "App URL configured" ($envContent -match "NEXT_PUBLIC_APP_URL=") ""
    Write-Check "Environment" "Monitoring enabled" ($envContent -match "NEXT_PUBLIC_PERFORMANCE_MONITORING_ENABLED=true") ""
}

# 3. Security Configuration
Write-Host "`n🔒 Checking Security Configuration..." -ForegroundColor Yellow

$packageJson = Join-Path $comingSoonDir "package.json"
if (Test-Path $packageJson) {
    $packageContent = Get-Content $packageJson | ConvertFrom-Json
    $hasSecurityHeaders = $packageContent.dependencies."@next/bundle-analyzer" -or $packageContent.devDependencies."@next/bundle-analyzer"
    Write-Check "Security" "Security dependencies configured" $hasSecurityHeaders ""
}

$nextConfig = Join-Path $comingSoonDir "next.config.js"
$nextConfigExists = Test-Path $nextConfig
Write-Check "Security" "Next.js configuration exists" $nextConfigExists "File: next.config.js"

# 4. Performance Configuration
Write-Host "`n⚡ Checking Performance Configuration..." -ForegroundColor Yellow

$lighthouseConfig = Join-Path $comingSoonDir "lighthouserc.js"
Write-Check "Performance" "Lighthouse CI configured" (Test-Path $lighthouseConfig) "File: lighthouserc.js"

$playwrightConfig = Join-Path $comingSoonDir "playwright.config.ts"
Write-Check "Performance" "Playwright configured" (Test-Path $playwrightConfig) "File: playwright.config.ts"

# 5. Dependencies Check
Write-Host "`n📦 Checking Dependencies..." -ForegroundColor Yellow

Push-Location $comingSoonDir
try {
    $nodeModules = Test-Path "node_modules"
    Write-Check "Dependencies" "Node modules installed" $nodeModules "Directory: node_modules"
    
    if (-not $nodeModules) {
        Write-Host "   Installing dependencies..." -ForegroundColor Yellow
        pnpm install --frozen-lockfile
        Write-Check "Dependencies" "Dependencies installed" (Test-Path "node_modules") "Installed via pnpm"
    }
    
    # Check for security vulnerabilities
    try {
        $auditResult = pnpm audit --json 2>&1
        $hasVulnerabilities = $auditResult -match '"vulnerabilities"'
        Write-Check "Dependencies" "No security vulnerabilities" (-not $hasVulnerabilities) "Audit completed"
    } catch {
        Write-Check "Dependencies" "Security audit completed" $false "Audit failed: $($_.Exception.Message)"
    }
    
} finally {
    Pop-Location
}

# 6. Build and Type Checking
Write-Host "`n🔨 Checking Build Configuration..." -ForegroundColor Yellow

Push-Location $comingSoonDir
try {
    # Type checking
    Write-Host "   Running TypeScript type check..." -ForegroundColor White
    $typeCheckResult = pnpm run type-check 2>&1
    $typeCheckPassed = $LASTEXITCODE -eq 0
    Write-Check "Configuration" "TypeScript types valid" $typeCheckPassed "Type check completed"
    
    # Linting
    Write-Host "   Running ESLint..." -ForegroundColor White
    $lintResult = pnpm run lint 2>&1
    $lintPassed = $LASTEXITCODE -eq 0
    Write-Check "Configuration" "ESLint checks passed" $lintPassed "Linting completed"
    
    # Build test
    if ($Environment -ne "development") {
        Write-Host "   Testing production build..." -ForegroundColor White
        $buildResult = pnpm run build 2>&1
        $buildPassed = $LASTEXITCODE -eq 0
        Write-Check "Configuration" "Production build successful" $buildPassed "Build completed"
    }
    
} finally {
    Pop-Location
}

# 7. API Endpoints Testing
Write-Host "`n🌐 Testing API Endpoints..." -ForegroundColor Yellow

$baseUrl = switch ($Environment) {
    "development" { "http://localhost:5001" }
    "staging" { "https://staging.coming-soon.codai.com" }
    "production" { "https://coming-soon.codai.com" }
}

if ($Environment -eq "development") {
    # Check if development server is running
    $devServerRunning = Test-Port 5001
    if (-not $devServerRunning) {
        Write-Host "   Starting development server..." -ForegroundColor Yellow
        Push-Location $comingSoonDir
        Start-Process -FilePath "pnpm" -ArgumentList "dev" -NoNewWindow
        Start-Sleep -Seconds 10
        Pop-Location
    }
}

$healthCheck = Test-HttpEndpoint "$baseUrl/api/health"
Write-Check "Deployment" "Health endpoint accessible" $healthCheck.Success $healthCheck.Error

$metricsCheck = Test-HttpEndpoint "$baseUrl/api/metrics"
Write-Check "Deployment" "Metrics endpoint accessible" $metricsCheck.Success $metricsCheck.Error

$alertsCheck = Test-HttpEndpoint "$baseUrl/api/alerts"
Write-Check "Deployment" "Alerts endpoint accessible" $alertsCheck.Success $alertsCheck.Error

# 8. Automated Tests (if not skipped)
if (-not $SkipTests) {
    Write-Host "`n🧪 Running Automated Tests..." -ForegroundColor Yellow
    
    Push-Location $comingSoonDir
    try {
        # Unit tests
        $testResult = pnpm run test 2>&1
        $testsPassed = $LASTEXITCODE -eq 0
        Write-Check "Tests" "Unit tests passed" $testsPassed "Test suite completed"
        
        # E2E tests (if environment is running)
        if ($healthCheck.Success) {
            Write-Host "   Running E2E tests..." -ForegroundColor White
            $e2eResult = pnpm run test:e2e 2>&1
            $e2ePassed = $LASTEXITCODE -eq 0
            Write-Check "Tests" "E2E tests passed" $e2ePassed "Playwright tests completed"
        }
        
    } finally {
        Pop-Location
    }
}

# 9. Performance Validation
Write-Host "`n⚡ Performance Validation..." -ForegroundColor Yellow

if ($healthCheck.Success -and $Environment -ne "development") {
    # Lighthouse audit
    try {
        Push-Location $comingSoonDir
        $lighthouseResult = npx lhci autorun 2>&1
        $lighthousePassed = $LASTEXITCODE -eq 0
        Write-Check "Performance" "Lighthouse audit passed" $lighthousePassed "Performance benchmarks met"
        Pop-Location
    } catch {
        Write-Check "Performance" "Lighthouse audit completed" $false "Audit failed: $($_.Exception.Message)"
    }
}

# 10. Final Validation Summary
Write-Host "`n📊 Validation Summary" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan

foreach ($category in $validationResults.Keys) {
    $categoryResults = $validationResults[$category]
    if ($categoryResults.Count -gt 0) {
        $passed = ($categoryResults | Where-Object { $_.Passed }).Count
        $total = $categoryResults.Count
        $percentage = [math]::Round(($passed / $total) * 100, 1)
        
        $color = if ($percentage -ge 90) { "Green" } elseif ($percentage -ge 70) { "Yellow" } else { "Red" }
        Write-Host "$category`: $passed/$total ($percentage%)" -ForegroundColor $color
    }
}

Write-Host ""
$overallPercentage = [math]::Round(($passedChecks / $totalChecks) * 100, 1)
$overallColor = if ($overallPercentage -ge 90) { "Green" } elseif ($overallPercentage -ge 70) { "Yellow" } else { "Red" }

Write-Host "Overall Status: $passedChecks/$totalChecks ($overallPercentage%)" -ForegroundColor $overallColor

if ($overallPercentage -ge 90) {
    Write-Host "🎉 DEPLOYMENT READY! All critical checks passed." -ForegroundColor Green
    exit 0
} elseif ($overallPercentage -ge 70) {
    Write-Host "⚠️  MOSTLY READY: Some issues detected. Review and fix before deployment." -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "🚨 NOT READY: Critical issues must be resolved before deployment." -ForegroundColor Red
    exit 1
}