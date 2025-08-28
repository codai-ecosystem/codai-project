#!/usr/bin/env python3
"""
Fixed RomAI Phase 2 Training Pipeline with proper sequence length handling
Enhanced mathematical reasoning training with comprehensive error handling and validation
"""

import asyncio
import json
import logging
import os
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import numpy as np
import torch
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
from transformers import (
    GPT2LMHeadModel,
    GPT2Tokenizer,
    AdamW,
    get_linear_schedule_with_warmup,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('romai_trainer')

class MathematicalDataset(Dataset):
    """Dataset class for mathematical reasoning problems with proper sequence handling"""
    
    def __init__(self, problems: List[Dict], tokenizer, max_length: int = 512):
        self.problems = problems
        self.tokenizer = tokenizer
        self.max_length = max_length
        
        # Set pad token if not available
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
        
        # Prepare input-output pairs
        self.examples = []
        for problem in problems:
            input_text = f"Problem: {problem['problem']}\nSolution:"
            output_text = f" {problem['solution']['result']}"
            
            # Create full text for training
            full_text = input_text + output_text
            
            # Tokenize and truncate if necessary
            encoded = tokenizer.encode_plus(
                full_text,
                max_length=self.max_length,
                truncation=True,
                padding='max_length',
                return_tensors='pt'
            )
            
            self.examples.append({
                'input_ids': encoded['input_ids'].squeeze(),
                'attention_mask': encoded['attention_mask'].squeeze(),
                'labels': encoded['input_ids'].squeeze().clone()  # For language modeling
            })
    
    def __len__(self):
        return len(self.examples)
    
    def __getitem__(self, idx):
        return self.examples[idx]

class RomAIMathematicalTrainer:
    """Enhanced RomAI mathematical reasoning trainer with proper error handling"""
    
    def __init__(self, config):
        self.config = config
        self.device = torch.device(config.DEVICE)
        self.model = None
        self.tokenizer = None
        self.train_dataset = None
        self.val_dataset = None
        
        # Create necessary directories
        os.makedirs(config.MODEL_SAVE_PATH, exist_ok=True)
        os.makedirs(config.CHECKPOINTS_PATH, exist_ok=True)
        
        # Training metrics
        self.train_losses = []
        self.val_losses = []
        self.best_val_loss = float('inf')
        
    def load_datasets(self):
        """Load and prepare mathematical reasoning datasets"""
        logger.info("Loading mathematical reasoning datasets...")
        
        # Load processed mathematical problems
        math_data_path = Path(self.config.DATA_ROOT) / "processed" / "mathematical" / "processed_mathematical_problems.json"
        
        if not math_data_path.exists():
            raise FileNotFoundError(f"Mathematical dataset not found: {math_data_path}")
        
        with open(math_data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        problems = data.get('problems', [])
        logger.info(f"Loaded {len(problems)} mathematical problems")
        
        # Split data (simple split for now)
        split_idx = int(len(problems) * 0.8)
        train_problems = problems[:split_idx] if split_idx > 0 else problems
        val_problems = problems[split_idx:] if split_idx > 0 else problems
        
        logger.info(f"Training examples: {len(train_problems)}")
        logger.info(f"Validation examples: {len(val_problems)}")
        
        return train_problems, val_problems
    
    def initialize_model(self):
        """Initialize GPT-2 model and tokenizer with proper configuration"""
        logger.info("Initializing model and tokenizer...")
        
        # Load tokenizer
        self.tokenizer = GPT2Tokenizer.from_pretrained('distilgpt2')
        
        # Set pad token
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token
        
        # Load model
        self.model = GPT2LMHeadModel.from_pretrained('distilgpt2')
        
        # Resize token embeddings if necessary
        self.model.resize_token_embeddings(len(self.tokenizer))
        
        # Move to device
        self.model = self.model.to(self.device)
        
        logger.info(f"Model initialized: distilgpt2")
        logger.info(f"Model parameters: {sum(p.numel() for p in self.model.parameters()):,}")
    
    def prepare_datasets(self):
        """Prepare training and validation datasets"""
        logger.info("Preparing datasets...")
        
        train_problems, val_problems = self.load_datasets()
        
        # Create datasets with proper sequence length handling
        self.train_dataset = MathematicalDataset(
            train_problems, 
            self.tokenizer, 
            max_length=512  # Safe maximum length for DistilGPT-2
        )
        
        self.val_dataset = MathematicalDataset(
            val_problems, 
            self.tokenizer, 
            max_length=512
        )
        
        logger.info(f"Training examples: {len(self.train_dataset)}")
        logger.info(f"Validation examples: {len(self.val_dataset)}")
    
    def create_data_loaders(self):
        """Create PyTorch data loaders"""
        train_loader = DataLoader(
            self.train_dataset,
            batch_size=self.config.TRAIN_BATCH_SIZE,
            shuffle=True,
            num_workers=0  # CPU-only environment
        )
        
        val_loader = DataLoader(
            self.val_dataset,
            batch_size=self.config.TRAIN_BATCH_SIZE,
            shuffle=False,
            num_workers=0
        )
        
        return train_loader, val_loader
    
    def train_epoch(self, train_loader, optimizer, scheduler):
        """Train for one epoch with proper error handling"""
        self.model.train()
        total_loss = 0
        num_batches = 0
        
        for batch_idx, batch in enumerate(train_loader):
            try:
                # Move batch to device
                input_ids = batch['input_ids'].to(self.device)
                attention_mask = batch['attention_mask'].to(self.device)
                labels = batch['labels'].to(self.device)
                
                # Verify sequence length
                if input_ids.size(1) > 1024:  # DistilGPT-2 max position embeddings
                    logger.warning(f"Sequence too long: {input_ids.size(1)}, truncating to 1024")
                    input_ids = input_ids[:, :1024]
                    attention_mask = attention_mask[:, :1024]
                    labels = labels[:, :1024]
                
                optimizer.zero_grad()
                
                # Forward pass
                outputs = self.model(
                    input_ids=input_ids,
                    attention_mask=attention_mask,
                    labels=labels
                )
                
                loss = outputs.loss
                loss.backward()
                
                # Gradient clipping
                torch.nn.utils.clip_grad_norm_(self.model.parameters(), 1.0)
                
                optimizer.step()
                scheduler.step()
                
                total_loss += loss.item()
                num_batches += 1
                
                if batch_idx % 10 == 0:
                    logger.info(f"  Batch {batch_idx}, Loss: {loss.item():.4f}")
                
            except Exception as e:
                logger.error(f"Error in batch {batch_idx}: {str(e)}")
                continue
        
        return total_loss / max(num_batches, 1)
    
    def evaluate(self, val_loader):
        """Evaluate model with proper error handling"""
        self.model.eval()
        total_loss = 0
        num_batches = 0
        
        with torch.no_grad():
            for batch in val_loader:
                try:
                    # Move batch to device
                    input_ids = batch['input_ids'].to(self.device)
                    attention_mask = batch['attention_mask'].to(self.device)
                    labels = batch['labels'].to(self.device)
                    
                    # Verify sequence length
                    if input_ids.size(1) > 1024:
                        input_ids = input_ids[:, :1024]
                        attention_mask = attention_mask[:, :1024]
                        labels = labels[:, :1024]
                    
                    outputs = self.model(
                        input_ids=input_ids,
                        attention_mask=attention_mask,
                        labels=labels
                    )
                    
                    total_loss += outputs.loss.item()
                    num_batches += 1
                    
                except Exception as e:
                    logger.error(f"Error in validation batch: {str(e)}")
                    continue
        
        return total_loss / max(num_batches, 1)
    
    def save_checkpoint(self, epoch, train_loss, val_loss, is_best=False):
        """Save training checkpoint"""
        checkpoint = {
            'epoch': epoch,
            'model_state_dict': self.model.state_dict(),
            'train_loss': train_loss,
            'val_loss': val_loss,
            'train_losses': self.train_losses,
            'val_losses': self.val_losses,
            'config': vars(self.config)
        }
        
        # Save regular checkpoint
        checkpoint_path = Path(self.config.CHECKPOINTS_PATH) / f"checkpoint_epoch_{epoch}.pt"
        torch.save(checkpoint, checkpoint_path)
        logger.info(f"Checkpoint saved: {checkpoint_path}")
        
        # Save best model
        if is_best:
            best_path = Path(self.config.CHECKPOINTS_PATH) / "best_model.pt"
            torch.save(checkpoint, best_path)
            logger.info(f"Best model saved: {best_path}")
    
    def save_final_model(self):
        """Save final trained model"""
        model_path = Path(self.config.MODEL_SAVE_PATH) / "romai_phase2_mathematical"
        
        # Save model and tokenizer
        self.model.save_pretrained(model_path)
        self.tokenizer.save_pretrained(model_path)
        
        logger.info(f"Final model saved: {model_path}")
        
        # Save training history
        history = {
            'train_losses': self.train_losses,
            'val_losses': self.val_losses,
            'config': vars(self.config),
            'training_completed': datetime.now().isoformat()
        }
        
        history_path = model_path / "training_history.json"
        with open(history_path, 'w') as f:
            json.dump(history, f, indent=2)
        
        logger.info(f"Training history saved: {history_path}")
    
    async def train(self):
        """Main training loop with comprehensive error handling"""
        try:
            logger.info("Starting RomAI Phase 2 mathematical reasoning training...")
            
            # Initialize model
            self.initialize_model()
            
            # Prepare datasets
            self.prepare_datasets()
            
            # Create data loaders
            train_loader, val_loader = self.create_data_loaders()
            
            # Initialize optimizer and scheduler
            optimizer = AdamW(
                self.model.parameters(),
                lr=self.config.LEARNING_RATE,
                weight_decay=0.01
            )
            
            total_steps = len(train_loader) * self.config.NUM_EPOCHS
            scheduler = get_linear_schedule_with_warmup(
                optimizer,
                num_warmup_steps=int(0.1 * total_steps),
                num_training_steps=total_steps
            )
            
            logger.info(f"Training for {self.config.NUM_EPOCHS} epochs...")
            
            # Training loop
            for epoch in range(1, self.config.NUM_EPOCHS + 1):
                logger.info(f"Epoch {epoch}/{self.config.NUM_EPOCHS}")
                
                # Train
                train_loss = self.train_epoch(train_loader, optimizer, scheduler)
                self.train_losses.append(train_loss)
                
                # Validate
                val_loss = self.evaluate(val_loader)
                self.val_losses.append(val_loss)
                
                # Check if best model
                is_best = val_loss < self.best_val_loss
                if is_best:
                    self.best_val_loss = val_loss
                
                # Save checkpoint
                self.save_checkpoint(epoch, train_loss, val_loss, is_best)
                
                logger.info(f"Epoch {epoch} - Train Loss: {train_loss:.4f}, Val Loss: {val_loss:.4f}")
            
            # Save final model
            self.save_final_model()
            
            logger.info("Training completed successfully!")
            
            return {
                'status': 'success',
                'final_train_loss': self.train_losses[-1],
                'final_val_loss': self.val_losses[-1],
                'best_val_loss': self.best_val_loss,
                'epochs_completed': self.config.NUM_EPOCHS
            }
            
        except Exception as e:
            logger.error(f"Training failed: {str(e)}")
            import traceback
            traceback.print_exc()
            return {
                'status': 'failed',
                'error': str(e)
            }

async def main():
    """Main function"""
    # Import configuration
    sys.path.append('/home/ubuntu/romai_phase2')
    from configs.phase2_config import Phase2Config
    
    print("🚀 Starting RomAI Phase 2 Training Pipeline")
    print("=" * 55)
    print(f"🖥️ Device: {Phase2Config.DEVICE}")
    print(f"📚 Batch Size: {Phase2Config.TRAIN_BATCH_SIZE}")
    print(f"📖 Epochs: {Phase2Config.NUM_EPOCHS}")
    print(f"⚡ Learning Rate: {Phase2Config.LEARNING_RATE}")
    print(f"💾 Max Memory: {Phase2Config.MAX_MEMORY}")
    print()
    
    # Create trainer
    trainer = RomAIMathematicalTrainer(Phase2Config)
    
    # Run training
    start_time = time.time()
    result = await trainer.train()
    end_time = time.time()
    
    # Display results
    print("\n" + "=" * 55)
    print("🎯 Training Results")
    print("=" * 55)
    
    if result['status'] == 'success':
        print("✅ Training completed successfully!")
        print(f"📊 Final Training Loss: {result['final_train_loss']:.4f}")
        print(f"📊 Final Validation Loss: {result['final_val_loss']:.4f}")
        print(f"🏆 Best Validation Loss: {result['best_val_loss']:.4f}")
        print(f"⏱️ Training Time: {(end_time - start_time):.2f} seconds")
        print(f"🎯 Epochs Completed: {result['epochs_completed']}")
    else:
        print("❌ Training failed!")
        print(f"🚨 Error: {result['error']}")
    
    print("=" * 55)

if __name__ == "__main__":
    asyncio.run(main())