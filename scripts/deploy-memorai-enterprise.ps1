# MemorAI Enterprise Production Deployment Script (PowerShell)
# Phase 2: Infrastructure Deployment and Service Provisioning for Windows

param(
    [Parameter()]
    [ValidateSet("Deploy", "Validate", "Cleanup")]
    [string]$Action = "Deploy",
    
    [Parameter()]
    [string]$ConfigFile = ".env.production",
    
    [Parameter()]
    [switch]$SkipInfrastructure,
    
    [Parameter()]
    [switch]$SkipImages,
    
    [Parameter()]
    [switch]$Verbose
)

# Error handling
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

# Configuration
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$InfrastructureDir = Join-Path $ProjectRoot "infrastructure"
$K8sDir = Join-Path $InfrastructureDir "k8s"

# Logging functions
function Write-Log {
    param(
        [string]$Message,
        [ValidateSet("Info", "Success", "Warning", "Error")]
        [string]$Level = "Info"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "Info" { "Cyan" }
        "Success" { "Green" }
        "Warning" { "Yellow" }
        "Error" { "Red" }
    }
    
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

function Test-Prerequisites {
    Write-Log "Checking deployment prerequisites..." -Level Info
    
    # Check required tools
    $requiredTools = @("terraform", "kubectl", "aws", "docker", "helm")
    foreach ($tool in $requiredTools) {
        if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
            Write-Log "$tool is not installed or not in PATH" -Level Error
            throw "Missing required tool: $tool"
        }
    }
    
    # Check AWS credentials
    try {
        aws sts get-caller-identity --output json | Out-Null
    }
    catch {
        Write-Log "AWS credentials not configured or invalid" -Level Error
        throw "AWS credentials validation failed"
    }
    
    # Check required environment variables
    $requiredVars = @("AWS_ACCOUNT_ID", "AWS_REGION", "DOMAIN_NAME", "DB_PASSWORD", "JWT_SECRET")
    foreach ($var in $requiredVars) {
        if (-not (Get-Variable -Name $var -ErrorAction SilentlyContinue)) {
            Write-Log "Required environment variable $var is not set" -Level Error
            throw "Missing required environment variable: $var"
        }
    }
    
    Write-Log "Prerequisites validation passed" -Level Success
}

function Deploy-Infrastructure {
    if ($SkipInfrastructure) {
        Write-Log "Skipping infrastructure deployment" -Level Warning
        return
    }
    
    Write-Log "Deploying AWS infrastructure with Terraform..." -Level Info
    
    Push-Location (Join-Path $InfrastructureDir "aws")
    
    try {
        # Initialize Terraform
        terraform init -upgrade
        
        # Plan deployment
        terraform plan `
            -var="aws_account_id=$env:AWS_ACCOUNT_ID" `
            -var="aws_region=$env:AWS_REGION" `
            -var="domain_name=$env:DOMAIN_NAME" `
            -var="db_password=$env:DB_PASSWORD" `
            -var="jwt_secret=$env:JWT_SECRET" `
            -out=tfplan
        
        # Apply infrastructure
        Write-Log "Applying Terraform configuration..." -Level Info
        terraform apply tfplan
        
        # Extract outputs
        $env:CLUSTER_NAME = terraform output -raw cluster_name
        $env:CLUSTER_ENDPOINT = terraform output -raw cluster_endpoint
        $env:RDS_ENDPOINT = terraform output -raw rds_endpoint
        $env:REDIS_ENDPOINT = terraform output -raw redis_endpoint
        $env:VPC_ID = terraform output -raw vpc_id
        
        Write-Log "Infrastructure deployment completed" -Level Success
    }
    finally {
        Pop-Location
    }
}

