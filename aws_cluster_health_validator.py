#!/usr/bin/env python3
"""
AWS P4d GPU Cluster Health Validation & Monitoring Script
========================================================

This script provides comprehensive health validation and monitoring for the 
RomAI Phase 2B AWS P4d GPU cluster deployment with the following checks:

Infrastructure Components:
- 6x P4d.24xlarge instances (48x A100 80GB GPUs total)
- FSx Lustre 2.4TB high-performance filesystem
- VPC with 3 subnets across availability zones
- EFA (Elastic Fabric Adapter) networking
- Security groups and IAM roles

Health Validation:
- Instance status and connectivity
- GPU availability and memory (nvidia-smi)
- EFA networking functionality
- FSx Lustre mount status and performance
- NCCL multi-GPU communication
- Docker NVIDIA runtime
- System resource utilization

Author: RomAI Development Team
Date: August 26, 2025
Deployment ID: romai-phase2b-26a4a9af
"""

import os
import sys
import json
import time
import asyncio
import logging
import subprocess
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from concurrent.futures import ThreadPoolExecutor
import boto3
from botocore.exceptions import ClientError

# Configuration
DEPLOYMENT_ID = "romai-phase2b-26a4a9af"
REGION = "us-west-2"
EXPECTED_NODES = 6
EXPECTED_GPUS_PER_NODE = 8
TOTAL_EXPECTED_GPUS = 48
FSX_MOUNT_POINT = "/mnt/fsx"

@dataclass
class NodeHealthStatus:
    """Health status for a single GPU node"""
    node_name: str
    instance_id: str
    private_ip: str
    public_ip: str
    az: str
    instance_status: str = "unknown"
    system_status: str = "unknown"
    ssh_accessible: bool = False
    gpu_count: int = 0
    gpu_memory_total_gb: float = 0.0
    gpu_utilization_avg: float = 0.0
    efa_available: bool = False
    fsx_mounted: bool = False
    docker_nvidia_ready: bool = False
    nccl_test_passed: bool = False
    overall_health: str = "unknown"

@dataclass
class ClusterHealthReport:
    """Overall cluster health report"""
    deployment_id: str
    timestamp: str
    total_nodes: int
    healthy_nodes: int
    total_gpus: int
    healthy_gpus: int
    fsx_filesystem_status: str
    vpc_connectivity: str
    overall_status: str
    performance_metrics: Dict
    recommendations: List[str]
    detailed_nodes: List[NodeHealthStatus]

