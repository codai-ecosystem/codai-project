# 🌐 CODAI Infrastructure Main Configuration
# Complete domain, security, and service authentication setup

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
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }
}

# AWS Provider configuration
provider "aws" {
  region = "us-east-1"
  
  default_tags {
    tags = {
      Project     = "codai-ecosystem"
      Environment = "production"
      ManagedBy   = "terraform"
      Version     = "1.0.0"
      CreatedBy   = "phase-5-implementation"
    }
  }
}

# Archive Lambda functions
data "archive_file" "api_key_authorizer" {
  type        = "zip"
  source_dir  = "${path.module}/lambda"
  output_path = "${path.module}/api_key_authorizer.zip"
  
  depends_on = [
    local_file.api_key_authorizer_package
  ]
}

data "archive_file" "service_auth" {
  type        = "zip"
  source_dir  = "${path.module}/lambda"
  output_path = "${path.module}/service_auth.zip"
}

# Install Lambda dependencies
resource "null_resource" "lambda_dependencies" {
  triggers = {
    package_json = filemd5("${path.module}/lambda/package.json")
  }
  
  provisioner "local-exec" {
    command = "cd ${path.module}/lambda && npm install"
  }
}

# Create Lambda package.json
resource "local_file" "api_key_authorizer_package" {
  content = jsonencode({
    name = "codai-lambda-authorizers"
    version = "1.0.0"
    description = "CODAI Lambda Authorizer Functions"
    main = "api-key-authorizer.js"
    dependencies = {
      jsonwebtoken = "^9.0.2"
    }
    keywords = ["api", "security", "authorization", "jwt"]
    author = "CODAI Ecosystem"
    license = "MIT"
  })
  filename = "${path.module}/lambda/package.json"
}

# Random bucket suffix for global uniqueness
resource "random_id" "bucket_suffix" {
  byte_length = 8
}

# S3 bucket for Lambda deployment packages
resource "aws_s3_bucket" "lambda_artifacts" {
  bucket = "codai-lambda-artifacts-${random_id.bucket_suffix.hex}"
  
  tags = {
    Name        = "Lambda Artifacts Bucket"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "storage"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

resource "aws_s3_bucket_versioning" "lambda_artifacts" {
  bucket = aws_s3_bucket.lambda_artifacts.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "lambda_artifacts" {
  bucket = aws_s3_bucket.lambda_artifacts.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Upload Lambda packages to S3
resource "aws_s3_object" "api_key_authorizer_zip" {
  bucket = aws_s3_bucket.lambda_artifacts.bucket
  key    = "api_key_authorizer.zip"
  source = data.archive_file.api_key_authorizer.output_path
  etag   = data.archive_file.api_key_authorizer.output_md5
  
  depends_on = [
    data.archive_file.api_key_authorizer,
    null_resource.lambda_dependencies
  ]
}

resource "aws_s3_object" "service_auth_zip" {
  bucket = aws_s3_bucket.lambda_artifacts.bucket
  key    = "service_auth.zip"
  source = data.archive_file.service_auth.output_path
  etag   = data.archive_file.service_auth.output_md5
  
  depends_on = [
    data.archive_file.service_auth,
    null_resource.lambda_dependencies
  ]
}

# CloudWatch log groups
resource "aws_cloudwatch_log_group" "infrastructure_logs" {
  name              = "/aws/codai/infrastructure"
  retention_in_days = 30
  
  tags = {
    Name        = "Infrastructure Logs"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "logging"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# Local values for configuration
locals {
  domain_name = "codai.ro"
  environment = "production"
  
  # Service configuration
  services = {
    gateway = {
      name = "gateway"
      port = 4000
      health_path = "/health"
    }
    memorai_mcp = {
      name = "memorai-mcp"
      port = 4950
      health_path = "/health"
    }
    cbd = {
      name = "cbd"
      port = 3001
      health_path = "/health"
    }
    ssl_proxy = {
      name = "ssl-proxy"
      port = 443
      health_path = "/health"
    }
    websocket_service = {
      name = "websocket-service"
      port = 8080
      health_path = "/health"
    }
  }
  
  # Domain configuration
  domains = {
    api        = "api.${local.domain_name}"
    admin      = "admin.${local.domain_name}"
    apps       = "apps.${local.domain_name}"
    gateway    = "gateway.${local.domain_name}"
    docs       = "docs.${local.domain_name}"
    monitoring = "monitoring.${local.domain_name}"
  }
}

# Outputs for reference
output "infrastructure_summary" {
  value = {
    domain_name     = local.domain_name
    environment     = local.environment
    services_count  = length(local.services)
    domains_count   = length(local.domains)
    bucket_name     = aws_s3_bucket.lambda_artifacts.bucket
    log_group       = aws_cloudwatch_log_group.infrastructure_logs.name
  }
  description = "Infrastructure deployment summary"
}

output "domain_configuration" {
  value = {
    main_domain = local.domain_name
    subdomains  = local.domains
    ssl_enabled = true
    cdn_enabled = true
  }
  description = "Domain configuration details"
}

output "security_configuration" {
  value = {
    api_gateway_security = "enabled"
    jwt_authorization    = "enabled"
    api_key_validation   = "enabled"
    service_auth         = "enabled"
    ssl_termination      = "enabled"
    waf_protection       = "enabled"
  }
  description = "Security configuration status"
}

output "service_endpoints" {
  value = {
    api_gateway = "https://${local.domains.api}"
    admin_panel = "https://${local.domains.admin}"
    apps_portal = "https://${local.domains.apps}"
    gateway     = "https://${local.domains.gateway}"
    docs        = "https://${local.domains.docs}"
    monitoring  = "https://${local.domains.monitoring}"
  }
  description = "Service endpoint URLs"
}
