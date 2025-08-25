# 🌐 RomAI Production Infrastructure Configuration
# Terraform configuration for multi-region AWS infrastructure

terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.20"
    }
  }
  
  backend "s3" {
    bucket = "romai-terraform-state"
    key    = "production/infrastructure.tfstate"
    region = "us-east-1"
    encrypt = true
    dynamodb_table = "romai-terraform-locks"
  }
}

# Variables
variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "regions" {
  description = "AWS regions for multi-region deployment"
  type        = list(string)
  default     = ["us-east-1", "us-west-2", "eu-central-1", "ap-southeast-1"]
}

variable "kubernetes_version" {
  description = "Kubernetes version for EKS clusters"
  type        = string
  default     = "1.28"
}

variable "node_instance_types" {
  description = "EC2 instance types for worker nodes"
  type        = list(string)
  default     = ["c5.2xlarge", "c5.4xlarge", "p3.2xlarge"]
}

variable "min_nodes" {
  description = "Minimum number of worker nodes"
  type        = number
  default     = 6
}

variable "max_nodes" {
  description = "Maximum number of worker nodes"
  type        = number
  default     = 500
}

# Data sources
data "aws_availability_zones" "available" {
  count = length(var.regions)
  provider = aws.region[count.index]
  state = "available"
}

data "aws_caller_identity" "current" {}

# Main AWS provider
provider "aws" {
  region = var.regions[0]
  alias  = "primary"
}

# Regional providers for multi-region setup
provider "aws" {
  count  = length(var.regions)
  region = var.regions[count.index]
  alias  = "region${count.index}"
}

# VPC Configuration for each region
resource "aws_vpc" "romai_vpc" {
  count = length(var.regions)
  provider = aws.region[count.index]
  
  cidr_block           = "10.${count.index}.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name        = "romai-vpc-${var.regions[count.index]}"
    Environment = var.environment
    Project     = "RomAI"
    Region      = var.regions[count.index]
  }
}

# Internet Gateway
resource "aws_internet_gateway" "romai_igw" {
  count = length(var.regions)
  provider = aws.region[count.index]
  
  vpc_id = aws_vpc.romai_vpc[count.index].id
  
  tags = {
    Name        = "romai-igw-${var.regions[count.index]}"
    Environment = var.environment
  }
}

# Public Subnets
resource "aws_subnet" "public" {
  count = length(var.regions) * 3  # 3 AZs per region
  provider = aws.region[count.index % length(var.regions)]
  
  vpc_id                  = aws_vpc.romai_vpc[count.index % length(var.regions)].id
  cidr_block              = "10.${count.index % length(var.regions)}.${floor(count.index / length(var.regions)) + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available[count.index % length(var.regions)].names[floor(count.index / length(var.regions))]
  map_public_ip_on_launch = true
  
  tags = {
    Name        = "romai-public-${var.regions[count.index % length(var.regions)]}-${floor(count.index / length(var.regions)) + 1}"
    Environment = var.environment
    Type        = "public"
    "kubernetes.io/role/elb" = "1"
  }
}

# Private Subnets
resource "aws_subnet" "private" {
  count = length(var.regions) * 3  # 3 AZs per region
  provider = aws.region[count.index % length(var.regions)]
  
  vpc_id            = aws_vpc.romai_vpc[count.index % length(var.regions)].id
  cidr_block        = "10.${count.index % length(var.regions)}.${floor(count.index / length(var.regions)) + 10}.0/24"
  availability_zone = data.aws_availability_zones.available[count.index % length(var.regions)].names[floor(count.index / length(var.regions))]
  
  tags = {
    Name        = "romai-private-${var.regions[count.index % length(var.regions)]}-${floor(count.index / length(var.regions)) + 1}"
    Environment = var.environment
    Type        = "private"
    "kubernetes.io/role/internal-elb" = "1"
  }
}

# NAT Gateway
resource "aws_eip" "nat" {
  count = length(var.regions) * 3
  provider = aws.region[count.index % length(var.regions)]
  
  domain = "vpc"
  depends_on = [aws_internet_gateway.romai_igw]
  
  tags = {
    Name = "romai-nat-eip-${var.regions[count.index % length(var.regions)]}-${floor(count.index / length(var.regions)) + 1}"
  }
}

resource "aws_nat_gateway" "romai_nat" {
  count = length(var.regions) * 3
  provider = aws.region[count.index % length(var.regions)]
  
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id
  
  tags = {
    Name = "romai-nat-${var.regions[count.index % length(var.regions)]}-${floor(count.index / length(var.regions)) + 1}"
  }
  
  depends_on = [aws_internet_gateway.romai_igw]
}

# Route Tables
resource "aws_route_table" "public" {
  count = length(var.regions)
  provider = aws.region[count.index]
  
  vpc_id = aws_vpc.romai_vpc[count.index].id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.romai_igw[count.index].id
  }
  
  tags = {
    Name = "romai-public-rt-${var.regions[count.index]}"
  }
}

