# Phase 2B: RomAI AWS Infrastructure with Terraform
# Multi-Cloud GPU Cluster for 150B+ Token Processing

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Variables
variable "region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name for tagging"
  type        = string
  default     = "romai-phase2b"
}

variable "instance_count" {
  description = "Number of P4d instances to deploy"
  type        = number
  default     = 6  # 48 A100 GPUs total
}

variable "ssh_key_name" {
  description = "EC2 Key Pair name for SSH access"
  type        = string
}

# Local values
locals {
  deployment_id = "${var.project_name}-${random_id.deployment.hex}"
  common_tags = {
    Project       = "RomAI-Phase2B"
    Environment   = var.environment
    DeploymentId  = local.deployment_id
    Owner         = "RomAI-DevTeam"
    CostCenter    = "AI-Research"
    Purpose       = "GPU-Cluster-150B-Tokens"
    Compliance    = "Enterprise-AI"
    AutoShutdown  = "Disabled"
    Monitoring    = "Enhanced-CloudWatch"
  }
}

# Random deployment ID
resource "random_id" "deployment" {
  byte_length = 4
}

# AWS Provider
provider "aws" {
  region = var.region
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_ami" "ubuntu_hpc" {
  most_recent = true
  owners      = ["099720109477"] # Canonical
  
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
  
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

data "aws_caller_identity" "current" {}

# VPC Infrastructure
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = merge(local.common_tags, {
    Name = "${local.deployment_id}-vpc"
  })
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  
  tags = merge(local.common_tags, {
    Name = "${local.deployment_id}-igw"
  })
}

# Subnets across multiple AZs
resource "aws_subnet" "gpu_subnets" {
  count = 3
  
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  
  tags = merge(local.common_tags, {
    Name = "${local.deployment_id}-gpu-subnet-${data.aws_availability_zones.available.names[count.index]}"
    Type = "GPU-EFA-Optimized"
  })
}

# Route Table
resource "aws_route_table" "main" {
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  
  tags = merge(local.common_tags, {
    Name = "${local.deployment_id}-rt"
  })
}

# Route Table Associations
resource "aws_route_table_association" "gpu_subnets" {
  count = length(aws_subnet.gpu_subnets)
  
  subnet_id      = aws_subnet.gpu_subnets[count.index].id
  route_table_id = aws_route_table.main.id
}

# Security Group for GPU Cluster
resource "aws_security_group" "gpu_cluster" {
  name_prefix = "${local.deployment_id}-gpu-cluster"
  description = "Enhanced security group for RomAI GPU cluster with EFA"
  vpc_id      = aws_vpc.main.id
  
  # SSH access
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH access"
  }
  
  # EFA inter-node communication
  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    self      = true
    description = "EFA inter-node communication"
  }
  
  # RomAI API endpoints
  ingress {
    from_port   = 6101
    to_port     = 6101
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "RomAI ML API"
  }
  
  ingress {
    from_port   = 8001
    to_port     = 8001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "RomAI Enterprise API"
  }
  
  # Kubernetes API
  ingress {
    from_port   = 6443
    to_port     = 6443
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
    description = "Kubernetes API"
  }
  
  # NCCL communication
  ingress {
    from_port = 23000
    to_port   = 23999
    protocol  = "tcp"
    self      = true
    description = "NCCL multi-GPU communication"
  }
  
  # Outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = merge(local.common_tags, {
    Name = "${local.deployment_id}-gpu-cluster-sg"
    Purpose = "GPU-EFA-Cluster"
  })
}

# Cluster Placement Group
resource "aws_placement_group" "gpu_cluster" {
  name     = "${local.deployment_id}-cluster-pg"
  strategy = "cluster"
  
  tags = merge(local.common_tags, {
    Name = "${local.deployment_id}-cluster-pg"
    Purpose = "EFA-GPU-Cluster"
  })
}

# FSx Lustre Filesystem
resource "aws_fsx_lustre_file_system" "romai_storage" {
  storage_capacity    = 2400  # 2.4TB minimum
  storage_type        = "SSD"
  deployment_type     = "SCRATCH_2"  # High performance
  data_compression_type = "LZ4"
  
  subnet_ids = [aws_subnet.gpu_subnets[0].id]
  security_group_ids = [aws_security_group.gpu_cluster.id]
  
  tags = merge(local.common_tags, {
    Name = "${local.deployment_id}-lustre-fs"
    Purpose = "High-Performance-Dataset-Storage"
  })
}

# Secrets Manager for configuration
resource "aws_secretsmanager_secret" "romai_config" {
  name        = "${local.deployment_id}-romai-secrets"
  description = "RomAI GPU cluster configuration secrets"
  
  tags = merge(local.common_tags, {
    Name = "${local.deployment_id}-romai-secrets"
    Purpose = "RomAI-Configuration"
  })
}

resource "aws_secretsmanager_secret_version" "romai_config" {
  secret_id = aws_secretsmanager_secret.romai_config.id
  secret_string = jsonencode({
    huggingface_token         = "hf_[REPLACE_WITH_ACTUAL_TOKEN]"
    nvidia_driver_version     = "535.104.12"
    cuda_version              = "12.2"
    container_toolkit_version = "1.14.0"
    dcgm_version              = "3.3.0"
    nvvs_version              = "4.7.0"
    romai_api_key            = "romai-aws-cluster-key-2025"
  })
}

# IAM Role for EC2 instances
resource "aws_iam_role" "gpu_instance_role" {
  name = "${local.deployment_id}-gpu-instance-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
  
  tags = merge(local.common_tags, {
    Name = "${local.deployment_id}-gpu-instance-role"
    Purpose = "GPU-Instance-Role"
  })
}

