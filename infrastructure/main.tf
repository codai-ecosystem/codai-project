# 🏗️ CBD Universal Database - AWS Infrastructure (Terraform)

terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "cbd-terraform-state"
    key    = "cbd-infrastructure/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "CBD Universal Database"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "CBD Team"
    }
  }
}

# Variables
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

# Data sources
data "aws_caller_identity" "current" {}

# VPC Configuration
resource "aws_vpc" "cbd_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "cbd-vpc-${var.environment}"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "cbd_igw" {
  vpc_id = aws_vpc.cbd_vpc.id

  tags = {
    Name = "cbd-igw-${var.environment}"
  }
}

# Public Subnets
resource "aws_subnet" "cbd_public_subnet" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.cbd_vpc.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = var.availability_zones[count.index]
  
  map_public_ip_on_launch = true

  tags = {
    Name = "cbd-public-subnet-${count.index + 1}-${var.environment}"
    Type = "Public"
  }
}

# Private Subnets
resource "aws_subnet" "cbd_private_subnet" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.cbd_vpc.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name = "cbd-private-subnet-${count.index + 1}-${var.environment}"
    Type = "Private"
  }
}

# NAT Gateways
resource "aws_eip" "cbd_nat_eip" {
  count  = length(var.availability_zones)
  domain = "vpc"

  tags = {
    Name = "cbd-nat-eip-${count.index + 1}-${var.environment}"
  }
}

resource "aws_nat_gateway" "cbd_nat_gateway" {
  count         = length(var.availability_zones)
  allocation_id = aws_eip.cbd_nat_eip[count.index].id
  subnet_id     = aws_subnet.cbd_public_subnet[count.index].id

  tags = {
    Name = "cbd-nat-gateway-${count.index + 1}-${var.environment}"
  }

  depends_on = [aws_internet_gateway.cbd_igw]
}

# Route Tables - Public
resource "aws_route_table" "cbd_public_rt" {
  vpc_id = aws_vpc.cbd_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.cbd_igw.id
  }

  tags = {
    Name = "cbd-public-rt-${var.environment}"
  }
}

resource "aws_route_table_association" "cbd_public_rta" {
  count          = length(aws_subnet.cbd_public_subnet)
  subnet_id      = aws_subnet.cbd_public_subnet[count.index].id
  route_table_id = aws_route_table.cbd_public_rt.id
}

# Route Tables - Private
resource "aws_route_table" "cbd_private_rt" {
  count  = length(var.availability_zones)
  vpc_id = aws_vpc.cbd_vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.cbd_nat_gateway[count.index].id
  }

  tags = {
    Name = "cbd-private-rt-${count.index + 1}-${var.environment}"
  }
}

resource "aws_route_table_association" "cbd_private_rta" {
  count          = length(aws_subnet.cbd_private_subnet)
  subnet_id      = aws_subnet.cbd_private_subnet[count.index].id
  route_table_id = aws_route_table.cbd_private_rt[count.index].id
}

# Security Groups
resource "aws_security_group" "cbd_alb_sg" {
  name_prefix = "cbd-alb-sg-${var.environment}"
  vpc_id      = aws_vpc.cbd_vpc.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
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
    Name = "cbd-alb-sg-${var.environment}"
  }
}

resource "aws_security_group" "cbd_ecs_sg" {
  name_prefix = "cbd-ecs-sg-${var.environment}"
  vpc_id      = aws_vpc.cbd_vpc.id

  ingress {
    description     = "HTTP from ALB"
    from_port       = 0
    to_port         = 65535
    protocol        = "tcp"
    security_groups = [aws_security_group.cbd_alb_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "cbd-ecs-sg-${var.environment}"
  }
}

# RDS Security Group
resource "aws_security_group" "cbd_rds_sg" {
  name_prefix = "cbd-rds-sg-${var.environment}"
  vpc_id      = aws_vpc.cbd_vpc.id

  ingress {
    description     = "PostgreSQL from ECS"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.cbd_ecs_sg.id]
  }

  tags = {
    Name = "cbd-rds-sg-${var.environment}"
  }
}

# ElastiCache Security Group
resource "aws_security_group" "cbd_redis_sg" {
  name_prefix = "cbd-redis-sg-${var.environment}"
  vpc_id      = aws_vpc.cbd_vpc.id

  ingress {
    description     = "Redis from ECS"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.cbd_ecs_sg.id]
  }

  tags = {
    Name = "cbd-redis-sg-${var.environment}"
  }
}

