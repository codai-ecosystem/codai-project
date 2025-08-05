# CODAI AWS Infrastructure Deployment
# Comprehensive multi-service production infrastructure

terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
  
  backend "s3" {
    bucket  = "codai-terraform-state"
    key     = "infrastructure/terraform.tfstate"
    region  = "us-east-1"
    encrypt = true
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "CODAI"
      Environment = var.environment
      ManagedBy   = "Terraform"
      CreatedAt   = timestamp()
    }
  }
}

# Variables
variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
  default     = "production"
}

variable "domain_name" {
  description = "Primary domain for CODAI services"
  type        = string
  default     = "codai.ai"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

# VPC Configuration
resource "aws_vpc" "codai_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "codai-${var.environment}-vpc"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "codai_igw" {
  vpc_id = aws_vpc.codai_vpc.id
  
  tags = {
    Name = "codai-${var.environment}-igw"
  }
}

# Public Subnets
resource "aws_subnet" "public" {
  count = 3
  
  vpc_id                  = aws_vpc.codai_vpc.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  
  tags = {
    Name = "codai-${var.environment}-public-subnet-${count.index + 1}"
    Type = "Public"
  }
}

# Private Subnets
resource "aws_subnet" "private" {
  count = 3
  
  vpc_id            = aws_vpc.codai_vpc.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  tags = {
    Name = "codai-${var.environment}-private-subnet-${count.index + 1}"
    Type = "Private"
  }
}

# NAT Gateways
resource "aws_eip" "nat" {
  count = 3
  domain = "vpc"
  
  tags = {
    Name = "codai-${var.environment}-nat-eip-${count.index + 1}"
  }
}

resource "aws_nat_gateway" "codai_nat" {
  count = 3
  
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id
  
  tags = {
    Name = "codai-${var.environment}-nat-gateway-${count.index + 1}"
  }
  
  depends_on = [aws_internet_gateway.codai_igw]
}

# Route Tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.codai_vpc.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.codai_igw.id
  }
  
  tags = {
    Name = "codai-${var.environment}-public-rt"
  }
}

resource "aws_route_table" "private" {
  count = 3
  
  vpc_id = aws_vpc.codai_vpc.id
  
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.codai_nat[count.index].id
  }
  
  tags = {
    Name = "codai-${var.environment}-private-rt-${count.index + 1}"
  }
}

# Route Table Associations
resource "aws_route_table_association" "public" {
  count = 3
  
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count = 3
  
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

# Security Groups
resource "aws_security_group" "alb" {
  name_prefix = "codai-${var.environment}-alb-"
  vpc_id      = aws_vpc.codai_vpc.id
  
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
    Name = "codai-${var.environment}-alb-sg"
  }
}

resource "aws_security_group" "ecs" {
  name_prefix = "codai-${var.environment}-ecs-"
  vpc_id      = aws_vpc.codai_vpc.id
  
  ingress {
    from_port       = 0
    to_port         = 65535
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "codai-${var.environment}-ecs-sg"
  }
}

resource "aws_security_group" "rds" {
  name_prefix = "codai-${var.environment}-rds-"
  vpc_id      = aws_vpc.codai_vpc.id
  
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }
  
  tags = {
    Name = "codai-${var.environment}-rds-sg"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "codai" {
  name = "codai-${var.environment}"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
  
  tags = {
    Name = "codai-${var.environment}-cluster"
  }
}

# Application Load Balancer
resource "aws_lb" "codai_alb" {
  name               = "codai-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id
  
  enable_deletion_protection = false
  
  tags = {
    Name = "codai-${var.environment}-alb"
  }
}

# ACM Certificate
resource "aws_acm_certificate" "codai" {
  domain_name       = var.domain_name
  subject_alternative_names = [
    "*.${var.domain_name}",
    "api.${var.domain_name}",
    "gateway.${var.domain_name}",
    "cbd.${var.domain_name}"
  ]
  validation_method = "DNS"
  
  lifecycle {
    create_before_destroy = true
  }
  
  tags = {
    Name = "codai-${var.environment}-cert"
  }
}

# RDS Subnet Group
resource "aws_db_subnet_group" "codai" {
  name       = "codai-${var.environment}-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id
  
  tags = {
    Name = "codai-${var.environment}-db-subnet-group"
  }
}

# RDS Instance for CBD
resource "aws_db_instance" "cbd" {
  identifier     = "codai-${var.environment}-cbd"
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.r6g.large"
  
  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_type         = "gp3"
  storage_encrypted    = true
  
  db_name  = "cbd"
  username = "cbd_admin"
  password = random_password.cbd_password.result
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.codai.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = var.environment != "production"
  
  tags = {
    Name = "codai-${var.environment}-cbd-db"
  }
}

resource "random_password" "cbd_password" {
  length  = 32
  special = true
}

# ElastiCache Redis for Session Store
resource "aws_elasticache_subnet_group" "codai" {
  name       = "codai-${var.environment}-cache-subnet"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_security_group" "redis" {
  name_prefix = "codai-${var.environment}-redis-"
  vpc_id      = aws_vpc.codai_vpc.id
  
  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }
  
  tags = {
    Name = "codai-${var.environment}-redis-sg"
  }
}

