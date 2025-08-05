# 🔐 CODAI API Gateway Security Configuration
# Advanced security with JWT tokens, API keys, rate limiting, and RBAC

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

# API Gateway v2 for HTTP APIs
resource "aws_apigatewayv2_api" "codai_gateway" {
  name          = "codai-api-gateway"
  protocol_type = "HTTP"
  description   = "CODAI Ecosystem API Gateway with advanced security"
  
  cors_configuration {
    allow_credentials = true
    allow_headers = [
      "content-type",
      "x-amz-date",
      "authorization",
      "x-api-key",
      "x-amz-security-token",
      "x-amz-user-agent",
      "x-client-id",
      "x-project-id"
    ]
    allow_methods = [
      "DELETE",
      "GET",
      "HEAD",
      "OPTIONS",
      "PATCH",
      "POST",
      "PUT"
    ]
    allow_origins = [
      "https://codai.ro",
      "https://www.codai.ro",
      "https://admin.codai.ro",
      "https://apps.codai.ro",
      "https://memorai.codai.ro",
      "https://bancai.codai.ro",
      "https://logai.codai.ro",
      "https://analizai.codai.ro",
      "https://romai.codai.ro"
    ]
    expose_headers = ["x-request-id", "x-rate-limit-remaining"]
    max_age        = 86400
  }
  
  tags = {
    Name        = "CODAI API Gateway"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "api-gateway"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# Custom domain for API Gateway
resource "aws_apigatewayv2_domain_name" "api_domain" {
  domain_name = "api.codai.ro"
  
  domain_name_configuration {
    certificate_arn = data.aws_acm_certificate.codai_cert.arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }
  
  tags = {
    Name        = "API Gateway Custom Domain"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "api-gateway"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# JWT Authorizer for User Authentication
resource "aws_apigatewayv2_authorizer" "jwt_auth" {
  api_id           = aws_apigatewayv2_api.codai_gateway.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "codai-jwt-authorizer"
  
  jwt_configuration {
    audience = ["codai-api"]
    issuer   = "https://auth.codai.ro"
  }
}

# Lambda Authorizer for API Key validation
resource "aws_lambda_function" "api_key_authorizer" {
  filename         = "api_key_authorizer.zip"
  function_name    = "codai-api-key-authorizer"
  role            = aws_iam_role.lambda_authorizer_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 30
  
  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.api_keys.name
      JWT_SECRET     = random_password.jwt_secret.result
    }
  }
  
  tags = {
    Name        = "API Key Authorizer"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "security"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# API Key Authorizer
resource "aws_apigatewayv2_authorizer" "api_key_auth" {
  api_id                            = aws_apigatewayv2_api.codai_gateway.id
  authorizer_type                   = "REQUEST"
  authorizer_uri                    = aws_lambda_function.api_key_authorizer.invoke_arn
  name                             = "codai-api-key-authorizer"
  authorizer_payload_format_version = "2.0"
  enable_simple_responses          = true
  
  identity_sources = [
    "$request.header.x-api-key",
    "$request.header.x-client-id"
  ]
  
  authorizer_result_ttl_in_seconds = 300
}

# DynamoDB table for API Keys management
resource "aws_dynamodb_table" "api_keys" {
  name           = "codai-api-keys"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "api_key_id"
  
  attribute {
    name = "api_key_id"
    type = "S"
  }
  
  attribute {
    name = "project_id"
    type = "S"
  }
  
  attribute {
    name = "client_id"
    type = "S"
  }
  
  global_secondary_index {
    name     = "project-index"
    hash_key = "project_id"
  }
  
  global_secondary_index {
    name     = "client-index"
    hash_key = "client_id"
  }
  
  tags = {
    Name        = "CODAI API Keys"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "security"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# DynamoDB table for Projects management
resource "aws_dynamodb_table" "projects" {
  name           = "codai-projects"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "project_id"
  
  attribute {
    name = "project_id"
    type = "S"
  }
  
  attribute {
    name = "owner_id"
    type = "S"
  }
  
  global_secondary_index {
    name     = "owner-index"
    hash_key = "owner_id"
  }
  
  tags = {
    Name        = "CODAI Projects"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "data"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# DynamoDB table for Users management
resource "aws_dynamodb_table" "users" {
  name           = "codai-users"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "user_id"
  
  attribute {
    name = "user_id"
    type = "S"
  }
  
  attribute {
    name = "email"
    type = "S"
  }
  
  global_secondary_index {
    name     = "email-index"
    hash_key = "email"
  }
  
  tags = {
    Name        = "CODAI Users"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "data"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# IAM role for Lambda authorizer
resource "aws_iam_role" "lambda_authorizer_role" {
  name = "codai-lambda-authorizer-role"
  
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
    Name        = "Lambda Authorizer Role"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "security"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# IAM policy for Lambda authorizer
resource "aws_iam_role_policy" "lambda_authorizer_policy" {
  name = "codai-lambda-authorizer-policy"
  role = aws_iam_role.lambda_authorizer_role.id
  
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
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:UpdateItem"
        ]
        Resource = [
          aws_dynamodb_table.api_keys.arn,
          "${aws_dynamodb_table.api_keys.arn}/*",
          aws_dynamodb_table.projects.arn,
          "${aws_dynamodb_table.projects.arn}/*",
          aws_dynamodb_table.users.arn,
          "${aws_dynamodb_table.users.arn}/*"
        ]
      }
    ]
  })
}

# Random JWT secret
resource "random_password" "jwt_secret" {
  length  = 64
  special = true
}

# Random master admin password
resource "random_password" "master_admin_password" {
  length  = 32
  special = true
}

# Systems Manager parameters for secrets
resource "aws_ssm_parameter" "jwt_secret" {
  name  = "/codai/security/jwt-secret"
  type  = "SecureString"
  value = random_password.jwt_secret.result
  
  tags = {
    Name        = "JWT Secret"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "security"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

resource "aws_ssm_parameter" "master_admin_password" {
  name  = "/codai/security/master-admin-password"
  type  = "SecureString"
  value = random_password.master_admin_password.result
  
  tags = {
    Name        = "Master Admin Password"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "security"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# VPC Link for private resources
resource "aws_apigatewayv2_vpc_link" "codai_vpc_link" {
  name            = "codai-vpc-link"
  security_group_ids = [data.aws_security_group.ecs_security_group.id]
  subnet_ids      = data.aws_subnets.private.ids
  
  tags = {
    Name        = "CODAI VPC Link"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "api-gateway"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# Data sources
data "aws_acm_certificate" "codai_cert" {
  domain   = "*.codai.ro"
  statuses = ["ISSUED"]
}

data "aws_security_group" "ecs_security_group" {
  name = "codai-ecs-sg"
}

data "aws_subnets" "private" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.main.id]
  }
  
  filter {
    name   = "tag:Type"
    values = ["private"]
  }
}

data "aws_vpc" "main" {
  filter {
    name   = "tag:Name"
    values = ["codai-vpc"]
  }
}

# Outputs
output "api_gateway_id" {
  value       = aws_apigatewayv2_api.codai_gateway.id
  description = "API Gateway ID"
}

output "api_gateway_endpoint" {
  value       = aws_apigatewayv2_api.codai_gateway.api_endpoint
  description = "API Gateway endpoint URL"
}

output "custom_domain_name" {
  value       = aws_apigatewayv2_domain_name.api_domain.domain_name
  description = "Custom domain name for API"
}

output "jwt_authorizer_id" {
  value       = aws_apigatewayv2_authorizer.jwt_auth.id
  description = "JWT Authorizer ID"
}

output "api_key_authorizer_id" {
  value       = aws_apigatewayv2_authorizer.api_key_auth.id
  description = "API Key Authorizer ID"
}
