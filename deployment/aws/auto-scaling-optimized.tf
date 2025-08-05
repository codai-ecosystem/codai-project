# ECS Service Auto-scaling configuration - Cost Optimized
resource "aws_appautoscaling_target" "ecs_target" {
  for_each = toset([
    "cbd-database",
    "gateway",
    "memorai-mcp",
    "websocket-service",
    "ssl-proxy"
  ])

  max_capacity       = 3
  min_capacity       = 1
  resource_id        = "service/${aws_ecs_cluster.main.name}/${var.project_name}-${each.key}-${var.environment}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "ecs_scale_up" {
  for_each = toset([
    "cbd-database",
    "gateway",
    "memorai-mcp",
    "websocket-service",
    "ssl-proxy"
  ])

  name               = "${var.project_name}-${each.key}-scale-up"
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

resource "aws_appautoscaling_policy" "ecs_scale_down" {
  for_each = toset([
    "cbd-database",
    "gateway",
    "memorai-mcp",
    "websocket-service",
    "ssl-proxy"
  ])

  name               = "${var.project_name}-${each.key}-scale-down"
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

resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  for_each = toset([
    "cbd-database",
    "gateway",
    "memorai-mcp",
    "websocket-service",
    "ssl-proxy"
  ])

  alarm_name          = "${var.project_name}-${each.key}-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Average"
  threshold           = "70"
  alarm_description   = "This metric monitors ECS CPU utilization for ${each.key}"
  alarm_actions       = [aws_appautoscaling_policy.ecs_scale_up[each.key].arn]

  dimensions = {
    ServiceName = "${var.project_name}-${each.key}-${var.environment}"
    ClusterName = aws_ecs_cluster.main.name
  }
}

resource "aws_cloudwatch_metric_alarm" "cpu_low" {
  for_each = toset([
    "cbd-database",
    "gateway",
    "memorai-mcp",
    "websocket-service",
    "ssl-proxy"
  ])

  alarm_name          = "${var.project_name}-${each.key}-cpu-low"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Average"
  threshold           = "30"
  alarm_description   = "This metric monitors ECS CPU utilization for ${each.key}"
  alarm_actions       = [aws_appautoscaling_policy.ecs_scale_down[each.key].arn]

  dimensions = {
    ServiceName = "${var.project_name}-${each.key}-${var.environment}"
    ClusterName = aws_ecs_cluster.main.name
  }
}
