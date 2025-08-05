# 🛣️ CODAI API Gateway Routes Configuration
# Service routing with domain-based architecture and security

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# API Gateway deployment
resource "aws_apigatewayv2_deployment" "codai_deployment" {
  api_id = data.aws_apigatewayv2_api.codai_gateway.id
  
  depends_on = [
    aws_apigatewayv2_route.gateway_routes,
    aws_apigatewayv2_route.memorai_routes,
    aws_apigatewayv2_route.cbd_routes,
    aws_apigatewayv2_route.ssl_proxy_routes,
    aws_apigatewayv2_route.websocket_routes
  ]
  
  lifecycle {
    create_before_destroy = true
  }
  
  triggers = {
    redeployment = sha1(jsonencode([
      aws_apigatewayv2_route.gateway_routes,
      aws_apigatewayv2_route.memorai_routes,
      aws_apigatewayv2_route.cbd_routes,
      aws_apigatewayv2_route.ssl_proxy_routes,
      aws_apigatewayv2_route.websocket_routes
    ]))
  }
}

# API Gateway stage
resource "aws_apigatewayv2_stage" "production" {
  api_id        = data.aws_apigatewayv2_api.codai_gateway.id
  deployment_id = aws_apigatewayv2_deployment.codai_deployment.id
  name          = "production"
  auto_deploy   = true
  
  # Throttling configuration
  throttle_settings {
    rate_limit  = 10000
    burst_limit = 5000
  }
  
  # Access logging
  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway_logs.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      caller         = "$context.identity.caller"
      user           = "$context.identity.user"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      resourcePath   = "$context.resourcePath"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
      errorMessage   = "$context.error.message"
      errorType      = "$context.error.messageString"
    })
  }
  
  tags = {
    Name        = "Production API Stage"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "api-gateway"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# Domain mapping
resource "aws_apigatewayv2_api_mapping" "api_mapping" {
  api_id      = data.aws_apigatewayv2_api.codai_gateway.id
  domain_name = data.aws_apigatewayv2_domain_name.api_domain.domain_name
  stage       = aws_apigatewayv2_stage.production.name
}

# CloudWatch log group for API Gateway
resource "aws_cloudwatch_log_group" "api_gateway_logs" {
  name              = "/aws/apigateway/codai-gateway"
  retention_in_days = 30
  
  tags = {
    Name        = "API Gateway Logs"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "logging"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# Gateway Service Routes
resource "aws_apigatewayv2_integration" "gateway_integration" {
  api_id             = data.aws_apigatewayv2_api.codai_gateway.id
  integration_type   = "HTTP_PROXY"
  integration_method = "ANY"
  integration_uri    = "http://${data.aws_lb.main.dns_name}/gateway/{proxy}"
  
  connection_type = "VPC_LINK"
  connection_id   = data.aws_apigatewayv2_vpc_link.codai_vpc_link.id
  
  request_parameters = {
    "overwrite:header.x-service-name" = "gateway"
    "overwrite:header.x-forwarded-host" = "$request.header.host"
  }
}

resource "aws_apigatewayv2_route" "gateway_routes" {
  api_id    = data.aws_apigatewayv2_api.codai_gateway.id
  route_key = "ANY /gateway/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.gateway_integration.id}"
  
  authorization_type = "CUSTOM"
  authorizer_id      = data.aws_apigatewayv2_authorizer.api_key_auth.id
}

# MemorAI MCP Service Routes
resource "aws_apigatewayv2_integration" "memorai_integration" {
  api_id             = data.aws_apigatewayv2_api.codai_gateway.id
  integration_type   = "HTTP_PROXY"
  integration_method = "ANY"
  integration_uri    = "http://${data.aws_lb.main.dns_name}/memorai/{proxy}"
  
  connection_type = "VPC_LINK"
  connection_id   = data.aws_apigatewayv2_vpc_link.codai_vpc_link.id
  
  request_parameters = {
    "overwrite:header.x-service-name" = "memorai-mcp"
    "overwrite:header.x-forwarded-host" = "$request.header.host"
  }
}

resource "aws_apigatewayv2_route" "memorai_routes" {
  api_id    = data.aws_apigatewayv2_api.codai_gateway.id
  route_key = "ANY /memorai/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.memorai_integration.id}"
  
  authorization_type = "CUSTOM"
  authorizer_id      = data.aws_apigatewayv2_authorizer.api_key_auth.id
}

# CBD Database Service Routes
resource "aws_apigatewayv2_integration" "cbd_integration" {
  api_id             = data.aws_apigatewayv2_api.codai_gateway.id
  integration_type   = "HTTP_PROXY"
  integration_method = "ANY"
  integration_uri    = "http://${data.aws_lb.main.dns_name}/cbd/{proxy}"
  
  connection_type = "VPC_LINK"
  connection_id   = data.aws_apigatewayv2_vpc_link.codai_vpc_link.id
  
  request_parameters = {
    "overwrite:header.x-service-name" = "cbd"
    "overwrite:header.x-forwarded-host" = "$request.header.host"
  }
}

resource "aws_apigatewayv2_route" "cbd_routes" {
  api_id    = data.aws_apigatewayv2_api.codai_gateway.id
  route_key = "ANY /cbd/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.cbd_integration.id}"
  
  authorization_type = "CUSTOM"
  authorizer_id      = data.aws_apigatewayv2_authorizer.api_key_auth.id
}

# SSL Proxy Service Routes
resource "aws_apigatewayv2_integration" "ssl_proxy_integration" {
  api_id             = data.aws_apigatewayv2_api.codai_gateway.id
  integration_type   = "HTTP_PROXY"
  integration_method = "ANY"
  integration_uri    = "http://${data.aws_lb.main.dns_name}/ssl/{proxy}"
  
  connection_type = "VPC_LINK"
  connection_id   = data.aws_apigatewayv2_vpc_link.codai_vpc_link.id
  
  request_parameters = {
    "overwrite:header.x-service-name" = "ssl-proxy"
    "overwrite:header.x-forwarded-host" = "$request.header.host"
  }
}

resource "aws_apigatewayv2_route" "ssl_proxy_routes" {
  api_id    = data.aws_apigatewayv2_api.codai_gateway.id
  route_key = "ANY /ssl/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.ssl_proxy_integration.id}"
  
  authorization_type = "CUSTOM"
  authorizer_id      = data.aws_apigatewayv2_authorizer.api_key_auth.id
}

# WebSocket Service Routes
resource "aws_apigatewayv2_integration" "websocket_integration" {
  api_id             = data.aws_apigatewayv2_api.codai_gateway.id
  integration_type   = "HTTP_PROXY"
  integration_method = "ANY"
  integration_uri    = "http://${data.aws_lb.main.dns_name}/ws/{proxy}"
  
  connection_type = "VPC_LINK"
  connection_id   = data.aws_apigatewayv2_vpc_link.codai_vpc_link.id
  
  request_parameters = {
    "overwrite:header.x-service-name" = "websocket-service"
    "overwrite:header.x-forwarded-host" = "$request.header.host"
  }
}

resource "aws_apigatewayv2_route" "websocket_routes" {
  api_id    = data.aws_apigatewayv2_api.codai_gateway.id
  route_key = "ANY /ws/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.websocket_integration.id}"
  
  authorization_type = "CUSTOM"
  authorizer_id      = data.aws_apigatewayv2_authorizer.api_key_auth.id
}

# Health check route (public)
resource "aws_apigatewayv2_integration" "health_integration" {
  api_id             = data.aws_apigatewayv2_api.codai_gateway.id
  integration_type   = "HTTP_PROXY"
  integration_method = "GET"
  integration_uri    = "http://${data.aws_lb.main.dns_name}/health"
  
  connection_type = "VPC_LINK"
  connection_id   = data.aws_apigatewayv2_vpc_link.codai_vpc_link.id
}

resource "aws_apigatewayv2_route" "health_route" {
  api_id    = data.aws_apigatewayv2_api.codai_gateway.id
  route_key = "GET /health"
  target    = "integrations/${aws_apigatewayv2_integration.health_integration.id}"
  
  # No authorization required for health checks
  authorization_type = "NONE"
}

# Administrative endpoints (JWT required)
resource "aws_apigatewayv2_integration" "admin_integration" {
  api_id             = data.aws_apigatewayv2_api.codai_gateway.id
  integration_type   = "HTTP_PROXY"
  integration_method = "ANY"
  integration_uri    = "http://${data.aws_lb.main.dns_name}/admin/{proxy}"
  
  connection_type = "VPC_LINK"
  connection_id   = data.aws_apigatewayv2_vpc_link.codai_vpc_link.id
  
  request_parameters = {
    "overwrite:header.x-service-name" = "admin"
    "overwrite:header.x-forwarded-host" = "$request.header.host"
    "overwrite:header.x-admin-access" = "true"
  }
}

resource "aws_apigatewayv2_route" "admin_routes" {
  api_id    = data.aws_apigatewayv2_api.codai_gateway.id
  route_key = "ANY /admin/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.admin_integration.id}"
  
  authorization_type = "JWT"
  authorizer_id      = data.aws_apigatewayv2_authorizer.jwt_auth.id
}

# Data sources
data "aws_apigatewayv2_api" "codai_gateway" {
  name = "codai-api-gateway"
}

data "aws_apigatewayv2_domain_name" "api_domain" {
  domain_name = "api.codai.ro"
}

data "aws_apigatewayv2_authorizer" "jwt_auth" {
  api_id = data.aws_apigatewayv2_api.codai_gateway.id
  name   = "codai-jwt-authorizer"
}

data "aws_apigatewayv2_authorizer" "api_key_auth" {
  api_id = data.aws_apigatewayv2_api.codai_gateway.id
  name   = "codai-api-key-authorizer"
}

data "aws_apigatewayv2_vpc_link" "codai_vpc_link" {
  name = "codai-vpc-link"
}

data "aws_lb" "main" {
  name = "codai-main-alb"
}

# Outputs
output "api_gateway_url" {
  value       = "https://${data.aws_apigatewayv2_domain_name.api_domain.domain_name}"
  description = "API Gateway custom domain URL"
}

output "gateway_service_url" {
  value       = "https://${data.aws_apigatewayv2_domain_name.api_domain.domain_name}/gateway"
  description = "Gateway service endpoint"
}

output "memorai_service_url" {
  value       = "https://${data.aws_apigatewayv2_domain_name.api_domain.domain_name}/memorai"
  description = "MemorAI MCP service endpoint"
}

output "cbd_service_url" {
  value       = "https://${data.aws_apigatewayv2_domain_name.api_domain.domain_name}/cbd"
  description = "CBD database service endpoint"
}

output "admin_service_url" {
  value       = "https://${data.aws_apigatewayv2_domain_name.api_domain.domain_name}/admin"
  description = "Administrative service endpoint"
}
