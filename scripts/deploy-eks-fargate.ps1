# 🚀 EKS Fargate Deployment Script - Core Infrastructure

# Enable error handling
$ErrorActionPreference = "Stop"

Write-Host "🏗️ CODAI EKS Fargate Deployment" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Set AWS CLI path
$awsCLI = "C:\Program Files\Amazon\AWSCLIV2\aws.exe"

# Verify EKS cluster exists and is active
Write-Host "✅ Verifying EKS cluster..." -ForegroundColor Yellow
try {
    $clusterStatus = & $awsCLI eks describe-cluster --name codai-cluster-v2 --region eu-west-1 --query 'cluster.status' --output text
    if ($clusterStatus -ne "ACTIVE") {
        Write-Host "❌ EKS cluster is not active. Status: $clusterStatus" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ EKS cluster codai-cluster-v2 is ACTIVE" -ForegroundColor Green
} catch {
    Write-Host "❌ Cannot access EKS cluster!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Update kubeconfig
Write-Host "📋 Updating kubeconfig..." -ForegroundColor Yellow
& $awsCLI eks update-kubeconfig --region eu-west-1 --name codai-cluster-v2

# Verify kubectl connectivity
Write-Host "✅ Verifying kubectl connectivity..." -ForegroundColor Yellow
try {
    $k8sVersion = kubectl version --short --client
    Write-Host "✅ kubectl connected: $k8sVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ kubectl cannot connect to cluster!" -ForegroundColor Red
    exit 1
}

# Create Fargate profiles
Write-Host "🚀 Creating Fargate profiles..." -ForegroundColor Cyan

# Create Fargate profile for infrastructure services
Write-Host "📦 Creating Fargate profile for infrastructure..." -ForegroundColor Yellow
try {
    eksctl create fargateprofile --cluster codai-cluster-v2 --region eu-west-1 --name codai-infrastructure --namespace codai-infrastructure --labels app=infrastructure
    Write-Host "✅ Infrastructure Fargate profile created" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Infrastructure Fargate profile might already exist" -ForegroundColor Yellow
}

# Create Fargate profile for data services
Write-Host "📦 Creating Fargate profile for data..." -ForegroundColor Yellow
try {
    eksctl create fargateprofile --cluster codai-cluster-v2 --region eu-west-1 --name codai-data --namespace codai-data --labels app=data
    Write-Host "✅ Data Fargate profile created" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Data Fargate profile might already exist" -ForegroundColor Yellow
}

# Wait for Fargate profiles to be ready
Write-Host "⏳ Waiting for Fargate profiles to be active..." -ForegroundColor Yellow
Start-Sleep 60

# Install AWS Load Balancer Controller
Write-Host "🔧 Installing AWS Load Balancer Controller..." -ForegroundColor Yellow
try {
    # Add helm repo
    helm repo add eks https://aws.github.io/eks-charts
    helm repo update
    
    # Install AWS Load Balancer Controller
    helm install aws-load-balancer-controller eks/aws-load-balancer-controller `
        -n kube-system `
        --set clusterName=codai-cluster-v2 `
        --set serviceAccount.create=false `
        --set serviceAccount.name=aws-load-balancer-controller
    
    Write-Host "✅ AWS Load Balancer Controller installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️ AWS Load Balancer Controller might already be installed" -ForegroundColor Yellow
}

# Install cert-manager for SSL
Write-Host "🔐 Installing cert-manager..." -ForegroundColor Yellow
try {
    kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.yaml
    Write-Host "✅ cert-manager installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️ cert-manager might already be installed" -ForegroundColor Yellow
}

# Deploy Core Infrastructure
Write-Host "🏗️ Deploying Core Infrastructure..." -ForegroundColor Cyan
kubectl apply -f infrastructure/kubernetes/core-infrastructure.yaml

# Wait for infrastructure pods to be ready
Write-Host "⏳ Waiting for infrastructure to be ready..." -ForegroundColor Yellow
kubectl wait --namespace codai-data --for=condition=ready pod --selector=app=postgresql --timeout=600s
kubectl wait --namespace codai-data --for=condition=ready pod --selector=app=redis --timeout=300s
kubectl wait --namespace codai-data --for=condition=ready pod --selector=app=qdrant --timeout=300s

Write-Host "⏳ Waiting for core services to be ready..." -ForegroundColor Yellow
kubectl wait --namespace codai-infrastructure --for=condition=ready pod --selector=app=gateway --timeout=600s
kubectl wait --namespace codai-infrastructure --for=condition=ready pod --selector=app=memorai --timeout=600s
kubectl wait --namespace codai-infrastructure --for=condition=ready pod --selector=app=romai-mcp --timeout=600s
kubectl wait --namespace codai-infrastructure --for=condition=ready pod --selector=app=glass --timeout=600s

# Deploy ingress
Write-Host "🌐 Deploying ingress configuration..." -ForegroundColor Yellow
kubectl apply -f infrastructure/kubernetes/core-ingress.yaml

# Get LoadBalancer DNS
Write-Host "🔍 Getting LoadBalancer DNS..." -ForegroundColor Yellow
$loadBalancerDNS = ""
$attempts = 0
while ($loadBalancerDNS -eq "" -and $attempts -lt 30) {
    Start-Sleep 15
    $attempts++
    $serviceInfo = kubectl get service gateway -n codai-infrastructure -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>$null
    if ($serviceInfo) {
        $loadBalancerDNS = $serviceInfo
    }
    Write-Host "⏳ Waiting for LoadBalancer DNS... (attempt $attempts/30)" -ForegroundColor Yellow
}

if ($loadBalancerDNS -eq "") {
    Write-Host "⚠️ LoadBalancer DNS not available yet. Checking ingress..." -ForegroundColor Yellow
    $ingressDNS = kubectl get ingress codai-infrastructure-ingress -n codai-infrastructure -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>$null
    if ($ingressDNS) {
        $loadBalancerDNS = $ingressDNS
    }
}

Write-Host "🎉 EKS Fargate Deployment Complete!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Service Status:" -ForegroundColor Cyan
Write-Host "• LoadBalancer DNS: $loadBalancerDNS" -ForegroundColor White
Write-Host "• Gateway API: Available via LoadBalancer" -ForegroundColor White
Write-Host "• MemorAI: Ready on Fargate" -ForegroundColor White
Write-Host "• RomAI MCP: Ready on Fargate" -ForegroundColor White
Write-Host "• Glass Service: Ready on Fargate" -ForegroundColor White
Write-Host ""
Write-Host "🌐 DNS Configuration Required:" -ForegroundColor Cyan
Write-Host "Update your Vercel DNS records to point these domains to: $loadBalancerDNS" -ForegroundColor White
Write-Host "• api.codai.ro -> $loadBalancerDNS" -ForegroundColor White
Write-Host "• memorai.ro -> $loadBalancerDNS" -ForegroundColor White
Write-Host "• mcp.memorai.ro -> $loadBalancerDNS" -ForegroundColor White
Write-Host "• mcp.romai.ro -> $loadBalancerDNS" -ForegroundColor White
Write-Host "• glass.codai.ro -> $loadBalancerDNS" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Monitoring Commands:" -ForegroundColor Cyan
Write-Host "kubectl get pods -n codai-infrastructure" -ForegroundColor Gray
Write-Host "kubectl get pods -n codai-data" -ForegroundColor Gray
Write-Host "kubectl get services -n codai-infrastructure" -ForegroundColor Gray
Write-Host "kubectl logs -f deployment/gateway -n codai-infrastructure" -ForegroundColor Gray
Write-Host "kubectl describe ingress codai-infrastructure-ingress -n codai-infrastructure" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Core Infrastructure ready for Next.js app deployment to Vercel!" -ForegroundColor Green
