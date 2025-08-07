# 🏢 RomAI Enterprise On-Premise Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying RomAI Enterprise platform in on-premise environments. The deployment supports both Docker Compose for single-server installations and Kubernetes for scalable cluster deployments.

## 🎯 Deployment Options

### Option 1: Docker Compose Deployment (Recommended for Single Server)
- **Best for**: Small to medium enterprises, development environments, proof of concepts
- **Requirements**: Single server with Docker and Docker Compose
- **Deployment time**: 15-30 minutes
- **Scaling**: Vertical scaling only

### Option 2: Kubernetes Deployment (Recommended for Enterprise Scale)
- **Best for**: Large enterprises, production environments, high availability requirements
- **Requirements**: Kubernetes cluster (on-premise or cloud)
- **Deployment time**: 1-2 hours
- **Scaling**: Horizontal and vertical scaling

## 📋 System Requirements

### Minimum Requirements (Docker Compose)
- **CPU**: 8 cores (Intel Xeon or AMD EPYC recommended)
- **RAM**: 16 GB (32 GB recommended)
- **Storage**: 200 GB SSD (500 GB recommended)
- **Network**: 1 Gbps
- **OS**: Ubuntu 20.04 LTS, CentOS 8, Windows Server 2019, or macOS

### Recommended Requirements (Kubernetes)
- **Master Nodes**: 3 nodes with 4 cores, 8 GB RAM each
- **Worker Nodes**: 3+ nodes with 8 cores, 32 GB RAM each
- **Storage**: 1 TB SSD per node with shared storage (NFS/Ceph)
- **Network**: 10 Gbps with redundancy
- **Load Balancer**: Hardware or software load balancer

### GPU Requirements (Optional but Recommended)
- **NVIDIA GPU**: RTX 3080 or better, Tesla V100, A100
- **VRAM**: Minimum 8 GB (16 GB+ recommended)
- **CUDA**: Version 11.8 or later
- **Driver**: Latest NVIDIA drivers

## 🚀 Quick Start - Docker Compose

### 1. Prerequisites Installation

#### Ubuntu/Debian
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login to apply group changes
```

#### Windows
```powershell
# Install Docker Desktop
# Download from https://docs.docker.com/desktop/windows/install/

# Install PowerShell 7+ (if not already installed)
winget install Microsoft.PowerShell

# Enable execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. Clone and Configure

```bash
# Clone repository
git clone https://github.com/your-org/romai-enterprise.git
cd romai-enterprise

# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

### 3. Deploy Services

#### Linux/macOS
```bash
# Make script executable
chmod +x apps/romai/scripts/deploy-docker.sh

# Build and deploy
./apps/romai/scripts/deploy-docker.sh --build

# Check status
./apps/romai/scripts/deploy-docker.sh --status
```

#### Windows PowerShell
```powershell
# Navigate to project directory
cd apps\romai

# Deploy with build
.\scripts\deploy-docker.ps1 -Build

# Check status
.\scripts\deploy-docker.ps1 -Status
```

### 4. Verify Deployment

```bash
# Check all services are running
docker-compose -f apps/romai/docker-compose.production.yml ps

# Test health endpoints
curl http://localhost:4180/health     # CBD Database
curl http://localhost:6101/health     # AGI Model Server
curl http://localhost:8001/api/v1/health  # Enterprise API

# Access web interface
open http://localhost:6100            # RomAI Frontend
open http://localhost:3000            # Grafana (admin/your-password)
```

## 🎛️ Kubernetes Deployment

### 1. Cluster Prerequisites

```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Verify cluster access
kubectl cluster-info
kubectl get nodes
```

### 2. Prepare Cluster

```bash
# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml

# Install cert-manager for SSL
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.1/cert-manager.yaml

# Install Prometheus Operator (optional)
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring --create-namespace
```

### 3. Configure Secrets

```bash
# Update secrets in k8s/00-namespace.yaml
kubectl create secret generic romai-secrets \
  --from-literal=POSTGRES_PASSWORD=your-secure-password \
  --from-literal=REDIS_PASSWORD=your-redis-password \
  --from-literal=API_SECRET_KEY=your-api-secret \
  --from-literal=JWT_SECRET_KEY=your-jwt-secret \
  --from-literal=AZURE_OPENAI_API_KEY=your-azure-key \
  -n romai-enterprise
