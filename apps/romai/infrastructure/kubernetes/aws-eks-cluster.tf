# ☁️ Amazon Web Services (EKS) Deployment Configuration
# Production-ready EKS cluster for ROMAI services
# Generated for Phase 4 Week 4 Day 25 - Cloud Deployment & Scaling

# =============================================================================
# 🏗️ EKS Cluster Configuration (Terraform)
# =============================================================================
terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }
  
  backend "s3" {
    bucket = "romai-terraform-state"
    key    = "eks/production.tfstate"
    region = "eu-west-1"
  }
}

# Provider configuration
provider "aws" {
  region = var.region
  
  default_tags {
    tags = {
      Environment = var.environment
      Project     = "ROMAI"
      ManagedBy   = "Terraform"
    }
  }
}

# Variables
variable "region" {
  description = "AWS Region"
  type        = string
  default     = "eu-west-1"
}

variable "cluster_name" {
  description = "EKS Cluster Name"
  type        = string
  default     = "romai-production-eks"
}

variable "environment" {
  description = "Environment"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

# =============================================================================
# 📊 Data Sources
# =============================================================================
data "aws_availability_zones" "available" {
  filter {
    name   = "opt-in-status"
    values = ["opt-in-not-required"]
  }
}

data "aws_caller_identity" "current" {}

# =============================================================================
# 🌐 VPC Configuration
# =============================================================================
resource "aws_vpc" "romai_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name                                        = "romai-production-vpc"
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    Environment                                 = var.environment
  }
}

# Internet Gateway
resource "aws_internet_gateway" "romai_igw" {
  vpc_id = aws_vpc.romai_vpc.id
  
  tags = {
    Name = "romai-production-igw"
  }
}

# Public Subnets
resource "aws_subnet" "romai_public_subnet" {
  count = 3
  
  vpc_id                  = aws_vpc.romai_vpc.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  
  tags = {
    Name                                        = "romai-public-subnet-${count.index + 1}"
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/elb"                    = "1"
    Type                                        = "Public"
  }
}

# Private Subnets
resource "aws_subnet" "romai_private_subnet" {
  count = 3
  
  vpc_id            = aws_vpc.romai_vpc.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  tags = {
    Name                                        = "romai-private-subnet-${count.index + 1}"
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/internal-elb"           = "1"
    Type                                        = "Private"
  }
}

# Elastic IPs for NAT Gateways
resource "aws_eip" "romai_nat_eip" {
  count = 3
  
  domain = "vpc"
  
  tags = {
    Name = "romai-nat-eip-${count.index + 1}"
  }
  
  depends_on = [aws_internet_gateway.romai_igw]
}

# NAT Gateways
resource "aws_nat_gateway" "romai_nat_gw" {
  count = 3
  
  allocation_id = aws_eip.romai_nat_eip[count.index].id
  subnet_id     = aws_subnet.romai_public_subnet[count.index].id
  
  tags = {
    Name = "romai-nat-gw-${count.index + 1}"
  }
  
  depends_on = [aws_internet_gateway.romai_igw]
}

# Route Tables
resource "aws_route_table" "romai_public_rt" {
  vpc_id = aws_vpc.romai_vpc.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.romai_igw.id
  }
  
  tags = {
    Name = "romai-public-rt"
  }
}

resource "aws_route_table" "romai_private_rt" {
  count = 3
  
  vpc_id = aws_vpc.romai_vpc.id
  
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.romai_nat_gw[count.index].id
  }
  
  tags = {
    Name = "romai-private-rt-${count.index + 1}"
  }
}

# Route Table Associations
resource "aws_route_table_association" "romai_public_rta" {
  count = 3
  
  subnet_id      = aws_subnet.romai_public_subnet[count.index].id
  route_table_id = aws_route_table.romai_public_rt.id
}

resource "aws_route_table_association" "romai_private_rta" {
  count = 3
  
  subnet_id      = aws_subnet.romai_private_subnet[count.index].id
  route_table_id = aws_route_table.romai_private_rt[count.index].id
}

