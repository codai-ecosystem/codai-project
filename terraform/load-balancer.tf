# CODAI Load Balancer Configuration
# Target groups and listeners for all backend services

# Target Groups
resource "aws_lb_target_group" "cbd_database" {
  name     = "codai-${var.environment}-cbd-db"
  port     = 4180
  protocol = "HTTP"
  vpc_id   = aws_vpc.codai_vpc.id
  target_type = "ip"
  
  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }
  
  tags = {
    Name = "codai-${var.environment}-cbd-database-tg"
  }
}

resource "aws_lb_target_group" "gateway_service" {
  name     = "codai-${var.environment}-gateway"
  port     = 4003
  protocol = "HTTP"
  vpc_id   = aws_vpc.codai_vpc.id
  target_type = "ip"
  
  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }
  
  tags = {
    Name = "codai-${var.environment}-gateway-service-tg"
  }
}

resource "aws_lb_target_group" "websocket_service" {
  name     = "codai-${var.environment}-websocket"
  port     = 4900
  protocol = "HTTP"
  vpc_id   = aws_vpc.codai_vpc.id
  target_type = "ip"
  
  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }
  
  tags = {
    Name = "codai-${var.environment}-websocket-service-tg"
  }
}

resource "aws_lb_target_group" "ai_analytics" {
  name     = "codai-${var.environment}-ai-analytics"
  port     = 4700
  protocol = "HTTP"
  vpc_id   = aws_vpc.codai_vpc.id
  target_type = "ip"
  
  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }
  
  tags = {
    Name = "codai-${var.environment}-ai-analytics-tg"
  }
}

resource "aws_lb_target_group" "collaboration_service" {
  name     = "codai-${var.environment}-collab"
  port     = 4600
  protocol = "HTTP"
  vpc_id   = aws_vpc.codai_vpc.id
  target_type = "ip"
  
  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }
  
  tags = {
    Name = "codai-${var.environment}-collaboration-service-tg"
  }
}

resource "aws_lb_target_group" "graphql_gateway" {
  name     = "codai-${var.environment}-graphql"
  port     = 4800
  protocol = "HTTP"
  vpc_id   = aws_vpc.codai_vpc.id
  target_type = "ip"
  
  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }
  
  tags = {
    Name = "codai-${var.environment}-graphql-gateway-tg"
  }
}

# HTTPS Listener
resource "aws_lb_listener" "codai_https" {
  load_balancer_arn = aws_lb.codai_alb.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = aws_acm_certificate.codai.arn
  
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.gateway_service.arn
  }
  
  tags = {
    Name = "codai-${var.environment}-https-listener"
  }
}

# HTTP Listener (redirect to HTTPS)
resource "aws_lb_listener" "codai_http" {
  load_balancer_arn = aws_lb.codai_alb.arn
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
    Name = "codai-${var.environment}-http-listener"
  }
}

# Listener Rules for Path-based Routing

# CBD Database API
resource "aws_lb_listener_rule" "cbd_database" {
  listener_arn = aws_lb_listener.codai_https.arn
  priority     = 100
  
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.cbd_database.arn
  }
  
  condition {
    path_pattern {
      values = ["/api/cbd/*", "/cbd/*"]
    }
  }
  
  tags = {
    Name = "codai-${var.environment}-cbd-database-rule"
  }
}

# Gateway Service (default)
resource "aws_lb_listener_rule" "gateway_service" {
  listener_arn = aws_lb_listener.codai_https.arn
  priority     = 200
  
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.gateway_service.arn
  }
  
  condition {
    path_pattern {
      values = ["/api/*", "/gateway/*"]
    }
  }
  
  tags = {
    Name = "codai-${var.environment}-gateway-service-rule"
  }
}

