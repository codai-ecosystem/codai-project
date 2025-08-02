# 🚀 Complete CODAI Ecosystem Deployment Script
# This script handles the entire deployment process from AWS setup to service deployment

param(
    [Parameter(Mandatory=$true)]
    [string]$AWSAccountId,
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "eu-west-1",
    
    [Parameter(Mandatory=$false)]
    [string]$ClusterName = "codai-cluster",
    
    [Parameter(Mandatory=$false)]
    [string]$Environment = "production",
    
    [Parameter(Mandatory=$false)]
    [switch]$SetupAWS,
    
    [Parameter(Mandatory=$false)]
    [switch]$BuildImages,
    
    [Parameter(Mandatory=$false)]
    [switch]$DeployToK8s,
    
    [Parameter(Mandatory=$false)]
    [switch]$SetupMonitoring,
    
    [Parameter(Mandatory=$false)]
    [switch]$All
)

# Color coding for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    } else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success { Write-ColorOutput Green @args }
function Write-Warning { Write-ColorOutput Yellow @args }
function Write-Error { Write-ColorOutput Red @args }
function Write-Info { Write-ColorOutput Cyan @args }
function Write-Header { Write-ColorOutput Magenta @args }

Write-Header "🚀 CODAI Ecosystem Complete Deployment"
Write-Header "====================================="
Write-Info "AWS Account ID: $AWSAccountId"
Write-Info "Region: $Region"
Write-Info "Cluster Name: $ClusterName"
Write-Info "Environment: $Environment"
Write-Info ""

# If All is specified, enable all steps
if ($All) {
    $SetupAWS = $true
    $BuildImages = $true
    $DeployToK8s = $true
    $SetupMonitoring = $true
}

# Step 1: AWS Infrastructure Setup
if ($SetupAWS) {
    Write-Header "📋 Step 1: AWS Infrastructure Setup"
    Write-Info "Setting up AWS infrastructure..."
    
    # Run AWS setup automation
    & ".\scripts\aws-setup-automation.ps1" -AWSAccountId $AWSAccountId -Region $Region -CreateDomains -CreateCluster
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "✅ AWS infrastructure setup completed"
    } else {
        Write-Error "❌ AWS infrastructure setup failed"
        exit 1
    }
}

# Step 2: Build and Push Docker Images
if ($BuildImages) {
    Write-Header "🐋 Step 2: Building and Pushing Docker Images"
    Write-Info "Building and pushing all service images to ECR..."
    
    # Run Docker build and push
    & ".\scripts\build-and-push-docker.ps1" -AWSAccountId $AWSAccountId -Region $Region -Tag $Environment
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "✅ Docker images built and pushed successfully"
    } else {
        Write-Error "❌ Docker build and push failed"
        exit 1
    }
}

# Step 3: Deploy to Kubernetes
if ($DeployToK8s) {
    Write-Header "☸️ Step 3: Deploying to Kubernetes"
    Write-Info "Deploying services to EKS cluster..."
    
    # Configure kubectl
    Write-Info "Configuring kubectl..."
    aws eks update-kubeconfig --name $ClusterName --region $Region
    
    # Install NGINX Ingress Controller
    Write-Info "Installing NGINX Ingress Controller..."
    helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
    helm repo update
    helm install ingress-nginx ingress-nginx/ingress-nginx --namespace ingress-nginx --create-namespace
    
    # Install cert-manager for SSL certificates
    Write-Info "Installing cert-manager..."
    kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
    
    # Wait for cert-manager to be ready
    Write-Info "Waiting for cert-manager to be ready..."
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=cert-manager -n cert-manager --timeout=300s
    
    # Deploy base infrastructure (database, redis, etc.)
    Write-Info "Deploying base infrastructure..."
    kubectl apply -f infrastructure/kubernetes/base-infrastructure.yaml
    
    # Deploy all services
    Write-Info "Deploying CODAI services..."
    kubectl apply -f infrastructure/kubernetes/
    
    # Deploy ingress configuration
    Write-Info "Deploying ingress configuration..."
    kubectl apply -f infrastructure/kubernetes/ingress.yaml
    
    Write-Success "✅ Kubernetes deployment completed"
}