resource "aws_route_table" "private" {
  count = length(var.regions) * 3
  provider = aws.region[count.index % length(var.regions)]
  
  vpc_id = aws_vpc.romai_vpc[count.index % length(var.regions)].id
  
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.romai_nat[count.index].id
  }
  
  tags = {
    Name = "romai-private-rt-${var.regions[count.index % length(var.regions)]}-${floor(count.index / length(var.regions)) + 1}"
  }
}

# Route Table Associations
resource "aws_route_table_association" "public" {
  count = length(var.regions) * 3
  provider = aws.region[count.index % length(var.regions)]
  
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public[count.index % length(var.regions)].id
}

resource "aws_route_table_association" "private" {
  count = length(var.regions) * 3
  provider = aws.region[count.index % length(var.regions)]
  
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

# Security Groups
resource "aws_security_group" "romai_cluster" {
  count = length(var.regions)
  provider = aws.region[count.index]
  
  name_prefix = "romai-cluster-${var.regions[count.index]}-"
  vpc_id      = aws_vpc.romai_vpc[count.index].id
  description = "Security group for RomAI EKS cluster"
  
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    description = "RomAI ML API"
    from_port   = 6101
    to_port     = 6101
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.romai_vpc[count.index].cidr_block]
  }
  
  ingress {
    description = "MemorAI MCP"
    from_port   = 4950
    to_port     = 4950
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.romai_vpc[count.index].cidr_block]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "romai-cluster-sg-${var.regions[count.index]}"
  }
}

# IAM Role for EKS Cluster
resource "aws_iam_role" "romai_cluster" {
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

resource "aws_iam_role_policy_attachment" "romai_cluster_AmazonEKSClusterPolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.romai_cluster.name
}

# IAM Role for EKS Node Group
resource "aws_iam_role" "romai_node" {
  name = "romai-eks-node-role"
  
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

resource "aws_iam_role_policy_attachment" "romai_node_AmazonEKSWorkerNodePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.romai_node.name
}

resource "aws_iam_role_policy_attachment" "romai_node_AmazonEKS_CNI_Policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.romai_node.name
}

resource "aws_iam_role_policy_attachment" "romai_node_AmazonEC2ContainerRegistryReadOnly" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.romai_node.name
}

# EKS Cluster
resource "aws_eks_cluster" "romai" {
  count = length(var.regions)
  provider = aws.region[count.index]
  
  name     = "romai-cluster-${var.regions[count.index]}"
  role_arn = aws_iam_role.romai_cluster.arn
  version  = var.kubernetes_version
  
  vpc_config {
    subnet_ids              = concat(
      [for i in range(3) : aws_subnet.public[count.index * 3 + i].id],
      [for i in range(3) : aws_subnet.private[count.index * 3 + i].id]
    )
    endpoint_private_access = true
    endpoint_public_access  = true
    public_access_cidrs    = ["0.0.0.0/0"]
    security_group_ids     = [aws_security_group.romai_cluster[count.index].id]
  }
  
  enabled_cluster_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]
  
  encryption_config {
    provider {
      key_arn = aws_kms_key.romai[count.index].arn
    }
    resources = ["secrets"]
  }
  
  depends_on = [
    aws_iam_role_policy_attachment.romai_cluster_AmazonEKSClusterPolicy,
  ]
  
  tags = {
    Name        = "romai-cluster-${var.regions[count.index]}"
    Environment = var.environment
    Region      = var.regions[count.index]
  }
}

# EKS Node Group
resource "aws_eks_node_group" "romai_nodes" {
  count = length(var.regions)
  provider = aws.region[count.index]
  
  cluster_name    = aws_eks_cluster.romai[count.index].name
  node_group_name = "romai-nodes-${var.regions[count.index]}"
  node_role_arn   = aws_iam_role.romai_node.arn
  subnet_ids      = [for i in range(3) : aws_subnet.private[count.index * 3 + i].id]
  
  capacity_type  = "ON_DEMAND"
  instance_types = var.node_instance_types
  
  scaling_config {
    desired_size = var.min_nodes
    max_size     = var.max_nodes
    min_size     = var.min_nodes
  }
  
  update_config {
    max_unavailable = 1
  }
  
  remote_access {
    ec2_ssh_key = aws_key_pair.romai[count.index].key_name
    source_security_group_ids = [aws_security_group.romai_cluster[count.index].id]
  }
  
  labels = {
    Environment = var.environment
    Region      = var.regions[count.index]
  }
  
  depends_on = [
    aws_iam_role_policy_attachment.romai_node_AmazonEKSWorkerNodePolicy,
    aws_iam_role_policy_attachment.romai_node_AmazonEKS_CNI_Policy,
    aws_iam_role_policy_attachment.romai_node_AmazonEC2ContainerRegistryReadOnly,
  ]
  
  tags = {
    Name = "romai-node-group-${var.regions[count.index]}"
  }
}