# WebSocket Service
resource "aws_lb_listener_rule" "websocket_service" {
  listener_arn = aws_lb_listener.codai_https.arn
  priority     = 300
  
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.websocket_service.arn
  }
  
  condition {
    path_pattern {
      values = ["/ws/*", "/websocket/*"]
    }
  }
  
  tags = {
    Name = "codai-${var.environment}-websocket-service-rule"
  }
}

# AI Analytics Service
resource "aws_lb_listener_rule" "ai_analytics" {
  listener_arn = aws_lb_listener.codai_https.arn
  priority     = 400
  
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.ai_analytics.arn
  }
  
  condition {
    path_pattern {
      values = ["/api/analytics/*", "/analytics/*"]
    }
  }
  
  tags = {
    Name = "codai-${var.environment}-ai-analytics-rule"
  }
}

# Collaboration Service
resource "aws_lb_listener_rule" "collaboration_service" {
  listener_arn = aws_lb_listener.codai_https.arn
  priority     = 500
  
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.collaboration_service.arn
  }
  
  condition {
    path_pattern {
      values = ["/api/collaboration/*", "/collaboration/*"]
    }
  }
  
  tags = {
    Name = "codai-${var.environment}-collaboration-service-rule"
  }
}

# GraphQL Gateway
resource "aws_lb_listener_rule" "graphql_gateway" {
  listener_arn = aws_lb_listener.codai_https.arn
  priority     = 600
  
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.graphql_gateway.arn
  }
  
  condition {
    path_pattern {
      values = ["/graphql", "/graphql/*"]
    }
  }
  
  tags = {
    Name = "codai-${var.environment}-graphql-gateway-rule"
  }
}

# Service Discovery
resource "aws_service_discovery_private_dns_namespace" "codai" {
  name        = "codai-${var.environment}.local"
  description = "Service discovery namespace for CODAI"
  vpc         = aws_vpc.codai_vpc.id
  
  tags = {
    Name = "codai-${var.environment}-service-discovery"
  }
}

resource "aws_service_discovery_service" "cbd_database" {
  name = "cbd-database"
  
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.codai.id
    
    dns_records {
      ttl  = 10
      type = "A"
    }
  }
  
  health_check_grace_period_seconds = 30
  
  tags = {
    Name = "codai-${var.environment}-cbd-database-discovery"
  }
}

resource "aws_service_discovery_service" "gateway_service" {
  name = "gateway-service"
  
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.codai.id
    
    dns_records {
      ttl  = 10
      type = "A"
    }
  }
  
  health_check_grace_period_seconds = 30
  
  tags = {
    Name = "codai-${var.environment}-gateway-service-discovery"
  }
}

resource "aws_service_discovery_service" "websocket_service" {
  name = "websocket-service"
  
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.codai.id
    
    dns_records {
      ttl  = 10
      type = "A"
    }
  }
  
  health_check_grace_period_seconds = 30
  
  tags = {
    Name = "codai-${var.environment}-websocket-service-discovery"
  }
}

resource "aws_service_discovery_service" "ai_analytics" {
  name = "ai-analytics"
  
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.codai.id
    
    dns_records {
      ttl  = 10
      type = "A"
    }
  }
  
  health_check_grace_period_seconds = 30
  
  tags = {
    Name = "codai-${var.environment}-ai-analytics-discovery"
  }
}

resource "aws_service_discovery_service" "collaboration_service" {
  name = "collaboration-service"
  
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.codai.id
    
    dns_records {
      ttl  = 10
      type = "A"
    }
  }
  
  health_check_grace_period_seconds = 30
  
  tags = {
    Name = "codai-${var.environment}-collaboration-service-discovery"
  }
}

resource "aws_service_discovery_service" "graphql_gateway" {
  name = "graphql-gateway"
  
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.codai.id
    
    dns_records {
      ttl  = 10
      type = "A"
    }
  }
  
  health_check_grace_period_seconds = 30
  
  tags = {
    Name = "codai-${var.environment}-graphql-gateway-discovery"
  }
}
