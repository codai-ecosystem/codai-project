# � Quick IAM Permission Fix + Vercel DNS Setup

## � Current Issue

The IAM user `codai-deployer` needs EKS permissions. Here's the 2-minute fix:

## ✅ Step 1: Fix IAM Permissions (2 minutes)

### Option A: PowerUserAccess (Fastest)

1. **Go to**: https://567877624442.signin.aws.amazon.com/console
2. **Login**: codai-deployer / 5o#X665^
3. **Navigate**: IAM → Users → codai-deployer → Permissions
4. **Click**: "Add permissions" → "Attach policies directly"
5. **Search**: `PowerUserAccess`
6. **Select**: PowerUserAccess checkbox
7. **Click**: "Add permissions"

### Option B: Specific EKS Permissions (More Secure)

Instead of PowerUserAccess, add these specific policies:

- `AmazonEKSClusterPolicy`
- `AmazonEKSWorkerNodePolicy`
- `AmazonEKS_CNI_Policy`
- `AmazonEC2FullAccess`
- `IAMFullAccess`
- `AmazonVPCFullAccess`

## 🌐 Step 2: Vercel DNS Configuration

Since your domains are on Vercel DNS (excellent choice!), here's how we'll configure them:

### Current Setup (No Changes Needed)

- ✅ **codai.ro** → Vercel DNS
- ✅ **memorai.ro** → Vercel DNS
- ✅ **controlai.ro** → Vercel DNS
- ✅ **romai.ro** → Vercel DNS

### What We'll Add (After EKS Deployment)

Once the EKS cluster is ready, I'll give you the load balancer address and you'll add these DNS records in Vercel:

```dns
# CODAI.RO Records
A    id.codai.ro        → [ELB-ADDRESS]
A    auth.codai.ro      → [ELB-ADDRESS]
A    api.codai.ro       → [ELB-ADDRESS]
A    admin.codai.ro     → [ELB-ADDRESS]
A    hub.codai.ro       → [ELB-ADDRESS]
A    docs.codai.ro      → [ELB-ADDRESS]

# MEMORAI.RO Records
A    memorai.ro         → [ELB-ADDRESS]
A    api.memorai.ro     → [ELB-ADDRESS]
A    mcp.memorai.ro     → [ELB-ADDRESS]
A    cbd.memorai.ro     → [ELB-ADDRESS]

# CONTROLAI.RO Records
A    controlai.ro       → [ELB-ADDRESS]
A    api.controlai.ro   → [ELB-ADDRESS]
A    mcp.controlai.ro   → [ELB-ADDRESS]
A    dashboard.controlai.ro → [ELB-ADDRESS]

# ROMAI.RO Records
A    romai.ro           → [ELB-ADDRESS]
A    api.romai.ro       → [ELB-ADDRESS]
A    mcp.romai.ro       → [ELB-ADDRESS]
```

## 🚀 Deployment Timeline

1. **Fix IAM permissions** (2 minutes) ← **YOU DO THIS NOW**
2. **Create EKS cluster** (15 minutes) ← **I'll start this**
3. **Deploy services** (10 minutes) ← **Automated**
4. **Configure Vercel DNS** (5 minutes) ← **I'll provide the records**
5. **SSL certificates** (5 minutes) ← **Automatic with cert-manager**

**Total time**: ~37 minutes from permission fix to live domains!

## 💡 Why Vercel DNS is Perfect

- **Global CDN**: Vercel's DNS is distributed worldwide
- **Fast propagation**: Changes take effect in ~30 seconds
- **Easy management**: Simple dashboard interface
- **Reliable**: 99.99% uptime SLA
- **Integration ready**: Works perfectly with AWS load balancers

## 🎯 Next Action

**Please fix the IAM permissions now** (Option A is fastest), then let me know when done. I'll immediately restart the EKS cluster creation!

After that, we'll have your complete CODAI ecosystem running on all domains in about 35 minutes! 🚀

## 🛠️ Local Setup Commands

### Step 1: Configure AWS CLI

```powershell
# In PowerShell, run:
aws configure

# Enter your credentials when prompted:
# AWS Access Key ID: [Your Access Key ID from step 2]
# AWS Secret Access Key: [Your Secret Access Key from step 2]
# Default region name: eu-west-1
# Default output format: json
```

### Step 2: Quick Deployment Test

```powershell
# Test AWS connection
aws sts get-caller-identity

# You should see your account information
```

### Step 3: Full Deployment (Automated)

