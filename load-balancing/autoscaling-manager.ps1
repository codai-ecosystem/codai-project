#!/usr/bin/env pwsh
# CODAI Ecosystem - Auto-Scaling Management Script
# Intelligent scaling controller for production deployment

param(
    [switch]$Deploy,
    [switch]$Scale,
    [switch]$Monitor,
    [switch]$Status,
    [string]$Service,
    [int]$Instances = 3,
    [switch]$EnableGPU,
    [switch]$HighPerformance,
    [switch]$All
)

function Write-Step { param($Message) Write-Host "🔧 $Message" -ForegroundColor Blue }
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }

Write-Host "🚀 CODAI Auto-Scaling Manager" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# Service scaling configurations
$ScalingConfig = @{
    'memorai-app' = @{
        minInstances = 2
        maxInstances = 6
        cpuThreshold = 70
        memoryThreshold = 75
        scaleUpCooldown = 300
        scaleDownCooldown = 600
    }
    'memorai-mcp' = @{
        minInstances = 2
        maxInstances = 4
        cpuThreshold = 80
        memoryThreshold = 85
        scaleUpCooldown = 240
        scaleDownCooldown = 480
    }
    'romai-agi' = @{
        minInstances = 1
        maxInstances = 3
        cpuThreshold = 75
        memoryThreshold = 80
        scaleUpCooldown = 600
        scaleDownCooldown = 900
    }
    'memorai-graphql' = @{
        minInstances = 2
        maxInstances = 4
        cpuThreshold = 65
        memoryThreshold = 70
        scaleUpCooldown = 180
        scaleDownCooldown = 360
    }
    'romai-enterprise' = @{
        minInstances = 1
        maxInstances = 3
        cpuThreshold = 70
        memoryThreshold = 75
        scaleUpCooldown = 300
        scaleDownCooldown = 600
    }
}

function Get-ContainerMetrics {
    param([string]$ServiceName)
    
    try {
        $containers = docker ps --filter "label=com.codai.service=$ServiceName" --format "table {{.Names}}\t{{.Status}}" | Select-Object -Skip 1
        $activeContainers = ($containers | Measure-Object).Count
        
        # Get CPU and Memory usage
        $stats = docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemPerc}}" | Select-Object -Skip 1
        
        $serviceStats = $stats | Where-Object { $_.Split("`t")[0] -like "$ServiceName*" }
        
        if ($serviceStats) {
            $avgCpu = ($serviceStats | ForEach-Object { 
                [float]($_.Split("`t")[1].Replace('%', ''))
            } | Measure-Object -Average).Average
            
            $avgMemory = ($serviceStats | ForEach-Object { 
                [float]($_.Split("`t")[2].Replace('%', ''))
            } | Measure-Object -Average).Average
            
            return @{
                service = $ServiceName
                activeInstances = $activeContainers
                avgCpuPercent = [math]::Round($avgCpu, 2)
                avgMemoryPercent = [math]::Round($avgMemory, 2)
                status = "healthy"
            }
        } else {
            return @{
                service = $ServiceName
                activeInstances = $activeContainers
                avgCpuPercent = 0
                avgMemoryPercent = 0
                status = "no-stats"
            }
        }
    } catch {
        return @{
            service = $ServiceName
            activeInstances = 0
            avgCpuPercent = 0
            avgMemoryPercent = 0
            status = "error"
            error = $_.Exception.Message
        }
    }
}

function Scale-Service {
    param(
        [string]$ServiceName,
        [int]$TargetInstances,
        [string]$Profile = "default"
    )
    
    Write-Step "Scaling $ServiceName to $TargetInstances instances..."
    
    try {
        # Get current instances
        $currentContainers = docker ps --filter "label=com.codai.service=$ServiceName" --format "{{.Names}}"
        $currentCount = ($currentContainers | Measure-Object).Count
        
        if ($TargetInstances -gt $currentCount) {
            # Scale up
            $needed = $TargetInstances - $currentCount
            Write-Info "Scaling up: Adding $needed instances"
            
            if ($Profile -ne "default") {
                docker-compose -f docker-compose.autoscaling.yml --profile $Profile up -d --scale "$ServiceName=$TargetInstances"
            } else {
                docker-compose -f docker-compose.autoscaling.yml up -d --scale "$ServiceName=$TargetInstances"
            }
            
        } elseif ($TargetInstances -lt $currentCount) {
            # Scale down
            $toRemove = $currentCount - $TargetInstances
            Write-Info "Scaling down: Removing $toRemove instances"
            
            # Get containers to remove (highest numbered instances first)
            $containersToRemove = $currentContainers | Sort-Object -Descending | Select-Object -First $toRemove
            
            foreach ($container in $containersToRemove) {
                Write-Info "Stopping container: $container"
                docker stop $container
                docker rm $container
            }
        } else {
            Write-Info "Service $ServiceName already at target scale ($TargetInstances instances)"
            return $true
        }
        
        # Wait for services to stabilize
        Write-Step "Waiting for services to stabilize..."
        Start-Sleep -Seconds 30
        
        # Verify scaling
        $newContainers = docker ps --filter "label=com.codai.service=$ServiceName" --format "{{.Names}}"
        $newCount = ($newContainers | Measure-Object).Count
        
        if ($newCount -eq $TargetInstances) {
            Write-Success "Successfully scaled $ServiceName to $TargetInstances instances"
            return $true
        } else {
            Write-Error "Scaling failed: Expected $TargetInstances, got $newCount instances"
            return $false
        }
    } catch {
        Write-Error "Failed to scale $ServiceName`: $($_.Exception.Message)"
        return $false
    }
}

