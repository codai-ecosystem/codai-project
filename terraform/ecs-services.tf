# CODAI ECS Service Definitions
# Production-ready container orchestration for all backend services

# CBD Database Service
resource "aws_ecs_task_definition" "cbd_database" {
  family                   = "codai-${var.environment}-cbd-database"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 2048
  memory                   = 4096
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn           = aws_iam_role.ecs_task.arn
  
  container_definitions = jsonencode([
    {
      name  = "cbd-database"
      image = "${aws_ecr_repository.codai_services["cbd-database"].repository_url}:latest"
      
      portMappings = [
        {
          containerPort = 4180
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
          value = "4180"
        },
        {
          name  = "DATABASE_URL"
          value = "postgresql://cbd_admin:${random_password.cbd_password.result}@${aws_db_instance.cbd.endpoint}/cbd"
        },
        {
          name  = "REDIS_URL"
          value = "redis://${aws_elasticache_replication_group.codai.configuration_endpoint_address}:6379"
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.codai_services["cbd-database"].name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
      
      healthCheck = {
        command = ["CMD-SHELL", "curl -f http://localhost:4180/health || exit 1"]
        interval = 30
        timeout = 5
        retries = 3
        startPeriod = 60
      }
      
      essential = true
    }
  ])
  
  tags = {
    Name = "codai-${var.environment}-cbd-database"
  }
}

resource "aws_ecs_service" "cbd_database" {
  name            = "cbd-database"
  cluster         = aws_ecs_cluster.codai.id
  task_definition = aws_ecs_task_definition.cbd_database.arn
  desired_count   = 2
  launch_type     = "FARGATE"
  
  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.cbd_database.arn
    container_name   = "cbd-database"
    container_port   = 4180
  }
  
  depends_on = [aws_lb_listener.codai_https]
  
  tags = {
    Name = "codai-${var.environment}-cbd-database-service"
  }
}

# Gateway Service
resource "aws_ecs_task_definition" "gateway_service" {
  family                   = "codai-${var.environment}-gateway-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 1024
  memory                   = 2048
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn           = aws_iam_role.ecs_task.arn
  
  container_definitions = jsonencode([
    {
      name  = "gateway-service"
      image = "${aws_ecr_repository.codai_services["gateway-service"].repository_url}:latest"
      
      portMappings = [
        {
          containerPort = 4003
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
          value = "4003"
        },
        {
          name  = "CBD_URL"
          value = "http://cbd-database.codai-${var.environment}.local:4180"
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.codai_services["gateway-service"].name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
      
      healthCheck = {
        command = ["CMD-SHELL", "curl -f http://localhost:4003/health || exit 1"]
        interval = 30
        timeout = 5
        retries = 3
        startPeriod = 60
      }
      
      essential = true
    }
  ])
  
  tags = {
    Name = "codai-${var.environment}-gateway-service"
  }
}

resource "aws_ecs_service" "gateway_service" {
  name            = "gateway-service"
  cluster         = aws_ecs_cluster.codai.id
  task_definition = aws_ecs_task_definition.gateway_service.arn
  desired_count   = 2
  launch_type     = "FARGATE"
  
  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.gateway_service.arn
    container_name   = "gateway-service"
    container_port   = 4003
  }
  
  depends_on = [aws_lb_listener.codai_https]
  
  tags = {
    Name = "codai-${var.environment}-gateway-service-service"
  }
}

# WebSocket Service
resource "aws_ecs_task_definition" "websocket_service" {
  family                   = "codai-${var.environment}-websocket-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 1024
  memory                   = 2048
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn           = aws_iam_role.ecs_task.arn
  
  container_definitions = jsonencode([
    {
      name  = "websocket-service"
      image = "${aws_ecr_repository.codai_services["websocket-service"].repository_url}:latest"
      
      portMappings = [
        {
          containerPort = 4900
          protocol      = "tcp"
        }
      ]
      
      environment = [
        {
          name  = "NODE_ENV"
          value = var.environment
        },
        {
          name  = "WS_PORT"
          value = "4900"
        },
        {
          name  = "REDIS_URL"
          value = "redis://${aws_elasticache_replication_group.codai.configuration_endpoint_address}:6379"
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.codai_services["websocket-service"].name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
      
      healthCheck = {
        command = ["CMD-SHELL", "curl -f http://localhost:4900/health || exit 1"]
        interval = 30
        timeout = 5
        retries = 3
        startPeriod = 60
      }
      
      essential = true
    }
  ])
  
  tags = {
    Name = "codai-${var.environment}-websocket-service"
  }
}

resource "aws_ecs_service" "websocket_service" {
  name            = "websocket-service"
  cluster         = aws_ecs_cluster.codai.id
  task_definition = aws_ecs_task_definition.websocket_service.arn
  desired_count   = 2
  launch_type     = "FARGATE"
  
  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.websocket_service.arn
    container_name   = "websocket-service"
    container_port   = 4900
  }
  
  depends_on = [aws_lb_listener.codai_https]
  
  tags = {
    Name = "codai-${var.environment}-websocket-service-service"
  }
}

# AI Analytics Service  
resource "aws_ecs_task_definition" "ai_analytics" {
  family                   = "codai-${var.environment}-ai-analytics"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 2048
  memory                   = 4096
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn           = aws_iam_role.ecs_task.arn
  
  container_definitions = jsonencode([
    {
      name  = "ai-analytics"
      image = "${aws_ecr_repository.codai_services["ai-analytics"].repository_url}:latest"
      
      portMappings = [
        {
          containerPort = 4700
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
          value = "4700"
        },
        {
          name  = "CBD_URL"
          value = "http://cbd-database.codai-${var.environment}.local:4180"
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.codai_services["ai-analytics"].name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
      
      healthCheck = {
        command = ["CMD-SHELL", "curl -f http://localhost:4700/health || exit 1"]
        interval = 30
        timeout = 5
        retries = 3
        startPeriod = 60
      }
      
      essential = true
    }
  ])
  
  tags = {
    Name = "codai-${var.environment}-ai-analytics"
  }
}

resource "aws_ecs_service" "ai_analytics" {
  name            = "ai-analytics"
  cluster         = aws_ecs_cluster.codai.id
  task_definition = aws_ecs_task_definition.ai_analytics.arn
  desired_count   = 2
  launch_type     = "FARGATE"
  
  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.ai_analytics.arn
    container_name   = "ai-analytics"
    container_port   = 4700
  }
  
  depends_on = [aws_lb_listener.codai_https]
  
  tags = {
    Name = "codai-${var.environment}-ai-analytics-service"
  }
}

# Collaboration Service
resource "aws_ecs_task_definition" "collaboration_service" {
  family                   = "codai-${var.environment}-collaboration-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 1024
  memory                   = 2048
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn           = aws_iam_role.ecs_task.arn
  
  container_definitions = jsonencode([
    {
      name  = "collaboration-service"
      image = "${aws_ecr_repository.codai_services["collaboration-service"].repository_url}:latest"
      
      portMappings = [
        {
          containerPort = 4600
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
          value = "4600"
        },
        {
          name  = "CBD_URL"
          value = "http://cbd-database.codai-${var.environment}.local:4180"
        },
        {
          name  = "REDIS_URL"
          value = "redis://${aws_elasticache_replication_group.codai.configuration_endpoint_address}:6379"
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.codai_services["collaboration-service"].name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
      
      healthCheck = {
        command = ["CMD-SHELL", "curl -f http://localhost:4600/health || exit 1"]
        interval = 30
        timeout = 5
        retries = 3
        startPeriod = 60
      }
      
      essential = true
    }
  ])
  
  tags = {
    Name = "codai-${var.environment}-collaboration-service"
  }
}

resource "aws_ecs_service" "collaboration_service" {
  name            = "collaboration-service"
  cluster         = aws_ecs_cluster.codai.id
  task_definition = aws_ecs_task_definition.collaboration_service.arn
  desired_count   = 2
  launch_type     = "FARGATE"
  
  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.collaboration_service.arn
    container_name   = "collaboration-service"
    container_port   = 4600
  }
  
  depends_on = [aws_lb_listener.codai_https]
  
  tags = {
    Name = "codai-${var.environment}-collaboration-service-service"
  }
}

# GraphQL Gateway
resource "aws_ecs_task_definition" "graphql_gateway" {
  family                   = "codai-${var.environment}-graphql-gateway"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 1024
  memory                   = 2048
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn           = aws_iam_role.ecs_task.arn
  
  container_definitions = jsonencode([
    {
      name  = "graphql-gateway"
      image = "${aws_ecr_repository.codai_services["graphql-gateway"].repository_url}:latest"
      
      portMappings = [
        {
          containerPort = 4800
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
          value = "4800"
        },
        {
          name  = "CBD_URL"
          value = "http://cbd-database.codai-${var.environment}.local:4180"
        },
        {
          name  = "GATEWAY_URL"
          value = "http://gateway-service.codai-${var.environment}.local:4003"
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.codai_services["graphql-gateway"].name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
      
      healthCheck = {
        command = ["CMD-SHELL", "curl -f http://localhost:4800/health || exit 1"]
        interval = 30
        timeout = 5
        retries = 3
        startPeriod = 60
      }
      
      essential = true
    }
  ])
  
  tags = {
    Name = "codai-${var.environment}-graphql-gateway"
  }
}

resource "aws_ecs_service" "graphql_gateway" {
  name            = "graphql-gateway"
  cluster         = aws_ecs_cluster.codai.id
  task_definition = aws_ecs_task_definition.graphql_gateway.arn
  desired_count   = 2
  launch_type     = "FARGATE"
  
  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.graphql_gateway.arn
    container_name   = "graphql-gateway"
    container_port   = 4800
  }
  
  depends_on = [aws_lb_listener.codai_https]
  
  tags = {
    Name = "codai-${var.environment}-graphql-gateway-service"
  }
}
