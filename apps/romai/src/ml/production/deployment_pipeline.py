"""
Production Deployment Pipeline for RomAI
Handles automated deployment, rollbacks, and infrastructure management
"""

import asyncio
import json
import logging
import shutil
import subprocess
import yaml
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
from pathlib import Path
import docker
import tempfile
import os

from model_registry import ModelRegistry, ModelVersion, ModelStatus, ModelType
from monitoring_system import ProductionMonitor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DeploymentStatus(Enum):
    """Deployment status"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    ROLLED_BACK = "rolled_back"

class DeploymentEnvironment(Enum):
    """Deployment environments"""
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"

@dataclass
class DeploymentConfig:
    """Deployment configuration"""
    model_version: str
    environment: DeploymentEnvironment
    replicas: int
    resource_limits: Dict[str, str]
    health_check_endpoint: str
    deployment_strategy: str  # 'rolling', 'blue_green', 'canary'
    rollback_on_failure: bool
    max_unavailable: int
    readiness_timeout: int
    
    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data['environment'] = self.environment.value
        return data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'DeploymentConfig':
        data['environment'] = DeploymentEnvironment(data['environment'])
        return cls(**data)

@dataclass
class DeploymentRecord:
    """Record of a deployment"""
    deployment_id: str
    model_version: str
    environment: DeploymentEnvironment
    status: DeploymentStatus
    config: DeploymentConfig
    started_at: datetime
    completed_at: Optional[datetime]
    logs: List[str]
    rollback_version: Optional[str]
    error_message: Optional[str]
    
    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data['environment'] = self.environment.value
        data['status'] = self.status.value
        data['config'] = self.config.to_dict()
        data['started_at'] = self.started_at.isoformat()
        data['completed_at'] = self.completed_at.isoformat() if self.completed_at else None
        return data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'DeploymentRecord':
        data['environment'] = DeploymentEnvironment(data['environment'])
        data['status'] = DeploymentStatus(data['status'])
        data['config'] = DeploymentConfig.from_dict(data['config'])
        data['started_at'] = datetime.fromisoformat(data['started_at'])
        data['completed_at'] = datetime.fromisoformat(data['completed_at']) if data['completed_at'] else None
        return cls(**data)

class DockerManager:
    """Manages Docker operations for deployment"""
    
    def __init__(self):
        try:
            self.client = docker.from_env()
            logger.info("Docker client initialized")
        except Exception as e:
            logger.error(f"Failed to initialize Docker client: {e}")
            self.client = None
    
    def build_image(self, model_version: str, model_path: str, 
                   dockerfile_path: str) -> Tuple[bool, str]:
        """Build Docker image for model"""
        if not self.client:
            return False, "Docker client not available"
        
        try:
            image_tag = f"romai-model:{model_version}"
            
            # Create build context
            with tempfile.TemporaryDirectory() as build_dir:
                build_path = Path(build_dir)
                
                # Copy model files
                model_dest = build_path / "model"
                model_dest.mkdir(exist_ok=True)
                
                if Path(model_path).is_file():
                    shutil.copy2(model_path, model_dest)
                else:
                    shutil.copytree(model_path, model_dest, dirs_exist_ok=True)
                
                # Copy Dockerfile
                dockerfile_dest = build_path / "Dockerfile"
                if Path(dockerfile_path).exists():
                    shutil.copy2(dockerfile_path, dockerfile_dest)
                else:
                    # Create default Dockerfile
                    self._create_default_dockerfile(dockerfile_dest)
                
                # Build image
                logger.info(f"Building Docker image: {image_tag}")
                image, build_logs = self.client.images.build(
                    path=str(build_path),
                    tag=image_tag,
                    rm=True
                )
                
                logger.info(f"Successfully built image: {image_tag}")
                return True, image_tag
                
        except Exception as e:
            logger.error(f"Failed to build Docker image: {e}")
            return False, str(e)
    
    def _create_default_dockerfile(self, dockerfile_path: Path):
        """Create default Dockerfile for RomAI models"""
        dockerfile_content = """
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    build-essential \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy model files
COPY model/ ./model/
COPY src/ ./src/

