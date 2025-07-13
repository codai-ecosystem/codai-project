# 🚀 ROMAI Production Deployment Script (PowerShell)
# Automated production deployment with validation and rollback for Windows
# Generated for Phase 4 Week 4 Day 24 - Production Deployment

param(
    [Parameter(Position=0)]
    [ValidateSet("deploy", "rollback", "status", "validate", "backup")]
    [string]$Action = "deploy",
    
    [Parameter(Position=1)]
    [string]$BackupPath = "",
    
    [string]$Version = "latest",
    [string]$Environment = "production"
)

# =============================================================================
# 🔧 CONFIGURATION
# =============================================================================

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path "$ScriptDir\..\.."
$DeployEnv = $Environment
$BuildRevision = try { (git rev-parse --short HEAD) } catch { "unknown" }

# Deployment configuration
$ComposeFile = "docker-compose.prod.yml"
$EnvFile = ".env.production"
$BackupDir = "C:\Backups\ROMAI"
$MaxRollbackVersions = 5

# =============================================================================
# 📋 LOGGING FUNCTIONS
# =============================================================================

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "INFO" { "Cyan" }
        "WARN" { "Yellow" }
        "ERROR" { "Red" }
        "SUCCESS" { "Green" }
        default { "White" }
    }
    
    Write-Host "[$timestamp] $Level`: $Message" -ForegroundColor $color
}

function Write-Success { param([string]$Message) Write-Log $Message "SUCCESS" }
function Write-Warning { param([string]$Message) Write-Log $Message "WARN" }
function Write-Error { param([string]$Message) Write-Log $Message "ERROR" }

# =============================================================================
# 🔍 PRE-DEPLOYMENT VALIDATION
# =============================================================================

function Test-Environment {
    Write-Log "Validating deployment environment..."
    
    # Check if Docker is running
    try {
        docker info | Out-Null
    } catch {
        Write-Error "Docker is not running or accessible"
        exit 1
    }
    
    # Check if Docker Compose is available
    if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        Write-Error "Docker Compose is not installed"
        exit 1
    }
    
    # Check if required files exist
    $composeFilePath = Join-Path $ProjectRoot $ComposeFile
    if (-not (Test-Path $composeFilePath)) {
        Write-Error "Docker Compose file not found: $ComposeFile"
        exit 1
    }
    
    $envFilePath = Join-Path $ProjectRoot $EnvFile
    if (-not (Test-Path $envFilePath)) {
        Write-Error "Environment file not found: $EnvFile"
        exit 1
    }
    
    # Validate environment variables
    $envContent = Get-Content $envFilePath -Raw
    if ($envContent -notmatch "AZURE_OPENAI_API_KEY=") {
        Write-Error "AZURE_OPENAI_API_KEY not found in environment file"
        exit 1
    }
    
    if ($envContent -notmatch "JWT_SECRET=") {
        Write-Error "JWT_SECRET not found in environment file"
        exit 1
    }
    
    # Check available disk space (minimum 5GB)
    $drive = (Get-Item $ProjectRoot).PSDrive
    $freeSpace = (Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='$($drive.Name):'").FreeSpace
    $minSpace = 5GB
    
    if ($freeSpace -lt $minSpace) {
        $freeSpaceGB = [math]::Round($freeSpace / 1GB, 2)
        $minSpaceGB = [math]::Round($minSpace / 1GB, 2)
        Write-Error "Insufficient disk space. Available: ${freeSpaceGB}GB, Required: ${minSpaceGB}GB"
        exit 1
    }
    
    Write-Success "Environment validation passed"
}

# =============================================================================
# 💾 BACKUP FUNCTIONS
# =============================================================================

