#!/usr/bin/env pwsh
# AIDE Production Deployment Script
# Enterprise-grade deployment automation for AIDE ecosystem

param(
    [string]$Environment = "production",
    [string]$Version = "latest",
    [switch]$SkipBuild = $false,
    [switch]$SkipTests = $false,
    [switch]$DryRun = $false,
    [switch]$Rollback = $false,
    [string]$Namespace = "aide-production"
)

# Set error handling
$ErrorActionPreference = "Stop"

# Script configuration
$SCRIPT_DIR = Split-Path -Parent $PSCommandPath
$PROJECT_ROOT = Split-Path -Parent (Split-Path -Parent $SCRIPT_DIR)
$DEPLOYMENT_DIR = "$SCRIPT_DIR\.."
$DOCKER_DIR = "$DEPLOYMENT_DIR\docker"
$K8S_DIR = "$DEPLOYMENT_DIR\kubernetes"

# Logging function
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Write-Host $logMessage
    Add-Content -Path "$SCRIPT_DIR\deploy-$(Get-Date -Format 'yyyy-MM-dd').log" -Value $logMessage
}

# Check prerequisites
function Test-Prerequisites {
    Write-Log "Checking deployment prerequisites..."
    
    # Check Docker
    if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
        throw "Docker is not installed or not in PATH"
    }
    
    # Check kubectl
    if (!(Get-Command kubectl -ErrorAction SilentlyContinue)) {
        throw "kubectl is not installed or not in PATH"
    }
    
    # Check pnpm
    if (!(Get-Command pnpm -ErrorAction SilentlyContinue)) {
        throw "pnpm is not installed or not in PATH"
    }
    
    # Verify Kubernetes connection
    try {
        kubectl cluster-info | Out-Null
        Write-Log "Kubernetes cluster connection verified"
    }
    catch {
        throw "Cannot connect to Kubernetes cluster: $_"
    }
    
    # Check namespace exists
    $namespaceExists = kubectl get namespace $Namespace 2>$null
    if (-not $namespaceExists) {
        Write-Log "Creating namespace: $Namespace"
        if (-not $DryRun) {
            kubectl apply -f "$K8S_DIR\namespace.yaml"
        }
    }
    
    Write-Log "Prerequisites check completed successfully"
}

# Build Docker images
function Build-DockerImages {
    if ($SkipBuild) {
        Write-Log "Skipping Docker image build (--SkipBuild specified)"
        return
    }
    
    Write-Log "Building Docker images for AIDE ecosystem..."
    
    Set-Location $PROJECT_ROOT
    
    # Build AIDE Web
    Write-Log "Building AIDE Web image..."
    if (-not $DryRun) {
        docker build -f "$DOCKER_DIR\Dockerfile.aide-web" -t "aide/web:$Version" -t "aide/web:latest" .
        if ($LASTEXITCODE -ne 0) { throw "Failed to build AIDE Web image" }
    }
    
    # Build AIDE API
    Write-Log "Building AIDE API image..."
    if (-not $DryRun) {
        docker build -f "$DOCKER_DIR\Dockerfile.aide-api" -t "aide/api:$Version" -t "aide/api:latest" .
        if ($LASTEXITCODE -ne 0) { throw "Failed to build AIDE API image" }
    }
    
    # Build AIDE CLI
    Write-Log "Building AIDE CLI image..."
    if (-not $DryRun) {
        docker build -f "$DOCKER_DIR\Dockerfile.aide-cli" -t "aide/cli:$Version" -t "aide/cli:latest" .
        if ($LASTEXITCODE -ne 0) { throw "Failed to build AIDE CLI image" }
    }
    
    Write-Log "Docker images built successfully"
}

# Run tests
function Invoke-Tests {
    if ($SkipTests) {
        Write-Log "Skipping tests (--SkipTests specified)"
        return
    }
    
    Write-Log "Running test suite..."
    
    Set-Location $PROJECT_ROOT
    
    if (-not $DryRun) {
        # Run unit tests
        pnpm test:unit
        if ($LASTEXITCODE -ne 0) { throw "Unit tests failed" }
        
        # Run integration tests
        pnpm test:integration
        if ($LASTEXITCODE -ne 0) { throw "Integration tests failed" }
        
        # Run security tests
        pnpm test:security
        if ($LASTEXITCODE -ne 0) { throw "Security tests failed" }
    }
    
    Write-Log "All tests passed successfully"
}

