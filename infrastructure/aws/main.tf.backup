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
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
  }
  
  backend "s3" {
    bucket = "memorai-terraform-state"
    key    = "enterprise/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "memorai-enterprise"
      Environment = var.environment
      ManagedBy   = "terraform"
      Owner       = "codai-ecosystem"
    }
  }
}

# Random suffix for unique resource naming
resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# VPC Configuration
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"
  
  name = "memorai-enterprise-vpc"
  cidr = var.vpc_cidr
  
  azs             = slice(data.aws_availability_zones.available.names, 0, 3)
  private_subnets = [for i in range(3) : cidrsubnet(var.vpc_cidr, 8, i)]
  public_subnets  = [for i in range(3) : cidrsubnet(var.vpc_cidr, 8, i + 100)]
  
  enable_nat_gateway     = true
  single_nat_gateway     = false
  enable_vpn_gateway     = true
  enable_dns_hostnames   = true
  enable_dns_support     = true
  
  # Enable VPC Flow Logs for security monitoring
  enable_flow_log                      = true
  create_flow_log_cloudwatch_iam_role  = true
  create_flow_log_cloudwatch_log_group = true
  
  tags = {
    Name = "memorai-enterprise-vpc"
    "kubernetes.io/cluster/memorai-enterprise" = "shared"
  }
  
  public_subnet_tags = {
    "kubernetes.io/cluster/memorai-enterprise" = "shared"
    "kubernetes.io/role/elb"                   = "1"
  }
  
  private_subnet_tags = {
    "kubernetes.io/cluster/memorai-enterprise" = "shared"
    "kubernetes.io/role/internal-elb"          = "1"
  }
}

# Security Groups
resource "aws_security_group" "rds" {
  name_prefix = "memorai-rds-"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "memorai-rds-sg"
  }
}

resource "aws_security_group" "redis" {
  name_prefix = "memorai-redis-"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "memorai-redis-sg"
  }
}

# EKS Cluster
module "eks" {
  source = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"
  
  cluster_name    = "memorai-enterprise"
  cluster_version = var.kubernetes_version
  
  vpc_id                         = module.vpc.vpc_id
  subnet_ids                     = module.vpc.private_subnets
  cluster_endpoint_public_access = true
  cluster_endpoint_private_access = true
  cluster_endpoint_public_access_cidrs = var.cluster_endpoint_public_access_cidrs
  
  # Cluster encryption
  cluster_encryption_config = {
    provider_key_arn = aws_kms_key.eks.arn
    resources        = ["secrets"]
  }
  
  # CloudWatch Logging
  cluster_enabled_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]
  
  # EKS Managed Node Groups
  eks_managed_node_groups = {
    # Compute nodes for general workloads
    compute = {
      name           = "compute-nodes"
      instance_types = ["c6i.4xlarge", "c6i.8xlarge"]
      capacity_type  = "ON_DEMAND"
      
      min_size     = 3
      max_size     = 50
      desired_size = 5
      
      # Use latest EKS optimized AMI
      ami_type = "AL2_x86_64"
      
      # Enable detailed monitoring
      enable_monitoring = true
      
      # Disk configuration
      disk_size = 100
      disk_type = "gp3"
      
      labels = {
        role = "compute"
        tier = "standard"
      }
      
      taints = []
      
      # Security group rules
      vpc_security_group_ids = [aws_security_group.worker_nodes.id]
    }
    
    # Memory-optimized nodes for CBD vector operations
    memory = {
      name           = "memory-nodes"
      instance_types = ["r6i.8xlarge", "r6i.12xlarge"]
      capacity_type  = "ON_DEMAND"
      
      min_size     = 2
      max_size     = 20
      desired_size = 3
      
      ami_type = "AL2_x86_64"
      enable_monitoring = true
      
      disk_size = 200
      disk_type = "gp3"
      
      labels = {
        role = "memory-intensive"
        tier = "high-memory"
      }
      
      taints = [
        {
          key    = "role"
          value  = "memory-intensive"
          effect = "NO_SCHEDULE"
        }
      ]
      
      vpc_security_group_ids = [aws_security_group.worker_nodes.id]
    }
    
    # GPU nodes for ML workloads
    gpu = {
      name           = "gpu-nodes"
      instance_types = ["p4d.24xlarge", "g5.12xlarge"]
      capacity_type  = "ON_DEMAND"
      
      min_size     = 0
      max_size     = 10
      desired_size = 1
      
      ami_type = "AL2_x86_64_GPU"
      enable_monitoring = true
      
      disk_size = 500
      disk_type = "gp3"
      
      labels = {
        role = "gpu"
        "nvidia.com/gpu" = "true"
      }
      
      taints = [
        {
          key    = "nvidia.com/gpu"
          value  = "true"
          effect = "NO_SCHEDULE"
        }
      ]
      
      vpc_security_group_ids = [aws_security_group.worker_nodes.id]
    }
    
    # Spot instances for cost optimization
    spot = {
      name           = "spot-nodes"
      instance_types = ["c6i.2xlarge", "c5.2xlarge", "c5n.2xlarge"]
      capacity_type  = "SPOT"
      
      min_size     = 0
      max_size     = 20
      desired_size = 2
      
      ami_type = "AL2_x86_64"
      enable_monitoring = true
      
      disk_size = 100
      disk_type = "gp3"
      
      labels = {
        role = "spot"
        tier = "cost-optimized"
      }
      
      taints = [
        {
          key    = "node-type"
          value  = "spot"
          effect = "NO_SCHEDULE"
        }
      ]
      
      vpc_security_group_ids = [aws_security_group.worker_nodes.id]
    }
  }
  
  # OIDC Identity provider
  cluster_identity_providers = {
    sts = {
      client_id = "sts.amazonaws.com"
    }
  }
  
  tags = {
    Name = "memorai-enterprise"
  }
}

