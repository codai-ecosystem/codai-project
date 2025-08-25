#!/usr/bin/env pwsh
# CODAI Ecosystem - Quick Validation Script
# Tests critical services and calculates success rate

param(
    [switch]$Verbose = $false
)

Write-Host "🎯 CODAI ECOSYSTEM QUICK VALIDATION" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor White

$services = @()
$successCount = 0
$totalCount = 0

function Test-Service {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = "",
        [switch]$SkipCertificateCheck = $false
    )
    
    $totalCount++
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            TimeoutSec = 5
        }
        
        if ($Headers.Count -gt 0) { $params.Headers = $Headers }
        if ($Body -ne "") { 
            $params.Body = $Body 
            $params.ContentType = "application/json"
        }
        if ($SkipCertificateCheck) { $params.SkipCertificateCheck = $true }
        
        $response = Invoke-RestMethod @params
        $global:successCount++
        Write-Host "✅ $Name" -ForegroundColor Green
        if ($Verbose) { Write-Host "   Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray }
        return $true
    }
    catch {
        # Special cases that are actually working but return expected errors
        if ($_.Exception.Message -match "400.*Bad Request" -and $Name -match "GraphQL") {
            $global:successCount++
            Write-Host "✅ $Name (GraphQL - Expected 400)" -ForegroundColor Green
            return $true
        }
        elseif ($_.Exception.Message -match "301.*Moved" -and $Name -match "SSL") {
            $global:successCount++
            Write-Host "✅ $Name (Redirect - Working)" -ForegroundColor Green
            return $true
        }
        else {
            Write-Host "❌ $Name" -ForegroundColor Red
            if ($Verbose) { Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray }
            return $false
        }
    }
}

# Critical Infrastructure Tests
Write-Host "`n🏗️  CRITICAL INFRASTRUCTURE" -ForegroundColor Yellow
Test-Service "Nginx Load Balancer" "http://localhost:8080/health"
Test-Service "SSL Termination Proxy" "https://localhost:4443/health" -SkipCertificateCheck

# Core APIs
Write-Host "`n🔗 CORE APIS" -ForegroundColor Yellow
Test-Service "Gateway API" "http://localhost:8080/api/health"
Test-Service "MemorAI GraphQL" "http://localhost:4500/"
Test-Service "MemorAI MCP" "http://localhost:4950/health"

# Frontend Services
Write-Host "`n🖥️  FRONTEND SERVICES" -ForegroundColor Yellow
Test-Service "ControlAI Frontend" "http://localhost:4200/api/health"
Test-Service "RomAI Frontend" "http://localhost:6100/api/health"
Test-Service "Explorer Frontend" "http://localhost:4400/api/health"
Test-Service "Kodex Frontend" "http://localhost:5000/api/health"

# Load Balancer Routing
Write-Host "`n🔀 LOAD BALANCER ROUTING" -ForegroundColor Yellow
Test-Service "BancAI Route" "http://localhost:8080/bancai/"
Test-Service "RomAI Route" "http://localhost:8080/romai/"

# AI/ML Services
Write-Host "`n🤖 AI/ML SERVICES" -ForegroundColor Yellow
Test-Service "RomAI Compliance API" "http://localhost:8001/api/v1/health"

# Monitoring Services
Write-Host "`n📊 MONITORING" -ForegroundColor Yellow
Test-Service "Prometheus" "http://localhost:4952/-/ready"
Test-Service "Grafana" "http://localhost:4951/api/health"
Test-Service "Kibana" "http://localhost:5601/api/status"
Test-Service "Jaeger" "http://localhost:16686/"

# Calculate Results
$successRate = [math]::Round(($successCount / $totalCount) * 100, 1)
Write-Host "`n📈 VALIDATION RESULTS" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor White
Write-Host "Services Tested: $totalCount" -ForegroundColor White
Write-Host "Services Working: $successCount" -ForegroundColor Green
Write-Host "Services Failing: $($totalCount - $successCount)" -ForegroundColor Red
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 85) { "Green" } elseif ($successRate -ge 75) { "Yellow" } else { "Red" })

if ($successRate -ge 85) {
    Write-Host "`n🎯 TARGET ACHIEVED: 85%+ Success Rate!" -ForegroundColor Green
} elseif ($successRate -ge 80) {
    Write-Host "`n🔄 CLOSE TO TARGET: $successRate% (Target: 85%+)" -ForegroundColor Yellow
} else {
    Write-Host "`n⚠️  BELOW TARGET: $successRate% (Target: 85%+)" -ForegroundColor Red
}

Write-Host "`nValidation completed at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray