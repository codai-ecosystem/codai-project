# CODAI CloudFront Distribution Configuration - Custom Domains with HTTPS
resource "aws_cloudfront_distribution" "codai_api" {
  comment = "CODAI API Gateway Distribution"
  aliases = ["api.codai.ro"]
  
  origin {
    domain_name = "codai-alb-prod-348122537.us-east-1.elb.amazonaws.com"
    origin_id   = "codai-alb-origin"
    
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }
  
  enabled = true
  
  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "codai-alb-origin"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
    
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
    acm_certificate_arn      = aws_acm_certificate.codai_cert.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
  
  tags = {
    Name        = "CODAI API Distribution"
    Environment = "prod"
    Project     = "CODAI"
  }
}

# Gateway-specific CloudFront Distribution
resource "aws_cloudfront_distribution" "codai_gateway" {
  comment = "CODAI Gateway Distribution"
  aliases = ["gateway.codai.ro"]
  
  origin {
    domain_name = "codai-alb-prod-348122537.us-east-1.elb.amazonaws.com"
    origin_id   = "codai-gateway-origin"
    
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }
  
  enabled = true
  
  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "codai-gateway-origin"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
    
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
    acm_certificate_arn      = aws_acm_certificate.codai_cert.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
  
  tags = {
    Name        = "CODAI Gateway Distribution"
    Environment = "prod"
    Project     = "CODAI"
  }
}

# Outputs
output "api_cloudfront_domain" {
  value = aws_cloudfront_distribution.codai_api.domain_name
}

output "gateway_cloudfront_domain" {
  value = aws_cloudfront_distribution.codai_gateway.domain_name
}

output "api_codai_url" {
  value = "https://api.codai.ro"
}

output "gateway_codai_url" {
  value = "https://gateway.codai.ro"
}