# RDS Subnet Group
resource "aws_db_subnet_group" "cbd_db_subnet_group" {
  name       = "cbd-db-subnet-group-${var.environment}"
  subnet_ids = aws_subnet.cbd_private_subnet[*].id

  tags = {
    Name = "cbd-db-subnet-group-${var.environment}"
  }
}

# ElastiCache Subnet Group
resource "aws_elasticache_subnet_group" "cbd_cache_subnet_group" {
  name       = "cbd-cache-subnet-group-${var.environment}"
  subnet_ids = aws_subnet.cbd_private_subnet[*].id
}

# RDS Instance
resource "aws_db_instance" "cbd_postgres" {
  identifier             = "cbd-postgres-${var.environment}"
  engine                 = "postgres"
  engine_version         = "16.1"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  max_allocated_storage  = 100
  storage_type           = "gp3"
  storage_encrypted      = true

  db_name  = "cbd_database"
  username = "cbd_admin"
  password = "ChangeMeInProduction123!" # Use AWS Secrets Manager in production

  vpc_security_group_ids = [aws_security_group.cbd_rds_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.cbd_db_subnet_group.name

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "Sun:04:00-Sun:05:00"

  skip_final_snapshot = var.environment != "prod"
  deletion_protection = var.environment == "prod"

  performance_insights_enabled = true
  monitoring_interval         = 60

  tags = {
    Name = "cbd-postgres-${var.environment}"
  }
}

# ElastiCache Redis Cluster
resource "aws_elasticache_replication_group" "cbd_redis" {
  replication_group_id       = "cbd-redis-${var.environment}"
  description                = "CBD Redis cluster for ${var.environment}"
  
  node_type                  = "cache.t3.micro"
  port                       = 6379
  parameter_group_name       = "default.redis7"
  
  num_cache_clusters         = 2
  automatic_failover_enabled = true
  multi_az_enabled          = true
  
  subnet_group_name = aws_elasticache_subnet_group.cbd_cache_subnet_group.name
  security_group_ids = [aws_security_group.cbd_redis_sg.id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  
  snapshot_retention_limit = 5
  snapshot_window         = "03:00-05:00"
  
  tags = {
    Name = "cbd-redis-${var.environment}"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "cbd_cluster" {
  name = "cbd-cluster-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "cbd-cluster-${var.environment}"
  }
}

# ECS Cluster Capacity Providers
resource "aws_ecs_cluster_capacity_providers" "cbd_cluster_cp" {
  cluster_name = aws_ecs_cluster.cbd_cluster.name

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    base              = 1
    weight            = 100
    capacity_provider = "FARGATE"
  }
}

# Application Load Balancer
resource "aws_lb" "cbd_alb" {
  name               = "cbd-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.cbd_alb_sg.id]
  subnets            = aws_subnet.cbd_public_subnet[*].id

  enable_deletion_protection = var.environment == "prod"

  tags = {
    Name = "cbd-alb-${var.environment}"
  }
}

# Target Groups for each service
resource "aws_lb_target_group" "cbd_core_tg" {
  name     = "cbd-core-tg-${var.environment}"
  port     = 4180
  protocol = "HTTP"
  vpc_id   = aws_vpc.cbd_vpc.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }

  tags = {
    Name = "cbd-core-tg-${var.environment}"
  }
}

# ALB Listener
resource "aws_lb_listener" "cbd_alb_listener" {
  load_balancer_arn = aws_lb.cbd_alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.cbd_core_tg.arn
  }
}

# ECR Repositories
resource "aws_ecr_repository" "cbd_repositories" {
  for_each = toset([
    "cbd-core",
    "cbd-collaboration",
    "cbd-analytics", 
    "cbd-graphql",
    "cbd-mesh"
  ])
  
  name                 = "${each.key}-${var.environment}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${each.key}-${var.environment}"
  }
}

# Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.cbd_vpc.id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.cbd_public_subnet[*].id
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = aws_subnet.cbd_private_subnet[*].id
}

output "alb_dns_name" {
  description = "DNS name of the load balancer"
  value       = aws_lb.cbd_alb.dns_name
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.cbd_cluster.name
}

output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.cbd_postgres.endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "Redis cluster endpoint"
  value       = aws_elasticache_replication_group.cbd_redis.primary_endpoint_address
  sensitive   = true
}

output "ecr_repositories" {
  description = "ECR repository URLs"
  value = {
    for k, v in aws_ecr_repository.cbd_repositories : k => v.repository_url
  }
}