resource "aws_elasticache_replication_group" "codai" {
  replication_group_id       = "codai-${var.environment}"
  description                = "Redis cluster for CODAI session storage"
  
  node_type            = "cache.r6g.large"
  port                 = 6379
  parameter_group_name = "default.redis7"
  
  num_cache_clusters = 2
  
  subnet_group_name  = aws_elasticache_subnet_group.codai.name
  security_group_ids = [aws_security_group.redis.id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  
  tags = {
    Name = "codai-${var.environment}-redis"
  }
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "codai_services" {
  for_each = toset([
    "cbd-database",
    "gateway-service", 
    "websocket-service",
    "ai-analytics",
    "collaboration-service",
    "graphql-gateway"
  ])
  
  name              = "/aws/ecs/codai-${var.environment}/${each.key}"
  retention_in_days = 7
  
  tags = {
    Name    = "codai-${var.environment}-${each.key}-logs"
    Service = each.key
  }
}

# ECR Repositories
resource "aws_ecr_repository" "codai_services" {
  for_each = toset([
    "cbd-database",
    "gateway-service",
    "websocket-service", 
    "ai-analytics",
    "collaboration-service",
    "graphql-gateway"
  ])
  
  name                 = "codai/${each.key}"
  image_tag_mutability = "MUTABLE"
  
  image_scanning_configuration {
    scan_on_push = true
  }
  
  tags = {
    Name    = "codai-${each.key}-repo"
    Service = each.key
  }
}

# ECR Lifecycle Policies
resource "aws_ecr_lifecycle_policy" "codai_services" {
  for_each = aws_ecr_repository.codai_services
  
  repository = each.value.name
  
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

# S3 Bucket for Static Assets
resource "aws_s3_bucket" "codai_assets" {
  bucket = "codai-${var.environment}-assets-${random_id.bucket_suffix.hex}"
  
  tags = {
    Name = "codai-${var.environment}-assets"
  }
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket_versioning" "codai_assets" {
  bucket = aws_s3_bucket.codai_assets.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_encryption" "codai_assets" {
  bucket = aws_s3_bucket.codai_assets.id
  
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

# CloudFront Distribution for Global CDN
resource "aws_cloudfront_distribution" "codai_cdn" {
  origin {
    domain_name = aws_s3_bucket.codai_assets.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.codai_assets.id}"
    
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.codai.cloudfront_access_identity_path
    }
  }
  
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  
  aliases = ["cdn.${var.domain_name}"]
  
  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.codai_assets.id}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
    
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
    
    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
  }
  
  price_class = "PriceClass_All"
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.codai.arn
    ssl_support_method  = "sni-only"
  }
  
  tags = {
    Name = "codai-${var.environment}-cdn"
  }
}

resource "aws_cloudfront_origin_access_identity" "codai" {
  comment = "CODAI ${var.environment} OAI"
}

# IAM Role for ECS Tasks
resource "aws_iam_role" "ecs_task_execution" {
  name = "codai-${var.environment}-ecs-task-execution"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role" "ecs_task" {
  name = "codai-${var.environment}-ecs-task"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

# Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.codai_vpc.id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = aws_subnet.private[*].id
}

output "alb_dns_name" {
  description = "DNS name of the load balancer"
  value       = aws_lb.codai_alb.dns_name
}

output "alb_zone_id" {
  description = "Zone ID of the load balancer"
  value       = aws_lb.codai_alb.zone_id
}

output "ecs_cluster_id" {
  description = "ID of the ECS cluster"
  value       = aws_ecs_cluster.codai.id
}

output "cbd_database_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.cbd.endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "Redis cluster endpoint"
  value       = aws_elasticache_replication_group.codai.configuration_endpoint_address
  sensitive   = true
}

output "ecr_repositories" {
  description = "ECR repository URLs"
  value = {
    for k, v in aws_ecr_repository.codai_services : k => v.repository_url
  }
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.codai_cdn.domain_name
}

output "s3_bucket_name" {
  description = "S3 bucket name for assets"
  value       = aws_s3_bucket.codai_assets.id
}
