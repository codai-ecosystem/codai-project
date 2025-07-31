# Kubernetes Production Deployment Manifests for CBD-MemoraiMCP

## Overview
This directory contains production-ready Kubernetes manifests for deploying the CBD-MemoraiMCP integration system.

## Architecture
- **CBD Engine**: Core database service with persistent storage
- **MemoraiMCP**: Memory management service with CBD backend
- **Redis**: Caching layer for performance optimization
- **Monitoring Stack**: Prometheus, Grafana for observability
- **Security**: RBAC, NetworkPolicies, Pod Security Standards

## Deployment Structure
```
k8s/
├── namespaces/          # Namespace definitions
├── rbac/               # RBAC roles and bindings
├── secrets/            # Secret management
├── configmaps/         # Configuration maps
├── services/           # Service definitions
│   ├── cbd-engine/     # CBD Engine deployment
│   ├── memorai-mcp/    # MemoraiMCP deployment
│   └── redis/          # Redis deployment
├── ingress/            # Ingress controllers and rules
├── monitoring/         # Prometheus, Grafana stack
├── security/           # Security policies
└── helm/              # Helm charts

```

## Prerequisites
- Kubernetes cluster (v1.25+)
- kubectl configured
- Helm 3.x installed
- Persistent storage provisioner
- Ingress controller (NGINX recommended)
- Certificate management (cert-manager)

## Quick Deployment
```bash
# Deploy via Helm (recommended)
helm install cbd-memorai ./helm/cbd-memorai-chart \
  --namespace cbd-memorai-prod \
  --create-namespace \
  --values values-production.yaml

# Or deploy individual manifests
kubectl apply -f namespaces/
kubectl apply -f rbac/
kubectl apply -f secrets/
kubectl apply -f configmaps/
kubectl apply -f services/
kubectl apply -f ingress/
kubectl apply -f monitoring/
kubectl apply -f security/
```

## Configuration
Environment-specific values are managed through:
- `values-production.yaml` - Production configuration
- `values-staging.yaml` - Staging configuration
- `configmaps/` - Application configuration
- `secrets/` - Sensitive data (encrypted)

## Security Features
- RBAC with least privilege access
- Pod Security Standards enforcement
- Network policies for traffic isolation
- Image scanning and signing verification
- Secrets encryption at rest
- TLS/mTLS for all communications

## Monitoring & Observability
- Prometheus metrics collection
- Grafana dashboards
- Structured logging with Loki
- Distributed tracing with Jaeger
- Health checks and readiness probes
- Alerting rules for critical events

## Scaling & Performance
- Horizontal Pod Autoscaling (HPA)
- Vertical Pod Autoscaling (VPA)
- Resource quotas and limits
- Anti-affinity rules for high availability
- Persistent volume management
- Load balancing strategies

## Maintenance
- Rolling update strategies
- Blue-green deployment support
- Canary deployment capabilities
- Backup and disaster recovery
- Log rotation and retention
- Performance tuning guidelines
