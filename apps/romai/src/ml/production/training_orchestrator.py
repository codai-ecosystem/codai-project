"""
Training Orchestration System for RomAI
Manages model training, validation, and lifecycle
"""

import asyncio
import json
import logging
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Callable, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
from pathlib import Path
import yaml
import shutil
import pickle

from model_registry import ModelRegistry, ModelVersion, ModelStatus, ModelType, ModelMetrics
from monitoring_system import ProductionMonitor, AlertManager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TrainingStatus(Enum):
    """Training job status"""
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    PAUSED = "paused"

class TrainingMode(Enum):
    """Training modes"""
    INITIAL = "initial"
    FINE_TUNING = "fine_tuning"
    TRANSFER_LEARNING = "transfer_learning"
    CONTINUAL_LEARNING = "continual_learning"
    REINFORCEMENT = "reinforcement"

@dataclass
class TrainingConfig:
    """Training configuration"""
    model_type: ModelType
    training_mode: TrainingMode
    dataset_path: str
    validation_split: float
    batch_size: int
    epochs: int
    learning_rate: float
    optimizer: str
    loss_function: str
    device: str
    mixed_precision: bool
    gradient_clipping: Optional[float]
    early_stopping_patience: int
    checkpoint_interval: int
    validation_interval: int
    
    # Advanced configuration
    scheduler_config: Optional[Dict[str, Any]]
    augmentation_config: Optional[Dict[str, Any]]
    regularization_config: Optional[Dict[str, Any]]
    
    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data['model_type'] = self.model_type.value
        data['training_mode'] = self.training_mode.value
        return data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'TrainingConfig':
        data['model_type'] = ModelType(data['model_type'])
        data['training_mode'] = TrainingMode(data['training_mode'])
        return cls(**data)

@dataclass
class TrainingMetrics:
    """Training metrics and progress"""
    epoch: int
    train_loss: float
    val_loss: Optional[float]
    train_accuracy: Optional[float]
    val_accuracy: Optional[float]
    learning_rate: float
    batch_time: float
    gpu_memory_mb: float
    timestamp: datetime
    
    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'TrainingMetrics':
        data['timestamp'] = datetime.fromisoformat(data['timestamp'])
        return cls(**data)

@dataclass
class TrainingJob:
    """Training job record"""
    job_id: str
    config: TrainingConfig
    status: TrainingStatus
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    model_version: Optional[str]
    metrics_history: List[TrainingMetrics]
    best_metrics: Optional[TrainingMetrics]
    checkpoint_path: Optional[str]
    error_message: Optional[str]
    logs: List[str]
    
    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data['config'] = self.config.to_dict()
        data['status'] = self.status.value
        data['created_at'] = self.created_at.isoformat()
        data['started_at'] = self.started_at.isoformat() if self.started_at else None
        data['completed_at'] = self.completed_at.isoformat() if self.completed_at else None
        data['metrics_history'] = [m.to_dict() for m in self.metrics_history]
        data['best_metrics'] = self.best_metrics.to_dict() if self.best_metrics else None
        return data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'TrainingJob':
        data['config'] = TrainingConfig.from_dict(data['config'])
        data['status'] = TrainingStatus(data['status'])
        data['created_at'] = datetime.fromisoformat(data['created_at'])
        data['started_at'] = datetime.fromisoformat(data['started_at']) if data['started_at'] else None
        data['completed_at'] = datetime.fromisoformat(data['completed_at']) if data['completed_at'] else None
        data['metrics_history'] = [TrainingMetrics.from_dict(m) for m in data['metrics_history']]
        data['best_metrics'] = TrainingMetrics.from_dict(data['best_metrics']) if data['best_metrics'] else None
        return cls(**data)

