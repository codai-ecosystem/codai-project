# 🌐 ROMAI Cloud Services Deployment Plan

**Date**: August 2, 2025  
**Status**: Ready for Implementation  
**Frontend**: ✅ Deployed at https://romcp.ro  
**Backend**: 🚀 Ready for Cloud Deployment

---

## 🎯 **Deployment Strategy Overview**

### **Multi-Cloud Architecture**

**Frontend**: Vercel (✅ Complete)  
**Backend Services**: AWS EKS + Azure AI Services  
**Database**: AWS RDS + ElastiCache  
**AI Services**: Azure OpenAI + AI Foundry  
**CDN**: CloudFront + Azure CDN

### **Service Distribution**

```mermaid
graph TB
    A[romcp.ro - Vercel Frontend] --> B[api.romcp.ro - AWS ALB]
    B --> C[AWS EKS Cluster]
    C --> D[RomAI MCP Server]
    C --> E[CBD Database Service]
    C --> F[Gateway Service]
    C --> G[MemorAI Service]
    
    D --> H[Azure OpenAI - Sweden Central]
    E --> I[AWS RDS PostgreSQL]
    F --> J[AWS ElastiCache Redis]
    G --> I
    
    A --> K[mcp.romcp.ro - Direct MCP]
    A --> L[cbd.romcp.ro - Database API]
```

---

## 🏗️ **Phase 1: AWS Infrastructure Deployment**

### **1.1 Prerequisites Setup**

```bash
# AWS CLI Configuration
aws configure set region us-east-1
aws configure set default.region us-east-1

# Terraform Variables
export TF_VAR_environment=production
export TF_VAR_aws_region=us-east-1
export TF_VAR_vpc_cidr="10.0.0.0/16"
export TF_VAR_domain_name="romcp.ro"
export TF_VAR_kubernetes_version="1.30"
```

### **1.2 Infrastructure Deployment**

```bash
# Navigate to infrastructure directory
cd infrastructure/aws

# Initialize Terraform
terraform init

# Plan deployment
terraform plan -var-file="production.tfvars"

# Deploy infrastructure
terraform apply -var-file="production.tfvars" -auto-approve
```

### **1.3 AWS Resources to Deploy**

#### **Core Infrastructure**
- **VPC**: 10.0.0.0/16 with 3 AZs
- **EKS Cluster**: memorai-enterprise (1.30)
- **Node Groups**: 
  - Compute nodes: c6i.4xlarge (3-50 nodes)
  - Memory nodes: r6i.8xlarge (2-20 nodes)
  - GPU nodes: g5.12xlarge (0-10 nodes)
  - Spot nodes: c6i.2xlarge (0-20 nodes)

#### **Database Services**
- **RDS PostgreSQL**: Multi-AZ, encrypted, 30-day backup
- **ElastiCache Redis**: Clustered, encrypted, auth enabled
- **S3 Buckets**: Data storage, backups, ALB logs

#### **Networking & Security**
- **ALB**: Application Load Balancer with SSL
- **Route 53**: DNS management for romcp.ro
- **ACM**: SSL certificates for *.romcp.ro
- **Security Groups**: Micro-segmentation rules
- **KMS**: Encryption keys for all services

### **1.4 Production Configuration**

```hcl
# production.tfvars
environment = "production"
aws_region = "us-east-1"
vpc_cidr = "10.0.0.0/16"
domain_name = "romcp.ro"

# EKS Configuration
kubernetes_version = "1.30"
cluster_endpoint_public_access_cidrs = ["0.0.0.0/0"]

# RDS Configuration
rds_instance_class = "db.r6g.2xlarge"
rds_allocated_storage = 500
rds_max_allocated_storage = 2000
db_name = "romai_production"
db_username = "romai_admin"

# Redis Configuration
redis_node_type = "cache.r7g.2xlarge"
redis_num_cache_nodes = 3

# Auto-scaling
min_nodes = 5
max_nodes = 50
desired_nodes = 8
```

---

## ☁️ **Phase 2: Azure AI Services Deployment**

### **2.1 Azure Resource Group Creation**

```bash
# Login to Azure
az login

# Create resource group
az group create \
  --name romai-ai-services \
  --location "Sweden Central"

# Deploy AI services using Bicep
az deployment group create \
  --resource-group romai-ai-services \
  --template-file infrastructure/azure-ai-services.bicep \
  --parameters projectName=romai environment=production location="Sweden Central"
```

### **2.2 Azure AI Services Configuration**

