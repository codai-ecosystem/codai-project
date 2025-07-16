# CODAI Ecosystem - Service Health Monitor
# Created by AGENT 8 - Service Integration Specialist
# Date: 2025-07-15

param(
    [switch]$Continuous,
    [int]$IntervalSeconds = 30
)

Write-Host "🔍 CODAI Ecosystem Service Health Monitor" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

function Test-ServiceHealth {
    param([int]$Port, [string]$ServiceName)
    
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($connection -and $connection.State -eq 'Listen') {
            return @{
                Port = $Port
                Service = $ServiceName
                Status = "✅ HEALTHY"
                State = $connection.State
                Details = "Listening and responsive"
            }
        } else {
            return @{
                Port = $Port
                Service = $ServiceName
                Status = "❌ DOWN"
                State = "Not Found"
                Details = "No active listener"
            }
        }
    } catch {
        return @{
            Port = $Port
            Service = $ServiceName
            Status = "⚠️ ERROR"
            State = "Error"
            Details = $_.Exception.Message
        }
    }
}

function Get-EcosystemHealth {
    $services = @(
        @{Port=4030; Name="CODAI - Central Platform"}
        @{Port=4031; Name="MEMORAI - Memory Backbone"}
        @{Port=4033; Name="BANCAI - Banking Platform"}
        @{Port=4065; Name="STOCAI - Trading Platform"}
        @{Port=4076; Name="AIDE - Development Environment"}
        @{Port=4081; Name="PREZENTAI - Portfolio Platform"}
        @{Port=4041; Name="CURTAI - Soulmate Discovery"}
        @{Port=4032; Name="LOGAI - Identity and Access"}
        @{Port=4053; Name="ANALIZAI - Analytics Platform"}
        @{Port=4052; Name="AJUTAI - Support Platform"}
    )
    
    $results = @()
    $healthyCount = 0
    
    foreach ($service in $services) {
        $health = Test-ServiceHealth -Port $service.Port -ServiceName $service.Name
        $results += $health
        if ($health.Status -eq "✅ HEALTHY") { $healthyCount++ }
    }
    
    Write-Host "`n📊 Service Status Report - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
    Write-Host "==============================================" -ForegroundColor Yellow
    
    foreach ($result in $results) {
        Write-Host "Port $($result.Port): $($result.Status) $($result.Service)" -ForegroundColor White
        if ($result.Details) {
            Write-Host "    └─ $($result.Details)" -ForegroundColor Gray
        }
    }
    
    $healthPercentage = [math]::Round(($healthyCount / $services.Count) * 100, 1)
    Write-Host "`n🎯 Ecosystem Health: $healthyCount/$($services.Count) services ($healthPercentage percent)" -ForegroundColor $(if($healthPercentage -gt 50) {"Green"} else {"Red"})
    
    if ($healthyCount -ge 2) {
        Write-Host "✅ Service mesh foundation is operational!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Critical infrastructure needs attention!" -ForegroundColor Red
    }
    
    return @{
        HealthyServices = $healthyCount
        TotalServices = $services.Count
        HealthPercentage = $healthPercentage
        Results = $results
    }
}

if ($Continuous) {
    Write-Host "`n🔄 Starting continuous monitoring (Ctrl+C to stop)..." -ForegroundColor Green
    while ($true) {
        Get-EcosystemHealth
        Write-Host "`nNext check in $IntervalSeconds seconds..." -ForegroundColor Blue
        Start-Sleep -Seconds $IntervalSeconds
        Clear-Host
    }
} else {
    Get-EcosystemHealth
}
