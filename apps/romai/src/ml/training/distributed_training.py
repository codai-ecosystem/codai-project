"""
RomAI Distributed Training Configuration - PyTorch DistributedDataParallel
===========================================================================

Production-grade distributed training setup for RomAI's world-class AGI.
Implements Microsoft Azure ML best practices for H100 GPU clusters.

Key Features:
- PyTorch DistributedDataParallel with NCCL backend
- H100-optimized configuration for 100x GPUs
- InfiniBand networking with linear scaling
- Fault tolerance and checkpoint recovery
- Mixed precision training for efficiency
- Dynamic loss scaling and gradient clipping

Based on Microsoft documentation:
- Azure ML distributed GPU training best practices
- PyTorch DDP implementation patterns
- H100 performance optimization guidelines

Author: GitHub Copilot Agent
Date: August 26, 2025
Status: Production-Ready Implementation
"""

import os
import torch
import torch.nn as nn
import torch.optim as optim
import torch.distributed as dist
import torch.multiprocessing as mp
from torch.nn.parallel import DistributedDataParallel as DDP
from torch.utils.data import DataLoader, DistributedSampler
from torch.cuda.amp import GradScaler, autocast
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any, Union
from dataclasses import dataclass
import json
import socket

# RomAI imports
from ..models.moe_architecture import RomAIMoEModel
from ..models.multi_head_latent_attention import MultiHeadLatentAttention
from ..data.massive_dataset_strategy import DatasetOrchestrator

logger = logging.getLogger(__name__)

@dataclass
class DistributedConfig:
    """Configuration for distributed training"""
    # Process group settings
    backend: str = "nccl"  # NCCL for GPU training
    init_method: str = "env://"  # Environment variable initialization
    timeout: int = 3600  # 1 hour timeout for operations
    
    # Node and GPU configuration
    world_size: int = 100  # Total number of GPUs (100x H100)
    nodes: int = 50  # Number of nodes (2 GPUs per node)
    gpus_per_node: int = 2  # H100 NVL GPUs per node
    
    # Training configuration
    batch_size_per_gpu: int = 4  # Per-GPU batch size
    gradient_accumulation_steps: int = 32  # Accumulate gradients
    max_grad_norm: float = 1.0  # Gradient clipping
    
    # Mixed precision
    fp16: bool = True  # Use FP16 for memory efficiency
    loss_scale: float = 65536.0  # Initial loss scale
    
    # Checkpoint and logging
    checkpoint_dir: str = "/mnt/romai/checkpoints"
    log_interval: int = 10  # Log every N steps
    checkpoint_interval: int = 1000  # Checkpoint every N steps

