# MemorAI Platform Deployment Guide

## Overview

This comprehensive deployment guide covers all aspects of deploying the MemorAI Platform across different environments, from development to production scale. The platform consists of multiple services that work together to provide advanced memory management, monitoring, and observability capabilities.

## Architecture Overview

The MemorAI Platform consists of these core services:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MemorAI App   │    │  MemorAI MCP    │    │   CBD Database  │
│   Port: 4006    │────│   Port: 4950    │────│   Port: 4180    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────┐    ┌─────────────────┐
         │  GraphQL Server │    │ Monitoring Stack│
         │   Port: 4500    │    │   Port: 8080    │
         └─────────────────┘    └─────────────────┘
```

## Prerequisites

### System Requirements

**Minimum Requirements:**
- CPU: 2 cores
- RAM: 4GB
- Disk: 20GB SSD
- Network: 10Mbps

**Recommended (Production):**
- CPU: 8 cores
- RAM: 16GB
- Disk: 100GB NVMe SSD
- Network: 100Mbps

### Software Dependencies

- **Node.js**: v18.0.0 or higher
- **pnpm**: v8.0.0 or higher
- **Python**: v3.9+ (for RomAI AGI components)
- **Git**: Latest version
- **Docker**: v24.0+ (for containerized deployment)
- **Kubernetes**: v1.25+ (for orchestrated deployment)

### Environment Setup

1. **Install Node.js and pnpm:**
```bash
# Using Node Version Manager (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Install pnpm
npm install -g pnpm@latest
```

2. **Install Python dependencies:**
```bash
# Install Python (if not already installed)
# Ubuntu/Debian
sudo apt update && sudo apt install python3 python3-pip

# macOS
brew install python@3.9

# Windows
# Download from python.org
```

3. **Clone the repository:**
```bash
git clone https://github.com/memorai/codai-project.git
cd codai-project
```

## Development Deployment

### Quick Start

1. **Install dependencies:**
```bash
# Install all workspace dependencies
pnpm install

# Install Python dependencies for RomAI
cd apps/romai
pip install -r requirements.txt
cd ../..
```

2. **Environment configuration:**
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

**Essential Environment Variables:**
```bash
# MemorAI MCP Configuration
MEMORAI_API_KEY=memorai-dev-key-2025
MEMORAI_MCP_PORT=4950
CBD_BASE_URL=http://localhost:4180

# Database Configuration
PORT=4180
NODE_ENV=development
CBD_LOG_LEVEL=info

# Azure OpenAI Configuration (for embeddings)
AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_DEPLOYMENT_NAME=text-embedding-3-large
AZURE_OPENAI_API_VERSION=2024-02-01

# Monitoring Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=alerts@yourcompany.com
SMTP_PASS=your-app-password
WEBHOOK_URL=https://hooks.slack.com/your-webhook-url
WEBSOCKET_PORT=8080

# Security
JWT_SECRET=your-super-secret-jwt-key
API_RATE_LIMIT=1000
```

3. **Start services:**
```bash
# Option 1: Start all services with VS Code tasks
# Use VS Code Command Palette: "Tasks: Run Task" -> "Start Core Services"

# Option 2: Start services individually
pnpm run start:cbd          # CBD Database
pnpm run start:mcp          # MemorAI MCP Server
pnpm run start:app          # MemorAI App
pnpm run start:graphql      # GraphQL Server
pnpm run start:romai        # RomAI AGI Model Server
```

4. **Verify deployment:**
```bash
# Check all services health
curl http://localhost:4180/health  # CBD Database
curl http://localhost:4950/health  # MemorAI MCP
curl http://localhost:4006/api/health  # MemorAI App
curl http://localhost:4500/health  # GraphQL Server

# Or use the automated health check
pnpm run health:check
```

### Development Configuration

**VS Code Tasks Configuration** (`.vscode/tasks.json`):
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start All Services",
      "dependsOrder": "parallel",
      "dependsOn": [
        "Start CBD Database",
        "Start MemorAI MCP Server",
        "Start MemorAI App",
        "Start GraphQL Server"
      ],
      "group": "build"
    },
    {
      "label": "Health Check All Services",
      "type": "shell",
      "command": "pnpm",
      "args": ["run", "health:all"],
      "group": "test",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "panel": "new"
      }
    }
  ]
}
```

## Production Deployment

### Docker Deployment

#### Single Host Docker Deployment