function Configure-Kubernetes {
    Write-Log "Configuring Kubernetes cluster access..." -Level Info
    
    # Update kubeconfig
    aws eks update-kubeconfig --region $env:AWS_REGION --name $env:CLUSTER_NAME
    
    # Verify cluster connectivity
    kubectl cluster-info
    
    # Install AWS Load Balancer Controller
    Write-Log "Installing AWS Load Balancer Controller..." -Level Info
    helm repo add eks https://aws.github.io/eks-charts
    helm repo update
    
    helm install aws-load-balancer-controller eks/aws-load-balancer-controller `
        --namespace kube-system `
        --set clusterName="$env:CLUSTER_NAME" `
        --set serviceAccount.create=false `
        --set serviceAccount.name=aws-load-balancer-controller
    
    # Install Cluster Autoscaler
    Write-Log "Installing Cluster Autoscaler..." -Level Info
    helm install cluster-autoscaler eks/cluster-autoscaler `
        --namespace kube-system `
        --set autoDiscovery.clusterName="$env:CLUSTER_NAME" `
        --set awsRegion="$env:AWS_REGION"
    
    Write-Log "Kubernetes cluster configuration completed" -Level Success
}

function Build-Images {
    if ($SkipImages) {
        Write-Log "Skipping Docker image building" -Level Warning
        return
    }
    
    Write-Log "Building and pushing Docker images..." -Level Info
    
    $ecrRegistry = "$env:AWS_ACCOUNT_ID.dkr.ecr.$env:AWS_REGION.amazonaws.com"
    
    # Login to ECR
    aws ecr get-login-password --region $env:AWS_REGION | docker login --username AWS --password-stdin $ecrRegistry
    
    # Build and push CBD Enterprise
    Write-Log "Building CBD Enterprise image..." -Level Info
    Push-Location (Join-Path $ProjectRoot "packages\cbd")
    docker build -t "$ecrRegistry/memorai/cbd-enterprise:latest" -f Dockerfile.enterprise .
    docker push "$ecrRegistry/memorai/cbd-enterprise:latest"
    Pop-Location
    
    # Build and push MemorAI Backend
    Write-Log "Building MemorAI Backend image..." -Level Info
    Push-Location (Join-Path $ProjectRoot "packages\memorai")
    docker build -t "$ecrRegistry/memorai/backend:latest" .
    docker push "$ecrRegistry/memorai/backend:latest"
    Pop-Location
    
    # Build and push MemorAI Frontend
    Write-Log "Building MemorAI Frontend image..." -Level Info
    Push-Location (Join-Path $ProjectRoot "apps\memorai")
    docker build -t "$ecrRegistry/memorai/frontend:latest" .
    docker push "$ecrRegistry/memorai/frontend:latest"
    Pop-Location
    
    # Build and push MemorAI MCP
    Write-Log "Building MemorAI MCP image..." -Level Info
    Push-Location (Join-Path $ProjectRoot "packages\@codai\memorai-mcp")
    docker build -t "$ecrRegistry/memorai/mcp:latest" .
    docker push "$ecrRegistry/memorai/mcp:latest"
    Pop-Location
    
    Write-Log "Docker images built and pushed successfully" -Level Success
}

function Deploy-KubernetesResources {
    Write-Log "Deploying Kubernetes resources..." -Level Info
    
    $ecrRegistry = "$env:AWS_ACCOUNT_ID.dkr.ecr.$env:AWS_REGION.amazonaws.com"
    
    # Set environment variables for substitution
    $env:ECR_REGISTRY = $ecrRegistry
    
    # Deploy namespaces
    kubectl apply -f (Join-Path $K8sDir "namespaces\memorai-namespaces.yaml")
    
    # Deploy ConfigMaps
    kubectl apply -f (Join-Path $K8sDir "configmaps\memorai-configs.yaml")
    
    # Deploy Secrets (with environment variable substitution)
    $secretsTemplate = Get-Content (Join-Path $K8sDir "secrets\memorai-secrets.yaml") -Raw
    $secretsContent = [System.Environment]::ExpandEnvironmentVariables($secretsTemplate)
    $secretsContent | kubectl apply -f -
    
    # Deploy services with environment variable substitution
    $services = @(
        "cbd-enterprise.yaml",
        "memorai-backend.yaml", 
        "memorai-frontend.yaml",
        "memorai-mcp.yaml"
    )
    
    foreach ($service in $services) {
        $serviceTemplate = Get-Content (Join-Path $K8sDir "services\memorai-enterprise\$service") -Raw
        $serviceContent = [System.Environment]::ExpandEnvironmentVariables($serviceTemplate)
        $serviceContent | kubectl apply -f -
    }
    
    # Deploy Ingress
    $ingressTemplate = Get-Content (Join-Path $K8sDir "ingress\memorai-ingress.yaml") -Raw
    $ingressContent = [System.Environment]::ExpandEnvironmentVariables($ingressTemplate)
    $ingressContent | kubectl apply -f -
    
    Write-Log "Kubernetes resources deployed successfully" -Level Success
}

function Test-Deployment {
    Write-Log "Validating deployment health..." -Level Info
    
    # Wait for pods to be ready
    Write-Log "Waiting for CBD Enterprise pods..." -Level Info
    kubectl wait --for=condition=ready pod -l app=cbd-enterprise -n memorai-production --timeout=600s
    
    Write-Log "Waiting for MemorAI Backend pods..." -Level Info
    kubectl wait --for=condition=ready pod -l app=memorai-backend -n memorai-production --timeout=600s
    
    Write-Log "Waiting for MemorAI Frontend pods..." -Level Info
    kubectl wait --for=condition=ready pod -l app=memorai-frontend -n memorai-production --timeout=600s
    
    Write-Log "Waiting for MemorAI MCP pods..." -Level Info
    kubectl wait --for=condition=ready pod -l app=memorai-mcp -n memorai-production --timeout=600s
    
    # Check service endpoints
    Write-Log "Checking service endpoints..." -Level Info
    kubectl get svc -n memorai-production
    
    # Check ingress
    Write-Log "Checking ingress configuration..." -Level Info
    kubectl get ingress -n memorai-production
    
    # Run basic health checks
    Write-Log "Running health checks..." -Level Info
    $frontendUrl = "https://memorai.$env:DOMAIN_NAME"
    $backendUrl = "https://api.memorai.$env:DOMAIN_NAME/health"
    $mcpUrl = "https://mcp.memorai.$env:DOMAIN_NAME/health"
    
    # Wait for DNS propagation and ALB provisioning
    Start-Sleep -Seconds 120
    
    # Test endpoints
    try {
        Invoke-RestMethod -Uri $backendUrl -Method Get -TimeoutSec 30
        Write-Log "Backend health check passed" -Level Success
    }
    catch {
        Write-Log "Backend health check failed - may need more time for ALB provisioning" -Level Warning
    }
    
    Write-Log "Deployment validation completed" -Level Success
}

function Setup-Monitoring {
    Write-Log "Setting up monitoring and observability..." -Level Info
    
    # Install Prometheus
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo update
    
    helm install prometheus prometheus-community/kube-prometheus-stack `
        --namespace memorai-monitoring `
        --create-namespace `
        --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=50Gi `
        --set grafana.persistence.enabled=true `
        --set grafana.persistence.size=10Gi
    
    # Install AWS CloudWatch Container Insights
    kubectl apply -f "https://raw.githubusercontent.com/aws-samples/amazon-cloudwatch-container-insights/latest/k8s-deployment-manifest-templates/deployment-mode/daemonset/container-insights-monitoring/cloudwatch-namespace.yaml"
    
    Write-Log "Monitoring setup completed" -Level Success
}