# =============================================================================
# 🔐 IAM Roles and Policies
# =============================================================================

# EKS Cluster Service Role
resource "aws_iam_role" "romai_cluster_role" {
  name = "romai-eks-cluster-role"
  
  assume_role_policy = jsonencode({
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "eks.amazonaws.com"
      }
    }]
    Version = "2012-10-17"
  })
}

resource "aws_iam_role_policy_attachment" "romai_cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.romai_cluster_role.name
}

# EKS Node Group Role
resource "aws_iam_role" "romai_node_group_role" {
  name = "romai-eks-node-group-role"
  
  assume_role_policy = jsonencode({
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
    Version = "2012-10-17"
  })
}

resource "aws_iam_role_policy_attachment" "romai_node_group_policies" {
  for_each = toset([
    "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
    "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
    "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
    "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
  ])
  
  policy_arn = each.value
  role       = aws_iam_role.romai_node_group_role.name
}

# =============================================================================
# 🔒 Security Groups
# =============================================================================
resource "aws_security_group" "romai_cluster_sg" {
  name_prefix = "romai-cluster-sg"
  vpc_id      = aws_vpc.romai_vpc.id
  
  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # Allow HTTPS from anywhere (for API server access)
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "romai-cluster-sg"
  }
}

resource "aws_security_group" "romai_node_sg" {
  name_prefix = "romai-node-sg"
  vpc_id      = aws_vpc.romai_vpc.id
  
  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # Allow communication between nodes
  ingress {
    from_port = 0
    to_port   = 65535
    protocol  = "tcp"
    self      = true
  }
  
  # Allow communication from cluster security group
  ingress {
    from_port                = 0
    to_port                  = 65535
    protocol                 = "tcp"
    source_security_group_id = aws_security_group.romai_cluster_sg.id
  }
  
  tags = {
    Name = "romai-node-sg"
  }
}

# =============================================================================
# 🏗️ EKS Cluster
# =============================================================================
resource "aws_eks_cluster" "romai_cluster" {
  name     = var.cluster_name
  role_arn = aws_iam_role.romai_cluster_role.arn
  version  = "1.28"
  
  vpc_config {
    subnet_ids              = concat(aws_subnet.romai_private_subnet[*].id, aws_subnet.romai_public_subnet[*].id)
    endpoint_private_access = true
    endpoint_public_access  = true
    public_access_cidrs     = ["0.0.0.0/0"]
    security_group_ids      = [aws_security_group.romai_cluster_sg.id]
  }
  
  # Logging
  enabled_cluster_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]
  
  # Encryption
  encryption_config {
    provider {
      key_arn = aws_kms_key.romai_eks_key.arn
    }
    resources = ["secrets"]
  }
  
  tags = {
    Name = var.cluster_name
  }
  
  depends_on = [
    aws_iam_role_policy_attachment.romai_cluster_policy,
    aws_cloudwatch_log_group.romai_cluster_logs
  ]
}

# =============================================================================
# 🔑 KMS Key for EKS Encryption
# =============================================================================
resource "aws_kms_key" "romai_eks_key" {
  description             = "EKS Secret Encryption Key for ROMAI"
  deletion_window_in_days = 7
  
  tags = {
    Name = "romai-eks-encryption-key"
  }
}

resource "aws_kms_alias" "romai_eks_key_alias" {
  name          = "alias/romai-eks-encryption-key"
  target_key_id = aws_kms_key.romai_eks_key.key_id
}

# =============================================================================
# 📊 CloudWatch Log Group
# =============================================================================
resource "aws_cloudwatch_log_group" "romai_cluster_logs" {
  name              = "/aws/eks/${var.cluster_name}/cluster"
  retention_in_days = 30
  
  tags = {
    Name = "romai-cluster-logs"
  }
}

# =============================================================================
# 👥 EKS Node Groups
# =============================================================================

