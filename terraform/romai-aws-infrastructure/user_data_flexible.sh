#!/bin/bash

# Enhanced User Data Script for Alternative GPU Instance Types
# Supports P4d (A100), P3dn (V100), G5 (A10G) instances
# Version: 2.0 - Multi-GPU Architecture Support

set -euo pipefail

# Template variables (populated by Terraform)
CLUSTER_NAME="${cluster_name}"
INSTANCE_TYPE="${instance_type}"
GPU_TYPE="${gpu_type}"
TOTAL_NODES=${total_nodes}
FSX_DNS_NAME="${fsx_dns_name}"
FSX_MOUNT_NAME="${fsx_mount_name}"

# Logging configuration
exec > >(tee /var/log/romai-setup.log)
exec 2>&1
echo "🚀 RomAI Cluster Setup Started: $(date)"
echo "📋 Instance Type: $INSTANCE_TYPE"
echo "🎮 GPU Type: $GPU_TYPE"
echo "🔢 Total Nodes: $TOTAL_NODES"

# System identification
INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
AVAILABILITY_ZONE=$(curl -s http://169.254.169.254/latest/meta-data/placement/availability-zone)
REGION=${AVAILABILITY_ZONE%?}
PRIVATE_IP=$(curl -s http://169.254.169.254/latest/meta-data/local-ipv4)

echo "🏷️  Instance ID: $INSTANCE_ID"
echo "🌍 Region: $REGION, AZ: $AVAILABILITY_ZONE"
echo "🔌 Private IP: $PRIVATE_IP"

# Function to install GPU drivers based on type
install_gpu_drivers() {
    echo "🎮 Installing $GPU_TYPE GPU drivers..."
    
    case "$GPU_TYPE" in
        "A100"|"V100")
            # NVIDIA Data Center drivers for P-series instances
            echo "📦 Installing NVIDIA Data Center drivers for $GPU_TYPE"
            yum install -y gcc kernel-devel-$(uname -r)
            
            # Download and install NVIDIA drivers
            cd /tmp
            if [[ "$GPU_TYPE" == "A100" ]]; then
                # Latest drivers optimized for A100
                wget -q https://us.download.nvidia.com/tesla/535.154.05/NVIDIA-Linux-x86_64-535.154.05.run
                chmod +x NVIDIA-Linux-x86_64-535.154.05.run
                ./NVIDIA-Linux-x86_64-535.154.05.run --silent --dkms
            else
                # V100 optimized drivers  
                wget -q https://us.download.nvidia.com/tesla/470.239.06/NVIDIA-Linux-x86_64-470.239.06.run
                chmod +x NVIDIA-Linux-x86_64-470.239.06.run
                ./NVIDIA-Linux-x86_64-470.239.06.run --silent --dkms
            fi
            ;;
        "A10G")
            # Gaming/Workstation drivers for G5 instances
            echo "📦 Installing NVIDIA drivers for A10G"
            yum install -y gcc kernel-devel-$(uname -r)
            cd /tmp
            wget -q https://us.download.nvidia.com/tesla/535.154.05/NVIDIA-Linux-x86_64-535.154.05.run
            chmod +x NVIDIA-Linux-x86_64-535.154.05.run
            ./NVIDIA-Linux-x86_64-535.154.05.run --silent --dkms
            ;;
    esac
    
    # Install CUDA based on GPU type
    echo "🔧 Installing CUDA toolkit..."
    if [[ "$GPU_TYPE" == "A100" ]]; then
        # CUDA 12.x for A100
        yum-config-manager --add-repo https://developer.download.nvidia.com/compute/cuda/repos/rhel8/x86_64/cuda-rhel8.repo
        yum install -y cuda-toolkit-12-4
        echo 'export PATH=/usr/local/cuda-12.4/bin:$PATH' >> /etc/profile
        echo 'export LD_LIBRARY_PATH=/usr/local/cuda-12.4/lib64:$LD_LIBRARY_PATH' >> /etc/profile
    elif [[ "$GPU_TYPE" == "V100" ]]; then
        # CUDA 11.x for V100 (better compatibility)
        yum-config-manager --add-repo https://developer.download.nvidia.com/compute/cuda/repos/rhel8/x86_64/cuda-rhel8.repo
        yum install -y cuda-toolkit-11-8
        echo 'export PATH=/usr/local/cuda-11.8/bin:$PATH' >> /etc/profile
        echo 'export LD_LIBRARY_PATH=/usr/local/cuda-11.8/lib64:$LD_LIBRARY_PATH' >> /etc/profile
    else
        # CUDA 12.x for A10G
        yum-config-manager --add-repo https://developer.download.nvidia.com/compute/cuda/repos/rhel8/x86_64/cuda-rhel8.repo
        yum install -y cuda-toolkit-12-4
        echo 'export PATH=/usr/local/cuda-12.4/bin:$PATH' >> /etc/profile
        echo 'export LD_LIBRARY_PATH=/usr/local/cuda-12.4/lib64:$LD_LIBRARY_PATH' >> /etc/profile
    fi
}

