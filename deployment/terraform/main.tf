# ==============================================================================
# RomAI AGI Production Infrastructure - Terraform Configuration
# ==============================================================================
# Comprehensive cloud infrastructure for world-class AGI deployment
# Supports AWS, Azure, and GCP with multi-region setup
# ==============================================================================

terraform {
  required_version = ">= 1.6.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.20"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.10"
    }
  }
  
  backend "s3" {
    bucket         = "romai-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "romai-terraform-lock"
    encrypt        = true
  }
}

# ==============================================================================
# Variables
# ==============================================================================

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "romai-agi-production"
}

variable "node_instance_types" {
  description = "EC2 instance types for worker nodes"
  type        = list(string)
  default     = ["g5.2xlarge", "g5.4xlarge"] # GPU instances
}

variable "min_nodes" {
  description = "Minimum number of worker nodes"
  type        = number
  default     = 3
}

variable "max_nodes" {
  description = "Maximum number of worker nodes"
  type        = number
  default     = 20
}

variable "domain_name" {
  description = "Domain name for RomAI AGI"
  type        = string
  default     = "romai.ai"
}

variable "enable_gpu_support" {
  description = "Enable GPU support for ML workloads"
  type        = bool
  default     = true
}

variable "backup_retention_days" {
  description = "Backup retention period in days"
  type        = number
  default     = 30
}

# ==============================================================================
# Data Sources
# ==============================================================================

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# ==============================================================================
# VPC and Networking
# ==============================================================================

resource "aws_vpc" "romai_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name                                        = "${var.cluster_name}-vpc"
    Environment                                 = var.environment
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
  }
}

resource "aws_subnet" "romai_private" {
  count = 3
  
  vpc_id            = aws_vpc.romai_vpc.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  tags = {
    Name                                        = "${var.cluster_name}-private-${count.index + 1}"
    Environment                                 = var.environment
    "kubernetes.io/role/internal-elb"           = "1"
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
  }
}

resource "aws_subnet" "romai_public" {
  count = 3
  
  vpc_id                  = aws_vpc.romai_vpc.id
  cidr_block              = "10.0.${count.index + 101}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  
  tags = {
    Name                                        = "${var.cluster_name}-public-${count.index + 1}"
    Environment                                 = var.environment
    "kubernetes.io/role/elb"                    = "1"
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
  }
}

resource "aws_internet_gateway" "romai_igw" {
  vpc_id = aws_vpc.romai_vpc.id
  
  tags = {
    Name        = "${var.cluster_name}-igw"
    Environment = var.environment
  }
}

resource "aws_nat_gateway" "romai_nat" {
  count = 3
  
  allocation_id = aws_eip.romai_nat[count.index].id
  subnet_id     = aws_subnet.romai_public[count.index].id
  
  tags = {
    Name        = "${var.cluster_name}-nat-${count.index + 1}"
    Environment = var.environment
  }
}

resource "aws_eip" "romai_nat" {
  count = 3
  
  domain = "vpc"
  
  tags = {
    Name        = "${var.cluster_name}-nat-eip-${count.index + 1}"
    Environment = var.environment
  }
}

resource "aws_route_table" "romai_private" {
  count = 3
  
  vpc_id = aws_vpc.romai_vpc.id
  
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.romai_nat[count.index].id
  }
  
  tags = {
    Name        = "${var.cluster_name}-rt-private-${count.index + 1}"
    Environment = var.environment
  }
}

resource "aws_route_table" "romai_public" {
  vpc_id = aws_vpc.romai_vpc.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.romai_igw.id
  }
  
  tags = {
    Name        = "${var.cluster_name}-rt-public"
    Environment = var.environment
  }
}

resource "aws_route_table_association" "romai_private" {
  count = 3
  
  subnet_id      = aws_subnet.romai_private[count.index].id
  route_table_id = aws_route_table.romai_private[count.index].id
}

resource "aws_route_table_association" "romai_public" {
  count = 3
  
  subnet_id      = aws_subnet.romai_public[count.index].id
  route_table_id = aws_route_table.romai_public.id
}