# GPU Node Group for ML workloads
resource "aws_eks_node_group" "romai_gpu_nodes" {
  count = length(var.regions)
  provider = aws.region[count.index]
  
  cluster_name    = aws_eks_cluster.romai[count.index].name
  node_group_name = "romai-gpu-nodes-${var.regions[count.index]}"
  node_role_arn   = aws_iam_role.romai_node.arn
  subnet_ids      = [for i in range(3) : aws_subnet.private[count.index * 3 + i].id]
  
  capacity_type  = "ON_DEMAND"
  instance_types = ["p3.2xlarge", "p3.8xlarge"]
  
  scaling_config {
    desired_size = 2
    max_size     = 50
    min_size     = 0
  }
  
  taint {
    key    = "nvidia.com/gpu"
    value  = "true"
    effect = "NO_SCHEDULE"
  }
  
  labels = {
    Environment = var.environment
    Region      = var.regions[count.index]
    NodeType    = "gpu-enabled"
  }
  
  depends_on = [
    aws_iam_role_policy_attachment.romai_node_AmazonEKSWorkerNodePolicy,
    aws_iam_role_policy_attachment.romai_node_AmazonEKS_CNI_Policy,
    aws_iam_role_policy_attachment.romai_node_AmazonEC2ContainerRegistryReadOnly,
  ]
  
  tags = {
    Name = "romai-gpu-node-group-${var.regions[count.index]}"
  }
}

# KMS Key for encryption
resource "aws_kms_key" "romai" {
  count = length(var.regions)
  provider = aws.region[count.index]
  
  description = "RomAI EKS encryption key for ${var.regions[count.index]}"
  
  tags = {
    Name = "romai-eks-key-${var.regions[count.index]}"
  }
}

resource "aws_kms_alias" "romai" {
  count = length(var.regions)
  provider = aws.region[count.index]
  
  name          = "alias/romai-eks-${var.regions[count.index]}"
  target_key_id = aws_kms_key.romai[count.index].key_id
}

# EC2 Key Pair
resource "aws_key_pair" "romai" {
  count = length(var.regions)
  provider = aws.region[count.index]
  
  key_name   = "romai-key-${var.regions[count.index]}"
  public_key = file("~/.ssh/romai_production.pub")  # You'll need to generate this
  
  tags = {
    Name = "romai-key-${var.regions[count.index]}"
  }
}

# RDS PostgreSQL Cluster
resource "aws_rds_cluster" "romai_postgres" {
  count = length(var.regions)
  provider = aws.region[count.index]
  
  cluster_identifier      = "romai-postgres-${var.regions[count.index]}"
  engine                  = "aurora-postgresql"
  engine_version          = "15.4"
  database_name           = "romai_production"
  master_username         = "romai_admin"
  manage_master_user_password = true
  
  backup_retention_period = 30
  preferred_backup_window = "07:00-09:00"
  
  vpc_security_group_ids = [aws_security_group.romai_cluster[count.index].id]
  db_subnet_group_name   = aws_db_subnet_group.romai[count.index].name
  
  storage_encrypted = true
  kms_key_id       = aws_kms_key.romai[count.index].arn
  
  enabled_cloudwatch_logs_exports = ["postgresql"]
  
  tags = {
    Name        = "romai-postgres-${var.regions[count.index]}"
    Environment = var.environment
  }
}

resource "aws_rds_cluster_instance" "romai_postgres_instances" {
  count = length(var.regions) * 2  # 2 instances per region for HA
  provider = aws.region[count.index % length(var.regions)]
  
  identifier         = "romai-postgres-${var.regions[count.index % length(var.regions)]}-${floor(count.index / length(var.regions)) + 1}"
  cluster_identifier = aws_rds_cluster.romai_postgres[count.index % length(var.regions)].id
  instance_class     = "db.r6g.2xlarge"
  engine            = aws_rds_cluster.romai_postgres[count.index % length(var.regions)].engine
  engine_version    = aws_rds_cluster.romai_postgres[count.index % length(var.regions)].engine_version
  
  performance_insights_enabled = true
  monitoring_interval         = 60
  
  tags = {
    Name = "romai-postgres-instance-${var.regions[count.index % length(var.regions)]}-${floor(count.index / length(var.regions)) + 1}"
  }
}

resource "aws_db_subnet_group" "romai" {
  count = length(var.regions)
  provider = aws.region[count.index]
  
  name       = "romai-db-subnet-group-${var.regions[count.index]}"
  subnet_ids = [for i in range(3) : aws_subnet.private[count.index * 3 + i].id]
  
  tags = {
    Name = "romai-db-subnet-group-${var.regions[count.index]}"
  }
}