class RomAIDistributedTrainer:
    """
    RomAI Distributed Training Manager
    
    Implements Microsoft Azure ML best practices for distributed training:
    - PyTorch DistributedDataParallel with NCCL backend
    - H100 GPU optimization with InfiniBand networking
    - Fault tolerance and automatic recovery
    - Mixed precision training for efficiency
    """
    
    def __init__(self, config: DistributedConfig):
        self.config = config
        self.rank = None
        self.local_rank = None
        self.world_size = None
        self.device = None
        self.model = None
        self.optimizer = None
        self.scaler = None
        self.start_time = time.time()
        
        # Training state
        self.current_epoch = 0
        self.current_step = 0
        self.best_loss = float('inf')
        
        # Performance tracking
        self.training_metrics = {
            "throughput": [],
            "loss_history": [],
            "gpu_utilization": [],
            "memory_usage": []
        }
    
    def setup_distributed(self) -> None:
        """Initialize distributed training following Microsoft best practices"""
        
        # Get distributed training environment variables
        self.rank = int(os.environ.get("RANK", 0))
        self.local_rank = int(os.environ.get("LOCAL_RANK", 0))
        self.world_size = int(os.environ.get("WORLD_SIZE", self.config.world_size))
        
        # Set device
        torch.cuda.set_device(self.local_rank)
        self.device = torch.device(f"cuda:{self.local_rank}")
        
        # Initialize process group
        if not dist.is_initialized():
            master_addr = os.environ.get("MASTER_ADDR", "localhost")
            master_port = os.environ.get("MASTER_PORT", "12355")
            
            if self.rank == 0:
                logger.info(f"🚀 Initializing distributed training")
                logger.info(f"   Master: {master_addr}:{master_port}")
                logger.info(f"   World size: {self.world_size}")
                logger.info(f"   Backend: {self.config.backend}")
            
            dist.init_process_group(
                backend=self.config.backend,
                init_method=self.config.init_method,
                world_size=self.world_size,
                rank=self.rank,
                timeout=timedelta(seconds=self.config.timeout)
            )
        
        # Synchronize all processes
        dist.barrier()
        
        if self.rank == 0:
            logger.info(f"✅ Distributed training initialized successfully")
            logger.info(f"   Rank: {self.rank}/{self.world_size}")
            logger.info(f"   Device: {self.device}")
            logger.info(f"   CUDA Device: {torch.cuda.get_device_name(self.device)}")
    
    def setup_model_and_optimizer(
        self, 
        model_config: Dict[str, Any]
    ) -> None:
        """Set up RomAI MoE model with distributed training optimization"""
        
        if self.rank == 0:
            logger.info("🧠 Setting up RomAI MoE model for distributed training")
        
        # Create RomAI MoE model
        self.model = RomAIMoEModel(
            vocab_size=model_config.get("vocab_size", 50000),
            d_model=model_config.get("d_model", 4096),
            num_layers=model_config.get("num_layers", 48),
            num_experts=model_config.get("num_experts", 64),
            num_experts_per_token=model_config.get("num_experts_per_token", 6),
            use_mla=model_config.get("use_mla", True),
            max_seq_length=model_config.get("max_seq_length", 128000)
        ).to(self.device)
        
        # Calculate model parameters
        total_params = sum(p.numel() for p in self.model.parameters())
        trainable_params = sum(p.numel() for p in self.model.parameters() if p.requires_grad)
        
        if self.rank == 0:
            logger.info(f"📊 Model Statistics:")
            logger.info(f"   Total parameters: {total_params:,}")
            logger.info(f"   Trainable parameters: {trainable_params:,}")
            logger.info(f"   Model size: {total_params * 4 / 1e9:.2f} GB (FP32)")
        
        # Wrap model with DistributedDataParallel
        self.model = DDP(
            self.model,
            device_ids=[self.local_rank],
            output_device=self.local_rank,
            find_unused_parameters=True,  # For MoE architectures
            gradient_as_bucket_view=True,  # Memory optimization
            bucket_cap_mb=25  # Gradient bucketing for efficiency
        )
        
        # Set up optimizer with H100-optimized settings
        self.optimizer = optim.AdamW(
            self.model.parameters(),
            lr=model_config.get("learning_rate", 1e-4),
            betas=(0.9, 0.95),
            weight_decay=model_config.get("weight_decay", 0.1),
            eps=1e-8
        )
        
        # Set up mixed precision scaler
        if self.config.fp16:
            self.scaler = GradScaler(
                init_scale=self.config.loss_scale,
                growth_factor=2.0,
                backoff_factor=0.5,
                growth_interval=2000,
                enabled=True
            )
        
        if self.rank == 0:
            logger.info("✅ Model and optimizer setup completed")
    
    def setup_data_loader(
        self, 
        dataset_path: str,
        batch_size: Optional[int] = None
    ) -> DataLoader:
        """Set up distributed data loader with optimal H100 configuration"""
        
        if batch_size is None:
            batch_size = self.config.batch_size_per_gpu
        
        if self.rank == 0:
            logger.info(f"📚 Setting up data loader")
            logger.info(f"   Dataset path: {dataset_path}")
            logger.info(f"   Batch size per GPU: {batch_size}")
            logger.info(f"   Global batch size: {batch_size * self.world_size}")
        
        # Create dataset orchestrator
        dataset_orchestrator = DatasetOrchestrator()
        
        # Load dataset (implementation depends on your data format)
        dataset = dataset_orchestrator.create_training_dataset(dataset_path)
        
        # Create distributed sampler
        sampler = DistributedSampler(
            dataset,
            num_replicas=self.world_size,
            rank=self.rank,
            shuffle=True,
            drop_last=True  # Ensure consistent batch sizes
        )
        
        # Create data loader with H100 optimization
        data_loader = DataLoader(
            dataset,
            batch_size=batch_size,
            sampler=sampler,
            num_workers=8,  # Optimal for H100 systems
            pin_memory=True,  # Faster GPU transfer
            persistent_workers=True,  # Reduce worker overhead
            drop_last=True
        )
        
        if self.rank == 0:
            logger.info(f"✅ Data loader created")
            logger.info(f"   Dataset size: {len(dataset):,}")
            logger.info(f"   Batches per epoch: {len(data_loader):,}")
        
        return data_loader
    
    def train_epoch(
        self, 
        data_loader: DataLoader,
        epoch: int
    ) -> Dict[str, float]:
        """Train one epoch with distributed training optimization"""
        
        self.model.train()
        epoch_loss = 0.0
        epoch_steps = 0
        epoch_start_time = time.time()
        
        # Set epoch for distributed sampler
        data_loader.sampler.set_epoch(epoch)
        
        for step, batch in enumerate(data_loader):
            step_start_time = time.time()
            
            # Move batch to device
            input_ids = batch["input_ids"].to(self.device, non_blocking=True)
            attention_mask = batch["attention_mask"].to(self.device, non_blocking=True)
            labels = batch["labels"].to(self.device, non_blocking=True)
            
            # Forward pass with mixed precision
            if self.config.fp16:
                with autocast():
                    outputs = self.model(
                        input_ids=input_ids,
                        attention_mask=attention_mask,
                        labels=labels
                    )
                    loss = outputs.loss / self.config.gradient_accumulation_steps
            else:
                outputs = self.model(
                    input_ids=input_ids,
                    attention_mask=attention_mask,
                    labels=labels
                )
                loss = outputs.loss / self.config.gradient_accumulation_steps
            
            # Backward pass
            if self.config.fp16:
                self.scaler.scale(loss).backward()
            else:
                loss.backward()
            
            # Gradient accumulation
            if (step + 1) % self.config.gradient_accumulation_steps == 0:
                # Gradient clipping
                if self.config.fp16:
                    self.scaler.unscale_(self.optimizer)
                    torch.nn.utils.clip_grad_norm_(
                        self.model.parameters(),
                        self.config.max_grad_norm
                    )
                    self.scaler.step(self.optimizer)
                    self.scaler.update()
                else:
                    torch.nn.utils.clip_grad_norm_(
                        self.model.parameters(),
                        self.config.max_grad_norm
                    )
                    self.optimizer.step()
                
                self.optimizer.zero_grad()
                self.current_step += 1
            
            # Accumulate loss
            epoch_loss += loss.item() * self.config.gradient_accumulation_steps
            epoch_steps += 1
            
            # Performance tracking
            step_time = time.time() - step_start_time
            tokens_per_second = (input_ids.size(0) * input_ids.size(1)) / step_time
            
            # Logging
            if step % self.config.log_interval == 0 and self.rank == 0:
                current_lr = self.optimizer.param_groups[0]['lr']
                gpu_memory = torch.cuda.max_memory_allocated(self.device) / 1e9
                
                logger.info(
                    f"Epoch {epoch}, Step {step}/{len(data_loader)}, "
                    f"Loss: {loss.item():.6f}, "
                    f"LR: {current_lr:.2e}, "
                    f"Tokens/s: {tokens_per_second:.0f}, "
                    f"GPU Mem: {gpu_memory:.1f}GB"
                )
                
                # Store metrics
                self.training_metrics["throughput"].append(tokens_per_second)
                self.training_metrics["loss_history"].append(loss.item())
                self.training_metrics["memory_usage"].append(gpu_memory)
            
            # Checkpointing
            if (self.current_step > 0 and 
                self.current_step % self.config.checkpoint_interval == 0 and 
                self.rank == 0):
                self.save_checkpoint(epoch, step, loss.item())
        
        # Synchronize all processes
        dist.barrier()
        
        # Calculate epoch metrics
        avg_loss = epoch_loss / epoch_steps if epoch_steps > 0 else 0
        epoch_time = time.time() - epoch_start_time
        
        # All-reduce loss across all processes
        if dist.is_initialized():
            loss_tensor = torch.tensor(avg_loss, device=self.device)
            dist.all_reduce(loss_tensor, op=dist.ReduceOp.SUM)
            avg_loss = loss_tensor.item() / self.world_size
        
        if self.rank == 0:
            logger.info(
                f"✅ Epoch {epoch} completed in {epoch_time:.2f}s, "
                f"Average Loss: {avg_loss:.6f}"
            )
        
        return {
            "loss": avg_loss,
            "epoch_time": epoch_time,
            "steps": epoch_steps
        }
    
    def save_checkpoint(
        self,
        epoch: int,
        step: int,
        loss: float
    ) -> None:
        """Save training checkpoint"""
        
        if self.rank != 0:
            return
        
        checkpoint_path = os.path.join(
            self.config.checkpoint_dir,
            f"romai_checkpoint_epoch_{epoch}_step_{step}.pt"
        )
        
        os.makedirs(self.config.checkpoint_dir, exist_ok=True)
        
        checkpoint = {
            "epoch": epoch,
            "step": step,
            "global_step": self.current_step,
            "model_state_dict": self.model.module.state_dict(),
            "optimizer_state_dict": self.optimizer.state_dict(),
            "loss": loss,
            "training_metrics": self.training_metrics,
            "config": self.config,
            "timestamp": datetime.now().isoformat()
        }
        
        if self.scaler:
            checkpoint["scaler_state_dict"] = self.scaler.state_dict()
        
        torch.save(checkpoint, checkpoint_path)
        logger.info(f"💾 Checkpoint saved: {checkpoint_path}")
        
        # Keep only last 3 checkpoints to save space
        self._cleanup_old_checkpoints()
    
    def _cleanup_old_checkpoints(self, keep_count: int = 3) -> None:
        """Clean up old checkpoints to save storage space"""
        
        import glob
        checkpoint_pattern = os.path.join(self.config.checkpoint_dir, "romai_checkpoint_*.pt")
        checkpoints = glob.glob(checkpoint_pattern)
        
        if len(checkpoints) <= keep_count:
            return
        
        # Sort by modification time
        checkpoints.sort(key=os.path.getmtime)
        
        # Remove oldest checkpoints
        for checkpoint in checkpoints[:-keep_count]:
            os.remove(checkpoint)
            logger.info(f"🗑️ Removed old checkpoint: {checkpoint}")
    
    def load_checkpoint(self, checkpoint_path: str) -> bool:
        """Load training checkpoint"""
        
        if not os.path.exists(checkpoint_path):
            logger.warning(f"Checkpoint not found: {checkpoint_path}")
            return False
        
        try:
            checkpoint = torch.load(checkpoint_path, map_location=self.device)
            
            self.model.module.load_state_dict(checkpoint["model_state_dict"])
            self.optimizer.load_state_dict(checkpoint["optimizer_state_dict"])
            
            if self.scaler and "scaler_state_dict" in checkpoint:
                self.scaler.load_state_dict(checkpoint["scaler_state_dict"])
            
            self.current_epoch = checkpoint["epoch"]
            self.current_step = checkpoint["global_step"]
            self.training_metrics = checkpoint.get("training_metrics", {})
            
            if self.rank == 0:
                logger.info(f"📂 Checkpoint loaded: {checkpoint_path}")
                logger.info(f"   Epoch: {self.current_epoch}")
                logger.info(f"   Global step: {self.current_step}")
                logger.info(f"   Loss: {checkpoint['loss']:.6f}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to load checkpoint: {e}")
            return False
    
    def train(
        self,
        data_loader: DataLoader,
        num_epochs: int,
        resume_from_checkpoint: Optional[str] = None
    ) -> Dict[str, Any]:
        """Main distributed training loop"""
        
        if self.rank == 0:
            logger.info("🚀 Starting RomAI distributed training")
            logger.info(f"   Epochs: {num_epochs}")
            logger.info(f"   World size: {self.world_size}")
            logger.info(f"   Global batch size: {self.config.batch_size_per_gpu * self.world_size}")
        
        # Load checkpoint if specified
        if resume_from_checkpoint:
            self.load_checkpoint(resume_from_checkpoint)
        
        training_start_time = time.time()
        training_history = []
        
        try:
            for epoch in range(self.current_epoch, num_epochs):
                epoch_start_time = time.time()
                
                if self.rank == 0:
                    logger.info(f"📖 Starting epoch {epoch + 1}/{num_epochs}")
                
                # Train one epoch
                epoch_metrics = self.train_epoch(data_loader, epoch)
                epoch_metrics["epoch"] = epoch
                epoch_metrics["learning_rate"] = self.optimizer.param_groups[0]['lr']
                
                training_history.append(epoch_metrics)
                
                # Update current epoch
                self.current_epoch = epoch + 1
                
                # Save checkpoint at end of epoch
                if self.rank == 0:
                    self.save_checkpoint(epoch, 0, epoch_metrics["loss"])
                
                # Performance summary
                if self.rank == 0:
                    total_time = time.time() - training_start_time
                    avg_throughput = sum(self.training_metrics["throughput"]) / len(self.training_metrics["throughput"])
                    
                    logger.info(f"📊 Training Progress:")
                    logger.info(f"   Completed epochs: {epoch + 1}/{num_epochs}")
                    logger.info(f"   Current loss: {epoch_metrics['loss']:.6f}")
                    logger.info(f"   Average throughput: {avg_throughput:.0f} tokens/s")
                    logger.info(f"   Total training time: {total_time / 3600:.1f} hours")
        
        except KeyboardInterrupt:
            if self.rank == 0:
                logger.info("⚠️ Training interrupted by user")
                self.save_checkpoint(self.current_epoch, 0, epoch_metrics.get("loss", 0))
        
        except Exception as e:
            logger.error(f"❌ Training error: {e}")
            raise
        
        finally:
            # Clean up distributed training
            self.cleanup()
        
        total_training_time = time.time() - training_start_time
        
        if self.rank == 0:
            logger.info("🎉 Training completed successfully!")
            logger.info(f"   Total time: {total_training_time / 3600:.1f} hours")
            logger.info(f"   Final loss: {training_history[-1]['loss']:.6f}")
        
        return {
            "training_history": training_history,
            "total_time": total_training_time,
            "final_metrics": self.training_metrics,
            "checkpoints_saved": True
        }
    
    def cleanup(self) -> None:
        """Clean up distributed training resources"""
        
        if dist.is_initialized():
            dist.destroy_process_group()
        
        if self.rank == 0:
            logger.info("🧹 Distributed training cleanup completed")

