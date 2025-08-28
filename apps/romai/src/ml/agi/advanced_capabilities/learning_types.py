"""
RomAI AGI Evolution Phase 2 - Learning System Types

Core data structures, enums, and interfaces for the Advanced Learning Systems Framework.
Provides foundational types for continuous learning, meta-learning, and transfer learning.
"""

import asyncio
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any, Set, Tuple, Union, Callable
import uuid
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# ENUMS AND CONSTANTS
# ============================================================================

class LearningType(Enum):
    """Types of learning approaches"""
    SUPERVISED = "supervised"
    UNSUPERVISED = "unsupervised"
    REINFORCEMENT = "reinforcement"
    SEMI_SUPERVISED = "semi_supervised"
    SELF_SUPERVISED = "self_supervised"
    CONTINUOUS = "continuous"
    META = "meta"
    TRANSFER = "transfer"
    FEDERATED = "federated"

class LearningStrategy(Enum):
    """Learning strategy approaches"""
    ONLINE = "online"
    BATCH = "batch"
    MINI_BATCH = "mini_batch"
    INCREMENTAL = "incremental"
    ADAPTIVE = "adaptive"
    CONTINUOUS = "continuous"
    META_LEARNING = "meta_learning"
    TRANSFER = "transfer"
    MULTI_TASK = "multi_task"
    GRADIENT_BASED = "gradient_based"
    EVOLUTIONARY = "evolutionary"
    BAYESIAN = "bayesian"

class MetaLearningAlgorithm(Enum):
    """Meta-learning algorithm types"""
    MAML = "maml"  # Model-Agnostic Meta-Learning
    REPTILE = "reptile"
    FOMAML = "fomaml"  # First-Order MAML
    PROTOTYPICAL = "prototypical"
    MATCHING_NETWORKS = "matching_networks"
    RELATION_NETWORKS = "relation_networks"

class TransferType(Enum):
    """Transfer learning types"""
    FEATURE_EXTRACTION = "feature_extraction"
    FINE_TUNING = "fine_tuning"
    DOMAIN_ADAPTATION = "domain_adaptation"
    TASK_TRANSFER = "task_transfer"
    KNOWLEDGE_DISTILLATION = "knowledge_distillation"
    MULTI_TASK = "multi_task"

class LearningStatus(Enum):
    """Learning process status"""
    INITIALIZING = "initializing"
    TRAINING = "training"
    VALIDATING = "validating"
    CONVERGED = "converged"
    DIVERGED = "diverged"
    PAUSED = "paused"
    STOPPED = "stopped"
    ERROR = "error"

class OptimizationObjective(Enum):
    """Learning optimization objectives"""
    MINIMIZE_LOSS = "minimize_loss"
    MAXIMIZE_ACCURACY = "maximize_accuracy"
    MINIMIZE_REGRET = "minimize_regret"
    MAXIMIZE_REWARD = "maximize_reward"
    MINIMIZE_ADAPTATION_TIME = "minimize_adaptation_time"
    MAXIMIZE_TRANSFER_EFFICIENCY = "maximize_transfer_efficiency"
    BALANCE_STABILITY_PLASTICITY = "balance_stability_plasticity"

# ============================================================================
# CORE DATA STRUCTURES
# ============================================================================

