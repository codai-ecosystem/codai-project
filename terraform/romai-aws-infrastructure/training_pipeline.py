#!/usr/bin/env python3
"""
RomAI Phase 2 Training Pipeline
Comprehensive training infrastructure for mathematical reasoning enhancement
"""

import os
import sys
import json
import asyncio
import logging
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from datetime import datetime
import pickle
import math
from transformers import GPT2Tokenizer, GPT2LMHeadModel, AdamW, get_linear_schedule_with_warmup
import numpy as np

# Add project root to path
sys.path.append('/home/ubuntu/romai_phase2')
from configs.phase2_config import Phase2Config

@dataclass
class TrainingMetrics:
    """Training metrics and statistics"""
    epoch: int = 0
    train_loss: float = 0.0
    eval_loss: float = 0.0
    learning_rate: float = 0.0
    step: int = 0
    examples_processed: int = 0
    
class MathematicalDataset(Dataset):
    """Dataset for mathematical reasoning training"""
    
    def __init__(self, data_path: Path, tokenizer, max_length: int = 512):
        self.tokenizer = tokenizer
        self.max_length = max_length
        self.examples = []
        
        self._load_data(data_path)
        
    def _load_data(self, data_path: Path):
        """Load processed mathematical data"""
        try:
            with open(data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            problems = data.get('problems', [])
            
            for problem in problems:
                if problem.get('category') != 'processing_error':
                    # Create training example
                    question = problem.get('problem', '')
                    solution = problem.get('solution', '')
                    steps = problem.get('steps', [])
                    
                    # Format as conversation
                    if steps:
                        full_solution = f"{solution}\n\nSteps:\n" + "\n".join(f"{i+1}. {step}" for i, step in enumerate(steps))
                    else:
                        full_solution = solution
                    
                    # Create prompt-response pair
                    prompt = f"Q: {question}\nA: {full_solution}"
                    
                    self.examples.append({
                        'text': prompt,
                        'problem': question,
                        'solution': solution,
                        'difficulty': problem.get('difficulty', 'unknown'),
                        'category': problem.get('category', 'unknown'),
                        'language': problem.get('language', 'en')
                    })
                    
        except Exception as e:
            logging.error(f"Failed to load data from {data_path}: {e}")
    
    def __len__(self):
        return len(self.examples)
    
    def __getitem__(self, idx):
        example = self.examples[idx]
        
        # Tokenize the text
        encoding = self.tokenizer(
            example['text'],
            truncation=True,
            padding='max_length',
            max_length=self.max_length,
            return_tensors='pt'
        )
        
        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'labels': encoding['input_ids'].flatten(),  # For causal LM
            'metadata': {
                'difficulty': example['difficulty'],
                'category': example['category'],
                'language': example['language']
            }
        }

