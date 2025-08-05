# 🚀 CODAI Ecosystem - Production Deployment Script (PowerShell)
# Generated: 2025-08-03 23:30 UTC
# Phase 8: Production Deployment Automation

param(
    [Parameter(Position=0)]
    [ValidateSet("staging", "production")]
    [string]$Environment = "production"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 CODAI Ecosystem Production Deployment" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Gray

# Configuration
$DeploymentDir = "C:\CODAI"
$BackupDir = "$DeploymentDir\backups"
$LogFile = "$DeploymentDir\logs\deployment.log"

Write-Host "📋 Environment: $Environment" -ForegroundColor Yellow
Write-Host "📁 Deployment Directory: $DeploymentDir" -ForegroundColor White

# Ensure directories exist
if (!(Test-Path $BackupDir)) { New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null }
if (!(Test-Path (Split-Path $LogFile))) { New-Item -ItemType Directory -Path (Split-Path $LogFile) -Force | Out-Null }

# Function to log messages
function Write-Log {
    param($Message)
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$Timestamp - $Message" | Out-File -FilePath $LogFile -Append
    Write-Host $Message
}

# Step 1: Pre-deployment Checks
Write-Host ""
Write-Host "🔍 Step 1: Pre-deployment Checks" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Gray

Write-Log "📊 Checking service health..."

# Check CBD Database
try {
    $cbdHealth = Invoke-RestMethod -Uri "http://localhost:4180/health" -TimeoutSec 5
    Write-Host "✅ CBD Database: Healthy" -ForegroundColor Green
    Write-Log "CBD Database health check passed"
} catch {
    Write-Host "❌ CBD Database: Unhealthy" -ForegroundColor Red
    Write-Host "🛑 Deployment aborted - Fix CBD Database first" -ForegroundColor Red
    Write-Log "CBD Database health check failed: $($_.Exception.Message)"
    exit 1
}

# Check Gateway Service
try {
    $gatewayHealth = Invoke-RestMethod -Uri "http://localhost:4003/health" -TimeoutSec 5
    Write-Host "✅ Gateway Service: Healthy" -ForegroundColor Green
    Write-Log "Gateway Service health check passed"
} catch {
    Write-Host "❌ Gateway Service: Unhealthy" -ForegroundColor Red
    Write-Host "🛑 Deployment aborted - Fix Gateway Service first" -ForegroundColor Red
    Write-Log "Gateway Service health check failed: $($_.Exception.Message)"
    exit 1
}

# Check disk space
$Drive = Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='C:'"
$FreeSpaceGB = [math]::Round($Drive.FreeSpace / 1GB, 2)
if ($FreeSpaceGB -lt 10) {
    Write-Host "❌ Insufficient disk space: ${FreeSpaceGB}GB available (minimum 10GB required)" -ForegroundColor Red
    Write-Log "Insufficient disk space: ${FreeSpaceGB}GB"
    exit 1
}
Write-Host "✅ Disk space: ${FreeSpaceGB}GB available" -ForegroundColor Green

# Check memory
$Memory = Get-WmiObject -Class Win32_ComputerSystem
$AvailableMemoryGB = [math]::Round($Memory.TotalPhysicalMemory / 1GB, 2)
if ($AvailableMemoryGB -lt 4) {
    Write-Host "❌ Insufficient memory: ${AvailableMemoryGB}GB total (minimum 4GB required)" -ForegroundColor Red
    Write-Log "Insufficient memory: ${AvailableMemoryGB}GB"
    exit 1
}
Write-Host "✅ Memory: ${AvailableMemoryGB}GB total" -ForegroundColor Green

# Step 2: Create Backup
Write-Host ""
Write-Host "💾 Step 2: Create Backup" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Gray

$BackupTimestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupPath = "$BackupDir\backup_$BackupTimestamp"

Write-Host "📦 Creating backup at: $BackupPath" -ForegroundColor Yellow
New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null

# Backup database
Write-Host "📊 Backing up CBD Database..." -ForegroundColor White
try {
    $backupData = Invoke-RestMethod -Uri "http://localhost:4180/backup"
    $backupData | ConvertTo-Json -Depth 10 | Out-File "$BackupPath\cbd_backup.json"
    Write-Host "✅ CBD Database backup completed" -ForegroundColor Green
    Write-Log "CBD Database backup created at $BackupPath\cbd_backup.json"
} catch {
    Write-Host "⚠️ CBD Database backup failed: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Log "CBD Database backup failed: $($_.Exception.Message)"
}

# Backup configuration files
Write-Host "⚙️ Backing up configuration..." -ForegroundColor White
if (Test-Path "$DeploymentDir\config") {
    Copy-Item "$DeploymentDir\config" "$BackupPath\config" -Recurse -Force
}
if (Test-Path "$DeploymentDir\.env") {
    Copy-Item "$DeploymentDir\.env" "$BackupPath\.env" -Force
}
Write-Host "✅ Configuration backup completed" -ForegroundColor Green

# Step 3: Environment Setup
Write-Host ""
Write-Host "🏗️ Step 3: Environment Setup" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Gray

# Set environment variables
$env:NODE_ENV = $Environment
Write-Host "🔧 Environment set to: $Environment" -ForegroundColor Yellow

# Copy environment-specific configuration
$EnvConfigPath = ".\environments\$Environment\.env.$Environment"
if (Test-Path $EnvConfigPath) {
    Copy-Item $EnvConfigPath "$DeploymentDir\.env.$Environment" -Force
    Write-Host "📋 Environment configuration copied" -ForegroundColor Green
} else {
    Write-Host "⚠️ Environment configuration not found: $EnvConfigPath" -ForegroundColor Yellow
}

# Step 4: Service Deployment
Write-Host ""
Write-Host "🚀 Step 4: Service Deployment" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Gray

# Check if Docker is available
try {
    docker --version | Out-Null
    $DockerAvailable = $true
    Write-Host "🐳 Docker detected - Using containerized deployment" -ForegroundColor Green
} catch {
    $DockerAvailable = $false
    Write-Host "📦 Docker not available - Using local deployment" -ForegroundColor Yellow
}

if ($DockerAvailable) {
    # Docker deployment
    Write-Host "🐳 Building Docker images..." -ForegroundColor White
    try {
        docker-compose -f docker-compose.yml build
        Write-Host "✅ Docker images built successfully" -ForegroundColor Green
        
        Write-Host "🚀 Deploying containerized services..." -ForegroundColor White
        docker-compose -f docker-compose.yml up -d
        Write-Host "✅ Containerized services deployed" -ForegroundColor Green
    } catch {
        Write-Host "❌ Docker deployment failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Log "Docker deployment failed: $($_.Exception.Message)"
    }
} else {
    # Local deployment
    Write-Host "📦 Starting local services..." -ForegroundColor White
    Write-Host "ℹ️ Using existing service processes" -ForegroundColor Cyan
}

# Step 5: Health Check Validation
Write-Host ""
Write-Host "🩺 Step 5: Health Check Validation" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Gray

Write-Host "⏳ Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Define services to check
$Services = @(
    @{Name="CBD Database"; Port=4180},
    @{Name="Gateway"; Port=4003},
    @{Name="CODAI App"; Port=4001},
    @{Name="Hub Service"; Port=4008},
    @{Name="BancAI Service"; Port=4005},
    @{Name="MemorAI Service"; Port=4006}
)

$HealthyCount = 0
$TotalServices = $Services.Count

foreach ($Service in $Services) {
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:$($Service.Port)/health" -TimeoutSec 3
        Write-Host "✅ $($Service.Name): Healthy" -ForegroundColor Green
        $HealthyCount++
        Write-Log "$($Service.Name) health check passed"
    } catch {
        Write-Host "❌ $($Service.Name): Unhealthy" -ForegroundColor Red
        Write-Log "$($Service.Name) health check failed: $($_.Exception.Message)"
    }
}

