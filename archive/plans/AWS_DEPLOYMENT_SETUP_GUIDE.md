# 🚀 CODAI Ecosystem AWS Deployment Setup Guide

## 📋 Overview

This guide provides step-by-step instructions for setting up your AWS account and deploying the complete CODAI ecosystem with the required domains and services.

## ✅ Prerequisites Completed

- ✅ AWS CLI v2.28.0 installed
- ✅ kubectl v1.32.2 installed
- ✅ Helm v3.18.4 installed
- ✅ PowerShell environment configured

## 🏗️ Required Domains & Services

### Primary Domains

1. **id.codai.ro** - Identity Service
2. **auth.codai.ro** - Authentication Service
3. **memorai.ro** - MemorAI Service
4. **mcp.memorai.ro** - MemorAI MCP Server
5. **cbd.memorai.ro** - CBD Service for MemorAI
6. **api.codai.ro** - API Gateway
7. **hub.codai.ro** - Hub Service
8. **controlai.ro** - ControlAI Service
9. **mcp.controlai.ro** - ControlAI MCP Server
10. **admin.codai.ro** - Admin Dashboard
11. **romai.ro** - RomAI Service
12. **mcp.romai.ro** - RomAI MCP Server

### Additional Subdomains Needed

- **docs.codai.ro** - Documentation
- **api.memorai.ro** - MemorAI API
- **api.controlai.ro** - ControlAI API
- **api.romai.ro** - RomAI API
- **dashboard.controlai.ro** - ControlAI Dashboard

## 🏆 Step 1: AWS Account Setup

### 1.1 Create AWS Account