@dataclass
class LearningTask:
    """Represents a learning task or problem"""
    
    task_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    description: str = ""
    task_type: LearningType = LearningType.SUPERVISED
    domain: str = "general"
    
    # Task specification
    input_shape: Optional[Tuple[int, ...]] = None
    output_shape: Optional[Tuple[int, ...]] = None
    num_classes: Optional[int] = None
    
    # Data information
    dataset_size: Optional[int] = None
    feature_dimensions: Optional[int] = None
    
    # Task constraints
    time_limit: Optional[float] = None  # seconds
    memory_limit: Optional[int] = None  # MB
    accuracy_threshold: Optional[float] = None
    
    # Metadata
    created_at: datetime = field(default_factory=datetime.now)
    tags: Set[str] = field(default_factory=set)
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class LearningExperience:
    """Represents a learning experience or episode"""
    
    experience_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    task_id: str = ""
    
    # Experience data
    input_data: Any = None
    target_data: Any = None
    action_taken: Any = None
    reward_received: Optional[float] = None
    
    # Context information
    state_before: Optional[Dict[str, Any]] = None
    state_after: Optional[Dict[str, Any]] = None
    
    # Learning metadata
    confidence_score: float = 0.0
    importance_weight: float = 1.0
    timestamp: datetime = field(default_factory=datetime.now)
    source: str = "unknown"
    
    # Performance tracking
    prediction_error: Optional[float] = None
    learning_rate_used: Optional[float] = None
    
    # Contextual information
    environment_state: Optional[Dict[str, Any]] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class LearningModel:
    """Represents a learnable model"""
    
    model_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    model_type: str = "neural_network"
    
    # Model architecture
    architecture: Dict[str, Any] = field(default_factory=dict)
    parameters: Optional[Dict[str, Any]] = None
    parameter_count: int = 0
    
    # Training information
    training_tasks: List[str] = field(default_factory=list)
    learning_history: List[Dict[str, Any]] = field(default_factory=list)
    
    # Performance metrics
    accuracy: Optional[float] = None
    loss: Optional[float] = None
    validation_score: Optional[float] = None
    
    # Model versioning
    version: str = "1.0.0"
    parent_model_id: Optional[str] = None
    checkpoint_path: Optional[str] = None
    
    # Metadata
    created_at: datetime = field(default_factory=datetime.now)
    last_updated: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class LearningConfiguration:
    """Configuration for learning processes"""
    
    config_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    
    # Learning parameters
    learning_rate: float = 0.001
    batch_size: int = 32
    max_epochs: int = 100
    patience: int = 10  # for early stopping
    
    # Optimization settings
    optimizer: str = "adam"
    optimizer_params: Dict[str, Any] = field(default_factory=dict)
    scheduler: Optional[str] = None
    scheduler_params: Dict[str, Any] = field(default_factory=dict)
    
    # Regularization
    weight_decay: float = 0.0001
    dropout_rate: float = 0.1
    batch_norm: bool = True
    
    # Meta-learning specific
    inner_learning_rate: float = 0.01
    num_inner_steps: int = 5
    meta_batch_size: int = 16
    
    # Transfer learning specific
    freeze_layers: List[str] = field(default_factory=list)
    fine_tune_layers: List[str] = field(default_factory=list)
    
    # Continuous learning
    memory_buffer_size: int = 10000
    catastrophic_forgetting_lambda: float = 0.1
    
    # Evaluation settings
    validation_split: float = 0.2
    test_split: float = 0.1
    cross_validation_folds: int = 5
    
    # System settings
    device: str = "auto"  # auto, cpu, cuda
    mixed_precision: bool = True
    gradient_clipping: Optional[float] = 1.0
    
    # Logging and monitoring
    log_frequency: int = 10
    save_frequency: int = 100
    early_stopping: bool = True
    
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class LearningProgress:
    """Tracks progress of a learning process"""
    
    progress_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    task_id: str = ""
    model_id: str = ""
    
    # Progress tracking
    current_epoch: int = 0
    total_epochs: int = 0
    current_step: int = 0
    total_steps: int = 0
    
    # Performance metrics
    training_loss: List[float] = field(default_factory=list)
    validation_loss: List[float] = field(default_factory=list)
    training_accuracy: List[float] = field(default_factory=list)
    validation_accuracy: List[float] = field(default_factory=list)
    
    # Learning dynamics
    learning_rates: List[float] = field(default_factory=list)
    gradient_norms: List[float] = field(default_factory=list)
    
    # Status information
    status: LearningStatus = LearningStatus.INITIALIZING
    start_time: datetime = field(default_factory=datetime.now)
    last_update: datetime = field(default_factory=datetime.now)
    estimated_completion: Optional[datetime] = None
    
    # Resource usage
    memory_usage: List[float] = field(default_factory=list)
    gpu_usage: List[float] = field(default_factory=list)
    
    # Best performance tracking
    best_validation_loss: Optional[float] = None
    best_validation_accuracy: Optional[float] = None
    best_epoch: Optional[int] = None
    
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class MetaLearningEpisode:
    """Represents a meta-learning episode"""
    
    episode_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    
    # Task information
    support_tasks: List[LearningTask] = field(default_factory=list)
    query_task: LearningTask = field(default_factory=LearningTask)
    
    # Episode data
    support_data: List[LearningExperience] = field(default_factory=list)
    query_data: List[LearningExperience] = field(default_factory=list)
    
    # Meta-learning parameters
    inner_learning_rate: float = 0.01
    num_inner_steps: int = 5
    
    # Performance tracking
    support_loss: Optional[float] = None
    query_loss: Optional[float] = None
    adaptation_time: Optional[float] = None
    
    # Episode metadata
    timestamp: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class TransferLearningSpec:
    """Specification for transfer learning"""
    
    spec_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    
    # Source and target domains
    source_domain: str = ""
    target_domain: str = ""
    source_task: LearningTask = field(default_factory=LearningTask)
    target_task: LearningTask = field(default_factory=LearningTask)
    
    # Transfer configuration
    transfer_type: TransferType = TransferType.FINE_TUNING
    similarity_score: Optional[float] = None
    
    # Model information
    source_model: LearningModel = field(default_factory=LearningModel)
    target_model: Optional[LearningModel] = None
    
    # Transfer parameters
    layers_to_transfer: List[str] = field(default_factory=list)
    layers_to_freeze: List[str] = field(default_factory=list)
    adaptation_strategy: str = "gradual"
    
    # Performance expectations
    expected_transfer_gain: Optional[float] = None
    baseline_performance: Optional[float] = None
    
    metadata: Dict[str, Any] = field(default_factory=dict)

