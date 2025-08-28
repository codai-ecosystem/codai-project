# ADR-004: Hybrid Cloud Deployment Strategy

**Status**: Accepted  
**Date**: 2025-08-27  
**Deciders**: Platform Team, DevOps Team  
**Technical Story**: Enable continuous delivery with hybrid cloud/edge deployment

## Context and Problem Statement

CODAI requires a deployment strategy that supports:
- Local development with production parity
- Multi-cloud deployment (Azure, AWS, GCP)
- Edge computing for AI inference
- Zero-downtime deployments with rollback capability
- Compliance with data residency requirements

## Decision Drivers

- **Scalability**: Auto-scaling based on AI workload demand
- **Availability**: 99.9% uptime with disaster recovery
- **Performance**: <3s AI inference response times globally
- **Compliance**: Data sovereignty and regulatory requirements
- **Cost Optimization**: Intelligent resource allocation
- **Developer Experience**: Seamless local-to-production workflow

## Deployment Architecture Decision

### Multi-Cloud Strategy with Edge Distribution

```yaml
Deployment Tiers:
  
  Tier 1 - Core Services (Multi-Cloud):
    - Gateway, Identity, Hub services
    - PostgreSQL with read replicas
    - Redis cluster for caching
    - Deployment: Azure (Primary), AWS (DR)
  
  Tier 2 - AI/ML Services (Hybrid):
    - RomAI inference engines
    - Model serving infrastructure  
    - GPU/TPU compute nodes
    - Deployment: Cloud + Edge nodes
  
  Tier 3 - Frontend Applications (CDN):
    - Next.js static assets
    - Global content delivery
    - Edge server-side rendering
    - Deployment: Vercel/Cloudflare
  
  Tier 4 - Data Services (Regional):
    - Customer data stores
    - Audit logs and compliance data
    - Backup and archival systems
    - Deployment: Region-specific clouds
```

### Container Orchestration Strategy

#### Production: Kubernetes with Helm

```yaml
# Production cluster configuration
apiVersion: v1
kind: Namespace
metadata:
  name: codai-production
  labels:
    environment: production
    tier: core-services
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: codai-gateway
  namespace: codai-production
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: gateway
      tier: core
  template:
    metadata:
      labels:
        app: gateway
        tier: core
        version: v1.0.0
    spec:
      containers:
      - name: gateway
        image: codai/gateway:v1.0.0
        ports:
        - containerPort: 4003
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-credentials
              key: url
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 4003
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/ready
            port: 4003
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### Development: Docker Compose (Current)

```yaml
# Enhanced docker-compose.yml for local development
services:
  gateway:
    build:
      context: ./apps/gateway
      dockerfile: Dockerfile.dev
      target: development
    ports:
      - "4003:4003"
    environment:
      NODE_ENV: development
      HOT_RELOAD: "true"
    volumes:
      - ./apps/gateway:/app
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    develop:
      watch:
        - path: ./apps/gateway/src
          action: sync
          target: /app/src
        - path: ./apps/gateway/package.json
          action: rebuild
```

### CI/CD Pipeline Implementation

#### Multi-Stage Pipeline (Target: <10 minutes)

```yaml
name: "🚀 Production Deployment Pipeline"

on:
  push:
    branches: [main]
    tags: ['v*']
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  NODE_VERSION: '18'
  PNPM_VERSION: '8'

