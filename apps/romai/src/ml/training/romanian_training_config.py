"""
Week 3: Training Configuration Module
Advanced training configuration for Romanian AGI model

This module provides:
- Romanian-optimized training configuration
- Distributed training setup
- Cultural context evaluation metrics
- Romanian-specific loss functions
- Training monitoring and checkpointing
"""

import torch
import torch.nn as nn
import torch.distributed as dist
from torch.utils.data import DataLoader, DistributedSampler
import pytorch_lightning as pl
from pytorch_lightning.callbacks import ModelCheckpoint, EarlyStopping, LearningRateMonitor
from pytorch_lightning.loggers import TensorBoardLogger, WandbLogger
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Callable
import json
import os
from pathlib import Path
import numpy as np
from datetime import datetime

# Import our models and data modules
from ..models.hybrid_architecture import RomAITransformer
from ..models.romanian_language import RomanianMorphologyProcessor
from ..data.romanian_dataset import RomanianCorpusCollector, RomanianDataPreprocessor

@dataclass
class RomanianTrainingConfig:
    """Comprehensive training configuration for Romanian AGI"""
    
    # Model architecture settings
    model_name: str = "romai-1.0"
    vocab_size: int = 32000
    hidden_size: int = 1024
    num_layers: int = 16
    num_attention_heads: int = 16
    intermediate_size: int = 4096
    max_position_embeddings: int = 4096
    num_experts: int = 8
    num_experts_per_token: int = 2
    
    # Mamba-specific settings
    use_mamba: bool = True
    mamba_d_state: int = 16
    mamba_d_conv: int = 4
    mamba_expand: int = 2
    
    # Training hyperparameters
    learning_rate: float = 1e-4
    min_learning_rate: float = 1e-6
    warmup_steps: int = 2000
    max_steps: int = 50000
    batch_size: int = 32
    gradient_accumulation_steps: int = 2
    max_grad_norm: float = 1.0
    weight_decay: float = 0.01
    
    # Romanian-specific settings
    cultural_loss_weight: float = 0.2
    morphology_loss_weight: float = 0.15
    dialect_loss_weight: float = 0.1
    formality_loss_weight: float = 0.05
    romanian_attention_dropout: float = 0.1
    
    # Data settings
    max_sequence_length: int = 2048
    validation_split: float = 0.05
    test_split: float = 0.05
    num_workers: int = 8
    prefetch_factor: int = 2
    
    # Distributed training
    use_distributed: bool = True
    num_gpus: int = torch.cuda.device_count() if torch.cuda.is_available() else 1
    strategy: str = "ddp" if torch.cuda.device_count() > 1 else "auto"
    precision: str = "16-mixed"  # Mixed precision for efficiency
    
    # Checkpointing and logging
    checkpoint_every_n_steps: int = 1000
    save_top_k: int = 3
    monitor_metric: str = "val_romanian_accuracy"
    early_stopping_patience: int = 5
    log_every_n_steps: int = 100
    
    # Romanian evaluation settings
    eval_cultural_context: bool = True
    eval_morphology: bool = True
    eval_dialects: bool = True
    eval_formality: bool = True
    eval_generation_quality: bool = True
    
    # Output directories
    output_dir: str = "./checkpoints"
    log_dir: str = "./logs"
    data_dir: str = "./data/romanian_corpus"
    
    def __post_init__(self):
        """Post-initialization validation and setup"""
        # Create output directories
        Path(self.output_dir).mkdir(parents=True, exist_ok=True)
        Path(self.log_dir).mkdir(parents=True, exist_ok=True)
        Path(self.data_dir).mkdir(parents=True, exist_ok=True)
        
        # Validate GPU settings
        if self.num_gpus == 0:
            self.strategy = "auto"
            self.precision = "32"
            print("⚠️ No GPU detected - using CPU training")
        
        # Adjust batch size for distributed training
        if self.use_distributed and self.num_gpus > 1:
            self.effective_batch_size = self.batch_size * self.num_gpus
            print(f"🔥 Distributed training: {self.num_gpus} GPUs, effective batch size: {self.effective_batch_size}")
        else:
            self.effective_batch_size = self.batch_size

