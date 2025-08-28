#!/bin/bash
set -e
exec > >(tee /var/log/user-data.log) 2>&1
echo "?? RomAI CPU Development Environment Setup Started"
apt-get update -y
apt-get install -y python3-pip git curl wget htop vim
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
pip3 install transformers datasets fastapi uvicorn numpy pandas
mkdir -p /home/ubuntu/romai-dev
chown ubuntu:ubuntu /home/ubuntu/romai-dev
echo "? RomAI CPU Environment Ready" > /home/ubuntu/setup_complete.txt
chown ubuntu:ubuntu /home/ubuntu/setup_complete.txt
echo "?? Setup completed at 08/26/2025 20:24:03"