# IAM Policy for Secrets Manager access
resource "aws_iam_policy" "secrets_access" {
  name = "${local.deployment_id}-secrets-policy"
  description = "Policy for accessing RomAI secrets"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = aws_secretsmanager_secret.romai_config.arn
      }
    ]
  })
}

# Attach policies to role
resource "aws_iam_role_policy_attachment" "ssm_managed_instance_core" {
  role       = aws_iam_role.gpu_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy_attachment" "cloudwatch_agent_server_policy" {
  role       = aws_iam_role.gpu_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

resource "aws_iam_role_policy_attachment" "s3_readonly_access" {
  role       = aws_iam_role.gpu_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"
}

resource "aws_iam_role_policy_attachment" "secrets_access" {
  role       = aws_iam_role.gpu_instance_role.name
  policy_arn = aws_iam_policy.secrets_access.arn
}

# Instance Profile
resource "aws_iam_instance_profile" "gpu_instance_profile" {
  name = "${local.deployment_id}-gpu-instance-profile"
  role = aws_iam_role.gpu_instance_role.name
  
  tags = local.common_tags
}

# Launch Template
resource "aws_launch_template" "gpu_cluster" {
  name_prefix   = "${local.deployment_id}-gpu-cluster-"
  image_id      = data.aws_ami.ubuntu_hpc.id
  instance_type = "p4d.24xlarge"  # 8x A100 GPUs, 96 vCPUs, 1152 GB RAM
  key_name      = var.ssh_key_name
  
  vpc_security_group_ids = [aws_security_group.gpu_cluster.id]
  
  iam_instance_profile {
    name = aws_iam_instance_profile.gpu_instance_profile.name
  }
  
  block_device_mappings {
    device_name = "/dev/sda1"
    ebs {
      volume_size = 500  # 500GB root volume
      volume_type = "gp3"
      iops        = 16000  # High IOPS for fast boot
      throughput  = 1000   # 1 GB/s throughput
      encrypted   = true
      delete_on_termination = true
    }
  }
  
  placement {
    group_name = aws_placement_group.gpu_cluster.name
    tenancy    = "default"
  }
  
  monitoring {
    enabled = true
  }
  
  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    FSX_FILESYSTEM_ID = aws_fsx_lustre_file_system.romai_storage.id
    REGION           = var.region
    SECRETS_NAME     = aws_secretsmanager_secret.romai_config.name
  }))
  
  tag_specifications {
    resource_type = "instance"
    tags = merge(local.common_tags, {
      Name = "${local.deployment_id}-gpu-cluster-node"
      Purpose = "RomAI-GPU-Cluster"
      InstanceType = "p4d.24xlarge"
    })
  }
  
  tags = merge(local.common_tags, {
    Name = "${local.deployment_id}-gpu-cluster-lt"
  })
}

# EC2 Instances
resource "aws_instance" "gpu_cluster" {
  count = var.instance_count
  
  launch_template {
    id      = aws_launch_template.gpu_cluster.id
    version = "$Latest"
  }
  
  subnet_id = aws_subnet.gpu_subnets[count.index % length(aws_subnet.gpu_subnets)].id
  
  tags = merge(local.common_tags, {
    Name = "${local.deployment_id}-gpu-node-${format("%02d", count.index + 1)}"
    ClusterRole = count.index < 4 ? "primary" : "secondary"
    NodeIndex = count.index + 1
  })
  
  lifecycle {
    create_before_destroy = true
  }
}

# Outputs
output "deployment_summary" {
  description = "Deployment summary information"
  value = {
    deployment_id       = local.deployment_id
    region             = var.region
    instances_deployed = var.instance_count
    total_gpus         = var.instance_count * 8
    total_gpu_memory_gb = var.instance_count * 8 * 80
    filesystem_capacity_tb = 2.4
    vpc_id             = aws_vpc.main.id
    security_group_id  = aws_security_group.gpu_cluster.id
    fsx_filesystem_id  = aws_fsx_lustre_file_system.romai_storage.id
    secrets_name       = aws_secretsmanager_secret.romai_config.name
  }
}

output "cluster_nodes" {
  description = "GPU cluster node information"
  value = {
    for idx, instance in aws_instance.gpu_cluster : 
    "node-${format("%02d", idx + 1)}" => {
      instance_id = instance.id
      public_ip   = instance.public_ip
      private_ip  = instance.private_ip
      az          = instance.availability_zone
    }
  }
}

output "connection_commands" {
  description = "SSH connection commands for cluster nodes"
  value = {
    for idx, instance in aws_instance.gpu_cluster : 
    "node-${format("%02d", idx + 1)}" => "ssh -i ~/.ssh/your-key.pem ubuntu@${instance.public_ip}"
  }
}

output "fsx_mount_command" {
  description = "Command to mount FSx Lustre filesystem"
  value = "sudo mount -t lustre ${aws_fsx_lustre_file_system.romai_storage.id}.fsx.${var.region}.amazonaws.com@tcp:/fsx /mnt/fsx"
}

output "cost_estimation" {
  description = "Monthly cost estimation"
  value = {
    compute_cost_usd   = var.instance_count * 32.77 * 24 * 30  # P4d.24xlarge on-demand pricing
    storage_cost_usd   = 500   # FSx Lustre estimate
    total_monthly_usd  = var.instance_count * 32.77 * 24 * 30 + 500
    daily_cost_usd     = (var.instance_count * 32.77 * 24 * 30 + 500) / 30
  }
}