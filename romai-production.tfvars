# RomAI Production Deployment Configuration
# For deployment to AWS with Azure AI integration

# Environment Configuration
environment = "production"
aws_region = "us-east-1"

# VPC Configuration
vpc_cidr = "10.0.0.0/16"

# Domain Configuration  
domain_name = "romcp.ro"

# Kubernetes Configuration
kubernetes_version = "1.30"
cluster_endpoint_public_access_cidrs = ["0.0.0.0/0"]

# Database Configuration
db_name = "romai_production"
db_username = "romai_admin"
db_password = "PLACEHOLDER_WILL_BE_GENERATED"

# RDS Configuration
rds_instance_class = "db.r6g.2xlarge"
rds_allocated_storage = 500
rds_max_allocated_storage = 2000

# Redis Configuration
redis_node_type = "cache.r7g.2xlarge"
redis_num_cache_nodes = 3
redis_auth_token = "PLACEHOLDER_WILL_BE_GENERATED"

# Auto-scaling Configuration
min_nodes = 5
max_nodes = 50
desired_nodes = 8

# Security Configuration
enable_encryption = true
enable_detailed_monitoring = true

# Cost Optimization
enable_spot_instances = true

# Backup Configuration
backup_retention_days = 30
