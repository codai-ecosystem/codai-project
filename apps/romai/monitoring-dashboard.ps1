#!/usr/bin/env pwsh
# ==============================================================================
# RomAI AGI Lightweight Monitoring Dashboard
# Real-time monitoring without external dependencies
# ==============================================================================

param(
    [int]$RefreshInterval = 30,
    [switch]$ContinuousMode = $false
)

$ErrorActionPreference = "Continue"

function Write-ColorOutput {
    param($Message, $Color = "White")
    if ($Color -eq "Green") { Write-Host $Message -ForegroundColor Green }
    elseif ($Color -eq "Red") { Write-Host $Message -ForegroundColor Red }
    elseif ($Color -eq "Yellow") { Write-Host $Message -ForegroundColor Yellow }
    elseif ($Color -eq "Cyan") { Write-Host $Message -ForegroundColor Cyan }
    elseif ($Color -eq "Magenta") { Write-Host $Message -ForegroundColor Magenta }
    else { Write-Host $Message }
}

function Get-AGISystemMetrics {
    $metrics = @{
        Timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        Services = @{}
        Performance = @{}
        Capabilities = @{}
    }
    
    # Core Services Health
    $services = @(
        @{ Name = "AGI_Model_Server"; URL = "http://localhost:6101/health"; Port = 6101 },
        @{ Name = "MemorAI_MCP"; URL = "http://localhost:4950/health"; Port = 4950 },
        @{ Name = "CBD_Database"; URL = "http://localhost:4180/health"; Port = 4180 },
        @{ Name = "MemorAI_App"; URL = "http://localhost:4006/api/health"; Port = 4006 }
    )
    
    foreach ($service in $services) {
        try {
            $startTime = Get-Date
            $response = Invoke-RestMethod -Uri $service.URL -Method Get -TimeoutSec 5
            $responseTime = ((Get-Date) - $startTime).TotalMilliseconds
            
            $metrics.Services[$service.Name] = @{
                Status = "Healthy"
                ResponseTime = [math]::Round($responseTime, 2)
                Details = $response
            }
        }
        catch {
            $metrics.Services[$service.Name] = @{
                Status = "Unhealthy"
                ResponseTime = $null
                Error = $_.Exception.Message
            }
        }
    }
    
    # AGI Capabilities Testing
    if ($metrics.Services.AGI_Model_Server.Status -eq "Healthy") {
        $capabilities = @(
            @{ Name = "Mathematical_Reasoning"; Endpoint = "/reasoning"; Payload = @{ text = "What is 12 * 7?" } },
            @{ Name = "Consciousness_Processing"; Endpoint = "/consciousness/process"; Payload = @{ query = "What is consciousness?" } },
            @{ Name = "Autonomous_Problem_Solving"; Endpoint = "/autonomous/reasoning"; Payload = @{ problem = "Optimize resource usage" } },
            @{ Name = "Code_Generation"; Endpoint = "/code/generate"; Payload = @{ task = "Create a function"; language = "python" } }
        )
        
        foreach ($capability in $capabilities) {
            try {
                $startTime = Get-Date
                $jsonPayload = $capability.Payload | ConvertTo-Json
                $response = Invoke-RestMethod -Uri "http://localhost:6101$($capability.Endpoint)" -Method Post -Body $jsonPayload -ContentType "application/json" -TimeoutSec 5
                $responseTime = ((Get-Date) - $startTime).TotalMilliseconds
                
                $metrics.Capabilities[$capability.Name] = @{
                    Status = "Functional"
                    ResponseTime = [math]::Round($responseTime, 2)
                }
            }
            catch {
                $status = if ($_.Exception.Response.StatusCode -eq 422) { "Available" } else { "Error" }
                $metrics.Capabilities[$capability.Name] = @{
                    Status = $status
                    ResponseTime = $null
                    Error = $_.Exception.Response.StatusCode
                }
            }
        }
    }
    
    # System Performance Metrics
    try {
        $cpu = Get-CimInstance -ClassName Win32_Processor | Measure-Object -Property LoadPercentage -Average
        $memory = Get-CimInstance -ClassName Win32_OperatingSystem
        $disk = Get-CimInstance -ClassName Win32_LogicalDisk | Where-Object { $_.DeviceID -eq "E:" }
        
        $metrics.Performance = @{
            CPU_Usage = [math]::Round($cpu.Average, 1)
            Memory_Usage = [math]::Round((($memory.TotalVisibleMemorySize - $memory.FreePhysicalMemory) / $memory.TotalVisibleMemorySize) * 100, 1)
            Disk_Free_GB = [math]::Round($disk.FreeSpace / 1GB, 1)
            Disk_Total_GB = [math]::Round($disk.Size / 1GB, 1)
        }
    }
    catch {
        $metrics.Performance = @{ Error = "Unable to collect system metrics" }
    }
    
    return $metrics
}