# Primary Node Group
resource "aws_eks_node_group" "romai_primary_nodes" {
  cluster_name    = aws_eks_cluster.romai_cluster.name
  node_group_name = "romai-primary-nodes"
  node_role_arn   = aws_iam_role.romai_node_group_role.arn
  subnet_ids      = aws_subnet.romai_private_subnet[*].id
  
  # Instance configuration
  capacity_type  = "ON_DEMAND"
  instance_types = ["t3.large"]
  ami_type       = "AL2_x86_64"
  disk_size      = 100
  
  # Scaling configuration
  scaling_config {
    desired_size = 3
    max_size     = 15
    min_size     = 3
  }
  
  # Update configuration
  update_config {
    max_unavailable_percentage = 25
  }
  
  # Launch template
  launch_template {
    name    = aws_launch_template.romai_node_template.name
    version = aws_launch_template.romai_node_template.latest_version
  }
  
  # Node labels
  labels = {
    Environment = var.environment
    NodeGroup   = "primary"
    Workload    = "general"
  }
  
  # Node taints
  taint {
    key    = "workload-type"
    value  = "general"
    effect = "NO_SCHEDULE"
  }
  
  tags = {
    Name = "romai-primary-nodes"
  }
  
  depends_on = [
    aws_iam_role_policy_attachment.romai_node_group_policies
  ]
}

# Memory-Intensive Node Group (for Elasticsearch)
resource "aws_eks_node_group" "romai_memory_nodes" {
  cluster_name    = aws_eks_cluster.romai_cluster.name
  node_group_name = "romai-memory-nodes"
  node_role_arn   = aws_iam_role.romai_node_group_role.arn
  subnet_ids      = aws_subnet.romai_private_subnet[*].id
  
  # Instance configuration
  capacity_type  = "ON_DEMAND"
  instance_types = ["r5.xlarge"]
  ami_type       = "AL2_x86_64"
  disk_size      = 200
  
  # Scaling configuration
  scaling_config {
    desired_size = 1
    max_size     = 5
    min_size     = 1
  }
  
  # Update configuration
  update_config {
    max_unavailable_percentage = 25
  }
  
  # Launch template
  launch_template {
    name    = aws_launch_template.romai_memory_template.name
    version = aws_launch_template.romai_memory_template.latest_version
  }
  
  # Node labels
  labels = {
    Environment = var.environment
    NodeGroup   = "memory"
    Workload    = "elasticsearch"
  }
  
  # Node taints
  taint {
    key    = "workload-type"
    value  = "memory-intensive"
    effect = "NO_SCHEDULE"
  }
  
  tags = {
    Name = "romai-memory-nodes"
  }
  
  depends_on = [
    aws_iam_role_policy_attachment.romai_node_group_policies
  ]
}

# =============================================================================
# 🚀 Launch Templates
# =============================================================================
resource "aws_launch_template" "romai_node_template" {
  name_prefix   = "romai-node-template"
  image_id      = data.aws_ssm_parameter.eks_ami.value
  instance_type = "t3.large"
  
  vpc_security_group_ids = [aws_security_group.romai_node_sg.id]
  
  user_data = base64encode(templatefile("${path.module}/userdata.tpl", {
    cluster_name        = var.cluster_name
    cluster_endpoint    = aws_eks_cluster.romai_cluster.endpoint
    cluster_ca          = aws_eks_cluster.romai_cluster.certificate_authority[0].data
    bootstrap_arguments = ""
  }))
  
  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "romai-primary-node"
    }
  }
  
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_launch_template" "romai_memory_template" {
  name_prefix   = "romai-memory-template"
  image_id      = data.aws_ssm_parameter.eks_ami.value
  instance_type = "r5.xlarge"
  
  vpc_security_group_ids = [aws_security_group.romai_node_sg.id]
  
  user_data = base64encode(templatefile("${path.module}/userdata.tpl", {
    cluster_name        = var.cluster_name
    cluster_endpoint    = aws_eks_cluster.romai_cluster.endpoint
    cluster_ca          = aws_eks_cluster.romai_cluster.certificate_authority[0].data
    bootstrap_arguments = ""
  }))
  
  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "romai-memory-node"
    }
  }
  
  lifecycle {
    create_before_destroy = true
  }
}