jobs:
  # Stage 1: Fast Feedback (2-3 minutes)
  quality-gate:
    name: "Quality Gate"
    runs-on: ubuntu-latest
    timeout-minutes: 5
    outputs:
      affected: ${{ steps.affected.outputs.projects }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Detect affected projects
        id: affected
        run: |
          affected=$(pnpm nx affected:projects --plain)
          echo "projects=$affected" >> $GITHUB_OUTPUT
      
      - name: Lint affected projects
        run: pnpm nx affected --target=lint --parallel=3
      
      - name: Type check
        run: pnpm nx affected --target=type-check --parallel=3
      
      - name: Unit tests
        run: pnpm nx affected --target=test --parallel=3 --coverage

  # Stage 2: Security & Build (3-4 minutes)
  security-build:
    name: "Security & Build"
    needs: quality-gate
    runs-on: ubuntu-latest
    timeout-minutes: 8
    strategy:
      matrix:
        project: ${{ fromJSON(needs.quality-gate.outputs.affected) }}
    steps:
      - uses: actions/checkout@v4
      
      - name: Security audit
        run: |
          pnpm audit --audit-level moderate
          docker run --rm -v "$PWD:/app" \
            securecodewarrior/docker-security-scanner /app
      
      - name: Build project
        run: pnpm nx build ${{ matrix.project }}
      
      - name: Build Docker image
        run: |
          docker build -t $REGISTRY/codai/${{ matrix.project }}:${{ github.sha }} \
            ./apps/${{ matrix.project }}
      
      - name: Scan container image
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: $REGISTRY/codai/${{ matrix.project }}:${{ github.sha }}
          format: 'sarif'
          output: 'trivy-results.sarif'

  # Stage 3: Integration Tests (2-3 minutes)
  integration-tests:
    name: "Integration & E2E Tests"
    needs: [quality-gate, security-build]
    runs-on: ubuntu-latest
    timeout-minutes: 6
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup test environment
        run: |
          docker-compose -f docker-compose.test.yml up -d
          sleep 15  # Wait for services
      
      - name: Run integration tests
        run: pnpm test:integration --parallel=2
      
      - name: Run E2E tests
        run: |
          pnpm exec playwright install --with-deps
          pnpm test:e2e --workers=2
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: |
            test-results/
            coverage/

  # Stage 4: Deploy (1-2 minutes)
  deploy:
    name: "Deploy to ${{ matrix.environment }}"
    needs: [quality-gate, security-build, integration-tests]
    if: github.ref == 'refs/heads/main' || startsWith(github.ref, 'refs/tags/v')
    runs-on: ubuntu-latest
    timeout-minutes: 5
    strategy:
      matrix:
        environment: [staging, production]
        exclude:
          - environment: production
    env:
      ENVIRONMENT: ${{ matrix.environment }}
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure kubectl
        uses: azure/k8s-set-context@v1
        with:
          method: service-account
          k8s-url: ${{ secrets.K8S_URL }}
          k8s-secret: ${{ secrets.K8S_SECRET }}
      
      - name: Deploy with Helm
        run: |
          helm upgrade --install codai-${{ matrix.environment }} \
            ./charts/codai \
            --namespace codai-${{ matrix.environment }} \
            --values ./charts/codai/values-${{ matrix.environment }}.yaml \
            --set image.tag=${{ github.sha }} \
            --timeout 300s \
            --wait
      
      - name: Verify deployment
        run: |
          kubectl rollout status deployment/gateway \
            -n codai-${{ matrix.environment }} \
            --timeout=300s
          
          # Health check
          kubectl run health-check \
            --image=curlimages/curl \
            --rm -i --restart=Never \
            -- curl -f http://gateway:4003/api/health

  # Stage 5: Production Deployment (Conditional)
  deploy-production:
    name: "Deploy to Production"
    needs: [deploy]
    if: startsWith(github.ref, 'refs/tags/v')
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Canary deployment (10% traffic)
        run: |
          helm upgrade codai-production ./charts/codai \
            --set canary.enabled=true \
            --set canary.weight=10
      
      - name: Wait and validate metrics
        run: |
          sleep 300  # 5 minute validation
          ./scripts/validate-metrics.sh
      
      - name: Full deployment (100% traffic)
        run: |
          helm upgrade codai-production ./charts/codai \
            --set canary.enabled=false
```

### Infrastructure as Code

#### Terraform for Multi-Cloud Resources

```hcl
# terraform/main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "azurerm" {
    resource_group_name  = "codai-terraform-state"
    storage_account_name = "codaiterraformstate"
    container_name       = "tfstate"
    key                  = "production.terraform.tfstate"
  }
}

# Azure resources (Primary)
module "azure_infrastructure" {
  source = "./modules/azure"
  
  environment = var.environment
  location    = "West Europe"
  
  # AKS cluster for core services
  kubernetes_cluster = {
    name                = "codai-${var.environment}"
    node_count         = 3
    vm_size            = "Standard_D4s_v3"
    availability_zones = ["1", "2", "3"]
  }
  
  # Azure Database for PostgreSQL
  postgresql = {
    name     = "codai-postgres-${var.environment}"
    version  = "15"
    sku_name = "GP_Gen5_4"
    storage  = 100
  }
}

# AWS resources (DR and AI workloads)
module "aws_infrastructure" {
  source = "./modules/aws"
  
  environment = var.environment
  region      = "us-east-1"
  
