#!/usr/bin/env pwsh

# Simple Package Publishing Script
# This script publishes packages to NPM registry

param(
    [switch]$DryRun = $false
)

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "CODAI Package Publishing" -ForegroundColor Cyan  
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Package definitions
$packages = @(
    @{ name = "shared-types"; path = "packages/shared-types" },
    @{ name = "websocket-service"; path = "packages/websocket-service" },
    @{ name = "cbd"; path = "packages/cbd" },
    @{ name = "gateway"; path = "apps/gateway" }
)

$successCount = 0
$failureCount = 0

foreach ($pkg in $packages) {
    Write-Host "Processing package: $($pkg.name)" -ForegroundColor Yellow
    
    if (Test-Path $pkg.path) {
        try {
            Set-Location $pkg.path
            
            # Build the package
            Write-Host "  Building package..." -ForegroundColor White
            if ($pkg.name -eq "shared-types" -or $pkg.name -eq "websocket-service") {
                pnpm build
            } elseif ($pkg.name -eq "cbd") {
                pnpm build:ts
            } elseif ($pkg.name -eq "gateway") {
                pnpm build
            }
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  Build successful" -ForegroundColor Green
                
                if ($DryRun) {
                    Write-Host "  [DRY RUN] Would publish package..." -ForegroundColor Cyan
                    $successCount++
                } else {
                    Write-Host "  Publishing package..." -ForegroundColor White
                    npm publish --access public
                    
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "  Published successfully" -ForegroundColor Green
                        $successCount++
                    } else {
                        Write-Host "  Publish failed" -ForegroundColor Red
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
        Write-Host "  Package path not found: $($pkg.path)" -ForegroundColor Red
        $failureCount++
    }
    
    Write-Host ""
}

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "PUBLISHING SUMMARY" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Successful: $successCount" -ForegroundColor Green
Write-Host "Failed: $failureCount" -ForegroundColor Red

if ($failureCount -eq 0) {
    Write-Host ""
    Write-Host "All packages processed successfully!" -ForegroundColor Green
    exit 0
} else {
    Write-Host ""
    Write-Host "Some packages failed to publish" -ForegroundColor Yellow
    exit 1
}
