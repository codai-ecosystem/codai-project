# CBD Enterprise Production Deployment Script (PowerShell)
# 
# This script automates the production deployment of CBD Enterprise Engine
# including Docker image building, Kubernetes deployment, and health checks.

param(
    [string]$ImageTag = "latest",
    [string]$Namespace = "cbd-enterprise",
    [string]$KubectlContext = "",
    [switch]$DryRun = $false,
    [switch]$Rollback = $false,
    [switch]$Help = $false
)

# Configuration
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$ImageName = "cbd-enterprise/cbd-engine"

# Colors for output (if supported)
$Red = [ConsoleColor]::Red
$Green = [ConsoleColor]::Green
$Yellow = [ConsoleColor]::Yellow
$Blue = [ConsoleColor]::Blue

# Logging functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Show help
function Show-Help {
    Write-Host @"
Usage: .\deploy-production.ps1 [OPTIONS]

Parameters:
  -ImageTag <string>     Docker image tag (default: latest)
  -Namespace <string>    Kubernetes namespace (default: cbd-enterprise)
  -KubectlContext <string> Kubernetes context to use
  -DryRun               Run in dry-run mode
  -Rollback             Rollback to previous deployment
  -Help                 Show this help message

Examples:
  .\deploy-production.ps1                           # Deploy with latest tag
  .\deploy-production.ps1 -ImageTag "v1.0.0"       # Deploy specific version
  .\deploy-production.ps1 -DryRun                   # Dry run mode
  .\deploy-production.ps1 -Rollback                 # Rollback deployment
"@
}

# Check prerequisites
function Test-Prerequisites {
    Write-Info "Checking prerequisites..."
    
    # Check Docker
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Docker is not installed or not in PATH"
        exit 1
    }
    
    # Check kubectl
    if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
        Write-Error "kubectl is not installed or not in PATH"
        exit 1
    }
    
    # Set kubectl context if specified
    if ($KubectlContext) {
        kubectl config use-context $KubectlContext
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to set kubectl context"
            exit 1
        }
    }
    
    # Test Kubernetes connectivity
    $null = kubectl cluster-info 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Cannot connect to Kubernetes cluster"
        exit 1
    }
    
    Write-Success "Prerequisites check passed"
}

# Build Docker image
function Build-DockerImage {
    Write-Info "Building Docker image: ${ImageName}:${ImageTag}"
    
    Set-Location $ProjectRoot
    
    if ($DryRun) {
        Write-Info "DRY RUN: Would build docker image"
        return
    }
    
    docker build -t "${ImageName}:${ImageTag}" -t "${ImageName}:latest" -f Dockerfile .
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Docker build failed"
        exit 1
    }
    
    Write-Success "Docker image built successfully"
}

# Security scan
function Invoke-SecurityScan {
    Write-Info "Running security scan on Docker image..."
    
    if ($DryRun) {
        Write-Info "DRY RUN: Would run security scan"
        return
    }
    
    # Use trivy if available
    if (Get-Command trivy -ErrorAction SilentlyContinue) {
        trivy image --severity HIGH,CRITICAL "${ImageName}:${ImageTag}"
    } else {
        Write-Warning "trivy not available, skipping security scan"
    }
}

# Push Docker image
function Push-DockerImage {
    Write-Info "Pushing Docker image to registry..."
    
    if ($DryRun) {
        Write-Info "DRY RUN: Would push docker image"
        return
    }
    
    docker push "${ImageName}:${ImageTag}"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to push image with tag $ImageTag"
        exit 1
    }
    
    docker push "${ImageName}:latest"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to push image with latest tag"
        exit 1
    }
    
    Write-Success "Docker image pushed successfully"
}

# Create namespace
function New-KubernetesNamespace {
    Write-Info "Creating namespace: $Namespace"
    
    $existingNs = kubectl get namespace $Namespace 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Info "Namespace $Namespace already exists"
        return
    }
    
    if ($DryRun) {
        Write-Info "DRY RUN: Would create namespace"
        return
    }
    
    kubectl create namespace $Namespace
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to create namespace"
        exit 1
    }
    
    Write-Success "Namespace created successfully"
}

# Deploy to Kubernetes
function Deploy-ToKubernetes {
    Write-Info "Deploying to Kubernetes..."
    
    Set-Location $ProjectRoot
    
    if ($DryRun) {
        Write-Info "DRY RUN: Would apply Kubernetes manifests"
        kubectl apply -f k8s/production-deployment.yaml --dry-run=client
        return
    }
    
    kubectl apply -f k8s/production-deployment.yaml
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to apply Kubernetes manifests"
        exit 1
    }
    
    Write-Success "Kubernetes manifests applied successfully"
}

# Wait for deployment
function Wait-ForDeployment {
    Write-Info "Waiting for deployment to be ready..."
    
    if ($DryRun) {
        Write-Info "DRY RUN: Would wait for deployment"
        return
    }
    
    kubectl wait --for=condition=available --timeout=300s deployment/cbd-engine -n $Namespace
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Deployment failed to become ready"
        exit 1
    }
    
    Write-Success "Deployment is ready"
}

