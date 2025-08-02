# ROMAI Monitoring Stack Setup Script
# PowerShell script to deploy enterprise monitoring infrastructure

param(
    [switch]$StartDocker = $false,
    [switch]$CreateEnvFile = $true,
    [switch]$SetupDirectories = $true,
    [switch]$ValidateSetup = $true
)

Write-Host "ROMAI Phase 4 Week 3 Day 15 - Grafana Enterprise Monitoring Setup" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan

# Check if Docker Desktop is running
function Test-DockerRunning {
    try {
        $dockerInfo = docker info 2>$null
        return $true
    }
    catch {
        return $false
    }
}

# Start Docker Desktop if requested
if ($StartDocker) {
    Write-Host "Starting Docker Desktop..." -ForegroundColor Yellow
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe" -WindowStyle Hidden
    
    # Wait for Docker to start (max 60 seconds)
    $timeout = 60
    $elapsed = 0
    while (-not (Test-DockerRunning) -and $elapsed -lt $timeout) {
        Write-Host "Waiting for Docker Desktop to start... ($elapsed/$timeout seconds)" -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        $elapsed += 5
    }
    
    if (Test-DockerRunning) {
        Write-Host "Docker Desktop is running" -ForegroundColor Green
    } else {
        Write-Host "Docker Desktop failed to start within $timeout seconds" -ForegroundColor Red
        Write-Host "Please start Docker Desktop manually and run this script again" -ForegroundColor Yellow
        exit 1
    }
}

# Check Docker status
if (-not (Test-DockerRunning)) {
    Write-Host "Docker Desktop is not running" -ForegroundColor Red
    Write-Host "Please start Docker Desktop or run with -StartDocker flag" -ForegroundColor Yellow
    Write-Host "Example: .\setup-monitoring.ps1 -StartDocker" -ForegroundColor Cyan
    exit 1
}

Write-Host "Docker Desktop is running" -ForegroundColor Green

# Create environment file
if ($CreateEnvFile) {
    Write-Host "Creating environment configuration..." -ForegroundColor Yellow
    
    $envContent = @"
# ROMAI Monitoring Environment Configuration
# Generated on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# Grafana Configuration
GRAFANA_ADMIN_PASSWORD=romai_admin_2025_secure
GRAFANA_SECRET_KEY=romai_secret_key_2025_enterprise_monitoring

# Database Configuration
POSTGRES_PASSWORD=grafana_secure_2025_db

# Redis Configuration
REDIS_PASSWORD=redis_secure_2025_cache

# SMTP Configuration (optional - configure for email alerts)
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-app-password

# InfluxDB Configuration (optional)
INFLUXDB_PASSWORD=influxdb_secure_2025

# Security Keys
JWT_SECRET=romai_jwt_secret_2025_monitoring
API_KEY=romai_api_key_2025_enterprise

# Network Configuration
MONITORING_NETWORK=romai-monitoring
GRAFANA_PORT=3001
PROMETHEUS_PORT=9090
ALERTMANAGER_PORT=9093
"@

    $envFile = "e:\GitHub\romai\infrastructure\monitoring\.env"
    $envContent | Out-File -FilePath $envFile -Encoding UTF8
    Write-Host "Environment file created: $envFile" -ForegroundColor Green
}

# Setup directory structure
if ($SetupDirectories) {
    Write-Host "Setting up monitoring directory structure..." -ForegroundColor Yellow
    
    $directories = @(
        "e:\GitHub\romai\infrastructure\monitoring\grafana\dashboards\system",
        "e:\GitHub\romai\infrastructure\monitoring\grafana\dashboards\application",
        "e:\GitHub\romai\infrastructure\monitoring\grafana\dashboards\business",
        "e:\GitHub\romai\infrastructure\monitoring\grafana\dashboards\infrastructure",
        "e:\GitHub\romai\infrastructure\monitoring\grafana\dashboards\security",
        "e:\GitHub\romai\infrastructure\monitoring\grafana\dashboards\sla",
        "e:\GitHub\romai\infrastructure\monitoring\grafana\plugins",
        "e:\GitHub\romai\infrastructure\monitoring\prometheus\rules",
        "e:\GitHub\romai\infrastructure\monitoring\alertmanager",
        "e:\GitHub\romai\infrastructure\monitoring\loki",
        "e:\GitHub\romai\infrastructure\monitoring\promtail",
        "e:\GitHub\romai\infrastructure\monitoring\logs"
    )
    
    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Host "  Created: $dir" -ForegroundColor Green
        } else {
            Write-Host "  Exists: $dir" -ForegroundColor Gray
        }
    }
}

# Validate setup
if ($ValidateSetup) {
    Write-Host "Validating monitoring setup..." -ForegroundColor Yellow
    
    $requiredFiles = @(
        "e:\GitHub\romai\infrastructure\monitoring\docker-compose.monitoring.yml",
        "e:\GitHub\romai\infrastructure\monitoring\prometheus\prometheus.yml",
        "e:\GitHub\romai\infrastructure\monitoring\prometheus\rules\romai-alerts.yml",
        "e:\GitHub\romai\infrastructure\monitoring\grafana\provisioning\datasources\datasources.yml",
        "e:\GitHub\romai\infrastructure\monitoring\grafana\provisioning\dashboards\dashboards.yml"
    )
    
    $allFilesExist = $true
    foreach ($file in $requiredFiles) {
        if (Test-Path $file) {
            Write-Host "  Found: $(Split-Path $file -Leaf)" -ForegroundColor Green
        } else {
            Write-Host "  Missing: $file" -ForegroundColor Red
            $allFilesExist = $false
        }
    }
    
    if ($allFilesExist) {
        Write-Host "All required configuration files are present" -ForegroundColor Green
    } else {
        Write-Host "Some configuration files are missing" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Review and customize the .env file if needed" -ForegroundColor White
Write-Host "2. Run: docker-compose -f docker-compose.monitoring.yml up -d" -ForegroundColor Yellow
Write-Host "3. Access Grafana at: http://localhost:3001" -ForegroundColor Yellow
Write-Host "4. Default credentials: admin / romai_admin_2025_secure" -ForegroundColor Yellow
Write-Host ""
Write-Host "Phase 4 Week 3 Day 15 Status: Grafana Enterprise Configuration Complete!" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Cyan
