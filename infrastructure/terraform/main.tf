# CODAI Ecosystem - AWS ECS Fargate Deployment
# Production-Ready Infrastructure for RomAI & MemorAI
# Date: August 20, 2025 - With RomAI Logical Reasoning Fixes

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "CODAI-Ecosystem"
      Environment = var.environment
      ManagedBy   = "Terraform"
      DeployDate  = var.deployment_date
      RomAIVersion = var.romai_agi_version
    }
  }
}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "deployment_date" {
  description = "Deployment date"
  type        = string
  default     = "2025-08-20"
}

variable "romai_agi_version" {
  description = "RomAI AGI Model Server version"
  type        = string
  default     = "v2.0-logical-reasoning-fix"
}

# VPC Configuration
resource "aws_vpc" "codai_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "codai-vpc"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "codai_igw" {
  vpc_id = aws_vpc.codai_vpc.id

  tags = {
    Name = "codai-igw"
  }
}

# Public Subnets
resource "aws_subnet" "public_subnet_1" {
  vpc_id                  = aws_vpc.codai_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "codai-public-subnet-1"
  }
}

resource "aws_subnet" "public_subnet_2" {
  vpc_id                  = aws_vpc.codai_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = true

  tags = {
    Name = "codai-public-subnet-2"
  }
}

# Route Table
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.codai_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.codai_igw.id
  }

  tags = {
    Name = "codai-public-rt"
  }
}

resource "aws_route_table_association" "public_rta_1" {
  subnet_id      = aws_subnet.public_subnet_1.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "public_rta_2" {
  subnet_id      = aws_subnet.public_subnet_2.id
  route_table_id = aws_route_table.public_rt.id
}

# Security Groups
resource "aws_security_group" "alb_sg" {
  name_prefix = "codai-alb-sg"
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
    Name = "codai-alb-sg"
  }
}

resource "aws_security_group" "ecs_sg" {
  name_prefix = "codai-ecs-sg"
  vpc_id      = aws_vpc.codai_vpc.id

  ingress {
    from_port       = 0
    to_port         = 65535
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
    Name = "codai-ecs-sg"
  }
}

# Application Load Balancer
resource "aws_lb" "codai_alb" {
  name               = "codai-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.public_subnet_1.id, aws_subnet.public_subnet_2.id]

  tags = {
    Name = "codai-alb"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "codai_cluster" {
  name = "codai-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "codai-cluster"
  }
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "romai_agi_logs" {
  name              = "/ecs/romai-agi-server"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "memorai_mcp_logs" {
  name              = "/ecs/memorai-mcp-server"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "enterprise_api_logs" {
  name              = "/ecs/romai-enterprise-api"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "cbd_database_logs" {
  name              = "/ecs/cbd-database"
  retention_in_days = 7
}

# ECS Task Execution Role
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "codai-ecs-task-execution-role"

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

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# ECS Task Definitions
resource "aws_ecs_task_definition" "romai_agi_server" {
  family                   = "romai-agi-server"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 1024
  memory                   = 2048
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name  = "romai-agi-server"
      image = "codai/romai-agi-server:${var.romai_agi_version}"
      
      portMappings = [
        {
          containerPort = 6101
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "PORT"
          value = "6101"
        },
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "ROMAI_LOG_LEVEL"
          value = "INFO"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.romai_agi_logs.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }

      healthCheck = {
        command = ["CMD-SHELL", "curl -f http://localhost:6101/health || exit 1"]
        interval = 30
        timeout = 5
        retries = 3
        startPeriod = 60
      }
    }
  ])
}

resource "aws_ecs_task_definition" "memorai_mcp_server" {
  family                   = "memorai-mcp-server"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 512
  memory                   = 1024
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name  = "memorai-mcp-server"
      image = "codai/memorai-mcp-server:v9.9.0-microsoft-compliant"
      
      portMappings = [
        {
          containerPort = 4950
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "MEMORAI_MCP_PORT"
          value = "4950"
        },
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "ENABLE_VECTOR_SEARCH"
          value = "true"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.memorai_mcp_logs.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_task_definition" "romai_enterprise_api" {
  family                   = "romai-enterprise-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 512
  memory                   = 1024
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name  = "romai-enterprise-api"
      image = "codai/romai-enterprise-api:latest"
      
      portMappings = [
        {
          containerPort = 8001
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "ENTERPRISE_API_PORT"
          value = "8001"
        },
        {
          name  = "COMPLIANCE_MODE"
          value = "eu_ai_act"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.enterprise_api_logs.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_task_definition" "cbd_database" {
  family                   = "cbd-database"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name  = "cbd-database"
      image = "codai/cbd-database:v1.0.10"
      
      portMappings = [
        {
          containerPort = 4180
          protocol      = "tcp"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.cbd_database_logs.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}

# ECS Services
resource "aws_ecs_service" "romai_agi_service" {
  name            = "romai-agi-service"
  cluster         = aws_ecs_cluster.codai_cluster.id
  task_definition = aws_ecs_task_definition.romai_agi_server.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = [aws_subnet.public_subnet_1.id, aws_subnet.public_subnet_2.id]
    security_groups = [aws_security_group.ecs_sg.id]
    assign_public_ip = true
  }

  tags = {
    Name = "RomAI-AGI-Service"
    Component = "AGI-Model-Server"
  }
}

resource "aws_ecs_service" "memorai_mcp_service" {
  name            = "memorai-mcp-service"
  cluster         = aws_ecs_cluster.codai_cluster.id
  task_definition = aws_ecs_task_definition.memorai_mcp_server.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = [aws_subnet.public_subnet_1.id, aws_subnet.public_subnet_2.id]
    security_groups = [aws_security_group.ecs_sg.id]
    assign_public_ip = true
  }
}

resource "aws_ecs_service" "romai_enterprise_service" {
  name            = "romai-enterprise-service"
  cluster         = aws_ecs_cluster.codai_cluster.id
  task_definition = aws_ecs_task_definition.romai_enterprise_api.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = [aws_subnet.public_subnet_1.id, aws_subnet.public_subnet_2.id]
    security_groups = [aws_security_group.ecs_sg.id]
    assign_public_ip = true
  }
}

resource "aws_ecs_service" "cbd_database_service" {
  name            = "cbd-database-service"
  cluster         = aws_ecs_cluster.codai_cluster.id
  task_definition = aws_ecs_task_definition.cbd_database.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = [aws_subnet.public_subnet_1.id, aws_subnet.public_subnet_2.id]
    security_groups = [aws_security_group.ecs_sg.id]
    assign_public_ip = true
  }
}

# Outputs
output "cluster_name" {
  value = aws_ecs_cluster.codai_cluster.name
}

output "load_balancer_dns" {
  value = aws_lb.codai_alb.dns_name
}

output "vpc_id" {
  value = aws_vpc.codai_vpc.id
}