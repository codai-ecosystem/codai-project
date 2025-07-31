# Outputs for EKS Cluster
output "cluster_id" {
  description = "EKS cluster ID"
  value       = aws_eks_cluster.main.id
}

output "cluster_arn" {
  description = "EKS cluster ARN"
  value       = aws_eks_cluster.main.arn
}

output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = aws_eks_cluster.main.endpoint
}

output "cluster_security_group_id" {
  description = "Security group ids attached to the cluster control plane"
  value       = aws_security_group.eks_cluster.id
}

output "cluster_iam_role_name" {
  description = "IAM role name associated with EKS cluster"
  value       = aws_iam_role.eks_cluster.name
}

output "cluster_iam_role_arn" {
  description = "IAM role ARN associated with EKS cluster"
  value       = aws_iam_role.eks_cluster.arn
}

output "cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data required to communicate with the cluster"
  value       = aws_eks_cluster.main.certificate_authority[0].data
}

output "cluster_primary_security_group_id" {
  description = "Cluster security group that was created by Amazon EKS for the cluster"
  value       = aws_eks_cluster.main.vpc_config[0].cluster_security_group_id
}

output "cluster_version" {
  description = "The Kubernetes version for the EKS cluster"
  value       = aws_eks_cluster.main.version
}

# Node Group Outputs
output "node_groups" {
  description = "EKS node groups"
  value       = aws_eks_node_group.main
  sensitive   = true
}

output "node_security_group_id" {
  description = "ID of the node shared security group"
  value       = aws_security_group.eks_nodes.id
}

# OIDC Provider Outputs
output "cluster_oidc_issuer_url" {
  description = "The URL on the EKS cluster for the OpenID Connect identity provider"
  value       = aws_eks_cluster.main.identity[0].oidc[0].issuer
}

output "oidc_provider_arn" {
  description = "The ARN of the OIDC Provider if enabled"
  value       = aws_iam_openid_connect_provider.eks.arn
}

# VPC Outputs
output "vpc_id" {
  description = "ID of the VPC where the cluster and its nodes will be provisioned"
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

# Database Outputs
output "rds_cluster_endpoint" {
  description = "RDS Aurora cluster endpoint"
  value       = aws_rds_cluster.gateway.endpoint
  sensitive   = true
}

output "rds_cluster_reader_endpoint" {
  description = "RDS Aurora cluster reader endpoint"
  value       = aws_rds_cluster.gateway.reader_endpoint
  sensitive   = true
}

output "rds_cluster_master_username" {
  description = "RDS Aurora cluster master username"
  value       = aws_rds_cluster.gateway.master_username
  sensitive   = true
}

output "rds_cluster_database_name" {
  description = "RDS Aurora cluster database name"
  value       = aws_rds_cluster.gateway.database_name
}

output "rds_cluster_port" {
  description = "RDS Aurora cluster port"
  value       = aws_rds_cluster.gateway.port
}

# Redis Outputs
output "redis_cluster_address" {
  description = "Redis cluster address"
  value       = aws_elasticache_replication_group.gateway.primary_endpoint_address
  sensitive   = true
}

output "redis_cluster_port" {
  description = "Redis cluster port"
  value       = aws_elasticache_replication_group.gateway.port
}

# ECR Repository Outputs
output "ecr_repository_url" {
  description = "URL of the ECR repository"
  value       = aws_ecr_repository.gateway.repository_url
}

output "ecr_repository_arn" {
  description = "ARN of the ECR repository" 
  value       = aws_ecr_repository.gateway.arn
}

# IAM Role ARNs for Service Accounts
output "cluster_autoscaler_role_arn" {
  description = "IAM role ARN for cluster autoscaler"
  value       = var.enable_cluster_autoscaler ? aws_iam_role.cluster_autoscaler[0].arn : null
}

output "aws_load_balancer_controller_role_arn" {
  description = "IAM role ARN for AWS Load Balancer Controller"
  value       = aws_iam_role.aws_load_balancer_controller.arn
}

output "external_dns_role_arn" {
  description = "IAM role ARN for External DNS"
  value       = aws_iam_role.external_dns.arn
}

output "cloudwatch_agent_role_arn" {
  description = "IAM role ARN for CloudWatch Agent"
  value       = var.enable_monitoring ? aws_iam_role.cloudwatch_agent[0].arn : null
}

# KMS Key Outputs
output "kms_key_arn" {
  description = "The Amazon Resource Name (ARN) of the EKS KMS key"
  value       = aws_kms_key.eks.arn
}

output "kms_key_id" {
  description = "The globally unique identifier for the EKS KMS key"
  value       = aws_kms_key.eks.key_id
}

# Configuration Commands
output "kubectl_config" {
  description = "kubectl config command to configure local access"
  value       = "aws eks update-kubeconfig --region ${var.region} --name ${aws_eks_cluster.main.name}"
}

output "kubeconfig_certificate_authority_data" {
  description = "Certificate authority data for kubectl config"
  value       = aws_eks_cluster.main.certificate_authority[0].data
}

# Monitoring and Logging
output "cloudwatch_log_group_name" {
  description = "CloudWatch log group name for EKS cluster logs"
  value       = aws_cloudwatch_log_group.eks_cluster.name
}

# Environment Information
output "environment" {
  description = "Environment name"
  value       = var.environment
}

output "region" {
  description = "AWS region"
  value       = var.region
}

output "project_name" {
  description = "Project name"
  value       = local.project_name
}

# Cluster Access Information
output "cluster_access_info" {
  description = "Information needed to access the cluster"
  value = {
    cluster_name                = aws_eks_cluster.main.name
    cluster_endpoint           = aws_eks_cluster.main.endpoint
    cluster_ca_certificate     = aws_eks_cluster.main.certificate_authority[0].data
    oidc_issuer_url           = aws_eks_cluster.main.identity[0].oidc[0].issuer
    kubectl_config_command     = "aws eks update-kubeconfig --region ${var.region} --name ${aws_eks_cluster.main.name}"
  }
  sensitive = true
}

# Database Connection Information
output "database_connection_info" {
  description = "Database connection information"
  value = {
    host     = aws_rds_cluster.gateway.endpoint
    port     = aws_rds_cluster.gateway.port
    database = aws_rds_cluster.gateway.database_name
    username = aws_rds_cluster.gateway.master_username
  }
  sensitive = true
}

# Redis Connection Information
output "redis_connection_info" {
  description = "Redis connection information"
  value = {
    host = aws_elasticache_replication_group.gateway.primary_endpoint_address
    port = aws_elasticache_replication_group.gateway.port
  }
  sensitive = true
}
