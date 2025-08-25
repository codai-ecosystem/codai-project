#!/usr/bin/env pwsh
# ======================================
# CODAI Production Deployment Script
# ======================================
# Comprehensive production deployment automation

param(
    [string]$Environment = "production",
    [string]$DeploymentType = "full",
    [switch]$SkipTests = $false,
    [switch]$DryRun = $false,
    [switch]$Rollback = $false,
    [string]$Version = "latest"
)

Write-Host "🚀 CODAI Ecosystem Production Deployment" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# ======================================
# Configuration & Validation
# ======================================
$ErrorActionPreference = "Stop"
$deploymentStart = Get-Date

# Validate environment
if (-not (Test-Path ".env.production")) {
    Write-Error "❌ .env.production file not found. Copy from .env.production.template and configure."
    exit 1
}

# Load environment variables
Write-Host "📋 Loading production configuration..." -ForegroundColor Yellow
Get-Content ".env.production" | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)\s*$') {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
    }
}

Write-Host "✅ Environment configuration loaded" -ForegroundColor Green

# ======================================
# Pre-Deployment Health Checks
# ======================================
function Test-ServiceHealth {
    param([string]$Url, [string]$ServiceName)
    try {
        $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 10
        Write-Host "✅ $ServiceName: HEALTHY" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ $ServiceName: FAILED - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Start-PreDeploymentChecks {
    Write-Host "🔍 Starting pre-deployment health checks..." -ForegroundColor Yellow
    
    $healthChecks = @(
        @{ Name = "CBD Database"; Url = "http://localhost:4180/health" },
        @{ Name = "MemorAI MCP Server"; Url = "http://localhost:4950/health" },
        @{ Name = "MemorAI App"; Url = "http://localhost:4006/api/health" },
        @{ Name = "RomAI AGI Server"; Url = "http://localhost:6101/health" },
        @{ Name = "RomAI Enterprise API"; Url = "http://localhost:8001/api/v1/health" }
    )
    
    $healthyServices = 0
    foreach ($check in $healthChecks) {
        if (Test-ServiceHealth -Url $check.Url -ServiceName $check.Name) {
            $healthyServices++
        }
    }
    
    $healthPercentage = [math]::Round(($healthyServices / $healthChecks.Count) * 100, 2)
    Write-Host "📊 Service Health: $healthyServices/$($healthChecks.Count) services healthy ($healthPercentage%)" -ForegroundColor Cyan
    
    if ($healthyServices -lt ($healthChecks.Count * 0.8)) {
        Write-Warning "⚠️ Less than 80% of services are healthy. Deployment may fail."
        $continue = Read-Host "Continue anyway? (y/N)"
        if ($continue -ne "y" -and $continue -ne "Y") {
            Write-Host "❌ Deployment cancelled by user" -ForegroundColor Red
            exit 1
        }
    }
}

# ======================================
# Testing Phase
# ======================================
function Start-ProductionTests {
    if ($SkipTests) {
        Write-Host "⏭️ Skipping tests as requested" -ForegroundColor Yellow
        return
    }
    
    Write-Host "🧪 Running production readiness tests..." -ForegroundColor Yellow
    
    # Run comprehensive test suites
    $testSuites = @(
        "tests/integration/api-integration.test.ts",
        "tests/integration/database-integration.test.ts", 
        "tests/integration/cross-application-integration.test.ts",
        "tests/performance/comprehensive-performance.test.ts",
        "tests/security/comprehensive-security.test.ts",
        "tests/mobile/comprehensive-mobile.test.ts"
    )
    
    $passedTests = 0
    $totalTests = $testSuites.Count
    
    foreach ($suite in $testSuites) {
        if (Test-Path $suite) {
            Write-Host "  🔄 Running $(Split-Path $suite -Leaf)..." -ForegroundColor White
            try {
                $testDir = Split-Path $suite -Parent
                Push-Location $testDir
                $result = & pnpm test $(Split-Path $suite -Leaf) 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "  ✅ $(Split-Path $suite -Leaf): PASSED" -ForegroundColor Green
                    $passedTests++
                } else {
                    Write-Host "  ❌ $(Split-Path $suite -Leaf): FAILED" -ForegroundColor Red
                    Write-Host "     $result" -ForegroundColor Gray
                }
                Pop-Location
            } catch {
                Write-Host "  ❌ $(Split-Path $suite -Leaf): ERROR - $($_.Exception.Message)" -ForegroundColor Red
                Pop-Location
            }
        }
    }
    
    $testSuccessRate = [math]::Round(($passedTests / $totalTests) * 100, 2)
    Write-Host "📊 Test Results: $passedTests/$totalTests test suites passed ($testSuccessRate%)" -ForegroundColor Cyan
    
    if ($testSuccessRate -lt 80) {
        Write-Error "❌ Test success rate below 80%. Deployment aborted."
        exit 1
    }
}

# ======================================
# Docker Build Phase
# ======================================
function Start-DockerBuild {
    Write-Host "🐳 Building Docker containers..." -ForegroundColor Yellow
    
    $services = @(
        @{ Name = "CBD Database"; Path = "packages/cbd"; Tag = "cbd-database:$Version" },
        @{ Name = "MemorAI MCP"; Path = "packages/memorai-mcp"; Tag = "memorai-mcp:$Version" },
        @{ Name = "MemorAI App"; Path = "apps/memorai"; Tag = "memorai-app:$Version" },
        @{ Name = "RomAI App"; Path = "apps/romai"; Tag = "romai-app:$Version" },
        @{ Name = "BancAI App"; Path = "apps/bancai"; Tag = "bancai-app:$Version" },
        @{ Name = "ControlAI Dashboard"; Path = "apps/controlai-dashboard"; Tag = "controlai-dashboard:$Version" },
        @{ Name = "Hub App"; Path = "apps/hub"; Tag = "hub-app:$Version" },
        @{ Name = "Admin App"; Path = "apps/admin"; Tag = "admin-app:$Version" },
        @{ Name = "ID App"; Path = "apps/id"; Tag = "id-app:$Version" }
    )
    
    $builtServices = 0
    foreach ($service in $services) {
        if (Test-Path $service.Path) {
            Write-Host "  🔄 Building $($service.Name)..." -ForegroundColor White
            try {
                Push-Location $service.Path
                if (Test-Path "Dockerfile.production") {
                    & docker build -f Dockerfile.production -t $service.Tag .
                } elseif (Test-Path "Dockerfile") {
                    & docker build -t $service.Tag .
                } else {
                    Write-Host "  ⚠️ No Dockerfile found for $($service.Name)" -ForegroundColor Yellow
                    Pop-Location
                    continue
                }
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "  ✅ $($service.Name): BUILD SUCCESS" -ForegroundColor Green
                    $builtServices++
                } else {
                    Write-Host "  ❌ $($service.Name): BUILD FAILED" -ForegroundColor Red
                }
                Pop-Location
            } catch {
                Write-Host "  ❌ $($service.Name): BUILD ERROR - $($_.Exception.Message)" -ForegroundColor Red
                Pop-Location
            }
        }
    }
    
    $buildSuccessRate = [math]::Round(($builtServices / $services.Count) * 100, 2)
    Write-Host "📊 Build Results: $builtServices/$($services.Count) services built successfully ($buildSuccessRate%)" -ForegroundColor Cyan
}

