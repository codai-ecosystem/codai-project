# 🏗️ CODAI Core Infrastructure - EKS Production Deployment

## Current Status

- ✅ EKS Cluster: `codai-cluster-v2` (Kubernetes 1.31) - **ACTIVE**
- ✅ AWS Context: Connected and authenticated
- ❌ Node Groups: Previous attempts failed
- 🎯 **NEW APPROACH**: Deploy without node groups using Fargate

## Quick EKS Fargate Deployment

### Step 1: Create Fargate Profile

The EKS cluster is ready, but we need a Fargate profile for serverless pod execution:

```powershell
# Create Fargate profile for core infrastructure
eksctl create fargateprofile --cluster codai-cluster-v2 --region eu-west-1 --name codai-infrastructure --namespace codai-infrastructure

# Create Fargate profile for data services
eksctl create fargateprofile --cluster codai-cluster-v2 --region eu-west-1 --name codai-data --namespace codai-data
```

### Step 2: Deploy Core Infrastructure

```powershell
# Deploy infrastructure services
kubectl apply -f infrastructure/kubernetes/core-infrastructure.yaml

# Deploy ingress configuration
kubectl apply -f infrastructure/kubernetes/core-ingress.yaml
```

### Step 3: Install Required Add-ons

```powershell
# Install AWS Load Balancer Controller
helm repo add eks https://aws.github.io/eks-charts
helm install aws-load-balancer-controller eks/aws-load-balancer-controller -n kube-system --set clusterName=codai-cluster-v2

# Install cert-manager for SSL
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.yaml
```

## Alternative: Local Docker Desktop + Kubernetes

If you prefer local development:

### Enable Docker Desktop Kubernetes

1. Open Docker Desktop
2. Go to Settings > Kubernetes
3. Check "Enable Kubernetes"
4. Click "Apply & Restart"
5. Wait for Kubernetes to start (green icon)

### Switch to Docker Desktop Context

```powershell
kubectl config use-context docker-desktop
```

### Deploy Locally

```powershell
.\scripts\deploy-core-infrastructure.ps1
```

## Service Architecture (Corrected)

### Core Infrastructure Services (Node.js Backend)

- **Gateway Service** (Port 4000) - API routing hub for all services
- **MemorAI Service** (Ports 3693/6367) - Memory management for AI agents
- **RomAI MCP Server** (Port 8000) - Romanian AI coordination
- **Glass Service** (Port 7700) - Windows automation
- **ID Service Backend** - Authentication service

### Next.js Applications (Vercel Deployment)

- Admin Dashboard
- Hub Platform
- CODAI AI Assistant
- BancAI Banking Platform
- StudiAI Education Platform
- ControlAI Management
- 40+ other business applications

## Domain Mapping Strategy

### Infrastructure Domains → EKS/Local K8s

- `api.codai.ro` → Gateway Service (4000)
- `memorai.ro` → MemorAI Service (3693)
- `mcp.memorai.ro` → MemorAI MCP (6367)
- `mcp.romai.ro` → RomAI MCP (8000)
- `glass.codai.ro` → Glass Service (7700)

### Application Domains → Vercel

- `admin.codai.ro` → Admin App
- `hub.codai.ro` → Hub App
- `codai.ro` → CODAI App
- `bancai.ro` → BancAI App
- `studiai.ro` → StudiAI App
- `controlai.ro` → ControlAI App
- 40+ other application domains

## Next Steps

**Option A: EKS Fargate (Recommended)**

```powershell
# Run Fargate deployment
.\scripts\deploy-eks-fargate.ps1
```

**Option B: Local Development**

```powershell
# Enable Docker Desktop Kubernetes first, then:
.\scripts\deploy-core-infrastructure.ps1
```

**Option C: Hybrid Approach**

- Deploy core infrastructure to EKS Fargate
- Deploy Next.js apps to Vercel
- Configure DNS to route correctly

## Why This Approach Works

1. **Core Infrastructure** needs persistent storage, networking, and backend capabilities
2. **Next.js Applications** are stateless frontends perfect for Vercel
3. **Cost Effective**: Fargate for backend, Vercel for frontend
4. **Scalable**: Auto-scaling on both platforms
5. **Fast Deployment**: No node group management delays

Choose your preferred option and I'll execute the deployment immediately.