```powershell
# Replace YOUR_ACCOUNT_ID with your 12-digit AWS account ID
# You can find it in the AWS Console or from the previous command

# Run complete deployment
.\scripts\deploy-codai-ecosystem.ps1 -AWSAccountId "YOUR_ACCOUNT_ID" -All

# This will:
# ✅ Create all AWS infrastructure
# ✅ Build and push Docker images
# ✅ Deploy to Kubernetes
# ✅ Set up monitoring
# ✅ Configure SSL certificates
# ✅ Set up domain routing
```

## 🔍 Alternative: Step-by-Step Deployment

If you prefer to run each step separately:

### Step 1: AWS Infrastructure Only

```powershell
.\scripts\deploy-codai-ecosystem.ps1 -AWSAccountId "YOUR_ACCOUNT_ID" -SetupAWS
```

### Step 2: Build Docker Images Only

```powershell
.\scripts\deploy-codai-ecosystem.ps1 -AWSAccountId "YOUR_ACCOUNT_ID" -BuildImages
```

### Step 3: Deploy to Kubernetes Only

```powershell
.\scripts\deploy-codai-ecosystem.ps1 -AWSAccountId "YOUR_ACCOUNT_ID" -DeployToK8s
```

### Step 4: Setup Monitoring Only

```powershell
.\scripts\deploy-codai-ecosystem.ps1 -AWSAccountId "YOUR_ACCOUNT_ID" -SetupMonitoring
```

## 📊 Expected Timeline

- **AWS Account Setup**: 5-10 minutes
- **Local Tool Configuration**: 2 minutes
- **Full Automated Deployment**: 30-45 minutes
- **DNS Propagation**: 5-60 minutes (varies by registrar)
- **SSL Certificate Issuance**: 5-10 minutes

**Total Time**: 1-2 hours from start to fully working system

## 💰 Expected AWS Costs

### Monthly Costs (Production Environment)

- **EKS Control Plane**: $73/month
- **Worker Nodes (3x t3.medium)**: ~$96/month
- **Load Balancers**: ~$18/month
- **Storage**: ~$10/month
- **Data Transfer**: ~$20/month
- **Route53**: ~$2/month
- **Other Services**: ~$10/month

**Total**: ~$229/month

### Cost Optimization Tips

- Use Spot Instances for worker nodes (50% savings)
- Scale down non-production environments
- Use CloudWatch to monitor unused resources
- Set up billing alerts

## 🚨 Important Security Notes

1. **Never share your AWS credentials**
2. **Enable MFA on root account immediately**
3. **Use IAM roles in production (not access keys)**
4. **Regularly rotate access keys**
5. **Monitor CloudTrail for unusual activity**
6. **Set up billing alerts**

## 🔧 Troubleshooting

### Common Issues:

**"AWS CLI not found"**

```powershell
# Refresh PATH
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
aws --version
```

**"kubectl not configured"**

```powershell
# Configure kubectl for your cluster
aws eks update-kubeconfig --name codai-cluster --region eu-west-1
```

**"Docker build failed"**

```powershell
# Check if Docker is running
docker version

# Login to ECR
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.eu-west-1.amazonaws.com
```

**"Domain not working"**

- Check DNS propagation: `nslookup yourdomain.com`
- Verify SSL certificates in AWS Console
- Check ingress status: `kubectl get ingress -A`

## 📞 Support Commands

### Check Deployment Status

```powershell
# Check all pods
kubectl get pods -A

# Check services
kubectl get services -A

# Check ingress
kubectl get ingress -A

# Check certificates
kubectl get certificates -A
```

### Access Monitoring

```powershell
# Access Grafana (monitoring)
kubectl port-forward -n monitoring svc/monitoring-grafana 3000:80
# Then open: http://localhost:3000
# Default login: admin/prom-operator

# Access Kibana (logging)
kubectl port-forward -n logging svc/kibana-kibana 5601:5601
# Then open: http://localhost:5601
```

### Get Load Balancer Information

```powershell
# Get the load balancer hostname
kubectl get ingress codai-ecosystem-ingress -n codai-ecosystem -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

## 🎯 Final Steps After Deployment

1. **Update DNS Records**: Point your domains to the load balancer
2. **Test All Endpoints**: Verify each domain works
3. **Configure Monitoring**: Set up alerts and dashboards
4. **Security Review**: Implement additional security measures
5. **Backup Strategy**: Set up automated backups
6. **Documentation**: Update team documentation

---

**You're ready to deploy! 🚀**

Just follow the AWS account setup steps above, then run the deployment script with your account ID.
