# MemorAI Deployment Guide

## Production Deployment Documentation

### Overview
This guide provides comprehensive instructions for deploying MemorAI in production environments, including containerization, orchestration, monitoring, and maintenance procedures.

## Prerequisites

### System Requirements
- **Minimum Hardware**: 4 vCPU, 8GB RAM, 100GB SSD
- **Recommended Hardware**: 8 vCPU, 16GB RAM, 500GB SSD
- **Operating System**: Ubuntu 20.04 LTS or later
- **Container Runtime**: Docker 20.10+ and Docker Compose 2.0+
- **Orchestration**: Kubernetes 1.24+ (for cluster deployment)

### Software Dependencies
```bash
# Required software
- Node.js 18+
- pnpm 8+
- Docker & Docker Compose
- NGINX (for reverse proxy)
- SSL certificates (Let's Encrypt recommended)
```

## Docker Deployment

### Single Container Deployment

#### 1. Create Production Dockerfile
```dockerfile
# Multi-stage build for optimized production image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Production stage
FROM node:18-alpine AS runner

# Add non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 4006

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4006/api/health || exit 1

# Start application
CMD ["node", "server.js"]
```

#### 2. Build and Run
```bash
# Build image
docker build -t memorai:latest .

# Run container
docker run -d \
  --name memorai-app \
  -p 4006:4006 \
  -e NODE_ENV=production \
  -e NEXTAUTH_SECRET=your-secret-key \
  -e CBD_URL=http://cbd:4180 \
  --restart unless-stopped \
  memorai:latest
```

### Multi-Container Deployment with Docker Compose

#### docker-compose.yml
```yaml
version: '3.8'

services:
  # MemorAI Application
  memorai:
    build: .
    container_name: memorai-app
    restart: unless-stopped
    ports:
      - "4006:4006"
    environment:
      - NODE_ENV=production
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=https://memorai.yourdomain.com
      - CBD_URL=http://cbd:4180
      - REDIS_URL=redis://redis:6379
    depends_on:
      - cbd
      - redis
    networks:
      - memorai-network
    volumes:
      - ./logs:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4006/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # CBD Universal Database
  cbd:
    image: codai/cbd:latest
    container_name: memorai-cbd
    restart: unless-stopped
    ports:
      - "4180:4180"
    environment:
      - CBD_STORAGE_PATH=/data
      - CBD_LOG_LEVEL=info
    volumes:
      - cbd_data:/data
      - ./cbd-logs:/logs
    networks:
      - memorai-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4180/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: memorai-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes --maxmemory 1gb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    networks:
      - memorai-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # NGINX Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: memorai-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - memorai
    networks:
      - memorai-network

  # Monitoring (Prometheus)
  prometheus:
    image: prom/prometheus:latest
    container_name: memorai-prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    networks:
      - memorai-network

  # Grafana Dashboard
  grafana:
    image: grafana/grafana:latest
    container_name: memorai-grafana
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards:ro
      - ./grafana/datasources:/etc/grafana/provisioning/datasources:ro
    networks:
      - memorai-network

volumes:
  cbd_data:
    driver: local
  redis_data:
    driver: local
  prometheus_data:
    driver: local
  grafana_data:
    driver: local

networks:
  memorai-network:
    driver: bridge
```

