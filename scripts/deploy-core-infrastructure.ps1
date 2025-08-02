# 🚀 Core Infrastructure Quick Deploy Script

# Enable error handling
$ErrorActionPreference = "Stop"

Write-Host "🏗️ CODAI Core Infrastructure Deployment" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Check if Docker Desktop Kubernetes is enabled
Write-Host "✅ Checking Docker Desktop Kubernetes..." -ForegroundColor Yellow
$k8sContext = kubectl config current-context 2>$null
if ($k8sContext -notlike "*docker-desktop*") {
    Write-Host "❌ Docker Desktop Kubernetes not enabled!" -ForegroundColor Red
    Write-Host "Please enable Kubernetes in Docker Desktop Settings > Kubernetes > Enable Kubernetes" -ForegroundColor Yellow
    Write-Host "Then restart Docker Desktop and run this script again." -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Docker Desktop Kubernetes is active: $k8sContext" -ForegroundColor Green

# Check if kubectl is working
Write-Host "✅ Checking kubectl connectivity..." -ForegroundColor Yellow
try {
    $nodes = kubectl get nodes --no-headers 2>$null
    Write-Host "✅ Kubernetes cluster is ready: $($nodes.Count) node(s)" -ForegroundColor Green
} catch {
    Write-Host "❌ Cannot connect to Kubernetes cluster!" -ForegroundColor Red
    Write-Host "Please ensure Docker Desktop is running and Kubernetes is enabled." -ForegroundColor Yellow
    exit 1
}

# Install NGINX Ingress Controller
Write-Host "📦 Installing NGINX Ingress Controller..." -ForegroundColor Yellow
try {
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
    Write-Host "✅ NGINX Ingress Controller installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️ NGINX Ingress Controller might already be installed" -ForegroundColor Yellow
}

# Install cert-manager for SSL
Write-Host "🔐 Installing cert-manager for SSL..." -ForegroundColor Yellow
try {
    kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.yaml
    Write-Host "✅ cert-manager installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️ cert-manager might already be installed" -ForegroundColor Yellow
}

# Wait for ingress controller to be ready
Write-Host "⏳ Waiting for NGINX Ingress Controller to be ready..." -ForegroundColor Yellow
kubectl wait --namespace ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=300s

# Deploy Core Infrastructure
Write-Host "🏗️ Deploying Core Infrastructure Services..." -ForegroundColor Cyan
kubectl apply -f infrastructure/kubernetes/core-infrastructure.yaml

# Wait for infrastructure to be ready
Write-Host "⏳ Waiting for infrastructure services to be ready..." -ForegroundColor Yellow
kubectl wait --namespace codai-data --for=condition=ready pod --selector=app=postgresql --timeout=300s
kubectl wait --namespace codai-data --for=condition=ready pod --selector=app=redis --timeout=300s
kubectl wait --namespace codai-data --for=condition=ready pod --selector=app=qdrant --timeout=300s

Write-Host "⏳ Waiting for core services to be ready..." -ForegroundColor Yellow
kubectl wait --namespace codai-infrastructure --for=condition=ready pod --selector=app=gateway --timeout=300s
kubectl wait --namespace codai-infrastructure --for=condition=ready pod --selector=app=memorai --timeout=300s
kubectl wait --namespace codai-infrastructure --for=condition=ready pod --selector=app=romai-mcp --timeout=300s
kubectl wait --namespace codai-infrastructure --for=condition=ready pod --selector=app=glass --timeout=300s

# Deploy Ingress configuration
Write-Host "🌐 Configuring ingress and SSL..." -ForegroundColor Yellow
kubectl apply -f infrastructure/kubernetes/core-ingress.yaml

# Get LoadBalancer IP
Write-Host "🔍 Getting LoadBalancer IP..." -ForegroundColor Yellow
$loadBalancerIP = ""
$attempts = 0
while ($loadBalancerIP -eq "" -and $attempts -lt 30) {
    Start-Sleep 10
    $attempts++
    $serviceInfo = kubectl get service gateway -n codai-infrastructure -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>$null
    if ($serviceInfo) {
        $loadBalancerIP = $serviceInfo
    } else {
        # Try to get external IP from ingress controller
        $ingressIP = kubectl get service ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>$null
        if ($ingressIP) {
            $loadBalancerIP = $ingressIP
        }
    }
    Write-Host "⏳ Waiting for LoadBalancer IP... (attempt $attempts/30)" -ForegroundColor Yellow
}

if ($loadBalancerIP -eq "") {
    Write-Host "⚠️ LoadBalancer IP not available yet. Using localhost for testing." -ForegroundColor Yellow
    $loadBalancerIP = "localhost"
}

Write-Host "🎉 Core Infrastructure Deployment Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Service Status:" -ForegroundColor Cyan
Write-Host "• LoadBalancer IP: $loadBalancerIP" -ForegroundColor White
Write-Host "• Gateway API: http://$loadBalancerIP (Port 80)" -ForegroundColor White
Write-Host "• MemorAI: Ready on port 3693/6367" -ForegroundColor White
Write-Host "• RomAI MCP: Ready on port 8000" -ForegroundColor White
Write-Host "• Glass Service: Ready on port 7700" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Domain Configuration Needed:" -ForegroundColor Cyan
Write-Host "Update your DNS records to point these domains to: $loadBalancerIP" -ForegroundColor White
Write-Host "• api.codai.ro -> $loadBalancerIP" -ForegroundColor White
Write-Host "• memorai.ro -> $loadBalancerIP" -ForegroundColor White
Write-Host "• mcp.memorai.ro -> $loadBalancerIP" -ForegroundColor White
Write-Host "• mcp.romai.ro -> $loadBalancerIP" -ForegroundColor White
Write-Host "• glass.codai.ro -> $loadBalancerIP" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Monitoring Commands:" -ForegroundColor Cyan
Write-Host "kubectl get pods -n codai-infrastructure" -ForegroundColor Gray
Write-Host "kubectl get pods -n codai-data" -ForegroundColor Gray
Write-Host "kubectl get services -n codai-infrastructure" -ForegroundColor Gray
Write-Host "kubectl logs -f deployment/gateway -n codai-infrastructure" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Core Infrastructure is ready for Next.js app deployment!" -ForegroundColor Green
