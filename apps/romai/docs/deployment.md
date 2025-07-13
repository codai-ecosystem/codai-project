# 🚀 ROMAI Deployment Guide

This guide covers production deployment of the ROMAI system across different environments.

## Pre-Deployment Checklist

### ✅ Environment Setup
- [ ] Azure OpenAI credentials configured
- [ ] Production environment variables set
- [ ] SSL certificates obtained (for HTTPS)
- [ ] Domain names configured
- [ ] Monitoring tools setup

### ✅ Security Configuration
- [ ] JWT secrets generated with high entropy
- [ ] Rate limiting configured appropriately
- [ ] CORS origins restricted to your domains
- [ ] Environment variables secured
- [ ] Database credentials encrypted

### ✅ Performance Optimization
- [ ] Production build completed (`pnpm build`)
- [ ] Static assets optimized
- [ ] CDN configured (optional)
- [ ] Health checks implemented
- [ ] Load balancing configured (if needed)

## Environment Variables

### Required Production Variables

```bash
# Azure OpenAI - REQUIRED
AZURE_OPENAI_API_KEY=sk-your-production-key
AZURE_OPENAI_ENDPOINT=https://your-prod.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o

# API Configuration
ROMAI_API_PORT=8000
NODE_ENV=production

# Security - CRITICAL
JWT_SECRET=generate-strong-secret-min-32-chars
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000

# CORS Security
CORS_ORIGIN=https://your-domain.com,https://dashboard.your-domain.com
CORS_CREDENTIALS=true

# Dashboard
ROMAI_DASHBOARD_PORT=4000
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

### Optional Variables

```bash
# Logging
LOG_LEVEL=info
LOG_FILE_PATH=/var/log/romai

# Performance
MAX_REQUEST_SIZE=10mb
REQUEST_TIMEOUT=30000

# Feature Flags
ENABLE_SWAGGER_UI=false
ENABLE_DEBUG_LOGGING=false
```

## Deployment Methods

### 1. Docker Deployment (Recommended)

#### Single Container Deployment

```dockerfile
# Production-optimized Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json pnpm-lock.yaml turbo.json ./
COPY packages/ ./packages/
COPY apps/ ./apps/

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
RUN pnpm build

# Production runtime
FROM node:20-alpine

WORKDIR /app
RUN addgroup -g 1001 -S nodejs
RUN adduser -S romai -u 1001

# Copy built application
COPY --from=builder --chown=romai:nodejs /app/dist ./dist/
COPY --from=builder --chown=romai:nodejs /app/node_modules ./node_modules/
COPY --from=builder --chown=romai:nodejs /app/packages/*/dist ./packages/*/dist/
COPY --from=builder --chown=romai:nodejs /app/apps/*/dist ./apps/*/dist/
COPY --from=builder --chown=romai:nodejs /app/package.json ./

USER romai

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1

EXPOSE 8000 4000

CMD ["sh", "-c", "cd apps/api && node dist/server.js & cd apps/dashboard && npm start & wait"]
```

#### Build and Deploy

```bash
# Build production image
docker build -t romai:latest .

# Create production network
docker network create romai-network

# Run with production configuration
docker run -d \
  --name romai-production \
  --network romai-network \
  -p 8000:8000 \
  -p 4000:4000 \
  --env-file .env.production \
  --restart unless-stopped \
  --memory=4g \
  --cpus=2 \
  romai:latest

# Verify deployment
docker logs romai-production
curl -f http://localhost:8000/health
```

#### Docker Compose (Multi-Service)

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  romai-api:
    build: 
      context: .
      dockerfile: Dockerfile.api
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - romai-network

  romai-dashboard:
    build:
      context: .
      dockerfile: Dockerfile.dashboard
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://romai-api:8000
    restart: unless-stopped
    depends_on:
      - romai-api
    networks:
      - romai-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - romai-api
      - romai-dashboard
    restart: unless-stopped
    networks:
      - romai-network

networks:
  romai-network:
    driver: bridge

volumes:
  romai-data:
```

### 2. Cloud Deployments

#### Google Cloud Run

