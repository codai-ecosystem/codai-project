# 🚀 CODAI Ecosystem Production Deployment

**Complete production deployment system for all CODAI ecosystem services.**

## 📋 Deployment Overview

The CODAI ecosystem production deployment includes:
- **32+ Applications**: All CODAI services deployed with high availability
- **Docker Containers**: Containerized deployment for consistency and scalability
- **Kubernetes Orchestration**: Auto-scaling, self-healing, and load balancing
- **API Gateway**: Centralized routing and traffic management
- **Database Clusters**: High-availability PostgreSQL and Redis clusters
- **Monitoring Stack**: Comprehensive observability and alerting
- **CI/CD Pipelines**: Automated testing, building, and deployment

## 🏗️ Production Architecture

```
                    ┌─────────────────────┐
                    │    Load Balancer    │
                    │   (NGINX/Cloudflare)│
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │    API Gateway      │
                    │    (Port 4000)      │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────▼────────┐  ┌──────────▼──────────┐  ┌───────▼────────┐
│  Auth Services │  │ Business Services   │  │ Infra Services │
│  - ID (4001)   │  │ - CODAI (4003)     │  │ - HUB (4020)   │
│  - JWT Mgmt    │  │ - BANCAI (4005)    │  │ - LOGAI (4021) │
│                │  │ - CUMPARAI (4007)  │  │ - Monitoring   │
└────────────────┘  │ - STUDIAI (4009)   │  └────────────────┘
                    │ - FABRICAI (4011)  │
                    │ - + 20 more...     │
                    └────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Data Layer        │
                    │ - PostgreSQL HA     │
                    │ - Redis Cluster     │
                    │ - File Storage      │
                    └─────────────────────┘
```

## 🐳 Docker Configuration

### Base Production Dockerfile

```dockerfile
# Dockerfile.production
FROM node:18-alpine as builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Production stage
FROM node:18-alpine as production

# Create app user
RUN addgroup -g 1001 -S codai && adduser -S codai -u 1001

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --prod --frozen-lockfile && pnpm store prune

# Copy built application
COPY --from=builder --chown=codai:codai /app/dist ./dist
COPY --from=builder --chown=codai:codai /app/public ./public

# Copy configuration files
COPY --chown=codai:codai codai.config.json ./
COPY --chown=codai:codai deployment/production/.env.production ./.env

# Install CODAI CLI
RUN pnpm add -g @codai/cli

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3000}/health || exit 1

# Switch to non-root user
USER codai

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/index.js"]
```

### Service-Specific Dockerfiles

```dockerfile
# apps/id/Dockerfile
FROM node:18-alpine as production
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application
COPY dist/ ./dist/
COPY public/ ./public/

# Environment
ENV NODE_ENV=production
ENV PORT=4001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:4001/health || exit 1

EXPOSE 4001
CMD ["node", "dist/index.js"]
```

## ☸️ Kubernetes Deployment

### Namespace Configuration

```yaml
# deployment/production/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: codai-production
  labels:
    name: codai-production
    environment: production
```

### ConfigMaps and Secrets

```yaml
# deployment/production/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: codai-config
  namespace: codai-production
data:
  NODE_ENV: "production"
  API_GATEWAY_URL: "https://api.codai.ro"
  WS_GATEWAY_URL: "wss://api.codai.ro/ws"
  CORS_ORIGINS: "https://codai.ro,https://app.codai.ro"
  RATE_LIMIT_WINDOW: "60000"
  RATE_LIMIT_MAX: "1000"
  JWT_EXPIRES_IN: "24h"
  CACHE_TTL: "300"
  
---
apiVersion: v1
kind: Secret
metadata:
  name: codai-secrets
  namespace: codai-production
type: Opaque
data:
  DATABASE_URL: <base64-encoded-database-url>
  REDIS_URL: <base64-encoded-redis-url>
  JWT_SECRET: <base64-encoded-jwt-secret>
  API_KEYS: <base64-encoded-api-keys>
  SMTP_PASSWORD: <base64-encoded-smtp-password>
  AWS_SECRET_ACCESS_KEY: <base64-encoded-aws-secret>
```

### API Gateway Deployment

