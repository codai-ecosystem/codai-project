# ADR-005: MemorAI Deployment Strategy

**Date**: 2025-08-27  
**Status**: Accepted  
**Deciders**: Launcher Agent, CODAI Ecosystem Team  

## Context

MemorAI requires a robust deployment strategy supporting:

- Zero-downtime deployments with rollback capability
- Multi-environment promotion (dev → staging → prod)
- Horizontal scaling under load
- Geographic distribution for performance
- Disaster recovery and business continuity

## Decision

**Blue-Green Kubernetes Deployment** with GitOps workflow:

### 1. Environment Architecture

```yaml
environments:
  development:
    cluster: codai-dev-aks
    namespace: memorai-dev
    replicas: 1
    resources:
      cpu: "500m"
      memory: "1Gi"
    
  staging:
    cluster: codai-staging-aks  
    namespace: memorai-staging
    replicas: 2
    resources:
      cpu: "1000m"
      memory: "2Gi"
    
  production:
    cluster: codai-prod-aks
    namespace: memorai-prod
    replicas: 3
    resources:
      cpu: "2000m"
      memory: "4Gi"
    zones: 3 # Multi-AZ deployment
```

### 2. Deployment Pipeline

```yaml
# GitHub Actions deployment workflow
name: MemorAI Deployment Pipeline

on:
  push:
    branches: [main]
    paths: ['apps/memorai/**']

jobs:
  deploy:
    strategy:
      matrix:
        environment: [staging, production]
    
    steps:
      - name: Build & Test
        run: |
          pnpm install --frozen-lockfile
          pnpm test:unit --coverage
          pnpm test:integration
          pnpm build
          
      - name: Security Scan
        run: |
          docker build -t memorai:${{ github.sha }} .
          trivy image memorai:${{ github.sha }}
          
      - name: Deploy to Staging
        if: matrix.environment == 'staging'
        run: |
          helm upgrade --install memorai-staging ./helm/memorai \
            --namespace memorai-staging \
            --set image.tag=${{ github.sha }} \
            --set environment=staging
            
      - name: Smoke Tests
        run: |
          kubectl wait --for=condition=ready pod -l app=memorai -n memorai-staging
          curl -f https://memorai-staging.codai.dev/health
          
      - name: Deploy to Production
        if: matrix.environment == 'production' && github.ref == 'refs/heads/main'
        run: |
          # Blue-green deployment
          helm upgrade memorai-blue ./helm/memorai \
            --namespace memorai-prod \
            --set image.tag=${{ github.sha }} \
            --set environment=production \
            --set color=blue
            
          # Health check blue deployment
          kubectl wait --for=condition=ready pod -l app=memorai,color=blue -n memorai-prod
          
          # Switch traffic to blue
          kubectl patch service memorai -n memorai-prod -p \
            '{"spec":{"selector":{"color":"blue"}}}'
            
          # Cleanup green deployment
          helm delete memorai-green -n memorai-prod || true
```

### 3. Kubernetes Manifests

```yaml
# Deployment manifest
apiVersion: apps/v1
kind: Deployment
metadata:
  name: memorai-{{ .Values.color }}
  namespace: memorai-prod
spec:
  replicas: {{ .Values.replicas }}
  selector:
    matchLabels:
      app: memorai
      color: {{ .Values.color }}
  template:
    metadata:
      labels:
        app: memorai
        color: {{ .Values.color }}
    spec:
      containers:
      - name: memorai
        image: ghcr.io/codai/memorai:{{ .Values.image.tag }}
        ports:
        - containerPort: 4006
        env:
        - name: NODE_ENV
          value: {{ .Values.environment }}
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: memorai-secrets
              key: database-url
        resources:
          requests:
            cpu: {{ .Values.resources.cpu }}
            memory: {{ .Values.resources.memory }}
          limits:
            cpu: {{ mul .Values.resources.cpu 2 }}
            memory: {{ mul .Values.resources.memory 2 }}
        livenessProbe:
          httpGet:
            path: /health
            port: 4006
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 4006
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: memorai
  namespace: memorai-prod
spec:
  selector:
    app: memorai
    color: blue  # Updated during deployment
  ports:
  - port: 80
    targetPort: 4006
  type: LoadBalancer

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: memorai-ingress
  namespace: memorai-prod
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - memorai.codai.dev
    secretName: memorai-tls
  rules:
  - host: memorai.codai.dev
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: memorai
            port:
              number: 80
```

### 4. Scaling Strategy

```yaml
# Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: memorai-hpa
  namespace: memorai-prod
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: memorai-blue
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
        
# Vertical Pod Autoscaler  
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: memorai-vpa
  namespace: memorai-prod
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: memorai-blue
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
    - containerName: memorai
      maxAllowed:
        cpu: 4
        memory: 8Gi
```

### 5. Disaster Recovery

```yaml
# Database backup strategy
backupStrategy:
  postgresql:
    schedule: "0 2 * * *"  # Daily at 2 AM
    retention: "30 days"
    encryption: true
    
  cbd:
    schedule: "0 3 * * *"  # Daily at 3 AM
    retention: "30 days"
    
  redis:
    schedule: "0 */6 * * *"  # Every 6 hours
    retention: "7 days"

# Cross-region replication
replication:
  primary: eastus
  secondary: westus2
  replicationLag: "<5 minutes"
  
# Recovery procedures
recovery:
  rto: "15 minutes"   # Recovery Time Objective
  rpo: "5 minutes"    # Recovery Point Objective
  procedures:
    - automated_failover
    - manual_intervention
    - data_restoration
```

## Consequences

### Positive
- **Zero Downtime**: Blue-green deployments with instant rollback
- **Scalability**: Horizontal and vertical auto-scaling
- **Reliability**: Multi-AZ deployment with disaster recovery
- **Security**: Network policies and secret management
- **Observability**: Health checks and monitoring integration

### Negative
- **Resource Overhead**: Running blue-green environments
- **Complexity**: Kubernetes orchestration complexity
- **Cost**: Higher infrastructure costs for redundancy

### Risks
- **Split Brain**: Network partition between regions
- **Resource Exhaustion**: Auto-scaling hitting cluster limits
- **Configuration Drift**: Manual changes bypassing GitOps

**Decision**: Accept higher infrastructure costs for enterprise-grade availability and reliability.