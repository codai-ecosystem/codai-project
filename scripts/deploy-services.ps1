# Service Deployment Script for CODAI Ecosystem
# This script deploys all services once the EKS cluster is ready

param(
    [Parameter(Mandatory=$false)]
    [string]$ClusterName = "codai-cluster",
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "eu-west-1",
    
    [Parameter(Mandatory=$false)]
    [string]$SkipBuild = $false
)

Write-Host "🚀 CODAI Ecosystem Service Deployment" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Fix PATH to include AWS CLI
$env:PATH = "C:\Program Files\Amazon\AWSCLIV2;" + $env:PATH
Write-Host "✅ AWS CLI added to PATH" -ForegroundColor Green

# Check if cluster is ready
Write-Host "🔍 Checking EKS cluster status..." -ForegroundColor Yellow
$clusterStatus = & "C:\Program Files\Amazon\AWSCLIV2\aws.exe" eks describe-cluster --name $ClusterName --region $Region --query 'cluster.status' --output text

if ($clusterStatus -ne "ACTIVE") {
    Write-Host "❌ Cluster is not ready. Status: $clusterStatus" -ForegroundColor Red
    Write-Host "Please wait for cluster to be ACTIVE before running this script." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Cluster is ACTIVE. Proceeding with deployment..." -ForegroundColor Green

# Update kubeconfig
Write-Host "🔧 Updating kubeconfig..." -ForegroundColor Yellow
& "C:\Program Files\Amazon\AWSCLIV2\aws.exe" eks update-kubeconfig --region $Region --name $ClusterName

# Verify cluster connectivity
Write-Host "🔍 Verifying cluster connectivity..." -ForegroundColor Yellow
$nodeCount = kubectl get nodes --no-headers | Measure-Object | Select-Object -ExpandProperty Count
Write-Host "✅ Connected to cluster with $nodeCount nodes" -ForegroundColor Green

# Create namespaces
Write-Host "📁 Creating namespaces..." -ForegroundColor Yellow
$namespaces = @(
    "codai-system",
    "memorai-system", 
    "controlai-system",
    "romai-system",
    "ingress-nginx",
    "cert-manager",
    "monitoring"
)

foreach ($ns in $namespaces) {
    kubectl create namespace $ns --dry-run=client -o yaml | kubectl apply -f -
    Write-Host "  ✅ Namespace: $ns" -ForegroundColor Green
}

# Install NGINX Ingress Controller
Write-Host "🌐 Installing NGINX Ingress Controller..." -ForegroundColor Yellow
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx `
    --namespace ingress-nginx `
    --set controller.service.type=LoadBalancer `
    --set controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-type"="nlb" `
    --set controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-cross-zone-load-balancing-enabled"="true" `
    --wait

Write-Host "✅ NGINX Ingress Controller installed" -ForegroundColor Green

# Install cert-manager
Write-Host "🔐 Installing cert-manager..." -ForegroundColor Yellow
helm repo add jetstack https://charts.jetstack.io
helm repo update

helm upgrade --install cert-manager jetstack/cert-manager `
    --namespace cert-manager `
    --set installCRDs=true `
    --wait

Write-Host "✅ cert-manager installed" -ForegroundColor Green

# Wait for ingress controller to get external IP
Write-Host "⏳ Waiting for load balancer external IP..." -ForegroundColor Yellow
$maxWaitTime = 300 # 5 minutes
$waitTime = 0
$externalIP = ""

do {
    Start-Sleep 10
    $waitTime += 10
    $externalIP = kubectl get service ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
    
    if ($externalIP) {
        Write-Host "✅ Load balancer ready: $externalIP" -ForegroundColor Green
        break
    }
    
    Write-Host "  ⏳ Still waiting... ($waitTime/$maxWaitTime seconds)" -ForegroundColor Yellow
    
    if ($waitTime -ge $maxWaitTime) {
        Write-Host "⚠️  Timeout waiting for load balancer. Continuing with deployment..." -ForegroundColor Yellow
        break
    }
} while ($true)

# Apply cluster issuer for Let's Encrypt
Write-Host "📜 Applying cluster issuer..." -ForegroundColor Yellow
$clusterIssuer = @"
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@codai.ro
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
"@

$clusterIssuer | kubectl apply -f -
Write-Host "✅ Cluster issuer applied" -ForegroundColor Green

# Deploy base infrastructure
Write-Host "🏗️  Deploying base infrastructure..." -ForegroundColor Yellow
if (Test-Path "infrastructure/kubernetes/base-infrastructure.yaml") {
    kubectl apply -f infrastructure/kubernetes/base-infrastructure.yaml
    Write-Host "✅ Base infrastructure deployed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Base infrastructure file not found, skipping..." -ForegroundColor Yellow
}

# Build and push Docker images (if not skipped)
if (-not $SkipBuild) {
    Write-Host "🐳 Building and pushing Docker images..." -ForegroundColor Yellow
    & "scripts/build-and-push-docker.ps1"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker build failed. Continuing with existing images..." -ForegroundColor Red
    } else {
        Write-Host "✅ Docker images built and pushed" -ForegroundColor Green
    }
} else {
    Write-Host "⏭️  Skipping Docker build (using existing images)" -ForegroundColor Yellow
}

# Deploy all services
Write-Host "🚀 Deploying CODAI services..." -ForegroundColor Yellow

$services = @(
    @{ name = "gateway"; path = "infrastructure/kubernetes/gateway-deployment.yaml" },
    @{ name = "codai"; path = "infrastructure/kubernetes/codai-deployment.yaml" },
    @{ name = "memorai"; path = "infrastructure/kubernetes/memorai-deployment.yaml" },
    @{ name = "controlai"; path = "infrastructure/kubernetes/controlai-deployment.yaml" },
    @{ name = "romai"; path = "infrastructure/kubernetes/romai-deployment.yaml" },
    @{ name = "admin"; path = "infrastructure/kubernetes/admin-deployment.yaml" },
    @{ name = "hub"; path = "infrastructure/kubernetes/hub-deployment.yaml" },
    @{ name = "id"; path = "infrastructure/kubernetes/id-deployment.yaml" },
    @{ name = "auth"; path = "infrastructure/kubernetes/auth-deployment.yaml" }
)

foreach ($service in $services) {
    if (Test-Path $service.path) {
        Write-Host "  🚀 Deploying $($service.name)..." -ForegroundColor Cyan
        kubectl apply -f $service.path
        Write-Host "  ✅ $($service.name) deployed" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $($service.name) deployment file not found: $($service.path)" -ForegroundColor Yellow
    }
}

# Deploy ingress configuration
Write-Host "🌐 Deploying ingress configuration..." -ForegroundColor Yellow
if (Test-Path "infrastructure/kubernetes/ingress.yaml") {
    kubectl apply -f infrastructure/kubernetes/ingress.yaml
    Write-Host "✅ Ingress configuration deployed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Ingress configuration file not found" -ForegroundColor Yellow
}

# Install monitoring (optional)
Write-Host "📊 Installing monitoring stack..." -ForegroundColor Yellow
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm upgrade --install prometheus prometheus-community/kube-prometheus-stack `
    --namespace monitoring `
    --set grafana.adminPassword="admin123" `
    --set grafana.service.type=ClusterIP `
    --wait

Write-Host "✅ Monitoring stack installed" -ForegroundColor Green

# Get final status
Write-Host "`n🎉 Deployment Summary" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan

# Get external IP again
$finalExternalIP = kubectl get service ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
if ($finalExternalIP) {
    Write-Host "🌐 Load Balancer Address: $finalExternalIP" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Configure Vercel DNS A records to point to: $finalExternalIP" -ForegroundColor White
    Write-Host "2. Wait for DNS propagation (5-15 minutes)" -ForegroundColor White
    Write-Host "3. Verify SSL certificates are issued automatically" -ForegroundColor White
    Write-Host "4. Test all domain endpoints" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 See VERCEL_DNS_CONFIGURATION_GUIDE.md for detailed DNS setup instructions" -ForegroundColor Cyan
}

# Show pod status
Write-Host "`n📊 Pod Status:" -ForegroundColor Yellow
kubectl get pods -A | Where-Object { $_ -match "codai|memorai|controlai|romai|gateway" }

# Show ingress status
Write-Host "`n🌐 Ingress Status:" -ForegroundColor Yellow
kubectl get ingress -A

# Show certificate status
Write-Host "`n🔐 Certificate Status:" -ForegroundColor Yellow
kubectl get certificates -A

Write-Host "`n✅ CODAI Ecosystem deployment completed!" -ForegroundColor Green
Write-Host "🎯 All services should be available at their respective domains once DNS is configured." -ForegroundColor Cyan
