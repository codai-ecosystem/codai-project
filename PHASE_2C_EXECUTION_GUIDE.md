# Phase 2C Execution Guide: Azure Infrastructure Deployment
# RomAI Dataset Expansion - Immediate Next Steps

## 🎯 Immediate Execution Requirements

### Pre-Deployment Checklist ✅
- [ ] Azure subscription with sufficient GPU quota (48 A100 GPUs)
- [ ] Azure PowerShell modules installed and updated
- [ ] SSH key pair generated for secure VM access  
- [ ] HuggingFace API token for dataset access
- [ ] Admin privileges for resource group creation
- [ ] Cost approval for ~$38,500/month infrastructure

### Step 1: Environment Setup
```powershell
# Install required Azure modules
Install-Module -Name Az -Force -AllowClobber -Scope CurrentUser
Install-Module -Name Az.ManagedServiceIdentity -Force
Update-Module -Name Az -Force

# Login to Azure
Connect-AzAccount

# Set subscription context (replace with your subscription ID)
$subscriptionId = "YOUR-SUBSCRIPTION-ID-HERE"
Set-AzContext -SubscriptionId $subscriptionId
```

### Step 2: SSH Key Generation
```bash
# Generate SSH key pair for VM access
ssh-keygen -t rsa -b 4096 -f ~/.ssh/romai_phase2b_key -C "romai-phase2b-deployment"

# Copy public key content
cat ~/.ssh/romai_phase2b_key.pub
```

### Step 3: Execute Deployment Script
```powershell
# Navigate to project directory
cd "e:\GitHub\codai-project"

# Execute enhanced deployment with your parameters
.\deploy_phase2b_enhanced_azure.ps1 `
    -SubscriptionId "YOUR-SUBSCRIPTION-ID" `
    -ResourceGroupName "rg-romai-phase2b-prod" `
    -Location "East US" `
    -Environment "production" `
    -EnableAdvancedMonitoring $true `
    -EnableContainerOrchestration $true
```

### Step 4: Post-Deployment Verification
```powershell
# Verify resource group creation
Get-AzResourceGroup -Name "rg-romai-phase2b-prod"

# Check VM deployment status
Get-AzVM -ResourceGroupName "rg-romai-phase2b-prod" | Format-Table Name, PowerState, Location, VmSize

# Verify storage account creation
Get-AzStorageAccount -ResourceGroupName "rg-romai-phase2b-prod"

# Test Key Vault access
Get-AzKeyVault -ResourceGroupName "rg-romai-phase2b-prod"
```

## 🔧 Expected Deployment Timeline

| Phase | Duration | Description |
|-------|----------|-------------|
| **Infrastructure** | 15-25 mins | VM creation, networking, storage |
| **Storage Setup** | 5-10 mins | Disk attachment, container creation |
| **Security Config** | 5 mins | NSG rules, Key Vault secrets |
| **Verification** | 5 mins | System health checks |
| **Total** | **30-45 mins** | Complete infrastructure deployment |

## 📊 Success Indicators

### ✅ Deployment Success Criteria
- [x] 6 VMs created successfully (4 primary + 2 secondary)
- [x] 48 A100 GPUs allocated (32x 80GB + 16x 40GB)
- [x] 3.2TB total GPU memory available
- [x] InfiniBand networking configured
- [x] 17.5TB Premium/Ultra SSD storage attached
- [x] Storage account with lifecycle policies
- [x] Key Vault with critical secrets stored
- [x] Network security groups with GPU rules

### 🔍 Immediate Post-Deployment Tasks
1. **SSH Connection Test**: Verify VM accessibility
2. **GPU Detection**: Confirm A100 GPU visibility
3. **InfiniBand Test**: Validate high-speed networking
4. **Storage Mount**: Attach and format SSD volumes
5. **NVIDIA Driver**: Install latest GPU drivers
6. **Container Runtime**: Deploy NVIDIA Container Toolkit

## ⚡ Next Phase Preparation (Phase 2D: NVIDIA Validation)

### NVVS Validation Suite Setup
```bash
# Connect to primary VM
ssh -i ~/.ssh/romai_phase2b_key azureuser@<VM_PUBLIC_IP>

# Download NVIDIA validation suite
wget https://developer.nvidia.com/compute/machine-learning/repo/rhel8/x86_64/nvidia-validation-suite-4.7.0-1.x86_64.rpm

# Install validation tools
sudo dnf install -y nvidia-validation-suite-4.7.0-1.x86_64.rpm

# Run basic GPU validation
nvidia-validation-suite --run gpu_validation
```

### System Readiness Checklist
- [ ] All 48 A100 GPUs detected by nvidia-smi
- [ ] CUDA toolkit installed and functional
- [ ] InfiniBand connectivity verified between VMs  
- [ ] Storage volumes mounted and accessible
- [ ] Container runtime operational
- [ ] DCGM monitoring deployed
- [ ] Network security validated
- [ ] Backup/recovery procedures tested

## 🎯 Performance Baselines

### Expected Performance Metrics
- **GPU Utilization**: >95% during training
- **Memory Bandwidth**: >1.5TB/s per A100
- **Network Throughput**: 200 Gbps InfiniBand per VM
- **Storage IOPS**: 180K IOPS on Premium SSD v2
- **Inter-GPU Communication**: <5μs latency via NVLink 3.0

### Monitoring Setup
```bash
# Install DCGM monitoring
sudo apt install -y datacenter-gpu-manager

# Start DCGM service
sudo systemctl enable nvidia-dcgm
sudo systemctl start nvidia-dcgm

# Validate monitoring
dcgmi discovery -l
dcgmi stats -g 1 -e
```

## 🚨 Troubleshooting Guide

### Common Deployment Issues
1. **Insufficient GPU Quota**: Request quota increase in Azure portal
2. **VM Size Unavailable**: Try different Azure regions
3. **Network Connectivity**: Verify NSG rules and InfiniBand config
4. **Storage Access**: Check storage account keys and permissions
5. **SSH Access**: Verify public key format and placement

### Emergency Rollback Procedure
```powershell
# If deployment fails, clean up resources
Remove-AzResourceGroup -Name "rg-romai-phase2b-prod" -Force
```

## 🏆 Success Validation

### Deployment Complete When:
✅ All infrastructure components deployed successfully  
✅ GPU clusters operational with InfiniBand networking  
✅ Storage systems online with high-performance tiers  
✅ Security and monitoring systems active  
✅ System ready for NVIDIA validation phase  

### Ready for Phase 2D:
- NVVS validation suite deployment
- Comprehensive system testing
- Performance baseline establishment
- Dataset processing pipeline preparation

---

**⚡ CRITICAL**: This deployment creates ~$38,500/month Azure resources. Ensure proper budget approval and monitoring.

**🎯 SUCCESS**: Upon completion, RomAI will have enterprise-grade GPU infrastructure ready for processing 150B+ tokens with world-class performance!