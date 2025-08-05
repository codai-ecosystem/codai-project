# 🌐 CODAI Domain Configuration & SSL Certificates
# Based on proven MemorAI infrastructure pattern

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Route 53 Hosted Zone for codai.ro
resource "aws_route53_zone" "codai_domain" {
  name = "codai.ro"
  
  tags = {
    Name        = "CODAI Domain Zone"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "dns"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# ACM Certificate for *.codai.ro (wildcard)
resource "aws_acm_certificate" "codai_wildcard" {
  domain_name       = "codai.ro"
  subject_alternative_names = [
    "*.codai.ro",
    "api.codai.ro",
    "admin.codai.ro", 
    "apps.codai.ro",
    "gateway.codai.ro",
    "docs.codai.ro",
    "memorai.codai.ro",
    "bancai.codai.ro",
    "logai.codai.ro",
    "analizai.codai.ro",
    "romai.codai.ro",
    "monitoring.codai.ro"
  ]
  validation_method = "DNS"
  
  lifecycle {
    create_before_destroy = true
  }
  
  tags = {
    Name        = "CODAI Wildcard SSL Certificate"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "ssl"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# DNS validation records for ACM certificate
resource "aws_route53_record" "codai_cert_validation" {
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

# ACM certificate validation
resource "aws_acm_certificate_validation" "codai_wildcard" {
  certificate_arn         = aws_acm_certificate.codai_wildcard.arn
  validation_record_fqdns = [for record in aws_route53_record.codai_cert_validation : record.fqdn]
  
  timeouts {
    create = "10m"
  }
}

# CloudFront Distribution for Global CDN
resource "aws_cloudfront_distribution" "codai_cdn" {
  origin {
    domain_name = data.aws_lb.main.dns_name
    origin_id   = "codai-alb-origin"
    
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }
  
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  
  aliases = [
    "codai.ro",
    "www.codai.ro",
    "api.codai.ro",
    "admin.codai.ro",
    "apps.codai.ro",
    "gateway.codai.ro",
    "docs.codai.ro"
  ]
  
  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "codai-alb-origin"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    
    forwarded_values {
      query_string = true
      headers      = ["Host", "Authorization", "X-API-Key", "X-Forwarded-For"]
      
      cookies {
        forward = "all"
      }
    }
    
    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
  }
  
  # API Cache Behavior
  ordered_cache_behavior {
    path_pattern           = "/api/*"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    target_origin_id       = "codai-alb-origin"
    viewer_protocol_policy = "https-only"
    compress               = true
    
    forwarded_values {
      query_string = true
      headers      = ["*"]
      
      cookies {
        forward = "all"
      }
    }
    
    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
  }
  
  price_class = "PriceClass_100"
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.codai_wildcard.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
  
  web_acl_id = aws_wafv2_web_acl.codai_waf.arn
  
  tags = {
    Name        = "CODAI CDN Distribution"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "cdn"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# DNS Records for main domains
resource "aws_route53_record" "codai_root" {
  zone_id = aws_route53_zone.codai_domain.zone_id
  name    = "codai.ro"
  type    = "A"
  
  alias {
    name                   = aws_cloudfront_distribution.codai_cdn.domain_name
    zone_id                = aws_cloudfront_distribution.codai_cdn.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "codai_www" {
  zone_id = aws_route53_zone.codai_domain.zone_id
  name    = "www.codai.ro"
  type    = "A"
  
  alias {
    name                   = aws_cloudfront_distribution.codai_cdn.domain_name
    zone_id                = aws_cloudfront_distribution.codai_cdn.hosted_zone_id
    evaluate_target_health = false
  }
}

# API Gateway DNS
resource "aws_route53_record" "api_codai" {
  zone_id = aws_route53_zone.codai_domain.zone_id
  name    = "api.codai.ro"
  type    = "A"
  
  alias {
    name                   = aws_cloudfront_distribution.codai_cdn.domain_name
    zone_id                = aws_cloudfront_distribution.codai_cdn.hosted_zone_id
    evaluate_target_health = false
  }
}

# Admin Dashboard DNS
resource "aws_route53_record" "admin_codai" {
  zone_id = aws_route53_zone.codai_domain.zone_id
  name    = "admin.codai.ro"
  type    = "A"
  
  alias {
    name                   = aws_cloudfront_distribution.codai_cdn.domain_name
    zone_id                = aws_cloudfront_distribution.codai_cdn.hosted_zone_id
    evaluate_target_health = false
  }
}

# Apps Portal DNS
resource "aws_route53_record" "apps_codai" {
  zone_id = aws_route53_zone.codai_domain.zone_id
  name    = "apps.codai.ro"
  type    = "A"
  
  alias {
    name                   = aws_cloudfront_distribution.codai_cdn.domain_name
    zone_id                = aws_cloudfront_distribution.codai_cdn.hosted_zone_id
    evaluate_target_health = false
  }
}

# Gateway Service DNS
resource "aws_route53_record" "gateway_codai" {
  zone_id = aws_route53_zone.codai_domain.zone_id
  name    = "gateway.codai.ro"
  type    = "A"
  
  alias {
    name                   = aws_cloudfront_distribution.codai_cdn.domain_name
    zone_id                = aws_cloudfront_distribution.codai_cdn.hosted_zone_id
    evaluate_target_health = false
  }
}

# Documentation DNS
resource "aws_route53_record" "docs_codai" {
  zone_id = aws_route53_zone.codai_domain.zone_id
  name    = "docs.codai.ro"
  type    = "A"
  
  alias {
    name                   = aws_cloudfront_distribution.codai_cdn.domain_name
    zone_id                = aws_cloudfront_distribution.codai_cdn.hosted_zone_id
    evaluate_target_health = false
  }
}

# Monitoring Dashboard DNS
resource "aws_route53_record" "monitoring_codai" {
  zone_id = aws_route53_zone.codai_domain.zone_id
  name    = "monitoring.codai.ro"
  type    = "A"
  
  alias {
    name                   = data.aws_lb.main.dns_name
    zone_id                = data.aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

# WAF for Security
resource "aws_wafv2_web_acl" "codai_waf" {
  name  = "codai-web-acl"
  scope = "CLOUDFRONT"
  
  default_action {
    allow {}
  }
  
  # Rate limiting rule
  rule {
    name     = "RateLimitingRule"
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
      metric_name                 = "RateLimitingRule"
      sampled_requests_enabled    = true
    }
    
    action {
      block {}
    }
  }
  
  # SQL injection protection
  rule {
    name     = "SQLInjectionRule"
    priority = 2
    
    override_action {
      none {}
    }
    
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesSQLiRuleSet"
        vendor_name = "AWS"
      }
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                 = "SQLInjectionRule"
      sampled_requests_enabled    = true
    }
    
    action {
      block {}
    }
  }
  
  tags = {
    Name        = "CODAI WAF ACL"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "security"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
  
  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                 = "CODAIWebACL"
    sampled_requests_enabled    = true
  }
}

# Data source for existing ALB
data "aws_lb" "main" {
  name = "codai-main-alb"
}

# Output important values
output "domain_zone_id" {
  value       = aws_route53_zone.codai_domain.zone_id
  description = "Route 53 zone ID for codai.ro"
}

output "ssl_certificate_arn" {
  value       = aws_acm_certificate_validation.codai_wildcard.certificate_arn
  description = "ARN of the validated SSL certificate"
}

output "cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.codai_cdn.id
  description = "CloudFront distribution ID"
}

output "cloudfront_domain_name" {
  value       = aws_cloudfront_distribution.codai_cdn.domain_name
  description = "CloudFront distribution domain name"
}

output "waf_web_acl_arn" {
  value       = aws_wafv2_web_acl.codai_waf.arn
  description = "WAF Web ACL ARN"
}
