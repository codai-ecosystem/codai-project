"""
Training Pipeline for RomAI AGI
Complete training infrastructure for Romanian AGI model

This module provides:
- Distributed training setup
- Romanian dataset handling
- Custom loss functions
- Training optimization
- Model checkpointing
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset, DistributedSampler
import torch.distributed as dist
from torch.nn.parallel import DistributedDataParallel as DDP
import pytorch_lightning as pl
from pytorch_lightning.callbacks import ModelCheckpoint, EarlyStopping, LearningRateMonitor
from pytorch_lightning.loggers import WandbLogger, TensorBoardLogger
from transformers import get_linear_schedule_with_warmup, get_cosine_schedule_with_warmup

import os
import json
import logging
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
import wandb
from pathlib import Path
import time
import numpy as np

# Import our model components
try:
    from ..models.hybrid_architecture import RomAIHybridModel
    from ..models.romanian_language import RomanianTextProcessor, RomanianMorphologyProcessor
    from ..models.mamba_layer import StackedMambaModel
    from ..models.moe_routing import MixtureOfExperts
except ImportError:
    # Alternative import for direct execution
    import sys
    import os
    parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sys.path.insert(0, parent_dir)
    
    from models.hybrid_architecture import RomAITransformer
    from models.romanian_language import RomanianTextProcessor, RomanianMorphologyProcessor
    from models.mamba_layer import StackedMambaModel
    from models.moe_routing import MixtureOfExperts
    
    # Use the correct class name
    RomAIHybridModel = RomAITransformer

@dataclass
class TrainingConfig:
    """Training configuration"""
    
    # Model parameters
    d_model: int = 512
    n_layers: int = 6
    n_heads: int = 8
    d_ff: int = 2048
    vocab_size: int = 32000
    max_seq_length: int = 2048
    
    # Training parameters
    batch_size: int = 8
    learning_rate: float = 5e-4
    weight_decay: float = 0.01
    warmup_steps: int = 4000
    max_steps: int = 100000
    gradient_clip_norm: float = 1.0
    
    # Romanian-specific parameters
    use_romanian_moe: bool = True
    use_morphology_features: bool = True
    cultural_context_weight: float = 0.1
    romanian_loss_weight: float = 1.5
    
    # Optimization
    optimizer_type: str = "adamw"
    scheduler_type: str = "cosine"
    mixed_precision: bool = True
    gradient_accumulation_steps: int = 4
    
    # Logging and checkpointing
    log_every_n_steps: int = 100
    save_every_n_steps: int = 1000
    eval_every_n_steps: int = 500
    max_checkpoints: int = 5
    
    # Paths
    data_dir: str = "./data"
    output_dir: str = "./outputs"
    checkpoint_dir: str = "./checkpoints"
    log_dir: str = "./logs"

class RomanianDataset(Dataset):
    """
    Romanian language dataset for training
    """
    
    def __init__(
        self,
        data_path: str,
        tokenizer,
        max_length: int = 512,
        text_processor: Optional[RomanianTextProcessor] = None
    ):
        self.data_path = data_path
        self.tokenizer = tokenizer
        self.max_length = max_length
        self.text_processor = text_processor or RomanianTextProcessor()
        
        # Load data
        self.data = self._load_data()
        
        print(f"Loaded {len(self.data)} Romanian text samples")
    
    def _load_data(self) -> List[Dict[str, Any]]:
        """Load Romanian text data"""
        data = []
        
        # Handle different file formats
        if self.data_path.endswith('.jsonl'):
            with open(self.data_path, 'r', encoding='utf-8') as f:
                for line in f:
                    item = json.loads(line)
                    data.append(item)
        elif self.data_path.endswith('.json'):
            with open(self.data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        elif self.data_path.endswith('.txt'):
            with open(self.data_path, 'r', encoding='utf-8') as f:
                text = f.read()
                # Split into paragraphs
                paragraphs = text.split('\n\n')
                data = [{'text': p.strip()} for p in paragraphs if p.strip()]
        
        return data
    
    def __len__(self) -> int:
        return len(self.data)
    
    def __getitem__(self, idx: int) -> Dict[str, torch.Tensor]:
        item = self.data[idx]
        text = item['text']
        
        # Process Romanian text
        processed = self.text_processor.analyze_text(text)
        
        # Tokenize
        encoding = self.tokenizer(
            text,
            truncation=True,
            padding='max_length',
            max_length=self.max_length,
            return_tensors='pt'
        )
        
        # Extract features
        input_ids = encoding['input_ids'].squeeze()
        attention_mask = encoding['attention_mask'].squeeze()
        
        # Create labels for language modeling (shifted input_ids)
        labels = input_ids.clone()
        labels[attention_mask == 0] = -100  # Ignore padding tokens
        
        # Romanian linguistic features
        morphology_features = self._extract_morphology_features(processed)
        cultural_features = self._extract_cultural_features(processed)
        
        return {
            'input_ids': input_ids,
            'attention_mask': attention_mask,
            'labels': labels,
            'morphology_features': morphology_features,
            'cultural_features': cultural_features,
            'text': text
        }
    
    def _extract_morphology_features(self, processed: Dict) -> torch.Tensor:
        """Extract morphological features tensor"""
        # Create a tensor representing morphological features
        # This is a simplified version - in practice, you'd have more sophisticated encoding
        features = torch.zeros(10)  # 10 morphological features
        
        # Example feature encoding
        if processed['dialect'] == 'moldovenesc':
            features[0] = 1.0
        elif processed['dialect'] == 'ardelenesc':
            features[1] = 1.0
        
        # Add more morphological feature extraction logic here
        
        return features
    
    def _extract_cultural_features(self, processed: Dict) -> torch.Tensor:
        """Extract cultural context features"""
        features = torch.zeros(5)  # 5 cultural features
        
        # Example cultural feature encoding
        if 'traditii' in processed['cultural_context'].get('cultural_concept', []):
            features[0] = 1.0
        if 'romania' in processed['cultural_context'].get('region', []):
            features[1] = 1.0
        
        return features

class RomAILightningModule(pl.LightningModule):
    """
    PyTorch Lightning module for RomAI training
    """
    
    def __init__(self, config: TrainingConfig):
        super().__init__()
        self.config = config
        self.save_hyperparameters()
        
        # Initialize model
        self.model = RomAIHybridModel(
            vocab_size=config.vocab_size,
            d_model=config.d_model,
            n_layers=config.n_layers,
            n_heads=config.n_heads,
            d_ff=config.d_ff,
            max_seq_length=config.max_seq_length,
            use_moe=config.use_romanian_moe
        )
        
        # Romanian text processor for evaluation
        self.text_processor = RomanianTextProcessor()
        self.morphology_processor = RomanianMorphologyProcessor()
        
        # Training metrics
        self.train_loss = []
        self.val_loss = []
        
    def forward(self, batch: Dict[str, torch.Tensor]) -> Dict[str, torch.Tensor]:
        """Forward pass"""
        return self.model(
            input_ids=batch['input_ids'],
            attention_mask=batch['attention_mask'],
            morphology_features=batch.get('morphology_features'),
            labels=batch.get('labels')
        )
    
    def training_step(self, batch: Dict[str, torch.Tensor], batch_idx: int) -> torch.Tensor:
        """Training step"""
        outputs = self.forward(batch)
        
        # Base loss
        loss = outputs['loss']
        
        # Add Romanian-specific losses
        if 'aux_losses' in outputs:
            for aux_name, aux_loss in outputs['aux_losses'].items():
                loss += aux_loss
                self.log(f'train/{aux_name}', aux_loss, prog_bar=False)
        
        # Cultural context loss (if applicable)
        if self.config.cultural_context_weight > 0 and 'cultural_features' in batch:
            cultural_loss = self._compute_cultural_loss(outputs, batch)
            loss += self.config.cultural_context_weight * cultural_loss
            self.log('train/cultural_loss', cultural_loss, prog_bar=False)
        
        # Logging
        self.log('train/loss', loss, prog_bar=True)
        self.log('train/lr', self.trainer.optimizers[0].param_groups[0]['lr'], prog_bar=True)
        
        return loss
    
    def validation_step(self, batch: Dict[str, torch.Tensor], batch_idx: int) -> torch.Tensor:
        """Validation step"""
        outputs = self.forward(batch)
        loss = outputs['loss']
        
        # Add auxiliary losses
        if 'aux_losses' in outputs:
            for aux_name, aux_loss in outputs['aux_losses'].items():
                loss += aux_loss
                self.log(f'val/{aux_name}', aux_loss, prog_bar=False)
        
        self.log('val/loss', loss, prog_bar=True)
        
        # Romanian language evaluation metrics
        if batch_idx == 0:  # Evaluate on first batch only for speed
            self._evaluate_romanian_quality(batch, outputs)
        
        return loss
    
    def _compute_cultural_loss(self, outputs: Dict, batch: Dict) -> torch.Tensor:
        """Compute cultural context alignment loss"""
        # This is a placeholder - implement actual cultural loss computation
        cultural_features = batch['cultural_features']
        hidden_states = outputs.get('hidden_states')
        
        if hidden_states is not None:
            # Compute similarity between hidden states and cultural features
            cultural_projection = hidden_states.mean(dim=1)  # [batch, d_model]
            cultural_target = cultural_features.float()  # [batch, cultural_dim]
            
            # Simple MSE loss (you could use more sophisticated losses)
            loss = F.mse_loss(cultural_projection[:, :cultural_target.shape[1]], cultural_target)
            return loss
        
        return torch.tensor(0.0, device=self.device)
    
    def _evaluate_romanian_quality(self, batch: Dict, outputs: Dict):
        """Evaluate Romanian language quality"""
        # Generate some text samples for evaluation
        input_ids = batch['input_ids'][:2]  # Take first 2 samples
        
        # Simple generation (implement proper generation later)
        with torch.no_grad():
            generated = self.model.generate(
                input_ids[:, :10],  # Use first 10 tokens as prompt
                max_length=50,
                temperature=0.8
            )
        
        # Log generation examples (implement proper text decoding)
        self.log('val/generation_length', generated.shape[1], prog_bar=False)
    
    def configure_optimizers(self):
        """Configure optimizers and schedulers"""
        # Optimizer
        if self.config.optimizer_type.lower() == "adamw":
            optimizer = optim.AdamW(
                self.parameters(),
                lr=self.config.learning_rate,
                weight_decay=self.config.weight_decay,
                betas=(0.9, 0.95)
            )
        else:
            optimizer = optim.Adam(
                self.parameters(),
                lr=self.config.learning_rate,
                weight_decay=self.config.weight_decay
            )
        
        # Scheduler
        if self.config.scheduler_type.lower() == "cosine":
            scheduler = get_cosine_schedule_with_warmup(
                optimizer,
                num_warmup_steps=self.config.warmup_steps,
                num_training_steps=self.config.max_steps
            )
        else:
            scheduler = get_linear_schedule_with_warmup(
                optimizer,
                num_warmup_steps=self.config.warmup_steps,
                num_training_steps=self.config.max_steps
            )
        
        return {
            'optimizer': optimizer,
            'lr_scheduler': {
                'scheduler': scheduler,
                'interval': 'step',
                'frequency': 1
            }
        }

class RomAITrainer:
    """
    Main trainer class for RomAI
    """
    
    def __init__(self, config: TrainingConfig):
        self.config = config
        self.setup_logging()
        self.setup_directories()
        
    def setup_logging(self):
        """Setup logging"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)
        
    def setup_directories(self):
        """Create necessary directories"""
        for dir_path in [self.config.output_dir, self.config.checkpoint_dir, self.config.log_dir]:
            Path(dir_path).mkdir(parents=True, exist_ok=True)
    
    def create_data_loaders(self, tokenizer) -> Tuple[DataLoader, DataLoader]:
        """Create train and validation data loaders"""
        
        # Create datasets
        train_dataset = RomanianDataset(
            data_path=os.path.join(self.config.data_dir, "train.jsonl"),
            tokenizer=tokenizer,
            max_length=self.config.max_seq_length
        )
        
        val_dataset = RomanianDataset(
            data_path=os.path.join(self.config.data_dir, "val.jsonl"),
            tokenizer=tokenizer,
            max_length=self.config.max_seq_length
        )
        
        # Create data loaders
        train_loader = DataLoader(
            train_dataset,
            batch_size=self.config.batch_size,
            shuffle=True,
            num_workers=4,
            pin_memory=True
        )
        
        val_loader = DataLoader(
            val_dataset,
            batch_size=self.config.batch_size,
            shuffle=False,
            num_workers=4,
            pin_memory=True
        )
        
        return train_loader, val_loader
    
    def train(self, tokenizer):
        """Main training function"""
        
        # Create model
        model = RomAILightningModule(self.config)
        
        # Create data loaders
        train_loader, val_loader = self.create_data_loaders(tokenizer)
        
        # Callbacks
        callbacks = [
            ModelCheckpoint(
                dirpath=self.config.checkpoint_dir,
                filename='romai-{epoch:02d}-{val_loss:.2f}',
                monitor='val/loss',
                mode='min',
                save_top_k=self.config.max_checkpoints,
                save_last=True
            ),
            EarlyStopping(
                monitor='val/loss',
                patience=10,
                mode='min'
            ),
            LearningRateMonitor(logging_interval='step')
        ]
        
        # Logger
        logger = [
            TensorBoardLogger(self.config.log_dir, name='romai'),
            WandbLogger(project='romai-agi', name='romanian-agi-training')
        ]
        
        # Trainer
        trainer = pl.Trainer(
            max_steps=self.config.max_steps,
            gradient_clip_val=self.config.gradient_clip_norm,
            accumulate_grad_batches=self.config.gradient_accumulation_steps,
            precision=16 if self.config.mixed_precision else 32,
            callbacks=callbacks,
            logger=logger,
            log_every_n_steps=self.config.log_every_n_steps,
            val_check_interval=self.config.eval_every_n_steps,
            enable_checkpointing=True,
            enable_progress_bar=True
        )
        
        # Start training
        self.logger.info("Starting RomAI training...")
        trainer.fit(model, train_loader, val_loader)
        
        self.logger.info("Training completed!")
        
        return model, trainer

