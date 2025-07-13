# TOOLS Deployment Guide

## Overview

This guide covers the deployment of the tools service in production environments.

## Prerequisites

- Kubernetes cluster (v1.24+)
- Helm (v3.12+)
- Docker registry access
- kubectl configured for target cluster

## Quick Deploy

```bash
# Deploy using Helm
helm install tools ./infrastructure/helm/tools \
  --namespace codai-production \
  --create-namespace \
  --values values.production.yaml

# Deploy using kubectl
kubectl apply -f infrastructure/manifests/tools/
```

## Environment-Specific Deployments

### Development

```bash
# Start local development
pnpm dev --filter=tools

# Or with Docker Compose
docker-compose -f docker/docker-compose.yml up tools
```

### Staging

```bash
helm upgrade --install tools ./infrastructure/helm/tools \
  --namespace codai-staging \
  --values values.staging.yaml \
  --set image.tag=${GITHUB_SHA}
```

### Production

```bash
helm upgrade --install tools ./infrastructure/helm/tools \
  --namespace codai-production \
  --values values.production.yaml \
  --set image.tag=${RELEASE_TAG}
```

## Configuration

### Environment Variables

Create a `.env.local` file with required variables:

```bash
# Core Configuration
NODE_ENV=production
PORT=4017
SERVICE_NAME=tools

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379

# Authentication
JWT_SECRET=your-jwt-secret
API_KEY_SECRET=your-api-key-secret

# External Services
AZURE_OPENAI_API_KEY=your-key
STRIPE_SECRET_KEY=your-key
```

### Kubernetes Secrets

```bash
# Create secrets from .env.local
kubectl create secret generic tools-env \
  --from-env-file=.env.local \
  --namespace=codai-production

# Or apply generated secrets
kubectl apply -f kubernetes-secrets.yaml
```

## Health Checks

The service includes comprehensive health checks:

### Liveness Probe

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 4017
  initialDelaySeconds: 30
  periodSeconds: 10
```

### Readiness Probe

```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 4017
  initialDelaySeconds: 5
  periodSeconds: 5
```

## Scaling

### Horizontal Pod Autoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: tools
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: tools
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

### Manual Scaling

```bash
# Scale to 5 replicas
kubectl scale deployment tools --replicas=5 -n codai-production
```

## Monitoring

### Metrics

Access metrics at:

- Prometheus: https://prometheus.codai.dev
- Grafana: https://grafana.codai.dev/d/tools

### Logs

Access logs via:

- Kibana: https://kibana.codai.dev
- kubectl: `kubectl logs -f deployment/tools -n codai-production`

### Tracing

Access traces at:

- Jaeger: https://jaeger.codai.dev

## Troubleshooting

### Common Issues

#### Service Not Starting

```bash
# Check pod status
kubectl get pods -n codai-production -l app=tools

# Check pod logs
kubectl logs -f deployment/tools -n codai-production

# Check events
kubectl get events -n codai-production --sort-by='.lastTimestamp'
```

#### High CPU/Memory Usage

```bash
# Check resource usage
kubectl top pods -n codai-production -l app=tools

# Scale up if needed
kubectl scale deployment tools --replicas=5 -n codai-production
```

#### Database Connection Issues

```bash
# Check database connectivity
kubectl exec -it deployment/tools -n codai-production -- \
  ping database-host

# Check secrets
kubectl get secret tools-env -n codai-production -o yaml
```

### Debug Commands

```bash
# Access pod shell
kubectl exec -it deployment/tools -n codai-production -- /bin/sh

# Port forward for local access
kubectl port-forward deployment/tools 4017:4017 -n codai-production

# Check service endpoints
kubectl get endpoints -n codai-production tools
```

## Rollback

### Helm Rollback

```bash
# List releases
helm history tools -n codai-production

# Rollback to previous version
helm rollback tools -n codai-production

# Rollback to specific revision
helm rollback tools 2 -n codai-production
```

### kubectl Rollback

```bash
# Check rollout history
kubectl rollout history deployment/tools -n codai-production

# Rollback to previous version
kubectl rollout undo deployment/tools -n codai-production

# Rollback to specific revision
kubectl rollout undo deployment/tools --to-revision=2 -n codai-production
```

## Backup and Recovery

### Database Backup

```bash
# Create database backup
kubectl exec -it postgresql-0 -n codai-production -- \
  pg_dump -U postgres codai > backup-$(date +%Y%m%d).sql
```

### Configuration Backup

```bash
# Backup Kubernetes resources
kubectl get all,secrets,configmaps -n codai-production -o yaml > backup-k8s.yaml
```

## Security

### Network Policies

The service uses network policies to restrict traffic:

```bash
# Apply network policies
kubectl apply -f security/policies/tools/network-policy.yaml
```

### Pod Security

```bash
# Apply pod security policies
kubectl apply -f security/policies/tools/pod-security-policy.yaml
```

### RBAC

```bash
# Apply RBAC configuration
kubectl apply -f security/rbac/tools/
```

## Performance Tuning

### Resource Requests/Limits

```yaml
resources:
  requests:
    cpu: 100m
    memory: 256Mi
  limits:
    cpu: 500m
    memory: 1Gi
```

### JVM Tuning (if applicable)

```bash
export JAVA_OPTS="-Xmx2g -Xms1g -XX:+UseG1GC"
```

### Node.js Tuning

```bash
export NODE_OPTIONS="--max-old-space-size=4096"
```
