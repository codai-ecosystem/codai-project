# 🏗️ Build and Deploy Core Infrastructure to EKS Fargate

# Enable error handling
$ErrorActionPreference = "Stop"

Write-Host "🏗️ CODAI Core Infrastructure - Fargate Ready Deployment" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# Delete existing infrastructure that has HostPath volumes
Write-Host "🧹 Cleaning up existing deployment..." -ForegroundColor Yellow
kubectl delete -f infrastructure/kubernetes/core-infrastructure.yaml --ignore-not-found=true

Write-Host "⏳ Waiting for cleanup..." -ForegroundColor Yellow
Start-Sleep 30

# Deploy Fargate-compatible infrastructure (databases first)
Write-Host "🗄️ Deploying data services..." -ForegroundColor Cyan
kubectl apply -f - <<EOF
apiVersion: v1
kind: Namespace
metadata:
  name: codai-data
---
# PostgreSQL
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgresql
  namespace: codai-data
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgresql
  template:
    metadata:
      labels:
        app: postgresql
    spec:
      containers:
      - name: postgresql
        image: postgres:15-alpine
        env:
        - name: POSTGRES_DB
          value: "codai"
        - name: POSTGRES_USER
          value: "codai"
        - name: POSTGRES_PASSWORD
          value: "codai123"
        ports:
        - containerPort: 5432
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: postgresql
  namespace: codai-data
spec:
  selector:
    app: postgresql
  ports:
  - port: 5432
    targetPort: 5432
---
# Redis
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: codai-data
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        command: ["redis-server", "--appendonly", "yes"]
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "250m"
---
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: codai-data
spec:
  selector:
    app: redis
  ports:
  - port: 6379
    targetPort: 6379
---
# Qdrant Vector Database
apiVersion: apps/v1
kind: Deployment
metadata:
  name: qdrant
  namespace: codai-data
spec:
  replicas: 1
  selector:
    matchLabels:
      app: qdrant
  template:
    metadata:
      labels:
        app: qdrant
    spec:
      containers:
      - name: qdrant
        image: qdrant/qdrant:latest
        ports:
        - containerPort: 6333
        - containerPort: 6334
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: qdrant
  namespace: codai-data
spec:
  selector:
    app: qdrant
  ports:
  - port: 6333
    targetPort: 6333
    name: http
  - port: 6334
    targetPort: 6334
    name: grpc
EOF

Write-Host "⏳ Waiting for data services to be ready..." -ForegroundColor Yellow
kubectl wait --namespace codai-data --for=condition=ready pod --selector=app=postgresql --timeout=600s
kubectl wait --namespace codai-data --for=condition=ready pod --selector=app=redis --timeout=300s
kubectl wait --namespace codai-data --for=condition=ready pod --selector=app=qdrant --timeout=300s

# Deploy application services (using simpler containers for now)
Write-Host "🚀 Deploying application services..." -ForegroundColor Cyan
kubectl apply -f - <<EOF
apiVersion: v1
kind: Namespace
metadata:
  name: codai-infrastructure
---
# Gateway Service (API router)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gateway
  namespace: codai-infrastructure
spec:
  replicas: 2
  selector:
    matchLabels:
      app: gateway
  template:
    metadata:
      labels:
        app: gateway
    spec:
      containers:
      - name: gateway
        image: nginx:alpine
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "250m"
---
apiVersion: v1
kind: Service
metadata:
  name: gateway
  namespace: codai-infrastructure
spec:
  selector:
    app: gateway
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
---
# MemorAI Service (placeholder)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: memorai
  namespace: codai-infrastructure
spec:
  replicas: 1
  selector:
    matchLabels:
      app: memorai
  template:
    metadata:
      labels:
        app: memorai
    spec:
      containers:
      - name: memorai
        image: nginx:alpine
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "250m"
---
apiVersion: v1
kind: Service
metadata:
  name: memorai
  namespace: codai-infrastructure
spec:
  selector:
    app: memorai
  ports:
  - port: 3693
    targetPort: 80
    name: main
  - port: 6367
    targetPort: 80
    name: mcp
