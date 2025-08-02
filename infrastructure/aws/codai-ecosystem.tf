# CODAI Ecosystem Complete Infrastructure Configuration
# Multi-domain production deployment on AWS

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
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.10"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
  
  backend "s3" {
    bucket = "codai-terraform-state"
    key    = "ecosystem/terraform.tfstate"
    region = "us-east-1"
  }
}

# Variables
variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "aws_account_id" {
  description = "AWS Account ID"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "domains" {
  description = "List of domains to configure"
  type        = list(string)
  default = [
    "codai.ro",
    "memorai.ro", 
    "controlai.ro",
    "romai.ro"
  ]
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT signing secret"
  type        = string
  sensitive   = true
}

# Provider Configuration
provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Environment = var.environment
      Project     = "CODAI-Ecosystem"
      ManagedBy   = "Terraform"
    }
  }
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# Random password for additional secrets
resource "random_password" "redis_password" {
  length  = 32
  special = true
}

# VPC Configuration
resource "aws_vpc" "codai_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "codai-ecosystem-vpc"
    "kubernetes.io/cluster/codai-ecosystem" = "shared"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "codai_igw" {
  vpc_id = aws_vpc.codai_vpc.id

  tags = {
    Name = "codai-ecosystem-igw"
  }
}

# Public Subnets
resource "aws_subnet" "public_subnets" {
  count = 3
  
  vpc_id                  = aws_vpc.codai_vpc.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "codai-public-subnet-${count.index + 1}"
    "kubernetes.io/cluster/codai-ecosystem" = "shared"
    "kubernetes.io/role/elb" = "1"
  }
}

# Private Subnets
resource "aws_subnet" "private_subnets" {
  count = 3
  
  vpc_id            = aws_vpc.codai_vpc.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "codai-private-subnet-${count.index + 1}"
    "kubernetes.io/cluster/codai-ecosystem" = "owned"
    "kubernetes.io/role/internal-elb" = "1"
  }
}

# Database Subnets
resource "aws_subnet" "database_subnets" {
  count = 3
  
  vpc_id            = aws_vpc.codai_vpc.id
  cidr_block        = "10.0.${count.index + 20}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "codai-database-subnet-${count.index + 1}"
  }
}

# NAT Gateways
resource "aws_eip" "nat_eips" {
  count = 3
  
  domain = "vpc"
  
  tags = {
    Name = "codai-nat-eip-${count.index + 1}"
  }
}

resource "aws_nat_gateway" "nat_gateways" {
  count = 3
  
  allocation_id = aws_eip.nat_eips[count.index].id
  subnet_id     = aws_subnet.public_subnets[count.index].id

  tags = {
    Name = "codai-nat-gateway-${count.index + 1}"
  }
  
  depends_on = [aws_internet_gateway.codai_igw]
}

# Route Tables
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.codai_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.codai_igw.id
  }

  tags = {
    Name = "codai-public-route-table"
  }
}

resource "aws_route_table" "private_rts" {
  count = 3
  
  vpc_id = aws_vpc.codai_vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gateways[count.index].id
  }

  tags = {
    Name = "codai-private-route-table-${count.index + 1}"
  }
}

# Route Table Associations
resource "aws_route_table_association" "public_rta" {
  count = 3
  
  subnet_id      = aws_subnet.public_subnets[count.index].id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "private_rta" {
  count = 3
  
  subnet_id      = aws_subnet.private_subnets[count.index].id
  route_table_id = aws_route_table.private_rts[count.index].id
}

# Security Groups
resource "aws_security_group" "eks_cluster_sg" {
  name_prefix = "codai-eks-cluster-"
  vpc_id      = aws_vpc.codai_vpc.id

  ingress {
    from_port = 443
    to_port   = 443
    protocol  = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "codai-eks-cluster-sg"
  }
}

resource "aws_security_group" "eks_node_sg" {
  name_prefix = "codai-eks-node-"
  vpc_id      = aws_vpc.codai_vpc.id

  ingress {
    from_port = 0
    to_port   = 65535
    protocol  = "tcp"
    self      = true
  }

  ingress {
    from_port       = 1025
    to_port         = 65535
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_cluster_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "codai-eks-node-sg"
  }
}

resource "aws_security_group" "rds_sg" {
  name_prefix = "codai-rds-"
  vpc_id      = aws_vpc.codai_vpc.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_node_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "codai-rds-sg"
  }
}

