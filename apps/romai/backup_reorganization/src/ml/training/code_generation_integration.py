"""
Integration module for RomAI Code Generation Training
==================================================

This module integrates the code generation training system with the main RomAI AGI server,
providing endpoints for training, evaluation, and code generation capabilities.

Author: RomAI Development Team
Date: August 2025
"""

import asyncio
import logging
from typing import Dict, Any, Optional
from fastapi import HTTPException

from .code_generation_training import (
    CodeGenerationTrainer,
    CodeGenerationConfig,
    CodeTask
)

logger = logging.getLogger(__name__)

class CodeGenerationService:
    """Service class for integrating code generation capabilities with RomAI AGI"""
    
    def __init__(self):
        self.trainer: Optional[CodeGenerationTrainer] = None
        self.is_initialized = False
        self.training_status = {
            "status": "not_started",
            "progress": 0.0,
            "results": None,
            "error": None
        }
    
    async def initialize(self, config: Optional[CodeGenerationConfig] = None):
        """Initialize the code generation service"""
        try:
            if config is None:
                config = CodeGenerationConfig(
                    model_name="microsoft/CodeGen-350M-multi",
                    batch_size=4,
                    num_epochs=1,
                    enable_humaneval=True,
                    enable_mbpp=True,
                    enable_multiple=True,
                    enable_swbench=True
                )
            
            self.trainer = CodeGenerationTrainer(config)
            await self.trainer.initialize()
            self.is_initialized = True
            
            logger.info("Code generation service initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize code generation service: {e}")
            raise HTTPException(status_code=500, detail=f"Service initialization failed: {e}")
    
    async def start_training(self, config: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Start code generation training"""
        if not self.is_initialized:
            raise HTTPException(status_code=400, detail="Service not initialized")
        
        if self.training_status["status"] == "training":
            return {"status": "already_training", "progress": self.training_status["progress"]}
        
        try:
            self.training_status = {
                "status": "training",
                "progress": 0.0,
                "results": None,
                "error": None
            }
            
            # Start training in background
            asyncio.create_task(self._train_model())
            
            return {
                "status": "training_started",
                "message": "Code generation training started successfully",
                "estimated_time": "10-30 minutes depending on model size"
            }
            
        except Exception as e:
            logger.error(f"Failed to start training: {e}")
            self.training_status["status"] = "error"
            self.training_status["error"] = str(e)
            raise HTTPException(status_code=500, detail=f"Training failed to start: {e}")
    
    async def _train_model(self):
        """Execute model training in background"""
        try:
            self.training_status["progress"] = 0.1
            results = await self.trainer.train()
            
            if results["training_completed"]:
                self.training_status = {
                    "status": "completed",
                    "progress": 1.0,
                    "results": results,
                    "error": None
                }
                logger.info("Code generation training completed successfully")
            else:
                self.training_status = {
                    "status": "failed",
                    "progress": 0.0,
                    "results": None,
                    "error": results.get("error", "Unknown error")
                }
                logger.error(f"Training failed: {results.get('error')}")
                
        except Exception as e:
            logger.error(f"Training execution failed: {e}")
            self.training_status = {
                "status": "failed",
                "progress": 0.0,
                "results": None,
                "error": str(e)
            }
    
    async def get_training_status(self) -> Dict[str, Any]:
        """Get current training status"""
        return self.training_status.copy()
    
    async def generate_code(
        self, 
        prompt: str, 
        language: str = "python",
        max_length: int = 512
    ) -> Dict[str, Any]:
        """Generate code from a prompt"""
        if not self.is_initialized:
            raise HTTPException(status_code=400, detail="Service not initialized")
        
        if not self.trainer:
            raise HTTPException(status_code=500, detail="Trainer not available")
        
        try:
            generated_code = await self.trainer.generate_code(prompt, language)
            
            return {
                "prompt": prompt,
                "language": language,
                "generated_code": generated_code,
                "confidence": 0.85,  # Mock confidence score
                "execution_time_ms": 150,  # Mock execution time
                "model_used": self.trainer.config.model_name
            }
            
        except Exception as e:
            logger.error(f"Code generation failed: {e}")
            raise HTTPException(status_code=500, detail=f"Code generation failed: {e}")
    
    async def evaluate_code_quality(self, code: str, language: str = "python") -> Dict[str, Any]:
        """Evaluate generated code quality"""
        try:
            # Mock evaluation (in practice, would use static analysis tools)
            quality_metrics = {
                "syntax_valid": True,
                "complexity_score": 0.7,
                "readability_score": 0.8,
                "performance_score": 0.75,
                "security_score": 0.9,
                "overall_score": 0.79
            }
            
            return {
                "code": code,
                "language": language,
                "quality_metrics": quality_metrics,
                "suggestions": [
                    "Consider adding type hints for better code clarity",
                    "Function could benefit from docstring documentation"
                ]
            }
            
        except Exception as e:
            logger.error(f"Code evaluation failed: {e}")
            raise HTTPException(status_code=500, detail=f"Code evaluation failed: {e}")
    
    async def get_supported_benchmarks(self) -> Dict[str, Any]:
        """Get information about supported benchmarks"""
        return {
            "benchmarks": {
                "HumanEval": {
                    "description": "Hand-written evaluation set for measuring functional correctness",
                    "task_count": 164,
                    "language": "python",
                    "difficulty": "medium"
                },
                "MBPP": {
                    "description": "Mostly Basic Python Programs for code generation",
                    "task_count": 974,
                    "language": "python", 
                    "difficulty": "basic"
                },
                "MultiPL-E": {
                    "description": "Multi-language benchmark derived from HumanEval",
                    "task_count": 164,
                    "languages": ["python", "javascript", "java", "cpp", "go", "rust"],
                    "difficulty": "medium"
                },
                "SWE-Bench": {
                    "description": "Real-world software engineering tasks from GitHub",
                    "task_count": 2294,
                    "language": "python",
                    "difficulty": "hard"
                }
            },
            "supported_languages": [
                "python", "javascript", "typescript", "java", "cpp", "c",
                "csharp", "go", "rust", "php", "ruby", "swift", "kotlin"
            ],
            "capabilities": [
                "code_completion",
                "function_generation", 
                "bug_fixing",
                "code_refactoring",
                "documentation_generation",
                "test_generation"
            ]
        }
    
    async def get_service_health(self) -> Dict[str, Any]:
        """Get service health status"""
        return {
            "service": "RomAI Code Generation Training",
            "status": "healthy" if self.is_initialized else "not_initialized",
            "trainer_available": self.trainer is not None,
            "training_status": self.training_status["status"],
            "model_loaded": self.trainer.model is not None if self.trainer else False,
            "capabilities": {
                "training": True,
                "generation": True,
                "evaluation": True,
                "multi_language": True,
                "multi_benchmark": True
            }
        }

# Global service instance
code_generation_service = CodeGenerationService()

async def get_code_generation_service() -> CodeGenerationService:
    """Get the global code generation service instance"""
    if not code_generation_service.is_initialized:
        await code_generation_service.initialize()
    return code_generation_service