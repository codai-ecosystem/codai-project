#!/usr/bin/env python3
"""
RomAI AGI Day 8 - GPU-Optimized Model Downloader and Optimizer
Downloads and optimizes models for GPU acceleration with quantization
"""

import os
import sys
import argparse
import asyncio
import time
from typing import List, Dict, Any
from pathlib import Path

import torch
import torch.nn as nn
from transformers import (
    AutoTokenizer, AutoModel, AutoModelForCausalLM,
    BitsAndBytesConfig, pipeline
)
from optimum.onnxruntime import ORTModelForCausalLM, ORTModelForSequenceClassification
import gc

class GPUModelOptimizer:
    """GPU-optimized model downloader and optimizer for Day 8"""
    
    def __init__(self, cache_dir: str = "/app/cache"):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        # Model configurations for Romanian AGI
        self.models_config = {
            "romanian_bert": {
                "model_name": "readerbench/RoBERT-base",
                "task": "feature-extraction",
                "optimize_gpu": True,
                "quantize": True,
                "max_length": 512
            },
            "dialogue_model": {
                "model_name": "microsoft/DialoGPT-medium",
                "task": "text-generation",
                "optimize_gpu": True,
                "quantize": True,
                "max_length": 1024
            },
            "sentence_transformer": {
                "model_name": "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
                "task": "sentence-similarity",
                "optimize_gpu": True,
                "quantize": False,  # Sentence transformers work better without quantization
                "max_length": 128
            }
        }
        
        # GPU optimization settings
        self.gpu_available = torch.cuda.is_available()
        self.device = "cuda" if self.gpu_available else "cpu"
        
        if self.gpu_available:
            print(f"🎯 GPU detected: {torch.cuda.get_device_name(0)}")
            print(f"🎯 CUDA version: {torch.version.cuda}")
            print(f"🎯 GPU memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.1f}GB")
        else:
            print("⚠️  No GPU detected, using CPU optimization")
    
    def get_quantization_config(self) -> BitsAndBytesConfig:
        """Get optimized quantization configuration for GPU"""
        if not self.gpu_available:
            return None
            
        return BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_use_double_quant=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=torch.float16,
            llm_int8_enable_fp32_cpu_offload=False,
            llm_int8_has_fp16_weight=True
        )
    
    async def download_and_optimize_model(self, model_key: str, config: Dict[str, Any]) -> bool:
        """Download and optimize a single model for GPU acceleration"""
        model_name = config["model_name"]
        print(f"\n🔄 Processing {model_key}: {model_name}")
        
        try:
            start_time = time.time()
            
            # Set cache directories
            model_cache = self.cache_dir / "models" / model_key
            model_cache.mkdir(parents=True, exist_ok=True)
            
            # Download tokenizer
            print(f"  📥 Downloading tokenizer...")
            tokenizer = AutoTokenizer.from_pretrained(
                model_name,
                cache_dir=str(model_cache),
                trust_remote_code=True
            )
            
            # Download and optimize model based on task
            if config["task"] == "text-generation":
                await self._optimize_generation_model(model_name, config, model_cache, tokenizer)
            elif config["task"] == "feature-extraction":
                await self._optimize_feature_model(model_name, config, model_cache, tokenizer)
            elif config["task"] == "sentence-similarity":
                await self._optimize_sentence_model(model_name, config, model_cache, tokenizer)
            
            download_time = time.time() - start_time
            print(f"  ✅ {model_key} optimized in {download_time:.2f}s")
            
            # Clear GPU memory
            if self.gpu_available:
                torch.cuda.empty_cache()
                gc.collect()
            
            return True
            
        except Exception as e:
            print(f"  ❌ Error optimizing {model_key}: {str(e)}")
            return False
    
    async def _optimize_generation_model(self, model_name: str, config: Dict, cache_path: Path, tokenizer):
        """Optimize text generation model for GPU"""
        print(f"  🧠 Optimizing generation model...")
        
        quantization_config = self.get_quantization_config() if config.get("quantize") else None
        
        if self.gpu_available and quantization_config:
            # Load with quantization for GPU
            model = AutoModelForCausalLM.from_pretrained(
                model_name,
                quantization_config=quantization_config,
                device_map="auto",
                torch_dtype=torch.float16,
                cache_dir=str(cache_path),
                trust_remote_code=True,
                low_cpu_mem_usage=True
            )
            print(f"    ✅ Loaded with 4-bit quantization")
        else:
            # Load normally for CPU or non-quantized
            model = AutoModelForCausalLM.from_pretrained(
                model_name,
                cache_dir=str(cache_path),
                trust_remote_code=True,
                torch_dtype=torch.float16 if self.gpu_available else torch.float32
            )
            if self.gpu_available:
                model = model.to(self.device)
            print(f"    ✅ Loaded on {self.device}")
        
        # Test inference
        await self._test_generation_inference(model, tokenizer, config["max_length"])
        
        # Save optimized model
        model.save_pretrained(str(cache_path / "optimized"))
        tokenizer.save_pretrained(str(cache_path / "optimized"))
        
        del model
    
    async def _optimize_feature_model(self, model_name: str, config: Dict, cache_path: Path, tokenizer):
        """Optimize feature extraction model for GPU"""
        print(f"  🧠 Optimizing feature extraction model...")
        
        if self.gpu_available and config.get("quantize"):
            # Use optimum for ONNX optimization
            try:
                model = ORTModelForSequenceClassification.from_pretrained(
                    model_name,
                    from_transformers=True,
                    cache_dir=str(cache_path)
                )
                print(f"    ✅ Loaded with ONNX optimization")
            except:
                # Fallback to regular model
                model = AutoModel.from_pretrained(
                    model_name,
                    cache_dir=str(cache_path),
                    torch_dtype=torch.float16
                )
                if self.gpu_available:
                    model = model.to(self.device)
                print(f"    ✅ Loaded on {self.device} (fallback)")
        else:
            model = AutoModel.from_pretrained(
                model_name,
                cache_dir=str(cache_path),
                torch_dtype=torch.float16 if self.gpu_available else torch.float32
            )
            if self.gpu_available:
                model = model.to(self.device)
            print(f"    ✅ Loaded on {self.device}")
        
        # Test inference
        await self._test_feature_inference(model, tokenizer, config["max_length"])
        
        # Save optimized model
        model.save_pretrained(str(cache_path / "optimized"))
        tokenizer.save_pretrained(str(cache_path / "optimized"))
        
        del model
    
    async def _optimize_sentence_model(self, model_name: str, config: Dict, cache_path: Path, tokenizer):
        """Optimize sentence transformer model for GPU"""
        print(f"  🧠 Optimizing sentence transformer model...")
        
        try:
            from sentence_transformers import SentenceTransformer
            
            model = SentenceTransformer(
                model_name,
                cache_folder=str(cache_path),
                device=self.device
            )
            
            # Test inference
            test_sentences = ["Test sentence for optimization", "Propoziție de test pentru optimizare"]
            embeddings = model.encode(test_sentences, convert_to_tensor=True)
            print(f"    ✅ Sentence transformer test: {embeddings.shape}")
            
            # Save model
            model.save(str(cache_path / "optimized"))
            
            del model, embeddings
            
        except ImportError:
            print(f"    ⚠️  sentence-transformers not available, using base model")
            await self._optimize_feature_model(model_name, config, cache_path, tokenizer)
    
    async def _test_generation_inference(self, model, tokenizer, max_length: int):
        """Test text generation inference"""
        test_input = "Inteligența artificială românească"
        
        try:
            inputs = tokenizer(test_input, return_tensors="pt", max_length=max_length, truncation=True)
            if self.gpu_available:
                inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            start_time = time.time()
            with torch.no_grad():
                outputs = model.generate(
                    **inputs,
                    max_length=min(max_length, inputs['input_ids'].shape[1] + 50),
                    num_return_sequences=1,
                    do_sample=True,
                    temperature=0.7,
                    pad_token_id=tokenizer.eos_token_id
                )
            inference_time = time.time() - start_time
            
            response = tokenizer.decode(outputs[0], skip_special_tokens=True)
            print(f"    ⚡ Generation test: {inference_time*1000:.1f}ms")
            print(f"    📝 Response: {response[:100]}...")
            
        except Exception as e:
            print(f"    ⚠️  Generation test failed: {str(e)}")
    
    async def _test_feature_inference(self, model, tokenizer, max_length: int):
        """Test feature extraction inference"""
        test_input = "Test pentru extragerea de caracteristici"
        
        try:
            inputs = tokenizer(test_input, return_tensors="pt", max_length=max_length, truncation=True)
            if self.gpu_available:
                inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            start_time = time.time()
            with torch.no_grad():
                outputs = model(**inputs)
                features = outputs.last_hidden_state.mean(dim=1)
            inference_time = time.time() - start_time
            
            print(f"    ⚡ Feature extraction test: {inference_time*1000:.1f}ms")
            print(f"    📊 Feature shape: {features.shape}")
            
        except Exception as e:
            print(f"    ⚠️  Feature test failed: {str(e)}")
    
    async def optimize_all_models(self) -> Dict[str, bool]:
        """Download and optimize all models for GPU acceleration"""
        print("🚀 Starting GPU model optimization for RomAI AGI Day 8")
        print(f"🎯 Target device: {self.device}")
        print(f"🎯 Cache directory: {self.cache_dir}")
        
        results = {}
        total_start = time.time()
        
        for model_key, config in self.models_config.items():
            success = await self.download_and_optimize_model(model_key, config)
            results[model_key] = success
        
        total_time = time.time() - total_start
        successful = sum(results.values())
        
        print(f"\n🎉 Model optimization complete!")
        print(f"✅ Successful: {successful}/{len(results)} models")
        print(f"⏱️  Total time: {total_time:.2f}s")
        
        if self.gpu_available:
            print(f"🎯 GPU memory usage: {torch.cuda.memory_allocated() / 1024**3:.2f}GB")
        
        return results
    
    def create_optimization_report(self, results: Dict[str, bool]):
        """Create optimization report"""
        report_path = self.cache_dir / "optimization_report.json"
        
        import json
        from datetime import datetime
        
        report = {
            "timestamp": datetime.utcnow().isoformat(),
            "gpu_available": self.gpu_available,
            "device": self.device,
            "cuda_version": torch.version.cuda if self.gpu_available else None,
            "pytorch_version": torch.__version__,
            "optimization_results": results,
            "successful_models": sum(results.values()),
            "total_models": len(results),
            "cache_directory": str(self.cache_dir)
        }
        
        if self.gpu_available:
            report["gpu_info"] = {
                "name": torch.cuda.get_device_name(0),
                "memory_gb": torch.cuda.get_device_properties(0).total_memory / 1024**3,
                "compute_capability": f"{torch.cuda.get_device_properties(0).major}.{torch.cuda.get_device_properties(0).minor}"
            }
        
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"📊 Optimization report saved: {report_path}")
        return report