class RomanianLossFunction(nn.Module):
    """Custom loss function optimized for Romanian language learning"""
    
    def __init__(self, config: RomanianTrainingConfig):
        super().__init__()
        self.config = config
        self.language_loss = nn.CrossEntropyLoss(ignore_index=-100)
        self.cultural_loss = nn.MSELoss()
        self.morphology_processor = RomanianMorphologyProcessor()
        
    def forward(self, logits, labels, cultural_context=None, morphology_features=None):
        """
        Compute Romanian-specific loss combining multiple objectives
        
        Args:
            logits: Model output logits [batch, seq_len, vocab_size]
            labels: Target token ids [batch, seq_len]
            cultural_context: Cultural context embeddings [batch, cultural_dim]
            morphology_features: Romanian morphological features [batch, seq_len, morph_dim]
        """
        batch_size, seq_len, vocab_size = logits.shape
        
        # Primary language modeling loss
        language_loss = self.language_loss(
            logits.view(-1, vocab_size),
            labels.view(-1)
        )
        
        total_loss = language_loss
        loss_components = {"language_loss": language_loss.item()}
        
        # Cultural context loss (if available)
        if cultural_context is not None and self.config.cultural_loss_weight > 0:
            # Predict cultural context from hidden states
            predicted_cultural = self._extract_cultural_features(logits)
            cultural_loss = self.cultural_loss(predicted_cultural, cultural_context)
            total_loss += self.config.cultural_loss_weight * cultural_loss
            loss_components["cultural_loss"] = cultural_loss.item()
        
        # Morphological loss (Romanian-specific)
        if morphology_features is not None and self.config.morphology_loss_weight > 0:
            morph_loss = self._compute_morphology_loss(logits, morphology_features)
            total_loss += self.config.morphology_loss_weight * morph_loss
            loss_components["morphology_loss"] = morph_loss.item()
        
        return total_loss, loss_components
    
    def _extract_cultural_features(self, logits):
        """Extract cultural features from model outputs"""
        # Simple pooling approach - can be enhanced
        return torch.mean(logits, dim=1)  # [batch, vocab_size]
    
    def _compute_morphology_loss(self, logits, morphology_features):
        """Compute loss for Romanian morphological accuracy"""
        # Simplified morphology loss - predict morphological tags
        morph_logits = torch.mean(logits, dim=-1)  # [batch, seq_len]
        morph_targets = torch.mean(morphology_features, dim=-1)  # [batch, seq_len]
        return nn.MSELoss()(morph_logits, morph_targets)

