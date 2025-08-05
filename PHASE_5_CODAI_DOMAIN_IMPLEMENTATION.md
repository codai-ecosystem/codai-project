# 🌐 Phase 5: CODAI Domain Configuration - Following MemorAI Pattern

## 📋 Ecosystem Discovery Results

### **Current Architecture**
```yaml
MemorAI (eu-west-1):
  domain: memorai.ro (Vercel managed)
  ssl_backend: cbd.memorai.ro → CloudFront → ALB (eu-west-1)
  cluster: cbd-production-cluster
  service: cbd-universal-service (2 tasks)
  
CODAI (us-east-1):
  domain: codai.ro (Vercel managed) 
  backend_needed: api.codai.ro → CloudFront → ALB (us-east-1)
  cluster: codai-cluster-prod
  services: 5 services (gateway, memorai-mcp, cbd-database, websocket, ssl-proxy)
```

### **Implementation Strategy**
Following the proven MemorAI pattern:
1. Create CloudFront distributions for CODAI services
2. Configure ACM certificates for subdomain SSL
3. Update Route 53 DNS records
4. Configure ALB as CloudFront origin

---

## 🚀 Implementation Plan

### Stage 1: CloudFront Distribution Setup
Create CloudFront distributions for key CODAI services:
- api.codai.ro → codai-alb-prod (main API gateway)
- gateway.codai.ro → codai-alb-prod/gateway
- admin.codai.ro → codai-alb-prod/admin

### Stage 2: SSL Certificate Configuration
Configure ACM certificates for:
- *.codai.ro (wildcard certificate)
- Validate via DNS in Route 53

### Stage 3: DNS Configuration
Update Route 53 records to point:
- api.codai.ro → CloudFront distribution
- gateway.codai.ro → CloudFront distribution
- admin.codai.ro → CloudFront distribution

### Stage 4: Service Integration
Update CODAI services to handle:
- Domain-based routing
- SSL termination
- Service authentication