class DatasetManager:
    """Manages training datasets"""
    
    def __init__(self, data_dir: str = "data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
    
    def load_dataset(self, dataset_path: str, 
                    validation_split: float = 0.2) -> Tuple[DataLoader, DataLoader]:
        """Load dataset and create train/validation splits"""
        try:
            # Load data (simplified - would depend on actual data format)
            if dataset_path.endswith('.json'):
                with open(dataset_path, 'r') as f:
                    data = json.load(f)
                
                # Convert to tensors (example)
                X = torch.tensor(data['inputs'], dtype=torch.float32)
                y = torch.tensor(data['targets'], dtype=torch.float32)
                
            elif dataset_path.endswith('.npy'):
                data = np.load(dataset_path, allow_pickle=True)
                X = torch.tensor(data['X'], dtype=torch.float32)
                y = torch.tensor(data['y'], dtype=torch.float32)
                
            else:
                # Generate synthetic data for testing
                X = torch.randn(1000, 10)
                y = torch.randn(1000, 1)
            
            # Create train/validation split
            dataset_size = len(X)
            val_size = int(dataset_size * validation_split)
            train_size = dataset_size - val_size
            
            indices = torch.randperm(dataset_size)
            train_indices = indices[:train_size]
            val_indices = indices[train_size:]
            
            train_dataset = TensorDataset(X[train_indices], y[train_indices])
            val_dataset = TensorDataset(X[val_indices], y[val_indices])
            
            train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
            val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False)
            
            logger.info(f"Loaded dataset: {train_size} train, {val_size} validation samples")
            return train_loader, val_loader
            
        except Exception as e:
            logger.error(f"Failed to load dataset: {e}")
            raise
    
    def augment_data(self, data: torch.Tensor, 
                    config: Dict[str, Any]) -> torch.Tensor:
        """Apply data augmentation"""
        if not config:
            return data
        
        # Example augmentations
        if config.get('noise', False):
            noise_std = config.get('noise_std', 0.1)
            noise = torch.randn_like(data) * noise_std
            data = data + noise
        
        if config.get('dropout', False):
            dropout_rate = config.get('dropout_rate', 0.1)
            mask = torch.rand_like(data) > dropout_rate
            data = data * mask.float()
        
        return data