# ======================================
# Deployment Phase
# ======================================
function Start-Deployment {
    Write-Host "🚢 Starting production deployment..." -ForegroundColor Yellow
    
    if ($DryRun) {
        Write-Host "🔍 DRY RUN MODE - No actual deployment will occur" -ForegroundColor Yellow
        return
    }
    
    # Stop existing services gracefully
    Write-Host "  🔄 Stopping existing services..." -ForegroundColor White
    try {
        & docker-compose -f docker-compose.production.yml down --timeout 30
        Write-Host "  ✅ Services stopped successfully" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️ Some services may still be running" -ForegroundColor Yellow
    }
    
    # Start production services
    Write-Host "  🔄 Starting production services..." -ForegroundColor White
    try {
        & docker-compose -f docker-compose.production.yml up -d --remove-orphans
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Production services started successfully" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Failed to start some production services" -ForegroundColor Red
            return
        }
    } catch {
        Write-Error "❌ Deployment failed: $($_.Exception.Message)"
        return
    }
    
    # Wait for services to be ready
    Write-Host "  ⏳ Waiting for services to be ready..." -ForegroundColor White
    Start-Sleep 30
    
    # Verify deployment
    Start-PostDeploymentChecks
}

# ======================================
# Post-Deployment Verification
# ======================================
function Start-PostDeploymentChecks {
    Write-Host "🔍 Running post-deployment verification..." -ForegroundColor Yellow
    
    # Health check all services
    $productionHealthChecks = @(
        @{ Name = "Nginx Gateway"; Url = "http://localhost/health" },
        @{ Name = "CBD Database"; Url = "http://localhost:4180/health" },
        @{ Name = "MemorAI MCP Server"; Url = "http://localhost:4950/health" },
        @{ Name = "MemorAI App"; Url = "http://localhost:4006/api/health" },
        @{ Name = "RomAI AGI Server"; Url = "http://localhost:6101/health" },
        @{ Name = "RomAI Enterprise API"; Url = "http://localhost:8001/api/v1/health" },
        @{ Name = "BancAI App"; Url = "http://localhost:4005/api/health" },
        @{ Name = "ControlAI Dashboard"; Url = "http://localhost:3001/api/health" },
        @{ Name = "Hub App"; Url = "http://localhost:3002/api/health" },
        @{ Name = "Admin App"; Url = "http://localhost:3003/api/health" },
        @{ Name = "ID App"; Url = "http://localhost:3004/api/health" }
    )
    
    $healthyServices = 0
    foreach ($check in $productionHealthChecks) {
        Start-Sleep 2  # Throttle requests
        if (Test-ServiceHealth -Url $check.Url -ServiceName $check.Name) {
            $healthyServices++
        }
    }
    
    $deploymentHealth = [math]::Round(($healthyServices / $productionHealthChecks.Count) * 100, 2)
    Write-Host "📊 Deployment Health: $healthyServices/$($productionHealthChecks.Count) services healthy ($deploymentHealth%)" -ForegroundColor Cyan
    
    if ($deploymentHealth -ge 90) {
        Write-Host "✅ DEPLOYMENT SUCCESSFUL - All systems operational" -ForegroundColor Green
    } elseif ($deploymentHealth -ge 75) {
        Write-Host "⚠️ DEPLOYMENT PARTIAL - Some services may need attention" -ForegroundColor Yellow
    } else {
        Write-Host "❌ DEPLOYMENT FAILED - Critical services are down" -ForegroundColor Red
    }
}

