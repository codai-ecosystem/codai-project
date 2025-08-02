# 🚀 CODAI Ecosystem Deployment Automation - Expanded Edition

param(
    [Parameter(Mandatory=$false)]
    [string]$Phase = "1",
    [Parameter(Mandatory=$false)]
    [string]$ClusterName = "codai-cluster-v2",
    [Parameter(Mandatory=$false)]
    [string]$Region = "eu-west-1"
)

Write-Host "🚀 CODAI ECOSYSTEM DEPLOYMENT - EXPANDED EDITION" -ForegroundColor Green
Write-Host "📊 Deployment Phase: $Phase" -ForegroundColor Cyan
Write-Host "🎯 Cluster: $ClusterName" -ForegroundColor Cyan
Write-Host "🌍 Region: $Region" -ForegroundColor Cyan
Write-Host ""

# Check cluster status
Write-Host "🔍 Checking cluster status..." -ForegroundColor Yellow
try {
    $clusterStatus = aws eks describe-cluster --name $ClusterName --region $Region --query 'cluster.status' --output text
    if ($clusterStatus -eq "ACTIVE") {
        Write-Host "✅ Cluster $ClusterName is ACTIVE" -ForegroundColor Green
    } else {
        Write-Host "⏳ Cluster status: $clusterStatus" -ForegroundColor Yellow
        Write-Host "⚠️ Waiting for cluster to become ACTIVE..." -ForegroundColor Yellow
        return
    }
} catch {
    Write-Host "❌ Error checking cluster status: $($_.Exception.Message)" -ForegroundColor Red
    return
}

# Update kubeconfig
Write-Host "🔧 Updating kubeconfig..." -ForegroundColor Yellow
aws eks update-kubeconfig --name $ClusterName --region $Region

# Check nodes
Write-Host "📋 Checking node status..." -ForegroundColor Yellow
kubectl get nodes

# Install NGINX Ingress Controller
Write-Host "🌐 Installing NGINX Ingress Controller..." -ForegroundColor Yellow
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.11.3/deploy/static/provider/aws/deploy.yaml

# Wait for ingress controller
Write-Host "⏳ Waiting for NGINX Ingress Controller..." -ForegroundColor Yellow
kubectl wait --namespace ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=300s

# Install cert-manager
Write-Host "🔐 Installing cert-manager..." -ForegroundColor Yellow
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.16.2/cert-manager.yaml

# Wait for cert-manager
Write-Host "⏳ Waiting for cert-manager..." -ForegroundColor Yellow
kubectl wait --namespace cert-manager --for=condition=ready pod --selector=app.kubernetes.io/name=cert-manager --timeout=300s

# Create cert-manager issuer
Write-Host "📜 Creating Let's Encrypt issuer..." -ForegroundColor Yellow
@"
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
"@ | kubectl apply -f -

# Deploy PostgreSQL
Write-Host "🐘 Deploying PostgreSQL..." -ForegroundColor Yellow
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm install postgresql bitnami/postgresql --set auth.postgresPassword=codai2025secure --set auth.database=codai_ecosystem

# Deploy Redis
Write-Host "🔴 Deploying Redis..." -ForegroundColor Yellow
helm install redis bitnami/redis --set auth.password=codai2025redis

# Apply appropriate ingress configuration based on phase
switch ($Phase) {
    "1" {
        Write-Host "📁 Deploying Phase 1: Core Business AI Services..." -ForegroundColor Cyan
        # Apply Phase 1 ingress (core + business AI services)
        kubectl apply -f infrastructure/kubernetes/ingress-expanded.yaml
    }
    "2" {
        Write-Host "📁 Deploying Phase 2: Platform Services..." -ForegroundColor Cyan
        # Apply Phase 2 ingress (includes development platforms)
        kubectl apply -f infrastructure/kubernetes/ingress-expanded.yaml
    }
    "3" {
        Write-Host "📁 Deploying Phase 3: Complete Ecosystem..." -ForegroundColor Cyan
        # Apply complete ingress configuration
        kubectl apply -f infrastructure/kubernetes/ingress-expanded.yaml
    }
    default {
        Write-Host "📁 Deploying Core Services..." -ForegroundColor Cyan
        kubectl apply -f infrastructure/kubernetes/ingress-expanded.yaml
    }
}

# Deploy monitoring stack
Write-Host "📊 Installing monitoring stack..." -ForegroundColor Yellow
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install monitoring prometheus-community/kube-prometheus-stack

# Wait for load balancer
Write-Host "⏳ Waiting for load balancer external IP..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$externalIP = ""

do {
    Start-Sleep 10
    $attempt++
    Write-Host "🔍 Attempt $attempt/$maxAttempts - Checking for external IP..." -ForegroundColor Yellow
    
    try {
        $externalIP = kubectl get service -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
        if ([string]::IsNullOrEmpty($externalIP)) {
            $externalIP = kubectl get service -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
        }
    } catch {
        Write-Host "⚠️ Error getting external IP: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    if (![string]::IsNullOrEmpty($externalIP)) {
        Write-Host "✅ Load balancer external IP: $externalIP" -ForegroundColor Green
        break
    }
} while ($attempt -lt $maxAttempts)

