#!/bin/bash

# RomAI CPU Development Environment Setup
# Instance: c5.2xlarge (8 vCPU, 16GB RAM)
# Purpose: CPU-based development while waiting for GPU quota approval

set -e
exec > >(tee /var/log/user-data.log) 2>&1

echo "🚀 Starting RomAI CPU Development Environment Setup..."

# Update system
apt-get update -y
apt-get upgrade -y

# Install essential development tools
apt-get install -y \
    curl \
    wget \
    git \
    vim \
    htop \
    unzip \
    build-essential \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Install Python 3.11
add-apt-repository ppa:deadsnakes/ppa -y
apt-get update -y
apt-get install -y python3.11 python3.11-pip python3.11-venv python3.11-dev

# Set Python 3.11 as default
update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1
update-alternatives --install /usr/bin/pip3 pip3 /usr/bin/pip3.11 1

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Add ubuntu user to docker group
usermod -aG docker ubuntu

# Create development environment
mkdir -p /home/ubuntu/romai-dev
chown ubuntu:ubuntu /home/ubuntu/romai-dev

# Install Python dependencies
sudo -u ubuntu pip3 install --user \
    torch==2.1.0+cpu \
    torchvision==0.16.0+cpu \
    torchaudio==2.1.0+cpu \
    --index-url https://download.pytorch.org/whl/cpu

sudo -u ubuntu pip3 install --user \
    transformers \
    datasets \
    accelerate \
    numpy \
    pandas \
    scikit-learn \
    matplotlib \
    seaborn \
    jupyter \
    fastapi \
    uvicorn \
    pydantic \
    asyncio \
    aiohttp \
    psutil \
    pytest \
    black \
    flake8

# Clone and setup RomAI (placeholder - would need actual repo access)
cd /home/ubuntu/romai-dev
sudo -u ubuntu git init romai-agi
cd romai-agi

# Create basic project structure
sudo -u ubuntu mkdir -p {src/{ml/{models,reasoning,serving},api,utils},tests,configs,data,scripts}

# Create development scripts
cat > /home/ubuntu/romai-dev/start_dev.sh << 'EOF'
#!/bin/bash
echo "🧠 Starting RomAI CPU Development Environment"
echo "📍 Location: /home/ubuntu/romai-dev/romai-agi"
echo "🐍 Python: $(python3 --version)"
echo "🔧 Node.js: $(node --version)"
echo "🐳 Docker: $(docker --version)"
echo "💻 CPU Cores: $(nproc)"
echo "💾 Memory: $(free -h | grep Mem | awk '{print $2}')"
echo "📊 Disk Space: $(df -h / | tail -1 | awk '{print $4}')"
echo ""
echo "✅ RomAI CPU Development Environment Ready!"
echo "📝 To start development:"
echo "   cd /home/ubuntu/romai-dev/romai-agi"
echo "   python3 -m venv venv"
echo "   source venv/bin/activate"
echo "   # Your RomAI development commands here"
EOF

chmod +x /home/ubuntu/romai-dev/start_dev.sh
chown ubuntu:ubuntu /home/ubuntu/romai-dev/start_dev.sh

# Create system info script
cat > /home/ubuntu/system_info.sh << 'EOF'
#!/bin/bash
echo "🖥️ RomAI CPU Development Instance Information"
echo "============================================="
echo "📍 Instance Type: c5.2xlarge (8 vCPU, 16GB RAM)"
echo "🌍 Region: us-east-1"
echo "💻 CPU Info: $(grep 'model name' /proc/cpuinfo | head -1 | cut -d':' -f2 | xargs)"
echo "💾 Total Memory: $(free -h | grep Mem | awk '{print $2}')"
echo "💾 Available Memory: $(free -h | grep Mem | awk '{print $7}')"
echo "📊 Disk Usage: $(df -h / | tail -1 | awk '{print $3 " / " $2 " (" $5 ")"}')"
echo "🔄 Uptime: $(uptime -p)"
echo "📈 Load Average: $(uptime | cut -d',' -f3-5)"
echo ""
echo "🧠 RomAI Status: CPU-based development ready"
echo "⏳ GPU Status: Waiting for quota approval"
echo "   • G instances request: f66c629e6e5547e69685ebfffbc551b77kgDHxLm"
echo "   • P instances request: 93134638d20844bda9bf4f65581231bbcbP727EC"
EOF

chmod +x /home/ubuntu/system_info.sh
chown ubuntu:ubuntu /home/ubuntu/system_info.sh

# Set up environment variables
echo 'export ROMAI_ENV=cpu_development' >> /home/ubuntu/.bashrc
echo 'export ROMAI_MODE=cpu_only' >> /home/ubuntu/.bashrc
echo 'export PATH="/home/ubuntu/.local/bin:$PATH"' >> /home/ubuntu/.bashrc

# Final setup
echo "✅ RomAI CPU Development Environment Setup Complete!"
echo "📍 Development directory: /home/ubuntu/romai-dev"
echo "🔧 Start script: /home/ubuntu/romai-dev/start_dev.sh"
echo "📊 System info: /home/ubuntu/system_info.sh"

# Run system info on login
echo '/home/ubuntu/system_info.sh' >> /home/ubuntu/.bashrc

echo "🎉 Setup completed successfully at $(date)"