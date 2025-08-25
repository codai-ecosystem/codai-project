#!/usr/bin/env pwsh
# ==============================================================================
# RomAI AGI Production Deployment Script
# Todo #15: Production Deployment Optimization - Complete Deployment Automation
# ==============================================================================

param(
    [Parameter(HelpMessage="Deployment mode: docker-compose or kubernetes")]
    [ValidateSet("docker-compose", "kubernetes", "k8s")]
    [string]$Mode = "docker-compose",
    
    [Parameter(HelpMessage="Environment: production, staging, development")]
    [ValidateSet("production", "staging", "development")]
    [string]$Environment = "production",
    
    [Parameter(HelpMessage="Action: deploy, status, logs, stop")]
    [ValidateSet("deploy", "status", "logs", "stop", "restart", "scale")]
    [string]$Action = "deploy",
    
    [Parameter(HelpMessage="Scale factor for replicas (kubernetes only)")]
    [int]$Scale = 2,
    
    [switch]$Force,
    [switch]$Verbose
)

# ==============================================================================
# CONFIGURATION & GLOBALS
# ==============================================================================

$ErrorActionPreference = "Stop"
$VerbosePreference = if ($Verbose) { "Continue" } else { "SilentlyContinue" }

# Colors for output
$Green = [System.ConsoleColor]::Green
$Red = [System.ConsoleColor]::Red
$Yellow = [System.ConsoleColor]::Yellow
$Cyan = [System.ConsoleColor]::Cyan

function Write-ColorOutput {
    param($Message, $Color = [System.ConsoleColor]::White)
    Write-Host $Message -ForegroundColor $Color
}

function Write-Section {
    param($Title)
    Write-ColorOutput "`n==============================================================================`n$Title`n==============================================================================" $Cyan
}

function Test-Command {
    param($Command)
    return $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

# ==============================================================================
# PREREQUISITE CHECKS
# ==============================================================================

function Test-Prerequisites {
    Write-Section "🔍 CHECKING PREREQUISITES"
    
    $prerequisites = @()
    
    if ($Mode -eq "docker-compose") {
        if (-not (Test-Command "docker")) {
            $prerequisites += "Docker"
        }
        if (-not (Test-Command "docker-compose")) {
            $prerequisites += "Docker Compose"
        }
    }
    
    if ($Mode -eq "kubernetes" -or $Mode -eq "k8s") {
        if (-not (Test-Command "kubectl")) {
            $prerequisites += "kubectl"
        }
        if (-not (Test-Command "helm")) {
            Write-ColorOutput "⚠️  Helm not found (optional but recommended)" $Yellow
        }
    }
    
    if ($prerequisites.Count -gt 0) {
        Write-ColorOutput "❌ Missing prerequisites: $($prerequisites -join ', ')" $Red
        exit 1
    }
    
    Write-ColorOutput "✅ All prerequisites satisfied" $Green
}

# ==============================================================================
# DOCKER COMPOSE DEPLOYMENT
# ==============================================================================

function Deploy-DockerCompose {
    Write-Section "🐳 DOCKER COMPOSE DEPLOYMENT"
    
    # Create required directories
    $directories = @(
        "data/postgres", "data/redis", "data/cbd", "data/models", "data/agi",
        "logs/agi", "logs/api", "logs/nginx",
        "data/prometheus", "data/grafana", "backups",
        "config/nginx", "config/prometheus", "config/grafana",
        "ssl", "secrets"
    )
    
    Write-ColorOutput "📁 Creating directory structure..." $Yellow
    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Verbose "Created directory: $dir"
        }
    }
    
    # Set permissions (on Unix-like systems)
    if ($IsLinux -or $IsMacOS) {
        chmod 755 data logs backups config
    }
    
    # Generate secrets if they don't exist
    Write-ColorOutput "🔐 Generating production secrets..." $Yellow
    Generate-Secrets
    
    # Create environment file
    Create-EnvironmentFile
    
    # Deploy services
    Write-ColorOutput "🚀 Deploying RomAI AGI services..." $Green
    
    try {
        $composeFile = "docker-compose.production.yml"
        $envFile = ".env.production"
        
        if ($Action -eq "deploy") {
            docker-compose -f $composeFile --env-file $envFile up -d --build
            
            Write-ColorOutput "⏳ Waiting for services to start..." $Yellow
            Start-Sleep 30
            
            # Health checks
            Test-ServiceHealth
        }
        elseif ($Action -eq "status") {
            docker-compose -f $composeFile ps
        }
        elseif ($Action -eq "logs") {
            docker-compose -f $composeFile logs -f --tail=100
        }
        elseif ($Action -eq "stop") {
            docker-compose -f $composeFile down --volumes --remove-orphans
        }
        elseif ($Action -eq "restart") {
            docker-compose -f $composeFile restart
        }
        elseif ($Action -eq "scale") {
            docker-compose -f $composeFile up -d --scale romai-agi=$Scale
        }
        
    }
    catch {
        Write-ColorOutput "❌ Docker Compose deployment failed: $($_.Exception.Message)" $Red
        exit 1
    }
}

