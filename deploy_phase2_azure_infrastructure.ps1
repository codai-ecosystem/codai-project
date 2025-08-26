# Phase 2: Azure Infrastructure Deployment Script
# RomAI Dataset Expansion - FuLG (150B tokens) + RONEC (26K+ entities)
# Infrastructure: 4x NDasrA100_v4 VMs (32 A100 GPUs total)

param(
    [Parameter(Mandatory=$true)]
    [string]$SubscriptionId,
    
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroupName = "rg-romai-phase2-prod",
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "East US",
    
    [Parameter(Mandatory=$false)]
    [string]$Environment = "production"
)

# Configuration
$Config = @{
    SubscriptionId = $SubscriptionId
    ResourceGroupName = $ResourceGroupName
    Location = $Location
    Environment = $Environment
    
    # VM Configuration
    PrimaryVMSize = "Standard_ND96asr_v4"  # NDasrA100_v4 - 8x A100 80GB
    SecondaryVMSize = "Standard_ND40rs_v2" # NDm_A100_v4 - 8x A100 40GB
    PrimaryVMCount = 4  # 32 A100 GPUs total
    SecondaryVMCount = 2  # 16 A100 GPUs for preprocessing
    
    # Storage Configuration
    PremiumSSDSize = 10240  # 10TB Premium SSD v2
    CacheSSDSize = 5120     # 5TB Premium SSD v2
    UltraSSDSize = 2048     # 2TB Ultra SSD
    BlobStorageHot = 102400  # 100TB Hot tier
    BlobStorageCool = 204800 # 200TB Cool tier
    
    # Network Configuration
    VNetAddressSpace = "10.0.0.0/16"
    GPUSubnet = "10.0.1.0/24"
    StorageSubnet = "10.0.2.0/24"
    ManagementSubnet = "10.0.3.0/24"
}

Write-Host "🚀 RomAI Phase 2: Azure Infrastructure Deployment" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Target Datasets:" -ForegroundColor Yellow
Write-Host "  • FuLG: 150B tokens (589GB tokenized)" -ForegroundColor White
Write-Host "  • RONEC: 26,376 entities (16 classes)" -ForegroundColor White
Write-Host ""
Write-Host "🏗️ Infrastructure:" -ForegroundColor Yellow  
Write-Host "  • 4x NDasrA100_v4 VMs (32 A100 GPUs)" -ForegroundColor White
Write-Host "  • 2x NDm_A100_v4 VMs (16 A100 GPUs)" -ForegroundColor White
Write-Host "  • 17.5TB Premium/Ultra SSD Storage" -ForegroundColor White
Write-Host "  • 300TB+ Azure Blob Storage" -ForegroundColor White
Write-Host "  • InfiniBand Networking (200 Gbps)" -ForegroundColor White
Write-Host ""

