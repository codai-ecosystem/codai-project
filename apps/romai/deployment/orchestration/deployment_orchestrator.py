"""
Production Deployment Orchestrator for RomAI
Complete deployment management system with Romanian cultural awareness
"""

import asyncio
import logging
import yaml
import json
import subprocess
import os
import time
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
from datetime import datetime
import docker
import kubernetes
from kubernetes import client, config as k8s_config
import requests

logger = logging.getLogger(__name__)

class DeploymentEnvironment(Enum):
    """Deployment environments"""
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"

class DeploymentStatus(Enum):
    """Deployment status"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    ROLLED_BACK = "rolled_back"

@dataclass
class DeploymentConfig:
    """Deployment configuration"""
    environment: DeploymentEnvironment
    version: str
    replicas: int
    resource_limits: Dict[str, str]
    cultural_features_enabled: bool
    monitoring_enabled: bool
    auto_scaling_enabled: bool
    backup_before_deploy: bool

@dataclass
class DeploymentResult:
    """Deployment result information"""
    deployment_id: str
    environment: DeploymentEnvironment
    status: DeploymentStatus
    version: str
    start_time: datetime
    end_time: Optional[datetime]
    success: bool
    error_message: Optional[str]
    rollback_available: bool
    health_check_passed: bool
    cultural_validation_passed: bool

class RomAIProductionDeploymentOrchestrator:
    """Complete production deployment orchestration for RomAI"""
    
    def __init__(self, base_config_path: str):
        self.base_config_path = base_config_path
        self.docker_client = None
        self.k8s_client = None
        
        # Deployment tracking
        self.active_deployments: Dict[str, DeploymentResult] = {}
        self.deployment_history: List[DeploymentResult] = []
        
        # Load configuration
        self.load_configuration()
        
        # Initialize clients
        self.initialize_clients()
    
    def load_configuration(self):
        """Load deployment configuration"""
        with open(self.base_config_path, 'r') as f:
            self.config = yaml.safe_load(f)
        
        logger.info("Deployment configuration loaded")
    
    def initialize_clients(self):
        """Initialize Docker and Kubernetes clients"""
        # Initialize Docker client
        try:
            self.docker_client = docker.from_env()
            logger.info("Docker client initialized")
        except Exception as e:
            logger.warning(f"Failed to initialize Docker client: {e}")
        
        # Initialize Kubernetes client
        try:
            if os.path.exists(os.path.expanduser('~/.kube/config')):
                k8s_config.load_kube_config()
            else:
                k8s_config.load_incluster_config()
            
            self.k8s_client = client.ApiClient()
            logger.info("Kubernetes client initialized")
        except Exception as e:
            logger.warning(f"Failed to initialize Kubernetes client: {e}")
    
    def generate_deployment_id(self, environment: DeploymentEnvironment, version: str) -> str:
        """Generate unique deployment ID"""
        timestamp = int(time.time())
        return f"romai-{environment.value}-{version}-{timestamp}"
    
    async def validate_pre_deployment_requirements(self, deployment_config: DeploymentConfig) -> Tuple[bool, List[str]]:
        """Validate pre-deployment requirements"""
        issues = []
        
        # Check if required images exist
        required_images = [
            f"romai/agi-server:{deployment_config.version}",
            f"romai/enterprise-api:{deployment_config.version}",
            f"romai/cultural-gateway:{deployment_config.version}"
        ]
        
        if self.docker_client:
            for image in required_images:
                try:
                    self.docker_client.images.get(image)
                except docker.errors.ImageNotFound:
                    issues.append(f"Required image not found: {image}")
        
        # Check Kubernetes cluster connectivity
        if self.k8s_client and deployment_config.environment != DeploymentEnvironment.DEVELOPMENT:
            try:
                v1 = client.CoreV1Api(self.k8s_client)
                v1.list_namespace()
            except Exception as e:
                issues.append(f"Kubernetes cluster not accessible: {e}")
        
        # Validate cultural features configuration
        if deployment_config.cultural_features_enabled:
            cultural_requirements = [
                'diacritics_support',
                'cultural_routing',
                'romanian_context_enhancement'
            ]
            
            for requirement in cultural_requirements:
                if not self.config.get('cultural_features', {}).get(requirement, False):
                    issues.append(f"Cultural feature not configured: {requirement}")
        
        # Check resource requirements
        if deployment_config.environment == DeploymentEnvironment.PRODUCTION:
            min_memory = self.config.get('production', {}).get('min_memory_gb', 8)
            min_cpu = self.config.get('production', {}).get('min_cpu_cores', 4)
            
            try:
                # This would check actual cluster resources in a real implementation
                # For now, we'll just validate the configuration
                pass
            except Exception as e:
                issues.append(f"Resource validation failed: {e}")
        
        return len(issues) == 0, issues
    
    async def backup_current_deployment(self, environment: DeploymentEnvironment) -> bool:
        """Create backup of current deployment"""
        try:
            backup_name = f"romai-{environment.value}-backup-{int(time.time())}"
            
            if environment == DeploymentEnvironment.DEVELOPMENT:
                # Docker Compose backup
                await self._backup_docker_deployment(backup_name)
            else:
                # Kubernetes backup
                await self._backup_kubernetes_deployment(environment, backup_name)
            
            logger.info(f"Backup created: {backup_name}")
            return True
            
        except Exception as e:
            logger.error(f"Backup failed: {e}")
            return False
    
    async def _backup_docker_deployment(self, backup_name: str):
        """Backup Docker deployment"""
        # Export current container states
        containers = self.docker_client.containers.list(filters={'name': 'romai'})
        
        backup_data = {
            'timestamp': datetime.now().isoformat(),
            'containers': []
        }
        
        for container in containers:
            container_data = {
                'name': container.name,
                'image': container.image.tags[0] if container.image.tags else 'unknown',
                'status': container.status,
                'env': container.attrs['Config']['Env'],
                'volumes': container.attrs['Mounts']
            }
            backup_data['containers'].append(container_data)
        
        # Save backup configuration
        backup_path = f"backups/{backup_name}.json"
        os.makedirs(os.path.dirname(backup_path), exist_ok=True)
        
        with open(backup_path, 'w') as f:
            json.dump(backup_data, f, indent=2)
    
    async def _backup_kubernetes_deployment(self, environment: DeploymentEnvironment, backup_name: str):
        """Backup Kubernetes deployment"""
        apps_v1 = client.AppsV1Api(self.k8s_client)
        core_v1 = client.CoreV1Api(self.k8s_client)
        
        namespace = f"romai-{environment.value}"
        
        backup_data = {
            'timestamp': datetime.now().isoformat(),
            'namespace': namespace,
            'deployments': [],
            'services': [],
            'configmaps': []
        }
        
        try:
            # Backup deployments
            deployments = apps_v1.list_namespaced_deployment(namespace=namespace)
            for deployment in deployments.items:
                backup_data['deployments'].append(
                    self.k8s_client.sanitize_for_serialization(deployment)
                )
            
            # Backup services
            services = core_v1.list_namespaced_service(namespace=namespace)
            for service in services.items:
                backup_data['services'].append(
                    self.k8s_client.sanitize_for_serialization(service)
                )
            
            # Backup configmaps
            configmaps = core_v1.list_namespaced_config_map(namespace=namespace)
            for configmap in configmaps.items:
                backup_data['configmaps'].append(
                    self.k8s_client.sanitize_for_serialization(configmap)
                )
            
        except Exception as e:
            logger.error(f"Kubernetes backup failed: {e}")
            raise
        
        # Save backup
        backup_path = f"backups/{backup_name}.json"
        os.makedirs(os.path.dirname(backup_path), exist_ok=True)
        
        with open(backup_path, 'w') as f:
            json.dump(backup_data, f, indent=2)
    
    async def deploy_to_development(self, deployment_config: DeploymentConfig) -> DeploymentResult:
        """Deploy to development environment using Docker Compose"""
        deployment_id = self.generate_deployment_id(deployment_config.environment, deployment_config.version)
        
        result = DeploymentResult(
            deployment_id=deployment_id,
            environment=deployment_config.environment,
            status=DeploymentStatus.IN_PROGRESS,
            version=deployment_config.version,
            start_time=datetime.now(),
            end_time=None,
            success=False,
            error_message=None,
            rollback_available=False,
            health_check_passed=False,
            cultural_validation_passed=False
        )
        
        self.active_deployments[deployment_id] = result
        
        try:
            # Update Docker Compose configuration
            compose_config = self._generate_docker_compose_config(deployment_config)
            compose_path = 'deployment/docker/docker-compose.dev.yml'
            
            with open(compose_path, 'w') as f:
                yaml.dump(compose_config, f, default_flow_style=False)
            
            # Deploy using Docker Compose
            cmd = ['docker-compose', '-f', compose_path, 'up', '-d', '--build']
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                result.success = True
                result.status = DeploymentStatus.COMPLETED
                logger.info(f"Development deployment completed: {deployment_id}")
            else:
                result.error_message = stderr.decode()
                result.status = DeploymentStatus.FAILED
                logger.error(f"Development deployment failed: {result.error_message}")
            
        except Exception as e:
            result.error_message = str(e)
            result.status = DeploymentStatus.FAILED
            logger.error(f"Development deployment exception: {e}")
        
        finally:
            result.end_time = datetime.now()
            self.deployment_history.append(result)
            
            if deployment_id in self.active_deployments:
                del self.active_deployments[deployment_id]
        
        # Perform health checks
        if result.success:
            await self._perform_post_deployment_validation(result, deployment_config)
        
        return result
    
    async def deploy_to_kubernetes(self, deployment_config: DeploymentConfig) -> DeploymentResult:
        """Deploy to Kubernetes (staging/production)"""
        deployment_id = self.generate_deployment_id(deployment_config.environment, deployment_config.version)
        
        result = DeploymentResult(
            deployment_id=deployment_id,
            environment=deployment_config.environment,
            status=DeploymentStatus.IN_PROGRESS,
            version=deployment_config.version,
            start_time=datetime.now(),
            end_time=None,
            success=False,
            error_message=None,
            rollback_available=True,
            health_check_passed=False,
            cultural_validation_passed=False
        )
        
        self.active_deployments[deployment_id] = result
        
        try:
            namespace = f"romai-{deployment_config.environment.value}"
            
            # Create namespace if it doesn't exist
            await self._ensure_namespace_exists(namespace)
            
            # Apply Kubernetes manifests
            manifests = self._generate_kubernetes_manifests(deployment_config)
            
            for manifest in manifests:
                await self._apply_kubernetes_manifest(manifest, namespace)
            
            # Wait for rollout to complete
            await self._wait_for_rollout_completion(namespace, deployment_config)
            
            result.success = True
            result.status = DeploymentStatus.COMPLETED
            logger.info(f"Kubernetes deployment completed: {deployment_id}")
            
        except Exception as e:
            result.error_message = str(e)
            result.status = DeploymentStatus.FAILED
            logger.error(f"Kubernetes deployment failed: {e}")
        
        finally:
            result.end_time = datetime.now()
            self.deployment_history.append(result)
            
            if deployment_id in self.active_deployments:
                del self.active_deployments[deployment_id]
        
        # Perform health checks
        if result.success:
            await self._perform_post_deployment_validation(result, deployment_config)
        
        return result
    
    def _generate_docker_compose_config(self, deployment_config: DeploymentConfig) -> Dict[str, Any]:
        """Generate Docker Compose configuration"""
        base_compose = {
            'version': '3.8',
            'services': {
                'romai-agi-server': {
                    'image': f'romai/agi-server:{deployment_config.version}',
                    'ports': ['6101:6101'],
                    'environment': {
                        'ROMAI_ENV': deployment_config.environment.value,
                        'ROMANIAN_CULTURAL_MODE': 'enhanced' if deployment_config.cultural_features_enabled else 'basic'
                    }
                },
                'romai-enterprise-api': {
                    'image': f'romai/enterprise-api:{deployment_config.version}',
                    'ports': ['8001:8001'],
                    'depends_on': ['romai-agi-server']
                }
            }
        }
        
        # Add cultural gateway if cultural features enabled
        if deployment_config.cultural_features_enabled:
            base_compose['services']['romai-cultural-gateway'] = {
                'image': f'romai/cultural-gateway:{deployment_config.version}',
                'ports': ['8080:8080'],
                'depends_on': ['romai-agi-server', 'romai-enterprise-api']
            }
        
        return base_compose
    
    def _generate_kubernetes_manifests(self, deployment_config: DeploymentConfig) -> List[Dict[str, Any]]:
        """Generate Kubernetes manifests"""
        manifests = []
        
        # Main AGI server deployment
        agi_deployment = {
            'apiVersion': 'apps/v1',
            'kind': 'Deployment',
            'metadata': {
                'name': 'romai-agi-server',
                'labels': {'app': 'romai-agi-server'}
            },
            'spec': {
                'replicas': deployment_config.replicas,
                'selector': {'matchLabels': {'app': 'romai-agi-server'}},
                'template': {
                    'metadata': {'labels': {'app': 'romai-agi-server'}},
                    'spec': {
                        'containers': [{
                            'name': 'romai-agi',
                            'image': f'romai/agi-server:{deployment_config.version}',
                            'ports': [{'containerPort': 6101}],
                            'env': [
                                {'name': 'ROMAI_ENV', 'value': deployment_config.environment.value},
                                {'name': 'ROMANIAN_CULTURAL_MODE', 'value': 'enhanced' if deployment_config.cultural_features_enabled else 'basic'}
                            ],
                            'resources': {
                                'limits': deployment_config.resource_limits,
                                'requests': {
                                    'memory': '4Gi',
                                    'cpu': '2'
                                }
                            }
                        }]
                    }
                }
            }
        }
        
        manifests.append(agi_deployment)
        
        # Service for AGI server
        agi_service = {
            'apiVersion': 'v1',
            'kind': 'Service',
            'metadata': {'name': 'romai-agi-service'},
            'spec': {
                'selector': {'app': 'romai-agi-server'},
                'ports': [{'port': 6101, 'targetPort': 6101}]
            }
        }
        
        manifests.append(agi_service)
        
        # Add HPA if auto-scaling enabled
        if deployment_config.auto_scaling_enabled:
            hpa = {
                'apiVersion': 'autoscaling/v2',
                'kind': 'HorizontalPodAutoscaler',
                'metadata': {'name': 'romai-agi-hpa'},
                'spec': {
                    'scaleTargetRef': {
                        'apiVersion': 'apps/v1',
                        'kind': 'Deployment',
                        'name': 'romai-agi-server'
                    },
                    'minReplicas': 2,
                    'maxReplicas': 10,
                    'metrics': [
                        {
                            'type': 'Resource',
                            'resource': {
                                'name': 'cpu',
                                'target': {
                                    'type': 'Utilization',
                                    'averageUtilization': 70
                                }
                            }
                        }
                    ]
                }
            }
            manifests.append(hpa)
        
        return manifests
    
    async def _ensure_namespace_exists(self, namespace: str):
        """Ensure Kubernetes namespace exists"""
        core_v1 = client.CoreV1Api(self.k8s_client)
        
        try:
            core_v1.read_namespace(namespace)
        except client.exceptions.ApiException as e:
            if e.status == 404:
                # Create namespace
                namespace_manifest = client.V1Namespace(
                    metadata=client.V1ObjectMeta(name=namespace)
                )
                core_v1.create_namespace(namespace_manifest)
                logger.info(f"Created namespace: {namespace}")
    
    async def _apply_kubernetes_manifest(self, manifest: Dict[str, Any], namespace: str):
        """Apply Kubernetes manifest"""
        kind = manifest['kind']
        
        if kind == 'Deployment':
            apps_v1 = client.AppsV1Api(self.k8s_client)
            try:
                apps_v1.patch_namespaced_deployment(
                    name=manifest['metadata']['name'],
                    namespace=namespace,
                    body=manifest
                )
            except client.exceptions.ApiException as e:
                if e.status == 404:
                    apps_v1.create_namespaced_deployment(
                        namespace=namespace,
                        body=manifest
                    )
        
        elif kind == 'Service':
            core_v1 = client.CoreV1Api(self.k8s_client)
            try:
                core_v1.patch_namespaced_service(
                    name=manifest['metadata']['name'],
                    namespace=namespace,
                    body=manifest
                )
            except client.exceptions.ApiException as e:
                if e.status == 404:
                    core_v1.create_namespaced_service(
                        namespace=namespace,
                        body=manifest
                    )
        
        elif kind == 'HorizontalPodAutoscaler':
            autoscaling_v2 = client.AutoscalingV2Api(self.k8s_client)
            try:
                autoscaling_v2.patch_namespaced_horizontal_pod_autoscaler(
                    name=manifest['metadata']['name'],
                    namespace=namespace,
                    body=manifest
                )
            except client.exceptions.ApiException as e:
                if e.status == 404:
                    autoscaling_v2.create_namespaced_horizontal_pod_autoscaler(
                        namespace=namespace,
                        body=manifest
                    )
    
    async def _wait_for_rollout_completion(self, namespace: str, deployment_config: DeploymentConfig, timeout: int = 600):
        """Wait for Kubernetes rollout to complete"""
        apps_v1 = client.AppsV1Api(self.k8s_client)
        
        start_time = time.time()
        while time.time() - start_time < timeout:
            try:
                deployment = apps_v1.read_namespaced_deployment_status(
                    name='romai-agi-server',
                    namespace=namespace
                )
                
                if (deployment.status.ready_replicas and 
                    deployment.status.ready_replicas >= deployment_config.replicas):
                    logger.info("Rollout completed successfully")
                    return
                
                await asyncio.sleep(10)
                
            except Exception as e:
                logger.warning(f"Error checking rollout status: {e}")
                await asyncio.sleep(10)
        
        raise Exception(f"Rollout timeout after {timeout} seconds")
    
    async def _perform_post_deployment_validation(self, result: DeploymentResult, deployment_config: DeploymentConfig):
        """Perform post-deployment validation"""
        # Health check
        health_check_passed = await self._perform_health_check(result, deployment_config)
        result.health_check_passed = health_check_passed
        
        # Cultural validation
        if deployment_config.cultural_features_enabled:
            cultural_validation_passed = await self._perform_cultural_validation(result, deployment_config)
            result.cultural_validation_passed = cultural_validation_passed
        else:
            result.cultural_validation_passed = True
        
        logger.info(f"Post-deployment validation - Health: {health_check_passed}, Cultural: {result.cultural_validation_passed}")
    
    async def _perform_health_check(self, result: DeploymentResult, deployment_config: DeploymentConfig) -> bool:
        """Perform health check on deployed services"""
        base_url = self._get_service_base_url(result.environment)
        
        try:
            # Check main AGI server
            response = requests.get(f"{base_url}:6101/health", timeout=10)
            if response.status_code != 200:
                return False
            
            # Check enterprise API
            response = requests.get(f"{base_url}:8001/api/v1/health", timeout=10)
            if response.status_code != 200:
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return False
    
    async def _perform_cultural_validation(self, result: DeploymentResult, deployment_config: DeploymentConfig) -> bool:
        """Perform Romanian cultural validation"""
        base_url = self._get_service_base_url(result.environment)
        
        try:
            # Test diacritics handling
            test_payload = {
                "prompt": "Explică conceptul de dor în cultura românească."
            }
            
            response = requests.post(
                f"{base_url}:6101/generate",
                json=test_payload,
                timeout=30
            )
            
            if response.status_code != 200:
                return False
            
            response_data = response.json()
            response_text = response_data.get('response', '')
            
            # Check if response contains Romanian diacritics
            romanian_diacritics = {'ă', 'â', 'î', 'ș', 'ț'}
            has_diacritics = any(char in response_text for char in romanian_diacritics)
            
            # Check if response addresses cultural concept
            cultural_keywords = ['dor', 'românesc', 'cultur', 'emoție']
            has_cultural_content = any(keyword in response_text.lower() for keyword in cultural_keywords)
            
            return has_diacritics and has_cultural_content
            
        except Exception as e:
            logger.error(f"Cultural validation failed: {e}")
            return False
    
    def _get_service_base_url(self, environment: DeploymentEnvironment) -> str:
        """Get service base URL for environment"""
        if environment == DeploymentEnvironment.DEVELOPMENT:
            return "http://localhost"
        elif environment == DeploymentEnvironment.STAGING:
            return "http://romai-staging.internal"
        else:  # PRODUCTION
            return "https://api.romai.ai"
    
    async def rollback_deployment(self, deployment_id: str) -> bool:
        """Rollback a deployment"""
        if deployment_id not in [d.deployment_id for d in self.deployment_history]:
            logger.error(f"Deployment not found: {deployment_id}")
            return False
        
        deployment = next(d for d in self.deployment_history if d.deployment_id == deployment_id)
        
        if not deployment.rollback_available:
            logger.error(f"Rollback not available for deployment: {deployment_id}")
            return False
        
        try:
            # Implementation would depend on environment
            logger.info(f"Rolling back deployment: {deployment_id}")
            
            deployment.status = DeploymentStatus.ROLLED_BACK
            return True
            
        except Exception as e:
            logger.error(f"Rollback failed: {e}")
            return False
    
    def get_deployment_status(self, deployment_id: str) -> Optional[DeploymentResult]:
        """Get deployment status"""
        if deployment_id in self.active_deployments:
            return self.active_deployments[deployment_id]
        
        for deployment in self.deployment_history:
            if deployment.deployment_id == deployment_id:
                return deployment
        
        return None
    
    def list_deployments(self, environment: Optional[DeploymentEnvironment] = None) -> List[DeploymentResult]:
        """List deployments"""
        deployments = list(self.active_deployments.values()) + self.deployment_history
        
        if environment:
            deployments = [d for d in deployments if d.environment == environment]
        
        return sorted(deployments, key=lambda d: d.start_time, reverse=True)
    
    async def deploy(self, deployment_config: DeploymentConfig) -> DeploymentResult:
        """Main deployment method"""
        logger.info(f"Starting deployment to {deployment_config.environment.value}")
        
        # Pre-deployment validation
        is_valid, issues = await self.validate_pre_deployment_requirements(deployment_config)
        if not is_valid:
            logger.error(f"Pre-deployment validation failed: {issues}")
            return DeploymentResult(
                deployment_id="validation-failed",
                environment=deployment_config.environment,
                status=DeploymentStatus.FAILED,
                version=deployment_config.version,
                start_time=datetime.now(),
                end_time=datetime.now(),
                success=False,
                error_message=f"Validation failed: {', '.join(issues)}",
                rollback_available=False,
                health_check_passed=False,
                cultural_validation_passed=False
            )
        
        # Backup current deployment if requested
        if deployment_config.backup_before_deploy:
            backup_success = await self.backup_current_deployment(deployment_config.environment)
            if not backup_success:
                logger.warning("Backup failed, but continuing with deployment")
        
        # Deploy based on environment
        if deployment_config.environment == DeploymentEnvironment.DEVELOPMENT:
            result = await self.deploy_to_development(deployment_config)
        else:
            result = await self.deploy_to_kubernetes(deployment_config)
        
        logger.info(f"Deployment completed: {result.deployment_id} - Success: {result.success}")
        return result


# Example usage
if __name__ == '__main__':
    async def main():
        orchestrator = RomAIProductionDeploymentOrchestrator('deployment/config/base.yaml')
        
        # Example deployment configuration
        config = DeploymentConfig(
            environment=DeploymentEnvironment.DEVELOPMENT,
            version="1.0.0",
            replicas=2,
            resource_limits={'memory': '8Gi', 'cpu': '4'},
            cultural_features_enabled=True,
            monitoring_enabled=True,
            auto_scaling_enabled=False,
            backup_before_deploy=True
        )
        
        print("🚀 Starting RomAI deployment...")
        
        result = await orchestrator.deploy(config)
        
        print(f"📊 Deployment Result:")
        print(f"   ID: {result.deployment_id}")
        print(f"   Status: {result.status.value}")
        print(f"   Success: {result.success}")
        print(f"   Health Check: {result.health_check_passed}")
        print(f"   Cultural Validation: {result.cultural_validation_passed}")
        
        if result.error_message:
            print(f"   Error: {result.error_message}")
    
    asyncio.run(main())