1. **Create production Docker Compose:**

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # CBD Database Service
  cbd-database:
    build:
      context: .
      dockerfile: packages/cbd/Dockerfile
    ports:
      - "4180:4180"
    environment:
      - NODE_ENV=production
      - PORT=4180
      - CBD_LOG_LEVEL=info
    volumes:
      - cbd_data:/app/data
      - cbd_logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4180/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # MemorAI MCP Server
  memorai-mcp:
    build:
      context: .
      dockerfile: packages/memorai-mcp/Dockerfile
    ports:
      - "4950:4950"
    environment:
      - NODE_ENV=production
      - MEMORAI_API_KEY=${MEMORAI_API_KEY}
      - MEMORAI_MCP_PORT=4950
      - CBD_BASE_URL=http://cbd-database:4180
      - AZURE_OPENAI_ENDPOINT=${AZURE_OPENAI_ENDPOINT}
      - AZURE_OPENAI_API_KEY=${AZURE_OPENAI_API_KEY}
      - AZURE_OPENAI_DEPLOYMENT_NAME=${AZURE_OPENAI_DEPLOYMENT_NAME}
    depends_on:
      cbd-database:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4950/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # MemorAI App
  memorai-app:
    build:
      context: .
      dockerfile: apps/memorai/Dockerfile
    ports:
      - "4006:4006"
    environment:
      - NODE_ENV=production
      - MEMORAI_MCP_URL=http://memorai-mcp:4950
      - DATABASE_URL=http://cbd-database:4180
    depends_on:
      memorai-mcp:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4006/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # GraphQL Server
  graphql-server:
    build:
      context: .
      dockerfile: apps/memorai/graphql/Dockerfile
    ports:
      - "4500:4500"
    environment:
      - NODE_ENV=production
      - MEMORAI_API_BASE_URL=http://memorai-app:4006
      - PORT=4500
    depends_on:
      memorai-app:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4500/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Monitoring Stack
  monitoring:
    build:
      context: .
      dockerfile: packages/monitoring/Dockerfile
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - WEBSOCKET_PORT=8080
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASS=${SMTP_PASS}
    restart: unless-stopped

  # NGINX Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - memorai-app
      - memorai-mcp
      - graphql-server
    restart: unless-stopped

volumes:
  cbd_data:
  cbd_logs:

networks:
  default:
    driver: bridge
```

2. **NGINX Configuration:**

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream memorai_app {
        server memorai-app:4006;
    }
    
    upstream memorai_mcp {
        server memorai-mcp:4950;
    }
    
    upstream graphql_server {
        server graphql-server:4500;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=app:10m rate=100r/s;

    server {
        listen 80;
        server_name memorai.com www.memorai.com;
        
        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name memorai.com www.memorai.com;
        
        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers on;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Security Headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # App routes
        location / {
            proxy_pass http://memorai_app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            limit_req zone=app burst=20 nodelay;
        }

        # API routes
        location /api/ {
            proxy_pass http://memorai_mcp;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            limit_req zone=api burst=10 nodelay;
        }

        # GraphQL endpoint
        location /graphql {
            proxy_pass http://graphql_server;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            limit_req zone=api burst=5 nodelay;
        }

        # WebSocket for real-time monitoring
        location /ws {
            proxy_pass http://monitoring:8080;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
        }

        # Health checks (no rate limiting)
        location /health {
            proxy_pass http://memorai_app;
            access_log off;
        }
    }
}
```

3. **Deploy with Docker Compose:**

```bash
# Create production environment file
cp .env.example .env.prod

# Edit production environment variables
nano .env.prod

# Deploy the stack
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Kubernetes Deployment

#### Full Kubernetes Production Setup

1. **Namespace and ConfigMap:**

```yaml
# k8s/namespace.yml
apiVersion: v1
kind: Namespace
metadata:
  name: memorai
  labels:
    name: memorai

---
# k8s/configmap.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: memorai-config
  namespace: memorai
data:
  NODE_ENV: "production"
  CBD_LOG_LEVEL: "info"
  MEMORAI_MCP_PORT: "4950"
  CBD_BASE_URL: "http://cbd-service:4180"
  WEBSOCKET_PORT: "8080"
```

2. **Secrets:**

```yaml
# k8s/secrets.yml
apiVersion: v1
kind: Secret
metadata:
  name: memorai-secrets
  namespace: memorai
type: Opaque
data:
  # Base64 encoded values
  memorai-api-key: <base64-encoded-api-key>
  azure-openai-api-key: <base64-encoded-azure-key>
  jwt-secret: <base64-encoded-jwt-secret>
  smtp-password: <base64-encoded-smtp-password>
