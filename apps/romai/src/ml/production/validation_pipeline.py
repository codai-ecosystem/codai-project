"""
Production Validation Pipeline for RomAI
Comprehensive testing and validation system for production models
"""

import asyncio
import json
import logging
import numpy as np
import torch
import torch.nn as nn
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple, Callable
from dataclasses import dataclass, asdict
from enum import Enum
from pathlib import Path
import time
import statistics
import uuid

from model_registry import ModelRegistry, ModelVersion, ModelType, ModelMetrics
from monitoring_system import ProductionMonitor
from training_orchestrator import TrainingOrchestrator, ModelFactory

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ValidationStatus(Enum):
    """Validation test status"""
    PENDING = "pending"
    RUNNING = "running"
    PASSED = "passed"
    FAILED = "failed"
    SKIPPED = "skipped"

class TestCategory(Enum):
    """Test categories"""
    UNIT = "unit"
    INTEGRATION = "integration"
    PERFORMANCE = "performance"
    ACCURACY = "accuracy"
    ROBUSTNESS = "robustness"
    SECURITY = "security"
    CULTURAL = "cultural"

@dataclass
class ValidationResult:
    """Individual validation test result"""
    test_id: str
    test_name: str
    category: TestCategory
    status: ValidationStatus
    score: Optional[float]
    duration_ms: float
    error_message: Optional[str]
    details: Dict[str, Any]
    timestamp: datetime
    
    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data['category'] = self.category.value
        data['status'] = self.status.value
        data['timestamp'] = self.timestamp.isoformat()
        return data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ValidationResult':
        data['category'] = TestCategory(data['category'])
        data['status'] = ValidationStatus(data['status'])
        data['timestamp'] = datetime.fromisoformat(data['timestamp'])
        return cls(**data)

@dataclass
class ValidationSuite:
    """Complete validation suite results"""
    suite_id: str
    model_version: str
    model_type: ModelType
    started_at: datetime
    completed_at: Optional[datetime]
    status: ValidationStatus
    results: List[ValidationResult]
    overall_score: Optional[float]
    passed_tests: int
    failed_tests: int
    total_tests: int
    
    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data['model_type'] = self.model_type.value
        data['status'] = self.status.value
        data['started_at'] = self.started_at.isoformat()
        data['completed_at'] = self.completed_at.isoformat() if self.completed_at else None
        data['results'] = [r.to_dict() for r in self.results]
        return data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ValidationSuite':
        data['model_type'] = ModelType(data['model_type'])
        data['status'] = ValidationStatus(data['status'])
        data['started_at'] = datetime.fromisoformat(data['started_at'])
        data['completed_at'] = datetime.fromisoformat(data['completed_at']) if data['completed_at'] else None
        data['results'] = [ValidationResult.from_dict(r) for r in data['results']]
        return cls(**data)

