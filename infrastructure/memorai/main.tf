# MemorAI AWS Infrastructure Configuration
# Terraform configuration for production deployment

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "codai-terraform-state"
    key    = "memorai/infrastructure.tfstate"
    region = "eu-central-1"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "MemorAI"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "CODAI Ecosystem"
    }
  }
}

# Variables
variable "aws_region" {
  description = "AWS region for resource deployment"
  type        = string
  default     = "eu-central-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "domain_name" {
  description = "Primary domain name"
  type        = string
  default     = "memorai.ro"
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

# VPC Configuration
resource "aws_vpc" "memorai_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "memorai-vpc-${var.environment}"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "memorai_igw" {
  vpc_id = aws_vpc.memorai_vpc.id
  
  tags = {
    Name = "memorai-igw-${var.environment}"
  }
}

# Public Subnets
resource "aws_subnet" "memorai_public_subnets" {
  count = 2
  
  vpc_id                  = aws_vpc.memorai_vpc.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  
  tags = {
    Name = "memorai-public-subnet-${count.index + 1}-${var.environment}"
    Type = "Public"
  }
}

# Private Subnets
resource "aws_subnet" "memorai_private_subnets" {
  count = 2
  
  vpc_id            = aws_vpc.memorai_vpc.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  tags = {
    Name = "memorai-private-subnet-${count.index + 1}-${var.environment}"
    Type = "Private"
  }
}

# Route Tables
resource "aws_route_table" "memorai_public_rt" {
  vpc_id = aws_vpc.memorai_vpc.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.memorai_igw.id
  }
  
  tags = {
    Name = "memorai-public-rt-${var.environment}"
  }
}

resource "aws_route_table_association" "memorai_public_rta" {
  count = length(aws_subnet.memorai_public_subnets)
  
  subnet_id      = aws_subnet.memorai_private_subnets[count.index].id
  route_table_id = aws_route_table.memorai_public_rt.id
}

# Security Groups
resource "aws_security_group" "memorai_alb_sg" {
  name_prefix = "memorai-alb-sg-"
  vpc_id      = aws_vpc.memorai_vpc.id
  
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
    Name = "memorai-alb-sg-${var.environment}"
  }
}

resource "aws_security_group" "memorai_ecs_sg" {
  name_prefix = "memorai-ecs-sg-"
  vpc_id      = aws_vpc.memorai_vpc.id
  
  ingress {
    from_port       = 3000
    to_port         = 3001
    protocol        = "tcp"
    security_groups = [aws_security_group.memorai_alb_sg.id]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "memorai-ecs-sg-${var.environment}"
  }
}

# Application Load Balancer
resource "aws_lb" "memorai_alb" {
  name               = "memorai-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.memorai_alb_sg.id]
  subnets            = aws_subnet.memorai_public_subnets[*].id
  
  enable_deletion_protection = false
  
  tags = {
    Name = "memorai-alb-${var.environment}"
  }
}

# Target Groups
resource "aws_lb_target_group" "memorai_api_tg" {
  name     = "memorai-api-tg-${var.environment}"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = aws_vpc.memorai_vpc.id
  
  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200"
    port                = "traffic-port"
    protocol            = "HTTP"
  }
  
  tags = {
    Name = "memorai-api-tg-${var.environment}"
  }
}

resource "aws_lb_target_group" "memorai_mcp_tg" {
  name     = "memorai-mcp-tg-${var.environment}"
  port     = 3001
  protocol = "HTTP"
  vpc_id   = aws_vpc.memorai_vpc.id
  
  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200"
    port                = "traffic-port"
    protocol            = "HTTP"
  }
  
  tags = {
    Name = "memorai-mcp-tg-${var.environment}"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "memorai_cluster" {
  name = "memorai-cluster-${var.environment}"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
  
  tags = {
    Name = "memorai-cluster-${var.environment}"
  }
}

# ECS Task Execution Role
resource "aws_iam_role" "memorai_ecs_execution_role" {
  name = "memorai-ecs-execution-role-${var.environment}"
  
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
  
  tags = {
    Name = "memorai-ecs-execution-role-${var.environment}"
  }
}

resource "aws_iam_role_policy_attachment" "memorai_ecs_execution_role_policy" {
  role       = aws_iam_role.memorai_ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# ECR Repositories
resource "aws_ecr_repository" "memorai_api_repo" {
  name                 = "memorai-api"
  image_tag_mutability = "MUTABLE"
  
  image_scanning_configuration {
    scan_on_push = true
  }
  
  tags = {
    Name = "memorai-api-repo-${var.environment}"
  }
}

resource "aws_ecr_repository" "memorai_mcp_repo" {
  name                 = "memorai-mcp"
  image_tag_mutability = "MUTABLE"
  
  image_scanning_configuration {
    scan_on_push = true
  }
  
  tags = {
    Name = "memorai-mcp-repo-${var.environment}"
  }
}

# SSL Certificate
resource "aws_acm_certificate" "memorai_cert" {
  domain_name               = var.domain_name
  subject_alternative_names = ["*.${var.domain_name}"]
  validation_method         = "DNS"
  
  lifecycle {
    create_before_destroy = true
  }
  
  tags = {
    Name = "memorai-certificate-${var.environment}"
  }
}

# Route 53
resource "aws_route53_zone" "memorai_zone" {
  name = var.domain_name
  
  tags = {
    Name = "memorai-zone-${var.environment}"
  }
}

# CloudFront Distribution for API
resource "aws_cloudfront_distribution" "memorai_api_distribution" {
  origin {
    domain_name = aws_lb.memorai_alb.dns_name
    origin_id   = "memorai-api-origin"
    
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }
  
  enabled         = true
  is_ipv6_enabled = true
  comment         = "MemorAI API Distribution"
  
  aliases = ["api.${var.domain_name}", "mcp.${var.domain_name}"]
  
  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "memorai-api-origin"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
    
    forwarded_values {
      query_string = true
      headers      = ["Authorization", "Content-Type"]
      
      cookies {
        forward = "none"
      }
    }
    
    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
  }
  
  price_class = "PriceClass_100"
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.memorai_cert.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
  
  tags = {
    Name = "memorai-api-distribution-${var.environment}"
  }
}

# Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.memorai_vpc.id
}

output "alb_dns_name" {
  description = "DNS name of the load balancer"
  value       = aws_lb.memorai_alb.dns_name
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.memorai_api_distribution.domain_name
}

output "ecr_api_repository_url" {
  description = "URL of the API ECR repository"
  value       = aws_ecr_repository.memorai_api_repo.repository_url
}

output "ecr_mcp_repository_url" {
  description = "URL of the MCP ECR repository"
  value       = aws_ecr_repository.memorai_mcp_repo.repository_url
}

output "route53_zone_id" {
  description = "Route 53 hosted zone ID"
  value       = aws_route53_zone.memorai_zone.zone_id
}

output "certificate_arn" {
  description = "ARN of the SSL certificate"
  value       = aws_acm_certificate.memorai_cert.arn
}
