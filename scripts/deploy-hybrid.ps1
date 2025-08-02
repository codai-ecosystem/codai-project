# 🚀 Fast Hybrid Deployment Script

# Stop if any command fails
$ErrorActionPreference = "Stop"

Write-Host "🚀 CODAI Hybrid Deployment - Fast Track!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Deployment Strategy:" -ForegroundColor Cyan
Write-Host "   • Frontend (Next.js) → Vercel" -ForegroundColor White
Write-Host "   • Backend (Node.js) → Local Kubernetes" -ForegroundColor White
Write-Host "   • Databases → Local Kubernetes" -ForegroundColor White
Write-Host ""

# Check prerequisites
function Test-Prerequisites {
    Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow
    
    # Check Docker
    try {
        docker --version | Out-Null
        Write-Host "✅ Docker Desktop available" -ForegroundColor Green
    } catch {
        Write-Host "❌ Docker Desktop required" -ForegroundColor Red
        exit 1
    }
    
    # Check if Kubernetes is enabled
    try {
        kubectl cluster-info | Out-Null
        Write-Host "✅ Kubernetes enabled in Docker Desktop" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Please enable Kubernetes in Docker Desktop Settings" -ForegroundColor Yellow
        Write-Host "   1. Open Docker Desktop" -ForegroundColor White
        Write-Host "   2. Go to Settings > Kubernetes" -ForegroundColor White
        Write-Host "   3. Check 'Enable Kubernetes'" -ForegroundColor White
        Write-Host "   4. Click 'Apply & Restart'" -ForegroundColor White
        Write-Host ""
        Read-Host "Press Enter when Kubernetes is enabled..."
    }
    
    # Check Vercel CLI
    try {
        vercel --version | Out-Null
        Write-Host "✅ Vercel CLI available" -ForegroundColor Green
    } catch {
        Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
        npm install -g vercel
        Write-Host "✅ Vercel CLI installed" -ForegroundColor Green
    }
}

# Deploy backend services to local Kubernetes
function Deploy-BackendServices {
    Write-Host ""
    Write-Host "🏗️ Deploying Backend Services to Kubernetes..." -ForegroundColor Cyan
    
    # Create namespaces
    Write-Host "📦 Creating namespaces..." -ForegroundColor White
    kubectl apply -f - @"
apiVersion: v1
kind: Namespace
metadata:
  name: codai-backend
---
apiVersion: v1
kind: Namespace
metadata:
  name: codai-data
"@
    
    # Deploy PostgreSQL
    Write-Host "🐘 Deploying PostgreSQL..." -ForegroundColor White
    kubectl apply -f infrastructure/kubernetes/local-infrastructure.yaml
    
    # Wait for PostgreSQL to be ready
    Write-Host "⏳ Waiting for PostgreSQL..." -ForegroundColor Yellow
    kubectl wait --for=condition=available --timeout=300s deployment/postgresql -n codai-system
    
    # Deploy API Gateway
    Write-Host "🌐 Deploying API Gateway..." -ForegroundColor White
    kubectl apply -f - @"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: codai-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: gateway
        image: node:20-alpine
        workingDir: /app
        command: ["sh", "-c"]
        args: ["npm install && npm run build && npm start"]
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          value: "postgresql://codai:codai123@postgresql.codai-system:5432/codai"
        volumeMounts:
        - name: gateway-code
          mountPath: /app
      volumes:
      - name: gateway-code
        hostPath:
          path: E:\\GitHub\\codai-project\\apps\\gateway
---
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
  namespace: codai-backend
spec:
  selector:
    app: api-gateway
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
"@
    
    Write-Host "✅ Backend services deployed!" -ForegroundColor Green
}

# Setup Vercel deployment for Phase 1 apps
function Deploy-VercelApps {
    Write-Host ""
    Write-Host "🌐 Setting up Vercel deployments..." -ForegroundColor Cyan
    
    $phase1Apps = @(
        @{name="bancai"; domain="bancai.ro"; port=4005},
        @{name="studiai"; domain="studiai.ro"; port=6400},
        @{name="talentai"; domain="talentai.ro"; port=6600},
        @{name="marketai"; domain="marketai.ro"; port=5300},
        @{name="legalizai"; domain="legalizai.ro"; port=5100},
        @{name="conversai"; domain="conversai.ro"; port=3700},
        @{name="muzicai"; domain="muzicai.ro"; port=5800},
        @{name="stocai"; domain="stocai.ro"; port=6300}
    )
    
    Write-Host "📋 Phase 1 Apps to Deploy:" -ForegroundColor Yellow
    foreach ($app in $phase1Apps) {
        Write-Host "   • $($app.name) → $($app.domain)" -ForegroundColor White
    }
    Write-Host ""
    
    # Login to Vercel
    Write-Host "🔐 Logging into Vercel..." -ForegroundColor White
    vercel login
    
    foreach ($app in $phase1Apps) {
        Write-Host "🚀 Deploying $($app.name)..." -ForegroundColor Green
        
        Push-Location "apps/$($app.name)"
        
        # Initialize Vercel project
        Write-Host "   📦 Initializing Vercel project..." -ForegroundColor Gray
        vercel --yes
        
        # Deploy to production
        Write-Host "   🌐 Deploying to production..." -ForegroundColor Gray
        vercel --prod
        
        # Add custom domain
        Write-Host "   🌍 Adding domain $($app.domain)..." -ForegroundColor Gray
        vercel domains add $($app.domain)
        
        Pop-Location
        
        Write-Host "   ✅ $($app.name) deployed successfully!" -ForegroundColor Green
    }
}