1. Go to [aws.amazon.com](https://aws.amazon.com)
2. Click "Create an AWS Account"
3. Provide your email, password, and account name
4. Choose "Personal" account type
5. Provide contact information and payment method
6. Complete phone verification
7. Choose "Basic Support Plan" (free)

### 1.2 Important Initial Settings

```bash
# After account creation, you'll need:
1. Root user email and password (keep secure!)
2. Account ID (12-digit number)
3. Billing information setup
4. Multi-Factor Authentication (MFA) setup
```

### 1.3 Create IAM User for Deployment

1. Log into AWS Console
2. Go to IAM service
3. Create new user: `codai-deployer`
4. Attach policies:
   - `AmazonEKSClusterPolicy`
   - `AmazonEKSWorkerNodePolicy`
   - `AmazonEKS_CNI_Policy`
   - `AmazonEC2ContainerRegistryReadOnly`
   - `AmazonRoute53FullAccess`
   - `AmazonCertificateManagerFullAccess`
   - `ElasticLoadBalancingFullAccess`
5. Create Access Key for programmatic access
6. **SAVE THE ACCESS KEY ID AND SECRET ACCESS KEY SECURELY**

## 🔧 Step 2: Configure AWS CLI

Run these commands in PowerShell:

```powershell
# Configure AWS CLI with your credentials
aws configure

# When prompted, enter:
# AWS Access Key ID: [Your Access Key ID]
# AWS Secret Access Key: [Your Secret Access Key]
# Default region name: eu-west-1
# Default output format: json
```

## 🌐 Step 3: Domain Registration & DNS Setup

### 3.1 Register Domains

You need to register these domains (if not already owned):

- `codai.ro`
- `memorai.ro`
- `controlai.ro`
- `romai.ro`

### 3.2 Route53 Hosted Zones

```bash
# Create hosted zones for each domain
aws route53 create-hosted-zone --name codai.ro --caller-reference codai-$(date +%s)
aws route53 create-hosted-zone --name memorai.ro --caller-reference memorai-$(date +%s)
aws route53 create-hosted-zone --name controlai.ro --caller-reference controlai-$(date +%s)
aws route53 create-hosted-zone --name romai.ro --caller-reference romai-$(date +%s)
```

## ☸️ Step 4: EKS Cluster Setup

### 4.1 Create EKS Cluster

```bash
# Create EKS cluster (this takes 10-15 minutes)
aws eks create-cluster \
  --name codai-cluster \
  --version 1.24 \
  --role-arn arn:aws:iam::ACCOUNT-ID:role/eksServiceRole \
  --resources-vpc-config subnetIds=subnet-12345,subnet-67890,securityGroupIds=sg-12345
```

### 4.2 Configure kubectl

```bash
# Update kubectl config
aws eks update-kubeconfig --name codai-cluster --region eu-west-1
```

### 4.3 Create Node Group

```bash
# Create worker nodes
aws eks create-nodegroup \
  --cluster-name codai-cluster \
  --nodegroup-name codai-workers \
  --node-role arn:aws:iam::ACCOUNT-ID:role/NodeInstanceRole \
  --subnets subnet-12345 subnet-67890 \
  --instance-types t3.medium \
  --scaling-config minSize=2,maxSize=10,desiredSize=3
```

## 🔒 Step 5: SSL Certificates

### 5.1 Request SSL Certificates

```bash
# Request wildcard certificates for each domain
aws acm request-certificate \
  --domain-name "*.codai.ro" \
  --domain-name "codai.ro" \
  --validation-method DNS \
  --region eu-west-1

aws acm request-certificate \
  --domain-name "*.memorai.ro" \
  --domain-name "memorai.ro" \
  --validation-method DNS \
  --region eu-west-1

aws acm request-certificate \
  --domain-name "*.controlai.ro" \
  --domain-name "controlai.ro" \
  --validation-method DNS \
  --region eu-west-1

aws acm request-certificate \
  --domain-name "*.romai.ro" \
  --domain-name "romai.ro" \
  --validation-method DNS \
  --region eu-west-1
```

## 📦 Step 6: Container Registry Setup

### 6.1 Create ECR Repositories

```bash
# Create ECR repositories for each service
aws ecr create-repository --repository-name codai/gateway
aws ecr create-repository --repository-name codai/id-service
aws ecr create-repository --repository-name codai/auth-service
aws ecr create-repository --repository-name codai/memorai
aws ecr create-repository --repository-name codai/controlai
aws ecr create-repository --repository-name codai/romai
aws ecr create-repository --repository-name codai/admin
aws ecr create-repository --repository-name codai/hub
```

## 🚀 Step 7: Deployment Process

### 7.1 Build and Push Images

```powershell
# Login to ECR
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin ACCOUNT-ID.dkr.ecr.eu-west-1.amazonaws.com

# Build and push each service
./scripts/build-and-deploy.ps1
```

### 7.2 Deploy to Kubernetes

```bash
# Deploy using Helm charts
helm install codai-ecosystem ./infrastructure/helm/codai-ecosystem
```

## 📊 Step 8: Monitoring & Logging

### 8.1 Install Monitoring Stack

```bash
# Install Prometheus and Grafana
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install monitoring prometheus-community/kube-prometheus-stack
```

## 🔍 Step 9: Verification

### 9.1 Check Deployment Status

```bash
# Verify all services are running
kubectl get pods -A
kubectl get services -A
kubectl get ingress -A
```

### 9.2 Test Domains

Test each domain to ensure they're working:

- https://id.codai.ro
- https://auth.codai.ro
- https://memorai.ro
- https://mcp.memorai.ro
- https://cbd.memorai.ro
- https://api.codai.ro
- https://hub.codai.ro
- https://controlai.ro
- https://mcp.controlai.ro
- https://admin.codai.ro
- https://romai.ro
- https://mcp.romai.ro

## 💰 Cost Estimates

### Monthly AWS Costs (Estimated)

- **EKS Cluster**: $73/month
- **Worker Nodes (3x t3.medium)**: $96/month
- **Load Balancers**: $18/month
- **Route53 Hosted Zones**: $2/month
- **ECR Storage**: $5/month
- **Data Transfer**: $10/month
- **SSL Certificates**: FREE
- **Total Estimated**: ~$204/month

## 🛡️ Security Best Practices

1. **Enable MFA** on root account
2. **Use IAM roles** for service access
3. **Enable CloudTrail** for audit logging
4. **Configure VPC security groups** properly
5. **Use AWS Secrets Manager** for sensitive data
6. **Enable GuardDuty** for threat detection
7. **Regular security audits** and updates

## 📞 Support & Next Steps

After completing this setup:

1. Test all domain endpoints
2. Configure monitoring and alerting
3. Set up CI/CD pipelines
4. Configure backup strategies
5. Set up disaster recovery plans

## 🚨 Important Notes

- **Keep your AWS credentials secure**
- **Monitor costs regularly** in AWS Console
- **Set up billing alerts**
- **Regular security updates**
- **Backup configurations**

---

**Ready to deploy the CODAI ecosystem to AWS!** 🚀

Once you complete the AWS account setup and provide the credentials, we can proceed with the automated deployment process.
