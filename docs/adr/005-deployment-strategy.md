# ADR 005: Deployment Strategy and Infrastructure

## Status
Accepted

## Context
CODAI essential services require a robust deployment strategy supporting local development, staging, and production environments with hybrid cloud capabilities. Current Docker Compose setup needs formalization for enterprise deployment patterns.

## Decision
We will implement a hybrid deployment strategy supporting local Docker Compose, Kubernetes orchestration, and cloud-native services with progressive deployment patterns.

## Deployment Architecture

### 1. Environment Strategy

#### Local Development
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: codai_dev
    ports:
      - "4300:5432"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7.2-alpine
    ports:
      - "8020:6379"
    command: redis-server --appendonly yes
  
  identity-service:
    build: 
      context: ./apps/id
      dockerfile: Dockerfile.dev
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://codai_user:codai_secure_2025@postgres:5432/codai_dev
    ports:
      - "8100:4004"
    volumes:
      - ./apps/id:/app
      - /app/node_modules
    depends_on:
      - postgres
      - redis
```

#### Staging Environment
```yaml
# kubernetes/staging/
apiVersion: apps/v1
kind: Deployment
metadata:
  name: identity-service-staging
  namespace: codai-staging
spec:
  replicas: 2
  selector:
    matchLabels:
      app: identity-service
      env: staging
  template:
    metadata:
      labels:
        app: identity-service
        env: staging
    spec:
      containers:
      - name: identity-service
        image: codai/identity-service:staging-latest
        ports:
        - containerPort: 4004
        env:
        - name: NODE_ENV
          value: "staging"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-credentials
              key: staging-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "200m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 4004
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/ready
            port: 4004
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### Production Environment
```yaml
# kubernetes/production/
apiVersion: apps/v1
kind: Deployment
metadata:
  name: identity-service-prod
  namespace: codai-production
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  selector:
    matchLabels:
      app: identity-service
      env: production
  template:
    metadata:
      labels:
        app: identity-service
        env: production
    spec:
      containers:
      - name: identity-service
        image: codai/identity-service:v1.0.0
        ports:
        - containerPort: 4004
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-credentials
              key: production-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        securityContext:
          readOnlyRootFilesystem: true
          runAsNonRoot: true
          runAsUser: 1001
          allowPrivilegeEscalation: false
```

### 2. Progressive Deployment Pattern

#### Canary Deployment Strategy
```yaml
# Argo Rollouts configuration
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: identity-service-rollout
spec:
  replicas: 10
  strategy:
    canary:
      steps:
      - setWeight: 10   # 10% traffic to new version
      - pause:
          duration: 2m  # Wait 2 minutes
      - setWeight: 25   # 25% traffic
      - pause:
          duration: 5m
      - setWeight: 50   # 50% traffic
      - pause:
          duration: 10m
      - setWeight: 75   # 75% traffic
      - pause:
          duration: 10m
      - setWeight: 100  # Full rollout
      
      trafficRouting:
        nginx:
          stableService: identity-service-stable
          canaryService: identity-service-canary
      
      analysis:
        templates:
        - templateName: success-rate
        args:
        - name: service-name
          value: identity-service
        - name: prometheus-url
          value: http://prometheus:9090
```

#### Blue-Green Deployment
```yaml
# For critical services requiring zero-downtime
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: bancai-service-rollout
spec:
  replicas: 5
  strategy:
    blueGreen:
      activeService: bancai-service-active
      previewService: bancai-service-preview
      autoPromotionEnabled: false
      scaleDownDelaySeconds: 30
      prePromotionAnalysis:
        templates:
        - templateName: health-check
        - templateName: load-test
        args:
        - name: service-url
          value: http://bancai-service-preview
      postPromotionAnalysis:
        templates:
        - templateName: success-rate
        args:
        - name: service-name
          value: bancai-service
```

### 3. Infrastructure as Code

