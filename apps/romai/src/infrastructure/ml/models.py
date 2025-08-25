"""
ML Infrastructure Models
========================

Core models and data structures for the ML inference system.
"""

from enum import Enum
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
from pydantic import BaseModel, Field


class ModelStatus(str, Enum):
    """Model deployment status"""
    OFFLINE = "offline"
    LOADING = "loading"
    READY = "ready"
    ERROR = "error"
    DEPLOYING = "deploying"


class ModelType(str, Enum):
    """Type of ML model"""
    TRANSFORMER = "transformer"
    MAMBA = "mamba"
    MULTIMODAL = "multimodal"
    REASONING = "reasoning"
    ROMANIAN_NLP = "romanian_nlp"
    COGNITIVE = "cognitive"


class TaskType(str, Enum):
    """Romanian NLP task types"""
    TRANSLATION = "translation"
    SENTIMENT_ANALYSIS = "sentiment_analysis"
    QUESTION_ANSWERING = "question_answering"
    SUMMARIZATION = "summarization"
    TEXT_GENERATION = "text_generation"
    CULTURAL_ANALYSIS = "cultural_analysis"
    FORMALITY_CLASSIFICATION = "formality_classification"
    DIALECT_IDENTIFICATION = "dialect_identification"


class ModelInfo(BaseModel):
    """Information about a model"""
    model_id: str
    name: str
    model_type: ModelType
    status: ModelStatus
    capabilities: List[str]
    version: str = "1.0.0"
    size_mb: Optional[float] = None
    parameters: Optional[int] = None
    loaded_at: Optional[datetime] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class InferenceRequest(BaseModel):
    """Request for ML inference"""
    model_id: str
    input_text: str
    task_type: Optional[TaskType] = None
    parameters: Dict[str, Any] = Field(default_factory=dict)
    context: Optional[Dict[str, Any]] = None


class InferenceResponse(BaseModel):
    """Response from ML inference"""
    request_id: str
    model_id: str
    result: Union[str, Dict[str, Any]]
    confidence: float
    processing_time: float
    metadata: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.now)


class TrainingMetrics(BaseModel):
    """Training metrics for models"""
    model_id: str
    epoch: int
    loss: float
    accuracy: float
    perplexity: Optional[float] = None
    bleu_score: Optional[float] = None
    timestamp: datetime = Field(default_factory=datetime.now)


class ModelRegistry(BaseModel):
    """Registry of available models"""
    models: Dict[str, ModelInfo] = Field(default_factory=dict)
    total_models: int = 0
    loaded_models: int = 0
    total_parameters: int = 0
    last_updated: datetime = Field(default_factory=datetime.now)
    
    def add_model(self, model_info: ModelInfo) -> None:
        """Add model to registry"""
        self.models[model_info.model_id] = model_info
        self.total_models = len(self.models)
        self.loaded_models = len([m for m in self.models.values() if m.status == ModelStatus.READY])
        self.last_updated = datetime.now()
    
    def get_model(self, model_id: str) -> Optional[ModelInfo]:
        """Get model information"""
        return self.models.get(model_id)
    
    def list_models(self) -> List[ModelInfo]:
        """List all models"""
        return list(self.models.values())
    
    def get_ready_models(self) -> List[ModelInfo]:
        """Get only ready models"""
        return [m for m in self.models.values() if m.status == ModelStatus.READY]