resource "aws_security_group" "redis_sg" {
  name_prefix = "codai-redis-"
  vpc_id      = aws_vpc.codai_vpc.id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_node_sg.id]
  }

  tags = {
    Name = "codai-redis-sg"
  }
}

# EKS Cluster
resource "aws_eks_cluster" "codai_cluster" {
  name     = "codai-ecosystem"
  role_arn = aws_iam_role.eks_cluster_role.arn
  version  = "1.28"

  vpc_config {
    subnet_ids              = concat(aws_subnet.public_subnets[*].id, aws_subnet.private_subnets[*].id)
    security_group_ids      = [aws_security_group.eks_cluster_sg.id]
    endpoint_private_access = true
    endpoint_public_access  = true
    public_access_cidrs     = ["0.0.0.0/0"]
  }

  encryption_config {
    provider {
      key_arn = aws_kms_key.eks_key.arn
    }
    resources = ["secrets"]
  }

  enabled_cluster_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy,
    aws_iam_role_policy_attachment.eks_vpc_resource_controller,
    aws_cloudwatch_log_group.eks_log_group,
  ]

  tags = {
    Name = "codai-ecosystem-cluster"
  }
}

# EKS Node Groups
resource "aws_eks_node_group" "general_nodes" {
  cluster_name    = aws_eks_cluster.codai_cluster.name
  node_group_name = "codai-general-nodes"
  node_role_arn   = aws_iam_role.eks_node_role.arn
  subnet_ids      = aws_subnet.private_subnets[*].id

  capacity_type  = "ON_DEMAND"
  instance_types = ["t3.large"]

  scaling_config {
    desired_size = 3
    max_size     = 20
    min_size     = 3
  }

  update_config {
    max_unavailable = 1
  }

  labels = {
    role = "general"
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.eks_container_registry_policy,
  ]

  tags = {
    Name = "codai-general-nodes"
  }
}

resource "aws_eks_node_group" "memory_nodes" {
  cluster_name    = aws_eks_cluster.codai_cluster.name
  node_group_name = "codai-memory-nodes"
  node_role_arn   = aws_iam_role.eks_node_role.arn
  subnet_ids      = aws_subnet.private_subnets[*].id

  capacity_type  = "ON_DEMAND"
  instance_types = ["r5.xlarge"]

  scaling_config {
    desired_size = 2
    max_size     = 10
    min_size     = 2
  }

  update_config {
    max_unavailable = 1
  }

  labels = {
    role = "memory-intensive"
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.eks_container_registry_policy,
  ]

  tags = {
    Name = "codai-memory-nodes"
  }
}

resource "aws_eks_node_group" "spot_nodes" {
  cluster_name    = aws_eks_cluster.codai_cluster.name
  node_group_name = "codai-spot-nodes"
  node_role_arn   = aws_iam_role.eks_node_role.arn
  subnet_ids      = aws_subnet.private_subnets[*].id

  capacity_type  = "SPOT"
  instance_types = ["t3.medium", "t3.large", "t3.xlarge"]

  scaling_config {
    desired_size = 2
    max_size     = 20
    min_size     = 0
  }

  update_config {
    max_unavailable = 2
  }

  labels = {
    role = "spot"
  }

  taint {
    key    = "spot"
    value  = "true"
    effect = "NO_SCHEDULE"
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.eks_container_registry_policy,
  ]

  tags = {
    Name = "codai-spot-nodes"
  }
}

# RDS Aurora Cluster
resource "aws_db_subnet_group" "codai_db_subnet_group" {
  name       = "codai-db-subnet-group"
  subnet_ids = aws_subnet.database_subnets[*].id

  tags = {
    Name = "codai-db-subnet-group"
  }
}