#### Terraform Configuration
```hcl
# infrastructure/main.tf
module "kubernetes_cluster" {
  source = "./modules/kubernetes"
  
  cluster_name = "codai-cluster"
  node_pools = {
    system = {
      node_count = 3
      vm_size    = "Standard_D2s_v3"
      labels     = { "node-type" = "system" }
    }
    
    applications = {
      node_count = 5
      vm_size    = "Standard_D4s_v3"
      labels     = { "node-type" = "applications" }
      taints     = []
    }
    
    databases = {
      node_count = 3
      vm_size    = "Standard_D8s_v3"
      labels     = { "node-type" = "databases" }
      taints     = [
        {
          key    = "database-node"
          value  = "true"
          effect = "NoSchedule"
        }
      ]
    }
  }
}

module "database" {
  source = "./modules/database"
  
  postgres_config = {
    version = "15"
    tier    = "db-custom-4-16384"
    storage_size = 100
    backup_retention = 7
    high_availability = true
  }
  
  redis_config = {
    memory_size = 4
    version     = "7.2"
    persistence = true
    clustering  = true
  }
}

module "networking" {
  source = "./modules/networking"
  
  vpc_cidr = "10.0.0.0/16"
  subnets = {
    public  = ["10.0.1.0/24", "10.0.2.0/24"]
    private = ["10.0.10.0/24", "10.0.11.0/24"]
    data    = ["10.0.20.0/24", "10.0.21.0/24"]
  }
  
  security_groups = {
    web = {
      ingress = [
        { port = 80, protocol = "tcp", cidr = "0.0.0.0/0" },
        { port = 443, protocol = "tcp", cidr = "0.0.0.0/0" }
      ]
    }
    
    api = {
      ingress = [
        { port = 8010, protocol = "tcp", cidr = "10.0.0.0/16" }
      ]
    }
    
    database = {
      ingress = [
        { port = 5432, protocol = "tcp", cidr = "10.0.10.0/24" },
        { port = 6379, protocol = "tcp", cidr = "10.0.10.0/24" }
      ]
    }
  }
}
```

### 4. CI/CD Pipeline

#### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy CODAI Services

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [identity, gateway, hub, memorai-mcp, bancai]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'pnpm'
    
    - name: Install dependencies
      run: pnpm install --frozen-lockfile
    
    - name: Type checking
      run: pnpm typecheck --filter ${{ matrix.service }}
    
    - name: Lint
      run: pnpm lint --filter ${{ matrix.service }}
    
    - name: Unit tests
      run: pnpm test:unit --filter ${{ matrix.service }}
      env:
        NODE_ENV: test
    
    - name: Integration tests
      run: pnpm test:integration --filter ${{ matrix.service }}
      env:
        DATABASE_URL: postgresql://test:test@localhost:5432/test_db
        REDIS_URL: redis://localhost:6379
    
    - name: Security scan
      run: |
        pnpm audit --audit-level moderate
        npx semgrep --config=auto apps/${{ matrix.service }}/

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
    
    strategy:
      matrix:
        service: [identity, gateway, hub, memorai-mcp, bancai]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Login to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ghcr.io/codai-ecosystem/${{ matrix.service }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
    
    - name: Build and push
      uses: docker/build-push-action@v5
      with:
        context: .
        file: ./apps/${{ matrix.service }}/Dockerfile
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: staging
    
    steps:
    - name: Deploy to staging
      uses: azure/k8s-deploy@v1
      with:
        manifests: |
          kubernetes/staging/
        kubeconfig: ${{ secrets.STAGING_KUBECONFIG }}

  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - name: Deploy to production
      uses: azure/k8s-deploy@v1
      with:
        manifests: |
          kubernetes/production/
        kubeconfig: ${{ secrets.PRODUCTION_KUBECONFIG }}
    
    - name: Run E2E tests
      run: |
        pnpm test:e2e --baseUrl=https://api.codai.com
```

### 5. Monitoring and Observability

#### Monitoring Stack
```yaml
# monitoring/prometheus.yml
apiVersion: monitoring.coreos.com/v1
kind: Prometheus
metadata:
  name: codai-prometheus
spec:
  serviceAccountName: prometheus
  replicas: 2
  retention: 30d
  storage:
    volumeClaimTemplate:
      spec:
        storageClassName: fast-ssd
        resources:
          requests:
            storage: 100Gi
  
  serviceMonitorSelector:
    matchLabels:
      app: codai-services
  
  ruleSelector:
    matchLabels:
      app: codai-alerts

---
# monitoring/grafana.yml
apiVersion: integreatly.org/v1alpha1
kind: Grafana
metadata:
  name: codai-grafana
spec:
  config:
    auth:
      disable_login_form: false
    security:
      admin_user: admin
      admin_password: ${{ secrets.GRAFANA_PASSWORD }}
  
  dashboardLabelSelector:
    - matchExpressions:
        - key: app
          operator: In
          values: [codai-dashboards]
```

#### Health Check Endpoints
```typescript
// Standardized health check implementation
export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  timestamp: string;
  checks: {
    database?: HealthCheck;
    redis?: HealthCheck;
    externalServices?: HealthCheck[];
  };
}

