# Route 53 and SSL Configuration
resource "aws_route53_zone" "codai_zone" {
  name = "codai.ro"
  
  tags = {
    Name        = "CODAI Production Zone"
    Environment = "prod"
    Project     = "CODAI"
    ManagedBy   = "Terraform"
    Owner       = "CODAI-Team"
  }
}

# SSL Certificate with DNS validation
resource "aws_acm_certificate" "codai_cert" {
  domain_name               = "codai.ro"
  subject_alternative_names = ["*.codai.ro"]
  validation_method         = "DNS"
  
  tags = {
    Name        = "CODAI Wildcard Certificate"
    Environment = "prod"
    Project     = "CODAI"
    ManagedBy   = "Terraform"
    Owner       = "CODAI-Team"
  }
  
  lifecycle {
    create_before_destroy = true
  }
}

# Certificate validation records
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.codai_cert.domain_validation_options : dvo.domain_name => {
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
  zone_id         = aws_route53_zone.codai_zone.zone_id
}

# Certificate validation - TODO: Enable after manual DNS validation
# resource "aws_acm_certificate_validation" "codai_cert_validation" {
#   certificate_arn         = aws_acm_certificate.codai_cert.arn
#   validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
#   
#   timeouts {
#     create = "5m"
#   }
# }

# DNS records for services
resource "aws_route53_record" "api" {
  zone_id = aws_route53_zone.codai_zone.zone_id
  name    = "api.codai.ro"
  type    = "A"
  
  alias {
    name                   = aws_cloudfront_distribution.codai_api.domain_name
    zone_id                = "Z2FDTNDATAQYW2"  # CloudFront hosted zone ID
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "admin" {
  zone_id = aws_route53_zone.codai_zone.zone_id
  name    = "admin.codai.ro"
  type    = "A"
  
  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "apps" {
  zone_id = aws_route53_zone.codai_zone.zone_id
  name    = "apps.codai.ro"
  type    = "A"
  
  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "gateway" {
  zone_id = aws_route53_zone.codai_zone.zone_id
  name    = "gateway.codai.ro"
  type    = "A"
  
  alias {
    name                   = aws_cloudfront_distribution.codai_gateway.domain_name
    zone_id                = "Z2FDTNDATAQYW2"  # CloudFront hosted zone ID
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "docs" {
  zone_id = aws_route53_zone.codai_zone.zone_id
  name    = "docs.codai.ro"
  type    = "A"
  
  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

# Root domain record
resource "aws_route53_record" "root" {
  zone_id = aws_route53_zone.codai_zone.zone_id
  name    = "codai.ro"
  type    = "A"
  
  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

# Output the nameservers for domain configuration
output "nameservers" {
  description = "Nameservers for codai.ro domain"
  value       = aws_route53_zone.codai_zone.name_servers
}

output "certificate_arn" {
  description = "SSL certificate ARN"
  value       = aws_acm_certificate.codai_cert.arn
}
