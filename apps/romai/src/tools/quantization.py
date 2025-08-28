"""
ROMAI Model Quantization System - RTX 3060 Ti Optimization
=========================================================

Advanced model quantization system specifically designed for RTX 3060 Ti 8GB VRAM.
Implements 4-bit quantization with BitsAndBytesConfig, memory monitoring, and 
intelligent VRAM management to maximize model size while maintaining performance.

Key Features:
- 4-bit quantization with NF4/FP4 support
- Dynamic VRAM monitoring and allocation
- Multiple quantization strategies for different model types
- Memory optimization for <6GB VRAM usage
- Performance benchmarking and validation

Hardware Target: NVIDIA RTX 3060 Ti (8GB VRAM)
Optimization Goal: Maximum model size with <6GB VRAM usage

Author: GitHub Copilot AGI Inspector  
Date: August 27, 2025
Status: Production Implementation
"""

import torch
import gc
import logging
from typing import Dict, Any, Optional, Union, List, Tuple
from dataclasses import dataclass, field
from datetime import datetime
import json
import time
import psutil
import os
from pathlib import Path

# Import quantization libraries
try:
    from transformers import (
        AutoTokenizer, AutoModelForCausalLM, AutoConfig,
        BitsAndBytesConfig, pipeline
    )
    from transformers.models.auto.modeling_auto import MODEL_FOR_CAUSAL_LM_MAPPING
    import bitsandbytes as bnb
    QUANTIZATION_AVAILABLE = True
except ImportError as e:
    QUANTIZATION_AVAILABLE = False
    print(f"Warning: Quantization libraries not available: {e}")

# Configure logging
logger = logging.getLogger(__name__)


@dataclass
class QuantizationConfig:
    """Configuration for model quantization."""
    
    # Quantization method
    load_in_4bit: bool = True
    load_in_8bit: bool = False
    
    # 4-bit specific settings
    bnb_4bit_quant_type: str = "nf4"  # "nf4" or "fp4"
    bnb_4bit_use_double_quant: bool = True  # Nested quantization
    bnb_4bit_compute_dtype: str = "float16"  # Computation dtype
    
    # Memory optimization
    low_cpu_mem_usage: bool = True
    torch_dtype: str = "auto"
    trust_remote_code: bool = False
    
    # Device and memory settings
    device_map: str = "auto"
    max_memory_gb: float = 6.0  # RTX 3060 Ti target
    offload_folder: Optional[str] = None
    
    # Performance settings
    attn_implementation: str = "flash_attention_2"  # Use if available
    
    def to_bits_and_bytes_config(self) -> 'BitsAndBytesConfig':
        """Convert to BitsAndBytesConfig object."""
        if not QUANTIZATION_AVAILABLE:
            raise RuntimeError("BitsAndBytesConfig not available")
        
        compute_dtype = getattr(torch, self.bnb_4bit_compute_dtype)
        
        return BitsAndBytesConfig(
            load_in_4bit=self.load_in_4bit,
            load_in_8bit=self.load_in_8bit,
            bnb_4bit_quant_type=self.bnb_4bit_quant_type,
            bnb_4bit_use_double_quant=self.bnb_4bit_use_double_quant,
            bnb_4bit_compute_dtype=compute_dtype,
        )
    
    def get_model_kwargs(self) -> Dict[str, Any]:
        """Get model loading kwargs."""
        kwargs = {
            'quantization_config': self.to_bits_and_bytes_config(),
            'low_cpu_mem_usage': self.low_cpu_mem_usage,
            'device_map': self.device_map,
            'trust_remote_code': self.trust_remote_code
        }
        
        if self.torch_dtype != "auto":
            kwargs['torch_dtype'] = getattr(torch, self.torch_dtype)
        
        if self.offload_folder:
            kwargs['offload_folder'] = self.offload_folder
        
        # Add flash attention if available
        try:
            kwargs['attn_implementation'] = self.attn_implementation
        except:
            pass  # Flash attention not available
            
        return kwargs