#### NGINX Configuration
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream memorai_backend {
        server memorai:4006;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=search:10m rate=5r/s;

    server {
        listen 80;
        server_name memorai.yourdomain.com;
        
        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name memorai.yourdomain.com;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # Security Headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

        # Compression
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;

        # Main application
        location / {
            proxy_pass http://memorai_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # API rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://memorai_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Search API with stricter limits
        location /api/search/ {
            limit_req zone=search burst=10 nodelay;
            proxy_pass http://memorai_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static assets caching
        location /_next/static/ {
            proxy_pass http://memorai_backend;
            proxy_cache_valid 200 1y;
            add_header Cache-Control "public, immutable";
        }

        # Health check endpoint
        location /health {
            access_log off;
            proxy_pass http://memorai_backend/api/health;
        }
    }
}
```

## Kubernetes Deployment

### Kubernetes Manifests

#### 1. Namespace
```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: memorai
  labels:
    name: memorai
```

#### 2. ConfigMap
```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: memorai-config
  namespace: memorai
data:
  NODE_ENV: "production"
  CBD_URL: "http://cbd-service:4180"
  REDIS_URL: "redis://redis-service:6379"
  NEXTAUTH_URL: "https://memorai.yourdomain.com"
```

#### 3. Secrets
```yaml
# secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: memorai-secrets
  namespace: memorai
type: Opaque
data:
  NEXTAUTH_SECRET: <base64-encoded-secret>
  CODAI_CLIENT_SECRET: <base64-encoded-secret>
```

#### 4. Deployment
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: memorai-app
  namespace: memorai
  labels:
    app: memorai
spec:
  replicas: 3
  selector:
    matchLabels:
      app: memorai
  template:
    metadata:
      labels:
        app: memorai
    spec:
      containers:
      - name: memorai
        image: memorai:latest
        ports:
        - containerPort: 4006
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: memorai-config
              key: NODE_ENV
        - name: CBD_URL
          valueFrom:
            configMapKeyRef:
              name: memorai-config
              key: CBD_URL
        - name: NEXTAUTH_SECRET
          valueFrom:
            secretKeyRef:
              name: memorai-secrets
              key: NEXTAUTH_SECRET
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 4006
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 4006
          initialDelaySeconds: 5
          periodSeconds: 5
      imagePullSecrets:
      - name: registry-secret
```

#### 5. Service
```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: memorai-service
  namespace: memorai
spec:
  selector:
    app: memorai
  ports:
  - protocol: TCP
    port: 80
    targetPort: 4006
  type: ClusterIP
```

#### 6. Ingress
```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: memorai-ingress
  namespace: memorai
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
spec:
  tls:
  - hosts:
    - memorai.yourdomain.com
    secretName: memorai-tls
  rules:
  - host: memorai.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: memorai-service
            port:
              number: 80
```

## Monitoring & Observability

### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

scrape_configs:
  - job_name: 'memorai'
    static_configs:
      - targets: ['memorai:4006']
    metrics_path: '/api/metrics'
    scrape_interval: 30s

  - job_name: 'cbd'
    static_configs:
      - targets: ['cbd:4180']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

### Alert Rules
```yaml
# alert_rules.yml
groups:
- name: memorai.rules
  rules:
  - alert: HighResponseTime
    expr: avg_over_time(http_request_duration_seconds[5m]) > 1
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "High response time detected"
      description: "Average response time is {{ $value }}s"

  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
      description: "Error rate is {{ $value }} errors per second"

  - alert: HighMemoryUsage
    expr: process_resident_memory_bytes / 1024 / 1024 > 1000
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High memory usage"
      description: "Memory usage is {{ $value }}MB"
```

### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "MemorAI Performance Dashboard",
    "panels": [
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "avg_over_time(http_request_duration_seconds[5m])",
            "legendFormat": "Avg Response Time"
          }
        ]
      },
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "Requests/sec"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "Errors/sec"
          }
        ]
      }
    ]
  }
}
```

## Security Configuration

### SSL Certificate Setup (Let's Encrypt)
```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d memorai.yourdomain.com

# Auto-renewal cron job
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### Firewall Configuration
```bash
# UFW firewall rules
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Docker Security
```bash
# Run containers as non-root user
# Use multi-stage builds to minimize attack surface
# Scan images for vulnerabilities
docker scan memorai:latest

# Use Docker secrets for sensitive data
echo "your-secret-key" | docker secret create nextauth_secret -
```

## Backup & Recovery

### Database Backup Script
```bash
#!/bin/bash
# backup-cbd.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/cbd"
CONTAINER_NAME="memorai-cbd"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup CBD data
docker exec $CONTAINER_NAME cbd-backup --output /tmp/backup_$DATE.cbd
docker cp $CONTAINER_NAME:/tmp/backup_$DATE.cbd $BACKUP_DIR/

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.cbd

