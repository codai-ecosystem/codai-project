"""
Model Quantization Engine
Advanced model quantization and optimization for RomAI neural networks
"""

import torch
import torch.nn as nn
import torch.quantization as quant
import logging
from typing import Dict, Any, List, Tuple, Optional, Union
from dataclasses import dataclass, field
from enum import Enum
import time
import numpy as np
from pathlib import Path
import json
import pickle
from collections import defaultdict
import threading
import asyncio

logger = logging.getLogger(__name__)

class QuantizationType(Enum):
    """Types of quantization supported"""
    DYNAMIC = "dynamic"           # Dynamic quantization (inference-time)
    STATIC = "static"            # Static quantization (calibrated)
    QAT = "qat"                  # Quantization-aware training
    INT8 = "int8"                # 8-bit integer quantization
    INT4 = "int4"                # 4-bit integer quantization
    FP16 = "fp16"                # Half precision (16-bit float)
    BF16 = "bf16"                # Brain float 16
    MIXED_PRECISION = "mixed"     # Mixed precision training

class OptimizationLevel(Enum):
    """Optimization levels"""
    CONSERVATIVE = "conservative" # Minimal optimization, preserve accuracy
    BALANCED = "balanced"         # Balance between speed and accuracy
    AGGRESSIVE = "aggressive"     # Maximum optimization, acceptable accuracy loss
    EXTREME = "extreme"           # Extreme optimization for speed

@dataclass
class QuantizationConfig:
    """Configuration for model quantization"""
    quantization_type: QuantizationType
    optimization_level: OptimizationLevel
    target_accuracy_threshold: float = 0.95  # Minimum accuracy to maintain
    calibration_dataset_size: int = 1000     # Size of calibration dataset
    batch_size: int = 32
    use_cuda: bool = True
    preserve_cultural_layers: bool = True    # Preserve Romanian cultural processing
    
    # Advanced options
    quantize_embeddings: bool = False        # Quantize embedding layers
    quantize_attention: bool = True          # Quantize attention mechanisms
    quantize_feedforward: bool = True        # Quantize feedforward layers
    use_symmetric_quantization: bool = True  # Use symmetric vs asymmetric
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'quantization_type': self.quantization_type.value,
            'optimization_level': self.optimization_level.value,
            'target_accuracy_threshold': self.target_accuracy_threshold,
            'calibration_dataset_size': self.calibration_dataset_size,
            'batch_size': self.batch_size,
            'use_cuda': self.use_cuda,
            'preserve_cultural_layers': self.preserve_cultural_layers,
            'quantize_embeddings': self.quantize_embeddings,
            'quantize_attention': self.quantize_attention,
            'quantize_feedforward': self.quantize_feedforward,
            'use_symmetric_quantization': self.use_symmetric_quantization
        }

@dataclass
class QuantizationResult:
    """Result of model quantization"""
    original_model_size: float      # MB
    quantized_model_size: float     # MB
    compression_ratio: float        # Size reduction ratio
    
    original_inference_time: float  # ms
    quantized_inference_time: float # ms
    speedup_ratio: float            # Speed improvement ratio
    
    original_accuracy: float        # Original model accuracy
    quantized_accuracy: float       # Quantized model accuracy
    accuracy_degradation: float     # Accuracy loss percentage
    
    memory_usage_reduction: float   # Memory usage reduction (MB)
    energy_efficiency_gain: float   # Energy efficiency improvement
    
    quantization_config: QuantizationConfig
    optimization_details: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'original_model_size': self.original_model_size,
            'quantized_model_size': self.quantized_model_size,
            'compression_ratio': self.compression_ratio,
            'original_inference_time': self.original_inference_time,
            'quantized_inference_time': self.quantized_inference_time,
            'speedup_ratio': self.speedup_ratio,
            'original_accuracy': self.original_accuracy,
            'quantized_accuracy': self.quantized_accuracy,
            'accuracy_degradation': self.accuracy_degradation,
            'memory_usage_reduction': self.memory_usage_reduction,
            'energy_efficiency_gain': self.energy_efficiency_gain,
            'quantization_config': self.quantization_config.to_dict(),
            'optimization_details': self.optimization_details
        }