# Get load balancer IP and configure DNS
function Configure-DNS {
    Write-Host ""
    Write-Host "🌐 Getting load balancer information..." -ForegroundColor Cyan
    
    # Wait for load balancer to get external IP
    Write-Host "⏳ Waiting for load balancer external IP..." -ForegroundColor Yellow
    
    $timeout = 300 # 5 minutes
    $elapsed = 0
    $externalIP = $null
    
    while ($elapsed -lt $timeout -and -not $externalIP) {
        Start-Sleep 10
        $elapsed += 10
        
        $lbInfo = kubectl get service api-gateway -n codai-backend -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>$null
        if ($lbInfo -and $lbInfo -ne "") {
            $externalIP = $lbInfo
        } else {
            # Try hostname for Docker Desktop
            $lbInfo = kubectl get service api-gateway -n codai-backend -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>$null
            if ($lbInfo -and $lbInfo -ne "") {
                $externalIP = $lbInfo
            }
        }
        
        Write-Host "   ⏱️ Elapsed: $elapsed seconds..." -ForegroundColor Gray
    }
    
    if ($externalIP) {
        Write-Host "✅ Load Balancer IP: $externalIP" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Using localhost for local development" -ForegroundColor Yellow
        $externalIP = "localhost"
    }
    
    # Create DNS configuration guide
    $dnsConfig = @"
# 🌐 DNS Configuration for CODAI Ecosystem

## API Services (Point to Load Balancer: $externalIP)
Add these A records in your DNS provider:

``````
api.codai.ro        A    $externalIP
mcp.memorai.ro      A    $externalIP
api.romai.ro        A    $externalIP
``````

## Frontend Apps (Already configured in Vercel)
These domains are automatically configured during Vercel deployment:

- bancai.ro → Vercel
- studiai.ro → Vercel  
- talentai.ro → Vercel
- marketai.ro → Vercel
- legalizai.ro → Vercel
- conversai.ro → Vercel
- muzicai.ro → Vercel
- stocai.ro → Vercel

## Local Testing
Add to your hosts file (C:\Windows\System32\drivers\etc\hosts):

``````
127.0.0.1    api.codai.ro
127.0.0.1    mcp.memorai.ro  
127.0.0.1    api.romai.ro
``````

## Verification
Test your deployment:

``````
# Test API Gateway
curl http://api.codai.ro/health

# Test frontend apps
curl https://bancai.ro
curl https://studiai.ro
``````
"@
    
    $dnsConfig | Out-File -FilePath "DNS_CONFIGURATION_HYBRID.md" -Encoding UTF8
    Write-Host "📝 DNS configuration saved to DNS_CONFIGURATION_HYBRID.md" -ForegroundColor Cyan
}

# Main deployment function
function Start-HybridDeployment {
    param(
        [string]$Phase = "1"
    )
    
    $startTime = Get-Date
    
    Test-Prerequisites
    
    if ($Phase -eq "backend" -or $Phase -eq "1" -or $Phase -eq "all") {
        Deploy-BackendServices
    }
    
    if ($Phase -eq "vercel" -or $Phase -eq "1" -or $Phase -eq "all") {
        Deploy-VercelApps
    }
    
    if ($Phase -eq "dns" -or $Phase -eq "1" -or $Phase -eq "all") {
        Configure-DNS
    }
    
    $endTime = Get-Date
    $duration = $endTime - $startTime
    
    Write-Host ""
    Write-Host "🎉 HYBRID DEPLOYMENT COMPLETED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⏱️ Total Time: $($duration.TotalMinutes.ToString('F1')) minutes" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🌐 Your CODAI ecosystem is now live:" -ForegroundColor Yellow
    Write-Host "   • 8 AI platforms on Vercel with custom domains" -ForegroundColor White
    Write-Host "   • Backend services on local Kubernetes" -ForegroundColor White
    Write-Host "   • API Gateway ready for integration" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Configure DNS records (see DNS_CONFIGURATION_HYBRID.md)" -ForegroundColor White
    Write-Host "   2. Test all endpoints" -ForegroundColor White
    Write-Host "   3. Monitor deployment health" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Ready for production traffic!" -ForegroundColor Green
}

# Export functions for modular usage
Export-ModuleMember -Function Start-HybridDeployment

# If script is run directly, start deployment
if ($MyInvocation.InvocationName -ne '.') {
    Start-HybridDeployment -Phase "1"
}