class RomAIMathematicalTrainer:
    """Advanced trainer for mathematical reasoning"""
    
    def __init__(self):
        self.config = Phase2Config()
        self.logger = self._setup_logging()
        
        # Initialize model and tokenizer
        self.tokenizer = None
        self.model = None
        self.device = torch.device(self.config.DEVICE)
        
        # Training state
        self.current_epoch = 0
        self.global_step = 0
        self.best_eval_loss = float('inf')
        
        # Metrics tracking
        self.training_metrics = []
        
    def _setup_logging(self) -> logging.Logger:
        """Setup logging configuration"""
        logger = logging.getLogger("romai_trainer")
        logger.setLevel(logging.INFO)
        
        # Create logs directory
        self.config.LOGS_DIR.mkdir(parents=True, exist_ok=True)
        
        # File handler
        fh = logging.FileHandler(self.config.LOGS_DIR / "training.log")
        fh.setLevel(logging.INFO)
        
        # Console handler
        ch = logging.StreamHandler()
        ch.setLevel(logging.INFO)
        
        # Formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        fh.setFormatter(formatter)
        ch.setFormatter(formatter)
        
        logger.addHandler(fh)
        logger.addHandler(ch)
        
        return logger
    
    def initialize_model(self):
        """Initialize model and tokenizer"""
        self.logger.info("Initializing model and tokenizer...")
        
        try:
            # Use a smaller model for CPU training
            model_name = "distilgpt2"  # Smaller than GPT-2, better for CPU
            
            self.tokenizer = GPT2Tokenizer.from_pretrained(model_name)
            self.model = GPT2LMHeadModel.from_pretrained(model_name)
            
            # Add pad token if it doesn't exist
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
            
            # Move model to device
            self.model.to(self.device)
            
            # Set model to training mode
            self.model.train()
            
            self.logger.info(f"Model initialized: {model_name}")
            self.logger.info(f"Model parameters: {sum(p.numel() for p in self.model.parameters()):,}")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize model: {e}")
            raise
    
    def prepare_datasets(self) -> Tuple[MathematicalDataset, MathematicalDataset]:
        """Prepare training and validation datasets"""
        self.logger.info("Preparing datasets...")
        
        # Path to processed mathematical data
        data_path = self.config.get_dataset_path("mathematical", "processed") / "processed_mathematical_problems.json"
        
        if not data_path.exists():
            raise FileNotFoundError(f"Processed data not found at {data_path}")
        
        # Load dataset
        full_dataset = MathematicalDataset(
            data_path=data_path,
            tokenizer=self.tokenizer,
            max_length=self.config.MAX_SEQUENCE_LENGTH
        )
        
        # Split into train/validation (80/20 split)
        total_size = len(full_dataset)
        train_size = int(0.8 * total_size)
        val_size = total_size - train_size
        
        # For small datasets, use the full dataset for both train and val
        if total_size < 10:
            train_dataset = full_dataset
            val_dataset = full_dataset
        else:
            train_dataset = torch.utils.data.Subset(full_dataset, range(train_size))
            val_dataset = torch.utils.data.Subset(full_dataset, range(train_size, total_size))
        
        self.logger.info(f"Training examples: {len(train_dataset)}")
        self.logger.info(f"Validation examples: {len(val_dataset)}")
        
        return train_dataset, val_dataset
    
    def create_data_loaders(self, train_dataset, val_dataset) -> Tuple[DataLoader, DataLoader]:
        """Create data loaders for training and validation"""
        
        train_loader = DataLoader(
            train_dataset,
            batch_size=self.config.TRAIN_BATCH_SIZE,
            shuffle=True,
            num_workers=0,  # Use 0 for CPU training to avoid multiprocessing issues
            pin_memory=False
        )
        
        val_loader = DataLoader(
            val_dataset,
            batch_size=self.config.EVAL_BATCH_SIZE,
            shuffle=False,
            num_workers=0,
            pin_memory=False
        )
        
        return train_loader, val_loader
    
    def setup_optimizer_and_scheduler(self, train_loader):
        """Setup optimizer and learning rate scheduler"""
        
        # Calculate total training steps
        total_steps = len(train_loader) * self.config.NUM_EPOCHS
        
        # Setup optimizer
        optimizer = AdamW(
            self.model.parameters(),
            lr=self.config.LEARNING_RATE,
            weight_decay=0.01
        )
        
        # Setup scheduler
        scheduler = get_linear_schedule_with_warmup(
            optimizer,
            num_warmup_steps=self.config.WARMUP_STEPS,
            num_training_steps=total_steps
        )
        
        return optimizer, scheduler
    
    def train_epoch(self, train_loader, optimizer, scheduler) -> float:
        """Train for one epoch"""
        
        self.model.train()
        total_loss = 0.0
        num_batches = 0
        
        for batch_idx, batch in enumerate(train_loader):
            # Move batch to device
            input_ids = batch['input_ids'].to(self.device)
            attention_mask = batch['attention_mask'].to(self.device)
            labels = batch['labels'].to(self.device)
            
            # Zero gradients
            optimizer.zero_grad()
            
            # Forward pass
            outputs = self.model(
                input_ids=input_ids,
                attention_mask=attention_mask,
                labels=labels
            )
            
            loss = outputs.loss
            
            # Backward pass
            loss.backward()
            
            # Gradient clipping
            torch.nn.utils.clip_grad_norm_(self.model.parameters(), 1.0)
            
            # Update weights
            optimizer.step()
            scheduler.step()
            
            # Update metrics
            total_loss += loss.item()
            num_batches += 1
            self.global_step += 1
            
            # Logging
            if self.global_step % self.config.LOGGING_STEPS == 0:
                avg_loss = total_loss / num_batches
                current_lr = scheduler.get_last_lr()[0]
                
                self.logger.info(
                    f"Step {self.global_step} | "
                    f"Loss: {loss.item():.4f} | "
                    f"Avg Loss: {avg_loss:.4f} | "
                    f"LR: {current_lr:.2e}"
                )
        
        return total_loss / num_batches if num_batches > 0 else 0.0
    
    def evaluate(self, val_loader) -> float:
        """Evaluate model on validation set"""
        
        self.model.eval()
        total_loss = 0.0
        num_batches = 0
        
        with torch.no_grad():
            for batch in val_loader:
                # Move batch to device
                input_ids = batch['input_ids'].to(self.device)
                attention_mask = batch['attention_mask'].to(self.device)
                labels = batch['labels'].to(self.device)
                
                # Forward pass
                outputs = self.model(
                    input_ids=input_ids,
                    attention_mask=attention_mask,
                    labels=labels
                )
                
                loss = outputs.loss
                total_loss += loss.item()
                num_batches += 1
        
        return total_loss / num_batches if num_batches > 0 else 0.0
    
    def save_checkpoint(self, epoch: int, train_loss: float, eval_loss: float):
        """Save model checkpoint"""
        
        checkpoint = {
            'epoch': epoch,
            'global_step': self.global_step,
            'model_state_dict': self.model.state_dict(),
            'train_loss': train_loss,
            'eval_loss': eval_loss,
            'config': self.config,
            'training_metrics': self.training_metrics
        }
        
        # Create checkpoints directory
        self.config.CHECKPOINTS_DIR.mkdir(parents=True, exist_ok=True)
        
        # Save checkpoint
        checkpoint_path = self.config.CHECKPOINTS_DIR / f"checkpoint_epoch_{epoch}.pt"
        torch.save(checkpoint, checkpoint_path)
        
        # Save tokenizer
        tokenizer_path = self.config.CHECKPOINTS_DIR / "tokenizer"
        self.tokenizer.save_pretrained(tokenizer_path)
        
        # Save best model
        if eval_loss < self.best_eval_loss:
            self.best_eval_loss = eval_loss
            best_model_path = self.config.CHECKPOINTS_DIR / "best_model.pt"
            torch.save(checkpoint, best_model_path)
            self.logger.info(f"Saved new best model with eval loss: {eval_loss:.4f}")
        
        self.logger.info(f"Saved checkpoint: {checkpoint_path}")
    
    async def train(self):
        """Main training loop"""
        self.logger.info("Starting RomAI Phase 2 mathematical reasoning training...")
        
        try:
            # Initialize model
            self.initialize_model()
            
            # Prepare datasets
            train_dataset, val_dataset = self.prepare_datasets()
            
            # Create data loaders
            train_loader, val_loader = self.create_data_loaders(train_dataset, val_dataset)
            
            # Setup optimizer and scheduler
            optimizer, scheduler = self.setup_optimizer_and_scheduler(train_loader)
            
            self.logger.info(f"Training for {self.config.NUM_EPOCHS} epochs...")
            
            # Training loop
            for epoch in range(self.config.NUM_EPOCHS):
                self.current_epoch = epoch
                
                self.logger.info(f"Epoch {epoch + 1}/{self.config.NUM_EPOCHS}")
                
                # Train for one epoch
                train_loss = self.train_epoch(train_loader, optimizer, scheduler)
                
                # Evaluate
                eval_loss = self.evaluate(val_loader)
                
                # Log metrics
                current_lr = scheduler.get_last_lr()[0] if scheduler.get_last_lr() else self.config.LEARNING_RATE
                
                metrics = TrainingMetrics(
                    epoch=epoch + 1,
                    train_loss=train_loss,
                    eval_loss=eval_loss,
                    learning_rate=current_lr,
                    step=self.global_step,
                    examples_processed=(epoch + 1) * len(train_dataset)
                )
                
                self.training_metrics.append(metrics)
                
                self.logger.info(
                    f"Epoch {epoch + 1} completed | "
                    f"Train Loss: {train_loss:.4f} | "
                    f"Eval Loss: {eval_loss:.4f} | "
                    f"LR: {current_lr:.2e}"
                )
                
                # Save checkpoint
                if (epoch + 1) % self.config.SAVE_STEPS == 0 or epoch == self.config.NUM_EPOCHS - 1:
                    self.save_checkpoint(epoch + 1, train_loss, eval_loss)
            
            self.logger.info("Training completed successfully!")
            
            # Save final metrics
            self.save_training_metrics()
            
        except Exception as e:
            self.logger.error(f"Training failed: {e}")
            raise
    
    def save_training_metrics(self):
        """Save training metrics to file"""
        try:
            metrics_data = {
                'training_start': datetime.now().isoformat(),
                'config': {
                    'num_epochs': self.config.NUM_EPOCHS,
                    'batch_size': self.config.TRAIN_BATCH_SIZE,
                    'learning_rate': self.config.LEARNING_RATE,
                    'device': self.config.DEVICE,
                    'model_name': 'distilgpt2'
                },
                'metrics': [
                    {
                        'epoch': m.epoch,
                        'train_loss': m.train_loss,
                        'eval_loss': m.eval_loss,
                        'learning_rate': m.learning_rate,
                        'step': m.step,
                        'examples_processed': m.examples_processed
                    } for m in self.training_metrics
                ],
                'best_eval_loss': self.best_eval_loss
            }
            
            metrics_path = self.config.RESULTS_DIR / "training_metrics.json"
            metrics_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(metrics_path, 'w', encoding='utf-8') as f:
                json.dump(metrics_data, f, indent=2)
            
            self.logger.info(f"Saved training metrics to {metrics_path}")
            
        except Exception as e:
            self.logger.error(f"Failed to save training metrics: {e}")

async def main():
    """Main training entry point"""
    trainer = RomAIMathematicalTrainer()
    
    print("🚀 Starting RomAI Phase 2 Training Pipeline")
    print("=" * 55)
    print(f"🖥️ Device: {trainer.config.DEVICE}")
    print(f"📚 Batch Size: {trainer.config.TRAIN_BATCH_SIZE}")
    print(f"📖 Epochs: {trainer.config.NUM_EPOCHS}")
    print(f"⚡ Learning Rate: {trainer.config.LEARNING_RATE}")
    print(f"💾 Max Memory: {trainer.config.MAX_MEMORY_GB}GB")
    
    await trainer.train()
    
    print("\n✅ RomAI Phase 2 Training Completed!")

if __name__ == "__main__":
    asyncio.run(main())