# Worker node security group
resource "aws_security_group" "worker_nodes" {
  name_prefix = "memorai-worker-nodes-"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    from_port = 0
    to_port   = 65535
    protocol  = "tcp"
    self      = true
  }
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "memorai-worker-nodes-sg"
  }
}

# KMS Key for EKS encryption
resource "aws_kms_key" "eks" {
  description             = "EKS Secret Encryption Key"
  deletion_window_in_days = 7
  enable_key_rotation     = true
  
  tags = {
    Name = "memorai-eks-encryption-key"
  }
}

resource "aws_kms_alias" "eks" {
  name          = "alias/memorai-eks"
  target_key_id = aws_kms_key.eks.key_id
}

# RDS Subnet Group
resource "aws_db_subnet_group" "metadata" {
  name       = "memorai-metadata-subnet-group"
  subnet_ids = module.vpc.private_subnets
  
  tags = {
    Name = "memorai-metadata-subnet-group"
  }
}

# RDS for metadata storage
resource "aws_db_instance" "metadata" {
  identifier = "memorai-metadata"
  
  engine                = "postgres"
  engine_version        = "15.4"
  instance_class        = var.rds_instance_class
  allocated_storage     = var.rds_allocated_storage
  max_allocated_storage = var.rds_max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true
  kms_key_id           = aws_kms_key.rds.arn
  
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.metadata.name
  
  # Backup configuration
  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  # Performance and monitoring
  performance_insights_enabled          = true
  performance_insights_retention_period = 7
  monitoring_interval                   = 60
  monitoring_role_arn                  = aws_iam_role.rds_monitoring.arn
  
  # Multi-AZ for high availability
  multi_az = true
  
  # Enhanced monitoring
  enabled_cloudwatch_logs_exports = ["postgresql"]
  
  # Deletion protection
  deletion_protection = var.environment == "production"
  
  tags = {
    Name = "memorai-metadata-db"
  }
}

# KMS Key for RDS encryption
resource "aws_kms_key" "rds" {
  description             = "RDS Encryption Key"
  deletion_window_in_days = 7
  enable_key_rotation     = true
  
  tags = {
    Name = "memorai-rds-encryption-key"
  }
}

resource "aws_kms_alias" "rds" {
  name          = "alias/memorai-rds"
  target_key_id = aws_kms_key.rds.key_id
}

# IAM role for RDS monitoring
resource "aws_iam_role" "rds_monitoring" {
  name = "memorai-rds-monitoring-role"
  
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

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# ElastiCache Subnet Group
resource "aws_elasticache_subnet_group" "redis" {
  name       = "memorai-redis-subnet-group"
  subnet_ids = module.vpc.private_subnets
  
  tags = {
    Name = "memorai-redis-subnet-group"
  }
}

# ElastiCache Redis Cluster
resource "aws_elasticache_replication_group" "redis" {
  replication_group_id       = "memorai-redis"
  description               = "Redis cluster for MemorAI caching"
  
  node_type                 = var.redis_node_type
  port                      = 6379
  parameter_group_name      = aws_elasticache_parameter_group.redis.name
  
  num_cache_clusters         = var.redis_num_cache_nodes
  automatic_failover_enabled = true
  multi_az_enabled          = true
  
  subnet_group_name = aws_elasticache_subnet_group.redis.name
  security_group_ids = [aws_security_group.redis.id]
  
  # Security
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                = var.redis_auth_token
  kms_key_id               = aws_kms_key.elasticache.arn
  
  # Backup
  snapshot_retention_limit = 7
  snapshot_window         = "03:00-05:00"
  
  # Maintenance
  maintenance_window = "sun:05:00-sun:07:00"
  
  # Logging
  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.redis_slow.name
    destination_type = "cloudwatch-logs"
    log_format      = "text"
    log_type        = "slow-log"
  }
  
  tags = {
    Name = "memorai-redis-cluster"
  }
}