function Invoke-MainDeployment {
    Write-Log "Starting MemorAI Enterprise Production Deployment" -Level Info
    
    try {
        # Load environment variables from config file
        if (Test-Path $ConfigFile) {
            Get-Content $ConfigFile | ForEach-Object {
                if ($_ -match '^([^#][^=]+)=(.*)$') {
                    [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2])
                }
            }
        }
        
        # Phase 1: Validation
        Test-Prerequisites
        
        # Phase 2: Infrastructure
        Deploy-Infrastructure
        
        # Phase 3: Kubernetes
        Configure-Kubernetes
        
        # Phase 4: Container Images
        Build-Images
        
        # Phase 5: Application Deployment
        Deploy-KubernetesResources
        
        # Phase 6: Validation
        Test-Deployment
        
        # Phase 7: Monitoring
        Setup-Monitoring
        
        Write-Log "MemorAI Enterprise deployment completed successfully!" -Level Success
        Write-Log "Access points:" -Level Info
        Write-Log "  Frontend: https://memorai.$env:DOMAIN_NAME" -Level Info
        Write-Log "  Backend API: https://api.memorai.$env:DOMAIN_NAME" -Level Info
        Write-Log "  MCP Server: https://mcp.memorai.$env:DOMAIN_NAME" -Level Info
        Write-Log "  Monitoring: kubectl port-forward -n memorai-monitoring svc/prometheus-grafana 3000:80" -Level Info
    }
    catch {
        Write-Log "Deployment failed: $($_.Exception.Message)" -Level Error
        Write-Log "To cleanup partial deployment, run with -Action Cleanup" -Level Info
        throw
    }
}

# Main execution
switch ($Action) {
    "Deploy" {
        Invoke-MainDeployment
    }
    "Validate" {
        Test-Deployment
    }
    "Cleanup" {
        Write-Log "Cleanup functionality not implemented in this script" -Level Warning
        Write-Log "Use Terraform destroy and kubectl delete commands manually" -Level Info
    }
    default {
        Write-Log "Invalid action: $Action" -Level Error
        Write-Log "Usage: ./deploy-memorai-enterprise.ps1 [-Action Deploy|Validate|Cleanup]" -Level Info
    }
}
