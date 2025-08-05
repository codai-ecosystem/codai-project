# ECS Services and Task Definitions for CODAI Backend Services

# MemorAI MCP Service
resource "aws_ecs_task_definition" "memorai_mcp" {
  family                   = "${var.project_name}-memorai-mcp-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "memorai-mcp"
      image     = "${aws_ecr_repository.services["memorai-mcp"].repository_url}:latest"
      essential = true
      
      portMappings = [
        {
          containerPort = 8002
          protocol      = "tcp"
        }
      ]
      
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "PORT", value = "8002" },
        { name = "MEMORAI_API_KEY", value = "memorai-prod-key-2025" },
        { name = "MEMORAI_DEBUG", value = "false" },
        { name = "MEMORAI_LOG_LEVEL", value = "info" }
      ]
      
      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:8002/health || exit 1"]
        interval    = 45
        timeout     = 15
        retries     = 3
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
    }
  ])

  tags = {
    Name    = "${var.project_name}-memorai-mcp-task-${var.environment}"
    Service = "memorai-mcp"
  }
}

# CBD Database Service
resource "aws_ecs_task_definition" "cbd_database" {
  family                   = "${var.project_name}-cbd-database-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "cbd-database"
      image     = "${aws_ecr_repository.services["cbd-database"].repository_url}:latest"
      essential = true
      
      portMappings = [
        {
          containerPort = 4180
          protocol      = "tcp"
        }
      ]
      
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "PORT", value = "4180" }
      ]
      
      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:4180/health || exit 1"]
        interval    = 30
        timeout     = 10
        retries     = 3
        startPeriod = 60
      }
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "cbd-database"
        }
      }
    }
  ])

  tags = {
    Name    = "${var.project_name}-cbd-database-task-${var.environment}"
    Service = "cbd-database"
  }
}

# Gateway Service
resource "aws_ecs_task_definition" "gateway" {
  family                   = "${var.project_name}-gateway-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "gateway"
      image     = "${aws_ecr_repository.services["gateway"].repository_url}:latest"
      essential = true
      
      portMappings = [
        {
          containerPort = 4003
          protocol      = "tcp"
        }
      ]
      
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "GATEWAY_PORT", value = "4003" }
      ]
      
      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:4003/health || exit 1"]
        interval    = 30
        timeout     = 10
        retries     = 3
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

# WebSocket Service
resource "aws_ecs_task_definition" "websocket_service" {
  family                   = "${var.project_name}-websocket-service-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "websocket-service"
      image     = "${aws_ecr_repository.services["websocket-service"].repository_url}:latest"
      essential = true
      
      portMappings = [
        {
          containerPort = 4900
          protocol      = "tcp"
        }
      ]
      
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "PORT", value = "4900" }
      ]
      
      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:4900/health || exit 1"]
        interval    = 30
        timeout     = 10
        retries     = 3
        startPeriod = 30
      }
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "websocket-service"
        }
      }
    }
  ])

  tags = {
    Name    = "${var.project_name}-websocket-service-task-${var.environment}"
    Service = "websocket-service"
  }
}

# SSL Proxy Service
resource "aws_ecs_task_definition" "ssl_proxy" {
  family                   = "${var.project_name}-ssl-proxy-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "ssl-proxy"
      image     = "${aws_ecr_repository.services["ssl-proxy"].repository_url}:latest"
      essential = true
      
      portMappings = [
        {
          containerPort = 80
          protocol      = "tcp"
        },
        {
          containerPort = 443
          protocol      = "tcp"
        }
      ]
      
      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:80/nginx-health || exit 1"]
        interval    = 30
        timeout     = 10
        retries     = 3
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
    }
  ])

  tags = {
    Name    = "${var.project_name}-ssl-proxy-task-${var.environment}"
    Service = "ssl-proxy"
  }
}