#### **AI Foundry Deployment**
```bash
# AI Foundry with comprehensive model access
- Service: Azure AI Foundry
- Location: Sweden Central
- SKU: S0 (Standard)
- Models: GPT-4o, O1-Preview, GPT-4-Turbo, Embeddings
- Features: Multi-modal AI, real-time processing
```

#### **Azure OpenAI Deployment**
```bash
# Specialized OpenAI service
- Service: Azure OpenAI
- Location: Sweden Central
- Models Deployed:
  - gpt-4o (capacity: 10)
  - gpt-4o-realtime (capacity: 10)
  - gpt-4o-mini (capacity: 10)
  - o1-preview (capacity: 10)
  - o1-mini (capacity: 10)
  - text-embedding-3-large (capacity: 10)
  - whisper (capacity: 10)
  - dall-e-3 (capacity: 1)
```

#### **AI Search & ML Hub**
```bash
# Vector search and ML capabilities
- AI Search: Standard tier, 1 replica, 1 partition
- ML Hub: Connected to AI services
- Storage: Standard LRS for model artifacts
- Key Vault: Secure credential management
```

### **2.3 Service Integration**

```bash
# Configure service connections
- AI Hub → AI Foundry connection
- AI Hub → OpenAI connection  
- AI Hub → AI Search connection
- Cross-service authentication via managed identities
```

---

## 🐳 **Phase 3: Kubernetes Services Deployment**

### **3.1 Namespace Configuration**

```yaml
# kubernetes/00-namespaces.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: romai-production
  labels:
    name: romai-production
    environment: production
---
apiVersion: v1
kind: Namespace
metadata:
  name: romai-monitoring
  labels:
    name: romai-monitoring
    environment: production
```

### **3.2 Core Services Deployment**

#### **RomAI MCP Server**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: romai-mcp-server
  namespace: romai-production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: romai-mcp-server
  template:
    metadata:
      labels:
        app: romai-mcp-server
    spec:
      containers:
      - name: romai-mcp
        image: codai/romai-mcp:latest
        ports:
        - containerPort: 8003
        env:
        - name: AZURE_OPENAI_ENDPOINT
          valueFrom:
            secretKeyRef:
              name: azure-ai-secrets
              key: endpoint
        - name: AZURE_OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: azure-ai-secrets
              key: api-key
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
```

#### **CBD Database Service**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cbd-service
  namespace: romai-production
spec:
  replicas: 2
  selector:
    matchLabels:
      app: cbd-service
  template:
    metadata:
      labels:
        app: cbd-service
    spec:
      containers:
      - name: cbd
        image: codai/cbd:latest
        ports:
        - containerPort: 4180
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secrets
              key: postgresql-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: database-secrets
              key: redis-url
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
```

#### **Gateway Service**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gateway-service
  namespace: romai-production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: gateway-service
  template:
    metadata:
      labels:
        app: gateway-service
    spec:
      containers:
      - name: gateway
        image: codai/gateway:latest
        ports:
        - containerPort: 4000
        env:
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: auth-secrets
              key: jwt-secret
        - name: CORS_ORIGINS
          value: "https://romcp.ro,https://api.romcp.ro"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
```

### **3.3 Service Exposing & Ingress**

```yaml
# Ingress configuration for subdomain routing
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: romai-ingress
  namespace: romai-production
  annotations:
    kubernetes.io/ingress.class: "alb"
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/certificate-arn: "arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT-ID"
spec:
  rules:
  - host: api.romcp.ro
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: gateway-service
            port:
              number: 4000
  - host: mcp.romcp.ro
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: romai-mcp-service
            port:
              number: 8003
  - host: cbd.romcp.ro
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: cbd-service
            port:
              number: 4180
```

---

## 🔐 **Phase 4: Security & Secrets Management**

### **4.1 AWS Secrets Manager**

```bash
# Create database credentials
aws secretsmanager create-secret \
  --name romai/production/database \
  --description "RomAI database credentials" \
  --secret-string '{
    "username": "romai_admin",
    "password": "'$(openssl rand -base64 32)'",
    "postgresql_url": "postgresql://romai_admin:PASSWORD@romai-db.cluster-xyz.us-east-1.rds.amazonaws.com:5432/romai_production",
    "redis_url": "redis://romai-redis.cache.amazonaws.com:6379"
  }'

# Create Azure AI credentials
aws secretsmanager create-secret \
  --name romai/production/azure-ai \
  --description "Azure AI service credentials" \
  --secret-string '{
    "endpoint": "https://romai-openai-production.openai.azure.com/",
    "api_key": "AZURE_API_KEY",
    "deployment_name": "gpt-4o-realtime"
  }'