# ============================================================================
# ABSTRACT INTERFACES
# ============================================================================

class LearnerInterface(ABC):
    """Abstract interface for all learning systems"""
    
    @abstractmethod
    async def initialize(self, config: LearningConfiguration) -> bool:
        """Initialize the learning system"""
        pass
    
    @abstractmethod
    async def learn(self, experiences: List[LearningExperience]) -> LearningProgress:
        """Learn from experiences"""
        pass
    
    @abstractmethod
    async def predict(self, input_data: Any) -> Any:
        """Make predictions"""
        pass
    
    @abstractmethod
    async def evaluate(self, test_data: List[LearningExperience]) -> Dict[str, float]:
        """Evaluate performance"""
        pass
    
    @abstractmethod
    async def save_model(self, path: str) -> bool:
        """Save the learned model"""
        pass
    
    @abstractmethod
    async def load_model(self, path: str) -> bool:
        """Load a previously saved model"""
        pass

class ContinuousLearnerInterface(LearnerInterface):
    """Interface for continuous learning systems"""
    
    @abstractmethod
    async def update_online(self, experience: LearningExperience) -> bool:
        """Update the model with a single experience"""
        pass
    
    @abstractmethod
    async def forget_selectively(self, criteria: Dict[str, Any]) -> int:
        """Selectively forget experiences based on criteria"""
        pass
    
    @abstractmethod
    async def consolidate_memory(self) -> bool:
        """Consolidate learned knowledge"""
        pass

class MetaLearnerInterface(LearnerInterface):
    """Interface for meta-learning systems"""
    
    @abstractmethod
    async def meta_train(self, episodes: List[MetaLearningEpisode]) -> LearningProgress:
        """Meta-train on multiple episodes"""
        pass
    
    @abstractmethod
    async def adapt_to_task(self, task: LearningTask, 
                           support_data: List[LearningExperience]) -> LearningModel:
        """Quickly adapt to a new task"""
        pass
    
    @abstractmethod
    async def get_adaptation_strategy(self, task: LearningTask) -> Dict[str, Any]:
        """Get optimal adaptation strategy for a task"""
        pass

class TransferLearnerInterface(LearnerInterface):
    """Interface for transfer learning systems"""
    
    @abstractmethod
    async def transfer_knowledge(self, spec: TransferLearningSpec) -> LearningModel:
        """Transfer knowledge from source to target domain"""
        pass
    
    @abstractmethod
    async def measure_transferability(self, source_task: LearningTask, 
                                    target_task: LearningTask) -> float:
        """Measure how transferable knowledge is between tasks"""
        pass
    
    @abstractmethod
    async def select_transfer_layers(self, spec: TransferLearningSpec) -> List[str]:
        """Select which layers to transfer"""
        pass

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def create_learning_task(name: str, task_type: LearningType, 
                        domain: str = "general", **kwargs) -> LearningTask:
    """Create a learning task with default values"""
    return LearningTask(
        name=name,
        task_type=task_type,
        domain=domain,
        description=kwargs.get("description", f"{task_type.value} task in {domain}"),
        **{k: v for k, v in kwargs.items() if k != "description"}
    )

def create_learning_experience(task_id: str, input_data: Any, 
                             target_data: Any = None, **kwargs) -> LearningExperience:
    """Create a learning experience"""
    return LearningExperience(
        task_id=task_id,
        input_data=input_data,
        target_data=target_data,
        **kwargs
    )

def create_learning_model(name: str, model_type: str = "neural_network", 
                         **kwargs) -> LearningModel:
    """Create a learning model"""
    return LearningModel(
        name=name,
        model_type=model_type,
        **kwargs
    )

def create_meta_episode(support_tasks: List[LearningTask], 
                       query_task: LearningTask, **kwargs) -> MetaLearningEpisode:
    """Create a meta-learning episode"""
    return MetaLearningEpisode(
        support_tasks=support_tasks,
        query_task=query_task,
        **kwargs
    )