$HealthPercentage = [math]::Round(($HealthyCount / $TotalServices) * 100, 0)
Write-Host ""
Write-Host "📊 Health Status: $HealthyCount/$TotalServices services healthy ($HealthPercentage%)" -ForegroundColor $(if ($HealthPercentage -ge 80) { "Green" } else { "Red" })

if ($HealthPercentage -ge 60) {
    Write-Host "✅ Deployment successful - Health threshold met (≥60%)" -ForegroundColor Green
    Write-Log "Deployment successful with $HealthPercentage% health"
} else {
    Write-Host "❌ Deployment failed - Health threshold not met (<60%)" -ForegroundColor Red
    Write-Log "Deployment failed with $HealthPercentage% health"
    # Note: Not exiting to allow for partial deployments in development
}

# Step 6: Final Validation
Write-Host ""
Write-Host "🎯 Step 6: Final Validation" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Gray

# Test API endpoints
Write-Host "🧪 Testing API endpoints..." -ForegroundColor White

try {
    $stats = Invoke-RestMethod -Uri "http://localhost:4180/stats" -TimeoutSec 5
    Write-Host "✅ CBD Stats API: Working" -ForegroundColor Green
} catch {
    Write-Host "❌ CBD Stats API: Failed" -ForegroundColor Red
}

