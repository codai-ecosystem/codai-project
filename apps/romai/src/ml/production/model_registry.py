"""
Production Model Registry for RomAI
Handles model versioning, A/B testing, and deployment management
"""

import json
import logging
import asyncio
import hashlib
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple
from pathlib import Path
from dataclasses import dataclass, asdict
from enum import Enum
import torch
import uuid

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelStatus(Enum):
    """Model deployment status"""
    TRAINING = "training"
    TESTING = "testing"
    STAGING = "staging"
    PRODUCTION = "production"
    DEPRECATED = "deprecated"
    FAILED = "failed"

class ModelType(Enum):
    """Model types in RomAI"""
    MATHEMATICAL = "mathematical"
    LOGICAL = "logical"
    ROMANIAN = "romanian"
    VISION = "vision"
    AUDIO = "audio"
    MULTIMODAL = "multimodal"

@dataclass
class ModelMetrics:
    """Model performance metrics"""
    accuracy: float
    latency_ms: float
    throughput_rps: float
    memory_usage_mb: float
    cpu_usage_percent: float
    gpu_usage_percent: float
    error_rate: float
    confidence_score: float
    cultural_accuracy: float = 0.0  # Romanian-specific metric
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ModelMetrics':
        return cls(**data)

@dataclass
class ModelVersion:
    """Model version information"""
    version_id: str
    model_type: ModelType
    model_path: str
    config_path: str
    status: ModelStatus
    metrics: ModelMetrics
    created_at: datetime
    trained_on: Optional[datetime]
    deployed_at: Optional[datetime]
    metadata: Dict[str, Any]
    checksum: str
    training_logs: List[str]
    validation_results: Dict[str, Any]
    
    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data['model_type'] = self.model_type.value
        data['status'] = self.status.value
        data['created_at'] = self.created_at.isoformat()
        data['trained_on'] = self.trained_on.isoformat() if self.trained_on else None
        data['deployed_at'] = self.deployed_at.isoformat() if self.deployed_at else None
        data['metrics'] = self.metrics.to_dict()
        return data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ModelVersion':
        data['model_type'] = ModelType(data['model_type'])
        data['status'] = ModelStatus(data['status'])
        data['created_at'] = datetime.fromisoformat(data['created_at'])
        data['trained_on'] = datetime.fromisoformat(data['trained_on']) if data['trained_on'] else None
        data['deployed_at'] = datetime.fromisoformat(data['deployed_at']) if data['deployed_at'] else None
        data['metrics'] = ModelMetrics.from_dict(data['metrics'])
        return cls(**data)

class ABTestConfig:
    """A/B testing configuration"""
    
    def __init__(self, test_id: str, model_a_version: str, model_b_version: str,
                 traffic_split: float = 0.5, duration_hours: int = 24):
        self.test_id = test_id
        self.model_a_version = model_a_version
        self.model_b_version = model_b_version
        self.traffic_split = traffic_split  # Percentage for model A
        self.duration_hours = duration_hours
        self.start_time = datetime.now(timezone.utc)
        self.end_time = None
        self.results = {}
        self.is_active = True
    
    def should_use_model_a(self, request_hash: str) -> bool:
        """Deterministically route traffic based on request hash"""
        hash_int = int(hashlib.md5(request_hash.encode()).hexdigest()[:8], 16)
        return (hash_int % 100) < (self.traffic_split * 100)
    
    def is_test_active(self) -> bool:
        """Check if A/B test is still active"""
        if not self.is_active:
            return False
        
        elapsed = datetime.now(timezone.utc) - self.start_time
        return elapsed.total_seconds() < (self.duration_hours * 3600)
    
    def record_result(self, model_version: str, metrics: ModelMetrics):
        """Record test result for analysis"""
        if model_version not in self.results:
            self.results[model_version] = []
        self.results[model_version].append(metrics.to_dict())
    
    def get_summary(self) -> Dict[str, Any]:
        """Get A/B test summary"""
        summary = {
            'test_id': self.test_id,
            'model_a': self.model_a_version,
            'model_b': self.model_b_version,
            'traffic_split': self.traffic_split,
            'duration_hours': self.duration_hours,
            'start_time': self.start_time.isoformat(),
            'is_active': self.is_test_active(),
            'results_count': {
                version: len(results) for version, results in self.results.items()
            }
        }
        
        # Calculate average metrics for each model
        if self.results:
            summary['average_metrics'] = {}
            for version, results in self.results.items():
                if results:
                    avg_metrics = {}
                    metrics_keys = results[0].keys()
                    for key in metrics_keys:
                        if isinstance(results[0][key], (int, float)):
                            avg_metrics[key] = sum(r[key] for r in results) / len(results)
                    summary['average_metrics'][version] = avg_metrics
        
        return summary