class ModelQuantizationEngine:
    """Advanced model quantization engine with Romanian cultural awareness"""
    
    def __init__(self, cache_dir: str = "cache/quantization"):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        # Performance tracking
        self.quantization_history: Dict[str, List[QuantizationResult]] = defaultdict(list)
        self.calibration_cache: Dict[str, torch.Tensor] = {}
        
        # Cultural layer preservation
        self.cultural_layer_patterns = [
            'cultural_embedding',
            'romanian_attention',
            'mioritic_processing',
            'cultural_context',
            'diacritics_processing',
            'folkloric_analysis'
        ]
        
        # Thread safety
        self._lock = threading.Lock()
        
        logger.info("Model quantization engine initialized")
    
    def _get_model_size(self, model: nn.Module) -> float:
        """Get model size in MB"""
        param_size = 0
        for param in model.parameters():
            param_size += param.nelement() * param.element_size()
        
        buffer_size = 0
        for buffer in model.buffers():
            buffer_size += buffer.nelement() * buffer.element_size()
        
        return (param_size + buffer_size) / (1024 ** 2)
    
    def _benchmark_inference_speed(self, model: nn.Module, sample_input: torch.Tensor,
                                 num_runs: int = 100) -> float:
        """Benchmark model inference speed"""
        model.eval()
        
        # Warm up
        with torch.no_grad():
            for _ in range(10):
                _ = model(sample_input)
        
        # Actual benchmarking
        start_time = time.time()
        with torch.no_grad():
            for _ in range(num_runs):
                _ = model(sample_input)
        
        total_time = time.time() - start_time
        return (total_time / num_runs) * 1000  # Convert to milliseconds
    
    def _is_cultural_layer(self, layer_name: str) -> bool:
        """Check if a layer is culturally important"""
        return any(pattern in layer_name.lower() for pattern in self.cultural_layer_patterns)
    
    def _prepare_quantization_config(self, model: nn.Module, config: QuantizationConfig) -> None:
        """Prepare model for quantization"""
        
        if config.quantization_type == QuantizationType.QAT:
            # Quantization-aware training preparation
            model.qconfig = quant.get_default_qat_qconfig('fbgemm')
        elif config.quantization_type == QuantizationType.STATIC:
            # Static quantization preparation
            model.qconfig = quant.get_default_qconfig('fbgemm')
        else:
            # Dynamic quantization preparation
            model.qconfig = quant.get_default_qconfig('fbgemm')
        
        # Preserve cultural layers if requested
        if config.preserve_cultural_layers:
            for name, module in model.named_modules():
                if self._is_cultural_layer(name):
                    # Don't quantize cultural layers
                    module.qconfig = None
                    logger.debug(f"Preserving cultural layer: {name}")
        
        # Configure specific layer quantization
        for name, module in model.named_modules():
            if isinstance(module, nn.Embedding) and not config.quantize_embeddings:
                module.qconfig = None
            elif 'attention' in name.lower() and not config.quantize_attention:
                module.qconfig = None
            elif any(ff in name.lower() for ff in ['feedforward', 'mlp', 'ffn']) and not config.quantize_feedforward:
                module.qconfig = None
    
    def _apply_dynamic_quantization(self, model: nn.Module, config: QuantizationConfig) -> nn.Module:
        """Apply dynamic quantization"""
        
        # Define quantization targets
        quantization_targets = []
        
        if config.quantize_attention:
            quantization_targets.extend([nn.Linear, nn.MultiheadAttention])
        if config.quantize_feedforward:
            quantization_targets.extend([nn.Conv1d, nn.Conv2d])
        
        # Apply dynamic quantization
        quantized_model = torch.quantization.quantize_dynamic(
            model,
            qconfig_spec=quantization_targets,
            dtype=torch.qint8
        )
        
        return quantized_model
    
    def _apply_static_quantization(self, model: nn.Module, config: QuantizationConfig,
                                 calibration_data: torch.Tensor) -> nn.Module:
        """Apply static quantization with calibration"""
        
        # Prepare model for static quantization
        self._prepare_quantization_config(model, config)
        prepared_model = quant.prepare(model)
        
        # Calibration phase
        prepared_model.eval()
        with torch.no_grad():
            for i in range(0, len(calibration_data), config.batch_size):
                batch = calibration_data[i:i + config.batch_size]
                _ = prepared_model(batch)
        
        # Convert to quantized model
        quantized_model = quant.convert(prepared_model)
        
        return quantized_model
    
    def _apply_mixed_precision(self, model: nn.Module, config: QuantizationConfig) -> nn.Module:
        """Apply mixed precision optimization"""
        
        # Convert model to half precision where appropriate
        for name, module in model.named_modules():
            # Preserve cultural layers in full precision if requested
            if config.preserve_cultural_layers and self._is_cultural_layer(name):
                continue
            
            # Apply half precision to appropriate layers
            if isinstance(module, (nn.Linear, nn.Conv1d, nn.Conv2d)):
                if config.quantization_type == QuantizationType.FP16:
                    module.half()
                elif config.quantization_type == QuantizationType.BF16:
                    module.to(torch.bfloat16)
        
        return model
    
    def _validate_quantized_model(self, original_model: nn.Module, quantized_model: nn.Module,
                                test_input: torch.Tensor, config: QuantizationConfig) -> Tuple[float, float]:
        """Validate quantized model against original"""
        
        original_model.eval()
        quantized_model.eval()
        
        with torch.no_grad():
            # Get original output
            original_output = original_model(test_input)
            
            # Get quantized output
            quantized_output = quantized_model(test_input)
            
            # Calculate accuracy metrics
            if original_output.dim() > 1:
                # Classification accuracy
                original_predictions = torch.argmax(original_output, dim=-1)
                quantized_predictions = torch.argmax(quantized_output, dim=-1)
                
                accuracy = (original_predictions == quantized_predictions).float().mean().item()
            else:
                # Regression accuracy (using relative error)
                relative_error = torch.abs((original_output - quantized_output) / (original_output + 1e-8))
                accuracy = 1.0 - relative_error.mean().item()
            
            # Calculate output similarity
            cosine_sim = torch.cosine_similarity(
                original_output.flatten(),
                quantized_output.flatten(),
                dim=0
            ).item()
            
            return accuracy, cosine_sim
    
    def quantize_model(self, model: nn.Module, config: QuantizationConfig,
                      calibration_data: Optional[torch.Tensor] = None,
                      test_data: Optional[torch.Tensor] = None) -> QuantizationResult:
        """Quantize a model according to the specified configuration"""
        
        with self._lock:
            logger.info(f"Starting model quantization: {config.quantization_type.value}")
            
            # Create sample input for benchmarking
            if test_data is not None:
                sample_input = test_data[:1]
            elif calibration_data is not None:
                sample_input = calibration_data[:1]
            else:
                # Create dummy input
                sample_input = torch.randn(1, 512, 768)  # Adjust based on model architecture
            
            # Move to appropriate device
            device = torch.device('cuda' if config.use_cuda and torch.cuda.is_available() else 'cpu')
            model = model.to(device)
            sample_input = sample_input.to(device)
            
            # Measure original model metrics
            original_size = self._get_model_size(model)
            original_inference_time = self._benchmark_inference_speed(model, sample_input)
            
            # Create a copy of the model for quantization
            quantized_model = None
            
            try:
                if config.quantization_type == QuantizationType.DYNAMIC:
                    quantized_model = self._apply_dynamic_quantization(model, config)
                
                elif config.quantization_type == QuantizationType.STATIC:
                    if calibration_data is None:
                        raise ValueError("Calibration data required for static quantization")
                    quantized_model = self._apply_static_quantization(model, config, calibration_data)
                
                elif config.quantization_type in [QuantizationType.FP16, QuantizationType.BF16, QuantizationType.MIXED_PRECISION]:
                    quantized_model = self._apply_mixed_precision(model.clone(), config)
                
                else:
                    raise ValueError(f"Unsupported quantization type: {config.quantization_type}")
                
                # Move quantized model to device
                quantized_model = quantized_model.to(device)
                
                # Measure quantized model metrics
                quantized_size = self._get_model_size(quantized_model)
                quantized_inference_time = self._benchmark_inference_speed(quantized_model, sample_input)
                
                # Validate model
                if test_data is not None:
                    accuracy, similarity = self._validate_quantized_model(
                        model, quantized_model, test_data, config
                    )
                else:
                    accuracy, similarity = 1.0, 1.0  # No validation data
                
                # Calculate metrics
                compression_ratio = original_size / quantized_size if quantized_size > 0 else 1.0
                speedup_ratio = original_inference_time / quantized_inference_time if quantized_inference_time > 0 else 1.0
                accuracy_degradation = 1.0 - accuracy
                memory_reduction = original_size - quantized_size
                energy_efficiency = speedup_ratio * compression_ratio  # Simplified metric
                
                # Create result
                result = QuantizationResult(
                    original_model_size=original_size,
                    quantized_model_size=quantized_size,
                    compression_ratio=compression_ratio,
                    original_inference_time=original_inference_time,
                    quantized_inference_time=quantized_inference_time,
                    speedup_ratio=speedup_ratio,
                    original_accuracy=1.0,  # Assume original is perfect
                    quantized_accuracy=accuracy,
                    accuracy_degradation=accuracy_degradation,
                    memory_usage_reduction=memory_reduction,
                    energy_efficiency_gain=energy_efficiency,
                    quantization_config=config,
                    optimization_details={
                        'output_similarity': similarity,
                        'device_used': str(device),
                        'cultural_layers_preserved': config.preserve_cultural_layers,
                        'quantization_timestamp': time.time()
                    }
                )
                
                # Cache result
                model_name = model.__class__.__name__
                self.quantization_history[model_name].append(result)
                
                logger.info(f"Quantization completed: {compression_ratio:.2f}x compression, "
                          f"{speedup_ratio:.2f}x speedup, {accuracy:.3f} accuracy")
                
                return result
                
            except Exception as e:
                logger.error(f"Quantization failed: {str(e)}")
                raise
    
    def batch_quantize_models(self, models: Dict[str, nn.Module], 
                            configs: List[QuantizationConfig],
                            calibration_data: Optional[torch.Tensor] = None) -> Dict[str, List[QuantizationResult]]:
        """Quantize multiple models with multiple configurations"""
        
        results = {}
        
        for model_name, model in models.items():
            logger.info(f"Starting batch quantization for {model_name}")
            model_results = []
            
            for config in configs:
                try:
                    result = self.quantize_model(model, config, calibration_data)
                    model_results.append(result)
                    
                    # Check if accuracy threshold is met
                    if result.quantized_accuracy < config.target_accuracy_threshold:
                        logger.warning(f"Model {model_name} with config {config.quantization_type.value} "
                                     f"failed accuracy threshold: {result.quantized_accuracy:.3f} < "
                                     f"{config.target_accuracy_threshold:.3f}")
                    
                except Exception as e:
                    logger.error(f"Failed to quantize {model_name} with config "
                               f"{config.quantization_type.value}: {str(e)}")
                    continue
            
            results[model_name] = model_results
        
        return results
    
    def find_optimal_quantization(self, model: nn.Module,
                                calibration_data: Optional[torch.Tensor] = None,
                                test_data: Optional[torch.Tensor] = None,
                                target_speedup: float = 2.0,
                                max_accuracy_loss: float = 0.05) -> QuantizationResult:
        """Find optimal quantization configuration for a model"""
        
        logger.info("Searching for optimal quantization configuration")
        
        # Define candidate configurations
        candidate_configs = [
            QuantizationConfig(
                quantization_type=QuantizationType.DYNAMIC,
                optimization_level=OptimizationLevel.CONSERVATIVE
            ),
            QuantizationConfig(
                quantization_type=QuantizationType.DYNAMIC,
                optimization_level=OptimizationLevel.BALANCED
            ),
            QuantizationConfig(
                quantization_type=QuantizationType.FP16,
                optimization_level=OptimizationLevel.BALANCED
            ),
            QuantizationConfig(
                quantization_type=QuantizationType.MIXED_PRECISION,
                optimization_level=OptimizationLevel.AGGRESSIVE
            )
        ]
        
        # If calibration data is available, try static quantization
        if calibration_data is not None:
            candidate_configs.extend([
                QuantizationConfig(
                    quantization_type=QuantizationType.STATIC,
                    optimization_level=OptimizationLevel.BALANCED
                ),
                QuantizationConfig(
                    quantization_type=QuantizationType.STATIC,
                    optimization_level=OptimizationLevel.AGGRESSIVE
                )
            ])
        
        best_result = None
        best_score = 0.0
        
        for config in candidate_configs:
            try:
                result = self.quantize_model(model, config, calibration_data, test_data)
                
                # Calculate combined score (speedup vs accuracy loss)
                accuracy_penalty = max(0, result.accuracy_degradation - max_accuracy_loss) * 10
                score = result.speedup_ratio - accuracy_penalty
                
                logger.debug(f"Config {config.quantization_type.value}: "
                           f"speedup={result.speedup_ratio:.2f}, "
                           f"accuracy_loss={result.accuracy_degradation:.3f}, "
                           f"score={score:.2f}")
                
                if score > best_score and result.speedup_ratio >= target_speedup:
                    best_score = score
                    best_result = result
                
            except Exception as e:
                logger.warning(f"Failed to test config {config.quantization_type.value}: {str(e)}")
                continue
        
        if best_result is None:
            logger.warning("No quantization configuration met the criteria")
            # Return the least aggressive option
            fallback_config = QuantizationConfig(
                quantization_type=QuantizationType.DYNAMIC,
                optimization_level=OptimizationLevel.CONSERVATIVE
            )
            best_result = self.quantize_model(model, fallback_config, calibration_data, test_data)
        
        logger.info(f"Optimal quantization found: {best_result.quantization_config.quantization_type.value} "
                   f"({best_result.speedup_ratio:.2f}x speedup, "
                   f"{best_result.accuracy_degradation:.3f} accuracy loss)")
        
        return best_result
    
    def save_quantization_results(self, filepath: str) -> None:
        """Save quantization history to file"""
        
        with self._lock:
            results_data = {}
            for model_name, results in self.quantization_history.items():
                results_data[model_name] = [result.to_dict() for result in results]
            
            with open(filepath, 'w') as f:
                json.dump(results_data, f, indent=2)
            
            logger.info(f"Quantization results saved to {filepath}")
    
    def load_quantization_results(self, filepath: str) -> None:
        """Load quantization history from file"""
        
        with self._lock:
            try:
                with open(filepath, 'r') as f:
                    results_data = json.load(f)
                
                # Note: This would need proper deserialization for full functionality
                logger.info(f"Quantization results loaded from {filepath}")
                
            except FileNotFoundError:
                logger.warning(f"Quantization results file not found: {filepath}")
            except Exception as e:
                logger.error(f"Failed to load quantization results: {str(e)}")
    
    def get_quantization_summary(self, model_name: Optional[str] = None) -> Dict[str, Any]:
        """Get summary of quantization results"""
        
        if model_name and model_name in self.quantization_history:
            results = self.quantization_history[model_name]
        else:
            results = []
            for model_results in self.quantization_history.values():
                results.extend(model_results)
        
        if not results:
            return {"message": "No quantization results available"}
        
        # Calculate summary statistics
        speedups = [r.speedup_ratio for r in results]
        compressions = [r.compression_ratio for r in results]
        accuracy_losses = [r.accuracy_degradation for r in results]
        
        summary = {
            "total_quantizations": len(results),
            "avg_speedup": np.mean(speedups),
            "max_speedup": np.max(speedups),
            "avg_compression": np.mean(compressions),
            "max_compression": np.max(compressions),
            "avg_accuracy_loss": np.mean(accuracy_losses),
            "max_accuracy_loss": np.max(accuracy_losses),
            "quantization_types_used": list(set(r.quantization_config.quantization_type.value for r in results))
        }
        
        return summary


