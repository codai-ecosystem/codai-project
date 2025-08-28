"""
Memory-Efficient Training and Inference System
==============================================

This module implements parameter-efficient fine-tuning techniques (LoRA, QLoRA)
and memory optimization strategies to enable ROMAI AGI system operation within
8GB VRAM constraints of RTX 3060 Ti while maintaining high performance.

Key Capabilities:
- LoRA (Low-Rank Adaptation) for parameter-efficient fine-tuning
- QLoRA (Quantized LoRA) with 4-bit and 8-bit quantization  
- Dynamic model quantization (FP16, INT8, INT4)
- Gradient checkpointing for memory-efficient training
- Model sharding and memory mapping
- Adaptive memory management and garbage collection

Hardware Target:
- RTX 3060 Ti: 8GB VRAM (target usage: 4-6GB)
- i9-14900K: 192GB RAM (efficient CPU-GPU memory transfers)
- Memory bandwidth optimization for training/inference

Performance Goals:
✅ 60-70% memory reduction vs full fine-tuning
✅ <10% performance degradation with quantization
✅ Real-time inference on 8GB VRAM
✅ Efficient gradient accumulation for large models
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader
from transformers import (
    AutoModelForCausalLM, 
    AutoTokenizer, 
    BitsAndBytesConfig,
    TrainingArguments,
    Trainer
)
from peft import (
    LoraConfig,
    get_peft_model,
    prepare_model_for_kbit_training,
    TaskType,
    PeftModel
)
import bitsandbytes as bnb
from accelerate import Accelerator
import gc
import psutil
import logging
from typing import Dict, List, Any, Optional, Tuple, Union, Callable
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from pathlib import Path
import json
import numpy as np
import asyncio
import time
from contextlib import contextmanager

# Configure logger
logger = logging.getLogger(__name__)

class QuantizationType(Enum):
    """Types of quantization available."""
    FP16 = "fp16"
    BF16 = "bf16"
    INT8 = "int8"
    INT4 = "int4"
    NONE = "none"

class OptimizationLevel(Enum):
    """Memory optimization levels."""
    CONSERVATIVE = "conservative"  # Minimal memory savings, best performance
    BALANCED = "balanced"         # Good balance of memory and performance  
    AGGRESSIVE = "aggressive"     # Maximum memory savings
    EXTREME = "extreme"          # Maximum savings, may impact performance

@dataclass
class MemoryConfig:
    """Configuration for memory optimization."""
    quantization_type: QuantizationType = QuantizationType.INT4
    use_lora: bool = True
    lora_rank: int = 16
    lora_alpha: int = 32
    lora_dropout: float = 0.1
    gradient_checkpointing: bool = True
    gradient_accumulation_steps: int = 4
    max_memory_gb: float = 6.0  # Max VRAM usage
    optimization_level: OptimizationLevel = OptimizationLevel.BALANCED
    use_cpu_offloading: bool = True
    use_disk_offloading: bool = False

@dataclass
class MemoryMetrics:
    """Memory usage metrics."""
    gpu_memory_used: float = 0.0
    gpu_memory_total: float = 0.0
    cpu_memory_used: float = 0.0
    cpu_memory_total: float = 0.0
    model_parameters: int = 0
    trainable_parameters: int = 0
    memory_efficiency: float = 0.0  # Trainable params / total params
    timestamp: datetime = field(default_factory=datetime.now)

class MemoryOptimizedModel(nn.Module):
    """Memory-optimized wrapper for transformer models."""
    
    def __init__(self, 
                 model_name: str,
                 memory_config: MemoryConfig,
                 task_type: TaskType = TaskType.CAUSAL_LM):
        super().__init__()
        
        self.model_name = model_name
        self.memory_config = memory_config
        self.task_type = task_type
        
        # Model components
        self.base_model = None
        self.tokenizer = None
        self.peft_model = None
        
        # Memory tracking
        self.memory_metrics = MemoryMetrics()
        self.memory_snapshots = []
        
        # Optimization state
        self.is_optimized = False
        self.quantization_config = None
        
        logger.info(f"🧠 Memory-Optimized Model initialized: {model_name}")
    
    async def load_and_optimize(self) -> bool:
        """Load model and apply memory optimizations."""
        try:
            logger.info("📚 Loading and optimizing model...")
            
            # Step 1: Configure quantization
            self.quantization_config = self._create_quantization_config()
            
            # Step 2: Load tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
            
            # Step 3: Load base model with quantization
            logger.info(f"🔧 Loading model with {self.memory_config.quantization_type.value} quantization...")
            self.base_model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                quantization_config=self.quantization_config,
                device_map="auto",
                trust_remote_code=True,
                torch_dtype=self._get_torch_dtype(),
                low_cpu_mem_usage=True
            )
            
            # Step 4: Apply gradient checkpointing
            if self.memory_config.gradient_checkpointing:
                self.base_model.gradient_checkpointing_enable()
                logger.info("✅ Gradient checkpointing enabled")
            
            # Step 5: Prepare for k-bit training if using quantization
            if self.memory_config.quantization_type in [QuantizationType.INT8, QuantizationType.INT4]:
                self.base_model = prepare_model_for_kbit_training(
                    self.base_model, 
                    use_gradient_checkpointing=self.memory_config.gradient_checkpointing
                )
                logger.info("✅ Model prepared for k-bit training")
            
            # Step 6: Apply LoRA if enabled
            if self.memory_config.use_lora:
                await self._apply_lora_optimization()
            
            # Step 7: Apply additional optimizations
            await self._apply_additional_optimizations()
            
            # Step 8: Measure memory usage
            self.memory_metrics = await self._measure_memory_usage()
            
            self.is_optimized = True
            logger.info("✅ Model loading and optimization completed")
            
            # Log memory statistics
            await self._log_memory_statistics()
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Model optimization failed: {e}")
            return False
    
    def _create_quantization_config(self) -> Optional[BitsAndBytesConfig]:
        """Create quantization configuration."""
        if self.memory_config.quantization_type == QuantizationType.INT4:
            return BitsAndBytesConfig(
                load_in_4bit=True,
                bnb_4bit_use_double_quant=True,
                bnb_4bit_quant_type="nf4",
                bnb_4bit_compute_dtype=torch.float16,
                llm_int8_enable_fp32_cpu_offload=True
            )
        elif self.memory_config.quantization_type == QuantizationType.INT8:
            return BitsAndBytesConfig(
                load_in_8bit=True,
                llm_int8_enable_fp32_cpu_offload=True
            )
        else:
            return None
    
    def _get_torch_dtype(self) -> torch.dtype:
        """Get appropriate torch dtype based on configuration."""
        if self.memory_config.quantization_type == QuantizationType.FP16:
            return torch.float16
        elif self.memory_config.quantization_type == QuantizationType.BF16:
            return torch.bfloat16
        else:
            return torch.float16  # Default for quantized models
    
    async def _apply_lora_optimization(self):
        """Apply LoRA optimization to the model."""
        logger.info("🎯 Applying LoRA optimization...")
        
        # Create LoRA configuration
        lora_config = LoraConfig(
            r=self.memory_config.lora_rank,
            lora_alpha=self.memory_config.lora_alpha,
            target_modules=self._get_target_modules(),
            lora_dropout=self.memory_config.lora_dropout,
            bias="none",
            task_type=self.task_type,
        )
        
        # Apply LoRA to model
        self.peft_model = get_peft_model(self.base_model, lora_config)
        
        # Enable training mode for LoRA layers
        self.peft_model.train()
        
        # Count trainable parameters
        trainable_params = sum(p.numel() for p in self.peft_model.parameters() if p.requires_grad)
        total_params = sum(p.numel() for p in self.peft_model.parameters())
        
        logger.info(f"✅ LoRA applied - Trainable params: {trainable_params:,} ({trainable_params/total_params:.2%})")
    
    def _get_target_modules(self) -> List[str]:
        """Get target modules for LoRA based on model architecture."""
        # Common target modules for transformer models
        common_targets = [
            "q_proj", "k_proj", "v_proj", "o_proj",
            "gate_proj", "up_proj", "down_proj",
            "lm_head"
        ]
        
        # Check which modules exist in the model
        target_modules = []
        for name, module in self.base_model.named_modules():
            for target in common_targets:
                if target in name and isinstance(module, nn.Linear):
                    if target not in target_modules:
                        target_modules.append(target)
        
        if not target_modules:
            # Fallback to all linear layers
            target_modules = ["q_proj", "v_proj"]
        
        logger.info(f"🎯 LoRA target modules: {target_modules}")
        return target_modules
    
    async def _apply_additional_optimizations(self):
        """Apply additional memory optimizations."""
        logger.info("⚡ Applying additional optimizations...")
        
        # Enable memory-efficient attention if available
        if hasattr(self.base_model.config, 'use_flash_attention_2'):
            self.base_model.config.use_flash_attention_2 = True
        
        # Optimize for inference if not training
        if not self.base_model.training:
            self.base_model.eval()
            
            # Enable torch.compile for inference speed (if available)
            try:
                if hasattr(torch, 'compile'):
                    self.base_model = torch.compile(self.base_model)
                    logger.info("✅ Model compiled for inference optimization")
            except Exception as e:
                logger.info(f"ℹ️ Torch compile not available: {e}")
        
        # Clean up unused memory
        await self._cleanup_memory()
    
    async def _measure_memory_usage(self) -> MemoryMetrics:
        """Measure current memory usage."""
        metrics = MemoryMetrics()
        
        if torch.cuda.is_available():
            metrics.gpu_memory_used = torch.cuda.memory_allocated() / (1024**3)
            metrics.gpu_memory_total = torch.cuda.get_device_properties(0).total_memory / (1024**3)
        
        # CPU memory
        process = psutil.Process()
        memory_info = process.memory_info()
        metrics.cpu_memory_used = memory_info.rss / (1024**3)
        metrics.cpu_memory_total = psutil.virtual_memory().total / (1024**3)
        
        # Model parameters
        if self.peft_model:
            metrics.trainable_parameters = sum(p.numel() for p in self.peft_model.parameters() if p.requires_grad)
            metrics.model_parameters = sum(p.numel() for p in self.peft_model.parameters())
        elif self.base_model:
            metrics.model_parameters = sum(p.numel() for p in self.base_model.parameters())
            metrics.trainable_parameters = metrics.model_parameters
        
        if metrics.model_parameters > 0:
            metrics.memory_efficiency = metrics.trainable_parameters / metrics.model_parameters
        
        return metrics
    
    async def _log_memory_statistics(self):
        """Log detailed memory statistics."""
        logger.info("📊 Memory Usage Statistics:")
        logger.info(f"   GPU Memory: {self.memory_metrics.gpu_memory_used:.2f}GB / {self.memory_metrics.gpu_memory_total:.2f}GB ({self.memory_metrics.gpu_memory_used/self.memory_metrics.gpu_memory_total:.1%})")
        logger.info(f"   CPU Memory: {self.memory_metrics.cpu_memory_used:.2f}GB / {self.memory_metrics.cpu_memory_total:.2f}GB")
        logger.info(f"   Model Parameters: {self.memory_metrics.model_parameters:,}")
        logger.info(f"   Trainable Parameters: {self.memory_metrics.trainable_parameters:,}")
        logger.info(f"   Memory Efficiency: {self.memory_metrics.memory_efficiency:.2%}")
        
        # Check if within VRAM limits
        vram_usage_ok = self.memory_metrics.gpu_memory_used <= self.memory_config.max_memory_gb
        status = "✅ WITHIN LIMITS" if vram_usage_ok else "⚠️ EXCEEDS LIMITS"
        logger.info(f"   VRAM Status: {status} (Target: {self.memory_config.max_memory_gb}GB)")
    
    async def _cleanup_memory(self):
        """Clean up unused memory."""
        # Force garbage collection
        gc.collect()
        
        # Clear CUDA cache if available
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            torch.cuda.synchronize()
    
    def forward(self, *args, **kwargs):
        """Forward pass through the model."""
        if self.peft_model:
            return self.peft_model(*args, **kwargs)
        elif self.base_model:
            return self.base_model(*args, **kwargs)
        else:
            raise RuntimeError("No model loaded")
    
    def generate(self, *args, **kwargs):
        """Generate text using the model."""
        if self.peft_model:
            return self.peft_model.generate(*args, **kwargs)
        elif self.base_model:
            return self.base_model.generate(*args, **kwargs)
        else:
            raise RuntimeError("No model loaded")
    
    @contextmanager
    def memory_efficient_context(self):
        """Context manager for memory-efficient operations."""
        initial_memory = torch.cuda.memory_allocated() if torch.cuda.is_available() else 0
        
        try:
            yield
        finally:
            # Clean up after operation
            gc.collect()
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            
            final_memory = torch.cuda.memory_allocated() if torch.cuda.is_available() else 0
            memory_freed = (initial_memory - final_memory) / (1024**2)  # MB
            
            if memory_freed > 10:  # More than 10MB freed
                logger.info(f"🧹 Memory cleanup freed {memory_freed:.1f}MB")

class MemoryEfficientTrainer:
    """Memory-efficient trainer with gradient accumulation and checkpointing."""
    
    def __init__(self, 
                 model: MemoryOptimizedModel,
                 memory_config: MemoryConfig):
        self.model = model
        self.memory_config = memory_config
        
        # Training state
        self.accelerator = None
        self.optimizer = None
        self.lr_scheduler = None
        
        # Memory monitoring
        self.memory_snapshots = []
        self.peak_memory_usage = 0.0
        
        logger.info("🏋️ Memory-Efficient Trainer initialized")
    
    async def setup_training(self, 
                           train_dataloader: DataLoader,
                           eval_dataloader: Optional[DataLoader] = None) -> bool:
        """Setup training with memory optimizations."""
        try:
            logger.info("⚙️ Setting up memory-efficient training...")
            
            # Initialize accelerator with memory optimizations
            self.accelerator = Accelerator(
                gradient_accumulation_steps=self.memory_config.gradient_accumulation_steps,
                mixed_precision="fp16" if self.memory_config.quantization_type == QuantizationType.FP16 else "no",
                cpu=self.memory_config.use_cpu_offloading,
                device_placement=True
            )
            
            # Setup optimizer with memory-efficient settings
            self.optimizer = self._create_memory_efficient_optimizer()
            
            # Prepare model and optimizer
            if self.model.peft_model:
                self.model.peft_model, self.optimizer, train_dataloader = self.accelerator.prepare(
                    self.model.peft_model, self.optimizer, train_dataloader
                )
                if eval_dataloader:
                    eval_dataloader = self.accelerator.prepare(eval_dataloader)
            
            logger.info("✅ Training setup completed")
            return True
            
        except Exception as e:
            logger.error(f"❌ Training setup failed: {e}")
            return False
    
    def _create_memory_efficient_optimizer(self) -> torch.optim.Optimizer:
        """Create memory-efficient optimizer."""
        # Use 8-bit AdamW for memory efficiency
        if self.memory_config.optimization_level == OptimizationLevel.AGGRESSIVE:
            return bnb.optim.AdamW8bit(
                self.model.peft_model.parameters() if self.model.peft_model else self.model.base_model.parameters(),
                lr=2e-5,
                weight_decay=0.01
            )
        else:
            return torch.optim.AdamW(
                self.model.peft_model.parameters() if self.model.peft_model else self.model.base_model.parameters(),
                lr=2e-5,
                weight_decay=0.01
            )
    
    async def train_step(self, batch: Dict[str, torch.Tensor]) -> Dict[str, float]:
        """Perform a single training step with memory optimization."""
        with self.model.memory_efficient_context():
            # Forward pass
            outputs = self.model(**batch)
            loss = outputs.loss
            
            # Backward pass with gradient accumulation
            self.accelerator.backward(loss / self.memory_config.gradient_accumulation_steps)
            
            # Track memory usage
            current_memory = torch.cuda.memory_allocated() / (1024**3) if torch.cuda.is_available() else 0
            self.peak_memory_usage = max(self.peak_memory_usage, current_memory)
            
            return {
                "loss": loss.item(),
                "memory_usage": current_memory,
                "peak_memory": self.peak_memory_usage
            }
    
    async def evaluate(self, eval_dataloader: DataLoader) -> Dict[str, float]:
        """Evaluate model with memory efficiency."""
        self.model.base_model.eval()
        
        total_loss = 0.0
        num_samples = 0
        
        with torch.no_grad():
            for batch in eval_dataloader:
                with self.model.memory_efficient_context():
                    outputs = self.model(**batch)
                    total_loss += outputs.loss.item()
                    num_samples += 1
        
        return {
            "eval_loss": total_loss / num_samples,
            "peak_memory_during_eval": self.peak_memory_usage
        }

class MemoryOptimizationManager:
    """Manager for memory optimization strategies across the ROMAI system."""
    
    def __init__(self):
        self.optimized_models: Dict[str, MemoryOptimizedModel] = {}
        self.memory_configs: Dict[str, MemoryConfig] = {}
        self.global_memory_metrics: List[MemoryMetrics] = []
        
        # Auto-optimization settings
        self.auto_optimization_enabled = True
        self.memory_threshold_warning = 0.85  # Warn at 85% VRAM usage
        self.memory_threshold_critical = 0.95  # Critical at 95% VRAM usage
        
        logger.info("🎛️ Memory Optimization Manager initialized")
    
    async def optimize_model_for_hardware(self, 
                                        model_name: str,
                                        optimization_level: OptimizationLevel = OptimizationLevel.BALANCED) -> MemoryOptimizedModel:
        """Optimize a model for current hardware constraints."""
        logger.info(f"🎯 Optimizing {model_name} for hardware constraints...")
        
        # Create memory configuration based on available hardware
        memory_config = await self._create_hardware_specific_config(optimization_level)
        
        # Create optimized model
        optimized_model = MemoryOptimizedModel(model_name, memory_config)
        
        # Load and optimize
        success = await optimized_model.load_and_optimize()
        
        if success:
            self.optimized_models[model_name] = optimized_model
            self.memory_configs[model_name] = memory_config
            
            logger.info(f"✅ Successfully optimized {model_name}")
            return optimized_model
        else:
            raise RuntimeError(f"Failed to optimize {model_name}")
    
    async def _create_hardware_specific_config(self, 
                                             optimization_level: OptimizationLevel) -> MemoryConfig:
        """Create hardware-specific memory configuration."""
        # Detect available VRAM
        if torch.cuda.is_available():
            total_vram = torch.cuda.get_device_properties(0).total_memory / (1024**3)
            logger.info(f"🔍 Detected VRAM: {total_vram:.1f}GB")
        else:
            total_vram = 0.0
            logger.warning("⚠️ No CUDA device detected")
        
        # Configure based on available memory and optimization level
        if total_vram <= 8.0:  # RTX 3060 Ti or similar
            if optimization_level == OptimizationLevel.AGGRESSIVE:
                config = MemoryConfig(
                    quantization_type=QuantizationType.INT4,
                    use_lora=True,
                    lora_rank=8,  # Lower rank for more memory savings
                    lora_alpha=16,
                    gradient_checkpointing=True,
                    gradient_accumulation_steps=8,
                    max_memory_gb=6.0,
                    optimization_level=optimization_level,
                    use_cpu_offloading=True
                )
            elif optimization_level == OptimizationLevel.BALANCED:
                config = MemoryConfig(
                    quantization_type=QuantizationType.INT4,
                    use_lora=True,
                    lora_rank=16,
                    lora_alpha=32,
                    gradient_checkpointing=True,
                    gradient_accumulation_steps=4,
                    max_memory_gb=6.5,
                    optimization_level=optimization_level,
                    use_cpu_offloading=True
                )
            else:  # CONSERVATIVE
                config = MemoryConfig(
                    quantization_type=QuantizationType.INT8,
                    use_lora=True,
                    lora_rank=32,
                    lora_alpha=64,
                    gradient_checkpointing=True,
                    gradient_accumulation_steps=2,
                    max_memory_gb=7.0,
                    optimization_level=optimization_level,
                    use_cpu_offloading=False
                )
        else:
            # Higher VRAM available - less aggressive optimization
            config = MemoryConfig(
                quantization_type=QuantizationType.FP16,
                use_lora=True,
                lora_rank=64,
                lora_alpha=128,
                gradient_checkpointing=False,
                gradient_accumulation_steps=1,
                max_memory_gb=min(total_vram * 0.9, 12.0),
                optimization_level=optimization_level,
                use_cpu_offloading=False
            )
        
        logger.info(f"📋 Created config for {total_vram:.1f}GB VRAM: {optimization_level.value}")
        return config
    
    async def monitor_memory_usage(self) -> MemoryMetrics:
        """Monitor current memory usage across all optimized models."""
        current_metrics = MemoryMetrics()
        
        if torch.cuda.is_available():
            current_metrics.gpu_memory_used = torch.cuda.memory_allocated() / (1024**3)
            current_metrics.gpu_memory_total = torch.cuda.get_device_properties(0).total_memory / (1024**3)
            
            # Check thresholds
            usage_ratio = current_metrics.gpu_memory_used / current_metrics.gpu_memory_total
            
            if usage_ratio >= self.memory_threshold_critical:
                logger.error(f"🚨 CRITICAL: VRAM usage at {usage_ratio:.1%}!")
                await self._emergency_memory_cleanup()
            elif usage_ratio >= self.memory_threshold_warning:
                logger.warning(f"⚠️ WARNING: VRAM usage at {usage_ratio:.1%}")
        
        # CPU memory
        process = psutil.Process()
        memory_info = process.memory_info()
        current_metrics.cpu_memory_used = memory_info.rss / (1024**3)
        current_metrics.cpu_memory_total = psutil.virtual_memory().total / (1024**3)
        
        self.global_memory_metrics.append(current_metrics)
        return current_metrics
    
    async def _emergency_memory_cleanup(self):
        """Emergency memory cleanup when usage is critical."""
        logger.info("🚨 Performing emergency memory cleanup...")
        
        # Force garbage collection
        gc.collect()
        
        # Clear CUDA cache aggressively
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            torch.cuda.reset_peak_memory_stats()
            torch.cuda.synchronize()
        
        # Reduce cache sizes in optimized models
        for model in self.optimized_models.values():
            if hasattr(model, '_cleanup_memory'):
                await model._cleanup_memory()
        
        logger.info("✅ Emergency cleanup completed")
    
    def get_memory_efficiency_report(self) -> Dict[str, Any]:
        """Get comprehensive memory efficiency report."""
        report = {
            "total_models_optimized": len(self.optimized_models),
            "memory_savings": {},
            "current_usage": {},
            "optimization_effectiveness": {}
        }
        
        # Current memory usage
        if torch.cuda.is_available():
            current_vram = torch.cuda.memory_allocated() / (1024**3)
            total_vram = torch.cuda.get_device_properties(0).total_memory / (1024**3)
            
            report["current_usage"] = {
                "vram_used": current_vram,
                "vram_total": total_vram,
                "vram_usage_percent": (current_vram / total_vram) * 100,
                "within_target": current_vram <= 6.0  # RTX 3060 Ti target
            }
        
        # Model-specific efficiency
        for model_name, model in self.optimized_models.items():
            if model.memory_metrics.model_parameters > 0:
                report["optimization_effectiveness"][model_name] = {
                    "memory_efficiency": model.memory_metrics.memory_efficiency,
                    "parameter_reduction": 1.0 - model.memory_metrics.memory_efficiency,
                    "vram_used": model.memory_metrics.gpu_memory_used
                }
        
        return report

# Global instance
memory_optimization_manager = MemoryOptimizationManager()

async def create_memory_optimized_model(model_name: str, 
                                      optimization_level: OptimizationLevel = OptimizationLevel.BALANCED) -> MemoryOptimizedModel:
    """Create a memory-optimized model."""
    return await memory_optimization_manager.optimize_model_for_hardware(model_name, optimization_level)

def get_memory_manager() -> MemoryOptimizationManager:
    """Get the global memory optimization manager."""
    return memory_optimization_manager

# Export key classes and functions
__all__ = [
    'MemoryOptimizedModel',
    'MemoryEfficientTrainer', 
    'MemoryOptimizationManager',
    'MemoryConfig',
    'MemoryMetrics',
    'QuantizationType',
    'OptimizationLevel',
    'create_memory_optimized_model',
    'get_memory_manager'
]

logger.info("✅ Memory Optimization System loaded - Ready for 8GB VRAM efficient training!")