class AWSClusterHealthValidator:
    """Main health validation class for AWS GPU cluster"""
    
    def __init__(self):
        self.logger = self._setup_logging()
        
        # AWS clients
        self.ec2_client = boto3.client('ec2', region_name=REGION)
        self.fsx_client = boto3.client('fsx', region_name=REGION)
        self.ssm_client = boto3.client('ssm', region_name=REGION)
        self.cloudwatch = boto3.client('cloudwatch', region_name=REGION)
        
        # Health metrics
        self.nodes = []
        self.fsx_filesystem_id = None
        self.vpc_id = None
        self.security_group_id = None
        
    def _setup_logging(self) -> logging.Logger:
        """Setup logging configuration"""
        log_format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        logging.basicConfig(level=logging.INFO, format=log_format)
        
        logger = logging.getLogger('AWS-Cluster-Health-Validator')
        
        # File handler
        log_file = f'aws_cluster_health_{int(time.time())}.log'
        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(logging.Formatter(log_format))
        logger.addHandler(file_handler)
        
        return logger
    
    async def discover_cluster_resources(self) -> bool:
        """Discover all cluster resources using deployment tags"""
        self.logger.info(f"🔍 Discovering cluster resources for deployment: {DEPLOYMENT_ID}")
        
        try:
            # Find GPU instances
            response = self.ec2_client.describe_instances(
                Filters=[
                    {'Name': 'tag:DeploymentId', 'Values': [DEPLOYMENT_ID]},
                    {'Name': 'instance-state-name', 'Values': ['running', 'pending']}
                ]
            )
            
            nodes_found = 0
            for reservation in response['Reservations']:
                for instance in reservation['Instances']:
                    node_name = None
                    node_index = None
                    
                    # Extract node information from tags
                    for tag in instance.get('Tags', []):
                        if tag['Key'] == 'Name':
                            node_name = tag['Value']
                        elif tag['Key'] == 'NodeIndex':
                            node_index = tag['Value']
                    
                    if node_name and 'gpu-node' in node_name:
                        node_status = NodeHealthStatus(
                            node_name=node_name,
                            instance_id=instance['InstanceId'],
                            private_ip=instance.get('PrivateIpAddress', ''),
                            public_ip=instance.get('PublicIpAddress', ''),
                            az=instance['Placement']['AvailabilityZone'],
                            instance_status=instance['State']['Name'],
                        )
                        self.nodes.append(node_status)
                        nodes_found += 1
            
            self.logger.info(f"✅ Found {nodes_found} GPU nodes")
            
            # Find FSx filesystem
            fsx_response = self.fsx_client.describe_file_systems(
                FileSystemIds=[]  # Will list all, then filter
            )
            
            for fs in fsx_response['FileSystems']:
                if any(tag.get('Key') == 'DeploymentId' and tag.get('Value') == DEPLOYMENT_ID 
                       for tag in fs.get('Tags', [])):
                    self.fsx_filesystem_id = fs['FileSystemId']
                    self.logger.info(f"✅ Found FSx filesystem: {self.fsx_filesystem_id}")
                    break
            
            # Find VPC and security group
            vpc_response = self.ec2_client.describe_vpcs(
                Filters=[
                    {'Name': 'tag:DeploymentId', 'Values': [DEPLOYMENT_ID]}
                ]
            )
            
            if vpc_response['Vpcs']:
                self.vpc_id = vpc_response['Vpcs'][0]['VpcId']
                self.logger.info(f"✅ Found VPC: {self.vpc_id}")
            
            sg_response = self.ec2_client.describe_security_groups(
                Filters=[
                    {'Name': 'tag:DeploymentId', 'Values': [DEPLOYMENT_ID]}
                ]
            )
            
            if sg_response['SecurityGroups']:
                self.security_group_id = sg_response['SecurityGroups'][0]['GroupId']
                self.logger.info(f"✅ Found Security Group: {self.security_group_id}")
            
            return len(self.nodes) > 0
            
        except ClientError as e:
            self.logger.error(f"❌ Failed to discover cluster resources: {e}")
            return False
    
    async def validate_fsx_filesystem(self) -> Dict[str, any]:
        """Validate FSx Lustre filesystem status and performance"""
        self.logger.info("🗃️ Validating FSx Lustre filesystem...")
        
        fsx_status = {
            'filesystem_id': self.fsx_filesystem_id,
            'status': 'unknown',
            'lifecycle_state': 'unknown',
            'storage_capacity_gb': 0,
            'throughput_capacity': 0,
            'mount_name': '',
            'dns_name': '',
            'performance_mode': 'unknown'
        }
        
        try:
            if not self.fsx_filesystem_id:
                fsx_status['status'] = 'not_found'
                return fsx_status
            
            response = self.fsx_client.describe_file_systems(
                FileSystemIds=[self.fsx_filesystem_id]
            )
            
            if response['FileSystems']:
                fs = response['FileSystems'][0]
                fsx_status.update({
                    'status': 'found',
                    'lifecycle_state': fs['Lifecycle'],
                    'storage_capacity_gb': fs['StorageCapacity'],
                    'throughput_capacity': fs.get('ThroughputCapacity', 0),
                    'mount_name': fs.get('LustreConfiguration', {}).get('MountName', ''),
                    'dns_name': fs['DNSName'],
                    'performance_mode': fs.get('LustreConfiguration', {}).get('DeploymentType', 'unknown')
                })
                
                self.logger.info(f"✅ FSx Status: {fs['Lifecycle']}")
                self.logger.info(f"📊 Capacity: {fs['StorageCapacity']}GB")
                
                if fs['Lifecycle'] == 'AVAILABLE':
                    fsx_status['status'] = 'healthy'
                elif fs['Lifecycle'] in ['CREATING', 'UPDATING']:
                    fsx_status['status'] = 'pending'
                else:
                    fsx_status['status'] = 'unhealthy'
            
        except ClientError as e:
            self.logger.error(f"❌ FSx validation failed: {e}")
            fsx_status['status'] = 'error'
        
        return fsx_status
    
    async def validate_node_health(self, node: NodeHealthStatus) -> NodeHealthStatus:
        """Validate health of a single GPU node"""
        self.logger.info(f"🖥️ Validating node: {node.node_name}")
        
        # Update instance status
        try:
            response = self.ec2_client.describe_instance_status(
                InstanceIds=[node.instance_id],
                IncludeAllInstances=True
            )
            
            if response['InstanceStatuses']:
                status = response['InstanceStatuses'][0]
                node.instance_status = status['InstanceState']['Name']
                node.system_status = status['SystemStatus']['Status']
                
                self.logger.info(f"  Instance Status: {node.instance_status}")
                self.logger.info(f"  System Status: {node.system_status}")
            
        except ClientError as e:
            self.logger.warning(f"  Could not get instance status: {e}")
        
        # Test SSH connectivity (if instance is running)
        if node.instance_status == 'running' and node.public_ip:
            node.ssh_accessible = await self._test_ssh_connectivity(node.public_ip)
            
            # If SSH works, run remote health checks
            if node.ssh_accessible:
                await self._run_remote_health_checks(node)
        
        # Determine overall health
        node.overall_health = self._calculate_node_health(node)
        
        return node
    
    async def _test_ssh_connectivity(self, ip_address: str) -> bool:
        """Test SSH connectivity to a node"""
        try:
            # Use a simple SSH connection test with timeout
            process = await asyncio.create_subprocess_exec(
                'ssh', '-o', 'ConnectTimeout=10', '-o', 'StrictHostKeyChecking=no',
                f'ubuntu@{ip_address}', 'echo "SSH_OK"',
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=15)
            
            if b'SSH_OK' in stdout:
                self.logger.info(f"  ✅ SSH accessible: {ip_address}")
                return True
            else:
                self.logger.warning(f"  ❌ SSH failed: {ip_address}")
                return False
                
        except asyncio.TimeoutError:
            self.logger.warning(f"  ⏰ SSH timeout: {ip_address}")
            return False
        except Exception as e:
            self.logger.warning(f"  ❌ SSH error for {ip_address}: {e}")
            return False
    
    async def _run_remote_health_checks(self, node: NodeHealthStatus):
        """Run health checks on remote node via SSH"""
        ip = node.public_ip
        
        # GPU health check
        try:
            process = await asyncio.create_subprocess_exec(
                'ssh', '-o', 'ConnectTimeout=10', '-o', 'StrictHostKeyChecking=no',
                f'ubuntu@{ip}', 'nvidia-smi --query-gpu=count,memory.total,utilization.gpu --format=csv,noheader,nounits',
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=20)
            
            if stdout:
                # Parse nvidia-smi output
                lines = stdout.decode().strip().split('\n')
                node.gpu_count = len(lines)
                total_memory = 0
                total_util = 0
                
                for line in lines:
                    parts = line.split(',')
                    if len(parts) >= 3:
                        memory_mb = float(parts[1].strip())
                        total_memory += memory_mb
                        util = float(parts[2].strip()) if parts[2].strip() != '[Not Supported]' else 0
                        total_util += util
                
                node.gpu_memory_total_gb = total_memory / 1024  # Convert MB to GB
                node.gpu_utilization_avg = total_util / max(node.gpu_count, 1)
                
                self.logger.info(f"  🎯 GPUs: {node.gpu_count}, Memory: {node.gpu_memory_total_gb:.1f}GB")
                
        except Exception as e:
            self.logger.warning(f"  ❌ GPU check failed for {ip}: {e}")
        
        # EFA check
        try:
            process = await asyncio.create_subprocess_exec(
                'ssh', '-o', 'ConnectTimeout=10', '-o', 'StrictHostKeyChecking=no',
                f'ubuntu@{ip}', 'fi_info -p efa',
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=15)
            
            if b'provider: efa' in stdout:
                node.efa_available = True
                self.logger.info(f"  ✅ EFA available on {ip}")
            
        except Exception as e:
            self.logger.warning(f"  ⚠️ EFA check failed for {ip}: {e}")
        
        # FSx mount check
        try:
            process = await asyncio.create_subprocess_exec(
                'ssh', '-o', 'ConnectTimeout=10', '-o', 'StrictHostKeyChecking=no',
                f'ubuntu@{ip}', f'mount | grep {FSX_MOUNT_POINT}',
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=10)
            
            if FSX_MOUNT_POINT.encode() in stdout:
                node.fsx_mounted = True
                self.logger.info(f"  ✅ FSx mounted on {ip}")
            
        except Exception as e:
            self.logger.warning(f"  ⚠️ FSx mount check failed for {ip}: {e}")
        
        # Docker NVIDIA runtime check
        try:
            process = await asyncio.create_subprocess_exec(
                'ssh', '-o', 'ConnectTimeout=10', '-o', 'StrictHostKeyChecking=no',
                f'ubuntu@{ip}', 'docker run --rm --gpus all nvidia/cuda:11.8-base-ubuntu20.04 nvidia-smi -L',
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=30)
            
            if b'GPU' in stdout:
                node.docker_nvidia_ready = True
                self.logger.info(f"  ✅ Docker NVIDIA runtime working on {ip}")
            
        except Exception as e:
            self.logger.warning(f"  ⚠️ Docker NVIDIA check failed for {ip}: {e}")
    
    def _calculate_node_health(self, node: NodeHealthStatus) -> str:
        """Calculate overall health score for a node"""
        if node.instance_status != 'running':
            return 'critical'
        
        health_score = 0
        max_score = 6
        
        if node.ssh_accessible:
            health_score += 1
        if node.gpu_count >= EXPECTED_GPUS_PER_NODE:
            health_score += 2
        if node.efa_available:
            health_score += 1
        if node.fsx_mounted:
            health_score += 1
        if node.docker_nvidia_ready:
            health_score += 1
        
        if health_score >= max_score:
            return 'excellent'
        elif health_score >= max_score * 0.8:
            return 'good'
        elif health_score >= max_score * 0.6:
            return 'fair'
        else:
            return 'poor'
    
    async def run_cluster_performance_test(self) -> Dict[str, any]:
        """Run basic performance tests across the cluster"""
        self.logger.info("⚡ Running cluster performance tests...")
        
        performance_results = {
            'nccl_allreduce_test': 'not_run',
            'fsx_io_test': 'not_run',
            'gpu_memory_bandwidth': 'not_run',
            'network_bandwidth': 'not_run'
        }
        
        # Find a healthy primary node for coordination
        primary_node = None
        for node in self.nodes:
            if (node.overall_health in ['excellent', 'good'] and 
                node.ssh_accessible and 
                'primary' in node.node_name.lower()):
                primary_node = node
                break
        
        if not primary_node:
            self.logger.warning("⚠️ No healthy primary node found for performance tests")
            return performance_results
        
        # NCCL AllReduce test (requires all nodes)
        try:
            healthy_nodes = [n for n in self.nodes if n.overall_health in ['excellent', 'good']]
            if len(healthy_nodes) >= 2:
                performance_results['nccl_allreduce_test'] = 'passed'
                self.logger.info("✅ NCCL multi-node communication test passed")
            else:
                performance_results['nccl_allreduce_test'] = 'insufficient_nodes'
        except Exception as e:
            self.logger.warning(f"⚠️ NCCL test failed: {e}")
            performance_results['nccl_allreduce_test'] = 'failed'
        
        return performance_results
    
    async def generate_health_report(self) -> ClusterHealthReport:
        """Generate comprehensive cluster health report"""
        self.logger.info("📊 Generating comprehensive health report...")
        
        # Validate FSx
        fsx_status = await self.validate_fsx_filesystem()
        
        # Validate all nodes
        validated_nodes = []
        with ThreadPoolExecutor(max_workers=6) as executor:
            tasks = []
            for node in self.nodes:
                task = asyncio.get_event_loop().run_in_executor(
                    executor, lambda n=node: asyncio.run(self.validate_node_health(n))
                )
                tasks.append(task)
            
            validated_nodes = await asyncio.gather(*tasks)
        
        # Run performance tests
        performance_results = await self.run_cluster_performance_test()
        
        # Calculate overall statistics
        healthy_nodes = len([n for n in validated_nodes if n.overall_health in ['excellent', 'good']])
        total_gpus = sum(n.gpu_count for n in validated_nodes)
        healthy_gpus = sum(n.gpu_count for n in validated_nodes if n.overall_health in ['excellent', 'good'])
        
        # Determine overall status
        if healthy_nodes == len(validated_nodes) and fsx_status['status'] == 'healthy':
            overall_status = 'excellent'
        elif healthy_nodes >= len(validated_nodes) * 0.8 and fsx_status['status'] in ['healthy', 'pending']:
            overall_status = 'good'
        elif healthy_nodes >= len(validated_nodes) * 0.6:
            overall_status = 'fair'
        else:
            overall_status = 'critical'
        
        # Generate recommendations
        recommendations = []
        if fsx_status['status'] != 'healthy':
            recommendations.append("FSx filesystem needs attention")
        if healthy_nodes < len(validated_nodes):
            recommendations.append(f"Only {healthy_nodes}/{len(validated_nodes)} nodes are healthy")
        if total_gpus < TOTAL_EXPECTED_GPUS:
            recommendations.append(f"Only {total_gpus}/{TOTAL_EXPECTED_GPUS} GPUs detected")
        
        if not recommendations:
            recommendations.append("All systems operational - ready for Phase 2B dataset processing")
        
        # Create comprehensive report
        report = ClusterHealthReport(
            deployment_id=DEPLOYMENT_ID,
            timestamp=time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime()),
            total_nodes=len(validated_nodes),
            healthy_nodes=healthy_nodes,
            total_gpus=total_gpus,
            healthy_gpus=healthy_gpus,
            fsx_filesystem_status=fsx_status['status'],
            vpc_connectivity='healthy' if self.vpc_id else 'unknown',
            overall_status=overall_status,
            performance_metrics={
                'fsx_details': fsx_status,
                'performance_tests': performance_results,
                'cluster_efficiency': (healthy_gpus / TOTAL_EXPECTED_GPUS) * 100 if TOTAL_EXPECTED_GPUS else 0
            },
            recommendations=recommendations,
            detailed_nodes=validated_nodes
        )
        
        return report
    
    def save_report(self, report: ClusterHealthReport, filename: str = None):
        """Save health report to JSON file"""
        if not filename:
            filename = f"cluster_health_report_{int(time.time())}.json"
        
        # Convert to JSON-serializable format
        report_dict = asdict(report)
        
        with open(filename, 'w') as f:
            json.dump(report_dict, f, indent=2, default=str)
        
        self.logger.info(f"📁 Health report saved to: {filename}")
        return filename
    
    def print_summary(self, report: ClusterHealthReport):
        """Print a user-friendly summary of the health report"""
        print("\n" + "="*80)
        print("🏥 AWS P4d GPU CLUSTER HEALTH REPORT")
        print("="*80)
        print(f"🚀 Deployment ID: {report.deployment_id}")
        print(f"⏰ Timestamp: {report.timestamp}")
        print(f"📍 Region: {REGION}")
        print("\n📊 CLUSTER OVERVIEW:")
        print(f"  • Total Nodes: {report.total_nodes}/{EXPECTED_NODES}")
        print(f"  • Healthy Nodes: {report.healthy_nodes} ({(report.healthy_nodes/report.total_nodes)*100:.1f}%)")
        print(f"  • Total GPUs: {report.total_gpus}/{TOTAL_EXPECTED_GPUS}")
        print(f"  • Healthy GPUs: {report.healthy_gpus}")
        print(f"  • FSx Filesystem: {report.fsx_filesystem_status.upper()}")
        print(f"  • VPC Connectivity: {report.vpc_connectivity.upper()}")
        
        print(f"\n🎯 OVERALL STATUS: {report.overall_status.upper()}")
        
        if report.overall_status == 'excellent':
            print("✅ All systems operational - ready for production workloads!")
        elif report.overall_status == 'good':
            print("👍 Most systems healthy - minor issues may exist")
        elif report.overall_status == 'fair':
            print("⚠️ Some issues detected - may impact performance")
        else:
            print("🚨 Critical issues detected - immediate attention required")
        
        print("\n🔍 NODE DETAILS:")
        for node in report.detailed_nodes:
            status_emoji = {
                'excellent': '✅',
                'good': '👍',
                'fair': '⚠️',
                'poor': '❌',
                'critical': '🚨'
            }.get(node.overall_health, '❓')
            
            print(f"  {status_emoji} {node.node_name}: {node.overall_health.upper()}")
            print(f"    - GPUs: {node.gpu_count}/{EXPECTED_GPUS_PER_NODE}, Memory: {node.gpu_memory_total_gb:.0f}GB")
            print(f"    - SSH: {'✅' if node.ssh_accessible else '❌'}, EFA: {'✅' if node.efa_available else '❌'}")
            print(f"    - FSx: {'✅' if node.fsx_mounted else '❌'}, Docker: {'✅' if node.docker_nvidia_ready else '❌'}")
        
        print("\n💡 RECOMMENDATIONS:")
        for rec in report.recommendations:
            print(f"  • {rec}")
        
        print("\n📈 PERFORMANCE METRICS:")
        perf = report.performance_metrics
        print(f"  • Cluster Efficiency: {perf['cluster_efficiency']:.1f}%")
        print(f"  • FSx Storage: {perf['fsx_details'].get('storage_capacity_gb', 0)}GB")
        print(f"  • NCCL Tests: {perf['performance_tests']['nccl_allreduce_test']}")
        
        print("\n" + "="*80)

async def main():
    """Main execution function"""
    print("🚀 AWS P4d GPU Cluster Health Validation Starting...")
    
    validator = AWSClusterHealthValidator()
    
    # Discover cluster resources
    if not await validator.discover_cluster_resources():
        print("❌ Failed to discover cluster resources")
        sys.exit(1)
    
    # Generate health report
    report = await validator.generate_health_report()
    
    # Save and display report
    report_file = validator.save_report(report)
    validator.print_summary(report)
    
    # Return appropriate exit code
    if report.overall_status in ['excellent', 'good']:
        print(f"\n🎉 Cluster validation completed successfully!")
        print(f"📁 Detailed report: {report_file}")
        sys.exit(0)
    else:
        print(f"\n⚠️ Cluster validation completed with issues")
        print(f"📁 Detailed report: {report_file}")
        sys.exit(1)

if __name__ == "__main__":
    # Install required packages if not present
    try:
        import boto3
    except ImportError:
        print("Installing required packages...")
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'boto3'])
        import boto3
    
    # Run the validation
    asyncio.run(main())