# Gateway Service - ECS Task Definition

resource "aws_ecs_task_definition" "gateway" {
  family                   = "${var.project_name}-gateway-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "1024"  # 1 vCPU
  memory                   = "2048"  # 2GB
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name  = "gateway"
      image = "${aws_ecr_repository.services["gateway"].repository_url}:latest"
      
      essential = true
      
      portMappings = [
        {
          containerPort = 3000
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
          name  = "CBD_DATABASE_URL"
          value = "http://cbd-database.${var.project_name}-${var.environment}.local:4180"
        }
      ]
      
      healthCheck = {
        command = ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"]
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
          "awslogs-stream-prefix" = "gateway"
        }
      }
    }
  ])

  tags = {
    Name    = "${var.project_name}-gateway-task-${var.environment}"
    Service = "gateway"
  }
}

# ECS Service for Gateway
resource "aws_ecs_service" "gateway" {
  name            = "${var.project_name}-gateway-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.gateway.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs_tasks.id]
    subnets          = aws_subnet.private[*].id
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.gateway.arn
    container_name   = "gateway"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.main]

  tags = {
    Name    = "${var.project_name}-gateway-service-${var.environment}"
    Service = "gateway"
  }
}

# Target Group for Gateway
resource "aws_lb_target_group" "gateway" {
  name        = "${var.project_name}-gw-tg-${var.environment}"
  port        = 3000
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

  tags = {
    Name    = "${var.project_name}-gw-tg-${var.environment}"
    Service = "gateway"
  }
}

# Load Balancer Listener Rule for Gateway (default)
resource "aws_lb_listener_rule" "gateway" {
  listener_arn = aws_lb_listener.main.arn
  priority     = 50

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.gateway.arn
  }

  condition {
    path_pattern {
      values = ["/api/*", "/gateway/*"]
    }
  }

  tags = {
    Name    = "${var.project_name}-gateway-rule-${var.environment}"
    Service = "gateway"
  }
}