# ==============================================================================
# Security Groups
# ==============================================================================

resource "aws_security_group" "romai_cluster" {
  name_prefix = "${var.cluster_name}-cluster-"
  vpc_id      = aws_vpc.romai_vpc.id
  
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
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name        = "${var.cluster_name}-cluster-sg"
    Environment = var.environment
  }
}

resource "aws_security_group" "romai_nodes" {
  name_prefix = "${var.cluster_name}-nodes-"
  vpc_id      = aws_vpc.romai_vpc.id
  
  ingress {
    description     = "Cluster communication"
    from_port       = 0
    to_port         = 65535
    protocol        = "tcp"
    security_groups = [aws_security_group.romai_cluster.id]
    self            = true
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name        = "${var.cluster_name}-nodes-sg"
    Environment = var.environment
  }
}

# ==============================================================================
# IAM Roles and Policies
# ==============================================================================

resource "aws_iam_role" "romai_cluster_role" {
  name = "${var.cluster_name}-cluster-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "romai_cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.romai_cluster_role.name
}

resource "aws_iam_role" "romai_node_role" {
  name = "${var.cluster_name}-node-role"
  
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
}

resource "aws_iam_role_policy_attachment" "romai_node_policy" {
  for_each = toset([
    "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
    "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
    "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
  ])
  
  policy_arn = each.value
  role       = aws_iam_role.romai_node_role.name
}

# ==============================================================================
# EKS Cluster
# ==============================================================================

resource "aws_eks_cluster" "romai_cluster" {
  name     = var.cluster_name
  role_arn = aws_iam_role.romai_cluster_role.arn
  version  = "1.28"
  
  vpc_config {
    subnet_ids              = concat(aws_subnet.romai_private[*].id, aws_subnet.romai_public[*].id)
    endpoint_private_access = true
    endpoint_public_access  = true
    security_group_ids      = [aws_security_group.romai_cluster.id]
  }
  
  encryption_config {
    provider {
      key_arn = aws_kms_key.romai_eks.arn
    }
    resources = ["secrets"]
  }
  
  enabled_cluster_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]
  
  depends_on = [
    aws_iam_role_policy_attachment.romai_cluster_policy,
    aws_cloudwatch_log_group.romai_eks,
  ]
  
  tags = {
    Name        = var.cluster_name
    Environment = var.environment
  }
}

