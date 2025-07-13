# ☁️ Google Cloud Platform (GKE) Deployment Configuration
# Production-ready GKE cluster for ROMAI services
# Generated for Phase 4 Week 4 Day 25 - Cloud Deployment & Scaling

# =============================================================================
# 🏗️ GKE Cluster Configuration (Terraform)
# =============================================================================
terraform {
  required_version = ">= 1.5"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
  }
  
  backend "gcs" {
    bucket = "romai-terraform-state"
    prefix = "gke/production"
  }
}

# Provider configuration
provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# Variables
variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "romai-production"
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "europe-west1"
}

variable "zone" {
  description = "GCP Zone"
  type        = string
  default     = "europe-west1-b"
}

variable "cluster_name" {
  description = "GKE Cluster Name"
  type        = string
  default     = "romai-production-gke"
}

# =============================================================================
# 🌐 VPC Network Configuration
# =============================================================================
resource "google_compute_network" "romai_vpc" {
  name                    = "romai-production-vpc"
  auto_create_subnetworks = false
  mtu                     = 1460
  routing_mode           = "REGIONAL"
  
  depends_on = [
    google_project_service.compute_api,
    google_project_service.container_api
  ]
}

resource "google_compute_subnetwork" "romai_subnet" {
  name          = "romai-production-subnet"
  ip_cidr_range = "10.0.0.0/16"
  region        = var.region
  network       = google_compute_network.romai_vpc.id
  
  secondary_ip_range {
    range_name    = "romai-pods"
    ip_cidr_range = "10.1.0.0/16"
  }
  
  secondary_ip_range {
    range_name    = "romai-services"
    ip_cidr_range = "10.2.0.0/16"
  }
  
  private_ip_google_access = true
}

# =============================================================================
# 🔧 Enable Required APIs
# =============================================================================
resource "google_project_service" "compute_api" {
  project = var.project_id
  service = "compute.googleapis.com"
  
  disable_dependent_services = true
  disable_on_destroy        = false
}

resource "google_project_service" "container_api" {
  project = var.project_id
  service = "container.googleapis.com"
  
  disable_dependent_services = true
  disable_on_destroy        = false
}

resource "google_project_service" "monitoring_api" {
  project = var.project_id
  service = "monitoring.googleapis.com"
  
  disable_dependent_services = true
  disable_on_destroy        = false
}

resource "google_project_service" "logging_api" {
  project = var.project_id
  service = "logging.googleapis.com"
  
  disable_dependent_services = true
  disable_on_destroy        = false
}

# =============================================================================
# 🏗️ GKE Cluster
# =============================================================================
resource "google_container_cluster" "romai_gke" {
  name     = var.cluster_name
  location = var.region
  
  # Network configuration
  network    = google_compute_network.romai_vpc.self_link
  subnetwork = google_compute_subnetwork.romai_subnet.self_link
  
  # Remove default node pool
  remove_default_node_pool = true
  initial_node_count       = 1
  
  # Cluster configuration
  min_master_version = "1.28"
  
  # Network policy
  network_policy {
    enabled = true
  }
  
  # IP allocation policy
  ip_allocation_policy {
    cluster_secondary_range_name  = "romai-pods"
    services_secondary_range_name = "romai-services"
  }
  
  # Workload Identity
  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }
  
  # Logging and monitoring
  logging_service    = "logging.googleapis.com/kubernetes"
  monitoring_service = "monitoring.googleapis.com/kubernetes"
  
  # Cluster features
  addons_config {
    http_load_balancing {
      disabled = false
    }
    
    horizontal_pod_autoscaling {
      disabled = false
    }
    
    network_policy_config {
      disabled = false
    }
    
    dns_cache_config {
      enabled = true
    }
  }
  
  # Security configuration
  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false
    master_ipv4_cidr_block  = "172.16.0.0/28"
    
    master_global_access_config {
      enabled = true
    }
  }
  
  # Master authorized networks
  master_authorized_networks_config {
    cidr_blocks {
      cidr_block   = "0.0.0.0/0"
      display_name = "All networks"
    }
  }
  
  # Maintenance policy
  maintenance_policy {
    recurring_window {
      start_time = "2024-01-01T02:00:00Z"
      end_time   = "2024-01-01T06:00:00Z"
      recurrence = "FREQ=WEEKLY;BYDAY=SA"
    }
  }
  
  # Resource labels
  resource_labels = {
    environment = "production"
    project     = "romai"
    managed_by  = "terraform"
  }
  
  depends_on = [
    google_project_service.compute_api,
    google_project_service.container_api,
    google_compute_subnetwork.romai_subnet
  ]
}