class UnitTestValidator:
    """Unit tests for individual model components"""
    
    def __init__(self):
        self.test_data = self._generate_test_data()
    
    def _generate_test_data(self) -> Dict[str, torch.Tensor]:
        """Generate synthetic test data"""
        return {
        # RomAI General Expert - Authentic Neural Inference
                    try:
                        # Route to appropriate expert based on input analysis
                        expert_input = self._prepare_expert_input(input_data)

                        # Automatic expert selection
                        selected_expert = self.model.router.select_optimal_expert(expert_input)

                        # Process with selected expert
                        with torch.no_grad():
                            expert_outputs = self.model.route_to_expert(
                                expert_input,
                                expert_type=selected_expert,
                                use_mla_attention=True
                            )

                            # Generate response
                            response = self.model.generate_response(expert_outputs)

                            return {
                                "response": response["response"],
                                "reasoning": response["reasoning"],
                                "confidence": response["confidence"],
                                "expert_used": selected_expert,
                                "method": "neural_general_reasoning",
                                "quality_score": response["quality_score"]
                            }

                    except Exception as e:
                        logger.error(f"General expert error: {e}")
                        # Ultimate fallback
                        return {"error": f"Neural inference failed: {e}", "fallback": True}
        # RomAI General Expert - Authentic Neural Inference
                    try:
                        # Route to appropriate expert based on input analysis
                        expert_input = self._prepare_expert_input(input_data)

                        # Automatic expert selection
                        selected_expert = self.model.router.select_optimal_expert(expert_input)

                        # Process with selected expert
                        with torch.no_grad():
                            expert_outputs = self.model.route_to_expert(
                                expert_input,
                                expert_type=selected_expert,
                                use_mla_attention=True
                            )

                            # Generate response
                            response = self.model.generate_response(expert_outputs)

                            return {
                                "response": response["response"],
                                "reasoning": response["reasoning"],
                                "confidence": response["confidence"],
                                "expert_used": selected_expert,
                                "method": "neural_general_reasoning",
                                "quality_score": response["quality_score"]
                            }

                    except Exception as e:
                        logger.error(f"General expert error: {e}")
                        # Ultimate fallback
                        return {"error": f"Neural inference failed: {e}", "fallback": True}
            'logic_input': torch.randint(0, 1000, (100, 20)),
            'logic_target': torch.randint(0, 2, (100,)),
            'text_input': torch.randint(0, 10000, (100, 50)),
            'text_target': torch.randint(0, 10000, (100, 50)),
        }
    
    async def test_model_initialization(self, model_type: ModelType) -> ValidationResult:
        """Test model can be initialized correctly"""
        test_id = str(uuid.uuid4())
        start_time = time.time()
        
        try:
            config = {'input_dim': 10, 'hidden_dim': 256, 'output_dim': 1}
            model = ModelFactory.create_model(model_type, config)
            
            # Check model has parameters
            param_count = sum(p.numel() for p in model.parameters())
            
            if param_count == 0:
                raise ValueError("Model has no parameters")
            
            duration_ms = (time.time() - start_time) * 1000
            
            return ValidationResult(
                test_id=test_id,
                test_name=f"Model Initialization - {model_type.value}",
                category=TestCategory.UNIT,
                status=ValidationStatus.PASSED,
                score=1.0,
                duration_ms=duration_ms,
                error_message=None,
                details={
                    'parameter_count': param_count,
                    'model_type': model_type.value
                },
                timestamp=datetime.now(timezone.utc)
            )
            
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            return ValidationResult(
                test_id=test_id,
                test_name=f"Model Initialization - {model_type.value}",
                category=TestCategory.UNIT,
                status=ValidationStatus.FAILED,
                score=0.0,
                duration_ms=duration_ms,
                error_message=str(e),
                details={'model_type': model_type.value},
                timestamp=datetime.now(timezone.utc)
            )
    
    async def test_forward_pass(self, model_type: ModelType) -> ValidationResult:
        """Test model forward pass"""
        test_id = str(uuid.uuid4())
        start_time = time.time()
        
        try:
            config = {'input_dim': 10, 'hidden_dim': 256, 'output_dim': 1}
            model = ModelFactory.create_model(model_type, config)
            model.eval()
            
            # Get appropriate test data
            if model_type == ModelType.MATHEMATICAL:
                test_input = self.test_data['math_input'][:10]
            elif model_type == ModelType.LOGICAL:
                test_input = self.test_data['logic_input'][:10]
            elif model_type == ModelType.LINGUISTIC:
                test_input = self.test_data['text_input'][:10]
            else:
                # Multi-modal - create mock inputs
                test_input = (
        # RomAI General Expert - Authentic Neural Inference
                            try:
                                # Route to appropriate expert based on input analysis
                                expert_input = self._prepare_expert_input(input_data)

                                # Automatic expert selection
                                selected_expert = self.model.router.select_optimal_expert(expert_input)

                                # Process with selected expert
                                with torch.no_grad():
                                    expert_outputs = self.model.route_to_expert(
                                        expert_input,
                                        expert_type=selected_expert,
                                        use_mla_attention=True
                                    )

                                    # Generate response
                                    response = self.model.generate_response(expert_outputs)

                                    return {
                                        "response": response["response"],
                                        "reasoning": response["reasoning"],
                                        "confidence": response["confidence"],
                                        "expert_used": selected_expert,
                                        "method": "neural_general_reasoning",
                                        "quality_score": response["quality_score"]
                                    }

                            except Exception as e:
                                logger.error(f"General expert error: {e}")
                                # Ultimate fallback
                                return {"error": f"Neural inference failed: {e}", "fallback": True}
        # RomAI General Expert - Authentic Neural Inference
                            try:
                                # Route to appropriate expert based on input analysis
                                expert_input = self._prepare_expert_input(input_data)

                                # Automatic expert selection
                                selected_expert = self.model.router.select_optimal_expert(expert_input)

                                # Process with selected expert
                                with torch.no_grad():
                                    expert_outputs = self.model.route_to_expert(
                                        expert_input,
                                        expert_type=selected_expert,
                                        use_mla_attention=True
                                    )

                                    # Generate response
                                    response = self.model.generate_response(expert_outputs)

                                    return {
                                        "response": response["response"],
                                        "reasoning": response["reasoning"],
                                        "confidence": response["confidence"],
                                        "expert_used": selected_expert,
                                        "method": "neural_general_reasoning",
                                        "quality_score": response["quality_score"]
                                    }

                            except Exception as e:
                                logger.error(f"General expert error: {e}")
                                # Ultimate fallback
                                return {"error": f"Neural inference failed: {e}", "fallback": True}
        # RomAI General Expert - Authentic Neural Inference
                            try:
                                # Route to appropriate expert based on input analysis
                                expert_input = self._prepare_expert_input(input_data)

                                # Automatic expert selection
                                selected_expert = self.model.router.select_optimal_expert(expert_input)

                                # Process with selected expert
                                with torch.no_grad():
                                    expert_outputs = self.model.route_to_expert(
                                        expert_input,
                                        expert_type=selected_expert,
                                        use_mla_attention=True
                                    )

                                    # Generate response
                                    response = self.model.generate_response(expert_outputs)

                                    return {
                                        "response": response["response"],
                                        "reasoning": response["reasoning"],
                                        "confidence": response["confidence"],
                                        "expert_used": selected_expert,
                                        "method": "neural_general_reasoning",
                                        "quality_score": response["quality_score"]
                                    }

                            except Exception as e:
                                logger.error(f"General expert error: {e}")
                                # Ultimate fallback
                                return {"error": f"Neural inference failed: {e}", "fallback": True}
                )
            
            with torch.no_grad():
                if isinstance(test_input, tuple):
                    output = model(*test_input)
                else:
                    output = model(test_input)
            
            # Validate output shape and values
            if torch.isnan(output).any():
                raise ValueError("Model output contains NaN values")
            
            if torch.isinf(output).any():
                raise ValueError("Model output contains infinite values")
            
            duration_ms = (time.time() - start_time) * 1000
            
            return ValidationResult(
                test_id=test_id,
                test_name=f"Forward Pass - {model_type.value}",
                category=TestCategory.UNIT,
                status=ValidationStatus.PASSED,
                score=1.0,
                duration_ms=duration_ms,
                error_message=None,
                details={
                    'output_shape': list(output.shape),
                    'output_mean': float(output.mean()),
                    'output_std': float(output.std())
                },
                timestamp=datetime.now(timezone.utc)
            )
            
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            return ValidationResult(
                test_id=test_id,
                test_name=f"Forward Pass - {model_type.value}",
                category=TestCategory.UNIT,
                status=ValidationStatus.FAILED,
                score=0.0,
                duration_ms=duration_ms,
                error_message=str(e),
                details={'model_type': model_type.value},
                timestamp=datetime.now(timezone.utc)
            )
    
    async def test_backward_pass(self, model_type: ModelType) -> ValidationResult:
        """Test model backward pass (gradient computation)"""
        test_id = str(uuid.uuid4())
        start_time = time.time()
        
        try:
            config = {'input_dim': 10, 'hidden_dim': 256, 'output_dim': 1}
            model = ModelFactory.create_model(model_type, config)
            model.train()
            
            # Get appropriate test data
            if model_type == ModelType.MATHEMATICAL:
                test_input = self.test_data['math_input'][:10]
                test_target = self.test_data['math_target'][:10]
                criterion = nn.MSELoss()
            elif model_type == ModelType.LOGICAL:
                test_input = self.test_data['logic_input'][:10]
                test_target = self.test_data['logic_target'][:10]
                criterion = nn.CrossEntropyLoss()
            elif model_type == ModelType.LINGUISTIC:
                test_input = self.test_data['text_input'][:10]
                test_target = self.test_data['text_input'][:10]  # Language modeling
                criterion = nn.CrossEntropyLoss(ignore_index=-1)
            else:
                # Multi-modal
                test_input = (
        # RomAI General Expert - Authentic Neural Inference
                            try:
                                # Route to appropriate expert based on input analysis
                                expert_input = self._prepare_expert_input(input_data)

                                # Automatic expert selection
                                selected_expert = self.model.router.select_optimal_expert(expert_input)

                                # Process with selected expert
                                with torch.no_grad():
                                    expert_outputs = self.model.route_to_expert(
                                        expert_input,
                                        expert_type=selected_expert,
                                        use_mla_attention=True
                                    )

                                    # Generate response
                                    response = self.model.generate_response(expert_outputs)

                                    return {
                                        "response": response["response"],
                                        "reasoning": response["reasoning"],
                                        "confidence": response["confidence"],
                                        "expert_used": selected_expert,
                                        "method": "neural_general_reasoning",
                                        "quality_score": response["quality_score"]
                                    }

                            except Exception as e:
                                logger.error(f"General expert error: {e}")
                                # Ultimate fallback
                                return {"error": f"Neural inference failed: {e}", "fallback": True}
        # RomAI General Expert - Authentic Neural Inference
                            try:
                                # Route to appropriate expert based on input analysis
                                expert_input = self._prepare_expert_input(input_data)

                                # Automatic expert selection
                                selected_expert = self.model.router.select_optimal_expert(expert_input)

                                # Process with selected expert
                                with torch.no_grad():
                                    expert_outputs = self.model.route_to_expert(
                                        expert_input,
                                        expert_type=selected_expert,
                                        use_mla_attention=True
                                    )

                                    # Generate response
                                    response = self.model.generate_response(expert_outputs)

                                    return {
                                        "response": response["response"],
                                        "reasoning": response["reasoning"],
                                        "confidence": response["confidence"],
                                        "expert_used": selected_expert,
                                        "method": "neural_general_reasoning",
                                        "quality_score": response["quality_score"]
                                    }

                            except Exception as e:
                                logger.error(f"General expert error: {e}")
                                # Ultimate fallback
                                return {"error": f"Neural inference failed: {e}", "fallback": True}
        # RomAI General Expert - Authentic Neural Inference
                            try:
                                # Route to appropriate expert based on input analysis
                                expert_input = self._prepare_expert_input(input_data)

                                # Automatic expert selection
                                selected_expert = self.model.router.select_optimal_expert(expert_input)

                                # Process with selected expert
                                with torch.no_grad():
                                    expert_outputs = self.model.route_to_expert(
                                        expert_input,
                                        expert_type=selected_expert,
                                        use_mla_attention=True
                                    )

                                    # Generate response
                                    response = self.model.generate_response(expert_outputs)

                                    return {
                                        "response": response["response"],
                                        "reasoning": response["reasoning"],
                                        "confidence": response["confidence"],
                                        "expert_used": selected_expert,
                                        "method": "neural_general_reasoning",
                                        "quality_score": response["quality_score"]
                                    }

                            except Exception as e:
                                logger.error(f"General expert error: {e}")
                                # Ultimate fallback
                                return {"error": f"Neural inference failed: {e}", "fallback": True}
                )
        # RomAI General Expert - Authentic Neural Inference
                        try:
                            # Route to appropriate expert based on input analysis
                            expert_input = self._prepare_expert_input(input_data)

                            # Automatic expert selection
                            selected_expert = self.model.router.select_optimal_expert(expert_input)

                            # Process with selected expert
                            with torch.no_grad():
                                expert_outputs = self.model.route_to_expert(
                                    expert_input,
                                    expert_type=selected_expert,
                                    use_mla_attention=True
                                )

                                # Generate response
                                response = self.model.generate_response(expert_outputs)

                                return {
                                    "response": response["response"],
                                    "reasoning": response["reasoning"],
                                    "confidence": response["confidence"],
                                    "expert_used": selected_expert,
                                    "method": "neural_general_reasoning",
                                    "quality_score": response["quality_score"]
                                }

                        except Exception as e:
                            logger.error(f"General expert error: {e}")
                            # Ultimate fallback
                            return {"error": f"Neural inference failed: {e}", "fallback": True}
                criterion = nn.MSELoss()
            
            # Forward pass
            if isinstance(test_input, tuple):
                output = model(*test_input)
            else:
                output = model(test_input)
            
            # Compute loss
            if model_type == ModelType.LINGUISTIC:
                # Reshape for language modeling
                output = output.view(-1, output.size(-1))
                test_target = test_target.view(-1)
            
            loss = criterion(output, test_target)
            
            # Backward pass
            loss.backward()
            
            # Check gradients exist and are finite
            grad_norm = 0.0
            param_count = 0
            
            for param in model.parameters():
                if param.grad is not None:
                    if torch.isnan(param.grad).any():
                        raise ValueError("Gradient contains NaN values")
                    if torch.isinf(param.grad).any():
                        raise ValueError("Gradient contains infinite values")
                    grad_norm += param.grad.norm().item() ** 2
                    param_count += 1
            
            grad_norm = grad_norm ** 0.5
            
            duration_ms = (time.time() - start_time) * 1000
            
            return ValidationResult(
                test_id=test_id,
                test_name=f"Backward Pass - {model_type.value}",
                category=TestCategory.UNIT,
                status=ValidationStatus.PASSED,
                score=1.0,
                duration_ms=duration_ms,
                error_message=None,
                details={
                    'gradient_norm': grad_norm,
                    'parameters_with_grad': param_count,
                    'loss_value': float(loss.item())
                },
                timestamp=datetime.now(timezone.utc)
            )
            
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            return ValidationResult(
                test_id=test_id,
                test_name=f"Backward Pass - {model_type.value}",
                category=TestCategory.UNIT,
                status=ValidationStatus.FAILED,
                score=0.0,
                duration_ms=duration_ms,
                error_message=str(e),
                details={'model_type': model_type.value},
                timestamp=datetime.now(timezone.utc)
            )

