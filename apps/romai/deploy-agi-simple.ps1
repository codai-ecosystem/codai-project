#!/usr/bin/env pwsh
<#
.SYNOPSIS
    RomAI AGI System - Simple Production Deployment
    
.DESCRIPTION
    Simplified production deployment focusing on core AGI functionality
    - Quick infrastructure setup
    - Core AGI system deployment
    - Basic validation
    
.EXAMPLE
    .\deploy-agi-simple.ps1
#>

param()

# Script configuration
$ErrorActionPreference = "Stop"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    $colorMap = @{
        "Success" = "Green"
        "Warning" = "Yellow"
        "Error" = "Red"
        "Info" = "Cyan"
    }
    Write-Host $Message -ForegroundColor $colorMap[$Color]
}

try {
    Write-ColorOutput "🚀 RomAI AGI Simple Production Deployment" -Color Info
    Write-ColorOutput "=======================================" -Color Info
    
    # Step 1: Clean any existing containers
    Write-ColorOutput "🧹 Cleaning existing deployment..." -Color Warning
    docker-compose -f docker-compose.production.agi.yml down --remove-orphans 2>$null
    
    # Step 2: Deploy core infrastructure first
    Write-ColorOutput "📦 Deploying infrastructure services..." -Color Info
    docker-compose -f docker-compose.production.agi.yml up -d postgres redis-cache cbd-database
    
    # Wait for infrastructure
    Write-ColorOutput "⏳ Waiting for infrastructure (45 seconds)..." -Color Info
    Start-Sleep -Seconds 45
    
    # Check infrastructure health
    Write-ColorOutput "🔍 Checking infrastructure health..." -Color Info
    $infraHealthy = $true
    
    try {
        $pgHealth = docker exec romai-agi-postgres pg_isready -U agi_user 2>$null
        if ($pgHealth -match "accepting") {
            Write-ColorOutput "✅ PostgreSQL: Ready" -Color Success
        } else { $infraHealthy = $false }
    } catch {
        Write-ColorOutput "❌ PostgreSQL: Failed" -Color Error
        $infraHealthy = $false
    }
    
    if (-not $infraHealthy) {
        Write-ColorOutput "⚠️ Infrastructure issues detected, continuing anyway..." -Color Warning
    }
    
    # Step 3: Deploy AGI system
    Write-ColorOutput "🧠 Building and deploying RomAI AGI System..." -Color Info
    docker-compose -f docker-compose.production.agi.yml build romai-agi-system
    docker-compose -f docker-compose.production.agi.yml up -d romai-agi-system
    
    # Wait for AGI system
    Write-ColorOutput "⏳ Waiting for AGI system initialization (90 seconds)..." -Color Info
    Start-Sleep -Seconds 90
    
    # Test AGI system
    Write-ColorOutput "🔍 Testing AGI system health..." -Color Info
    $maxRetries = 3
    $agiHealthy = $false
    
    for ($i = 1; $i -le $maxRetries; $i++) {
        try {
            $healthResponse = Invoke-RestMethod -Uri "http://localhost:6101/health" -Method Get -TimeoutSec 30
            if ($healthResponse.status -eq "healthy") {
                Write-ColorOutput "✅ RomAI AGI System: Healthy" -Color Success
                $agiHealthy = $true
                break
            }
        } catch {
            Write-ColorOutput "⏳ AGI health check $i/$maxRetries failed, retrying..." -Color Warning
            Start-Sleep -Seconds 30
        }
    }
    
    if (-not $agiHealthy) {
        Write-ColorOutput "⚠️ AGI system health checks failed, but may still be starting..." -Color Warning
    }
    
    # Test reasoning engines
    Write-ColorOutput "🧠 Testing reasoning engines..." -Color Info
    $engines = @(
        @{ Name = "Mathematical"; Endpoint = "/solve_math"; Data = @{ problem = "What is 12 * 12?" } },
        @{ Name = "Logical"; Endpoint = "/reason"; Data = @{ premise = "All birds can fly. Penguins are birds. Can penguins fly?" } }
    )
    
    $workingEngines = 0
    foreach ($engine in $engines) {
        try {
            $body = $engine.Data | ConvertTo-Json
            $response = Invoke-RestMethod -Uri "http://localhost:6101$($engine.Endpoint)" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 60
            if ($response.success) {
                Write-ColorOutput "✅ $($engine.Name) Engine: Working" -Color Success
                $workingEngines++
            } else {
                Write-ColorOutput "❌ $($engine.Name) Engine: Failed" -Color Error
            }
        } catch {
            Write-ColorOutput "❌ $($engine.Name) Engine: Error - $($_.Exception.Message)" -Color Error
        }
    }
    
    # Step 4: Deploy monitoring (optional)
    Write-ColorOutput "📊 Deploying monitoring services..." -Color Info
    docker-compose -f docker-compose.production.agi.yml up -d prometheus grafana
    
    # Final status
    Write-ColorOutput "" -Color Info
    Write-ColorOutput "🎯 DEPLOYMENT SUMMARY" -Color Info
    Write-ColorOutput "===================" -Color Info
    Write-ColorOutput "📊 Working Engines: $workingEngines/2 (basic test)" -Color $(if ($workingEngines -gt 0) { "Success" } else { "Warning" })
    Write-ColorOutput "🌐 AGI Endpoint: http://localhost:6101" -Color Success
    Write-ColorOutput "📊 Monitoring: http://localhost:9091 (Prometheus)" -Color Info
    Write-ColorOutput "📈 Dashboard: http://localhost:3001 (Grafana)" -Color Info
    Write-ColorOutput "" -Color Info
    
    if ($agiHealthy -or $workingEngines -gt 0) {
        Write-ColorOutput "🎉 DEPLOYMENT SUCCESSFUL!" -Color Success
        Write-ColorOutput "RomAI AGI System is running!" -Color Success
        
        # Show running containers
        Write-ColorOutput "📋 Running Services:" -Color Info
        docker ps --filter "name=romai-agi" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        
        exit 0
    } else {
        Write-ColorOutput "⚠️ DEPLOYMENT COMPLETED WITH ISSUES" -Color Warning
        Write-ColorOutput "Check container logs for details" -Color Warning
        exit 1
    }
    
} catch {
    Write-ColorOutput "❌ Deployment failed: $($_.Exception.Message)" -Color Error
    Write-ColorOutput "💡 Try: docker-compose -f docker-compose.production.agi.yml logs romai-agi-system" -Color Info
    exit 2
}