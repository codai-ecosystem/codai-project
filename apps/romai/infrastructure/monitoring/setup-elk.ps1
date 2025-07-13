# ELK Stack Deployment Script for ROMAI Enterprise Logging
# PowerShell script for comprehensive log management deployment

param(
    [switch]$StartDocker = $true,
    [switch]$CreateConfig = $true,
    [switch]$DeployStack = $false,
    [switch]$ValidateDeployment = $true
)

Write-Host "ROMAI Phase 4 Week 3 Day 16 - ELK Stack Enterprise Deployment" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan

# Check if Docker is running
function Test-DockerRunning {
    try {
        $dockerInfo = docker info 2>$null
        return $true
    }
    catch {
        return $false
    }
}

# Wait for Docker Desktop to start
if ($StartDocker) {
    Write-Host "Waiting for Docker Desktop to initialize..." -ForegroundColor Yellow
    
    $timeout = 120
    $elapsed = 0
    while (-not (Test-DockerRunning) -and $elapsed -lt $timeout) {
        Write-Host "Docker status check... ($elapsed/$timeout seconds)" -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        $elapsed += 10
    }
    
    if (Test-DockerRunning) {
        Write-Host "Docker Desktop is ready" -ForegroundColor Green
    } else {
        Write-Host "Docker Desktop not ready within $timeout seconds" -ForegroundColor Red
        Write-Host "Please ensure Docker Desktop is running and try again" -ForegroundColor Yellow
        exit 1
    }
}

# Create ELK configuration files
if ($CreateConfig) {
    Write-Host "Creating ELK stack configuration..." -ForegroundColor Yellow
    
    # Update environment file with ELK settings
    $envFile = "e:\GitHub\romai\infrastructure\monitoring\.env"
    $elkEnvContent = @"

# ELK Stack Configuration
ELASTIC_PASSWORD=elastic_secure_2025_enterprise
KIBANA_PASSWORD=kibana_secure_2025_enterprise
KIBANA_ENCRYPTION_KEY=32_char_encryption_key_romai_2025
LOGSTASH_PASSWORD=logstash_secure_2025_enterprise

# Index Lifecycle Management
ILM_POLICY_HOT_PHASE=7d
ILM_POLICY_WARM_PHASE=30d
ILM_POLICY_COLD_PHASE=90d
ILM_POLICY_DELETE_PHASE=365d

# Performance Configuration
ES_HEAP_SIZE=2g
LOGSTASH_HEAP_SIZE=1g
KIBANA_MEMORY_LIMIT=1g

# Network Configuration
ELASTICSEARCH_PORT=9200
KIBANA_PORT=5601
LOGSTASH_PORT=5044
APM_SERVER_PORT=8200

# Monitoring Configuration
MONITORING_ENABLED=true
SECURITY_ENABLED=true
SSL_ENABLED=false
"@

    Add-Content -Path $envFile -Value $elkEnvContent
    Write-Host "ELK environment configuration added" -ForegroundColor Green
    
    # Create additional configuration directories
    $configDirs = @(
        "e:\GitHub\romai\infrastructure\monitoring\elasticsearch\config",
        "e:\GitHub\romai\infrastructure\monitoring\elasticsearch\logs",
        "e:\GitHub\romai\infrastructure\monitoring\kibana\config",
        "e:\GitHub\romai\infrastructure\monitoring\logstash\config",
        "e:\GitHub\romai\infrastructure\monitoring\metricbeat\config",
        "e:\GitHub\romai\infrastructure\monitoring\apm-server\config",
        "e:\GitHub\romai\infrastructure\monitoring\elastalert2\config",
        "e:\GitHub\romai\infrastructure\monitoring\elastalert2\rules"
    )
    
    foreach ($dir in $configDirs) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Host "  Created: $dir" -ForegroundColor Green
        }
    }
}

# Deploy ELK stack
if ($DeployStack) {
    Write-Host "Deploying ELK stack..." -ForegroundColor Yellow
    
    try {
        # Pull images first
        Write-Host "Pulling Docker images..." -ForegroundColor Yellow
        docker compose -f docker-compose.elk.yml pull
        
        # Start services in order
        Write-Host "Starting Elasticsearch..." -ForegroundColor Yellow
        docker compose -f docker-compose.elk.yml up -d elasticsearch
        Start-Sleep -Seconds 30
        
        Write-Host "Starting Kibana..." -ForegroundColor Yellow
        docker compose -f docker-compose.elk.yml up -d kibana
        Start-Sleep -Seconds 20
        
        Write-Host "Starting Logstash..." -ForegroundColor Yellow
        docker compose -f docker-compose.elk.yml up -d logstash
        Start-Sleep -Seconds 15
        
        Write-Host "Starting Beats components..." -ForegroundColor Yellow
        docker compose -f docker-compose.elk.yml up -d filebeat metricbeat
        Start-Sleep -Seconds 10
        
        Write-Host "Starting APM Server..." -ForegroundColor Yellow
        docker compose -f docker-compose.elk.yml up -d apm-server
        Start-Sleep -Seconds 10
        
        Write-Host "Starting Elastalert2..." -ForegroundColor Yellow
        docker compose -f docker-compose.elk.yml up -d elastalert2
        
        Write-Host "ELK stack deployment complete" -ForegroundColor Green
    }
    catch {
        Write-Host "Error during ELK stack deployment: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Validate deployment
if ($ValidateDeployment) {
    Write-Host "Validating ELK stack deployment..." -ForegroundColor Yellow
    
    # Check if services are running
    $services = @("elasticsearch", "kibana", "logstash", "filebeat", "metricbeat")
    
    foreach ($service in $services) {
        $container = docker ps --filter "name=romai-$service" --format "table {{.Names}}\t{{.Status}}"
        if ($container -like "*Up*") {
            Write-Host "  ${service}: Running" -ForegroundColor Green
        } else {
            Write-Host "  ${service}: Not running" -ForegroundColor Red
        }
    }
    
    # Check Elasticsearch health
    Start-Sleep -Seconds 10
    try {
        $esHealth = curl -s "http://localhost:9200/_cluster/health" 2>$null
        if ($esHealth) {
            Write-Host "  Elasticsearch cluster: Responding" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "  Elasticsearch cluster: Not responding" -ForegroundColor Yellow
    }
    
    # Check Kibana availability
    try {
        $kibanaStatus = curl -s "http://localhost:5601/api/status" 2>$null
        if ($kibanaStatus) {
            Write-Host "  Kibana: Available" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "  Kibana: Not available yet" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Wait 2-3 minutes for all services to fully initialize" -ForegroundColor White
Write-Host "2. Access Kibana at: http://localhost:5601" -ForegroundColor Yellow
Write-Host "3. Login with: elastic / elastic_secure_2025_enterprise" -ForegroundColor Yellow
Write-Host "4. Access Elasticsearch at: http://localhost:9200" -ForegroundColor Yellow
Write-Host "5. To deploy stack: .\setup-elk.ps1 -DeployStack" -ForegroundColor Yellow
Write-Host ""
Write-Host "Phase 4 Week 3 Day 16 Status: ELK Stack Configuration Complete!" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Cyan