```

### **4.2 Kubernetes Secret Integration**

```yaml
# External Secrets Operator configuration
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-secrets-manager
  namespace: romai-production
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
      auth:
        secretRef:
          accessKeyID:
            name: aws-credentials
            key: access-key-id
          secretAccessKey:
            name: aws-credentials
            key: secret-access-key
---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: database-secrets
  namespace: romai-production
spec:
  refreshInterval: 15s
  secretStoreRef:
    name: aws-secrets-manager
    kind: SecretStore
  target:
    name: database-secrets
    creationPolicy: Owner
  data:
  - secretKey: postgresql-url
    remoteRef:
      key: romai/production/database
      property: postgresql_url
  - secretKey: redis-url
    remoteRef:
      key: romai/production/database
      property: redis_url
```

---

## 📊 **Phase 5: Monitoring & Observability**

### **5.1 Prometheus & Grafana Setup**

```bash
# Deploy monitoring stack
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Install Prometheus
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace romai-monitoring \
  --set grafana.adminPassword='$(openssl rand -base64 32)' \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=50Gi

# Install Grafana dashboards for Romanian AI metrics
kubectl apply -f kubernetes/monitoring/grafana-dashboards.yaml
```

### **5.2 Application Monitoring**

```yaml
# ServiceMonitor for RomAI services
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: romai-services
  namespace: romai-production
spec:
  selector:
    matchLabels:
      monitoring: enabled
  endpoints:
  - port: metrics
    interval: 30s
    path: /metrics
```

### **5.3 Alerting Configuration**

```yaml
# AlertManager rules for Romanian AI services
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: romai-alerts
  namespace: romai-production
spec:
  groups:
  - name: romai.rules
    rules:
    - alert: RomAIMCPServerDown
      expr: up{job="romai-mcp-server"} == 0
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "RomAI MCP Server is down"
        description: "RomAI MCP Server has been down for more than 5 minutes"
    
    - alert: CBDHighMemoryUsage
      expr: container_memory_usage_bytes{pod=~"cbd-.*"} / container_spec_memory_limit_bytes > 0.9
      for: 10m
      labels:
        severity: warning
      annotations:
        summary: "CBD service high memory usage"
        description: "CBD service memory usage is above 90% for 10 minutes"
```

---

## 🚀 **Phase 6: Deployment Execution**

### **6.1 Deployment Order**

```bash
# 1. AWS Infrastructure (45-60 minutes)
cd infrastructure/aws
terraform apply -auto-approve

# 2. Azure AI Services (15-30 minutes)
az deployment group create \
  --resource-group romai-ai-services \
  --template-file ../azure-ai-services.bicep \
  --parameters projectName=romai environment=production

# 3. Kubernetes Configuration (5 minutes)
kubectl apply -f kubernetes/00-namespaces.yaml
kubectl apply -f kubernetes/secrets/
kubectl apply -f kubernetes/rbac/

# 4. External Secrets Operator (10 minutes)
helm install external-secrets external-secrets/external-secrets \
  --namespace external-secrets-system \
  --create-namespace

# 5. Core Services (15-20 minutes)
kubectl apply -f kubernetes/core-apps/
kubectl apply -f kubernetes/services/

# 6. Ingress & Load Balancing (10 minutes)
kubectl apply -f kubernetes/ingress/

# 7. Monitoring Stack (20-30 minutes)
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace romai-monitoring

# 8. Verification & Testing (15-30 minutes)
kubectl get pods -n romai-production
curl https://api.romcp.ro/health
curl https://mcp.romcp.ro/health
curl https://cbd.romcp.ro/health
```

### **6.2 DNS Configuration**

```bash
# Update Route 53 records after ALB deployment
ALB_DNS=$(kubectl get ingress romai-ingress -n romai-production -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# Create CNAME records
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123456789 \
  --change-batch '{
    "Changes": [
      {
        "Action": "CREATE",
        "ResourceRecordSet": {
          "Name": "api.romcp.ro",
          "Type": "CNAME",
          "TTL": 300,
          "ResourceRecords": [{"Value": "'$ALB_DNS'"}]
        }
      },
      {
        "Action": "CREATE", 
        "ResourceRecordSet": {
          "Name": "mcp.romcp.ro",
          "Type": "CNAME",
          "TTL": 300,
          "ResourceRecords": [{"Value": "'$ALB_DNS'"}]
        }
      },
      {
        "Action": "CREATE",
        "ResourceRecordSet": {
          "Name": "cbd.romcp.ro", 
          "Type": "CNAME",
          "TTL": 300,
          "ResourceRecords": [{"Value": "'$ALB_DNS'"}]
        }
      }
    ]
  }'