# Function to configure EFA (Enhanced Fabric Adapter) for supported instances
configure_efa() {
    if [[ "$INSTANCE_TYPE" == *"p4d"* ]] || [[ "$INSTANCE_TYPE" == *"p3dn"* ]]; then
        echo "🌐 Configuring EFA for high-performance networking..."
        cd /tmp
        curl -O https://efa-installer.amazonaws.com/aws-efa-installer-latest.tar.gz
        tar -xf aws-efa-installer-latest.tar.gz
        cd aws-efa-installer
        ./efa_installer.sh -y -g
        
        # Enable EFA for MPI
        echo 'export FI_PROVIDER=efa' >> /etc/profile
        echo 'export FI_EFA_USE_DEVICE_RDMA=1' >> /etc/profile
    else
        echo "ℹ️  EFA not available for $INSTANCE_TYPE, using standard networking"
    fi
}

# Function to optimize system for different GPU types
optimize_system() {
    echo "⚡ Optimizing system for $GPU_TYPE workloads..."
    
    # GPU-specific optimizations
    case "$GPU_TYPE" in
        "A100")
            # A100-specific optimizations
            echo 'performance' | tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
            echo 'never' > /sys/kernel/mm/transparent_hugepage/enabled
            sysctl -w vm.swappiness=1
            sysctl -w net.core.rmem_max=134217728
            sysctl -w net.core.wmem_max=134217728
            ;;
        "V100")
            # V100-specific optimizations  
            echo 'performance' | tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
            sysctl -w vm.swappiness=10
            sysctl -w net.core.rmem_max=67108864
            sysctl -w net.core.wmem_max=67108864
            ;;
        "A10G")
            # A10G-specific optimizations (inference-focused)
            echo 'performance' | tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
            sysctl -w vm.swappiness=5
            # Optimize for mixed training/inference workloads
            echo 1 > /proc/sys/kernel/numa_balancing
            ;;
    esac
    
    # Make optimizations persistent
    cat >> /etc/sysctl.conf << EOF
# RomAI GPU Optimizations for $GPU_TYPE
vm.swappiness=1
net.core.rmem_max=134217728
net.core.wmem_max=134217728
kernel.numa_balancing=1
EOF
}

# Function to install Docker with NVIDIA runtime
install_docker_nvidia() {
    echo "🐳 Installing Docker with NVIDIA runtime..."
    
    # Install Docker
    yum update -y
    yum install -y docker
    systemctl start docker
    systemctl enable docker
    usermod -a -G docker ec2-user
    
    # Install NVIDIA Container Runtime
    distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
    curl -s -L https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.repo | \
        tee /etc/yum.repos.d/nvidia-container-toolkit.repo
    
    yum install -y nvidia-container-toolkit
    nvidia-ctk runtime configure --runtime=docker
    systemctl restart docker
    
    # Test NVIDIA Docker integration
    docker run --rm --gpus all nvidia/cuda:12.0-base-ubuntu20.04 nvidia-smi || echo "⚠️  NVIDIA Docker test failed"
}

# Function to set up FSx Lustre storage
setup_fsx_storage() {
    echo "💾 Setting up FSx Lustre storage..."
    
    # Install Lustre client
    yum install -y lustre-client
    
    # Create mount point
    mkdir -p /fsx
    
    # Mount FSx Lustre
    mount -t lustre ${FSX_DNS_NAME}@tcp:/${FSX_MOUNT_NAME} /fsx
    
    # Add to fstab for persistence
    echo "${FSX_DNS_NAME}@tcp:/${FSX_MOUNT_NAME} /fsx lustre defaults,_netdev 0 0" >> /etc/fstab
    
    # Set permissions
    chmod 755 /fsx
    chown ec2-user:ec2-user /fsx
    
    # Create dataset directories
    mkdir -p /fsx/datasets/{fulg,ronec}
    mkdir -p /fsx/models/romai
    mkdir -p /fsx/checkpoints
    mkdir -p /fsx/logs
    chown -R ec2-user:ec2-user /fsx/datasets /fsx/models /fsx/checkpoints /fsx/logs
}

