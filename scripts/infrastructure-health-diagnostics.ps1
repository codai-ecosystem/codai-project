#!/usr/bin/env pwsh
# CODAI ECOSYSTEM - COMPREHENSIVE INFRASTRUCTURE HEALTH DIAGNOSTICS
# ==================================================================

param(
    [switch]$Verbose = $false,
    [switch]$ShowLogs = $false
)

Write-Host "🔍 CODAI ECOSYSTEM - INFRASTRUCTURE HEALTH DIAGNOSTICS" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Gray
Write-Host "🕒 Started at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
Write-Host "🎯 Systematic container health, resource usage, and failure analysis" -ForegroundColor White
Write-Host ""

# Global diagnostic results
$global:DiagnosticResults = @{
    ContainerHealth = @()
    ResourceUsage = @()
    NetworkStatus = @()
    ServiceFailures = @()
    CriticalIssues = @()
}

function Write-DiagnosticSection {
    param([string]$Title, [string]$Color = "Magenta")
    Write-Host ""
    Write-Host "🔎 $Title" -ForegroundColor $Color
    Write-Host ("=" * ($Title.Length + 3)) -ForegroundColor Gray
}

function Test-ContainerHealth {
    param([string]$ContainerName, [string]$ExpectedStatus = "running")
    
    try {
        $containerInfo = docker inspect $ContainerName --format "{{.State.Status}}|{{.State.Health.Status}}|{{.Config.Image}}|{{.State.ExitCode}}" 2>$null
        
        if ($LASTEXITCODE -ne 0) {
            return @{
                Name = $ContainerName
                Status = "NOT_FOUND"
                Health = "MISSING"
                Image = "N/A"
                ExitCode = "N/A"
                Issue = "Container does not exist"
            }
        }
        
        $parts = $containerInfo -split '\|'
        $status = $parts[0]
        $health = if ($parts[1] -eq "") { "NO_HEALTHCHECK" } else { $parts[1] }
        $image = $parts[2]
        $exitCode = $parts[3]
        
        $issue = ""
        if ($status -ne "running") {
            $issue = "Container not running (Status: $status, Exit: $exitCode)"
        } elseif ($health -eq "unhealthy") {
            $issue = "Container running but health check failing"
        }
        
        return @{
            Name = $ContainerName
            Status = $status.ToUpper()
            Health = $health.ToUpper()
            Image = $image
            ExitCode = $exitCode
            Issue = $issue
        }
        
    } catch {
        return @{
            Name = $ContainerName
            Status = "ERROR"
            Health = "ERROR"
            Image = "N/A"
            ExitCode = "N/A"
            Issue = "Failed to inspect container: $($_.Exception.Message)"
        }
    }
}

function Get-ContainerResourceUsage {
    param([string]$ContainerName)
    
    try {
        $stats = docker stats $ContainerName --no-stream --format "{{.CPUPerc}}|{{.MemUsage}}|{{.NetIO}}|{{.BlockIO}}" 2>$null
        
        if ($LASTEXITCODE -ne 0) {
            return @{
                Container = $ContainerName
                CPU = "N/A"
                Memory = "N/A"
                Network = "N/A"
                BlockIO = "N/A"
                Issue = "Cannot get stats - container may not be running"
            }
        }
        
        $parts = $stats -split '\|'
        return @{
            Container = $ContainerName
            CPU = $parts[0]
            Memory = $parts[1]
            Network = $parts[2]
            BlockIO = $parts[3]
            Issue = ""
        }
        
    } catch {
        return @{
            Container = $ContainerName
            CPU = "ERROR"
            Memory = "ERROR"
            Network = "ERROR"
            BlockIO = "ERROR"
            Issue = "Resource monitoring failed: $($_.Exception.Message)"
        }
    }
}

function Get-ContainerLogs {
    param([string]$ContainerName, [int]$Lines = 10)
    
    try {
        $logs = docker logs $ContainerName --tail $Lines 2>&1
        return $logs
    } catch {
        return "Failed to get logs: $($_.Exception.Message)"
    }
}