```

3. **Persistent Storage:**

```yaml
# k8s/storage.yml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: cbd-data-pvc
  namespace: memorai
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 50Gi
  storageClassName: fast-ssd
```

4. **Services:**

```yaml
# k8s/services.yml
apiVersion: v1
kind: Service
metadata:
  name: cbd-service
  namespace: memorai
spec:
  selector:
    app: cbd-database
  ports:
  - port: 4180
    targetPort: 4180
  type: ClusterIP

---
apiVersion: v1
kind: Service
metadata:
  name: memorai-mcp-service
  namespace: memorai
spec:
  selector:
    app: memorai-mcp
  ports:
  - port: 4950
    targetPort: 4950
  type: ClusterIP

---
apiVersion: v1
kind: Service
metadata:
  name: memorai-app-service
  namespace: memorai
spec:
  selector:
    app: memorai-app
  ports:
  - port: 4006
    targetPort: 4006
  type: ClusterIP

---
apiVersion: v1
kind: Service
metadata:
  name: graphql-service
  namespace: memorai
spec:
  selector:
    app: graphql-server
  ports:
  - port: 4500
    targetPort: 4500
  type: ClusterIP
```

5. **Deployments:**

```yaml
# k8s/deployments.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cbd-database
  namespace: memorai
spec:
  replicas: 2
  selector:
    matchLabels:
      app: cbd-database
  template:
    metadata:
      labels:
        app: cbd-database
    spec:
      containers:
      - name: cbd
        image: memorai/cbd:latest
        ports:
        - containerPort: 4180
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: memorai-config
              key: NODE_ENV
        - name: CBD_LOG_LEVEL
          valueFrom:
            configMapKeyRef:
              name: memorai-config
              key: CBD_LOG_LEVEL
        volumeMounts:
        - name: cbd-data
          mountPath: /app/data
        livenessProbe:
          httpGet:
            path: /health
            port: 4180
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 4180
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
      volumes:
      - name: cbd-data
        persistentVolumeClaim:
          claimName: cbd-data-pvc

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: memorai-mcp
  namespace: memorai
spec:
  replicas: 3
  selector:
    matchLabels:
      app: memorai-mcp
  template:
    metadata:
      labels:
        app: memorai-mcp
    spec:
      containers:
      - name: memorai-mcp
        image: memorai/mcp-server:latest
        ports:
        - containerPort: 4950
        env:
        - name: MEMORAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: memorai-secrets
              key: memorai-api-key
        - name: AZURE_OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: memorai-secrets
              key: azure-openai-api-key
        - name: CBD_BASE_URL
          valueFrom:
            configMapKeyRef:
              name: memorai-config
              key: CBD_BASE_URL
        livenessProbe:
          httpGet:
            path: /live
            port: 4950
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 4950
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
```

6. **Ingress:**

```yaml
# k8s/ingress.yml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: memorai-ingress
  namespace: memorai
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
spec:
  tls:
  - hosts:
    - memorai.com
    - api.memorai.com
    secretName: memorai-tls
  rules:
  - host: memorai.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: memorai-app-service
            port:
              number: 4006
  - host: api.memorai.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: memorai-mcp-service
            port:
              number: 4950
      - path: /graphql
        pathType: Prefix
        backend:
          service:
            name: graphql-service
            port:
              number: 4500
```

7. **Horizontal Pod Autoscaler:**

```yaml
# k8s/hpa.yml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: memorai-mcp-hpa
  namespace: memorai
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: memorai-mcp
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
```

8. **Deploy to Kubernetes:**

```bash
# Apply all configurations
kubectl apply -f k8s/namespace.yml
kubectl apply -f k8s/configmap.yml
kubectl apply -f k8s/secrets.yml
kubectl apply -f k8s/storage.yml
kubectl apply -f k8s/services.yml
kubectl apply -f k8s/deployments.yml
kubectl apply -f k8s/ingress.yml
kubectl apply -f k8s/hpa.yml

# Check deployment status
kubectl get pods -n memorai
kubectl get services -n memorai
kubectl get ingress -n memorai

# View logs
kubectl logs -f deployment/memorai-mcp -n memorai

