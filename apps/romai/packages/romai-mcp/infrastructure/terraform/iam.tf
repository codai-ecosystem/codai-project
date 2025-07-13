# ROMAI Ultimate MCP Server - IAM Roles and Policies
# Security and access management for ECS and other services

# ECS Execution Role
resource "aws_iam_role" "ecs_execution_role" {
  name = "romai-mcp-ecs-execution-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "romai-mcp-ecs-execution-role-${var.environment}"
  }
}

# ECS Execution Role Policy Attachment
resource "aws_iam_role_policy_attachment" "ecs_execution_role_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Custom ECS Execution Role Policy for Secrets Manager
resource "aws_iam_role_policy" "ecs_execution_secrets_policy" {
  name = "romai-mcp-ecs-execution-secrets-policy-${var.environment}"
  role = aws_iam_role.ecs_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = [
          aws_secretsmanager_secret.db_url.arn,
          aws_secretsmanager_secret.redis_url.arn,
          aws_secretsmanager_secret.jwt_secret.arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt"
        ]
        Resource = aws_kms_key.romai_key.arn
      }
    ]
  })
}

# ECS Task Role
resource "aws_iam_role" "ecs_task_role" {
  name = "romai-mcp-ecs-task-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "romai-mcp-ecs-task-role-${var.environment}"
  }
}

# ECS Task Role Policy for Application Permissions
resource "aws_iam_role_policy" "ecs_task_policy" {
  name = "romai-mcp-ecs-task-policy-${var.environment}"
  role = aws_iam_role.ecs_task_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = [
          aws_secretsmanager_secret.db_url.arn,
          aws_secretsmanager_secret.redis_url.arn,
          aws_secretsmanager_secret.jwt_secret.arn,
          "${aws_secretsmanager_secret.db_url.arn}:*",
          "${aws_secretsmanager_secret.redis_url.arn}:*",
          "${aws_secretsmanager_secret.jwt_secret.arn}:*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:DescribeKey"
        ]
        Resource = aws_kms_key.romai_key.arn
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams",
          "logs:DescribeLogGroups"
        ]
        Resource = "${aws_cloudwatch_log_group.romai_logs.arn}:*"
      },
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData",
          "cloudwatch:GetMetricStatistics",
          "cloudwatch:ListMetrics"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "cloudwatch:namespace" = "ROMAI/MCP"
          }
        }
      },
      {
        Effect = "Allow"
        Action = [
          "xray:PutTraceSegments",
          "xray:PutTelemetryRecords"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = [
          "${aws_s3_bucket.romai_storage.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "s3:GetBucketLocation"
        ]
        Resource = aws_s3_bucket.romai_storage.arn
      }
    ]
  })
}

# Auto Scaling Role
resource "aws_iam_role" "ecs_autoscaling_role" {
  name = "romai-mcp-ecs-autoscaling-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "application-autoscaling.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "romai-mcp-ecs-autoscaling-role-${var.environment}"
  }
}

# Auto Scaling Role Policy
resource "aws_iam_role_policy_attachment" "ecs_autoscaling_role_policy" {
  role       = aws_iam_role.ecs_autoscaling_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSServiceRolePolicy"
}

# CloudWatch Events Role for ECS
resource "aws_iam_role" "ecs_events_role" {
  name = "romai-mcp-ecs-events-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "events.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "romai-mcp-ecs-events-role-${var.environment}"
  }
}

# CloudWatch Events Role Policy
resource "aws_iam_role_policy" "ecs_events_role_policy" {
  name = "romai-mcp-ecs-events-role-policy-${var.environment}"
  role = aws_iam_role.ecs_events_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecs:RunTask",
          "ecs:StopTask",
          "ecs:DescribeTasks"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "iam:PassRole"
        ]
        Resource = [
          aws_iam_role.ecs_execution_role.arn,
          aws_iam_role.ecs_task_role.arn
        ]
      }
    ]
  })
}

# Lambda Execution Role for Custom Resources
resource "aws_iam_role" "lambda_execution_role" {
  name = "romai-mcp-lambda-execution-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "romai-mcp-lambda-execution-role-${var.environment}"
  }
}