if ([string]::IsNullOrEmpty($externalIP)) {
    Write-Host "❌ Failed to get external IP after $maxAttempts attempts" -ForegroundColor Red
    Write-Host "🔍 Manual check required:" -ForegroundColor Yellow
    kubectl get service -n ingress-nginx ingress-nginx-controller
    return
}

# Create DNS configuration file
Write-Host "🌐 Creating DNS configuration..." -ForegroundColor Yellow
$dnsConfig = @"
# 🌐 DNS Configuration for CODAI Ecosystem
# Load Balancer IP: $externalIP
# Generated: $(Get-Date)

## Core Platform Domains
codai.ro            A    $externalIP
api.codai.ro        A    $externalIP
id.codai.ro         A    $externalIP
auth.codai.ro       A    $externalIP
hub.codai.ro        A    $externalIP
admin.codai.ro      A    $externalIP
tools.codai.ro      A    $externalIP
wallet.codai.ro     A    $externalIP

memorai.ro          A    $externalIP
api.memorai.ro      A    $externalIP
mcp.memorai.ro      A    $externalIP
cbd.memorai.ro      A    $externalIP

controlai.ro        A    $externalIP
dashboard.controlai.ro  A    $externalIP
api.controlai.ro    A    $externalIP
mcp.controlai.ro    A    $externalIP

romai.ro            A    $externalIP
api.romai.ro        A    $externalIP
mcp.romai.ro        A    $externalIP
"@

switch ($Phase) {
    "1" {
        $dnsConfig += @"

## Phase 1: Core Business AI Services
bancai.ro           A    $externalIP
app.bancai.ro       A    $externalIP
api.bancai.ro       A    $externalIP
admin.bancai.ro     A    $externalIP
mobile.bancai.ro    A    $externalIP

studiai.ro          A    $externalIP
app.studiai.ro      A    $externalIP
api.studiai.ro      A    $externalIP
admin.studiai.ro    A    $externalIP

talentai.ro         A    $externalIP
app.talentai.ro     A    $externalIP
api.talentai.ro     A    $externalIP
admin.talentai.ro   A    $externalIP

marketai.ro         A    $externalIP
app.marketai.ro     A    $externalIP
api.marketai.ro     A    $externalIP
admin.marketai.ro   A    $externalIP

legalizai.ro        A    $externalIP
app.legalizai.ro    A    $externalIP
api.legalizai.ro    A    $externalIP
admin.legalizai.ro  A    $externalIP

conversai.ro        A    $externalIP
app.conversai.ro    A    $externalIP
api.conversai.ro    A    $externalIP
admin.conversai.ro  A    $externalIP

muzicai.ro          A    $externalIP
app.muzicai.ro      A    $externalIP
api.muzicai.ro      A    $externalIP
admin.muzicai.ro    A    $externalIP

stocai.ro           A    $externalIP
app.stocai.ro       A    $externalIP
api.stocai.ro       A    $externalIP
admin.stocai.ro     A    $externalIP
"@
    }
    "2" {
        $dnsConfig += @"

## Phase 2: Platform Services
kodex.ro            A    $externalIP
app.kodex.ro        A    $externalIP
api.kodex.ro        A    $externalIP
admin.kodex.ro      A    $externalIP

metu.ro             A    $externalIP
web.metu.ro         A    $externalIP
api.metu.ro         A    $externalIP
admin.metu.ro       A    $externalIP
"@
    }
    "3" {
        $dnsConfig += @"

## Phase 3: Complete Ecosystem (25+ additional AI services)
# [Additional domains would be listed here]
"@
    }
}

# Save DNS configuration
$dnsConfig | Out-File -FilePath "DNS_CONFIGURATION_PHASE_$Phase.txt" -Encoding UTF8

Write-Host ""
Write-Host "🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 SUMMARY:" -ForegroundColor Cyan
Write-Host "   Cluster: $ClusterName" -ForegroundColor White
Write-Host "   Phase: $Phase" -ForegroundColor White
Write-Host "   Load Balancer IP: $externalIP" -ForegroundColor White
Write-Host "   DNS Config: DNS_CONFIGURATION_PHASE_$Phase.txt" -ForegroundColor White
Write-Host ""
Write-Host "🌐 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Configure DNS records in Vercel with the IP above" -ForegroundColor White
Write-Host "2. Wait 5-15 minutes for DNS propagation" -ForegroundColor White
Write-Host "3. SSL certificates will be issued automatically" -ForegroundColor White
Write-Host "4. Test domains: https://codai.ro, https://bancai.ro, etc." -ForegroundColor White
Write-Host ""
Write-Host "🔧 MONITORING:" -ForegroundColor Magenta
Write-Host "   Grafana: http://$externalIP:3000 (admin/prom-operator)" -ForegroundColor White
Write-Host "   Prometheus: http://$externalIP:9090" -ForegroundColor White
Write-Host ""

# Show cluster status
Write-Host "📊 CLUSTER STATUS:" -ForegroundColor Cyan
kubectl get pods --all-namespaces | Where-Object {$_ -match "(ingress|cert-manager|postgresql|redis|prometheus)"}

Write-Host ""
Write-Host "✅ Ready for Phase $(if($Phase -eq '3'){'completion'}else{[int]$Phase + 1}) deployment!" -ForegroundColor Green