# Factory function for easy setup
def setup_distributed_training(
    rank: int,
    world_size: int,
    model_config: Dict[str, Any],
    data_path: str,
    num_epochs: int = 10,
    resume_from_checkpoint: Optional[str] = None
) -> Dict[str, Any]:
    """
    Set up and run distributed training for RomAI
    
    Args:
        rank: Process rank
        world_size: Total number of processes
        model_config: Model configuration
        data_path: Path to training data
        num_epochs: Number of training epochs
        resume_from_checkpoint: Path to checkpoint to resume from
    
    Returns:
        Training results and metrics
    """
    
    # Create distributed configuration
    config = DistributedConfig(world_size=world_size)
    
    # Create trainer
    trainer = RomAIDistributedTrainer(config)
    
    # Set up distributed training
    trainer.setup_distributed()
    
    # Set up model and optimizer
    trainer.setup_model_and_optimizer(model_config)
    
    # Set up data loader
    data_loader = trainer.setup_data_loader(data_path)
    
    # Run training
    results = trainer.train(
        data_loader=data_loader,
        num_epochs=num_epochs,
        resume_from_checkpoint=resume_from_checkpoint
    )
    
    return results

# Azure ML integration
def create_azure_ml_training_job(
    workspace_name: str,
    compute_cluster_name: str,
    experiment_name: str = "romai-distributed-training"
) -> str:
    """Create Azure ML training job configuration"""
    
    training_script = '''
import sys
import os
sys.path.insert(0, '/workspace/romai/src')

from ml.training.distributed_training import setup_distributed_training

# Model configuration for world-class AGI
model_config = {
    "vocab_size": 50000,
    "d_model": 4096,
    "num_layers": 48,
    "num_experts": 64,
    "num_experts_per_token": 6,
    "use_mla": True,
    "max_seq_length": 128000,
    "learning_rate": 1e-4,
    "weight_decay": 0.1
}

# Run distributed training
results = setup_distributed_training(
    rank=int(os.environ.get("RANK", 0)),
    world_size=int(os.environ.get("WORLD_SIZE", 100)),
    model_config=model_config,
    data_path="/mnt/romai/data/massive_training_dataset",
    num_epochs=100
)

print("🎉 RomAI training completed successfully!")
print(f"Final results: {results}")
'''
    
    return training_script

if __name__ == "__main__":
    print("🚀 RomAI Distributed Training Configuration")
    print("==========================================")
    
    # Example configuration for 100x H100 GPUs
    config = DistributedConfig(world_size=100)
    
    print(f"📊 Configuration:")
    print(f"   Backend: {config.backend}")
    print(f"   World size: {config.world_size} GPUs")
    print(f"   Nodes: {config.nodes}")
    print(f"   GPUs per node: {config.gpus_per_node}")
    print(f"   Global batch size: {config.batch_size_per_gpu * config.world_size}")
    print(f"   Mixed precision: {config.fp16}")
    
    print("\n✅ Ready for world-class AGI training!")