# =============================================================================
# PHASE 1: CONTAINER EXISTENCE AND STATUS
# =============================================================================
Write-DiagnosticSection "CONTAINER EXISTENCE AND STATUS ANALYSIS"

# Expected containers based on docker-compose and previous analysis
$expectedContainers = @(
    "codai-nginx-load-balancer",
    "codai-postgresql-db",
    "memorai-grafana",
    "memorai-prometheus", 
    "codai-kibana",
    "codai-jaeger",
    "codai-controlai-frontend",
    "codai-romai-frontend",
    "codai-explorer-frontend",
    "codai-kodex-frontend",
    "codai-bancai-frontend",
    "codai-memorai-graphql-api",
    "codai-memorai-mcp-api",
    "codai-romai-compliance-api",
    "codai-main-api-gateway",
    "codai-secure-api-gateway"
)

Write-Host "Analyzing $($expectedContainers.Count) expected containers..." -ForegroundColor Yellow

foreach ($container in $expectedContainers) {
    $health = Test-ContainerHealth -ContainerName $container
    $global:DiagnosticResults.ContainerHealth += $health
    
    $statusColor = switch ($health.Status) {
        "RUNNING" { if ($health.Health -eq "HEALTHY" -or $health.Health -eq "NO_HEALTHCHECK") { "Green" } else { "Yellow" } }
        "EXITED" { "Red" }
        "NOT_FOUND" { "DarkRed" }
        default { "Red" }
    }
    
    Write-Host "  $($health.Name.PadRight(35))" -NoNewline -ForegroundColor White
    Write-Host " Status: $($health.Status.PadRight(10))" -NoNewline -ForegroundColor $statusColor
    Write-Host " Health: $($health.Health.PadRight(12))" -NoNewline -ForegroundColor $statusColor
    
    if ($health.Issue) {
        Write-Host " ⚠️  $($health.Issue)" -ForegroundColor Red
        $global:DiagnosticResults.CriticalIssues += "CONTAINER: $($health.Name) - $($health.Issue)"
    } else {
        Write-Host " ✅ OK" -ForegroundColor Green
    }
}

# =============================================================================
# PHASE 2: RESOURCE USAGE ANALYSIS
# =============================================================================
Write-DiagnosticSection "RESOURCE USAGE ANALYSIS"

Write-Host "Collecting resource usage for running containers..." -ForegroundColor Yellow

$runningContainers = $global:DiagnosticResults.ContainerHealth | Where-Object { $_.Status -eq "RUNNING" }

foreach ($containerHealth in $runningContainers) {
    $usage = Get-ContainerResourceUsage -ContainerName $containerHealth.Name
    $global:DiagnosticResults.ResourceUsage += $usage
    
    Write-Host "  $($usage.Container.PadRight(35))" -NoNewline -ForegroundColor White
    Write-Host " CPU: $($usage.CPU.PadRight(8))" -NoNewline -ForegroundColor Cyan
    Write-Host " Memory: $($usage.Memory.PadRight(15))" -NoNewline -ForegroundColor Cyan
    
    if ($usage.Issue) {
        Write-Host " ⚠️  $($usage.Issue)" -ForegroundColor Red
    } else {
        Write-Host " ✅ Monitoring" -ForegroundColor Green
    }
}

# =============================================================================
# PHASE 3: PORT AND NETWORK ANALYSIS
# =============================================================================
Write-DiagnosticSection "PORT AND NETWORK ANALYSIS"

# Expected service ports
$expectedPorts = @(
    @{ Port = 8080; Service = "Load Balancer"; Critical = $true },
    @{ Port = 4200; Service = "ControlAI Frontend"; Critical = $true },
    @{ Port = 6100; Service = "RomAI Frontend"; Critical = $true },
    @{ Port = 4400; Service = "Explorer Frontend"; Critical = $false },
    @{ Port = 5000; Service = "Kodex Frontend"; Critical = $false },
    @{ Port = 4005; Service = "BancAI Frontend"; Critical = $true },
    @{ Port = 4500; Service = "MemorAI GraphQL"; Critical = $true },
    @{ Port = 4950; Service = "MemorAI MCP"; Critical = $true },
    @{ Port = 8001; Service = "Compliance API"; Critical = $true },
    @{ Port = 4951; Service = "Grafana"; Critical = $false },
    @{ Port = 4952; Service = "Prometheus"; Critical = $false }
)