# Deploy to Kubernetes
function Deploy-ToKubernetes {
    Write-Log "Deploying AIDE ecosystem to Kubernetes..."
    
    # Apply namespace and RBAC
    Write-Log "Applying namespace and RBAC configurations..."
    if (-not $DryRun) {
        kubectl apply -f "$K8S_DIR\namespace.yaml"
        kubectl apply -f "$K8S_DIR\rbac.yaml" 2>$null # Optional RBAC file
    }
    
    # Apply ConfigMaps and Secrets
    Write-Log "Applying ConfigMaps and Secrets..."
    if (-not $DryRun) {
        kubectl apply -f "$K8S_DIR\configmap.yaml"
        
        # Check if secrets need to be created
        $secretExists = kubectl get secret aide-secrets -n $Namespace 2>$null
        if (-not $secretExists) {
            Write-Log "Creating secrets (ensure you've updated the secret values!)"
            kubectl apply -f "$K8S_DIR\configmap.yaml"
        } else {
            Write-Log "Secrets already exist, skipping creation"
        }
    }
    
    # Deploy PostgreSQL (if using in-cluster)
    Write-Log "Deploying PostgreSQL database..."
    if (-not $DryRun) {
        kubectl apply -f "$K8S_DIR\deployments\postgres.yaml" 2>$null # Optional
    }
    
    # Deploy Redis
    Write-Log "Deploying Redis cache..."
    if (-not $DryRun) {
        kubectl apply -f "$K8S_DIR\deployments\redis.yaml" 2>$null # Optional
    }
    
    # Deploy Elasticsearch
    Write-Log "Deploying Elasticsearch..."
    if (-not $DryRun) {
        kubectl apply -f "$K8S_DIR\deployments\elasticsearch.yaml" 2>$null # Optional
    }
    
    # Deploy AIDE API
    Write-Log "Deploying AIDE API backend..."
    if (-not $DryRun) {
        kubectl apply -f "$K8S_DIR\deployments\aide-api.yaml"
    }
    
    # Deploy AIDE Web
    Write-Log "Deploying AIDE Web application..."
    if (-not $DryRun) {
        kubectl apply -f "$K8S_DIR\deployments\aide-web.yaml"
    }
    
    # Deploy Services
    Write-Log "Deploying Kubernetes services..."
    if (-not $DryRun) {
        kubectl apply -f "$K8S_DIR\services\services.yaml"
    }
    
    # Deploy Ingress
    Write-Log "Deploying ingress configuration..."
    if (-not $DryRun) {
        kubectl apply -f "$K8S_DIR\ingress.yaml" 2>$null # Optional
    }
    
    Write-Log "Kubernetes deployment completed"
}

# Wait for deployment readiness
function Wait-ForDeployment {
    Write-Log "Waiting for deployments to be ready..."
    
    $deployments = @("aide-web", "aide-api")
    
    foreach ($deployment in $deployments) {
        Write-Log "Waiting for deployment: $deployment"
        if (-not $DryRun) {
            kubectl rollout status deployment/$deployment -n $Namespace --timeout=600s
            if ($LASTEXITCODE -ne 0) { 
                throw "Deployment $deployment failed to become ready"
            }
        }
    }
    
    Write-Log "All deployments are ready"
}

# Perform health checks
function Test-HealthChecks {
    Write-Log "Performing health checks..."
    
    if ($DryRun) {
        Write-Log "Skipping health checks (dry run mode)"
        return
    }
    
    # Check pod status
    Write-Log "Checking pod status..."
    kubectl get pods -n $Namespace
    
    # Test API endpoint
    Write-Log "Testing API health endpoint..."
    $apiPod = kubectl get pods -n $Namespace -l app=aide-api -o jsonpath="{.items[0].metadata.name}"
    if ($apiPod) {
        kubectl exec -n $Namespace $apiPod -- curl -f http://localhost:8080/health
        if ($LASTEXITCODE -ne 0) { 
            Write-Log "API health check failed" -Level "WARNING"
        } else {
            Write-Log "API health check passed"
        }
    }
    
    # Test Web endpoint
    Write-Log "Testing Web health endpoint..."
    $webPod = kubectl get pods -n $Namespace -l app=aide-web -o jsonpath="{.items[0].metadata.name}"
    if ($webPod) {
        kubectl exec -n $Namespace $webPod -- curl -f http://localhost:3000/api/health
        if ($LASTEXITCODE -ne 0) { 
            Write-Log "Web health check failed" -Level "WARNING"
        } else {
            Write-Log "Web health check passed"
        }
    }
    
    Write-Log "Health checks completed"
}

# Rollback deployment
function Invoke-Rollback {
    Write-Log "Performing deployment rollback..."
    
    $deployments = @("aide-web", "aide-api")
    
    foreach ($deployment in $deployments) {
        Write-Log "Rolling back deployment: $deployment"
        if (-not $DryRun) {
            kubectl rollout undo deployment/$deployment -n $Namespace
        }
    }
    
    Wait-ForDeployment
    Write-Log "Rollback completed successfully"
}

# Main deployment workflow
function Start-Deployment {
    try {
        Write-Log "Starting AIDE production deployment..." -Level "INFO"
        Write-Log "Environment: $Environment" -Level "INFO"
        Write-Log "Version: $Version" -Level "INFO"
        Write-Log "Namespace: $Namespace" -Level "INFO"
        Write-Log "Dry Run: $DryRun" -Level "INFO"
        
        if ($Rollback) {
            Invoke-Rollback
            return
        }
        
        # Pre-deployment checks
        Test-Prerequisites
        
        # Build phase
        Build-DockerImages
        
        # Test phase
        Invoke-Tests
        
        # Deployment phase
        Deploy-ToKubernetes
        
        # Verification phase
        Wait-ForDeployment
        Test-HealthChecks
        
        Write-Log "AIDE production deployment completed successfully!" -Level "INFO"
        
        # Display access information
        Write-Log "=== Access Information ===" -Level "INFO"
        if (-not $DryRun) {
            $externalIP = kubectl get service aide-loadbalancer -n $Namespace -o jsonpath="{.status.loadBalancer.ingress[0].ip}" 2>$null
            if ($externalIP) {
                Write-Log "External IP: $externalIP" -Level "INFO"
                Write-Log "Web Application: http://$externalIP" -Level "INFO"
                Write-Log "API Endpoint: http://$externalIP/api" -Level "INFO"
            } else {
                Write-Log "External IP not yet assigned. Use 'kubectl get svc -n $Namespace' to check." -Level "INFO"
            }
        }
        
    }
    catch {
        Write-Log "Deployment failed: $_" -Level "ERROR"
        throw
    }
}

# Script execution
if ($MyInvocation.InvocationName -ne '.') {
    Start-Deployment
}