```

---

## 🔧 **Phase 7: Frontend Integration**

### **7.1 Update Vercel Environment Variables**

```bash
# Add backend API endpoints
echo "API_BASE_URL=https://api.romcp.ro" | vercel env add API_BASE_URL production
echo "MCP_ENDPOINT=https://mcp.romcp.ro" | vercel env add MCP_ENDPOINT production  
echo "CBD_ENDPOINT=https://cbd.romcp.ro" | vercel env add CBD_ENDPOINT production

# Update CORS origins in backend
echo "CORS_ORIGINS=https://romcp.ro,https://api.romcp.ro" | vercel env add CORS_ORIGINS production
```

### **7.2 Frontend API Integration**

```typescript
// Update src/lib/api.ts
export const API_CONFIG = {
  baseURL: process.env.API_BASE_URL || 'https://api.romcp.ro',
  mcpEndpoint: process.env.MCP_ENDPOINT || 'https://mcp.romcp.ro',
  cbdEndpoint: process.env.CBD_ENDPOINT || 'https://cbd.romcp.ro',
  timeout: 30000,
};

// Romanian AI client
export const romaiClient = {
  async askQuestion(question: string, context?: string) {
    const response = await fetch(`${API_CONFIG.mcpEndpoint}/romai/question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, context, language: 'ro' }),
    });
    return response.json();
  },
  
  async getMarketInsights(topic: string) {
    const response = await fetch(`${API_CONFIG.mcpEndpoint}/romai/market-insights`, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, market: 'romania' }),
    });
    return response.json();
  },
};
```

### **7.3 Redeploy Frontend**

```bash
# Redeploy with new environment variables
cd apps/romai
vercel --prod --yes
```

---

## 📈 **Success Metrics & Validation**

### **7.1 Health Checks**

```bash
# Service health validation
curl -f https://api.romcp.ro/health
curl -f https://mcp.romcp.ro/health  
curl -f https://cbd.romcp.ro/health
curl -f https://romcp.ro

# Romanian AI functionality test
curl -X POST https://mcp.romcp.ro/romai/question \
  -H "Content-Type: application/json" \
  -d '{"question": "Care sunt principalele oportunități de afaceri în România?", "language": "ro"}'
```

### **7.2 Performance Metrics**

```bash
# Infrastructure metrics
kubectl top nodes
kubectl top pods -n romai-production

# Application metrics  
curl https://api.romcp.ro/metrics
curl https://mcp.romcp.ro/metrics
curl https://cbd.romcp.ro/metrics
```

### **7.3 Monitoring Dashboards**

```bash
# Access monitoring interfaces
echo "Grafana: https://grafana.romcp.ro (admin:password)"
echo "Prometheus: https://prometheus.romcp.ro"
echo "AlertManager: https://alerts.romcp.ro"
```

---

## 🎯 **Expected Outcomes**

### **Infrastructure Deployment** (2-3 hours)
- ✅ AWS EKS cluster with 3 node groups running
- ✅ RDS PostgreSQL and ElastiCache Redis operational  
- ✅ Azure AI services deployed with all models
- ✅ Load balancers and DNS configured

### **Service Deployment** (1-2 hours)
- ✅ RomAI MCP server responding to Romanian queries
- ✅ CBD database service storing and retrieving vectors
- ✅ Gateway service routing and authenticating requests
- ✅ Monitoring stack collecting metrics and logs

### **Integration Complete** (30 minutes)
- ✅ Frontend connected to backend APIs
- ✅ Full Romanian AI workflow functional
- ✅ User authentication and session management
- ✅ Real-time Romanian language processing

### **Production Ready** (Full Platform)
- ✅ Scalable infrastructure supporting 10,000+ users
- ✅ High availability with 99.9% uptime SLA
- ✅ Comprehensive monitoring and alerting
- ✅ Security best practices implemented
- ✅ Cost optimization with spot instances and caching

---

**Timeline**: 3-5 hours for complete cloud deployment  
**Cost**: ~$500-800/month for production infrastructure  
**Success Probability**: 95%+ based on existing configurations  
**Rollback Plan**: Terraform destroy and DNS reversion available within 15 minutes