class RomanianEvaluationMetrics:
    """Comprehensive evaluation metrics for Romanian AGI model"""
    
    def __init__(self, config: RomanianTrainingConfig):
        self.config = config
        self.morphology_processor = RomanianMorphologyProcessor()
        
        # Romanian test cases for evaluation
        self.test_cases = {
            'cultural_knowledge': [
                "Mărțișorul este o tradiție românească care se sărbătorește în",
                "Mihai Eminescu este considerat",
                "Sarmale sunt un fel de mâncare tradițional"
            ],
            'grammar_complexity': [
                "Copiii își făceau temele când",
                "Dacă ar fi știut că",
                "Cu cât înveți mai mult, cu atât"
            ],
            'regional_dialects': [
                "În Ardeal se zice",
                "La noi în Moldova",
                "În Oltenia oamenii"
            ],
            'formality_levels': [
                "Domnule profesor, aș dori să",
                "Băi, ce mai faci",
                "În cadrul acestei întâlniri oficiale"
            ]
        }
    
    def evaluate_model(self, model, tokenizer, device='cuda'):
        """Comprehensive evaluation of Romanian capabilities"""
        model.eval()
        results = {}
        
        with torch.no_grad():
            # Evaluate cultural knowledge
            results['cultural_accuracy'] = self._evaluate_cultural_knowledge(
                model, tokenizer, device
            )
            
            # Evaluate grammar understanding
            results['grammar_accuracy'] = self._evaluate_grammar_complexity(
                model, tokenizer, device
            )
            
            # Evaluate dialect recognition
            results['dialect_accuracy'] = self._evaluate_regional_dialects(
                model, tokenizer, device
            )
            
            # Evaluate formality detection
            results['formality_accuracy'] = self._evaluate_formality_levels(
                model, tokenizer, device
            )
            
            # Overall Romanian score
            results['romanian_accuracy'] = np.mean([
                results['cultural_accuracy'],
                results['grammar_accuracy'],
                results['dialect_accuracy'],
                results['formality_accuracy']
            ])
        
        return results
    
    def _evaluate_cultural_knowledge(self, model, tokenizer, device):
        """Evaluate Romanian cultural knowledge understanding"""
        correct = 0
        total = len(self.test_cases['cultural_knowledge'])
        
        for prompt in self.test_cases['cultural_knowledge']:
            input_ids = tokenizer.encode(prompt, return_tensors='pt').to(device)
            
            with torch.no_grad():
                outputs = model(input_ids)
                predictions = torch.argmax(outputs.logits[0, -1, :], dim=-1)
                
                # Simplified evaluation - check if prediction makes cultural sense
                predicted_token = tokenizer.decode(predictions.item())
                if self._is_culturally_appropriate(prompt, predicted_token):
                    correct += 1
        
        return correct / total if total > 0 else 0.0
    
    def _evaluate_grammar_complexity(self, model, tokenizer, device):
        """Evaluate Romanian grammar understanding"""
        correct = 0
        total = len(self.test_cases['grammar_complexity'])
        
        for prompt in self.test_cases['grammar_complexity']:
            input_ids = tokenizer.encode(prompt, return_tensors='pt').to(device)
            
            with torch.no_grad():
                outputs = model(input_ids)
                predictions = torch.argmax(outputs.logits[0, -1, :], dim=-1)
                
                predicted_token = tokenizer.decode(predictions.item())
                if self._is_grammatically_correct(prompt, predicted_token):
                    correct += 1
        
        return correct / total if total > 0 else 0.0
    
    def _evaluate_regional_dialects(self, model, tokenizer, device):
        """Evaluate regional dialect recognition"""
        correct = 0
        total = len(self.test_cases['regional_dialects'])
        
        for prompt in self.test_cases['regional_dialects']:
            input_ids = tokenizer.encode(prompt, return_tensors='pt').to(device)
            
            with torch.no_grad():
                outputs = model(input_ids)
                predictions = torch.argmax(outputs.logits[0, -1, :], dim=-1)
                
                predicted_token = tokenizer.decode(predictions.item())
                if self._matches_regional_pattern(prompt, predicted_token):
                    correct += 1
        
        return correct / total if total > 0 else 0.0
    
    def _evaluate_formality_levels(self, model, tokenizer, device):
        """Evaluate formality level understanding"""
        correct = 0
        total = len(self.test_cases['formality_levels'])
        
        for prompt in self.test_cases['formality_levels']:
            input_ids = tokenizer.encode(prompt, return_tensors='pt').to(device)
            
            with torch.no_grad():
                outputs = model(input_ids)
                predictions = torch.argmax(outputs.logits[0, -1, :], dim=-1)
                
                predicted_token = tokenizer.decode(predictions.item())
                if self._matches_formality_level(prompt, predicted_token):
                    correct += 1
        
        return correct / total if total > 0 else 0.0
    
    def _is_culturally_appropriate(self, prompt, token):
        """Check if predicted token is culturally appropriate"""
        # Simplified check - can be enhanced with more sophisticated logic
        cultural_keywords = ['martie', 'poetul', 'români', 'naționale']
        return any(keyword in token.lower() for keyword in cultural_keywords)
    
    def _is_grammatically_correct(self, prompt, token):
        """Check if predicted token follows Romanian grammar"""
        # Simplified grammar check
        return len(token.strip()) > 0 and token.isalpha()
    
    def _matches_regional_pattern(self, prompt, token):
        """Check if token matches regional dialect patterns"""
        # Simplified dialect matching
        regional_patterns = ['că', 'zi', 'spun', 'fac']
        return any(pattern in token.lower() for pattern in regional_patterns)
    
    def _matches_formality_level(self, prompt, token):
        """Check if token matches expected formality level"""
        if 'Domnule' in prompt:
            # Formal context
            formal_words = ['vă', 'dumneavoastră', 'să', 'aș']
            return any(word in token.lower() for word in formal_words)
        elif 'Băi' in prompt:
            # Informal context
            informal_words = ['te', 'tu', 'faci', 'ai']
            return any(word in token.lower() for word in informal_words)
        else:
            # Neutral/official context
            return True

