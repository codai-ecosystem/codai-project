# ☁️ Microsoft Azure (AKS) Deployment Configuration
# Production-ready AKS cluster for ROMAI services
# Generated for Phase 4 Week 4 Day 25 - Cloud Deployment & Scaling

# =============================================================================
# 🏗️ AKS Cluster Configuration (Terraform)
# =============================================================================
terraform {
  required_version = ">= 1.5"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.80"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
  }
  
  backend "azurerm" {
    resource_group_name  = "romai-terraform-state"
    storage_account_name = "romaiterraformstate"
    container_name       = "tfstate"
    key                  = "aks/production.tfstate"
  }
}

# Provider configuration
provider "azurerm" {
  features {}
}

# Variables
variable "resource_group_name" {
  description = "Azure Resource Group Name"
  type        = string
  default     = "romai-production-rg"
}

variable "location" {
  description = "Azure Region"
  type        = string
  default     = "West Europe"
}

variable "cluster_name" {
  description = "AKS Cluster Name"
  type        = string
  default     = "romai-production-aks"
}

variable "environment" {
  description = "Environment"
  type        = string
  default     = "production"
}

# =============================================================================
# 🏢 Resource Group
# =============================================================================
resource "azurerm_resource_group" "romai_rg" {
  name     = var.resource_group_name
  location = var.location
  
  tags = {
    Environment = var.environment
    Project     = "ROMAI"
    ManagedBy   = "Terraform"
  }
}

# =============================================================================
# 🌐 Virtual Network Configuration
# =============================================================================
resource "azurerm_virtual_network" "romai_vnet" {
  name                = "romai-production-vnet"
  address_space       = ["10.0.0.0/8"]
  location            = azurerm_resource_group.romai_rg.location
  resource_group_name = azurerm_resource_group.romai_rg.name
  
  tags = {
    Environment = var.environment
    Project     = "ROMAI"
  }
}

resource "azurerm_subnet" "romai_aks_subnet" {
  name                 = "romai-aks-subnet"
  resource_group_name  = azurerm_resource_group.romai_rg.name
  virtual_network_name = azurerm_virtual_network.romai_vnet.name
  address_prefixes     = ["10.1.0.0/16"]
}

resource "azurerm_subnet" "romai_services_subnet" {
  name                 = "romai-services-subnet"
  resource_group_name  = azurerm_resource_group.romai_rg.name
  virtual_network_name = azurerm_virtual_network.romai_vnet.name
  address_prefixes     = ["10.2.0.0/16"]
}

# =============================================================================
# 🔐 Azure Container Registry
# =============================================================================
resource "azurerm_container_registry" "romai_acr" {
  name                = "romaiproductionacr"
  resource_group_name = azurerm_resource_group.romai_rg.name
  location            = azurerm_resource_group.romai_rg.location
  sku                 = "Premium"
  admin_enabled       = false
  
  # Geo-replication for high availability
  georeplications {
    location                = "North Europe"
    zone_redundancy_enabled = true
    tags = {
      Environment = var.environment
    }
  }
  
  # Network access rules
  public_network_access_enabled = true
  network_rule_bypass_option    = "AzureServices"
  
  tags = {
    Environment = var.environment
    Project     = "ROMAI"
  }
}

# =============================================================================
# 🔑 User Assigned Managed Identity
# =============================================================================
resource "azurerm_user_assigned_identity" "romai_identity" {
  name                = "romai-aks-identity"
  resource_group_name = azurerm_resource_group.romai_rg.name
  location            = azurerm_resource_group.romai_rg.location
  
  tags = {
    Environment = var.environment
    Project     = "ROMAI"
  }
}

# Grant AcrPull permission to the identity
resource "azurerm_role_assignment" "acr_pull" {
  scope                = azurerm_container_registry.romai_acr.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_user_assigned_identity.romai_identity.principal_id
}

