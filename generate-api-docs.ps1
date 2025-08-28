#!/usr/bin/env pwsh
<#
.SYNOPSIS
    API Documentation Generator
#>

param([switch]$Build = $false, [switch]$Serve = $false, [string]$Output = "./docs")

Write-Host "📚 CodAI API Documentation Generator" -ForegroundColor Cyan

if ($Build) {
    Write-Host "🔧 Building API documentation..." -ForegroundColor Yellow
    
    if (!(Test-Path $Output)) {
        New-Item -ItemType Directory -Path $Output -Force | Out-Null
    }
    
    $services = @("identity-api", "api-gateway", "hub-api", "bancai-service", "cbd-database")
    
    foreach ($service in $services) {
        $servicePath = "./services/$service"
        if (Test-Path $servicePath) {
            Write-Host "  📖 Generating docs for $service..." -ForegroundColor White
            
            Set-Location $servicePath
            
            try {
                node -e "const { specs } = require('./swagger-config'); const fs = require('fs'); fs.writeFileSync('../../$Output/$service-api.json', JSON.stringify(specs, null, 2));"
                Write-Host "    ✅ $service documentation generated" -ForegroundColor Green
            } catch {
                Write-Host "    ⚠️ $service documentation failed" -ForegroundColor Yellow
            }
            
            Set-Location "../.."
        }
    }
    
    Write-Host "✅ API documentation generated in $Output/" -ForegroundColor Green
}

if ($Serve) {
    Write-Host "🌐 Starting documentation server on http://localhost:3001..." -ForegroundColor Yellow
    python -m http.server 3001 --directory $Output
}
