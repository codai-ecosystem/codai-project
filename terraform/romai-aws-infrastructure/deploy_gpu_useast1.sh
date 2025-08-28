#!/bin/bash

# RomAI GPU Instance Quick Deploy Script
# Target: p3.2xlarge with 1x V100 GPU in us-east-1
# Date: August 26, 2025

set -euo pipefail

echo "🚀 ROMAI GPU INSTANCE DEPLOYMENT - us-east-1"
echo "============================================="

# Configuration
REGION="us-east-1" 
INSTANCE_TYPE="p3.2xlarge"  # 1x V100, 8 vCPUs, 61GB RAM
AMI_ID="ami-0c02fb55956c7d316"  # Ubuntu 20.04 LTS
KEY_NAME="romai-gpu-key-useast1"
SECURITY_GROUP_NAME="romai-gpu-sg-useast1"

echo "📋 Instance Configuration:"
echo "   Type: $INSTANCE_TYPE (1x NVIDIA V100 16GB)"
echo "   Region: $REGION"
echo "   vCPUs: 8, RAM: 61GB"
echo "   Cost: ~3.06 USD/hour, ~2,205 USD/month"

# Create security group
echo ""
echo "🔐 Creating security group..."
SECURITY_GROUP_ID=$(aws ec2 create-security-group \
    --group-name $SECURITY_GROUP_NAME \
    --description "RomAI GPU instance security group for us-east-1" \
    --region $REGION \
    --query 'GroupId' \
    --output text 2>/dev/null || aws ec2 describe-security-groups \
    --group-names $SECURITY_GROUP_NAME \
    --region $REGION \
    --query 'SecurityGroups[0].GroupId' \
    --output text)

echo "   Security Group ID: $SECURITY_GROUP_ID"

# Add SSH rule
aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0 \
    --region $REGION 2>/dev/null || true

# Create key pair if needed
echo ""
echo "🔑 Setting up SSH key pair..."
if ! aws ec2 describe-key-pairs --key-names $KEY_NAME --region $REGION >/dev/null 2>&1; then
    aws ec2 create-key-pair \
        --key-name $KEY_NAME \
        --region $REGION \
        --query 'KeyMaterial' \
        --output text > ${KEY_NAME}.pem
    chmod 400 ${KEY_NAME}.pem
    echo "   Created new key pair: ${KEY_NAME}.pem"
else
    echo "   Using existing key pair: $KEY_NAME"
fi

# Launch instance
echo ""
echo "🖥️ Launching GPU instance..."
INSTANCE_ID=$(aws ec2 run-instances \
    --image-id $AMI_ID \
    --instance-type $INSTANCE_TYPE \
    --key-name $KEY_NAME \
    --security-group-ids $SECURITY_GROUP_ID \
    --count 1 \
    --region $REGION \
    --user-data '#!/bin/bash
apt-get update -y
apt-get install -y python3-pip htop nvtop
pip3 install torch torchvision --index-url https://download.pytorch.org/whl/cu118
echo "🎯 RomAI GPU instance ready for configuration"
' \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=RomAI-GPU-p3.2xlarge},{Key=Project,Value=RomAI-Phase2},{Key=Environment,Value=Production}]" \
    --query 'Instances[0].InstanceId' \
    --output text)

echo "   Instance ID: $INSTANCE_ID"

# Wait for instance to be running
echo ""
echo "⏳ Waiting for instance to be running..."
aws ec2 wait instance-running --instance-ids $INSTANCE_ID --region $REGION

# Get public IP
PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --region $REGION \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

echo ""
echo "✅ DEPLOYMENT SUCCESSFUL!"
echo "=========================="
echo "Instance ID: $INSTANCE_ID"
echo "Public IP: $PUBLIC_IP" 
echo "Region: $REGION"
echo "Instance Type: $INSTANCE_TYPE (1x V100 GPU)"
echo ""
echo "🔗 SSH Connection:"
echo "ssh -i ${KEY_NAME}.pem ubuntu@${PUBLIC_IP}"
echo ""
echo "📊 Next Steps:"
echo "1. SSH into instance and verify GPU: nvidia-smi"
echo "2. Install RomAI environment and dependencies"
echo "3. Start Phase 2 dataset processing on V100 GPU"
echo "4. Monitor costs: ~3.06 USD/hour"