# ADR-005: RomAI Deployment Strategy and Infrastructure

**Date**: 2025-08-27  
**Status**: Accepted  
**Deciders**: RomAI DevOps Team  

## Context

RomAI requires deployment strategy that supports:
- **Multi-target deployment**: Cloud, edge, and hybrid environments
- **Romanian data residency**: EU/Romanian compliance requirements
- **AI workload optimization**: GPU resources for ML inference
- **High availability**: 99.9% uptime SLA for enterprise customers
- **Scalability**: Auto-scaling based on AI inference demand

## Decision

We implement **Cloud-Native Kubernetes Deployment** with multi-region capabilities:

### Target Environments

#### 1. Cloud Deployment (Primary)
```yaml
# Production: Azure EU West (Netherlands) + Romania Central
azure_regions:
  primary: "westeurope"  # GDPR compliance
  secondary: "romaniacentral"  # Data residency
  
services:
  aks_cluster:
    node_pools:
      - name: "ai-workload"
        vm_size: "Standard_NC6s_v3"  # GPU for ML
        min_nodes: 2
        max_nodes: 10
        enable_auto_scaling: true
      - name: "web-workload"  
        vm_size: "Standard_B4ms"
        min_nodes: 3
        max_nodes: 20
        enable_auto_scaling: true
        
  container_registry: "romairegistry.azurecr.io"
  load_balancer: "Azure Application Gateway"
  ssl_termination: "Let's Encrypt + Azure Key Vault"
```

#### 2. Edge Deployment (Secondary)
```yaml
# On-premise Romanian institutions
edge_deployment:
  kubernetes_distribution: "K3s"
  minimum_requirements:
    cpu_cores: 8
    memory_gb: 32
    storage_gb: 500
    gpu: "Optional (RTX 4090 or equivalent)"
  
  deployment_method: "Helm charts"
  data_sync: "Eventual consistency with cloud"
  offline_capability: "72 hours"
```

#### 3. Hybrid Deployment (Enterprise)
```yaml
# Enterprise customers with specific requirements
hybrid_architecture:
  cloud_components:
    - user_authentication
    - cultural_knowledge_base
    - model_updates
    - monitoring_dashboard
  
  on_premise_components:
    - ai_inference_engine
    - sensitive_data_processing
    - local_caching
    - audit_logging
```

### Container Architecture

```dockerfile
# Multi-stage Dockerfile for RomAI ML API
FROM python:3.11-slim-bullseye AS base
WORKDIR /app
COPY requirements.production.txt .
RUN pip install --no-cache-dir -r requirements.production.txt

FROM base AS development
COPY requirements.dev.txt .
RUN pip install --no-cache-dir -r requirements.dev.txt
COPY . .
EXPOSE 6101
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "6101", "--reload"]

FROM base AS production
COPY src/ src/
RUN adduser --system --no-create-home romai
USER romai
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:6101/health || exit 1
EXPOSE 6101
CMD ["gunicorn", "src.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:6101", "--timeout", "300"]
```

### Kubernetes Manifests

```yaml
# romai-ml-api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: romai-ml-api
  namespace: romai-production
  labels:
    app: romai-ml-api
    component: ai-backend
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: romai-ml-api
  template:
    metadata:
      labels:
        app: romai-ml-api
    spec:
      containers:
      - name: romai-ml-api
        image: romairegistry.azurecr.io/romai-ml-api:latest
        ports:
        - containerPort: 6101
        env:
        - name: ROMAI_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: romai-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: romai-secrets
              key: redis-url
        - name: AZURE_OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: azure-openai
              key: api-key
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "8Gi"
            cpu: "4000m"
            nvidia.com/gpu: "1"
        livenessProbe:
          httpGet:
            path: /health
            port: 6101
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 6101
          initialDelaySeconds: 10
          periodSeconds: 5
      nodeSelector:
        workload-type: "ai"

---
apiVersion: v1
kind: Service
metadata:
  name: romai-ml-api-service
  namespace: romai-production
spec:
  selector:
    app: romai-ml-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 6101
  type: ClusterIP
```

### Helm Chart Structure
```
charts/romai/
├── Chart.yaml
├── values.yaml
├── values-production.yaml
├── values-staging.yaml
├── templates/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── hpa.yaml
│   └── pdb.yaml
└── charts/
    ├── postgresql/
    ├── redis/
    └── monitoring/
```

### CI/CD Pipeline Integration

