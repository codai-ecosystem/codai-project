# VPC Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = module.vpc.vpc_cidr_block
}

output "private_subnets" {
  description = "List of IDs of private subnets"
  value       = module.vpc.private_subnets
}

output "public_subnets" {
  description = "List of IDs of public subnets"
  value       = module.vpc.public_subnets
}

# EKS Outputs
output "cluster_id" {
  description = "EKS cluster ID"
  value       = module.eks.cluster_id
}

output "cluster_arn" {
  description = "EKS cluster ARN"
  value       = module.eks.cluster_arn
}

output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = module.eks.cluster_endpoint
}

output "cluster_security_group_id" {
  description = "Security group ID attached to the EKS cluster"
  value       = module.eks.cluster_security_group_id
}

output "cluster_iam_role_name" {
  description = "IAM role name associated with EKS cluster"
  value       = module.eks.cluster_iam_role_name
}

output "cluster_iam_role_arn" {
  description = "IAM role ARN associated with EKS cluster"
  value       = module.eks.cluster_iam_role_arn
}

output "cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data required to communicate with the cluster"
  value       = module.eks.cluster_certificate_authority_data
}

output "cluster_primary_security_group_id" {
  description = "The cluster primary security group ID created by the EKS cluster"
  value       = module.eks.cluster_primary_security_group_id
}

output "oidc_provider_arn" {
  description = "The ARN of the OIDC Provider if enabled"
  value       = module.eks.oidc_provider_arn
}

# Node Groups Outputs
output "eks_managed_node_groups" {
  description = "Map of attribute maps for all EKS managed node groups created"
  value       = module.eks.eks_managed_node_groups
}

# RDS Outputs
output "rds_instance_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.metadata.endpoint
  sensitive   = true
}

output "rds_instance_hosted_zone_id" {
  description = "RDS instance hosted zone ID"
  value       = aws_db_instance.metadata.hosted_zone_id
}

output "rds_instance_id" {
  description = "RDS instance ID"
  value       = aws_db_instance.metadata.id
}

output "rds_instance_resource_id" {
  description = "RDS instance resource ID"
  value       = aws_db_instance.metadata.resource_id
}

output "rds_instance_status" {
  description = "RDS instance status"
  value       = aws_db_instance.metadata.status
}

output "rds_instance_name" {
  description = "RDS instance name"
  value       = aws_db_instance.metadata.db_name
}

output "rds_instance_username" {
  description = "RDS instance root username"
  value       = aws_db_instance.metadata.username
  sensitive   = true
}

output "rds_instance_port" {
  description = "RDS instance port"
  value       = aws_db_instance.metadata.port
}

# ElastiCache Outputs
output "elasticache_redis_cluster_arn" {
  description = "ARN of the ElastiCache Redis cluster"
  value       = aws_elasticache_replication_group.redis.arn
}

output "elasticache_redis_cluster_id" {
  description = "ID of the ElastiCache Redis cluster"
  value       = aws_elasticache_replication_group.redis.id
}

output "elasticache_redis_primary_endpoint_address" {
  description = "Address of the endpoint for the primary node in the Redis cluster"
  value       = aws_elasticache_replication_group.redis.primary_endpoint_address
}

output "elasticache_redis_configuration_endpoint_address" {
  description = "Address of the replication group configuration endpoint when cluster mode is enabled"
  value       = aws_elasticache_replication_group.redis.configuration_endpoint_address
}

output "elasticache_redis_member_clusters" {
  description = "List of member cluster IDs"
  value       = aws_elasticache_replication_group.redis.member_clusters
}

# S3 Outputs
output "s3_bucket_id" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.data.id
}

output "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.data.arn
}

output "s3_bucket_domain_name" {
  description = "Domain name of the S3 bucket"
  value       = aws_s3_bucket.data.bucket_domain_name
}

output "s3_bucket_regional_domain_name" {
  description = "Regional domain name of the S3 bucket"
  value       = aws_s3_bucket.data.bucket_regional_domain_name
}

