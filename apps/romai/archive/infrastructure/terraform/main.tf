# RomAI Production Infrastructure
# Multi-cloud deployment for romcp.ro domain

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
  
  backend "s3" {
    bucket = "romai-terraform-state"
    key    = "production/terraform.tfstate"
    region = "eu-west-1"
  }
}

# Variables
variable "domain_name" {
  description = "Primary domain name"
  type        = string
  default     = "romcp.ro"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-1"
}

variable "azure_region" {
  description = "Azure region"
  type        = string
  default     = "West Europe"
}

variable "gcp_region" {
  description = "GCP region"
  type        = string
  default     = "europe-west1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "romai"
}

# AWS Provider
provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
      Domain      = var.domain_name
    }
  }
}

# Azure Provider
provider "azurerm" {
  features {}
}

# Google Cloud Provider
provider "google" {
  project = "romai-production"
  region  = var.gcp_region
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# Local values
locals {
  name_prefix = "${var.project_name}-${var.environment}"
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    Domain      = var.domain_name
    ManagedBy   = "terraform"
  }
}

# AWS Resources
## VPC and Networking
resource "aws_vpc" "romai_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-vpc"
  })
}

resource "aws_internet_gateway" "romai_igw" {
  vpc_id = aws_vpc.romai_vpc.id
  
  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-igw"
  })
}

resource "aws_subnet" "romai_public_subnets" {
  count = 3
  
  vpc_id                  = aws_vpc.romai_vpc.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  
  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-public-subnet-${count.index + 1}"
    Type = "public"
  })
}

resource "aws_subnet" "romai_private_subnets" {
  count = 3
  
  vpc_id            = aws_vpc.romai_vpc.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-private-subnet-${count.index + 1}"
    Type = "private"
  })
}

resource "aws_route_table" "romai_public_rt" {
  vpc_id = aws_vpc.romai_vpc.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.romai_igw.id
  }
  
  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-public-rt"
  })
}

resource "aws_route_table_association" "romai_public_rta" {
  count = length(aws_subnet.romai_public_subnets)
  
  subnet_id      = aws_subnet.romai_public_subnets[count.index].id
  route_table_id = aws_route_table.romai_public_rt.id
}

## EKS Cluster
resource "aws_iam_role" "romai_cluster_role" {
  name = "${local.name_prefix}-cluster-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
      }
    ]
  })
  
  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "romai_cluster_AmazonEKSClusterPolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.romai_cluster_role.name
}

resource "aws_eks_cluster" "romai_cluster" {
  name     = "${local.name_prefix}-cluster"
  role_arn = aws_iam_role.romai_cluster_role.arn
  version  = "1.28"
  
  vpc_config {
    subnet_ids              = concat(aws_subnet.romai_public_subnets[*].id, aws_subnet.romai_private_subnets[*].id)
    endpoint_private_access = true
    endpoint_public_access  = true
    public_access_cidrs     = ["0.0.0.0/0"]
  }
  
  enabled_cluster_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]
  
  depends_on = [
    aws_iam_role_policy_attachment.romai_cluster_AmazonEKSClusterPolicy
  ]
  
  tags = local.common_tags
}

## EKS Node Group
resource "aws_iam_role" "romai_node_role" {
  name = "${local.name_prefix}-node-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
  
  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "romai_node_AmazonEKSWorkerNodePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.romai_node_role.name
}

resource "aws_iam_role_policy_attachment" "romai_node_AmazonEKS_CNI_Policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.romai_node_role.name
}

resource "aws_iam_role_policy_attachment" "romai_node_AmazonEC2ContainerRegistryReadOnly" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.romai_node_role.name
}

resource "aws_eks_node_group" "romai_nodes" {
  cluster_name    = aws_eks_cluster.romai_cluster.name
  node_group_name = "${local.name_prefix}-nodes"
  node_role_arn   = aws_iam_role.romai_node_role.arn
  subnet_ids      = aws_subnet.romai_private_subnets[*].id
  
  instance_types = ["t3.medium", "t3.large"]
  ami_type       = "AL2_x86_64"
  capacity_type  = "ON_DEMAND"
  
  scaling_config {
    desired_size = 3
    max_size     = 10
    min_size     = 2
  }
  
  update_config {
    max_unavailable = 1
  }
  
  depends_on = [
    aws_iam_role_policy_attachment.romai_node_AmazonEKSWorkerNodePolicy,
    aws_iam_role_policy_attachment.romai_node_AmazonEKS_CNI_Policy,
    aws_iam_role_policy_attachment.romai_node_AmazonEC2ContainerRegistryReadOnly,
  ]
  
  tags = local.common_tags
}

## ElastiCache Redis
resource "aws_subnet_group" "romai_cache_subnet_group" {
  name       = "${local.name_prefix}-cache-subnet-group"
  subnet_ids = aws_subnet.romai_private_subnets[*].id
  
  tags = local.common_tags
}

resource "aws_security_group" "romai_redis_sg" {
  name        = "${local.name_prefix}-redis-sg"
  description = "Security group for ElastiCache Redis"
  vpc_id      = aws_vpc.romai_vpc.id
  
  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.romai_vpc.cidr_block]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-redis-sg"
  })
}

resource "aws_elasticache_replication_group" "romai_redis" {
  replication_group_id         = "${local.name_prefix}-redis"
  description                  = "Redis cluster for RomAI"
  
  node_type                    = "cache.t3.micro"
  port                         = 6379
  parameter_group_name         = "default.redis7"
  
  num_cache_clusters           = 2
  automatic_failover_enabled   = true
  multi_az_enabled            = true
  
  subnet_group_name           = aws_subnet_group.romai_cache_subnet_group.name
  security_group_ids          = [aws_security_group.romai_redis_sg.id]
  
  at_rest_encryption_enabled  = true
  transit_encryption_enabled  = true
  
  maintenance_window          = "sun:03:00-sun:04:00"
  snapshot_retention_limit    = 7
  snapshot_window             = "02:00-03:00"
  
  tags = local.common_tags
}

