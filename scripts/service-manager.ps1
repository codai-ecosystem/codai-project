# PowerShell Service Manager Utility
# Manages CODAI ecosystem services with status monitoring and control
param(
    [string]$Action = "status",
    [string[]]$Services = @(),
    [switch]$Verbose = $false
)

Write-Host "🛠️ CODAI Service Manager" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

# Define service configuration
$serviceMap = @{
    'cbd' = @{ 
        port = 4180
        name = "CBD Universal Database"
        path = "packages/cbd"
        healthEndpoint = "http://localhost:4180/health"
        startCommand = "tsx"
        startArgs = @("src/start.ts")
    }
    'gateway' = @{ 
        port = 4003
        name = "API Gateway"
        path = "apps/gateway"
        healthEndpoint = "http://localhost:4003/health"
        startCommand = "pnpm"
        startArgs = @("dev")
    }
    'codai' = @{ 
        port = 4001
        name = "CODAI Main App"
        path = "apps/codai"
        healthEndpoint = "http://localhost:4001"
        startCommand = "pnpm"
        startArgs = @("dev")
    }
    'id' = @{ 
        port = 4004
        name = "ID Service"
        path = "apps/id"
        healthEndpoint = "http://localhost:4004"
        startCommand = "pnpm"
        startArgs = @("dev")
    }
    'bancai' = @{ 
        port = 4005
        name = "BancAI App"
        path = "apps/bancai"
        healthEndpoint = "http://localhost:4005"
        startCommand = "pnpm"
        startArgs = @("dev")
    }
    'memorai' = @{ 
        port = 4006
        name = "MemorAI App"
        path = "apps/memorai"
        healthEndpoint = "http://localhost:4006"
        startCommand = "pnpm"
        startArgs = @("dev")
    }
    'admin' = @{ 
        port = 4007
        name = "Admin Dashboard"
        path = "apps/admin"
        healthEndpoint = "http://localhost:4007"
        startCommand = "pnpm"
        startArgs = @("dev")
    }
    'hub' = @{ 
        port = 4008
        name = "Hub App"
        path = "apps/hub"
        healthEndpoint = "http://localhost:4008"
        startCommand = "pnpm"
        startArgs = @("dev")
    }
    'controlai' = @{ 
        port = 4200
        name = "ControlAI Dashboard"
        path = "apps/controlai-dashboard"
        healthEndpoint = "http://localhost:4200"
        startCommand = "pnpm"
        startArgs = @("dev")
    }
    'romai' = @{ 
        port = 6100
        name = "RomAI App"
        path = "apps/romai"
        healthEndpoint = "http://localhost:6100/api/health"
        startCommand = "pnpm"
        startArgs = @("dev")
    }
}

function Get-ServiceStatus {
    param([hashtable]$Service, [string]$ServiceKey)
    
    $port = $Service.port
    $name = $Service.name
    
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($connections) {
            $processId = $connections[0].OwningProcess
            $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
            
            if ($process) {
                return @{
                    Key = $ServiceKey
                    Name = $name
                    Port = $port
                    Status = "Running"
                    ProcessId = $processId
                    ProcessName = $process.ProcessName
                    Icon = "🟢"
                }
            }
        }
        
        return @{
            Key = $ServiceKey
            Name = $name
            Port = $port
            Status = "Stopped"
            ProcessId = $null
            ProcessName = $null
            Icon = "🔴"
        }
    }
    catch {
        return @{
            Key = $ServiceKey
            Name = $name
            Port = $port
            Status = "Unknown"
            ProcessId = $null
            ProcessName = $null
            Icon = "❓"
            Error = $_.Exception.Message
        }
    }
}

function Show-ServiceStatus {
    param([string[]]$ServiceList)
    
    if ($ServiceList.Count -eq 0) {
        $ServiceList = $serviceMap.Keys
    }
    
    Write-Host "`n📊 Service Status Overview:" -ForegroundColor Cyan
    Write-Host "Service".PadRight(25) + "Port".PadRight(8) + "Status".PadRight(12) + "Process" -ForegroundColor Gray
    Write-Host ("-" * 60) -ForegroundColor Gray
    
    foreach ($serviceKey in $ServiceList) {
        if ($serviceMap.ContainsKey($serviceKey)) {
            $status = Get-ServiceStatus -Service $serviceMap[$serviceKey] -ServiceKey $serviceKey
            
            $serviceName = "$($status.Icon) $($status.Name)".PadRight(25)
            $port = $status.Port.ToString().PadRight(8)
            $statusText = $status.Status.PadRight(12)
            $process = if ($status.ProcessName) { "$($status.ProcessName) ($($status.ProcessId))" } else { "N/A" }
            
            Write-Host "$serviceName$port$statusText$process"
            
            if ($status.Error -and $Verbose) {
                Write-Host "   Error: $($status.Error)" -ForegroundColor Red
            }
        }
        else {
            Write-Host "❓ Unknown service: $serviceKey" -ForegroundColor Yellow
        }
    }
}