export interface HealthCheck {
  status: 'up' | 'down';
  responseTime?: number;
  error?: string;
  lastChecked: string;
}
```

### 6. Disaster Recovery

#### Backup Strategy
```yaml
# backup/cronjob.yml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: database-backup
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: postgres-backup
            image: postgres:15-alpine
            command:
            - /bin/bash
            - -c
            - |
              pg_dump $DATABASE_URL | gzip > /backup/codai_$(date +%Y%m%d_%H%M%S).sql.gz
              aws s3 cp /backup/ s3://codai-backups/database/ --recursive
            env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: database-credentials
                  key: url
            - name: AWS_ACCESS_KEY_ID
              valueFrom:
                secretKeyRef:
                  name: aws-credentials
                  key: access-key-id
            - name: AWS_SECRET_ACCESS_KEY
              valueFrom:
                secretKeyRef:
                  name: aws-credentials
                  key: secret-access-key
          restartPolicy: OnFailure
```

#### Recovery Procedures
1. **RTO (Recovery Time Objective)**: 4 hours
2. **RPO (Recovery Point Objective)**: 1 hour
3. **Automated failover**: Cross-region database replication
4. **Manual procedures**: Detailed runbooks for each service
5. **Testing**: Monthly disaster recovery drills

### 7. Cost Optimization

#### Resource Allocation
```yaml
# Resource requests and limits per service
resource_profiles:
  identity_service:
    requests: { memory: 256Mi, cpu: 200m }
    limits: { memory: 512Mi, cpu: 500m }
    
  api_gateway:
    requests: { memory: 512Mi, cpu: 500m }
    limits: { memory: 1Gi, cpu: 1000m }
    
  memorai_mcp:
    requests: { memory: 1Gi, cpu: 1000m }
    limits: { memory: 2Gi, cpu: 2000m }
    
  bancai_service:
    requests: { memory: 512Mi, cpu: 500m }
    limits: { memory: 1Gi, cpu: 1000m }
```

#### Auto-scaling Configuration
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: identity-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: identity-service
  minReplicas: 2
  maxReplicas: 20
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
```

## Implementation Timeline

### Phase 1: Foundation (Week 1-2)
- Set up staging and production Kubernetes clusters
- Implement basic CI/CD pipeline
- Configure monitoring and logging infrastructure
- Establish backup procedures

### Phase 2: Service Deployment (Week 3-4)
- Deploy core services to staging environment
- Implement health checks and service discovery
- Set up load balancing and traffic routing
- Configure auto-scaling policies

### Phase 3: Progressive Deployment (Week 5-6)
- Implement canary deployment for non-critical services
- Set up blue-green deployment for critical services
- Add deployment verification and rollback capabilities
- Configure deployment notifications

### Phase 4: Production Hardening (Week 7-8)
- Implement disaster recovery procedures
- Set up cross-region replication
- Configure advanced monitoring and alerting
- Conduct load testing and performance tuning

### Phase 5: Optimization (Week 9-10)
- Implement cost optimization strategies
- Set up advanced observability and tracing
- Configure automated scaling policies
- Document operational procedures

## Success Metrics
- Deployment frequency: Daily for staging, weekly for production
- Lead time for changes: < 2 hours from commit to production
- Mean time to recovery (MTTR): < 15 minutes
- Change failure rate: < 5%
- Service availability: 99.9% uptime SLA
- Resource utilization: 70-80% CPU/memory efficiency