```yaml
# deployment/production/api-gateway.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: codai-production
  labels:
    app: api-gateway
    tier: gateway
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
        tier: gateway
    spec:
      containers:
      - name: api-gateway
        image: codai/api-gateway:latest
        ports:
        - containerPort: 4000
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: codai-config
              key: NODE_ENV
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: codai-secrets
              key: DATABASE_URL
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: codai-secrets
              key: REDIS_URL
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
        readinessProbe:
          httpGet:
            path: /ready
            port: 4000
          initialDelaySeconds: 5
          periodSeconds: 5
        volumeMounts:
        - name: config-volume
          mountPath: /app/config
          readOnly: true
      volumes:
      - name: config-volume
        configMap:
          name: codai-config
      imagePullSecrets:
      - name: codai-registry-secret

---
apiVersion: v1
kind: Service
metadata:
  name: api-gateway-service
  namespace: codai-production
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
  type: ClusterIP

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-gateway-ingress
  namespace: codai-production
  annotations:
    kubernetes.io/ingress.class: "nginx"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/use-regex: "true"
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
```

### Core Services Deployment

```yaml
# deployment/production/core-services.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: id-service
  namespace: codai-production
  labels:
    app: id-service
    tier: core
spec:
  replicas: 2
  selector:
    matchLabels:
      app: id-service
  template:
    metadata:
      labels:
        app: id-service
        tier: core
    spec:
      containers:
      - name: id-service
        image: codai/id-service:latest
        ports:
        - containerPort: 4001
        envFrom:
        - configMapRef:
            name: codai-config
        - secretRef:
            name: codai-secrets
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
            port: 4001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 4001
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: id-service
  namespace: codai-production
spec:
  selector:
    app: id-service
  ports:
  - protocol: TCP
    port: 4001
    targetPort: 4001
  type: ClusterIP

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: memorai-service
  namespace: codai-production
  labels:
    app: memorai-service
    tier: core
spec:
  replicas: 3
  selector:
    matchLabels:
      app: memorai-service
  template:
    metadata:
      labels:
        app: memorai-service
        tier: core
    spec:
      containers:
      - name: memorai-service
        image: codai/memorai-service:latest
        ports:
        - containerPort: 4002
        envFrom:
        - configMapRef:
            name: codai-config
        - secretRef:
            name: codai-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "300m"
          limits:
            memory: "1Gi"
            cpu: "600m"
        livenessProbe:
          httpGet:
            path: /health
            port: 4002
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 4002
          initialDelaySeconds: 10
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: memorai-service
  namespace: codai-production
spec:
  selector:
    app: memorai-service
  ports:
  - protocol: TCP
    port: 4002
    targetPort: 4002
  type: ClusterIP
```

## 🗄️ Database Deployment

### PostgreSQL High Availability

```yaml
# deployment/production/postgresql-ha.yaml
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: postgresql-cluster
  namespace: codai-production
spec:
  instances: 3
  
  postgresql:
    parameters:
      max_connections: "200"
      shared_buffers: "256MB"
      effective_cache_size: "1GB"
      work_mem: "4MB"
      maintenance_work_mem: "64MB"
      checkpoint_completion_target: "0.9"
      wal_buffers: "16MB"
      default_statistics_target: "100"
      random_page_cost: "1.1"
      
  bootstrap:
    initdb:
      database: codai_production
      owner: codai
      secret:
        name: postgresql-credentials
        
  storage:
    size: 100Gi
    storageClass: fast-ssd
    
  monitoring:
    enabled: true
    
  backup:
    retentionPolicy: "30d"
    barmanObjectStore:
      destinationPath: "s3://codai-backups/postgresql"
      s3Credentials:
        accessKeyId:
          name: backup-credentials
          key: ACCESS_KEY_ID
        secretAccessKey:
          name: backup-credentials
          key: SECRET_ACCESS_KEY
        region:
          name: backup-credentials
          key: AWS_REGION

---
apiVersion: v1
kind: Secret
metadata:
  name: postgresql-credentials
  namespace: codai-production
type: kubernetes.io/basic-auth
data:
  username: <base64-encoded-username>
  password: <base64-encoded-password>
```

### Redis Cluster

```yaml
# deployment/production/redis-cluster.yaml
apiVersion: redis.redis.opstreelabs.in/v1beta1
kind: RedisCluster
metadata:
  name: redis-cluster
  namespace: codai-production
spec:
  clusterSize: 6
  clusterVersion: v7.0
  persistenceEnabled: true
  redisExporter:
    enabled: true
    image: quay.io/opstree/redis-exporter:v1.44.0
  storage:
    volumeClaimTemplate:
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 50Gi
        storageClassName: fast-ssd
  resources:
    requests:
      cpu: 200m
      memory: 512Mi
    limits:
      cpu: 400m
      memory: 1Gi
  redisConfig:
    save: "900 1 300 10 60 10000"
    maxmemory-policy: "allkeys-lru"
    timeout: "300"
    tcp-keepalive: "60"
```

