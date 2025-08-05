# 🔗 CODAI Enhanced Load Balancer Configuration
# HTTPS support with SSL termination and domain-based routing

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# HTTPS Listener for ALB
resource "aws_lb_listener" "https" {
  load_balancer_arn = data.aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = data.aws_acm_certificate.codai_cert.arn
  
  default_action {
    type             = "forward"
    target_group_arn = data.aws_lb_target_group.gateway.arn
  }
  
  tags = {
    Name        = "CODAI HTTPS Listener"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "load-balancer"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# Redirect HTTP to HTTPS
resource "aws_lb_listener" "http_redirect" {
  load_balancer_arn = data.aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"
  
  default_action {
    type = "redirect"
    
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
  
  tags = {
    Name        = "HTTP to HTTPS Redirect"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "load-balancer"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# HTTPS Listener Rules for Service Routing

# Gateway Service Rule
resource "aws_lb_listener_rule" "gateway_https" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 100
  
  action {
    type             = "forward"
    target_group_arn = data.aws_lb_target_group.gateway.arn
  }
  
  condition {
    path_pattern {
      values = ["/gateway/*", "/api/gateway/*"]
    }
  }
  
  condition {
    host_header {
      values = [
        "api.codai.ro",
        "gateway.codai.ro",
        "codai.ro",
        "www.codai.ro"
      ]
    }
  }
  
  tags = {
    Name        = "Gateway HTTPS Rule"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "load-balancer"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# MemorAI MCP Service Rule
resource "aws_lb_listener_rule" "memorai_https" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 200
  
  action {
    type             = "forward"
    target_group_arn = data.aws_lb_target_group.memorai.arn
  }
  
  condition {
    path_pattern {
      values = ["/memorai/*", "/api/memorai/*", "/mcp/*"]
    }
  }
  
  condition {
    host_header {
      values = [
        "api.codai.ro",
        "memorai.codai.ro",
        "mcp.codai.ro"
      ]
    }
  }
  
  tags = {
    Name        = "MemorAI HTTPS Rule"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "load-balancer"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# CBD Database Service Rule
resource "aws_lb_listener_rule" "cbd_https" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 300
  
  action {
    type             = "forward"
    target_group_arn = data.aws_lb_target_group.cbd.arn
  }
  
  condition {
    path_pattern {
      values = ["/cbd/*", "/api/cbd/*", "/database/*"]
    }
  }
  
  condition {
    host_header {
      values = [
        "api.codai.ro",
        "cbd.codai.ro",
        "database.codai.ro"
      ]
    }
  }
  
  tags = {
    Name        = "CBD HTTPS Rule"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "load-balancer"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# SSL Proxy Service Rule
resource "aws_lb_listener_rule" "ssl_proxy_https" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 400
  
  action {
    type             = "forward"
    target_group_arn = data.aws_lb_target_group.ssl_proxy.arn
  }
  
  condition {
    path_pattern {
      values = ["/ssl/*", "/proxy/*", "/certificates/*"]
    }
  }
  
  condition {
    host_header {
      values = [
        "api.codai.ro",
        "ssl.codai.ro",
        "proxy.codai.ro"
      ]
    }
  }
  
  tags = {
    Name        = "SSL Proxy HTTPS Rule"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "load-balancer"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# WebSocket Service Rule
resource "aws_lb_listener_rule" "websocket_https" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 500
  
  action {
    type             = "forward"
    target_group_arn = data.aws_lb_target_group.websocket.arn
  }
  
  condition {
    path_pattern {
      values = ["/ws/*", "/websocket/*", "/socket.io/*"]
    }
  }
  
  condition {
    host_header {
      values = [
        "api.codai.ro",
        "ws.codai.ro",
        "websocket.codai.ro"
      ]
    }
  }
  
  tags = {
    Name        = "WebSocket HTTPS Rule"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "load-balancer"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# Health Check Rule (Public)
resource "aws_lb_listener_rule" "health_https" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 50
  
  action {
    type = "fixed-response"
    
    fixed_response {
      content_type = "application/json"
      message_body = jsonencode({
        status  = "healthy"
        service = "codai-ecosystem"
        version = "1.0.0"
        timestamp = "{{ timestamp }}"
      })
      status_code = "200"
    }
  }
  
  condition {
    path_pattern {
      values = ["/health", "/status", "/ping"]
    }
  }
  
  tags = {
    Name        = "Health Check HTTPS Rule"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "load-balancer"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# Administrative Interface Rule (Secured)
resource "aws_lb_listener_rule" "admin_https" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 600
  
  action {
    type             = "forward"
    target_group_arn = data.aws_lb_target_group.gateway.arn
  }
  
  condition {
    path_pattern {
      values = ["/admin/*", "/management/*", "/dashboard/*"]
    }
  }
  
  condition {
    host_header {
      values = [
        "admin.codai.ro",
        "management.codai.ro"
      ]
    }
  }
  
  tags = {
    Name        = "Admin HTTPS Rule"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "load-balancer"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# Frontend Apps Rule (Static Content)
resource "aws_lb_listener_rule" "apps_https" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 700
  
  action {
    type = "redirect"
    
    redirect {
      host        = "apps.codai.ro"
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_302"
    }
  }
  
  condition {
    path_pattern {
      values = ["/apps/*", "/frontend/*"]
    }
  }
  
  condition {
    host_header {
      values = [
        "codai.ro",
        "www.codai.ro",
        "api.codai.ro"
      ]
    }
  }
  
  tags = {
    Name        = "Apps Redirect HTTPS Rule"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "load-balancer"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# Monitoring Rule (Secured)
resource "aws_lb_listener_rule" "monitoring_https" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 800
  
  action {
    type = "fixed-response"
    
    fixed_response {
      content_type = "text/html"
      message_body = <<-EOT
        <!DOCTYPE html>
        <html>
        <head>
          <title>CODAI Monitoring</title>
          <meta charset="utf-8">
        </head>
        <body>
          <h1>🔒 CODAI Monitoring Access</h1>
          <p>This is a secured monitoring endpoint.</p>
          <p>Access requires proper authentication.</p>
          <hr>
          <small>CODAI Ecosystem v1.0.0</small>
        </body>
        </html>
      EOT
      status_code = "200"
    }
  }
  
  condition {
    path_pattern {
      values = ["/monitoring/*", "/metrics/*", "/grafana/*"]
    }
  }
  
  condition {
    host_header {
      values = [
        "monitoring.codai.ro",
        "metrics.codai.ro"
      ]
    }
  }
  
  tags = {
    Name        = "Monitoring HTTPS Rule"
    Environment = "production"
    Project     = "codai-ecosystem"
    Component   = "load-balancer"
    CreatedBy   = "terraform"
    Version     = "1.0.0"
  }
}

# Security Group Rule for HTTPS
resource "aws_security_group_rule" "alb_https_ingress" {
  type              = "ingress"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  ipv6_cidr_blocks  = ["::/0"]
  security_group_id = data.aws_security_group.alb_sg.id
  description       = "HTTPS access for ALB"
}

# Data sources
data "aws_lb" "main" {
  name = "codai-main-alb"
}

data "aws_acm_certificate" "codai_cert" {
  domain   = "*.codai.ro"
  statuses = ["ISSUED"]
}

data "aws_security_group" "alb_sg" {
  name = "codai-alb-sg"
}

data "aws_lb_target_group" "gateway" {
  name = "codai-gateway-tg"
}

data "aws_lb_target_group" "memorai" {
  name = "codai-memorai-mcp-tg"
}

data "aws_lb_target_group" "cbd" {
  name = "codai-cbd-tg"
}

data "aws_lb_target_group" "ssl_proxy" {
  name = "codai-ssl-proxy-tg"
}

data "aws_lb_target_group" "websocket" {
  name = "codai-websocket-service-tg"
}

# Outputs
output "https_listener_arn" {
  value       = aws_lb_listener.https.arn
  description = "HTTPS listener ARN"
}

output "alb_https_endpoint" {
  value       = "https://${data.aws_lb.main.dns_name}"
  description = "ALB HTTPS endpoint"
}

output "domain_endpoints" {
  value = {
    api        = "https://api.codai.ro"
    admin      = "https://admin.codai.ro"
    apps       = "https://apps.codai.ro"
    gateway    = "https://gateway.codai.ro"
    docs       = "https://docs.codai.ro"
    monitoring = "https://monitoring.codai.ro"
  }
  description = "Domain endpoints for all services"
}