function New-Backup {
    Write-Log "Creating backup of current deployment..."
    
    # Create backup directory
    if (-not (Test-Path $BackupDir)) {
        New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    }
    
    $backupTimestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupName = "romai_backup_$backupTimestamp"
    $backupPath = Join-Path $BackupDir $backupName
    
    # Create backup directory
    New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
    
    # Backup configuration files
    $envFilePath = Join-Path $ProjectRoot $EnvFile
    $composeFilePath = Join-Path $ProjectRoot $ComposeFile
    
    if (Test-Path $envFilePath) {
        Copy-Item $envFilePath $backupPath -Force
    }
    
    if (Test-Path $composeFilePath) {
        Copy-Item $composeFilePath $backupPath -Force
    }
    
    # Backup container volumes if they exist
    $volumes = docker volume ls --format "{{.Name}}" | Where-Object { $_ -match "romai" }
    if ($volumes) {
        Write-Log "Backing up Docker volumes..."
        foreach ($volume in $volumes) {
            Write-Log "Backing up volume: $volume"
            try {
                docker run --rm -v "${volume}:/data" -v "${backupPath}:/backup" alpine tar czf "/backup/${volume}.tar.gz" -C /data .
            } catch {
                Write-Warning "Failed to backup volume: $volume"
            }
        }
    }
    
    # Export current container images
    $composeFilePath = Join-Path $ProjectRoot $ComposeFile
    Push-Location $ProjectRoot
    try {
        $runningContainers = docker-compose -f $ComposeFile ps -q
        if ($runningContainers) {
            Write-Log "Exporting current container images..."
            $images = docker-compose -f $ComposeFile images -q
            if ($images) {
                $imagesBackupPath = Join-Path $backupPath "images.tar.gz"
                docker save $images | gzip > $imagesBackupPath
            }
        }
    } catch {
        Write-Warning "Failed to backup images"
    } finally {
        Pop-Location
    }
    
    # Store deployment metadata
    $metadata = @{
        timestamp = $backupTimestamp
        version = $Version
        build_revision = $BuildRevision
        environment = $DeployEnv
        docker_compose_version = (docker-compose --version)
        docker_version = (docker --version)
        powershell_version = $PSVersionTable.PSVersion.ToString()
    } | ConvertTo-Json -Depth 2
    
    $metadata | Out-File -FilePath (Join-Path $backupPath "metadata.json") -Encoding UTF8
    
    # Cleanup old backups (keep only MAX_ROLLBACK_VERSIONS)
    $existingBackups = Get-ChildItem $BackupDir -Directory | Where-Object { $_.Name -match "romai_backup_" } | Sort-Object CreationTime -Descending
    if ($existingBackups.Count -gt $MaxRollbackVersions) {
        $backupsToRemove = $existingBackups | Select-Object -Skip $MaxRollbackVersions
        foreach ($backup in $backupsToRemove) {
            Remove-Item $backup.FullName -Recurse -Force
        }
    }
    
    $backupPath | Out-File -FilePath "$env:TEMP\romai_last_backup.txt" -Encoding UTF8
    Write-Success "Backup created: $backupPath"
    return $backupPath
}

# =============================================================================
# 🔨 BUILD FUNCTIONS
# =============================================================================

function Build-Images {
    Write-Log "Building production images..."
    
    Push-Location $ProjectRoot
    try {
        # Set environment variables
        $env:VERSION = $Version
        $env:BUILD_REVISION = $BuildRevision
        
        # Build images with no cache for production
        docker-compose -f $ComposeFile build --no-cache --parallel
        
        # Tag images with version
        $services = @("romai-api", "romai-dashboard", "romai-mcp")
        foreach ($service in $services) {
            $imageExists = docker images --format "{{.Repository}}" | Where-Object { $_ -eq "romai/$service" }
            if ($imageExists) {
                docker tag "romai/${service}:latest" "romai/${service}:$Version"
                docker tag "romai/${service}:latest" "romai/${service}:$BuildRevision"
            }
        }
        
        Write-Success "Images built successfully"
    } finally {
        Pop-Location
    }
}

# =============================================================================
# 🚀 DEPLOYMENT FUNCTIONS
# =============================================================================

function Deploy-Services {
    Write-Log "Deploying ROMAI services..."
    
    Push-Location $ProjectRoot
    try {
        # Set environment variables
        $env:VERSION = $Version
        $env:BUILD_REVISION = $BuildRevision
        
        # Pull external images
        Write-Log "Pulling external images..."
        docker-compose -f $ComposeFile pull elasticsearch kibana logstash redis nginx
        
        # Start core infrastructure first
        Write-Log "Starting core infrastructure..."
        docker-compose -f $ComposeFile --env-file $EnvFile up -d elasticsearch redis
        
        # Wait for core services to be healthy
        Wait-ForService "elasticsearch" "http://localhost:9200/_cluster/health" 120
        Wait-ForService "redis" 60
        
        # Start remaining ELK stack
        Write-Log "Starting ELK stack..."
        docker-compose -f $ComposeFile --env-file $EnvFile up -d kibana logstash
        
        # Wait for ELK services
        Wait-ForService "kibana" "http://localhost:5601/api/status" 180
        
        # Start ROMAI applications
        Write-Log "Starting ROMAI applications..."
        docker-compose -f $ComposeFile --env-file $EnvFile up -d romai-api romai-mcp romai-dashboard
        
        # Wait for application services
        Wait-ForService "romai-api" "http://localhost:8000/health" 120
        Wait-ForService "romai-dashboard" "http://localhost:4000/health" 120
        
        # Start nginx proxy
        Write-Log "Starting nginx reverse proxy..."
        docker-compose -f $ComposeFile --env-file $EnvFile up -d nginx
        
        Write-Success "All services deployed successfully"
    } finally {
        Pop-Location
    }
}