## 📊 Monitoring Stack

### Prometheus Configuration

```yaml
# deployment/production/monitoring.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
  namespace: codai-production
  labels:
    app: prometheus
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
        persistentVolumeClaim:
          claimName: prometheus-storage

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: codai-production
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s
    
    rule_files:
      - "/etc/prometheus/rules/*.yml"
    
    scrape_configs:
      - job_name: 'kubernetes-pods'
        kubernetes_sd_configs:
        - role: pod
        relabel_configs:
        - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
          action: keep
          regex: true
        - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
          action: replace
          target_label: __metrics_path__
          regex: (.+)
        - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
          action: replace
          regex: ([^:]+)(?::\d+)?;(\d+)
          replacement: $1:$2
          target_label: __address__
          
      - job_name: 'codai-services'
        static_configs:
        - targets:
          - 'api-gateway-service:4000'
          - 'id-service:4001'
          - 'memorai-service:4002'
        metrics_path: '/metrics'
        scrape_interval: 30s
        
    alerting:
      alertmanagers:
      - static_configs:
        - targets:
          - 'alertmanager:9093'
```

### Grafana Dashboard

```yaml
# deployment/production/grafana.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: grafana
  namespace: codai-production
  labels:
    app: grafana
spec:
  replicas: 1
  selector:
    matchLabels:
      app: grafana
  template:
    metadata:
      labels:
        app: grafana
    spec:
      containers:
      - name: grafana
        image: grafana/grafana:latest
        ports:
        - containerPort: 3000
        env:
        - name: GF_SECURITY_ADMIN_PASSWORD
          valueFrom:
            secretKeyRef:
              name: grafana-secrets
              key: admin-password
        volumeMounts:
        - name: grafana-storage
          mountPath: /var/lib/grafana
        - name: grafana-config
          mountPath: /etc/grafana/provisioning
        resources:
          requests:
            memory: "256Mi"
            cpu: "200m"
          limits:
            memory: "512Mi"
            cpu: "400m"
      volumes:
      - name: grafana-storage
        persistentVolumeClaim:
          claimName: grafana-storage
      - name: grafana-config
        configMap:
          name: grafana-config

---
apiVersion: v1
kind: Service
metadata:
  name: grafana-service
  namespace: codai-production
spec:
  selector:
    app: grafana
  ports:
  - protocol: TCP
    port: 3000
    targetPort: 3000
  type: ClusterIP
```

## 🔧 Deployment Scripts

### Production Deployment Script