class ModelRegistry:
    """Production model registry for RomAI"""
    
    def __init__(self, registry_path: str = "model_registry.json"):
        self.registry_path = Path(registry_path)
        self.models: Dict[str, ModelVersion] = {}
        self.active_models: Dict[ModelType, str] = {}  # Current production models
        self.ab_tests: Dict[str, ABTestConfig] = {}
        self.load_registry()
    
    def load_registry(self):
        """Load model registry from disk"""
        try:
            if self.registry_path.exists():
                with open(self.registry_path, 'r') as f:
                    data = json.load(f)
                
                # Load models
                for version_id, model_data in data.get('models', {}).items():
                    self.models[version_id] = ModelVersion.from_dict(model_data)
                
                # Load active models
                active_models_data = data.get('active_models', {})
                for model_type_str, version_id in active_models_data.items():
                    self.active_models[ModelType(model_type_str)] = version_id
                
                logger.info(f"Loaded {len(self.models)} models from registry")
            else:
                logger.info("No existing registry found, starting fresh")
                
        except Exception as e:
            logger.error(f"Error loading model registry: {e}")
            self.models = {}
            self.active_models = {}
    
    def save_registry(self):
        """Save model registry to disk"""
        try:
            data = {
                'models': {
                    version_id: model.to_dict() 
                    for version_id, model in self.models.items()
                },
                'active_models': {
                    model_type.value: version_id 
                    for model_type, version_id in self.active_models.items()
                },
                'last_updated': datetime.now(timezone.utc).isoformat()
            }
            
            with open(self.registry_path, 'w') as f:
                json.dump(data, f, indent=2)
                
            logger.info(f"Saved model registry with {len(self.models)} models")
            
        except Exception as e:
            logger.error(f"Error saving model registry: {e}")
    
    def calculate_checksum(self, model_path: str) -> str:
        """Calculate checksum for model file"""
        try:
            with open(model_path, 'rb') as f:
                return hashlib.sha256(f.read()).hexdigest()
        except Exception as e:
            logger.error(f"Error calculating checksum: {e}")
            return str(uuid.uuid4())
    
    def register_model(self, model_type: ModelType, model_path: str, 
                      config_path: str, metrics: ModelMetrics,
                      metadata: Optional[Dict[str, Any]] = None) -> str:
        """Register a new model version"""
        try:
            version_id = f"{model_type.value}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{str(uuid.uuid4())[:8]}"
            
            model_version = ModelVersion(
                version_id=version_id,
                model_type=model_type,
                model_path=model_path,
                config_path=config_path,
                status=ModelStatus.TESTING,
                metrics=metrics,
                created_at=datetime.now(timezone.utc),
                trained_on=None,
                deployed_at=None,
                metadata=metadata or {},
                checksum=self.calculate_checksum(model_path),
                training_logs=[],
                validation_results={}
            )
            
            self.models[version_id] = model_version
            self.save_registry()
            
            logger.info(f"Registered new model version: {version_id}")
            return version_id
            
        except Exception as e:
            logger.error(f"Error registering model: {e}")
            raise
    
    def update_model_status(self, version_id: str, status: ModelStatus,
                           deployment_time: Optional[datetime] = None):
        """Update model status"""
        if version_id not in self.models:
            raise ValueError(f"Model version {version_id} not found")
        
        self.models[version_id].status = status
        if deployment_time:
            self.models[version_id].deployed_at = deployment_time
        
        self.save_registry()
        logger.info(f"Updated model {version_id} status to {status.value}")
    
    def promote_to_production(self, version_id: str) -> bool:
        """Promote model version to production"""
        try:
            if version_id not in self.models:
                raise ValueError(f"Model version {version_id} not found")
            
            model = self.models[version_id]
            
            # Validate model is ready for production
            if model.status not in [ModelStatus.TESTING, ModelStatus.STAGING]:
                raise ValueError(f"Model {version_id} is not ready for production (status: {model.status.value})")
            
            # Check minimum quality thresholds
            if model.metrics.accuracy < 0.8:
                raise ValueError(f"Model accuracy {model.metrics.accuracy} below production threshold (0.8)")
            
            if model.metrics.latency_ms > 1000:
                raise ValueError(f"Model latency {model.metrics.latency_ms}ms above production threshold (1000ms)")
            
            # Update status and set as active
            self.update_model_status(version_id, ModelStatus.PRODUCTION, datetime.now(timezone.utc))
            self.active_models[model.model_type] = version_id
            
            self.save_registry()
            logger.info(f"Promoted model {version_id} to production")
            return True
            
        except Exception as e:
            logger.error(f"Error promoting model to production: {e}")
            return False
    
    def get_active_model(self, model_type: ModelType) -> Optional[ModelVersion]:
        """Get currently active production model"""
        version_id = self.active_models.get(model_type)
        if version_id and version_id in self.models:
            return self.models[version_id]
        return None
    
    def start_ab_test(self, model_type: ModelType, new_version_id: str,
                     traffic_split: float = 0.1, duration_hours: int = 24) -> str:
        """Start A/B test between current production model and new version"""
        try:
            current_model = self.get_active_model(model_type)
            if not current_model:
                raise ValueError(f"No active production model for type {model_type.value}")
            
            if new_version_id not in self.models:
                raise ValueError(f"New model version {new_version_id} not found")
            
            test_id = f"ab_test_{model_type.value}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            ab_test = ABTestConfig(
                test_id=test_id,
                model_a_version=current_model.version_id,
                model_b_version=new_version_id,
                traffic_split=1.0 - traffic_split,  # A gets most traffic, B gets test traffic
                duration_hours=duration_hours
            )
            
            self.ab_tests[test_id] = ab_test
            
            # Update new model status to staging
            self.update_model_status(new_version_id, ModelStatus.STAGING)
            
            logger.info(f"Started A/B test {test_id}: {current_model.version_id} vs {new_version_id}")
            return test_id
            
        except Exception as e:
            logger.error(f"Error starting A/B test: {e}")
            raise
    
    def get_model_for_request(self, model_type: ModelType, request_id: str) -> Optional[str]:
        """Get model version for request (handles A/B testing)"""
        try:
            # Check for active A/B tests
            active_test = None
            for test in self.ab_tests.values():
                if (test.model_a_version in self.models and 
                    self.models[test.model_a_version].model_type == model_type and
                    test.is_test_active()):
                    active_test = test
                    break
            
            if active_test:
                # Route based on A/B test
                if active_test.should_use_model_a(request_id):
                    return active_test.model_a_version
                else:
                    return active_test.model_b_version
            
            # No active test, return production model
            active_model = self.get_active_model(model_type)
            return active_model.version_id if active_model else None
            
        except Exception as e:
            logger.error(f"Error getting model for request: {e}")
            return None
    
    def record_inference_metrics(self, version_id: str, metrics: ModelMetrics):
        """Record inference metrics for monitoring"""
        try:
            if version_id not in self.models:
                logger.warning(f"Model version {version_id} not found for metrics recording")
                return
            
            # Update model metrics (rolling average)
            model = self.models[version_id]
            current_metrics = model.metrics
            
            # Simple exponential moving average (alpha = 0.1)
            alpha = 0.1
            current_metrics.accuracy = (1 - alpha) * current_metrics.accuracy + alpha * metrics.accuracy
            current_metrics.latency_ms = (1 - alpha) * current_metrics.latency_ms + alpha * metrics.latency_ms
            current_metrics.throughput_rps = (1 - alpha) * current_metrics.throughput_rps + alpha * metrics.throughput_rps
            current_metrics.memory_usage_mb = (1 - alpha) * current_metrics.memory_usage_mb + alpha * metrics.memory_usage_mb
            current_metrics.error_rate = (1 - alpha) * current_metrics.error_rate + alpha * metrics.error_rate
            current_metrics.confidence_score = (1 - alpha) * current_metrics.confidence_score + alpha * metrics.confidence_score
            
            # Record in A/B tests if applicable
            for test in self.ab_tests.values():
                if version_id in [test.model_a_version, test.model_b_version] and test.is_test_active():
                    test.record_result(version_id, metrics)
            
            # Periodically save registry (every 100 calls)
            import random
            if random.randint(1, 100) == 1:
                self.save_registry()
                
        except Exception as e:
            logger.error(f"Error recording inference metrics: {e}")
    
    def get_model_performance_report(self, model_type: Optional[ModelType] = None) -> Dict[str, Any]:
        """Generate performance report for models"""
        try:
            models_to_analyze = [
                model for model in self.models.values()
                if model_type is None or model.model_type == model_type
            ]
            
            report = {
                'total_models': len(models_to_analyze),
                'models_by_status': {},
                'average_metrics': {},
                'active_models': {},
                'ab_tests': {},
                'generated_at': datetime.now(timezone.utc).isoformat()
            }
            
            # Models by status
            for model in models_to_analyze:
                status_key = model.status.value
                if status_key not in report['models_by_status']:
                    report['models_by_status'][status_key] = 0
                report['models_by_status'][status_key] += 1
            
            # Average metrics by model type
            metrics_by_type = {}
            for model in models_to_analyze:
                type_key = model.model_type.value
                if type_key not in metrics_by_type:
                    metrics_by_type[type_key] = []
                metrics_by_type[type_key].append(model.metrics.to_dict())
            
            for type_key, metrics_list in metrics_by_type.items():
                if metrics_list:
                    avg_metrics = {}
                    for key in metrics_list[0].keys():
                        if isinstance(metrics_list[0][key], (int, float)):
                            avg_metrics[key] = sum(m[key] for m in metrics_list) / len(metrics_list)
                    report['average_metrics'][type_key] = avg_metrics
            
            # Active models
            for model_type, version_id in self.active_models.items():
                if version_id in self.models:
                    model = self.models[version_id]
                    report['active_models'][model_type.value] = {
                        'version_id': version_id,
                        'deployed_at': model.deployed_at.isoformat() if model.deployed_at else None,
                        'metrics': model.metrics.to_dict()
                    }
            
            # A/B test summaries
            for test_id, test in self.ab_tests.items():
                if test.is_test_active():
                    report['ab_tests'][test_id] = test.get_summary()
            
            return report
            
        except Exception as e:
            logger.error(f"Error generating performance report: {e}")
            return {'error': str(e)}
    
    def cleanup_old_models(self, keep_versions_per_type: int = 10):
        """Clean up old model versions (keep only recent ones)"""
        try:
            models_by_type = {}
            for version_id, model in self.models.items():
                model_type = model.model_type
                if model_type not in models_by_type:
                    models_by_type[model_type] = []
                models_by_type[model_type].append((version_id, model))
            
            models_to_remove = []
            
            for model_type, models_list in models_by_type.items():
                # Sort by creation date (newest first)
                models_list.sort(key=lambda x: x[1].created_at, reverse=True)
                
                # Keep production and staging models
                protected_models = set()
                for version_id, model in models_list:
                    if model.status in [ModelStatus.PRODUCTION, ModelStatus.STAGING]:
                        protected_models.add(version_id)
                
                # Keep recent models
                kept_count = 0
                for version_id, model in models_list:
                    if version_id in protected_models:
                        continue
                    
                    if kept_count < keep_versions_per_type:
                        kept_count += 1
                    else:
                        models_to_remove.append(version_id)
            
            # Remove old models
            for version_id in models_to_remove:
                del self.models[version_id]
                logger.info(f"Removed old model version: {version_id}")
            
            if models_to_remove:
                self.save_registry()
                logger.info(f"Cleaned up {len(models_to_remove)} old model versions")
                
        except Exception as e:
            logger.error(f"Error during model cleanup: {e}")

