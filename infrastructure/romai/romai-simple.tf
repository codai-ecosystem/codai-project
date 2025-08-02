# RomAI AWS Infrastructure Configuration
# Simplified deployment for romcp.ro backend services

terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "codai-terraform-state"
    key    = "romai/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = "us-east-1"
  
  default_tags {
    tags = {
      Project     = "romai"
      Environment = "production"
      ManagedBy   = "terraform"
      Owner       = "romcp.ro"
    }
  }
}

# Generate random suffix for unique resource names
resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# S3 bucket for application data
resource "aws_s3_bucket" "romai_data" {
  bucket = "romai-data-${random_string.suffix.result}"
  
  tags = {
    Name = "romai-data"
  }
}

resource "aws_s3_bucket_versioning" "romai_data" {
  bucket = aws_s3_bucket.romai_data.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "romai_data" {
  bucket = aws_s3_bucket.romai_data.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "romai_data" {
  bucket = aws_s3_bucket.romai_data.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Route 53 hosted zone for romcp.ro
data "aws_route53_zone" "romcp" {
  name = "romcp.ro"
}

# ACM Certificate for *.romcp.ro
resource "aws_acm_certificate" "romcp" {
  domain_name               = "romcp.ro"
  subject_alternative_names = ["*.romcp.ro"]
  validation_method         = "DNS"
  
  lifecycle {
    create_before_destroy = true
  }
  
  tags = {
    Name = "romcp.ro"
  }
}

# Certificate validation
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.romcp.domain_validation_options : dvo.domain_name => {
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
  zone_id         = data.aws_route53_zone.romcp.zone_id
}

resource "aws_acm_certificate_validation" "romcp" {
  certificate_arn         = aws_acm_certificate.romcp.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

# Lambda function for RomAI MCP Server
resource "aws_iam_role" "romai_lambda_role" {
  name = "romai-lambda-role"
  
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
}

resource "aws_iam_role_policy_attachment" "romai_lambda_basic" {
  role       = aws_iam_role.romai_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "romai_lambda_s3" {
  name = "romai-lambda-s3-policy"
  role = aws_iam_role.romai_lambda_role.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.romai_data.arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket"
        ]
        Resource = aws_s3_bucket.romai_data.arn
      }
    ]
  })
}

# API Gateway for RomAI services
resource "aws_apigatewayv2_api" "romai_api" {
  name          = "romai-api"
  protocol_type = "HTTP"
  description   = "RomAI API Gateway for romcp.ro"
  
  cors_configuration {
    allow_origins = ["https://romcp.ro", "https://api.romcp.ro", "https://cbd.romcp.ro", "https://mcp.romcp.ro"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization", "X-Requested-With"]
    max_age       = 300
  }
  
  tags = {
    Name = "romai-api"
  }
}

# API Gateway custom domain
resource "aws_apigatewayv2_domain_name" "romai_api_domain" {
  domain_name = "api.romcp.ro"
  
  domain_name_configuration {
    certificate_arn = aws_acm_certificate_validation.romcp.certificate_arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }
  
  tags = {
    Name = "api.romcp.ro"
  }
}

# Route 53 record for API Gateway
resource "aws_route53_record" "romai_api" {
  zone_id = data.aws_route53_zone.romcp.zone_id
  name    = "api.romcp.ro"
  type    = "A"
  
  alias {
    name                   = aws_apigatewayv2_domain_name.romai_api_domain.domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.romai_api_domain.domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = false
  }
}

# MCP subdomain
resource "aws_route53_record" "romai_mcp" {
  zone_id = data.aws_route53_zone.romcp.zone_id
  name    = "mcp.romcp.ro"
  type    = "A"
  
  alias {
    name                   = aws_apigatewayv2_domain_name.romai_api_domain.domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.romai_api_domain.domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = false
  }
}

# CBD subdomain
resource "aws_route53_record" "romai_cbd" {
  zone_id = data.aws_route53_zone.romcp.zone_id
  name    = "cbd.romcp.ro"
  type    = "A"
  
  alias {
    name                   = aws_apigatewayv2_domain_name.romai_api_domain.domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.romai_api_domain.domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = false
  }
}

# Outputs
output "s3_bucket_name" {
  value = aws_s3_bucket.romai_data.bucket
}

output "api_gateway_id" {
  value = aws_apigatewayv2_api.romai_api.id
}

output "api_gateway_endpoint" {
  value = aws_apigatewayv2_api.romai_api.api_endpoint
}

output "custom_domain_name" {
  value = aws_apigatewayv2_domain_name.romai_api_domain.domain_name
}

output "certificate_arn" {
  value = aws_acm_certificate_validation.romcp.certificate_arn
}

output "lambda_role_arn" {
  value = aws_iam_role.romai_lambda_role.arn
}
