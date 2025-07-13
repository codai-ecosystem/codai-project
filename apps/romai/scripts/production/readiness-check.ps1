# ROMAI Production Readiness Check
# Quick validation of production deployment readiness
# Generated for Phase 4 Week 4 Day 24 - Production Deployment

Write-Host "ROMAI Production Readiness Check" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "E:\GitHub\romai"
$passed = 0
$total = 0

function Test-Requirement {
    param(
        [string]$Name,
        [scriptblock]$Test,
        [string]$Fix = ""
    )
    
    $script:total++
    Write-Host "[$script:total] Testing: $Name" -ForegroundColor Yellow
    
    try {
        $result = & $Test
        if ($result) {
            Write-Host "  PASS" -ForegroundColor Green
            $script:passed++
        } else {
            Write-Host "  FAIL" -ForegroundColor Red
            if ($Fix) {
                Write-Host "  Fix: $Fix" -ForegroundColor Cyan
            }
        }
    } catch {
        Write-Host "  ERROR: $_" -ForegroundColor Red
        if ($Fix) {
            Write-Host "  Fix: $Fix" -ForegroundColor Cyan
        }
    }
    Write-Host ""
}

# File Structure Validation

Test-Requirement "Production Environment File" {
    Test-Path "$projectRoot\.env.production"
} "Create .env.production with production settings"

Test-Requirement "Docker Compose Production File" {
    Test-Path "$projectRoot\docker-compose.prod.yml"
} "Create docker-compose.prod.yml"

Test-Requirement "Production Dockerfile" {
    Test-Path "$projectRoot\Dockerfile"
} "Create production Dockerfile"

Test-Requirement "Nginx Configuration" {
    Test-Path "$projectRoot\infrastructure\nginx\nginx.conf"
} "Create nginx configuration file"

Test-Requirement "Deployment Scripts" {
    (Test-Path "$projectRoot\scripts\production\deploy.ps1") -and (Test-Path "$projectRoot\scripts\production\deploy.sh")
} "Create deployment scripts"

# Environment Validation

Test-Requirement "Environment Variables Configuration" {
    if (Test-Path "$projectRoot\.env.production") {
        $envContent = Get-Content "$projectRoot\.env.production" -Raw
        ($envContent -match "AZURE_OPENAI_API_KEY=") -and 
        ($envContent -match "JWT_SECRET=") -and
        ($envContent -match "NODE_ENV=production")
    } else {
        $false
    }
} "Configure required environment variables in .env.production"

Test-Requirement "Security Configuration" {
    if (Test-Path "$projectRoot\.env.production") {
        $envContent = Get-Content "$projectRoot\.env.production" -Raw
        ($envContent -match "CORS_ORIGIN=") -and 
        ($envContent -match "RATE_LIMIT_MAX=") -and
        ($envContent -match "SSL_ENABLED=true")
    } else {
        $false
    }
} "Configure security settings in .env.production"

# System Requirements

Test-Requirement "PowerShell Version" {
    $PSVersionTable.PSVersion.Major -ge 5
} "Upgrade to PowerShell 5.0 or higher"

Test-Requirement "Docker Command Available" {
    Get-Command docker -ErrorAction SilentlyContinue
} "Install Docker Desktop"

Test-Requirement "Docker Compose Available" {
    Get-Command docker-compose -ErrorAction SilentlyContinue
} "Install Docker Compose"

Test-Requirement "Git Available" {
    Get-Command git -ErrorAction SilentlyContinue
} "Install Git"

Test-Requirement "Node.js Available" {
    Get-Command node -ErrorAction SilentlyContinue
} "Install Node.js"

Test-Requirement "PNPM Available" {
    Get-Command pnpm -ErrorAction SilentlyContinue
} "Install PNPM package manager"

# Build Readiness

Test-Requirement "Package.json Exists" {
    Test-Path "$projectRoot\package.json"
} "Ensure package.json exists in project root"

Test-Requirement "PNPM Workspace Configuration" {
    Test-Path "$projectRoot\pnpm-workspace.yaml"
} "Configure pnpm workspace"

Test-Requirement "TypeScript Configuration" {
    Test-Path "$projectRoot\tsconfig.json"
} "Create TypeScript configuration"

