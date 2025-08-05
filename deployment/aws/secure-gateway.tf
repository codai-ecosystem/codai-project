# Add secure gateway to ECS task definitions
resource "aws_ecs_task_definition" "secure_gateway" {
  family                   = "codai-secure-gateway-prod"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name  = "secure-gateway"
      image = "567877624442.dkr.ecr.us-east-1.amazonaws.com/codai/secure-gateway:latest"
      
      essential = true
      
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
          protocol      = "tcp"
        }
      ]
      
      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "PORT"
          value = "3000"
        },
        {
          name  = "JWT_SECRET"
          value = "codai_prod_jwt_Kj8m9nP2qR4sT6vW8xZ0bC3eF5gH7jL9nQ2sU4wY6zA8cE0gI2kM"
        },
        {
          name  = "REDIS_URL"
          value = "redis://codai-redis-prod.codai-cluster-prod.local:6379"
        },
        {
          name  = "ALLOWED_ORIGINS"
          value = "https://codai.ro,https://api.codai.ro,https://admin.codai.ro,https://apps.codai.ro,https://docs.codai.ro,https://gateway.codai.ro"
        },
        {
          name  = "LOG_LEVEL"
          value = "warn"
        },
        {
          name  = "LOG_FILE_PATH"
          value = "/var/log/gateway"
        },
        {
          name  = "RATE_LIMIT_WINDOW_MS"
          value = "900000"
        },
        {
          name  = "RATE_LIMIT_MAX_REQUESTS"
          value = "1000"
        },
        {
          name  = "ECS_CLUSTER_NAME"
          value = "codai-cluster-prod"
        },
        {
          name  = "SERVICE_DISCOVERY_NAMESPACE"
          value = "codai-cluster-prod.local"
        }
      ]
      
      healthCheck = {
        command = ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"]
        interval = 30
        timeout = 5
        retries = 3
        startPeriod = 60
      }
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/codai-secure-gateway-prod"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = {
    Name        = "codai-secure-gateway-prod"
    Environment = "production"
    Project     = "codai"
  }
}

# ECS Service for secure gateway
resource "aws_ecs_service" "secure_gateway" {
  name            = "codai-secure-gateway-prod"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.secure_gateway.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.secure_gateway.arn
    container_name   = "secure-gateway"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.main_https]

  tags = {
    Name        = "codai-secure-gateway-prod"
    Environment = "production"
    Project     = "codai"
  }
}

# Target group for secure gateway
resource "aws_lb_target_group" "secure_gateway" {
  name     = "codai-secure-gateway-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id
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
    Name        = "codai-secure-gateway-tg"
    Environment = "production"
    Project     = "codai"
  }
}

# ALB listener rule for secure gateway
resource "aws_lb_listener_rule" "secure_gateway" {
  listener_arn = aws_lb_listener.main_https.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.secure_gateway.arn
  }

  condition {
    host_header {
      values = ["gateway.codai.ro"]
    }
  }

  tags = {
    Name        = "codai-secure-gateway-rule"
    Environment = "production"
    Project     = "codai"
  }
}

# ECR repository for secure gateway - TODO: Create manually if needed
# resource "aws_ecr_repository" "secure_gateway" {
#   name                 = "codai/secure-gateway"
#   image_tag_mutability = "MUTABLE"
# 
#   image_scanning_configuration {
#     scan_on_push = true
#   }
# 
#   encryption_configuration {
#     encryption_type = "AES256"
#   }
# 
#   tags = {
#     Name        = "codai-secure-gateway"
#     Environment = "production"
#     Project     = "codai"
#   }
# }

# ECR lifecycle policy for secure gateway - TODO: Enable with ECR repository  
# resource "aws_ecr_lifecycle_policy" "secure_gateway" {
#   repository = aws_ecr_repository.secure_gateway.name
# 
#   policy = jsonencode({
#     rules = [
#       {
#         rulePriority = 1
#         description  = "Keep last 10 images"
#         selection = {
#           tagStatus     = "tagged"
#           tagPrefixList = ["v"]
#           countType     = "imageCountMoreThan"
#           countNumber   = 10
#         }
#         action = {
#           type = "expire"
#         }
#       },
#       {
#         rulePriority = 2
#         description  = "Delete untagged images"
#         selection = {
#           tagStatus   = "untagged"
#           countType   = "sinceImagePushed"
#           countUnit   = "days"
#           countNumber = 1
#         }
#         action = {
#           type = "expire"
#         }
#       }
#     ]
#   })
# }

# CloudWatch log group for secure gateway
resource "aws_cloudwatch_log_group" "secure_gateway" {
  name              = "/ecs/codai-secure-gateway-prod"
  retention_in_days = 30

  tags = {
    Name        = "codai-secure-gateway-logs"
    Environment = "production"
    Project     = "codai"
  }
}
