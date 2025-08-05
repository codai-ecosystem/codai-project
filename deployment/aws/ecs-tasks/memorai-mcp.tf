# MemorAI MCP Service - ECS Task Definition

resource "aws_ecs_task_definition" "memorai_mcp" {
  family                   = "${var.project_name}-memorai-mcp-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu = "256"  # 2 vCPU
  memory = "512"  # 8GB for vector operations
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name  = "memorai-mcp"
      image = "${aws_ecr_repository.services["memorai-mcp"].repository_url}:latest"
      
      essential = true
      
      portMappings = [
        {
          containerPort = 8002
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
          value = "8002"
        },
        {
          name  = "MEMORAI_API_KEY"
          value = "memorai-prod-key-2025"
        },
        {
          name  = "MEMORAI_DEBUG"
          value = "false"
        },
        {
          name  = "MEMORAI_LOG_LEVEL"
          value = "info"
        },
        {
          name  = "MEMORAI_CBD_PATH"
          value = "/app/memorai-cbd-data"
        },
        {
          name  = "NODE_OPTIONS"
          value = "--max-old-space-size=8192"
        }
      ]
      
      healthCheck = {
        command = ["CMD-SHELL", "curl -f http://localhost:8002/health || exit 1"]
        interval = 45
        timeout = 15
        retries = 3
        startPeriod = 90
      }
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "memorai-mcp"
        }
      }
      
      mountPoints = [
        {
          sourceVolume  = "memorai-data"
          containerPath = "/app/memorai-cbd-data"
          readOnly      = false
        }
      ]
    }
  ])
  
  volume {
    name = "memorai-data"
    
    efs_volume_configuration {
      file_system_id = aws_efs_file_system.memorai_data.id
      root_directory = "/"
    }
  }

  tags = {
    Name    = "${var.project_name}-memorai-mcp-task-${var.environment}"
    Service = "memorai-mcp"
  }
}

# EFS File System for MemorAI data persistence
resource "aws_efs_file_system" "memorai_data" {
  creation_token = "${var.project_name}-memorai-data-${var.environment}"
  
  performance_mode = "generalPurpose"
  throughput_mode  = "provisioned"
  provisioned_throughput_in_mibps = 200

  tags = {
    Name = "${var.project_name}-memorai-data-${var.environment}"
  }
}

resource "aws_efs_mount_target" "memorai_data" {
  count = length(aws_subnet.private)
  
  file_system_id  = aws_efs_file_system.memorai_data.id
  subnet_id       = aws_subnet.private[count.index].id
  security_groups = [aws_security_group.efs.id]
}

# ECS Service for MemorAI MCP
resource "aws_ecs_service" "memorai_mcp" {
  name            = "${var.project_name}-memorai-mcp-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.memorai_mcp.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs_tasks.id]
    subnets          = aws_subnet.private[*].id
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.memorai_mcp.arn
    container_name   = "memorai-mcp"
    container_port   = 8002
  }

  depends_on = [aws_lb_listener.main]

  tags = {
    Name    = "${var.project_name}-memorai-mcp-service-${var.environment}"
    Service = "memorai-mcp"
  }
}

# Target Group for MemorAI MCP
resource "aws_lb_target_group" "memorai_mcp" {
  name        = "${var.project_name}-mem-tg-${var.environment}"
  port        = 8002
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 45
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 15
    unhealthy_threshold = 3
  }

  tags = {
    Name    = "${var.project_name}-mem-tg-${var.environment}"
    Service = "memorai-mcp"
  }
}

# Load Balancer Listener Rule for MemorAI MCP
resource "aws_lb_listener_rule" "memorai_mcp" {
  listener_arn = aws_lb_listener.main.arn
  priority     = 200

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.memorai_mcp.arn
  }

  condition {
    path_pattern {
      values = ["/memorai/*", "/mcp/*", "/memory/*"]
    }
  }

  tags = {
    Name    = "${var.project_name}-memorai-rule-${var.environment}"
    Service = "memorai-mcp"
  }
}