# =============================================================================
# 🔍 VALIDATION FUNCTIONS
# =============================================================================

function Wait-ForService {
    param(
        [string]$ServiceName,
        [string]$HealthUrl = "",
        [int]$Timeout = 60
    )
    
    Write-Log "Waiting for $ServiceName to be healthy..."
    
    $count = 0
    while ($count -lt $Timeout) {
        try {
            if ($HealthUrl) {
                $response = Invoke-WebRequest -Uri $HealthUrl -TimeoutSec 5 -UseBasicParsing
                if ($response.StatusCode -eq 200) {
                    Write-Success "$ServiceName is healthy"
                    return
                }
            } else {
                # For services without HTTP endpoints (like Redis)
                $containerStatus = docker ps --filter "name=$ServiceName" --format "{{.Status}}"
                if ($containerStatus -match "Up.*healthy") {
                    Write-Success "$ServiceName is healthy"
                    return
                }
            }
        } catch {
            # Continue waiting
        }
        
        Start-Sleep 5
        $count += 5
        Write-Host "." -NoNewline
    }
    
    Write-Host ""
    Write-Error "$ServiceName health check timeout after ${Timeout}s"
    throw "Service health check failed: $ServiceName"
}

function Test-Deployment {
    Write-Log "Validating deployment..."
    
    # Check if all containers are running
    $composeFilePath = Join-Path $ProjectRoot $ComposeFile
    Push-Location $ProjectRoot
    try {
        $services = @("romai-api", "romai-dashboard", "romai-mcp", "elasticsearch", "kibana", "redis", "nginx")
        $failedServices = @()
        
        $runningServices = docker-compose -f $ComposeFile ps --format "{{.Service}}"
        foreach ($service in $services) {
            $serviceStatus = docker-compose -f $ComposeFile ps $service --format "{{.State}}"
            if ($serviceStatus -ne "Up") {
                $failedServices += $service
            }
        }
        
        if ($failedServices.Count -gt 0) {
            Write-Error "Failed services: $($failedServices -join ', ')"
            return $false
        }
        
        # Validate service endpoints
        Write-Log "Validating service endpoints..."
        
        # API health check
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 10 -UseBasicParsing
            if ($response.StatusCode -ne 200) {
                Write-Error "API health check failed"
                return $false
            }
        } catch {
            Write-Error "API health check failed: $_"
            return $false
        }
        
        # Dashboard health check
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:4000" -TimeoutSec 10 -UseBasicParsing
            if ($response.StatusCode -ne 200) {
                Write-Error "Dashboard health check failed"
                return $false
            }
        } catch {
            Write-Error "Dashboard health check failed: $_"
            return $false
        }
        
        # Elasticsearch health check
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:9200/_cluster/health" -TimeoutSec 10 -UseBasicParsing
            if ($response.StatusCode -ne 200) {
                Write-Error "Elasticsearch health check failed"
                return $false
            }
        } catch {
            Write-Error "Elasticsearch health check failed: $_"
            return $false
        }
        
        Write-Success "Deployment validation passed"
        return $true
    } finally {
        Pop-Location
    }
}

# =============================================================================
# 🔄 ROLLBACK FUNCTIONS
# =============================================================================

function Invoke-Rollback {
    param([string]$BackupPath)
    
    if (-not $BackupPath) {
        $lastBackupFile = "$env:TEMP\romai_last_backup.txt"
        if (Test-Path $lastBackupFile) {
            $BackupPath = Get-Content $lastBackupFile -Raw
        }
    }
    
    if (-not $BackupPath -or -not (Test-Path $BackupPath)) {
        Write-Error "No valid backup path provided or backup not found"
        return $false
    }
    
    Write-Warning "Rolling back to backup: $BackupPath"
    
    Push-Location $ProjectRoot
    try {
        # Stop current services
        Write-Log "Stopping current services..."
        try {
            docker-compose -f $ComposeFile down
        } catch {
            Write-Warning "Failed to stop some services gracefully"
        }
        
        # Restore configuration files
        $backupEnvFile = Join-Path $BackupPath $EnvFile
        if (Test-Path $backupEnvFile) {
            Copy-Item $backupEnvFile $ProjectRoot -Force
        }
        
        $backupComposeFile = Join-Path $BackupPath $ComposeFile
        if (Test-Path $backupComposeFile) {
            Copy-Item $backupComposeFile $ProjectRoot -Force
        }
        
        # Restore container images
        $imagesBackup = Join-Path $BackupPath "images.tar.gz"
        if (Test-Path $imagesBackup) {
            Write-Log "Restoring container images..."
            Get-Content $imagesBackup | docker load
        }
        
        # Restore volumes
        $volumeBackups = Get-ChildItem $BackupPath -Filter "romai*.tar.gz"
        foreach ($volumeBackup in $volumeBackups) {
            $volumeName = $volumeBackup.BaseName
            Write-Log "Restoring volume: $volumeName"
            
            # Remove existing volume
            try {
                docker volume rm $volumeName
            } catch {
                # Volume might not exist
            }
            
            # Create and restore volume
            docker volume create $volumeName
            docker run --rm -v "${volumeName}:/data" -v "${BackupPath}:/backup" alpine tar xzf "/backup/$($volumeBackup.Name)" -C /data
        }
        
        # Start services with restored configuration
        Write-Log "Starting services with restored configuration..."
        docker-compose -f $ComposeFile --env-file $EnvFile up -d
        
        # Validate rollback
        if (Test-Deployment) {
            Write-Success "Rollback completed successfully"
            return $true
        } else {
            Write-Error "Rollback validation failed"
            return $false
        }
    } finally {
        Pop-Location
    }
}

