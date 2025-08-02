# CODAI Ecosystem Deployment Script for Windows (PowerShell)
# This script deploys the complete CODAI ecosystem to AWS EKS

param(
    [Parameter(Position=0)]
    [ValidateSet("deploy", "cleanup", "verify", "images", "k8s")]
    [string]$Action = "deploy",
    
    [Parameter(Position=1)]
    [ValidateSet("partial", "full")]
    [string]$CleanupType = "partial",
    
    [string]$AwsRegion = "us-west-2",
    [string]$ClusterName = "codai-ecosystem"
)

# Configuration
$Script:TerraformDir = "infrastructure\aws"
$Script:K8sManifestsDir = "infrastructure\k8s"
$Script:ErrorActionPreference = "Stop"

# Logging functions
function Write-Log {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] WARNING: $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] ERROR: $Message" -ForegroundColor Red
    exit 1
}

function Write-Info {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] INFO: $Message" -ForegroundColor Cyan
}

# Check prerequisites
function Test-Prerequisites {
    Write-Log "Checking prerequisites..."
    
    # Check AWS CLI
    try {
        aws --version | Out-Null
    } catch {
        Write-Error "AWS CLI is not installed. Please install it first."
    }
    
    # Check kubectl
    try {
        kubectl version --client | Out-Null
    } catch {
        Write-Error "kubectl is not installed. Please install it first."
    }
    
    # Check Terraform
    try {
        terraform version | Out-Null
    } catch {
        Write-Error "Terraform is not installed. Please install it first."
    }
    
    # Check Docker
    try {
        docker --version | Out-Null
    } catch {
        Write-Error "Docker is not installed. Please install it first."
    }
    
    # Check Helm
    try {
        helm version | Out-Null
    } catch {
        Write-Error "Helm is not installed. Please install it first."
    }
    
    # Check AWS credentials
    try {
        aws sts get-caller-identity | Out-Null
    } catch {
        Write-Error "AWS credentials not configured or invalid."
    }
    
    Write-Log "All prerequisites satisfied ✓"
}

# Initialize Terraform
function Initialize-Terraform {
    Write-Log "Initializing Terraform..."
    
    Push-Location $TerraformDir
    try {
        terraform init
        terraform validate
        Write-Log "Terraform initialized successfully ✓"
    } finally {
        Pop-Location
    }
}

# Plan Terraform deployment
function New-TerraformPlan {
    Write-Log "Planning Terraform deployment..."
    
    Push-Location $TerraformDir
    try {
        terraform plan -var="aws_region=$AwsRegion" -out=tfplan
        Write-Log "Terraform plan completed ✓"
    } finally {
        Pop-Location
    }
}

# Apply Terraform infrastructure
function Deploy-TerraformInfrastructure {
    Write-Log "Deploying AWS infrastructure with Terraform..."
    
    Push-Location $TerraformDir
    try {
        terraform apply tfplan
        
        # Get outputs
        $Script:ClusterEndpoint = terraform output -raw cluster_endpoint
        $Script:EcrRegistry = terraform output -raw ecr_registry_url
        
        Write-Log "AWS infrastructure deployed successfully ✓"
        Write-Log "EKS Cluster Endpoint: $ClusterEndpoint"
        Write-Log "ECR Registry: $EcrRegistry"
    } finally {
        Pop-Location
    }
}

# Configure kubectl
function Set-KubectlConfig {
    Write-Log "Configuring kubectl for EKS cluster..."
    
    aws eks update-kubeconfig --region $AwsRegion --name $ClusterName
    
    # Test connection
    kubectl cluster-info
    
    Write-Log "kubectl configured successfully ✓"
}

# Install AWS Load Balancer Controller
function Install-AwsLoadBalancerController {
    Write-Log "Installing AWS Load Balancer Controller..."
    
    # Download IAM policy
    Invoke-WebRequest -Uri "https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.4.4/docs/install/iam_policy.json" -OutFile "iam_policy.json"
    
    # Get account ID
    $AccountId = (aws sts get-caller-identity --query Account --output text)
    
    # Create IAM policy if it doesn't exist
    try {
        aws iam create-policy --policy-name AWSLoadBalancerControllerIAMPolicy --policy-document file://iam_policy.json
    } catch {
        Write-Warning "IAM policy may already exist"
    }
    
    # Add EKS Helm repository
    helm repo add eks https://aws.github.io/eks-charts
    helm repo update
    
    # Get VPC ID
    $VpcId = (aws eks describe-cluster --name $ClusterName --query "cluster.resourcesVpcConfig.vpcId" --output text)
    
    # Install AWS Load Balancer Controller
    helm upgrade --install aws-load-balancer-controller eks/aws-load-balancer-controller `
        -n kube-system `
        --set clusterName=$ClusterName `
        --set serviceAccount.create=false `
        --set serviceAccount.name=aws-load-balancer-controller `
        --set region=$AwsRegion `
        --set vpcId=$VpcId
    
    Remove-Item "iam_policy.json" -Force
    
    Write-Log "AWS Load Balancer Controller installed successfully ✓"
}