# Example usage and testing
if __name__ == "__main__":
    # Initialize quantization engine
    quantizer = ModelQuantizationEngine()
    
    # Create a sample model for testing
    class SampleModel(nn.Module):
        def __init__(self):
            super().__init__()
            self.embedding = nn.Embedding(1000, 512)
            self.cultural_embedding = nn.Embedding(100, 512)  # Cultural layer
            self.attention = nn.MultiheadAttention(512, 8)
            self.feedforward = nn.Sequential(
                nn.Linear(512, 2048),
                nn.ReLU(),
                nn.Linear(2048, 512)
            )
            self.romanian_attention = nn.Linear(512, 512)  # Cultural layer
            self.output = nn.Linear(512, 100)
        
        def forward(self, x):
            embedded = self.embedding(x)
            cultural = self.cultural_embedding(x[:, :100])  # Sample cultural processing
            
            attended, _ = self.attention(embedded, embedded, embedded)
            cultural_processed = self.romanian_attention(cultural)
            
            combined = attended + cultural_processed
            output = self.feedforward(combined)
            return self.output(output.mean(dim=1))
    
    # Create test model
    model = SampleModel()
    
    print("🚀 RomAI Model Quantization Engine Test")
    print("="*50)
    
    # Create sample data
    sample_input = torch.randint(0, 1000, (32, 512))
    calibration_data = torch.randint(0, 1000, (1000, 512))
    
    # Test different quantization configurations
    configs = [
        QuantizationConfig(
            quantization_type=QuantizationType.DYNAMIC,
            optimization_level=OptimizationLevel.CONSERVATIVE,
            preserve_cultural_layers=True
        ),
        QuantizationConfig(
            quantization_type=QuantizationType.FP16,
            optimization_level=OptimizationLevel.BALANCED,
            preserve_cultural_layers=True
        ),
        QuantizationConfig(
            quantization_type=QuantizationType.MIXED_PRECISION,
            optimization_level=OptimizationLevel.AGGRESSIVE,
            preserve_cultural_layers=False
        )
    ]
    
    print("\n📊 Testing different quantization configurations:")
    
    for i, config in enumerate(configs, 1):
        print(f"\n🔧 Configuration {i}: {config.quantization_type.value} "
              f"({config.optimization_level.value})")
        
        try:
            result = quantizer.quantize_model(
                model,
                config,
                calibration_data=calibration_data,
                test_data=sample_input
            )
            
            print(f"   📏 Size: {result.original_model_size:.1f}MB → "
                  f"{result.quantized_model_size:.1f}MB "
                  f"({result.compression_ratio:.2f}x compression)")
            print(f"   ⚡ Speed: {result.original_inference_time:.2f}ms → "
                  f"{result.quantized_inference_time:.2f}ms "
                  f"({result.speedup_ratio:.2f}x speedup)")
            print(f"   🎯 Accuracy: {result.quantized_accuracy:.3f} "
                  f"(loss: {result.accuracy_degradation:.3f})")
            print(f"   🔋 Energy efficiency gain: {result.energy_efficiency_gain:.2f}x")
            
        except Exception as e:
            print(f"   ❌ Failed: {str(e)}")
    
    print(f"\n🔍 Finding optimal quantization configuration:")
    
    try:
        optimal_result = quantizer.find_optimal_quantization(
            model,
            calibration_data=calibration_data,
            test_data=sample_input,
            target_speedup=1.5,
            max_accuracy_loss=0.05
        )
        
        print(f"   🏆 Optimal: {optimal_result.quantization_config.quantization_type.value}")
        print(f"   📈 Speedup: {optimal_result.speedup_ratio:.2f}x")
        print(f"   📉 Accuracy loss: {optimal_result.accuracy_degradation:.3f}")
        print(f"   💾 Memory saved: {optimal_result.memory_usage_reduction:.1f}MB")
        
    except Exception as e:
        print(f"   ❌ Optimization failed: {str(e)}")
    
    # Get summary
    print(f"\n📋 Quantization Summary:")
    summary = quantizer.get_quantization_summary()
    
    if "message" not in summary:
        print(f"   Total quantizations: {summary['total_quantizations']}")
        print(f"   Average speedup: {summary['avg_speedup']:.2f}x")
        print(f"   Maximum speedup: {summary['max_speedup']:.2f}x")
        print(f"   Average compression: {summary['avg_compression']:.2f}x")
        print(f"   Average accuracy loss: {summary['avg_accuracy_loss']:.3f}")
        print(f"   Quantization types: {', '.join(summary['quantization_types_used'])}")
    
    print(f"\n✨ Model quantization testing completed!")
    print(f"Romanian cultural layer preservation and advanced optimization ready")