# Redis parameter group for optimization
resource "aws_elasticache_parameter_group" "redis" {
  family = "redis7"
  name   = "memorai-redis-params"
  
  # Memory optimization
  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }
  
  # Persistence settings
  parameter {
    name  = "save"
    value = "900 1 300 10 60 10000"
  }
  
  tags = {
    Name = "memorai-redis-parameter-group"
  }
}

# KMS Key for ElastiCache encryption
resource "aws_kms_key" "elasticache" {
  description             = "ElastiCache Encryption Key"
  deletion_window_in_days = 7
  enable_key_rotation     = true
  
  tags = {
    Name = "memorai-elasticache-encryption-key"
  }
}

resource "aws_kms_alias" "elasticache" {
  name          = "alias/memorai-elasticache"
  target_key_id = aws_kms_key.elasticache.key_id
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "redis_slow" {
  name              = "/aws/elasticache/memorai-redis/slow-log"
  retention_in_days = 7
  
  tags = {
    Name = "memorai-redis-slow-log"
  }
}

# S3 bucket for backups and data storage
resource "aws_s3_bucket" "data" {
  bucket = "memorai-enterprise-data-${random_string.suffix.result}"
  
  tags = {
    Name = "memorai-enterprise-data"
  }
}

resource "aws_s3_bucket_versioning" "data" {
  bucket = aws_s3_bucket.data.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_encryption" "data" {
  bucket = aws_s3_bucket.data.id
  
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm     = "aws:kms"
        kms_master_key_id = aws_kms_key.s3.arn
      }
      bucket_key_enabled = true
    }
  }
}

resource "aws_s3_bucket_public_access_block" "data" {
  bucket = aws_s3_bucket.data.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "data" {
  bucket = aws_s3_bucket.data.id
  
  rule {
    id     = "lifecycle"
    status = "Enabled"
    
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }
    
    transition {
      days          = 90
      storage_class = "GLACIER"
    }
    
    transition {
      days          = 365
      storage_class = "DEEP_ARCHIVE"
    }
    
    expiration {
      days = 2555  # 7 years
    }
  }
}

# KMS Key for S3 encryption
resource "aws_kms_key" "s3" {
  description             = "S3 Bucket Encryption Key"
  deletion_window_in_days = 7
  enable_key_rotation     = true
  
  tags = {
    Name = "memorai-s3-encryption-key"
  }
}

resource "aws_kms_alias" "s3" {
  name          = "alias/memorai-s3"
  target_key_id = aws_kms_key.s3.key_id
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "memorai-enterprise-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets           = module.vpc.public_subnets
  
  enable_deletion_protection = var.environment == "production"
  
  # Access logs
  access_logs {
    bucket  = aws_s3_bucket.alb_logs.bucket
    prefix  = "alb"
    enabled = true
  }
  
  tags = {
    Name = "memorai-enterprise-alb"
  }
}

# ALB Security Group
resource "aws_security_group" "alb" {
  name_prefix = "memorai-alb-"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 443
    to_port     = 443
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
    Name = "memorai-alb-sg"
  }
}

# S3 bucket for ALB access logs
resource "aws_s3_bucket" "alb_logs" {
  bucket = "memorai-alb-logs-${random_string.suffix.result}"
  
  tags = {
    Name = "memorai-alb-logs"
  }
}

resource "aws_s3_bucket_policy" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_elb_service_account.main.id}:root"
        }
        Action   = "s3:PutObject"
        Resource = "${aws_s3_bucket.alb_logs.arn}/alb/AWSLogs/${data.aws_caller_identity.current.account_id}/*"
      }
    ]
  })
}

data "aws_elb_service_account" "main" {}

# Route 53 hosted zone (assuming you have a domain)
data "aws_route53_zone" "main" {
  count = var.domain_name != "" ? 1 : 0
  name  = var.domain_name
}

# ACM Certificate for HTTPS
resource "aws_acm_certificate" "main" {
  count           = var.domain_name != "" ? 1 : 0
  domain_name     = var.domain_name
  subject_alternative_names = ["*.${var.domain_name}"]
  validation_method = "DNS"
  
  lifecycle {
    create_before_destroy = true
  }
  
  tags = {
    Name = "memorai-enterprise-cert"
  }
}

# Certificate validation
resource "aws_acm_certificate_validation" "main" {
  count           = var.domain_name != "" ? 1 : 0
  certificate_arn = aws_acm_certificate.main[0].arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

resource "aws_route53_record" "cert_validation" {
  for_each = var.domain_name != "" ? {
    for dvo in aws_acm_certificate.main[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}
  
  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.main[0].zone_id
}