# Clean old backups (keep 7 days)
find $BACKUP_DIR -name "backup_*.cbd.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.cbd.gz"
```

### Automated Backup with Cron
```bash
# Add to crontab
0 2 * * * /scripts/backup-cbd.sh >> /var/log/backup.log 2>&1
```

### Recovery Procedure
```bash
#!/bin/bash
# restore-cbd.sh

BACKUP_FILE=$1
CONTAINER_NAME="memorai-cbd"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup-file>"
    exit 1
fi

# Stop application
docker-compose stop memorai

# Restore database
gunzip -c $BACKUP_FILE | docker exec -i $CONTAINER_NAME cbd-restore --input -

# Start application
docker-compose start memorai

echo "Recovery completed from $BACKUP_FILE"
```

## Environment-Specific Configurations

### Development Environment
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  memorai:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_URL=http://localhost:4006
    ports:
      - "4006:4006"
```

### Staging Environment
```yaml
# docker-compose.staging.yml
version: '3.8'
services:
  memorai:
    image: memorai:staging
    environment:
      - NODE_ENV=staging
      - NEXTAUTH_URL=https://staging.memorai.yourdomain.com
    deploy:
      replicas: 2
```

### Production Environment
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  memorai:
    image: memorai:latest
    environment:
      - NODE_ENV=production
      - NEXTAUTH_URL=https://memorai.yourdomain.com
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'
```

## Deployment Scripts

### Automated Deployment Script
```bash
#!/bin/bash
# deploy.sh

set -e

ENVIRONMENT=${1:-production}
VERSION=${2:-latest}

echo "Deploying MemorAI $VERSION to $ENVIRONMENT"

# Build and tag image
docker build -t memorai:$VERSION .
docker tag memorai:$VERSION memorai:latest

# Deploy based on environment
case $ENVIRONMENT in
    "development")
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
        ;;
    "staging")
        docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d
        ;;
    "production")
        # Backup before deployment
        ./scripts/backup-cbd.sh
        
        # Deploy with zero downtime
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
        
        # Health check
        sleep 30
        if curl -f http://localhost:4006/api/health; then
            echo "Deployment successful"
        else
            echo "Deployment failed - rolling back"
            docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
            exit 1
        fi
        ;;
    *)
        echo "Unknown environment: $ENVIRONMENT"
        exit 1
        ;;
esac

# Clean up old images
docker image prune -f

echo "Deployment completed successfully"
```

### Health Check Script
```bash
#!/bin/bash
# health-check.sh

ENDPOINT="https://memorai.yourdomain.com/api/health"
MAX_RETRIES=5
RETRY_DELAY=10

for i in $(seq 1 $MAX_RETRIES); do
    if curl -sf $ENDPOINT; then
        echo "Health check passed"
        exit 0
    else
        echo "Health check failed (attempt $i/$MAX_RETRIES)"
        sleep $RETRY_DELAY
    fi
done

echo "Health check failed after $MAX_RETRIES attempts"
exit 1
```

## Maintenance Procedures

### Rolling Updates
```bash
# Zero-downtime deployment
docker-compose up -d --scale memorai=3 --no-recreate memorai-new
docker-compose stop memorai
docker-compose rm -f memorai
docker-compose up -d --scale memorai-new=0 memorai
```

### Log Rotation
```bash
# logrotate configuration
/var/log/memorai/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    postrotate
        docker-compose restart memorai
    endscript
}
```

### Performance Tuning
```bash
# System optimization
echo 'vm.swappiness=10' >> /etc/sysctl.conf
echo 'fs.file-max=65536' >> /etc/sysctl.conf
sysctl -p

# Docker optimization
echo '{"log-driver": "json-file", "log-opts": {"max-size": "10m", "max-file": "3"}}' > /etc/docker/daemon.json
systemctl restart docker
```

---

This deployment guide provides comprehensive instructions for deploying MemorAI in various environments with proper monitoring, security, and maintenance procedures.