# =============================================================================
# 🏗️ AKS Cluster
# =============================================================================
resource "azurerm_kubernetes_cluster" "romai_aks" {
  name                = var.cluster_name
  location            = azurerm_resource_group.romai_rg.location
  resource_group_name = azurerm_resource_group.romai_rg.name
  dns_prefix          = "romai-production"
  
  # Kubernetes version
  kubernetes_version        = "1.28"
  automatic_channel_upgrade = "patch"
  
  # Network configuration
  network_profile {
    network_plugin    = "azure"
    network_policy    = "azure"
    dns_service_ip    = "10.2.0.10"
    service_cidr      = "10.2.0.0/24"
    load_balancer_sku = "standard"
  }
  
  # Default node pool
  default_node_pool {
    name                = "system"
    node_count          = 3
    vm_size            = "Standard_D4s_v3"
    os_disk_size_gb    = 128
    os_disk_type       = "Managed"
    vnet_subnet_id     = azurerm_subnet.romai_aks_subnet.id
    type               = "VirtualMachineScaleSets"
    availability_zones = ["1", "2", "3"]
    
    # Auto-scaling
    enable_auto_scaling = true
    min_count          = 3
    max_count          = 10
    
    # Node pool configuration
    max_pods                = 30
    only_critical_addons_enabled = true
    
    # Node labels
    node_labels = {
      "environment" = var.environment
      "node-pool"   = "system"
    }
    
    # Node taints for system pool
    node_taints = [
      "CriticalAddonsOnly=true:NoSchedule"
    ]
    
    upgrade_settings {
      max_surge = "10%"
    }
  }
  
  # Identity configuration
  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.romai_identity.id]
  }
  
  # Azure AD integration
  azure_active_directory_role_based_access_control {
    managed                = true
    tenant_id              = data.azurerm_client_config.current.tenant_id
    admin_group_object_ids = []
    azure_rbac_enabled     = true
  }
  
  # Add-ons
  addon_profile {
    azure_policy {
      enabled = true
    }
    
    azure_keyvault_secrets_provider {
      enabled = true
    }
    
    oms_agent {
      enabled                    = true
      log_analytics_workspace_id = azurerm_log_analytics_workspace.romai_logs.id
    }
  }
  
  # Auto-scaler profile
  auto_scaler_profile {
    balance_similar_node_groups      = true
    expander                        = "random"
    max_graceful_termination_sec    = "600"
    max_node_provisioning_time      = "15m"
    max_unready_nodes               = 3
    max_unready_percentage          = 45
    new_pod_scale_up_delay          = "10s"
    scale_down_delay_after_add      = "10m"
    scale_down_delay_after_delete   = "10s"
    scale_down_delay_after_failure  = "3m"
    scan_interval                   = "10s"
    scale_down_unneeded             = "10m"
    scale_down_unready              = "20m"
    scale_down_utilization_threshold = "0.5"
  }
  
  # Maintenance window
  maintenance_window {
    allowed {
      day   = "Saturday"
      hours = [2, 3, 4, 5]
    }
  }
  
  tags = {
    Environment = var.environment
    Project     = "ROMAI"
    ManagedBy   = "Terraform"
  }
  
  depends_on = [
    azurerm_subnet.romai_aks_subnet,
    azurerm_user_assigned_identity.romai_identity
  ]
}

# =============================================================================
# 👥 Application Node Pool
# =============================================================================
resource "azurerm_kubernetes_cluster_node_pool" "romai_app_pool" {
  name                  = "apps"
  kubernetes_cluster_id = azurerm_kubernetes_cluster.romai_aks.id
  vm_size              = "Standard_D4s_v3"
  node_count           = 3
  
  # Auto-scaling
  enable_auto_scaling = true
  min_count          = 3
  max_count          = 15
  
  # Availability and storage
  availability_zones = ["1", "2", "3"]
  os_disk_size_gb   = 128
  os_disk_type      = "Managed"
  os_type           = "Linux"
  
  # Network
  vnet_subnet_id = azurerm_subnet.romai_aks_subnet.id
  max_pods       = 30
  
  # Node configuration
  node_labels = {
    "environment" = var.environment
    "node-pool"   = "applications"
    "workload"    = "general"
  }
  
  upgrade_settings {
    max_surge = "33%"
  }
  
  tags = {
    Environment = var.environment
    NodePool    = "applications"
  }
}