# ==============================================================================
# KUBERNETES DEPLOYMENT
# ==============================================================================

function Deploy-Kubernetes {
    Write-Section "☸️  KUBERNETES DEPLOYMENT"
    
    try {
        # Check if namespace exists
        $namespaceExists = kubectl get namespace romai-production --ignore-not-found 2>$null
        
        if ($Action -eq "deploy") {
            Write-ColorOutput "📦 Applying Kubernetes manifests..." $Yellow
            
            # Apply in correct order
            $manifests = @(
                "k8s/namespace.yaml",
                "k8s/configmap.yaml",
                "k8s/storage-rbac.yaml",
                "k8s/frontend-database-deployment.yaml",
                "k8s/agi-deployment.yaml",
                "k8s/ingress.yaml"
            )
            
            foreach ($manifest in $manifests) {
                if (Test-Path $manifest) {
                    Write-ColorOutput "Applying: $manifest" $Yellow
                    kubectl apply -f $manifest
                } else {
                    Write-ColorOutput "⚠️  Manifest not found: $manifest" $Yellow
                }
            }
            
            Write-ColorOutput "⏳ Waiting for deployments to be ready..." $Yellow
            kubectl wait --for=condition=available --timeout=600s deployment --all -n romai-production
            
            # Get service status
            kubectl get all -n romai-production
        }
        elseif ($Action -eq "status") {
            kubectl get all -n romai-production
            kubectl get pvc -n romai-production
            kubectl get ingress -n romai-production
        }
        elseif ($Action -eq "logs") {
            kubectl logs -f -l app=romai-agi -n romai-production --tail=100
        }
        elseif ($Action -eq "stop") {
            if ($Force) {
                kubectl delete namespace romai-production
            } else {
                Write-ColorOutput "Use -Force to delete the entire namespace" $Yellow
                kubectl delete deployments --all -n romai-production
            }
        }
        elseif ($Action -eq "scale") {
            kubectl scale deployment romai-agi-server --replicas=$Scale -n romai-production
        }
        
    }
    catch {
        Write-ColorOutput "❌ Kubernetes deployment failed: $($_.Exception.Message)" $Red
        exit 1
    }
}

# ==============================================================================
# HELPER FUNCTIONS
# ==============================================================================

function Generate-Secrets {
    $secretsDir = "secrets"
    
    if (-not (Test-Path "$secretsDir/redis-password.txt")) {
        [System.IO.File]::WriteAllText("$secretsDir/redis-password.txt", -join ((1..32) | ForEach-Object { [char]((65..90) + (97..122) | Get-Random) }))
    }
    
    if (-not (Test-Path "$secretsDir/jwt-secret.txt")) {
        [System.IO.File]::WriteAllText("$secretsDir/jwt-secret.txt", -join ((1..64) | ForEach-Object { [char]((65..90) + (97..122) + (48..57) | Get-Random) }))
    }
    
    # Generate self-signed SSL certificate if it doesn't exist
    if (-not (Test-Path "ssl/ssl-cert.pem")) {
        Write-ColorOutput "🔒 Generating self-signed SSL certificate..." $Yellow
        if ($IsWindows) {
            # Use PowerShell on Windows
            $cert = New-SelfSignedCertificate -DnsName "romai.ai", "*.romai.ai" -CertStoreLocation "Cert:\CurrentUser\My"
            Export-Certificate -Cert $cert -FilePath "ssl\ssl-cert.pem" | Out-Null
            Export-PfxCertificate -Cert $cert -FilePath "ssl\ssl-key.pem" -Password (ConvertTo-SecureString -AsPlainText "romai" -Force) | Out-Null
        } else {
            # Use openssl on Linux/macOS
            openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ssl/ssl-key.pem -out ssl/ssl-cert.pem -subj "/C=RO/ST=Bucharest/L=Bucharest/O=RomAI/OU=IT/CN=romai.ai"
        }
    }
}

