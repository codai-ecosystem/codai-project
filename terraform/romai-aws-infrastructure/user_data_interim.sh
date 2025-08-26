#!/bin/bash

# Interim Data Preprocessing Setup Script
# For Standard CPU instances while awaiting GPU quota approval
# Version: 1.0 - CPU-Optimized Data Processing

set -euo pipefail

# Template variables (populated by Terraform)
CLUSTER_NAME="${cluster_name}"
INSTANCE_TYPE="${instance_type}"
TOTAL_NODES=${total_nodes}
FSX_DNS_NAME="${fsx_dns_name}"
FSX_MOUNT_NAME="${fsx_mount_name}"

# Logging configuration
exec > >(tee /var/log/romai-interim-setup.log)
exec 2>&1
echo "🚀 RomAI Interim Preprocessing Setup Started: $(date)"
echo "📋 Instance Type: $INSTANCE_TYPE (CPU-optimized)"
echo "🔢 Total Nodes: $TOTAL_NODES"
echo "💾 Purpose: Dataset preprocessing while awaiting GPU quota"

# System identification
INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
AVAILABILITY_ZONE=$(curl -s http://169.254.169.254/latest/meta-data/placement/availability-zone)
REGION=${AVAILABILITY_ZONE%?}
PRIVATE_IP=$(curl -s http://169.254.169.254/latest/meta-data/local-ipv4)

echo "🏷️  Instance ID: $INSTANCE_ID"
echo "🌍 Region: $REGION, AZ: $AVAILABILITY_ZONE"
echo "🔌 Private IP: $PRIVATE_IP"

# Function to optimize CPU for data processing
optimize_cpu_performance() {
    echo "⚡ Optimizing CPU performance for data processing..."
    
    # Set CPU governor to performance
    echo 'performance' | tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor || true
    
    # Optimize for computational workloads
    sysctl -w vm.swappiness=10
    sysctl -w kernel.numa_balancing=1
    sysctl -w vm.dirty_ratio=15
    sysctl -w vm.dirty_background_ratio=5
    
    # Network optimizations for data transfer
    sysctl -w net.core.rmem_max=67108864
    sysctl -w net.core.wmem_max=67108864
    sysctl -w net.ipv4.tcp_rmem="4096 87380 67108864"
    sysctl -w net.ipv4.tcp_wmem="4096 65536 67108864"
    
    # Make optimizations persistent
    cat >> /etc/sysctl.conf << EOF
# RomAI CPU Optimization for Data Processing
vm.swappiness=10
kernel.numa_balancing=1
vm.dirty_ratio=15
vm.dirty_background_ratio=5
net.core.rmem_max=67108864
net.core.wmem_max=67108864
net.ipv4.tcp_rmem=4096 87380 67108864
net.ipv4.tcp_wmem=4096 65536 67108864
EOF
}

# Function to install Python ML stack (CPU-optimized)
install_python_ml_stack() {
    echo "🐍 Installing CPU-optimized Python ML environment..."
    
    # Install Python 3.11 and pip
    yum update -y
    yum install -y python3 python3-pip python3-devel gcc gcc-c++ make
    
    # Install CPU-optimized PyTorch
    pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
    
    # Install essential ML libraries
    pip3 install \
        transformers==4.35.0 \
        datasets==2.14.0 \
        tokenizers==0.14.0 \
        numpy==1.24.3 \
        pandas==2.0.3 \
        scikit-learn==1.3.0 \
        matplotlib==3.7.2 \
        seaborn==0.12.2 \
        tqdm==4.65.0 \
        requests==2.31.0 \
        boto3==1.28.0 \
        accelerate==0.23.0 \
        wandb==0.15.0
    
    # Install Romanian language processing tools
    pip3 install \
        spacy==3.6.1 \
        ro-core-news-sm \
        sentencepiece==0.1.99 \
        polyglot==16.7.4
    
    # Download Romanian spaCy model
    python3 -m spacy download ro_core_news_sm
}

# Function to set up FSx Lustre storage
setup_fsx_storage() {
    echo "💾 Setting up FSx Lustre storage..."
    
    # Install Lustre client
    amazon-linux-extras install -y lustre2.10
    
    # Create mount point
    mkdir -p /fsx
    
    # Mount FSx Lustre
    mount -t lustre ${FSX_DNS_NAME}@tcp:/${FSX_MOUNT_NAME} /fsx
    
    # Add to fstab for persistence
    echo "${FSX_DNS_NAME}@tcp:/${FSX_MOUNT_NAME} /fsx lustre defaults,_netdev 0 0" >> /etc/fstab
    
    # Set permissions
    chmod 755 /fsx
    chown ec2-user:ec2-user /fsx
    
    # Create comprehensive directory structure
    mkdir -p /fsx/{datasets,models,checkpoints,logs,temp,cache}
    mkdir -p /fsx/datasets/{fulg,ronec,processed,validation}
    mkdir -p /fsx/models/{romai,pretrained,fine-tuned}
    mkdir -p /fsx/logs/{preprocessing,training,evaluation}
    
    chown -R ec2-user:ec2-user /fsx/datasets /fsx/models /fsx/checkpoints /fsx/logs /fsx/temp /fsx/cache
}

# Function to install Docker for containerized processing
install_docker() {
    echo "🐳 Installing Docker for containerized processing..."
    
    yum install -y docker
    systemctl start docker
    systemctl enable docker
    usermod -a -G docker ec2-user
    
    # Install Docker Compose
    curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" \
         -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
}

# Function to create dataset preprocessing tools
create_preprocessing_tools() {
    echo "🔧 Creating dataset preprocessing tools..."
    
    # Create main preprocessing script
    cat > /home/ec2-user/dataset_preprocessor.py << 'EOF'
#!/usr/bin/env python3
"""
RomAI Dataset Preprocessing Pipeline
CPU-optimized version for interim deployment
"""

import os
import json
import time
import logging
import asyncio
from pathlib import Path
from typing import Dict, List, Optional
import pandas as pd
import numpy as np
from datasets import load_dataset, Dataset
from transformers import AutoTokenizer
import boto3
from tqdm import tqdm

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/fsx/logs/preprocessing/dataset_preprocessing.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class InterimDatasetProcessor:
    def __init__(self):
        self.base_path = Path('/fsx')
        self.datasets_path = self.base_path / 'datasets'
        self.models_path = self.base_path / 'models'
        self.logs_path = self.base_path / 'logs'
        
        # Initialize tokenizer for Romanian
        self.tokenizer = AutoTokenizer.from_pretrained('dumitrescustefan/bert-base-romanian-cased-v1')
        
        # AWS S3 client for dataset download
        self.s3_client = boto3.client('s3')
        
        logger.info("✅ InterimDatasetProcessor initialized")
    
    async def download_fulg_dataset(self):
        """Download and prepare FuLG dataset (150B tokens)"""
        logger.info("📥 Starting FuLG dataset download...")
        
        fulg_path = self.datasets_path / 'fulg'
        fulg_path.mkdir(exist_ok=True)
        
        try:
            # Download FuLG dataset from HuggingFace
            dataset = load_dataset('readerbench/FuLG', split='train', streaming=True)
            
            # Process in chunks for memory efficiency
            chunk_size = 10000
            chunk_idx = 0
            
            processed_samples = []
            
            for i, sample in enumerate(tqdm(dataset, desc="Processing FuLG")):
                processed_samples.append({
                    'text': sample['text'],
                    'tokens': len(self.tokenizer.encode(sample['text'], max_length=512, truncation=True)),
                    'language': 'ro',
                    'source': 'fulg'
                })
                
                if len(processed_samples) >= chunk_size:
                    # Save chunk
                    chunk_file = fulg_path / f'fulg_chunk_{chunk_idx:06d}.jsonl'
                    with open(chunk_file, 'w', encoding='utf-8') as f:
                        for sample in processed_samples:
                            f.write(json.dumps(sample, ensure_ascii=False) + '\n')
                    
                    logger.info(f"💾 Saved FuLG chunk {chunk_idx} ({len(processed_samples)} samples)")
                    processed_samples = []
                    chunk_idx += 1
                
                # Limit processing for interim deployment
                if i >= 100000:  # Process first 100K samples
                    break
            
            # Save remaining samples
            if processed_samples:
                chunk_file = fulg_path / f'fulg_chunk_{chunk_idx:06d}.jsonl'
                with open(chunk_file, 'w', encoding='utf-8') as f:
                    for sample in processed_samples:
                        f.write(json.dumps(sample, ensure_ascii=False) + '\n')
            
            logger.info("✅ FuLG dataset processing completed")
            
        except Exception as e:
            logger.error(f"❌ FuLG dataset processing failed: {e}")
            raise
    
    async def download_ronec_dataset(self):
        """Download and prepare RONEC dataset (Romanian NER)"""
        logger.info("📥 Starting RONEC dataset download...")
        
        ronec_path = self.datasets_path / 'ronec'
        ronec_path.mkdir(exist_ok=True)
        
        try:
            # Download RONEC dataset
            dataset = load_dataset('ronec', split='train')
            
            processed_data = []
            
            for sample in tqdm(dataset, desc="Processing RONEC"):
                processed_data.append({
                    'tokens': sample['tokens'],
                    'ner_tags': sample['ner_tags'],
                    'text': ' '.join(sample['tokens']),
                    'language': 'ro',
                    'source': 'ronec'
                })
            
            # Save processed RONEC data
            ronec_file = ronec_path / 'ronec_processed.jsonl'
            with open(ronec_file, 'w', encoding='utf-8') as f:
                for sample in processed_data:
                    f.write(json.dumps(sample, ensure_ascii=False) + '\n')
            
            logger.info(f"✅ RONEC dataset processing completed ({len(processed_data)} samples)")
            
        except Exception as e:
            logger.error(f"❌ RONEC dataset processing failed: {e}")
            raise
    
    async def validate_datasets(self):
        """Validate processed datasets"""
        logger.info("🔍 Validating processed datasets...")
        
        validation_results = {}
        
        # Validate FuLG
        fulg_path = self.datasets_path / 'fulg'
        if fulg_path.exists():
            fulg_files = list(fulg_path.glob('*.jsonl'))
            total_samples = 0
            total_tokens = 0
            
            for file in fulg_files:
                with open(file, 'r', encoding='utf-8') as f:
                    for line in f:
                        sample = json.loads(line)
                        total_samples += 1
                        total_tokens += sample.get('tokens', 0)
            
            validation_results['fulg'] = {
                'files': len(fulg_files),
                'samples': total_samples,
                'tokens': total_tokens
            }
        
        # Validate RONEC
        ronec_path = self.datasets_path / 'ronec'
        if ronec_path.exists():
            ronec_file = ronec_path / 'ronec_processed.jsonl'
            if ronec_file.exists():
                with open(ronec_file, 'r', encoding='utf-8') as f:
                    ronec_samples = sum(1 for _ in f)
                validation_results['ronec'] = {
                    'samples': ronec_samples
                }
        
        # Save validation report
        report_file = self.logs_path / 'preprocessing' / 'validation_report.json'
        report_file.parent.mkdir(parents=True, exist_ok=True)
        with open(report_file, 'w') as f:
            json.dumps(validation_results, f, indent=2)
        
        logger.info(f"✅ Dataset validation completed: {validation_results}")
        return validation_results
    
    async def run_preprocessing_pipeline(self):
        """Run complete preprocessing pipeline"""
        logger.info("🚀 Starting RomAI dataset preprocessing pipeline...")
        
        start_time = time.time()
        
        # Process datasets
        await self.download_fulg_dataset()
        await self.download_ronec_dataset()
        
        # Validate results
        validation_results = await self.validate_datasets()
        
        end_time = time.time()
        processing_time = end_time - start_time
        
        # Generate summary report
        summary = {
            'processing_time_seconds': processing_time,
            'processing_time_human': f"{processing_time/3600:.2f} hours",
            'validation_results': validation_results,
            'status': 'completed',
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        summary_file = self.logs_path / 'preprocessing' / 'processing_summary.json'
        with open(summary_file, 'w') as f:
            json.dumps(summary, f, indent=2)
        
        logger.info(f"✅ Preprocessing pipeline completed in {processing_time/3600:.2f} hours")
        return summary

async def main():
    processor = InterimDatasetProcessor()
    summary = await processor.run_preprocessing_pipeline()
    print(f"🎉 Processing completed: {summary}")

if __name__ == "__main__":
    asyncio.run(main())
EOF
    
    chmod +x /home/ec2-user/dataset_preprocessor.py
    chown ec2-user:ec2-user /home/ec2-user/dataset_preprocessor.py
}

# Function to create monitoring and health check scripts
create_monitoring_tools() {
    echo "📊 Creating monitoring and health check tools..."
    
    # CPU monitoring script
    cat > /home/ec2-user/cpu_monitor.sh << 'EOF'
#!/bin/bash
# CPU Monitoring Script for RomAI Interim Cluster

while true; do
    echo "=== CPU & Memory Status $(date) ==="
    echo "CPU Usage:"
    top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print "CPU Load: " 100 - $1 "%"}'
    
    echo "Memory Usage:"
    free -h
    
    echo "Disk Usage:"
    df -h /fsx
    
    echo "Network Activity:"
    cat /proc/net/dev | grep eth0
    
    echo "Top Processes:"
    ps aux --sort=-%cpu | head -10
    
    echo ""
    sleep 60
done
EOF
    
    chmod +x /home/ec2-user/cpu_monitor.sh
    
    # Health check script
    cat > /home/ec2-user/interim_health_check.py << 'EOF'
#!/usr/bin/env python3
import subprocess
import json
import sys
from datetime import datetime
import psutil
import os

def check_system_health():
    try:
        # CPU usage
        cpu_percent = psutil.cpu_percent(interval=1)
        
        # Memory usage
        memory = psutil.virtual_memory()
        
        # Disk usage
        fsx_usage = psutil.disk_usage('/fsx') if os.path.exists('/fsx') else None
        
        # Network stats
        network = psutil.net_io_counters()
        
        return {
            'status': 'healthy',
            'cpu_percent': cpu_percent,
            'memory_percent': memory.percent,
            'memory_available_gb': memory.available / (1024**3),
            'fsx_usage_percent': (fsx_usage.used / fsx_usage.total * 100) if fsx_usage else None,
            'network_bytes_sent': network.bytes_sent,
            'network_bytes_recv': network.bytes_recv
        }
    except Exception as e:
        return {'status': 'error', 'error': str(e)}

def check_docker_status():
    try:
        result = subprocess.run(['docker', 'ps'], capture_output=True, text=True, check=True)
        return {'status': 'healthy', 'containers': len(result.stdout.strip().split('\n')) - 1}
    except Exception as e:
        return {'status': 'error', 'error': str(e)}

def check_python_environment():
    try:
        import torch
        import transformers
        import datasets
        return {
            'status': 'healthy',
            'torch_version': torch.__version__,
            'transformers_version': transformers.__version__,
            'datasets_version': datasets.__version__
        }
    except Exception as e:
        return {'status': 'error', 'error': str(e)}

if __name__ == "__main__":
    health_report = {
        'timestamp': datetime.now().isoformat(),
        'instance_id': subprocess.getoutput('curl -s http://169.254.169.254/latest/meta-data/instance-id'),
        'instance_type': 'interim_preprocessing',
        'system': check_system_health(),
        'docker': check_docker_status(),
        'python_env': check_python_environment()
    }
    
    print(json.dumps(health_report, indent=2))
    
    # Save to log file
    with open('/fsx/logs/health_check.json', 'w') as f:
        json.dump(health_report, f, indent=2)
    
    # Exit with error if any critical component is unhealthy
    if health_report['system']['status'] == 'error':
        sys.exit(1)
EOF
    
    chmod +x /home/ec2-user/interim_health_check.py
    chown ec2-user:ec2-user /home/ec2-user/interim_health_check.py
}

# Function to create startup services
create_startup_services() {
    echo "🔧 Creating startup services..."
    
    # Health monitoring service
    cat > /etc/systemd/system/romai-interim-health.service << EOF
[Unit]
Description=RomAI Interim Cluster Health Monitoring
After=network.target docker.service

[Service]
Type=simple
User=ec2-user
ExecStart=/home/ec2-user/interim_health_check.py
Restart=always
RestartSec=300

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl enable romai-interim-health.service
    systemctl start romai-interim-health.service
}

# Main execution
echo "🎯 Starting interim preprocessing setup..."

# Update system
echo "🔄 Updating system packages..."
yum update -y

# Install basic dependencies
yum install -y wget curl gcc gcc-c++ make git htop iotop python3-devel

# Optimize CPU performance
optimize_cpu_performance

# Install Docker
install_docker

# Set up FSx Lustre storage
setup_fsx_storage

# Install Python ML stack
install_python_ml_stack

# Create preprocessing tools
create_preprocessing_tools

# Create monitoring tools
create_monitoring_tools

# Create startup services
create_startup_services

# Install additional system monitoring tools
pip3 install psutil

echo "✅ RomAI Interim Preprocessing Setup Completed: $(date)"
echo "💻 Instance Type: $INSTANCE_TYPE"
echo "🔧 Purpose: Dataset preprocessing while awaiting GPU quota"
echo "📊 CPU Cores: $(nproc)"
echo "💾 Memory: $(free -h | awk '/^Mem:/ {print $2}')"
echo "💽 Storage: $(df -h /fsx | tail -1 | awk '{print $2}')"

# Create completion marker
touch /home/ec2-user/interim-setup-complete
echo "$(date): Interim preprocessing setup completed on $INSTANCE_TYPE" >> /home/ec2-user/interim-setup-complete

# Start preprocessing automatically
echo "🚀 Starting dataset preprocessing pipeline..."
su - ec2-user -c "nohup python3 /home/ec2-user/dataset_preprocessor.py > /fsx/logs/preprocessing/auto_start.log 2>&1 &"

echo "🎉 Interim node ready for RomAI dataset preprocessing!"