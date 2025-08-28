# Cautai Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying Cautai (AI-first search engine) across different environments from development to production.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Frontend  │    │   HTTP Server   │    │   MCP Server    │
│   (Next.js)     │────│   (Fastify)     │────│   (stdio)       │
│   Port 3001     │    │   Port 3000     │    │   Port 3002     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │     Redis       │    │   Elasticsearch │
│   Port 5432     │    │   Port 6379     │    │   Port 9200     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

### System Requirements

#### Minimum Requirements
- **CPU**: 2 cores, 2.0 GHz
- **Memory**: 4 GB RAM
- **Storage**: 20 GB available space
- **Network**: Stable internet connection

#### Recommended Requirements
- **CPU**: 4+ cores, 3.0+ GHz
- **Memory**: 8+ GB RAM
- **Storage**: 50+ GB SSD
- **Network**: High-speed broadband

#### Production Requirements
- **CPU**: 8+ cores, 3.5+ GHz
- **Memory**: 16+ GB RAM
- **Storage**: 100+ GB NVMe SSD
- **Network**: Dedicated bandwidth

### Software Dependencies

#### Required Software
```bash
# Node.js (18.0.0 or later)
node --version  # Should be >= 18.0.0

# pnpm (8.0.0 or later)
pnpm --version  # Should be >= 8.0.0

# Docker (24.0.0 or later)
docker --version  # Should be >= 24.0.0

# Docker Compose (2.20.0 or later)
docker compose version  # Should be >= 2.20.0

# Git (2.30.0 or later)
git --version  # Should be >= 2.30.0
```

#### Optional Software (for development)
```bash
# VS Code with extensions
code --version

# PostgreSQL client (for database management)
psql --version

# Redis client (for cache management)
redis-cli --version
```

## Environment Setup

### Development Environment

#### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-org/cautai.git
cd cautai

# Verify repository structure
ls -la
# Should contain: apps/, packages/, docker/, scripts/, tests/
```

#### 2. Install Dependencies

```bash
# Install all workspace dependencies
pnpm install

# Verify installation
pnpm list --depth=0

# Build shared packages
pnpm build:packages
```

#### 3. Environment Configuration

```bash
# Copy environment files
cp .env.example .env.local
cp apps/cautai-server/.env.example apps/cautai-server/.env.local
cp apps/romcp-web/.env.example apps/romcp-web/.env.local
```

Edit `.env.local`:
```bash
# Database Configuration
DATABASE_URL="postgresql://cautai_user:cautai_password@localhost:5432/cautai_dev"
REDIS_URL="redis://localhost:6379"

# API Configuration
HTTP_SERVER_PORT=3000
MCP_SERVER_PORT=3002
WEB_FRONTEND_PORT=3001

# Search Configuration
DUCKDUCKGO_USER_AGENT="CautaiBot/1.0"
SEARCH_TIMEOUT=10000
MAX_RESULTS_PER_QUERY=100

# Security Configuration
JWT_SECRET="development-jwt-secret-change-in-production"
API_RATE_LIMIT=100
CORS_ORIGIN="http://localhost:3001"

# Feature Flags
ENABLE_SEARCH_CACHING=true
ENABLE_RESULT_DEDUPLICATION=true
ENABLE_SEMANTIC_RANKING=false  # Requires external AI service
```

#### 4. Database Setup

```bash
# Start PostgreSQL and Redis
docker compose -f docker-compose.cautai.dev.yml up -d postgres redis

# Wait for services to be ready
sleep 10

# Run database migrations
pnpm --filter @cautai/server db:migrate

# Seed development data (optional)
pnpm --filter @cautai/server db:seed
```

#### 5. Start Development Services

```bash
# Option 1: Start all services with Docker
docker compose -f docker-compose.cautai.dev.yml up

# Option 2: Start services individually for development
# Terminal 1: MCP Server
pnpm --filter @cautai/mcp dev

# Terminal 2: HTTP Server
pnpm --filter @cautai/server dev

# Terminal 3: Web Frontend
pnpm --filter @cautai/web dev

# Terminal 4: CLI (for testing)
pnpm --filter @cautai/cli dev
```

#### 6. Verify Development Setup

```bash
# Check service health
curl http://localhost:3000/health
curl http://localhost:3001/api/health

# Test search functionality
curl -X POST http://localhost:3000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"query": "artificial intelligence", "limit": 5}'

# Test MCP server (via CLI)
pnpm --filter @cautai/cli search "machine learning"
```

### Staging Environment

#### 1. Server Preparation

```bash
# Update system packages (Ubuntu/Debian)
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

#### 2. Application Setup

```bash
# Create application directory
sudo mkdir -p /opt/cautai
sudo chown $USER:$USER /opt/cautai
cd /opt/cautai

# Clone repository
git clone https://github.com/your-org/cautai.git .

# Install dependencies
pnpm install --frozen-lockfile

# Build all packages
pnpm build
```

