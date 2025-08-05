# Auto Scaling Configuration - Phase 2 (After ECS Services Creation)
# This file will be used after ECS services are created

# Commented out until ECS services exist
# Will be enabled in Phase 4.5.2 after container deployment

/*
# Auto Scaling Targets for ECS Services
resource "aws_appautoscaling_target" "ecs_target" {
  for_each = toset(["cbd-database", "gateway", "memorai-mcp", "websocket-service", "ssl-proxy"])
  
  max_capacity       = 3
  min_capacity       = 1
  resource_id        = "service/${aws_ecs_cluster.main.name}/codai-${each.key}-prod"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
  
  depends_on = [
    aws_ecs_service.services  # This will be created later
  ]
}

# Auto Scaling Policies - Scale Up
resource "aws_appautoscaling_policy" "ecs_scale_up" {
  for_each = toset(["cbd-database", "gateway", "memorai-mcp", "websocket-service", "ssl-proxy"])
  
  name               = "codai-${each.key}-scale-up"
  policy_type        = "StepScaling"
  resource_id        = aws_appautoscaling_target.ecs_target[each.key].resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target[each.key].scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target[each.key].service_namespace

  step_scaling_policy_configuration {
    adjustment_type         = "ChangeInCapacity"
    cooldown               = 60
    metric_aggregation_type = "Average"

    step_adjustment {
      metric_interval_lower_bound = 0
      scaling_adjustment          = 1
    }
  }
}

# Auto Scaling Policies - Scale Down
resource "aws_appautoscaling_policy" "ecs_scale_down" {
  for_each = toset(["cbd-database", "gateway", "memorai-mcp", "websocket-service", "ssl-proxy"])
  
  name               = "codai-${each.key}-scale-down"
  policy_type        = "StepScaling"
  resource_id        = aws_appautoscaling_target.ecs_target[each.key].resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target[each.key].scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target[each.key].service_namespace

  step_scaling_policy_configuration {
    adjustment_type         = "ChangeInCapacity"
    cooldown               = 180
    metric_aggregation_type = "Average"

    step_adjustment {
      metric_interval_upper_bound = 0
      scaling_adjustment          = -1
    }
  }
}

# CloudWatch Alarms for CPU High
resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  for_each = toset(["cbd-database", "gateway", "memorai-mcp", "websocket-service", "ssl-proxy"])
  
  alarm_name          = "codai-${each.key}-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Average"
  threshold           = "70"
  alarm_description   = "This metric monitors ECS CPU utilization for ${each.key}"

  dimensions = {
    ClusterName = aws_ecs_cluster.main.name
    ServiceName = "codai-${each.key}-prod"
  }

  alarm_actions = [aws_appautoscaling_policy.ecs_scale_up[each.key].arn]
  treat_missing_data = "missing"
}

# CloudWatch Alarms for CPU Low
resource "aws_cloudwatch_metric_alarm" "cpu_low" {
  for_each = toset(["cbd-database", "gateway", "memorai-mcp", "websocket-service", "ssl-proxy"])
  
  alarm_name          = "codai-${each.key}-cpu-low"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Average"
  threshold           = "30"
  alarm_description   = "This metric monitors ECS CPU utilization for ${each.key}"

  dimensions = {
    ClusterName = aws_ecs_cluster.main.name
    ServiceName = "codai-${each.key}-prod"
  }

  alarm_actions = [aws_appautoscaling_policy.ecs_scale_down[each.key].arn]
  treat_missing_data = "missing"
}
*/