class RomanianTrainingScheduler:
    """Advanced learning rate scheduler optimized for Romanian language learning"""
    
    def __init__(self, config: RomanianTrainingConfig):
        self.config = config
        self.warmup_steps = config.warmup_steps
        self.max_steps = config.max_steps
        self.max_lr = config.learning_rate
        self.min_lr = config.min_learning_rate
    
    def get_lr_scheduler(self, optimizer):
        """Get learning rate scheduler for Romanian training"""
        def lr_lambda(step):
            if step < self.warmup_steps:
                # Warmup phase
                return step / self.warmup_steps
            else:
                # Cosine annealing with Romanian-specific adjustments
                progress = (step - self.warmup_steps) / (self.max_steps - self.warmup_steps)
                cosine_decay = 0.5 * (1 + np.cos(np.pi * progress))
                
                # Romanian language learning adjustments
                cultural_boost = 1.0 + 0.1 * np.sin(2 * np.pi * progress * 3)  # Cultural learning phases
                
                lr_ratio = (cosine_decay * cultural_boost) * (1 - self.min_lr / self.max_lr) + (self.min_lr / self.max_lr)
                return lr_ratio
        
        return torch.optim.lr_scheduler.LambdaLR(optimizer, lr_lambda)

def create_romanian_training_config(**kwargs) -> RomanianTrainingConfig:
    """Create optimized training configuration for Romanian AGI"""
    config = RomanianTrainingConfig(**kwargs)
    
    print("🇷🇴 Romanian Training Configuration Created")
    print(f"   Model: {config.model_name}")
    print(f"   Architecture: {config.num_layers} layers, {config.hidden_size} hidden size")
    print(f"   Romanian Features: Cultural loss, morphology analysis, dialect support")
    print(f"   Training: {config.max_steps} steps, {config.learning_rate} LR")
    print(f"   Hardware: {config.num_gpus} GPUs, {config.strategy} strategy")
    print(f"   Output: {config.output_dir}")
    
    return config

def setup_training_callbacks(config: RomanianTrainingConfig):
    """Setup training callbacks for Romanian AGI training"""
    callbacks = []
    
    # Model checkpointing
    checkpoint_callback = ModelCheckpoint(
        dirpath=config.output_dir,
        filename="romai-{epoch:02d}-{val_romanian_accuracy:.3f}",
        monitor=config.monitor_metric,
        mode="max",
        save_top_k=config.save_top_k,
        every_n_train_steps=config.checkpoint_every_n_steps,
        save_last=True
    )
    callbacks.append(checkpoint_callback)
    
    # Early stopping
    early_stopping = EarlyStopping(
        monitor=config.monitor_metric,
        patience=config.early_stopping_patience,
        mode="max",
        verbose=True
    )
    callbacks.append(early_stopping)
    
    # Learning rate monitoring
    lr_monitor = LearningRateMonitor(logging_interval='step')
    callbacks.append(lr_monitor)
    
    return callbacks

def setup_training_loggers(config: RomanianTrainingConfig):
    """Setup training loggers for Romanian AGI training"""
    loggers = []
    
    # TensorBoard logger
    tb_logger = TensorBoardLogger(
        save_dir=config.log_dir,
        name="romai_training",
        version=datetime.now().strftime("%Y%m%d_%H%M%S")
    )
    loggers.append(tb_logger)
    
    # Optional: Weights & Biases logger
    try:
        wandb_logger = WandbLogger(
            project="romai-agi",
            name=f"romai-training-{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            save_dir=config.log_dir
        )
        loggers.append(wandb_logger)
    except ImportError:
        print("⚠️ Weights & Biases not available - using TensorBoard only")
    
    return loggers

# Example usage and testing
if __name__ == "__main__":
    # Create Romanian training configuration
    config = create_romanian_training_config(
        hidden_size=1024,
        num_layers=12,
        max_steps=10000,
        batch_size=16  # Smaller for testing
    )
    
    # Setup callbacks and loggers
    callbacks = setup_training_callbacks(config)
    loggers = setup_training_loggers(config)
    
    print(f"\n✅ Romanian Training Configuration Ready")
    print(f"   Callbacks: {len(callbacks)} configured")
    print(f"   Loggers: {len(loggers)} configured")
    print(f"   Ready for Week 3 training execution!")