def create_sample_data():
    """Create sample Romanian training data"""
    sample_texts = [
        "România este o țară frumoasă din Europa de Est.",
        "Limba română face parte din familia limbilor romanice.",
        "Bucureștiul este capitala României și cel mai mare oraș.",
        "Carpații sunt munții cei mai înalți din România.",
        "Cultura română este bogată în tradiții și obiceiuri.",
        "Literatura română a fost influențată de multe culturi.",
        "Istoria României este plină de momente importante.",
        "Economia României se bazează pe industrie și agricultură."
    ]
    
    # Create training data
    train_data = []
    for text in sample_texts * 100:  # Repeat for more data
        train_data.append({"text": text})
    
    # Save sample data
    os.makedirs("data", exist_ok=True)
    with open("data/train.jsonl", "w", encoding="utf-8") as f:
        for item in train_data:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")
    
    with open("data/val.jsonl", "w", encoding="utf-8") as f:
        for item in train_data[:50]:  # Smaller validation set
            f.write(json.dumps(item, ensure_ascii=False) + "\n")
    
    print("Sample Romanian training data created!")

# Example usage
if __name__ == "__main__":
    print("Setting up RomAI training pipeline...")
    
    # Create sample data
    create_sample_data()
    
    # Training configuration
    config = TrainingConfig(
        d_model=256,  # Smaller for testing
        n_layers=4,
        batch_size=4,
        max_steps=1000,
        warmup_steps=100
    )
    
    # Create trainer
    trainer = RomAITrainer(config)
    
    print("✅ Training pipeline setup complete!")
    print(f"Config: {config.d_model} model dim, {config.n_layers} layers")
    print(f"Training: {config.max_steps} steps, batch size {config.batch_size}")
    print("Ready for training with Romanian language data!")