# ECS Services
resource "aws_ecs_service" "memorai_mcp" {
  name            = "${var.project_name}-memorai-mcp-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.memorai_mcp.arn
  desired_count   = 1
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

resource "aws_ecs_service" "cbd_database" {
  name            = "${var.project_name}-cbd-database-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.cbd_database.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs_tasks.id]
    subnets          = aws_subnet.private[*].id
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.cbd_database.arn
    container_name   = "cbd-database"
    container_port   = 4180
  }

  depends_on = [aws_lb_listener.main]

  tags = {
    Name    = "${var.project_name}-cbd-database-service-${var.environment}"
    Service = "cbd-database"
  }
}

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
    container_port   = 4003
  }

  depends_on = [aws_lb_listener.main]

  tags = {
    Name    = "${var.project_name}-gateway-service-${var.environment}"
    Service = "gateway"
  }
}

resource "aws_ecs_service" "websocket_service" {
  name            = "${var.project_name}-websocket-service-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.websocket_service.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs_tasks.id]
    subnets          = aws_subnet.private[*].id
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.websocket_service.arn
    container_name   = "websocket-service"
    container_port   = 4900
  }

  depends_on = [aws_lb_listener.main]

  tags = {
    Name    = "${var.project_name}-websocket-service-service-${var.environment}"
    Service = "websocket-service"
  }
}

resource "aws_ecs_service" "ssl_proxy" {
  name            = "${var.project_name}-ssl-proxy-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.ssl_proxy.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs_tasks.id]
    subnets          = aws_subnet.private[*].id
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.ssl_proxy.arn
    container_name   = "ssl-proxy"
    container_port   = 80
  }

  depends_on = [aws_lb_listener.main]

  tags = {
    Name    = "${var.project_name}-ssl-proxy-service-${var.environment}"
    Service = "ssl-proxy"
  }
}

# Target Groups
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

resource "aws_lb_target_group" "cbd_database" {
  name        = "${var.project_name}-cbd-tg-${var.environment}"
  port        = 4180
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
    Name    = "${var.project_name}-cbd-tg-${var.environment}"
    Service = "cbd-database"
  }
}

resource "aws_lb_target_group" "gateway" {
  name        = "${var.project_name}-gw-tg-${var.environment}"
  port        = 4003
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

resource "aws_lb_target_group" "websocket_service" {
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

  tags = {
    Name    = "${var.project_name}-ws-tg-${var.environment}"
    Service = "websocket-service"
  }
}

resource "aws_lb_target_group" "ssl_proxy" {
  name        = "${var.project_name}-ssl-tg-${var.environment}"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/nginx-health"
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

# Load Balancer Listener Rules
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

resource "aws_lb_listener_rule" "cbd_database" {
  listener_arn = aws_lb_listener.main.arn
  priority     = 300

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.cbd_database.arn
  }

  condition {
    path_pattern {
      values = ["/cbd/*", "/database/*", "/data/*"]
    }
  }

  tags = {
    Name    = "${var.project_name}-cbd-rule-${var.environment}"
    Service = "cbd-database"
  }
}

resource "aws_lb_listener_rule" "gateway" {
  listener_arn = aws_lb_listener.main.arn
  priority     = 100

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

resource "aws_lb_listener_rule" "websocket_service" {
  listener_arn = aws_lb_listener.main.arn
  priority     = 400

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.websocket_service.arn
  }

  condition {
    path_pattern {
      values = ["/ws/*", "/websocket/*", "/socket/*"]
    }
  }

  tags = {
    Name    = "${var.project_name}-websocket-rule-${var.environment}"
    Service = "websocket-service"
  }
}

resource "aws_lb_listener_rule" "ssl_proxy" {
  listener_arn = aws_lb_listener.main.arn
  priority     = 500

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.ssl_proxy.arn
  }

  condition {
    path_pattern {
      values = ["/ssl/*", "/proxy/*"]
    }
  }

  tags = {
    Name    = "${var.project_name}-ssl-rule-${var.environment}"
    Service = "ssl-proxy"
  }
}
