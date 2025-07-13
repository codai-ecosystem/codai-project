# ROMAI Ultimate MCP Server - Terraform Main Configuration
# Infrastructure as Code for Production Deployment

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
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }

  backend "s3" {
    # Configure your S3 backend
    bucket         = "romai-terraform-state"
    key            = "romai-mcp/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "romai-terraform-locks"
  }
}

# AWS Provider Configuration
provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "ROMAI Ultimate MCP Server"
      Environment = var.environment
      Owner       = "ROMAI Team"
      ManagedBy   = "Terraform"
      CostCenter  = "Engineering"
    }
  }
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# Random password for database
resource "random_password" "db_password" {
  length  = 32
  special = true
}

# Random password for Redis
resource "random_password" "redis_password" {
  length  = 32
  special = true
}

# KMS Key for encryption
resource "aws_kms_key" "romai_key" {
  description             = "ROMAI Ultimate MCP Server encryption key"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    Name = "romai-mcp-key"
  }
}

resource "aws_kms_alias" "romai_key_alias" {
  name          = "alias/romai-mcp-${var.environment}"
  target_key_id = aws_kms_key.romai_key.key_id
}

# VPC
resource "aws_vpc" "romai_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "romai-mcp-vpc-${var.environment}"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "romai_igw" {
  vpc_id = aws_vpc.romai_vpc.id

  tags = {
    Name = "romai-mcp-igw-${var.environment}"
  }
}

# Public Subnets
resource "aws_subnet" "public_subnets" {
  count             = length(var.public_subnet_cidrs)
  vpc_id            = aws_vpc.romai_vpc.id
  cidr_block        = var.public_subnet_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  map_public_ip_on_launch = true

  tags = {
    Name = "romai-mcp-public-subnet-${count.index + 1}-${var.environment}"
    Type = "Public"
  }
}

# Private Subnets
resource "aws_subnet" "private_subnets" {
  count             = length(var.private_subnet_cidrs)
  vpc_id            = aws_vpc.romai_vpc.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "romai-mcp-private-subnet-${count.index + 1}-${var.environment}"
    Type = "Private"
  }
}

# NAT Gateway
resource "aws_eip" "nat_eips" {
  count  = length(aws_subnet.public_subnets)
  domain = "vpc"

  tags = {
    Name = "romai-mcp-nat-eip-${count.index + 1}-${var.environment}"
  }
}

resource "aws_nat_gateway" "nat_gateways" {
  count         = length(aws_subnet.public_subnets)
  allocation_id = aws_eip.nat_eips[count.index].id
  subnet_id     = aws_subnet.public_subnets[count.index].id

  tags = {
    Name = "romai-mcp-nat-gateway-${count.index + 1}-${var.environment}"
  }

  depends_on = [aws_internet_gateway.romai_igw]
}

# Route Tables
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.romai_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.romai_igw.id
  }

  tags = {
    Name = "romai-mcp-public-rt-${var.environment}"
  }
}

resource "aws_route_table" "private_rts" {
  count  = length(aws_subnet.private_subnets)
  vpc_id = aws_vpc.romai_vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gateways[count.index].id
  }

  tags = {
    Name = "romai-mcp-private-rt-${count.index + 1}-${var.environment}"
  }
}

# Route Table Associations
resource "aws_route_table_association" "public_rta" {
  count          = length(aws_subnet.public_subnets)
  subnet_id      = aws_subnet.public_subnets[count.index].id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "private_rta" {
  count          = length(aws_subnet.private_subnets)
  subnet_id      = aws_subnet.private_subnets[count.index].id
  route_table_id = aws_route_table.private_rts[count.index].id
}

# Security Groups
resource "aws_security_group" "alb_sg" {
  name_prefix = "romai-mcp-alb-"
  vpc_id      = aws_vpc.romai_vpc.id
  description = "Security group for Application Load Balancer"

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
    Name = "romai-mcp-alb-sg-${var.environment}"
  }
}

resource "aws_security_group" "ecs_sg" {
  name_prefix = "romai-mcp-ecs-"
  vpc_id      = aws_vpc.romai_vpc.id
  description = "Security group for ECS tasks"

  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  ingress {
    from_port       = 9090
    to_port         = 9090
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "romai-mcp-ecs-sg-${var.environment}"
  }
}

