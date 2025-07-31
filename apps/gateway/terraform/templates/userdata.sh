#!/bin/bash

# EKS Node User Data Script
# This script configures the EKS worker nodes with optimized settings

set -o xtrace

# Update system packages
yum update -y

# Install additional packages
yum install -y \
    awscli \
    jq \
    htop \
    vim \
    git \
    curl \
    wget \
    unzip \
    amazon-cloudwatch-agent

# Configure CloudWatch agent for container insights
cat <<EOF > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
{
    "agent": {
        "region": "${AWS::Region}",
        "metrics_collection_interval": 60,
        "logfile": "/opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log"
    },
    "logs": {
        "logs_collected": {
            "files": {
                "collect_list": [
                    {
                        "file_path": "/var/log/messages",
                        "log_group_name": "/aws/eks/${cluster_name}/system",
                        "log_stream_name": "{instance_id}",
                        "timezone": "UTC"
                    },
                    {
                        "file_path": "/var/log/dmesg",
                        "log_group_name": "/aws/eks/${cluster_name}/system",
                        "log_stream_name": "{instance_id}/dmesg",
                        "timezone": "UTC"
                    }
                ]
            }
        }
    },
    "metrics": {
        "namespace": "CWAgent",
        "metrics_collected": {
            "cpu": {
                "measurement": [
                    "cpu_usage_idle",
                    "cpu_usage_iowait",
                    "cpu_usage_user",
                    "cpu_usage_system"
                ],
                "metrics_collection_interval": 60,
                "totalcpu": false
            },
            "disk": {
                "measurement": [
                    "used_percent"
                ],
                "metrics_collection_interval": 60,
                "resources": [
                    "*"
                ]
            },
            "mem": {
                "measurement": [
                    "mem_used_percent"
                ],
                "metrics_collection_interval": 60
            },
            "swap": {
                "measurement": [
                    "swap_used_percent"
                ],
                "metrics_collection_interval": 60
            }
        }
    }
}
EOF

# Start CloudWatch agent
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json \
    -s

# Configure kubelet with optimized settings
mkdir -p /etc/kubernetes/kubelet
cat <<EOF > /etc/kubernetes/kubelet/kubelet-config.json
{
    "kind": "KubeletConfiguration",
    "apiVersion": "kubelet.config.k8s.io/v1beta1",
    "address": "0.0.0.0",
    "port": 10250,
    "readOnlyPort": 0,
    "cgroupDriver": "systemd",
    "hairpinMode": "hairpin-veth",
    "serializeImagePulls": false,
    "maxPods": 110,
    "featureGates": {
        "RotateKubeletServerCertificate": true
    },
    "serverTLSBootstrap": true,
    "authentication": {
        "x509": {
            "clientCAFile": "/etc/kubernetes/pki/ca.crt"
        },
        "webhook": {
            "enabled": true,
            "cacheTTL": "2m0s"
        },
        "anonymous": {
            "enabled": false
        }
    },
    "authorization": {
        "mode": "Webhook",
        "webhook": {
            "cacheAuthorizedTTL": "5m0s",
            "cacheUnauthorizedTTL": "30s"
        }
    },
    "eventRecordQPS": 0,
    "protectKernelDefaults": true,
    "streamingConnectionIdleTimeout": "4h0m0s",
    "tlsCipherSuites": [
        "TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256",
        "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
        "TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305",
        "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384",
        "TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305",
        "TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384"
    ],
    "tlsMinVersion": "VersionTLS12",
    "kubeReserved": {
        "cpu": "100m",
        "memory": "100Mi",
        "ephemeral-storage": "1Gi"
    },
    "systemReserved": {
        "cpu": "100m",
        "memory": "100Mi",
        "ephemeral-storage": "1Gi"
    },
    "evictionHard": {
        "memory.available": "100Mi",
        "nodefs.available": "10%",
        "nodefs.inodesFree": "5%",
        "imagefs.available": "15%"
    }
}
EOF

# Set kernel parameters for better performance
cat <<EOF > /etc/sysctl.d/99-kubernetes.conf
# Kubernetes optimizations
net.bridge.bridge-nf-call-iptables = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward = 1

# Network performance optimizations
net.core.somaxconn = 32768
net.core.netdev_max_backlog = 5000
net.core.rmem_max = 134217728
net.core.wmem_max = 134217728
net.ipv4.tcp_wmem = 4096 20480 134217728
net.ipv4.tcp_rmem = 4096 20480 134217728
net.ipv4.tcp_max_syn_backlog = 8192

# Memory management
vm.max_map_count = 262144
vm.overcommit_memory = 1
kernel.panic = 10
kernel.panic_on_oops = 1

