# Interim Standard Instance Deployment Strategy
# Use available 32 vCPU Standard Spot limit while waiting for GPU quota approval

variable "interim_deployment_enabled" {
  description = "Enable interim standard instance deployment"
  type        = bool
  default     = true
}

variable "interim_instance_type" {
  description = "Standard instance type for interim deployment"
  type        = string
  default     = "c5.4xlarge"  # 16 vCPUs, good for data preprocessing
  
  validation {
    condition = contains([
      "c5.2xlarge",   # 8 vCPUs, 16 GB RAM
      "c5.4xlarge",   # 16 vCPUs, 32 GB RAM  
      "m5.2xlarge",   # 8 vCPUs, 32 GB RAM
      "m5.4xlarge"    # 16 vCPUs, 64 GB RAM
    ], var.interim_instance_type)
    error_message = "Interim instance type must be within 32 vCPU Spot limit."
  }
}

variable "interim_cluster_size" {
  description = "Number of interim instances (limited by 32 vCPU total)"
  type        = number
  default     = 2  # 2x c5.4xlarge = 32 vCPUs (exactly at limit)
}

locals {
  interim_specs = {
    "c5.2xlarge" = { vcpus = 8, memory = 16, cost_per_hour = 0.085 }
    "c5.4xlarge" = { vcpus = 16, memory = 32, cost_per_hour = 0.17 }
    "m5.2xlarge" = { vcpus = 8, memory = 32, cost_per_hour = 0.096 }
    "m5.4xlarge" = { vcpus = 16, memory = 64, cost_per_hour = 0.192 }
  }
  
  interim_selected = local.interim_specs[var.interim_instance_type]
  interim_total_vcpus = local.interim_selected.vcpus * var.interim_cluster_size
  interim_monthly_cost = local.interim_selected.cost_per_hour * 24 * 30 * var.interim_cluster_size
}

# Launch template for interim standard instances
resource "aws_launch_template" "interim_preprocessing_template" {
  count = var.interim_deployment_enabled ? 1 : 0
  
  name_prefix   = "romai-interim-preprocessing-"
  image_id      = data.aws_ami.amazon_linux.id
  instance_type = var.interim_instance_type
  key_name      = var.ssh_key_name
  
  vpc_security_group_ids = [aws_security_group.gpu_cluster.id]
  
  iam_instance_profile {
    name = aws_iam_instance_profile.gpu_cluster_profile.name
  }
  
  # Spot instance configuration for cost savings
  instance_market_options {
    market_type = "spot"
    spot_options {
      spot_instance_type             = "one-time"
      instance_interruption_behavior = "terminate"
    }
  }
  
  user_data = base64encode(templatefile("${path.module}/user_data_interim.sh", {
    cluster_name   = "romai-interim-preprocessing"
    instance_type  = var.interim_instance_type
    total_nodes    = var.interim_cluster_size
    fsx_dns_name   = aws_fsx_lustre_file_system.romai_storage.dns_name
    fsx_mount_name = aws_fsx_lustre_file_system.romai_storage.mount_name
  }))
  
  tag_specifications {
    resource_type = "instance"
    tags = {
      Name                 = "RomAI-Interim-Preprocessing-Node"
      Project             = "RomAI-AGI"
      Environment         = "Interim"
      Purpose             = "DataPreprocessing"
      InstanceType        = var.interim_instance_type
      TotalClusterVCPUs   = local.interim_total_vcpus
      MonthlyCostUSD      = local.interim_monthly_cost
      AutoTerminate       = "on-gpu-quota-approval"
    }
  }
}

# Interim preprocessing instances
resource "aws_instance" "interim_preprocessing_nodes" {
  count = var.interim_deployment_enabled ? var.interim_cluster_size : 0
  
  launch_template {
    id      = aws_launch_template.interim_preprocessing_template[0].id
    version = "$Latest"
  }
  
  subnet_id = aws_subnet.gpu_subnets[count.index % length(aws_subnet.gpu_subnets)].id
  
  tags = {
    Name        = "RomAI-Interim-Node-${count.index + 1}"
    NodeIndex   = count.index + 1
    ClusterRole = count.index == 0 ? "coordinator" : "worker"
    Purpose     = "Dataset preprocessing and validation"
  }
  
  # Lifecycle management
  lifecycle {
    create_before_destroy = true
    ignore_changes       = [ami]
  }
}

# Data source for Amazon Linux 2 AMI
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]
  
  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
  
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Output interim cluster information
output "interim_cluster_summary" {
  value = var.interim_deployment_enabled ? {
    instance_type     = var.interim_instance_type
    cluster_size      = var.interim_cluster_size
    total_vcpus       = local.interim_total_vcpus
    vcpu_limit_usage  = "${local.interim_total_vcpus}/32 vCPUs (${(local.interim_total_vcpus/32)*100}% of limit)"
    memory_per_node   = local.interim_selected.memory
    total_memory_gb   = local.interim_selected.memory * var.interim_cluster_size
    monthly_cost_usd  = local.interim_monthly_cost
    purpose          = "Dataset preprocessing while awaiting GPU quota approval"
    auto_terminate   = "Will be replaced by GPU cluster when quota approved"
  } : null
  description = "Interim preprocessing cluster configuration"
}

output "interim_cost_analysis" {
  value = var.interim_deployment_enabled ? {
    hourly_cost   = local.interim_selected.cost_per_hour * var.interim_cluster_size
    daily_cost    = local.interim_selected.cost_per_hour * 24 * var.interim_cluster_size
    weekly_cost   = local.interim_selected.cost_per_hour * 24 * 7 * var.interim_cluster_size
    monthly_cost  = local.interim_monthly_cost
    cost_vs_gpu   = "~${round((local.interim_monthly_cost / 134862) * 100, 1)}% of P3dn cluster cost"
  } : null
  description = "Interim cluster cost breakdown"
}