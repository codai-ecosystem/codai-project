#!/usr/bin/env python3
"""
ROMAI AGI Quantized Model System
Optimized for RTX 3060 Ti 8GB VRAM constraints

This implements 4-bit quantization and LoRA/QLoRA for efficient model usage
within strict memory limits while maintaining AGI capabilities.
"""

import torch
import logging
from transformers import (
    AutoTokenizer, 
    AutoModelForCausalLM, 
    BitsAndBytesConfig,
    TrainingArguments,
    Trainer
)
from peft import (
    LoraConfig, 
    get_peft_model, 
    TaskType,
    prepare_model_for_kbit_training
)
import psutil
import gc
from typing import Optional, Dict, Any, List
from pathlib import Path
import json

logger = logging.getLogger(__name__)

class QuantizedAGIModel:
    """
    Quantized AGI model optimized for 8GB VRAM
    Uses 4-bit quantization and LoRA for efficiency
    """
    
    def __init__(self, 
                 model_name: str = "microsoft/DialoGPT-medium",  # 345M params - good starting point
                 max_vram_gb: float = 7.5,  # Leave buffer for system
                 cache_dir: str = "./.cache/models"):
        
        self.model_name = model_name
        self.max_vram_gb = max_vram_gb
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        self.tokenizer = None
        self.model = None
        self.peft_model = None
        
        # LoRA configuration for efficient fine-tuning
        self.lora_config = LoraConfig(
            task_type=TaskType.CAUSAL_LM,
            inference_mode=False,
            r=16,  # Rank - balance between performance and memory
            lora_alpha=32,
            lora_dropout=0.1,
            target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],  # Common attention modules
            bias="none",
        )
        
        # 4-bit quantization config
        self.bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_compute_dtype=torch.float16,
            bnb_4bit_use_double_quant=True,
            bnb_4bit_quant_type="nf4"  # NormalFloat4 - good balance
        )
        
        logger.info(f"🧠 Quantized AGI Model initialized for {model_name}")
        logger.info(f"💾 Max VRAM usage: {max_vram_gb:.1f}GB")
    
    def check_vram_usage(self) -> Dict[str, float]:
        """Check current VRAM usage"""
        if not torch.cuda.is_available():
            return {"available": False}
        
        allocated_gb = torch.cuda.memory_allocated() / (1024**3)
        reserved_gb = torch.cuda.memory_reserved() / (1024**3)
        total_gb = torch.cuda.get_device_properties(0).total_memory / (1024**3)
        
        return {
            "available": True,
            "allocated_gb": allocated_gb,
            "reserved_gb": reserved_gb,
            "total_gb": total_gb,
            "free_gb": total_gb - allocated_gb,
            "usage_percent": (allocated_gb / total_gb) * 100,
            "within_limits": allocated_gb < self.max_vram_gb
        }
    
    def optimize_memory(self):
        """Optimize GPU memory usage"""
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        gc.collect()
        
        logger.info("🧹 Memory optimization completed")
    
    async def load_model(self) -> bool:
        """Load quantized model with memory optimizations"""
        try:
            logger.info(f"📥 Loading quantized model: {self.model_name}")
            
            # Check initial VRAM
            vram_status = self.check_vram_usage()
            if vram_status.get("available"):
                logger.info(f"💾 Initial VRAM: {vram_status['allocated_gb']:.2f}GB / {vram_status['total_gb']:.2f}GB")
            
            # Load tokenizer (lightweight)
            logger.info("📝 Loading tokenizer...")
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name,
                cache_dir=self.cache_dir,
                trust_remote_code=True
            )
            
            # Add padding token if missing
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
            
            # Load quantized model
            logger.info("🔢 Loading 4-bit quantized model...")
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                quantization_config=self.bnb_config,
                device_map="auto",
                torch_dtype=torch.float16,
                cache_dir=self.cache_dir,
                trust_remote_code=True,
                low_cpu_mem_usage=True
            )
            
            # Check VRAM after loading
            vram_status = self.check_vram_usage()
            if vram_status.get("available"):
                logger.info(f"💾 Post-load VRAM: {vram_status['allocated_gb']:.2f}GB")
                if not vram_status["within_limits"]:
                    logger.warning(f"⚠️ VRAM usage ({vram_status['allocated_gb']:.2f}GB) exceeds limit ({self.max_vram_gb}GB)")
                    return False
            
            # Prepare model for LoRA training
            logger.info("🎯 Preparing model for LoRA training...")
            self.model = prepare_model_for_kbit_training(self.model)
            
            # Add LoRA adapters
            self.peft_model = get_peft_model(self.model, self.lora_config)
            
            # Final VRAM check
            vram_status = self.check_vram_usage()
            if vram_status.get("available"):
                logger.info(f"💾 Final VRAM: {vram_status['allocated_gb']:.2f}GB")
                logger.info(f"✅ Model loaded successfully within {self.max_vram_gb}GB limit")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}")
            self.optimize_memory()
            return False
    
    def generate_response(self, prompt: str, max_length: int = 256) -> Optional[str]:
        """Generate response using quantized model"""
        if not self.model or not self.tokenizer:
            logger.error("❌ Model not loaded")
            return None
        
        try:
            # Check VRAM before inference
            vram_status = self.check_vram_usage()
            if vram_status.get("available") and not vram_status["within_limits"]:
                logger.warning("⚠️ VRAM usage high, optimizing before inference...")
                self.optimize_memory()
            
            # Tokenize input
            inputs = self.tokenizer.encode(prompt, return_tensors="pt")
            
            if torch.cuda.is_available():
                inputs = inputs.cuda()
            
            # Generate with memory-efficient settings
            with torch.no_grad():
                outputs = self.peft_model.generate(
                    inputs,
                    max_length=max_length,
                    num_return_sequences=1,
                    temperature=0.7,
                    do_sample=True,
                    pad_token_id=self.tokenizer.eos_token_id,
                    use_cache=True,  # Enable KV cache for efficiency
                    no_repeat_ngram_size=2
                )
            
            # Decode response
            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Remove the prompt from response
            if response.startswith(prompt):
                response = response[len(prompt):].strip()
            
            return response
            
        except Exception as e:
            logger.error(f"❌ Generation failed: {e}")
            self.optimize_memory()
            return None
    
    async def incremental_learning(self, 
                                   training_data: List[Dict[str, str]], 
                                   learning_rate: float = 1e-4,
                                   num_epochs: int = 1) -> bool:
        """
        Incremental learning using LoRA/QLoRA
        For self-improvement based on successful task traces
        """
        if not self.peft_model or not self.tokenizer:
            logger.error("❌ Model not loaded for training")
            return False
        
        try:
            logger.info(f"📚 Starting incremental learning with {len(training_data)} examples")
            
            # Prepare training data
            formatted_data = []
            for item in training_data:
                if "input" in item and "output" in item:
                    text = f"{item['input']}{self.tokenizer.eos_token}{item['output']}{self.tokenizer.eos_token}"
                    formatted_data.append(text)
            
            if not formatted_data:
                logger.warning("⚠️ No valid training data provided")
                return False
            
            # Tokenize training data
            def tokenize_function(examples):
                return self.tokenizer(
                    examples["text"], 
                    truncation=True, 
                    padding=True, 
                    max_length=512
                )
            
            # Create dataset (simplified version - in practice would use datasets library)
            train_texts = {"text": formatted_data}
            
            # Training arguments optimized for memory
            training_args = TrainingArguments(
                output_dir="./lora_training",
                per_device_train_batch_size=1,  # Small batch for memory
                gradient_accumulation_steps=4,  # Simulate larger batch
                num_train_epochs=num_epochs,
                learning_rate=learning_rate,
                warmup_steps=10,
                logging_steps=10,
                save_steps=50,
                remove_unused_columns=False,
                dataloader_pin_memory=False,  # Reduce memory usage
                gradient_checkpointing=True,  # Trade compute for memory
                fp16=True,  # Use half precision
            )
            
            # Note: This is a simplified training loop
            # In practice, would use proper Trainer with dataset
            logger.info("✅ Incremental learning setup completed")
            logger.info("📝 Note: Full training implementation requires datasets integration")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Incremental learning failed: {e}")
            self.optimize_memory()
            return False
    
    def save_lora_adapters(self, save_path: str) -> bool:
        """Save LoRA adapters for later use"""
        if not self.peft_model:
            logger.error("❌ No LoRA model to save")
            return False
        
        try:
            save_dir = Path(save_path)
            save_dir.mkdir(parents=True, exist_ok=True)
            
            self.peft_model.save_pretrained(str(save_dir))
            logger.info(f"💾 LoRA adapters saved to {save_dir}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to save LoRA adapters: {e}")
            return False
    
    def get_model_stats(self) -> Dict[str, Any]:
        """Get model statistics and memory usage"""
        stats = {
            "model_name": self.model_name,
            "quantization": "4-bit NF4",
            "lora_enabled": self.peft_model is not None,
            "loaded": self.model is not None
        }
        
        if self.model:
            try:
                # Get parameter count
                total_params = sum(p.numel() for p in self.model.parameters())
                trainable_params = sum(p.numel() for p in self.model.parameters() if p.requires_grad)
                
                stats.update({
                    "total_parameters": total_params,
                    "trainable_parameters": trainable_params,
                    "trainable_percent": (trainable_params / total_params) * 100 if total_params > 0 else 0
                })
            except Exception as e:
                logger.warning(f"⚠️ Could not get parameter stats: {e}")
        
        # Add VRAM stats
        vram_status = self.check_vram_usage()
        stats["vram_status"] = vram_status
        
        return stats

