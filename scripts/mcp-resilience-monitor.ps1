# MCP Server Resilience Monitor
# Monitors and auto-restarts MCP servers to prevent conversation crashes
param(
    [switch]$StartMonitoring = $false,
    [switch]$StopMonitoring = $false,
    [switch]$CheckStatus = $false,
    [int]$HealthCheckInterval = 30, # seconds
    [int]$MaxRestartAttempts = 3
)

# Configuration for MCP servers to monitor
$MCPServers = @{
    "MemorAI" = @{
        "HealthEndpoint" = "http://localhost:4950/health"
        "RestartTask" = "🔄 Restart MemorAI MCP Server"
        "StartupDelay" = 10
        "CriticalLevel" = $true  # Critical for agent conversations
    }
    "ControlAI" = @{
        "HealthEndpoint" = "http://localhost:7001/health" 
        "RestartCommand" = "Restart-MCPServer ControlAIMCP"
        "StartupDelay" = 5
        "CriticalLevel" = $true
    }
    "Glass" = @{
        "HealthEndpoint" = "http://localhost:8001/health"
        "RestartCommand" = "Restart-MCPServer GlassMCP" 
        "StartupDelay" = 3
        "CriticalLevel" = $false
    }
}

$MonitorLogPath = "E:\GitHub\codai-project\logs\mcp-monitor.log"
$RestartCounterPath = "E:\GitHub\codai-project\data\mcp-restart-counter.json"

function Write-MonitorLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    Write-Host $logEntry -ForegroundColor $(if($Level -eq "ERROR") {"Red"} elseif($Level -eq "WARN") {"Yellow"} else {"Green"})
    Add-Content -Path $MonitorLogPath -Value $logEntry
}