# Load Balancer Outputs
output "load_balancer_id" {
  description = "ID of the load balancer"
  value       = aws_lb.main.id
}

output "load_balancer_arn" {
  description = "ARN of the load balancer"
  value       = aws_lb.main.arn
}

output "load_balancer_dns_name" {
  description = "DNS name of the load balancer"
  value       = aws_lb.main.dns_name
}

output "load_balancer_zone_id" {
  description = "Zone ID of the load balancer"
  value       = aws_lb.main.zone_id
}

# Security Groups Outputs
output "worker_security_group_id" {
  description = "ID of the worker node security group"
  value       = aws_security_group.worker_nodes.id
}

output "rds_security_group_id" {
  description = "ID of the RDS security group"
  value       = aws_security_group.rds.id
}

output "redis_security_group_id" {
  description = "ID of the Redis security group"
  value       = aws_security_group.redis.id
}

output "alb_security_group_id" {
  description = "ID of the ALB security group"
  value       = aws_security_group.alb.id
}

# KMS Keys Outputs
output "eks_kms_key_arn" {
  description = "ARN of the KMS key used for EKS encryption"
  value       = aws_kms_key.eks.arn
}

output "rds_kms_key_arn" {
  description = "ARN of the KMS key used for RDS encryption"
  value       = aws_kms_key.rds.arn
}

output "s3_kms_key_arn" {
  description = "ARN of the KMS key used for S3 encryption"
  value       = aws_kms_key.s3.arn
}

output "elasticache_kms_key_arn" {
  description = "ARN of the KMS key used for ElastiCache encryption"
  value       = aws_kms_key.elasticache.arn
}

# Certificate Outputs
output "acm_certificate_arn" {
  description = "ARN of the ACM certificate"
  value       = var.domain_name != "" ? aws_acm_certificate.main[0].arn : null
}

output "acm_certificate_status" {
  description = "Status of the ACM certificate"
  value       = var.domain_name != "" ? aws_acm_certificate.main[0].status : null
}

# Route 53 Outputs
output "route53_zone_id" {
  description = "Zone ID of the Route 53 hosted zone"
  value       = var.domain_name != "" ? data.aws_route53_zone.main[0].zone_id : null
}

output "route53_zone_name" {
  description = "Name of the Route 53 hosted zone"
  value       = var.domain_name != "" ? data.aws_route53_zone.main[0].name : null
}

# Configuration Outputs for Kubernetes
output "cluster_config" {
  description = "Configuration for kubectl"
  value = {
    cluster_name                         = module.eks.cluster_id
    cluster_endpoint                     = module.eks.cluster_endpoint
    cluster_certificate_authority_data   = module.eks.cluster_certificate_authority_data
    cluster_security_group_id           = module.eks.cluster_security_group_id
    oidc_provider_arn                   = module.eks.oidc_provider_arn
  }
  sensitive = true
}

# Database Connection String
output "database_connection_string" {
  description = "Database connection string"
  value       = "postgresql://${aws_db_instance.metadata.username}@${aws_db_instance.metadata.endpoint}/${aws_db_instance.metadata.db_name}"
  sensitive   = true
}

# Redis Connection String
output "redis_connection_string" {
  description = "Redis connection string"
  value       = "redis://${aws_elasticache_replication_group.redis.primary_endpoint_address}:6379"
  sensitive   = true
}

# Summary Output
output "deployment_summary" {
  description = "Summary of deployed resources"
  value = {
    region                    = var.aws_region
    environment              = var.environment
    vpc_id                   = module.vpc.vpc_id
    cluster_name             = module.eks.cluster_id
    cluster_endpoint         = module.eks.cluster_endpoint
    database_endpoint        = aws_db_instance.metadata.endpoint
    redis_endpoint           = aws_elasticache_replication_group.redis.primary_endpoint_address
    load_balancer_dns        = aws_lb.main.dns_name
    s3_bucket               = aws_s3_bucket.data.id
    domain_name             = var.domain_name
  }
}