async def main():
    """Main optimization routine"""
    parser = argparse.ArgumentParser(description="RomAI AGI Day 8 Model Optimizer")
    parser.add_argument("--cache-dir", default="/app/cache", help="Cache directory for models")
    parser.add_argument("--optimize-gpu", action="store_true", help="Enable GPU optimizations")
    parser.add_argument("--quantize", action="store_true", help="Enable model quantization")
    parser.add_argument("--model", help="Optimize specific model only")
    
    args = parser.parse_args()
    
    # Initialize optimizer
    optimizer = GPUModelOptimizer(cache_dir=args.cache_dir)
    
    # Filter models if specific model requested
    if args.model and args.model in optimizer.models_config:
        optimizer.models_config = {args.model: optimizer.models_config[args.model]}
    
    # Set optimization flags
    for config in optimizer.models_config.values():
        config["optimize_gpu"] = args.optimize_gpu
        if not args.quantize:
            config["quantize"] = False
    
    # Run optimization
    results = await optimizer.optimize_all_models()
    
    # Generate report
    report = optimizer.create_optimization_report(results)
    
    # Return success code
    success_rate = sum(results.values()) / len(results)
    if success_rate >= 0.8:  # 80% success rate required
        print("🎉 Optimization successful!")
        sys.exit(0)
    else:
        print("❌ Optimization failed!")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