resource "aws_security_group" "rds_sg" {
  name_prefix = "romai-mcp-rds-"
  vpc_id      = aws_vpc.romai_vpc.id
  description = "Security group for RDS database"

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_sg.id]
  }

  tags = {
    Name = "romai-mcp-rds-sg-${var.environment}"
  }
}

resource "aws_security_group" "elasticache_sg" {
  name_prefix = "romai-mcp-redis-"
  vpc_id      = aws_vpc.romai_vpc.id
  description = "Security group for ElastiCache Redis"

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_sg.id]
  }

  tags = {
    Name = "romai-mcp-redis-sg-${var.environment}"
  }
}

# RDS Subnet Group
resource "aws_db_subnet_group" "romai_db_subnet_group" {
  name       = "romai-mcp-db-subnet-group-${var.environment}"
  subnet_ids = aws_subnet.private_subnets[*].id

  tags = {
    Name = "romai-mcp-db-subnet-group-${var.environment}"
  }
}

# ElastiCache Subnet Group
resource "aws_elasticache_subnet_group" "romai_cache_subnet_group" {
  name       = "romai-mcp-cache-subnet-group-${var.environment}"
  subnet_ids = aws_subnet.private_subnets[*].id
}

# RDS Instance
resource "aws_db_instance" "romai_db" {
  identifier             = "romai-mcp-db-${var.environment}"
  allocated_storage      = var.db_allocated_storage
  max_allocated_storage  = var.db_max_allocated_storage
  storage_type           = "gp3"
  storage_encrypted      = true
  kms_key_id            = aws_kms_key.romai_key.arn
  
  engine         = "postgres"
  engine_version = var.db_engine_version
  instance_class = var.db_instance_class
  
  db_name  = "romai"
  username = "romai"
  password = random_password.db_password.result
  
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.romai_db_subnet_group.name
  
  backup_retention_period = var.db_backup_retention_period
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = var.environment != "production"
  deletion_protection = var.environment == "production"
  
  performance_insights_enabled = true
  monitoring_interval         = 60
  
  tags = {
    Name = "romai-mcp-db-${var.environment}"
  }
}

# ElastiCache Redis Cluster
resource "aws_elasticache_replication_group" "romai_redis" {
  replication_group_id       = "romai-mcp-redis-${var.environment}"
  description                = "Redis cluster for ROMAI MCP Server"
  
  node_type                  = var.redis_node_type
  port                       = 6379
  parameter_group_name       = "default.redis7"
  
  num_cache_clusters         = var.redis_num_cache_nodes
  
  subnet_group_name          = aws_elasticache_subnet_group.romai_cache_subnet_group.name
  security_group_ids         = [aws_security_group.elasticache_sg.id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                 = random_password.redis_password.result
  
  snapshot_retention_limit   = var.redis_snapshot_retention_limit
  snapshot_window           = "03:00-05:00"
  
  automatic_failover_enabled = var.redis_num_cache_nodes > 1
  multi_az_enabled          = var.redis_num_cache_nodes > 1
  
  tags = {
    Name = "romai-mcp-redis-${var.environment}"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "romai_cluster" {
  name = "romai-mcp-cluster-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "romai-mcp-cluster-${var.environment}"
  }
}

# ECS Task Definition
resource "aws_ecs_task_definition" "romai_task" {
  family                   = "romai-mcp-task-${var.environment}"
  requires_compatibilities = ["FARGATE"]
  network_mode            = "awsvpc"
  cpu                     = var.ecs_cpu
  memory                  = var.ecs_memory
  execution_role_arn      = aws_iam_role.ecs_execution_role.arn
  task_role_arn          = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name  = "romai-mcp"
      image = "${var.ecr_repository_url}:${var.image_tag}"
      
      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        },
        {
          containerPort = 9090
          protocol      = "tcp"
        }
      ]
      
      environment = [
        {
          name  = "NODE_ENV"
          value = var.environment
        },
        {
          name  = "PORT"
          value = "3000"
        },
        {
          name  = "ROMAI_SECURITY_ENABLED"
          value = "true"
        },
        {
          name  = "ROMAI_MONITORING_ENABLED"
          value = "true"
        }
      ]
      
      secrets = [
        {
          name      = "DATABASE_URL"
          valueFrom = aws_secretsmanager_secret.db_url.arn
        },
        {
          name      = "REDIS_URL"
          valueFrom = aws_secretsmanager_secret.redis_url.arn
        },
        {
          name      = "JWT_SECRET"
          valueFrom = aws_secretsmanager_secret.jwt_secret.arn
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.romai_logs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
      
      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = {
    Name = "romai-mcp-task-${var.environment}"
  }
}

# Application Load Balancer
resource "aws_lb" "romai_alb" {
  name               = "romai-mcp-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets           = aws_subnet.public_subnets[*].id

  enable_deletion_protection = var.environment == "production"

  tags = {
    Name = "romai-mcp-alb-${var.environment}"
  }
}

# ALB Target Group
resource "aws_lb_target_group" "romai_tg" {
  name        = "romai-mcp-tg-${var.environment}"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.romai_vpc.id
  target_type = "ip"

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
    Name = "romai-mcp-tg-${var.environment}"
  }
}

# ALB Listener
resource "aws_lb_listener" "romai_listener" {
  load_balancer_arn = aws_lb.romai_alb.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = var.ssl_certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.romai_tg.arn
  }
}

