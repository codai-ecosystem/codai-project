#!/usr/bin/env pwsh
# ==============================================================================
# RomAI AGI Quick Health Check
# Fast validation of all services for immediate deployment readiness
# ==============================================================================

$ErrorActionPreference = "Stop"

# Colors
$Green = [System.ConsoleColor]::Green
$Red = [System.ConsoleColor]::Red
$Yellow = [System.ConsoleColor]::Yellow
$Cyan = [System.ConsoleColor]::Cyan

function Write-ColorOutput {
    param($Message, $Color = [System.ConsoleColor]::White)
    Write-Host $Message -ForegroundColor $Color
}

Write-ColorOutput "🏥 RomAI AGI Quick Health Check - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" $Cyan
Write-ColorOutput "===============================================" $Cyan
Write-Host ""

# Service definitions
$services = @(
    @{ Name = "PostgreSQL Database"; Port = 5432; Endpoint = $null; Container = "postgres" }
    @{ Name = "Redis Cache"; Port = 6379; Endpoint = $null; Container = "redis" }
    @{ Name = "CBD Database"; Port = 4180; Endpoint = "http://localhost:4180/health"; Container = "cbd-database" }
    @{ Name = "RomAI AGI Server"; Port = 6101; Endpoint = "http://localhost:6101/health"; Container = "romai-agi" }
    @{ Name = "Enterprise API"; Port = 8001; Endpoint = "http://localhost:8001/api/v1/health"; Container = "romai-enterprise-api" }
    @{ Name = "Frontend App"; Port = 6100; Endpoint = "http://localhost:6100/api/health"; Container = "romai-frontend" }
    @{ Name = "Prometheus"; Port = 9090; Endpoint = "http://localhost:9090/-/healthy"; Container = "prometheus" }
    @{ Name = "Grafana"; Port = 3000; Endpoint = "http://localhost:3000/api/health"; Container = "grafana" }
)

$healthyCount = 0
$totalCount = $services.Count

foreach ($service in $services) {
    Write-Host "🔍 Checking $($service.Name)..." -NoNewline
    
    $isHealthy = $false
    $errorMsg = ""
    
    try {
        # Check if container is running
        $containerRunning = docker ps --filter "name=$($service.Container)" --filter "status=running" --format "{{.Names}}" 2>$null
        
        if ([string]::IsNullOrWhiteSpace($containerRunning)) {
            $errorMsg = "Container not running"
        }
        else {
            # Check port connectivity
            $tcpClient = New-Object System.Net.Sockets.TcpClient
            $connectTask = $tcpClient.ConnectAsync("localhost", $service.Port)
            $portOpen = $connectTask.Wait(3000)  # 3 second timeout
            $tcpClient.Close()
            
            if (-not $portOpen) {
                $errorMsg = "Port $($service.Port) not accessible"
            }
            elseif ($service.Endpoint) {
                # Test HTTP endpoint
                try {
                    $response = Invoke-RestMethod -Uri $service.Endpoint -Method Get -TimeoutSec 5 -ErrorAction Stop
                    $isHealthy = $true
                }
                catch {
                    $errorMsg = "Health endpoint failed: $($_.Exception.Message)"
                }
            }
            else {
                # For services without health endpoints, port accessibility means healthy
                $isHealthy = $true
            }
        }
    }
    catch {
        $errorMsg = "Connection error: $($_.Exception.Message)"
    }
    
    if ($isHealthy) {
        Write-ColorOutput " ✅ HEALTHY" $Green
        $healthyCount++
    }
    else {
        Write-ColorOutput " ❌ FAILED - $errorMsg" $Red
    }
}

Write-Host ""
Write-ColorOutput "===============================================" $Cyan
Write-ColorOutput "📊 SUMMARY:" $Cyan
Write-ColorOutput "  Total Services: $totalCount" $Yellow
Write-ColorOutput "  Healthy: $healthyCount" $(if ($healthyCount -eq $totalCount) { $Green } else { $Yellow })
Write-ColorOutput "  Failed: $($totalCount - $healthyCount)" $(if ($healthyCount -eq $totalCount) { $Green } else { $Red })

$overallStatus = if ($healthyCount -eq $totalCount) { "ALL SYSTEMS OPERATIONAL" } else { "SYSTEM ISSUES DETECTED" }
$statusColor = if ($healthyCount -eq $totalCount) { $Green } else { $Red }
$statusIcon = if ($healthyCount -eq $totalCount) { "✅" } else { "❌" }

Write-ColorOutput "`n$statusIcon OVERALL STATUS: $overallStatus" $statusColor

if ($healthyCount -ne $totalCount) {
    Write-ColorOutput "`n💡 Run 'health-check-comprehensive.ps1 -Format detailed' for detailed diagnostics" $Cyan
}

# Exit with appropriate code
exit $(if ($healthyCount -eq $totalCount) { 0 } else { 1 })