# Lambda Execution Role Policy
resource "aws_iam_role_policy_attachment" "lambda_execution_role_policy" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Custom Lambda Policy for ROMAI Operations
resource "aws_iam_role_policy" "lambda_romai_policy" {
  name = "romai-mcp-lambda-romai-policy-${var.environment}"
  role = aws_iam_role.lambda_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecs:DescribeServices",
          "ecs:UpdateService",
          "ecs:DescribeTasks",
          "ecs:ListTasks"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "rds:DescribeDBInstances",
          "rds:ModifyDBInstance",
          "rds:CreateDBSnapshot"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "elasticache:DescribeReplicationGroups",
          "elasticache:ModifyReplicationGroup",
          "elasticache:CreateSnapshot"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData",
          "cloudwatch:GetMetricStatistics"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = "arn:aws:sns:*:*:romai-mcp-alerts-*"
      }
    ]
  })
}

# S3 Bucket for Application Storage
resource "aws_s3_bucket" "romai_storage" {
  bucket = "romai-mcp-storage-${var.environment}-${random_id.bucket_suffix.hex}"

  tags = {
    Name = "romai-mcp-storage-${var.environment}"
  }
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# S3 Bucket Versioning
resource "aws_s3_bucket_versioning" "romai_storage_versioning" {
  bucket = aws_s3_bucket.romai_storage.id
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 Bucket Encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "romai_storage_encryption" {
  bucket = aws_s3_bucket.romai_storage.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.romai_key.arn
      sse_algorithm     = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

# S3 Bucket Public Access Block
resource "aws_s3_bucket_public_access_block" "romai_storage_pab" {
  bucket = aws_s3_bucket.romai_storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 Bucket Lifecycle Configuration
resource "aws_s3_bucket_lifecycle_configuration" "romai_storage_lifecycle" {
  bucket = aws_s3_bucket.romai_storage.id

  rule {
    id     = "romai_storage_lifecycle"
    status = "Enabled"

    expiration {
      days = 365
    }

    noncurrent_version_expiration {
      noncurrent_days = 90
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

# Secrets Manager Secrets
resource "aws_secretsmanager_secret" "db_url" {
  name                    = "romai-mcp-db-url-${var.environment}"
  description             = "Database URL for ROMAI MCP Server"
  kms_key_id             = aws_kms_key.romai_key.arn
  recovery_window_in_days = var.environment == "production" ? 30 : 0

  tags = {
    Name = "romai-mcp-db-url-${var.environment}"
  }
}

resource "aws_secretsmanager_secret" "redis_url" {
  name                    = "romai-mcp-redis-url-${var.environment}"
  description             = "Redis URL for ROMAI MCP Server"
  kms_key_id             = aws_kms_key.romai_key.arn
  recovery_window_in_days = var.environment == "production" ? 30 : 0

  tags = {
    Name = "romai-mcp-redis-url-${var.environment}"
  }
}

resource "aws_secretsmanager_secret" "jwt_secret" {
  name                    = "romai-mcp-jwt-secret-${var.environment}"
  description             = "JWT Secret for ROMAI MCP Server"
  kms_key_id             = aws_kms_key.romai_key.arn
  recovery_window_in_days = var.environment == "production" ? 30 : 0

  tags = {
    Name = "romai-mcp-jwt-secret-${var.environment}"
  }
}

# Generate JWT Secret
resource "random_password" "jwt_secret" {
  length  = 64
  special = true
}

# Secret Versions
resource "aws_secretsmanager_secret_version" "db_url" {
  secret_id     = aws_secretsmanager_secret.db_url.id
  secret_string = "postgresql://romai:${random_password.db_password.result}@${aws_db_instance.romai_db.endpoint}/romai"
}

resource "aws_secretsmanager_secret_version" "redis_url" {
  secret_id     = aws_secretsmanager_secret.redis_url.id
  secret_string = "redis://:${random_password.redis_password.result}@${aws_elasticache_replication_group.romai_redis.primary_endpoint_address}:6379"
}

resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = random_password.jwt_secret.result
}
