# ALB Listeners
resource "aws_lb_listener" "memorai_alb_http" {
  load_balancer_arn = aws_lb.memorai_alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.memorai_api_tg.arn
  }
}

# ALB Listener Rules for different services
resource "aws_lb_listener_rule" "memorai_mcp" {
  listener_arn = aws_lb_listener.memorai_alb_http.arn
  priority     = 200

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.memorai_mcp_tg.arn
  }

  condition {
    path_pattern {
      values = ["/mcp/*"]
    }
  }
}