# Install External DNS
function Install-ExternalDns {
    Write-Log "Installing External DNS..."
    
    # Add Bitnami Helm repository
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm repo update
    
    # Get account ID and OIDC issuer
    $AccountId = (aws sts get-caller-identity --query Account --output text)
    $OidcIssuer = (aws eks describe-cluster --name $ClusterName --query "cluster.identity.oidc.issuer" --output text)
    
    # Install External DNS
    helm upgrade --install external-dns bitnami/external-dns `
        --namespace kube-system `
        --set provider=aws `
        --set aws.region=$AwsRegion `
        --set txtOwnerId=$ClusterName `
        --set domainFilters[0]=codai.ro `
        --set domainFilters[1]=memorai.ro `
        --set domainFilters[2]=controlai.ro `
        --set domainFilters[3]=romai.ro `
        --set policy=sync
    
    Write-Log "External DNS installed successfully ✓"
}

# Install Cluster Autoscaler
function Install-ClusterAutoscaler {
    Write-Log "Installing Cluster Autoscaler..."
    
    # Add autoscaler Helm repository
    helm repo add autoscaler https://kubernetes.github.io/autoscaler
    helm repo update
    
    # Get account ID
    $AccountId = (aws sts get-caller-identity --query Account --output text)
    
    # Install Cluster Autoscaler
    helm upgrade --install cluster-autoscaler autoscaler/cluster-autoscaler `
        --namespace kube-system `
        --set autoDiscovery.clusterName=$ClusterName `
        --set awsRegion=$AwsRegion `
        --set rbac.serviceAccount.annotations."eks\.amazonaws\.com/role-arn"="arn:aws:iam::$AccountId:role/codai-cluster-autoscaler"
    
    Write-Log "Cluster Autoscaler installed successfully ✓"
}

# Build and push Docker images
function Build-AndPushImages {
    Write-Log "Building and pushing Docker images..."
    
    # Get ECR login token
    $LoginCommand = aws ecr get-login-password --region $AwsRegion
    $LoginCommand | docker login --username AWS --password-stdin $EcrRegistry
    
    # Services to build
    $Services = @{
        "apps\id" = "id-service"
        "apps\gateway" = "gateway-service"
        "apps\hub" = "hub-service"
        "apps\admin" = "admin-service"
        "apps\memorai" = "memorai-frontend"
        "packages\memorai" = "memorai-backend"
        "packages\cbd" = "cbd-service"
        "packages\@codai\memorai-mcp" = "memorai-mcp"
        "apps\controlai-dashboard" = "controlai-dashboard"
        "packages\controlai-mcp" = "controlai-mcp"
        "apps\romai" = "romai-frontend"
    }
    
    foreach ($ServicePath in $Services.Keys) {
        $ServiceName = $Services[$ServicePath]
        
        if (Test-Path $ServicePath) {
            Write-Log "Building $ServiceName from $ServicePath..."
            
            # Create Dockerfile if it doesn't exist
            if (-not (Test-Path "$ServicePath\Dockerfile")) {
                New-Dockerfile -ServicePath $ServicePath -ServiceName $ServiceName
            }
            
            # Build and push image
            docker build -t "${ServiceName}:latest" $ServicePath
            docker tag "${ServiceName}:latest" "$EcrRegistry/${ServiceName}:latest"
            docker push "$EcrRegistry/${ServiceName}:latest"
            
            Write-Log "Built and pushed $ServiceName ✓"
        } else {
            Write-Warning "Directory $ServicePath does not exist, skipping $ServiceName"
        }
    }
    
    Write-Log "All Docker images built and pushed successfully ✓"
}

# Create Dockerfile for services that don't have one
function New-Dockerfile {
    param(
        [string]$ServicePath,
        [string]$ServiceName
    )
    
    Write-Log "Creating Dockerfile for $ServiceName..."
    
    # Check if it's a Node.js project
    if (Test-Path "$ServicePath\package.json") {
        $DockerfileContent = @"
# Multi-stage build for $ServiceName
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/build ./build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "dist/server.js"]
"@
        
        Set-Content -Path "$ServicePath\Dockerfile" -Value $DockerfileContent -Encoding UTF8
    } else {
        Write-Warning "Unsupported project type for $ServiceName, skipping Dockerfile creation"
    }
}

# Deploy Kubernetes manifests
function Deploy-K8sManifests {
    Write-Log "Deploying Kubernetes manifests..."
    
    # Update image references in manifests
    Update-ImageReferences
    
    # Apply manifests in order
    kubectl apply -f "$K8sManifestsDir\core-services.yaml"
    kubectl apply -f "$K8sManifestsDir\memorai-services.yaml"
    kubectl apply -f "$K8sManifestsDir\controlai-romai-services.yaml"
    kubectl apply -f "$K8sManifestsDir\ingress.yaml"
    kubectl apply -f "$K8sManifestsDir\monitoring.yaml"
    
    Write-Log "Kubernetes manifests deployed successfully ✓"
}

# Update image references in manifests
function Update-ImageReferences {
    Write-Log "Updating image references in manifests..."
    
    # Replace placeholder ECR URLs with actual registry
    Get-ChildItem -Path $K8sManifestsDir -Filter "*.yaml" | ForEach-Object {
        $Content = Get-Content $_.FullName -Raw
        $UpdatedContent = $Content -replace '\$\{aws_ecr_repository\.([^}]*)\.repository_url\}', "$EcrRegistry/`$1"
        Set-Content -Path $_.FullName -Value $UpdatedContent -Encoding UTF8
    }
    
    Write-Log "Image references updated ✓"
}