# =============================================================================
# 👥 Memory-Intensive Node Pool (for Elasticsearch)
# =============================================================================
resource "azurerm_kubernetes_cluster_node_pool" "romai_memory_pool" {
  name                  = "memory"
  kubernetes_cluster_id = azurerm_kubernetes_cluster.romai_aks.id
  vm_size              = "Standard_E4s_v3"
  node_count           = 1
  
  # Auto-scaling
  enable_auto_scaling = true
  min_count          = 1
  max_count          = 5
  
  # Availability and storage
  availability_zones = ["1", "2", "3"]
  os_disk_size_gb   = 256
  os_disk_type      = "Managed"
  os_type           = "Linux"
  
  # Network
  vnet_subnet_id = azurerm_subnet.romai_aks_subnet.id
  max_pods       = 30
  
  # Node configuration
  node_labels = {
    "environment" = var.environment
    "node-pool"   = "memory"
    "workload"    = "elasticsearch"
  }
  
  node_taints = [
    "workload=memory-intensive:NoSchedule"
  ]
  
  upgrade_settings {
    max_surge = "33%"
  }
  
  tags = {
    Environment = var.environment
    NodePool    = "memory-intensive"
  }
}

# =============================================================================
# 📊 Log Analytics Workspace
# =============================================================================
resource "azurerm_log_analytics_workspace" "romai_logs" {
  name                = "romai-production-logs"
  location            = azurerm_resource_group.romai_rg.location
  resource_group_name = azurerm_resource_group.romai_rg.name
  sku                = "PerGB2018"
  retention_in_days   = 30
  
  tags = {
    Environment = var.environment
    Project     = "ROMAI"
  }
}

# =============================================================================
# 📈 Application Insights
# =============================================================================
resource "azurerm_application_insights" "romai_insights" {
  name                = "romai-production-insights"
  location            = azurerm_resource_group.romai_rg.location
  resource_group_name = azurerm_resource_group.romai_rg.name
  workspace_id        = azurerm_log_analytics_workspace.romai_logs.id
  application_type    = "web"
  
  tags = {
    Environment = var.environment
    Project     = "ROMAI"
  }
}

# =============================================================================
# 🔐 Key Vault
# =============================================================================
data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "romai_kv" {
  name                = "romai-prod-kv-${random_string.kv_suffix.result}"
  location            = azurerm_resource_group.romai_rg.location
  resource_group_name = azurerm_resource_group.romai_rg.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name           = "premium"
  
  # Network access
  public_network_access_enabled = true
  network_acls {
    default_action = "Allow"
    bypass         = "AzureServices"
  }
  
  # RBAC
  enable_rbac_authorization = true
  
  tags = {
    Environment = var.environment
    Project     = "ROMAI"
  }
}

resource "random_string" "kv_suffix" {
  length  = 8
  special = false
  upper   = false
}

# Grant Key Vault access to AKS managed identity
resource "azurerm_role_assignment" "kv_secrets_user" {
  scope                = azurerm_key_vault.romai_kv.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_user_assigned_identity.romai_identity.principal_id
}

# =============================================================================
# 📊 Outputs
# =============================================================================
output "cluster_name" {
  description = "AKS cluster name"
  value       = azurerm_kubernetes_cluster.romai_aks.name
}

output "cluster_endpoint" {
  description = "AKS cluster endpoint"
  value       = azurerm_kubernetes_cluster.romai_aks.kube_config[0].host
  sensitive   = true
}

output "cluster_ca_certificate" {
  description = "AKS cluster CA certificate"
  value       = azurerm_kubernetes_cluster.romai_aks.kube_config[0].cluster_ca_certificate
  sensitive   = true
}

output "resource_group_name" {
  description = "Resource group name"
  value       = azurerm_resource_group.romai_rg.name
}

output "acr_login_server" {
  description = "ACR login server"
  value       = azurerm_container_registry.romai_acr.login_server
}

output "key_vault_uri" {
  description = "Key Vault URI"
  value       = azurerm_key_vault.romai_kv.vault_uri
}

output "log_analytics_workspace_id" {
  description = "Log Analytics Workspace ID"
  value       = azurerm_log_analytics_workspace.romai_logs.id
}

output "application_insights_instrumentation_key" {
  description = "Application Insights Instrumentation Key"
  value       = azurerm_application_insights.romai_insights.instrumentation_key
  sensitive   = true
}

# =============================================================================
# ⚙️ Local Values for Configuration
# =============================================================================
locals {
  cluster_config = {
    cluster_name              = azurerm_kubernetes_cluster.romai_aks.name
    cluster_endpoint         = azurerm_kubernetes_cluster.romai_aks.kube_config[0].host
    cluster_ca_certificate   = azurerm_kubernetes_cluster.romai_aks.kube_config[0].cluster_ca_certificate
    resource_group_name      = azurerm_resource_group.romai_rg.name
    location                 = var.location
  }
}