# =============================================================================
# 📊 Data Source for EKS AMI
# =============================================================================
data "aws_ssm_parameter" "eks_ami" {
  name = "/aws/service/eks/optimized-ami/1.28/amazon-linux-2/recommended/image_id"
}

# =============================================================================
# 🔐 ECR Repository
# =============================================================================
resource "aws_ecr_repository" "romai_api" {
  name                 = "romai/api"
  image_tag_mutability = "MUTABLE"
  
  image_scanning_configuration {
    scan_on_push = true
  }
  
  lifecycle_policy {
    policy = jsonencode({
      rules = [
        {
          rulePriority = 1
          description  = "Keep last 10 images"
          selection = {
            tagStatus     = "tagged"
            tagPrefixList = ["v"]
            countType     = "imageCountMoreThan"
            countNumber   = 10
          }
          action = {
            type = "expire"
          }
        }
      ]
    })
  }
}

resource "aws_ecr_repository" "romai_dashboard" {
  name                 = "romai/dashboard"
  image_tag_mutability = "MUTABLE"
  
  image_scanning_configuration {
    scan_on_push = true
  }
  
  lifecycle_policy {
    policy = jsonencode({
      rules = [
        {
          rulePriority = 1
          description  = "Keep last 10 images"
          selection = {
            tagStatus     = "tagged"
            tagPrefixList = ["v"]
            countType     = "imageCountMoreThan"
            countNumber   = 10
          }
          action = {
            type = "expire"
          }
        }
      ]
    })
  }
}

resource "aws_ecr_repository" "romai_mcp" {
  name                 = "romai/mcp"
  image_tag_mutability = "MUTABLE"
  
  image_scanning_configuration {
    scan_on_push = true
  }
  
  lifecycle_policy {
    policy = jsonencode({
      rules = [
        {
          rulePriority = 1
          description  = "Keep last 10 images"
          selection = {
            tagStatus     = "tagged"
            tagPrefixList = ["v"]
            countType     = "imageCountMoreThan"
            countNumber   = 10
          }
          action = {
            type = "expire"
          }
        }
      ]
    })
  }
}

# =============================================================================
# 📊 Outputs
# =============================================================================
output "cluster_name" {
  description = "EKS cluster name"
  value       = aws_eks_cluster.romai_cluster.name
}

output "cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = aws_eks_cluster.romai_cluster.endpoint
  sensitive   = true
}

output "cluster_ca_certificate" {
  description = "EKS cluster CA certificate"
  value       = aws_eks_cluster.romai_cluster.certificate_authority[0].data
  sensitive   = true
}

output "cluster_security_group_id" {
  description = "Security group ID attached to the EKS cluster"
  value       = aws_eks_cluster.romai_cluster.vpc_config[0].cluster_security_group_id
}

output "node_security_group_id" {
  description = "Security group ID attached to the EKS nodes"
  value       = aws_security_group.romai_node_sg.id
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.romai_vpc.id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.romai_private_subnet[*].id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.romai_public_subnet[*].id
}

output "ecr_repositories" {
  description = "ECR repository URLs"
  value = {
    api       = aws_ecr_repository.romai_api.repository_url
    dashboard = aws_ecr_repository.romai_dashboard.repository_url
    mcp       = aws_ecr_repository.romai_mcp.repository_url
  }
}

# =============================================================================
# ⚙️ Local Values for Configuration
# =============================================================================
locals {
  cluster_config = {
    cluster_name              = aws_eks_cluster.romai_cluster.name
    cluster_endpoint         = aws_eks_cluster.romai_cluster.endpoint
    cluster_ca_certificate   = aws_eks_cluster.romai_cluster.certificate_authority[0].data
    region                   = var.region
    vpc_id                   = aws_vpc.romai_vpc.id
  }
}
