"""
🚀 RomAI Meta-Learning API Integration - Week 7 Day 1
Advanced Meta-Learning and Few-Shot API Endpoints

This module integrates the meta-learning and few-shot learning engines
with the RomAI API, providing advanced AI capabilities for Romanian
language and cultural tasks.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
import asyncio
import json
import uuid

# Import our meta-learning and few-shot engines
try:
    from ..ml.meta_learning.romanian_meta_learner import RomAIMetaLearner, RomanianTask
    from ..ml.few_shot.romanian_few_shot_engine import (
        FewShotLearningEngine, 
        FewShotTask, 
        FewShotExample
    )
    ENGINES_AVAILABLE = True
except ImportError:
    print("Warning: ML engines not available. Running in API-only mode.")
    ENGINES_AVAILABLE = False

# Create router for meta-learning endpoints
meta_learning_router = APIRouter(prefix="/api/meta-learning", tags=["meta-learning"])

# Initialize engines (global instances)
if ENGINES_AVAILABLE:
    meta_learner = RomAIMetaLearner()
    few_shot_engine = FewShotLearningEngine()
else:
    meta_learner = None
    few_shot_engine = None


# Pydantic models for API requests/responses
class MetaLearningRequest(BaseModel):
    task_id: str = Field(..., description="Unique identifier for the task")
    task_type: str = Field(..., description="Type of Romanian task")
    support_examples: List[Dict[str, str]] = Field(..., description="Support examples for learning")
    query_examples: List[Dict[str, str]] = Field(..., description="Query examples for evaluation")
    cultural_context: Dict[str, Any] = Field(default_factory=dict, description="Cultural context")
    region: Optional[str] = Field(None, description="Romanian region")


class FewShotRequest(BaseModel):
    examples: List[Dict[str, str]] = Field(..., description="Few-shot examples")
    task_type: str = Field(..., description="Type of task")
    cultural_context: Dict[str, Any] = Field(default_factory=dict, description="Cultural context")
    target_inputs: List[str] = Field(..., description="Inputs to process")
    max_examples: int = Field(5, description="Maximum examples to use")


class AdaptiveFewShotRequest(BaseModel):
    initial_examples: List[Dict[str, str]] = Field(..., description="Initial examples")
    target_input: str = Field(..., description="Target input to process")
    task_type: str = Field(..., description="Type of task")
    cultural_context: Dict[str, Any] = Field(default_factory=dict, description="Cultural context")


class MetaLearningResponse(BaseModel):
    success: bool
    task_id: str
    meta_learning_results: Optional[Dict[str, Any]] = None
    adaptation_time: Optional[float] = None
    cultural_accuracy: Optional[float] = None
    error: Optional[str] = None
    timestamp: str


class FewShotResponse(BaseModel):
    success: bool
    task_name: str
    outputs: List[str]
    confidences: List[float]
    average_confidence: float
    examples_used: int
    cultural_adaptation: bool
    romanian_features_detected: bool
    error: Optional[str] = None


# API Endpoints

@meta_learning_router.get("/status")
async def get_meta_learning_status():
    """Get the status of meta-learning capabilities."""
    if not ENGINES_AVAILABLE:
        return {
            "status": "unavailable",
            "message": "Meta-learning engines not loaded",
            "engines_available": False,
            "timestamp": datetime.now().isoformat()
        }
    
    meta_capabilities = meta_learner.get_capabilities() if meta_learner else {}
    few_shot_capabilities = few_shot_engine.get_few_shot_capabilities() if few_shot_engine else {}
    
    return {
        "status": "active",
        "engines_available": True,
        "meta_learning": {
            "active": True,
            "supported_tasks": len(meta_capabilities.get('supported_tasks', {})),
            "total_tasks_completed": meta_capabilities.get('performance_metrics', {}).get('total_tasks', 0),
            "model_parameters": meta_capabilities.get('model_parameters', 0)
        },
        "few_shot_learning": {
            "active": True,
            "supported_task_types": len(few_shot_capabilities.get('supported_task_types', [])),
            "total_adaptations": few_shot_capabilities.get('performance_metrics', {}).get('total_adaptations', 0),
            "success_rate": (
                few_shot_capabilities.get('performance_metrics', {}).get('successful_adaptations', 0) /
                max(few_shot_capabilities.get('performance_metrics', {}).get('total_adaptations', 1), 1)
            )
        },
        "romanian_specialization": True,
        "cultural_intelligence": True,
        "timestamp": datetime.now().isoformat()
    }


@meta_learning_router.post("/meta-learn", response_model=MetaLearningResponse)
async def perform_meta_learning(request: MetaLearningRequest):
    """Perform meta-learning on a Romanian language task."""
    if not ENGINES_AVAILABLE or not meta_learner:
        raise HTTPException(
            status_code=503, 
            detail="Meta-learning engine not available"
        )
    
    try:
        # Create Romanian task
        romanian_task = RomanianTask(
            task_id=request.task_id,
            task_type=request.task_type,
            support_examples=request.support_examples,
            query_examples=request.query_examples,
            cultural_context=request.cultural_context,
            region=request.region
        )
        
        # Perform meta-learning
        result = await meta_learner.meta_learn_task(romanian_task)
        
        return MetaLearningResponse(
            success=result.get('success', False),
            task_id=result.get('task_id', request.task_id),
            meta_learning_results=result.get('meta_learning_results'),
            adaptation_time=result.get('adaptation_time'),
            cultural_accuracy=result.get('cultural_accuracy'),
            error=result.get('error'),
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        return MetaLearningResponse(
            success=False,
            task_id=request.task_id,
            error=str(e),
            timestamp=datetime.now().isoformat()
        )


@meta_learning_router.post("/few-shot-adapt")
async def few_shot_adaptation(request: AdaptiveFewShotRequest):
    """Perform adaptive few-shot learning for Romanian tasks."""
    if not ENGINES_AVAILABLE or not few_shot_engine:
        raise HTTPException(
            status_code=503, 
            detail="Few-shot learning engine not available"
        )
    
    try:
        # Convert request to FewShotExample objects
        examples = [
            FewShotExample(
                input_text=ex['input'],
                output_text=ex['output'],
                cultural_tags=ex.get('cultural_tags', []),
                region=request.cultural_context.get('region'),
                formality_level=request.cultural_context.get('formality', 'neutral')
            )
            for ex in request.initial_examples
        ]
        
        # Perform adaptive few-shot learning
        result = await few_shot_engine.adaptive_few_shot(
            initial_examples=examples,
            target_input=request.target_input,
            task_type=request.task_type,
            cultural_context=request.cultural_context
        )
        
        return {
            "success": result.get('success', False),
            "output": result.get('outputs', [None])[0] if result.get('outputs') else None,
            "confidence": result.get('confidences', [0.0])[0] if result.get('confidences') else 0.0,
            "adaptive_insights": result.get('adaptive_insights', {}),
            "romanian_cultural_adaptation": result.get('romanian_cultural_adaptation', False),
            "adaptation_record": result.get('adaptation_record', {}),
            "error": result.get('error'),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }


@meta_learning_router.post("/few-shot-learn", response_model=FewShotResponse)
async def few_shot_learning(request: FewShotRequest):
    """Perform few-shot learning with multiple target inputs."""
    if not ENGINES_AVAILABLE or not few_shot_engine:
        raise HTTPException(
            status_code=503, 
            detail="Few-shot learning engine not available"
        )
    
    try:
        # Convert request to FewShotExample objects
        examples = [
            FewShotExample(
                input_text=ex['input'],
                output_text=ex['output'],
                cultural_tags=ex.get('cultural_tags', []),
                region=request.cultural_context.get('region'),
                formality_level=request.cultural_context.get('formality', 'neutral')
            )
            for ex in request.examples
        ]
        
        # Create few-shot task
        task = FewShotTask(
            task_name=f"api_task_{uuid.uuid4().hex[:8]}",
            task_type=request.task_type,
            examples=examples,
            max_examples=request.max_examples,
            cultural_context=request.cultural_context
        )
        
        # Perform few-shot learning
        result = await few_shot_engine.few_shot_learn(
            task=task,
            target_inputs=request.target_inputs
        )
        
        return FewShotResponse(
            success=result.get('success', False),
            task_name=result.get('task_name', task.task_name),
            outputs=result.get('outputs', []),
            confidences=result.get('confidences', []),
            average_confidence=result.get('average_confidence', 0.0),
            examples_used=result.get('examples_used', 0),
            cultural_adaptation=result.get('cultural_adaptation', False),
            romanian_features_detected=result.get('romanian_features_detected', False),
            error=result.get('error')
        )
        
    except Exception as e:
        return FewShotResponse(
            success=False,
            task_name="error",
            outputs=[],
            confidences=[],
            average_confidence=0.0,
            examples_used=0,
            cultural_adaptation=False,
            romanian_features_detected=False,
            error=str(e)
        )


@meta_learning_router.get("/capabilities")
async def get_meta_learning_capabilities():
    """Get detailed meta-learning and few-shot learning capabilities."""
    if not ENGINES_AVAILABLE:
        return {
            "available": False,
            "message": "Meta-learning engines not loaded",
            "timestamp": datetime.now().isoformat()
        }
    
    meta_capabilities = meta_learner.get_capabilities() if meta_learner else {}
    few_shot_capabilities = few_shot_engine.get_few_shot_capabilities() if few_shot_engine else {}
    
    return {
        "available": True,
        "meta_learning": meta_capabilities,
        "few_shot_learning": few_shot_capabilities,
        "integration_features": {
            "api_endpoints": 5,
            "romanian_specialization": True,
            "cultural_intelligence": True,
            "adaptive_learning": True,
            "real_time_processing": True,
            "performance_tracking": True
        },
        "supported_romanian_tasks": {
            "dialect_adaptation": "Adapt between Romanian dialects",
            "cultural_context": "Understand Romanian cultural references",
            "formal_informal": "Convert between formal and informal Romanian",
            "business_communication": "Adapt to Romanian business contexts",
            "literary_analysis": "Analyze Romanian literature and poetry",
            "historical_context": "Incorporate Romanian historical knowledge"
        },
        "performance_metrics": {
            "meta_learning": meta_capabilities.get('performance_metrics', {}),
            "few_shot_learning": few_shot_capabilities.get('performance_metrics', {})
        },
        "timestamp": datetime.now().isoformat()
    }


@meta_learning_router.get("/performance")
async def get_performance_metrics():
    """Get current performance metrics for meta-learning and few-shot learning."""
    if not ENGINES_AVAILABLE:
        return {
            "available": False,
            "message": "Performance metrics not available - engines not loaded",
            "timestamp": datetime.now().isoformat()
        }
    
    meta_capabilities = meta_learner.get_capabilities() if meta_learner else {}
    few_shot_capabilities = few_shot_engine.get_few_shot_capabilities() if few_shot_engine else {}
    
    meta_metrics = meta_capabilities.get('performance_metrics', {})
    few_shot_metrics = few_shot_capabilities.get('performance_metrics', {})
    
    return {
        "available": True,
        "meta_learning_performance": {
            "total_tasks": meta_metrics.get('total_tasks', 0),
            "successful_adaptations": meta_metrics.get('successful_adaptations', 0),
            "success_rate": (
                meta_metrics.get('successful_adaptations', 0) / 
                max(meta_metrics.get('total_tasks', 1), 1)
            ),
            "average_adaptation_time": meta_metrics.get('average_adaptation_time', 0.0),
            "cultural_accuracy": meta_metrics.get('cultural_accuracy', 0.0)
        },
        "few_shot_performance": {
            "total_adaptations": few_shot_metrics.get('total_adaptations', 0),
            "successful_adaptations": few_shot_metrics.get('successful_adaptations', 0),
            "success_rate": (
                few_shot_metrics.get('successful_adaptations', 0) / 
                max(few_shot_metrics.get('total_adaptations', 1), 1)
            ),
            "average_examples_needed": few_shot_metrics.get('average_examples_needed', 0.0),
            "cultural_accuracy": few_shot_metrics.get('cultural_accuracy', 0.0),
            "linguistic_accuracy": few_shot_metrics.get('linguistic_accuracy', 0.0)
        },
        "overall_metrics": {
            "engines_active": True,
            "romanian_specialization_active": True,
            "cultural_intelligence_active": True,
            "adaptive_learning_active": True
        },
        "timestamp": datetime.now().isoformat()
    }


# Additional utility endpoints

@meta_learning_router.post("/reset-performance")
async def reset_performance_metrics():
    """Reset performance metrics (for development/testing)."""
    if not ENGINES_AVAILABLE:
        return {
            "success": False,
            "message": "Engines not available",
            "timestamp": datetime.now().isoformat()
        }
    
    try:
        # Reset meta-learning metrics
        if meta_learner:
            meta_learner.performance_metrics = {
                'total_tasks': 0,
                'successful_adaptations': 0,
                'average_adaptation_time': 0.0,
                'cultural_accuracy': 0.0
            }
            meta_learner.task_history = []
        
        # Reset few-shot learning metrics
        if few_shot_engine:
            few_shot_engine.performance_tracker = {
                'total_adaptations': 0,
                'successful_adaptations': 0,
                'average_examples_needed': 0.0,
                'cultural_accuracy': 0.0,
                'linguistic_accuracy': 0.0
            }
            few_shot_engine.adaptation_history = []
        
        return {
            "success": True,
            "message": "Performance metrics reset successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"Failed to reset metrics: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }


# Export the router for use in main application
__all__ = ['meta_learning_router']