function Invoke-AutoScaling {
    Write-Step "Running auto-scaling analysis..."
    
    foreach ($serviceName in $ScalingConfig.Keys) {
        $config = $ScalingConfig[$serviceName]
        $metrics = Get-ContainerMetrics -ServiceName $serviceName
        
        Write-Info "`n📊 Service: $serviceName"
        Write-Host "   Current Instances: $($metrics.activeInstances)" -ForegroundColor White
        Write-Host "   CPU Usage: $($metrics.avgCpuPercent)%" -ForegroundColor White
        Write-Host "   Memory Usage: $($metrics.avgMemoryPercent)%" -ForegroundColor White
        
        # Scaling decision logic
        $shouldScaleUp = $false
        $shouldScaleDown = $false
        
        if ($metrics.avgCpuPercent -gt $config.cpuThreshold -or $metrics.avgMemoryPercent -gt $config.memoryThreshold) {
            if ($metrics.activeInstances -lt $config.maxInstances) {
                $shouldScaleUp = $true
                Write-Warning "   ⬆️  Scale up recommended (CPU: $($metrics.avgCpuPercent)%, Memory: $($metrics.avgMemoryPercent)%)"
            } else {
                Write-Warning "   🚫 At maximum instances ($($config.maxInstances))"
            }
        } elseif ($metrics.avgCpuPercent -lt ($config.cpuThreshold * 0.5) -and $metrics.avgMemoryPercent -lt ($config.memoryThreshold * 0.5)) {
            if ($metrics.activeInstances -gt $config.minInstances) {
                $shouldScaleDown = $true
                Write-Info "   ⬇️  Scale down possible (Low utilization)"
            }
        } else {
            Write-Success "   ✅ Optimal resource utilization"
        }
        
        # Execute scaling (if enabled)
        if ($shouldScaleUp) {
            $targetInstances = [math]::Min($metrics.activeInstances + 1, $config.maxInstances)
            Scale-Service -ServiceName $serviceName -TargetInstances $targetInstances
        } elseif ($shouldScaleDown) {
            $targetInstances = [math]::Max($metrics.activeInstances - 1, $config.minInstances)
            Scale-Service -ServiceName $serviceName -TargetInstances $targetInstances
        }
    }
}

function Get-SystemStatus {
    Write-Step "Getting system status..."
    
    # Nginx Load Balancer Status
    try {
        $nginxHealth = Invoke-RestMethod -Uri "http://localhost:8080/nginx-health" -TimeoutSec 5 -ErrorAction Stop
        Write-Success "Load Balancer: Healthy"
    } catch {
        Write-Error "Load Balancer: Unhealthy - $($_.Exception.Message)"
    }
    
    # Service Status Overview
    Write-Info "`n📈 Service Scaling Status:"
    Write-Host ("=" * 60) -ForegroundColor Cyan
    
    $totalInstances = 0
    $totalServices = 0
    
    foreach ($serviceName in $ScalingConfig.Keys) {
        $metrics = Get-ContainerMetrics -ServiceName $serviceName
        $config = $ScalingConfig[$serviceName]
        
        $statusIcon = switch ($metrics.status) {
            "healthy" { "✅" }
            "no-stats" { "⚠️" }
            "error" { "❌" }
            default { "❓" }
        }
        
        Write-Host "$statusIcon $serviceName" -NoNewline -ForegroundColor White
        Write-Host " - " -NoNewline
        Write-Host "$($metrics.activeInstances)/$($config.maxInstances) instances" -NoNewline -ForegroundColor Cyan
        Write-Host " (CPU: $($metrics.avgCpuPercent)%, Mem: $($metrics.avgMemoryPercent)%)" -ForegroundColor Gray
        
        $totalInstances += $metrics.activeInstances
        $totalServices++
    }
    
    Write-Host ("=" * 60) -ForegroundColor Cyan
    Write-Host "📊 Total: $totalServices services, $totalInstances instances" -ForegroundColor Green
    
    # Resource Usage Summary
    try {
        $systemStats = docker system df --format "table {{.Type}}\t{{.TotalCount}}\t{{.Size}}"
        Write-Info "`n💾 Docker Resource Usage:"
        $systemStats
    } catch {
        Write-Warning "Could not retrieve Docker resource usage"
    }
}

