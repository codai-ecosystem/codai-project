# 🚨 IAM Permission Fix Required

## Problem Detected

The `codai-deployer` user needs additional AWS permissions to create the required resources.

## Quick Fix (2 minutes)

### Option 1: Add PowerUserAccess (Recommended)

1. **Go to AWS Console**: https://567877624442.signin.aws.amazon.com/console
2. **Navigate**: IAM → Users → codai-deployer → Permissions
3. **Add permissions**: Click "Add permissions" → "Attach policies directly"
4. **Search and select**: `PowerUserAccess`
5. **Click**: "Add permissions"

### Option 2: Add Specific Policies (More Secure)

If you prefer granular permissions, add these policies:

- `AmazonRoute53FullAccess`
- `AWSCertificateManagerFullAccess`
- `AmazonEC2ContainerRegistryFullAccess`
- `AmazonEKSClusterPolicy`
- `AmazonEKSWorkerNodePolicy`
- `AmazonEKS_CNI_Policy`
- `ElasticLoadBalancingFullAccess`
- `AmazonVPCFullAccess`

## Alternative: Use eksctl (Simpler Approach)

Instead of the complex setup, we can use `eksctl` which handles IAM automatically:

### Step 1: Install eksctl

```powershell
# Install eksctl
winget install weaveworks.eksctl
```

### Step 2: Create EKS cluster with eksctl

```powershell
# This will create everything we need automatically
eksctl create cluster --name codai-cluster --region eu-west-1 --nodes 3 --node-type t3.medium --with-oidc --ssh-access --ssh-public-key your-key-name --managed
```

### Step 3: Install ingress and cert-manager

```powershell
# Install NGINX ingress
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/aws/deploy.yaml

# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

## Recommended Action

**Choose Option 1 (PowerUserAccess)** for the fastest deployment, then we can proceed with the automated deployment script.

After fixing permissions, run:

```powershell
.\scripts\deploy-codai-ecosystem.ps1 -AWSAccountId "567877624442" -All
```

---

**Let me know when you've updated the IAM permissions and I'll restart the deployment!** 🚀