function Stop-Services {
    param([string[]]$ServiceList)
    
    if ($ServiceList.Count -eq 0) {
        $ServiceList = $serviceMap.Keys
    }
    
    Write-Host "`n🛑 Stopping Services:" -ForegroundColor Yellow
    
    foreach ($serviceKey in $ServiceList) {
        if ($serviceMap.ContainsKey($serviceKey)) {
            $service = $serviceMap[$serviceKey]
            $status = Get-ServiceStatus -Service $service -ServiceKey $serviceKey
            
            if ($status.Status -eq "Running") {
                try {
                    Stop-Process -Id $status.ProcessId -Force -ErrorAction Stop
                    Write-Host "✅ Stopped $($service.name) (PID: $($status.ProcessId))" -ForegroundColor Green
                }
                catch {
                    Write-Host "❌ Failed to stop $($service.name): $($_.Exception.Message)" -ForegroundColor Red
                }
            }
            else {
                Write-Host "ℹ️ $($service.name) was not running" -ForegroundColor Gray
            }
        }
    }
}

function Get-ServiceHealth {
    param([string[]]$ServiceList)
    
    if ($ServiceList.Count -eq 0) {
        $ServiceList = $serviceMap.Keys | Where-Object { $serviceMap[$_].healthEndpoint }
    }
    
    Write-Host "`n🔍 Health Check Results:" -ForegroundColor Cyan
    
    foreach ($serviceKey in $ServiceList) {
        if ($serviceMap.ContainsKey($serviceKey)) {
            $service = $serviceMap[$serviceKey]
            
            if ($service.healthEndpoint) {
                try {
                    $request = [System.Net.WebRequest]::Create($service.healthEndpoint)
                    $request.Timeout = 3000  # 3 seconds
                    $response = $request.GetResponse()
                    $statusCode = [int]$response.StatusCode
                    $response.Close()
                    
                    if ($statusCode -eq 200) {
                        Write-Host "✅ $($service.name) - Healthy" -ForegroundColor Green
                    }
                    else {
                        Write-Host "⚠️ $($service.name) - Status $statusCode" -ForegroundColor Yellow
                    }
                }
                catch {
                    Write-Host "❌ $($service.name) - Not responding" -ForegroundColor Red
                }
            }
            else {
                Write-Host "ℹ️ $($service.name) - No health endpoint" -ForegroundColor Gray
            }
        }
    }
}

# Main action handling
switch ($Action.ToLower()) {
    "status" {
        Show-ServiceStatus -ServiceList $Services
    }
    "stop" {
        Stop-Services -ServiceList $Services
    }
    "health" {
        Get-ServiceHealth -ServiceList $Services
    }
    "list" {
        Write-Host "`n📋 Available Services:" -ForegroundColor Cyan
        foreach ($key in $serviceMap.Keys | Sort-Object) {
            $service = $serviceMap[$key]
            Write-Host "  $key - $($service.name) (Port: $($service.port))" -ForegroundColor White
        }
    }
    default {
        Write-Host "❌ Unknown action: $Action" -ForegroundColor Red
        Write-Host "`nAvailable actions:" -ForegroundColor Yellow
        Write-Host "  status  - Show service status (default)"
        Write-Host "  stop    - Stop services"
        Write-Host "  health  - Check service health"
        Write-Host "  list    - List available services"
        Write-Host "`nExamples:" -ForegroundColor Yellow
        Write-Host "  .\service-manager.ps1 -Action status"
        Write-Host "  .\service-manager.ps1 -Action stop -Services @('cbd', 'gateway')"
        Write-Host "  .\service-manager.ps1 -Action health -Services @('cbd')"
    }
}
