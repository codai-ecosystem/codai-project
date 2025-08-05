# SSL Proxy Service - ECS Task Definition

resource "aws_ecs_task_definition" "ssl_proxy" {
  family                   = "${var.project_name}-ssl-proxy-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu = "128"   # 0.5 vCPU
  memory = "256"  # 1GB
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name  = "ssl-proxy"
      image = "${aws_ecr_repository.services["ssl-proxy"].repository_url}:latest"
      
      essential = true
      
      portMappings = [
        {
          containerPort = 8080
          protocol      = "tcp"
        },
        {
          containerPort = 80
          protocol      = "tcp"
        },
        {
          containerPort = 443
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
          value = "8080"
        },
        {
          name  = "SSL_PROXY_PORT"
          value = "8080"
        }
      ]
      
      healthCheck = {
        command = ["CMD-SHELL", "curl -f http://localhost:8080/ssl-proxy-health || exit 1"]
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
          "awslogs-stream-prefix" = "ssl-proxy"
        }
      }
      
      mountPoints = [
        {
          sourceVolume  = "ssl-challenges"
          containerPath = "/app/ssl-challenges"
          readOnly      = false
        },
        {
          sourceVolume  = "letsencrypt"
          containerPath = "/app/letsencrypt"
          readOnly      = false
        }
      ]
    }
  ])
  
  volume {
    name = "ssl-challenges"
    
    efs_volume_configuration {
      file_system_id = aws_efs_file_system.ssl_data.id
      root_directory = "/challenges"
    }
  }
  
  volume {
    name = "letsencrypt"
    
    efs_volume_configuration {
      file_system_id = aws_efs_file_system.ssl_data.id
      root_directory = "/letsencrypt"
    }
  }

  tags = {
    Name    = "${var.project_name}-ssl-proxy-task-${var.environment}"
    Service = "ssl-proxy"
  }
}

# EFS File System for SSL data persistence
resource "aws_efs_file_system" "ssl_data" {
  creation_token = "${var.project_name}-ssl-data-${var.environment}"
  
  performance_mode = "generalPurpose"
  throughput_mode  = "burstable"

  tags = {
    Name = "${var.project_name}-ssl-data-${var.environment}"
  }
}

resource "aws_efs_mount_target" "ssl_data" {
  count = length(aws_subnet.private)
  
  file_system_id  = aws_efs_file_system.ssl_data.id
  subnet_id       = aws_subnet.private[count.index].id
  security_groups = [aws_security_group.efs.id]
}

# ECS Service for SSL Proxy
resource "aws_ecs_service" "ssl_proxy" {
  name            = "${var.project_name}-ssl-proxy-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.ssl_proxy.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs_tasks.id]
    subnets          = aws_subnet.private[*].id
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.ssl_proxy.arn
    container_name   = "ssl-proxy"
    container_port   = 8080
  }

  depends_on = [aws_lb_listener.main]

  tags = {
    Name    = "${var.project_name}-ssl-proxy-service-${var.environment}"
    Service = "ssl-proxy"
  }
}

# Target Group for SSL Proxy
resource "aws_lb_target_group" "ssl_proxy" {
  name        = "${var.project_name}-ssl-tg-${var.environment}"
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/ssl-proxy-health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 10
    unhealthy_threshold = 3
  }

  tags = {
    Name    = "${var.project_name}-ssl-tg-${var.environment}"
    Service = "ssl-proxy"
  }
}

# Load Balancer Listener Rule for SSL Proxy
resource "aws_lb_listener_rule" "ssl_proxy" {
  listener_arn = aws_lb_listener.main.arn
  priority     = 400

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.ssl_proxy.arn
  }

  condition {
    path_pattern {
      values = ["/.well-known/*", "/ssl-proxy-health", "/add-challenge/*"]
    }
  }

  tags = {
    Name    = "${var.project_name}-ssl-rule-${var.environment}"
    Service = "ssl-proxy"
  }
}

