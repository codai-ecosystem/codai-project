# 🚀 DEPLOYMENT GUIDE TEMPLATE

**Service**: [SERVICE_NAME]  
**Version**: [X.Y.Z]  
**Environment**: [Development | Staging | Production]  
**Deployment Type**: [Docker | Kubernetes | Serverless | Traditional]  
**Last Updated**: [Date]  
**Estimated Deployment Time**: [X] minutes

---

## 🎯 Deployment Overview

[Brief description of the service and deployment requirements]

### Deployment Capabilities:
- ✅ [Deployment feature 1]
- ✅ [Deployment feature 2]
- ✅ [Deployment feature 3]

### Prerequisites Checklist:
- [ ] [Prerequisite 1]
- [ ] [Prerequisite 2]
- [ ] [Prerequisite 3]

---

## 📋 Pre-Deployment Requirements

### System Requirements:
| Component | Minimum | Recommended | Production |
|-----------|---------|-------------|------------|
| CPU | [X] cores | [Y] cores | [Z] cores |
| RAM | [X] GB | [Y] GB | [Z] GB |
| Storage | [X] GB | [Y] GB | [Z] GB |
| Network | [X] Mbps | [Y] Mbps | [Z] Mbps |

### Software Dependencies:
- **Runtime**: [e.g., Node.js 20+, Python 3.11+]
- **Database**: [e.g., PostgreSQL 15+, MongoDB 6+]
- **Cache**: [e.g., Redis 7+]
- **Load Balancer**: [e.g., Nginx, HAProxy]
- **Monitoring**: [e.g., Prometheus, Grafana]

### Environment Variables:
```bash
# Required Variables
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
API_KEY=your_api_key_here
JWT_SECRET=your_jwt_secret

# Optional Variables
LOG_LEVEL=info
CACHE_TTL=3600
MAX_CONNECTIONS=100
```

---

## 🐳 Docker Deployment

### Dockerfile:
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:20-alpine AS runtime

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app
COPY --from=builder --chown=nextjs:nodejs /app ./

USER nextjs
EXPOSE 3000

CMD ["npm", "start"]
```

### Build and Run:
```bash
# Build Docker image
docker build -t [service-name]:latest .

# Run container
docker run -d \
  --name [service-name] \
  -p [external-port]:[internal-port] \
  --env-file .env \
  [service-name]:latest

# Check container status
docker ps
docker logs [service-name]
```

### Docker Compose:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "[external-port]:[internal-port]"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/[dbname]
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    restart: unless-stopped
    
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: [dbname]
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    
  redis:
    image: redis:7-alpine
    restart: unless-stopped

volumes:
  postgres_data:
```

---

## ⚡ Kubernetes Deployment

### Namespace:
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: [service-name]
  labels:
    name: [service-name]
```

### ConfigMap:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: [service-name]-config
  namespace: [service-name]
data:
  LOG_LEVEL: "info"
  CACHE_TTL: "3600"
  MAX_CONNECTIONS: "100"
```

### Secret:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: [service-name]-secrets
  namespace: [service-name]
type: Opaque
data:
  DATABASE_URL: [base64-encoded-value]
  API_KEY: [base64-encoded-value]
  JWT_SECRET: [base64-encoded-value]
```

### Deployment:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: [service-name]
  namespace: [service-name]
  labels:
    app: [service-name]
spec:
  replicas: 3
  selector:
    matchLabels:
      app: [service-name]
  template:
    metadata:
      labels:
        app: [service-name]
    spec:
      containers:
      - name: [service-name]
        image: [registry]/[service-name]:latest
        ports:
        - containerPort: [port]
        envFrom:
        - configMapRef:
            name: [service-name]-config
        - secretRef:
            name: [service-name]-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: [port]
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: [port]
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Service:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: [service-name]-service
  namespace: [service-name]
spec:
  selector:
    app: [service-name]
  ports:
  - protocol: TCP
    port: 80
    targetPort: [port]
  type: ClusterIP
```