resource "aws_rds_cluster" "codai_aurora" {
  cluster_identifier             = "codai-aurora-cluster"
  engine                        = "aurora-postgresql"
  engine_version                = "15.4"
  availability_zones            = data.aws_availability_zones.available.names
  database_name                 = "codai"
  master_username               = "codai_admin"
  master_password               = var.db_password
  backup_retention_period       = 30
  preferred_backup_window       = "07:00-09:00"
  preferred_maintenance_window  = "wed:03:00-wed:04:00"
  db_subnet_group_name          = aws_db_subnet_group.codai_db_subnet_group.name
  vpc_security_group_ids        = [aws_security_group.rds_sg.id]
  storage_encrypted             = true
  kms_key_id                    = aws_kms_key.rds_key.arn
  deletion_protection           = true
  skip_final_snapshot          = false
  final_snapshot_identifier    = "codai-aurora-final-snapshot"

  enabled_cloudwatch_logs_exports = ["postgresql"]

  tags = {
    Name = "codai-aurora-cluster"
  }
}

resource "aws_rds_cluster_instance" "codai_aurora_instances" {
  count              = 3
  identifier         = "codai-aurora-instance-${count.index + 1}"
  cluster_identifier = aws_rds_cluster.codai_aurora.id
  instance_class     = "db.r6g.large"
  engine             = aws_rds_cluster.codai_aurora.engine
  engine_version     = aws_rds_cluster.codai_aurora.engine_version

  performance_insights_enabled = true
  monitoring_interval          = 60
  monitoring_role_arn          = aws_iam_role.rds_monitoring_role.arn

  tags = {
    Name = "codai-aurora-instance-${count.index + 1}"
  }
}

# ElastiCache Redis Cluster
resource "aws_elasticache_subnet_group" "codai_redis_subnet_group" {
  name       = "codai-redis-subnet-group"
  subnet_ids = aws_subnet.private_subnets[*].id
}

resource "aws_elasticache_replication_group" "codai_redis" {
  replication_group_id         = "codai-redis"
  description                  = "CODAI Redis cluster"
  node_type                    = "cache.r6g.large"
  port                         = 6379
  parameter_group_name         = "default.redis7"
  num_cache_clusters           = 3
  automatic_failover_enabled   = true
  multi_az_enabled            = true
  subnet_group_name           = aws_elasticache_subnet_group.codai_redis_subnet_group.name
  security_group_ids          = [aws_security_group.redis_sg.id]
  at_rest_encryption_enabled  = true
  transit_encryption_enabled  = true
  auth_token                  = random_password.redis_password.result
  
  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.redis_logs.name
    destination_type = "cloudwatch-logs"
    log_format       = "text"
    log_type         = "slow-log"
  }

  tags = {
    Name = "codai-redis-cluster"
  }
}

# Route53 Hosted Zones
resource "aws_route53_zone" "domains" {
  for_each = toset(var.domains)
  
  name = each.value

  tags = {
    Name = "${each.value}-hosted-zone"
  }
}

# ACM Certificates
resource "aws_acm_certificate" "domain_certs" {
  for_each = toset(var.domains)
  
  domain_name               = each.value
  subject_alternative_names = ["*.${each.value}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${each.value}-certificate"
  }
}

# Certificate Validation
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in flatten([
      for domain, cert in aws_acm_certificate.domain_certs : [
        for dvo in cert.domain_validation_options : {
          key = "${domain}-${dvo.domain_name}"
          domain = domain
          record = dvo
        }
      ]
    ]) : dvo.key => dvo
  }

  allow_overwrite = true
  name            = each.value.record.resource_record_name
  records         = [each.value.record.resource_record_value]
  ttl             = 60
  type            = each.value.record.resource_record_type
  zone_id         = aws_route53_zone.domains[each.value.domain].zone_id
}

