# 🏗️ CODAI Phase 5 Consolidated Infrastructure Configuration
# Complete domain configuration, security, and service authentication

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

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "CODAI"
      Environment = "production"
      ManagedBy   = "terraform"
      Phase       = "5"
      Component   = "consolidated"
    }
  }
}

# Variables
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "domain_name" {
  description = "Primary domain name"
  type        = string
  default     = "codai.ro"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# Get existing ALB
data "aws_lb" "main" {
  name = "codai-main-alb"
}

data "aws_vpc" "main" {
  filter {
    name   = "tag:Name"
    values = ["codai-vpc"]
  }
}

data "aws_subnets" "public" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.main.id]
  }
  
  filter {
    name   = "tag:Type"
    values = ["public"]
  }
}

# Route 53 Hosted Zone
resource "aws_route53_zone" "codai_domain" {
  name = var.domain_name

  tags = {
    Name        = "codai-hosted-zone"
    Project     = "CODAI"
    Environment = var.environment
  }
}

# ACM Certificate for wildcard domain
resource "aws_acm_certificate" "codai_wildcard" {
  domain_name               = "*.${var.domain_name}"
  subject_alternative_names = [var.domain_name]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name        = "codai-wildcard-cert"
    Project     = "CODAI"
    Environment = var.environment
  }
}

# Certificate validation
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.codai_wildcard.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.codai_domain.zone_id
}

resource "aws_acm_certificate_validation" "codai_wildcard" {
  certificate_arn         = aws_acm_certificate.codai_wildcard.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "codai_cdn" {
  origin {
    domain_name = data.aws_lb.main.dns_name
    origin_id   = "alb-origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "CODAI CloudFront Distribution"
  default_root_object = "index.html"

  aliases = [
    var.domain_name,
    "www.${var.domain_name}",
    "api.${var.domain_name}",
    "admin.${var.domain_name}",
    "apps.${var.domain_name}",
    "gateway.${var.domain_name}",
    "docs.${var.domain_name}"
  ]

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "alb-origin"

    forwarded_values {
      query_string = true
      headers      = ["Host", "CloudFront-Forwarded-Proto", "Authorization"]

      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate_validation.codai_wildcard.certificate_arn
    ssl_support_method  = "sni-only"
  }

  web_acl_id = aws_wafv2_web_acl.codai_waf.arn

  tags = {
    Name        = "codai-cloudfront"
    Project     = "CODAI"
    Environment = var.environment
  }
}

# WAF Web ACL
resource "aws_wafv2_web_acl" "codai_waf" {
  name  = "codai-waf"
  scope = "CLOUDFRONT"

  default_action {
    allow {}
  }

  rule {
    name     = "RateLimitRule"
    priority = 1

    override_action {
      none {}
    }

    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                 = "RateLimitRule"
      sampled_requests_enabled    = true
    }

    action {
      block {}
    }
  }

  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 2

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                 = "CommonRuleSetMetric"
      sampled_requests_enabled    = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                 = "codaiWAF"
    sampled_requests_enabled    = true
  }

  tags = {
    Name        = "codai-waf"
    Project     = "CODAI"
    Environment = var.environment
  }
}