### Ingress:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: [service-name]-ingress
  namespace: [service-name]
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
  - hosts:
    - [service-name].example.com
    secretName: [service-name]-tls
  rules:
  - host: [service-name].example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: [service-name]-service
            port:
              number: 80
```

---

## ☁️ Cloud Platform Deployments

### AWS ECS:
```json
{
  "family": "[service-name]",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "[service-name]",
      "image": "[account].dkr.ecr.[region].amazonaws.com/[service-name]:latest",
      "portMappings": [
        {
          "containerPort": [port],
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "NODE_ENV", "value": "production"},
        {"name": "PORT", "value": "[port]"}
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:prod/[service-name]/database-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/[service-name]",
          "awslogs-region": "[region]",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Google Cloud Run:
```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: [service-name]
  annotations:
    run.googleapis.com/ingress: all
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/maxScale: "10"
        run.googleapis.com/cpu-throttling: "false"
    spec:
      containerConcurrency: 100
      containers:
      - image: gcr.io/[project-id]/[service-name]:latest
        ports:
        - containerPort: [port]
        env:
        - name: NODE_ENV
          value: production
        resources:
          limits:
            cpu: 1000m
            memory: 512Mi
```

### Azure Container Instances:
```json
{
  "location": "East US",
  "properties": {
    "containers": [
      {
        "name": "[service-name]",
        "properties": {
          "image": "[registry].azurecr.io/[service-name]:latest",
          "ports": [
            {
              "port": [port],
              "protocol": "TCP"
            }
          ],
          "environmentVariables": [
            {
              "name": "NODE_ENV",
              "value": "production"
            }
          ],
          "resources": {
            "requests": {
              "cpu": 0.5,
              "memoryInGB": 1
            }
          }
        }
      }
    ],
    "osType": "Linux",
    "ipAddress": {
      "type": "Public",
      "ports": [
        {
          "port": [port],
          "protocol": "TCP"
        }
      ]
    }
  }
}
```

---

## 🔧 Configuration Management

### Environment-Specific Configurations:

#### Development:
```yaml
# config/development.yml
database:
  host: localhost
  port: 5432
  name: [service]_dev
  
logging:
  level: debug
  console: true
  
features:
  debug_mode: true
  rate_limiting: false
```

#### Staging:
```yaml
# config/staging.yml
database:
  host: staging-db.example.com
  port: 5432
  name: [service]_staging
  
logging:
  level: info
  console: true
  file: true
  
features:
  debug_mode: false
  rate_limiting: true
```

#### Production:
```yaml
# config/production.yml
database:
  host: prod-db.example.com
  port: 5432
  name: [service]_prod
  
logging:
  level: warn
  console: false
  file: true
  structured: true
  
features:
  debug_mode: false
  rate_limiting: true
  monitoring: true
```

### Configuration Validation:
```javascript
const config = {
  port: process.env.PORT || 3000,
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost/dev'
  },
  jwt: {
    secret: process.env.JWT_SECRET
  }
};

// Validation
if (!config.jwt.secret) {
  throw new Error('JWT_SECRET environment variable is required');
}

if (!config.database.url.startsWith('postgresql://')) {
  throw new Error('Invalid DATABASE_URL format');
}
```

---

## 📊 Health Checks and Monitoring

### Health Check Implementation:
```javascript
// /health endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    uptime: process.uptime(),
    checks: {}
  };
  
  try {
    // Database check
    await db.query('SELECT 1');
    health.checks.database = 'healthy';
  } catch (error) {
    health.checks.database = 'unhealthy';
    health.status = 'degraded';
  }
  
  try {
    // Cache check
    await redis.ping();
    health.checks.cache = 'healthy';
  } catch (error) {
    health.checks.cache = 'unhealthy';
    health.status = 'degraded';
  }
  
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

### Monitoring Configuration:
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: '[service-name]'
    static_configs:
      - targets: ['localhost:[port]']
    metrics_path: /metrics
    scrape_interval: 15s
```

### Grafana Dashboard:
```json
{
  "dashboard": {
    "title": "[Service Name] Dashboard",
    "panels": [
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds_bucket{job=\"[service-name]\"})"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(http_requests_total{job=\"[service-name]\",status=~\"5..\"}[5m])"
          }
        ]
      }
    ]
  }
}
```

---

## 🔒 Security Configuration

### SSL/TLS Configuration:
```nginx
server {
    listen 443 ssl http2;
    server_name [service-name].example.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    location / {
        proxy_pass http://localhost:[port];
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Security Headers:
```javascript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});
```

### Secrets Management:
```bash
# Using Docker secrets
docker secret create db_password db_password.txt
docker service create \
  --secret db_password \
  --name [service-name] \
  [service-name]:latest