```yaml
# .github/workflows/deploy-romai.yml
name: Deploy RomAI
on:
  push:
    branches: [main]
    paths: ['apps/romai/**']

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to AKS Staging
        run: |
          az aks get-credentials --resource-group romai-staging --name romai-staging-aks
          helm upgrade --install romai ./charts/romai \
            --namespace romai-staging \
            --values ./charts/romai/values-staging.yaml \
            --set image.tag=${{ github.sha }} \
            --timeout 600s
  
  deploy-production:
    runs-on: ubuntu-latest
    needs: [deploy-staging]
    environment: production
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to AKS Production
        run: |
          az aks get-credentials --resource-group romai-production --name romai-production-aks
          helm upgrade --install romai ./charts/romai \
            --namespace romai-production \
            --values ./charts/romai/values-production.yaml \
            --set image.tag=${{ github.sha }} \
            --timeout 600s
```

### Auto-Scaling Configuration

```yaml
# Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: romai-ml-api-hpa
  namespace: romai-production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: romai-ml-api
  minReplicas: 3
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
  - type: Pods
    pods:
      metric:
        name: ai_inference_queue_length
      target:
        type: AverageValue
        averageValue: "5"

# Vertical Pod Autoscaler (for optimal resource allocation)
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: romai-ml-api-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: romai-ml-api
  updatePolicy:
    updateMode: "Auto"
```

### Monitoring and Observability

```yaml
# Prometheus monitoring
prometheus_config:
  scrape_configs:
    - job_name: 'romai-ml-api'
      static_configs:
        - targets: ['romai-ml-api-service:80']
      metrics_path: /metrics
      scrape_interval: 15s
      
  alerting_rules:
    - alert: RomAIHighLatency
      expr: avg(http_request_duration_seconds{job="romai-ml-api"}) > 5
      for: 2m
      annotations:
        summary: "RomAI ML API high latency detected"
    
    - alert: RomAILowAccuracy
      expr: avg(ai_inference_confidence{job="romai-ml-api"}) < 0.8
      for: 5m
      annotations:
        summary: "RomAI AI inference accuracy degraded"
```

### Disaster Recovery

```yaml
disaster_recovery:
  backup_strategy:
    database: "Daily automated backups to Azure Backup"
    cultural_data: "Real-time replication to Romania Central"
    model_artifacts: "Weekly snapshots to cold storage"
    
  recovery_objectives:
    rto: "4 hours"  # Recovery Time Objective
    rpo: "1 hour"   # Recovery Point Objective
    
  failover_process:
    - automated_health_checks: "Every 30 seconds"
    - traffic_redirect: "DNS-based with 300s TTL"
    - data_consistency: "Eventual consistency acceptable"
```

## Implementation Timeline

### Phase 1: Cloud Foundation (Week 1-2)
- [ ] Azure AKS cluster setup in West Europe
- [ ] Container registry configuration
- [ ] Basic Kubernetes manifests
- [ ] CI/CD pipeline integration

### Phase 2: Production Hardening (Week 3-4)
- [ ] Monitoring and alerting setup
- [ ] Auto-scaling configuration
- [ ] Security policies implementation
- [ ] Backup and disaster recovery

### Phase 3: Multi-Region (Week 5-6)
- [ ] Romania Central region setup
- [ ] Data replication configuration
- [ ] Failover testing
- [ ] Performance optimization

### Phase 4: Edge/Hybrid (Week 7-8)
- [ ] K3s edge deployment testing
- [ ] Hybrid architecture validation
- [ ] On-premise customer pilots
- [ ] Documentation and training

## Consequences

### Positive
- **Cloud-Native**: Leverage managed services for reliability
- **Compliance**: Data residency in Romania/EU for sensitive data
- **Scalability**: Auto-scaling handles demand spikes
- **High Availability**: Multi-region deployment for disaster recovery
- **DevOps Automation**: Infrastructure as Code reduces manual errors

### Negative
- **Complexity**: Multi-region and hybrid deployment complexity
- **Costs**: GPU resources and multi-region deployment costs
- **Operational Overhead**: Multiple deployment targets to manage
- **Vendor Lock-in**: Azure-specific services reduce portability

### Risks
- **Regional Outages**: Azure region failures affect availability  
- **Data Sovereignty**: Changing regulations may require architecture changes
- **Resource Constraints**: GPU availability during high demand periods
- **Network Latency**: Cross-region communication affects performance