Write-Host "Testing port accessibility for critical services..." -ForegroundColor Yellow

foreach ($portInfo in $expectedPorts) {
    try {
        $connection = Test-NetConnection -ComputerName "localhost" -Port $portInfo.Port -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
        
        $networkResult = @{
            Port = $portInfo.Port
            Service = $portInfo.Service
            Critical = $portInfo.Critical
            Accessible = $connection.TcpTestSucceeded
            Issue = if (-not $connection.TcpTestSucceeded) { "Port not accessible" } else { "" }
        }
        
        $global:DiagnosticResults.NetworkStatus += $networkResult
        
        $accessColor = if ($networkResult.Accessible) { "Green" } else { "Red" }
        $criticalMark = if ($portInfo.Critical) { "🔴" } else { "🟡" }
        
        Write-Host "  $criticalMark Port $($portInfo.Port.ToString().PadRight(6))" -NoNewline -ForegroundColor White
        Write-Host " $($portInfo.Service.PadRight(20))" -NoNewline -ForegroundColor White
        
        if ($networkResult.Accessible) {
            Write-Host " ✅ ACCESSIBLE" -ForegroundColor Green
        } else {
            Write-Host " ❌ NOT ACCESSIBLE" -ForegroundColor Red
            if ($portInfo.Critical) {
                $global:DiagnosticResults.CriticalIssues += "NETWORK: Critical service $($portInfo.Service) not accessible on port $($portInfo.Port)"
            }
        }
        
    } catch {
        $global:DiagnosticResults.NetworkStatus += @{
            Port = $portInfo.Port
            Service = $portInfo.Service
            Critical = $portInfo.Critical
            Accessible = $false
            Issue = "Network test failed: $($_.Exception.Message)"
        }
        
        Write-Host "  🔴 Port $($portInfo.Port.ToString().PadRight(6)) $($portInfo.Service.PadRight(20)) ❌ TEST FAILED" -ForegroundColor Red
    }
}

# =============================================================================
# PHASE 4: FAILED SERVICES ANALYSIS
# =============================================================================
Write-DiagnosticSection "FAILED SERVICES DETAILED ANALYSIS"

$failedContainers = $global:DiagnosticResults.ContainerHealth | Where-Object { $_.Status -ne "RUNNING" -or $_.Health -eq "UNHEALTHY" }

if ($failedContainers.Count -gt 0) {
    Write-Host "Analyzing $($failedContainers.Count) failed/unhealthy containers..." -ForegroundColor Yellow
    
    foreach ($failed in $failedContainers) {
        Write-Host ""
        Write-Host "  🔍 ANALYZING: $($failed.Name)" -ForegroundColor Cyan
        Write-Host "     Status: $($failed.Status), Health: $($failed.Health), Exit Code: $($failed.ExitCode)" -ForegroundColor White
        
        if ($ShowLogs) {
            Write-Host "     📋 Recent logs:" -ForegroundColor Yellow
            $logs = Get-ContainerLogs -ContainerName $failed.Name -Lines 5
            $logs | ForEach-Object { Write-Host "        $_" -ForegroundColor Gray }
        }
        
        # Try to determine failure reason
        $failureReason = switch ($failed.Status) {
            "EXITED" { "Container exited (Exit Code: $($failed.ExitCode))" }
            "NOT_FOUND" { "Container was never created or has been removed" }
            "RUNNING" { "Container running but health check failing" }
            default { "Unknown container state: $($failed.Status)" }
        }
        
        $serviceFailure = @{
            Container = $failed.Name
            Status = $failed.Status
            Health = $failed.Health
            FailureReason = $failureReason
            RequiresAction = $true
        }
        
        $global:DiagnosticResults.ServiceFailures += $serviceFailure
        Write-Host "     ⚠️  Failure Reason: $failureReason" -ForegroundColor Red
    }
} else {
    Write-Host "✅ All expected containers are running" -ForegroundColor Green
}