# ElastiCache Redis Cluster
resource "aws_elasticache_subnet_group" "romai" {
  count = length(var.regions)
  provider = aws.region[count.index]
  
  name       = "romai-cache-subnet-${var.regions[count.index]}"
  subnet_ids = [for i in range(3) : aws_subnet.private[count.index * 3 + i].id]
}

resource "aws_elasticache_replication_group" "romai_redis" {
  count = length(var.regions)
  provider = aws.region[count.index]
  
  replication_group_id       = "romai-redis-${var.regions[count.index]}"
  description                = "RomAI Redis cluster for ${var.regions[count.index]}"
  
  node_type                  = "cache.r6g.2xlarge"
  port                       = 6379
  parameter_group_name       = "default.redis7"
  
  num_cache_clusters         = 3
  automatic_failover_enabled = true
  multi_az_enabled          = true
  
  subnet_group_name = aws_elasticache_subnet_group.romai[count.index].name
  security_group_ids = [aws_security_group.romai_cluster[count.index].id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  
  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.romai_redis[count.index].name
    destination_type = "cloudwatch-logs"
    log_format       = "text"
    log_type         = "slow-log"
  }
  
  tags = {
    Name        = "romai-redis-${var.regions[count.index]}"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "romai_redis" {
  count = length(var.regions)
  provider = aws.region[count.index]
  
  name              = "/aws/elasticache/romai-redis-${var.regions[count.index]}"
  retention_in_days = 30
  
  tags = {
    Name = "romai-redis-logs-${var.regions[count.index]}"
  }
}

# Application Load Balancer
resource "aws_lb" "romai_alb" {
  count = length(var.regions)
  provider = aws.region[count.index]
  
  name               = "romai-alb-${var.regions[count.index]}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.romai_cluster[count.index].id]
  subnets            = [for i in range(3) : aws_subnet.public[count.index * 3 + i].id]
  
  enable_deletion_protection       = true
  enable_cross_zone_load_balancing = true
  enable_http2                     = true
  enable_waf_fail_open            = true
  
  access_logs {
    bucket  = aws_s3_bucket.romai_logs[count.index].id
    prefix  = "alb-logs"
    enabled = true
  }
  
  tags = {
    Name        = "romai-alb-${var.regions[count.index]}"
    Environment = var.environment
  }
}

# S3 Bucket for logs
resource "aws_s3_bucket" "romai_logs" {
  count = length(var.regions)
  provider = aws.region[count.index]
  
  bucket        = "romai-logs-${var.regions[count.index]}-${random_id.bucket_suffix.hex}"
  force_destroy = false
  
  tags = {
    Name        = "romai-logs-${var.regions[count.index]}"
    Environment = var.environment
  }
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket_versioning" "romai_logs" {
  count = length(var.regions)
  provider = aws.region[count.index]
  
  bucket = aws_s3_bucket.romai_logs[count.index].id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_encryption" "romai_logs" {
  count = length(var.regions)
  provider = aws.region[count.index]
  
  bucket = aws_s3_bucket.romai_logs[count.index].id
  
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        kms_master_key_id = aws_kms_key.romai[count.index].arn
        sse_algorithm     = "aws:kms"
      }
    }
  }
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "romai_cluster" {
  count = length(var.regions)
  provider = aws.region[count.index]
  
  name              = "/aws/eks/romai-cluster-${var.regions[count.index]}/cluster"
  retention_in_days = 90
  
  tags = {
    Name = "romai-cluster-logs-${var.regions[count.index]}"
  }
}

# Outputs
output "cluster_endpoints" {
  description = "EKS cluster endpoints"
  value = {
    for i, region in var.regions :
    region => aws_eks_cluster.romai[i].endpoint
  }
}

output "cluster_security_group_ids" {
  description = "Security group IDs attached to the EKS cluster"
  value = {
    for i, region in var.regions :
    region => aws_eks_cluster.romai[i].vpc_config[0].cluster_security_group_id
  }
}

output "cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data required to communicate with the cluster"
  value = {
    for i, region in var.regions :
    region => aws_eks_cluster.romai[i].certificate_authority[0].data
  }
}

output "postgres_endpoints" {
  description = "RDS PostgreSQL cluster endpoints"
  value = {
    for i, region in var.regions :
    region => aws_rds_cluster.romai_postgres[i].endpoint
  }
}

output "redis_endpoints" {
  description = "ElastiCache Redis cluster endpoints"
  value = {
    for i, region in var.regions :
    region => aws_elasticache_replication_group.romai_redis[i].configuration_endpoint_address
  }
}

output "load_balancer_dns_names" {
  description = "DNS names of the load balancers"
  value = {
    for i, region in var.regions :
    region => aws_lb.romai_alb[i].dns_name
  }
}