# HTTP to HTTPS Redirect
resource "aws_lb_listener" "romai_http_redirect" {
  load_balancer_arn = aws_lb.romai_alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# ECS Service
resource "aws_ecs_service" "romai_service" {
  name            = "romai-mcp-service-${var.environment}"
  cluster         = aws_ecs_cluster.romai_cluster.id
  task_definition = aws_ecs_task_definition.romai_task.arn
  desired_count   = var.ecs_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs_sg.id]
    subnets         = aws_subnet.private_subnets[*].id
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.romai_tg.arn
    container_name   = "romai-mcp"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.romai_listener]

  tags = {
    Name = "romai-mcp-service-${var.environment}"
  }
}

# Auto Scaling Target
resource "aws_appautoscaling_target" "romai_target" {
  max_capacity       = var.ecs_max_capacity
  min_capacity       = var.ecs_min_capacity
  resource_id        = "service/${aws_ecs_cluster.romai_cluster.name}/${aws_ecs_service.romai_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

# Auto Scaling Policy - CPU
resource "aws_appautoscaling_policy" "romai_cpu_policy" {
  name               = "romai-mcp-cpu-scaling-${var.environment}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.romai_target.resource_id
  scalable_dimension = aws_appautoscaling_target.romai_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.romai_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}

# Auto Scaling Policy - Memory
resource "aws_appautoscaling_policy" "romai_memory_policy" {
  name               = "romai-mcp-memory-scaling-${var.environment}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.romai_target.resource_id
  scalable_dimension = aws_appautoscaling_target.romai_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.romai_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    target_value = 80.0
  }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "romai_logs" {
  name              = "/ecs/romai-mcp-${var.environment}"
  retention_in_days = var.log_retention_in_days

  tags = {
    Name = "romai-mcp-logs-${var.environment}"
  }
}

# Include other modules
module "secrets" {
  source = "./modules/secrets"
  
  environment           = var.environment
  kms_key_id           = aws_kms_key.romai_key.arn
  db_password          = random_password.db_password.result
  redis_password       = random_password.redis_password.result
  database_url         = "postgresql://romai:${random_password.db_password.result}@${aws_db_instance.romai_db.endpoint}/romai"
  redis_url           = "redis://:${random_password.redis_password.result}@${aws_elasticache_replication_group.romai_redis.primary_endpoint_address}:6379"
}

module "monitoring" {
  source = "./modules/monitoring"
  
  environment    = var.environment
  cluster_name   = aws_ecs_cluster.romai_cluster.name
  service_name   = aws_ecs_service.romai_service.name
  alb_arn_suffix = aws_lb.romai_alb.arn_suffix
  target_group_arn_suffix = aws_lb_target_group.romai_tg.arn_suffix
}

module "backup" {
  source = "./modules/backup"
  
  environment = var.environment
  kms_key_id  = aws_kms_key.romai_key.arn
  db_identifier = aws_db_instance.romai_db.identifier
}

# Include outputs
output "alb_dns_name" {
  description = "DNS name of the load balancer"
  value       = aws_lb.romai_alb.dns_name
}

output "database_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.romai_db.endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = aws_elasticache_replication_group.romai_redis.primary_endpoint_address
  sensitive   = true
}