# Health check
function Test-Health {
    Write-Info "Running health checks..."
    
    if ($DryRun) {
        Write-Info "DRY RUN: Would run health checks"
        return
    }
    
    # Port forward for health check
    $portForwardJob = Start-Job -ScriptBlock {
        kubectl port-forward svc/cbd-engine-service -n $using:Namespace 8080:8080
    }
    
    Start-Sleep 5
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8080/health" -TimeoutSec 10
        Write-Success "Health check passed"
    }
    catch {
        Write-Error "Health check failed: $($_.Exception.Message)"
        Stop-Job $portForwardJob -Force
        exit 1
    }
    finally {
        Stop-Job $portForwardJob -Force
        Remove-Job $portForwardJob -Force
    }
}

# Smoke tests
function Invoke-SmokeTests {
    Write-Info "Running smoke tests..."
    
    if ($DryRun) {
        Write-Info "DRY RUN: Would run smoke tests"
        return
    }
    
    # Port forward for tests
    $portForwardJob = Start-Job -ScriptBlock {
        kubectl port-forward svc/cbd-engine-service -n $using:Namespace 8080:8080
    }
    
    Start-Sleep 5
    
    try {
        # Test health endpoint
        $healthResponse = Invoke-RestMethod -Uri "http://localhost:8080/health" -TimeoutSec 10
        if ($healthResponse -match "healthy") {
            Write-Success "Health endpoint test passed"
        } else {
            Write-Error "Health endpoint test failed"
            throw "Health endpoint test failed"
        }
        
        # Test metrics endpoint (port 9090)
        try {
            $null = Invoke-RestMethod -Uri "http://localhost:9090/metrics" -TimeoutSec 10
            Write-Success "Metrics endpoint test passed"
        }
        catch {
            Write-Warning "Metrics endpoint test failed"
        }
    }
    catch {
        Write-Error "Smoke tests failed: $($_.Exception.Message)"
        Stop-Job $portForwardJob -Force
        exit 1
    }
    finally {
        Stop-Job $portForwardJob -Force
        Remove-Job $portForwardJob -Force
    }
    
    Write-Success "Smoke tests completed"
}

# Generate deployment report
function New-DeploymentReport {
    Write-Info "Generating deployment report..."
    
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $reportFile = "deployment-report-$timestamp.md"
    
    $deploymentStatus = "Unknown"
    try {
        $deploymentStatus = kubectl get deployment cbd-engine -n $Namespace -o jsonpath='{.status.conditions[0].type}' 2>$null
    } catch {}
    
    $podStatus = "No pods found"
    try {
        $podStatus = kubectl get pods -n $Namespace -l app=cbd-engine 2>$null | Out-String
    } catch {}
    
    $serviceStatus = "No services found"
    try {
        $serviceStatus = kubectl get svc -n $Namespace 2>$null | Out-String
    } catch {}
    
    $report = @"
# CBD Enterprise Deployment Report

**Deployment Date**: $(Get-Date)
**Image Tag**: $ImageTag
**Namespace**: $Namespace
**Dry Run**: $DryRun

## Deployment Status

- Docker Image: ${ImageName}:${ImageTag}
- Kubernetes Namespace: $Namespace
- Deployment Status: $deploymentStatus

## Pod Status

``````
$podStatus
``````

## Service Status

``````
$serviceStatus
``````

## Deployment Configuration

- Replicas: 3
- CPU Request: 1 core
- CPU Limit: 4 cores
- Memory Request: 2Gi
- Memory Limit: 8Gi
- Storage: 500Gi (data), 100Gi (logs)

"@
    
    $report | Out-File -FilePath $reportFile -Encoding UTF8
    Write-Success "Deployment report generated: $reportFile"
}

# Rollback function
function Invoke-Rollback {
    Write-Warning "Rolling back deployment..."
    
    if ($DryRun) {
        Write-Info "DRY RUN: Would rollback deployment"
        return
    }
    
    kubectl rollout undo deployment/cbd-engine -n $Namespace
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Rollback failed"
        exit 1
    }
    
    kubectl rollout status deployment/cbd-engine -n $Namespace
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to check rollback status"
        exit 1
    }
    
    Write-Success "Rollback completed"
}

# Main function
function Main {
    if ($Help) {
        Show-Help
        return
    }
    
    if ($Rollback) {
        Test-Prerequisites
        Invoke-Rollback
        return
    }
    
    Write-Info "Starting CBD Enterprise production deployment..."
    Write-Info "Image: ${ImageName}:${ImageTag}"
    Write-Info "Namespace: $Namespace"
    Write-Info "Dry Run: $DryRun"
    
    try {
        Test-Prerequisites
        Build-DockerImage
        Invoke-SecurityScan
        
        if (-not $DryRun) {
            Push-DockerImage
        }
        
        New-KubernetesNamespace
        Deploy-ToKubernetes
        
        if (-not $DryRun) {
            Wait-ForDeployment
            Test-Health
            Invoke-SmokeTests
        }
        
        New-DeploymentReport
        Write-Success "CBD Enterprise deployment completed successfully!"
    }
    catch {
        Write-Error "Deployment failed: $($_.Exception.Message)"
        exit 1
    }
}

# Run main function
Main
