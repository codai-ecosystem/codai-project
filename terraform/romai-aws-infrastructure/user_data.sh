#!/bin/bash
# RomAI GPU Cluster Initialization Script
# This script runs on each P4d.24xlarge instance to set up the GPU environment

set -e

# Variables from Terraform
FSX_FILESYSTEM_ID="${FSX_FILESYSTEM_ID}"
REGION="${REGION}"
SECRETS_NAME="${SECRETS_NAME}"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a /var/log/romai-setup.log
}

log "Starting RomAI GPU cluster initialization..."

# Update system
log "Updating system packages..."
apt-get update -y
apt-get upgrade -y

# Install required packages
log "Installing essential packages..."
apt-get install -y \
    curl \
    wget \
    unzip \
    git \
    htop \
    iotop \
    nvtop \
    jq \
    awscli \
    lustre-client-modules-$(uname -r) \
    lustre-client-modules-generic \
    lustre-utils \
    python3-pip \
    python3-venv \
    docker.io \
    docker-compose \
    build-essential \
    cmake \
    libaio-dev \
    linux-headers-$(uname -r) \
    dkms

# Install NVIDIA drivers and CUDA
log "Installing NVIDIA drivers and CUDA toolkit..."
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.0-1_all.deb
dpkg -i cuda-keyring_1.0-1_all.deb
apt-get update -y
apt-get install -y cuda-12-2
apt-get install -y nvidia-driver-535

# Install NVIDIA Container Toolkit
log "Installing NVIDIA Container Toolkit..."
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
curl -s -L https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list | \
    sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
    tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
apt-get update -y
apt-get install -y nvidia-container-toolkit
systemctl restart docker

# Install NCCL (NVIDIA Collective Communication Library)
log "Installing NCCL for multi-GPU communication..."
apt-get install -y libnccl2 libnccl-dev

# Install EFA software stack
log "Installing EFA drivers and software stack..."
cd /tmp
wget https://s3-us-west-2.amazonaws.com/aws-efa-installer/aws-efa-installer-latest.tar.gz
tar -xf aws-efa-installer-latest.tar.gz
cd aws-efa-installer
./efa_installer.sh -y

# Mount FSx Lustre filesystem
log "Mounting FSx Lustre filesystem..."
mkdir -p /mnt/fsx
echo "${FSX_FILESYSTEM_ID}.fsx.${REGION}.amazonaws.com@tcp:/fsx /mnt/fsx lustre defaults,_netdev" >> /etc/fstab
mount -a

# Set up Python environment
log "Setting up Python environment for RomAI..."
python3 -m venv /opt/romai-env
source /opt/romai-env/bin/activate
pip install --upgrade pip

# Install PyTorch with CUDA support
log "Installing PyTorch with CUDA support..."
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# Install additional Python packages
log "Installing RomAI dependencies..."
pip install \
    transformers \
    datasets \
    accelerate \
    deepspeed \
    tensorboard \
    wandb \
    fastapi \
    uvicorn \
    requests \
    boto3 \
    numpy \
    scipy \
    pandas \
    matplotlib \
    seaborn \
    scikit-learn \
    sympy \
    networkx \
    psutil \
    pynvml \
    jupyter \
    jupyterlab

# Create RomAI working directory
log "Creating RomAI working directory..."
mkdir -p /opt/romai
chown ubuntu:ubuntu /opt/romai

# Set up environment variables
log "Setting up environment variables..."
cat >> /etc/environment << EOF
CUDA_HOME=/usr/local/cuda-12.2
PATH=/usr/local/cuda-12.2/bin:\$PATH
LD_LIBRARY_PATH=/usr/local/cuda-12.2/lib64:\$LD_LIBRARY_PATH
PYTHONPATH=/opt/romai:\$PYTHONPATH
TORCH_CUDA_ARCH_LIST="7.0;7.5;8.0;8.6;8.9;9.0"
NCCL_SOCKET_IFNAME=ens5
NCCL_IB_DISABLE=0
NCCL_NET_GDR_LEVEL=PHB
NCCL_TREE_THRESHOLD=0
NCCL_DEBUG=INFO
EFA_ENABLE_SHM_TRANSFER=1
FI_EFA_ENABLE_SHM_TRANSFER=1
ROMAI_CLUSTER_MODE=aws
ROMAI_GPU_COUNT=8
ROMAI_NODE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
EOF

# Install monitoring and profiling tools
log "Installing monitoring tools..."
# DCGM for GPU monitoring
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/datacenter-gpu-manager_3.3.0_amd64.deb
dpkg -i datacenter-gpu-manager_3.3.0_amd64.deb

# Install CloudWatch agent
log "Installing CloudWatch agent..."
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
dpkg -i amazon-cloudwatch-agent.deb

# Configure CloudWatch agent for GPU metrics
cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json << EOF
{
    "agent": {
        "metrics_collection_interval": 60,
        "run_as_user": "root"
    },
    "metrics": {
        "namespace": "RomAI/GPU-Cluster",
        "metrics_collected": {
            "gpu": {
                "measurement": [
                    "utilization_gpu",
                    "utilization_memory",
                    "memory_total",
                    "memory_used",
                    "memory_free",
                    "temperature_gpu",
                    "power_draw"
                ],
                "metrics_collection_interval": 60,
                "resources": ["*"],
                "totalmetrics": false
            },
            "cpu": {
                "measurement": ["cpu_usage_idle", "cpu_usage_iowait", "cpu_usage_user", "cpu_usage_system"],
                "metrics_collection_interval": 60,
                "totalmetrics": false
            },
            "disk": {
                "measurement": ["used_percent"],
                "metrics_collection_interval": 60,
                "resources": ["*"]
            },
            "mem": {
                "measurement": ["mem_used_percent"],
                "metrics_collection_interval": 60
            }
        }
    }
}
EOF