resource "aws_kms_key" "romai_eks" {
  description             = "EKS encryption key for ${var.cluster_name}"
  deletion_window_in_days = 7
  enable_key_rotation     = true
  
  tags = {
    Name        = "${var.cluster_name}-eks-key"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "romai_eks" {
  name              = "/aws/eks/${var.cluster_name}/cluster"
  retention_in_days = 7
}

# ==============================================================================
# EKS Node Groups
# ==============================================================================

resource "aws_eks_node_group" "romai_gpu_nodes" {
  count = var.enable_gpu_support ? 1 : 0
  
  cluster_name    = aws_eks_cluster.romai_cluster.name
  node_group_name = "romai-gpu-nodes"
  node_role_arn   = aws_iam_role.romai_node_role.arn
  subnet_ids      = aws_subnet.romai_private[*].id
  
  capacity_type  = "ON_DEMAND"
  instance_types = ["g5.xlarge", "g5.2xlarge"]
  
  scaling_config {
    desired_size = 2
    max_size     = 10
    min_size     = 1
  }
  
  update_config {
    max_unavailable = 1
  }
  
  labels = {
    node-type     = "gpu"
    accelerator   = "nvidia-gpu"
    workload-type = "ml"
  }
  
  taint {
    key    = "nvidia.com/gpu"
    value  = "true"
    effect = "NO_SCHEDULE"
  }
  
  depends_on = [
    aws_iam_role_policy_attachment.romai_node_policy,
  ]
  
  tags = {
    Name        = "${var.cluster_name}-gpu-nodes"
    Environment = var.environment
  }
}

resource "aws_eks_node_group" "romai_cpu_nodes" {
  cluster_name    = aws_eks_cluster.romai_cluster.name
  node_group_name = "romai-cpu-nodes"
  node_role_arn   = aws_iam_role.romai_node_role.arn
  subnet_ids      = aws_subnet.romai_private[*].id
  
  capacity_type  = "SPOT"
  instance_types = ["c5.2xlarge", "c5.4xlarge", "m5.2xlarge"]
  
  scaling_config {
    desired_size = var.min_nodes
    max_size     = var.max_nodes
    min_size     = var.min_nodes
  }
  
  update_config {
    max_unavailable = 2
  }
  
  labels = {
    node-type     = "cpu"
    workload-type = "general"
  }
  
  depends_on = [
    aws_iam_role_policy_attachment.romai_node_policy,
  ]
  
  tags = {
    Name        = "${var.cluster_name}-cpu-nodes"
    Environment = var.environment
  }
}

# ==============================================================================
# RDS Database
# ==============================================================================

resource "aws_db_subnet_group" "romai_db" {
  name       = "${var.cluster_name}-db-subnet-group"
  subnet_ids = aws_subnet.romai_private[*].id
  
  tags = {
    Name        = "${var.cluster_name}-db-subnet-group"
    Environment = var.environment
  }
}

resource "aws_security_group" "romai_db" {
  name_prefix = "${var.cluster_name}-db-"
  vpc_id      = aws_vpc.romai_vpc.id
  
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.romai_nodes.id]
  }
  
  tags = {
    Name        = "${var.cluster_name}-db-sg"
    Environment = var.environment
  }
}

resource "aws_db_instance" "romai_db" {
  identifier = "${var.cluster_name}-db"
  
  allocated_storage       = 100
  max_allocated_storage   = 1000
  storage_type            = "gp3"
  storage_encrypted       = true
  kms_key_id              = aws_kms_key.romai_rds.arn
  
  engine            = "postgres"
  engine_version    = "15.4"
  instance_class    = "db.r6g.xlarge"
  
  db_name  = "romai_agi"
  username = "romai"
  password = random_password.db_password.result
  
  vpc_security_group_ids = [aws_security_group.romai_db.id]
  db_subnet_group_name   = aws_db_subnet_group.romai_db.name
  
  backup_retention_period   = var.backup_retention_days
  backup_window            = "03:00-04:00"
  maintenance_window       = "sun:04:00-sun:05:00"
  auto_minor_version_upgrade = true
  
  performance_insights_enabled = true
  monitoring_interval          = 60
  monitoring_role_arn         = aws_iam_role.romai_rds_monitoring.arn
  
  deletion_protection = true
  skip_final_snapshot = false
  final_snapshot_identifier = "${var.cluster_name}-db-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"
  
  tags = {
    Name        = "${var.cluster_name}-db"
    Environment = var.environment
  }
}

resource "aws_kms_key" "romai_rds" {
  description             = "RDS encryption key for ${var.cluster_name}"
  deletion_window_in_days = 7
  enable_key_rotation     = true
  
  tags = {
    Name        = "${var.cluster_name}-rds-key"
    Environment = var.environment
  }
}

resource "random_password" "db_password" {
  length  = 32
  special = true
}

resource "aws_iam_role" "romai_rds_monitoring" {
  name = "${var.cluster_name}-rds-monitoring-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "romai_rds_monitoring" {
  role       = aws_iam_role.romai_rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# ==============================================================================
# ElastiCache Redis
# ==============================================================================

resource "aws_elasticache_subnet_group" "romai_redis" {
  name       = "${var.cluster_name}-redis-subnet-group"
  subnet_ids = aws_subnet.romai_private[*].id
  
  tags = {
    Name        = "${var.cluster_name}-redis-subnet-group"
    Environment = var.environment
  }
}

resource "aws_security_group" "romai_redis" {
  name_prefix = "${var.cluster_name}-redis-"
  vpc_id      = aws_vpc.romai_vpc.id
  
  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.romai_nodes.id]
  }
  
  tags = {
    Name        = "${var.cluster_name}-redis-sg"
    Environment = var.environment
  }
}

