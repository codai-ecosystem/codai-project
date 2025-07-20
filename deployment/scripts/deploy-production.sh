#!/bin/bash
# CODAI Ecosystem Complete Deployment Script
# This script deploys the entire CODAI ecosystem to production

set -e

# Configuration
NAMESPACE="codai-production"
DOCKER_REGISTRY="registry.codai.ro"
KUBECONFIG_PATH="$HOME/.kube/config"
VERSION=$(git describe --tags --always 2>/dev/null || echo "latest")
BACKUP_BEFORE_DEPLOY=true

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] ${GREEN}$1${NC}"
}

warn() {
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] ${YELLOW}WARNING: $1${NC}"
}

error() {
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] ${RED}ERROR: $1${NC}"
    exit 1
}

info() {
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] ${BLUE}INFO: $1${NC}"
}

# Check if running with proper permissions
check_permissions() {
    if [[ $EUID -eq 0 ]]; then
        warn "Running as root. Consider using a non-root user with proper RBAC permissions."
    fi
}

# Validate prerequisites
check_prerequisites() {
    log "🔍 Checking prerequisites..."
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        error "kubectl is not installed. Please install kubectl first."
    fi
    
    # Check docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    # Check helm
    if ! command -v helm &> /dev/null; then
        warn "Helm is not installed. Some features might not work."
    fi
    
    # Check git
    if ! command -v git &> /dev/null; then
        error "Git is not installed. Please install Git first."
    fi
    
    # Check cluster connectivity
    if ! kubectl cluster-info &> /dev/null; then
        error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    fi
    
    # Check node status
    NODE_COUNT=$(kubectl get nodes --no-headers | wc -l)
    READY_NODES=$(kubectl get nodes --no-headers | grep -c "Ready")
    
    info "Cluster has $NODE_COUNT nodes, $READY_NODES ready"
    
    if [ "$READY_NODES" -lt 3 ]; then
        warn "Less than 3 nodes ready. Consider adding more nodes for high availability."
    fi
    
    log "✅ Prerequisites check passed"
}

# Create or update namespace
setup_namespace() {
    log "🏷️  Setting up namespace..."
    
    if kubectl get namespace $NAMESPACE &> /dev/null; then
        info "Namespace $NAMESPACE already exists"
    else
        kubectl create namespace $NAMESPACE
        kubectl label namespace $NAMESPACE environment=production
        kubectl annotate namespace $NAMESPACE deployment.version="$VERSION"
        log "Created namespace $NAMESPACE"
    fi
}