def create_transfer_spec(source_domain: str, target_domain: str,
                        source_task: LearningTask, target_task: LearningTask,
                        **kwargs) -> TransferLearningSpec:
    """Create a transfer learning specification"""
    return TransferLearningSpec(
        source_domain=source_domain,
        target_domain=target_domain,
        source_task=source_task,
        target_task=target_task,
        **kwargs
    )

def calculate_learning_metrics(progress: LearningProgress) -> Dict[str, float]:
    """Calculate comprehensive learning metrics"""
    metrics = {}
    
    if progress.training_loss:
        metrics["final_training_loss"] = progress.training_loss[-1]
        metrics["min_training_loss"] = min(progress.training_loss)
        metrics["training_loss_improvement"] = (
            progress.training_loss[0] - progress.training_loss[-1]
            if len(progress.training_loss) > 1 else 0.0
        )
    
    if progress.validation_loss:
        metrics["final_validation_loss"] = progress.validation_loss[-1]
        metrics["min_validation_loss"] = min(progress.validation_loss)
        metrics["validation_loss_improvement"] = (
            progress.validation_loss[0] - progress.validation_loss[-1]
            if len(progress.validation_loss) > 1 else 0.0
        )
    
    if progress.training_accuracy:
        metrics["final_training_accuracy"] = progress.training_accuracy[-1]
        metrics["max_training_accuracy"] = max(progress.training_accuracy)
    
    if progress.validation_accuracy:
        metrics["final_validation_accuracy"] = progress.validation_accuracy[-1]
        metrics["max_validation_accuracy"] = max(progress.validation_accuracy)
    
    # Learning efficiency metrics
    if progress.current_step > 0:
        total_time = (progress.last_update - progress.start_time).total_seconds()
        metrics["steps_per_second"] = progress.current_step / max(total_time, 1)
        metrics["epochs_per_hour"] = progress.current_epoch / max(total_time / 3600, 1/3600)
    
    return metrics

def assess_task_similarity(task1: LearningTask, task2: LearningTask) -> float:
    """Assess similarity between two learning tasks"""
    similarity_score = 0.0
    factors = 0
    
    # Domain similarity
    if task1.domain == task2.domain:
        similarity_score += 0.3
    factors += 1
    
    # Task type similarity
    if task1.task_type == task2.task_type:
        similarity_score += 0.2
    factors += 1
    
    # Input/output shape similarity
    if task1.input_shape and task2.input_shape:
        shape_similarity = 1.0 - min(
            1.0, 
            abs(len(task1.input_shape) - len(task2.input_shape)) / max(len(task1.input_shape), len(task2.input_shape))
        )
        similarity_score += shape_similarity * 0.2
        factors += 1
    
    # Number of classes similarity
    if task1.num_classes and task2.num_classes:
        class_similarity = 1.0 - min(
            1.0,
            abs(task1.num_classes - task2.num_classes) / max(task1.num_classes, task2.num_classes)
        )
        similarity_score += class_similarity * 0.1
        factors += 1
    
    # Tag similarity
    if task1.tags and task2.tags:
        tag_overlap = len(task1.tags.intersection(task2.tags))
        tag_union = len(task1.tags.union(task2.tags))
        tag_similarity = tag_overlap / max(tag_union, 1)
        similarity_score += tag_similarity * 0.2
        factors += 1
    
    return similarity_score / max(factors, 1) if factors > 0 else 0.0

def optimize_learning_configuration(task: LearningTask, 
                                  constraints: Dict[str, Any] = None) -> LearningConfiguration:
    """Optimize learning configuration for a specific task"""
    config = LearningConfiguration()
    constraints = constraints or {}
    
    # Task-specific optimizations
    if task.task_type == LearningType.REINFORCEMENT:
        config.learning_rate = 0.0003
        config.batch_size = 64
    elif task.task_type == LearningType.SUPERVISED:
        if task.num_classes and task.num_classes > 1000:  # Large number of classes
            config.learning_rate = 0.0001
            config.batch_size = 128
        else:
            config.learning_rate = 0.001
            config.batch_size = 32
    
    # Domain-specific optimizations
    if task.domain == "computer_vision":
        config.batch_norm = True
        config.dropout_rate = 0.2
    elif task.domain == "natural_language_processing":
        config.gradient_clipping = 1.0
        config.learning_rate = 0.0001
    
    # Apply constraints
    if constraints.get("max_batch_size"):
        config.batch_size = min(config.batch_size, constraints["max_batch_size"])
    
    if constraints.get("max_epochs"):
        config.max_epochs = min(config.max_epochs, constraints["max_epochs"])
    
    if constraints.get("learning_rate_range"):
        min_lr, max_lr = constraints["learning_rate_range"]
        config.learning_rate = max(min_lr, min(max_lr, config.learning_rate))
    
    return config

