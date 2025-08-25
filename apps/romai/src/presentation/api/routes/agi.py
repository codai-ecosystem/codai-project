#!/usr/bin/env python3
"""
AGI Routes - API endpoints for AGI functionality
Extracted from production_agi_api.py following clean architecture
"""

import logging
from datetime import datetime
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse

from domain.agi.models import AGIRequest, AGIResponse
from application.services.agi_service import AGIApplicationService
from presentation.api.models.agi_models import (
    AbstractReasoningRequest, ConsciousnessRequest, MetaLearningRequest,
    SessionCreateRequest, SessionResponse, SystemStatusResponse,
    HealthCheckResponse
)
from config.container import get_agi_service

logger = logging.getLogger(__name__)

# Create router
agi_router = APIRouter(prefix="/agi", tags=["AGI"])


@agi_router.post("/reasoning", response_model=AGIResponse)
async def process_agi_request(
    request: AGIRequest,
    agi_service: AGIApplicationService = Depends(get_agi_service)
) -> AGIResponse:
    """Process a general AGI reasoning request"""
    try:
        response = await agi_service.process_agi_request(request)
        return response
    except Exception as e:
        logger.error(f"Error in AGI reasoning: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@agi_router.post("/abstract-reasoning")
async def process_abstract_reasoning(
    request: AbstractReasoningRequest,
    agi_service: AGIApplicationService = Depends(get_agi_service)
) -> Dict[str, Any]:
    """Process abstract reasoning tasks (ARC-AGI style)"""
    try:
        result = await agi_service.process_abstract_reasoning(request.task_data)
        
        # Check confidence threshold
        if result["confidence"] < request.confidence_threshold:
            return {
                "success": False,
                "message": f"Confidence {result['confidence']:.2f} below threshold {request.confidence_threshold}",
                "result": result
            }
        
        return {
            "success": True,
            "solution": result["solution"],
            "confidence": result["confidence"],
            "explanation": result["reasoning"] if request.require_explanation else None,
            "processing_time": result["processing_time"]
        }
        
    except Exception as e:
        logger.error(f"Error in abstract reasoning: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@agi_router.post("/consciousness")
async def process_consciousness_interaction(
    request: ConsciousnessRequest,
    agi_service: AGIApplicationService = Depends(get_agi_service)
) -> Dict[str, Any]:
    """Process consciousness-based interaction"""
    try:
        result = await agi_service.process_consciousness_interaction({
            "type": request.interaction_type,
            "input": request.input_data,
            "focus": request.attention_focus
        })
        
        return {
            "success": True,
            "consciousness_response": result["consciousness_response"],
            "awareness_level": result["awareness_level"],
            "insights": result["insights"],
            "processing_time": result["processing_time"]
        }
        
    except Exception as e:
        logger.error(f"Error in consciousness interaction: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@agi_router.post("/meta-learning")
async def process_meta_learning(
    request: MetaLearningRequest,
    agi_service: AGIApplicationService = Depends(get_agi_service)
) -> Dict[str, Any]:
    """Process meta-learning request"""
    try:
        result = await agi_service.process_meta_learning(
            request.task_description,
            request.domain
        )
        
        return {
            "success": True,
            "learning_insights": result["learning_insights"],
            "optimization_suggestions": result["optimization_suggestions"],
            "confidence": result["confidence"],
            "processing_time": result["processing_time"]
        }
        
    except Exception as e:
        logger.error(f"Error in meta-learning: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@agi_router.post("/sessions", response_model=SessionResponse)
async def create_session(
    request: SessionCreateRequest,
    agi_service: AGIApplicationService = Depends(get_agi_service)
) -> SessionResponse:
    """Create a new AGI session"""
    try:
        session_id = agi_service.create_session(request.user_id)
        
        return SessionResponse(
            session_id=session_id,
            status="created",
            message="AGI session created successfully",
            timestamp=datetime.now()
        )
        
    except Exception as e:
        logger.error(f"Error creating session: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@agi_router.get("/sessions/{session_id}")
async def get_session(
    session_id: str,
    agi_service: AGIApplicationService = Depends(get_agi_service)
) -> Dict[str, Any]:
    """Get session information"""
    session = agi_service.get_session(session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "session_id": session_id,
        "user_id": session["user_id"],
        "start_time": session["start_time"],
        "requests_count": session["requests_count"],
        "capabilities_used": session["capabilities_used"]
    }


@agi_router.delete("/sessions/{session_id}")
async def close_session(
    session_id: str,
    agi_service: AGIApplicationService = Depends(get_agi_service)
) -> SessionResponse:
    """Close an AGI session"""
    success = agi_service.close_session(session_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return SessionResponse(
        session_id=session_id,
        status="closed",
        message="AGI session closed successfully",
        timestamp=datetime.now()
    )


@agi_router.get("/status", response_model=SystemStatusResponse)
async def get_system_status(
    agi_service: AGIApplicationService = Depends(get_agi_service)
) -> SystemStatusResponse:
    """Get overall system status"""
    try:
        status = await agi_service.get_system_status()
        
        return SystemStatusResponse(
            status=status["status"],
            active_sessions=status["active_sessions"],
            capabilities_available=status["capabilities_available"],
            engines_loaded=status["engines_loaded"],
            timestamp=status["timestamp"]
        )
        
    except Exception as e:
        logger.error(f"Error getting system status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@agi_router.get("/health", response_model=HealthCheckResponse)
async def health_check() -> HealthCheckResponse:
    """AGI service health check"""
    return HealthCheckResponse(
        status="healthy",
        services={
            "agi_orchestrator": "operational",
            "reasoning_engines": "loaded", 
            "application_service": "active"
        }
    )