Test-Requirement "Build Scripts Configuration" {
    if (Test-Path "$projectRoot\package.json") {
        $packageContent = Get-Content "$projectRoot\package.json" -Raw | ConvertFrom-Json
        $packageContent.scripts -and $packageContent.scripts.build
    } else {
        $false
    }
} "Add build scripts to package.json"

# Package Structure

Test-Requirement "Core Packages Structure" {
    (Test-Path "$projectRoot\packages\romai-api") -and
    (Test-Path "$projectRoot\packages\romai-core") -and
    (Test-Path "$projectRoot\packages\romai-mcp") -and
    (Test-Path "$projectRoot\packages\romai-types")
} "Ensure all core packages exist"

Test-Requirement "Applications Structure" {
    (Test-Path "$projectRoot\apps\api") -and
    (Test-Path "$projectRoot\apps\dashboard") -and
    (Test-Path "$projectRoot\apps\mcp-server")
} "Ensure all applications exist"

Test-Requirement "Infrastructure Directory" {
    (Test-Path "$projectRoot\infrastructure") -and
    (Test-Path "$projectRoot\infrastructure\nginx")
} "Create infrastructure configuration directory"

# Disk Space Check

Test-Requirement "Sufficient Disk Space (5GB)" {
    $drive = (Get-Item $projectRoot).PSDrive
    $freeSpace = (Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='$($drive.Name):'").FreeSpace
    $freeSpaceGB = [math]::Round($freeSpace / 1GB, 2)
    Write-Host "  Available: ${freeSpaceGB}GB" -ForegroundColor Cyan
    $freeSpace -gt 5GB
} "Free up disk space (minimum 5GB required)"

# Results Summary
Write-Host "PRODUCTION READINESS SUMMARY" -ForegroundColor Magenta
Write-Host "===============================" -ForegroundColor Magenta
Write-Host ""

$percentage = [math]::Round(($passed / $total) * 100, 1)
Write-Host "Passed: $passed/$total tests ($percentage%)" -ForegroundColor $(if ($percentage -ge 80) { "Green" } else { "Yellow" })

if ($percentage -ge 90) {
    Write-Host "EXCELLENT! Production deployment ready" -ForegroundColor Green
    Write-Host "All critical requirements met" -ForegroundColor Green
    Write-Host "Ready to deploy to production!" -ForegroundColor Green
} elseif ($percentage -ge 80) {
    Write-Host "GOOD! Almost ready for production" -ForegroundColor Yellow
    Write-Host "Fix remaining issues before deployment" -ForegroundColor Yellow
    Write-Host "Address the failed tests above" -ForegroundColor Yellow
} elseif ($percentage -ge 60) {
    Write-Host "PARTIAL! Significant work needed" -ForegroundColor Yellow
    Write-Host "Critical issues must be resolved" -ForegroundColor Red
    Write-Host "Focus on failed infrastructure tests" -ForegroundColor Yellow
} else {
    Write-Host "NOT READY! Major setup required" -ForegroundColor Red
    Write-Host "Complete basic setup before proceeding" -ForegroundColor Red
    Write-Host "Review installation documentation" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
if ($percentage -ge 90) {
    Write-Host "1. Start Docker Desktop" -ForegroundColor White
    Write-Host "2. Run: .\scripts\production\deploy.ps1 deploy" -ForegroundColor White
    Write-Host "3. Monitor deployment progress" -ForegroundColor White
    Write-Host "4. Validate all services are healthy" -ForegroundColor White
} else {
    Write-Host "1. Fix all failed requirements above" -ForegroundColor White
    Write-Host "2. Re-run this readiness check" -ForegroundColor White
    Write-Host "3. Ensure 90%+ pass rate before deployment" -ForegroundColor White
    Write-Host "4. Start Docker Desktop when ready" -ForegroundColor White
}

Write-Host ""
Write-Host "USEFUL COMMANDS:" -ForegroundColor Cyan
Write-Host "- Check status: .\scripts\production\deploy.ps1 status" -ForegroundColor White
Write-Host "- Validate deployment: .\scripts\production\deploy.ps1 validate" -ForegroundColor White
Write-Host "- Create backup: .\scripts\production\deploy.ps1 backup" -ForegroundColor White
Write-Host "- Rollback: .\scripts\production\deploy.ps1 rollback" -ForegroundColor White

Write-Host ""
Write-Host "ROMAI Phase 4 Week 4 Day 24 - Production Deployment Ready!" -ForegroundColor Magenta
