"""
ML Domain Models - Core business entities for machine learning
===========================================================

This module defines the core domain entities for RomAI's ML system:
- Model lifecycle management
- Inference contracts
- Training configurations
- Performance metrics

Author: GitHub Copilot Agent
Date: August 24, 2025
Status: Clean Architecture Implementation
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any, Union
import uuid


class ModelStatus(str, Enum):
    """Model status enumeration"""
    INITIALIZING = "initializing"
    LOADING = "loading"
    READY = "ready"
    BUSY = "busy"
    ERROR = "error"
    UPDATING = "updating"
    OFFLINE = "offline"


class TaskType(str, Enum):
    """Task type for Romanian language processing"""
    TRANSLATION = "translation"
    GRAMMAR_CHECK = "grammar_check"
    SENTIMENT_ANALYSIS = "sentiment_analysis"
    TEXT_GENERATION = "text_generation"
    CULTURAL_CONTEXT = "cultural_context"
    CONVERSATION = "conversation"
    REASONING = "reasoning"
    MATHEMATICAL = "mathematical"


class FineTuningStrategy(str, Enum):
    """Fine-tuning strategy for Romanian models"""
    LORA = "lora"
    FULL_FINE_TUNING = "full_fine_tuning"
    PROMPT_TUNING = "prompt_tuning"
    ADAPTER_BASED = "adapter_based"


@dataclass(frozen=True)
class ModelId:
    """Value object for model identification"""
    name: str
    version: str
    
    def __str__(self) -> str:
        return f"{self.name}:{self.version}"
    
    @classmethod
    def from_string(cls, model_string: str) -> 'ModelId':
        """Create ModelId from string representation"""
        if ':' in model_string:
            name, version = model_string.split(':', 1)
            return cls(name, version)
        return cls(model_string, "latest")


@dataclass
class InferenceMetrics:
    """Metrics for model inference performance"""
    processing_time: float
    tokens_processed: int
    memory_used: float
    gpu_utilization: float
    accuracy_score: Optional[float] = None
    confidence_score: Optional[float] = None
    
    @property
    def tokens_per_second(self) -> float:
        """Calculate tokens processed per second"""
        return self.tokens_processed / self.processing_time if self.processing_time > 0 else 0.0


@dataclass
class TrainingMetrics:
    """Training performance metrics"""
    epoch: int
    loss: float
    accuracy: float
    perplexity: float
    learning_rate: float
    batch_size: int
    processing_time: float
    memory_usage: float
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        return {
            'epoch': self.epoch,
            'loss': self.loss,
            'accuracy': self.accuracy,
            'perplexity': self.perplexity,
            'learning_rate': self.learning_rate,
            'batch_size': self.batch_size,
            'processing_time': self.processing_time,
            'memory_usage': self.memory_usage
        }


@dataclass
class FineTuningConfig:
    """Configuration for fine-tuning Romanian models"""
    strategy: FineTuningStrategy
    learning_rate: float
    epochs: int
    batch_size: int
    warmup_steps: int
    max_length: int
    save_steps: int
    logging_steps: int
    evaluation_steps: int
    cultural_weight: float = 1.0
    linguistic_weight: float = 1.0
    
    def validate(self) -> None:
        """Validate configuration parameters"""
        if self.learning_rate <= 0:
            raise ValueError("Learning rate must be positive")
        if self.epochs <= 0:
            raise ValueError("Epochs must be positive")
        if self.batch_size <= 0:
            raise ValueError("Batch size must be positive")


@dataclass
class DatasetConfig:
    """Configuration for Romanian language datasets"""
    name: str
    path: str
    task_type: TaskType
    language: str = "ro"
    size: Optional[int] = None
    cultural_context: Optional[str] = None
    formality_level: str = "mixed"
    
    def validate(self) -> None:
        """Validate dataset configuration"""
        if not self.name:
            raise ValueError("Dataset name is required")
        if not self.path:
            raise ValueError("Dataset path is required")


@dataclass
class InferenceRequest:
    """Request for model inference"""
    request_id: str
    model_id: ModelId
    input_text: str
    parameters: Dict[str, Any]
    context: Optional[Dict[str, Any]] = None
    task_type: Optional[TaskType] = None
    timestamp: datetime = None
    
    def __post_init__(self):
        """Initialize timestamp if not provided"""
        if self.timestamp is None:
            self.timestamp = datetime.now()
        if not self.request_id:
            self.request_id = str(uuid.uuid4())


@dataclass
class InferenceResponse:
    """Response from model inference"""
    request_id: str
    model_id: ModelId
    result: str
    confidence: float
    metrics: InferenceMetrics
    metadata: Dict[str, Any]
    timestamp: datetime = None
    
    def __post_init__(self):
        """Initialize timestamp if not provided"""
        if self.timestamp is None:
            self.timestamp = datetime.now()


class MLModel(ABC):
    """Abstract base class for ML models"""
    
    def __init__(self, model_id: ModelId):
        self.model_id = model_id
        self.status = ModelStatus.INITIALIZING
        self.created_at = datetime.now()
        self.last_updated = datetime.now()
    
    @abstractmethod
    async def load(self) -> None:
        """Load the model into memory"""
        pass
    
    @abstractmethod
    async def unload(self) -> None:
        """Unload the model from memory"""
        pass
    
    @abstractmethod
    async def predict(self, request: InferenceRequest) -> InferenceResponse:
        """Make prediction using the model"""
        pass
    
    @abstractmethod
    def get_status(self) -> ModelStatus:
        """Get current model status"""
        pass
    
    @abstractmethod
    def get_metrics(self) -> Dict[str, Any]:
        """Get model performance metrics"""
        pass


class TrainableModel(MLModel):
    """Abstract base class for trainable ML models"""
    
    @abstractmethod
    async def train(self, config: FineTuningConfig, dataset: DatasetConfig) -> TrainingMetrics:
        """Train or fine-tune the model"""
        pass
    
    @abstractmethod
    async def evaluate(self, dataset: DatasetConfig) -> Dict[str, float]:
        """Evaluate model performance"""
        pass
    
    @abstractmethod
    async def save_checkpoint(self, path: str) -> None:
        """Save model checkpoint"""
        pass
    
    @abstractmethod
    async def load_checkpoint(self, path: str) -> None:
        """Load model checkpoint"""
        pass


@dataclass
class CapabilityScores:
    """Model capability assessment scores"""
    reasoning: float
    creativity: float
    knowledge: float
    language_understanding: float
    problem_solving: float
    cultural_awareness: float
    mathematical_ability: float
    logical_consistency: float
    
    def overall_score(self) -> float:
        """Calculate overall capability score"""
        scores = [
            self.reasoning, self.creativity, self.knowledge,
            self.language_understanding, self.problem_solving,
            self.cultural_awareness, self.mathematical_ability,
            self.logical_consistency
        ]
        return sum(scores) / len(scores)
    
    def to_dict(self) -> Dict[str, float]:
        """Convert to dictionary"""
        return {
            'reasoning': self.reasoning,
            'creativity': self.creativity,
            'knowledge': self.knowledge,
            'language_understanding': self.language_understanding,
            'problem_solving': self.problem_solving,
            'cultural_awareness': self.cultural_awareness,
            'mathematical_ability': self.mathematical_ability,
            'logical_consistency': self.logical_consistency,
            'overall_score': self.overall_score()
        }


class ModelRepository(ABC):
    """Repository interface for model storage and retrieval"""
    
    @abstractmethod
    async def save_model(self, model: MLModel) -> None:
        """Save model to repository"""
        pass
    
    @abstractmethod
    async def load_model(self, model_id: ModelId) -> MLModel:
        """Load model from repository"""
        pass
    
    @abstractmethod
    async def delete_model(self, model_id: ModelId) -> None:
        """Delete model from repository"""
        pass
    
    @abstractmethod
    async def list_models(self) -> List[ModelId]:
        """List all available models"""
        pass
    
    @abstractmethod
    async def model_exists(self, model_id: ModelId) -> bool:
        """Check if model exists in repository"""
        pass


class ModelService(ABC):
    """Domain service for model management"""
    
    @abstractmethod
    async def deploy_model(self, model_id: ModelId) -> None:
        """Deploy model for inference"""
        pass
    
    @abstractmethod
    async def undeploy_model(self, model_id: ModelId) -> None:
        """Remove model from inference service"""
        pass
    
    @abstractmethod
    async def get_model_status(self, model_id: ModelId) -> ModelStatus:
        """Get deployment status of model"""
        pass
    
    @abstractmethod
    async def process_inference(self, request: InferenceRequest) -> InferenceResponse:
        """Process inference request"""
        pass