# =============================================================================
# 📊 MONITORING FUNCTIONS
# =============================================================================

function Show-Status {
    Write-Log "ROMAI Production Status"
    Write-Host "======================================" -ForegroundColor Cyan
    
    Push-Location $ProjectRoot
    try {
        # Service status
        Write-Host "`nServices:" -ForegroundColor Yellow
        docker-compose -f $ComposeFile ps
        
        Write-Host "`nResource Usage:" -ForegroundColor Yellow
        docker stats --no-stream --format "table {{.Container}}`t{{.CPUPerc}}`t{{.MemUsage}}`t{{.NetIO}}`t{{.BlockIO}}"
        
        Write-Host "`nService URLs:" -ForegroundColor Yellow
        Write-Host "- API: http://localhost:8000"
        Write-Host "- Dashboard: http://localhost:4000"
        Write-Host "- Kibana: http://localhost:5601"
        Write-Host "- Elasticsearch: http://localhost:9200"
        
        Write-Host "`nHealth Checks:" -ForegroundColor Yellow
        
        # API health check
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 5 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Host " ✅ API" -ForegroundColor Green
            } else {
                Write-Host " ❌ API" -ForegroundColor Red
            }
        } catch {
            Write-Host " ❌ API" -ForegroundColor Red
        }
        
        # Dashboard health check
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:4000" -TimeoutSec 5 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Host " ✅ Dashboard" -ForegroundColor Green
            } else {
                Write-Host " ❌ Dashboard" -ForegroundColor Red
            }
        } catch {
            Write-Host " ❌ Dashboard" -ForegroundColor Red
        }
        
        # Elasticsearch health check
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:9200/_cluster/health" -TimeoutSec 5 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Host " ✅ Elasticsearch" -ForegroundColor Green
            } else {
                Write-Host " ❌ Elasticsearch" -ForegroundColor Red
            }
        } catch {
            Write-Host " ❌ Elasticsearch" -ForegroundColor Red
        }
        
        # Kibana health check
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:5601/api/status" -TimeoutSec 5 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Host " ✅ Kibana" -ForegroundColor Green
            } else {
                Write-Host " ❌ Kibana" -ForegroundColor Red
            }
        } catch {
            Write-Host " ❌ Kibana" -ForegroundColor Red
        }
    } finally {
        Pop-Location
    }
}

# =============================================================================
# 🎯 MAIN DEPLOYMENT FUNCTION
# =============================================================================

function Main {
    switch ($Action.ToLower()) {
        "deploy" {
            Write-Log "Starting ROMAI production deployment..."
            Test-Environment
            $backupPath = New-Backup
            Build-Images
            Deploy-Services
            
            if (Test-Deployment) {
                Write-Success "🎉 ROMAI deployment completed successfully!"
                Show-Status
            } else {
                Write-Error "Deployment validation failed. Rolling back..."
                Invoke-Rollback $backupPath
                exit 1
            }
        }
        
        "rollback" {
            Write-Log "Starting rollback process..."
            if (-not (Invoke-Rollback $BackupPath)) {
                exit 1
            }
        }
        
        "status" {
            Show-Status
        }
        
        "validate" {
            if (-not (Test-Deployment)) {
                exit 1
            }
        }
        
        "backup" {
            New-Backup
        }
        
        default {
            Write-Host "Usage: .\deploy.ps1 {deploy|rollback|status|validate|backup}" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Commands:" -ForegroundColor Cyan
            Write-Host "  deploy   - Full production deployment"
            Write-Host "  rollback - Rollback to previous version"
            Write-Host "  status   - Show current status"
            Write-Host "  validate - Validate current deployment"
            Write-Host "  backup   - Create backup of current state"
            exit 1
        }
    }
}

# =============================================================================
# 🚀 SCRIPT EXECUTION
# =============================================================================

try {
    Main
} catch {
    Write-Error "Deployment failed: $_"
    exit 1
}