# Wait for deployments to be ready
function Wait-ForDeployments {
    Write-Log "Waiting for deployments to be ready..."
    
    # Wait for all deployments to be ready
    kubectl wait --for=condition=available --timeout=600s deployment --all -n codai-core
    kubectl wait --for=condition=available --timeout=600s deployment --all -n codai-services
    kubectl wait --for=condition=available --timeout=600s deployment --all -n codai-apis
    kubectl wait --for=condition=available --timeout=600s deployment --all -n codai-mcps
    kubectl wait --for=condition=available --timeout=600s deployment --all -n monitoring
    
    Write-Log "All deployments are ready ✓"
}

# Verify deployment
function Test-Deployment {
    Write-Log "Verifying deployment..."
    
    # Check pod status
    Write-Info "Pod Status:"
    kubectl get pods --all-namespaces
    
    # Check service status
    Write-Info "Service Status:"
    kubectl get services --all-namespaces
    
    # Check ingress status
    Write-Info "Ingress Status:"
    kubectl get ingress --all-namespaces
    
    # Get load balancer endpoints
    Write-Info "Load Balancer Endpoints:"
    $Endpoints = kubectl get ingress --all-namespaces -o jsonpath='{range .items[*]}{.spec.rules[*].host}{"\n"}{end}' | Sort-Object | Get-Unique
    $Endpoints | ForEach-Object { Write-Host $_ }
    
    Write-Log "Deployment verification completed ✓"
}

# Clean up function
function Remove-Deployment {
    param([string]$Type = "partial")
    
    if ($Type -eq "full") {
        Write-Log "Performing full cleanup..."
        
        # Delete Kubernetes resources
        kubectl delete -f $K8sManifestsDir --ignore-not-found=true
        
        # Destroy Terraform infrastructure
        Push-Location $TerraformDir
        try {
            terraform destroy -var="aws_region=$AwsRegion" -auto-approve
        } finally {
            Pop-Location
        }
        
        Write-Log "Full cleanup completed ✓"
    } else {
        Write-Log "Performing partial cleanup..."
        
        # Delete only Kubernetes resources
        kubectl delete -f $K8sManifestsDir --ignore-not-found=true
        
        Write-Log "Partial cleanup completed ✓"
    }
}

# Main execution
function Invoke-Main {
    switch ($Action) {
        "deploy" {
            Write-Log "Starting CODAI Ecosystem deployment..."
            Test-Prerequisites
            Initialize-Terraform
            New-TerraformPlan
            Deploy-TerraformInfrastructure
            Set-KubectlConfig
            Install-AwsLoadBalancerController
            Install-ExternalDns
            Install-ClusterAutoscaler
            Build-AndPushImages
            Deploy-K8sManifests
            Wait-ForDeployments
            Test-Deployment
            Write-Log "CODAI Ecosystem deployment completed successfully! 🎉"
        }
        "cleanup" {
            Remove-Deployment -Type $CleanupType
        }
        "verify" {
            Test-Deployment
        }
        "images" {
            Build-AndPushImages
        }
        "k8s" {
            Deploy-K8sManifests
            Wait-ForDeployments
            Test-Deployment
        }
    }
}

# Execute main function
Invoke-Main