# Example usage and testing
async def test_model_registry():
    """Test the model registry system"""
    print("🏭 Testing RomAI Production Model Registry")
    print("=" * 50)
    
    # Initialize registry
    registry = ModelRegistry("test_registry.json")
    
    # Create test metrics
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
    
    # Register a model
    version_id = registry.register_model(
        model_type=ModelType.MATHEMATICAL,
        model_path="/path/to/math_model.pt",
        config_path="/path/to/config.json",
        metrics=test_metrics,
        metadata={"framework": "pytorch", "training_data": "synthetic"}
    )
    
    print(f"✅ Registered model version: {version_id}")
    
    # Promote to production
    success = registry.promote_to_production(version_id)
    print(f"✅ Promotion to production: {'Success' if success else 'Failed'}")
    
    # Test A/B testing
    # Register second model for A/B test
    test_metrics2 = ModelMetrics(
        accuracy=0.87,
        latency_ms=140.0,
        throughput_rps=105.0,
        memory_usage_mb=500.0,
        cpu_usage_percent=23.0,
        gpu_usage_percent=58.0,
        error_rate=0.018,
        confidence_score=0.82,
        cultural_accuracy=0.92
    )
    
    version_id2 = registry.register_model(
        model_type=ModelType.MATHEMATICAL,
        model_path="/path/to/math_model_v2.pt",
        config_path="/path/to/config_v2.json",
        metrics=test_metrics2,
        metadata={"framework": "pytorch", "training_data": "enhanced"}
    )
    
    # Start A/B test
    test_id = registry.start_ab_test(
        model_type=ModelType.MATHEMATICAL,
        new_version_id=version_id2,
        traffic_split=0.2,
        duration_hours=1
    )
    
    print(f"✅ Started A/B test: {test_id}")
    
    # Test model routing
    for i in range(10):
        request_id = f"request_{i}"
        selected_model = registry.get_model_for_request(ModelType.MATHEMATICAL, request_id)
        print(f"   Request {i}: Using model {selected_model}")
    
    # Generate performance report
    report = registry.get_model_performance_report()
    print(f"✅ Performance Report Generated:")
    print(f"   Total Models: {report['total_models']}")
    print(f"   Active A/B Tests: {len(report['ab_tests'])}")
    print(f"   Production Models: {len(report['active_models'])}")
    
    return True

if __name__ == "__main__":
    asyncio.run(test_model_registry())