# Using Kubernetes secrets
kubectl create secret generic [service-name]-secrets \
  --from-literal=database-password='[password]' \
  --from-literal=api-key='[api-key]'
```

---

## 🚀 Deployment Automation

### CI/CD Pipeline (GitHub Actions):
```yaml
name: Deploy [Service Name]

on:
  push:
    branches: [main]
  release:
    types: [published]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test
      - run: npm run lint
      
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/setup-buildx-action@v2
      - uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ghcr.io/${{ github.repository }}:latest
          
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Production
        run: |
          echo "Deploying to production..."
          # Add deployment commands
```

### Deployment Scripts:
```bash
#!/bin/bash
# deploy.sh

set -e

SERVICE_NAME="[service-name]"
VERSION=${1:-latest}
ENVIRONMENT=${2:-production}

echo "Deploying $SERVICE_NAME:$VERSION to $ENVIRONMENT"

# Pull latest image
docker pull $SERVICE_NAME:$VERSION

# Stop existing container
docker stop $SERVICE_NAME || true
docker rm $SERVICE_NAME || true

# Start new container
docker run -d \
  --name $SERVICE_NAME \
  --restart unless-stopped \
  -p [port]:[port] \
  --env-file ./env/$ENVIRONMENT.env \
  $SERVICE_NAME:$VERSION

# Health check
sleep 10
if curl -f http://localhost:[port]/health; then
  echo "Deployment successful"
else
  echo "Deployment failed"
  exit 1
fi
```

---

## 🔄 Rollback Procedures

### Quick Rollback:
```bash
#!/bin/bash
# rollback.sh

SERVICE_NAME="[service-name]"
PREVIOUS_VERSION=${1}

if [ -z "$PREVIOUS_VERSION" ]; then
  echo "Usage: ./rollback.sh <previous-version>"
  exit 1
fi

echo "Rolling back to $SERVICE_NAME:$PREVIOUS_VERSION"

# Stop current version
docker stop $SERVICE_NAME
docker rm $SERVICE_NAME

# Start previous version
docker run -d \
  --name $SERVICE_NAME \
  --restart unless-stopped \
  -p [port]:[port] \
  --env-file .env \
  $SERVICE_NAME:$PREVIOUS_VERSION

echo "Rollback complete"
```

### Database Rollback:
```sql
-- Create rollback script
BEGIN;

-- Store rollback point
SAVEPOINT rollback_point;

-- Apply database changes
-- ... migration commands ...

-- If issues occur:
-- ROLLBACK TO rollback_point;

-- If successful:
COMMIT;
```

---

## 📋 Post-Deployment Verification

### Verification Checklist:
- [ ] Service is accessible on expected port
- [ ] Health check endpoint returns 200 OK
- [ ] Database connections are working
- [ ] External API integrations are functional
- [ ] Logging is working correctly
- [ ] Monitoring metrics are being collected
- [ ] SSL certificates are valid
- [ ] Authentication is working
- [ ] Performance metrics are within acceptable ranges

### Verification Tests:
```bash
#!/bin/bash
# verify-deployment.sh

