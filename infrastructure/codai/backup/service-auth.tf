# 🔐 CODAI Service-to-Service Authentication
# JWT tokens and secure inter-service communication

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }
}

# Service authentication secrets
resource "random_password" "service_jwt_secret" {
  length  = 64
  special = true
}

resource "random_password" "inter_service_key" {
  length  = 32
  special = true
}

# Store service secrets in SSM
resource "aws_ssm_parameter" "service_jwt_secret" {
  name  = "/codai/services/jwt-secret"
  type  = "SecureString"
  value = random_password.service_jwt_secret.result
  
  tags = {
    Name        = "Service JWT Secret"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "security"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

resource "aws_ssm_parameter" "inter_service_key" {
  name  = "/codai/services/inter-service-key"
  type  = "SecureString"
  value = random_password.inter_service_key.result
  
  tags = {
    Name        = "Inter-Service Key"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "security"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# Service discovery configuration
resource "aws_ssm_parameter" "service_discovery" {
  name = "/codai/services/discovery"
  type = "String"
  value = jsonencode({
    services = {
      gateway = {
        name        = "gateway"
        port        = 4000
        health_path = "/health"
        auth_required = false
        endpoints = [
          "https://api.codai.ro/gateway",
          "https://gateway.codai.ro"
        ]
      }
      memorai_mcp = {
        name        = "memorai-mcp"
        port        = 4950
        health_path = "/health"
        auth_required = true
        endpoints = [
          "https://api.codai.ro/memorai",
          "https://memorai.codai.ro"
        ]
      }
      cbd = {
        name        = "cbd"
        port        = 3001
        health_path = "/health"
        auth_required = true
        endpoints = [
          "https://api.codai.ro/cbd",
          "https://cbd.codai.ro"
        ]
      }
      ssl_proxy = {
        name        = "ssl-proxy"
        port        = 443
        health_path = "/health"
        auth_required = true
        endpoints = [
          "https://api.codai.ro/ssl",
          "https://ssl.codai.ro"
        ]
      }
      websocket_service = {
        name        = "websocket-service"
        port        = 8080
        health_path = "/health"
        auth_required = true
        endpoints = [
          "https://api.codai.ro/ws",
          "https://ws.codai.ro"
        ]
      }
    }
    auth = {
      jwt_issuer     = "codai-services"
      jwt_audience   = "codai-internal"
      token_ttl      = 3600
      refresh_ttl    = 86400
    }
    security = {
      require_ssl    = true
      validate_host  = true
      rate_limit     = 1000
      timeout        = 30
    }
  })
  
  tags = {
    Name        = "Service Discovery Config"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "configuration"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# API permissions configuration
resource "aws_ssm_parameter" "api_permissions" {
  name = "/codai/security/api-permissions"
  type = "String"
  value = jsonencode({
    roles = {
      master_admin = {
        permissions = ["*"]
        description = "Full system access"
        projects    = ["*"]
      }
      project_admin = {
        permissions = [
          "project:read",
          "project:write",
          "project:delete",
          "api_key:create",
          "api_key:read",
          "api_key:update",
          "api_key:delete",
          "user:invite",
          "user:remove"
        ]
        description = "Project administration"
        projects    = ["owned"]
      }
      developer = {
        permissions = [
          "project:read",
          "api_key:read",
          "service:gateway",
          "service:memorai",
          "service:cbd"
        ]
        description = "Development access"
        projects    = ["member"]
      }
      viewer = {
        permissions = [
          "project:read",
          "api_key:read"
        ]
        description = "Read-only access"
        projects    = ["member"]
      }
      service = {
        permissions = [
          "service:internal",
          "health:check",
          "metrics:read"
        ]
        description = "Service-to-service communication"
        projects    = ["internal"]
      }
    }
    
    service_permissions = {
      gateway = {
        can_access = ["memorai_mcp", "cbd", "websocket_service"]
        can_call   = ["health", "status", "metrics"]
        rate_limit = 10000
      }
      memorai_mcp = {
        can_access = ["cbd", "ssl_proxy"]
        can_call   = ["health", "data", "storage"]
        rate_limit = 5000
      }
      cbd = {
        can_access = ["ssl_proxy"]
        can_call   = ["health", "backup"]
        rate_limit = 2000
      }
      ssl_proxy = {
        can_access = ["*"]
        can_call   = ["health"]
        rate_limit = 1000
      }
      websocket_service = {
        can_access = ["memorai_mcp", "cbd"]
        can_call   = ["health", "notify", "broadcast"]
        rate_limit = 15000
      }
    }
  })
  
  tags = {
    Name        = "API Permissions Config"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "security"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# Master admin user configuration
resource "aws_ssm_parameter" "master_admin_config" {
  name = "/codai/security/master-admin"
  type = "SecureString"
  value = jsonencode({
    user_id    = "codai-master-admin"
    email      = "admin@codai.ro"
    password   = random_password.master_admin_password.result
    project_id = "codai-ecosystem-admin"
    role       = "master_admin"
    created_at = timestamp()
    api_keys = {
      master_key = {
        key_id      = "codai-master-key-${random_id.master_key_suffix.hex}"
        description = "Master administrative access"
        permissions = ["*"]
        expires_at  = null
      }
    }
  })
  
  tags = {
    Name        = "Master Admin Config"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "security"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# Generate master admin password
resource "random_password" "master_admin_password" {
  length  = 32
  special = true
}

# Generate unique suffix for master key
resource "random_id" "master_key_suffix" {
  byte_length = 8
}

# Lambda function for service authentication
resource "aws_lambda_function" "service_auth" {
  filename         = "service_auth.zip"
  function_name    = "codai-service-auth"
  role            = aws_iam_role.service_auth_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 30
  
  environment {
    variables = {
      JWT_SECRET_PARAM     = aws_ssm_parameter.service_jwt_secret.name
      INTER_SERVICE_KEY_PARAM = aws_ssm_parameter.inter_service_key.name
      SERVICE_DISCOVERY_PARAM = aws_ssm_parameter.service_discovery.name
      API_PERMISSIONS_PARAM   = aws_ssm_parameter.api_permissions.name
    }
  }
  
  tags = {
    Name        = "Service Authentication"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "security"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# IAM role for service authentication
resource "aws_iam_role" "service_auth_role" {
  name = "codai-service-auth-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
  
  tags = {
    Name        = "Service Auth Role"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "security"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# IAM policy for service authentication
resource "aws_iam_role_policy" "service_auth_policy" {
  name = "codai-service-auth-policy"
  role = aws_iam_role.service_auth_role.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters"
        ]
        Resource = [
          aws_ssm_parameter.service_jwt_secret.arn,
          aws_ssm_parameter.inter_service_key.arn,
          aws_ssm_parameter.service_discovery.arn,
          aws_ssm_parameter.api_permissions.arn
        ]
      }
    ]
  })
}

# ECS task environment variables for service authentication
resource "aws_ssm_parameter" "ecs_service_auth_env" {
  name = "/codai/ecs/service-auth-env"
  type = "String"
  value = jsonencode({
    SERVICE_JWT_SECRET_PARAM     = aws_ssm_parameter.service_jwt_secret.name
    INTER_SERVICE_KEY_PARAM      = aws_ssm_parameter.inter_service_key.name
    SERVICE_DISCOVERY_PARAM      = aws_ssm_parameter.service_discovery.name
    API_PERMISSIONS_PARAM        = aws_ssm_parameter.api_permissions.name
    
    # Service identity
    SERVICE_NAME                 = "{{ SERVICE_NAME }}"
    SERVICE_VERSION              = "1.0.0"
    
    # Authentication settings
    JWT_ISSUER                   = "codai-services"
    JWT_AUDIENCE                 = "codai-internal"
    TOKEN_TTL                    = "3600"
    REFRESH_TTL                  = "86400"
    
    # Security settings
    REQUIRE_SSL                  = "true"
    VALIDATE_HOST                = "true"
    RATE_LIMIT                   = "1000"
    TIMEOUT                      = "30"
    
    # Domain configuration
    API_DOMAIN                   = "api.codai.ro"
    ADMIN_DOMAIN                 = "admin.codai.ro"
    APPS_DOMAIN                  = "apps.codai.ro"
  })
  
  tags = {
    Name        = "ECS Service Auth Environment"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "configuration"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# Outputs
output "service_jwt_secret_param" {
  value       = aws_ssm_parameter.service_jwt_secret.name
  description = "SSM parameter name for service JWT secret"
}

output "inter_service_key_param" {
  value       = aws_ssm_parameter.inter_service_key.name
  description = "SSM parameter name for inter-service key"
}

output "service_discovery_param" {
  value       = aws_ssm_parameter.service_discovery.name
  description = "SSM parameter name for service discovery config"
}

output "api_permissions_param" {
  value       = aws_ssm_parameter.api_permissions.name
  description = "SSM parameter name for API permissions config"
}

output "master_admin_config_param" {
  value       = aws_ssm_parameter.master_admin_config.name
  description = "SSM parameter name for master admin config"
  sensitive   = true
}

output "service_auth_lambda_arn" {
  value       = aws_lambda_function.service_auth.arn
  description = "Service authentication Lambda function ARN"
}
