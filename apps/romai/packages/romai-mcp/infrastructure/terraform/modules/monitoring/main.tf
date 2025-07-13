# ROMAI Ultimate MCP Server - Monitoring Module
# Comprehensive monitoring, alerting, and observability infrastructure

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "cluster_name" {
  description = "ECS cluster name"
  type        = string
}

variable "service_name" {
  description = "ECS service name"
  type        = string
}

variable "alb_arn_suffix" {
  description = "ALB ARN suffix for CloudWatch metrics"
  type        = string
}

variable "target_group_arn_suffix" {
  description = "Target Group ARN suffix for CloudWatch metrics"
  type        = string
}

variable "notification_email" {
  description = "Email for notifications"
  type        = string
  default     = ""
}

# SNS Topic for Alerts
resource "aws_sns_topic" "romai_alerts" {
  name = "romai-mcp-alerts-${var.environment}"

  tags = {
    Name = "romai-mcp-alerts-${var.environment}"
  }
}

# SNS Topic Subscription
resource "aws_sns_topic_subscription" "email_alerts" {
  count     = var.notification_email != "" ? 1 : 0
  topic_arn = aws_sns_topic.romai_alerts.arn
  protocol  = "email"
  endpoint  = var.notification_email
}

# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "romai_dashboard" {
  dashboard_name = "ROMAI-MCP-${var.environment}"

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
            ["AWS/ECS", "CPUUtilization", "ServiceName", var.service_name, "ClusterName", var.cluster_name],
            [".", "MemoryUtilization", ".", ".", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "us-east-1"
          title   = "ECS Service Metrics"
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
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", var.alb_arn_suffix],
            [".", "TargetResponseTime", ".", "."],
            [".", "HTTPCode_Target_2XX_Count", ".", "."],
            [".", "HTTPCode_Target_4XX_Count", ".", "."],
            [".", "HTTPCode_Target_5XX_Count", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "us-east-1"
          title   = "Load Balancer Metrics"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", "romai-mcp-db-${var.environment}"],
            [".", "DatabaseConnections", ".", "."],
            [".", "ReadLatency", ".", "."],
            [".", "WriteLatency", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "us-east-1"
          title   = "Database Metrics"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 6
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/ElastiCache", "CPUUtilization", "CacheClusterId", "romai-mcp-redis-${var.environment}"],
            [".", "CurrConnections", ".", "."],
            [".", "CacheHits", ".", "."],
            [".", "CacheMisses", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "us-east-1"
          title   = "Redis Cache Metrics"
          period  = 300
        }
      }
    ]
  })
}

# CloudWatch Alarms - ECS Service
resource "aws_cloudwatch_metric_alarm" "ecs_cpu_high" {
  alarm_name          = "romai-mcp-ecs-cpu-high-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "ECS service CPU utilization is high"
  alarm_actions       = [aws_sns_topic.romai_alerts.arn]

  dimensions = {
    ServiceName = var.service_name
    ClusterName = var.cluster_name
  }

  tags = {
    Name = "romai-mcp-ecs-cpu-high-${var.environment}"
  }
}

resource "aws_cloudwatch_metric_alarm" "ecs_memory_high" {
  alarm_name          = "romai-mcp-ecs-memory-high-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = "85"
  alarm_description   = "ECS service memory utilization is high"
  alarm_actions       = [aws_sns_topic.romai_alerts.arn]

  dimensions = {
    ServiceName = var.service_name
    ClusterName = var.cluster_name
  }

  tags = {
    Name = "romai-mcp-ecs-memory-high-${var.environment}"
  }
}

# CloudWatch Alarms - Application Load Balancer
resource "aws_cloudwatch_metric_alarm" "alb_response_time_high" {
  alarm_name          = "romai-mcp-alb-response-time-high-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = "300"
  statistic           = "Average"
  threshold           = "1.0"
  alarm_description   = "ALB target response time is high"
  alarm_actions       = [aws_sns_topic.romai_alerts.arn]

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }

  tags = {
    Name = "romai-mcp-alb-response-time-high-${var.environment}"
  }
}

resource "aws_cloudwatch_metric_alarm" "alb_5xx_errors" {
  alarm_name          = "romai-mcp-alb-5xx-errors-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "ALB 5XX error count is high"
  alarm_actions       = [aws_sns_topic.romai_alerts.arn]

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }

  tags = {
    Name = "romai-mcp-alb-5xx-errors-${var.environment}"
  }
}

# CloudWatch Alarms - RDS
resource "aws_cloudwatch_metric_alarm" "rds_cpu_high" {
  alarm_name          = "romai-mcp-rds-cpu-high-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "RDS CPU utilization is high"
  alarm_actions       = [aws_sns_topic.romai_alerts.arn]

  dimensions = {
    DBInstanceIdentifier = "romai-mcp-db-${var.environment}"
  }

  tags = {
    Name = "romai-mcp-rds-cpu-high-${var.environment}"
  }
}

resource "aws_cloudwatch_metric_alarm" "rds_connections_high" {
  alarm_name          = "romai-mcp-rds-connections-high-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "RDS connection count is high"
  alarm_actions       = [aws_sns_topic.romai_alerts.arn]

  dimensions = {
    DBInstanceIdentifier = "romai-mcp-db-${var.environment}"
  }

  tags = {
    Name = "romai-mcp-rds-connections-high-${var.environment}"
  }
}

# CloudWatch Alarms - ElastiCache
resource "aws_cloudwatch_metric_alarm" "redis_cpu_high" {
  alarm_name          = "romai-mcp-redis-cpu-high-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ElastiCache"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "Redis CPU utilization is high"
  alarm_actions       = [aws_sns_topic.romai_alerts.arn]

  dimensions = {
    CacheClusterId = "romai-mcp-redis-${var.environment}"
  }

  tags = {
    Name = "romai-mcp-redis-cpu-high-${var.environment}"
  }
}

# Custom Metrics for Application
resource "aws_cloudwatch_log_metric_filter" "error_count" {
  name           = "romai-mcp-error-count-${var.environment}"
  log_group_name = "/ecs/romai-mcp-${var.environment}"
  pattern        = "[timestamp, request_id, level=ERROR, ...]"

  metric_transformation {
    name      = "ErrorCount"
    namespace = "ROMAI/MCP"
    value     = "1"
  }
}

resource "aws_cloudwatch_metric_alarm" "application_errors" {
  alarm_name          = "romai-mcp-application-errors-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "ErrorCount"
  namespace           = "ROMAI/MCP"
  period              = "300"
  statistic           = "Sum"
  threshold           = "5"
  alarm_description   = "Application error count is high"
  alarm_actions       = [aws_sns_topic.romai_alerts.arn]

  tags = {
    Name = "romai-mcp-application-errors-${var.environment}"
  }
}

# Output values
output "sns_topic_arn" {
  description = "SNS topic ARN for alerts"
  value       = aws_sns_topic.romai_alerts.arn
}

output "dashboard_url" {
  description = "CloudWatch dashboard URL"
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=${aws_cloudwatch_dashboard.romai_dashboard.dashboard_name}"
}