```

### 4. Deploy to Kubernetes

```bash
# Make deployment script executable
chmod +x apps/romai/scripts/deploy-k8s.sh

# Build and deploy
export DOCKER_REGISTRY=your-registry.com
export VERSION=v1.0.0
./apps/romai/scripts/deploy-k8s.sh --build

# Monitor deployment
kubectl get pods -n romai-enterprise -w
kubectl get services -n romai-enterprise
kubectl get ingress -n romai-enterprise
```

### 5. Configure DNS and SSL

```bash
# Get ingress IP
kubectl get ingress romai-ingress -n romai-enterprise

# Update DNS records
# romai.enterprise.com      -> INGRESS_IP
# api.romai.enterprise.com  -> INGRESS_IP
# agi.romai.enterprise.com  -> INGRESS_IP

# SSL certificates will be automatically issued by Let's Encrypt
```

## 🔧 Configuration

### Environment Variables

```bash
# Core Configuration
ROMAI_ENV=production
ROMAI_LOG_LEVEL=info
NODE_ENV=production

# Database Configuration
POSTGRES_PASSWORD=your-secure-password
POSTGRES_URL=postgresql://romai:password@postgres:5432/romai_enterprise

# Cache Configuration
REDIS_PASSWORD=your-redis-password
REDIS_URL=redis://:password@redis:6379

# API Configuration
API_SECRET_KEY=your-api-secret-key
JWT_SECRET_KEY=your-jwt-secret-key

# AI Model Configuration
AZURE_OPENAI_API_KEY=your-azure-openai-key
AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=text-embedding-3-large
```

### Resource Limits

```yaml
# Docker Compose Resource Limits
services:
  romai-agi:
    deploy:
      resources:
        limits:
          memory: 8G
          cpus: '4.0'
        reservations:
          memory: 4G
          cpus: '2.0'

  romai-enterprise-api:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 1G
          cpus: '0.5'
```

## 📊 Monitoring and Observability

### Grafana Dashboards

Access Grafana at `http://localhost:3000` (Docker) or `https://grafana.your-domain.com` (Kubernetes)

**Default Credentials:**
- Username: `admin`
- Password: Check your environment configuration

**Pre-configured Dashboards:**
- RomAI System Overview
- AGI Model Performance
- API Gateway Metrics
- Infrastructure Health
- EU AI Act Compliance

### Prometheus Metrics

Access Prometheus at `http://localhost:9090` (Docker) or `https://prometheus.your-domain.com` (Kubernetes)

**Key Metrics:**
- `romai_agi_requests_total` - Total AGI API requests
- `romai_agi_response_time_seconds` - AGI response times
- `romai_api_active_connections` - Active API connections
- `romai_compliance_score` - EU AI Act compliance score

### Log Aggregation

```bash
# View logs (Docker Compose)
docker-compose -f apps/romai/docker-compose.production.yml logs -f

# View logs (Kubernetes)
kubectl logs -f deployment/romai-agi -n romai-enterprise
kubectl logs -f deployment/romai-enterprise-api -n romai-enterprise
```

## 🛡️ Security Configuration

### SSL/TLS Setup

#### Docker Compose
```bash
# Generate self-signed certificates (development)
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/romai.key \
  -out ssl/romai.crt \
  -subj "/C=US/ST=State/L=City/O=RomAI/CN=romai.enterprise.com"

# For production, use certificates from your CA
cp your-domain.crt ssl/romai.crt
cp your-domain.key ssl/romai.key
```

#### Kubernetes
```yaml
# SSL is automatically managed by cert-manager and Let's Encrypt
# Update apps/romai/k8s/05-ingress.yaml with your domain names
```

### Firewall Configuration

```bash
# Ubuntu/Debian UFW
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 6100/tcp    # RomAI Frontend (if needed)
sudo ufw enable

# CentOS/RHEL firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### Network Security

```yaml
# Kubernetes Network Policies (already included)
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: romai-network-policy
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  # Ingress and egress rules defined in k8s/05-ingress.yaml
```

## 🔄 Backup and Recovery

### Database Backup

```bash
# PostgreSQL backup (Docker)
docker exec romai-postgres pg_dump -U romai romai_enterprise > backup_$(date +%Y%m%d_%H%M%S).sql

# PostgreSQL backup (Kubernetes)
kubectl exec -n romai-enterprise deployment/postgres -- pg_dump -U romai romai_enterprise > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Model Cache Backup

