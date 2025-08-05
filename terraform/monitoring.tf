# CODAI Monitoring and Observability Stack
# Comprehensive monitoring, alerting, and logging for production deployment

# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "codai_main" {
  dashboard_name = "CODAI-${var.environment}-Main-Dashboard"
  
  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", aws_lb.codai_alb.arn_suffix],
            [".", "TargetResponseTime", ".", "."],
            [".", "HTTPCode_Target_2XX_Count", ".", "."],
            [".", "HTTPCode_Target_4XX_Count", ".", "."],
            [".", "HTTPCode_Target_5XX_Count", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "Application Load Balancer Metrics"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        
        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ServiceName", "cbd-database", "ClusterName", aws_ecs_cluster.codai.name],
            [".", "MemoryUtilization", ".", ".", ".", "."],
            [".", "CPUUtilization", "ServiceName", "gateway-service", "ClusterName", aws_ecs_cluster.codai.name],
            [".", "MemoryUtilization", ".", ".", ".", "."],
            [".", "CPUUtilization", "ServiceName", "websocket-service", "ClusterName", aws_ecs_cluster.codai.name],
            [".", "MemoryUtilization", ".", ".", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "ECS Service Resource Utilization"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 8
        height = 6
        
        properties = {
          metrics = [
            ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", aws_db_instance.cbd.id],
            [".", "DatabaseConnections", ".", "."],
            [".", "FreeableMemory", ".", "."],
            [".", "FreeStorageSpace", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "RDS Database Metrics"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 8
        y      = 6
        width  = 8
        height = 6
        
        properties = {
          metrics = [
            ["AWS/ElastiCache", "CPUUtilization", "CacheClusterId", "${aws_elasticache_replication_group.codai.replication_group_id}-001"],
            [".", "NetworkBytesIn", ".", "."],
            [".", "NetworkBytesOut", ".", "."],
            [".", "CurrConnections", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "Redis Cache Metrics"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 16
        y      = 6
        width  = 8
        height = 6
        
        properties = {
          metrics = [
            ["AWS/CloudFront", "Requests", "DistributionId", aws_cloudfront_distribution.codai_cdn.id],
            [".", "BytesDownloaded", ".", "."],
            [".", "4xxErrorRate", ".", "."],
            [".", "5xxErrorRate", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "CloudFront CDN Metrics"
          period  = 300
        }
      }
    ]
  })
}

# CloudWatch Alarms

# ALB High Response Time
resource "aws_cloudwatch_metric_alarm" "alb_high_response_time" {
  alarm_name          = "codai-${var.environment}-alb-high-response-time"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = "120"
  statistic           = "Average"
  threshold           = "2"
  alarm_description   = "This metric monitors ALB response time"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  
  dimensions = {
    LoadBalancer = aws_lb.codai_alb.arn_suffix
  }
  
  tags = {
    Name = "codai-${var.environment}-alb-response-time-alarm"
  }
}

# ECS High CPU Utilization
resource "aws_cloudwatch_metric_alarm" "ecs_high_cpu" {
  for_each = toset([
    "cbd-database",
    "gateway-service", 
    "websocket-service",
    "ai-analytics",
    "collaboration-service",
    "graphql-gateway"
  ])
  
  alarm_name          = "codai-${var.environment}-${each.key}-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "120"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ECS CPU utilization for ${each.key}"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  
  dimensions = {
    ServiceName = each.key
    ClusterName = aws_ecs_cluster.codai.name
  }
  
  tags = {
    Name = "codai-${var.environment}-${each.key}-cpu-alarm"
  }
}

# ECS High Memory Utilization
resource "aws_cloudwatch_metric_alarm" "ecs_high_memory" {
  for_each = toset([
    "cbd-database",
    "gateway-service",
    "websocket-service", 
    "ai-analytics",
    "collaboration-service",
    "graphql-gateway"
  ])
  
  alarm_name          = "codai-${var.environment}-${each.key}-high-memory"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = "120"
  statistic           = "Average"
  threshold           = "85"
  alarm_description   = "This metric monitors ECS memory utilization for ${each.key}"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  
  dimensions = {
    ServiceName = each.key
    ClusterName = aws_ecs_cluster.codai.name
  }
  
  tags = {
    Name = "codai-${var.environment}-${each.key}-memory-alarm"
  }
}

# RDS High CPU
resource "aws_cloudwatch_metric_alarm" "rds_high_cpu" {
  alarm_name          = "codai-${var.environment}-rds-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "120"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors RDS CPU utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  
  dimensions = {
    DBInstanceIdentifier = aws_db_instance.cbd.id
  }
  
  tags = {
    Name = "codai-${var.environment}-rds-cpu-alarm"
  }
}

# RDS Low Storage Space
resource "aws_cloudwatch_metric_alarm" "rds_low_storage" {
  alarm_name          = "codai-${var.environment}-rds-low-storage"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = "120"
  statistic           = "Average"
  threshold           = "10737418240" # 10GB in bytes
  alarm_description   = "This metric monitors RDS free storage space"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  
  dimensions = {
    DBInstanceIdentifier = aws_db_instance.cbd.id
  }
  
  tags = {
    Name = "codai-${var.environment}-rds-storage-alarm"
  }
}

# Redis High CPU
resource "aws_cloudwatch_metric_alarm" "redis_high_cpu" {
  alarm_name          = "codai-${var.environment}-redis-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ElastiCache"
  period              = "120"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors Redis CPU utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  
  dimensions = {
    CacheClusterId = "${aws_elasticache_replication_group.codai.replication_group_id}-001"
  }
  
  tags = {
    Name = "codai-${var.environment}-redis-cpu-alarm"
  }
}

# SNS Topic for Alerts
resource "aws_sns_topic" "alerts" {
  name = "codai-${var.environment}-alerts"
  
  tags = {
    Name = "codai-${var.environment}-alerts-topic"
  }
}

# SNS Topic Subscription (Email)
resource "aws_sns_topic_subscription" "email_alerts" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = "alerts@codai.ai" # Replace with actual email
}

# Auto Scaling for ECS Services
resource "aws_appautoscaling_target" "ecs_targets" {
  for_each = toset([
    "cbd-database",
    "gateway-service",
    "websocket-service",
    "ai-analytics", 
    "collaboration-service",
    "graphql-gateway"
  ])
  
  max_capacity       = 10
  min_capacity       = 2
  resource_id        = "service/${aws_ecs_cluster.codai.name}/${each.key}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
  
  tags = {
    Name = "codai-${var.environment}-${each.key}-autoscaling-target"
  }
}

# Auto Scaling Policy - CPU Based
resource "aws_appautoscaling_policy" "ecs_cpu_policy" {
  for_each = toset([
    "cbd-database",
    "gateway-service",
    "websocket-service", 
    "ai-analytics",
    "collaboration-service",
    "graphql-gateway"
  ])
  
  name               = "codai-${var.environment}-${each.key}-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_targets[each.key].resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_targets[each.key].scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_targets[each.key].service_namespace
  
  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}

# Auto Scaling Policy - Memory Based
resource "aws_appautoscaling_policy" "ecs_memory_policy" {
  for_each = toset([
    "cbd-database",
    "gateway-service",
    "websocket-service",
    "ai-analytics",
    "collaboration-service", 
    "graphql-gateway"
  ])
  
  name               = "codai-${var.environment}-${each.key}-memory-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_targets[each.key].resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_targets[each.key].scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_targets[each.key].service_namespace
  
  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    target_value = 80.0
  }
}

# CloudWatch Insights for Log Analysis
resource "aws_cloudwatch_log_group" "application_insights" {
  name              = "/aws/codai/${var.environment}/application-insights"
  retention_in_days = 30
  
  tags = {
    Name = "codai-${var.environment}-application-insights"
  }
}

# AWS X-Ray for Distributed Tracing
resource "aws_iam_role_policy_attachment" "ecs_task_xray" {
  role       = aws_iam_role.ecs_task.name
  policy_arn = "arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess"
}

# Security Group for X-Ray
resource "aws_security_group" "xray" {
  name_prefix = "codai-${var.environment}-xray-"
  vpc_id      = aws_vpc.codai_vpc.id
  
  ingress {
    from_port       = 2000
    to_port         = 2000
    protocol        = "udp"
    security_groups = [aws_security_group.ecs.id]
  }
  
  tags = {
    Name = "codai-${var.environment}-xray-sg"
  }
}

# Custom Metrics for Business Logic
resource "aws_cloudwatch_log_metric_filter" "error_count" {
  name           = "codai-${var.environment}-error-count"
  log_group_name = aws_cloudwatch_log_group.codai_services["cbd-database"].name
  pattern        = "ERROR"
  
  metric_transformation {
    name      = "ErrorCount"
    namespace = "CODAI/Application"
    value     = "1"
  }
}

resource "aws_cloudwatch_log_metric_filter" "api_latency" {
  name           = "codai-${var.environment}-api-latency"
  log_group_name = aws_cloudwatch_log_group.codai_services["gateway-service"].name
  pattern        = "[timestamp, requestId, latency > 1000]"
  
  metric_transformation {
    name      = "HighLatencyRequests"
    namespace = "CODAI/Application"
    value     = "1"
  }
}

# Backup and Disaster Recovery
resource "aws_db_snapshot" "cbd_backup" {
  count                  = var.environment == "production" ? 1 : 0
  db_instance_identifier = aws_db_instance.cbd.id
  db_snapshot_identifier = "codai-${var.environment}-cbd-backup-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"
  
  tags = {
    Name = "codai-${var.environment}-cbd-backup"
  }
}
