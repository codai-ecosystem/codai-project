# WebSocket Service - ECS Task Definition

resource "aws_ecs_task_definition" "websocket" {
  family                   = "${var.project_name}-websocket-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "1024"  # 1 vCPU
  memory                   = "2048"  # 2GB
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name  = "websocket-service"
      image = "${aws_ecr_repository.services["websocket-service"].repository_url}:latest"
      
      essential = true
      
      portMappings = [
        {
          containerPort = 4900
          protocol      = "tcp"
        }
      ]
      
      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "WS_PORT"
          value = "4900"
        },
        {
          name  = "PORT"
          value = "4900"
        },
        {
          name  = "UV_THREADPOOL_SIZE"
          value = "16"
        }
      ]
      
      healthCheck = {
        command = ["CMD-SHELL", "curl -f http://localhost:4900/health || exit 1"]
        interval = 30
        timeout = 10
        retries = 3
        startPeriod = 30
      }
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "websocket"
        }
      }
    }
  ])

  tags = {
    Name    = "${var.project_name}-websocket-task-${var.environment}"
    Service = "websocket"
  }
}

# ECS Service for WebSocket
resource "aws_ecs_service" "websocket" {
  name            = "${var.project_name}-websocket-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.websocket.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs_tasks.id]
    subnets          = aws_subnet.private[*].id
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.websocket.arn
    container_name   = "websocket-service"
    container_port   = 4900
  }

  depends_on = [aws_lb_listener.main]

  tags = {
    Name    = "${var.project_name}-websocket-service-${var.environment}"
    Service = "websocket"
  }
}

# Target Group for WebSocket
resource "aws_lb_target_group" "websocket" {
  name        = "${var.project_name}-ws-tg-${var.environment}"
  port        = 4900
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 10
    unhealthy_threshold = 3
  }

  # WebSocket-specific configuration
  stickiness {
    enabled = true
    type    = "lb_cookie"
    cookie_duration = 86400  # 24 hours for WebSocket session affinity
  }

  tags = {
    Name    = "${var.project_name}-ws-tg-${var.environment}"
    Service = "websocket"
  }
}

# Load Balancer Listener Rule for WebSocket
resource "aws_lb_listener_rule" "websocket" {
  listener_arn = aws_lb_listener.main.arn
  priority     = 300

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.websocket.arn
  }

  condition {
    path_pattern {
      values = ["/ws/*", "/websocket/*", "/socket/*"]
    }
  }

  tags = {
    Name    = "${var.project_name}-websocket-rule-${var.environment}"
    Service = "websocket"
  }
}