# Function to create GPU monitoring script
create_monitoring_script() {
    echo "📊 Creating GPU monitoring script..."
    
    cat > /home/ec2-user/gpu_monitor.sh << 'EOF'
#!/bin/bash
# GPU Monitoring Script for RomAI Cluster

while true; do
    echo "=== GPU Status $(date) ==="
    nvidia-smi --query-gpu=index,name,memory.total,memory.used,memory.free,utilization.gpu,temperature.gpu --format=csv,noheader,nounits
    echo ""
    sleep 30
done
EOF
    
    chmod +x /home/ec2-user/gpu_monitor.sh
    chown ec2-user:ec2-user /home/ec2-user/gpu_monitor.sh
}

# Function to create cluster health check
create_health_check() {
    echo "🏥 Creating cluster health check..."
    
    cat > /home/ec2-user/cluster_health.py << 'EOF'
#!/usr/bin/env python3
import subprocess
import json
import sys
from datetime import datetime

def check_gpu_status():
    try:
        result = subprocess.run(['nvidia-smi', '--query-gpu=index,name,memory.total,memory.used,utilization.gpu', '--format=csv,noheader,nounits'], 
                              capture_output=True, text=True, check=True)
        lines = result.stdout.strip().split('\n')
        gpus = []
        for line in lines:
            parts = line.split(', ')
            if len(parts) >= 5:
                gpus.append({
                    'index': int(parts[0]),
                    'name': parts[1],
                    'memory_total': int(parts[2]),
                    'memory_used': int(parts[3]),
                    'utilization': int(parts[4])
                })
        return {'status': 'healthy', 'gpus': gpus}
    except Exception as e:
        return {'status': 'error', 'error': str(e)}

def check_docker_status():
    try:
        result = subprocess.run(['docker', 'ps'], capture_output=True, text=True, check=True)
        return {'status': 'healthy', 'containers': len(result.stdout.strip().split('\n')) - 1}
    except Exception as e:
        return {'status': 'error', 'error': str(e)}

def check_storage_status():
    try:
        result = subprocess.run(['df', '-h', '/fsx'], capture_output=True, text=True, check=True)
        return {'status': 'healthy', 'disk_usage': result.stdout.strip().split('\n')[1]}
    except Exception as e:
        return {'status': 'error', 'error': str(e)}

if __name__ == "__main__":
    health_report = {
        'timestamp': datetime.now().isoformat(),
        'instance_id': subprocess.getoutput('curl -s http://169.254.169.254/latest/meta-data/instance-id'),
        'gpu': check_gpu_status(),
        'docker': check_docker_status(), 
        'storage': check_storage_status()
    }
    
    print(json.dumps(health_report, indent=2))
    
    # Exit with error code if any component is unhealthy
    if any(component['status'] == 'error' for component in [health_report['gpu'], health_report['docker'], health_report['storage']]):
        sys.exit(1)
EOF
    
    chmod +x /home/ec2-user/cluster_health.py
    chown ec2-user:ec2-user /home/ec2-user/cluster_health.py
}

# Main execution
echo "🎯 Starting setup for $GPU_TYPE ($INSTANCE_TYPE)..."

# Update system
echo "🔄 Updating system packages..."
yum update -y

# Install basic dependencies
yum install -y wget curl gcc make kernel-devel git htop iotop

# Install GPU drivers
install_gpu_drivers

# Configure EFA (for P-series instances)
configure_efa

# Install Docker with NVIDIA runtime
install_docker_nvidia

# Set up FSx Lustre storage
setup_fsx_storage

# Optimize system for GPU workloads
optimize_system

# Install Python ML stack
echo "🐍 Installing Python ML environment..."
yum install -y python3 python3-pip
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
pip3 install transformers datasets accelerate wandb tensorboard boto3

# Create monitoring and health check scripts
create_monitoring_script
create_health_check

# Configure auto-start services
cat > /etc/systemd/system/romai-cluster-health.service << EOF
[Unit]
Description=RomAI Cluster Health Monitoring
After=network.target

[Service]
Type=simple
User=ec2-user
ExecStart=/home/ec2-user/cluster_health.py
Restart=always
RestartSec=60

[Install]
WantedBy=multi-user.target
EOF

systemctl enable romai-cluster-health.service
systemctl start romai-cluster-health.service

# Final GPU verification
echo "🔍 Final GPU verification..."
nvidia-smi

# Log completion
echo "✅ RomAI Cluster Setup Completed: $(date)"
echo "🎮 GPU Type: $GPU_TYPE"
echo "📊 GPUs Detected: $(nvidia-smi --list-gpus | wc -l)"
echo "💾 Storage Mounted: $(df -h /fsx | tail -1 | awk '{print $2}')"
echo "🐳 Docker Status: $(systemctl is-active docker)"

# Create success marker
touch /home/ec2-user/setup-complete
echo "$(date): $INSTANCE_TYPE setup completed successfully with $GPU_TYPE GPUs" >> /home/ec2-user/setup-complete

echo "🚀 Node ready for RomAI dataset processing!"