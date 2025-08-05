# 🔐 Enhanced ECS Services with Authentication Configuration
# Updated task definitions with domain and security environment variables

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Data sources for authentication parameters
data "aws_ssm_parameter" "service_jwt_secret" {
  name = "/codai/services/jwt-secret"
}

data "aws_ssm_parameter" "inter_service_key" {
  name = "/codai/services/inter-service-key"
}

data "aws_ssm_parameter" "service_discovery" {
  name = "/codai/services/discovery"
}

data "aws_ssm_parameter" "api_permissions" {
  name = "/codai/security/api-permissions"
}

# Enhanced MemorAI MCP Service with Authentication
resource "aws_ecs_task_definition" "memorai_mcp_enhanced" {
  family                   = "codai-memorai-mcp-enhanced-production"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = data.aws_iam_role.ecs_task_execution_role.arn
  task_role_arn           = data.aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "memorai-mcp"
      image     = "${data.aws_ecr_repository.memorai_mcp.repository_url}:latest"
      essential = true
      
      portMappings = [
        {
          containerPort = 8002
          protocol      = "tcp"
        }
      ]
      
      environment = [
        # Basic service configuration
        { name = "NODE_ENV", value = "production" },
        { name = "PORT", value = "8002" },
        { name = "SERVICE_NAME", value = "memorai-mcp" },
        { name = "SERVICE_VERSION", value = "1.0.0" },
        
        # MemorAI specific configuration
        { name = "MEMORAI_API_KEY", value = "memorai-prod-key-2025" },
        { name = "MEMORAI_DEBUG", value = "false" },
        { name = "MEMORAI_LOG_LEVEL", value = "info" },
        { name = "MEMORAI_MCP_PORT", value = "8002" },
        { name = "MEMORAI_CBD_PATH", value = "/app/memorai-cbd-data" },
        
        # Domain configuration
        { name = "API_DOMAIN", value = "api.codai.ro" },
        { name = "ADMIN_DOMAIN", value = "admin.codai.ro" },
        { name = "APPS_DOMAIN", value = "apps.codai.ro" },
        { name = "GATEWAY_DOMAIN", value = "gateway.codai.ro" },
        
        # Authentication configuration
        { name = "JWT_ISSUER", value = "codai-services" },
        { name = "JWT_AUDIENCE", value = "codai-internal" },
        { name = "TOKEN_TTL", value = "3600" },
        { name = "REFRESH_TTL", value = "86400" },
        
        # Security settings
        { name = "REQUIRE_SSL", value = "true" },
        { name = "VALIDATE_HOST", value = "true" },
        { name = "RATE_LIMIT", value = "5000" },
        { name = "TIMEOUT", value = "30" }
      ]
      
      secrets = [
        {
          name      = "SERVICE_JWT_SECRET"
          valueFrom = data.aws_ssm_parameter.service_jwt_secret.arn
        },
        {
          name      = "INTER_SERVICE_KEY"
          valueFrom = data.aws_ssm_parameter.inter_service_key.arn
        }
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
          "awslogs-group"         = data.aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "memorai-mcp-enhanced"
        }
      }
    }
  ])
  
  tags = {
    Name        = "MemorAI MCP Enhanced"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "memorai-mcp"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# Enhanced Gateway Service with Authentication
resource "aws_ecs_task_definition" "gateway_enhanced" {
  family                   = "codai-gateway-enhanced-production"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = data.aws_iam_role.ecs_task_execution_role.arn
  task_role_arn           = data.aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "gateway"
      image     = "${data.aws_ecr_repository.gateway.repository_url}:latest"
      essential = true
      
      portMappings = [
        {
          containerPort = 4000
          protocol      = "tcp"
        }
      ]
      
      environment = [
        # Basic service configuration
        { name = "NODE_ENV", value = "production" },
        { name = "PORT", value = "4000" },
        { name = "SERVICE_NAME", value = "gateway" },
        { name = "SERVICE_VERSION", value = "1.0.0" },
        
        # Domain configuration
        { name = "API_DOMAIN", value = "api.codai.ro" },
        { name = "ADMIN_DOMAIN", value = "admin.codai.ro" },
        { name = "APPS_DOMAIN", value = "apps.codai.ro" },
        { name = "GATEWAY_DOMAIN", value = "gateway.codai.ro" },
        
        # Authentication configuration
        { name = "JWT_ISSUER", value = "codai-services" },
        { name = "JWT_AUDIENCE", value = "codai-internal" },
        { name = "TOKEN_TTL", value = "3600" },
        { name = "REFRESH_TTL", value = "86400" },
        
        # Security settings
        { name = "REQUIRE_SSL", value = "true" },
        { name = "VALIDATE_HOST", value = "true" },
        { name = "RATE_LIMIT", value = "10000" },
        { name = "TIMEOUT", value = "30" },
        
        # Service endpoints
        { name = "MEMORAI_MCP_URL", value = "https://api.codai.ro/memorai" },
        { name = "CBD_URL", value = "https://api.codai.ro/cbd" },
        { name = "WEBSOCKET_URL", value = "https://api.codai.ro/ws" }
      ]
      
      secrets = [
        {
          name      = "SERVICE_JWT_SECRET"
          valueFrom = data.aws_ssm_parameter.service_jwt_secret.arn
        },
        {
          name      = "INTER_SERVICE_KEY"
          valueFrom = data.aws_ssm_parameter.inter_service_key.arn
        }
      ]
      
      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:4000/health || exit 1"]
        interval    = 45
        timeout     = 15
        retries     = 3
        startPeriod = 90
      }
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = data.aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "gateway-enhanced"
        }
      }
    }
  ])
  
  tags = {
    Name        = "Gateway Enhanced"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "gateway"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# Enhanced CBD Service with Authentication
resource "aws_ecs_task_definition" "cbd_enhanced" {
  family                   = "codai-cbd-enhanced-production"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = data.aws_iam_role.ecs_task_execution_role.arn
  task_role_arn           = data.aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "cbd"
      image     = "${data.aws_ecr_repository.cbd.repository_url}:latest"
      essential = true
      
      portMappings = [
        {
          containerPort = 3001
          protocol      = "tcp"
        }
      ]
      
      environment = [
        # Basic service configuration
        { name = "NODE_ENV", value = "production" },
        { name = "PORT", value = "3001" },
        { name = "SERVICE_NAME", value = "cbd" },
        { name = "SERVICE_VERSION", value = "1.0.0" },
        
        # Domain configuration
        { name = "API_DOMAIN", value = "api.codai.ro" },
        { name = "ADMIN_DOMAIN", value = "admin.codai.ro" },
        { name = "APPS_DOMAIN", value = "apps.codai.ro" },
        { name = "CBD_DOMAIN", value = "cbd.codai.ro" },
        
        # Authentication configuration
        { name = "JWT_ISSUER", value = "codai-services" },
        { name = "JWT_AUDIENCE", value = "codai-internal" },
        { name = "TOKEN_TTL", value = "3600" },
        { name = "REFRESH_TTL", value = "86400" },
        
        # Security settings
        { name = "REQUIRE_SSL", value = "true" },
        { name = "VALIDATE_HOST", value = "true" },
        { name = "RATE_LIMIT", value = "2000" },
        { name = "TIMEOUT", value = "30" }
      ]
      
      secrets = [
        {
          name      = "SERVICE_JWT_SECRET"
          valueFrom = data.aws_ssm_parameter.service_jwt_secret.arn
        },
        {
          name      = "INTER_SERVICE_KEY"
          valueFrom = data.aws_ssm_parameter.inter_service_key.arn
        }
      ]
      
      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:3001/health || exit 1"]
        interval    = 45
        timeout     = 15
        retries     = 3
        startPeriod = 90
      }
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = data.aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "cbd-enhanced"
        }
      }
    }
  ])
  
  tags = {
    Name        = "CBD Enhanced"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "cbd"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# Enhanced SSL Proxy Service with Authentication
resource "aws_ecs_task_definition" "ssl_proxy_enhanced" {
  family                   = "codai-ssl-proxy-enhanced-production"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = data.aws_iam_role.ecs_task_execution_role.arn
  task_role_arn           = data.aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "ssl-proxy"
      image     = "${data.aws_ecr_repository.ssl_proxy.repository_url}:latest"
      essential = true
      
      portMappings = [
        {
          containerPort = 443
          protocol      = "tcp"
        }
      ]
      
      environment = [
        # Basic service configuration
        { name = "SERVICE_NAME", value = "ssl-proxy" },
        { name = "SERVICE_VERSION", value = "1.0.0" },
        
        # Domain configuration
        { name = "API_DOMAIN", value = "api.codai.ro" },
        { name = "ADMIN_DOMAIN", value = "admin.codai.ro" },
        { name = "APPS_DOMAIN", value = "apps.codai.ro" },
        { name = "SSL_DOMAIN", value = "ssl.codai.ro" },
        
        # Authentication configuration
        { name = "JWT_ISSUER", value = "codai-services" },
        { name = "JWT_AUDIENCE", value = "codai-internal" },
        { name = "TOKEN_TTL", value = "3600" },
        
        # Security settings
        { name = "REQUIRE_SSL", value = "true" },
        { name = "VALIDATE_HOST", value = "true" },
        { name = "RATE_LIMIT", value = "1000" },
        { name = "TIMEOUT", value = "30" }
      ]
      
      secrets = [
        {
          name      = "SERVICE_JWT_SECRET"
          valueFrom = data.aws_ssm_parameter.service_jwt_secret.arn
        },
        {
          name      = "INTER_SERVICE_KEY"
          valueFrom = data.aws_ssm_parameter.inter_service_key.arn
        }
      ]
      
      healthCheck = {
        command     = ["CMD-SHELL", "curl -k -f https://localhost:443/health || exit 1"]
        interval    = 45
        timeout     = 15
        retries     = 3
        startPeriod = 90
      }
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = data.aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "ssl-proxy-enhanced"
        }
      }
    }
  ])
  
  tags = {
    Name        = "SSL Proxy Enhanced"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "ssl-proxy"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# Enhanced WebSocket Service with Authentication
resource "aws_ecs_task_definition" "websocket_enhanced" {
  family                   = "codai-websocket-enhanced-production"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = data.aws_iam_role.ecs_task_execution_role.arn
  task_role_arn           = data.aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "websocket-service"
      image     = "${data.aws_ecr_repository.websocket_service.repository_url}:latest"
      essential = true
      
      portMappings = [
        {
          containerPort = 8080
          protocol      = "tcp"
        }
      ]
      
      environment = [
        # Basic service configuration
        { name = "NODE_ENV", value = "production" },
        { name = "PORT", value = "8080" },
        { name = "SERVICE_NAME", value = "websocket-service" },
        { name = "SERVICE_VERSION", value = "1.0.0" },
        
        # Domain configuration
        { name = "API_DOMAIN", value = "api.codai.ro" },
        { name = "ADMIN_DOMAIN", value = "admin.codai.ro" },
        { name = "APPS_DOMAIN", value = "apps.codai.ro" },
        { name = "WS_DOMAIN", value = "ws.codai.ro" },
        
        # Authentication configuration
        { name = "JWT_ISSUER", value = "codai-services" },
        { name = "JWT_AUDIENCE", value = "codai-internal" },
        { name = "TOKEN_TTL", value = "3600" },
        { name = "REFRESH_TTL", value = "86400" },
        
        # Security settings
        { name = "REQUIRE_SSL", value = "true" },
        { name = "VALIDATE_HOST", value = "true" },
        { name = "RATE_LIMIT", value = "15000" },
        { name = "TIMEOUT", value = "30" },
        
        # Service endpoints
        { name = "MEMORAI_MCP_URL", value = "https://api.codai.ro/memorai" },
        { name = "CBD_URL", value = "https://api.codai.ro/cbd" }
      ]
      
      secrets = [
        {
          name      = "SERVICE_JWT_SECRET"
          valueFrom = data.aws_ssm_parameter.service_jwt_secret.arn
        },
        {
          name      = "INTER_SERVICE_KEY"
          valueFrom = data.aws_ssm_parameter.inter_service_key.arn
        }
      ]
      
      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:8080/health || exit 1"]
        interval    = 45
        timeout     = 15
        retries     = 3
        startPeriod = 90
      }
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = data.aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "websocket-enhanced"
        }
      }
    }
  ])
  
  tags = {
    Name        = "WebSocket Enhanced"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "websocket-service"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# Data sources
data "aws_iam_role" "ecs_task_execution_role" {
  name = "codai-ecs-task-execution-role"
}

data "aws_iam_role" "ecs_task_role" {
  name = "codai-ecs-task-role"
}

data "aws_cloudwatch_log_group" "ecs" {
  name = "/aws/ecs/codai-cluster"
}

data "aws_ecr_repository" "memorai_mcp" {
  name = "codai-memorai-mcp"
}

data "aws_ecr_repository" "gateway" {
  name = "codai-gateway"
}

data "aws_ecr_repository" "cbd" {
  name = "codai-cbd"
}

data "aws_ecr_repository" "ssl_proxy" {
  name = "codai-ssl-proxy"
}

data "aws_ecr_repository" "websocket_service" {
  name = "codai-websocket-service"
}

# Outputs
output "enhanced_task_definitions" {
  value = {
    memorai_mcp = aws_ecs_task_definition.memorai_mcp_enhanced.arn
    gateway     = aws_ecs_task_definition.gateway_enhanced.arn
    cbd         = aws_ecs_task_definition.cbd_enhanced.arn
    ssl_proxy   = aws_ecs_task_definition.ssl_proxy_enhanced.arn
    websocket   = aws_ecs_task_definition.websocket_enhanced.arn
  }
  description = "Enhanced ECS task definition ARNs with authentication"
}