# File system optimizations
fs.inotify.max_user_instances = 8192
fs.inotify.max_user_watches = 524288
fs.file-max = 2097152
EOF

# Apply kernel parameters
sysctl -p /etc/sysctl.d/99-kubernetes.conf

# Configure container runtime optimizations
mkdir -p /etc/containerd
cat <<EOF > /etc/containerd/config.toml
version = 2

[plugins]
  [plugins."io.containerd.grpc.v1.cri"]
    sandbox_image = "602401143452.dkr.ecr.us-east-1.amazonaws.com/eks/pause:3.5"
    
    [plugins."io.containerd.grpc.v1.cri".registry]
      [plugins."io.containerd.grpc.v1.cri".registry.mirrors]
        [plugins."io.containerd.grpc.v1.cri".registry.mirrors."docker.io"]
          endpoint = ["https://registry-1.docker.io"]
        [plugins."io.containerd.grpc.v1.cri".registry.mirrors."602401143452.dkr.ecr.us-east-1.amazonaws.com"]
          endpoint = ["https://602401143452.dkr.ecr.us-east-1.amazonaws.com"]
    
    [plugins."io.containerd.grpc.v1.cri".containerd]
      default_runtime_name = "runc"
      
      [plugins."io.containerd.grpc.v1.cri".containerd.runtimes]
        [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc]
          runtime_type = "io.containerd.runc.v2"
          
          [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options]
            SystemdCgroup = true

  [plugins."io.containerd.grpc.v1.cri".cni]
    bin_dir = "/opt/cni/bin"
    conf_dir = "/etc/cni/net.d"
EOF

# Bootstrap the node to join the EKS cluster
/etc/eks/bootstrap.sh '${cluster_name}' ${bootstrap_arguments} \
    --b64-cluster-ca '${cluster_ca}' \
    --apiserver-endpoint '${cluster_endpoint}' \
    --dns-cluster-ip 172.20.0.10 \
    --container-runtime containerd \
    --kubelet-extra-args '--node-labels=eks.amazonaws.com/nodegroup-image=ami-0abcdef1234567890,eks.amazonaws.com/capacityType=ON_DEMAND'

# Install and configure AWS Systems Manager agent
yum install -y amazon-ssm-agent
systemctl enable amazon-ssm-agent
systemctl start amazon-ssm-agent

# Install Node Exporter for Prometheus monitoring
cd /tmp
wget https://github.com/prometheus/node_exporter/releases/download/v1.6.1/node_exporter-1.6.1.linux-amd64.tar.gz
tar xf node_exporter-1.6.1.linux-amd64.tar.gz
cp node_exporter-1.6.1.linux-amd64/node_exporter /usr/local/bin/
rm -rf node_exporter-1.6.1.linux-amd64*

# Create node_exporter service
cat <<EOF > /etc/systemd/system/node_exporter.service
[Unit]
Description=Node Exporter
Wants=network-online.target
After=network-online.target

[Service]
User=nobody
Group=nobody
Type=simple
ExecStart=/usr/local/bin/node_exporter --web.listen-address=:9100

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable node_exporter
systemctl start node_exporter

# Configure log rotation for containers
cat <<EOF > /etc/logrotate.d/docker-containers
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=100M
    delaycompress
    missingok
    notifempty
    create 644 root root
}
EOF

# Set up custom metrics and monitoring
cat <<EOF > /usr/local/bin/eks-node-health-check.sh
#!/bin/bash

# EKS Node Health Check Script
NODE_STATUS=\$(kubectl get node \$(curl -s http://169.254.169.254/latest/meta-data/local-hostname) -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}' 2>/dev/null || echo "Unknown")

if [ "\$NODE_STATUS" = "True" ]; then
    echo "Node is healthy"
    exit 0
else
    echo "Node is not ready: \$NODE_STATUS"
    exit 1
fi
EOF

chmod +x /usr/local/bin/eks-node-health-check.sh

# Create a cron job for periodic health checks
echo "*/5 * * * * root /usr/local/bin/eks-node-health-check.sh >> /var/log/node-health.log 2>&1" >> /etc/crontab

# Configure automatic security updates
cat <<EOF > /etc/yum/yum-cron.conf
[commands]
update_cmd = security
update_messages = yes
download_updates = yes
apply_updates = yes

[emitters]
system_name = None
emit_via = stdio

[groups]
group_list = None
group_package_types = mandatory, default

[base]
debuglevel = -2
mdpolicy = group:main
EOF

systemctl enable yum-cron
systemctl start yum-cron

# Final system cleanup and optimization
yum clean all
rm -rf /tmp/*

# Signal completion
/opt/aws/bin/cfn-signal -e $? --stack ${AWS::StackName} --resource AutoScalingGroup --region ${AWS::Region}

echo "EKS Node initialization completed successfully"