# =============================================================================
# 👥 Node Pool - Primary
# =============================================================================
resource "google_container_node_pool" "romai_primary_nodes" {
  name       = "romai-primary-pool"
  location   = var.region
  cluster    = google_container_cluster.romai_gke.name
  
  # Auto-scaling configuration
  autoscaling {
    min_node_count = 3
    max_node_count = 20
  }
  
  # Node configuration
  node_config {
    preemptible  = false
    machine_type = "e2-standard-4"
    disk_size_gb = 100
    disk_type    = "pd-ssd"
    
    # OAuth scopes
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
      "https://www.googleapis.com/auth/devstorage.read_only",
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring",
    ]
    
    # Security configuration
    service_account = google_service_account.gke_node_sa.email
    
    # Workload Identity
    workload_metadata_config {
      mode = "GKE_METADATA"
    }
    
    # Node labels
    labels = {
      environment = "production"
      node_pool   = "primary"
    }
    
    # Node taints
    taint {
      key    = "workload-type"
      value  = "general"
      effect = "NO_SCHEDULE"
    }
    
    # Metadata
    metadata = {
      disable-legacy-endpoints = "true"
    }
  }
  
  # Upgrade settings
  upgrade_settings {
    strategy = "SURGE"
    max_surge = 1
    max_unavailable = 0
  }
  
  # Management
  management {
    auto_repair  = true
    auto_upgrade = true
  }
  
  depends_on = [google_container_cluster.romai_gke]
}

# =============================================================================
# 👥 Node Pool - High Memory (for Elasticsearch)
# =============================================================================
resource "google_container_node_pool" "romai_memory_nodes" {
  name       = "romai-memory-pool"
  location   = var.region
  cluster    = google_container_cluster.romai_gke.name
  
  # Auto-scaling configuration
  autoscaling {
    min_node_count = 1
    max_node_count = 5
  }
  
  # Node configuration
  node_config {
    preemptible  = false
    machine_type = "e2-highmem-4"
    disk_size_gb = 200
    disk_type    = "pd-ssd"
    
    # OAuth scopes
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
      "https://www.googleapis.com/auth/devstorage.read_only",
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring",
    ]
    
    # Security configuration
    service_account = google_service_account.gke_node_sa.email
    
    # Workload Identity
    workload_metadata_config {
      mode = "GKE_METADATA"
    }
    
    # Node labels
    labels = {
      environment = "production"
      node_pool   = "memory"
      workload    = "elasticsearch"
    }
    
    # Node taints
    taint {
      key    = "workload-type"
      value  = "memory-intensive"
      effect = "NO_SCHEDULE"
    }
    
    # Metadata
    metadata = {
      disable-legacy-endpoints = "true"
    }
  }
  
  # Upgrade settings
  upgrade_settings {
    strategy = "SURGE"
    max_surge = 1
    max_unavailable = 0
  }
  
  # Management
  management {
    auto_repair  = true
    auto_upgrade = true
  }
  
  depends_on = [google_container_cluster.romai_gke]
}

# =============================================================================
# 🔐 Service Account for GKE Nodes
# =============================================================================
resource "google_service_account" "gke_node_sa" {
  account_id   = "romai-gke-node-sa"
  display_name = "ROMAI GKE Node Service Account"
  description  = "Service account for GKE nodes in ROMAI production cluster"
}

resource "google_project_iam_member" "gke_node_sa_roles" {
  for_each = toset([
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter",
    "roles/monitoring.viewer",
    "roles/stackdriver.resourceMetadata.writer",
    "roles/storage.objectViewer",
    "roles/artifactregistry.reader"
  ])
  
  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.gke_node_sa.email}"
}

# =============================================================================
# 🔒 Firewall Rules
# =============================================================================
resource "google_compute_firewall" "romai_allow_internal" {
  name    = "romai-allow-internal"
  network = google_compute_network.romai_vpc.name
  
  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }
  
  allow {
    protocol = "udp"
    ports    = ["0-65535"]
  }
  
  allow {
    protocol = "icmp"
  }
  
  source_ranges = ["10.0.0.0/8"]
  target_tags   = ["gke-romai-production-gke"]
}

resource "google_compute_firewall" "romai_allow_ssh" {
  name    = "romai-allow-ssh"
  network = google_compute_network.romai_vpc.name
  
  allow {
    protocol = "tcp"
    ports    = ["22"]
  }
  
  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["gke-romai-production-gke"]
}

# =============================================================================
# 📊 Outputs
# =============================================================================
output "cluster_name" {
  description = "GKE cluster name"
  value       = google_container_cluster.romai_gke.name
}

output "cluster_endpoint" {
  description = "GKE cluster endpoint"
  value       = google_container_cluster.romai_gke.endpoint
  sensitive   = true
}

output "cluster_ca_certificate" {
  description = "GKE cluster CA certificate"
  value       = google_container_cluster.romai_gke.master_auth.0.cluster_ca_certificate
  sensitive   = true
}

output "vpc_network" {
  description = "VPC network name"
  value       = google_compute_network.romai_vpc.name
}

output "subnet_name" {
  description = "Subnet name"
  value       = google_compute_subnetwork.romai_subnet.name
}

output "node_service_account" {
  description = "Node service account email"
  value       = google_service_account.gke_node_sa.email
}

# =============================================================================
# ⚙️ Local Values for Configuration
# =============================================================================
locals {
  cluster_config = {
    cluster_name              = google_container_cluster.romai_gke.name
    cluster_endpoint         = google_container_cluster.romai_gke.endpoint
    cluster_ca_certificate   = google_container_cluster.romai_gke.master_auth.0.cluster_ca_certificate
    project_id              = var.project_id
    region                  = var.region
    zone                    = var.zone
  }
}