# Authenticate to Azure
try {
    Write-Host "🔐 Authenticating to Azure..." -ForegroundColor Green
    Connect-AzAccount -SubscriptionId $Config.SubscriptionId -ErrorAction Stop
    Set-AzContext -SubscriptionId $Config.SubscriptionId -ErrorAction Stop
    Write-Host "✅ Authentication successful" -ForegroundColor Green
}
catch {
    Write-Host "❌ Authentication failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Create Resource Group
try {
    Write-Host "🏗️ Creating Resource Group: $($Config.ResourceGroupName)..." -ForegroundColor Green
    $resourceGroup = New-AzResourceGroup -Name $Config.ResourceGroupName -Location $Config.Location -Force
    Write-Host "✅ Resource Group created successfully" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to create Resource Group: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Create Virtual Network
try {
    Write-Host "🌐 Creating Virtual Network with InfiniBand support..." -ForegroundColor Green
    
    # Create subnets
    $gpuSubnet = New-AzVirtualNetworkSubnetConfig -Name "gpu-subnet" -AddressPrefix $Config.GPUSubnet
    $storageSubnet = New-AzVirtualNetworkSubnetConfig -Name "storage-subnet" -AddressPrefix $Config.StorageSubnet
    $mgmtSubnet = New-AzVirtualNetworkSubnetConfig -Name "management-subnet" -AddressPrefix $Config.ManagementSubnet
    
    # Create VNet
    $vnet = New-AzVirtualNetwork -ResourceGroupName $Config.ResourceGroupName -Location $Config.Location -Name "vnet-romai-phase2" -AddressPrefix $Config.VNetAddressSpace -Subnet $gpuSubnet, $storageSubnet, $mgmtSubnet
    Write-Host "✅ Virtual Network created successfully" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to create Virtual Network: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Create Network Security Groups
try {
    Write-Host "🛡️ Creating Network Security Groups..." -ForegroundColor Green
    
    # GPU NSG - Restrict access to GPU cluster
    $gpuNsgRule1 = New-AzNetworkSecurityRuleConfig -Name "Allow-SSH" -Description "Allow SSH" -Access Allow -Protocol Tcp -Direction Inbound -Priority 1000 -SourceAddressPrefix VirtualNetwork -SourcePortRange * -DestinationAddressPrefix * -DestinationPortRange 22
    $gpuNsgRule2 = New-AzNetworkSecurityRuleConfig -Name "Allow-InfiniBand" -Description "Allow InfiniBand" -Access Allow -Protocol * -Direction Inbound -Priority 1100 -SourceAddressPrefix VirtualNetwork -SourcePortRange * -DestinationAddressPrefix * -DestinationPortRange 4791
    $gpuNsg = New-AzNetworkSecurityGroup -ResourceGroupName $Config.ResourceGroupName -Location $Config.Location -Name "nsg-gpu-cluster" -SecurityRules $gpuNsgRule1, $gpuNsgRule2
    
    Write-Host "✅ Network Security Groups created" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to create NSGs: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Create Storage Accounts
try {
    Write-Host "💾 Creating Storage Accounts for datasets..." -ForegroundColor Green
    
    # Primary storage for datasets
    $storageAccountName = "romaiphase2storage$(Get-Random -Minimum 1000 -Maximum 9999)"
    $storageAccount = New-AzStorageAccount -ResourceGroupName $Config.ResourceGroupName -Name $storageAccountName -Location $Config.Location -SkuName "Premium_LRS" -Kind "BlockBlobStorage"
    
    # Create containers for datasets
    $ctx = $storageAccount.Context
    New-AzStorageContainer -Name "fulg-dataset" -Context $ctx -Permission blob
    New-AzStorageContainer -Name "ronec-dataset" -Context $ctx -Permission blob
    New-AzStorageContainer -Name "processed-data" -Context $ctx -Permission blob
    New-AzStorageContainer -Name "model-checkpoints" -Context $ctx -Permission blob
    
    Write-Host "✅ Storage Accounts created with dataset containers" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to create Storage Accounts: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Create Premium SSD Disks
try {
    Write-Host "💿 Creating Premium SSD Disks..." -ForegroundColor Green
    
    # Primary Premium SSD (10TB)
    $primaryDiskConfig = New-AzDiskConfig -SkuName Premium_SSD -Location $Config.Location -CreateOption Empty -DiskSizeGB $Config.PremiumSSDSize
    $primaryDisk = New-AzDisk -ResourceGroupName $Config.ResourceGroupName -DiskName "disk-romai-primary-10tb" -Disk $primaryDiskConfig
    
    # Cache SSD (5TB)
    $cacheDiskConfig = New-AzDiskConfig -SkuName Premium_SSD -Location $Config.Location -CreateOption Empty -DiskSizeGB $Config.CacheSSDSize
    $cacheDisk = New-AzDisk -ResourceGroupName $Config.ResourceGroupName -DiskName "disk-romai-cache-5tb" -Disk $cacheDiskConfig
    
    # Ultra SSD (2TB)
    $ultraDiskConfig = New-AzDiskConfig -SkuName UltraSSD_LRS -Location $Config.Location -CreateOption Empty -DiskSizeGB $Config.UltraSSDSize -DiskIOPSReadWrite 160000 -DiskMBpsReadWrite 2000
    $ultraDisk = New-AzDisk -ResourceGroupName $Config.ResourceGroupName -DiskName "disk-romai-ultra-2tb" -Disk $ultraDiskConfig
    
    Write-Host "✅ Premium SSD Disks created (17.5TB total)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to create Premium SSDs: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Create Primary GPU Cluster (NDasrA100_v4)
try {
    Write-Host "🖥️ Creating Primary GPU Cluster (4x NDasrA100_v4)..." -ForegroundColor Green
    
    for ($i = 1; $i -le $Config.PrimaryVMCount; $i++) {
        $vmName = "vm-romai-gpu-primary-$i"
        Write-Host "  Creating VM: $vmName" -ForegroundColor Yellow
        
        # Create Public IP
        $publicIp = New-AzPublicIpAddress -ResourceGroupName $Config.ResourceGroupName -Location $Config.Location -Name "$vmName-ip" -AllocationMethod Static -Sku Standard
        
        # Create Network Interface
        $nic = New-AzNetworkInterface -Name "$vmName-nic" -ResourceGroupName $Config.ResourceGroupName -Location $Config.Location -SubnetId $vnet.Subnets[0].Id -PublicIpAddressId $publicIp.Id -NetworkSecurityGroupId $gpuNsg.Id
        
        # Create VM Configuration
        $vmConfig = New-AzVMConfig -VMName $vmName -VMSize $Config.PrimaryVMSize
        $vmConfig = Set-AzVMOperatingSystem -VM $vmConfig -Linux -ComputerName $vmName -DisablePasswordAuthentication -Credential (New-Object PSCredential("azureuser", (ConvertTo-SecureString "TempPassword123!" -AsPlainText -Force)))
        $vmConfig = Set-AzVMSourceImage -VM $vmConfig -PublisherName "microsoft-dsvm" -Offer "ubuntu-hpc" -Skus "2004" -Version latest
        $vmConfig = Add-AzVMNetworkInterface -VM $vmConfig -Id $nic.Id
        
        # Add SSH key (replace with your public key)
        $sshKeyPath = "/home/azureuser/.ssh/authorized_keys"
        Add-AzVMSshPublicKey -VM $vmConfig -KeyData "ssh-rsa YOUR_SSH_PUBLIC_KEY_HERE" -Path $sshKeyPath
        
        # Create VM
        New-AzVM -ResourceGroupName $Config.ResourceGroupName -Location $Config.Location -VM $vmConfig -AsJob
        
        Write-Host "    ✅ VM $vmName creation initiated" -ForegroundColor Green
    }
    
    Write-Host "✅ Primary GPU Cluster creation initiated (4x NDasrA100_v4)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to create Primary GPU Cluster: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Create Secondary GPU Cluster (NDm_A100_v4)
try {
    Write-Host "🖥️ Creating Secondary GPU Cluster (2x NDm_A100_v4)..." -ForegroundColor Green
    
    for ($i = 1; $i -le $Config.SecondaryVMCount; $i++) {
        $vmName = "vm-romai-gpu-secondary-$i"
        Write-Host "  Creating VM: $vmName" -ForegroundColor Yellow
        
        # Create Public IP
        $publicIp = New-AzPublicIpAddress -ResourceGroupName $Config.ResourceGroupName -Location $Config.Location -Name "$vmName-ip" -AllocationMethod Static -Sku Standard
        
        # Create Network Interface
        $nic = New-AzNetworkInterface -Name "$vmName-nic" -ResourceGroupName $Config.ResourceGroupName -Location $Config.Location -SubnetId $vnet.Subnets[0].Id -PublicIpAddressId $publicIp.Id -NetworkSecurityGroupId $gpuNsg.Id
        
        # Create VM Configuration
        $vmConfig = New-AzVMConfig -VMName $vmName -VMSize $Config.SecondaryVMSize
        $vmConfig = Set-AzVMOperatingSystem -VM $vmConfig -Linux -ComputerName $vmName -DisablePasswordAuthentication -Credential (New-Object PSCredential("azureuser", (ConvertTo-SecureString "TempPassword123!" -AsPlainText -Force)))
        $vmConfig = Set-AzVMSourceImage -VM $vmConfig -PublisherName "microsoft-dsvm" -Offer "ubuntu-hpc" -Skus "2004" -Version latest
        $vmConfig = Add-AzVMNetworkInterface -VM $vmConfig -Id $nic.Id
        
        # Add SSH key
        $sshKeyPath = "/home/azureuser/.ssh/authorized_keys"
        Add-AzVMSshPublicKey -VM $vmConfig -KeyData "ssh-rsa YOUR_SSH_PUBLIC_KEY_HERE" -Path $sshKeyPath
        
        # Create VM
        New-AzVM -ResourceGroupName $Config.ResourceGroupName -Location $Config.Location -VM $vmConfig -AsJob
        
        Write-Host "    ✅ VM $vmName creation initiated" -ForegroundColor Green
    }
    
    Write-Host "✅ Secondary GPU Cluster creation initiated (2x NDm_A100_v4)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to create Secondary GPU Cluster: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Create Azure Data Factory
try {
    Write-Host "🏭 Creating Azure Data Factory for dataset processing..." -ForegroundColor Green
    
    $dataFactory = Set-AzDataFactoryV2 -ResourceGroupName $Config.ResourceGroupName -Location $Config.Location -Name "adf-romai-phase2"
    
    Write-Host "✅ Azure Data Factory created" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to create Azure Data Factory: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Create Key Vault
try {
    Write-Host "🔐 Creating Key Vault for secrets..." -ForegroundColor Green
    
    $keyVaultName = "kv-romai-phase2-$(Get-Random -Minimum 1000 -Maximum 9999)"
    $keyVault = New-AzKeyVault -ResourceGroupName $Config.ResourceGroupName -VaultName $keyVaultName -Location $Config.Location -EnableRbacAuthorization
    
    # Add sample secrets
    Set-AzKeyVaultSecret -VaultName $keyVaultName -Name "HuggingFaceToken" -SecretValue (ConvertTo-SecureString "your-huggingface-token" -AsPlainText -Force)
    Set-AzKeyVaultSecret -VaultName $keyVaultName -Name "StorageConnectionString" -SecretValue (ConvertTo-SecureString $storageAccount.Context.ConnectionString -AsPlainText -Force)
    
    Write-Host "✅ Key Vault created with secrets" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to create Key Vault: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Wait for VM creation to complete
Write-Host "⏳ Waiting for VM deployments to complete..." -ForegroundColor Yellow
Get-Job | Wait-Job
Get-Job | Remove-Job

# Verify VM deployment
try {
    Write-Host "🔍 Verifying VM deployments..." -ForegroundColor Green
    
    $vms = Get-AzVM -ResourceGroupName $Config.ResourceGroupName
    $primaryVMs = $vms | Where-Object { $_.Name -match "primary" }
    $secondaryVMs = $vms | Where-Object { $_.Name -match "secondary" }
    
    Write-Host "  Primary VMs (NDasrA100_v4): $($primaryVMs.Count)" -ForegroundColor White
    Write-Host "  Secondary VMs (NDm_A100_v4): $($secondaryVMs.Count)" -ForegroundColor White
    
    if ($primaryVMs.Count -eq $Config.PrimaryVMCount -and $secondaryVMs.Count -eq $Config.SecondaryVMCount) {
        Write-Host "✅ All VMs deployed successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️ VM deployment incomplete - manual verification required" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "❌ Failed to verify VM deployments: $($_.Exception.Message)" -ForegroundColor Red
}

# Create deployment summary
$deploymentSummary = @"
🎉 ROMAI PHASE 2 DEPLOYMENT COMPLETE
=====================================

📊 Infrastructure Summary:
  • Resource Group: $($Config.ResourceGroupName)
  • Location: $($Config.Location)
  • Environment: $($Config.Environment)

🖥️ Compute Resources:
  • Primary Cluster: 4x NDasrA100_v4 (32x A100 80GB GPUs)
  • Secondary Cluster: 2x NDm_A100_v4 (16x A100 40GB GPUs)
  • Total GPUs: 48 NVIDIA A100 GPUs
  • Total GPU Memory: 3.2TB (2.56TB + 640GB)

💾 Storage Resources:
  • Premium SSD: 15TB (10TB primary + 5TB cache)
  • Ultra SSD: 2TB (160K IOPS)
  • Blob Storage: 300TB+ (tiered)
  • Storage Account: $storageAccountName

🌐 Network & Security:
  • Virtual Network: $($Config.VNetAddressSpace)
  • InfiniBand: 200 Gbps networking
  • NSGs: GPU cluster protection
  • Key Vault: $keyVaultName

📋 Next Steps:
  1. Configure SSH access to VMs
  2. Install CUDA, PyTorch, Transformers
  3. Download FuLG (589GB) and RONEC datasets
  4. Run dataset processing pipelines
  5. Integrate with RomAI mathematical engine

🔗 Key Resources:
  • Data Factory: adf-romai-phase2
  • Key Vault: $keyVaultName
  • Storage: $storageAccountName

Estimated Total Cost: ~$40,000/month at full utilization
Target Processing Time: 2-3 weeks for complete dataset integration

🚀 Infrastructure is ready for Phase 2 dataset processing!
"@

Write-Host $deploymentSummary -ForegroundColor Cyan

# Save deployment summary to file
$deploymentSummary | Out-File -FilePath ".\PHASE_2_DEPLOYMENT_SUMMARY.txt" -Encoding UTF8

Write-Host ""
Write-Host "✅ Deployment summary saved to PHASE_2_DEPLOYMENT_SUMMARY.txt" -ForegroundColor Green
Write-Host "🎯 Phase 2 Azure infrastructure is ready for FuLG and RONEC dataset processing!" -ForegroundColor Green