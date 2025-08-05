#!/usr/bin/env pwsh

# Frontend Deployment Script - Vercel
# This script deploys all CODAI frontend applications to Vercel

param(
    [switch]$DryRun = $false,
    [switch]$Production = $false
)

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "CODAI Frontend Deployment - Vercel" -ForegroundColor Cyan  
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Frontend applications
$apps = @(
    @{ name = "codai"; path = "apps/codai"; port = "4001" },
    @{ name = "id"; path = "apps/id"; port = "4004" },
    @{ name = "bancai"; path = "apps/bancai"; port = "4005" },
    @{ name = "memorai"; path = "apps/memorai"; port = "4006" },
    @{ name = "admin"; path = "apps/admin"; port = "4007" },
    @{ name = "hub"; path = "apps/hub"; port = "4008" },
    @{ name = "memorai-docs"; path = "apps/memorai-docs"; port = "4009" },
    @{ name = "controlai-dashboard"; path = "apps/controlai-dashboard"; port = "4200" },
    @{ name = "romai"; path = "apps/romai"; port = "6100" }
)

$successCount = 0
$failureCount = 0

foreach ($app in $apps) {
    Write-Host "Deploying application: $($app.name)" -ForegroundColor Yellow
    
    if (Test-Path $app.path) {
        try {
            Set-Location $app.path
            
            # Build the application
            Write-Host "  Building application..." -ForegroundColor White
            pnpm build
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  Build successful" -ForegroundColor Green
                
                if ($DryRun) {
                    Write-Host "  [DRY RUN] Would deploy to Vercel..." -ForegroundColor Cyan
                    $successCount++
                } else {
                    Write-Host "  Deploying to Vercel..." -ForegroundColor White
                    
                    if ($Production) {
                        vercel --prod --yes
                    } else {
                        vercel --yes
                    }
                    
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "  Deployed successfully" -ForegroundColor Green
                        $successCount++
                    } else {
                        Write-Host "  Deployment failed" -ForegroundColor Red
                        $failureCount++
                    }
                }
            } else {
                Write-Host "  Build failed" -ForegroundColor Red
                $failureCount++
            }
            
            Set-Location $PSScriptRoot\..
            
        } catch {
            Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
            $failureCount++
            Set-Location $PSScriptRoot\..
        }
    } else {
        Write-Host "  Application path not found: $($app.path)" -ForegroundColor Red
        $failureCount++
    }
    
    Write-Host ""
}

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT SUMMARY" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Successful: $successCount" -ForegroundColor Green
Write-Host "Failed: $failureCount" -ForegroundColor Red

if ($failureCount -eq 0) {
    Write-Host ""
    Write-Host "All applications deployed successfully!" -ForegroundColor Green
    exit 0
} else {
    Write-Host ""
    Write-Host "Some applications failed to deploy" -ForegroundColor Yellow
    exit 1
}
