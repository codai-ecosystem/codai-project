# CODAI Terraform Variables
# Configuration for AWS infrastructure deployment

# Environment Configuration
environment = "production"
aws_region  = "us-east-1"

# Domain Configuration
domain_name = "codai.ai"

# Network Configuration
vpc_cidr = "10.0.0.0/16"

# Database Configuration
db_instance_class = "db.r6g.large"
db_allocated_storage = 100
db_max_allocated_storage = 1000

# Cache Configuration
redis_node_type = "cache.r6g.large"
redis_num_cache_clusters = 2

# ECS Configuration
ecs_cpu = 2048
ecs_memory = 4096

# Monitoring Configuration
log_retention_days = 7
enable_container_insights = true

# Auto Scaling Configuration
min_capacity = 2
max_capacity = 10
target_cpu_utilization = 70
target_memory_utilization = 80

# Security Configuration
enable_deletion_protection = false  # Set to true for production
backup_retention_period = 7
backup_window = "03:00-04:00"
maintenance_window = "sun:04:00-sun:05:00"

# SSL/TLS Configuration
ssl_policy = "ELBSecurityPolicy-TLS-1-2-2017-01"

# CloudFront Configuration
price_class = "PriceClass_All"

# Tags
default_tags = {
  Project     = "CODAI"
  Environment = "production"
  ManagedBy   = "Terraform"
  Owner       = "CODAI Team"
}
