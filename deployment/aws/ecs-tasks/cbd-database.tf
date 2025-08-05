# CBD Database Service - ECS Task Definition

resource "aws_ecs_task_definition" "cbd_database" {
  family                   = "${var.project_name}-cbd-database-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu = "512"  # 2 vCPU
  memory = "1024"  # 4GB
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name  = "cbd-database"
      image = "${aws_ecr_repository.services["cbd-database"].repository_url}:latest"
      
      essential = true
      
      portMappings = [
        {
          containerPort = 4180
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
          value = "4180"
        },
        {
          name  = "CBD_DATA_PATH"
          value = "/app/cbd-data"
        }
      ]
      
      healthCheck = {
        command = ["CMD-SHELL", "curl -f http://localhost:4180/health || exit 1"]
        interval = 30
        timeout = 10
        retries = 3
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
      
      mountPoints = [
        {
          sourceVolume  = "cbd-data"
          containerPath = "/app/cbd-data"
          readOnly      = false
        }
      ]
    }
  ])
  
  volume {
    name = "cbd-data"
    
    efs_volume_configuration {
      file_system_id = aws_efs_file_system.cbd_data.id
      root_directory = "/"
    }
  }

  tags = {
    Name    = "${var.project_name}-cbd-database-task-${var.environment}"
    Service = "cbd-database"
  }
}

# EFS File System for CBD data persistence
resource "aws_efs_file_system" "cbd_data" {
  creation_token = "${var.project_name}-cbd-data-${var.environment}"
  
  performance_mode = "generalPurpose"
  throughput_mode  = "provisioned"
  provisioned_throughput_in_mibps = 100

  tags = {
    Name = "${var.project_name}-cbd-data-${var.environment}"
  }
}

resource "aws_efs_mount_target" "cbd_data" {
  count = length(aws_subnet.private)
  
  file_system_id  = aws_efs_file_system.cbd_data.id
  subnet_id       = aws_subnet.private[count.index].id
  security_groups = [aws_security_group.efs.id]
}

resource "aws_security_group" "efs" {
  name        = "${var.project_name}-efs-sg-${var.environment}"
  description = "Security group for EFS"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 2049
    to_port         = 2049
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-efs-sg-${var.environment}"
  }
}

# ECS Service for CBD Database
resource "aws_ecs_service" "cbd_database" {
  name            = "${var.project_name}-cbd-database-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.cbd_database.arn
  desired_count   = 2
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

# Target Group for CBD Database
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

# Load Balancer Listener Rule for CBD Database
resource "aws_lb_listener_rule" "cbd_database" {
  listener_arn = aws_lb_listener.main.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.cbd_database.arn
  }

  condition {
    path_pattern {
      values = ["/cbd/*", "/health", "/stats", "/document/*", "/vector/*", "/graph/*", "/kv/*", "/timeseries/*", "/files/*"]
    }
  }

  tags = {
    Name    = "${var.project_name}-cbd-rule-${var.environment}"
    Service = "cbd-database"
  }
}