#### 3. Environment Configuration

Create `/opt/cautai/.env.staging`:
```bash
# Database Configuration
DATABASE_URL="postgresql://cautai_user:secure_password@localhost:5432/cautai_staging"
REDIS_URL="redis://localhost:6379/1"

# API Configuration
NODE_ENV=staging
HTTP_SERVER_PORT=3000
MCP_SERVER_PORT=3002
WEB_FRONTEND_PORT=3001

# External Service URLs
NEXT_PUBLIC_API_URL="https://staging-api.cautai.ro"
NEXT_PUBLIC_APP_URL="https://staging.cautai.ro"

# Search Configuration
DUCKDUCKGO_USER_AGENT="CautaiBot/1.0 (staging)"
SEARCH_TIMEOUT=15000
MAX_RESULTS_PER_QUERY=50

# Security Configuration (Use secure random values)
JWT_SECRET="staging-jwt-secret-64-characters-long-random-string-here"
API_RATE_LIMIT=200
CORS_ORIGIN="https://staging.cautai.ro"

# SSL Configuration
SSL_CERT_PATH="/etc/ssl/certs/cautai-staging.pem"
SSL_KEY_PATH="/etc/ssl/private/cautai-staging.key"

# Monitoring Configuration
ENABLE_METRICS=true
METRICS_PORT=9090
LOG_LEVEL=info
```

#### 4. SSL Certificate Setup

```bash
# Install Certbot
sudo apt install snapd
sudo snap install --classic certbot

# Generate SSL certificates
sudo certbot certonly --standalone -d staging.cautai.ro -d staging-api.cautai.ro

# Setup auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### 5. Database Setup

```bash
# Start database services
docker compose -f docker-compose.cautai.yml up -d postgres redis elasticsearch

# Wait for services
sleep 30

# Run migrations
NODE_ENV=staging pnpm --filter @cautai/server db:migrate

# Setup database backup
cat << 'EOF' > /opt/cautai/scripts/backup-db.sh
#!/bin/bash
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > /opt/cautai/backups/cautai_staging_$BACKUP_DATE.sql
# Keep only last 7 days of backups
find /opt/cautai/backups -name "*.sql" -mtime +7 -delete
EOF

chmod +x /opt/cautai/scripts/backup-db.sh
sudo mkdir -p /opt/cautai/backups

# Setup cron job for database backup
echo "0 2 * * * /opt/cautai/scripts/backup-db.sh" | crontab -
```

#### 6. Start Staging Services

```bash
# Start all services
docker compose -f docker-compose.cautai.yml up -d

# Verify services are running
docker ps
curl https://staging-api.cautai.ro/health
curl https://staging.cautai.ro/api/health
```

### Production Environment

#### 1. Infrastructure Setup

##### Option A: Docker Swarm Deployment

```bash
# Initialize Docker Swarm
docker swarm init

# Create production overlay network
docker network create --driver overlay cautai-network

# Deploy stack
docker stack deploy -c docker-compose.cautai.prod.yml cautai

# Verify deployment
docker service ls
docker stack ps cautai
```

##### Option B: Kubernetes Deployment

Create `k8s/cautai-namespace.yaml`:
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: cautai-production
```

Create `k8s/cautai-configmap.yaml`:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: cautai-config
  namespace: cautai-production
data:
  NODE_ENV: "production"
  HTTP_SERVER_PORT: "3000"
  MCP_SERVER_PORT: "3002"
  WEB_FRONTEND_PORT: "3001"
  LOG_LEVEL: "warn"
```

Create `k8s/cautai-secret.yaml`:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: cautai-secrets
  namespace: cautai-production
type: Opaque
stringData:
  DATABASE_URL: "postgresql://username:password@host:5432/database"
  REDIS_URL: "redis://host:6379"
  JWT_SECRET: "production-jwt-secret"
```

Create `k8s/cautai-deployment.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cautai-api
  namespace: cautai-production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: cautai-api
  template:
    metadata:
      labels:
        app: cautai-api
    spec:
      containers:
      - name: cautai-api
        image: cautai/server:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: cautai-config
        - secretRef:
            name: cautai-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

Deploy to Kubernetes:
```bash
kubectl apply -f k8s/
kubectl get pods -n cautai-production
kubectl get services -n cautai-production
```

#### 2. Load Balancer Configuration

##### Nginx Configuration (`/etc/nginx/sites-available/cautai`)

```nginx
upstream cautai_api {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001 backup;
}

upstream cautai_web {
    server 127.0.0.1:3001;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name cautai.ro api.cautai.ro;
    return 301 https://$server_name$request_uri;
}

# API Server
server {
    listen 443 ssl http2;
    server_name api.cautai.ro;

    ssl_certificate /etc/ssl/certs/cautai.pem;
    ssl_certificate_key /etc/ssl/private/cautai.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000";

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    location / {
        proxy_pass http://cautai_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # Health check
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
    }

    # Health check endpoint (bypass rate limiting)
    location /health {
        limit_req off;
        proxy_pass http://cautai_api;
    }
}