resource "aws_acm_certificate_validation" "domain_cert_validations" {
  for_each = aws_acm_certificate.domain_certs
  
  certificate_arn         = each.value.arn
  validation_record_fqdns = [
    for record in aws_route53_record.cert_validation : record.fqdn
    if startswith(record.name, each.key)
  ]
}

# S3 Buckets
resource "aws_s3_bucket" "codai_assets" {
  bucket = "codai-ecosystem-assets-${random_id.bucket_suffix.hex}"

  tags = {
    Name        = "codai-assets"
    Environment = var.environment
  }
}

resource "aws_s3_bucket" "codai_backups" {
  bucket = "codai-ecosystem-backups-${random_id.bucket_suffix.hex}"

  tags = {
    Name        = "codai-backups"
    Environment = var.environment
  }
}

resource "random_id" "bucket_suffix" {
  byte_length = 8
}

# S3 Bucket Configuration
resource "aws_s3_bucket_versioning" "codai_assets_versioning" {
  bucket = aws_s3_bucket.codai_assets.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_encryption" "codai_assets_encryption" {
  bucket = aws_s3_bucket.codai_assets.id

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        kms_master_key_id = aws_kms_key.s3_key.arn
        sse_algorithm     = "aws:kms"
      }
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "codai_assets_lifecycle" {
  bucket = aws_s3_bucket.codai_assets.id

  rule {
    id     = "transition_to_ia"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    expiration {
      days = 365
    }
  }
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "codai_cdn" {
  origin {
    domain_name = aws_s3_bucket.codai_assets.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.codai_assets.id}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.codai_oai.cloudfront_access_identity_path
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  aliases = ["cdn.codai.ro"]

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.codai_assets.id}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.domain_certs["codai.ro"].arn
    ssl_support_method  = "sni-only"
  }

  tags = {
    Name = "codai-cdn"
  }
}

resource "aws_cloudfront_origin_access_identity" "codai_oai" {
  comment = "CODAI CDN OAI"
}

# ECR Repositories
resource "aws_ecr_repository" "repositories" {
  for_each = toset([
    "codai/gateway",
    "codai/id",
    "codai/hub", 
    "codai/admin",
    "memorai/frontend",
    "memorai/backend",
    "memorai/mcp",
    "cbd/enterprise",
    "controlai/frontend",
    "controlai/backend", 
    "controlai/mcp",
    "romai/frontend",
    "romai/backend",
    "romai/mcp"
  ])

  name                 = each.key
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Name = each.key
  }
}

# ECR Lifecycle Policies
resource "aws_ecr_lifecycle_policy" "repository_lifecycle" {
  for_each = aws_ecr_repository.repositories

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

# Output values
output "cluster_name" {
  value = aws_eks_cluster.codai_cluster.name
}

output "cluster_endpoint" {
  value = aws_eks_cluster.codai_cluster.endpoint
}

output "cluster_arn" {
  value = aws_eks_cluster.codai_cluster.arn
}

output "rds_endpoint" {
  value = aws_rds_cluster.codai_aurora.endpoint
}

output "redis_endpoint" {
  value = aws_elasticache_replication_group.codai_redis.primary_endpoint_address
}

output "vpc_id" {
  value = aws_vpc.codai_vpc.id
}

output "private_subnet_ids" {
  value = aws_subnet.private_subnets[*].id
}

output "public_subnet_ids" {
  value = aws_subnet.public_subnets[*].id
}

output "ecr_repositories" {
  value = {
    for k, v in aws_ecr_repository.repositories : k => v.repository_url
  }
}

output "certificate_arns" {
  value = {
    for k, v in aws_acm_certificate.domain_certs : k => v.arn
  }
}

output "route53_zones" {
  value = {
    for k, v in aws_route53_zone.domains : k => v.zone_id
  }
}

output "cloudfront_domain" {
  value = aws_cloudfront_distribution.codai_cdn.domain_name
}

output "s3_assets_bucket" {
  value = aws_s3_bucket.codai_assets.id
}

output "s3_backups_bucket" {
  value = aws_s3_bucket.codai_backups.id
}
