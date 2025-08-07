# ECS Task Definitions and Services

# MemorAI API Task Definition
resource "aws_ecs_task_definition" "memorai_api" {
  family                   = "memorai-api"
  network_mode            = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                     = 1024
  memory                  = 2048
  execution_role_arn      = aws_iam_role.ecs_execution_role.arn
  task_role_arn          = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "memorai-api"
      image     = "${aws_ecr_repository.memorai_api_repo.repository_url}:latest"
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
          name  = "MEMORAI_API_BASE_URL"
          value = "https://${var.domain_name}"
        },
        {
          name  = "CBD_BASE_URL"
          value = "http://memorai-cbd:4180"
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.memorai_api.name
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
}

# MemorAI MCP Server Task Definition
resource "aws_ecs_task_definition" "memorai_mcp" {
  family                   = "memorai-mcp"
  network_mode            = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                     = 512
  memory                  = 1024
  execution_role_arn      = aws_iam_role.ecs_execution_role.arn
  task_role_arn          = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "memorai-mcp"
      image     = "${aws_ecr_repository.memorai_mcp_repo.repository_url}:latest"
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
          name  = "MEMORAI_MCP_PORT"
          value = "4950"
        },
        {
          name  = "PORT"
          value = "4950"
        },
        {
          name  = "CBD_BASE_URL"
          value = "http://memorai-cbd:4180"
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
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.memorai_mcp.name
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
}

# ECS Services
resource "aws_ecs_service" "memorai_api" {
  name            = "memorai-api"
  cluster         = aws_ecs_cluster.memorai_cluster.id
  task_definition = aws_ecs_task_definition.memorai_api.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.memorai_private_subnets[*].id
    security_groups  = [aws_security_group.memorai_ecs_sg.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.memorai_api_tg.arn
    container_name   = "memorai-api"
    container_port   = 4006
  }

  depends_on = [aws_lb.memorai_alb]
}

resource "aws_ecs_service" "memorai_mcp" {
  name            = "memorai-mcp"
  cluster         = aws_ecs_cluster.memorai_cluster.id
  task_definition = aws_ecs_task_definition.memorai_mcp.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.memorai_private_subnets[*].id
    security_groups  = [aws_security_group.memorai_ecs_sg.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.memorai_mcp_tg.arn
    container_name   = "memorai-mcp"
    container_port   = 4950
  }

  depends_on = [aws_lb.memorai_alb]
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "memorai_api" {
  name              = "/ecs/memorai-api"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "memorai_mcp" {
  name              = "/ecs/memorai-mcp"
  retention_in_days = 7
}