@dataclass 
class MemoryStats:
    """Memory usage statistics."""
    
    gpu_memory_allocated_gb: float = 0.0
    gpu_memory_reserved_gb: float = 0.0
    gpu_memory_free_gb: float = 0.0
    gpu_memory_total_gb: float = 0.0
    cpu_memory_used_gb: float = 0.0
    cpu_memory_total_gb: float = 0.0
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    
    @property
    def gpu_utilization(self) -> float:
        """GPU memory utilization percentage."""
        if self.gpu_memory_total_gb > 0:
            return (self.gpu_memory_allocated_gb / self.gpu_memory_total_gb) * 100
        return 0.0
    
    @property
    def is_within_target(self) -> bool:
        """Check if within 6GB VRAM target."""
        return self.gpu_memory_allocated_gb <= 6.0
    
    def __str__(self) -> str:
        return f"GPU: {self.gpu_memory_allocated_gb:.2f}/{self.gpu_memory_total_gb:.2f}GB ({self.gpu_utilization:.1f}%) | CPU: {self.cpu_memory_used_gb:.2f}GB"


class RTX3060TiMonitor:
    """Memory monitoring specifically for RTX 3060 Ti."""
    
    def __init__(self):
        self.device_name = "Unknown"
        self.total_vram_gb = 0.0
        self.cuda_available = torch.cuda.is_available()
        
        if self.cuda_available:
            self.device_name = torch.cuda.get_device_name(0)
            self.total_vram_gb = torch.cuda.get_device_properties(0).total_memory / (1024**3)
            logger.info(f"Detected GPU: {self.device_name} ({self.total_vram_gb:.2f}GB VRAM)")
        else:
            logger.warning("CUDA not available - GPU monitoring disabled")
    
    def get_memory_stats(self) -> MemoryStats:
        """Get current memory statistics."""
        stats = MemoryStats()
        
        # CPU memory
        cpu_mem = psutil.virtual_memory()
        stats.cpu_memory_used_gb = cpu_mem.used / (1024**3)
        stats.cpu_memory_total_gb = cpu_mem.total / (1024**3)
        
        # GPU memory
        if self.cuda_available:
            stats.gpu_memory_allocated_gb = torch.cuda.memory_allocated(0) / (1024**3)
            stats.gpu_memory_reserved_gb = torch.cuda.memory_reserved(0) / (1024**3)
            stats.gpu_memory_total_gb = self.total_vram_gb
            stats.gpu_memory_free_gb = self.total_vram_gb - stats.gpu_memory_reserved_gb
        
        return stats
    
    def clear_cache(self):
        """Clear GPU memory cache."""
        if self.cuda_available:
            torch.cuda.empty_cache()
            gc.collect()
    
    def is_rtx_3060_ti(self) -> bool:
        """Check if device is RTX 3060 Ti."""
        return "3060 Ti" in self.device_name or "RTX 3060 Ti" in self.device_name