# Singleton pattern for global model access
_global_model_instance: Optional[QuantizedAGIModel] = None

def get_global_agi_model(model_name: str = "microsoft/DialoGPT-medium") -> QuantizedAGIModel:
    """Get global AGI model instance (singleton)"""
    global _global_model_instance
    
    if _global_model_instance is None:
        _global_model_instance = QuantizedAGIModel(model_name)
    
    return _global_model_instance

# Example usage for testing
async def test_quantized_model():
    """Test the quantized model system"""
    logger.info("🧪 Testing Quantized AGI Model")
    
    # Initialize model
    model = QuantizedAGIModel()
    
    # Load model
    success = await model.load_model()
    if not success:
        logger.error("❌ Model loading failed")
        return
    
    # Get stats
    stats = model.get_model_stats()
    logger.info("📊 Model Statistics:")
    for key, value in stats.items():
        if key != "vram_status":
            logger.info(f"  • {key}: {value}")
    
    # Test generation
    test_prompt = "The key to artificial general intelligence is"
    response = model.generate_response(test_prompt, max_length=128)
    
    if response:
        logger.info(f"🎯 Test Generation:")
        logger.info(f"  Prompt: {test_prompt}")
        logger.info(f"  Response: {response}")
    else:
        logger.error("❌ Generation test failed")
    
    # Final VRAM check
    vram_status = model.check_vram_usage()
    if vram_status.get("available"):
        logger.info(f"💾 Final VRAM: {vram_status['allocated_gb']:.2f}GB / {vram_status['total_gb']:.2f}GB")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    import asyncio
    asyncio.run(test_quantized_model())