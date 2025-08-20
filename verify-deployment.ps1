#!/usr/bin/env pwsh
# MemorAI Project Deployment Verification Script
# This script verifies that all components of the MemorAI ecosystem are properly deployed and healthy

Write-Host "🚀 MemorAI Project Deployment Verification" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{
        Name = "MemorAI MCP Server"
        URL = "http://localhost:4950/health"
        Icon = "🧠"
        Expected = "healthy"
    },
    @{
        Name = "CBD Database"
        URL = "http://localhost:4180/health"
        Icon = "🗃️"
        Expected = "healthy"
    },
    @{
        Name = "MemorAI App"
        URL = "http://localhost:4006/api/health"
        Icon = "📱"
        Expected = "operational"
    },
    @{
        Name = "Gateway Service"
        URL = "http://localhost:4000/health"
        Icon = "🌐"
        Expected = "healthy"
    },
    @{
        Name = "Redis Cache"
        URL = "http://localhost:6379"
        Icon = "🔴"
        Type = "tcp"
    },
    @{
        Name = "PostgreSQL Database"
        URL = "http://localhost:5432"
        Icon = "🐘"
        Type = "tcp"
    },
    @{
        Name = "Grafana Monitoring"
        URL = "http://localhost:4951"
        Icon = "📊"
        Type = "web"
    }
)

$healthyServices = 0
$totalServices = $services.Count

foreach ($service in $services) {
    Write-Host "$($service.Icon) Testing $($service.Name)..." -ForegroundColor Yellow
    
    try {
        if ($service.Type -eq "tcp") {
            # TCP port check
            $port = [int]($service.URL -replace ".*:", "")
            $tcpClient = New-Object System.Net.Sockets.TcpClient
            $connect = $tcpClient.BeginConnect("localhost", $port, $null, $null)
            $wait = $connect.AsyncWaitHandle.WaitOne(3000, $false)
            
            if ($wait) {
                $tcpClient.EndConnect($connect)
                Write-Host "  ✅ $($service.Name): ACCESSIBLE" -ForegroundColor Green
                $healthyServices++
            } else {
                Write-Host "  ❌ $($service.Name): PORT NOT ACCESSIBLE" -ForegroundColor Red
            }
            $tcpClient.Close()
        }
        elseif ($service.Type -eq "web") {
            # Simple web accessibility check
            $response = Invoke-WebRequest -Uri $service.URL -Method Get -TimeoutSec 5 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Host "  ✅ $($service.Name): ACCESSIBLE" -ForegroundColor Green
                $healthyServices++
            } else {
                Write-Host "  ❌ $($service.Name): HTTP ERROR ($($response.StatusCode))" -ForegroundColor Red
            }
        }
        else {
            # Health endpoint check
            $response = Invoke-RestMethod -Uri $service.URL -Method Get -TimeoutSec 10
            if ($response.status -eq $service.Expected -or $response -eq $service.Expected) {
                Write-Host "  ✅ $($service.Name): HEALTHY" -ForegroundColor Green
                $healthyServices++
            } else {
                Write-Host "  ⚠️ $($service.Name): UNEXPECTED STATUS ($($response.status))" -ForegroundColor Yellow
            }
        }
    }
    catch {
        Write-Host "  ❌ $($service.Name): FAILED - $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "📊 Deployment Summary" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "Healthy Services: $healthyServices/$totalServices" -ForegroundColor $(if ($healthyServices -eq $totalServices) { "Green" } else { "Yellow" })

if ($healthyServices -eq $totalServices) {
    Write-Host "🎉 MemorAI Project Successfully Deployed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 Access Points:" -ForegroundColor Cyan
    Write-Host "  • MemorAI App: http://localhost:4006" -ForegroundColor White
    Write-Host "  • MemorAI MCP: http://localhost:4950" -ForegroundColor White
    Write-Host "  • GraphQL API: http://localhost:4500" -ForegroundColor White
    Write-Host "  • Gateway: http://localhost:4000" -ForegroundColor White
    Write-Host "  • Grafana: http://localhost:4951" -ForegroundColor White
    Write-Host "  • CBD Database: http://localhost:4180" -ForegroundColor White
} else {
    Write-Host "⚠️ Some services may need attention" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🐳 Docker Container Status:" -ForegroundColor Cyan
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Where-Object { $_ -match "memorai" }

Write-Host ""
Write-Host "📋 VS Code MCP Configuration:" -ForegroundColor Cyan
Write-Host "  The MemorAI MCP server is configured in VS Code for AI agent integration" -ForegroundColor White
Write-Host "  Tools available: remember, recall, forget, context" -ForegroundColor White