# Step 4: Setup Monitoring
if ($SetupMonitoring) {
    Write-Header "📊 Step 4: Setting up Monitoring and Logging"
    Write-Info "Installing monitoring stack..."
    
    # Install Prometheus and Grafana
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo update
    helm install monitoring prometheus-community/kube-prometheus-stack --namespace monitoring --create-namespace
    
    # Install ELK stack for logging
    helm repo add elastic https://helm.elastic.co
    helm install elasticsearch elastic/elasticsearch --namespace logging --create-namespace
    helm install kibana elastic/kibana --namespace logging
    helm install filebeat elastic/filebeat --namespace logging
    
    Write-Success "✅ Monitoring and logging setup completed"
}

# Final verification
Write-Header "🔍 Final Verification"
Write-Info "Checking deployment status..."

# Check if kubectl is configured
try {
    $clusterInfo = kubectl cluster-info
    Write-Success "✅ kubectl is configured and cluster is accessible"
} catch {
    Write-Error "❌ kubectl configuration failed"
}

# Check pod status
Write-Info "Checking pod status..."
kubectl get pods -n codai-ecosystem

# Check service status
Write-Info "Checking service status..."
kubectl get services -n codai-ecosystem

# Check ingress status
Write-Info "Checking ingress status..."
kubectl get ingress -n codai-ecosystem

# Get load balancer IP/hostname
Write-Info "Getting load balancer information..."
$ingressInfo = kubectl get ingress codai-ecosystem-ingress -n codai-ecosystem -o jsonpath='{.status.loadBalancer.ingress[0]}'
if ($ingressInfo) {
    Write-Success "✅ Load balancer configured: $ingressInfo"
} else {
    Write-Warning "⚠️ Load balancer not yet ready. Please check again in a few minutes."
}

Write-Header "🎉 Deployment Summary"
Write-Success "CODAI Ecosystem deployment completed!"
Write-Info ""
Write-Info "📋 Next Steps:"
Write-Info "   1. Update your domain registrar to point to the load balancer"
Write-Info "   2. Wait for SSL certificates to be issued (5-10 minutes)"
Write-Info "   3. Test all domain endpoints"
Write-Info "   4. Configure monitoring dashboards"
Write-Info "   5. Set up backup and disaster recovery"
Write-Info ""
Write-Info "🌐 Your domains will be available at:"
Write-Info "   - https://id.codai.ro"
Write-Info "   - https://auth.codai.ro"
Write-Info "   - https://memorai.ro"
Write-Info "   - https://mcp.memorai.ro"
Write-Info "   - https://cbd.memorai.ro"
Write-Info "   - https://api.codai.ro"
Write-Info "   - https://hub.codai.ro"
Write-Info "   - https://controlai.ro"
Write-Info "   - https://mcp.controlai.ro"
Write-Info "   - https://admin.codai.ro"
Write-Info "   - https://romai.ro"
Write-Info "   - https://mcp.romai.ro"
Write-Info ""
Write-Info "📊 Monitoring:"
Write-Info "   - Grafana: kubectl port-forward -n monitoring svc/monitoring-grafana 3000:80"
Write-Info "   - Kibana: kubectl port-forward -n logging svc/kibana-kibana 5601:5601"
Write-Info ""
Write-Warning "🔐 Important: Update your DNS records and ensure SSL certificates are valid before going live!"

# Save deployment information
$deploymentInfo = @{
    Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    AWSAccountId = $AWSAccountId
    Region = $Region
    ClusterName = $ClusterName
    Environment = $Environment
    Status = "Completed"
    LoadBalancer = $ingressInfo
}

$deploymentInfo | ConvertTo-Json | Out-File "deployment-info.json" -Encoding UTF8
Write-Info "📄 Deployment information saved to deployment-info.json"