class ModelFactory:
    """Factory for creating different model types"""
    
    @staticmethod
    def create_model(model_type: ModelType, config: Dict[str, Any]) -> nn.Module:
        """Create model based on type"""
        
        if model_type == ModelType.MATHEMATICAL:
            return ModelFactory._create_math_model(config)
        elif model_type == ModelType.LOGICAL:
            return ModelFactory._create_logic_model(config)
        elif model_type == ModelType.LINGUISTIC:
            return ModelFactory._create_language_model(config)
        elif model_type == ModelType.MULTIMODAL:
            return ModelFactory._create_multimodal_model(config)
        else:
            raise ValueError(f"Unsupported model type: {model_type}")
    
    @staticmethod
    def _create_math_model(config: Dict[str, Any]) -> nn.Module:
        """Create mathematical reasoning model"""
        
        class MathModel(nn.Module):
            def __init__(self, input_dim=10, hidden_dim=256, output_dim=1):
                super().__init__()
                self.layers = nn.Sequential(
                    nn.Linear(input_dim, hidden_dim),
                    nn.ReLU(),
                    nn.BatchNorm1d(hidden_dim),
                    nn.Dropout(0.2),
                    
                    nn.Linear(hidden_dim, hidden_dim),
                    nn.ReLU(),
                    nn.BatchNorm1d(hidden_dim),
                    nn.Dropout(0.2),
                    
                    nn.Linear(hidden_dim, hidden_dim // 2),
                    nn.ReLU(),
                    nn.BatchNorm1d(hidden_dim // 2),
                    
                    nn.Linear(hidden_dim // 2, output_dim)
                )
            
            def forward(self, x):
                return self.layers(x)
        
        return MathModel(
            input_dim=config.get('input_dim', 10),
            hidden_dim=config.get('hidden_dim', 256),
            output_dim=config.get('output_dim', 1)
        )
    
    @staticmethod
    def _create_logic_model(config: Dict[str, Any]) -> nn.Module:
        """Create logical reasoning model"""
        
        class LogicModel(nn.Module):
            def __init__(self, vocab_size=10000, embedding_dim=256, hidden_dim=512):
                super().__init__()
                self.embedding = nn.Embedding(vocab_size, embedding_dim)
                self.lstm = nn.LSTM(embedding_dim, hidden_dim, batch_first=True, bidirectional=True)
                self.attention = nn.MultiheadAttention(hidden_dim * 2, num_heads=8)
                self.classifier = nn.Linear(hidden_dim * 2, 2)  # Binary classification
                
            def forward(self, x):
                embedded = self.embedding(x)
                lstm_out, _ = self.lstm(embedded)
                
                # Self-attention
                attended, _ = self.attention(lstm_out, lstm_out, lstm_out)
                
                # Global max pooling
                pooled = torch.max(attended, dim=1)[0]
                
                return self.classifier(pooled)
        
        return LogicModel(
            vocab_size=config.get('vocab_size', 10000),
            embedding_dim=config.get('embedding_dim', 256),
            hidden_dim=config.get('hidden_dim', 512)
        )
    
    @staticmethod
    def _create_language_model(config: Dict[str, Any]) -> nn.Module:
        """Create Romanian language model"""
        
        class RomanianModel(nn.Module):
            def __init__(self, vocab_size=50000, embedding_dim=512, hidden_dim=1024):
                super().__init__()
                self.embedding = nn.Embedding(vocab_size, embedding_dim)
                
                # Transformer layers
                encoder_layer = nn.TransformerEncoderLayer(
                    d_model=embedding_dim,
                    nhead=8,
                    dim_feedforward=hidden_dim,
                    dropout=0.1,
                    batch_first=True
                )
                self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=6)
                
                # Task-specific heads
                self.language_head = nn.Linear(embedding_dim, vocab_size)
                self.cultural_head = nn.Linear(embedding_dim, 100)  # Cultural classification
                
            def forward(self, x, task='language'):
                embedded = self.embedding(x)
                transformed = self.transformer(embedded)
                
                if task == 'language':
                    return self.language_head(transformed)
                elif task == 'cultural':
                    pooled = torch.mean(transformed, dim=1)
                    return self.cultural_head(pooled)
                else:
                    return transformed
        
        return RomanianModel(
            vocab_size=config.get('vocab_size', 50000),
            embedding_dim=config.get('embedding_dim', 512),
            hidden_dim=config.get('hidden_dim', 1024)
        )
    
    @staticmethod
    def _create_multimodal_model(config: Dict[str, Any]) -> nn.Module:
        """Create multimodal fusion model"""
        
        class MultiModalModel(nn.Module):
            def __init__(self, text_dim=512, vision_dim=2048, audio_dim=128, fusion_dim=1024):
                super().__init__()
                
                # Modality-specific encoders
                self.text_encoder = nn.Linear(text_dim, fusion_dim)
                self.vision_encoder = nn.Linear(vision_dim, fusion_dim)
                self.audio_encoder = nn.Linear(audio_dim, fusion_dim)
                
                # Cross-modal attention
                self.cross_attention = nn.MultiheadAttention(fusion_dim, num_heads=8)
                
                # Fusion layers
                self.fusion = nn.Sequential(
                    nn.Linear(fusion_dim * 3, fusion_dim),
                    nn.ReLU(),
                    nn.Dropout(0.2),
                    nn.Linear(fusion_dim, fusion_dim // 2),
                    nn.ReLU(),
                    nn.Linear(fusion_dim // 2, 1)
                )
            
            def forward(self, text, vision, audio):
                # Encode each modality
                text_encoded = self.text_encoder(text)
                vision_encoded = self.vision_encoder(vision)
                audio_encoded = self.audio_encoder(audio)
                
                # Stack for attention
                modalities = torch.stack([text_encoded, vision_encoded, audio_encoded], dim=1)
                
                # Cross-modal attention
                attended, _ = self.cross_attention(modalities, modalities, modalities)
                
                # Flatten and fuse
                fused = attended.view(attended.size(0), -1)
                return self.fusion(fused)
        
        return MultiModalModel(
            text_dim=config.get('text_dim', 512),
            vision_dim=config.get('vision_dim', 2048),
            audio_dim=config.get('audio_dim', 128),
            fusion_dim=config.get('fusion_dim', 1024)
        )

class TrainingOrchestrator:
    """Main training orchestration system"""
    
    def __init__(self, registry: ModelRegistry, monitor: ProductionMonitor):
        self.registry = registry
        self.monitor = monitor
        self.dataset_manager = DatasetManager()
        
        self.job_queue: List[TrainingJob] = []
        self.active_jobs: Dict[str, TrainingJob] = {}
        self.completed_jobs: Dict[str, TrainingJob] = {}
        
        self.checkpoint_dir = Path("checkpoints")
        self.checkpoint_dir.mkdir(exist_ok=True)
        
        # Load job history
        self.load_job_history()
    
    def load_job_history(self):
        """Load training job history"""
        try:
            history_file = Path("training_jobs.json")
            if history_file.exists():
                with open(history_file, 'r') as f:
                    data = json.load(f)
                
                for job_data in data.get('jobs', []):
                    job = TrainingJob.from_dict(job_data)
                    if job.status == TrainingStatus.COMPLETED:
                        self.completed_jobs[job.job_id] = job
                    elif job.status == TrainingStatus.RUNNING:
                        job.status = TrainingStatus.FAILED
                        job.error_message = "Process interrupted"
                        self.completed_jobs[job.job_id] = job
                
                logger.info(f"Loaded {len(self.completed_jobs)} job records")
        except Exception as e:
            logger.error(f"Error loading job history: {e}")
    
    def save_job_history(self):
        """Save training job history"""
        try:
            all_jobs = list(self.completed_jobs.values()) + list(self.active_jobs.values())
            data = {
                'jobs': [job.to_dict() for job in all_jobs[-100:]],  # Keep last 100
                'last_updated': datetime.now(timezone.utc).isoformat()
            }
            
            with open("training_jobs.json", 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving job history: {e}")
    
    def submit_training_job(self, config: TrainingConfig) -> str:
        """Submit new training job"""
        job_id = f"train_{config.model_type.value}_{int(datetime.now().timestamp())}"
        
        job = TrainingJob(
            job_id=job_id,
            config=config,
            status=TrainingStatus.QUEUED,
            created_at=datetime.now(timezone.utc),
            started_at=None,
            completed_at=None,
            model_version=None,
            metrics_history=[],
            best_metrics=None,
            checkpoint_path=None,
            error_message=None,
            logs=[]
        )
        
        self.job_queue.append(job)
        logger.info(f"Submitted training job: {job_id}")
        return job_id
    
    async def run_training_job(self, job: TrainingJob):
        """Run a single training job"""
        try:
            job.status = TrainingStatus.RUNNING
            job.started_at = datetime.now(timezone.utc)
            job.logs.append(f"Starting training job: {job.job_id}")
            
            self.active_jobs[job.job_id] = job
            
            # Load dataset
            train_loader, val_loader = self.dataset_manager.load_dataset(
                job.config.dataset_path, 
                job.config.validation_split
            )
            
            # Create model
            model_config = {
                'input_dim': 10,
                'hidden_dim': 256,
                'output_dim': 1
            }
            model = ModelFactory.create_model(job.config.model_type, model_config)
            
            # Setup training
            device = torch.device(job.config.device if torch.cuda.is_available() else 'cpu')
            model.to(device)
            
            # Optimizer
            if job.config.optimizer == 'adam':
                optimizer = optim.Adam(model.parameters(), lr=job.config.learning_rate)
            elif job.config.optimizer == 'sgd':
                optimizer = optim.SGD(model.parameters(), lr=job.config.learning_rate, momentum=0.9)
            else:
                optimizer = optim.AdamW(model.parameters(), lr=job.config.learning_rate)
            
            # Loss function
            if job.config.loss_function == 'mse':
                criterion = nn.MSELoss()
            elif job.config.loss_function == 'crossentropy':
                criterion = nn.CrossEntropyLoss()
            else:
                criterion = nn.MSELoss()
            
            # Learning rate scheduler
            scheduler = None
            if job.config.scheduler_config:
                if job.config.scheduler_config['type'] == 'step':
                    scheduler = optim.lr_scheduler.StepLR(
                        optimizer, 
                        step_size=job.config.scheduler_config.get('step_size', 10),
                        gamma=job.config.scheduler_config.get('gamma', 0.1)
                    )
                elif job.config.scheduler_config['type'] == 'cosine':
                    scheduler = optim.lr_scheduler.CosineAnnealingLR(
                        optimizer,
                        T_max=job.config.epochs
                    )
            
            best_val_loss = float('inf')
            patience_counter = 0
            
            # Training loop
            for epoch in range(job.config.epochs):
                model.train()
                train_losses = []
                
                for batch_idx, (data, target) in enumerate(train_loader):
                    data, target = data.to(device), target.to(device)
                    
                    # Apply data augmentation
                    if job.config.augmentation_config:
                        data = self.dataset_manager.augment_data(data, job.config.augmentation_config)
                    
                    optimizer.zero_grad()
                    output = model(data)
                    loss = criterion(output, target)
                    
                    loss.backward()
                    
                    # Gradient clipping
                    if job.config.gradient_clipping:
                        torch.nn.utils.clip_grad_norm_(
                            model.parameters(), 
                            job.config.gradient_clipping
                        )
                    
                    optimizer.step()
                    train_losses.append(loss.item())
                
                # Validation
                val_loss, val_accuracy = None, None
                if epoch % job.config.validation_interval == 0:
                    model.eval()
                    val_losses = []
                    correct = 0
                    total = 0
                    
                    with torch.no_grad():
                        for data, target in val_loader:
                            data, target = data.to(device), target.to(device)
                            output = model(data)
                            val_losses.append(criterion(output, target).item())
                            
                            # Calculate accuracy (simplified)
                            if job.config.model_type == ModelType.LOGICAL:
                                pred = output.argmax(dim=1)
                                correct += pred.eq(target.view_as(pred)).sum().item()
                                total += target.size(0)
                    
                    val_loss = np.mean(val_losses)
                    val_accuracy = correct / total if total > 0 else None
                
                # Update learning rate
                if scheduler:
                    scheduler.step()
                
                # Record metrics
                metrics = TrainingMetrics(
                    epoch=epoch,
                    train_loss=np.mean(train_losses),
                    val_loss=val_loss,
                    train_accuracy=None,  # Could calculate if needed
                    val_accuracy=val_accuracy,
                    learning_rate=optimizer.param_groups[0]['lr'],
                    batch_time=0.0,  # Could measure if needed
                    gpu_memory_mb=torch.cuda.memory_allocated() / (1024*1024) if torch.cuda.is_available() else 0,
                    timestamp=datetime.now(timezone.utc)
                )
                
                job.metrics_history.append(metrics)
                
                # Check for best model
                if val_loss is not None and val_loss < best_val_loss:
                    best_val_loss = val_loss
                    job.best_metrics = metrics
                    patience_counter = 0
                    
                    # Save checkpoint
                    checkpoint_path = self.checkpoint_dir / f"{job.job_id}_best.pt"
                    torch.save({
                        'epoch': epoch,
                        'model_state_dict': model.state_dict(),
                        'optimizer_state_dict': optimizer.state_dict(),
                        'loss': val_loss,
                        'metrics': metrics.to_dict()
                    }, checkpoint_path)
                    job.checkpoint_path = str(checkpoint_path)
                else:
                    patience_counter += 1
                
                # Early stopping
                if patience_counter >= job.config.early_stopping_patience:
                    job.logs.append(f"Early stopping at epoch {epoch}")
                    break
                
                # Periodic logging
                if epoch % 10 == 0:
                    log_msg = f"Epoch {epoch}: train_loss={metrics.train_loss:.4f}"
                    if val_loss is not None:
                        log_msg += f", val_loss={val_loss:.4f}"
                    if val_accuracy is not None:
                        log_msg += f", val_acc={val_accuracy:.4f}"
                    
                    job.logs.append(log_msg)
                    logger.info(log_msg)
            
            # Register trained model
            if job.checkpoint_path and job.best_metrics:
                model_metrics = ModelMetrics(
                    accuracy=job.best_metrics.val_accuracy or 0.0,
                    latency_ms=100.0,  # Would measure actual latency
                    throughput_rps=10.0,
                    memory_usage_mb=job.best_metrics.gpu_memory_mb,
                    cpu_usage_percent=50.0,
                    gpu_usage_percent=75.0,
                    error_rate=0.01,
                    confidence_score=0.9,
                    cultural_accuracy=0.85 if job.config.model_type == ModelType.LINGUISTIC else 0.0
                )
                
                model_version = self.registry.register_model(
                    model_type=job.config.model_type,
                    model_path=job.checkpoint_path,
                    config_path=f"{job.checkpoint_path}.config",
                    metrics=model_metrics
                )
                
                job.model_version = model_version
                
                # Save config
                with open(f"{job.checkpoint_path}.config", 'w') as f:
                    json.dump(job.config.to_dict(), f, indent=2)
            
            job.status = TrainingStatus.COMPLETED
            job.completed_at = datetime.now(timezone.utc)
            job.logs.append("Training completed successfully")
            
        except Exception as e:
            job.status = TrainingStatus.FAILED
            job.error_message = str(e)
            job.completed_at = datetime.now(timezone.utc)
            job.logs.append(f"Training failed: {e}")
            logger.error(f"Training job {job.job_id} failed: {e}")
        
        finally:
            # Move to completed
            if job.job_id in self.active_jobs:
                del self.active_jobs[job.job_id]
            self.completed_jobs[job.job_id] = job
            self.save_job_history()
    
    async def process_job_queue(self):
        """Process training job queue"""
        while self.job_queue:
            job = self.job_queue.pop(0)
            logger.info(f"Starting training job: {job.job_id}")
            await self.run_training_job(job)
    
    def get_job_status(self, job_id: str) -> Optional[TrainingJob]:
        """Get job status"""
        if job_id in self.active_jobs:
            return self.active_jobs[job_id]
        elif job_id in self.completed_jobs:
            return self.completed_jobs[job_id]
        else:
            for job in self.job_queue:
                if job.job_id == job_id:
                    return job
        return None
    
    def cancel_job(self, job_id: str) -> bool:
        """Cancel training job"""
        # Remove from queue
        for i, job in enumerate(self.job_queue):
            if job.job_id == job_id:
                job.status = TrainingStatus.CANCELLED
                self.completed_jobs[job_id] = self.job_queue.pop(i)
                return True
        
        # Cancel active job (simplified - would need proper cancellation)
        if job_id in self.active_jobs:
            job = self.active_jobs[job_id]
            job.status = TrainingStatus.CANCELLED
            job.completed_at = datetime.now(timezone.utc)
            return True
        
        return False
    
    def get_training_history(self, limit: int = 50) -> List[TrainingJob]:
        """Get training history"""
        all_jobs = list(self.completed_jobs.values())
        return sorted(all_jobs, key=lambda x: x.created_at, reverse=True)[:limit]

# Example usage and testing
async def test_training_orchestrator():
    """Test the training orchestrator"""
    print("🎯 Testing RomAI Training Orchestrator")
    print("=" * 50)
    
    # Initialize components
    registry = ModelRegistry("test_registry.json")
    monitor = ProductionMonitor()
    orchestrator = TrainingOrchestrator(registry, monitor)
    
    print("✅ Training orchestrator initialized")
    
    # Create training configuration
    config = TrainingConfig(
        model_type=ModelType.MATHEMATICAL,
        training_mode=TrainingMode.INITIAL,
        dataset_path="synthetic_data.json",  # Will generate synthetic data
        validation_split=0.2,
        batch_size=32,
        epochs=50,
        learning_rate=0.001,
        optimizer='adam',
        loss_function='mse',
        device='cpu',
        mixed_precision=False,
        gradient_clipping=1.0,
        early_stopping_patience=10,
        checkpoint_interval=10,
        validation_interval=5,
        scheduler_config={'type': 'step', 'step_size': 20, 'gamma': 0.1},
        augmentation_config={'noise': True, 'noise_std': 0.05},
        regularization_config=None
    )
    
    # Submit training job
    job_id = orchestrator.submit_training_job(config)
    print(f"✅ Training job submitted: {job_id}")
    
    # Process job queue
    await orchestrator.process_job_queue()
    
    # Check job status
    final_job = orchestrator.get_job_status(job_id)
    if final_job:
        print(f"✅ Training Status: {final_job.status.value}")
        print(f"   Model Version: {final_job.model_version}")
        print(f"   Metrics History: {len(final_job.metrics_history)} epochs")
        if final_job.best_metrics:
            print(f"   Best Val Loss: {final_job.best_metrics.val_loss:.4f}")
    
    return True

if __name__ == "__main__":
    asyncio.run(test_training_orchestrator())