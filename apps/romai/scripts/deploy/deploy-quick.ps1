#!/usr/bin/env pwsh
# Quick RomAI Vercel Deployment Script
# For immediate frontend deployment to romcp.ro

param(
    [Parameter(Mandatory = $false)]
    [switch]$Production = $false,
    
    [Parameter(Mandatory = $false)]
    [switch]$Force = $false
)

$Domain = "romcp.ro"
$ProjectRoot = "e:\GitHub\codai-project\apps\romai"

# Colors
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"

function Write-Step {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "HH:mm:ss"
    $prefix = switch ($Level) {
        "SUCCESS" { "✅" }
        "ERROR" { "❌" }
        "WARN" { "⚠️" }
        "INFO" { "🔄" }
        default { "ℹ️" }
    }
    
    $color = switch ($Level) {
        "SUCCESS" { $Green }
        "ERROR" { $Red }
        "WARN" { $Yellow }
        "INFO" { $Blue }
        default { $Blue }
    }
    
    Write-Host "[$timestamp] $prefix $Message" -ForegroundColor $color
}

function Test-VercelAuth {
    try {
        $user = vercel whoami 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Step "Verified Vercel authentication: $user" "SUCCESS"
            return $true
        } else {
            Write-Step "Vercel authentication required" "ERROR"
            return $false
        }
    }
    catch {
        Write-Step "Vercel CLI not found or authentication failed" "ERROR"
        return $false
    }
}

function Build-Application {
    Write-Step "Building Next.js application..." "INFO"
    
    Set-Location $ProjectRoot
    
    # Install dependencies if needed
    if (-not (Test-Path "node_modules")) {
        Write-Step "Installing dependencies..." "INFO"
        pnpm install --prefer-offline
        if ($LASTEXITCODE -ne 0) {
            Write-Step "Dependency installation failed" "ERROR"
            return $false
        }
    }
    
    # Build the application
    pnpm build
    if ($LASTEXITCODE -ne 0) {
        Write-Step "Build failed" "ERROR"
        return $false
    }
    
    Write-Step "Build completed successfully" "SUCCESS"
    return $true
}

function Deploy-ToVercel {
    Write-Step "Deploying to Vercel..." "INFO"
    
    Set-Location $ProjectRoot
    
    if ($Production) {
        Write-Step "Deploying to PRODUCTION environment..." "WARN"
        if (-not $Force) {
            $confirm = Read-Host "Deploy to PRODUCTION at $Domain? (yes/no)"
            if ($confirm -ne "yes") {
                Write-Step "Deployment cancelled" "WARN"
                return $false
            }
        }
        
        vercel --prod --yes
    } else {
        Write-Step "Deploying to preview environment..." "INFO"
        vercel --yes
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Step "Vercel deployment failed" "ERROR"
        return $false
    }
    
    Write-Step "Vercel deployment completed successfully" "SUCCESS"
    return $true
}

function Test-Deployment {
    param([string]$Url)
    
    Write-Step "Testing deployment at $Url..." "INFO"
    
    # Wait for deployment to be ready
    Start-Sleep -Seconds 30
    
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 30 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Step "Deployment is responding correctly (Status: $($response.StatusCode))" "SUCCESS"
            return $true
        } else {
            Write-Step "Deployment returned status: $($response.StatusCode)" "WARN"
            return $false
        }
    }
    catch {
        Write-Step "Deployment test failed: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Show-DeploymentInfo {
    param([bool]$IsProduction)
    
    Write-Host ""
    Write-Host "🎉 RomAI Deployment Summary" -ForegroundColor $Cyan
    Write-Host "============================" -ForegroundColor $Cyan
    
    if ($IsProduction) {
        Write-Host "🌐 Production URL: https://$Domain" -ForegroundColor $Green
        Write-Host "📊 Dashboard: https://$Domain/dashboard" -ForegroundColor $Green
        Write-Host "🤖 MCP Interface: https://$Domain/mcp" -ForegroundColor $Green
        Write-Host "🔗 API: https://$Domain/api" -ForegroundColor $Green
    } else {
        Write-Host "🔍 Preview deployment created" -ForegroundColor $Yellow
        Write-Host "ℹ️ Check Vercel dashboard for preview URL" -ForegroundColor $Blue
    }
    
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor $Cyan
    if ($IsProduction) {
        Write-Host "1. Verify all services at https://$Domain" -ForegroundColor $Blue
        Write-Host "2. Run deployment verification: .\verify-deployment.ps1" -ForegroundColor $Blue
        Write-Host "3. Monitor application performance" -ForegroundColor $Blue
    } else {
        Write-Host "1. Test the preview deployment" -ForegroundColor $Blue
        Write-Host "2. If satisfied, run with -Production flag" -ForegroundColor $Blue
    }
}

# Main execution
Write-Host "🚀 RomAI Quick Deployment Script" -ForegroundColor $Cyan
Write-Host "Domain: $Domain" -ForegroundColor $Blue
Write-Host "Mode: $(if ($Production) { 'PRODUCTION' } else { 'PREVIEW' })" -ForegroundColor $(if ($Production) { $Red } else { $Yellow })
Write-Host "=================================" -ForegroundColor $Cyan

# Check Vercel authentication
if (-not (Test-VercelAuth)) {
    Write-Step "Please run: vercel login" "ERROR"
    exit 1
}

# Build application
if (-not (Build-Application)) {
    Write-Step "Build failed. Please fix errors and try again." "ERROR"
    exit 1
}

# Deploy to Vercel
if (-not (Deploy-ToVercel)) {
    Write-Step "Deployment failed. Please check errors above." "ERROR"
    exit 1
}

# Test deployment
$testUrl = if ($Production) { "https://$Domain" } else { "https://romai-preview.vercel.app" }
Test-Deployment -Url $testUrl

# Show deployment information
Show-DeploymentInfo -IsProduction $Production

Write-Step "Deployment process completed!" "SUCCESS"

if ($Production) {
    Write-Host ""
    Write-Host "🎯 Quick verification command:" -ForegroundColor $Cyan
    Write-Host ".\verify-deployment.ps1 -TestSuite quick" -ForegroundColor $Green
}

exit 0