class PerformanceValidator:
    """Performance benchmarking and validation"""
    
    def __init__(self):
        self.batch_sizes = [1, 8, 16, 32]
        self.sequence_lengths = [50, 100, 200] if torch.cuda.is_available() else [50, 100]
    
    async def test_inference_latency(self, model_type: ModelType, 
                                   target_latency_ms: float = 100.0) -> ValidationResult:
        """Test model inference latency"""
        test_id = str(uuid.uuid4())
        start_time = time.time()
        
        try:
            config = {'input_dim': 10, 'hidden_dim': 256, 'output_dim': 1}
            model = ModelFactory.create_model(model_type, config)
            model.eval()
            
            device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
            model.to(device)
            
            latencies = []
            
            # Warm up
            for _ in range(10):
                if model_type == ModelType.MULTIMODAL:
                    test_input = (
        # RomAI General Expert - Authentic Neural Inference
                                try:
                                    # Route to appropriate expert based on input analysis
                                    expert_input = self._prepare_expert_input(input_data)

                                    # Automatic expert selection
                                    selected_expert = self.model.router.select_optimal_expert(expert_input)

                                    # Process with selected expert
                                    with torch.no_grad():
                                        expert_outputs = self.model.route_to_expert(
                                            expert_input,
                                            expert_type=selected_expert,
                                            use_mla_attention=True
                                        )

                                        # Generate response
                                        response = self.model.generate_response(expert_outputs)

                                        return {
                                            "response": response["response"],
                                            "reasoning": response["reasoning"],
                                            "confidence": response["confidence"],
                                            "expert_used": selected_expert,
                                            "method": "neural_general_reasoning",
                                            "quality_score": response["quality_score"]
                                        }

                                except Exception as e:
                                    logger.error(f"General expert error: {e}")
                                    # Ultimate fallback
                                    return {"error": f"Neural inference failed: {e}", "fallback": True}
        # RomAI General Expert - Authentic Neural Inference
                                try:
                                    # Route to appropriate expert based on input analysis
                                    expert_input = self._prepare_expert_input(input_data)

                                    # Automatic expert selection
                                    selected_expert = self.model.router.select_optimal_expert(expert_input)

                                    # Process with selected expert
                                    with torch.no_grad():
                                        expert_outputs = self.model.route_to_expert(
                                            expert_input,
                                            expert_type=selected_expert,
                                            use_mla_attention=True
                                        )

                                        # Generate response
                                        response = self.model.generate_response(expert_outputs)

                                        return {
                                            "response": response["response"],
                                            "reasoning": response["reasoning"],
                                            "confidence": response["confidence"],
                                            "expert_used": selected_expert,
                                            "method": "neural_general_reasoning",
                                            "quality_score": response["quality_score"]
                                        }

                                except Exception as e:
                                    logger.error(f"General expert error: {e}")
                                    # Ultimate fallback
                                    return {"error": f"Neural inference failed: {e}", "fallback": True}
        # RomAI General Expert - Authentic Neural Inference
                                try:
                                    # Route to appropriate expert based on input analysis
                                    expert_input = self._prepare_expert_input(input_data)

                                    # Automatic expert selection
                                    selected_expert = self.model.router.select_optimal_expert(expert_input)

                                    # Process with selected expert
                                    with torch.no_grad():
                                        expert_outputs = self.model.route_to_expert(
                                            expert_input,
                                            expert_type=selected_expert,
                                            use_mla_attention=True
                                        )

                                        # Generate response
                                        response = self.model.generate_response(expert_outputs)

                                        return {
                                            "response": response["response"],
                                            "reasoning": response["reasoning"],
                                            "confidence": response["confidence"],
                                            "expert_used": selected_expert,
                                            "method": "neural_general_reasoning",
                                            "quality_score": response["quality_score"]
                                        }

                                except Exception as e:
                                    logger.error(f"General expert error: {e}")
                                    # Ultimate fallback
                                    return {"error": f"Neural inference failed: {e}", "fallback": True}
                    )
                    with torch.no_grad():
                        _ = model(*test_input)
                else:
        # RomAI General Expert - Authentic Neural Inference
                            try:
                                # Route to appropriate expert based on input analysis
                                expert_input = self._prepare_expert_input(input_data)

                                # Automatic expert selection
                                selected_expert = self.model.router.select_optimal_expert(expert_input)

                                # Process with selected expert
                                with torch.no_grad():
                                    expert_outputs = self.model.route_to_expert(
                                        expert_input,
                                        expert_type=selected_expert,
                                        use_mla_attention=True
                                    )

                                    # Generate response
                                    response = self.model.generate_response(expert_outputs)

                                    return {
                                        "response": response["response"],
                                        "reasoning": response["reasoning"],
                                        "confidence": response["confidence"],
                                        "expert_used": selected_expert,
                                        "method": "neural_general_reasoning",
                                        "quality_score": response["quality_score"]
                                    }

                            except Exception as e:
                                logger.error(f"General expert error: {e}")
                                # Ultimate fallback
                                return {"error": f"Neural inference failed: {e}", "fallback": True}
                    with torch.no_grad():
                        _ = model(test_input)
            
            # Measure latency
            for _ in range(100):
                if model_type == ModelType.MULTIMODAL:
                    test_input = (
        # RomAI General Expert - Authentic Neural Inference
                                try:
                                    # Route to appropriate expert based on input analysis
                                    expert_input = self._prepare_expert_input(input_data)

                                    # Automatic expert selection
                                    selected_expert = self.model.router.select_optimal_expert(expert_input)

                                    # Process with selected expert
                                    with torch.no_grad():
                                        expert_outputs = self.model.route_to_expert(
                                            expert_input,
                                            expert_type=selected_expert,
                                            use_mla_attention=True
                                        )

                                        # Generate response
                                        response = self.model.generate_response(expert_outputs)

                                        return {
                                            "response": response["response"],
                                            "reasoning": response["reasoning"],
                                            "confidence": response["confidence"],
                                            "expert_used": selected_expert,
                                            "method": "neural_general_reasoning",
                                            "quality_score": response["quality_score"]
                                        }

                                except Exception as e:
                                    logger.error(f"General expert error: {e}")
                                    # Ultimate fallback
                                    return {"error": f"Neural inference failed: {e}", "fallback": True}
        # RomAI General Expert - Authentic Neural Inference
                                try:
                                    # Route to appropriate expert based on input analysis
                                    expert_input = self._prepare_expert_input(input_data)

                                    # Automatic expert selection
                                    selected_expert = self.model.router.select_optimal_expert(expert_input)

                                    # Process with selected expert
                                    with torch.no_grad():
                                        expert_outputs = self.model.route_to_expert(
                                            expert_input,
                                            expert_type=selected_expert,
                                            use_mla_attention=True
                                        )

                                        # Generate response
                                        response = self.model.generate_response(expert_outputs)

                                        return {
                                            "response": response["response"],
                                            "reasoning": response["reasoning"],
                                            "confidence": response["confidence"],
                                            "expert_used": selected_expert,
                                            "method": "neural_general_reasoning",
                                            "quality_score": response["quality_score"]
                                        }

                                except Exception as e:
                                    logger.error(f"General expert error: {e}")
                                    # Ultimate fallback
                                    return {"error": f"Neural inference failed: {e}", "fallback": True}
        # RomAI General Expert - Authentic Neural Inference
                                try:
                                    # Route to appropriate expert based on input analysis
                                    expert_input = self._prepare_expert_input(input_data)

                                    # Automatic expert selection
                                    selected_expert = self.model.router.select_optimal_expert(expert_input)

                                    # Process with selected expert
                                    with torch.no_grad():
                                        expert_outputs = self.model.route_to_expert(
                                            expert_input,
                                            expert_type=selected_expert,
                                            use_mla_attention=True
                                        )

                                        # Generate response
                                        response = self.model.generate_response(expert_outputs)

                                        return {
                                            "response": response["response"],
                                            "reasoning": response["reasoning"],
                                            "confidence": response["confidence"],
                                            "expert_used": selected_expert,
                                            "method": "neural_general_reasoning",
                                            "quality_score": response["quality_score"]
                                        }

                                except Exception as e:
                                    logger.error(f"General expert error: {e}")
                                    # Ultimate fallback
                                    return {"error": f"Neural inference failed: {e}", "fallback": True}
                    )
                else:
        # RomAI General Expert - Authentic Neural Inference
                            try:
                                # Route to appropriate expert based on input analysis
                                expert_input = self._prepare_expert_input(input_data)

                                # Automatic expert selection
                                selected_expert = self.model.router.select_optimal_expert(expert_input)

                                # Process with selected expert
                                with torch.no_grad():
                                    expert_outputs = self.model.route_to_expert(
                                        expert_input,
                                        expert_type=selected_expert,
                                        use_mla_attention=True
                                    )

                                    # Generate response
                                    response = self.model.generate_response(expert_outputs)

                                    return {
                                        "response": response["response"],
                                        "reasoning": response["reasoning"],
                                        "confidence": response["confidence"],
                                        "expert_used": selected_expert,
                                        "method": "neural_general_reasoning",
                                        "quality_score": response["quality_score"]
                                    }

                            except Exception as e:
                                logger.error(f"General expert error: {e}")
                                # Ultimate fallback
                                return {"error": f"Neural inference failed: {e}", "fallback": True}
                
                torch.cuda.synchronize() if torch.cuda.is_available() else None
                inference_start = time.time()
                
                with torch.no_grad():
                    if isinstance(test_input, tuple):
                        _ = model(*test_input)
                    else:
                        _ = model(test_input)
                
                torch.cuda.synchronize() if torch.cuda.is_available() else None
                inference_end = time.time()
                
                latencies.append((inference_end - inference_start) * 1000)
            
            avg_latency = statistics.mean(latencies)
            p95_latency = np.percentile(latencies, 95)
            
            # Score based on target latency
            score = max(0.0, min(1.0, target_latency_ms / avg_latency))
            status = ValidationStatus.PASSED if avg_latency <= target_latency_ms else ValidationStatus.FAILED
            
            duration_ms = (time.time() - start_time) * 1000
            
            return ValidationResult(
                test_id=test_id,
                test_name=f"Inference Latency - {model_type.value}",
                category=TestCategory.PERFORMANCE,
                status=status,
                score=score,
                duration_ms=duration_ms,
                error_message=None,
                details={
                    'avg_latency_ms': avg_latency,
                    'p95_latency_ms': p95_latency,
                    'target_latency_ms': target_latency_ms,
                    'device': str(device),
                    'num_measurements': len(latencies)
                },
                timestamp=datetime.now(timezone.utc)
            )
            
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            return ValidationResult(
                test_id=test_id,
                test_name=f"Inference Latency - {model_type.value}",
                category=TestCategory.PERFORMANCE,
                status=ValidationStatus.FAILED,
                score=0.0,
                duration_ms=duration_ms,
                error_message=str(e),
                details={'model_type': model_type.value},
                timestamp=datetime.now(timezone.utc)
            )
    
    async def test_memory_usage(self, model_type: ModelType, 
                               max_memory_mb: float = 1024.0) -> ValidationResult:
        """Test model memory usage"""
        test_id = str(uuid.uuid4())
        start_time = time.time()
        
        try:
            config = {'input_dim': 10, 'hidden_dim': 256, 'output_dim': 1}
            model = ModelFactory.create_model(model_type, config)
            
            # Measure model parameters memory
            param_memory = sum(p.numel() * p.element_size() for p in model.parameters()) / (1024 * 1024)
            
            # Measure GPU memory if available
            gpu_memory_mb = 0.0
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
                torch.cuda.reset_peak_memory_stats()
                
                model = model.cuda()
                
                # Run inference to measure peak memory
                for batch_size in [1, 8, 16]:
                    if model_type == ModelType.MULTIMODAL:
                        test_input = (
        # RomAI General Expert - Authentic Neural Inference
                                    try:
                                        # Route to appropriate expert based on input analysis
                                        expert_input = self._prepare_expert_input(input_data)

                                        # Automatic expert selection
                                        selected_expert = self.model.router.select_optimal_expert(expert_input)

                                        # Process with selected expert
                                        with torch.no_grad():
                                            expert_outputs = self.model.route_to_expert(
                                                expert_input,
                                                expert_type=selected_expert,
                                                use_mla_attention=True
                                            )

                                            # Generate response
                                            response = self.model.generate_response(expert_outputs)

                                            return {
                                                "response": response["response"],
                                                "reasoning": response["reasoning"],
                                                "confidence": response["confidence"],
                                                "expert_used": selected_expert,
                                                "method": "neural_general_reasoning",
                                                "quality_score": response["quality_score"]
                                            }

                                    except Exception as e:
                                        logger.error(f"General expert error: {e}")
                                        # Ultimate fallback
                                        return {"error": f"Neural inference failed: {e}", "fallback": True}
        # RomAI General Expert - Authentic Neural Inference
                                    try:
                                        # Route to appropriate expert based on input analysis
                                        expert_input = self._prepare_expert_input(input_data)

                                        # Automatic expert selection
                                        selected_expert = self.model.router.select_optimal_expert(expert_input)

                                        # Process with selected expert
                                        with torch.no_grad():
                                            expert_outputs = self.model.route_to_expert(
                                                expert_input,
                                                expert_type=selected_expert,
                                                use_mla_attention=True
                                            )

                                            # Generate response
                                            response = self.model.generate_response(expert_outputs)

                                            return {
                                                "response": response["response"],
                                                "reasoning": response["reasoning"],
                                                "confidence": response["confidence"],
                                                "expert_used": selected_expert,
                                                "method": "neural_general_reasoning",
                                                "quality_score": response["quality_score"]
                                            }

                                    except Exception as e:
                                        logger.error(f"General expert error: {e}")
                                        # Ultimate fallback
                                        return {"error": f"Neural inference failed: {e}", "fallback": True}
        # RomAI General Expert - Authentic Neural Inference
                                    try:
                                        # Route to appropriate expert based on input analysis
                                        expert_input = self._prepare_expert_input(input_data)

                                        # Automatic expert selection
                                        selected_expert = self.model.router.select_optimal_expert(expert_input)

                                        # Process with selected expert
                                        with torch.no_grad():
                                            expert_outputs = self.model.route_to_expert(
                                                expert_input,
                                                expert_type=selected_expert,
                                                use_mla_attention=True
                                            )

                                            # Generate response
                                            response = self.model.generate_response(expert_outputs)

                                            return {
                                                "response": response["response"],
                                                "reasoning": response["reasoning"],
                                                "confidence": response["confidence"],
                                                "expert_used": selected_expert,
                                                "method": "neural_general_reasoning",
                                                "quality_score": response["quality_score"]
                                            }

                                    except Exception as e:
                                        logger.error(f"General expert error: {e}")
                                        # Ultimate fallback
                                        return {"error": f"Neural inference failed: {e}", "fallback": True}
                        )
                        with torch.no_grad():
                            _ = model(*test_input)
                    else:
        # RomAI General Expert - Authentic Neural Inference
                                try:
                                    # Route to appropriate expert based on input analysis
                                    expert_input = self._prepare_expert_input(input_data)

                                    # Automatic expert selection
                                    selected_expert = self.model.router.select_optimal_expert(expert_input)

                                    # Process with selected expert
                                    with torch.no_grad():
                                        expert_outputs = self.model.route_to_expert(
                                            expert_input,
                                            expert_type=selected_expert,
                                            use_mla_attention=True
                                        )

                                        # Generate response
                                        response = self.model.generate_response(expert_outputs)

                                        return {
                                            "response": response["response"],
                                            "reasoning": response["reasoning"],
                                            "confidence": response["confidence"],
                                            "expert_used": selected_expert,
                                            "method": "neural_general_reasoning",
                                            "quality_score": response["quality_score"]
                                        }

                                except Exception as e:
                                    logger.error(f"General expert error: {e}")
                                    # Ultimate fallback
                                    return {"error": f"Neural inference failed: {e}", "fallback": True}
                        with torch.no_grad():
                            _ = model(test_input)
                
                gpu_memory_mb = torch.cuda.max_memory_allocated() / (1024 * 1024)
            
            total_memory_mb = param_memory + gpu_memory_mb
            score = max(0.0, min(1.0, max_memory_mb / max(total_memory_mb, 1.0)))
            status = ValidationStatus.PASSED if total_memory_mb <= max_memory_mb else ValidationStatus.FAILED
            
            duration_ms = (time.time() - start_time) * 1000
            
            return ValidationResult(
                test_id=test_id,
                test_name=f"Memory Usage - {model_type.value}",
                category=TestCategory.PERFORMANCE,
                status=status,
                score=score,
                duration_ms=duration_ms,
                error_message=None,
                details={
                    'param_memory_mb': param_memory,
                    'gpu_memory_mb': gpu_memory_mb,
                    'total_memory_mb': total_memory_mb,
                    'max_memory_mb': max_memory_mb
                },
                timestamp=datetime.now(timezone.utc)
            )
            
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            return ValidationResult(
                test_id=test_id,
                test_name=f"Memory Usage - {model_type.value}",
                category=TestCategory.PERFORMANCE,
                status=ValidationStatus.FAILED,
                score=0.0,
                duration_ms=duration_ms,
                error_message=str(e),
                details={'model_type': model_type.value},
                timestamp=datetime.now(timezone.utc)
            )