```bash
#!/bin/bash
# deployment/scripts/deploy-production.sh

set -e

echo "🚀 Starting CODAI Ecosystem Production Deployment"

# Configuration
NAMESPACE="codai-production"
DOCKER_REGISTRY="registry.codai.ro"
VERSION=$(git describe --tags --always)

# Functions
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if kubectl is available
    if ! command -v kubectl &> /dev/null; then
        log "❌ kubectl is not installed"
        exit 1
    fi
    
    # Check if cluster is reachable
    if ! kubectl cluster-info &> /dev/null; then
        log "❌ Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    # Check if namespace exists
    if ! kubectl get namespace $NAMESPACE &> /dev/null; then
        log "Creating namespace $NAMESPACE..."
        kubectl create namespace $NAMESPACE
    fi
    
    log "✅ Prerequisites check passed"
}

build_images() {
    log "Building Docker images..."
    
    # Build base images
    docker build -t $DOCKER_REGISTRY/api-gateway:$VERSION \
                 -f deployment/docker/api-gateway.Dockerfile .
    
    # Build service images
    for service in id memorai hub logai codai bancai cumparai; do
        log "Building $service service..."
        docker build -t $DOCKER_REGISTRY/$service-service:$VERSION \
                     -f apps/$service/Dockerfile ./apps/$service
    done
    
    log "✅ Docker images built successfully"
}

push_images() {
    log "Pushing Docker images to registry..."
    
    # Push all images
    docker push $DOCKER_REGISTRY/api-gateway:$VERSION
    
    for service in id memorai hub logai codai bancai cumparai; do
        docker push $DOCKER_REGISTRY/$service-service:$VERSION
    done
    
    log "✅ Docker images pushed successfully"
}

deploy_infrastructure() {
    log "Deploying infrastructure components..."
    
    # Deploy namespace and RBAC
    kubectl apply -f deployment/production/namespace.yaml
    kubectl apply -f deployment/production/rbac.yaml
    
    # Deploy secrets and configmaps
    kubectl apply -f deployment/production/configmap.yaml
    kubectl apply -f deployment/production/secrets.yaml
    
    # Deploy database
    log "Deploying PostgreSQL cluster..."
    kubectl apply -f deployment/production/postgresql-ha.yaml
    
    # Wait for database to be ready
    kubectl wait --for=condition=ready pod -l app=postgresql-cluster -n $NAMESPACE --timeout=300s
    
    # Deploy Redis cluster
    log "Deploying Redis cluster..."
    kubectl apply -f deployment/production/redis-cluster.yaml
    
    # Wait for Redis to be ready
    kubectl wait --for=condition=ready pod -l app=redis-cluster -n $NAMESPACE --timeout=300s
    
    log "✅ Infrastructure deployed successfully"
}

deploy_services() {
    log "Deploying CODAI services..."
    
    # Update image versions in deployment files
    for file in deployment/production/*.yaml; do
        sed -i "s|:latest|:$VERSION|g" $file
    done
    
    # Deploy API Gateway
    kubectl apply -f deployment/production/api-gateway.yaml
    kubectl rollout status deployment/api-gateway -n $NAMESPACE --timeout=300s
    
    # Deploy core services
    kubectl apply -f deployment/production/core-services.yaml
    kubectl rollout status deployment/id-service -n $NAMESPACE --timeout=300s
    kubectl rollout status deployment/memorai-service -n $NAMESPACE --timeout=300s
    
    # Deploy business services
    kubectl apply -f deployment/production/business-services.yaml
    
    # Wait for all services to be ready
    for service in codai bancai cumparai studiai fabricai; do
        kubectl rollout status deployment/$service-service -n $NAMESPACE --timeout=300s
    done
    
    log "✅ Services deployed successfully"
}

deploy_monitoring() {
    log "Deploying monitoring stack..."
    
    # Deploy Prometheus
    kubectl apply -f deployment/production/monitoring.yaml
    kubectl rollout status deployment/prometheus -n $NAMESPACE --timeout=300s
    
    # Deploy Grafana
    kubectl apply -f deployment/production/grafana.yaml
    kubectl rollout status deployment/grafana -n $NAMESPACE --timeout=300s
    
    log "✅ Monitoring stack deployed successfully"
}

run_health_checks() {
    log "Running health checks..."
    
    # Wait for all pods to be ready
    kubectl wait --for=condition=ready pod -l tier=gateway -n $NAMESPACE --timeout=300s
    kubectl wait --for=condition=ready pod -l tier=core -n $NAMESPACE --timeout=300s
    kubectl wait --for=condition=ready pod -l tier=business -n $NAMESPACE --timeout=300s
    
    # Test API Gateway
    API_GATEWAY_IP=$(kubectl get svc api-gateway-service -n $NAMESPACE -o jsonpath='{.spec.clusterIP}')
    if curl -f http://$API_GATEWAY_IP:4000/health; then
        log "✅ API Gateway health check passed"
    else
        log "❌ API Gateway health check failed"
        exit 1
    fi
    
    # Test core services
    for service in id memorai hub; do
        SERVICE_IP=$(kubectl get svc $service-service -n $NAMESPACE -o jsonpath='{.spec.clusterIP}')
        if curl -f http://$SERVICE_IP:400$([[ $service == "id" ]] && echo "1" || [[ $service == "memorai" ]] && echo "2" || echo "3")/health; then
            log "✅ $service service health check passed"
        else
            log "❌ $service service health check failed"
            exit 1
        fi
    done
    
    log "✅ All health checks passed"
}

# Main deployment flow
main() {
    log "Starting production deployment with version: $VERSION"
    
    check_prerequisites
    build_images
    push_images
    deploy_infrastructure
    deploy_services
    deploy_monitoring
    run_health_checks
    
    log "🎉 Production deployment completed successfully!"
    log "📊 Grafana Dashboard: https://grafana.codai.ro"
    log "📈 Prometheus: https://prometheus.codai.ro"
    log "🌐 API Gateway: https://api.codai.ro"
    log "🏠 Main App: https://codai.ro"
}

# Run deployment
main "$@"
```

### Rollback Script