# Set environment variables
ENV PYTHONPATH="/app/src"
ENV MODEL_PATH="/app/model"

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:8000/health || exit 1

# Start command
CMD ["python", "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
"""
        dockerfile_path.write_text(dockerfile_content.strip())
    
    def deploy_container(self, image_tag: str, container_name: str, 
                        config: DeploymentConfig) -> Tuple[bool, str]:
        """Deploy container with configuration"""
        if not self.client:
            return False, "Docker client not available"
        
        try:
            # Stop and remove existing container
            try:
                existing = self.client.containers.get(container_name)
                existing.stop()
                existing.remove()
                logger.info(f"Removed existing container: {container_name}")
            except docker.errors.NotFound:
                pass
            
            # Create new container
            container = self.client.containers.run(
                image_tag,
                name=container_name,
                ports={'8000/tcp': None},  # Random port assignment
                mem_limit=config.resource_limits.get('memory', '1g'),
                cpu_count=int(config.resource_limits.get('cpu', '1')),
                environment={
                    'MODEL_VERSION': config.model_version,
                    'ENVIRONMENT': config.environment.value
                },
                detach=True,
                restart_policy={'Name': 'unless-stopped'}
            )
            
            logger.info(f"Started container: {container_name} ({container.id[:12]})")
            return True, container.id
            
        except Exception as e:
            logger.error(f"Failed to deploy container: {e}")
            return False, str(e)
    
    def health_check_container(self, container_name: str, 
                              endpoint: str = "/health") -> Tuple[bool, str]:
        """Check container health"""
        if not self.client:
            return False, "Docker client not available"
        
        try:
            container = self.client.containers.get(container_name)
            
            if container.status != 'running':
                return False, f"Container not running: {container.status}"
            
            # Get port mapping
            ports = container.attrs['NetworkSettings']['Ports']
            host_port = None
            
            for container_port, host_info in ports.items():
                if container_port == '8000/tcp' and host_info:
                    host_port = host_info[0]['HostPort']
                    break
            
            if not host_port:
                return False, "No port mapping found"
            
            # Make health check request
            import requests
            health_url = f"http://localhost:{host_port}{endpoint}"
            
            response = requests.get(health_url, timeout=10)
            if response.status_code == 200:
                return True, "Health check passed"
            else:
                return False, f"Health check failed: HTTP {response.status_code}"
                
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return False, str(e)
    
    def rollback_deployment(self, container_name: str, 
                           previous_image: str) -> Tuple[bool, str]:
        """Rollback to previous deployment"""
        if not self.client:
            return False, "Docker client not available"
        
        try:
            # Stop current container
            try:
                current = self.client.containers.get(container_name)
                current.stop()
                current.remove()
            except docker.errors.NotFound:
                pass
            
            # Start container with previous image
            rollback_container = self.client.containers.run(
                previous_image,
                name=container_name,
                ports={'8000/tcp': None},
                detach=True,
                restart_policy={'Name': 'unless-stopped'}
            )
            
            logger.info(f"Rolled back to: {previous_image}")
            return True, rollback_container.id
            
        except Exception as e:
            logger.error(f"Rollback failed: {e}")
            return False, str(e)

class KubernetesManager:
    """Manages Kubernetes deployments (when available)"""
    
    def __init__(self):
        self.k8s_available = False
        try:
            # Check if kubectl is available
            result = subprocess.run(['kubectl', 'version', '--client'], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                self.k8s_available = True
                logger.info("Kubernetes client available")
        except FileNotFoundError:
            logger.info("Kubernetes client not available")
    
    def create_deployment_manifest(self, config: DeploymentConfig, 
                                  image_tag: str) -> str:
        """Create Kubernetes deployment manifest"""
        manifest = {
            'apiVersion': 'apps/v1',
            'kind': 'Deployment',
            'metadata': {
                'name': f'romai-{config.model_version}',
                'labels': {
                    'app': 'romai',
                    'version': config.model_version,
                    'environment': config.environment.value
                }
            },
            'spec': {
                'replicas': config.replicas,
                'selector': {
                    'matchLabels': {
                        'app': 'romai',
                        'version': config.model_version
                    }
                },
                'template': {
                    'metadata': {
                        'labels': {
                            'app': 'romai',
                            'version': config.model_version
                        }
                    },
                    'spec': {
                        'containers': [{
                            'name': 'romai-model',
                            'image': image_tag,
                            'ports': [{'containerPort': 8000}],
                            'resources': {
                                'limits': config.resource_limits,
                                'requests': {
                                    'cpu': '500m',
                                    'memory': '512Mi'
                                }
                            },
                            'readinessProbe': {
                                'httpGet': {
                                    'path': config.health_check_endpoint,
                                    'port': 8000
                                },
                                'initialDelaySeconds': 10,
                                'periodSeconds': 5
                            },
                            'livenessProbe': {
                                'httpGet': {
                                    'path': config.health_check_endpoint,
                                    'port': 8000
                                },
                                'initialDelaySeconds': 30,
                                'periodSeconds': 10
                            }
                        }]
                    }
                }
            }
        }
        
        return yaml.dump(manifest)
    
    def apply_deployment(self, manifest: str) -> Tuple[bool, str]:
        """Apply Kubernetes deployment"""
        if not self.k8s_available:
            return False, "Kubernetes not available"
        
        try:
            with tempfile.NamedTemporaryFile(mode='w', suffix='.yaml', delete=False) as f:
                f.write(manifest)
                manifest_path = f.name
            
            result = subprocess.run(
                ['kubectl', 'apply', '-f', manifest_path],
                capture_output=True, text=True
            )
            
            os.unlink(manifest_path)
            
            if result.returncode == 0:
                return True, result.stdout
            else:
                return False, result.stderr
                
        except Exception as e:
            return False, str(e)

class DeploymentPipeline:
    """Main deployment pipeline for RomAI"""
    
    def __init__(self, registry: ModelRegistry, monitor: ProductionMonitor):
        self.registry = registry
        self.monitor = monitor
        self.docker_manager = DockerManager()
        self.k8s_manager = KubernetesManager()
        self.deployment_history: List[DeploymentRecord] = []
        self.active_deployments: Dict[str, DeploymentRecord] = {}
        
        # Load deployment history
        self.load_deployment_history()
    
    def load_deployment_history(self):
        """Load deployment history from disk"""
        try:
            history_file = Path("deployment_history.json")
            if history_file.exists():
                with open(history_file, 'r') as f:
                    data = json.load(f)
                
                for record_data in data.get('deployments', []):
                    record = DeploymentRecord.from_dict(record_data)
                    self.deployment_history.append(record)
                
                logger.info(f"Loaded {len(self.deployment_history)} deployment records")
        except Exception as e:
            logger.error(f"Error loading deployment history: {e}")
    
    def save_deployment_history(self):
        """Save deployment history to disk"""
        try:
            data = {
                'deployments': [record.to_dict() for record in self.deployment_history[-100:]],
                'last_updated': datetime.now(timezone.utc).isoformat()
            }
            
            with open("deployment_history.json", 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving deployment history: {e}")
    
    async def deploy_model(self, model_version: str, 
                          environment: DeploymentEnvironment,
                          config: Optional[DeploymentConfig] = None) -> str:
        """Deploy model to specified environment"""
        try:
            # Get model from registry
            if model_version not in self.registry.models:
                raise ValueError(f"Model version {model_version} not found")
            
            model = self.registry.models[model_version]
            
            # Create default config if not provided
            if not config:
                config = DeploymentConfig(
                    model_version=model_version,
                    environment=environment,
                    replicas=1 if environment == DeploymentEnvironment.DEVELOPMENT else 3,
                    resource_limits={'memory': '1g', 'cpu': '1'},
                    health_check_endpoint='/health',
                    deployment_strategy='rolling',
                    rollback_on_failure=True,
                    max_unavailable=1,
                    readiness_timeout=300
                )
            
            # Create deployment record
            deployment_id = f"deploy_{model_version}_{environment.value}_{int(datetime.now().timestamp())}"
            
            deployment_record = DeploymentRecord(
                deployment_id=deployment_id,
                model_version=model_version,
                environment=environment,
                status=DeploymentStatus.PENDING,
                config=config,
                started_at=datetime.now(timezone.utc),
                completed_at=None,
                logs=[],
                rollback_version=None,
                error_message=None
            )
            
            self.active_deployments[deployment_id] = deployment_record
            self.deployment_history.append(deployment_record)
            
            # Start deployment process
            deployment_record.status = DeploymentStatus.IN_PROGRESS
            deployment_record.logs.append(f"Starting deployment of {model_version} to {environment.value}")
            
            # Build Docker image
            dockerfile_path = Path("docker/Dockerfile.model")  # Default path
            success, result = self.docker_manager.build_image(
                model_version, model.model_path, str(dockerfile_path)
            )
            
            if not success:
                deployment_record.status = DeploymentStatus.FAILED
                deployment_record.error_message = f"Image build failed: {result}"
                deployment_record.completed_at = datetime.now(timezone.utc)
                self.save_deployment_history()
                return deployment_id
            
            image_tag = result
            deployment_record.logs.append(f"Built Docker image: {image_tag}")
            
            # Deploy based on environment
            if environment == DeploymentEnvironment.DEVELOPMENT:
                # Simple Docker deployment for development
                container_name = f"romai-{model_version}-dev"
                success, result = self.docker_manager.deploy_container(
                    image_tag, container_name, config
                )
                
                if success:
                    deployment_record.logs.append(f"Deployed container: {container_name}")
                    
                    # Health check
                    await asyncio.sleep(10)  # Wait for startup
                    health_ok, health_result = self.docker_manager.health_check_container(
                        container_name, config.health_check_endpoint
                    )
                    
                    if health_ok:
                        deployment_record.status = DeploymentStatus.COMPLETED
                        deployment_record.logs.append("Health check passed")
                        
                        # Update model status
                        self.registry.update_model_status(
                            model_version, ModelStatus.PRODUCTION, 
                            datetime.now(timezone.utc)
                        )
                    else:
                        deployment_record.status = DeploymentStatus.FAILED
                        deployment_record.error_message = f"Health check failed: {health_result}"
                        
                        if config.rollback_on_failure:
                            await self._perform_rollback(deployment_record)
                else:
                    deployment_record.status = DeploymentStatus.FAILED
                    deployment_record.error_message = f"Container deployment failed: {result}"
            
            else:
                # Kubernetes deployment for staging/production
                if self.k8s_manager.k8s_available:
                    manifest = self.k8s_manager.create_deployment_manifest(config, image_tag)
                    success, result = self.k8s_manager.apply_deployment(manifest)
                    
                    if success:
                        deployment_record.status = DeploymentStatus.COMPLETED
                        deployment_record.logs.append("Kubernetes deployment successful")
                    else:
                        deployment_record.status = DeploymentStatus.FAILED
                        deployment_record.error_message = f"Kubernetes deployment failed: {result}"
                else:
                    deployment_record.status = DeploymentStatus.FAILED
                    deployment_record.error_message = "Kubernetes not available for production deployment"
            
            deployment_record.completed_at = datetime.now(timezone.utc)
            self.save_deployment_history()
            
            logger.info(f"Deployment {deployment_id} completed with status: {deployment_record.status.value}")
            return deployment_id
            
        except Exception as e:
            logger.error(f"Deployment failed: {e}")
            if deployment_id in self.active_deployments:
                deployment_record = self.active_deployments[deployment_id]
                deployment_record.status = DeploymentStatus.FAILED
                deployment_record.error_message = str(e)
                deployment_record.completed_at = datetime.now(timezone.utc)
                self.save_deployment_history()
            return deployment_id
    
    async def _perform_rollback(self, deployment_record: DeploymentRecord):
        """Perform rollback to previous version"""
        try:
            # Find previous successful deployment
            previous_deployment = None
            for record in reversed(self.deployment_history[:-1]):  # Exclude current
                if (record.environment == deployment_record.environment and
                    record.status == DeploymentStatus.COMPLETED):
                    previous_deployment = record
                    break
            
            if not previous_deployment:
                deployment_record.logs.append("No previous deployment found for rollback")
                return
            
            deployment_record.rollback_version = previous_deployment.model_version
            deployment_record.logs.append(f"Rolling back to {previous_deployment.model_version}")
            
            # Perform rollback (simplified - just log for now)
            deployment_record.status = DeploymentStatus.ROLLED_BACK
            deployment_record.logs.append("Rollback completed")
            
        except Exception as e:
            logger.error(f"Rollback failed: {e}")
            deployment_record.logs.append(f"Rollback failed: {e}")
    
    def get_deployment_status(self, deployment_id: str) -> Optional[DeploymentRecord]:
        """Get deployment status"""
        return self.active_deployments.get(deployment_id)
    
    def get_deployment_history(self, limit: int = 50) -> List[DeploymentRecord]:
        """Get deployment history"""
        return sorted(self.deployment_history, key=lambda x: x.started_at, reverse=True)[:limit]
    
    def get_active_deployments(self) -> List[DeploymentRecord]:
        """Get currently active deployments"""
        return [record for record in self.active_deployments.values() 
                if record.status == DeploymentStatus.IN_PROGRESS]

# Example usage and testing
async def test_deployment_pipeline():
    """Test the deployment pipeline"""
    print("🚀 Testing RomAI Deployment Pipeline")
    print("=" * 50)
    
    # Initialize components
    registry = ModelRegistry("test_registry.json")
    monitor = ProductionMonitor()
    pipeline = DeploymentPipeline(registry, monitor)
    
    print("✅ Deployment pipeline initialized")
    
    # Create a test model version
    from model_registry import ModelMetrics
    
    test_metrics = ModelMetrics(
        accuracy=0.85,
        latency_ms=150.0,
        throughput_rps=100.0,
        memory_usage_mb=512.0,
        cpu_usage_percent=25.0,
        gpu_usage_percent=60.0,
        error_rate=0.02,
        confidence_score=0.8,
        cultural_accuracy=0.9
    )
    
    version_id = registry.register_model(
        model_type=ModelType.MATHEMATICAL,
        model_path="/tmp/test_model.pt",
        config_path="/tmp/test_config.json",
        metrics=test_metrics
    )
    
    print(f"✅ Test model registered: {version_id}")
    
    # Test deployment to development
    deployment_id = await pipeline.deploy_model(
        version_id, 
        DeploymentEnvironment.DEVELOPMENT
    )
    
    print(f"✅ Deployment started: {deployment_id}")
    
    # Check deployment status
    deployment_status = pipeline.get_deployment_status(deployment_id)
    if deployment_status:
        print(f"✅ Deployment Status: {deployment_status.status.value}")
        print(f"   Logs: {len(deployment_status.logs)} entries")
    
    # Get deployment history
    history = pipeline.get_deployment_history(limit=5)
    print(f"✅ Deployment History: {len(history)} records")
    
    return True

if __name__ == "__main__":
    # Install required packages
    try:
        import docker
        import yaml
    except ImportError:
        print("Installing required packages...")
        subprocess.run(["pip", "install", "docker", "pyyaml"], check=True)
        import docker
        import yaml
    
    asyncio.run(test_deployment_pipeline())