BASE_URL="https://[service-name].example.com"

echo "Verifying deployment..."

# Health check
if curl -f "$BASE_URL/health"; then
  echo "✅ Health check passed"
else
  echo "❌ Health check failed"
  exit 1
fi

# API functionality test
if curl -f -H "Authorization: Bearer $TEST_TOKEN" "$BASE_URL/api/test"; then
  echo "✅ API test passed"
else
  echo "❌ API test failed"
  exit 1
fi

# Performance test
RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' "$BASE_URL/health")
if (( $(echo "$RESPONSE_TIME < 1.0" | bc -l) )); then
  echo "✅ Performance test passed ($RESPONSE_TIME seconds)"
else
  echo "⚠️  Performance test warning: slow response ($RESPONSE_TIME seconds)"
fi

echo "✅ All verification tests passed"
```

---

## 🐛 Troubleshooting

### Common Deployment Issues:

#### Issue: Container Won't Start
**Symptoms**: Container exits immediately, status shows "Exited"

**Diagnostic Steps**:
```bash
# Check container logs
docker logs [service-name]

# Check container configuration
docker inspect [service-name]

# Test image directly
docker run -it --rm [service-name]:latest /bin/sh
```

**Common Solutions**:
- Verify environment variables are set correctly
- Check file permissions and ownership
- Ensure all dependencies are installed
- Validate configuration files

#### Issue: Service Unreachable
**Symptoms**: Connection timeouts, 502/503 errors

**Diagnostic Steps**:
```bash
# Check if service is listening
netstat -tlnp | grep [port]

# Test local connectivity
curl localhost:[port]/health

# Check firewall rules
iptables -L

# Verify load balancer configuration
nginx -t
```

#### Issue: Database Connection Failures
**Symptoms**: Database connection errors in logs

**Diagnostic Steps**:
```bash
# Test database connectivity
pg_isready -h [host] -p [port] -U [username]

# Check connection string format
echo $DATABASE_URL

# Verify database exists
psql $DATABASE_URL -c "SELECT version();"
```

### Performance Issues:
```bash
# Monitor resource usage
docker stats [service-name]

# Check application metrics
curl localhost:[port]/metrics

# Analyze slow queries
# Database-specific commands
```

---

## 📞 Support and Escalation

### Deployment Team Contacts:
- **DevOps Lead**: [Name] ([email])
- **Infrastructure Engineer**: [Name] ([email])
- **Security Engineer**: [Name] ([email])

### Escalation Procedures:
1. **L1 Support**: Basic troubleshooting and verification
2. **L2 Support**: Advanced troubleshooting and investigation
3. **L3 Support**: Development team involvement
4. **Emergency Escalation**: Critical production issues

### Emergency Contacts:
- **On-call Engineer**: [Phone/Pager]
- **Team Lead**: [Phone/Pager]
- **Engineering Manager**: [Phone/Pager]

---

## 📋 Deployment Checklist

### Pre-Deployment:
- [ ] Code reviewed and approved
- [ ] Tests passing (unit, integration, e2e)
- [ ] Security scan completed
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Rollback plan prepared

### Deployment:
- [ ] Infrastructure provisioned
- [ ] Environment variables configured
- [ ] Secrets properly managed
- [ ] Database migrations applied
- [ ] Service deployed and started
- [ ] Health checks passing

### Post-Deployment:
- [ ] Functional verification completed
- [ ] Performance metrics within range
- [ ] Monitoring alerts configured
- [ ] Logs being collected properly
- [ ] Security headers verified
- [ ] Documentation updated with deployment details

---

**Status**: 📋 TEMPLATE - Ready for Implementation  
**Template Version**: 1.0.0  
**Created**: July 22, 2025  
**Deployment Types**: Docker, Kubernetes, Cloud Platforms  
**Next Review**: [Schedule review date]

*This template provides comprehensive deployment guidance for CODAI ecosystem services. Customize sections based on your specific deployment requirements and infrastructure.*