```bash
# Deploy API Service
gcloud run deploy romai-api \
  --source apps/api \
  --platform managed \
  --region europe-west1 \
  --port 8000 \
  --memory 2Gi \
  --cpu 2 \
  --min-instances 1 \
  --max-instances 10 \
  --set-env-vars NODE_ENV=production \
  --set-env-vars ROMAI_API_PORT=8000 \
  --allow-unauthenticated

# Deploy Dashboard
gcloud run deploy romai-dashboard \
  --source apps/dashboard \
  --platform managed \
  --region europe-west1 \
  --port 4000 \
  --memory 1Gi \
  --cpu 1 \
  --set-env-vars NODE_ENV=production \
  --set-env-vars NEXT_PUBLIC_API_URL=https://romai-api-<hash>-ew.a.run.app \
  --allow-unauthenticated

# Configure custom domain (optional)
gcloud run domain-mappings create \
  --service romai-api \
  --domain api.romai.ro \
  --region europe-west1
```

#### Azure Container Instances

```bash
# Create resource group
az group create --name romai-rg --location westeurope

# Deploy API container
az container create \
  --resource-group romai-rg \
  --name romai-api \
  --image romai:latest \
  --ports 8000 \
  --environment-variables \
    NODE_ENV=production \
    ROMAI_API_PORT=8000 \
  --secure-environment-variables \
    AZURE_OPENAI_API_KEY=$AZURE_OPENAI_API_KEY \
    JWT_SECRET=$JWT_SECRET \
  --memory 4 \
  --cpu 2 \
  --restart-policy Always

# Get public IP
az container show \
  --resource-group romai-rg \
  --name romai-api \
  --query ipAddress.ip \
  --output tsv
```

#### AWS ECS with Fargate

```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name romai-cluster

# Register task definition
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster romai-cluster \
  --service-name romai-service \
  --task-definition romai:1 \
  --desired-count 2 \
  --network-configuration '{
    "awsvpcConfiguration": {
      "subnets": ["subnet-12345", "subnet-67890"],
      "securityGroups": ["sg-abcdef"],
      "assignPublicIp": "ENABLED"
    }
  }'
```

## Monitoring and Maintenance

### Health Checks

```bash
# API Health Check
curl -f http://your-domain.com:8000/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-07-07T10:00:00.000Z",
  "details": {
    "azureOpenAI": "connected",
    "memory": "available"
  }
}
```

### Logging

```bash
# View application logs
docker logs -f romai-production

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f romai-api
```

### Performance Monitoring

```bash
# Monitor resource usage
docker stats romai-production

# Check API performance
curl -w "@curl-format.txt" -o /dev/null -s http://your-domain.com:8000/health
```

## Security Considerations

### 1. Environment Security
- Store sensitive variables in secure vaults (Azure Key Vault, AWS Secrets Manager)
- Rotate JWT secrets regularly
- Use strong, unique passwords

### 2. Network Security
- Configure firewall rules to restrict access
- Use HTTPS only in production
- Implement proper CORS policies

### 3. Application Security
- Keep dependencies updated
- Monitor for security vulnerabilities
- Implement proper input validation

## Troubleshooting

### Common Issues

1. **Azure OpenAI Connection Fails**
   ```bash
   # Check credentials
   curl -H "api-key: $AZURE_OPENAI_API_KEY" \
     "$AZURE_OPENAI_ENDPOINT/openai/deployments?api-version=2023-05-15"
   ```

2. **High Memory Usage**
   ```bash
   # Check memory limits
   docker stats romai-production
   
   # Increase container memory
   docker update --memory=6g romai-production
   ```

3. **Slow API Responses**
   ```bash
   # Check Azure OpenAI quota
   # Monitor API logs for bottlenecks
   docker logs romai-production | grep "response_time"
   ```

## Backup and Recovery

### Data Backup
```bash
# Export configuration
docker exec romai-production env | grep -E "^(AZURE|JWT|CORS)" > backup.env

# Backup logs
docker logs romai-production > romai-logs-$(date +%Y%m%d).log
```

### Disaster Recovery
1. Keep infrastructure as code (Terraform/CloudFormation)
2. Automate deployments with CI/CD
3. Maintain staging environment for testing
4. Document rollback procedures

## Support

For deployment issues:
1. Check the [troubleshooting guide](troubleshooting.md)
2. Review application logs
3. Verify environment configuration
4. Contact support at team@codai.ro