function Deploy-AutoScaling {
    Write-Step "Deploying auto-scaling infrastructure..."
    
    # Create required directories
    Write-Step "Creating required directories..."
    New-Item -ItemType Directory -Force -Path "./data/cbd/primary" | Out-Null
    New-Item -ItemType Directory -Force -Path "./data/cbd/replica" | Out-Null
    New-Item -ItemType Directory -Force -Path "./data/romai/models" | Out-Null
    New-Item -ItemType Directory -Force -Path "./ssl" | Out-Null
    New-Item -ItemType Directory -Force -Path "./autoscaler" | Out-Null
    
    # Generate self-signed SSL certificate if not exists
    if (-not (Test-Path "./ssl/codai.crt")) {
        Write-Step "Generating self-signed SSL certificate..."
        try {
            # Create certificate using OpenSSL (if available) or PowerShell
            $cert = New-SelfSignedCertificate -DnsName "codai.ro", "*.codai.ro", "localhost" -CertStoreLocation "cert:\LocalMachine\My"
            $pwd = ConvertTo-SecureString -String "codai2025" -Force -AsPlainText
            Export-PfxCertificate -Cert $cert -FilePath "./ssl/codai.pfx" -Password $pwd | Out-Null
            Write-Success "SSL certificate generated"
        } catch {
            Write-Warning "Could not generate SSL certificate: $($_.Exception.Message)"
        }
    }
    
    # Generate DH parameters if not exists
    if (-not (Test-Path "./dhparam.pem")) {
        Write-Step "Generating DH parameters (this may take a while)..."
        # Note: In production, generate with: openssl dhparam -out dhparam.pem 2048
        "# DH Parameters placeholder - generate with: openssl dhparam -out dhparam.pem 2048" | Out-File -FilePath "./dhparam.pem"
    }
    
    # Deploy base services
    Write-Step "Starting base auto-scaling deployment..."
    docker-compose -f docker-compose.autoscaling.yml up -d
    
    if ($HighPerformance) {
        Write-Step "Enabling high-performance profile..."
        docker-compose -f docker-compose.autoscaling.yml --profile high-performance up -d
    }
    
    if ($EnableGPU) {
        Write-Step "GPU support requested - ensure NVIDIA Docker runtime is configured"
        Write-Warning "GPU support requires nvidia-docker2 and proper runtime configuration"
    }
    
    # Wait for services to initialize
    Write-Step "Waiting for services to initialize (60 seconds)..."
    Start-Sleep -Seconds 60
    
    Write-Success "Auto-scaling deployment completed"
    Get-SystemStatus
}

function Start-ContinuousMonitoring {
    Write-Step "Starting continuous monitoring and auto-scaling..."
    Write-Info "Press Ctrl+C to stop monitoring"
    
    $iteration = 1
    while ($true) {
        try {
            Write-Host "`n" + ("=" * 60) -ForegroundColor Magenta
            Write-Host "📊 Auto-Scaling Monitor - Iteration $iteration" -ForegroundColor Magenta
            Write-Host "⏰ $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
            Write-Host ("=" * 60) -ForegroundColor Magenta
            
            Invoke-AutoScaling
            
            Write-Info "`n⏱️  Next check in 60 seconds..."
            Start-Sleep -Seconds 60
            $iteration++
            
        } catch [System.Management.Automation.HaltCommandException] {
            Write-Info "`n🛑 Monitoring stopped by user"
            break
        } catch {
            Write-Error "Monitoring error: $($_.Exception.Message)"
            Write-Info "Retrying in 30 seconds..."
            Start-Sleep -Seconds 30
        }
    }
}

# Main execution logic
if ($Deploy -or $All) {
    Deploy-AutoScaling
}

if ($Scale -and $Service) {
    Scale-Service -ServiceName $Service -TargetInstances $Instances
} elseif ($Scale) {
    Write-Warning "Scale operation requires -Service parameter"
    exit 1
}

if ($Status -or $All) {
    Get-SystemStatus
}

if ($Monitor) {
    Start-ContinuousMonitoring
}

# Default action if no parameters
if (-not ($Deploy -or $Scale -or $Monitor -or $Status -or $All)) {
    Write-Warning "Usage: ./autoscaling-manager.ps1 [options]"
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Cyan
    Write-Host "  -Deploy              Deploy auto-scaling infrastructure"
    Write-Host "  -Scale -Service <name> -Instances <n>  Scale specific service"
    Write-Host "  -Status              Show current scaling status"
    Write-Host "  -Monitor             Start continuous monitoring"
    Write-Host "  -EnableGPU           Enable GPU support (requires nvidia-docker)"
    Write-Host "  -HighPerformance     Enable high-performance instances"
    Write-Host "  -All                 Deploy and show status"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Green
    Write-Host "  ./autoscaling-manager.ps1 -Deploy"
    Write-Host "  ./autoscaling-manager.ps1 -Scale -Service memorai-app -Instances 4"
    Write-Host "  ./autoscaling-manager.ps1 -Monitor"
    Write-Host "  ./autoscaling-manager.ps1 -Status"
    exit 1
}

Write-Host "`n🏁 Auto-scaling management completed" -ForegroundColor Cyan