## ECR Repository
resource "aws_ecr_repository" "romai_api" {
  name                 = "romai-api"
  image_tag_mutability = "MUTABLE"
  
  image_scanning_configuration {
    scan_on_push = true
  }
  
  encryption_configuration {
    encryption_type = "AES256"
  }
  
  tags = local.common_tags
}

# Azure Resources
## Resource Group
resource "azurerm_resource_group" "romai_rg" {
  name     = "${local.name_prefix}-rg"
  location = var.azure_region
  
  tags = local.common_tags
}

## Container Registry
resource "azurerm_container_registry" "romai_acr" {
  name                = "romairegistry"
  resource_group_name = azurerm_resource_group.romai_rg.name
  location            = azurerm_resource_group.romai_rg.location
  sku                 = "Basic"
  admin_enabled       = true
  
  tags = local.common_tags
}

## Container Instance for CBD Service
resource "azurerm_container_group" "romai_cbd" {
  name                = "${local.name_prefix}-cbd"
  location            = azurerm_resource_group.romai_rg.location
  resource_group_name = azurerm_resource_group.romai_rg.name
  ip_address_type     = "Public"
  dns_name_label      = "romai-cbd"
  os_type             = "Linux"
  
  container {
    name   = "cbd-service"
    image  = "romairegistry.azurecr.io/cbd-universal:latest"
    cpu    = "2"
    memory = "4"
    
    ports {
      port     = 4180
      protocol = "TCP"
    }
    
    environment_variables = {
      NODE_ENV = "production"
    }
    
    secure_environment_variables = {
      AZURE_OPENAI_API_KEY = "@Microsoft.KeyVault(SecretUri=https://romai-kv.vault.azure.net/secrets/azure-openai-api-key/)"
    }
  }
  
  image_registry_credential {
    server   = azurerm_container_registry.romai_acr.login_server
    username = azurerm_container_registry.romai_acr.admin_username
    password = azurerm_container_registry.romai_acr.admin_password
  }
  
  tags = local.common_tags
}

## Key Vault for Secrets
resource "azurerm_key_vault" "romai_kv" {
  name                = "romai-kv"
  location            = azurerm_resource_group.romai_rg.location
  resource_group_name = azurerm_resource_group.romai_rg.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  
  sku_name = "standard"
  
  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id
    
    secret_permissions = [
      "Get", "Set", "Delete", "List", "Purge"
    ]
  }
  
  tags = local.common_tags
}

data "azurerm_client_config" "current" {}

# Google Cloud Resources
## Enable APIs
resource "google_project_service" "romai_apis" {
  for_each = toset([
    "run.googleapis.com",
    "containerregistry.googleapis.com",
    "cloudbuild.googleapis.com"
  ])
  
  service = each.value
  
  disable_dependent_services = true
}

## Cloud Run Service for MCP Server
resource "google_cloud_run_service" "romai_mcp" {
  name     = "${local.name_prefix}-mcp"
  location = var.gcp_region
  
  template {
    spec {
      containers {
        image = "gcr.io/romai-production/mcp-server:latest"
        
        env {
          name  = "NODE_ENV"
          value = "production"
        }
        
        resources {
          limits = {
            cpu    = "2000m"
            memory = "2Gi"
          }
        }
        
        ports {
          container_port = 8080
        }
      }
      
      container_concurrency = 100
      timeout_seconds       = 300
    }
    
    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale"         = "100"
        "run.googleapis.com/execution-environment" = "gen2"
      }
    }
  }
  
  traffic {
    percent         = 100
    latest_revision = true
  }
  
  depends_on = [google_project_service.romai_apis]
}

## IAM for Cloud Run
resource "google_cloud_run_service_iam_member" "romai_mcp_invoker" {
  service  = google_cloud_run_service.romai_mcp.name
  location = google_cloud_run_service.romai_mcp.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Outputs
output "aws_cluster_endpoint" {
  description = "AWS EKS cluster endpoint"
  value       = aws_eks_cluster.romai_cluster.endpoint
}

output "aws_cluster_name" {
  description = "AWS EKS cluster name"
  value       = aws_eks_cluster.romai_cluster.name
}

output "aws_redis_endpoint" {
  description = "AWS ElastiCache Redis endpoint"
  value       = aws_elasticache_replication_group.romai_redis.primary_endpoint_address
}

output "azure_cbd_fqdn" {
  description = "Azure Container Instance FQDN"
  value       = azurerm_container_group.romai_cbd.fqdn
}

output "azure_container_registry_url" {
  description = "Azure Container Registry URL"
  value       = azurerm_container_registry.romai_acr.login_server
}

output "gcp_mcp_url" {
  description = "Google Cloud Run MCP service URL"
  value       = google_cloud_run_service.romai_mcp.status[0].url
}

output "deployment_summary" {
  description = "Deployment summary"
  value = {
    domain           = var.domain_name
    environment      = var.environment
    aws_region       = var.aws_region
    azure_region     = var.azure_region
    gcp_region       = var.gcp_region
    cluster_name     = aws_eks_cluster.romai_cluster.name
    redis_endpoint   = aws_elasticache_replication_group.romai_redis.primary_endpoint_address
    cbd_fqdn        = azurerm_container_group.romai_cbd.fqdn
    mcp_url         = google_cloud_run_service.romai_mcp.status[0].url
  }
}
