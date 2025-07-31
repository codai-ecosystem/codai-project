# Cluster Autoscaler
resource "aws_iam_role" "cluster_autoscaler" {
  count = var.enable_cluster_autoscaler ? 1 : 0
  name  = "${local.project_name}-${local.environment}-cluster-autoscaler-role"

  assume_role_policy = jsonencode({
    Statement = [{
      Action = "sts:AssumeRoleWithWebIdentity"
      Effect = "Allow"
      Principal = {
        Federated = aws_iam_openid_connect_provider.eks.arn
      }
      Condition = {
        StringEquals = {
          "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:sub": "system:serviceaccount:kube-system:cluster-autoscaler"
          "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:aud": "sts.amazonaws.com"
        }
      }
    }]
    Version = "2012-10-17"
  })

  tags = local.common_tags
}

resource "aws_iam_policy" "cluster_autoscaler" {
  count = var.enable_cluster_autoscaler ? 1 : 0
  name  = "${local.project_name}-${local.environment}-cluster-autoscaler-policy"

  policy = jsonencode({
    Statement = [
      {
        Action = [
          "autoscaling:DescribeAutoScalingGroups",
          "autoscaling:DescribeAutoScalingInstances",
          "autoscaling:DescribeLaunchConfigurations",
          "autoscaling:DescribeTags",
          "autoscaling:SetDesiredCapacity",
          "autoscaling:TerminateInstanceInAutoScalingGroup",
          "ec2:DescribeInstanceTypes",
          "ec2:DescribeLaunchTemplateVersions"
        ]
        Effect = "Allow"
        Resource = "*"
      }
    ]
    Version = "2012-10-17"
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "cluster_autoscaler" {
  count      = var.enable_cluster_autoscaler ? 1 : 0
  policy_arn = aws_iam_policy.cluster_autoscaler[0].arn
  role       = aws_iam_role.cluster_autoscaler[0].name
}

# Load Balancer Controller
resource "aws_iam_role" "aws_load_balancer_controller" {
  name = "${local.project_name}-${local.environment}-aws-load-balancer-controller-role"

  assume_role_policy = jsonencode({
    Statement = [{
      Action = "sts:AssumeRoleWithWebIdentity"
      Effect = "Allow"
      Principal = {
        Federated = aws_iam_openid_connect_provider.eks.arn
      }
      Condition = {
        StringEquals = {
          "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:sub": "system:serviceaccount:kube-system:aws-load-balancer-controller"
          "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:aud": "sts.amazonaws.com"
        }
      }
    }]
    Version = "2012-10-17"
  })

  tags = local.common_tags
}

data "http" "aws_load_balancer_controller_policy" {
  url = "https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.5.4/docs/install/iam_policy.json"
}

resource "aws_iam_policy" "aws_load_balancer_controller" {
  name   = "${local.project_name}-${local.environment}-aws-load-balancer-controller-policy"
  policy = data.http.aws_load_balancer_controller_policy.response_body

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "aws_load_balancer_controller" {
  policy_arn = aws_iam_policy.aws_load_balancer_controller.arn
  role       = aws_iam_role.aws_load_balancer_controller.name
}

# External DNS
resource "aws_iam_role" "external_dns" {
  name = "${local.project_name}-${local.environment}-external-dns-role"

  assume_role_policy = jsonencode({
    Statement = [{
      Action = "sts:AssumeRoleWithWebIdentity"
      Effect = "Allow"
      Principal = {
        Federated = aws_iam_openid_connect_provider.eks.arn
      }
      Condition = {
        StringEquals = {
          "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:sub": "system:serviceaccount:kube-system:external-dns"
          "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:aud": "sts.amazonaws.com"
        }
      }
    }]
    Version = "2012-10-17"
  })

  tags = local.common_tags
}

resource "aws_iam_policy" "external_dns" {
  name = "${local.project_name}-${local.environment}-external-dns-policy"

  policy = jsonencode({
    Statement = [
      {
        Action = [
          "route53:ChangeResourceRecordSets"
        ]
        Effect = "Allow"
        Resource = "arn:aws:route53:::hostedzone/*"
      },
      {
        Action = [
          "route53:ListHostedZones",
          "route53:ListResourceRecordSets"
        ]
        Effect = "Allow"
        Resource = "*"
      }
    ]
    Version = "2012-10-17"
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "external_dns" {
  policy_arn = aws_iam_policy.external_dns.arn
  role       = aws_iam_role.external_dns.name
}

# Container Insights
resource "aws_iam_role" "cloudwatch_agent" {
  count = var.enable_monitoring ? 1 : 0
  name  = "${local.project_name}-${local.environment}-cloudwatch-agent-role"

  assume_role_policy = jsonencode({
    Statement = [{
      Action = "sts:AssumeRoleWithWebIdentity"
      Effect = "Allow"
      Principal = {
        Federated = aws_iam_openid_connect_provider.eks.arn
      }
      Condition = {
        StringEquals = {
          "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:sub": "system:serviceaccount:amazon-cloudwatch:cloudwatch-agent"
          "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:aud": "sts.amazonaws.com"
        }
      }
    }]
    Version = "2012-10-17"
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "cloudwatch_agent" {
  count      = var.enable_monitoring ? 1 : 0
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
  role       = aws_iam_role.cloudwatch_agent[0].name
}

# ECR Repository for Gateway Service
resource "aws_ecr_repository" "gateway" {
  name                 = "${local.project_name}/gateway"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = merge(local.common_tags, {
    Name = "${local.project_name}-gateway-ecr"
  })
}

resource "aws_ecr_lifecycle_policy" "gateway" {
  repository = aws_ecr_repository.gateway.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 30 production images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["v", "release"]
          countType     = "imageCountMoreThan"
          countNumber   = 30
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Keep last 10 development images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["dev", "feature", "hotfix"]
          countType     = "imageCountMoreThan"
          countNumber   = 10
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 3
        description  = "Delete untagged images older than 1 day"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 1
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# RDS Aurora PostgreSQL for Gateway Service
resource "aws_db_subnet_group" "gateway" {
  name       = "${local.project_name}-${local.environment}-gateway-db-subnet-group"
  subnet_ids = module.vpc.private_subnets

  tags = merge(local.common_tags, {
    Name = "${local.project_name}-${local.environment}-gateway-db-subnet-group"
  })
}

resource "aws_security_group" "rds" {
  name_prefix = "${local.project_name}-${local.environment}-rds-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_nodes.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${local.project_name}-${local.environment}-rds-sg"
  })
}

resource "aws_rds_cluster" "gateway" {
  cluster_identifier      = "${local.project_name}-${local.environment}-gateway"
  engine                  = "aurora-postgresql"
  engine_version          = "15.4"
  availability_zones      = local.azs
  database_name          = "codai"
  master_username        = "codai_admin"
  manage_master_user_password = true
  
  backup_retention_period = var.environment == "production" ? 7 : 3
  preferred_backup_window = "07:00-09:00"
  preferred_maintenance_window = "sun:09:00-sun:10:00"
  
  db_subnet_group_name   = aws_db_subnet_group.gateway.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  
  storage_encrypted   = true
  kms_key_id         = aws_kms_key.rds.arn
  deletion_protection = var.environment == "production"
  
  enabled_cloudwatch_logs_exports = ["postgresql"]
  
  skip_final_snapshot = var.environment != "production"
  final_snapshot_identifier = var.environment == "production" ? "${local.project_name}-${local.environment}-gateway-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null

  tags = merge(local.common_tags, {
    Name = "${local.project_name}-${local.environment}-gateway-aurora"
  })
}

resource "aws_rds_cluster_instance" "gateway" {
  count              = var.environment == "production" ? 2 : 1
  identifier         = "${local.project_name}-${local.environment}-gateway-${count.index}"
  cluster_identifier = aws_rds_cluster.gateway.id
  instance_class     = var.environment == "production" ? "db.r6g.large" : "db.t4g.medium"
  engine             = aws_rds_cluster.gateway.engine
  engine_version     = aws_rds_cluster.gateway.engine_version

  performance_insights_enabled = true
  monitoring_interval          = 60
  monitoring_role_arn         = aws_iam_role.rds_enhanced_monitoring.arn

  tags = merge(local.common_tags, {
    Name = "${local.project_name}-${local.environment}-gateway-aurora-${count.index}"
  })
}

# KMS Key for RDS encryption
resource "aws_kms_key" "rds" {
  description             = "RDS encryption key for ${local.project_name}-${local.environment}"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = merge(local.common_tags, {
    Name = "${local.project_name}-${local.environment}-rds-key"
  })
}

resource "aws_kms_alias" "rds" {
  name          = "alias/${local.project_name}-${local.environment}-rds"
  target_key_id = aws_kms_key.rds.key_id
}

# RDS Enhanced Monitoring
resource "aws_iam_role" "rds_enhanced_monitoring" {
  name = "${local.project_name}-${local.environment}-rds-enhanced-monitoring"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "rds_enhanced_monitoring" {
  role       = aws_iam_role.rds_enhanced_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# ElastiCache Redis for caching
resource "aws_elasticache_subnet_group" "gateway" {
  name       = "${local.project_name}-${local.environment}-gateway-cache-subnet"
  subnet_ids = module.vpc.private_subnets

  tags = local.common_tags
}

resource "aws_security_group" "redis" {
  name_prefix = "${local.project_name}-${local.environment}-redis-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_nodes.id]
  }

  tags = merge(local.common_tags, {
    Name = "${local.project_name}-${local.environment}-redis-sg"
  })
}

resource "aws_elasticache_replication_group" "gateway" {
  replication_group_id       = "${local.project_name}-${local.environment}-gateway-redis"
  description                = "Redis cluster for ${local.project_name} Gateway"
  
  node_type                  = var.environment == "production" ? "cache.r6g.large" : "cache.t4g.micro"
  port                       = 6379
  parameter_group_name       = aws_elasticache_parameter_group.gateway.name
  
  num_cache_clusters         = var.environment == "production" ? 2 : 1
  automatic_failover_enabled = var.environment == "production"
  multi_az_enabled          = var.environment == "production"
  
  subnet_group_name = aws_elasticache_subnet_group.gateway.name
  security_group_ids = [aws_security_group.redis.id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                = random_password.redis_auth_token.result
  
  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.redis.name
    destination_type = "cloudwatch-logs"
    log_format       = "text"
    log_type         = "slow-log"
  }

  tags = merge(local.common_tags, {
    Name = "${local.project_name}-${local.environment}-gateway-redis"
  })
}

resource "aws_elasticache_parameter_group" "gateway" {
  family = "redis7"
  name   = "${local.project_name}-${local.environment}-gateway-redis-params"

  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }

  tags = local.common_tags
}

resource "random_password" "redis_auth_token" {
  length  = 32
  special = true
}

resource "aws_cloudwatch_log_group" "redis" {
  name              = "/aws/elasticache/${local.project_name}-${local.environment}-gateway-redis"
  retention_in_days = 7

  tags = local.common_tags
}