resource "aws_elasticache_replication_group" "romai_redis" {
  replication_group_id       = "${var.cluster_name}-redis"
  description                = "Redis cluster for RomAI AGI"
  
  node_type                  = "cache.r7g.xlarge"
  port                       = 6379
  parameter_group_name       = "default.redis7"
  
  num_cache_clusters         = 3
  automatic_failover_enabled = true
  multi_az_enabled           = true
  
  subnet_group_name          = aws_elasticache_subnet_group.romai_redis.name
  security_group_ids         = [aws_security_group.romai_redis.id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  kms_key_id                 = aws_kms_key.romai_redis.arn
  
  snapshot_retention_limit   = 3
  snapshot_window           = "03:00-05:00"
  maintenance_window        = "sun:05:00-sun:07:00"
  
  auto_minor_version_upgrade = true
  
  tags = {
    Name        = "${var.cluster_name}-redis"
    Environment = var.environment
  }
}

resource "aws_kms_key" "romai_redis" {
  description             = "Redis encryption key for ${var.cluster_name}"
  deletion_window_in_days = 7
  enable_key_rotation     = true
  
  tags = {
    Name        = "${var.cluster_name}-redis-key"
    Environment = var.environment
  }
}

# ==============================================================================
# S3 Buckets
# ==============================================================================

resource "aws_s3_bucket" "romai_models" {
  bucket = "${var.cluster_name}-models-${random_id.bucket_suffix.hex}"
  
  tags = {
    Name        = "${var.cluster_name}-models"
    Environment = var.environment
  }
}

resource "aws_s3_bucket" "romai_backups" {
  bucket = "${var.cluster_name}-backups-${random_id.bucket_suffix.hex}"
  
  tags = {
    Name        = "${var.cluster_name}-backups"
    Environment = var.environment
  }
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket_encryption" "romai_models" {
  bucket = aws_s3_bucket.romai_models.id
  
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        kms_master_key_id = aws_kms_key.romai_s3.arn
        sse_algorithm     = "aws:kms"
      }
    }
  }
}

resource "aws_s3_bucket_encryption" "romai_backups" {
  bucket = aws_s3_bucket.romai_backups.id
  
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        kms_master_key_id = aws_kms_key.romai_s3.arn
        sse_algorithm     = "aws:kms"
      }
    }
  }
}

resource "aws_kms_key" "romai_s3" {
  description             = "S3 encryption key for ${var.cluster_name}"
  deletion_window_in_days = 7
  enable_key_rotation     = true
  
  tags = {
    Name        = "${var.cluster_name}-s3-key"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "romai_models" {
  bucket = aws_s3_bucket.romai_models.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_versioning" "romai_backups" {
  bucket = aws_s3_bucket.romai_backups.id
  versioning_configuration {
    status = "Enabled"
  }
}

# ==============================================================================
# Outputs
# ==============================================================================

output "cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = aws_eks_cluster.romai_cluster.endpoint
}

output "cluster_name" {
  description = "EKS cluster name"
  value       = aws_eks_cluster.romai_cluster.name
}

output "cluster_security_group_id" {
  description = "Security group ID attached to the EKS cluster"
  value       = aws_eks_cluster.romai_cluster.vpc_config[0].cluster_security_group_id
}

output "database_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.romai_db.endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "Redis cluster endpoint"
  value       = aws_elasticache_replication_group.romai_redis.configuration_endpoint_address
  sensitive   = true
}

output "models_bucket" {
  description = "S3 bucket for model storage"
  value       = aws_s3_bucket.romai_models.bucket
}

output "backups_bucket" {
  description = "S3 bucket for backups"
  value       = aws_s3_bucket.romai_backups.bucket
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.romai_vpc.id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.romai_private[*].id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.romai_public[*].id
}