function Show-MonitoringDashboard {
    param($Metrics)
    
    Clear-Host
    
    Write-ColorOutput "╔══════════════════════════════════════════════════════════════════════════════════════╗" "Cyan"
    Write-ColorOutput "║                    🧠 RomAI AGI Production Monitoring Dashboard                        ║" "Cyan"
    Write-ColorOutput "╠══════════════════════════════════════════════════════════════════════════════════════╣" "Cyan"
    Write-ColorOutput "║  Timestamp: $($Metrics.Timestamp)                                                    ║" "White"
    Write-ColorOutput "╚══════════════════════════════════════════════════════════════════════════════════════╝" "Cyan"
    Write-Host ""
    
    # Services Status
    Write-ColorOutput "📊 CORE SERVICES STATUS" "Yellow"
    Write-ColorOutput "─────────────────────────────────────────" "Yellow"
    
    $healthyServices = 0
    $totalServices = $Metrics.Services.Keys.Count
    
    foreach ($serviceName in $Metrics.Services.Keys) {
        $service = $Metrics.Services[$serviceName]
        $status = $service.Status
        $statusColor = if ($status -eq "Healthy") { "Green" } else { "Red" }
        $responseTime = if ($service.ResponseTime) { "$($service.ResponseTime)ms" } else { "N/A" }
        
        Write-Host "  $serviceName".PadRight(20) -NoNewline
        Write-ColorOutput " $status".PadRight(12) $statusColor -NoNewline
        Write-Host " Response: $responseTime"
        
        if ($status -eq "Healthy") { $healthyServices++ }
    }
    
    $healthPercentage = if ($totalServices -gt 0) { ($healthyServices / $totalServices) * 100 } else { 0 }
    Write-Host ""
    Write-ColorOutput "  Overall Health: $([math]::Round($healthPercentage, 1))% ($healthyServices/$totalServices services)" $(if ($healthPercentage -ge 80) { "Green" } elseif ($healthPercentage -ge 60) { "Yellow" } else { "Red" })
    Write-Host ""
    
    # AGI Capabilities Status
    if ($Metrics.Capabilities.Keys.Count -gt 0) {
        Write-ColorOutput "🧠 AGI CAPABILITIES STATUS" "Yellow"
        Write-ColorOutput "─────────────────────────────────────────" "Yellow"
        
        $functionalCapabilities = 0
        $totalCapabilities = $Metrics.Capabilities.Keys.Count
        
        foreach ($capabilityName in $Metrics.Capabilities.Keys) {
            $capability = $Metrics.Capabilities[$capabilityName]
            $status = $capability.Status
            $statusColor = if ($status -eq "Functional") { "Green" } elseif ($status -eq "Available") { "Yellow" } else { "Red" }
            $responseTime = if ($capability.ResponseTime) { "$($capability.ResponseTime)ms" } else { "N/A" }
            
            Write-Host "  $capabilityName".PadRight(25) -NoNewline
            Write-ColorOutput " $status".PadRight(12) $statusColor -NoNewline
            Write-Host " Response: $responseTime"
            
            if ($status -eq "Functional" -or $status -eq "Available") { $functionalCapabilities++ }
        }
        
        $capabilityPercentage = ($functionalCapabilities / $totalCapabilities) * 100
        Write-Host ""
        Write-ColorOutput "  AGI Performance: $([math]::Round($capabilityPercentage, 1))% ($functionalCapabilities/$totalCapabilities capabilities)" $(if ($capabilityPercentage -ge 80) { "Green" } elseif ($capabilityPercentage -ge 60) { "Yellow" } else { "Red" })
        Write-Host ""
    }
    
    # System Performance
    if ($Metrics.Performance.Keys.Count -gt 0 -and -not $Metrics.Performance.Error) {
        Write-ColorOutput "⚡ SYSTEM PERFORMANCE" "Yellow"
        Write-ColorOutput "─────────────────────────────────────────" "Yellow"
        
        $cpuColor = if ($Metrics.Performance.CPU_Usage -lt 70) { "Green" } elseif ($Metrics.Performance.CPU_Usage -lt 85) { "Yellow" } else { "Red" }
        $memoryColor = if ($Metrics.Performance.Memory_Usage -lt 80) { "Green" } elseif ($Metrics.Performance.Memory_Usage -lt 90) { "Yellow" } else { "Red" }
        $diskUsagePercent = (($Metrics.Performance.Disk_Total_GB - $Metrics.Performance.Disk_Free_GB) / $Metrics.Performance.Disk_Total_GB) * 100
        $diskColor = if ($diskUsagePercent -lt 80) { "Green" } elseif ($diskUsagePercent -lt 90) { "Yellow" } else { "Red" }
        
        Write-Host "  CPU Usage:    " -NoNewline
        Write-ColorOutput "$($Metrics.Performance.CPU_Usage)%" $cpuColor
        Write-Host "  Memory Usage: " -NoNewline
        Write-ColorOutput "$($Metrics.Performance.Memory_Usage)%" $memoryColor
        Write-Host "  Disk Free:    " -NoNewline
        Write-ColorOutput "$($Metrics.Performance.Disk_Free_GB)GB / $($Metrics.Performance.Disk_Total_GB)GB" $diskColor
        Write-Host ""
    }
    
    # Status Summary
    $overallStatus = if ($healthPercentage -ge 80 -and ($Metrics.Capabilities.Keys.Count -eq 0 -or $capabilityPercentage -ge 60)) {
        "PRODUCTION READY"
    } elseif ($healthPercentage -ge 60) {
        "PARTIALLY OPERATIONAL"
    } else {
        "NEEDS ATTENTION"
    }
    
    $statusColor = if ($overallStatus -eq "PRODUCTION READY") { "Green" } elseif ($overallStatus -eq "PARTIALLY OPERATIONAL") { "Yellow" } else { "Red" }
    
    Write-ColorOutput "🎯 OVERALL STATUS: $overallStatus" $statusColor
    Write-Host ""
    
    if ($ContinuousMode) {
        Write-ColorOutput "⏱️  Refreshing in $RefreshInterval seconds... (Press Ctrl+C to stop)" "Cyan"
    }
}

# Main execution
do {
    $metrics = Get-AGISystemMetrics
    Show-MonitoringDashboard -Metrics $metrics
    
    if ($ContinuousMode) {
        Start-Sleep -Seconds $RefreshInterval
    }
} while ($ContinuousMode)

if (-not $ContinuousMode) {
    Write-Host ""
    Write-ColorOutput "💡 Tip: Run with -ContinuousMode to enable auto-refresh monitoring" "Yellow"
    Write-ColorOutput "💡 Example: .\monitoring-dashboard.ps1 -ContinuousMode -RefreshInterval 15" "Yellow"
}