---
# RomAI MCP Service (placeholder)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: romai-mcp
  namespace: codai-infrastructure
spec:
  replicas: 1
  selector:
    matchLabels:
      app: romai-mcp
  template:
    metadata:
      labels:
        app: romai-mcp
    spec:
      containers:
      - name: romai-mcp
        image: nginx:alpine
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "250m"
---
apiVersion: v1
kind: Service
metadata:
  name: romai-mcp
  namespace: codai-infrastructure
spec:
  selector:
    app: romai-mcp
  ports:
  - port: 8000
    targetPort: 80
---
# Glass Service (placeholder)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: glass
  namespace: codai-infrastructure
spec:
  replicas: 1
  selector:
    matchLabels:
      app: glass
  template:
    metadata:
      labels:
        app: glass
    spec:
      containers:
      - name: glass
        image: nginx:alpine
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "250m"
---
apiVersion: v1
kind: Service
metadata:
  name: glass
  namespace: codai-infrastructure
spec:
  selector:
    app: glass
  ports:
  - port: 7700
    targetPort: 80
EOF

Write-Host "⏳ Waiting for application services to be ready..." -ForegroundColor Yellow
kubectl wait --namespace codai-infrastructure --for=condition=ready pod --selector=app=gateway --timeout=600s
kubectl wait --namespace codai-infrastructure --for=condition=ready pod --selector=app=memorai --timeout=300s
kubectl wait --namespace codai-infrastructure --for=condition=ready pod --selector=app=romai-mcp --timeout=300s
kubectl wait --namespace codai-infrastructure --for=condition=ready pod --selector=app=glass --timeout=300s

# Get LoadBalancer DNS
Write-Host "🔍 Getting LoadBalancer DNS..." -ForegroundColor Yellow
$loadBalancerDNS = ""
$attempts = 0
while ($loadBalancerDNS -eq "" -and $attempts -lt 20) {
    Start-Sleep 15
    $attempts++
    $serviceInfo = kubectl get service gateway -n codai-infrastructure -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>$null
    if ($serviceInfo) {
        $loadBalancerDNS = $serviceInfo
    }
    Write-Host "⏳ Waiting for LoadBalancer DNS... (attempt $attempts/20)" -ForegroundColor Yellow
}

Write-Host "🎉 Core Infrastructure Deployed Successfully!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Service Status:" -ForegroundColor Cyan
Write-Host "• LoadBalancer DNS: $loadBalancerDNS" -ForegroundColor White
Write-Host "• Gateway API: http://$loadBalancerDNS" -ForegroundColor White
Write-Host "• PostgreSQL: Ready (Internal)" -ForegroundColor White
Write-Host "• Redis: Ready (Internal)" -ForegroundColor White
Write-Host "• Qdrant: Ready (Internal)" -ForegroundColor White
Write-Host "• MemorAI: Placeholder Ready" -ForegroundColor White
Write-Host "• RomAI MCP: Placeholder Ready" -ForegroundColor White
Write-Host "• Glass: Placeholder Ready" -ForegroundColor White
Write-Host ""
Write-Host "🌐 DNS Configuration:" -ForegroundColor Cyan
Write-Host "Add these CNAME records in Vercel DNS:" -ForegroundColor White
Write-Host "• api.codai.ro -> $loadBalancerDNS" -ForegroundColor White
Write-Host "• memorai.ro -> $loadBalancerDNS" -ForegroundColor White
Write-Host "• mcp.memorai.ro -> $loadBalancerDNS" -ForegroundColor White
Write-Host "• mcp.romai.ro -> $loadBalancerDNS" -ForegroundColor White
Write-Host "• glass.codai.ro -> $loadBalancerDNS" -ForegroundColor White
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Configure DNS records in Vercel" -ForegroundColor White
Write-Host "2. Build and deploy actual application containers" -ForegroundColor White
Write-Host "3. Deploy Next.js applications to Vercel" -ForegroundColor White
Write-Host "4. Configure SSL certificates" -ForegroundColor White
Write-Host ""
Write-Host "✅ Infrastructure foundation ready!" -ForegroundColor Green