# ============================================================================
# TESTING
# ============================================================================

async def test_learning_types():
    """Test the learning types and utilities"""
    print("🧠 Testing RomAI Learning Types")
    print("=" * 35)
    
    try:
        # Test 1: Create learning task
        print("\n📋 Test 1: Creating Learning Tasks")
        
        task1 = create_learning_task(
            name="Image Classification",
            task_type=LearningType.SUPERVISED,
            domain="computer_vision",
            input_shape=(224, 224, 3),
            num_classes=1000
        )
        
        print(f"✅ Created task: {task1.name}")
        print(f"   • Domain: {task1.domain}")
        print(f"   • Type: {task1.task_type.value}")
        print(f"   • Input shape: {task1.input_shape}")
        print(f"   • Classes: {task1.num_classes}")
        
        # Test 2: Create learning experience
        print("\n📋 Test 2: Creating Learning Experience")
        
        experience = create_learning_experience(
            task_id=task1.task_id,
            input_data=np.random.randn(224, 224, 3),
            target_data=5,
            confidence_score=0.85
        )
        
        print(f"✅ Created experience: {experience.experience_id[:8]}...")
        print(f"   • Task: {experience.task_id[:8]}...")
        print(f"   • Confidence: {experience.confidence_score}")
        print(f"   • Timestamp: {experience.timestamp}")
        
        # Test 3: Create learning model
        print("\n📋 Test 3: Creating Learning Model")
        
        model = create_learning_model(
            name="ResNet50",
            model_type="convolutional_neural_network",
            parameter_count=25000000
        )
        
        print(f"✅ Created model: {model.name}")
        print(f"   • Type: {model.model_type}")
        print(f"   • Parameters: {model.parameter_count:,}")
        print(f"   • Version: {model.version}")
        
        # Test 4: Task similarity
        print("\n📋 Test 4: Task Similarity Assessment")
        
        task2 = create_learning_task(
            name="Object Detection",
            task_type=LearningType.SUPERVISED,
            domain="computer_vision",
            input_shape=(416, 416, 3),
            num_classes=80
        )
        
        similarity = assess_task_similarity(task1, task2)
        print(f"✅ Task similarity: {similarity:.3f}")
        print(f"   • Task 1: {task1.name} ({task1.domain})")
        print(f"   • Task 2: {task2.name} ({task2.domain})")
        
        # Test 5: Configuration optimization
        print("\n📋 Test 5: Configuration Optimization")
        
        config = optimize_learning_configuration(
            task1,
            constraints={"max_batch_size": 64, "max_epochs": 50}
        )
        
        print(f"✅ Optimized configuration:")
        print(f"   • Learning rate: {config.learning_rate}")
        print(f"   • Batch size: {config.batch_size}")
        print(f"   • Max epochs: {config.max_epochs}")
        print(f"   • Batch norm: {config.batch_norm}")
        print(f"   • Dropout rate: {config.dropout_rate}")
        
        # Test 6: Meta-learning episode
        print("\n📋 Test 6: Meta-Learning Episode")
        
        episode = create_meta_episode(
            support_tasks=[task1],
            query_task=task2,
            inner_learning_rate=0.01,
            num_inner_steps=5
        )
        
        print(f"✅ Created meta-episode: {episode.episode_id[:8]}...")
        print(f"   • Support tasks: {len(episode.support_tasks)}")
        print(f"   • Inner LR: {episode.inner_learning_rate}")
        print(f"   • Inner steps: {episode.num_inner_steps}")
        
        # Test 7: Transfer learning spec
        print("\n📋 Test 7: Transfer Learning Specification")
        
        transfer_spec = create_transfer_spec(
            source_domain="imagenet",
            target_domain="medical_imaging",
            source_task=task1,
            target_task=task2,
            transfer_type=TransferType.FINE_TUNING
        )
        
        print(f"✅ Created transfer spec: {transfer_spec.spec_id[:8]}...")
        print(f"   • Source: {transfer_spec.source_domain}")
        print(f"   • Target: {transfer_spec.target_domain}")
        print(f"   • Transfer type: {transfer_spec.transfer_type.value}")
        
        print("\n🎉 Learning Types test completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Learning Types test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

# ============================================================================
# MODULE INITIALIZATION
# ============================================================================

logger.info("✅ Learning Types module loaded - Core learning system foundations ready!")

if __name__ == "__main__":
    asyncio.run(test_learning_types())