# =============================================================================
# COMPREHENSIVE DIAGNOSTIC SUMMARY
# =============================================================================
Write-DiagnosticSection "COMPREHENSIVE DIAGNOSTIC SUMMARY" "Green"

$totalContainers = $global:DiagnosticResults.ContainerHealth.Count
$runningContainers = ($global:DiagnosticResults.ContainerHealth | Where-Object { $_.Status -eq "RUNNING" }).Count
$healthyContainers = ($global:DiagnosticResults.ContainerHealth | Where-Object { $_.Status -eq "RUNNING" -and ($_.Health -eq "HEALTHY" -or $_.Health -eq "NO_HEALTHCHECK") }).Count
$accessiblePorts = ($global:DiagnosticResults.NetworkStatus | Where-Object { $_.Accessible }).Count
$totalPorts = $global:DiagnosticResults.NetworkStatus.Count
$criticalPortsDown = ($global:DiagnosticResults.NetworkStatus | Where-Object { $_.Critical -and -not $_.Accessible }).Count

Write-Host "📊 INFRASTRUCTURE HEALTH METRICS:" -ForegroundColor Cyan
Write-Host "Container Status:"
Write-Host "  • Total Expected: $totalContainers"
Write-Host "  • Running: $runningContainers ($([math]::Round(($runningContainers/$totalContainers)*100,1))%)"
Write-Host "  • Fully Healthy: $healthyContainers ($([math]::Round(($healthyContainers/$totalContainers)*100,1))%)"

Write-Host "Network Accessibility:"
Write-Host "  • Accessible Ports: $accessiblePorts/$totalPorts ($([math]::Round(($accessiblePorts/$totalPorts)*100,1))%)"
Write-Host "  • Critical Ports Down: $criticalPortsDown"

Write-Host ""
Write-Host "🎯 OVERALL INFRASTRUCTURE HEALTH:" -ForegroundColor Cyan

$infraHealthScore = [math]::Round((($healthyContainers + $accessiblePorts) / ($totalContainers + $totalPorts)) * 100, 1)

if ($infraHealthScore -ge 90) {
    Write-Host "🟢 EXCELLENT ($infraHealthScore%) - Infrastructure is highly operational" -ForegroundColor Green
} elseif ($infraHealthScore -ge 70) {
    Write-Host "🟡 GOOD ($infraHealthScore%) - Infrastructure mostly functional with some issues" -ForegroundColor Yellow
} elseif ($infraHealthScore -ge 50) {
    Write-Host "🟠 FAIR ($infraHealthScore%) - Infrastructure has significant problems" -ForegroundColor DarkYellow
} else {
    Write-Host "🔴 CRITICAL ($infraHealthScore%) - Infrastructure requires immediate attention" -ForegroundColor Red
}

Write-Host ""
Write-Host "🚨 CRITICAL ISSUES IDENTIFIED:" -ForegroundColor Red
if ($global:DiagnosticResults.CriticalIssues.Count -gt 0) {
    $global:DiagnosticResults.CriticalIssues | ForEach-Object { Write-Host "  • $_" -ForegroundColor Red }
} else {
    Write-Host "  ✅ No critical infrastructure issues detected" -ForegroundColor Green
}

Write-Host ""
Write-Host "🕒 Infrastructure diagnostics completed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow

# Return summary for further processing
return @{
    InfrastructureHealthScore = $infraHealthScore
    RunningContainers = $runningContainers
    HealthyContainers = $healthyContainers
    AccessiblePorts = $accessiblePorts
    CriticalIssues = $global:DiagnosticResults.CriticalIssues
    FailedServices = $global:DiagnosticResults.ServiceFailures
}