# ECS Task Definitions and Services

# IAM Role for ECS Tasks
resource "aws_iam_role" "ecs_task" {
  name = "memorai-ecs-task-${var.environment}"

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

resource "aws_iam_role_policy" "ecs_task" {
  name = "memorai-ecs-task-policy-${var.environment}"
  role = aws_iam_role.ecs_task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage"
        ]
        Resource = "*"
      }
    ]
  })
}

# ECS Task Definition for API
resource "aws_ecs_task_definition" "api" {
  family                   = "memorai-api-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn           = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "memorai-api"
      image     = "${aws_ecr_repository.api.repository_url}:latest"
      essential = true

      portMappings = [
        {
          containerPort = 4006
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
          value = "4006"
        },
        {
          name  = "CBD_BASE_URL"
          value = "http://cbd-database:4180"
        },
        {
          name  = "MEMORAI_MCP_URL"
          value = "http://memorai-mcp:4950"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.api.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:4006/api/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = {
    Name = "memorai-api-task-${var.environment}"
  }
}

# ECS Task Definition for MCP Server
resource "aws_ecs_task_definition" "mcp" {
  family                   = "memorai-mcp-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn           = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "memorai-mcp"
      image     = "${aws_ecr_repository.mcp.repository_url}:latest"
      essential = true

      portMappings = [
        {
          containerPort = 4950
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
          value = "4950"
        },
        {
          name  = "MEMORAI_MCP_PORT"
          value = "4950"
        },
        {
          name  = "CBD_BASE_URL"
          value = "http://cbd-database:4180"
        },
        {
          name  = "MEMORAI_API_KEY"
          value = "memorai-prod-key-2025"
        },
        {
          name  = "AZURE_OPENAI_ENDPOINT"
          value = "https://swedencentral.api.cognitive.microsoft.com/"
        },
        {
          name  = "AZURE_OPENAI_API_KEY"
          value = "8f9d3fd033c04f5ab6b5886c15f16a2c"
        },
        {
          name  = "AZURE_OPENAI_DEPLOYMENT_NAME"
          value = "text-embedding-3-large"
        },
        {
          name  = "AZURE_OPENAI_API_VERSION"
          value = "2024-02-01"
        },
        {
          name  = "ENABLE_VECTOR_SEARCH"
          value = "true"
        },
        {
          name  = "ENABLE_HYBRID_SEARCH"
          value = "true"
        },
        {
          name  = "ENABLE_RBAC"
          value = "true"
        },
        {
          name  = "ENABLE_ANALYTICS"
          value = "true"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.mcp.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:4950/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = {
    Name = "memorai-mcp-task-${var.environment}"
  }
}

# ECS Service for API
resource "aws_ecs_service" "api" {
  name            = "memorai-api-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "memorai-api"
    container_port   = 4006
  }

  depends_on = [aws_lb_listener.http]

  tags = {
    Name = "memorai-api-service-${var.environment}"
  }
}

# ECS Service for MCP Server
resource "aws_ecs_service" "mcp" {
  name            = "memorai-mcp-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.mcp.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.mcp.arn
    container_name   = "memorai-mcp"
    container_port   = 4950
  }

  depends_on = [aws_lb_listener.http]

  tags = {
    Name = "memorai-mcp-service-${var.environment}"
  }
}

# Service Discovery for internal communication
resource "aws_service_discovery_private_dns_namespace" "internal" {
  name        = "memorai.internal"
  description = "Internal service discovery for MemorAI"
  vpc         = aws_vpc.main.id

  tags = {
    Name = "memorai-sd-namespace-${var.environment}"
  }
}

resource "aws_service_discovery_service" "api" {
  name = "api"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.internal.id

    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  tags = {
    Name = "memorai-api-sd-${var.environment}"
  }
}

resource "aws_service_discovery_service" "mcp" {
  name = "mcp"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.internal.id

    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  tags = {
    Name = "memorai-mcp-sd-${var.environment}"
  }
}

# Additional outputs
output "ecs_api_service_name" {
  description = "ECS API Service Name"
  value       = aws_ecs_service.api.name
}

output "ecs_mcp_service_name" {
  description = "ECS MCP Service Name"
  value       = aws_ecs_service.mcp.name
}

output "service_discovery_namespace" {
  description = "Service Discovery Namespace"
  value       = aws_service_discovery_private_dns_namespace.internal.name
}