class ModelQuantizer:
    """
    Advanced model quantization system optimized for RTX 3060 Ti.
    
    Provides intelligent model loading with 4-bit quantization, memory monitoring,
    and optimization strategies to maximize model size while staying within VRAM limits.
    """
    
    def __init__(self, target_vram_gb: float = 6.0):
        self.target_vram_gb = target_vram_gb
        self.monitor = RTX3060TiMonitor()
        self.loaded_models: Dict[str, Any] = {}
        self.quantization_history: List[Dict[str, Any]] = []
        
        # Default configurations for different model sizes
        self.config_presets = {
            'small': QuantizationConfig(
                load_in_4bit=True,
                bnb_4bit_quant_type="nf4",
                bnb_4bit_use_double_quant=True,
                max_memory_gb=2.0
            ),
            'medium': QuantizationConfig(
                load_in_4bit=True,
                bnb_4bit_quant_type="nf4", 
                bnb_4bit_use_double_quant=True,
                max_memory_gb=4.0
            ),
            'large': QuantizationConfig(
                load_in_4bit=True,
                bnb_4bit_quant_type="nf4",
                bnb_4bit_use_double_quant=True,
                max_memory_gb=6.0
            ),
            'ultra': QuantizationConfig(
                load_in_4bit=True,
                bnb_4bit_quant_type="fp4",  # More aggressive
                bnb_4bit_use_double_quant=True,
                max_memory_gb=7.5  # Push limits
            )
        }
        
        logger.info(f"ModelQuantizer initialized for RTX 3060 Ti ({target_vram_gb}GB target)")
        
        # Hardware verification
        if self.monitor.is_rtx_3060_ti():
            logger.info("✅ RTX 3060 Ti detected - optimal configuration active")
        else:
            logger.warning(f"⚠️ Non-RTX 3060 Ti device detected: {self.monitor.device_name}")
    
    def estimate_model_memory(self, model_name: str, config_name: str = "large") -> Dict[str, float]:
        """
        Estimate memory usage for a model with quantization.
        
        Args:
            model_name: HuggingFace model name
            config_name: Quantization config preset
            
        Returns:
            Dictionary with memory estimates
        """
        try:
            # Get model config to estimate parameters
            config = AutoConfig.from_pretrained(model_name, trust_remote_code=True)
            
            # Estimate parameters (rough calculation)
            if hasattr(config, 'n_params'):
                num_params = config.n_params
            elif hasattr(config, 'vocab_size') and hasattr(config, 'hidden_size'):
                # Rough estimate for transformer models
                vocab_size = config.vocab_size
                hidden_size = config.hidden_size
                num_layers = getattr(config, 'num_hidden_layers', getattr(config, 'n_layer', 12))
                
                # Approximate parameter count
                embedding_params = vocab_size * hidden_size
                attention_params = num_layers * hidden_size * hidden_size * 4  # Q, K, V, O
                ffn_params = num_layers * hidden_size * hidden_size * 8  # FFN expansion
                num_params = embedding_params + attention_params + ffn_params
            else:
                # Fallback estimate
                num_params = 7_000_000_000  # 7B parameter estimate
            
            # Memory calculations
            # Full precision (FP16): 2 bytes per parameter
            fp16_memory_gb = (num_params * 2) / (1024**3)
            
            # 4-bit quantization: 0.5 bytes per parameter + overhead
            int4_memory_gb = (num_params * 0.5) / (1024**3) * 1.2  # 20% overhead
            
            # 8-bit quantization: 1 byte per parameter + overhead  
            int8_memory_gb = (num_params * 1.0) / (1024**3) * 1.1  # 10% overhead
            
            return {
                'estimated_parameters': num_params,
                'fp16_memory_gb': fp16_memory_gb,
                'int8_memory_gb': int8_memory_gb,
                'int4_memory_gb': int4_memory_gb,
                'recommended_config': 'large' if int4_memory_gb <= 6.0 else 'ultra',
                'fits_in_target': int4_memory_gb <= self.target_vram_gb
            }
            
        except Exception as e:
            logger.error(f"Memory estimation failed for {model_name}: {e}")
            return {
                'estimated_parameters': 0,
                'fp16_memory_gb': 8.0,  # Conservative estimate
                'int8_memory_gb': 4.0,
                'int4_memory_gb': 2.0,
                'recommended_config': 'medium',
                'fits_in_target': True
            }
    
    def load_quantized_model(
        self, 
        model_name: str,
        config_name: str = "large",
        custom_config: Optional[QuantizationConfig] = None
    ) -> Tuple[Any, Any, MemoryStats]:
        """
        Load a model with quantization optimized for RTX 3060 Ti.
        
        Args:
            model_name: HuggingFace model name
            config_name: Preset configuration name
            custom_config: Custom quantization configuration
            
        Returns:
            Tuple of (model, tokenizer, memory_stats)
        """
        if not QUANTIZATION_AVAILABLE:
            raise RuntimeError("Quantization libraries not available")
        
        # Clear cache before loading
        self.monitor.clear_cache()
        initial_stats = self.monitor.get_memory_stats()
        
        # Get quantization config
        if custom_config:
            config = custom_config
        else:
            config = self.config_presets.get(config_name, self.config_presets['large'])
        
        # Memory estimation
        memory_estimate = self.estimate_model_memory(model_name, config_name)
        logger.info(f"Memory estimate for {model_name}: {memory_estimate['int4_memory_gb']:.2f}GB (4-bit)")
        
        if not memory_estimate['fits_in_target']:
            logger.warning(f"Model may exceed {self.target_vram_gb}GB VRAM target")
        
        try:
            logger.info(f"Loading {model_name} with {config_name} quantization...")
            start_time = time.time()
            
            # Load tokenizer
            tokenizer = AutoTokenizer.from_pretrained(
                model_name,
                trust_remote_code=config.trust_remote_code
            )
            
            # Ensure pad token exists
            if tokenizer.pad_token is None:
                tokenizer.pad_token = tokenizer.eos_token
            
            # Load model with quantization
            model_kwargs = config.get_model_kwargs()
            logger.info(f"Model loading kwargs: {model_kwargs}")
            
            model = AutoModelForCausalLM.from_pretrained(
                model_name,
                **model_kwargs
            )
            
            load_time = time.time() - start_time
            final_stats = self.monitor.get_memory_stats()
            
            # Store model reference
            model_key = f"{model_name}_{config_name}"
            self.loaded_models[model_key] = {
                'model': model,
                'tokenizer': tokenizer,
                'config': config,
                'load_time': load_time,
                'memory_stats': final_stats
            }
            
            # Record quantization history
            self.quantization_history.append({
                'model_name': model_name,
                'config_name': config_name,
                'load_time': load_time,
                'memory_used_gb': final_stats.gpu_memory_allocated_gb,
                'success': True,
                'timestamp': datetime.now().isoformat()
            })
            
            logger.info(f"✅ Model loaded successfully in {load_time:.2f}s")
            logger.info(f"📊 Memory usage: {final_stats}")
            logger.info(f"🎯 Within target: {'YES' if final_stats.is_within_target else 'NO'}")
            
            return model, tokenizer, final_stats
            
        except Exception as e:
            # Record failure
            self.quantization_history.append({
                'model_name': model_name,
                'config_name': config_name,
                'load_time': 0,
                'memory_used_gb': 0,
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            })
            
            logger.error(f"❌ Model loading failed: {e}")
            raise
    
    def optimize_for_inference(self, model: Any) -> Any:
        """Optimize model for inference performance."""
        try:
            logger.info("Optimizing model for inference...")
            
            # Enable eval mode
            model.eval()
            
            # Compile with torch.compile if available (PyTorch 2.0+)
            if hasattr(torch, 'compile') and torch.cuda.is_available():
                try:
                    logger.info("Applying torch.compile optimization...")
                    model = torch.compile(model, mode="reduce-overhead")
                    logger.info("✅ torch.compile optimization applied")
                except Exception as e:
                    logger.warning(f"torch.compile failed: {e}")
            
            # Set memory format for better performance
            if hasattr(model, 'to'):
                try:
                    model = model.to(memory_format=torch.channels_last)
                except:
                    pass  # Not all models support channels_last
            
            return model
            
        except Exception as e:
            logger.warning(f"Inference optimization failed: {e}")
            return model
    
    def benchmark_inference(
        self, 
        model: Any, 
        tokenizer: Any, 
        test_prompt: str = "The future of artificial intelligence is",
        max_length: int = 50,
        num_iterations: int = 5
    ) -> Dict[str, Any]:
        """
        Benchmark inference performance.
        
        Args:
            model: Loaded model
            tokenizer: Model tokenizer
            test_prompt: Test prompt for generation
            max_length: Maximum generation length
            num_iterations: Number of benchmark iterations
            
        Returns:
            Benchmark results dictionary
        """
        try:
            logger.info(f"Running inference benchmark ({num_iterations} iterations)...")
            
            # Prepare inputs
            inputs = tokenizer.encode(test_prompt, return_tensors="pt")
            if torch.cuda.is_available():
                inputs = inputs.cuda()
            
            # Warm-up run
            with torch.no_grad():
                _ = model.generate(
                    inputs,
                    max_length=max_length,
                    do_sample=True,
                    temperature=0.7,
                    pad_token_id=tokenizer.eos_token_id
                )
            
            # Benchmark runs
            times = []
            memory_usage = []
            
            for i in range(num_iterations):
                start_stats = self.monitor.get_memory_stats()
                start_time = time.time()
                
                with torch.no_grad():
                    outputs = model.generate(
                        inputs,
                        max_length=max_length,
                        do_sample=True,
                        temperature=0.7,
                        pad_token_id=tokenizer.eos_token_id
                    )
                
                end_time = time.time()
                end_stats = self.monitor.get_memory_stats()
                
                generation_time = end_time - start_time
                times.append(generation_time)
                memory_usage.append(end_stats.gpu_memory_allocated_gb)
                
                # Decode output for first iteration
                if i == 0:
                    generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
                    logger.info(f"Sample output: {generated_text[:100]}...")
            
            # Calculate statistics
            avg_time = sum(times) / len(times)
            min_time = min(times)
            max_time = max(times)
            tokens_per_second = (max_length - len(inputs[0])) / avg_time
            avg_memory = sum(memory_usage) / len(memory_usage)
            
            results = {
                'average_time_s': avg_time,
                'min_time_s': min_time,
                'max_time_s': max_time,
                'tokens_per_second': tokens_per_second,
                'average_memory_gb': avg_memory,
                'iterations': num_iterations,
                'test_prompt': test_prompt,
                'max_length': max_length
            }
            
            logger.info(f"📊 Benchmark Results:")
            logger.info(f"  Average time: {avg_time:.2f}s")
            logger.info(f"  Tokens/sec: {tokens_per_second:.2f}")
            logger.info(f"  Memory: {avg_memory:.2f}GB")
            
            return results
            
        except Exception as e:
            logger.error(f"Benchmark failed: {e}")
            return {'error': str(e)}
    
    def get_quantization_report(self) -> Dict[str, Any]:
        """Get comprehensive quantization report."""
        current_stats = self.monitor.get_memory_stats()
        
        return {
            'hardware_info': {
                'device_name': self.monitor.device_name,
                'total_vram_gb': self.monitor.total_vram_gb,
                'is_rtx_3060_ti': self.monitor.is_rtx_3060_ti(),
                'cuda_available': self.monitor.cuda_available
            },
            'current_memory': current_stats.__dict__,
            'loaded_models': list(self.loaded_models.keys()),
            'quantization_history': self.quantization_history,
            'config_presets': {k: v.__dict__ for k, v in self.config_presets.items()},
            'target_vram_gb': self.target_vram_gb
        }
    
    def unload_model(self, model_key: str):
        """Unload a model to free memory."""
        if model_key in self.loaded_models:
            del self.loaded_models[model_key]
            self.monitor.clear_cache()
            logger.info(f"Model {model_key} unloaded")
        else:
            logger.warning(f"Model {model_key} not found")
    
    def clear_all_models(self):
        """Clear all loaded models."""
        self.loaded_models.clear()
        self.monitor.clear_cache()
        logger.info("All models cleared")