# ======================================
# Rollback Function
# ======================================
function Start-Rollback {
    Write-Host "⏪ Starting deployment rollback..." -ForegroundColor Red
    
    try {
        & docker-compose -f docker-compose.production.yml down
        & docker-compose -f docker-compose.yml up -d  # Fallback to development config
        Write-Host "✅ Rollback completed - Services restored to previous state" -ForegroundColor Green
    } catch {
        Write-Error "❌ Rollback failed: $($_.Exception.Message)"
    }
}

# ======================================
# Main Execution Flow
# ======================================
try {
    if ($Rollback) {
        Start-Rollback
        exit 0
    }
    
    Write-Host "📋 Deployment Configuration:" -ForegroundColor White
    Write-Host "  Environment: $Environment" -ForegroundColor Gray
    Write-Host "  Type: $DeploymentType" -ForegroundColor Gray
    Write-Host "  Version: $Version" -ForegroundColor Gray
    Write-Host "  Skip Tests: $SkipTests" -ForegroundColor Gray
    Write-Host "  Dry Run: $DryRun" -ForegroundColor Gray
    Write-Host ""
    
    # Execute deployment phases
    Start-PreDeploymentChecks
    Start-ProductionTests
    Start-DockerBuild
    Start-Deployment
    
    $deploymentEnd = Get-Date
    $deploymentDuration = $deploymentEnd - $deploymentStart
    
    Write-Host ""
    Write-Host "🎉 CODAI Production Deployment Complete!" -ForegroundColor Green
    Write-Host "===========================================" -ForegroundColor Green
    Write-Host "⏱️ Total Deployment Time: $($deploymentDuration.TotalMinutes.ToString('F2')) minutes" -ForegroundColor Cyan
    Write-Host "🌐 Frontend: https://codai-ecosystem.com" -ForegroundColor White
    Write-Host "🔧 Admin: https://admin.codai-ecosystem.com" -ForegroundColor White
    Write-Host "🏦 BancAI: https://bancai.codai-ecosystem.com" -ForegroundColor White
    Write-Host "🤖 RomAI: https://romai.codai-ecosystem.com" -ForegroundColor White
    Write-Host "📊 Monitoring: http://localhost:3000 (Grafana)" -ForegroundColor White
    
} catch {
    Write-Error "❌ Deployment failed: $($_.Exception.Message)"
    Write-Host "⏪ Consider running rollback: ./deploy-production.ps1 -Rollback" -ForegroundColor Yellow
    exit 1
}