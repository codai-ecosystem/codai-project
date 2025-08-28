# 🐳 Production Container Orchestration Strategy
# Essential CodAI Services - Kubernetes Deployment

version: '1.0'
environment: production
platform: kubernetes
infrastructure: cloud-agnostic

## Container Architecture Overview

### Multi-Stage Docker Builds
Each Enhanced Essential CodAI Service follows optimized multi-stage Docker builds:

```dockerfile
# Base template for all services
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
RUN apk add --no-cache dumb-init
USER node
WORKDIR /app
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .
EXPOSE 8080
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
```

### Service Container Matrix

```yaml
Essential CodAI Services Container Configuration:
  
  codai-auth-api:
    port: 8100
    base_image: node:18-alpine
    resources:
      requests: { cpu: "100m", memory: "256Mi" }
      limits: { cpu: "500m", memory: "512Mi" }
    health_check: "/health"
    secrets: [JWT_SECRET, DB_PASSWORD, OAUTH_SECRETS]
  
  codai-gateway-api:
    port: 8010
    base_image: node:18-alpine  
    resources:
      requests: { cpu: "200m", memory: "512Mi" }
      limits: { cpu: "1000m", memory: "1Gi" }
    health_check: "/health"
    secrets: [GATEWAY_SECRET, RATE_LIMIT_REDIS]
  
  codai-hub-api:
    port: 8110
    base_image: node:18-alpine
    resources:
      requests: { cpu: "150m", memory: "256Mi" }
      limits: { cpu: "750m", memory: "512Mi" }
    health_check: "/health"
    secrets: [HUB_API_KEY, WEBSOCKET_SECRET]
  
  codai-memorai-mcp:
    port: 4950
    base_image: node:18-alpine
    resources:
      requests: { cpu: "200m", memory: "512Mi" }
      limits: { cpu: "1000m", memory: "1Gi" }
    health_check: "/health"
    secrets: [MCP_SECRET, MEMORY_DB_PASSWORD]
  
  codai-cbd-database:
    port: 8180
    base_image: node:18-alpine
    resources:
      requests: { cpu: "100m", memory: "256Mi" }
      limits: { cpu: "500m", memory: "512Mi" }
    health_check: "/health"
    secrets: [CBD_DB_PASSWORD, GRAPH_DB_AUTH]
  
  codai-memorai-frontend:
    port: 8006
    base_image: nginx:alpine
    resources:
      requests: { cpu: "50m", memory: "128Mi" }
      limits: { cpu: "200m", memory: "256Mi" }
    health_check: "/health"
    config_maps: [NGINX_CONFIG, APP_CONFIG]
```

## Kubernetes Deployment Architecture

### Namespace Organization
```yaml
namespaces:
  - codai-production
  - codai-monitoring  
  - codai-security
  - codai-storage
```

### High Availability Configuration
- **Multi-Zone Deployment**: Services distributed across 3 availability zones
- **Replica Strategy**: Minimum 2 replicas per service for HA
- **Anti-Affinity**: Pods scheduled on different nodes
- **Rolling Updates**: Zero-downtime deployments with readiness probes

### Network Security
- **Network Policies**: Restrict inter-pod communication
- **Service Mesh**: Istio for mTLS and traffic management
- **Ingress Controller**: NGINX with SSL termination
- **Internal DNS**: CoreDNS for service discovery