function Create-EnvironmentFile {
    $envContent = @"
# RomAI AGI Production Environment Configuration
# Generated on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# Database Configuration
POSTGRES_PASSWORD=romai_secure_production_$(Get-Random)
POSTGRES_DATA_PATH=./data/postgres
REDIS_PASSWORD=romai_cache_production_$(Get-Random)
REDIS_DATA_PATH=./data/redis

# API Configuration
API_SECRET_KEY=romai_api_production_secret_$(Get-Random)
JWT_SECRET_KEY=romai_jwt_production_secret_$(Get-Random)
SESSION_SECRET=romai_session_production_secret_$(Get-Random)

# Azure OpenAI Configuration (Update with your values)
AZURE_OPENAI_ENDPOINT=https://swedencentral.api.cognitive.microsoft.com/
AZURE_OPENAI_API_KEY=your-azure-openai-api-key-here
AZURE_OPENAI_DEPLOYMENT_NAME=text-embedding-3-large
AZURE_OPENAI_API_VERSION=2024-02-01

# Storage Paths
AGI_MODELS_PATH=./data/models
AGI_DATA_PATH=./data/agi
CBD_DATA_PATH=./data/cbd
AGI_LOGS_PATH=./logs/agi
API_LOGS_PATH=./logs/api
NGINX_LOGS_PATH=./logs/nginx
PROMETHEUS_DATA_PATH=./data/prometheus
GRAFANA_DATA_PATH=./data/grafana
BACKUP_DATA_PATH=./backups

# Performance Configuration
ENABLE_GPU=false
CUDA_VISIBLE_DEVICES=0
QUANTUM_ENABLED=true
CONSCIOUSNESS_ENGINE=true

# Monitoring Configuration
GRAFANA_PASSWORD=romai_admin_$(Get-Random)

# External URLs (Update for your domain)
NEXT_PUBLIC_API_URL=https://api.romai.ai
NEXT_PUBLIC_AGI_URL=https://agi.romai.ai
NEXT_PUBLIC_CBD_URL=https://cbd.romai.ai
"@

    $envFile = ".env.production"
    if (-not (Test-Path $envFile) -or $Force) {
        [System.IO.File]::WriteAllText($envFile, $envContent)
        Write-ColorOutput "📝 Created environment file: $envFile" $Green
    }
}

function Test-ServiceHealth {
    Write-Section "🏥 HEALTH CHECK"
    
    $services = @(
        @{ Name = "CBD Database"; Url = "http://localhost:4180/health" },
        @{ Name = "RomAI AGI Server"; Url = "http://localhost:6101/health" },
        @{ Name = "RomAI Frontend"; Url = "http://localhost:6100/api/health" },
        @{ Name = "Enterprise API"; Url = "http://localhost:8001/api/v1/health" },
        @{ Name = "Prometheus"; Url = "http://localhost:9090/-/healthy" },
        @{ Name = "Grafana"; Url = "http://localhost:3000/api/health" }
    )
    
    foreach ($service in $services) {
        try {
            $response = Invoke-RestMethod -Uri $service.Url -Method Get -TimeoutSec 10 -ErrorAction Stop
            Write-ColorOutput "✅ $($service.Name): HEALTHY" $Green
        }
        catch {
            Write-ColorOutput "❌ $($service.Name): FAILED - $($_.Exception.Message)" $Red
        }
    }
}

# ==============================================================================
# MAIN EXECUTION
# ==============================================================================

function Main {
    Write-Section "🚀 ROMAI AGI PRODUCTION DEPLOYMENT"
    Write-ColorOutput "Mode: $Mode | Environment: $Environment | Action: $Action" $Yellow
    
    Test-Prerequisites
    
    switch ($Mode) {
        "docker-compose" { Deploy-DockerCompose }
        { $_ -in @("kubernetes", "k8s") } { Deploy-Kubernetes }
    }
    
    if ($Action -eq "deploy") {
        Write-Section "🎉 DEPLOYMENT COMPLETE"
        Write-ColorOutput "RomAI AGI services are now running!" $Green
        Write-ColorOutput "Frontend: http://localhost:6100" $Green
        Write-ColorOutput "AGI API: http://localhost:6101" $Green
        Write-ColorOutput "Enterprise API: http://localhost:8001" $Green
        Write-ColorOutput "Monitoring: http://localhost:3000" $Green
    }
}

# Execute main function
Main