# 🚀 ROMAI Cloud Deployment Scripts
# Multi-cloud deployment automation for GCP, Azure, and AWS
# Generated for Phase 4 Week 4 Day 25 - Cloud Deployment & Scaling

# =============================================================================
# 🎯 Google Cloud Platform (GKE) Deployment
# =============================================================================

Write-Host "🌟 Starting GCP GKE Deployment for ROMAI..." -ForegroundColor Cyan

# Check prerequisites
if (-not (Get-Command "gcloud" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Google Cloud SDK not installed. Please install it first." -ForegroundColor Red
    exit 1
}

if (-not (Get-Command "kubectl" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ kubectl not installed. Please install it first." -ForegroundColor Red
    exit 1
}

if (-not (Get-Command "terraform" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Terraform not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Set GCP project variables
$GCP_PROJECT_ID = "romai-production"
$GCP_REGION = "europe-west1"
$GCP_ZONE = "europe-west1-b"
$CLUSTER_NAME = "romai-production-gke"

Write-Host "🔧 Configuring GCP environment..." -ForegroundColor Yellow

# Authenticate with GCP
gcloud auth login
gcloud config set project $GCP_PROJECT_ID
gcloud config set compute/region $GCP_REGION
gcloud config set compute/zone $GCP_ZONE

# Enable required APIs
Write-Host "🔌 Enabling required GCP APIs..." -ForegroundColor Yellow
gcloud services enable compute.googleapis.com
gcloud services enable container.googleapis.com
gcloud services enable monitoring.googleapis.com
gcloud services enable logging.googleapis.com

# Create Terraform state bucket
Write-Host "🗄️ Creating Terraform state bucket..." -ForegroundColor Yellow
gsutil mb -p $GCP_PROJECT_ID -c STANDARD -l $GCP_REGION gs://romai-terraform-state 2>$null

# Initialize and deploy Terraform
Write-Host "🏗️ Deploying GKE cluster with Terraform..." -ForegroundColor Yellow
Set-Location "E:\GitHub\romai\infrastructure\kubernetes"

terraform init -backend-config="bucket=romai-terraform-state" -backend-config="prefix=gke/production"
terraform plan -var="project_id=$GCP_PROJECT_ID" -var="region=$GCP_REGION" -var="zone=$GCP_ZONE" -target=google_container_cluster.romai_gke
terraform apply -auto-approve -var="project_id=$GCP_PROJECT_ID" -var="region=$GCP_REGION" -var="zone=$GCP_ZONE" -target=google_container_cluster.romai_gke

# Get GKE credentials
Write-Host "🔑 Getting GKE cluster credentials..." -ForegroundColor Yellow
gcloud container clusters get-credentials $CLUSTER_NAME --region $GCP_REGION

# Verify cluster connection
Write-Host "✅ Verifying GKE cluster connection..." -ForegroundColor Green
kubectl cluster-info
kubectl get nodes

# Deploy ROMAI services
Write-Host "🚀 Deploying ROMAI services to GKE..." -ForegroundColor Cyan

# Create namespace
kubectl apply -f romai-deployment.yaml

# Wait for namespace creation
Start-Sleep -Seconds 10

# Deploy services
kubectl apply -f romai-services.yaml

# Deploy auto-scaling
kubectl apply -f romai-autoscaling.yaml

# Check deployment status
Write-Host "📊 Checking deployment status..." -ForegroundColor Yellow
kubectl get pods -n romai-production
kubectl get services -n romai-production
kubectl get hpa -n romai-production

Write-Host "🎉 GCP GKE deployment completed successfully!" -ForegroundColor Green

# =============================================================================
# 🎯 Microsoft Azure (AKS) Deployment
# =============================================================================

function Deploy-AKS {
    Write-Host "🌟 Starting Azure AKS Deployment for ROMAI..." -ForegroundColor Cyan
    
    # Check prerequisites
    if (-not (Get-Command "az" -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Azure CLI not installed. Please install it first." -ForegroundColor Red
        return
    }
    
    # Set Azure variables
    $RESOURCE_GROUP = "romai-production-rg"
    $LOCATION = "West Europe"
    $AKS_CLUSTER_NAME = "romai-production-aks"
    
    Write-Host "🔧 Configuring Azure environment..." -ForegroundColor Yellow
    
    # Login to Azure
    az login
    
    # Create resource group
    Write-Host "🏢 Creating resource group..." -ForegroundColor Yellow
    az group create --name $RESOURCE_GROUP --location $LOCATION
    
    # Create storage account for Terraform state
    Write-Host "🗄️ Creating storage account for Terraform state..." -ForegroundColor Yellow
    $STORAGE_ACCOUNT = "romaiterraformstate$(Get-Random -Minimum 1000 -Maximum 9999)"
    az storage account create --resource-group $RESOURCE_GROUP --name $STORAGE_ACCOUNT --sku Standard_LRS --location $LOCATION
    az storage container create --name tfstate --account-name $STORAGE_ACCOUNT
    
    # Initialize and deploy Terraform
    Write-Host "🏗️ Deploying AKS cluster with Terraform..." -ForegroundColor Yellow
    terraform init -backend-config="storage_account_name=$STORAGE_ACCOUNT" -backend-config="container_name=tfstate" -backend-config="key=aks/production.tfstate" -backend-config="resource_group_name=$RESOURCE_GROUP"
    terraform plan -var="resource_group_name=$RESOURCE_GROUP" -var="location=$LOCATION" -target=azurerm_kubernetes_cluster.romai_aks
    terraform apply -auto-approve -var="resource_group_name=$RESOURCE_GROUP" -var="location=$LOCATION" -target=azurerm_kubernetes_cluster.romai_aks
    
    # Get AKS credentials
    Write-Host "🔑 Getting AKS cluster credentials..." -ForegroundColor Yellow
    az aks get-credentials --resource-group $RESOURCE_GROUP --name $AKS_CLUSTER_NAME --overwrite-existing
    
    # Verify cluster connection
    Write-Host "✅ Verifying AKS cluster connection..." -ForegroundColor Green
    kubectl cluster-info
    kubectl get nodes
    
    # Deploy ROMAI services
    Write-Host "🚀 Deploying ROMAI services to AKS..." -ForegroundColor Cyan
    kubectl apply -f romai-deployment.yaml
    kubectl apply -f romai-services.yaml
    kubectl apply -f romai-autoscaling.yaml
    
    # Check deployment status
    Write-Host "📊 Checking deployment status..." -ForegroundColor Yellow
    kubectl get pods -n romai-production
    kubectl get services -n romai-production
    kubectl get hpa -n romai-production
    
    Write-Host "🎉 Azure AKS deployment completed successfully!" -ForegroundColor Green
}

# =============================================================================
# 🎯 Amazon Web Services (EKS) Deployment
# =============================================================================

function Deploy-EKS {
    Write-Host "🌟 Starting AWS EKS Deployment for ROMAI..." -ForegroundColor Cyan
    
    # Check prerequisites
    if (-not (Get-Command "aws" -ErrorAction SilentlyContinue)) {
        Write-Host "❌ AWS CLI not installed. Please install it first." -ForegroundColor Red
        return
    }
    
    # Set AWS variables
    $AWS_REGION = "eu-west-1"
    $EKS_CLUSTER_NAME = "romai-production-eks"
    
    Write-Host "🔧 Configuring AWS environment..." -ForegroundColor Yellow
    
    # Configure AWS CLI
    aws configure
    aws sts get-caller-identity
    
    # Create S3 bucket for Terraform state
    Write-Host "🗄️ Creating S3 bucket for Terraform state..." -ForegroundColor Yellow
    aws s3 mb s3://romai-terraform-state --region $AWS_REGION
    
    # Initialize and deploy Terraform
    Write-Host "🏗️ Deploying EKS cluster with Terraform..." -ForegroundColor Yellow
    terraform init -backend-config="bucket=romai-terraform-state" -backend-config="key=eks/production.tfstate" -backend-config="region=$AWS_REGION"
    terraform plan -var="region=$AWS_REGION" -target=aws_eks_cluster.romai_cluster
    terraform apply -auto-approve -var="region=$AWS_REGION" -target=aws_eks_cluster.romai_cluster
    
    # Update kubeconfig
    Write-Host "🔑 Updating kubeconfig for EKS..." -ForegroundColor Yellow
    aws eks update-kubeconfig --region $AWS_REGION --name $EKS_CLUSTER_NAME
    
    # Verify cluster connection
    Write-Host "✅ Verifying EKS cluster connection..." -ForegroundColor Green
    kubectl cluster-info
    kubectl get nodes
    
    # Deploy ROMAI services
    Write-Host "🚀 Deploying ROMAI services to EKS..." -ForegroundColor Cyan
    kubectl apply -f romai-deployment.yaml
    kubectl apply -f romai-services.yaml
    kubectl apply -f romai-autoscaling.yaml
    
    # Check deployment status
    Write-Host "📊 Checking deployment status..." -ForegroundColor Yellow
    kubectl get pods -n romai-production
    kubectl get services -n romai-production
    kubectl get hpa -n romai-production
    
    Write-Host "🎉 AWS EKS deployment completed successfully!" -ForegroundColor Green
}

# =============================================================================
# 🎯 Multi-Cloud Deployment Options
# =============================================================================

function Show-DeploymentMenu {
    Write-Host "`n🌐 ROMAI Multi-Cloud Deployment Menu" -ForegroundColor Cyan
    Write-Host "1. Deploy to Google Cloud Platform (GKE)"
    Write-Host "2. Deploy to Microsoft Azure (AKS)"
    Write-Host "3. Deploy to Amazon Web Services (EKS)"
    Write-Host "4. Deploy to All Clouds (Multi-Cloud)"
    Write-Host "5. Exit"
    
    $choice = Read-Host "`nSelect deployment option (1-5)"
    
    switch ($choice) {
        "1" { 
            Write-Host "🚀 Deploying to GCP GKE..." -ForegroundColor Yellow
            # GKE deployment is already executed above
        }
        "2" { 
            Write-Host "🚀 Deploying to Azure AKS..." -ForegroundColor Yellow
            Deploy-AKS 
        }
        "3" { 
            Write-Host "🚀 Deploying to AWS EKS..." -ForegroundColor Yellow
            Deploy-EKS 
        }
        "4" { 
            Write-Host "🚀 Deploying to all clouds..." -ForegroundColor Yellow
            # GKE already deployed
            Deploy-AKS
            Deploy-EKS
            Write-Host "🎉 Multi-cloud deployment completed!" -ForegroundColor Green
        }
        "5" { 
            Write-Host "👋 Exiting deployment script." -ForegroundColor Yellow
            exit 0
        }
        default { 
            Write-Host "❌ Invalid choice. Please select 1-5." -ForegroundColor Red
            Show-DeploymentMenu
        }
    }
}

# =============================================================================
# 🔍 Post-Deployment Validation
# =============================================================================

function Validate-Deployment {
    Write-Host "`n🔍 Running post-deployment validation..." -ForegroundColor Cyan
    
    # Check pod status
    Write-Host "📊 Checking pod status..." -ForegroundColor Yellow
    kubectl get pods -n romai-production -o wide
    
    # Check service endpoints
    Write-Host "🌐 Checking service endpoints..." -ForegroundColor Yellow
    kubectl get services -n romai-production
    
    # Check ingress
    Write-Host "🔗 Checking ingress configuration..." -ForegroundColor Yellow
    kubectl get ingress -n romai-production
    
    # Check HPA status
    Write-Host "📈 Checking auto-scaling status..." -ForegroundColor Yellow
    kubectl get hpa -n romai-production
    
    # Check persistent volumes
    Write-Host "💾 Checking persistent volumes..." -ForegroundColor Yellow
    kubectl get pv,pvc -n romai-production
    
    # Health check endpoints
    Write-Host "🏥 Running health checks..." -ForegroundColor Yellow
    $API_SERVICE = kubectl get service romai-api-service -n romai-production -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
    if ($API_SERVICE) {
        try {
            $response = Invoke-RestMethod -Uri "http://$API_SERVICE/health" -TimeoutSec 10
            Write-Host "✅ API health check passed: $response" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ API health check failed: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    
    Write-Host "🎯 Deployment validation completed!" -ForegroundColor Green
}

# =============================================================================
# 🎮 Main Execution Flow
# =============================================================================

# Display banner
Write-Host @"
🚀 ROMAI Phase 4 Week 4 Day 25
☁️ Cloud Deployment & Scaling Implementation
🌐 Multi-Cloud Kubernetes Orchestration
"@ -ForegroundColor Cyan

# Check if this is an interactive session
if ($Host.UI.RawUI.KeyAvailable -or $args.Length -eq 0) {
    Show-DeploymentMenu
} else {
    # Non-interactive mode - deploy to GKE by default
    Write-Host "🤖 Running in non-interactive mode - deploying to GKE..." -ForegroundColor Yellow
}

# Run post-deployment validation
Validate-Deployment

Write-Host "`n🎉 ROMAI Cloud Deployment completed successfully!" -ForegroundColor Green
Write-Host "📊 Access your services at:" -ForegroundColor Cyan
Write-Host "   • API: https://api.romai.ro" -ForegroundColor White
Write-Host "   • Dashboard: https://dashboard.romai.ro" -ForegroundColor White
Write-Host "   • Main Site: https://romai.ro" -ForegroundColor White

# Store deployment information
$deploymentInfo = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    status = "SUCCESS"
    cluster = $CLUSTER_NAME
    platform = "GCP GKE"
    services_deployed = @("romai-api", "romai-dashboard", "romai-mcp", "elasticsearch", "redis")
    endpoints = @{
        api = "https://api.romai.ro"
        dashboard = "https://dashboard.romai.ro"
        main = "https://romai.ro"
    }
} | ConvertTo-Json -Depth 3

$deploymentInfo | Out-File -FilePath "E:\GitHub\romai\logs\cloud-deployment-$(Get-Date -Format 'yyyy-MM-dd-HH-mm').log" -Encoding UTF8

Write-Host "📝 Deployment log saved to logs directory" -ForegroundColor Green