  # EKS cluster for AI/ML workloads
  eks_cluster = {
    name            = "codai-ai-${var.environment}"
    instance_types  = ["p3.2xlarge", "c5.4xlarge"]
    min_size        = 1
    max_size        = 10
    desired_size    = 2
  }
}
```

### Monitoring and Observability

#### Distributed Tracing Setup

```yaml
# OpenTelemetry configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: otel-collector-config
data:
  config.yaml: |
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 0.0.0.0:4317
          http:
            endpoint: 0.0.0.0:4318
    
    processors:
      batch:
      
    exporters:
      jaeger:
        endpoint: jaeger-collector:14250
        tls:
          insecure: true
      prometheusremotewrite:
        endpoint: http://prometheus:9090/api/v1/write
    
    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [batch]
          exporters: [jaeger]
        metrics:
          receivers: [otlp]
          processors: [batch]
          exporters: [prometheusremotewrite]
```

#### Performance Monitoring

```typescript
// Application performance monitoring
export class APMService {
  private readonly tracer = trace.getTracer('codai-apm');
  
  async monitorAIInference<T>(
    modelName: string, 
    operation: () => Promise<T>
  ): Promise<T> {
    const span = this.tracer.startSpan(`ai-inference:${modelName}`);
    
    try {
      const startTime = performance.now();
      const result = await operation();
      const duration = performance.now() - startTime;
      
      span.setAttributes({
        'ai.model.name': modelName,
        'ai.inference.duration': duration,
        'ai.inference.success': true
      });
      
      // Alert if inference > 3s
      if (duration > 3000) {
        await this.alertManager.sendAlert({
          type: 'performance',
          message: `AI inference slow: ${duration}ms for ${modelName}`,
          severity: duration > 5000 ? 'critical' : 'warning'
        });
      }
      
      return result;
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw error;
    } finally {
      span.end();
    }
  }
}
```

### Disaster Recovery Strategy

#### Multi-Region Backup Strategy

```yaml
Backup & Recovery:
  
  Database Backups:
    - Continuous: WAL streaming to secondary region
    - Daily: Full database backup to object storage
    - Weekly: Cross-region backup verification
    - Monthly: Disaster recovery drill
  
  Application State:
    - Container images: Multi-registry replication
    - Configuration: GitOps with Argo CD
    - Secrets: HashiCorp Vault clustering
  
  Recovery Time Objectives:
    - RTO: 30 minutes (automated failover)
    - RPO: 5 minutes (data loss tolerance)
    - RTO Manual: 4 hours (manual intervention)
  
  Failover Procedures:
    1. Health check failure detection
    2. Automatic traffic routing to DR region
    3. Database promotion (read replica → primary)
    4. DNS update for global load balancer
    5. Validation and monitoring
```

### Cost Optimization

#### Resource Management Strategy

```yaml
Cost Controls:
  
  Auto-scaling Policies:
    - CPU utilization: 70% target
    - Memory utilization: 80% target
    - AI inference queue: <10 requests
    - Scale-down delay: 5 minutes
  
  Resource Scheduling:
    - Development: Scale to zero after 8pm
    - Staging: 50% capacity during off-hours
    - Production: Full capacity with burst
  
  Storage Optimization:
    - Hot data: SSD (7 days)
    - Warm data: Standard storage (30 days)
    - Cold data: Archive storage (>30 days)
    - Compression: Enable for all tiers
  
  Reserved Capacity:
    - Core services: 1-year reserved instances
    - AI inference: Spot instances for batch jobs
    - Database: Reserved capacity for baseline
```

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Docker Compose optimization for local development
- [ ] Kubernetes cluster setup (Azure AKS)
- [ ] CI/CD pipeline implementation
- [ ] Basic monitoring and logging
- [ ] Infrastructure as Code setup

### Phase 2: Multi-Cloud (Weeks 3-4)
- [ ] AWS EKS cluster for AI workloads
- [ ] Cross-cloud networking setup
- [ ] Disaster recovery implementation
- [ ] Advanced monitoring and alerting
- [ ] Performance optimization

### Phase 3: Edge Computing (Weeks 5-6)
- [ ] Edge node deployment
- [ ] CDN integration for static assets
- [ ] Global load balancing
- [ ] Cost optimization automation
- [ ] Security hardening

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Deployment Time | <10 minutes | 15 minutes |
| API Response Time | <200ms | 180ms |
| AI Inference Time | <3s | 4.2s |
| Uptime | 99.9% | 99.7% |
| MTTR | <30 minutes | 45 minutes |

## Links

- [Architecture Decision](./001-architecture-decision.md)
- [API Contracts](./002-api-contracts.md)  
- [Security Posture](./003-security-posture.md)
- [Infrastructure Code](../../../terraform/)
- [Deployment Scripts](../../../scripts/deployment/)