# DNS Records
resource "aws_route53_record" "root" {
  zone_id = aws_route53_zone.codai_domain.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.codai_cdn.domain_name
    zone_id                = aws_cloudfront_distribution.codai_cdn.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.codai_domain.zone_id
  name    = "www.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.codai_cdn.domain_name
    zone_id                = aws_cloudfront_distribution.codai_cdn.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "api" {
  zone_id = aws_route53_zone.codai_domain.zone_id
  name    = "api.${var.domain_name}"
  type    = "A"

  alias {
    name                   = data.aws_lb.main.dns_name
    zone_id                = data.aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "admin" {
  zone_id = aws_route53_zone.codai_domain.zone_id
  name    = "admin.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.codai_cdn.domain_name
    zone_id                = aws_cloudfront_distribution.codai_cdn.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "apps" {
  zone_id = aws_route53_zone.codai_domain.zone_id
  name    = "apps.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.codai_cdn.domain_name
    zone_id                = aws_cloudfront_distribution.codai_cdn.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "gateway" {
  zone_id = aws_route53_zone.codai_domain.zone_id
  name    = "gateway.${var.domain_name}"
  type    = "A"

  alias {
    name                   = data.aws_lb.main.dns_name
    zone_id                = data.aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "docs" {
  zone_id = aws_route53_zone.codai_domain.zone_id
  name    = "docs.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.codai_cdn.domain_name
    zone_id                = aws_cloudfront_distribution.codai_cdn.hosted_zone_id
    evaluate_target_health = false
  }
}

# API Gateway v2
resource "aws_apigatewayv2_api" "codai_gateway" {
  name          = "codai-api-gateway"
  protocol_type = "HTTP"
  description   = "CODAI API Gateway with authentication"

  cors_configuration {
    allow_credentials = true
    allow_headers     = ["content-type", "x-amz-date", "authorization", "x-api-key", "x-amz-security-token"]
    allow_methods     = ["*"]
    allow_origins     = ["https://${var.domain_name}", "https://www.${var.domain_name}", "https://admin.${var.domain_name}", "https://apps.${var.domain_name}"]
    expose_headers    = ["date", "keep-alive"]
    max_age          = 86400
  }

  tags = {
    Name        = "codai-api-gateway"
    Project     = "CODAI"
    Environment = var.environment
  }
}

# Random passwords for security
resource "random_password" "jwt_secret" {
  length  = 64
  special = true
}

resource "random_password" "api_key_secret" {
  length  = 32
  special = true
}

resource "random_password" "inter_service_secret" {
  length  = 48
  special = true
}

resource "random_password" "master_admin_password" {
  length  = 16
  special = true
}

# SSM Parameters for secrets
resource "aws_ssm_parameter" "jwt_secret" {
  name        = "/codai/services/jwt-secret"
  description = "JWT secret for service authentication"
  type        = "SecureString"
  value       = random_password.jwt_secret.result

  tags = {
    Name        = "codai-jwt-secret"
    Project     = "CODAI"
    Environment = var.environment
  }
}

resource "aws_ssm_parameter" "api_key_secret" {
  name        = "/codai/api/key-secret"
  description = "API key encryption secret"
  type        = "SecureString"
  value       = random_password.api_key_secret.result

  tags = {
    Name        = "codai-api-key-secret"
    Project     = "CODAI"
    Environment = var.environment
  }
}

resource "aws_ssm_parameter" "inter_service_secret" {
  name        = "/codai/services/inter-service-key"
  description = "Inter-service communication key"
  type        = "SecureString"
  value       = random_password.inter_service_secret.result

  tags = {
    Name        = "codai-inter-service-secret"
    Project     = "CODAI"
    Environment = var.environment
  }
}

# Service discovery configuration
resource "aws_ssm_parameter" "service_discovery" {
  name        = "/codai/services/discovery"
  description = "Service discovery configuration"
  type        = "String"
  value = jsonencode({
    services = {
      gateway = {
        url = "https://gateway.${var.domain_name}"
        internal_url = "http://codai-gateway-service:3000"
        health_check = "/health"
      }
      memorai_mcp = {
        url = "https://api.${var.domain_name}/memorai"
        internal_url = "http://codai-memorai-mcp-service:4950"
        health_check = "/health"
      }
      cbd = {
        url = "https://api.${var.domain_name}/cbd"
        internal_url = "http://codai-cbd-service:8080"
        health_check = "/health"
      }
      ssl_proxy = {
        url = "https://api.${var.domain_name}/ssl"
        internal_url = "http://codai-ssl-proxy-service:8443"
        health_check = "/health"
      }
      websocket = {
        url = "wss://api.${var.domain_name}/ws"
        internal_url = "http://codai-websocket-service:3001"
        health_check = "/health"
      }
    }
    authentication = {
      jwt_issuer = "codai-services"
      jwt_audience = "codai-ecosystem"
      token_expiry = 3600
    }
  })

  tags = {
    Name        = "codai-service-discovery"
    Project     = "CODAI"
    Environment = var.environment
  }
}

# Master admin configuration
resource "aws_ssm_parameter" "master_admin_config" {
  name        = "/codai/admin/master-config"
  description = "Master admin configuration"
  type        = "SecureString"
  value = jsonencode({
    username = "codai-admin"
    password = random_password.master_admin_password.result
    email = "admin@${var.domain_name}"
    permissions = ["*"]
    created_at = timestamp()
  })

  tags = {
    Name        = "codai-master-admin"
    Project     = "CODAI"
    Environment = var.environment
  }
}

# DynamoDB Tables
resource "aws_dynamodb_table" "api_keys" {
  name           = "codai-api-keys"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "key_id"

  attribute {
    name = "key_id"
    type = "S"
  }

  attribute {
    name = "project_id"
    type = "S"
  }

  global_secondary_index {
    name            = "project-index"
    hash_key        = "project_id"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "expires_at"
    enabled        = true
  }

  tags = {
    Name        = "codai-api-keys"
    Project     = "CODAI"
    Environment = var.environment
  }
}

resource "aws_dynamodb_table" "projects" {
  name           = "codai-projects"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "project_id"

  attribute {
    name = "project_id"
    type = "S"
  }

  attribute {
    name = "user_id"
    type = "S"
  }

  global_secondary_index {
    name            = "user-index"
    hash_key        = "user_id"
    projection_type = "ALL"
  }

  tags = {
    Name        = "codai-projects"
    Project     = "CODAI"
    Environment = var.environment
  }
}

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
    name            = "email-index"
    hash_key        = "email"
    projection_type = "ALL"
  }

  tags = {
    Name        = "codai-users"
    Project     = "CODAI"
    Environment = var.environment
  }
}

# Outputs
output "hosted_zone_id" {
  description = "Route 53 hosted zone ID"
  value       = aws_route53_zone.codai_domain.zone_id
}

output "hosted_zone_name_servers" {
  description = "Name servers for the hosted zone"
  value       = aws_route53_zone.codai_domain.name_servers
}

output "certificate_arn" {
  description = "ACM certificate ARN"
  value       = aws_acm_certificate_validation.codai_wildcard.certificate_arn
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.codai_cdn.domain_name
}

output "api_gateway_id" {
  description = "API Gateway ID"
  value       = aws_apigatewayv2_api.codai_gateway.id
}

output "api_gateway_execution_arn" {
  description = "API Gateway execution ARN"
  value       = aws_apigatewayv2_api.codai_gateway.execution_arn
}

output "dynamodb_tables" {
  description = "DynamoDB table names"
  value = {
    api_keys = aws_dynamodb_table.api_keys.name
    projects = aws_dynamodb_table.projects.name
    users    = aws_dynamodb_table.users.name
  }
}

output "domain_endpoints" {
  description = "Domain endpoints"
  value = {
    main_site    = "https://${var.domain_name}"
    api_gateway  = "https://api.${var.domain_name}"
    admin_panel  = "https://admin.${var.domain_name}"
    apps_portal  = "https://apps.${var.domain_name}"
    gateway      = "https://gateway.${var.domain_name}"
    docs         = "https://docs.${var.domain_name}"
  }
}