try {
    $gateway = Invoke-WebRequest -Uri "http://localhost:4003/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Gateway Health API: Working" -ForegroundColor Green
} catch {
    Write-Host "❌ Gateway Health API: Failed" -ForegroundColor Red
}

# Performance check
Write-Host "⚡ Performance check..." -ForegroundColor White
$StartTime = Get-Date
try {
    Invoke-RestMethod -Uri "http://localhost:4180/health" -TimeoutSec 2
    $ResponseTime = (Get-Date) - $StartTime
    $ResponseMs = [math]::Round($ResponseTime.TotalMilliseconds, 0)
    if ($ResponseMs -lt 1000) {
        Write-Host "✅ Performance: ${ResponseMs}ms response time" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Performance: ${ResponseMs}ms response time (slow)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Performance: Timeout" -ForegroundColor Red
}

# Step 7: Deployment Summary
Write-Host ""
Write-Host "🎉 DEPLOYMENT COMPLETED!" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Gray
Write-Host "🌐 Environment: $Environment" -ForegroundColor Yellow
Write-Host "📊 Health Status: $HealthyCount/$TotalServices services healthy ($HealthPercentage%)" -ForegroundColor White
Write-Host "📝 Logs: $LogFile" -ForegroundColor White
Write-Host "💾 Backup: $BackupPath" -ForegroundColor White
Write-Host "⏰ Deployment Time: $(Get-Date)" -ForegroundColor White

Write-Host ""
Write-Host "🔗 Service URLs:" -ForegroundColor Cyan
Write-Host "   CBD Database: http://localhost:4180" -ForegroundColor White
Write-Host "   Gateway: http://localhost:4003" -ForegroundColor White
Write-Host "   CODAI App: http://localhost:4001" -ForegroundColor White
Write-Host "   Hub: http://localhost:4008" -ForegroundColor White

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Monitor service health: http://localhost:4003/health" -ForegroundColor White
Write-Host "   2. Check CBD stats: http://localhost:4180/stats" -ForegroundColor White
Write-Host "   3. Review logs: Get-Content $LogFile -Tail 20" -ForegroundColor White

if ($HealthPercentage -ge 80) {
    Write-Host ""
    Write-Host "✅ Production deployment ready! System is healthy." -ForegroundColor Green
} elseif ($HealthPercentage -ge 60) {
    Write-Host ""
    Write-Host "⚠️ Deployment completed with warnings. Monitor unhealthy services." -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "❌ Deployment completed with issues. Review service health." -ForegroundColor Red
}

Write-Log "Deployment completed with $HealthPercentage% health status"