systemctl enable amazon-cloudwatch-agent
systemctl start amazon-cloudwatch-agent

# Set up log rotation
log "Configuring log rotation..."
cat > /etc/logrotate.d/romai << EOF
/var/log/romai*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 ubuntu ubuntu
}
EOF

# Create systemd service for RomAI
log "Creating RomAI systemd service..."
cat > /etc/systemd/system/romai-cluster-node.service << EOF
[Unit]
Description=RomAI GPU Cluster Node
After=network.target

[Service]
Type=forking
User=ubuntu
Group=ubuntu
WorkingDirectory=/opt/romai
Environment=VIRTUAL_ENV=/opt/romai-env
Environment=PATH=/opt/romai-env/bin:/usr/local/cuda-12.2/bin:\$PATH
Environment=LD_LIBRARY_PATH=/usr/local/cuda-12.2/lib64
ExecStart=/bin/bash -c 'source /opt/romai-env/bin/activate && python -m romai.cluster.node_manager'
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable romai-cluster-node

# Install health check script
log "Installing health check script..."
cat > /usr/local/bin/romai-health-check.sh << 'EOF'
#!/bin/bash

# RomAI Health Check Script
echo "=== RomAI GPU Cluster Health Check ==="
echo "Node ID: $(curl -s http://169.254.169.254/latest/meta-data/instance-id)"
echo "Timestamp: $(date)"
echo ""

# GPU Status
echo "--- GPU Status ---"
nvidia-smi --query-gpu=name,memory.total,memory.used,utilization.gpu,temperature.gpu,power.draw --format=csv

# EFA Status
echo -e "\n--- EFA Status ---"
fi_info -p efa || echo "EFA not ready"

# FSx Mount Status
echo -e "\n--- FSx Lustre Status ---"
if mountpoint -q /mnt/fsx; then
    echo "✅ FSx Lustre mounted successfully"
    df -h /mnt/fsx
else
    echo "❌ FSx Lustre not mounted"
fi

# Docker Status
echo -e "\n--- Docker NVIDIA Runtime Status ---"
docker run --rm --gpus all nvidia/cuda:12.2-base-ubuntu22.04 nvidia-smi -L || echo "❌ Docker NVIDIA runtime issue"

# NCCL Test (if available)
echo -e "\n--- NCCL Status ---"
ls -la /usr/lib/x86_64-linux-gnu/libnccl* 2>/dev/null && echo "✅ NCCL installed" || echo "❌ NCCL not found"

echo -e "\n=== Health Check Complete ==="
EOF

chmod +x /usr/local/bin/romai-health-check.sh

# Set up SSH key sharing for cluster communication
log "Setting up SSH key sharing..."
mkdir -p /home/ubuntu/.ssh
cat > /home/ubuntu/.ssh/config << EOF
Host *
    StrictHostKeyChecking no
    UserKnownHostsFile=/dev/null
    LogLevel ERROR
EOF
chown -R ubuntu:ubuntu /home/ubuntu/.ssh

# Install performance optimization tools
log "Installing performance optimization tools..."
echo 'net.core.rmem_default = 262144000' >> /etc/sysctl.conf
echo 'net.core.rmem_max = 262144000' >> /etc/sysctl.conf
echo 'net.core.wmem_default = 262144000' >> /etc/sysctl.conf
echo 'net.core.wmem_max = 262144000' >> /etc/sysctl.conf
sysctl -p

# Final setup tasks
log "Completing final setup tasks..."
# Increase file descriptor limits
echo '* soft nofile 1000000' >> /etc/security/limits.conf
echo '* hard nofile 1000000' >> /etc/security/limits.conf

# Set up CUDA environment for all users
echo 'export CUDA_HOME=/usr/local/cuda-12.2' >> /etc/bash.bashrc
echo 'export PATH=/usr/local/cuda-12.2/bin:$PATH' >> /etc/bash.bashrc
echo 'export LD_LIBRARY_PATH=/usr/local/cuda-12.2/lib64:$LD_LIBRARY_PATH' >> /etc/bash.bashrc

# Create startup script
cat > /home/ubuntu/start-romai-cluster.sh << 'EOF'
#!/bin/bash
source /opt/romai-env/bin/activate
cd /opt/romai

echo "🚀 Starting RomAI GPU Cluster Node..."
echo "Node ID: $(curl -s http://169.254.169.254/latest/meta-data/instance-id)"
echo "GPUs Available: $(nvidia-smi -L | wc -l)"
echo "EFA Status: $(fi_info -p efa | grep -c 'provider: efa')"

# Run health check
/usr/local/bin/romai-health-check.sh

echo "✅ RomAI cluster node ready!"
EOF

chmod +x /home/ubuntu/start-romai-cluster.sh
chown ubuntu:ubuntu /home/ubuntu/start-romai-cluster.sh

# Reboot to ensure all drivers are properly loaded
log "RomAI GPU cluster initialization complete. Rebooting in 30 seconds..."
sleep 30
reboot