# Flexible Terraform Configuration for Alternative GPU Instances

variable "instance_type" {
  description = "GPU instance type to deploy"
  type        = string
  default     = "p3dn.24xlarge"
  
  validation {
    condition = contains([
      "p4d.24xlarge",   # 8x A100 80GB, 96 vCPUs - Premium option
      "p3dn.24xlarge",  # 8x V100 32GB, 96 vCPUs - Recommended alternative
      "g5.48xlarge",    # 8x A10G 24GB, 192 vCPUs - Budget option
      "g5.24xlarge"     # 4x A10G 24GB, 96 vCPUs - Smaller cluster option
    ], var.instance_type)
    error_message = "Instance type must be one of the supported GPU instances."
  }
}

variable "cluster_size" {
  description = "Number of instances in the cluster"
  type        = number
  default     = 0  # Set to 0 to disable GPU cluster deployment initially
}

# Instance specifications lookup
locals {
  instance_specs = {
    "p4d.24xlarge" = {
      gpus           = 8
      gpu_type       = "A100"
      gpu_memory     = "80GB"
      vcpus          = 96
      memory         = 1152
      cost_per_hour  = 32.7726
      network_gbps   = 400
      storage_type   = "EBS"
    }
    "p3dn.24xlarge" = {
      gpus           = 8  
      gpu_type       = "V100"
      gpu_memory     = "32GB"
      vcpus          = 96
      memory         = 768
      cost_per_hour  = 31.218
      network_gbps   = 100
      storage_type   = "NVMe SSD"
    }
    "g5.48xlarge" = {
      gpus           = 8
      gpu_type       = "A10G"
      gpu_memory     = "24GB" 
      vcpus          = 192
      memory         = 768
      cost_per_hour  = 16.288
      network_gbps   = 50
      storage_type   = "NVMe SSD"
    }
    "g5.24xlarge" = {
      gpus           = 4
      gpu_type       = "A10G" 
      gpu_memory     = "24GB"
      vcpus          = 96
      memory         = 384
      cost_per_hour  = 8.144
      network_gbps   = 25
      storage_type   = "NVMe SSD"
    }
  }
  
  selected_specs = local.instance_specs[var.instance_type]
  total_gpus     = local.selected_specs.gpus * var.cluster_size
  total_vcpus    = local.selected_specs.vcpus * var.cluster_size
  monthly_cost   = local.selected_specs.cost_per_hour * 24 * 30 * var.cluster_size
}

# Launch template for GPU cluster (only created if cluster_size > 0)
resource "aws_launch_template" "romai_cluster_template" {
  count = var.cluster_size > 0 ? 1 : 0
  
  name_prefix   = "romai-${var.instance_type}-"
  image_id      = data.aws_ami.ubuntu_hpc.id
  instance_type = var.instance_type
  key_name      = var.ssh_key_name
  
  vpc_security_group_ids = [
    aws_security_group.gpu_cluster.id
  ]
  
  iam_instance_profile {
    name = aws_iam_instance_profile.gpu_instance_profile.name
  }

  user_data = var.cluster_size > 0 ? base64encode(file("${path.module}/user_data_simple.sh")) : null

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name                 = "RomAI-${title(local.selected_specs.gpu_type)}-Node"
      Project             = "RomAI-AGI"
      Environment         = "Production"
      GPUType             = local.selected_specs.gpu_type
      InstanceType        = var.instance_type
      TotalClusterGPUs    = local.total_gpus
      MonthlyCostUSD      = local.monthly_cost
      AutoStart           = "true"
      BackupEnabled       = "true"
    }
  }
}

# Dynamic instance creation based on cluster size (only if cluster_size > 0)
resource "aws_instance" "romai_cluster_nodes" {
  count = var.cluster_size
  
  launch_template {
    id      = aws_launch_template.romai_cluster_template[0].id
    version = "$Latest"
  }
  
  subnet_id                   = aws_subnet.gpu_subnets[count.index % length(aws_subnet.gpu_subnets)].id
  associate_public_ip_address = false
  
  # Instance-specific configuration
  user_data_replace_on_change = true
  
  tags = {
    Name        = "RomAI-${title(local.selected_specs.gpu_type)}-Node-${count.index + 1}"
    NodeIndex   = count.index + 1
    ClusterRole = count.index == 0 ? "master" : "worker" 
  }
  
  # Lifecycle management
  lifecycle {
    create_before_destroy = true
    ignore_changes       = [ami]
  }
}

# Output comprehensive cluster information (only if cluster enabled)
output "cluster_summary" {
  value = var.cluster_size > 0 ? {
    instance_type    = var.instance_type
    cluster_size     = var.cluster_size
    gpu_type         = local.selected_specs.gpu_type
    total_gpus       = local.total_gpus
    total_vcpus      = local.total_vcpus
    gpus_per_node    = local.selected_specs.gpus
    gpu_memory       = local.selected_specs.gpu_memory
    monthly_cost_usd = local.monthly_cost
    network_performance = "${local.selected_specs.network_gbps} Gbps"
    storage_type     = local.selected_specs.storage_type
  } : null
  description = "Complete cluster configuration summary"
}

output "cost_analysis" {
  value = var.cluster_size > 0 ? {
    hourly_cost       = local.selected_specs.cost_per_hour * var.cluster_size
    daily_cost        = local.selected_specs.cost_per_hour * 24 * var.cluster_size
    monthly_cost      = local.monthly_cost
    annual_cost       = local.monthly_cost * 12
    cost_per_gpu_hour = local.selected_specs.cost_per_hour / local.selected_specs.gpus
  } : null
  description = "Detailed cost breakdown for the cluster"
}

output "performance_metrics" {
  value = var.cluster_size > 0 ? {
    total_gpu_memory_gb    = tonumber(replace(local.selected_specs.gpu_memory, "GB", "")) * local.total_gpus
    memory_per_node_gb     = local.selected_specs.memory
    total_memory_gb        = local.selected_specs.memory * var.cluster_size
    network_bandwidth_gbps = local.selected_specs.network_gbps
    estimated_dataset_processing_time = local.selected_specs.gpu_type == "A100" ? "8-12 hours" : local.selected_specs.gpu_type == "V100" ? "12-18 hours" : "18-24 hours"
  } : null
  description = "Performance and capacity metrics"
}