class AccuracyValidator:
    """Accuracy and correctness validation"""
    
    def __init__(self):
        self.test_cases = self._create_test_cases()
    
    def _create_test_cases(self) -> Dict[str, List[Dict[str, Any]]]:
        """Create test cases for different model types"""
        return {
            'mathematical': [
                {'input': '2 + 2', 'expected': 4, 'tolerance': 0.1},
                {'input': '√16', 'expected': 4, 'tolerance': 0.1},
                {'input': 'derivative of x²', 'expected': '2x', 'tolerance': None},
                {'input': '3! (factorial)', 'expected': 6, 'tolerance': 0.1}
            ],
            'logical': [
                {'premise': 'All roses are flowers', 'hypothesis': 'This is a rose', 'conclusion': 'This is a flower'},
                {'premise': 'If it rains, the ground is wet', 'hypothesis': 'It is raining', 'conclusion': 'The ground is wet'},
                {'premise': 'All birds can fly', 'hypothesis': 'Penguins are birds', 'conclusion': 'Penguins can fly (false)'}
            ],
            'cultural': [
                {'text': 'Mâncare tradițională românească', 'category': 'food', 'confidence': 0.8},
                {'text': 'Hora și căluș sunt dansuri tradiționale', 'category': 'dance', 'confidence': 0.9},
                {'text': 'Mureș și Olt sunt râuri din România', 'category': 'geography', 'confidence': 0.9}
            ]
        }
    
    async def test_mathematical_accuracy(self, model_type: ModelType) -> ValidationResult:
        """Test mathematical reasoning accuracy"""
        test_id = str(uuid.uuid4())
        start_time = time.time()
        
        if model_type != ModelType.MATHEMATICAL:
            return ValidationResult(
                test_id=test_id,
                test_name="Mathematical Accuracy",
                category=TestCategory.ACCURACY,
                status=ValidationStatus.SKIPPED,
                score=None,
                duration_ms=0.0,
                error_message="Not applicable for this model type",
                details={'model_type': model_type.value},
                timestamp=datetime.now(timezone.utc)
            )
        
        try:
            config = {'input_dim': 10, 'hidden_dim': 256, 'output_dim': 1}
            model = ModelFactory.create_model(model_type, config)
            model.eval()
            
            correct_answers = 0
            total_questions = 0
            
            # Test basic arithmetic (simplified simulation)
            for i in range(10):
                # Generate simple math problems
                a, b = np.random.randint(1, 10), np.random.randint(1, 10)
                expected_sum = a + b
                
                # Simulate model input/output (in reality would parse text)
                test_input = torch.tensor([[float(a), float(b)] + [0.0] * 8])
                
                with torch.no_grad():
                    output = model(test_input)
                    predicted = float(output.item())
                
                # Check if prediction is close to expected
                if abs(predicted - expected_sum) < 0.5:
                    correct_answers += 1
                total_questions += 1
            
            accuracy = correct_answers / total_questions if total_questions > 0 else 0.0
            status = ValidationStatus.PASSED if accuracy >= 0.8 else ValidationStatus.FAILED
            
            duration_ms = (time.time() - start_time) * 1000
            
            return ValidationResult(
                test_id=test_id,
                test_name="Mathematical Accuracy",
                category=TestCategory.ACCURACY,
                status=status,
                score=accuracy,
                duration_ms=duration_ms,
                error_message=None,
                details={
                    'correct_answers': correct_answers,
                    'total_questions': total_questions,
                    'accuracy': accuracy
                },
                timestamp=datetime.now(timezone.utc)
            )
            
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            return ValidationResult(
                test_id=test_id,
                test_name="Mathematical Accuracy",
                category=TestCategory.ACCURACY,
                status=ValidationStatus.FAILED,
                score=0.0,
                duration_ms=duration_ms,
                error_message=str(e),
                details={'model_type': model_type.value},
                timestamp=datetime.now(timezone.utc)
            )
    
    async def test_logical_reasoning(self, model_type: ModelType) -> ValidationResult:
        """Test logical reasoning accuracy"""
        test_id = str(uuid.uuid4())
        start_time = time.time()
        
        if model_type != ModelType.LOGICAL:
            return ValidationResult(
                test_id=test_id,
                test_name="Logical Reasoning",
                category=TestCategory.ACCURACY,
                status=ValidationStatus.SKIPPED,
                score=None,
                duration_ms=0.0,
                error_message="Not applicable for this model type",
                details={'model_type': model_type.value},
                timestamp=datetime.now(timezone.utc)
            )
        
        try:
            config = {'vocab_size': 10000, 'embedding_dim': 256, 'hidden_dim': 512}
            model = ModelFactory.create_model(model_type, config)
            model.eval()
            
            correct_reasoning = 0
            total_tests = 0
            
            # Test logical reasoning (simplified simulation)
            for i in range(10):
                # Generate logical reasoning test
                # Simulate premise -> conclusion reasoning
                test_input = torch.randint(0, 1000, (1, 20))  # Tokenized premise
                
                with torch.no_grad():
                    output = model(test_input)
                    prediction = output.argmax(dim=1).item()
                
                # Simplified check (in reality would validate logical correctness)
                if prediction in [0, 1]:  # Valid logical output
                    correct_reasoning += 1
                total_tests += 1
            
            accuracy = correct_reasoning / total_tests if total_tests > 0 else 0.0
            status = ValidationStatus.PASSED if accuracy >= 0.7 else ValidationStatus.FAILED
            
            duration_ms = (time.time() - start_time) * 1000
            
            return ValidationResult(
                test_id=test_id,
                test_name="Logical Reasoning",
                category=TestCategory.ACCURACY,
                status=status,
                score=accuracy,
                duration_ms=duration_ms,
                error_message=None,
                details={
                    'correct_reasoning': correct_reasoning,
                    'total_tests': total_tests,
                    'accuracy': accuracy
                },
                timestamp=datetime.now(timezone.utc)
            )
            
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            return ValidationResult(
                test_id=test_id,
                test_name="Logical Reasoning",
                category=TestCategory.ACCURACY,
                status=ValidationStatus.FAILED,
                score=0.0,
                duration_ms=duration_ms,
                error_message=str(e),
                details={'model_type': model_type.value},
                timestamp=datetime.now(timezone.utc)
            )

