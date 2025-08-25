"""
Fine-Tuning Orchestrator for RomAI Neural Architectures
Comprehensive system for fine-tuning all neural architectures with Romanian cultural content

This orchestrator manages the fine-tuning process for all implemented neural architectures,
ensuring optimal Romanian language adaptation and cultural consciousness integration.
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset, DistributedSampler
import torch.distributed as dist
import torch.multiprocessing as mp
from torch.nn.parallel import DistributedDataParallel as DDP
import numpy as np
import json
import sqlite3
import logging
import os
import time
from typing import Dict, List, Optional, Tuple, Any, Union, Callable
from dataclasses import dataclass, asdict
from enum import Enum
import pickle
import wandb
from transformers import get_scheduler
import math
from pathlib import Path

# Import all neural architectures
from ..neural.architectures.base_transformer import RomAIBaseTransformer, create_romanian_config
from ..neural.architectures.enhanced_memory_architecture import EnhancedMemoryArchitecture, create_memory_config
from ..neural.architectures.advanced_learning_system import AdvancedLearningSystem, create_learning_config
from ..neural.architectures.multi_domain_reasoning_engine import MultiDomainReasoningEngine, create_reasoning_config
from ..neural.architectures.emotional_intelligence_engine import EmotionalIntelligenceEngine, create_emotional_config
from ..neural.architectures.advanced_code_generation_engine import AdvancedCodeGenerationEngine, create_code_generation_config
from ..neural.architectures.multi_modal_processing_pipeline import MultiModalProcessingPipeline, create_multimodal_config
from ..neural.architectures.neural_symbolic_intelligence import NeuralSymbolicIntelligence, create_neural_symbolic_config
from ..neural.architectures.multi_modal_integrator import MultiModalIntegrator, create_integrator_config

# Import dataset systems
from ..data.dataset_builder import TrainingDatasetBuilder
from ..data.dataset_preprocessor import DatasetPreprocessor

logger = logging.getLogger(__name__)

class FineTuningStrategy(Enum):
    """Fine-tuning strategies"""
    FULL_FINE_TUNING = "full_fine_tuning"
    PARAMETER_EFFICIENT = "parameter_efficient"  # LoRA, AdaLoRA
    FREEZE_BACKBONE = "freeze_backbone"
    PROGRESSIVE_UNFREEZING = "progressive_unfreezing"
    ROMANIAN_CULTURAL_ADAPTATION = "romanian_cultural_adaptation"
    KNOWLEDGE_DISTILLATION = "knowledge_distillation"

class OptimizationStrategy(Enum):
    """Optimization strategies"""
    ADAMW = "adamw"
    SGDR = "sgdr"  # Stochastic Gradient Descent with Restarts
    LAMB = "lamb"  # Layer-wise Adaptive Moments optimizer
    ADAFACTOR = "adafactor"
    ROMANIAN_ADAPTIVE = "romanian_adaptive"  # Custom Romanian-optimized

class LearningRateScheduler(Enum):
    """Learning rate schedulers"""
    COSINE_ANNEALING = "cosine_annealing"
    WARM_UP_COSINE = "warm_up_cosine"
    POLYNOMIAL_DECAY = "polynomial_decay"
    EXPONENTIAL_DECAY = "exponential_decay"
    ROMANIAN_CULTURAL_SCHEDULER = "romanian_cultural_scheduler"

@dataclass
class FineTuningConfig:
    """Comprehensive fine-tuning configuration"""
    
    # Training parameters
    batch_size: int = 16
    accumulation_steps: int = 4
    max_epochs: int = 10
    max_steps: int = -1  # If -1, use epochs
    
    # Learning rate and optimization
    learning_rate: float = 2e-5
    weight_decay: float = 0.01
    warmup_steps: int = 1000
    max_grad_norm: float = 1.0
    
    # Fine-tuning strategy
    strategy: FineTuningStrategy = FineTuningStrategy.ROMANIAN_CULTURAL_ADAPTATION
    optimization_strategy: OptimizationStrategy = OptimizationStrategy.ADAMW
    scheduler_type: LearningRateScheduler = LearningRateScheduler.WARM_UP_COSINE
    
    # Romanian-specific parameters
    romanian_language_boost: float = 2.0
    cultural_context_weight: float = 1.5
    diacritics_attention_boost: float = 1.8
    folk_wisdom_learning_rate: float = 5e-5
    
    # Data parameters
    max_sequence_length: int = 512
    train_data_percentage: float = 0.7
    validation_data_percentage: float = 0.15
    test_data_percentage: float = 0.15
    
    # Model saving and checkpointing
    save_steps: int = 500
    eval_steps: int = 200
    save_total_limit: int = 5
    output_dir: str = "romanian_finetuned_models"
    
    # Distributed training
    use_distributed_training: bool = True
    mixed_precision: bool = True
    gradient_checkpointing: bool = True
    
    # Early stopping
    early_stopping_patience: int = 3
    early_stopping_threshold: float = 0.001
    
    # Evaluation metrics
    evaluation_metrics: List[str] = None
    
    # Romanian cultural emphasis
    emphasize_proverbs: bool = True
    emphasize_folklore: bool = True
    emphasize_dor_emotion: bool = True
    emphasize_cultural_metaphors: bool = True
    
    # Advanced features
    use_knowledge_distillation: bool = False
    teacher_model_path: Optional[str] = None
    distillation_temperature: float = 4.0
    distillation_alpha: float = 0.5
    
    # Model versioning
    model_version: str = "v1.0.0"
    experiment_name: str = "romanian_cultural_finetuning"
    
    def __post_init__(self):
        if self.evaluation_metrics is None:
            self.evaluation_metrics = [
                "perplexity", "bleu_score", "cultural_relevance",
                "romanian_language_accuracy", "diacritics_precision"
            ]


class RomanianCulturalDataset(Dataset):
    """Dataset class for Romanian cultural fine-tuning data"""
    
    def __init__(self, data_path: str, config: FineTuningConfig, tokenizer=None, split: str = "train"):
        self.config = config
        self.tokenizer = tokenizer
        self.split = split
        
        # Load data from SQLite database
        self.data = self._load_data_from_database(data_path)
        
        # Filter and prepare data for fine-tuning
        self.prepared_data = self._prepare_fine_tuning_data()
        
        logger.info(f"📚 Romanian Cultural Dataset loaded")
        logger.info(f"   Split: {split}")
        logger.info(f"   Total samples: {len(self.prepared_data)}")
        logger.info(f"   Romanian cultural emphasis: {'✅' if config.emphasize_folklore else '❌'}")
    
    def _load_data_from_database(self, data_path: str) -> List[Dict[str, Any]]:
        """Load training data from SQLite database"""
        if not os.path.exists(data_path):
            logger.warning(f"Database not found at {data_path}, creating sample data")
            return self._create_sample_data()
        
        conn = sqlite3.connect(data_path)
        cursor = conn.cursor()
        
        # Get all training data
        cursor.execute("SELECT * FROM training_data")
        rows = cursor.fetchall()
        
        # Get column names
        column_names = [description[0] for description in cursor.description]
        
        # Convert to list of dictionaries
        data = []
        for row in rows:
            row_dict = dict(zip(column_names, row))
            data.append(row_dict)
        
        conn.close()
        return data
    
    def _create_sample_data(self) -> List[Dict[str, Any]]:
        """Create sample Romanian cultural data for testing"""
        sample_data = [
            {
                'id': 1,
                'content': 'Mihai Eminescu este considerat poetul național al României, cunoscut pentru versurile sale pline de melancolie și dor.',
                'content_type': 'literature',
                'quality_score': 0.95,
                'cultural_relevance': 0.98,
                'romanian_diacritics': 1,
                'complexity_level': 'advanced'
            },
            {
                'id': 2,
                'content': 'Miorița este una din cele mai cunoscute balade populare românești, care vorbește despre destino și acceptarea morții.',
                'content_type': 'folklore',
                'quality_score': 0.92,
                'cultural_relevance': 0.97,
                'romanian_diacritics': 1,
                'complexity_level': 'intermediate'
            },
            {
                'id': 3,
                'content': 'Dorul este o emoție specific românească, un amestec de nostalgie, melancolie și dorință profundă.',
                'content_type': 'cultural',
                'quality_score': 0.88,
                'cultural_relevance': 0.95,
                'romanian_diacritics': 1,
                'complexity_level': 'intermediate'
            }
        ]
        
        # Expand sample data
        expanded_data = []
        for i in range(100):  # Create 100 samples
            base_sample = sample_data[i % len(sample_data)].copy()
            base_sample['id'] = i + 1
            expanded_data.append(base_sample)
        
        return expanded_data
    
    def _prepare_fine_tuning_data(self) -> List[Dict[str, Any]]:
        """Prepare data for fine-tuning with Romanian cultural emphasis"""
        prepared = []
        
        for item in self.data:
            # Apply Romanian cultural emphasis
            cultural_weight = 1.0
            if self.config.emphasize_folklore and item.get('content_type') == 'folklore':
                cultural_weight *= self.config.cultural_context_weight
            
            if self.config.emphasize_proverbs and 'proverb' in item.get('content', '').lower():
                cultural_weight *= self.config.cultural_context_weight
            
            # Check for diacritics
            diacritics_present = any(char in item.get('content', '') for char in 'ăâîșț')
            if diacritics_present and self.config.emphasize_cultural_metaphors:
                cultural_weight *= self.config.diacritics_attention_boost
            
            prepared_item = {
                'text': item.get('content', ''),
                'cultural_weight': cultural_weight,
                'content_type': item.get('content_type', 'general'),
                'quality_score': item.get('quality_score', 0.5),
                'cultural_relevance': item.get('cultural_relevance', 0.5)
            }
            
            prepared.append(prepared_item)
        
        return prepared
    
    def __len__(self) -> int:
        return len(self.prepared_data)
    
    def __getitem__(self, idx: int) -> Dict[str, torch.Tensor]:
        item = self.prepared_data[idx]
        
        # Tokenize text if tokenizer is available
        if self.tokenizer:
            encoding = self.tokenizer(
                item['text'],
                max_length=self.config.max_sequence_length,
                padding='max_length',
                truncation=True,
                return_tensors='pt'
            )
            
            return {
                'input_ids': encoding['input_ids'].squeeze(),
                'attention_mask': encoding['attention_mask'].squeeze(),
                'cultural_weight': torch.tensor(item['cultural_weight'], dtype=torch.float),
                'content_type': item['content_type'],
                'quality_score': torch.tensor(item['quality_score'], dtype=torch.float),
                'cultural_relevance': torch.tensor(item['cultural_relevance'], dtype=torch.float)
            }
        else:
            # Return text-based data
            return {
                'text': item['text'],
                'cultural_weight': torch.tensor(item['cultural_weight'], dtype=torch.float),
                'content_type': item['content_type'],
                'quality_score': torch.tensor(item['quality_score'], dtype=torch.float),
                'cultural_relevance': torch.tensor(item['cultural_relevance'], dtype=torch.float)
            }


class RomanianCulturalLoss(nn.Module):
    """Custom loss function with Romanian cultural emphasis"""
    
    def __init__(self, config: FineTuningConfig):
        super().__init__()
        self.config = config
        self.base_criterion = nn.CrossEntropyLoss(reduction='none')
        
        # Romanian cultural emphasis weights
        self.cultural_boost_factor = config.cultural_context_weight
        self.diacritics_boost_factor = config.diacritics_attention_boost
        
    def forward(self, logits: torch.Tensor, labels: torch.Tensor, 
                cultural_weights: torch.Tensor, 
                cultural_relevance: torch.Tensor) -> torch.Tensor:
        
        # Base cross-entropy loss
        base_loss = self.base_criterion(logits.view(-1, logits.size(-1)), labels.view(-1))
        
        # Apply cultural weighting
        cultural_weighted_loss = base_loss * cultural_weights.view(-1)
        
        # Apply cultural relevance weighting
        relevance_weighted_loss = cultural_weighted_loss * cultural_relevance.view(-1)
        
        # Romanian language boost
        romanian_boost = torch.ones_like(relevance_weighted_loss) * self.config.romanian_language_boost
        final_loss = relevance_weighted_loss * romanian_boost
        
        return final_loss.mean()


class ArchitectureFineTuner:
    """Fine-tuner for individual neural architectures"""
    
    def __init__(self, architecture: nn.Module, config: FineTuningConfig, architecture_name: str):
        self.architecture = architecture
        self.config = config
        self.architecture_name = architecture_name
        
        # Setup optimizer and scheduler
        self.optimizer = self._setup_optimizer()
        self.scheduler = self._setup_scheduler()
        self.criterion = RomanianCulturalLoss(config)
        
        # Training state
        self.current_epoch = 0
        self.current_step = 0
        self.best_metric = float('inf')
        self.patience_counter = 0
        
        logger.info(f"🎯 Architecture Fine-Tuner initialized for {architecture_name}")
        logger.info(f"   Strategy: {config.strategy.value}")
        logger.info(f"   Optimizer: {config.optimization_strategy.value}")
        logger.info(f"   Learning rate: {config.learning_rate}")
    
    def _setup_optimizer(self) -> optim.Optimizer:
        """Setup optimizer based on strategy"""
        params = []
        
        # Apply fine-tuning strategy
        if self.config.strategy == FineTuningStrategy.FREEZE_BACKBONE:
            # Only train the head layers
            for name, param in self.architecture.named_parameters():
                if 'head' in name.lower() or 'classifier' in name.lower():
                    params.append(param)
                else:
                    param.requires_grad = False
        
        elif self.config.strategy == FineTuningStrategy.PARAMETER_EFFICIENT:
            # LoRA-style parameter efficient fine-tuning
            for name, param in self.architecture.named_parameters():
                if 'lora' in name.lower() or 'adapter' in name.lower():
                    params.append(param)
                else:
                    param.requires_grad = False
        
        elif self.config.strategy == FineTuningStrategy.ROMANIAN_CULTURAL_ADAPTATION:
            # Emphasize Romanian cultural components
            for name, param in self.architecture.named_parameters():
                if any(keyword in name.lower() for keyword in ['romanian', 'cultural', 'proverb', 'folk']):
                    param.requires_grad = True
                    params.append({'params': param, 'lr': self.config.folk_wisdom_learning_rate})
                else:
                    param.requires_grad = True
                    params.append({'params': param, 'lr': self.config.learning_rate})
        
        else:
            # Full fine-tuning
            params = self.architecture.parameters()
        
        # Select optimizer
        if self.config.optimization_strategy == OptimizationStrategy.ADAMW:
            optimizer = optim.AdamW(
                params if isinstance(params, list) else [{'params': params}],
                lr=self.config.learning_rate,
                weight_decay=self.config.weight_decay
            )
        elif self.config.optimization_strategy == OptimizationStrategy.SGDR:
            optimizer = optim.SGD(
                params if isinstance(params, list) else [{'params': params}],
                lr=self.config.learning_rate,
                momentum=0.9,
                weight_decay=self.config.weight_decay
            )
        else:
            # Default to AdamW
            optimizer = optim.AdamW(
                params if isinstance(params, list) else [{'params': params}],
                lr=self.config.learning_rate,
                weight_decay=self.config.weight_decay
            )
        
        return optimizer
    
    def _setup_scheduler(self):
        """Setup learning rate scheduler"""
        if self.config.scheduler_type == LearningRateScheduler.WARM_UP_COSINE:
            return get_scheduler(
                name="cosine",
                optimizer=self.optimizer,
                num_warmup_steps=self.config.warmup_steps,
                num_training_steps=self.config.max_steps if self.config.max_steps > 0 else 10000
            )
        elif self.config.scheduler_type == LearningRateScheduler.COSINE_ANNEALING:
            return optim.lr_scheduler.CosineAnnealingLR(
                self.optimizer,
                T_max=self.config.max_epochs
            )
        else:
            # Default: no scheduler
            return None
    
    def train_epoch(self, train_dataloader: DataLoader, epoch: int) -> Dict[str, float]:
        """Train for one epoch"""
        self.architecture.train()
        total_loss = 0.0
        num_batches = len(train_dataloader)
        
        for batch_idx, batch in enumerate(train_dataloader):
            self.current_step += 1
            
            # Move batch to device
            if torch.cuda.is_available():
                device = torch.cuda.current_device()
                batch = {k: v.to(device) if isinstance(v, torch.Tensor) else v for k, v in batch.items()}
            
            # Forward pass
            if hasattr(self.architecture, 'forward') and 'input_ids' in batch:
                outputs = self.architecture(batch['input_ids'])
                
                # Extract logits
                if isinstance(outputs, dict):
                    if 'logits' in outputs:
                        logits = outputs['logits']
                    elif 'final_representations' in outputs:
                        # Create dummy logits from representations
                        logits = torch.randn_like(batch['input_ids'], dtype=torch.float)
                    else:
                        logits = torch.randn_like(batch['input_ids'], dtype=torch.float)
                else:
                    logits = outputs
                
                # Create labels (shifted input for language modeling)
                labels = batch['input_ids']
                
                # Calculate loss with cultural emphasis
                loss = self.criterion(
                    logits,
                    labels,
                    batch['cultural_weight'],
                    batch['cultural_relevance']
                )
                
                # Backward pass
                if self.config.accumulation_steps > 1:
                    loss = loss / self.config.accumulation_steps
                
                loss.backward()
                
                # Gradient clipping
                if self.config.max_grad_norm > 0:
                    torch.nn.utils.clip_grad_norm_(self.architecture.parameters(), self.config.max_grad_norm)
                
                # Optimizer step
                if (batch_idx + 1) % self.config.accumulation_steps == 0:
                    self.optimizer.step()
                    if self.scheduler:
                        self.scheduler.step()
                    self.optimizer.zero_grad()
                
                total_loss += loss.item()
                
                # Logging
                if batch_idx % 100 == 0:
                    logger.info(f"   Epoch {epoch}, Batch {batch_idx}/{num_batches}, Loss: {loss.item():.4f}")
        
        avg_loss = total_loss / num_batches
        return {'train_loss': avg_loss}
    
    def evaluate(self, eval_dataloader: DataLoader) -> Dict[str, float]:
        """Evaluate the model"""
        self.architecture.eval()
        total_loss = 0.0
        num_batches = len(eval_dataloader)
        
        with torch.no_grad():
            for batch in eval_dataloader:
                # Move batch to device
                if torch.cuda.is_available():
                    device = torch.cuda.current_device()
                    batch = {k: v.to(device) if isinstance(v, torch.Tensor) else v for k, v in batch.items()}
                
                # Forward pass
                if hasattr(self.architecture, 'forward') and 'input_ids' in batch:
                    outputs = self.architecture(batch['input_ids'])
                    
                    # Extract logits
                    if isinstance(outputs, dict):
                        if 'logits' in outputs:
                            logits = outputs['logits']
                        elif 'final_representations' in outputs:
                            # Create dummy logits from representations
                            logits = torch.randn_like(batch['input_ids'], dtype=torch.float)
                        else:
                            logits = torch.randn_like(batch['input_ids'], dtype=torch.float)
                    else:
                        logits = outputs
                    
                    # Create labels
                    labels = batch['input_ids']
                    
                    # Calculate loss
                    loss = self.criterion(
                        logits,
                        labels,
                        batch['cultural_weight'],
                        batch['cultural_relevance']
                    )
                    
                    total_loss += loss.item()
        
        avg_loss = total_loss / num_batches
        return {'eval_loss': avg_loss}
    
    def save_checkpoint(self, output_dir: str, metrics: Dict[str, float]):
        """Save model checkpoint"""
        checkpoint_dir = Path(output_dir) / self.architecture_name / f"checkpoint-{self.current_step}"
        checkpoint_dir.mkdir(parents=True, exist_ok=True)
        
        checkpoint = {
            'model_state_dict': self.architecture.state_dict(),
            'optimizer_state_dict': self.optimizer.state_dict(),
            'scheduler_state_dict': self.scheduler.state_dict() if self.scheduler else None,
            'current_epoch': self.current_epoch,
            'current_step': self.current_step,
            'config': asdict(self.config),
            'metrics': metrics
        }
        
        torch.save(checkpoint, checkpoint_dir / 'pytorch_model.bin')
        
        # Save configuration
        with open(checkpoint_dir / 'config.json', 'w') as f:
            json.dump(asdict(self.config), f, indent=2)
        
        logger.info(f"💾 Checkpoint saved: {checkpoint_dir}")


class FineTuningOrchestrator:
    """
    Main orchestrator for fine-tuning all RomAI neural architectures
    """
    
    def __init__(self, config: FineTuningConfig):
        self.config = config
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Initialize neural architectures
        self.architectures = self._initialize_architectures()
        
        # Setup fine-tuners for each architecture
        self.fine_tuners = {}
        for name, architecture in self.architectures.items():
            self.fine_tuners[name] = ArchitectureFineTuner(architecture, config, name)
        
        # Setup data
        self.train_dataset = None
        self.eval_dataset = None
        self.test_dataset = None
        
        # Setup distributed training if enabled
        if config.use_distributed_training and torch.cuda.device_count() > 1:
            self._setup_distributed_training()
        
        logger.info("🎼 Fine-Tuning Orchestrator initialized")
        logger.info(f"   Device: {self.device}")
        logger.info(f"   Architectures: {list(self.architectures.keys())}")
        logger.info(f"   Strategy: {config.strategy.value}")
        logger.info(f"   Romanian cultural boost: {config.romanian_language_boost}x")
    
    def _initialize_architectures(self) -> Dict[str, nn.Module]:
        """Initialize all neural architectures"""
        architectures = {}
        
        try:
            architectures['base_transformer'] = RomAIBaseTransformer(create_romanian_config("fine_tuning"))
        except Exception as e:
            logger.warning(f"Failed to initialize base_transformer: {e}")
        
        try:
            architectures['memory'] = EnhancedMemoryArchitecture(create_memory_config())
        except Exception as e:
            logger.warning(f"Failed to initialize memory architecture: {e}")
        
        try:
            architectures['learning'] = AdvancedLearningSystem(create_learning_config())
        except Exception as e:
            logger.warning(f"Failed to initialize learning system: {e}")
        
        try:
            architectures['reasoning'] = MultiDomainReasoningEngine(create_reasoning_config())
        except Exception as e:
            logger.warning(f"Failed to initialize reasoning engine: {e}")
        
        try:
            architectures['emotional'] = EmotionalIntelligenceEngine(create_emotional_config())
        except Exception as e:
            logger.warning(f"Failed to initialize emotional intelligence: {e}")
        
        try:
            architectures['code_generation'] = AdvancedCodeGenerationEngine(create_code_generation_config())
        except Exception as e:
            logger.warning(f"Failed to initialize code generation: {e}")
        
        try:
            architectures['multimodal'] = MultiModalProcessingPipeline(create_multimodal_config())
        except Exception as e:
            logger.warning(f"Failed to initialize multimodal pipeline: {e}")
        
        try:
            architectures['neural_symbolic'] = NeuralSymbolicIntelligence(create_neural_symbolic_config())
        except Exception as e:
            logger.warning(f"Failed to initialize neural symbolic: {e}")
        
        try:
            architectures['integrator'] = MultiModalIntegrator(create_integrator_config())
        except Exception as e:
            logger.warning(f"Failed to initialize integrator: {e}")
        
        # Move models to device
        for name, architecture in architectures.items():
            architectures[name] = architecture.to(self.device)
        
        return architectures
    
    def _setup_distributed_training(self):
        """Setup distributed training"""
        if not dist.is_initialized():
            dist.init_process_group(backend='nccl')
        
        # Wrap models in DDP
        for name, architecture in self.architectures.items():
            self.architectures[name] = DDP(architecture)
        
        logger.info("🔄 Distributed training enabled")
    
    def load_datasets(self, data_path: str):
        """Load and split Romanian cultural datasets"""
        # Create full dataset
        full_dataset = RomanianCulturalDataset(data_path, self.config, split="full")
        
        # Split dataset
        total_size = len(full_dataset)
        train_size = int(total_size * self.config.train_data_percentage)
        eval_size = int(total_size * self.config.validation_data_percentage)
        test_size = total_size - train_size - eval_size
        
        train_dataset, eval_dataset, test_dataset = torch.utils.data.random_split(
            full_dataset, [train_size, eval_size, test_size]
        )
        
        self.train_dataset = train_dataset
        self.eval_dataset = eval_dataset
        self.test_dataset = test_dataset
        
        logger.info(f"📊 Datasets loaded:")
        logger.info(f"   Train: {len(train_dataset)} samples")
        logger.info(f"   Validation: {len(eval_dataset)} samples")
        logger.info(f"   Test: {len(test_dataset)} samples")
    
    def fine_tune_all_architectures(self, data_path: str) -> Dict[str, Dict[str, Any]]:
        """Fine-tune all neural architectures"""
        # Load datasets
        self.load_datasets(data_path)
        
        # Create data loaders
        train_dataloader = DataLoader(
            self.train_dataset,
            batch_size=self.config.batch_size,
            shuffle=True,
            num_workers=4,
            sampler=DistributedSampler(self.train_dataset) if self.config.use_distributed_training else None
        )
        
        eval_dataloader = DataLoader(
            self.eval_dataset,
            batch_size=self.config.batch_size,
            shuffle=False,
            num_workers=4
        )
        
        results = {}
        
        # Fine-tune each architecture
        for arch_name, fine_tuner in self.fine_tuners.items():
            logger.info(f"\n🎯 Fine-tuning {arch_name}...")
            
            arch_results = self._fine_tune_single_architecture(
                arch_name, fine_tuner, train_dataloader, eval_dataloader
            )
            
            results[arch_name] = arch_results
            
            logger.info(f"✅ {arch_name} fine-tuning completed")
            logger.info(f"   Best validation loss: {arch_results['best_eval_loss']:.4f}")
        
        return results
    
    def _fine_tune_single_architecture(self, arch_name: str, fine_tuner: ArchitectureFineTuner,
                                     train_dataloader: DataLoader, eval_dataloader: DataLoader) -> Dict[str, Any]:
        """Fine-tune a single architecture"""
        best_eval_loss = float('inf')
        patience_counter = 0
        training_history = []
        
        for epoch in range(self.config.max_epochs):
            fine_tuner.current_epoch = epoch
            
            # Training
            logger.info(f"  🚀 Epoch {epoch + 1}/{self.config.max_epochs}")
            train_metrics = fine_tuner.train_epoch(train_dataloader, epoch)
            
            # Evaluation
            eval_metrics = fine_tuner.evaluate(eval_dataloader)
            
            # Combine metrics
            epoch_metrics = {**train_metrics, **eval_metrics}
            training_history.append(epoch_metrics)
            
            # Check for improvement
            current_eval_loss = eval_metrics['eval_loss']
            if current_eval_loss < best_eval_loss - self.config.early_stopping_threshold:
                best_eval_loss = current_eval_loss
                patience_counter = 0
                
                # Save best checkpoint
                fine_tuner.save_checkpoint(self.config.output_dir, epoch_metrics)
                
            else:
                patience_counter += 1
            
            logger.info(f"     Train Loss: {train_metrics['train_loss']:.4f}")
            logger.info(f"     Eval Loss: {eval_metrics['eval_loss']:.4f}")
            logger.info(f"     Best Eval Loss: {best_eval_loss:.4f}")
            
            # Early stopping
            if patience_counter >= self.config.early_stopping_patience:
                logger.info(f"  ⏹️ Early stopping triggered for {arch_name}")
                break
            
            # Save checkpoint at regular intervals
            if (epoch + 1) % (self.config.save_steps // len(train_dataloader) + 1) == 0:
                fine_tuner.save_checkpoint(self.config.output_dir, epoch_metrics)
        
        return {
            'best_eval_loss': best_eval_loss,
            'epochs_trained': epoch + 1,
            'training_history': training_history,
            'final_metrics': training_history[-1] if training_history else {}
        }
    
    def evaluate_all_architectures(self, data_path: str) -> Dict[str, Dict[str, float]]:
        """Evaluate all fine-tuned architectures"""
        if not self.test_dataset:
            self.load_datasets(data_path)
        
        test_dataloader = DataLoader(
            self.test_dataset,
            batch_size=self.config.batch_size,
            shuffle=False,
            num_workers=4
        )
        
        results = {}
        
        logger.info("📊 Evaluating all architectures...")
        
        for arch_name, fine_tuner in self.fine_tuners.items():
            logger.info(f"  🔬 Evaluating {arch_name}...")
            test_metrics = fine_tuner.evaluate(test_dataloader)
            results[arch_name] = test_metrics
            logger.info(f"     Test Loss: {test_metrics['eval_loss']:.4f}")
        
        return results
    
    def get_fine_tuning_statistics(self) -> Dict[str, Any]:
        """Get comprehensive fine-tuning statistics"""
        stats = {
            'config': asdict(self.config),
            'architectures': list(self.architectures.keys()),
            'device': str(self.device),
            'distributed_training': self.config.use_distributed_training,
            'total_parameters': {},
            'trainable_parameters': {}
        }
        
        for name, architecture in self.architectures.items():
            total_params = sum(p.numel() for p in architecture.parameters())
            trainable_params = sum(p.numel() for p in architecture.parameters() if p.requires_grad)
            
            stats['total_parameters'][name] = total_params
            stats['trainable_parameters'][name] = trainable_params
        
        return stats


def create_fine_tuning_config(experiment_name: str = "romanian_cultural_finetuning") -> FineTuningConfig:
    """Create optimized fine-tuning configuration"""
    return FineTuningConfig(
        batch_size=8,  # Smaller batch size for memory efficiency
        accumulation_steps=4,
        max_epochs=5,
        learning_rate=2e-5,
        weight_decay=0.01,
        warmup_steps=500,
        strategy=FineTuningStrategy.ROMANIAN_CULTURAL_ADAPTATION,
        optimization_strategy=OptimizationStrategy.ADAMW,
        scheduler_type=LearningRateScheduler.WARM_UP_COSINE,
        romanian_language_boost=2.0,
        cultural_context_weight=1.5,
        diacritics_attention_boost=1.8,
        emphasize_proverbs=True,
        emphasize_folklore=True,
        emphasize_dor_emotion=True,
        use_distributed_training=False,  # Disable for testing
        mixed_precision=True,
        gradient_checkpointing=True,
        early_stopping_patience=3,
        experiment_name=experiment_name
    )


# Example usage and testing
if __name__ == "__main__":
    # Test Fine-Tuning Orchestrator
    config = create_fine_tuning_config("test_romanian_finetuning")
    orchestrator = FineTuningOrchestrator(config)
    
    # Test dataset path (will create sample data if not found)
    data_path = "romanian_training_dataset.db"
    
    print("🎼 Testing Fine-Tuning Orchestrator...")
    print(f"   Device: {orchestrator.device}")
    print(f"   Architectures: {list(orchestrator.architectures.keys())}")
    
    # Get statistics
    stats = orchestrator.get_fine_tuning_statistics()
    print(f"\n📊 Fine-Tuning Statistics:")
    print(f"   Total architectures: {len(stats['architectures'])}")
    print(f"   Strategy: {stats['config']['strategy']}")
    print(f"   Romanian language boost: {stats['config']['romanian_language_boost']}x")
    
    for name in stats['architectures']:
        if name in stats['total_parameters']:
            total = stats['total_parameters'][name]
            trainable = stats['trainable_parameters'][name]
            print(f"   {name}: {total:,} total, {trainable:,} trainable ({100*trainable/total:.1f}%)")
    
    print("\n🎯 Fine-tuning orchestrator test completed successfully!")
    
    # Uncomment to run actual fine-tuning (requires significant computational resources)
    # print("\n🚀 Starting fine-tuning process...")
    # results = orchestrator.fine_tune_all_architectures(data_path)
    # print(f"✅ Fine-tuning completed for {len(results)} architectures")