# Setup RBAC and security
setup_security() {
    log "🔒 Setting up security and RBAC..."
    
    # Create service account
    kubectl apply -f - <<EOF
apiVersion: v1
kind: ServiceAccount
metadata:
  name: codai-service-account
  namespace: $NAMESPACE
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: codai-cluster-role
rules:
- apiGroups: [""]
  resources: ["pods", "services", "endpoints", "persistentvolumeclaims", "events", "configmaps", "secrets"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
- apiGroups: ["apps"]
  resources: ["deployments", "daemonsets", "replicasets", "statefulsets"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
- apiGroups: ["monitoring.coreos.com"]
  resources: ["servicemonitors", "prometheusrules"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: codai-cluster-role-binding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: codai-cluster-role
subjects:
- kind: ServiceAccount
  name: codai-service-account
  namespace: $NAMESPACE
EOF
    
    log "✅ Security and RBAC configured"
}

# Build all Docker images
build_images() {
    log "🐳 Building Docker images..."
    
    # Create build timestamp
    BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    # Build API Gateway
    info "Building API Gateway..."
    docker build \
        --build-arg VERSION=$VERSION \
        --build-arg BUILD_TIME=$BUILD_TIME \
        -t $DOCKER_REGISTRY/api-gateway:$VERSION \
        -t $DOCKER_REGISTRY/api-gateway:latest \
        -f deployment/docker/api-gateway.Dockerfile .
    
    # Build core services
    CORE_SERVICES=("id" "memorai" "hub" "logai")
    for service in "${CORE_SERVICES[@]}"; do
        info "Building $service service..."
        
        if [ -f "apps/$service/Dockerfile" ]; then
            docker build \
                --build-arg VERSION=$VERSION \
                --build-arg BUILD_TIME=$BUILD_TIME \
                -t $DOCKER_REGISTRY/$service-service:$VERSION \
                -t $DOCKER_REGISTRY/$service-service:latest \
                -f apps/$service/Dockerfile ./apps/$service
        else
            # Use generic service Dockerfile
            docker build \
                --build-arg VERSION=$VERSION \
                --build-arg BUILD_TIME=$BUILD_TIME \
                --build-arg SERVICE_NAME=$service \
                -t $DOCKER_REGISTRY/$service-service:$VERSION \
                -t $DOCKER_REGISTRY/$service-service:latest \
                -f deployment/docker/service.Dockerfile ./apps/$service
        fi
    done
    
    # Build business services
    BUSINESS_SERVICES=("codai" "bancai" "cumparai" "studiai" "fabricai" "muzicai" "talentai" "sociai" "stocai" "marketai" "legalizai" "donai" "publicai" "conversai" "analizai" "curtai" "prezentai" "romai" "sunai" "ajutai" "jucai" "acasai" "aide")
    
    for service in "${BUSINESS_SERVICES[@]}"; do
        if [ -d "apps/$service" ]; then
            info "Building $service service..."
            
            if [ -f "apps/$service/Dockerfile" ]; then
                docker build \
                    --build-arg VERSION=$VERSION \
                    --build-arg BUILD_TIME=$BUILD_TIME \
                    -t $DOCKER_REGISTRY/$service-service:$VERSION \
                    -t $DOCKER_REGISTRY/$service-service:latest \
                    -f apps/$service/Dockerfile ./apps/$service
            else
                # Use generic service Dockerfile
                docker build \
                    --build-arg VERSION=$VERSION \
                    --build-arg BUILD_TIME=$BUILD_TIME \
                    --build-arg SERVICE_NAME=$service \
                    -t $DOCKER_REGISTRY/$service-service:$VERSION \
                    -t $DOCKER_REGISTRY/$service-service:latest \
                    -f deployment/docker/service.Dockerfile ./apps/$service
            fi
        else
            warn "Directory apps/$service not found, skipping..."
        fi
    done
    
    log "✅ All Docker images built successfully"
}

# Push images to registry
push_images() {
    log "📤 Pushing Docker images to registry..."
    
    # Login to registry
    if [ ! -z "$DOCKER_USERNAME" ] && [ ! -z "$DOCKER_PASSWORD" ]; then
        echo "$DOCKER_PASSWORD" | docker login $DOCKER_REGISTRY -u "$DOCKER_USERNAME" --password-stdin
    fi
    
    # Push API Gateway
    docker push $DOCKER_REGISTRY/api-gateway:$VERSION
    docker push $DOCKER_REGISTRY/api-gateway:latest
    
    # Push all services
    ALL_SERVICES=("id" "memorai" "hub" "logai" "codai" "bancai" "cumparai" "studiai" "fabricai" "muzicai" "talentai" "sociai" "stocai" "marketai" "legalizai" "donai" "publicai" "conversai" "analizai" "curtai" "prezentai" "romai" "sunai" "ajutai" "jucai" "acasai" "aide")
    
    for service in "${ALL_SERVICES[@]}"; do
        if docker images | grep -q "$DOCKER_REGISTRY/$service-service"; then
            info "Pushing $service service..."
            docker push $DOCKER_REGISTRY/$service-service:$VERSION
            docker push $DOCKER_REGISTRY/$service-service:latest
        fi
    done
    
    log "✅ All images pushed to registry"
}

# Deploy ConfigMaps and Secrets
deploy_configs() {
    log "🗄️  Deploying configuration..."
    
    # Create ConfigMap from environment file
    kubectl create configmap codai-config \
        --from-env-file=deployment/production/.env.production \
        --namespace=$NAMESPACE \
        --dry-run=client -o yaml | kubectl apply -f -
    
    # Create generic secrets (these should be replaced with actual secrets)
    kubectl apply -f - <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: codai-secrets
  namespace: $NAMESPACE
type: Opaque
data:
  jwt-secret: $(echo -n "production-jwt-secret-key" | base64)
  database-password: $(echo -n "secure-database-password" | base64)
  redis-password: $(echo -n "secure-redis-password" | base64)
  openai-api-key: $(echo -n "sk-your-openai-key" | base64)
  smtp-password: $(echo -n "smtp-password" | base64)
  aws-secret-key: $(echo -n "aws-secret-access-key" | base64)
EOF
    
    log "✅ Configuration deployed"
}

# Deploy database infrastructure
deploy_database() {
    log "🗄️  Deploying database infrastructure..."
    
    # Deploy PostgreSQL
    kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgresql
  namespace: $NAMESPACE
spec:
  serviceName: postgresql
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
        image: postgres:13
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          value: codai_production
        - name: POSTGRES_USER
          value: codai
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: codai-secrets
              key: database-password
        volumeMounts:
        - name: postgresql-storage
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
  volumeClaimTemplates:
  - metadata:
      name: postgresql-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 100Gi
---
apiVersion: v1
kind: Service
metadata:
  name: postgresql
  namespace: $NAMESPACE
spec:
  selector:
    app: postgresql
  ports:
  - protocol: TCP
    port: 5432
    targetPort: 5432
  type: ClusterIP
EOF
    
    # Deploy Redis
    kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: redis
  namespace: $NAMESPACE
spec:
  serviceName: redis
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
        args:
        - redis-server
        - --requirepass
        - \$(REDIS_PASSWORD)
        env:
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: codai-secrets
              key: redis-password
        volumeMounts:
        - name: redis-storage
          mountPath: /data
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "1Gi"
            cpu: "500m"
  volumeClaimTemplates:
  - metadata:
      name: redis-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 20Gi
---
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: $NAMESPACE
spec:
  selector:
    app: redis
  ports:
  - protocol: TCP
    port: 6379
    targetPort: 6379
  type: ClusterIP
EOF
    
    # Wait for databases to be ready
    info "Waiting for databases to be ready..."
    kubectl wait --for=condition=ready pod -l app=postgresql -n $NAMESPACE --timeout=300s
    kubectl wait --for=condition=ready pod -l app=redis -n $NAMESPACE --timeout=300s
    
    log "✅ Database infrastructure deployed"
}

# Deploy API Gateway
deploy_api_gateway() {
    log "🚀 Deploying API Gateway..."
    
    kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: $NAMESPACE
  labels:
    app: api-gateway
    tier: gateway
    version: $VERSION
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 2
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
        tier: gateway
        version: $VERSION
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "4000"
        prometheus.io/path: "/metrics"
    spec:
      serviceAccountName: codai-service-account
      containers:
      - name: api-gateway
        image: $DOCKER_REGISTRY/api-gateway:$VERSION
        ports:
        - containerPort: 4000
          name: http
        - containerPort: 8080
          name: metrics
        envFrom:
        - configMapRef:
            name: codai-config
        - secretRef:
            name: codai-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: 4000
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        securityContext:
          allowPrivilegeEscalation: false
          runAsNonRoot: true
          runAsUser: 1001
          readOnlyRootFilesystem: true
---
apiVersion: v1
kind: Service
metadata:
  name: api-gateway-service
  namespace: $NAMESPACE
  labels:
    app: api-gateway
spec:
  selector:
    app: api-gateway
  ports:
  - protocol: TCP
    port: 4000
    targetPort: 4000
    name: http
  - protocol: TCP
    port: 8080
    targetPort: 8080
    name: metrics
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-gateway-ingress
  namespace: $NAMESPACE
  annotations:
    kubernetes.io/ingress.class: "nginx"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - api.codai.ro
    secretName: api-gateway-tls
  rules:
  - host: api.codai.ro
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-gateway-service
            port:
              number: 4000
EOF
    
    # Wait for deployment
    kubectl rollout status deployment/api-gateway -n $NAMESPACE --timeout=300s
    
    log "✅ API Gateway deployed successfully"
}

# Deploy core services
deploy_core_services() {
    log "🎯 Deploying core services..."
    
    CORE_SERVICES=("id:4001" "memorai:4002" "hub:4020" "logai:4021")
    
    for service_config in "${CORE_SERVICES[@]}"; do
        IFS=':' read -r service port <<< "$service_config"
        info "Deploying $service service on port $port..."
        
        kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${service}-service
  namespace: $NAMESPACE
  labels:
    app: ${service}-service
    tier: core
    version: $VERSION
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ${service}-service
  template:
    metadata:
      labels:
        app: ${service}-service
        tier: core
        version: $VERSION
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "$port"
        prometheus.io/path: "/metrics"
    spec:
      serviceAccountName: codai-service-account
      containers:
      - name: ${service}-service
        image: $DOCKER_REGISTRY/${service}-service:$VERSION
        ports:
        - containerPort: $port
          name: http
        envFrom:
        - configMapRef:
            name: codai-config
        - secretRef:
            name: codai-secrets
        env:
        - name: PORT
          value: "$port"
        - name: SERVICE_NAME
          value: "$service"
        resources:
          requests:
            memory: "256Mi"
            cpu: "200m"
          limits:
            memory: "512Mi"
            cpu: "400m"
        livenessProbe:
          httpGet:
            path: /health
            port: $port
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: $port
          initialDelaySeconds: 5
          periodSeconds: 5
        securityContext:
          allowPrivilegeEscalation: false
          runAsNonRoot: true
          runAsUser: 1001
---
apiVersion: v1
kind: Service
metadata:
  name: ${service}-service
  namespace: $NAMESPACE
  labels:
    app: ${service}-service
spec:
  selector:
    app: ${service}-service
  ports:
  - protocol: TCP
    port: $port
    targetPort: $port
  type: ClusterIP
EOF
        
        # Wait for service to be ready
        kubectl rollout status deployment/${service}-service -n $NAMESPACE --timeout=300s
    done
    
    log "✅ Core services deployed successfully"
}

# Deploy business services
deploy_business_services() {
    log "💼 Deploying business services..."
    
    BUSINESS_SERVICES=("codai:4003" "bancai:4005" "cumparai:4007" "studiai:4009" "fabricai:4011" "muzicai:4013" "talentai:4015" "sociai:4017" "stocai:4019")
    
    for service_config in "${BUSINESS_SERVICES[@]}"; do
        IFS=':' read -r service port <<< "$service_config"
        
        # Skip if service directory doesn't exist
        if [ ! -d "apps/$service" ]; then
            warn "Directory apps/$service not found, skipping..."
            continue
        fi
        
        info "Deploying $service service on port $port..."
        
        kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${service}-service
  namespace: $NAMESPACE
  labels:
    app: ${service}-service
    tier: business
    version: $VERSION
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ${service}-service
  template:
    metadata:
      labels:
        app: ${service}-service
        tier: business
        version: $VERSION
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "$port"
        prometheus.io/path: "/metrics"
    spec:
      serviceAccountName: codai-service-account
      containers:
      - name: ${service}-service
        image: $DOCKER_REGISTRY/${service}-service:$VERSION
        ports:
        - containerPort: $port
          name: http
        envFrom:
        - configMapRef:
            name: codai-config
        - secretRef:
            name: codai-secrets
        env:
        - name: PORT
          value: "$port"
        - name: SERVICE_NAME
          value: "$service"
        resources:
          requests:
            memory: "256Mi"
            cpu: "150m"
          limits:
            memory: "512Mi"
            cpu: "300m"
        livenessProbe:
          httpGet:
            path: /health
            port: $port
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: $port
          initialDelaySeconds: 5
          periodSeconds: 5
        securityContext:
          allowPrivilegeEscalation: false
          runAsNonRoot: true
          runAsUser: 1001
---
apiVersion: v1
kind: Service
metadata:
  name: ${service}-service
  namespace: $NAMESPACE
  labels:
    app: ${service}-service
spec:
  selector:
    app: ${service}-service
  ports:
  - protocol: TCP
    port: $port
    targetPort: $port
  type: ClusterIP
EOF
        
        # Wait for service to be ready (with shorter timeout for business services)
        kubectl rollout status deployment/${service}-service -n $NAMESPACE --timeout=180s || warn "Service $service deployment timeout, continuing..."
    done
    
    log "✅ Business services deployment completed"
}

# Deploy monitoring
deploy_monitoring() {
    log "📊 Deploying monitoring stack..."
    
    # Deploy Prometheus
    kubectl apply -f - <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: $NAMESPACE
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s
    
    scrape_configs:
      - job_name: 'kubernetes-pods'
        kubernetes_sd_configs:
        - role: pod
          namespaces:
            names:
            - $NAMESPACE
        relabel_configs:
        - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
          action: keep
          regex: true
        - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
          action: replace
          target_label: __metrics_path__
          regex: (.+)
      
      - job_name: 'codai-services'
        kubernetes_sd_configs:
        - role: endpoints
          namespaces:
            names:
            - $NAMESPACE
        relabel_configs:
        - source_labels: [__meta_kubernetes_service_name]
          action: keep
          regex: '.*-service'
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
  namespace: $NAMESPACE
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      containers:
      - name: prometheus
        image: prom/prometheus:latest
        args:
        - '--config.file=/etc/prometheus/prometheus.yml'
        - '--storage.tsdb.path=/prometheus/'
        - '--web.console.libraries=/etc/prometheus/console_libraries'
        - '--web.console.templates=/etc/prometheus/consoles'
        - '--storage.tsdb.retention.time=30d'
        - '--web.enable-lifecycle'
        ports:
        - containerPort: 9090
        volumeMounts:
        - name: prometheus-config
          mountPath: /etc/prometheus/
        - name: prometheus-storage
          mountPath: /prometheus/
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
      volumes:
      - name: prometheus-config
        configMap:
          name: prometheus-config
      - name: prometheus-storage
        emptyDir: {}
---
apiVersion: v1
kind: Service
metadata:
  name: prometheus-service
  namespace: $NAMESPACE
spec:
  selector:
    app: prometheus
  ports:
  - protocol: TCP
    port: 9090
    targetPort: 9090
  type: ClusterIP
EOF
    
    log "✅ Monitoring deployed"
}

# Setup auto-scaling
setup_autoscaling() {
    log "🔄 Setting up auto-scaling..."
    
    # HPA for API Gateway
    kubectl apply -f - <<EOF
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
  namespace: $NAMESPACE
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
EOF
    
    # HPA for core services
    for service in id memorai hub logai; do
        kubectl apply -f - <<EOF
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${service}-service-hpa
  namespace: $NAMESPACE
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${service}-service
  minReplicas: 2
  maxReplicas: 8
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
EOF
    done
    
    log "✅ Auto-scaling configured"
}

# Run comprehensive health checks
run_health_checks() {
    log "🏥 Running comprehensive health checks..."
    
    # Wait for all deployments to be ready
    info "Waiting for all deployments to be ready..."
    kubectl wait --for=condition=available deployment --all -n $NAMESPACE --timeout=600s || warn "Some deployments may not be ready"
    
    # Check API Gateway health
    API_GATEWAY_IP=$(kubectl get svc api-gateway-service -n $NAMESPACE -o jsonpath='{.spec.clusterIP}')
    if kubectl run health-check --rm -i --restart=Never --image=curlimages/curl -- curl -f http://$API_GATEWAY_IP:4000/health; then
        log "✅ API Gateway health check passed"
    else
        error "❌ API Gateway health check failed"
    fi
    
    # Check service endpoints
    SERVICES=$(kubectl get svc -n $NAMESPACE -o jsonpath='{.items[*].metadata.name}' | grep -E '.*-service$' || true)
    
    for service in $SERVICES; do
        SERVICE_IP=$(kubectl get svc $service -n $NAMESPACE -o jsonpath='{.spec.clusterIP}')
        SERVICE_PORT=$(kubectl get svc $service -n $NAMESPACE -o jsonpath='{.spec.ports[0].port}')
        
        if kubectl run health-check-$service --rm -i --restart=Never --image=curlimages/curl -- curl -f --max-time 10 http://$SERVICE_IP:$SERVICE_PORT/health 2>/dev/null; then
            info "✅ $service health check passed"
        else
            warn "⚠️  $service health check failed or timeout"
        fi
    done
    
    # Check resource usage
    info "Checking resource usage..."
    kubectl top nodes 2>/dev/null || warn "Metrics server not available"
    kubectl top pods -n $NAMESPACE 2>/dev/null || warn "Pod metrics not available"
    
    log "✅ Health checks completed"
}

# Display deployment summary
display_summary() {
    log "📋 Deployment Summary"
    
    echo ""
    echo "🚀 CODAI Ecosystem Deployment Complete!"
    echo "========================================"
    echo ""
    echo "📊 Deployed Services:"
    kubectl get deployments -n $NAMESPACE -o custom-columns=NAME:.metadata.name,READY:.status.readyReplicas,AVAILABLE:.status.availableReplicas,AGE:.metadata.creationTimestamp
    echo ""
    echo "🌐 Service Endpoints:"
    kubectl get svc -n $NAMESPACE -o custom-columns=NAME:.metadata.name,CLUSTER-IP:.spec.clusterIP,PORTS:.spec.ports[*].port
    echo ""
    echo "🔗 Access URLs:"
    echo "  • API Gateway: https://api.codai.ro"
    echo "  • Documentation: https://docs.codai.ro"
    echo "  • Monitoring: https://grafana.codai.ro"
    echo ""
    echo "📊 Resource Usage:"
    kubectl describe nodes | grep -A 5 "Allocated resources" || true
    echo ""
    echo "🎯 Next Steps:"
    echo "  1. Configure DNS records for your domain"
    echo "  2. Set up SSL certificates"
    echo "  3. Configure monitoring alerts"
    echo "  4. Run integration tests"
    echo "  5. Set up backup procedures"
    echo ""
    echo "📚 Useful Commands:"
    echo "  • View logs: kubectl logs -f deployment/api-gateway -n $NAMESPACE"
    echo "  • Scale service: kubectl scale deployment api-gateway --replicas=5 -n $NAMESPACE"
    echo "  • Update service: kubectl set image deployment/api-gateway api-gateway=$DOCKER_REGISTRY/api-gateway:new-version -n $NAMESPACE"
    echo "  • Delete deployment: kubectl delete namespace $NAMESPACE"
    echo ""
}

# Backup existing deployment
backup_deployment() {
    if [ "$BACKUP_BEFORE_DEPLOY" = true ] && kubectl get namespace $NAMESPACE &>/dev/null; then
        log "💾 Creating backup of existing deployment..."
        BACKUP_DIR="backups/$(date +%Y%m%d-%H%M%S)"
        mkdir -p $BACKUP_DIR
        kubectl get all -n $NAMESPACE -o yaml > $BACKUP_DIR/resources.yaml
        kubectl get configmaps -n $NAMESPACE -o yaml > $BACKUP_DIR/configmaps.yaml
        kubectl get secrets -n $NAMESPACE -o yaml > $BACKUP_DIR/secrets.yaml
        log "✅ Backup created in $BACKUP_DIR"
    fi
}

# Main deployment function
main() {
    echo ""
    echo "🚀 CODAI Ecosystem Production Deployment"
    echo "========================================"
    echo "Version: $VERSION"
    echo "Namespace: $NAMESPACE"
    echo "Registry: $DOCKER_REGISTRY"
    echo "Timestamp: $(date)"
    echo ""
    
    # Confirm deployment
    read -p "Do you want to proceed with the deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Deployment cancelled by user"
        exit 0
    fi
    
    # Execute deployment steps
    check_permissions
    check_prerequisites
    backup_deployment
    setup_namespace
    setup_security
    deploy_configs
    build_images
    push_images
    deploy_database
    deploy_api_gateway
    deploy_core_services
    deploy_business_services
    deploy_monitoring
    setup_autoscaling
    run_health_checks
    display_summary
    
    log "🎉 CODAI Ecosystem deployment completed successfully!"
}

# Handle script interruption
trap 'error "Deployment interrupted! You may need to clean up manually."' INT TERM

# Run main function with all arguments
main "$@"