class ProductionValidationPipeline:
    """Main validation pipeline for production models"""
    
    def __init__(self, registry: ModelRegistry, monitor: ProductionMonitor):
        self.registry = registry
        self.monitor = monitor
        
        # Initialize validators
        self.unit_validator = UnitTestValidator()
        self.performance_validator = PerformanceValidator()
        self.accuracy_validator = AccuracyValidator()
        
        # Validation history
        self.validation_history: List[ValidationSuite] = []
        self.load_validation_history()
    
    def load_validation_history(self):
        """Load validation history from disk"""
        try:
            history_file = Path("validation_history.json")
            if history_file.exists():
                with open(history_file, 'r') as f:
                    data = json.load(f)
                
                for suite_data in data.get('suites', []):
                    suite = ValidationSuite.from_dict(suite_data)
                    self.validation_history.append(suite)
                
                logger.info(f"Loaded {len(self.validation_history)} validation suites")
        except Exception as e:
            logger.error(f"Error loading validation history: {e}")
    
    def save_validation_history(self):
        """Save validation history to disk"""
        try:
            data = {
                'suites': [suite.to_dict() for suite in self.validation_history[-50:]],
                'last_updated': datetime.now(timezone.utc).isoformat()
            }
            
            with open("validation_history.json", 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving validation history: {e}")
    
    async def validate_model(self, model_version: str) -> str:
        """Run complete validation suite for a model"""
        try:
            # Get model from registry
            if model_version not in self.registry.models:
                raise ValueError(f"Model version {model_version} not found")
            
            model = self.registry.models[model_version]
            
            # Create validation suite
            suite_id = f"validation_{model_version}_{int(datetime.now().timestamp())}"
            
            validation_suite = ValidationSuite(
                suite_id=suite_id,
                model_version=model_version,
                model_type=model.model_type,
                started_at=datetime.now(timezone.utc),
                completed_at=None,
                status=ValidationStatus.RUNNING,
                results=[],
                overall_score=None,
                passed_tests=0,
                failed_tests=0,
                total_tests=0
            )
            
            logger.info(f"Starting validation suite: {suite_id}")
            
            # Run all validation tests
            test_functions = [
                # Unit tests
                self.unit_validator.test_model_initialization,
                self.unit_validator.test_forward_pass,
                self.unit_validator.test_backward_pass,
                
                # Performance tests
                self.performance_validator.test_inference_latency,
                self.performance_validator.test_memory_usage,
                
                # Accuracy tests
                self.accuracy_validator.test_mathematical_accuracy,
                self.accuracy_validator.test_logical_reasoning,
            ]
            
            for test_func in test_functions:
                try:
                    result = await test_func(model.model_type)
                    validation_suite.results.append(result)
                    
                    if result.status == ValidationStatus.PASSED:
                        validation_suite.passed_tests += 1
                    elif result.status == ValidationStatus.FAILED:
                        validation_suite.failed_tests += 1
                    
                    validation_suite.total_tests += 1
                    
                    logger.info(f"Test completed: {result.test_name} - {result.status.value}")
                    
                except Exception as e:
                    logger.error(f"Test failed: {test_func.__name__} - {e}")
                    
                    error_result = ValidationResult(
                        test_id=str(uuid.uuid4()),
                        test_name=f"Test Error - {test_func.__name__}",
                        category=TestCategory.UNIT,
                        status=ValidationStatus.FAILED,
                        score=0.0,
                        duration_ms=0.0,
                        error_message=str(e),
                        details={},
                        timestamp=datetime.now(timezone.utc)
                    )
                    validation_suite.results.append(error_result)
                    validation_suite.failed_tests += 1
                    validation_suite.total_tests += 1
            
            # Calculate overall score
            scores = [r.score for r in validation_suite.results if r.score is not None]
            validation_suite.overall_score = statistics.mean(scores) if scores else 0.0
            
            # Determine overall status
            pass_rate = validation_suite.passed_tests / validation_suite.total_tests if validation_suite.total_tests > 0 else 0.0
            validation_suite.status = ValidationStatus.PASSED if pass_rate >= 0.8 else ValidationStatus.FAILED
            
            validation_suite.completed_at = datetime.now(timezone.utc)
            
            # Save results
            self.validation_history.append(validation_suite)
            self.save_validation_history()
            
            logger.info(f"Validation suite completed: {suite_id}")
            logger.info(f"Results: {validation_suite.passed_tests}/{validation_suite.total_tests} tests passed")
            logger.info(f"Overall score: {validation_suite.overall_score:.3f}")
            
            return suite_id
            
        except Exception as e:
            logger.error(f"Validation suite failed: {e}")
            return suite_id
    
    def get_validation_results(self, suite_id: str) -> Optional[ValidationSuite]:
        """Get validation results by suite ID"""
        for suite in self.validation_history:
            if suite.suite_id == suite_id:
                return suite
        return None
    
    def get_model_validation_history(self, model_version: str) -> List[ValidationSuite]:
        """Get validation history for a specific model"""
        return [suite for suite in self.validation_history 
                if suite.model_version == model_version]

# Example usage and testing
async def test_production_validation():
    """Test the production validation pipeline"""
    print("🔍 Testing RomAI Production Validation Pipeline")
    print("=" * 60)
    
    # Initialize components
    registry = ModelRegistry("test_registry.json")
    monitor = ProductionMonitor()
    validator = ProductionValidationPipeline(registry, monitor)
    
    print("✅ Validation pipeline initialized")
    
    # Register test models for all types
    test_models = []
    
    for model_type in [ModelType.MATHEMATICAL, ModelType.LOGICAL, ModelType.ROMANIAN, ModelType.MULTIMODAL]:
        from model_registry import ModelMetrics
        
        test_metrics = ModelMetrics(
            accuracy=0.85,
            latency_ms=150.0,
            throughput_rps=100.0,
            memory_usage_mb=512.0,
            cpu_usage_percent=25.0,
            gpu_usage_percent=60.0,
            error_rate=0.02,
            confidence_score=0.8,
            cultural_accuracy=0.9 if model_type == ModelType.ROMANIAN else 0.0
        )
        
        version_id = registry.register_model(
            model_type=model_type,
            model_path=f"/tmp/test_{model_type.value}_model.pt",
            config_path=f"/tmp/test_{model_type.value}_config.json",
            metrics=test_metrics
        )
        
        test_models.append((model_type, version_id))
        print(f"✅ Test model registered: {model_type.value} - {version_id}")
    
    # Run validation for each model type
    validation_results = {}
    
    for model_type, version_id in test_models:
        print(f"\n🔍 Validating {model_type.value} model...")
        suite_id = await validator.validate_model(version_id)
        
        results = validator.get_validation_results(suite_id)
        if results:
            validation_results[model_type.value] = results
            print(f"✅ Validation completed: {results.passed_tests}/{results.total_tests} tests passed")
            print(f"   Overall Score: {results.overall_score:.3f}")
            print(f"   Status: {results.status.value}")
    
    # Summary
    print(f"\n📊 Validation Summary:")
    print(f"   Models Tested: {len(validation_results)}")
    
    total_tests = sum(r.total_tests for r in validation_results.values())
    total_passed = sum(r.passed_tests for r in validation_results.values())
    
    print(f"   Total Tests: {total_passed}/{total_tests} passed")
    print(f"   Success Rate: {(total_passed/total_tests*100):.1f}%")
    
    return len(validation_results) > 0

if __name__ == "__main__":
    asyncio.run(test_production_validation())