```bash
# Docker volumes backup
docker run --rm -v romai_agi_models:/source:ro -v $(pwd):/backup alpine tar czf /backup/models_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C /source .

# Kubernetes PVC backup
kubectl exec -n romai-enterprise deployment/romai-agi -- tar czf /tmp/models_backup.tar.gz -C /app/cache .
kubectl cp romai-enterprise/deployment/romai-agi:/tmp/models_backup.tar.gz ./models_backup_$(date +%Y%m%d_%H%M%S).tar.gz
```

### Automated Backup Script

```bash
#!/bin/bash
# apps/romai/scripts/backup.sh

BACKUP_DIR="/backup/romai/$(date +%Y/%m/%d)"
mkdir -p $BACKUP_DIR

# Database backup
docker exec romai-postgres pg_dump -U romai romai_enterprise | gzip > $BACKUP_DIR/database.sql.gz

# Model cache backup
docker run --rm -v romai_agi_models:/source:ro -v $BACKUP_DIR:/backup alpine \
  tar czf /backup/models.tar.gz -C /source .

# Configuration backup
cp -r config/ $BACKUP_DIR/
cp .env $BACKUP_DIR/

# Retention (keep 30 days)
find /backup/romai -type d -mtime +30 -exec rm -rf {} +
```

## 🔧 Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check logs
docker-compose logs service-name

# Check resource usage
docker stats

# Check disk space
df -h

# Check memory
free -h
```

#### Database Connection Issues
```bash
# Test database connectivity
docker exec romai-postgres psql -U romai -d romai_enterprise -c "SELECT 1;"

# Check database logs
docker logs romai-postgres
```

#### AGI Model Loading Issues
```bash
# Check model cache
docker exec romai-agi ls -la /app/cache/models/

# Check GPU availability (if using GPU)
nvidia-smi

# Check memory usage
docker exec romai-agi free -h
```

### Performance Tuning

#### Database Optimization
```sql
-- PostgreSQL tuning (add to config/postgres/postgresql.conf)
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
```

#### Redis Optimization
```conf
# Redis tuning (add to config/redis/redis.conf)
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

## 📞 Support and Maintenance

### Health Checks

```bash
# All services health check
curl -s http://localhost:4180/health | jq .
curl -s http://localhost:6101/health | jq .
curl -s http://localhost:8001/api/v1/health | jq .
```

### Log Monitoring

```bash
# Monitor critical errors
docker-compose logs --tail=100 | grep -i error

# Monitor performance
docker-compose logs --tail=100 | grep -i "response_time\|latency"
```

### Update Procedures

```bash
# 1. Backup current deployment
./scripts/backup.sh

# 2. Pull latest images
docker-compose pull

# 3. Rolling update
docker-compose up -d --no-deps service-name

# 4. Verify health
./scripts/deploy-docker.ps1 -Status
```

## 📈 Scaling

### Horizontal Scaling (Kubernetes)

```bash
# Scale AGI model server
kubectl scale deployment romai-agi --replicas=5 -n romai-enterprise

# Scale API gateway
kubectl scale deployment romai-enterprise-api --replicas=10 -n romai-enterprise

# Auto-scaling is configured via HPA in the manifests
```

### Vertical Scaling (Docker Compose)

```yaml
# Update docker-compose.production.yml
services:
  romai-agi:
    deploy:
      resources:
        limits:
          memory: 16G  # Increased from 8G
          cpus: '8.0'  # Increased from 4.0
```

## 🏆 Production Checklist

- [ ] SSL certificates configured and valid
- [ ] DNS records pointing to correct IPs
- [ ] Firewall rules configured
- [ ] Monitoring dashboards accessible
- [ ] Backup procedures tested
- [ ] Load testing completed
- [ ] Security scanning passed
- [ ] Compliance requirements met
- [ ] Documentation updated
- [ ] Team training completed

## 📚 Additional Resources

- [RomAI Enterprise API Documentation](./api-documentation.md)
- [EU AI Act Compliance Guide](./compliance-guide.md)
- [Performance Tuning Guide](./performance-tuning.md)
- [Security Best Practices](./security-guide.md)
- [Troubleshooting FAQ](./troubleshooting-faq.md)

---

**Need Help?** Contact our enterprise support team at enterprise-support@romai.com or visit our documentation portal at docs.romai.enterprise.com.