# Scale deployment
kubectl scale deployment memorai-mcp --replicas=5 -n memorai
```

## Cloud Platform Deployments

### AWS Deployment with ECS

1. **Task Definition:**

```json
{
  "family": "memorai-platform",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "2048",
  "memory": "4096",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "memorai-mcp",
      "image": "memorai/mcp-server:latest",
      "portMappings": [
        {
          "containerPort": 4950,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "MEMORAI_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:memorai/api-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/memorai-platform",
          "awslogs-region": "us-west-2",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:4950/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

2. **Service Definition:**

```json
{
  "serviceName": "memorai-platform",
  "cluster": "memorai-cluster",
  "taskDefinition": "memorai-platform:1",
  "desiredCount": 3,
  "launchType": "FARGATE",
  "networkConfiguration": {
    "awsvpcConfiguration": {
      "subnets": ["subnet-12345", "subnet-67890"],
      "securityGroups": ["sg-abcdef"],
      "assignPublicIp": "ENABLED"
    }
  },
  "loadBalancers": [
    {
      "targetGroupArn": "arn:aws:elasticloadbalancing:region:account:targetgroup/memorai-tg",
      "containerName": "memorai-mcp",
      "containerPort": 4950
    }
  ],
  "serviceRegistries": [
    {
      "registryArn": "arn:aws:servicediscovery:region:account:service/srv-memorai"
    }
  ]
}
```

### Google Cloud Platform with Cloud Run

```yaml
# cloud-run.yml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: memorai-platform
  namespace: default
  annotations:
    run.googleapis.com/ingress: all
    run.googleapis.com/execution-environment: gen2
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/maxScale: "100"
        autoscaling.knative.dev/minScale: "2"
        run.googleapis.com/cpu-throttling: "true"
        run.googleapis.com/memory: "2Gi"
        run.googleapis.com/cpu: "2"
    spec:
      containerConcurrency: 100
      containers:
      - image: gcr.io/project-id/memorai-mcp:latest
        ports:
        - containerPort: 4950
        env:
        - name: NODE_ENV
          value: "production"
        - name: MEMORAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: memorai-secrets
              key: api-key
        resources:
          limits:
            memory: "2Gi"
            cpu: "2"
        livenessProbe:
          httpGet:
            path: /health
            port: 4950
          initialDelaySeconds: 30
          periodSeconds: 10
        startupProbe:
          httpGet:
            path: /ready
            port: 4950
          initialDelaySeconds: 5
          periodSeconds: 5
          failureThreshold: 30
```

### Azure Container Instances

```yaml
# azure-container-group.yml
apiVersion: 2019-12-01
location: eastus
name: memorai-platform
properties:
  containers:
  - name: memorai-mcp
    properties:
      image: memorai/mcp-server:latest
      ports:
      - port: 4950
        protocol: TCP
      environmentVariables:
      - name: NODE_ENV
        value: production
      - name: MEMORAI_API_KEY
        secureValue: memorai-prod-key-2025
      resources:
        requests:
          cpu: 2
          memoryInGB: 4
      livenessProbe:
        httpGet:
          path: /health
          port: 4950
        initialDelaySeconds: 30
        periodSeconds: 10
      readinessProbe:
        httpGet:
          path: /ready
          port: 4950
        initialDelaySeconds: 5
        periodSeconds: 5
  osType: Linux
  restartPolicy: Always
  ipAddress:
    type: Public
    ports:
    - port: 4950
      protocol: TCP
    dnsNameLabel: memorai-platform
  diagnostics:
    logAnalytics:
      workspaceId: workspace-id
      workspaceKey: workspace-key
tags:
  environment: production
  application: memorai
```

## Monitoring and Observability Setup

### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "memorai_rules.yml"

scrape_configs:
  - job_name: 'memorai-platform'
    static_configs:
      - targets: ['localhost:4950', 'localhost:4180', 'localhost:4006']
    scrape_interval: 10s
    metrics_path: /metrics
    
  - job_name: 'memorai-health'
    static_configs:
      - targets: ['localhost:4950', 'localhost:4180']
    scrape_interval: 30s
    metrics_path: /health

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

### Grafana Dashboard

```json
{
  "dashboard": {
    "id": null,
    "title": "MemorAI Platform Monitoring",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(memorai_requests_total[5m])",
            "legendFormat": "{{service}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(memorai_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "singlestat",
        "targets": [
          {
            "expr": "rate(memorai_errors_total[5m]) / rate(memorai_requests_total[5m]) * 100"
          }
        ]
      },
      {
        "title": "Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "memorai_memory_usage",
            "legendFormat": "{{service}}"
          }
        ]
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "5s"
  }
}
```

## Performance Optimization

### Database Optimization

```sql
-- Index optimization for CBD Database
CREATE INDEX CONCURRENTLY idx_memories_agent_id ON memories(agent_id);
CREATE INDEX CONCURRENTLY idx_memories_created_at ON memories(created_at);
CREATE INDEX CONCURRENTLY idx_memories_metadata_gin ON memories USING gin(metadata);

-- Vector index for embeddings
CREATE INDEX CONCURRENTLY idx_memories_embedding_cosine 
ON memories USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Partial indexes for common queries
CREATE INDEX CONCURRENTLY idx_memories_active 
ON memories(agent_id, created_at) 
WHERE deleted_at IS NULL;
```

### Caching Strategy

```typescript
// Redis configuration for production
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: 0,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  family: 4,
  keyPrefix: 'memorai:',
  enableAutoPipelining: true
};

// Cache strategies
const cacheStrategies = {
  // Memory search results - 5 minutes
  searchResults: { ttl: 300, prefix: 'search:' },
  
  // User preferences - 1 hour
  userPreferences: { ttl: 3600, prefix: 'prefs:' },
  
  // System metrics - 1 minute
  systemMetrics: { ttl: 60, prefix: 'metrics:' },
  
  // Health status - 30 seconds
  healthStatus: { ttl: 30, prefix: 'health:' }
};
```

### Load Balancing

```nginx
# nginx-lb.conf
upstream memorai_backend {
    # Weighted round-robin
    server memorai-1.internal:4950 weight=3;
    server memorai-2.internal:4950 weight=2;
    server memorai-3.internal:4950 weight=1;
    
    # Health checks
    health_check interval=10s fails=3 passes=2;
    
    # Connection limits
    keepalive 32;
    keepalive_requests 100;
    keepalive_timeout 60s;
}

server {
    listen 443 ssl http2;
    server_name api.memorai.com;
    
    # Connection limits
    limit_conn_zone $binary_remote_addr zone=conn_limit_per_ip:10m;
    limit_conn conn_limit_per_ip 20;
    
    # Request rate limiting
    limit_req_zone $binary_remote_addr zone=req_limit_per_ip:10m rate=10r/s;
    limit_req zone=req_limit_per_ip burst=20 nodelay;
    
    location / {
        proxy_pass http://memorai_backend;
        
        # Connection pooling
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        
        # Timeouts
        proxy_connect_timeout 5s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffering
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Security Configuration

### SSL/TLS Setup

```bash
# Generate SSL certificates with Let's Encrypt
sudo apt install certbot python3-certbot-nginx

# Obtain certificates
sudo certbot --nginx -d memorai.com -d api.memorai.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### API Security

```typescript
// Security middleware configuration
const securityConfig = {
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP',
    standardHeaders: true,
    legacyHeaders: false
  },
  
  // CORS configuration
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://memorai.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
  },
  
  // Helmet security headers
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.memorai.com"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }
};
```

### Environment Security

```bash
# Production environment security checklist

# 1. Secure secrets management
export MEMORAI_API_KEY=$(aws secretsmanager get-secret-value --secret-id memorai/api-key --query SecretString --output text)

# 2. Network security
# Configure VPC, security groups, NACLs

# 3. Container security
# Scan images for vulnerabilities
docker scan memorai/mcp-server:latest

# 4. Access controls
# Configure IAM roles and policies

# 5. Logging and monitoring
# Enable CloudTrail, VPC Flow Logs, etc.
```

## Backup and Disaster Recovery

### Database Backup Strategy

```bash
#!/bin/bash
# backup-script.sh

# Configuration
BACKUP_DIR="/backups/memorai"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
pg_dump memorai_production > $BACKUP_DIR/memorai_db_$TIMESTAMP.sql

# Compress backup
gzip $BACKUP_DIR/memorai_db_$TIMESTAMP.sql

# Upload to S3
aws s3 cp $BACKUP_DIR/memorai_db_$TIMESTAMP.sql.gz s3://memorai-backups/database/

# Cleanup old backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Verify backup integrity
gunzip -t $BACKUP_DIR/memorai_db_$TIMESTAMP.sql.gz
if [ $? -eq 0 ]; then
    echo "Backup completed successfully: memorai_db_$TIMESTAMP.sql.gz"
else
    echo "Backup verification failed!" >&2
    exit 1
fi
```

### Disaster Recovery Plan

```yaml
# dr-plan.yml
recovery_procedures:
  rto: 4 hours  # Recovery Time Objective
  rpo: 1 hour   # Recovery Point Objective
  
  scenarios:
    - name: "Service Outage"
      steps:
        - "Switch traffic to backup region"
        - "Validate service health"
        - "Monitor performance"
      
    - name: "Database Corruption"
      steps:
        - "Stop all write operations"
        - "Restore from latest backup"
        - "Replay transaction logs"
        - "Validate data integrity"
        - "Resume operations"
      
    - name: "Complete Datacenter Loss"
      steps:
        - "Activate disaster recovery site"
        - "Restore from geo-replicated backups"
        - "Update DNS records"
        - "Notify stakeholders"

  backup_strategy:
    frequency: "Every 6 hours"
    retention: "30 days"
    location: "Multi-region S3 buckets"
    encryption: "AES-256"
    
  testing:
    frequency: "Monthly"
    scenarios: ["Service failover", "Data restoration"]
    documentation: "Update runbooks after each test"
```

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. Service Won't Start

```bash
# Check port conflicts
netstat -tulpn | grep :4950

# Check logs
docker logs memorai-mcp-container
kubectl logs deployment/memorai-mcp -n memorai

# Verify environment variables
env | grep MEMORAI

# Test connectivity
telnet localhost 4950
curl -f http://localhost:4950/health
```

#### 2. High Memory Usage

```bash
# Check memory consumption
free -h
docker stats
kubectl top pods -n memorai

# Analyze heap dumps
node --inspect memorai-mcp-server.js
# Connect Chrome DevTools -> Memory tab

# Configure memory limits
# Docker
docker run -m 2g memorai/mcp-server:latest

# Kubernetes
resources:
  limits:
    memory: "2Gi"
```

#### 3. Database Connection Issues

```bash
# Test database connectivity
curl http://localhost:4180/health

# Check connection pool
# Monitor active connections in logs

# Verify network connectivity
ping cbd-database-host
telnet cbd-database-host 4180

# Check DNS resolution
nslookup cbd-database-host
```

#### 4. Performance Issues

```bash
# Monitor system metrics
htop
iotop
nethogs

# Check application metrics
curl http://localhost:4950/metrics

# Analyze slow queries
# Enable query logging in database

# Profile application
node --prof memorai-mcp-server.js
node --prof-process isolate-*.log > processed.txt
```

### Debug Configuration

```bash
# Enable debug mode
export DEBUG=memorai:*
export MEMORAI_LOG_LEVEL=debug
export NODE_OPTIONS="--inspect=0.0.0.0:9229"

# Start with debug flags
node --inspect --max-old-space-size=4096 memorai-mcp-server.js

# Memory profiling
node --inspect --expose-gc --max-old-space-size=4096 memorai-mcp-server.js

# CPU profiling
node --prof memorai-mcp-server.js
```

## Maintenance Procedures

### Rolling Updates

```bash
# Docker Compose rolling update
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --no-deps memorai-mcp

# Kubernetes rolling update
kubectl set image deployment/memorai-mcp memorai-mcp=memorai/mcp-server:v2.1.0 -n memorai
kubectl rollout status deployment/memorai-mcp -n memorai

# Rollback if needed
kubectl rollout undo deployment/memorai-mcp -n memorai
```

### Health Monitoring

```bash
# Automated health checks
#!/bin/bash
# health-monitor.sh

SERVICES=("http://localhost:4950/health" "http://localhost:4180/health")
WEBHOOK_URL="https://hooks.slack.com/your-webhook"

for service in "${SERVICES[@]}"; do
    if ! curl -f -s "$service" > /dev/null; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚨 Service down: $service\"}" \
            "$WEBHOOK_URL"
    fi
done

# Run every minute
# */1 * * * * /path/to/health-monitor.sh
```

### Performance Tuning

```bash
# System-level optimizations

# Increase file descriptor limits
echo 'fs.file-max = 65536' >> /etc/sysctl.conf

# Network optimizations
echo 'net.core.somaxconn = 1024' >> /etc/sysctl.conf
echo 'net.ipv4.tcp_max_syn_backlog = 1024' >> /etc/sysctl.conf

# Memory optimizations
echo 'vm.max_map_count = 262144' >> /etc/sysctl.conf

# Apply changes
sysctl -p
```

This comprehensive deployment guide provides everything needed to deploy the MemorAI Platform across different environments, from development to production-scale deployments. Each section includes practical examples, configuration files, and troubleshooting guidance to ensure successful deployments.