function Test-MCPServerHealth {
    param([string]$HealthEndpoint, [string]$ServerName)
    
    try {
        $response = Invoke-RestMethod -Uri $HealthEndpoint -Method Get -TimeoutSec 5 -ErrorAction Stop
        return $true
    }
    catch {
        Write-MonitorLog "Health check failed for $ServerName`: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Get-RestartCounter {
    if (Test-Path $RestartCounterPath) {
        return Get-Content $RestartCounterPath | ConvertFrom-Json
    }
    return @{}
}

function Update-RestartCounter {
    param([string]$ServerName, [int]$Count)
    
    $counters = Get-RestartCounter
    $counters.$ServerName = @{
        "Count" = $Count
        "LastRestart" = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        "ResetTime" = (Get-Date).AddHours(1).ToString()  # Reset counter after 1 hour
    }
    
    $counters | ConvertTo-Json | Set-Content $RestartCounterPath
}

function Reset-RestartCounterIfNeeded {
    param([string]$ServerName)
    
    $counters = Get-RestartCounter
    if ($counters.$ServerName -and $counters.$ServerName.ResetTime) {
        $resetTime = [DateTime]::Parse($counters.$ServerName.ResetTime)
        if ((Get-Date) -gt $resetTime) {
            Update-RestartCounter -ServerName $ServerName -Count 0
            Write-MonitorLog "Reset restart counter for $ServerName" "INFO"
        }
    }
}

function Restart-MCPServer {
    param([string]$ServerName, [hashtable]$ServerConfig)
    
    Reset-RestartCounterIfNeeded -ServerName $ServerName
    $counters = Get-RestartCounter
    $currentCount = if ($counters.$ServerName) { $counters.$ServerName.Count } else { 0 }
    
    if ($currentCount -ge $MaxRestartAttempts) {
        Write-MonitorLog "Max restart attempts ($MaxRestartAttempts) reached for $ServerName. Manual intervention required." "ERROR"
        return $false
    }
    
    Write-MonitorLog "Attempting to restart $ServerName (attempt $($currentCount + 1)/$MaxRestartAttempts)" "WARN"
    
    try {
        if ($ServerConfig.RestartTask) {
            # Use VS Code task system
            Start-Process "code-insiders" -ArgumentList "--command", "workbench.action.tasks.runTask", $ServerConfig.RestartTask -NoNewWindow
        }
        elseif ($ServerConfig.RestartCommand) {
            # Use PowerShell command
            Invoke-Expression $ServerConfig.RestartCommand
        }
        
        # Wait for server to start
        Start-Sleep -Seconds $ServerConfig.StartupDelay
        
        # Verify restart success
        if (Test-MCPServerHealth -HealthEndpoint $ServerConfig.HealthEndpoint -ServerName $ServerName) {
            Write-MonitorLog "$ServerName restarted successfully" "INFO"
            Update-RestartCounter -ServerName $ServerName -Count 0  # Reset on success
            return $true
        }
        else {
            Update-RestartCounter -ServerName $ServerName -Count ($currentCount + 1)
            return $false
        }
    }
    catch {
        Write-MonitorLog "Failed to restart $ServerName`: $($_.Exception.Message)" "ERROR"
        Update-RestartCounter -ServerName $ServerName -Count ($currentCount + 1)
        return $false
    }
}

function Start-MCPMonitoring {
    Write-MonitorLog "Starting MCP Server Resilience Monitor" "INFO"
    Write-MonitorLog "Health check interval: $HealthCheckInterval seconds" "INFO"
    Write-MonitorLog "Max restart attempts: $MaxRestartAttempts per hour" "INFO"
    
    # Create necessary directories
    $logDir = Split-Path $MonitorLogPath -Parent
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    
    $dataDir = Split-Path $RestartCounterPath -Parent  
    if (-not (Test-Path $dataDir)) {
        New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
    }
    
    while ($true) {
        foreach ($serverName in $MCPServers.Keys) {
            $serverConfig = $MCPServers[$serverName]
            
            if (-not (Test-MCPServerHealth -HealthEndpoint $serverConfig.HealthEndpoint -ServerName $serverName)) {
                if ($serverConfig.CriticalLevel) {
                    Write-MonitorLog "CRITICAL: $serverName is down - attempting restart" "ERROR"
                    Restart-MCPServer -ServerName $serverName -ServerConfig $serverConfig
                }
                else {
                    Write-MonitorLog "NON-CRITICAL: $serverName is down" "WARN"
                }
            }
        }
        
        Start-Sleep -Seconds $HealthCheckInterval
    }
}

function Stop-MCPMonitoring {
    Write-MonitorLog "Stopping MCP Server Resilience Monitor" "INFO"
    # Kill any running monitor processes
    Get-Process -Name "powershell" | Where-Object { 
        $_.MainWindowTitle -like "*mcp-resilience-monitor*" 
    } | Stop-Process -Force
}

function Show-MCPStatus {
    Write-Host "🔍 MCP Server Status Report" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    
    foreach ($serverName in $MCPServers.Keys) {
        $serverConfig = $MCPServers[$serverName]
        $isHealthy = Test-MCPServerHealth -HealthEndpoint $serverConfig.HealthEndpoint -ServerName $serverName
        $status = if ($isHealthy) { "✅ HEALTHY" } else { "❌ DOWN" }
        $critical = if ($serverConfig.CriticalLevel) { " (CRITICAL)" } else { " (NON-CRITICAL)" }
        
        Write-Host "$serverName`: $status$critical" -ForegroundColor $(if($isHealthy) {"Green"} else {"Red"})
    }
    
    # Show restart counters
    $counters = Get-RestartCounter
    if ($counters.Count -gt 0) {
        Write-Host "`n📊 Restart Statistics:" -ForegroundColor Cyan
        foreach ($server in $counters.Keys) {
            $counter = $counters.$server
            Write-Host "$server`: $($counter.Count) restarts (Last: $($counter.LastRestart))" -ForegroundColor Yellow
        }
    }
    
    Write-Host "================================" -ForegroundColor Cyan
}

# Main execution logic
if ($StartMonitoring) {
    Start-MCPMonitoring
}
elseif ($StopMonitoring) {
    Stop-MCPMonitoring  
}
elseif ($CheckStatus) {
    Show-MCPStatus
}
else {
    Write-Host "🚨 MCP Server Resilience Monitor" -ForegroundColor Cyan
    Write-Host "Usage:" -ForegroundColor White
    Write-Host "  -StartMonitoring    Start continuous monitoring" -ForegroundColor Green
    Write-Host "  -StopMonitoring     Stop monitoring process" -ForegroundColor Red
    Write-Host "  -CheckStatus        Show current server status" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor White
    Write-Host "  .\mcp-resilience-monitor.ps1 -CheckStatus" -ForegroundColor Gray
    Write-Host "  .\mcp-resilience-monitor.ps1 -StartMonitoring" -ForegroundColor Gray
}