```bash
#!/bin/bash
# deployment/scripts/rollback-production.sh

set -e

NAMESPACE="codai-production"
VERSION=$1

if [ -z "$VERSION" ]; then
    echo "Usage: $0 <version>"
    echo "Available versions:"
    kubectl rollout history deployment/api-gateway -n $NAMESPACE
    exit 1
fi

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "🔄 Starting rollback to version: $VERSION"

# Rollback API Gateway
kubectl rollout undo deployment/api-gateway -n $NAMESPACE --to-revision=$VERSION
kubectl rollout status deployment/api-gateway -n $NAMESPACE --timeout=300s

# Rollback core services
for service in id memorai hub logai; do
    log "Rolling back $service service..."
    kubectl rollout undo deployment/$service-service -n $NAMESPACE --to-revision=$VERSION
    kubectl rollout status deployment/$service-service -n $NAMESPACE --timeout=300s
done

# Rollback business services
for service in codai bancai cumparai studiai fabricai; do
    log "Rolling back $service service..."
    kubectl rollout undo deployment/$service-service -n $NAMESPACE --to-revision=$VERSION
    kubectl rollout status deployment/$service-service -n $NAMESPACE --timeout=300s
done

log "✅ Rollback completed successfully"
```

### Database Migration Script

```bash
#!/bin/bash
# deployment/scripts/migrate-database.sh

set -e

NAMESPACE="codai-production"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

run_migrations() {
    log "🗄️  Running database migrations..."
    
    # Get database connection details
    DB_HOST=$(kubectl get secret postgresql-credentials -n $NAMESPACE -o jsonpath='{.data.host}' | base64 --decode)
    DB_USER=$(kubectl get secret postgresql-credentials -n $NAMESPACE -o jsonpath='{.data.username}' | base64 --decode)
    DB_PASS=$(kubectl get secret postgresql-credentials -n $NAMESPACE -o jsonpath='{.data.password}' | base64 --decode)
    DB_NAME="codai_production"
    
    # Run migration job
    kubectl run migration-job --rm -i --restart=Never \
        --image=codai/migration-runner:latest \
        --env="DATABASE_URL=postgresql://$DB_USER:$DB_PASS@$DB_HOST:5432/$DB_NAME" \
        --env="RUN_MIGRATIONS=true" \
        --namespace=$NAMESPACE \
        -- npm run migrate
    
    log "✅ Database migrations completed"
}

backup_database() {
    log "💾 Creating database backup..."
    
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    
    kubectl run backup-job --rm -i --restart=Never \
        --image=postgres:13 \
        --namespace=$NAMESPACE \
        -- pg_dump $DATABASE_URL > /backups/$BACKUP_NAME.sql
    
    log "✅ Database backup created: $BACKUP_NAME"
}

main() {
    backup_database
    run_migrations
}

main "$@"
```

## 🔒 Security Configuration

### Network Policies

```yaml
# deployment/production/network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: codai-network-policy
  namespace: codai-production
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
  - from:
    - podSelector:
        matchLabels:
          tier: gateway
    ports:
    - protocol: TCP
      port: 4000
  egress:
  - to:
    - podSelector:
        matchLabels:
          tier: core
  - to:
    - podSelector:
        matchLabels:
          tier: business
  - to: []
    ports:
    - protocol: TCP
      port: 443
    - protocol: TCP
      port: 53
    - protocol: UDP
      port: 53
```

### Pod Security Policies

```yaml
# deployment/production/pod-security-policy.yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: codai-psp
  namespace: codai-production
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
```

## 📈 Auto-scaling Configuration

```yaml
# deployment/production/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
  namespace: codai-production
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

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: memorai-hpa
  namespace: codai-production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: memorai-service
  minReplicas: 3
  maxReplicas: 15
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## 🚀 Quick Deployment Commands

```bash
# Deploy entire production environment
./deployment/scripts/deploy-production.sh

# Deploy specific service
kubectl apply -f deployment/production/api-gateway.yaml

# Scale service
kubectl scale deployment api-gateway --replicas=5 -n codai-production

# Check deployment status
kubectl get deployments -n codai-production

# View logs
kubectl logs -f deployment/api-gateway -n codai-production

# Run database migrations
./deployment/scripts/migrate-database.sh

# Rollback to previous version
./deployment/scripts/rollback-production.sh 2

# Emergency stop all services
kubectl scale deployment --all --replicas=0 -n codai-production

# Full restart
kubectl rollout restart deployment --all -n codai-production
```

## 📊 Monitoring URLs

- **Grafana Dashboard**: https://grafana.codai.ro
- **Prometheus Metrics**: https://prometheus.codai.ro
- **API Gateway Health**: https://api.codai.ro/health
- **Service Status**: https://status.codai.ro

---

**Last Updated**: July 19, 2025  
**Deployment Version**: 2.0.0  
**Status**: Production Ready ✅