# Example usage and testing
async def main():
    """Test the quantization system."""
    print("🧠 ROMAI Model Quantization System Test")
    print("=" * 50)
    
    # Initialize quantizer
    quantizer = ModelQuantizer(target_vram_gb=6.0)
    
    # Get initial report
    print("\n1. Hardware Report:")
    report = quantizer.get_quantization_report()
    print(f"Device: {report['hardware_info']['device_name']}")
    print(f"VRAM: {report['hardware_info']['total_vram_gb']:.2f}GB")
    print(f"RTX 3060 Ti: {report['hardware_info']['is_rtx_3060_ti']}")
    
    # Memory estimation test
    print("\n2. Memory Estimation Test:")
    test_models = ["microsoft/DialoGPT-medium", "gpt2"]
    
    for model_name in test_models:
        try:
            estimate = quantizer.estimate_model_memory(model_name)
            print(f"\nModel: {model_name}")
            print(f"  Parameters: {estimate['estimated_parameters']:,}")
            print(f"  4-bit memory: {estimate['int4_memory_gb']:.2f}GB")
            print(f"  Fits in target: {estimate['fits_in_target']}")
        except Exception as e:
            print(f"  Estimation failed: {e}")
    
    # Test small model loading (if libraries available)
    if QUANTIZATION_AVAILABLE:
        print("\n3. Model Loading Test:")
        try:
            model, tokenizer, stats = quantizer.load_quantized_model("gpt2", "small")
            print(f"✅ Model loaded successfully")
            print(f"Memory usage: {stats}")
            
            # Quick inference test
            print("\n4. Inference Test:")
            benchmark = quantizer.benchmark_inference(
                model, tokenizer, 
                test_prompt="Hello, this is a test of",
                max_length=20,
                num_iterations=2
            )
            print(f"Benchmark results: {benchmark}")
            
            # Cleanup
            quantizer.clear_all_models()
            
        except Exception as e:
            print(f"❌ Model loading test failed: {e}")
    else:
        print("\n3. Quantization libraries not available - skipping model tests")
    
    # Final report
    print("\n5. Final Report:")
    final_report = quantizer.get_quantization_report()
    print(json.dumps(final_report, indent=2, default=str))


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())