# Web Frontend
server {
    listen 443 ssl http2;
    server_name cautai.ro;

    ssl_certificate /etc/ssl/certs/cautai.pem;
    ssl_certificate_key /etc/ssl/private/cautai.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000";

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    location / {
        proxy_pass http://cautai_web;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static assets with long cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://cautai_web;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/cautai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 3. Database Configuration

##### PostgreSQL Production Setup

```bash
# Install PostgreSQL 15
sudo apt install postgresql-15 postgresql-client-15

# Create database and user
sudo -u postgres psql << EOF
CREATE USER cautai_prod WITH PASSWORD 'secure_production_password';
CREATE DATABASE cautai_prod OWNER cautai_prod;
GRANT ALL PRIVILEGES ON DATABASE cautai_prod TO cautai_prod;
\q
EOF

# Configure PostgreSQL for production
sudo vim /etc/postgresql/15/main/postgresql.conf
```

Update PostgreSQL configuration:
```
# Memory settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 8MB
maintenance_work_mem = 128MB

# WAL settings
wal_buffers = 8MB
checkpoint_completion_target = 0.9
checkpoint_timeout = 10min

# Connection settings
max_connections = 200

# Logging
log_statement = 'ddl'
log_duration = on
log_min_duration_statement = 1000
```

Configure authentication (`/etc/postgresql/15/main/pg_hba.conf`):
```
# Local connections
local   all             cautai_prod                    md5
host    cautai_prod     cautai_prod     127.0.0.1/32   md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

##### Redis Production Setup

```bash
# Install Redis
sudo apt install redis-server

# Configure Redis for production
sudo vim /etc/redis/redis.conf
```

Update Redis configuration:
```
# Network
bind 127.0.0.1
port 6379

# Security
requirepass secure_redis_password

# Persistence
save 900 1
save 300 10
save 60 10000

# Memory management
maxmemory 512mb
maxmemory-policy allkeys-lru

# Logging
loglevel notice
logfile /var/log/redis/redis-server.log
```

Restart Redis:
```bash
sudo systemctl restart redis-server
```

#### 4. Monitoring and Logging

##### Prometheus Configuration

Create `/opt/monitoring/prometheus.yml`:
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'cautai-api'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: /metrics

  - job_name: 'cautai-web'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: /api/metrics

  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:9121']

  - job_name: 'nginx'
    static_configs:
      - targets: ['localhost:9113']
```

##### Grafana Dashboard

Start monitoring stack:
```bash
docker compose -f docker-compose.monitoring.yml up -d
```

Create Grafana dashboard for Cautai metrics:
- Search response times
- Search result counts
- API error rates
- Database connection pools
- Redis cache hit rates
- System resource usage

##### Log Management

Configure log rotation (`/etc/logrotate.d/cautai`):
```
/opt/cautai/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    sharedscripts
    postrotate
        systemctl reload cautai
    endscript
}
```

#### 5. Backup Strategy

##### Database Backup Script

Create `/opt/cautai/scripts/backup-production.sh`:
```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/opt/cautai/backups"
DB_NAME="cautai_prod"
DB_USER="cautai_prod"
RETENTION_DAYS=30
S3_BUCKET="cautai-backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/cautai_prod_$TIMESTAMP.sql"

echo "Creating database backup..."
pg_dump -h localhost -U $DB_USER $DB_NAME > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Upload to S3 (optional)
if command -v aws &> /dev/null; then
    echo "Uploading backup to S3..."
    aws s3 cp $BACKUP_FILE.gz s3://$S3_BUCKET/database/
fi

# Clean old backups
echo "Cleaning old backups..."
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Redis backup
redis-cli --rdb $BACKUP_DIR/redis_$TIMESTAMP.rdb

echo "Backup completed: $BACKUP_FILE.gz"
```

Make executable and schedule:
```bash
chmod +x /opt/cautai/scripts/backup-production.sh
echo "0 2 * * * /opt/cautai/scripts/backup-production.sh" | crontab -
```

##### Application Data Backup

Create `/opt/cautai/scripts/backup-app-data.sh`:
```bash
#!/bin/bash

BACKUP_DIR="/opt/cautai/backups"
APP_DIR="/opt/cautai"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup configuration files
tar -czf $BACKUP_DIR/config_$TIMESTAMP.tar.gz \
    $APP_DIR/.env.production \
    $APP_DIR/docker-compose.cautai.prod.yml \
    /etc/nginx/sites-available/cautai

# Backup uploaded files (if any)
if [ -d "$APP_DIR/uploads" ]; then
    tar -czf $BACKUP_DIR/uploads_$TIMESTAMP.tar.gz $APP_DIR/uploads
fi

echo "Application data backup completed"
```

## Deployment Automation

### CI/CD Pipeline

#### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy Cautai

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '8'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Build packages
        run: pnpm build:packages
        
      - name: Run tests
        run: pnpm test
        
      - name: Run E2E tests
        run: pnpm test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v3
        
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
          
      - name: Build and push Docker images
        run: |
          docker build -t cautai/server:${{ github.sha }} apps/cautai-server
          docker build -t cautai/web:${{ github.sha }} apps/romcp-web
          docker push cautai/server:${{ github.sha }}
          docker push cautai/web:${{ github.sha }}

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    steps:
      - name: Deploy to staging
        run: |
          # SSH to staging server and deploy
          ssh -o StrictHostKeyChecking=no ${{ secrets.STAGING_USER }}@${{ secrets.STAGING_HOST }} << 'EOF'
            cd /opt/cautai
            git pull origin develop
            docker compose -f docker-compose.cautai.yml pull
            docker compose -f docker-compose.cautai.yml up -d
          EOF

  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - name: Deploy to production
        run: |
          # SSH to production servers and deploy
          for server in ${{ secrets.PRODUCTION_SERVERS }}; do
            ssh -o StrictHostKeyChecking=no ${{ secrets.PROD_USER }}@$server << 'EOF'
              cd /opt/cautai
              git pull origin main
              docker compose -f docker-compose.cautai.prod.yml pull
              docker compose -f docker-compose.cautai.prod.yml up -d
            EOF
          done
```

### Zero-Downtime Deployment

#### Blue-Green Deployment Script

Create `/opt/cautai/scripts/blue-green-deploy.sh`:
```bash
#!/bin/bash

set -e

# Configuration
APP_DIR="/opt/cautai"
BLUE_PORT=3000
GREEN_PORT=3010
HEALTH_CHECK_URL="http://localhost"
TIMEOUT=60

# Determine current active environment
if curl -sf "$HEALTH_CHECK_URL:$BLUE_PORT/health" > /dev/null; then
    ACTIVE_PORT=$BLUE_PORT
    INACTIVE_PORT=$GREEN_PORT
    ACTIVE_ENV="blue"
    INACTIVE_ENV="green"
else
    ACTIVE_PORT=$GREEN_PORT
    INACTIVE_PORT=$BLUE_PORT
    ACTIVE_ENV="green"
    INACTIVE_ENV="blue"
fi

echo "Current active environment: $ACTIVE_ENV (port $ACTIVE_PORT)"
echo "Deploying to inactive environment: $INACTIVE_ENV (port $INACTIVE_PORT)"

# Pull latest code
cd $APP_DIR
git pull origin main

# Build new version in inactive environment
docker compose -f docker-compose.cautai.${INACTIVE_ENV}.yml build
docker compose -f docker-compose.cautai.${INACTIVE_ENV}.yml up -d

# Wait for inactive environment to be healthy
echo "Waiting for $INACTIVE_ENV environment to be ready..."
for i in $(seq 1 $TIMEOUT); do
    if curl -sf "$HEALTH_CHECK_URL:$INACTIVE_PORT/health" > /dev/null; then
        echo "$INACTIVE_ENV environment is healthy!"
        break
    fi
    
    if [ $i -eq $TIMEOUT ]; then
        echo "Deployment failed: $INACTIVE_ENV environment not healthy after ${TIMEOUT}s"
        exit 1
    fi
    
    sleep 1
done

# Switch load balancer to new environment
echo "Switching traffic to $INACTIVE_ENV environment..."
sed -i "s/:$ACTIVE_PORT/:$INACTIVE_PORT/g" /etc/nginx/sites-available/cautai
nginx -s reload

# Verify new environment is receiving traffic
sleep 5
if ! curl -sf "$HEALTH_CHECK_URL/health" > /dev/null; then
    echo "Health check failed after switch, rolling back..."
    sed -i "s/:$INACTIVE_PORT/:$ACTIVE_PORT/g" /etc/nginx/sites-available/cautai
    nginx -s reload
    exit 1
fi

# Stop old environment
echo "Stopping $ACTIVE_ENV environment..."
docker compose -f docker-compose.cautai.${ACTIVE_ENV}.yml down

echo "Deployment completed successfully!"
echo "New active environment: $INACTIVE_ENV (port $INACTIVE_PORT)"
```

## Performance Optimization

### Database Optimization

#### PostgreSQL Tuning

```sql
-- Add indexes for search performance
CREATE INDEX idx_search_results_query ON search_results USING gin(to_tsvector('english', query));
CREATE INDEX idx_search_results_timestamp ON search_results (created_at DESC);
CREATE INDEX idx_search_results_relevance ON search_results (relevance DESC);

-- Add composite indexes
CREATE INDEX idx_search_compound ON search_results (user_id, created_at DESC, relevance DESC);

-- Analyze tables for query planning
ANALYZE search_results;
ANALYZE search_cache;
```

#### Redis Optimization

```bash
# Redis configuration for search caching
redis-cli CONFIG SET maxmemory-policy allkeys-lru
redis-cli CONFIG SET tcp-keepalive 60
redis-cli CONFIG SET timeout 300
```

### Application Performance

#### Node.js Optimization

```javascript
// apps/cautai-server/src/server.ts
import { cpus } from 'os';
import cluster from 'cluster';

if (cluster.isPrimary && process.env.NODE_ENV === 'production') {
    // Fork workers equal to CPU cores
    const numCPUs = cpus().length;
    
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    
    cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} died, restarting...`);
        cluster.fork();
    });
} else {
    // Start application server
    startServer();
}
```

#### Caching Strategy

```typescript
// packages/cautai-mcp/src/cache/multi-tier.ts
export class MultiTierCache {
    private l1Cache: Map<string, any> = new Map(); // In-memory
    private redis: Redis; // L2 cache
    private database: Pool; // L3 persistent cache
    
    async get(key: string): Promise<any> {
        // L1: Memory cache (fastest)
        if (this.l1Cache.has(key)) {
            return this.l1Cache.get(key);
        }
        
        // L2: Redis cache (fast)
        const redisValue = await this.redis.get(key);
        if (redisValue) {
            const parsed = JSON.parse(redisValue);
            this.l1Cache.set(key, parsed);
            return parsed;
        }
        
        // L3: Database cache (slower but persistent)
        const dbResult = await this.database.query(
            'SELECT value FROM search_cache WHERE key = $1 AND expires_at > NOW()',
            [key]
        );
        
        if (dbResult.rows.length > 0) {
            const value = dbResult.rows[0].value;
            await this.redis.setex(key, 3600, JSON.stringify(value));
            this.l1Cache.set(key, value);
            return value;
        }
        
        return null;
    }
}
```

## Security Hardening

### Application Security

#### Environment Variables Security

```bash
# Secure environment file permissions
chmod 600 /opt/cautai/.env.production
chown cautai:cautai /opt/cautai/.env.production

# Use secret management system (e.g., HashiCorp Vault)
export VAULT_ADDR="https://vault.your-org.com"
export VAULT_TOKEN="$(cat /opt/cautai/.vault-token)"

# Retrieve secrets from Vault
DATABASE_PASSWORD="$(vault kv get -field=password secret/cautai/database)"
JWT_SECRET="$(vault kv get -field=jwt_secret secret/cautai/auth)"
```

#### API Security Middleware

```typescript
// apps/cautai-server/src/middleware/security.ts
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

export async function registerSecurityMiddleware(fastify: FastifyInstance) {
    // Security headers
    await fastify.register(helmet, {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
            },
        },
    });
    
    // Rate limiting
    await fastify.register(rateLimit, {
        max: 100,
        timeWindow: '1 minute',
        keyGenerator: (request) => {
            return request.headers['x-forwarded-for'] || request.ip;
        },
    });
    
    // Request validation
    fastify.addHook('preHandler', async (request, reply) => {
        // Validate request size
        if (request.headers['content-length'] && 
            parseInt(request.headers['content-length']) > 1048576) {
            reply.code(413).send({ error: 'Request too large' });
        }
        
        // Validate content type for POST requests
        if (request.method === 'POST' && 
            !request.headers['content-type']?.includes('application/json')) {
            reply.code(400).send({ error: 'Invalid content type' });
        }
    });
}
```

### Server Security

#### Firewall Configuration

```bash
# UFW firewall setup
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (change port if needed)
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow specific application ports (if not behind reverse proxy)
sudo ufw allow 3000/tcp  # API server
sudo ufw allow 3001/tcp  # Web frontend

# Enable firewall
sudo ufw --force enable
sudo ufw status verbose
```

#### SSL/TLS Configuration

```bash
# Generate strong DH parameters
sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048

# Create strong SSL configuration
cat << 'EOF' > /etc/nginx/ssl-params.conf
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers on;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
ssl_ecdh_curve secp384r1;
ssl_session_timeout 10m;
ssl_session_cache shared:SSL:10m;
ssl_session_tickets off;
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;
ssl_dhparam /etc/ssl/certs/dhparam.pem;

# Security headers
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'";
EOF

# Include in Nginx configuration
# Add to server blocks: include /etc/nginx/ssl-params.conf;
```

#### System Updates and Patches

```bash
# Automated security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Configure automatic updates
cat << 'EOF' > /etc/apt/apt.conf.d/50unattended-upgrades
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};

Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "02:00";
EOF

# Enable automatic updates
sudo systemctl enable unattended-upgrades
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues

**Symptoms:**
- Connection timeout errors
- "too many clients" errors
- Slow query performance

**Solutions:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connections
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"

# Check configuration
sudo -u postgres psql -c "SHOW max_connections;"
sudo -u postgres psql -c "SHOW shared_buffers;"

# Restart PostgreSQL if needed
sudo systemctl restart postgresql
```

#### 2. Redis Cache Issues

**Symptoms:**
- Cache miss rates are high
- Redis memory usage at 100%
- Connection refused errors

**Solutions:**
```bash
# Check Redis status
sudo systemctl status redis-server

# Check memory usage
redis-cli INFO memory

# Check cache statistics
redis-cli INFO stats

# Flush cache if needed (caution: removes all data)
redis-cli FLUSHALL

# Restart Redis
sudo systemctl restart redis-server
```

#### 3. Search Performance Issues

**Symptoms:**
- Search timeouts
- Slow search responses
- High CPU usage during searches

**Solutions:**
```bash
# Check search adapter status
curl -X POST http://localhost:3000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "timeout": 5000}'

# Monitor search logs
tail -f /opt/cautai/logs/search.log

# Check database query performance
sudo -u postgres psql cautai_prod -c "
    SELECT query, mean_time, calls 
    FROM pg_stat_statements 
    WHERE query LIKE '%search%' 
    ORDER BY mean_time DESC 
    LIMIT 10;
"
```

#### 4. Docker Container Issues

**Symptoms:**
- Containers not starting
- Out of memory errors
- Port binding conflicts

**Solutions:**
```bash
# Check container status
docker ps -a
docker logs cautai-api
docker logs cautai-web

# Check resource usage
docker stats

# Clean up unused resources
docker system prune -a

# Restart containers
docker compose -f docker-compose.cautai.prod.yml restart
```

### Health Checks

#### Application Health Check Script

Create `/opt/cautai/scripts/health-check.sh`:
```bash
#!/bin/bash

# Configuration
API_URL="http://localhost:3000"
WEB_URL="http://localhost:3001"
MAX_RESPONSE_TIME=5000
EMAIL_ALERT="admin@cautai.ro"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_service() {
    local name=$1
    local url=$2
    local endpoint=$3
    
    echo -n "Checking $name... "
    
    # Check if service responds
    response=$(curl -s -w "%{http_code},%{time_total}" "$url$endpoint" || echo "000,999")
    http_code=$(echo $response | cut -d',' -f1)
    response_time=$(echo $response | cut -d',' -f2)
    
    # Convert response time to milliseconds
    response_time_ms=$(echo "$response_time * 1000" | bc)
    
    if [ "$http_code" = "200" ]; then
        if [ $(echo "$response_time_ms < $MAX_RESPONSE_TIME" | bc) -eq 1 ]; then
            echo -e "${GREEN}OK${NC} (${response_time_ms}ms)"
            return 0
        else
            echo -e "${YELLOW}SLOW${NC} (${response_time_ms}ms)"
            return 1
        fi
    else
        echo -e "${RED}FAIL${NC} (HTTP $http_code)"
        return 1
    fi
}

check_database() {
    echo -n "Checking database... "
    
    if pg_isready -h localhost -p 5432 -U cautai_prod > /dev/null 2>&1; then
        echo -e "${GREEN}OK${NC}"
        return 0
    else
        echo -e "${RED}FAIL${NC}"
        return 1
    fi
}

check_redis() {
    echo -n "Checking Redis... "
    
    if redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}OK${NC}"
        return 0
    else
        echo -e "${RED}FAIL${NC}"
        return 1
    fi
}

# Main health check
echo "Cautai Health Check - $(date)"
echo "================================"

FAILED_CHECKS=0

# Check services
check_service "API Server" "$API_URL" "/health" || FAILED_CHECKS=$((FAILED_CHECKS + 1))
check_service "Web Frontend" "$WEB_URL" "/api/health" || FAILED_CHECKS=$((FAILED_CHECKS + 1))
check_database || FAILED_CHECKS=$((FAILED_CHECKS + 1))
check_redis || FAILED_CHECKS=$((FAILED_CHECKS + 1))

# Check search functionality
echo -n "Checking search functionality... "
search_result=$(curl -s -X POST "$API_URL/api/v1/search" \
    -H "Content-Type: application/json" \
    -d '{"query": "test", "limit": 1}' | jq -r '.results | length' 2>/dev/null)

if [ "$search_result" = "1" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAIL${NC}"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

echo "================================"

if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "Overall status: ${GREEN}HEALTHY${NC}"
    exit 0
else
    echo -e "Overall status: ${RED}UNHEALTHY${NC} ($FAILED_CHECKS failed checks)"
    
    # Send email alert if configured
    if [ -n "$EMAIL_ALERT" ] && command -v mail &> /dev/null; then
        echo "Health check failed with $FAILED_CHECKS issues" | \
        mail -s "Cautai Health Check Alert" "$EMAIL_ALERT"
    fi
    
    exit 1
fi
```

Make executable and schedule:
```bash
chmod +x /opt/cautai/scripts/health-check.sh

# Run health check every 5 minutes
echo "*/5 * * * * /opt/cautai/scripts/health-check.sh >> /var/log/cautai-health.log 2>&1" | crontab -
```

### Performance Monitoring

#### Application Metrics Collection

Create `/opt/cautai/scripts/collect-metrics.sh`:
```bash
#!/bin/bash

METRICS_FILE="/opt/cautai/logs/metrics.log"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# API metrics
API_RESPONSE=$(curl -s http://localhost:3000/metrics 2>/dev/null || echo "{}")
API_REQUESTS=$(echo $API_RESPONSE | jq -r '.requests.total // 0')
API_ERRORS=$(echo $API_RESPONSE | jq -r '.requests.errors // 0')
API_AVG_TIME=$(echo $API_RESPONSE | jq -r '.requests.averageTime // 0')

# Database metrics
DB_CONNECTIONS=$(sudo -u postgres psql -t -c "SELECT count(*) FROM pg_stat_activity;" 2>/dev/null | xargs || echo "0")
DB_SIZE=$(sudo -u postgres psql -t -c "SELECT pg_size_pretty(pg_database_size('cautai_prod'));" 2>/dev/null | xargs || echo "0")

# Redis metrics
REDIS_INFO=$(redis-cli INFO stats 2>/dev/null || echo "")
REDIS_COMMANDS=$(echo "$REDIS_INFO" | grep "total_commands_processed" | cut -d: -f2 | tr -d '\r' || echo "0")
REDIS_MEMORY=$(redis-cli INFO memory | grep "used_memory_human" | cut -d: -f2 | tr -d '\r' || echo "0")

# System metrics
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1 || echo "0")
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}' || echo "0")
DISK_USAGE=$(df -h /opt/cautai | awk 'NR==2 {print $5}' | cut -d'%' -f1 || echo "0")

# Log metrics
echo "$TIMESTAMP,api_requests,$API_REQUESTS" >> $METRICS_FILE
echo "$TIMESTAMP,api_errors,$API_ERRORS" >> $METRICS_FILE
echo "$TIMESTAMP,api_avg_time,$API_AVG_TIME" >> $METRICS_FILE
echo "$TIMESTAMP,db_connections,$DB_CONNECTIONS" >> $METRICS_FILE
echo "$TIMESTAMP,redis_commands,$REDIS_COMMANDS" >> $METRICS_FILE
echo "$TIMESTAMP,cpu_usage,$CPU_USAGE" >> $METRICS_FILE
echo "$TIMESTAMP,memory_usage,$MEMORY_USAGE" >> $METRICS_FILE
echo "$TIMESTAMP,disk_usage,$DISK_USAGE" >> $METRICS_FILE

# Rotate metrics log if it gets too large (keep last 10MB)
if [ -f $METRICS_FILE ]; then
    SIZE=$(stat -c%s "$METRICS_FILE")
    if [ $SIZE -gt 10485760 ]; then
        tail -n 10000 $METRICS_FILE > $METRICS_FILE.tmp
        mv $METRICS_FILE.tmp $METRICS_FILE
    fi
fi
```

Schedule metrics collection:
```bash
chmod +x /opt/cautai/scripts/collect-metrics.sh
echo "* * * * * /opt/cautai/scripts/collect-metrics.sh" | crontab -
```

## Maintenance

### Regular Maintenance Tasks

#### Weekly Maintenance Script

Create `/opt/cautai/scripts/weekly-maintenance.sh`:
```bash
#!/bin/bash

echo "Starting weekly maintenance - $(date)"

# Update system packages
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Clean up Docker resources
echo "Cleaning Docker resources..."
docker system prune -f
docker volume prune -f

# Analyze database
echo "Analyzing database..."
sudo -u postgres psql cautai_prod -c "VACUUM ANALYZE;"

# Clean application logs older than 30 days
echo "Cleaning old logs..."
find /opt/cautai/logs -name "*.log" -mtime +30 -delete

# Check SSL certificate expiration
echo "Checking SSL certificate..."
CERT_EXPIRY=$(openssl x509 -in /etc/ssl/certs/cautai.pem -noout -enddate | cut -d= -f2)
CERT_EXPIRY_TIMESTAMP=$(date -d "$CERT_EXPIRY" +%s)
CURRENT_TIMESTAMP=$(date +%s)
DAYS_UNTIL_EXPIRY=$(( (CERT_EXPIRY_TIMESTAMP - CURRENT_TIMESTAMP) / 86400 ))

if [ $DAYS_UNTIL_EXPIRY -lt 30 ]; then
    echo "WARNING: SSL certificate expires in $DAYS_UNTIL_EXPIRY days!"
    # Send alert email if configured
fi

# Check disk space
echo "Checking disk space..."
DISK_USAGE=$(df /opt/cautai | awk 'NR==2 {print $5}' | cut -d'%' -f1)
if [ $DISK_USAGE -gt 80 ]; then
    echo "WARNING: Disk usage is at ${DISK_USAGE}%"
fi

# Generate weekly report
cat << EOF > /opt/cautai/logs/weekly-report-$(date +%Y%m%d).txt
Cautai Weekly Maintenance Report
Date: $(date)

System Status:
- Disk Usage: ${DISK_USAGE}%
- SSL Certificate Expiry: ${DAYS_UNTIL_EXPIRY} days
- Docker Containers: $(docker ps | wc -l) running
- Database Size: $(sudo -u postgres psql -t -c "SELECT pg_size_pretty(pg_database_size('cautai_prod'));" | xargs)

Recent Errors (last 7 days):
$(grep -i error /opt/cautai/logs/*.log 2>/dev/null | wc -l) error entries found

Performance Metrics (last 7 days):
$(tail -n 10080 /opt/cautai/logs/metrics.log | awk -F, '{sum+=$3; count++} END {print "Average API response time: " sum/count "ms"}' 2>/dev/null || echo "No metrics available")
EOF

echo "Weekly maintenance completed - $(date)"
```

Schedule weekly maintenance:
```bash
chmod +x /opt/cautai/scripts/weekly-maintenance.sh
echo "0 3 * * 0 /opt/cautai/scripts/weekly-maintenance.sh" | crontab -
```

### Updates and Upgrades

#### Application Update Process

Create `/opt/cautai/scripts/update-cautai.sh`:
```bash
#!/bin/bash

set -e

APP_DIR="/opt/cautai"
BACKUP_DIR="/opt/cautai/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "Starting Cautai update process - $(date)"

# Create backup before update
echo "Creating backup..."
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/cautai_backup_$TIMESTAMP.tar.gz \
    -C $APP_DIR --exclude='node_modules' --exclude='logs' --exclude='backups' .

# Check if backup was created successfully
if [ ! -f "$BACKUP_DIR/cautai_backup_$TIMESTAMP.tar.gz" ]; then
    echo "ERROR: Backup creation failed"
    exit 1
fi

# Pull latest changes
echo "Pulling latest changes..."
cd $APP_DIR
git fetch origin
git pull origin main

# Install/update dependencies
echo "Updating dependencies..."
pnpm install --frozen-lockfile

# Build application
echo "Building application..."
pnpm build

# Run database migrations if any
echo "Running database migrations..."
pnpm --filter @cautai/server db:migrate

# Restart services using blue-green deployment
echo "Restarting services..."
if [ -f "$APP_DIR/scripts/blue-green-deploy.sh" ]; then
    $APP_DIR/scripts/blue-green-deploy.sh
else
    # Fallback: regular restart
    docker compose -f docker-compose.cautai.prod.yml restart
fi

# Verify services are healthy
echo "Verifying services..."
sleep 10
if /opt/cautai/scripts/health-check.sh; then
    echo "Update completed successfully!"
    
    # Clean old backups (keep last 5)
    ls -t $BACKUP_DIR/cautai_backup_*.tar.gz | tail -n +6 | xargs rm -f
else
    echo "ERROR: Health check failed after update"
    echo "Rolling back..."
    
    # Rollback process
    tar -xzf $BACKUP_DIR/cautai_backup_$TIMESTAMP.tar.gz -C $APP_DIR
    docker compose -f docker-compose.cautai.prod.yml restart
    
    echo "Rollback completed"
    exit 1
fi
```

### Database Maintenance

#### Database Optimization Script

Create `/opt/cautai/scripts/optimize-database.sh`:
```bash
#!/bin/bash

echo "Starting database optimization - $(date)"

# Connect to PostgreSQL
sudo -u postgres psql cautai_prod << EOF

-- Update table statistics
ANALYZE;

-- Reindex tables if fragmentation is high
REINDEX INDEX CONCURRENTLY idx_search_results_query;
REINDEX INDEX CONCURRENTLY idx_search_results_timestamp;

-- Clean up old search results (older than 30 days)
DELETE FROM search_results WHERE created_at < NOW() - INTERVAL '30 days';

-- Clean up old cache entries
DELETE FROM search_cache WHERE expires_at < NOW();

-- Vacuum tables to reclaim space
VACUUM (ANALYZE, VERBOSE) search_results;
VACUUM (ANALYZE, VERBOSE) search_cache;

-- Show database size after cleanup
SELECT 
    pg_size_pretty(pg_database_size('cautai_prod')) as database_size,
    pg_size_pretty(pg_total_relation_size('search_results')) as search_results_size,
    pg_size_pretty(pg_total_relation_size('search_cache')) as search_cache_size;

EOF

echo "Database optimization completed - $(date)"
```

Schedule database optimization:
```bash
chmod +x /opt/cautai/scripts/optimize-database.sh
echo "0 2 * * 1 /opt/cautai/scripts/optimize-database.sh" | crontab -
```

---

This deployment guide provides comprehensive instructions for deploying Cautai across all environments. For specific deployment scenarios or troubleshooting, refer to the relevant sections or contact support.

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