# 🚀 Simplified CODAI Deployment with eksctl

## ✅ Current Status

- AWS CLI configured ✅
- eksctl installed ✅
- Account: 567877624442 ✅

## 🛠️ Simplified Deployment Plan

Since we're encountering IAM permission issues with the complex script, let's use eksctl which handles most of the AWS setup automatically.

### Step 1: Create EKS Cluster (15 minutes)

```powershell
# Create a complete EKS cluster with all necessary components
eksctl create cluster \
  --name codai-cluster \
  --region eu-west-1 \
  --nodes 3 \
  --node-type t3.medium \
  --with-oidc \
  --ssh-access \
  --managed \
  --enable-ssm
```

This single command will:

- ✅ Create VPC and subnets automatically
- ✅ Set up security groups
- ✅ Create IAM roles and policies
- ✅ Launch EKS cluster
- ✅ Create managed node group
- ✅ Configure kubectl automatically

### Step 2: Install Ingress Controller (5 minutes)

```powershell
# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/aws/deploy.yaml

# Wait for it to be ready
kubectl wait --namespace ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=90s
```

### Step 3: Install cert-manager for SSL (5 minutes)

```powershell
# Install cert-manager for automatic SSL certificates
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Wait for cert-manager to be ready
kubectl wait --namespace cert-manager --for=condition=ready pod --selector=app.kubernetes.io/name=cert-manager --timeout=90s
```

### Step 4: Deploy CODAI Services (10 minutes)

```powershell
# Deploy base infrastructure (database, redis)
kubectl apply -f infrastructure/kubernetes/base-infrastructure.yaml

# Deploy all services
kubectl apply -f infrastructure/kubernetes/

# Deploy ingress with SSL
kubectl apply -f infrastructure/kubernetes/ingress.yaml
```

### Step 5: Get Load Balancer Address (2 minutes)

```powershell
# Get the load balancer hostname for DNS configuration
kubectl get ingress codai-ecosystem-ingress -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

## 💡 Why This Approach is Better

1. **Automatic Permissions**: eksctl creates necessary IAM roles automatically
2. **Production Ready**: Creates best-practice AWS infrastructure
3. **Simplified**: Single commands instead of complex scripts
4. **Reliable**: Used by thousands of organizations worldwide
5. **Fast**: Complete deployment in ~35 minutes

## 🚀 Ready to Deploy?

The cluster creation takes about 15 minutes. Would you like me to start the deployment now?

Just say "yes" and I'll begin with:

```powershell
eksctl create cluster --name codai-cluster --region eu-west-1 --nodes 3 --node-type t3.medium --with-oidc --managed
```

This will set up everything we need for the CODAI ecosystem deployment! 🎯
